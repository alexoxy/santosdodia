#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'config/saints-baseline-v1.json'), 'utf8'));
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, 'data/source-registry/seed.json'), 'utf8'));
const baselineSources = JSON.parse(fs.readFileSync(path.join(root, 'data/source-registry/saints-baseline-v1-additions.json'), 'utf8'));
const policyRegistry = JSON.parse(fs.readFileSync(path.join(root, 'data/osint/policies/p0-policy-registry.json'), 'utf8'));
const errors = [];
const warnings = [];

if (baselineSources.publicationAllowed !== false) errors.push('Baseline-specific source candidates must remain non-publishable until policy review.');
const allSources = [...(sourceRegistry.sources ?? []), ...(baselineSources.sources ?? [])];
const sourceIds = new Set(allSources.map((source) => source.id));
const sourceById = new Map(allSources.map((source) => [source.id, source]));
const policies = new Map((policyRegistry.sources ?? []).map((source) => [source.id, source]));

if (baseline.schemaVersion !== 1 || baseline.baselineId !== 'saints-v1' || baseline.domain !== 'saints') {
  errors.push('Baseline identity/schema is invalid.');
}
if (baseline.strategy !== 'build-once-freeze-then-incremental-events') errors.push('Historical saint corpus must use build-once freeze semantics.');
for (const principle of ['personAndObservanceAreSeparate','namesAreNotIdentity','maryIsOnePerson','historicalBaselineIsImmutableAfterFreeze','postFreezeChangesAreEventsOrVersionedCorrections','localizedDisplayRequiresValidatedLocalizedName']) {
  if (baseline.principles?.[principle] !== true) errors.push(`Required baseline principle is disabled: ${principle}.`);
}

const candidateLayer = baseline.layers?.candidateUniverse;
if (candidateLayer?.mayCreateCanonicalPerson !== false || candidateLayer?.mayPublish !== false) errors.push('Candidate universe must never create or publish a canonical person by itself.');
const confirmationLayer = baseline.layers?.churchConfirmation;
if (confirmationLayer?.allowSingleAuthoritativeSource !== true || !confirmationLayer?.authoritativeClasses?.includes('A1') || !confirmationLayer?.authoritativeClasses?.includes('A2')) {
  errors.push('Church confirmation authority gate is incomplete.');
}
const localizedLayer = baseline.layers?.localizedDisplay;
const expectedLocales = ['en','es','pt','fr','fil','ru','sw','de','it','pl'];
if (JSON.stringify(localizedLayer?.locales) !== JSON.stringify(expectedLocales)) errors.push('Baseline locale set must match the supported site locales in stable order.');
if (localizedLayer?.missingNameAction !== 'withhold-in-that-locale') errors.push('Missing validated localized names must be withheld per locale.');

const partitionIds = new Set();
for (const partition of baseline.traditionPartitions ?? []) {
  if (!partition.id || partitionIds.has(partition.id)) errors.push(`Duplicate/invalid tradition partition: ${partition.id ?? '<missing>'}.`);
  partitionIds.add(partition.id);
  for (const field of ['candidateSources','confirmationSources','incrementalWatch']) {
    for (const sourceId of partition[field] ?? []) {
      if (!sourceIds.has(sourceId)) errors.push(`${partition.id}.${field} references unknown source ${sourceId}.`);
      const source = sourceById.get(sourceId);
      if (field !== 'candidateSources' && source && !['A1','A2'].includes(source.authorityClass) && !policies.has(sourceId)) {
        warnings.push(`${partition.id}.${field} source ${sourceId} is not A1/A2 and has no explicit acquisition policy.`);
      }
      if (!policies.has(sourceId) && (baselineSources.sources ?? []).some((item) => item.id === sourceId)) {
        warnings.push(`${sourceId} is mapped for baseline discovery but remains blocked for automated acquisition pending policy review.`);
      }
    }
  }
  if ((partition.confirmationSources ?? []).length === 0 && !String(partition.processStatus ?? '').includes('required')) {
    errors.push(`${partition.id} has no confirmation source and no explicit source-registry gap.`);
  }
  if (partition.doNotUseRecognitionTerm === 'canonization' && partition.id !== 'anglican') warnings.push(`${partition.id} unexpectedly forbids canonization terminology.`);
}
for (const required of ['roman-catholic','eastern-orthodox','coptic-orthodox','armenian-apostolic','ethiopian-orthodox','syriac-orthodox','anglican']) {
  if (!partitionIds.has(required)) errors.push(`Missing baseline tradition partition ${required}.`);
}

if (!sourceIds.has('wikidata') || policies.get('wikidata')?.decision !== 'approved' || policies.get('wikidata')?.acquisitionMode !== 'sparql-api') {
  errors.push('Wikidata candidate acquisition must remain explicitly approved through the SPARQL API.');
}
if (Number(policies.get('wikidata')?.rateLimitPerMinute) < 5) errors.push('Wikidata policy rate limit is below the baseline acquisition cadence assumption.');

for (const gate of ['stableEntityId','completeProvenance','churchConfirmationRequired','recognitionTypeRequired','baselineManifestRequired','rootSha256Required','dropboxSnapshotRequired','d1StagingReconciliationRequired']) {
  if (baseline.freezeGates?.[gate] !== true) errors.push(`Freeze gate ${gate} must be enabled.`);
}
if (baseline.freezeGates?.identityConflictCount !== 0 || baseline.freezeGates?.highSeverityClaimConflicts !== 0) errors.push('Baseline freeze must require zero unresolved identity/high-severity conflicts.');
if (baseline.postFreeze?.fullRebuildCadence !== 'never-routine' || baseline.postFreeze?.annualReconciliation !== true) errors.push('Post-freeze baseline lifecycle is not incremental-first.');

const workflow = fs.readFileSync(path.join(root, '.github/workflows/build-saints-baseline-wikidata.yml'), 'utf8');
if (!workflow.includes("OSINT_WIKIDATA_PAGE_SIZE: '500'")) errors.push('Baseline workflow must retain 500-binding page shards.');
if (!workflow.includes("OSINT_WIKIDATA_DELAY_MS: '12000'")) errors.push('Baseline workflow must retain a 12s minimum Wikidata inter-page delay.');
if (!workflow.includes('baseline-progress/saints/v1/wikidata')) errors.push('Baseline workflow is missing its verified Dropbox watermark stream.');

const report = {
  ok: errors.length === 0,
  errors,
  warnings: [...new Set(warnings)].sort(),
  partitions: [...partitionIds],
  sourceCount: sourceIds.size,
  baselineCandidateSourceCount: baselineSources.sources?.length ?? 0,
  generatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

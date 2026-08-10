#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonLines(file) { return fs.readFileSync(file, 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)); }
function chunkId(offset) { return `chunk-${String(offset).padStart(6, '0')}`; }

export function planWikidataLabelEnrichment({ config, identityManifest, identityReport, identityLedger, previousProgress = null } = {}) {
  if (!config || config.schemaVersion !== 1 || config.baselineId !== 'saints-v1' || config.sourceId !== 'wikidata') throw new Error('Wikidata labels config has the wrong identity/schema.');
  if (identityManifest?.stage !== 'global-candidate-identity-ledger' || identityManifest?.mode !== 'staging' || identityManifest?.publish !== false) throw new Error('Label enrichment requires the global staging identity ledger.');
  if (identityManifest.rootSha256 !== config.identityRootSha256 || identityReport?.rootSha256 !== config.identityRootSha256) throw new Error('Identity root differs from the pinned multilingual-label corpus.');
  if (identityReport.freezeIdentityGateEligible !== true || identityReport.identityConflictCount !== 0) throw new Error('Label enrichment requires a conflict-free identity gate.');
  if (!Array.isArray(identityLedger) || identityLedger.length !== identityReport.uniqueIdentityCount) throw new Error('Identity ledger count differs from the identity report.');
  if (!Number.isSafeInteger(config.entityLimitPerRun) || config.entityLimitPerRun < 1) throw new Error('entityLimitPerRun must be a positive integer.');
  if (!Number.isSafeInteger(config.apiBatchSize) || config.apiBatchSize < 1 || config.apiBatchSize > 50) throw new Error('apiBatchSize must be between 1 and 50.');
  if (config.entityLimitPerRun % config.apiBatchSize !== 0) throw new Error('entityLimitPerRun must be divisible by apiBatchSize.');
  if (!Array.isArray(config.locales) || config.locales.length === 0) throw new Error('No multilingual label locales are configured.');

  for (const identity of identityLedger) {
    if (!identity?.qid || identity.entityId !== `wikidata:${identity.qid}`) throw new Error('Identity ledger contains a non-Wikidata stable identity.');
  }

  let startOffset = 0;
  let successfulRuns = 0;
  let cumulativeEntitiesRequested = 0;
  if (previousProgress) {
    if (previousProgress.schemaVersion !== 1 || previousProgress.baselineId !== 'saints-v1' || previousProgress.sourceId !== 'wikidata') throw new Error('Previous labels progress has the wrong identity/schema.');
    if (previousProgress.acquisitionVersion !== config.acquisitionVersion || previousProgress.identityRootSha256 !== config.identityRootSha256) throw new Error('Previous labels progress belongs to another corpus/version.');
    if (!Number.isSafeInteger(previousProgress.nextEntityOffset) || previousProgress.nextEntityOffset < 0 || previousProgress.nextEntityOffset > identityLedger.length) throw new Error('Previous labels progress has an invalid cursor.');
    startOffset = previousProgress.nextEntityOffset;
    successfulRuns = Number(previousProgress.successfulRuns ?? 0);
    cumulativeEntitiesRequested = Number(previousProgress.cumulativeEntitiesRequested ?? 0);
  }

  const completed = startOffset >= identityLedger.length;
  const entityCount = completed ? 0 : Math.min(config.entityLimitPerRun, identityLedger.length - startOffset);
  const selected = identityLedger.slice(startOffset, startOffset + entityCount).map((identity) => identity.qid);
  const nextEntityOffset = startOffset + entityCount;
  const rawStream = `${config.rawStreamPrefix}/${chunkId(startOffset)}`;
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    acquisitionVersion: config.acquisitionVersion,
    adapterVersion: config.adapterVersion,
    identityRootSha256: config.identityRootSha256,
    identityCount: identityLedger.length,
    startEntityOffset: startOffset,
    entityCount,
    nextEntityOffset,
    apiBatchSize: config.apiBatchSize,
    expectedRequestCount: entityCount === 0 ? 0 : Math.ceil(entityCount / config.apiBatchSize),
    selectedQids: selected,
    rawStream,
    progressStream: config.progressStream,
    successfulRuns,
    cumulativeEntitiesRequested,
    completed,
    shouldRun: !completed,
    reason: completed ? 'wikidata-label-enrichment-complete' : previousProgress ? 'resume-wikidata-label-enrichment' : 'start-wikidata-label-enrichment',
  };
}

function main() {
  const configPath = argument('--config', 'config/saints-baseline-wikidata-labels.json');
  const manifestPath = argument('--identity-manifest');
  const reportPath = argument('--identity-report');
  const ledgerPath = argument('--identity-ledger');
  const previousPath = argument('--previous-progress');
  const output = argument('--output');
  if (!manifestPath || !reportPath || !ledgerPath || !output) throw new Error('--identity-manifest, --identity-report, --identity-ledger and --output are required.');
  const plan = planWikidataLabelEnrichment({
    config: readJson(configPath),
    identityManifest: readJson(manifestPath),
    identityReport: readJson(reportPath),
    identityLedger: readJsonLines(ledgerPath),
    previousProgress: previousPath && fs.existsSync(previousPath) ? readJson(previousPath) : null,
  });
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(plan, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ ...plan, selectedQids: `[${plan.selectedQids.length} QIDs]` }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Wikidata label enrichment planning failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

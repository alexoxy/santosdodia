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

export function planWikidataProfileRun({ config, identityManifest, identityReport, identityLedger, previousProgress = null } = {}) {
  if (config?.schemaVersion !== 1 || config?.enrichmentId !== 'saints-profile-v1' || config?.sourceId !== 'wikidata') throw new Error('Profile enrichment config has the wrong identity/schema.');
  if (identityManifest?.stage !== 'global-candidate-identity-ledger' || identityManifest?.mode !== 'staging' || identityManifest?.publish !== false) throw new Error('Profile enrichment requires the global staging identity ledger.');
  if (identityReport?.rootSha256 !== identityManifest.rootSha256) throw new Error('Identity manifest/report root mismatch.');
  if (identityReport?.freezeIdentityGateEligible !== true || identityReport?.identityConflictCount !== 0) throw new Error('Profile enrichment requires a conflict-free identity gate.');
  if (!Array.isArray(identityLedger) || identityLedger.length !== identityReport.uniqueIdentityCount) throw new Error('Identity ledger count differs from the identity report.');
  if (!Number.isSafeInteger(config.chunkSize) || config.chunkSize < 1 || config.chunkSize > 40) throw new Error('chunkSize must be an integer from 1 to 40.');
  if (config.maxQueriesPerRun !== 1) throw new Error('Profile enrichment must remain bounded to one SPARQL query per run.');
  if (config.policy?.exactQidInputOnly !== true || config.policy?.nameSearchForbidden !== true || config.policy?.productionPublication !== false || config.policy?.d1ProductionMutation !== false) throw new Error('Profile enrichment safety policy is incomplete.');

  for (const identity of identityLedger) {
    if (!identity?.qid || identity.entityId !== `wikidata:${identity.qid}` || identity.publish !== false) throw new Error('Identity ledger contains an invalid or publication-open identity.');
  }

  let nextEntityOffset = 0;
  let successfulRuns = 0;
  let cumulativeEntitiesRequested = 0;
  if (previousProgress) {
    if (previousProgress.schemaVersion !== 1 || previousProgress.enrichmentId !== config.enrichmentId || previousProgress.sourceId !== config.sourceId) throw new Error('Previous profile progress has the wrong identity/schema.');
    if (previousProgress.identityRootSha256 !== identityManifest.rootSha256) throw new Error('Identity root changed; profile progress cannot be reused.');
    if (!Number.isSafeInteger(previousProgress.nextEntityOffset) || previousProgress.nextEntityOffset < 0 || previousProgress.nextEntityOffset > identityLedger.length) throw new Error('Previous profile progress cursor is invalid.');
    nextEntityOffset = previousProgress.nextEntityOffset;
    successfulRuns = Number(previousProgress.successfulRuns ?? 0);
    cumulativeEntitiesRequested = Number(previousProgress.cumulativeEntitiesRequested ?? 0);
  }

  const completed = nextEntityOffset >= identityLedger.length;
  const entityCount = completed ? 0 : Math.min(config.chunkSize, identityLedger.length - nextEntityOffset);
  const selectedQids = identityLedger.slice(nextEntityOffset, nextEntityOffset + entityCount).map((entry) => entry.qid);
  const startEntityOffset = nextEntityOffset;
  const finalOffset = startEntityOffset + entityCount;
  return {
    schemaVersion: 1,
    enrichmentId: config.enrichmentId,
    sourceId: config.sourceId,
    identityRootSha256: identityManifest.rootSha256,
    identityCount: identityLedger.length,
    startEntityOffset,
    entityCount,
    nextEntityOffset: finalOffset,
    selectedQids,
    expectedQueryCount: entityCount ? 1 : 0,
    rawStream: `${config.rawStream}/${chunkId(startEntityOffset)}`,
    normalizedStream: `${config.normalizedStream}/${chunkId(startEntityOffset)}`,
    progressStream: config.progressStream,
    successfulRuns,
    cumulativeEntitiesRequested,
    completed,
    shouldRun: !completed,
    reason: completed ? 'saints-profile-enrichment-complete' : previousProgress ? 'resume-saints-profile-enrichment' : 'start-saints-profile-enrichment'
  };
}

function main() {
  const configPath = argument('--config', 'config/saints-profile-enrichment-v1.json');
  const manifestPath = argument('--identity-manifest');
  const reportPath = argument('--identity-report');
  const ledgerPath = argument('--identity-ledger');
  const previousPath = argument('--previous-progress');
  const output = argument('--output');
  if (!manifestPath || !reportPath || !ledgerPath || !output) throw new Error('--identity-manifest, --identity-report, --identity-ledger and --output are required.');
  const plan = planWikidataProfileRun({
    config: readJson(configPath),
    identityManifest: readJson(manifestPath),
    identityReport: readJson(reportPath),
    identityLedger: readJsonLines(ledgerPath),
    previousProgress: previousPath && fs.existsSync(previousPath) ? readJson(previousPath) : null
  });
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ ...plan, selectedQids: `[${plan.selectedQids.length} QIDs]` }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Wikidata profile planning failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

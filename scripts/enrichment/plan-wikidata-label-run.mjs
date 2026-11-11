#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonLines(file) { return fs.readFileSync(file, 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)); }
function chunkId(offset) { return `chunk-${String(offset).padStart(6, '0')}`; }

export function planWikidataLabelRun({ config, identityManifest, identityReport, identityLedger, previousProgress = null } = {}) {
  if (config?.schemaVersion !== 1 || config?.enrichmentId !== 'saints-labels-v2' || config?.sourceId !== 'wikidata') throw new Error('Labels v2 config has the wrong identity/schema.');
  if (identityManifest?.stage !== 'global-candidate-identity-ledger' || identityManifest?.mode !== 'staging' || identityManifest?.publish !== false) throw new Error('Labels v2 requires the global staging identity ledger.');
  if (identityManifest.rootSha256 !== identityReport?.rootSha256 || identityReport?.freezeIdentityGateEligible !== true || identityReport?.identityConflictCount !== 0) throw new Error('Labels v2 requires one conflict-free identity root.');
  if (!Array.isArray(identityLedger) || identityLedger.length !== identityReport.uniqueIdentityCount) throw new Error('Labels v2 identity count mismatch.');
  if (!Number.isSafeInteger(config.entityLimitPerRun) || config.entityLimitPerRun < 1 || config.entityLimitPerRun > 1000) throw new Error('entityLimitPerRun must be 1-1000.');
  if (!Number.isSafeInteger(config.apiBatchSize) || config.apiBatchSize < 1 || config.apiBatchSize > 50 || config.entityLimitPerRun % config.apiBatchSize !== 0) throw new Error('apiBatchSize must be 1-50 and divide entityLimitPerRun.');
  if (!Array.isArray(config.locales) || config.locales.length !== 10) throw new Error('Labels v2 must declare all 10 site locales.');
  if (config.policy?.exactQidInputOnly !== true || config.policy?.languageFallbacksForbidden !== true || config.policy?.automaticCanonicalNameSelection !== false || config.policy?.productionPublication !== false) throw new Error('Labels v2 safety policy is incomplete.');
  for (const identity of identityLedger) if (!/^Q[1-9]\d*$/u.test(identity?.qid ?? '') || identity.entityId !== `wikidata:${identity.qid}` || identity.publish !== false) throw new Error('Labels v2 received an unsafe identity record.');

  let start = 0;
  let successfulRuns = 0;
  let cumulativeEntitiesRequested = 0;
  if (previousProgress) {
    if (previousProgress.schemaVersion !== 1 || previousProgress.enrichmentId !== config.enrichmentId || previousProgress.sourceId !== config.sourceId) throw new Error('Previous Labels v2 progress has wrong identity/schema.');
    if (previousProgress.identityRootSha256 !== identityManifest.rootSha256) throw new Error('Identity root changed; Labels v2 progress must restart.');
    if (!Number.isSafeInteger(previousProgress.nextEntityOffset) || previousProgress.nextEntityOffset < 0 || previousProgress.nextEntityOffset > identityLedger.length) throw new Error('Previous Labels v2 cursor is invalid.');
    start = previousProgress.nextEntityOffset;
    successfulRuns = Number(previousProgress.successfulRuns ?? 0);
    cumulativeEntitiesRequested = Number(previousProgress.cumulativeEntitiesRequested ?? 0);
  }
  const completed = start >= identityLedger.length;
  const entityCount = completed ? 0 : Math.min(config.entityLimitPerRun, identityLedger.length - start);
  const selectedQids = identityLedger.slice(start, start + entityCount).map((entry) => entry.qid);
  const nextEntityOffset = start + entityCount;
  return {
    schemaVersion: 1,
    enrichmentId: config.enrichmentId,
    sourceId: config.sourceId,
    identityRootSha256: identityManifest.rootSha256,
    identityCount: identityLedger.length,
    startEntityOffset: start,
    entityCount,
    nextEntityOffset,
    apiBatchSize: config.apiBatchSize,
    expectedRequestCount: entityCount ? Math.ceil(entityCount / config.apiBatchSize) : 0,
    selectedQids,
    rawStream: `${config.rawStream}/${chunkId(start)}`,
    normalizedStream: `${config.normalizedStream}/${chunkId(start)}`,
    progressStream: config.progressStream,
    successfulRuns,
    cumulativeEntitiesRequested,
    completed,
    shouldRun: !completed,
    reason: completed ? 'saints-labels-v2-complete' : previousProgress ? 'resume-saints-labels-v2' : 'start-saints-labels-v2'
  };
}

function main() {
  const manifest = argument('--identity-manifest'); const report = argument('--identity-report'); const ledger = argument('--identity-ledger'); const output = argument('--output');
  if (!manifest || !report || !ledger || !output) throw new Error('--identity-manifest, --identity-report, --identity-ledger and --output are required.');
  const previous = argument('--previous-progress');
  const plan = planWikidataLabelRun({
    config: readJson(argument('--config', 'config/saints-label-enrichment-v2.json')),
    identityManifest: readJson(manifest), identityReport: readJson(report), identityLedger: readJsonLines(ledger),
    previousProgress: previous && fs.existsSync(previous) ? readJson(previous) : null
  });
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ ...plan, selectedQids: `[${plan.selectedQids.length} QIDs]` }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }

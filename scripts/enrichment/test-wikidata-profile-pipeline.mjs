import assert from 'node:assert/strict';
import { planWikidataProfileRun } from './plan-wikidata-profile-run.mjs';
import { finalizeWikidataProfileRun } from './finalize-wikidata-profile-run.mjs';

const config = {
  schemaVersion: 1,
  enrichmentId: 'saints-profile-v1',
  sourceId: 'wikidata',
  chunkSize: 2,
  maxQueriesPerRun: 1,
  rawStream: 'enrichment/saints/v1/raw/wikidata/profile-v1',
  normalizedStream: 'enrichment/saints/v1/normalized/wikidata/profile-v1',
  progressStream: 'enrichment-progress/saints/v1/wikidata/profile-v1',
  policy: { exactQidInputOnly: true, nameSearchForbidden: true, productionPublication: false, d1ProductionMutation: false }
};
const root = 'a'.repeat(64);
const identityManifest = { stage: 'global-candidate-identity-ledger', mode: 'staging', publish: false, rootSha256: root };
const identityReport = { rootSha256: root, freezeIdentityGateEligible: true, identityConflictCount: 0, uniqueIdentityCount: 3 };
const identityLedger = [1, 2, 3].map((value) => ({ entityId: `wikidata:Q${value}`, qid: `Q${value}`, publish: false }));

const first = planWikidataProfileRun({ config, identityManifest, identityReport, identityLedger });
assert.equal(first.shouldRun, true);
assert.equal(first.startEntityOffset, 0);
assert.equal(first.nextEntityOffset, 2);
assert.deepEqual(first.selectedQids, ['Q1', 'Q2']);
assert.match(first.rawStream, /chunk-000000$/u);

const raw = {
  schemaVersion: 1,
  enrichmentId: 'saints-profile-v1', sourceId: 'wikidata', mode: 'archive-only', publish: false, productionMutation: false,
  identityRootSha256: root, startEntityOffset: 0, nextEntityOffset: 2, entityCount: 2,
  selectedQids: ['Q1', 'Q2'], responseSha256: 'b'.repeat(64), responseBytes: 42,
  attempts: [{ outcome: 'success' }], finishedAt: '2026-08-10T22:00:00Z'
};
const normalized = {
  schemaVersion: 1,
  enrichmentId: 'saints-profile-v1', sourceId: 'wikidata', publish: false, productionMutation: false,
  identityRootSha256: root, startEntityOffset: 0, nextEntityOffset: 2, entityCount: 2, rawResponseSha256: 'b'.repeat(64),
  entities: ['Q1', 'Q2'].map((qid) => ({ entityId: `wikidata:${qid}`, qid, identityBasis: 'exact-wikidata-identifier', publish: false }))
};
const progress = finalizeWikidataProfileRun({ config, plan: first, raw, normalized, now: new Date('2026-08-10T22:01:00Z') });
assert.equal(progress.nextEntityOffset, 2);
assert.equal(progress.completed, false);
assert.equal(progress.successfulRuns, 1);

const second = planWikidataProfileRun({ config, identityManifest, identityReport, identityLedger, previousProgress: progress });
assert.deepEqual(second.selectedQids, ['Q3']);
assert.equal(second.nextEntityOffset, 3);
const wrongRoot = structuredClone(progress); wrongRoot.identityRootSha256 = 'c'.repeat(64);
assert.throws(() => planWikidataProfileRun({ config, identityManifest, identityReport, identityLedger, previousProgress: wrongRoot }), /Identity root changed/);

const unsafe = structuredClone(normalized); unsafe.publish = true;
assert.throws(() => finalizeWikidataProfileRun({ config, plan: first, raw, normalized: unsafe }), /prohibited publication gate/);

console.log('Resumable Wikidata profile enrichment pipeline tests passed.');

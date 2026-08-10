#!/usr/bin/env node

import assert from 'node:assert/strict';
import { planGlobalIdentityLedger } from './plan-global-identity-ledger.mjs';
import { verifyGlobalIdentityLedger } from './verify-global-identity-ledger.mjs';

const progress = {
  schemaVersion: 1,
  baselineId: 'saints-v1',
  sourceId: 'wikidata',
  sourceCompleted: true,
  caughtUp: true,
  cumulativeEntitiesReviewed: 11173,
  lastReviewed: { sourceStartPage: 20, sourceNextPage: 29, sourceRunId: 'run-20' },
};
const previousManifest = { identityVersion: '1.0', queryVersion: 'recognition-v1', sourceEntityOccurrences: 11173 };
const previousSourceBatches = { batches: [{ startPage: 20, nextPage: 29, sourceRunId: 'run-20' }] };

{
  const plan = planGlobalIdentityLedger({ progress, identityVersion: '1.0', queryVersion: 'recognition-v1' });
  assert.deepEqual(plan, { schemaVersion: 1, shouldRun: true, reason: 'reviewed-baseline-complete' });
}

{
  const plan = planGlobalIdentityLedger({ progress, identityVersion: '1.0', queryVersion: 'recognition-v1', previousManifest, previousSourceBatches });
  assert.deepEqual(plan, { schemaVersion: 1, shouldRun: false, reason: 'identity-ledger-already-current' });
}

{
  const plan = planGlobalIdentityLedger({
    progress,
    identityVersion: '1.0',
    languageCoverageVersion: '1.0',
    queryVersion: 'recognition-v1',
    previousManifest,
    previousSourceBatches,
  });
  assert.deepEqual(plan, { schemaVersion: 1, shouldRun: true, reason: 'language-coverage-contract-changed' });
}

{
  const plan = planGlobalIdentityLedger({
    progress,
    identityVersion: '1.0',
    languageCoverageVersion: '1.0',
    queryVersion: 'recognition-v1',
    previousManifest,
    previousSourceBatches,
    previousLanguageCoverage: { languageCoverageVersion: '1.0' },
  });
  assert.deepEqual(plan, { schemaVersion: 1, shouldRun: false, reason: 'identity-ledger-already-current' });
}

{
  const incomplete = { ...progress, caughtUp: false };
  const plan = planGlobalIdentityLedger({ progress: incomplete });
  assert.equal(plan.shouldRun, false);
  assert.equal(plan.reason, 'reviewed-baseline-not-complete');
}

const report = {
  rootSha256: 'abc123',
  nameOnlyMergeCount: 0,
  exactExternalIdentifierResolutionCount: 11170,
  uniqueIdentityCount: 11170,
  identityConflictCount: 0,
};
const manifest = { stage: 'global-candidate-identity-ledger', mode: 'staging', publish: false, rootSha256: 'abc123' };
assert.equal(verifyGlobalIdentityLedger({ manifest, report }), report);
assert.throws(() => verifyGlobalIdentityLedger({ manifest: { ...manifest, publish: true }, report }), /publication boundary/u);
assert.throws(() => verifyGlobalIdentityLedger({ manifest: { ...manifest, rootSha256: 'different' }, report }), /root hash mismatch/u);
assert.throws(() => verifyGlobalIdentityLedger({ manifest, report: { ...report, nameOnlyMergeCount: 1 } }), /Name-only/u);
assert.throws(() => verifyGlobalIdentityLedger({ manifest, report: { ...report, exactExternalIdentifierResolutionCount: 11169 } }), /exact external identifier/u);

console.log('Global identity workflow helper tests passed.');

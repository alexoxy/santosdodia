#!/usr/bin/env node

import assert from 'node:assert/strict';
import { planBaselineImport } from './plan-wikidata-baseline-import.mjs';
import { finalizeBaselineImport } from './finalize-wikidata-baseline-import.mjs';

const common = {
  queryVersion: 'recognition-v1', normalizationVersion: '1.1', reviewVersion: '1.1', importVersion: '1.0', entityLimit: 125, maxOperationsPerDay: 1,
  reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
  receiptStreamPrefix: 'baseline-import-receipts/saints/v1/wikidata/recognition-v1',
};
const reviewedProgress = {
  schemaVersion: 1, baselineId: 'saints-v1', sourceId: 'wikidata', queryVersion: common.queryVersion,
  normalizationVersion: common.normalizationVersion, languageReviewVersion: common.reviewVersion, sourceCompleted: false,
  lastReviewed: { sourceRunId: 'run-a', sourceStartPage: 0, sourceNextPage: 10, entityCount: 4008 },
};
const first = planBaselineImport({ reviewedProgress, importProgress: null, ...common });
assert.equal(first.shouldRun, true);
assert.equal(first.targetStartPage, 0);
assert.equal(first.entityOffset, 0);
assert.equal(first.entityLimit, 125);
assert.ok(first.reviewedStream.endsWith('/batch-000000'));
assert.ok(first.receiptStream.endsWith('/batch-000000/chunk-000000'));

function finalize(plan, { offset = plan.entityOffset, count = 125, sourceCount = 4008, sourceNextPage = 10, runId = 'run-a' } = {}) {
  const batch = {
    entityOffset: offset, entityCount: count, nextEntityOffset: offset + count, sourceEntityCount: sourceCount,
    languageReviewVersion: '1.1', idempotencyKey: `key-${offset}`, statementsSha256: `sha-${offset}`, sourceRunId: runId,
  };
  return finalizeBaselineImport({
    plan,
    reviewedManifest: { mode: 'staging', publish: false, stage: 'linguistically-reviewed', queryVersion: 'recognition-v1', stagingVersion: '1.1', linguisticReviewVersion: '1.1', sourceRunId: runId, entityCount: sourceCount },
    reviewedReceipt: { verified: true, stream: plan.reviewedStream, sha256: `reviewed-${offset}` },
    upstreamSummary: { status: 'fetched', queryVersion: 'recognition-v1', runId, startPage: plan.targetStartPage, nextPage: sourceNextPage },
    d1Batch: batch,
    d1Receipt: { verifiedIdempotent: true, productionMutation: false, idempotencyKey: batch.idempotencyKey, sourceRunId: runId },
  });
}

const at125 = finalize(first);
assert.equal(at125.lastImported.completedSourceBatch, false);
assert.equal(at125.lastImported.nextEntityOffset, 125);
assert.equal(at125.cumulativeEntitiesImported, 125);
const second = planBaselineImport({ reviewedProgress, importProgress: at125, ...common });
assert.equal(second.targetStartPage, 0);
assert.equal(second.entityOffset, 125);
assert.equal(second.reason, 'continue-source-batch');
assert.ok(second.receiptStream.endsWith('/chunk-000125'));

const finalChunkPlan = { ...second, entityOffset: 4000, receiptStream: 'baseline-import-receipts/saints/v1/wikidata/recognition-v1/batch-000000/chunk-004000', previousProgress: { ...at125, cumulativeEntitiesImported: 4000 } };
const completed = finalize(finalChunkPlan, { offset: 4000, count: 8 });
assert.equal(completed.lastImported.completedSourceBatch, true);
assert.equal(completed.caughtUp, true);
assert.equal(completed.cumulativeEntitiesImported, 4008);

const reviewedAt20 = { ...reviewedProgress, lastReviewed: { sourceRunId: 'run-b', sourceStartPage: 10, sourceNextPage: 20, entityCount: 3900 } };
const nextBatch = planBaselineImport({ reviewedProgress: reviewedAt20, importProgress: completed, ...common });
assert.equal(nextBatch.targetStartPage, 10);
assert.equal(nextBatch.entityOffset, 0);
assert.equal(nextBatch.reason, 'import-latest-reviewed-batch');

assert.throws(() => planBaselineImport({ reviewedProgress, importProgress: { ...at125, d1ImportVersion: '9.9' }, ...common }), /pipeline version/u);
assert.throws(() => finalizeBaselineImport({
  plan: first,
  reviewedManifest: { mode: 'staging', publish: false, stage: 'linguistically-reviewed', queryVersion: 'recognition-v1', stagingVersion: '1.1', linguisticReviewVersion: '1.1', sourceRunId: 'run-a', entityCount: 4008 },
  reviewedReceipt: { verified: true, stream: first.reviewedStream, sha256: 'r' },
  upstreamSummary: { status: 'fetched', queryVersion: 'recognition-v1', runId: 'run-a', startPage: 0, nextPage: 10 },
  d1Batch: { entityOffset: 0, entityCount: 126, nextEntityOffset: 126, sourceEntityCount: 4008, languageReviewVersion: '1.1', idempotencyKey: 'x', statementsSha256: 'x', sourceRunId: 'run-a' },
  d1Receipt: { verifiedIdempotent: true, productionMutation: false, idempotencyKey: 'x', sourceRunId: 'run-a' },
}), /chunk limit/u);

console.log('Saints Baseline v1 chunked D1 import watermark tests passed.');

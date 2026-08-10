#!/usr/bin/env node

import assert from 'node:assert/strict';
import { planBaselineNormalization } from './plan-wikidata-baseline-normalization.mjs';
import { finalizeBaselineNormalization } from './finalize-wikidata-baseline-normalization.mjs';

const queryVersion = 'recognition-v1';
const normalizationVersion = '1.1';
const rawStreamPrefix = 'baseline/saints/v1/raw/wikidata/recognition-v1';
const normalizedStreamPrefix = 'baseline/saints/v1/normalized/wikidata/recognition-v1';

function acquisition({ runId, startPage, nextPage, completed = false, successfulRuns = 1 }) {
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion,
    completed,
    nextPage,
    cumulativeBindings: nextPage * 500,
    successfulRuns,
    lastRun: {
      runId,
      queryVersion,
      startPage,
      nextPage,
      pageSize: 500,
      pageCount: nextPage - startPage,
      totalBindings: (nextPage - startPage) * 500,
      exhausted: completed,
    },
  };
}

const sourceProgress = acquisition({ runId: 'run-a', startPage: 0, nextPage: 10 });
const first = planBaselineNormalization({ sourceProgress, normalizedProgress: null, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(first.shouldRun, true);
assert.equal(first.targetStartPage, 0);
assert.equal(first.expectedSourceRunId, 'run-a');
assert.equal(first.rawStream, `${rawStreamPrefix}/batch-000000`);
assert.equal(first.normalizedStream, `${normalizedStreamPrefix}/batch-000000`);

const manifest = {
  stagingVersion: normalizationVersion,
  queryVersion,
  sourceRunId: 'run-a',
  mode: 'staging',
  publish: false,
  sourceFingerprint: 'abc123',
  entityCount: 4321,
  conflictCount: 17,
};
const rawReceipt = { verified: true, stream: first.rawStream, sha256: 'rawsha-a' };
const rawSummary = { status: 'fetched', queryVersion, runId: 'run-a', startPage: 0, nextPage: 10 };
const normalizedProgress = finalizeBaselineNormalization({ plan: first, manifest, rawReceipt, rawSummary });
assert.equal(normalizedProgress.successfulNormalizations, 1);
assert.equal(normalizedProgress.cumulativeEntitiesProcessed, 4321);
assert.equal(normalizedProgress.caughtUp, true);
assert.equal(normalizedProgress.lastNormalized.sourceRunId, 'run-a');
assert.equal(normalizedProgress.lastNormalized.sourceNextPage, 10);

const repeat = planBaselineNormalization({ sourceProgress, normalizedProgress, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(repeat.shouldRun, false);
assert.equal(repeat.reason, 'normalization-caught-up');

const latestAt30 = acquisition({ runId: 'run-c', startPage: 20, nextPage: 30, successfulRuns: 3 });
const backlog = planBaselineNormalization({ sourceProgress: latestAt30, normalizedProgress, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(backlog.shouldRun, true);
assert.equal(backlog.reason, 'drain-normalization-backlog');
assert.equal(backlog.targetStartPage, 10);
assert.equal(backlog.expectedSourceRunId, null);
assert.equal(backlog.rawStream, `${rawStreamPrefix}/batch-000010`);

const backlogManifest = { ...manifest, sourceRunId: 'run-b', sourceFingerprint: 'def456', entityCount: 4100 };
const backlogReceipt = { verified: true, stream: backlog.rawStream, sha256: 'rawsha-b' };
const backlogSummary = { status: 'fetched', queryVersion, runId: 'run-b', startPage: 10, nextPage: 20 };
const progressAt20 = finalizeBaselineNormalization({ plan: backlog, manifest: backlogManifest, rawReceipt: backlogReceipt, rawSummary: backlogSummary });
assert.equal(progressAt20.caughtUp, false);
assert.equal(progressAt20.sourceCompleted, false);
assert.equal(progressAt20.lastNormalized.sourceNextPage, 20);

const latestPlan = planBaselineNormalization({ sourceProgress: latestAt30, normalizedProgress: progressAt20, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(latestPlan.targetStartPage, 20);
assert.equal(latestPlan.expectedSourceRunId, 'run-c');
assert.equal(latestPlan.reason, 'normalize-latest-source-run');

const completedSource = acquisition({ runId: 'run-c', startPage: 20, nextPage: 27, completed: true, successfulRuns: 3 });
const completedPlan = planBaselineNormalization({ sourceProgress: completedSource, normalizedProgress: progressAt20, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
const completedManifest = { ...manifest, sourceRunId: 'run-c', sourceFingerprint: 'ghi789', entityCount: 2500 };
const completedReceipt = { verified: true, stream: completedPlan.rawStream, sha256: 'rawsha-c' };
const completedSummary = { status: 'fetched', queryVersion, runId: 'run-c', startPage: 20, nextPage: 27 };
const completedProgress = finalizeBaselineNormalization({ plan: completedPlan, manifest: completedManifest, rawReceipt: completedReceipt, rawSummary: completedSummary });
assert.equal(completedProgress.caughtUp, true);
assert.equal(completedProgress.sourceCompleted, true);

assert.throws(() => planBaselineNormalization({
  sourceProgress: { ...sourceProgress, queryVersion: 'other' }, normalizedProgress: null, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix,
}), /query version/u);
assert.throws(() => planBaselineNormalization({
  sourceProgress,
  normalizedProgress: { ...normalizedProgress, normalizationVersion: '9.9' },
  queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix,
}), /normalizer version/u);
assert.throws(() => finalizeBaselineNormalization({
  plan: first,
  manifest: { ...manifest, publish: true },
  rawReceipt,
  rawSummary,
}), /staging-only/u);
assert.throws(() => finalizeBaselineNormalization({
  plan: first,
  manifest,
  rawReceipt: { ...rawReceipt, verified: false },
  rawSummary,
}), /RAW receipt/u);
assert.throws(() => finalizeBaselineNormalization({
  plan: backlog,
  manifest: backlogManifest,
  rawReceipt: backlogReceipt,
  rawSummary: { ...backlogSummary, startPage: 11 },
}), /startPage/u);

console.log('Saints Baseline v1 ordered normalization watermark tests passed.');

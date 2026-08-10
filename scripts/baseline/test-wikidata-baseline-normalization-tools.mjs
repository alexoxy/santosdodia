#!/usr/bin/env node

import assert from 'node:assert/strict';
import { planBaselineNormalization } from './plan-wikidata-baseline-normalization.mjs';
import { finalizeBaselineNormalization } from './finalize-wikidata-baseline-normalization.mjs';

const queryVersion = 'recognition-v1';
const normalizationVersion = '1.1';
const rawStreamPrefix = 'baseline/saints/v1/raw/wikidata/recognition-v1';
const normalizedStreamPrefix = 'baseline/saints/v1/normalized/wikidata/recognition-v1';

const sourceProgress = {
  schemaVersion: 1,
  baselineId: 'saints-v1',
  sourceId: 'wikidata',
  queryVersion,
  completed: false,
  nextPage: 10,
  cumulativeBindings: 5000,
  successfulRuns: 1,
  lastRun: {
    runId: 'run-a',
    queryVersion,
    startPage: 0,
    nextPage: 10,
    pageSize: 500,
    pageCount: 10,
    totalBindings: 5000,
    exhausted: false,
  },
};

const first = planBaselineNormalization({ sourceProgress, normalizedProgress: null, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(first.shouldRun, true);
assert.equal(first.sourceStartPage, 0);
assert.equal(first.rawStream, `${rawStreamPrefix}/batch-000000`);
assert.equal(first.normalizedStream, `${normalizedStreamPrefix}/batch-000000`);

const manifest = {
  stagingVersion: normalizationVersion,
  queryVersion,
  mode: 'staging',
  publish: false,
  sourceFingerprint: 'abc123',
  entityCount: 4321,
  conflictCount: 17,
};
const rawReceipt = {
  verified: true,
  stream: first.rawStream,
  sha256: 'rawsha',
};
const normalizedProgress = finalizeBaselineNormalization({ plan: first, manifest, rawReceipt });
assert.equal(normalizedProgress.successfulNormalizations, 1);
assert.equal(normalizedProgress.cumulativeEntitiesProcessed, 4321);
assert.equal(normalizedProgress.lastNormalized.sourceRunId, 'run-a');
assert.equal(normalizedProgress.lastNormalized.rawSha256, 'rawsha');

const repeat = planBaselineNormalization({ sourceProgress, normalizedProgress, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(repeat.shouldRun, false);
assert.equal(repeat.reason, 'latest-source-run-already-normalized');

const nextSource = structuredClone(sourceProgress);
nextSource.nextPage = 20;
nextSource.cumulativeBindings = 10000;
nextSource.successfulRuns = 2;
nextSource.lastRun = { ...nextSource.lastRun, runId: 'run-b', startPage: 10, nextPage: 20 };
const next = planBaselineNormalization({ sourceProgress: nextSource, normalizedProgress, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
assert.equal(next.shouldRun, true);
assert.equal(next.sourceStartPage, 10);
assert.equal(next.rawStream, `${rawStreamPrefix}/batch-000010`);

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
}), /staging-only/u);
assert.throws(() => finalizeBaselineNormalization({
  plan: first,
  manifest,
  rawReceipt: { ...rawReceipt, verified: false },
}), /RAW receipt/u);

console.log('Saints Baseline v1 normalization watermark tests passed.');

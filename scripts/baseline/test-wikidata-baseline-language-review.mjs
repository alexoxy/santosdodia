#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { planBaselineLanguageReview } from './plan-wikidata-baseline-language-review.mjs';
import { finalizeBaselineLanguageReview } from './finalize-wikidata-baseline-language-review.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'santos-language-review-'));
try {
  const input = path.join(root, 'normalized');
  const output = path.join(root, 'reviewed');
  fs.mkdirSync(input, { recursive: true });
  const manifest = {
    stagingVersion: '1.1',
    sourceId: 'wikidata',
    sourceRunId: 'run-a',
    queryVersion: 'recognition-v1',
    sourceFingerprint: 'fingerprint-a',
    mode: 'staging',
    publish: false,
    entityCount: 2,
    conflictCount: 0,
  };
  fs.writeFileSync(path.join(input, 'staging-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(input, 'quality-report.json'), `${JSON.stringify({ publicationGate: { allowed: false } }, null, 2)}\n`);
  const entities = [
    {
      id: 'wikidata:Q1', qid: 'Q1',
      names: [
        { language: 'pt', name: 'Santo António', nameType: 'label', normalizedName: 'santo antónio' },
        { language: 'en', name: 'Saint Anthony', nameType: 'label', normalizedName: 'saint anthony' },
        { language: 'ru', name: 'Saint Anthony', nameType: 'label', normalizedName: 'saint anthony' },
      ],
      descriptions: [{ language: 'pt', value: 'Comemoração em Agosto De 2026' }],
    },
    {
      id: 'wikidata:Q2', qid: 'Q2',
      names: [{ language: 'en', name: 'Saint Two', nameType: 'label', normalizedName: 'saint two' }],
      descriptions: [],
    },
  ];
  fs.writeFileSync(path.join(input, 'entities.jsonl'), `${entities.map((value) => JSON.stringify(value)).join('\n')}\n`);
  fs.writeFileSync(path.join(input, 'conflicts.jsonl'), '');
  fs.writeFileSync(path.join(input, 'review-queue.csv'), 'qid\n');

  execFileSync(process.execPath, ['scripts/linguistic/review-normalized-package.mjs', '--input', input, '--output', output], { cwd: process.cwd(), stdio: 'pipe' });
  const review = JSON.parse(fs.readFileSync(path.join(output, 'linguistic-review.json'), 'utf8'));
  const reviewedManifest = JSON.parse(fs.readFileSync(path.join(output, 'staging-manifest.json'), 'utf8'));
  const decisions = fs.readFileSync(path.join(output, 'localized-name-decisions.jsonl'), 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);
  const queue = fs.readFileSync(path.join(output, 'translation-queue.jsonl'), 'utf8').trim().split(/\r?\n/u).filter(Boolean).map(JSON.parse);

  assert.equal(review.reviewVersion, '1.1');
  assert.equal(review.batchFatalCount, 0);
  assert.equal(review.criticalCount, 0);
  assert.ok(review.withheldCount >= 2);
  assert.equal(review.policy.localeIsolation, true);
  assert.equal(review.policy.sourceOnlyIsNotCanonical, true);
  assert.equal(reviewedManifest.stage, 'linguistically-reviewed');
  assert.equal(reviewedManifest.publish, false);
  assert.equal(reviewedManifest.linguisticReviewVersion, '1.1');
  assert.equal(decisions.find((item) => item.entityId === 'wikidata:Q1' && item.locale === 'pt').scriptGate, 'candidate');
  assert.equal(decisions.find((item) => item.entityId === 'wikidata:Q1' && item.locale === 'ru').scriptGate, 'withheld');
  assert.ok(queue.some((item) => item.entityId === 'wikidata:Q1' && item.locale === 'ru' && item.reason === 'withheld'));
  assert.ok(queue.some((item) => item.entityId === 'wikidata:Q2' && item.locale === 'pt' && item.reason === 'missing'));
  assert.ok(queue.some((item) => item.entityId === 'wikidata:Q1' && item.locale === 'pt' && item.reason === 'source-only'));
  assert.ok(queue.every((item) => item.doNotInventCanonicalName === true));

  const normalizedProgress = {
    schemaVersion: 1,
    baselineId: 'saints-v1', sourceId: 'wikidata', queryVersion: 'recognition-v1', normalizationVersion: '1.1',
    sourceCompleted: false, caughtUp: true,
    lastNormalized: { sourceRunId: 'run-a', sourceStartPage: 0, sourceNextPage: 10 },
  };
  const plan = planBaselineLanguageReview({
    normalizedProgress, reviewedProgress: null, queryVersion: 'recognition-v1', normalizationVersion: '1.1', reviewVersion: '1.1',
    normalizedStreamPrefix: 'baseline/saints/v1/normalized/wikidata/recognition-v1',
    reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
  });
  assert.equal(plan.shouldRun, true);
  assert.equal(plan.targetStartPage, 0);
  assert.equal(plan.expectedSourceRunId, 'run-a');

  const progress = finalizeBaselineLanguageReview({
    plan,
    manifest: reviewedManifest,
    review,
    normalizedReceipt: { verified: true, stream: plan.normalizedStream, sha256: 'normalized-sha' },
    upstreamSummary: { status: 'fetched', queryVersion: 'recognition-v1', runId: 'run-a', startPage: 0, nextPage: 10 },
  });
  assert.equal(progress.caughtUp, true);
  assert.equal(progress.successfulReviews, 1);
  assert.equal(progress.lastReviewed.sourceNextPage, 10);

  const normalizedAt30 = {
    ...normalizedProgress,
    lastNormalized: { sourceRunId: 'run-c', sourceStartPage: 20, sourceNextPage: 30 },
  };
  const backlogPlan = planBaselineLanguageReview({
    normalizedProgress: normalizedAt30, reviewedProgress: progress, queryVersion: 'recognition-v1', normalizationVersion: '1.1', reviewVersion: '1.1',
    normalizedStreamPrefix: 'baseline/saints/v1/normalized/wikidata/recognition-v1',
    reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
  });
  assert.equal(backlogPlan.shouldRun, true);
  assert.equal(backlogPlan.targetStartPage, 10);
  assert.equal(backlogPlan.reason, 'drain-language-review-backlog');
  assert.equal(backlogPlan.expectedSourceRunId, null);

  assert.throws(() => planBaselineLanguageReview({
    normalizedProgress, reviewedProgress: { ...progress, languageReviewVersion: '9.9' }, queryVersion: 'recognition-v1', normalizationVersion: '1.1', reviewVersion: '1.1',
    normalizedStreamPrefix: 'baseline/saints/v1/normalized/wikidata/recognition-v1', reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
  }), /review version/u);
  assert.throws(() => finalizeBaselineLanguageReview({
    plan, manifest: reviewedManifest, review: { ...review, criticalCount: 1 },
    normalizedReceipt: { verified: true, stream: plan.normalizedStream, sha256: 'normalized-sha' },
    upstreamSummary: { status: 'fetched', queryVersion: 'recognition-v1', runId: 'run-a', startPage: 0, nextPage: 10 },
  }), /batch-fatal/u);

  console.log('Saints Baseline v1 locale-isolated language-review tests passed.');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

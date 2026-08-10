#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function batchId(startPage) {
  return `batch-${String(startPage).padStart(6, '0')}`;
}

export function planBaselineLanguageReview({ normalizedProgress, reviewedProgress = null, queryVersion, normalizationVersion, reviewVersion, normalizedStreamPrefix, reviewedStreamPrefix }) {
  if (!normalizedProgress || normalizedProgress.schemaVersion !== 1) throw new Error('Normalization progress is missing or invalid.');
  if (normalizedProgress.baselineId !== 'saints-v1' || normalizedProgress.sourceId !== 'wikidata') throw new Error('Normalization progress has the wrong baseline/source identity.');
  if (normalizedProgress.queryVersion !== queryVersion) throw new Error('Normalization progress belongs to a different query epoch.');
  if (normalizedProgress.normalizationVersion !== normalizationVersion) throw new Error('Normalization progress belongs to a different normalizer version.');
  const latest = normalizedProgress.lastNormalized;
  if (!latest || !Number.isInteger(latest.sourceStartPage) || !Number.isInteger(latest.sourceNextPage) || !latest.sourceRunId) {
    throw new Error('Normalization progress has no complete lastNormalized watermark.');
  }
  if (latest.sourceNextPage <= latest.sourceStartPage) throw new Error('Normalization watermark did not advance.');

  const upstreamNextPage = latest.sourceNextPage;
  let targetStartPage = 0;
  let previous = null;
  if (reviewedProgress) {
    if (reviewedProgress.schemaVersion !== 1 || reviewedProgress.baselineId !== 'saints-v1' || reviewedProgress.sourceId !== 'wikidata') {
      throw new Error('Language-review progress has the wrong identity/schema.');
    }
    if (reviewedProgress.queryVersion !== queryVersion) throw new Error('Language-review progress belongs to a different query epoch.');
    if (reviewedProgress.normalizationVersion !== normalizationVersion) throw new Error('Language-review progress belongs to a different normalizer version.');
    if (reviewedProgress.languageReviewVersion !== reviewVersion) throw new Error('Language-review progress belongs to a different review version.');
    previous = reviewedProgress.lastReviewed ?? null;
    if (previous) {
      if (!Number.isInteger(previous.sourceStartPage) || !Number.isInteger(previous.sourceNextPage) || previous.sourceNextPage <= previous.sourceStartPage) {
        throw new Error('Language-review progress contains an invalid lastReviewed watermark.');
      }
      targetStartPage = previous.sourceNextPage;
    }
  }

  if (targetStartPage > upstreamNextPage) throw new Error('Language-review watermark is ahead of normalization watermark.');
  const caughtUp = targetStartPage === upstreamNextPage;
  const normalizedStream = `${normalizedStreamPrefix}/${batchId(targetStartPage)}`;
  const reviewedStream = `${reviewedStreamPrefix}/${batchId(targetStartPage)}`;
  if (caughtUp) {
    return {
      schemaVersion: 1,
      baselineId: 'saints-v1',
      sourceId: 'wikidata',
      queryVersion,
      normalizationVersion,
      languageReviewVersion: reviewVersion,
      shouldRun: false,
      reason: 'language-review-caught-up',
      targetStartPage,
      upstreamNextPage,
      sourceCompleted: normalizedProgress.sourceCompleted === true,
      expectedSourceRunId: null,
      normalizedStream,
      reviewedStream,
      previousProgress: reviewedProgress,
    };
  }

  const targetIsLatest = targetStartPage === latest.sourceStartPage;
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion,
    normalizationVersion,
    languageReviewVersion: reviewVersion,
    shouldRun: true,
    reason: previous ? (targetIsLatest ? 'review-latest-normalized-batch' : 'drain-language-review-backlog') : 'start-language-review-at-page-zero',
    targetStartPage,
    upstreamNextPage,
    sourceCompleted: normalizedProgress.sourceCompleted === true,
    expectedSourceRunId: targetIsLatest ? latest.sourceRunId : null,
    normalizedStream,
    reviewedStream,
    previousProgress: reviewedProgress,
  };
}

async function main() {
  const normalizedProgressArg = argument('--normalized-progress');
  const reviewedProgressArg = argument('--reviewed-progress');
  const queryVersion = argument('--query-version');
  const normalizationVersion = argument('--normalization-version');
  const reviewVersion = argument('--review-version');
  const normalizedStreamPrefix = argument('--normalized-prefix');
  const reviewedStreamPrefix = argument('--reviewed-prefix');
  if (!normalizedProgressArg || !queryVersion || !normalizationVersion || !reviewVersion || !normalizedStreamPrefix || !reviewedStreamPrefix) {
    throw new Error('Missing required language-review planner arguments.');
  }
  const normalizedProgress = readJson(path.resolve(normalizedProgressArg));
  const reviewedProgress = reviewedProgressArg && fs.existsSync(path.resolve(reviewedProgressArg)) ? readJson(path.resolve(reviewedProgressArg)) : null;
  const plan = planBaselineLanguageReview({ normalizedProgress, reviewedProgress, queryVersion, normalizationVersion, reviewVersion, normalizedStreamPrefix, reviewedStreamPrefix });
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`Baseline language-review planning failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

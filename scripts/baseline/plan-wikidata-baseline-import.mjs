#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function batchId(startPage) { return `batch-${String(startPage).padStart(6, '0')}`; }
function chunkId(offset) { return `chunk-${String(offset).padStart(6, '0')}`; }

export function planBaselineImport({ reviewedProgress, importProgress = null, queryVersion, normalizationVersion, reviewVersion, importVersion, entityLimit, reviewedStreamPrefix, receiptStreamPrefix }) {
  if (!reviewedProgress || reviewedProgress.schemaVersion !== 1) throw new Error('Language-review progress is missing or invalid.');
  if (reviewedProgress.baselineId !== 'saints-v1' || reviewedProgress.sourceId !== 'wikidata') throw new Error('Language-review progress has the wrong identity.');
  if (reviewedProgress.queryVersion !== queryVersion) throw new Error('Language-review progress belongs to a different query epoch.');
  if (reviewedProgress.normalizationVersion !== normalizationVersion) throw new Error('Language-review progress belongs to a different normalizer version.');
  if (reviewedProgress.languageReviewVersion !== reviewVersion) throw new Error('Language-review progress belongs to a different review version.');
  if (!Number.isSafeInteger(entityLimit) || entityLimit < 1) throw new Error('D1 import entity limit must be a positive integer.');
  const latest = reviewedProgress.lastReviewed;
  if (!latest || !Number.isInteger(latest.sourceStartPage) || !Number.isInteger(latest.sourceNextPage) || !latest.sourceRunId) throw new Error('Language-review progress has no complete lastReviewed watermark.');
  if (latest.sourceNextPage <= latest.sourceStartPage) throw new Error('Language-review watermark did not advance.');

  let targetStartPage = 0;
  let entityOffset = 0;
  let previous = null;
  if (importProgress) {
    if (importProgress.schemaVersion !== 1 || importProgress.baselineId !== 'saints-v1' || importProgress.sourceId !== 'wikidata') throw new Error('Import progress has the wrong identity/schema.');
    if (importProgress.queryVersion !== queryVersion || importProgress.normalizationVersion !== normalizationVersion || importProgress.languageReviewVersion !== reviewVersion || importProgress.d1ImportVersion !== importVersion) {
      throw new Error('Import progress belongs to a different pipeline version.');
    }
    previous = importProgress.lastImported ?? null;
    if (previous) {
      if (!Number.isInteger(previous.sourceStartPage) || !Number.isInteger(previous.sourceNextPage) || previous.sourceNextPage <= previous.sourceStartPage) throw new Error('Import progress contains an invalid source watermark.');
      if (!Number.isInteger(previous.nextEntityOffset) || previous.nextEntityOffset < 1) throw new Error('Import progress contains an invalid entity cursor.');
      if (previous.completedSourceBatch === true) {
        targetStartPage = previous.sourceNextPage;
        entityOffset = 0;
      } else {
        targetStartPage = previous.sourceStartPage;
        entityOffset = previous.nextEntityOffset;
      }
    }
  }

  const upstreamNextPage = latest.sourceNextPage;
  if (targetStartPage > upstreamNextPage) throw new Error('Import watermark is ahead of language-review watermark.');
  const caughtUp = targetStartPage === upstreamNextPage && entityOffset === 0;
  const reviewedStream = `${reviewedStreamPrefix}/${batchId(targetStartPage)}`;
  const receiptStream = `${receiptStreamPrefix}/${batchId(targetStartPage)}/${chunkId(entityOffset)}`;
  if (caughtUp) {
    return {
      schemaVersion: 1, baselineId: 'saints-v1', sourceId: 'wikidata', queryVersion, normalizationVersion,
      languageReviewVersion: reviewVersion, d1ImportVersion: importVersion, shouldRun: false, reason: 'd1-import-caught-up',
      targetStartPage, entityOffset, entityLimit, upstreamNextPage, sourceCompleted: reviewedProgress.sourceCompleted === true,
      expectedSourceRunId: null, reviewedStream, receiptStream, previousProgress: importProgress,
    };
  }

  const targetIsLatest = targetStartPage === latest.sourceStartPage;
  return {
    schemaVersion: 1, baselineId: 'saints-v1', sourceId: 'wikidata', queryVersion, normalizationVersion,
    languageReviewVersion: reviewVersion, d1ImportVersion: importVersion, shouldRun: true,
    reason: entityOffset > 0 ? 'continue-source-batch' : previous ? (targetIsLatest ? 'import-latest-reviewed-batch' : 'drain-import-backlog') : 'start-import-at-page-zero',
    targetStartPage, entityOffset, entityLimit, upstreamNextPage, sourceCompleted: reviewedProgress.sourceCompleted === true,
    expectedSourceRunId: targetIsLatest ? latest.sourceRunId : null, reviewedStream, receiptStream, previousProgress: importProgress,
  };
}

async function main() {
  const reviewedArg = argument('--reviewed-progress');
  const previousArg = argument('--import-progress');
  const queryVersion = argument('--query-version');
  const normalizationVersion = argument('--normalization-version');
  const reviewVersion = argument('--review-version');
  const importVersion = argument('--import-version');
  const entityLimit = Number(argument('--entity-limit'));
  const reviewedStreamPrefix = argument('--reviewed-prefix');
  const receiptStreamPrefix = argument('--receipt-prefix');
  if (!reviewedArg || !queryVersion || !normalizationVersion || !reviewVersion || !importVersion || !reviewedStreamPrefix || !receiptStreamPrefix) throw new Error('Missing required import planner arguments.');
  const reviewedProgress = readJson(path.resolve(reviewedArg));
  const importProgress = previousArg && fs.existsSync(path.resolve(previousArg)) ? readJson(path.resolve(previousArg)) : null;
  const plan = planBaselineImport({ reviewedProgress, importProgress, queryVersion, normalizationVersion, reviewVersion, importVersion, entityLimit, reviewedStreamPrefix, receiptStreamPrefix });
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => { process.stderr.write(`Baseline D1 import planning failed: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
}

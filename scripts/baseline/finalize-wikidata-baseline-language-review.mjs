#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }

export function finalizeBaselineLanguageReview({ plan, manifest, review, normalizedReceipt, upstreamSummary }) {
  if (plan?.shouldRun !== true) throw new Error('Cannot finalize a language-review plan that did not run.');
  if (manifest?.mode !== 'staging' || manifest?.publish !== false || manifest?.stage !== 'linguistically-reviewed') {
    throw new Error('Reviewed manifest must remain linguistically-reviewed staging-only.');
  }
  if (manifest.queryVersion !== plan.queryVersion) throw new Error('Reviewed manifest queryVersion does not match the plan.');
  if (manifest.stagingVersion !== plan.normalizationVersion) throw new Error('Reviewed manifest normalizer version does not match the plan.');
  if (manifest.linguisticReviewVersion !== plan.languageReviewVersion) throw new Error('Reviewed manifest language-review version does not match the plan.');
  if (!normalizedReceipt?.verified || normalizedReceipt.stream !== plan.normalizedStream || !normalizedReceipt.sha256) {
    throw new Error('NORMALIZED receipt is missing, unverified or points to the wrong stream.');
  }
  if (review?.reviewVersion !== plan.languageReviewVersion || review?.agent !== 'language-editor') throw new Error('Language-review report identity/version mismatch.');
  if (review?.publicationAllowed !== false || review?.batchFatalCount !== 0 || review?.criticalCount !== 0) throw new Error('Language-review package has a batch-fatal condition or an open publication gate.');
  if (review?.policy?.localeIsolation !== true || review?.policy?.sourceOnlyIsNotCanonical !== true || review?.policy?.missingLocaleDoesNotBlockOtherLocales !== true) {
    throw new Error('Language-review locale-isolation policy is incomplete.');
  }
  if (!upstreamSummary || upstreamSummary.status !== 'fetched') throw new Error('Upstream RAW summary is missing or incomplete.');
  if (upstreamSummary.queryVersion !== plan.queryVersion) throw new Error('Upstream summary queryVersion mismatch.');
  if (upstreamSummary.startPage !== plan.targetStartPage) throw new Error('Upstream summary startPage does not match language-review backlog position.');
  if (!Number.isInteger(upstreamSummary.nextPage) || upstreamSummary.nextPage <= upstreamSummary.startPage) throw new Error('Upstream summary did not advance.');
  if (plan.expectedSourceRunId && upstreamSummary.runId !== plan.expectedSourceRunId) throw new Error('Latest upstream runId does not match normalization watermark.');
  if (manifest.sourceRunId && manifest.sourceRunId !== upstreamSummary.runId) throw new Error('Reviewed manifest sourceRunId does not match upstream summary.');
  if (upstreamSummary.nextPage > plan.upstreamNextPage) throw new Error('Reviewed batch advances beyond normalization watermark.');

  const previous = plan.previousProgress;
  const caughtUpAfterThisBatch = upstreamSummary.nextPage === plan.upstreamNextPage;
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion: plan.queryVersion,
    normalizationVersion: plan.normalizationVersion,
    languageReviewVersion: plan.languageReviewVersion,
    updatedAt: now,
    sourceCompleted: plan.sourceCompleted === true && caughtUpAfterThisBatch,
    caughtUp: caughtUpAfterThisBatch,
    successfulReviews: Number(previous?.successfulReviews ?? 0) + 1,
    cumulativeEntitiesReviewed: Number(previous?.cumulativeEntitiesReviewed ?? 0) + Number(manifest.entityCount ?? 0),
    cumulativeWithheldFields: Number(previous?.cumulativeWithheldFields ?? 0) + Number(review.withheldCount ?? 0),
    cumulativeTranslationQueueItems: Number(previous?.cumulativeTranslationQueueItems ?? 0) + Number(review.translationQueueCount ?? 0),
    lastReviewed: {
      sourceRunId: upstreamSummary.runId,
      sourceStartPage: upstreamSummary.startPage,
      sourceNextPage: upstreamSummary.nextPage,
      normalizedStream: plan.normalizedStream,
      normalizedSha256: normalizedReceipt.sha256,
      reviewedStream: plan.reviewedStream,
      sourceFingerprint: manifest.sourceFingerprint,
      entityCount: manifest.entityCount,
      withheldCount: review.withheldCount,
      translationQueueCount: review.translationQueueCount,
      reviewedAt: now,
    },
  };
}

async function main() {
  const planArg = argument('--plan');
  const manifestArg = argument('--manifest');
  const reviewArg = argument('--review');
  const receiptArg = argument('--normalized-receipt');
  const summaryArg = argument('--upstream-summary');
  const outputArg = argument('--output');
  if (!planArg || !manifestArg || !reviewArg || !receiptArg || !summaryArg || !outputArg) throw new Error('Missing required language-review finalizer arguments.');
  const progress = finalizeBaselineLanguageReview({
    plan: readJson(path.resolve(planArg)),
    manifest: readJson(path.resolve(manifestArg)),
    review: readJson(path.resolve(reviewArg)),
    normalizedReceipt: readJson(path.resolve(receiptArg)),
    upstreamSummary: readJson(path.resolve(summaryArg)),
  });
  const output = path.resolve(outputArg);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(progress, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`Baseline language-review finalization failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

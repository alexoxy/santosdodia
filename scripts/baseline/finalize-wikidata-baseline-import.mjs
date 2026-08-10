#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }

export function finalizeBaselineImport({ plan, reviewedManifest, reviewedReceipt, upstreamSummary, d1Batch, d1Receipt }) {
  if (plan?.shouldRun !== true) throw new Error('Cannot finalize an import plan that did not run.');
  if (reviewedManifest?.mode !== 'staging' || reviewedManifest?.publish !== false || reviewedManifest?.stage !== 'linguistically-reviewed') throw new Error('Importer input must remain linguistically-reviewed staging-only.');
  if (reviewedManifest.queryVersion !== plan.queryVersion || reviewedManifest.stagingVersion !== plan.normalizationVersion || reviewedManifest.linguisticReviewVersion !== plan.languageReviewVersion) throw new Error('Reviewed package pipeline version mismatch.');
  if (!reviewedReceipt?.verified || reviewedReceipt.stream !== plan.reviewedStream || !reviewedReceipt.sha256) throw new Error('REVIEWED receipt is missing, unverified or points to the wrong stream.');
  if (!upstreamSummary || upstreamSummary.status !== 'fetched' || upstreamSummary.queryVersion !== plan.queryVersion || upstreamSummary.startPage !== plan.targetStartPage) throw new Error('Upstream source summary does not match the import plan.');
  if (plan.expectedSourceRunId && upstreamSummary.runId !== plan.expectedSourceRunId) throw new Error('Latest reviewed source run does not match the import plan.');
  if (reviewedManifest.sourceRunId && reviewedManifest.sourceRunId !== upstreamSummary.runId) throw new Error('Reviewed manifest sourceRunId does not match upstream summary.');

  if (d1Batch?.entityOffset !== plan.entityOffset) throw new Error('D1 batch entity offset does not match the import plan.');
  if (!Number.isInteger(d1Batch?.entityCount) || d1Batch.entityCount < 1 || d1Batch.entityCount > plan.entityLimit) throw new Error('D1 batch entity count is outside the planned chunk limit.');
  if (d1Batch.sourceEntityCount !== reviewedManifest.entityCount) throw new Error('D1 batch source entity count differs from reviewed manifest.');
  if (d1Batch.nextEntityOffset !== d1Batch.entityOffset + d1Batch.entityCount) throw new Error('D1 batch entity cursor is inconsistent.');
  if (d1Batch.nextEntityOffset > d1Batch.sourceEntityCount) throw new Error('D1 batch advances beyond source entity count.');
  if (d1Batch.languageReviewVersion !== plan.languageReviewVersion) throw new Error('D1 batch language-review version mismatch.');
  if (!d1Batch.idempotencyKey || !d1Batch.statementsSha256) throw new Error('D1 batch is missing idempotency/integrity metadata.');

  if (d1Receipt?.verifiedIdempotent !== true) throw new Error('D1 import receipt is not verified idempotent.');
  if (d1Receipt?.productionMutation !== false) throw new Error('D1 import receipt indicates a production mutation.');
  if (d1Receipt?.idempotencyKey !== d1Batch.idempotencyKey) throw new Error('D1 receipt idempotency key does not match the batch.');
  if (d1Receipt?.sourceRunId !== d1Batch.sourceRunId) throw new Error('D1 receipt source run does not match the batch.');

  const completedSourceBatch = d1Batch.nextEntityOffset === d1Batch.sourceEntityCount;
  const caughtUpAfterChunk = completedSourceBatch && upstreamSummary.nextPage === plan.upstreamNextPage;
  if (upstreamSummary.nextPage > plan.upstreamNextPage) throw new Error('Imported source shard advances beyond language-review watermark.');
  const previous = plan.previousProgress;
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion: plan.queryVersion,
    normalizationVersion: plan.normalizationVersion,
    languageReviewVersion: plan.languageReviewVersion,
    d1ImportVersion: plan.d1ImportVersion,
    updatedAt: now,
    sourceCompleted: plan.sourceCompleted === true && caughtUpAfterChunk,
    caughtUp: caughtUpAfterChunk,
    successfulImports: Number(previous?.successfulImports ?? 0) + 1,
    cumulativeEntitiesImported: Number(previous?.cumulativeEntitiesImported ?? 0) + d1Batch.entityCount,
    lastImported: {
      sourceRunId: upstreamSummary.runId,
      sourceStartPage: upstreamSummary.startPage,
      sourceNextPage: upstreamSummary.nextPage,
      reviewedStream: plan.reviewedStream,
      reviewedSha256: reviewedReceipt.sha256,
      entityOffset: d1Batch.entityOffset,
      importedEntityCount: d1Batch.entityCount,
      nextEntityOffset: d1Batch.nextEntityOffset,
      sourceEntityCount: d1Batch.sourceEntityCount,
      completedSourceBatch,
      receiptStream: plan.receiptStream,
      idempotencyKey: d1Batch.idempotencyKey,
      statementsSha256: d1Batch.statementsSha256,
      importedAt: now,
    },
  };
}

async function main() {
  const required = ['--plan','--reviewed-manifest','--reviewed-receipt','--upstream-summary','--d1-batch','--d1-receipt','--output'];
  const values = Object.fromEntries(required.map((name) => [name, argument(name)]));
  for (const [name, value] of Object.entries(values)) if (!value) throw new Error(`Missing ${name}.`);
  const progress = finalizeBaselineImport({
    plan: readJson(path.resolve(values['--plan'])),
    reviewedManifest: readJson(path.resolve(values['--reviewed-manifest'])),
    reviewedReceipt: readJson(path.resolve(values['--reviewed-receipt'])),
    upstreamSummary: readJson(path.resolve(values['--upstream-summary'])),
    d1Batch: readJson(path.resolve(values['--d1-batch'])),
    d1Receipt: readJson(path.resolve(values['--d1-receipt'])),
  });
  const output = path.resolve(values['--output']);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(progress, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => { process.stderr.write(`Baseline D1 import finalization failed: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
}

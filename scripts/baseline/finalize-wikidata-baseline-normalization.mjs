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

export function finalizeBaselineNormalization({ plan, manifest, rawReceipt, rawSummary }) {
  if (plan?.shouldRun !== true) throw new Error('Cannot finalize a normalization plan that did not run.');
  if (manifest?.mode !== 'staging' || manifest?.publish !== false) throw new Error('Normalized manifest must remain staging-only.');
  if (manifest.queryVersion !== plan.queryVersion) throw new Error('Normalized manifest queryVersion does not match the plan.');
  if (manifest.stagingVersion !== plan.normalizationVersion) throw new Error('Normalized manifest version does not match the plan.');
  if (!rawReceipt?.verified || rawReceipt.stream !== plan.rawStream || !rawReceipt.sha256) {
    throw new Error('RAW receipt is missing, unverified or points to the wrong stream.');
  }
  if (!rawSummary || rawSummary.status !== 'fetched') throw new Error('RAW summary is missing or incomplete.');
  if (rawSummary.queryVersion !== plan.queryVersion) throw new Error('RAW summary queryVersion does not match the plan.');
  if (rawSummary.startPage !== plan.targetStartPage) throw new Error('RAW summary startPage does not match the planned backlog position.');
  if (!Number.isInteger(rawSummary.nextPage) || rawSummary.nextPage <= rawSummary.startPage) throw new Error('RAW summary did not advance the page watermark.');
  if (plan.expectedSourceRunId && rawSummary.runId !== plan.expectedSourceRunId) throw new Error('Latest RAW runId does not match acquisition watermark.');
  if (manifest.sourceRunId && manifest.sourceRunId !== rawSummary.runId) throw new Error('Normalized manifest sourceRunId does not match RAW summary.');
  if (!Number.isInteger(manifest.entityCount) || manifest.entityCount < 1) throw new Error('Normalizer produced no entities.');

  const previous = plan.previousProgress;
  const caughtUpAfterThisBatch = rawSummary.nextPage === plan.acquisitionNextPage;
  if (rawSummary.nextPage > plan.acquisitionNextPage) throw new Error('RAW batch advances beyond the acquisition watermark.');
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion: plan.queryVersion,
    normalizationVersion: plan.normalizationVersion,
    updatedAt: now,
    sourceCompleted: plan.sourceCompleted === true && caughtUpAfterThisBatch,
    caughtUp: caughtUpAfterThisBatch,
    successfulNormalizations: Number(previous?.successfulNormalizations ?? 0) + 1,
    cumulativeEntitiesProcessed: Number(previous?.cumulativeEntitiesProcessed ?? 0) + Number(manifest.entityCount),
    lastNormalized: {
      sourceRunId: rawSummary.runId,
      sourceStartPage: rawSummary.startPage,
      sourceNextPage: rawSummary.nextPage,
      rawStream: plan.rawStream,
      rawSha256: rawReceipt.sha256,
      normalizedStream: plan.normalizedStream,
      sourceFingerprint: manifest.sourceFingerprint,
      entityCount: manifest.entityCount,
      conflictCount: manifest.conflictCount,
      normalizedAt: now,
    },
  };
}

async function main() {
  const planArg = argument('--plan');
  const manifestArg = argument('--manifest');
  const rawReceiptArg = argument('--raw-receipt');
  const rawSummaryArg = argument('--raw-summary');
  const outputArg = argument('--output');
  if (!planArg || !manifestArg || !rawReceiptArg || !rawSummaryArg || !outputArg) throw new Error('Missing required normalization finalizer arguments.');
  const plan = readJson(path.resolve(planArg));
  const manifest = readJson(path.resolve(manifestArg));
  const rawReceipt = readJson(path.resolve(rawReceiptArg));
  const rawSummary = readJson(path.resolve(rawSummaryArg));
  const progress = finalizeBaselineNormalization({ plan, manifest, rawReceipt, rawSummary });
  const output = path.resolve(outputArg);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(progress, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`Baseline normalization finalization failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

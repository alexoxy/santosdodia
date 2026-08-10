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

export function finalizeBaselineNormalization({ plan, manifest, rawReceipt }) {
  if (plan?.shouldRun !== true) throw new Error('Cannot finalize a normalization plan that did not run.');
  if (manifest?.mode !== 'staging' || manifest?.publish !== false) throw new Error('Normalized manifest must remain staging-only.');
  if (manifest.queryVersion !== plan.queryVersion) throw new Error('Normalized manifest queryVersion does not match the plan.');
  if (manifest.stagingVersion !== plan.normalizationVersion) throw new Error('Normalized manifest version does not match the plan.');
  if (!rawReceipt?.verified || rawReceipt.stream !== plan.rawStream || !rawReceipt.sha256) {
    throw new Error('RAW receipt is missing, unverified or points to the wrong stream.');
  }
  if (!Number.isInteger(manifest.entityCount) || manifest.entityCount < 1) throw new Error('Normalizer produced no entities.');

  const previous = plan.previousProgress;
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion: plan.queryVersion,
    normalizationVersion: plan.normalizationVersion,
    updatedAt: new Date().toISOString(),
    sourceCompleted: plan.sourceCompleted === true,
    successfulNormalizations: Number(previous?.successfulNormalizations ?? 0) + 1,
    cumulativeEntitiesProcessed: Number(previous?.cumulativeEntitiesProcessed ?? 0) + Number(manifest.entityCount),
    lastNormalized: {
      sourceRunId: plan.sourceRunId,
      sourceStartPage: plan.sourceStartPage,
      sourceNextPage: plan.sourceNextPage,
      rawStream: plan.rawStream,
      rawSha256: rawReceipt.sha256,
      normalizedStream: plan.normalizedStream,
      sourceFingerprint: manifest.sourceFingerprint,
      entityCount: manifest.entityCount,
      conflictCount: manifest.conflictCount,
      normalizedAt: new Date().toISOString(),
    },
  };
}

async function main() {
  const planArg = argument('--plan');
  const manifestArg = argument('--manifest');
  const rawReceiptArg = argument('--raw-receipt');
  const outputArg = argument('--output');
  if (!planArg || !manifestArg || !rawReceiptArg || !outputArg) throw new Error('Missing required normalization finalizer arguments.');
  const plan = readJson(path.resolve(planArg));
  const manifest = readJson(path.resolve(manifestArg));
  const rawReceipt = readJson(path.resolve(rawReceiptArg));
  const progress = finalizeBaselineNormalization({ plan, manifest, rawReceipt });
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

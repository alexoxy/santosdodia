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

export function planBaselineNormalization({ sourceProgress, normalizedProgress = null, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix }) {
  if (!sourceProgress || sourceProgress.schemaVersion !== 1) throw new Error('Source acquisition progress is missing or invalid.');
  if (sourceProgress.baselineId !== 'saints-v1' || sourceProgress.sourceId !== 'wikidata') throw new Error('Source progress has the wrong baseline/source identity.');
  if (sourceProgress.queryVersion !== queryVersion) throw new Error(`Source progress query version ${sourceProgress.queryVersion ?? 'missing'} does not match ${queryVersion}.`);
  const sourceRun = sourceProgress.lastRun;
  if (!sourceRun || !Number.isInteger(sourceRun.startPage) || !Number.isInteger(sourceRun.nextPage) || !sourceRun.runId) {
    throw new Error('Source progress does not contain a complete lastRun watermark.');
  }
  if (sourceRun.queryVersion !== queryVersion) throw new Error('Source lastRun belongs to a different query epoch.');
  if (sourceRun.nextPage <= sourceRun.startPage) throw new Error('Source lastRun did not advance its watermark.');

  if (normalizedProgress) {
    if (normalizedProgress.schemaVersion !== 1 || normalizedProgress.baselineId !== 'saints-v1' || normalizedProgress.sourceId !== 'wikidata') {
      throw new Error('Normalization progress has the wrong identity/schema.');
    }
    if (normalizedProgress.queryVersion !== queryVersion) throw new Error('Normalization progress belongs to a different query epoch.');
    if (normalizedProgress.normalizationVersion !== normalizationVersion) throw new Error('Normalization progress belongs to a different normalizer version.');
    const previous = normalizedProgress.lastNormalized;
    if (previous && Number(previous.sourceStartPage) > sourceRun.startPage) {
      throw new Error('Normalization watermark is ahead of acquisition watermark.');
    }
    if (previous?.sourceRunId === sourceRun.runId && previous?.sourceStartPage === sourceRun.startPage) {
      return {
        schemaVersion: 1,
        baselineId: 'saints-v1',
        sourceId: 'wikidata',
        queryVersion,
        normalizationVersion,
        shouldRun: false,
        reason: 'latest-source-run-already-normalized',
        sourceRunId: sourceRun.runId,
        sourceStartPage: sourceRun.startPage,
        sourceNextPage: sourceRun.nextPage,
        sourceCompleted: sourceProgress.completed === true,
        rawStream: `${rawStreamPrefix}/${batchId(sourceRun.startPage)}`,
        normalizedStream: `${normalizedStreamPrefix}/${batchId(sourceRun.startPage)}`,
        previousProgress: normalizedProgress,
      };
    }
  }

  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion,
    normalizationVersion,
    shouldRun: true,
    reason: normalizedProgress ? 'new-source-run' : 'no-normalization-watermark',
    sourceRunId: sourceRun.runId,
    sourceStartPage: sourceRun.startPage,
    sourceNextPage: sourceRun.nextPage,
    sourceCompleted: sourceProgress.completed === true,
    rawStream: `${rawStreamPrefix}/${batchId(sourceRun.startPage)}`,
    normalizedStream: `${normalizedStreamPrefix}/${batchId(sourceRun.startPage)}`,
    previousProgress: normalizedProgress,
  };
}

async function main() {
  const sourceProgressPath = path.resolve(argument('--source-progress'));
  const normalizedProgressPath = argument('--normalized-progress');
  const queryVersion = argument('--query-version');
  const normalizationVersion = argument('--normalization-version');
  const rawStreamPrefix = argument('--raw-prefix');
  const normalizedStreamPrefix = argument('--normalized-prefix');
  if (!sourceProgressPath || !queryVersion || !normalizationVersion || !rawStreamPrefix || !normalizedStreamPrefix) {
    throw new Error('Missing required normalization planner arguments.');
  }
  const sourceProgress = readJson(sourceProgressPath);
  const normalizedProgress = normalizedProgressPath && fs.existsSync(path.resolve(normalizedProgressPath))
    ? readJson(path.resolve(normalizedProgressPath))
    : null;
  const plan = planBaselineNormalization({ sourceProgress, normalizedProgress, queryVersion, normalizationVersion, rawStreamPrefix, normalizedStreamPrefix });
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`Baseline normalization planning failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

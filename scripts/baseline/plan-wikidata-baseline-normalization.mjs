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
  const latest = sourceProgress.lastRun;
  if (!latest || !Number.isInteger(latest.startPage) || !Number.isInteger(latest.nextPage) || !latest.runId) {
    throw new Error('Source progress does not contain a complete lastRun watermark.');
  }
  if (latest.queryVersion !== queryVersion) throw new Error('Source lastRun belongs to a different query epoch.');
  if (latest.nextPage <= latest.startPage) throw new Error('Source lastRun did not advance its watermark.');
  if (!Number.isInteger(sourceProgress.nextPage) || sourceProgress.nextPage !== latest.nextPage) {
    throw new Error('Source acquisition watermark is internally inconsistent.');
  }

  let targetStartPage = 0;
  let previous = null;
  if (normalizedProgress) {
    if (normalizedProgress.schemaVersion !== 1 || normalizedProgress.baselineId !== 'saints-v1' || normalizedProgress.sourceId !== 'wikidata') {
      throw new Error('Normalization progress has the wrong identity/schema.');
    }
    if (normalizedProgress.queryVersion !== queryVersion) throw new Error('Normalization progress belongs to a different query epoch.');
    if (normalizedProgress.normalizationVersion !== normalizationVersion) throw new Error('Normalization progress belongs to a different normalizer version.');
    previous = normalizedProgress.lastNormalized ?? null;
    if (previous) {
      if (!Number.isInteger(previous.sourceStartPage) || !Number.isInteger(previous.sourceNextPage) || previous.sourceNextPage <= previous.sourceStartPage) {
        throw new Error('Normalization progress contains an invalid lastNormalized watermark.');
      }
      targetStartPage = previous.sourceNextPage;
    }
  }

  if (targetStartPage > sourceProgress.nextPage) throw new Error('Normalization watermark is ahead of acquisition watermark.');
  const caughtUp = targetStartPage === sourceProgress.nextPage;
  const rawStream = `${rawStreamPrefix}/${batchId(targetStartPage)}`;
  const normalizedStream = `${normalizedStreamPrefix}/${batchId(targetStartPage)}`;
  if (caughtUp) {
    return {
      schemaVersion: 1,
      baselineId: 'saints-v1',
      sourceId: 'wikidata',
      queryVersion,
      normalizationVersion,
      shouldRun: false,
      reason: 'normalization-caught-up',
      targetStartPage,
      acquisitionNextPage: sourceProgress.nextPage,
      sourceCompleted: sourceProgress.completed === true,
      expectedSourceRunId: null,
      rawStream,
      normalizedStream,
      previousProgress: normalizedProgress,
    };
  }

  const targetIsLatest = targetStartPage === latest.startPage;
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion,
    normalizationVersion,
    shouldRun: true,
    reason: previous ? (targetIsLatest ? 'normalize-latest-source-run' : 'drain-normalization-backlog') : 'start-normalization-at-page-zero',
    targetStartPage,
    acquisitionNextPage: sourceProgress.nextPage,
    sourceCompleted: sourceProgress.completed === true,
    expectedSourceRunId: targetIsLatest ? latest.runId : null,
    rawStream,
    normalizedStream,
    previousProgress: normalizedProgress,
  };
}

async function main() {
  const sourceProgressArg = argument('--source-progress');
  const normalizedProgressPath = argument('--normalized-progress');
  const queryVersion = argument('--query-version');
  const normalizationVersion = argument('--normalization-version');
  const rawStreamPrefix = argument('--raw-prefix');
  const normalizedStreamPrefix = argument('--normalized-prefix');
  if (!sourceProgressArg || !queryVersion || !normalizationVersion || !rawStreamPrefix || !normalizedStreamPrefix) {
    throw new Error('Missing required normalization planner arguments.');
  }
  const sourceProgress = readJson(path.resolve(sourceProgressArg));
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

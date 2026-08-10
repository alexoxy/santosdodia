#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function safeArchiveEntries(archive) {
  const listing = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' });
  return listing.split(/\r?\n/u).filter(Boolean).map((entry) => {
    if (entry.startsWith('/') || entry.split('/').includes('..')) throw new Error(`Unsafe archive entry: ${entry}`);
    return entry;
  });
}

function readProgressFromArchive(archive) {
  const entries = safeArchiveEntries(archive);
  const matches = entries.filter((entry) => entry === 'progress.json' || entry.endsWith('/progress.json'));
  if (matches.length !== 1) throw new Error(`Expected exactly one progress.json in archive, found ${matches.length}.`);
  return JSON.parse(execFileSync('tar', ['-xOzf', archive, matches[0]], { encoding: 'utf8' }));
}

const intake = path.resolve(argument('--intake', 'staging/baseline-progress-intake'));
const pagesPerRun = Number.parseInt(argument('--pages-per-run', '10'), 10);
if (!Number.isInteger(pagesPerRun) || pagesPerRun < 1 || pagesPerRun > 20) throw new Error('--pages-per-run must be 1..20.');

const receiptPath = path.join(intake, 'consumer-receipt.json');
if (!fs.existsSync(receiptPath)) throw new Error(`Missing Dropbox consumer receipt: ${receiptPath}`);
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

let progress = {
  schemaVersion: 1,
  baselineId: 'saints-v1',
  sourceId: 'wikidata',
  completed: false,
  nextPage: 0,
  cumulativeBindings: 0,
  successfulRuns: 0,
};

if (receipt.missing !== true) {
  if (receipt.verified !== true) throw new Error('Existing baseline progress stream is not verified.');
  progress = readProgressFromArchive(path.join(intake, 'package.tar.gz'));
}
if (progress.schemaVersion !== 1 || progress.baselineId !== 'saints-v1' || progress.sourceId !== 'wikidata') {
  throw new Error('Baseline progress has the wrong identity or schema.');
}
if (!Number.isInteger(progress.nextPage) || progress.nextPage < 0) throw new Error('Baseline progress nextPage is invalid.');

const plan = {
  schemaVersion: 1,
  baselineId: 'saints-v1',
  sourceId: 'wikidata',
  generatedAt: new Date().toISOString(),
  shouldRun: progress.completed !== true,
  reason: progress.completed === true ? 'source-exhausted' : receipt.missing === true ? 'first-run' : 'resume',
  startPage: progress.nextPage,
  pagesPerRun,
  previousProgress: progress,
};
process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);

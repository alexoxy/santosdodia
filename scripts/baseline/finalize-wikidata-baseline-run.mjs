#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function newestRun(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (!entries.length) throw new Error(`No run directory exists under ${root}.`);
  return path.join(root, entries.at(-1));
}

const planPath = path.resolve(argument('--plan', 'staging/saints-baseline-v1/wikidata-plan.json'));
const runsRoot = path.resolve(argument('--runs-root', 'staging/saints-baseline-v1/raw/wikidata'));
const output = path.resolve(argument('--output', 'staging/saints-baseline-v1/progress/progress.json'));
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
if (plan.shouldRun !== true) throw new Error('Cannot finalize a baseline plan that did not run.');

const runDirectory = newestRun(runsRoot);
const summary = JSON.parse(fs.readFileSync(path.join(runDirectory, 'summary.json'), 'utf8'));
if (summary.status !== 'fetched') throw new Error(`Baseline acquisition did not finish successfully: ${summary.status}.`);
if (summary.startPage !== plan.startPage) throw new Error(`Acquisition start page ${summary.startPage} does not match plan ${plan.startPage}.`);
if (!Number.isInteger(summary.nextPage) || summary.nextPage <= plan.startPage) throw new Error('Acquisition did not advance the page watermark.');

const previous = plan.previousProgress;
const progress = {
  schemaVersion: 1,
  baselineId: 'saints-v1',
  sourceId: 'wikidata',
  updatedAt: new Date().toISOString(),
  completed: summary.exhausted === true,
  nextPage: summary.nextPage,
  cumulativeBindings: Number(previous.cumulativeBindings ?? 0) + Number(summary.totalBindings ?? 0),
  successfulRuns: Number(previous.successfulRuns ?? 0) + 1,
  lastRun: {
    runId: summary.runId,
    startPage: summary.startPage,
    nextPage: summary.nextPage,
    pageSize: summary.pageSize,
    pageCount: summary.pages?.length ?? 0,
    totalBindings: summary.totalBindings,
    exhausted: summary.exhausted,
    finishedAt: summary.finishedAt,
  },
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ progress, runDirectory: path.relative(process.cwd(), runDirectory) }, null, 2)}\n`);

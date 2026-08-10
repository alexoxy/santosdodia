#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const planner = path.join(root, 'scripts/baseline/plan-wikidata-baseline-run.mjs');
const finalizer = path.join(root, 'scripts/baseline/finalize-wikidata-baseline-run.mjs');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-baseline-test-'));

function assert(condition, message) { if (!condition) throw new Error(message); }
function jsonCommand(script, args) {
  return JSON.parse(execFileSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' }));
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

try {
  const firstIntake = path.join(temporary, 'first-intake');
  writeJson(path.join(firstIntake, 'consumer-receipt.json'), {
    schemaVersion: 1,
    stream: 'baseline-progress/saints/v1/wikidata',
    verified: false,
    missing: true,
  });
  const first = jsonCommand(planner, ['--intake', firstIntake, '--pages-per-run', '10']);
  assert(first.shouldRun === true && first.startPage === 0 && first.reason === 'first-run', 'First baseline plan did not start at page 0.');

  const resumeRoot = path.join(temporary, 'resume-package-root');
  const progress = {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    completed: false,
    nextPage: 42,
    cumulativeBindings: 21000,
    successfulRuns: 5,
  };
  writeJson(path.join(resumeRoot, 'nested/progress.json'), progress);
  const archive = path.join(temporary, 'progress.tar.gz');
  execFileSync('tar', ['-czf', archive, '-C', resumeRoot, 'nested/progress.json']);
  const resumeIntake = path.join(temporary, 'resume-intake');
  fs.mkdirSync(resumeIntake, { recursive: true });
  fs.copyFileSync(archive, path.join(resumeIntake, 'package.tar.gz'));
  writeJson(path.join(resumeIntake, 'consumer-receipt.json'), {
    schemaVersion: 1,
    stream: 'baseline-progress/saints/v1/wikidata',
    verified: true,
    missing: false,
  });
  const resumed = jsonCommand(planner, ['--intake', resumeIntake, '--pages-per-run', '10']);
  assert(resumed.shouldRun === true && resumed.startPage === 42 && resumed.reason === 'resume', 'Baseline planner did not resume at verified nextPage.');

  progress.completed = true;
  writeJson(path.join(resumeRoot, 'nested/progress.json'), progress);
  execFileSync('tar', ['-czf', archive, '-C', resumeRoot, 'nested/progress.json']);
  fs.copyFileSync(archive, path.join(resumeIntake, 'package.tar.gz'));
  const completed = jsonCommand(planner, ['--intake', resumeIntake]);
  assert(completed.shouldRun === false && completed.reason === 'source-exhausted', 'Completed baseline source did not become no-op.');

  const planPath = path.join(temporary, 'plan.json');
  writeJson(planPath, {
    ...resumed,
    shouldRun: true,
    startPage: 42,
    previousProgress: { ...progress, completed: false },
  });
  const runsRoot = path.join(temporary, 'runs/wikidata');
  const runDirectory = path.join(runsRoot, '2026-08-10T00-00-00Z-test');
  writeJson(path.join(runDirectory, 'summary.json'), {
    status: 'fetched',
    runId: 'test-run',
    startPage: 42,
    nextPage: 45,
    pageSize: 500,
    totalBindings: 1200,
    exhausted: true,
    finishedAt: '2026-08-10T00:03:00Z',
    pages: [{ page: 42 }, { page: 43 }, { page: 44 }],
  });
  const output = path.join(temporary, 'final/progress.json');
  jsonCommand(finalizer, ['--plan', planPath, '--runs-root', runsRoot, '--output', output]);
  const finalized = JSON.parse(fs.readFileSync(output, 'utf8'));
  assert(finalized.completed === true && finalized.nextPage === 45, 'Finalizer did not persist exhausted nextPage.');
  assert(finalized.cumulativeBindings === 22200 && finalized.successfulRuns === 6, 'Finalizer cumulative counters are wrong.');

  console.log('Saints Baseline v1 resume/finalize tests passed.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

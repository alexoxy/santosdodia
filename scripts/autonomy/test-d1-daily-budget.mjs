#!/usr/bin/env node

import assert from 'node:assert/strict';
import { assertWeeklyD1Window, canonicalBudgetRuns, checkSharedD1DailyBudget, fetchWorkflowRuns } from './check-d1-daily-budget.mjs';
import { loadGuardrails } from '../cloudflare-free-guardrails.mjs';

const repository = 'alexoxy/santosdodia';
const workflows = ['autonomous-d1-importer.yml', 'import-saints-baseline-d1.yml'];
const policy = loadGuardrails();
const calls = [];
const fetchImpl = async (url) => {
  calls.push(url);
  const workflow = decodeURIComponent(url.match(/workflows\/([^/]+)\/runs/u)?.[1] ?? '');
  const payload = workflow === 'autonomous-d1-importer.yml'
    ? { workflow_runs: [{ id: 1, event: 'workflow_run', status: 'completed', conclusion: 'success', created_at: '2026-08-10T01:00:00Z' }] }
    : { workflow_runs: [{ id: 2, event: 'schedule', status: 'in_progress', conclusion: null, created_at: '2026-08-10T02:00:00Z' }] };
  return { ok: true, status: 200, json: async () => payload };
};

assert.deepEqual(assertWeeklyD1Window(new Date('2026-08-10T03:00:00Z'), policy), {
  weekday: 1,
  actual: 1,
  weeklyWindow: 'open',
});
assert.throws(
  () => assertWeeklyD1Window(new Date('2026-08-11T03:00:00Z'), policy),
  /weekly D1 window is closed/u,
);

const runs = await fetchWorkflowRuns({ repository, workflows, token: 'test', fetchImpl });
assert.equal(runs.length, 2);
assert.equal(calls.length, 2);
assert.ok(calls.every((url) => !url.includes('event=workflow_dispatch')), 'Budget lookup must count every workflow trigger type.');
assert.ok(calls.every((url) => url.includes('per_page=100')));

const canonical = canonicalBudgetRuns([
  { id: 2, status: 'in_progress', created_at: '2026-08-10T02:00:00Z', budgetWorkflow: 'a' },
  { id: '2', status: 'in_progress', created_at: '2026-08-10T02:00:01Z', budgetWorkflow: 'b' },
  { id: 3, status: 'completed', conclusion: 'success', created_at: '2026-08-10T01:00:00Z' },
], '2');
assert.deepEqual(canonical.map((run) => run.id), ['3'], 'Current run must be excluded regardless of numeric/string representation and duplicate workflow sightings.');

await assert.rejects(() => checkSharedD1DailyBudget({
  repository,
  workflows,
  currentRunId: '2',
  token: 'test',
  now: new Date('2026-08-10T03:00:00Z'),
  fetchImpl,
}), /budget is exhausted/u);

await assert.rejects(() => checkSharedD1DailyBudget({
  repository,
  workflows,
  currentRunId: '2',
  token: 'test',
  maximum: 20,
  now: new Date('2026-08-10T03:00:00Z'),
  fetchImpl,
}), /budget is exhausted/u, 'A workflow-local maximum must not raise the global Free-tier cap.');

const previousDayFetch = async (url) => ({
  ok: true,
  status: 200,
  json: async () => ({ workflow_runs: url.includes('autonomous-d1-importer')
    ? [{ id: 1, status: 'completed', conclusion: 'success', created_at: '2026-08-09T23:59:00Z' }]
    : [{ id: 2, status: 'in_progress', created_at: '2026-08-10T02:00:00Z' }] }),
});
const allowed = await checkSharedD1DailyBudget({
  repository,
  workflows,
  currentRunId: '2',
  token: 'test',
  maximum: 20,
  now: new Date('2026-08-10T03:00:00Z'),
  fetchImpl: previousDayFetch,
});
assert.equal(allowed.used, 0);
assert.equal(allowed.maximum, 1);
assert.equal(allowed.currentRunId, '2');
assert.equal(allowed.runsScanned, 2);
assert.equal(allowed.uniquePriorRunsScanned, 1, 'Only the previous-day prior run remains after current-run exclusion.');
assert.deepEqual(allowed.workflows, workflows);
assert.equal(allowed.configuredMaximum, 1);
assert.equal(allowed.requestedMaximum, 20);
assert.equal(allowed.effectiveMaximum, 1);
assert.equal(allowed.d1RemoteWeekdayUtc, 1);
assert.equal(allowed.policy, 'weekly-free-tier-d1-remote-operation-budget');

await assert.rejects(() => checkSharedD1DailyBudget({
  repository,
  workflows,
  currentRunId: '2',
  token: 'test',
  now: new Date('2026-08-11T03:00:00Z'),
  fetchImpl: previousDayFetch,
}), /weekly D1 window is closed/u);

await assert.rejects(() => checkSharedD1DailyBudget({
  repository,
  workflows,
  currentRunId: '2',
  token: 'test',
  maximum: 101,
  now: new Date('2026-08-10T03:00:00Z'),
  fetchImpl,
}), /between 1 and 100/u);

console.log('Shared autonomous D1 weekly Free-tier budget tests passed.');

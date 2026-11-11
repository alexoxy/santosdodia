#!/usr/bin/env node

import { assertDailyActionBudget, loadGuardrails } from '../cloudflare-free-guardrails.mjs';
import { pathToFileURL } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

export async function fetchWorkflowRuns({ repository, workflows, token, fetchImpl = fetch }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '')) throw new Error('A valid owner/repository is required.');
  if (!Array.isArray(workflows) || workflows.length < 1 || workflows.some((value) => !value)) throw new Error('At least one workflow is required.');
  if (!token) throw new Error('GitHub token is required.');
  const all = [];
  for (const workflow of [...new Set(workflows)]) {
    const url = `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=100`;
    const response = await fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`GitHub Actions D1 budget lookup failed for ${workflow} with HTTP ${response.status}.`);
    for (const run of payload.workflow_runs ?? []) all.push({ ...run, budgetWorkflow: workflow });
  }
  return all;
}

export function canonicalBudgetRuns(runs, currentRunId) {
  const current = currentRunId === null || currentRunId === undefined ? null : String(currentRunId);
  const unique = new Map();
  for (const run of Array.isArray(runs) ? runs : []) {
    if (run?.id === null || run?.id === undefined) continue;
    const id = String(run.id);
    if (current !== null && id === current) continue;
    const existing = unique.get(id);
    if (!existing) {
      unique.set(id, { ...run, id });
      continue;
    }
    const existingTime = Date.parse(existing.run_started_at ?? existing.created_at ?? '') || 0;
    const candidateTime = Date.parse(run.run_started_at ?? run.created_at ?? '') || 0;
    if (candidateTime > existingTime) unique.set(id, { ...run, id });
  }
  return [...unique.values()];
}

export function assertWeeklyD1Window(now = new Date(), policy = loadGuardrails()) {
  const weekday = Number(policy.autonomousLimits.d1RemoteWeekdayUtc);
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new Error('D1 weekly UTC weekday must be an integer from 0 to 6.');
  }
  const actual = now.getUTCDay();
  if (actual !== weekday) {
    throw new Error(`Cloudflare Free weekly D1 window is closed: today is UTC weekday ${actual}; allowed weekday is ${weekday}.`);
  }
  return { weekday, actual, weeklyWindow: 'open' };
}

export async function checkSharedD1DailyBudget({ repository, workflows, currentRunId, token, maximum = null, now = new Date(), fetchImpl = fetch, policy = loadGuardrails() }) {
  assertWeeklyD1Window(now, policy);

  const configuredMaximum = policy.autonomousLimits.d1RemoteOperationsPerUtcDay;
  const requestedMaximum = maximum === null || maximum === undefined ? configuredMaximum : Number(maximum);
  if (!Number.isSafeInteger(requestedMaximum) || requestedMaximum < 1 || requestedMaximum > 100) {
    throw new Error('D1 daily-operation maximum must be an integer between 1 and 100.');
  }

  // Workflow-specific settings may only tighten the global Free-tier budget.
  // They may never raise it. This prevents a workflow-local value such as 20
  // from bypassing the account-wide one-operation safety boundary.
  const effectiveMaximum = Math.min(configuredMaximum, requestedMaximum);
  const runs = await fetchWorkflowRuns({ repository, workflows, token, fetchImpl });
  const budgetRuns = canonicalBudgetRuns(runs, currentRunId);
  const budget = assertDailyActionBudget(budgetRuns, {
    currentRunId: null,
    maximum: effectiveMaximum,
    now,
  });
  return {
    ...budget,
    repository,
    currentRunId: currentRunId === null || currentRunId === undefined ? null : String(currentRunId),
    workflows: [...new Set(workflows)],
    runsScanned: runs.length,
    uniquePriorRunsScanned: budgetRuns.length,
    configuredMaximum,
    requestedMaximum,
    effectiveMaximum,
    d1RemoteWeekdayUtc: policy.autonomousLimits.d1RemoteWeekdayUtc,
    policy: 'weekly-free-tier-d1-remote-operation-budget',
  };
}

async function main() {
  const repository = argument('--repository');
  const workflows = String(argument('--workflows', '')).split(',').map((value) => value.trim()).filter(Boolean);
  const currentRunId = argument('--current-run-id');
  const maximumArg = argument('--maximum');
  const tokenName = argument('--token-env', 'GITHUB_TOKEN');
  const result = await checkSharedD1DailyBudget({
    repository,
    workflows,
    currentRunId,
    maximum: maximumArg === null ? null : Number(maximumArg),
    token: process.env[tokenName],
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

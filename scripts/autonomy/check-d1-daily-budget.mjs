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

export async function checkSharedD1DailyBudget({ repository, workflows, currentRunId, token, now = new Date(), fetchImpl = fetch, policy = loadGuardrails() }) {
  const runs = await fetchWorkflowRuns({ repository, workflows, token, fetchImpl });
  const budgetRuns = canonicalBudgetRuns(runs, currentRunId);
  const budget = assertDailyActionBudget(budgetRuns, {
    currentRunId: null,
    maximum: policy.autonomousLimits.d1RemoteOperationsPerUtcDay,
    now,
  });
  return {
    ...budget,
    repository,
    currentRunId: currentRunId === null || currentRunId === undefined ? null : String(currentRunId),
    workflows: [...new Set(workflows)],
    runsScanned: runs.length,
    uniquePriorRunsScanned: budgetRuns.length,
    policy: 'shared-autonomous-d1-remote-operation-budget',
  };
}

async function main() {
  const repository = argument('--repository');
  const workflows = String(argument('--workflows', '')).split(',').map((value) => value.trim()).filter(Boolean);
  const currentRunId = argument('--current-run-id');
  const tokenName = argument('--token-env', 'GITHUB_TOKEN');
  const result = await checkSharedD1DailyBudget({ repository, workflows, currentRunId, token: process.env[tokenName] });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

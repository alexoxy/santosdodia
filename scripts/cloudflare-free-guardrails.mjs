import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_POLICY_PATH = path.resolve(moduleDir, '../config/cloudflare-free-guardrails.json');
const REMOTE_DEPLOY_PATTERN = /\b(?:npx\s+)?(?:wrangler|opennextjs-cloudflare)\s+(?:deploy|versions\s+upload|r2\b)|npm\s+run\s+cloudflare:(?:deploy|upload)/i;
const DNS_WRITE_PATTERN = /\/zones\/[^/\s]+\/dns_records|dns_records\/|wrangler\s+dns/i;

function argument(name, argv = process.argv.slice(2)) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function integer(value, label) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error(`${label} must be a non-negative integer.`);
  return parsed;
}

function readJson(filePath) {
  if (!filePath) throw new Error('A JSON input path is required.');
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export function loadGuardrails(filePath = DEFAULT_POLICY_PATH) {
  const policy = readJson(filePath);
  if (policy.schemaVersion !== 1 || policy.plan !== 'workers-free' || policy.resetTimezone !== 'UTC') {
    throw new Error('Cloudflare Free guardrails policy identity is invalid.');
  }
  const official = policy.officialLimits ?? {};
  const autonomous = policy.autonomousLimits ?? {};
  const requiredOfficial = {
    workersRequestsPerDay: 100_000,
    workersCpuMsPerRequest: 10,
    d1RowsReadPerDay: 5_000_000,
    d1RowsWrittenPerDay: 100_000,
    d1StorageBytes: 5 * 1024 ** 3,
    r2StorageBytesMonth: 10 * 1024 ** 3,
    r2ClassAOperationsPerMonth: 1_000_000,
    r2ClassBOperationsPerMonth: 10_000_000,
    workersBuildMinutesPerMonth: 3_000
  };
  for (const [key, expected] of Object.entries(requiredOfficial)) {
    if (official[key] !== expected) throw new Error(`Official Cloudflare Free limit ${key} must equal ${expected}.`);
  }
  const requiredDisabled = [
    'r2WritesEnabled',
    'productionWritesEnabled',
    'dnsWritesEnabled',
    'secretsWritesEnabled',
    'paymentsEnabled'
  ];
  for (const key of requiredDisabled) {
    if (autonomous[key] !== false) throw new Error(`${key} must remain false.`);
  }
  if (autonomous.d1RemoteOperationsPerUtcDay !== 1) throw new Error('D1 remote staging operations must remain limited to one per UTC day.');
  if (autonomous.osintAcquisitionsPerUtcDay !== 1) throw new Error('OSINT acquisitions must remain limited to one per UTC day.');
  if (autonomous.cloudflareDeploymentsPerUtcDay !== 1) throw new Error('Cloudflare deployments must remain limited to one per UTC day.');
  if (autonomous.osintMaxRecordsPerAcquisition > 500) throw new Error('OSINT acquisition cap may not exceed 500 records.');
  if (autonomous.d1EstimatedRowsReadPerOperation > Math.floor(official.d1RowsReadPerDay * 0.2)) {
    throw new Error('D1 read cap exceeds 20% of the free daily allowance.');
  }
  if (autonomous.d1EstimatedRowsWrittenPerOperation > Math.floor(official.d1RowsWrittenPerDay * 0.25)) {
    throw new Error('D1 write cap exceeds 25% of the free daily allowance.');
  }
  return policy;
}

export function assertOsintRecordCount(count, policy = loadGuardrails()) {
  const records = integer(count, 'OSINT record count');
  const maximum = policy.autonomousLimits.osintMaxRecordsPerAcquisition;
  if (records > maximum) throw new Error(`OSINT acquisition has ${records} records; the autonomous maximum is ${maximum}.`);
  return { records, maximum };
}

function arrayLength(value) {
  return Array.isArray(value) ? value.length : 0;
}

export function estimateCalendarPackageUsage(value, policy = loadGuardrails()) {
  if (!value || typeof value !== 'object') throw new Error('Calendar package must be a JSON object.');
  const counts = {
    sources: arrayLength(value.sources),
    policies: arrayLength(value.policies),
    rules: arrayLength(value.rules),
    occurrences: arrayLength(value.occurrences),
    labels: arrayLength(value.labels),
    assertions: arrayLength(value.assertions ?? value.sourceAssertions)
  };
  const canonicalEvents = new Set();
  for (const item of [...(value.rules ?? []), ...(value.occurrences ?? [])]) {
    if (item?.canonicalEventId) canonicalEvents.add(item.canonicalEventId);
  }
  const logicalWrites =
    1 +
    counts.sources * 2 +
    canonicalEvents.size +
    counts.policies +
    counts.rules +
    counts.occurrences +
    counts.labels +
    counts.assertions;
  const estimatedRowsWritten = logicalWrites * 2;
  const estimatedRowsRead = Math.max(1_000, estimatedRowsWritten * 20);
  assertD1Estimate({ estimatedRowsRead, estimatedRowsWritten }, policy);
  return { counts, canonicalEvents: canonicalEvents.size, logicalWrites, estimatedRowsRead, estimatedRowsWritten };
}

export function estimateBatchUsage(value, policy = loadGuardrails()) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.statements)) {
    throw new Error('D1 batch package must contain a statements array.');
  }
  const statementCount = integer(value.statementCount, 'D1 statement count');
  if (statementCount !== value.statements.length) throw new Error('D1 statement count mismatch.');
  const maximum = policy.autonomousLimits.d1MaxStatementsPerBatch;
  if (statementCount > maximum) throw new Error(`D1 batch has ${statementCount} statements; the maximum is ${maximum}.`);
  const estimatedRowsWritten = statementCount * 2;
  const estimatedRowsRead = Math.max(1_000, statementCount * 40);
  assertD1Estimate({ estimatedRowsRead, estimatedRowsWritten }, policy);
  return { statementCount, estimatedRowsRead, estimatedRowsWritten };
}

export function assertD1Estimate(usage, policy = loadGuardrails()) {
  const rowsRead = integer(usage.estimatedRowsRead, 'Estimated D1 rows read');
  const rowsWritten = integer(usage.estimatedRowsWritten, 'Estimated D1 rows written');
  const limits = policy.autonomousLimits;
  if (rowsRead > limits.d1EstimatedRowsReadPerOperation) {
    throw new Error(`Estimated D1 rows read ${rowsRead} exceeds the autonomous cap ${limits.d1EstimatedRowsReadPerOperation}.`);
  }
  if (rowsWritten > limits.d1EstimatedRowsWrittenPerOperation) {
    throw new Error(`Estimated D1 rows written ${rowsWritten} exceeds the autonomous cap ${limits.d1EstimatedRowsWrittenPerOperation}.`);
  }
  return { rowsRead, rowsWritten };
}

export function summarizeD1Usage(values) {
  let rowsRead = 0;
  let rowsWritten = 0;
  let queryCount = 0;
  const visit = value => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (value.meta && typeof value.meta === 'object') {
      rowsRead += Number(value.meta.rows_read ?? 0);
      rowsWritten += Number(value.meta.rows_written ?? 0);
      queryCount += 1;
    }
    if (value.results && value.results !== value) visit(value.results);
    if (value.result && value.result !== value) visit(value.result);
  };
  visit(values);
  return { rowsRead, rowsWritten, queryCount };
}

export function assertActualD1Usage(usage, policy = loadGuardrails()) {
  const rowsRead = integer(usage.rowsRead, 'Actual D1 rows read');
  const rowsWritten = integer(usage.rowsWritten, 'Actual D1 rows written');
  return assertD1Estimate({ estimatedRowsRead: rowsRead, estimatedRowsWritten: rowsWritten }, policy);
}

function utcDayStart(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function relevantRunsToday(runs, { currentRunId, now = new Date() } = {}) {
  const start = utcDayStart(now);
  return (Array.isArray(runs) ? runs : []).filter(run => {
    if (String(run.id) === String(currentRunId)) return false;
    const timestamp = Date.parse(run.run_started_at ?? run.created_at ?? '');
    if (!Number.isFinite(timestamp) || timestamp < start) return false;
    if (run.status === 'queued' || run.status === 'in_progress' || run.status === 'waiting' || run.status === 'pending') return true;
    return run.status === 'completed' && !['cancelled', 'skipped'].includes(run.conclusion);
  });
}

export function assertDailyActionBudget(runs, { currentRunId, maximum = 1, now = new Date() } = {}) {
  const used = relevantRunsToday(runs, { currentRunId, now });
  if (used.length >= maximum) {
    throw new Error(`Cloudflare Free daily staging budget is exhausted: ${used.length}/${maximum} earlier run(s) counted for the current UTC day.`);
  }
  return { used: used.length, maximum, resetAt: new Date(utcDayStart(now) + 86_400_000).toISOString() };
}

function workflowFiles(root) {
  const directory = path.join(root, '.github/workflows');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(name => /\.ya?ml$/i.test(name))
    .map(name => path.join(directory, name));
}

export function auditRepository(root = process.cwd(), policy = loadGuardrails()) {
  const wranglerPath = path.join(root, 'wrangler.jsonc');
  if (!fs.existsSync(wranglerPath)) throw new Error('wrangler.jsonc is missing.');
  const wrangler = fs.readFileSync(wranglerPath, 'utf8');
  if (!/"preview_urls"\s*:\s*false/.test(wrangler)) throw new Error('Cloudflare preview URLs must remain disabled.');
  if (!/"observability"\s*:\s*\{[\s\S]*?"enabled"\s*:\s*true/.test(wrangler)) throw new Error('Cloudflare observability must remain enabled.');
  if (/"r2_buckets"\s*:/.test(wrangler) && policy.autonomousLimits.r2WritesEnabled !== true) {
    throw new Error('R2 bindings are forbidden while autonomous R2 writes are disabled.');
  }
  const files = workflowFiles(root);
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8');
    if (REMOTE_DEPLOY_PATTERN.test(source)) throw new Error(`Remote Cloudflare deployment command is forbidden in ${path.relative(root, filePath)}.`);
    if (DNS_WRITE_PATTERN.test(source)) throw new Error(`Cloudflare DNS write is forbidden in ${path.relative(root, filePath)}.`);
  }
  return {
    policy: policy.plan,
    workflowFilesChecked: files.length,
    productionWritesEnabled: policy.autonomousLimits.productionWritesEnabled,
    r2WritesEnabled: policy.autonomousLimits.r2WritesEnabled
  };
}

async function fetchWorkflowRuns({ repository, workflow, token, fetchImpl = fetch }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '')) throw new Error('A valid owner/repository is required.');
  if (!workflow || !token) throw new Error('Workflow name and GitHub token are required.');
  const url = `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/runs?event=workflow_dispatch&per_page=100`;
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GitHub Actions budget lookup failed with HTTP ${response.status}.`);
  return payload.workflow_runs ?? [];
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (!command) return;
  const policy = loadGuardrails(argument('--policy', argv) ?? DEFAULT_POLICY_PATH);

  if (command === 'audit') {
    console.log(JSON.stringify(auditRepository(argument('--root', argv) ?? process.cwd(), policy), null, 2));
    return;
  }
  if (command === 'osint-records') {
    console.log(JSON.stringify(assertOsintRecordCount(argument('--count', argv), policy), null, 2));
    return;
  }
  if (command === 'calendar-package') {
    console.log(JSON.stringify(estimateCalendarPackageUsage(readJson(argument('--input', argv)), policy), null, 2));
    return;
  }
  if (command === 'd1-batch') {
    console.log(JSON.stringify(estimateBatchUsage(readJson(argument('--input', argv)), policy), null, 2));
    return;
  }
  if (command === 'action-budget') {
    const tokenName = argument('--token-env', argv) ?? 'GITHUB_TOKEN';
    const runs = await fetchWorkflowRuns({
      repository: argument('--repository', argv),
      workflow: argument('--workflow', argv),
      token: process.env[tokenName]
    });
    console.log(JSON.stringify(assertDailyActionBudget(runs, {
      currentRunId: argument('--current-run-id', argv),
      maximum: policy.autonomousLimits.d1RemoteOperationsPerUtcDay
    }), null, 2));
    return;
  }
  throw new Error('Usage: cloudflare-free-guardrails.mjs audit|osint-records|calendar-package|d1-batch|action-budget [options]');
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

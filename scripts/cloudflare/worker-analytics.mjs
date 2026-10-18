#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_URL = 'https://api.cloudflare.com/client/v4/graphql';
const ROW_LIMIT = 1000;
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const INGESTION_LAG_MS = 5 * 60 * 1000;

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Required environment variable ${name} is missing.`);
  return value;
}

export function summarizeWorkerAnalytics({ workerName, observedAt, interval, records }) {
  if (!Array.isArray(records) || records.length === 0) throw new Error('Cloudflare returned no Worker analytics rows; current health cannot be confirmed.');
  const byStatus = {};
  let requests = 0;
  let errors = 0;
  let maxCpuTimeP50 = null;
  let maxCpuTimeP99 = null;

  for (const record of records) {
    const status = String(record?.dimensions?.status ?? 'unknown');
    const statusTotals = byStatus[status] ?? { requests: 0, errors: 0 };
    const rowRequests = Number(record?.sum?.requests ?? 0);
    const rowErrors = Number(record?.sum?.errors ?? 0);
    if (!Number.isFinite(rowRequests) || !Number.isFinite(rowErrors) || rowRequests < 0 || rowErrors < 0) {
      throw new Error(`Cloudflare returned invalid invocation totals for status ${status}.`);
    }
    statusTotals.requests += rowRequests;
    statusTotals.errors += rowErrors;
    byStatus[status] = statusTotals;
    requests += rowRequests;
    errors += rowErrors;

    for (const key of ['cpuTimeP50', 'cpuTimeP99']) {
      const value = record?.quantiles?.[key];
      if (value === null || value === undefined) continue;
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 0) throw new Error(`Cloudflare returned invalid ${key} value.`);
      maxCpuTimeP50 = key === 'cpuTimeP50' ? Math.max(maxCpuTimeP50 ?? 0, numeric) : maxCpuTimeP50;
      maxCpuTimeP99 = key === 'cpuTimeP99' ? Math.max(maxCpuTimeP99 ?? 0, numeric) : maxCpuTimeP99;
    }
  }

  const cpuLimitErrors = Object.entries(byStatus)
    .filter(([status]) => /exceeded.?cpu|cpu.?time.?limit/iu.test(status))
    .reduce((total, [, counts]) => total + counts.errors, 0);

  return {
    schemaVersion: 1,
    workerName,
    observedAt,
    interval,
    queryResultRows: records.length,
    requestCount: requests,
    errorCount: errors,
    cpuLimitErrorCount: cpuLimitErrors,
    maxCpuTimeP50,
    maxCpuTimeP99,
    statusTotals: byStatus,
    dataMayBeTruncated: records.length >= ROW_LIMIT,
    publicationMutation: false,
    cloudflareDeployment: false,
    d1Write: false,
  };
}

export function buildAnalyticsFailureReport({ workerName = 'santosdodia', observedAt = new Date().toISOString(), error, secret }) {
  let errorMessage = String(error?.message ?? error ?? 'Unknown Cloudflare analytics failure').replace(/[\r\n\t]+/gu, ' ').slice(0, 500);
  if (secret) errorMessage = errorMessage.split(secret).join('[redacted]');
  return {
    schemaVersion: 1,
    workerName,
    observedAt,
    analyticsAvailable: false,
    errorClass: String(error?.name ?? 'Error').slice(0, 80),
    errorMessage,
    requestCount: null,
    errorCount: null,
    cpuLimitErrorCount: null,
    metricsIncomplete: true,
    publicationMutation: false,
    cloudflareDeployment: false,
    d1Write: false,
  };
}

export async function fetchWorkerAnalytics({ accountId, apiToken, workerName = 'santosdodia', now = new Date(), fetchImpl = fetch }) {
  if (!accountId || !apiToken) throw new Error('Cloudflare account ID and API token are required.');
  const end = new Date(now.getTime() - INGESTION_LAG_MS);
  const start = new Date(end.getTime() - WINDOW_MS);
  const interval = { start: start.toISOString(), end: end.toISOString() };
  const query = `query GetWorkersAnalytics($accountTag: string, $datetimeStart: string, $datetimeEnd: string, $scriptName: string) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        workersInvocationsAdaptive(limit: ${ROW_LIMIT}, filter: {
          scriptName: $scriptName,
          datetime_geq: $datetimeStart,
          datetime_leq: $datetimeEnd
        }) {
          sum { requests errors }
          quantiles { cpuTimeP50 cpuTimeP99 }
          dimensions { scriptName status }
        }
      }
    }
  }`;
  const response = await fetchImpl(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: {
      accountTag: accountId,
      datetimeStart: interval.start,
      datetimeEnd: interval.end,
      scriptName: workerName,
    } }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Cloudflare analytics request failed with HTTP ${response.status}.`);
  const payload = await response.json();
  if (Array.isArray(payload.errors) && payload.errors.length) {
    const messages = payload.errors.map((item) => String(item.message ?? 'GraphQL error')).slice(0, 3).join('; ');
    throw new Error(`Cloudflare analytics query failed: ${messages}`);
  }
  if (payload.success === false) throw new Error('Cloudflare analytics API rejected the request.');
  const records = payload.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive;
  if (!Array.isArray(records)) throw new Error('Cloudflare analytics response did not contain Worker invocation rows.');
  return summarizeWorkerAnalytics({ workerName, observedAt: now.toISOString(), interval, records });
}

function writeOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, 'utf8');
}

async function main() {
  const output = path.resolve(process.argv[2] ?? 'reports/cloudflare/worker-cpu-7d.json');
  const result = await fetchWorkerAnalytics({
    accountId: requiredEnvironment('CLOUDFLARE_ACCOUNT_ID'),
    apiToken: requiredEnvironment('CLOUDFLARE_API_TOKEN'),
  });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  const incomplete = result.dataMayBeTruncated;
  const exceeded = result.cpuLimitErrorCount > 0;
  writeOutput('cpu_limit_exceeded', String(exceeded));
  writeOutput('metrics_incomplete', String(incomplete));
  console.log(JSON.stringify({
    workerName: result.workerName,
    interval: result.interval,
    requestCount: result.requestCount,
    errorCount: result.errorCount,
    cpuLimitErrorCount: result.cpuLimitErrorCount,
    maxCpuTimeP50: result.maxCpuTimeP50,
    maxCpuTimeP99: result.maxCpuTimeP99,
    dataMayBeTruncated: result.dataMayBeTruncated,
    reportPath: output,
  }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    const output = path.resolve(process.argv[2] ?? 'reports/cloudflare/worker-cpu-7d.json');
    const report = buildAnalyticsFailureReport({
      workerName: 'santosdodia',
      error,
      secret: process.env.CLOUDFLARE_API_TOKEN,
    });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeOutput('cpu_limit_exceeded', 'unknown');
    writeOutput('metrics_incomplete', 'true');
    console.error(`Cloudflare Worker analytics unavailable; safe diagnostic report written to ${output}.`);
  }
}

#!/usr/bin/env node

import assert from 'node:assert/strict';
import { fetchWorkerAnalytics, summarizeWorkerAnalytics } from './worker-analytics.mjs';

const summary = summarizeWorkerAnalytics({
  workerName: 'santosdodia',
  observedAt: '2026-10-18T09:00:00.000Z',
  interval: { start: '2026-10-17T08:55:00.000Z', end: '2026-10-18T08:55:00.000Z' },
  records: [
    { dimensions: { status: 'success' }, sum: { requests: 120, errors: 0 }, quantiles: { cpuTimeP50: 5, cpuTimeP99: 9 } },
    { dimensions: { status: 'exceededCpu' }, sum: { requests: 3, errors: 3 }, quantiles: { cpuTimeP50: 10, cpuTimeP99: 13 } },
  ],
});
assert.equal(summary.requestCount, 123);
assert.equal(summary.errorCount, 3);
assert.equal(summary.cpuLimitErrorCount, 3);
assert.equal(summary.maxCpuTimeP50, 10);
assert.equal(summary.maxCpuTimeP99, 13);
assert.equal(summary.cloudflareDeployment, false);
assert.equal(summary.d1Write, false);

let request;
const now = new Date('2026-10-18T10:00:00.000Z');
const live = await fetchWorkerAnalytics({
  accountId: 'account-test',
  apiToken: 'token-test',
  now,
  fetchImpl: async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      json: async () => ({ data: { viewer: { accounts: [{ workersInvocationsAdaptive: [
        { dimensions: { datetime: '2026-10-18T09:00:00.000Z', status: 'success' }, sum: { requests: 10, errors: 0 }, quantiles: { cpuTimeP50: 3, cpuTimeP99: 8 } },
      ] }] } } }),
    };
  },
});
assert.equal(request.url, 'https://api.cloudflare.com/client/v4/graphql');
assert.equal(request.options.method, 'POST');
assert.equal(request.options.headers.Authorization, 'Bearer token-test');
assert.equal(request.options.body.includes('santosdodia'), true);
assert.match(request.options.body, /dimensions\s*\{\s*scriptName\s+status\s*\}/u);
assert.doesNotMatch(request.options.body, /dimensions\s*\{[^}]*datetime/u);
assert.equal(live.requestCount, 10);
assert.equal(live.cpuLimitErrorCount, 0);
assert.equal(live.interval.end, '2026-10-18T09:55:00.000Z');
assert.equal(live.interval.start, '2026-10-11T09:55:00.000Z');

assert.throws(() => summarizeWorkerAnalytics({ records: [] }), /no Worker analytics rows/u);
await assert.rejects(
  fetchWorkerAnalytics({ accountId: 'account-test', apiToken: 'token-test', now, fetchImpl: async () => ({ ok: true, json: async () => ({ errors: [{ message: 'Analytics read permission required' }] }) }) }),
  /Analytics read permission required/u,
);

console.log('Cloudflare Worker analytics aggregation, CPU-limit status detection and 7-day query tests passed.');

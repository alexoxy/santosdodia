#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fetchPageWithRetry, parseRetryAfterMs, retryDelayMs, runWikidataAdapter } from './adapters/wikidata-saints.mjs';

function jsonResponse(status, body = { results: { bindings: [] } }, headers = {}) {
  return new Response(JSON.stringify(body), { status, statusText: status === 200 ? 'OK' : `HTTP ${status}`, headers: { 'content-type': 'application/json', ...headers } });
}

{
  const responses = [jsonResponse(504, { error: 'gateway' }), jsonResponse(200, { results: { bindings: [{ item: { value: 'Q1' } }] } })];
  const delays = [];
  const signals = [];
  let signalId = 0;
  const result = await fetchPageWithRetry({
    fetchImpl: async (_url, init) => { signals.push(init.signal); return responses.shift(); },
    sleepImpl: async (ms) => delays.push(ms),
    signalFactory: (timeoutMs) => ({ id: ++signalId, timeoutMs }),
    requestTimeoutMs: 90000,
    requestUrl: 'https://example.invalid/sparql',
    requestInit: {},
    maxAttempts: 4,
    retryBaseMs: 1000,
    retryMaximumMs: 10000,
    now: () => 0,
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.attempts.length, 2);
  assert.equal(result.attempts[0].httpStatus, 504);
  assert.equal(result.attempts[0].retryable, true);
  assert.equal(result.attempts[0].requestTimeoutMs, 90000);
  assert.deepEqual(delays, [1000]);
  assert.equal(signals.length, 2);
  assert.notStrictEqual(signals[0], signals[1], 'Every retry attempt must receive a fresh timeout signal.');
  assert.deepEqual(signals.map((signal) => signal.timeoutMs), [90000, 90000]);
}

{
  await assert.rejects(() => fetchPageWithRetry({
    fetchImpl: async () => jsonResponse(200),
    requestUrl: 'https://example.invalid/sparql',
    requestInit: { signal: { stale: true } },
    maxAttempts: 1,
  }), /fresh timeout signal/u, 'Retry helper must reject a caller-owned signal that could expire across attempts.');
}

{
  let calls = 0;
  const result = await fetchPageWithRetry({
    fetchImpl: async () => { calls += 1; return jsonResponse(404, { error: 'missing' }); },
    sleepImpl: async () => assert.fail('404 must not sleep/retry'),
    signalFactory: () => ({}),
    requestUrl: 'https://example.invalid/sparql',
    requestInit: {},
    maxAttempts: 4,
    now: () => 0,
  });
  assert.equal(calls, 1);
  assert.equal(result.response.status, 404);
  assert.equal(result.attempts.length, 1);
  assert.equal(result.attempts[0].retryable, false);
}

{
  let calls = 0;
  const delays = [];
  const result = await fetchPageWithRetry({
    fetchImpl: async () => { calls += 1; return jsonResponse(429, { error: 'rate' }, { 'retry-after': '3' }); },
    sleepImpl: async (ms) => delays.push(ms),
    signalFactory: () => ({}),
    requestUrl: 'https://example.invalid/sparql',
    requestInit: {},
    maxAttempts: 3,
    retryBaseMs: 1000,
    retryMaximumMs: 10000,
    now: () => 0,
  });
  assert.equal(calls, 3);
  assert.equal(result.response.status, 429);
  assert.deepEqual(delays, [3000, 3000]);
  assert.equal(result.attempts.length, 3);
}

{
  let calls = 0;
  const delays = [];
  const signals = [];
  await assert.rejects(() => fetchPageWithRetry({
    fetchImpl: async (_url, init) => { calls += 1; signals.push(init.signal); throw new TypeError('socket reset'); },
    sleepImpl: async (ms) => delays.push(ms),
    signalFactory: () => ({ id: calls + 1 }),
    requestUrl: 'https://example.invalid/sparql',
    requestInit: {},
    maxAttempts: 3,
    retryBaseMs: 1000,
    retryMaximumMs: 10000,
    now: () => 0,
  }), /after 3 attempts/u);
  assert.equal(calls, 3);
  assert.deepEqual(delays, [1000, 2000]);
  assert.equal(new Set(signals).size, 3, 'Network retries must also receive independent timeout signals.');
}

assert.equal(parseRetryAfterMs('5', 0), 5000);
assert.equal(retryDelayMs({ attempt: 3, retryAfter: null, baseMs: 1000, maximumMs: 2500, nowMs: 0 }), 2500);

{
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santos-wikidata-retry-'));
  try {
    let calls = 0;
    const delays = [];
    const signals = [];
    let signalId = 0;
    await assert.rejects(() => runWikidataAdapter({
      outputRoot: temporary,
      env: {
        OSINT_WIKIDATA_QUERY_VERSION: 'recognition-v1',
        OSINT_WIKIDATA_PAGE_SIZE: '50',
        OSINT_WIKIDATA_START_PAGE: '23',
        OSINT_WIKIDATA_MAX_PAGES: '1',
        OSINT_WIKIDATA_DELAY_MS: '1000',
        OSINT_WIKIDATA_REQUEST_TIMEOUT_MS: '30000',
        OSINT_WIKIDATA_RETRY_ATTEMPTS: '2',
        OSINT_WIKIDATA_RETRY_BASE_MS: '1000',
        OSINT_WIKIDATA_RETRY_MAX_MS: '2000',
      },
      fetchImpl: async (_url, init) => { calls += 1; signals.push(init.signal); return jsonResponse(504, { error: 'gateway' }); },
      sleepImpl: async (ms) => delays.push(ms),
      signalFactory: (timeoutMs) => ({ id: ++signalId, timeoutMs }),
      now: () => 0,
      uuid: () => '00000000-0000-0000-0000-000000000001',
    }), /HTTP 504 after 2 attempts/u);
    assert.equal(calls, 2);
    assert.deepEqual(delays, [1000]);
    assert.equal(new Set(signals).size, 2);
    assert.deepEqual(signals.map((signal) => signal.timeoutMs), [30000, 30000]);
    const sourceDir = path.join(temporary, 'wikidata');
    const run = fs.readdirSync(sourceDir)[0];
    const summary = JSON.parse(fs.readFileSync(path.join(sourceDir, run, 'summary.json'), 'utf8'));
    assert.equal(summary.status, 'failed');
    assert.equal(summary.startPage, 23);
    assert.equal(summary.nextPage, 23, 'Failed page must never advance the durable page cursor.');
    assert.equal(summary.pages.length, 1);
    assert.equal(summary.pages[0].attemptCount, 2);
    assert.equal(summary.pages[0].httpStatus, 504);
    assert.equal(summary.retryPolicy.freshTimeoutPerAttempt, true);
    assert.equal(summary.retryPolicy.requestTimeoutMs, 30000);
    assert.equal(summary.exhausted, false, 'HTTP failure must never be interpreted as source exhaustion.');
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

console.log('Wikidata bounded retry, fresh-timeout and fail-closed cursor tests passed.');

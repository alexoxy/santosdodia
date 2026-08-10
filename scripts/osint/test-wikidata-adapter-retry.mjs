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
  const result = await fetchPageWithRetry({
    fetchImpl: async () => responses.shift(),
    sleepImpl: async (ms) => delays.push(ms),
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
  assert.deepEqual(delays, [1000]);
}

{
  let calls = 0;
  const result = await fetchPageWithRetry({
    fetchImpl: async () => { calls += 1; return jsonResponse(404, { error: 'missing' }); },
    sleepImpl: async () => assert.fail('404 must not sleep/retry'),
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
  await assert.rejects(() => fetchPageWithRetry({
    fetchImpl: async () => { calls += 1; throw new TypeError('socket reset'); },
    sleepImpl: async (ms) => delays.push(ms),
    requestUrl: 'https://example.invalid/sparql',
    requestInit: {},
    maxAttempts: 3,
    retryBaseMs: 1000,
    retryMaximumMs: 10000,
    now: () => 0,
  }), /after 3 attempts/u);
  assert.equal(calls, 3);
  assert.deepEqual(delays, [1000, 2000]);
}

assert.equal(parseRetryAfterMs('5', 0), 5000);
assert.equal(retryDelayMs({ attempt: 3, retryAfter: null, baseMs: 1000, maximumMs: 2500, nowMs: 0 }), 2500);

{
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santos-wikidata-retry-'));
  try {
    let calls = 0;
    const delays = [];
    await assert.rejects(() => runWikidataAdapter({
      outputRoot: temporary,
      env: {
        OSINT_WIKIDATA_QUERY_VERSION: 'recognition-v1',
        OSINT_WIKIDATA_PAGE_SIZE: '50',
        OSINT_WIKIDATA_START_PAGE: '23',
        OSINT_WIKIDATA_MAX_PAGES: '1',
        OSINT_WIKIDATA_DELAY_MS: '1000',
        OSINT_WIKIDATA_RETRY_ATTEMPTS: '2',
        OSINT_WIKIDATA_RETRY_BASE_MS: '1000',
        OSINT_WIKIDATA_RETRY_MAX_MS: '2000',
      },
      fetchImpl: async () => { calls += 1; return jsonResponse(504, { error: 'gateway' }); },
      sleepImpl: async (ms) => delays.push(ms),
      now: () => 0,
      uuid: () => '00000000-0000-0000-0000-000000000001',
    }), /HTTP 504 after 2 attempts/u);
    assert.equal(calls, 2);
    assert.deepEqual(delays, [1000]);
    const sourceDir = path.join(temporary, 'wikidata');
    const run = fs.readdirSync(sourceDir)[0];
    const summary = JSON.parse(fs.readFileSync(path.join(sourceDir, run, 'summary.json'), 'utf8'));
    assert.equal(summary.status, 'failed');
    assert.equal(summary.startPage, 23);
    assert.equal(summary.nextPage, 23, 'Failed page must never advance the durable page cursor.');
    assert.equal(summary.pages.length, 1);
    assert.equal(summary.pages[0].attemptCount, 2);
    assert.equal(summary.pages[0].httpStatus, 504);
    assert.equal(summary.exhausted, false, 'HTTP failure must never be interpreted as source exhaustion.');
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

console.log('Wikidata bounded retry and fail-closed cursor tests passed.');

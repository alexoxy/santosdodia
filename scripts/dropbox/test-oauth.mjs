#!/usr/bin/env node

import assert from 'node:assert/strict';
import { refreshDropboxAccessToken } from './oauth.mjs';

function response(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

const credentials = { appKey: 'app-key', appSecret: 'app-secret', refreshToken: 'refresh-token' };

{
  const calls = [];
  const waits = [];
  const signals = [];
  const queue = [response(500, { error_description: 'temporary' }), response(200, { access_token: 'token-1' })];
  const token = await refreshDropboxAccessToken({
    ...credentials,
    fetchImpl: async (_url, init) => {
      calls.push(init);
      signals.push(init.signal);
      return queue.shift();
    },
    sleep: async (milliseconds) => waits.push(milliseconds),
    signalFactory: () => new AbortController().signal,
    baseDelayMs: 10,
    maxDelayMs: 100,
  });
  assert.equal(token, 'token-1');
  assert.equal(calls.length, 2);
  assert.deepEqual(waits, [10]);
  assert.notEqual(signals[0], signals[1], 'Every retry attempt must receive a fresh AbortSignal.');
}

{
  let calls = 0;
  const waits = [];
  const queue = [response(429, { error_description: 'rate_limited' }, { 'retry-after': '2' }), response(200, { access_token: 'token-2' })];
  const token = await refreshDropboxAccessToken({
    ...credentials,
    fetchImpl: async () => { calls += 1; return queue.shift(); },
    sleep: async (milliseconds) => waits.push(milliseconds),
    signalFactory: () => new AbortController().signal,
    maxDelayMs: 5_000,
  });
  assert.equal(token, 'token-2');
  assert.equal(calls, 2);
  assert.deepEqual(waits, [2_000]);
}

{
  let calls = 0;
  const token = await refreshDropboxAccessToken({
    ...credentials,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('temporary network failure');
      return response(200, { access_token: 'token-3' });
    },
    sleep: async () => {},
    signalFactory: () => new AbortController().signal,
  });
  assert.equal(token, 'token-3');
  assert.equal(calls, 2);
}

{
  let calls = 0;
  await assert.rejects(
    () => refreshDropboxAccessToken({
      ...credentials,
      fetchImpl: async () => { calls += 1; return response(400, { error_description: 'invalid_grant' }); },
      sleep: async () => {},
      signalFactory: () => new AbortController().signal,
    }),
    /HTTP 400: invalid_grant/u,
  );
  assert.equal(calls, 1, 'Non-transient OAuth failures must not be retried.');
}

{
  let calls = 0;
  await assert.rejects(
    () => refreshDropboxAccessToken({
      ...credentials,
      fetchImpl: async () => { calls += 1; return response(503, { error_description: 'unavailable' }); },
      sleep: async () => {},
      signalFactory: () => new AbortController().signal,
      maxAttempts: 3,
    }),
    /after 3 attempts/u,
  );
  assert.equal(calls, 3);
}

console.log('Dropbox OAuth transient retry tests passed.');

#!/usr/bin/env node

import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config/saints-baseline-wikidata.json', 'utf8'));
const adapter = fs.readFileSync('scripts/osint/adapters/wikidata-saints.mjs', 'utf8');
const errors = [];

if (config.queryVersion !== 'recognition-v1') errors.push('Retry contract must not change the active query epoch.');
if (config.adapterVersion !== '1.2') errors.push('Retry hardening must preserve the adapter data contract version.');
if (config.policy?.transientSourceFailuresRetryWithoutCursorAdvance !== true) errors.push('Retry-without-cursor-advance policy must be enabled.');
if (config.policy?.freshRequestTimeoutPerRetryAttempt !== true) errors.push('Every retry attempt must own a fresh request timeout.');
if (config.policy?.productionPublication !== false) errors.push('Retry hardening must not open production publication.');

for (const needle of [
  'fetchPageWithRetry',
  'isRetryableStatus',
  'parseRetryAfterMs',
  'retryDelayMs',
  "status === 429 || status >= 500",
  "summary.nextPage = page + 1",
  "if (!response.ok) throw new Error",
  "ORDER BY ?item ?recognitionStatus",
  "OSINT_WIKIDATA_RETRY_ATTEMPTS",
  "OSINT_WIKIDATA_REQUEST_TIMEOUT_MS",
  "signalFactory(requestTimeoutMs)",
  "freshTimeoutPerAttempt: true",
  "requestInit.signal must not be supplied",
]) {
  if (!adapter.includes(needle)) errors.push(`Wikidata adapter is missing retry/cursor/timeout contract: ${needle}`);
}
if (!adapter.includes("summary.exhausted = true")) errors.push('Wikidata adapter must retain explicit successful-source exhaustion semantics.');
if (adapter.indexOf("summary.nextPage = page + 1") < adapter.indexOf("if (!response.ok) throw new Error")) {
  errors.push('Wikidata page cursor must not advance before the HTTP success gate.');
}
if (!adapter.includes('maxAttempts: retryAttempts')) errors.push('Run summary must preserve the retry policy used.');
if (!adapter.includes('attemptCount: attempts.length')) errors.push('Page summary must preserve retry-attempt count.');
if (/requestInit:\s*\{[\s\S]{0,900}?signal:\s*AbortSignal\.timeout/u.test(adapter)) {
  errors.push('Caller-owned AbortSignal timeout would be reused across retry attempts.');
}

const report = {
  ok: errors.length === 0,
  errors,
  queryVersion: config.queryVersion,
  adapterContractVersion: config.adapterVersion,
  retryWithoutCursorAdvance: config.policy?.transientSourceFailuresRetryWithoutCursorAdvance === true,
  freshRequestTimeoutPerRetryAttempt: config.policy?.freshRequestTimeoutPerRetryAttempt === true,
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

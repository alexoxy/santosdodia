#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRetryableStatus, retryDelayMs } from './wikidata-saints.mjs';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

export function buildWikidataEntityRequest({ qids, languages }) {
  if (!Array.isArray(qids) || qids.length < 1 || qids.length > 50) throw new Error('Wikidata entity request requires 1-50 QIDs.');
  if (qids.some((qid) => !/^Q[1-9]\d*$/u.test(qid))) throw new Error('Wikidata entity request contains an invalid QID.');
  if (!Array.isArray(languages) || languages.length < 1) throw new Error('Wikidata entity request requires at least one language.');
  const body = new URLSearchParams({
    action: 'wbgetentities',
    format: 'json',
    formatversion: '2',
    props: 'labels|aliases',
    ids: qids.join('|'),
    languages: languages.join('|'),
    redirects: 'no',
  });
  if (body.has('languagefallbacks')) throw new Error('Wikidata language fallback must remain disabled.');
  return body;
}

function apiErrorIsRetryable(code) {
  return ['maxlag', 'ratelimited', 'readonly'].includes(code);
}

export async function fetchWikidataEntityBatch({
  endpoint,
  qids,
  languages,
  fetchImpl = globalThis.fetch,
  sleepImpl = sleep,
  signalFactory = (milliseconds) => AbortSignal.timeout(milliseconds),
  requestTimeoutMs = 60_000,
  maxAttempts = 4,
  retryBaseMs = 5_000,
  retryMaximumMs = 60_000,
  now = () => Date.now(),
} = {}) {
  if (!endpoint) throw new Error('Wikidata API endpoint is required.');
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 8) throw new Error('maxAttempts must be between 1 and 8.');
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = new Date(now()).toISOString();
    let response;
    let bytes;
    try {
      response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'user-agent': 'SantosDiaLabels/1.0 (+https://www.santosdodia.com/about)',
        },
        body: buildWikidataEntityRequest({ qids, languages }),
        signal: signalFactory(requestTimeoutMs),
      });
      bytes = Buffer.from(await response.arrayBuffer());
    } catch (error) {
      const record = {
        attempt,
        startedAt,
        finishedAt: new Date(now()).toISOString(),
        outcome: 'network-error',
        retryable: true,
        errorName: error?.name ?? 'Error',
        errorMessage: error instanceof Error ? error.message : String(error),
      };
      attempts.push(record);
      if (attempt >= maxAttempts) throw Object.assign(new Error(`Wikidata labels request failed after ${attempt} attempts: ${record.errorMessage}`), { attempts });
      const delay = retryDelayMs({ attempt, retryAfter: null, baseMs: retryBaseMs, maximumMs: retryMaximumMs, nowMs: now() });
      record.retryDelayMs = delay;
      await sleepImpl(delay);
      continue;
    }

    let value;
    try { value = JSON.parse(bytes.toString('utf8')); } catch { value = null; }
    const apiErrorCode = value?.error?.code ?? null;
    const retryable = isRetryableStatus(response.status) || (response.ok && apiErrorIsRetryable(apiErrorCode));
    const record = {
      attempt,
      startedAt,
      finishedAt: new Date(now()).toISOString(),
      outcome: response.ok && !apiErrorCode ? 'success' : apiErrorCode ? 'api-error' : 'http-error',
      httpStatus: response.status,
      apiErrorCode,
      retryable,
      retryAfter: response.headers?.get?.('retry-after') ?? null,
      byteSize: bytes.length,
    };
    attempts.push(record);
    if (response.ok && !apiErrorCode) return { response, bytes, value, attempts };
    if (!retryable || attempt >= maxAttempts) {
      const message = apiErrorCode ? `API ${apiErrorCode}` : `HTTP ${response.status}`;
      throw Object.assign(new Error(`Wikidata labels request failed (${message}) after ${attempt} attempt(s).`), { attempts });
    }
    const delay = retryDelayMs({ attempt, retryAfter: record.retryAfter, baseMs: retryBaseMs, maximumMs: retryMaximumMs, nowMs: now() });
    record.retryDelayMs = delay;
    await sleepImpl(delay);
  }
  throw new Error('Unreachable Wikidata labels retry state.');
}

function validateEntityResponse(value, requestedQids, allowedLanguages) {
  const entities = value?.entities;
  if (!entities || typeof entities !== 'object' || Array.isArray(entities)) throw new Error('Wikidata labels response has no entities object.');
  const allowed = new Set(allowedLanguages);
  const requested = new Set(requestedQids);
  const unexpectedIds = Object.keys(entities).filter((qid) => !requested.has(qid));
  if (unexpectedIds.length > 0) throw new Error(`Wikidata labels response contains unexpected entities: ${unexpectedIds.join(',')}`);
  const missingQids = [];
  const labelCounts = Object.fromEntries(allowedLanguages.map((language) => [language, 0]));
  const aliasCounts = Object.fromEntries(allowedLanguages.map((language) => [language, 0]));
  for (const qid of requestedQids) {
    const entity = entities[qid];
    if (!entity || entity.missing === true) { missingQids.push(qid); continue; }
    for (const [language, label] of Object.entries(entity.labels ?? {})) {
      if (!allowed.has(language)) throw new Error(`Wikidata labels response returned unrequested label language ${language}.`);
      if (label?.language !== language || typeof label?.value !== 'string') throw new Error(`Invalid Wikidata label payload for ${qid}/${language}.`);
      labelCounts[language] += 1;
    }
    for (const [language, aliases] of Object.entries(entity.aliases ?? {})) {
      if (!allowed.has(language)) throw new Error(`Wikidata labels response returned unrequested alias language ${language}.`);
      if (!Array.isArray(aliases)) throw new Error(`Invalid Wikidata alias payload for ${qid}/${language}.`);
      for (const alias of aliases) if (alias?.language !== language || typeof alias?.value !== 'string') throw new Error(`Invalid Wikidata alias entry for ${qid}/${language}.`);
      aliasCounts[language] += aliases.length;
    }
  }
  return { missingQids, labelCounts, aliasCounts };
}

export async function acquireWikidataMultilingualLabels({
  config,
  plan,
  outputDir,
  fetchImpl = globalThis.fetch,
  sleepImpl = sleep,
  signalFactory = (milliseconds) => AbortSignal.timeout(milliseconds),
  now = () => Date.now(),
  uuid = randomUUID,
} = {}) {
  if (!plan?.shouldRun || !Array.isArray(plan.selectedQids) || plan.selectedQids.length !== plan.entityCount) throw new Error('Wikidata labels acquisition requires an executable plan.');
  if (plan.identityRootSha256 !== config.identityRootSha256 || plan.acquisitionVersion !== config.acquisitionVersion) throw new Error('Wikidata labels plan/config corpus mismatch.');
  const languages = config.locales.map((locale) => locale.wikidataLanguage);
  if (new Set(languages).size !== languages.length) throw new Error('Wikidata label language mappings must be unique.');
  const output = path.resolve(outputDir);
  const responsesDir = path.join(output, 'responses');
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(responsesDir, { recursive: true });
  const startedAt = new Date(now()).toISOString();
  const runId = `${startedAt.replace(/[:.]/gu, '-')}-${uuid()}`;
  const requestSummaries = [];
  const aggregateLabels = Object.fromEntries(languages.map((language) => [language, 0]));
  const aggregateAliases = Object.fromEntries(languages.map((language) => [language, 0]));
  const allMissingQids = [];

  const qidChunks = [];
  for (let offset = 0; offset < plan.selectedQids.length; offset += config.apiBatchSize) qidChunks.push(plan.selectedQids.slice(offset, offset + config.apiBatchSize));
  if (qidChunks.length !== plan.expectedRequestCount) throw new Error('Wikidata label request count differs from plan.');

  for (let index = 0; index < qidChunks.length; index += 1) {
    const qids = qidChunks[index];
    const result = await fetchWikidataEntityBatch({
      endpoint: config.apiEndpoint,
      qids,
      languages,
      fetchImpl,
      sleepImpl,
      signalFactory,
      requestTimeoutMs: config.requestTimeoutMs,
      maxAttempts: config.maxAttempts,
      retryBaseMs: config.retryBaseMs,
      retryMaximumMs: config.retryMaximumMs,
      now,
    });
    const validation = validateEntityResponse(result.value, qids, languages);
    const filename = `request-${String(index).padStart(3, '0')}.json`;
    fs.writeFileSync(path.join(responsesDir, filename), result.bytes, { mode: 0o600 });
    for (const language of languages) {
      aggregateLabels[language] += validation.labelCounts[language];
      aggregateAliases[language] += validation.aliasCounts[language];
    }
    allMissingQids.push(...validation.missingQids);
    requestSummaries.push({
      index,
      filename,
      qids,
      qidCount: qids.length,
      responseSha256: sha256(result.bytes),
      responseBytes: result.bytes.length,
      missingQids: validation.missingQids,
      labelCounts: validation.labelCounts,
      aliasCounts: validation.aliasCounts,
      attempts: result.attempts,
    });
    if (index < qidChunks.length - 1) await sleepImpl(config.requestDelayMs);
  }

  const siteLocaleCounts = {};
  for (const locale of config.locales) {
    siteLocaleCounts[locale.siteLocale] = {
      wikidataLanguage: locale.wikidataLanguage,
      labelCount: aggregateLabels[locale.wikidataLanguage],
      aliasCount: aggregateAliases[locale.wikidataLanguage],
    };
  }
  const summary = {
    schemaVersion: 1,
    acquisitionVersion: config.acquisitionVersion,
    adapterVersion: config.adapterVersion,
    sourceId: 'wikidata',
    endpoint: config.apiEndpoint,
    licence: 'CC0-1.0',
    mode: 'archive-only',
    publish: false,
    sourceEvidenceOnly: true,
    languageFallbacksEnabled: false,
    automaticCanonicalNameSelection: false,
    identityRootSha256: config.identityRootSha256,
    runId,
    startedAt,
    finishedAt: new Date(now()).toISOString(),
    startEntityOffset: plan.startEntityOffset,
    nextEntityOffset: plan.nextEntityOffset,
    entityCount: plan.entityCount,
    requestCount: requestSummaries.length,
    apiBatchSize: config.apiBatchSize,
    requestDelayMs: config.requestDelayMs,
    languages: config.locales,
    missingQids: allMissingQids,
    missingQidCount: allMissingQids.length,
    siteLocaleCounts,
    requests: requestSummaries,
    status: 'fetched',
  };
  fs.writeFileSync(path.join(output, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  return summary;
}

async function main() {
  const configPath = argument('--config', 'config/saints-baseline-wikidata-labels.json');
  const planPath = argument('--plan');
  const outputDir = argument('--output');
  if (!planPath || !outputDir) throw new Error('--plan and --output are required.');
  const summary = await acquireWikidataMultilingualLabels({ config: readJson(configPath), plan: readJson(planPath), outputDir });
  process.stdout.write(`${JSON.stringify({ runId: summary.runId, entityCount: summary.entityCount, requestCount: summary.requestCount, missingQidCount: summary.missingQidCount, siteLocaleCounts: summary.siteLocaleCounts }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Wikidata multilingual label acquisition failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

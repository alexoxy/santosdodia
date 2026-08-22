#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }

export function buildEntityBody(qids, languages, wikipediaSites = []) {
  if (!Array.isArray(qids) || qids.length < 1 || qids.length > 50 || qids.some((qid) => !/^Q[1-9]\d*$/u.test(qid))) throw new Error('Label request requires 1-50 exact QIDs.');
  if (!Array.isArray(languages) || !languages.length) throw new Error('Label request requires languages.');
  if (!Array.isArray(wikipediaSites) || wikipediaSites.some((site) => !/^[a-z-]+wiki$/u.test(site))) throw new Error('Wikipedia site filters are invalid.');
  const props = wikipediaSites.length ? 'labels|aliases|sitelinks' : 'labels|aliases';
  const values = { action: 'wbgetentities', format: 'json', formatversion: '2', props, ids: qids.join('|'), languages: languages.join('|'), redirects: 'no' };
  if (wikipediaSites.length) values.sitefilter = wikipediaSites.join('|');
  const body = new URLSearchParams(values);
  if (body.has('languagefallbacks')) throw new Error('Language fallbacks must remain disabled.');
  return body;
}

function scriptStatus(value, expectedScript) {
  const text = String(value ?? '').normalize('NFC');
  const cyrillic = /[\u0400-\u052f]/u.test(text);
  const greek = /[\u0370-\u03ff\u1f00-\u1fff]/u.test(text);
  const other = /[\u0530-\u058f\u0600-\u074f\u1200-\u137f\u2c80-\u2cff]/u.test(text);
  const latin = /[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]/u.test(text);
  if (expectedScript === 'Cyrl') return cyrillic && !greek && !other && !latin ? 'expected' : 'unexpected';
  return !cyrillic && !greek && !other ? 'expected' : 'unexpected';
}

async function requestBatch(config, qids) {
  let lastError;
  const languages = config.locales.map((item) => item.wikidataLanguage);
  const wikipediaSites = config.enrichmentId === 'saints-labels-v3' ? config.locales.map((item) => item.wikipediaSite) : [];
  const attempts = [];
  for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
    const startedAt = new Date().toISOString();
    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'SantosDoDia-Labels/3.0 (+https://www.santosdodia.com)' },
        body: buildEntityBody(qids, languages, wikipediaSites),
        signal: AbortSignal.timeout(config.requestTimeoutMs)
      });
      const text = await response.text();
      let value = null; try { value = JSON.parse(text); } catch {}
      const apiCode = value?.error?.code ?? null;
      const retryable = [429, 502, 503, 504].includes(response.status) || ['maxlag', 'ratelimited', 'readonly'].includes(apiCode);
      attempts.push({ attempt, startedAt, finishedAt: new Date().toISOString(), outcome: response.ok && !apiCode ? 'success' : 'error', httpStatus: response.status, apiCode, retryable });
      if (response.ok && !apiCode) return { text, value, attempts };
      lastError = new Error(apiCode ? `API ${apiCode}` : `HTTP ${response.status}`);
      if (!retryable || attempt === config.maxAttempts) break;
      const retryAfter = Number(response.headers.get('retry-after'));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 60_000) : Math.min(2000 * 2 ** (attempt - 1), 30_000));
    } catch (error) {
      lastError = error;
      attempts.push({ attempt, startedAt, finishedAt: new Date().toISOString(), outcome: 'network-error', retryable: true, message: error instanceof Error ? error.message : String(error) });
      if (attempt === config.maxAttempts) break;
      await sleep(Math.min(2000 * 2 ** (attempt - 1), 30_000));
    }
  }
  throw Object.assign(lastError instanceof Error ? lastError : new Error('Wikidata labels request failed.'), { attempts });
}

export function normalizeLabelResponses({ config, plan, requests }) {
  const localeByLanguage = new Map(config.locales.map((item) => [item.wikidataLanguage, item]));
  const localeBySite = new Map(config.locales.filter((item) => item.wikipediaSite).map((item) => [item.wikipediaSite, item]));
  const requested = new Set(plan.selectedQids);
  const byQid = new Map(plan.selectedQids.map((qid) => [qid, { entityId: `wikidata:${qid}`, qid, identityBasis: 'exact-wikidata-identifier', labels: {}, aliases: {}, sitelinks: {}, publish: false }]));
  const missingQids = new Set();
  for (const request of requests) {
    const entities = request.value?.entities;
    if (!entities || typeof entities !== 'object' || Array.isArray(entities)) throw new Error('Wikidata labels response is missing entities.');
    for (const [qid, entity] of Object.entries(entities)) {
      if (!requested.has(qid)) throw new Error(`Unexpected Wikidata entity ${qid}.`);
      if (entity?.missing === true) { missingQids.add(qid); continue; }
      const target = byQid.get(qid);
      for (const [language, label] of Object.entries(entity?.labels ?? {})) {
        const locale = localeByLanguage.get(language); if (!locale) throw new Error(`Unrequested label language ${language}.`);
        const value = String(label?.value ?? '').normalize('NFC').trim(); if (!value) continue;
        target.labels[locale.siteLocale] = { value, status: 'source', sourceKind: 'wikidata-label', sourceLocale: locale.siteLocale, wikidataLanguage: language, scriptStatus: scriptStatus(value, locale.expectedScript) };
      }
      for (const [language, aliases] of Object.entries(entity?.aliases ?? {})) {
        const locale = localeByLanguage.get(language); if (!locale) throw new Error(`Unrequested alias language ${language}.`);
        target.aliases[locale.siteLocale] = [...new Set((aliases ?? []).map((alias) => String(alias?.value ?? '').normalize('NFC').trim()).filter(Boolean))].map((value) => ({ value, status: 'source', sourceKind: 'wikidata-alias', wikidataLanguage: language, scriptStatus: scriptStatus(value, locale.expectedScript) }));
      }
      for (const [site, sitelink] of Object.entries(entity?.sitelinks ?? {})) {
        const locale = localeBySite.get(site); if (!locale) throw new Error(`Unrequested Wikipedia sitelink ${site}.`);
        const title = String(sitelink?.title ?? '').normalize('NFC').trim(); if (!title) continue;
        target.sitelinks[locale.siteLocale] = { value: title, status: 'source', sourceKind: 'wikipedia-sitelink-title', wikipediaSite: site, scriptStatus: scriptStatus(title, locale.expectedScript) };
      }
    }
  }
  return {
    schemaVersion: 1,
    enrichmentId: config.enrichmentId,
    sourceId: config.sourceId,
    identityRootSha256: plan.identityRootSha256,
    startEntityOffset: plan.startEntityOffset,
    nextEntityOffset: plan.nextEntityOffset,
    entityCount: plan.entityCount,
    missingQids: [...missingQids].sort(),
    languageFallbacksEnabled: false,
    translationEnabled: false,
    sitelinkTitleEvidenceEnabled: config.enrichmentId === 'saints-labels-v3',
    automaticCanonicalNameSelection: false,
    sourceEvidenceOnly: true,
    publish: false,
    productionMutation: false,
    entities: plan.selectedQids.map((qid) => byQid.get(qid))
  };
}

export async function fetchWikidataLabelChunk({ config, plan, rawOutput, normalizedOutput }) {
  if (!plan?.shouldRun || plan?.completed || plan?.enrichmentId !== config.enrichmentId || plan?.identityRootSha256?.length !== 64) throw new Error('Labels plan is not runnable.');
  const requests = [];
  for (let offset = 0; offset < plan.selectedQids.length; offset += config.apiBatchSize) {
    const qids = plan.selectedQids.slice(offset, offset + config.apiBatchSize);
    const result = await requestBatch(config, qids);
    requests.push({ index: requests.length, qids, responseSha256: sha256(result.text), responseBytes: Buffer.byteLength(result.text), attempts: result.attempts, value: result.value });
    if (offset + config.apiBatchSize < plan.selectedQids.length) await sleep(config.requestDelayMs);
  }
  if (requests.length !== plan.expectedRequestCount) throw new Error('Labels request count differs from plan.');
  const normalized = normalizeLabelResponses({ config, plan, requests });
  const raw = { schemaVersion: 1, enrichmentId: config.enrichmentId, sourceId: config.sourceId, identityRootSha256: plan.identityRootSha256, mode: 'archive-only', publish: false, productionMutation: false, startEntityOffset: plan.startEntityOffset, nextEntityOffset: plan.nextEntityOffset, entityCount: plan.entityCount, selectedQids: plan.selectedQids, requestCount: requests.length, requests, finishedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(path.resolve(rawOutput)), { recursive: true }); fs.mkdirSync(path.dirname(path.resolve(normalizedOutput)), { recursive: true });
  fs.writeFileSync(path.resolve(rawOutput), `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve(normalizedOutput), `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return { raw, normalized };
}

async function main() {
  const planPath = argument('--plan'); const rawOutput = argument('--raw-output'); const normalizedOutput = argument('--normalized-output');
  if (!planPath || !rawOutput || !normalizedOutput) throw new Error('--plan, --raw-output and --normalized-output are required.');
  const result = await fetchWikidataLabelChunk({ config: readJson(argument('--config', 'config/saints-label-enrichment-v2.json')), plan: readJson(planPath), rawOutput, normalizedOutput });
  process.stdout.write(`${JSON.stringify({ entityCount: result.normalized.entityCount, requestCount: result.raw.requestCount, missingQidCount: result.normalized.missingQids.length, productionMutation: false }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { main().catch((error) => { console.error(error); process.exit(1); }); }

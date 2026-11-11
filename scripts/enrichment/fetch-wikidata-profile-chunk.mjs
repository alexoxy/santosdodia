#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProfileQuery, normalizeProfileBindings } from './wikidata-profile-core.mjs';

const ENDPOINT = 'https://query.wikidata.org/sparql';
const MAX_ATTEMPTS = 4;
const TIMEOUT_MS = 45_000;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

async function fetchSparql(query) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const startedAt = new Date().toISOString();
    try {
      const body = new URLSearchParams({ query });
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/sparql-results+json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'SantosDoDia-ProfileEnrichment/1.0 (+https://www.santosdodia.com)'
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (response.ok) {
        const text = await response.text();
        return { text, attempts: [{ attempt, startedAt, finishedAt: new Date().toISOString(), outcome: 'success', status: response.status }] };
      }
      const error = new Error(`HTTP ${response.status} ${response.statusText}`);
      lastError = error;
      if (![429, 502, 503, 504].includes(response.status) || attempt === MAX_ATTEMPTS) throw error;
      const retryAfter = Number(response.headers.get('retry-after'));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 60_000) : Math.min(1500 * 2 ** (attempt - 1), 20_000));
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) break;
      const message = error instanceof Error ? error.message : String(error);
      if (!/timeout|fetch failed|aborted|HTTP 429|HTTP 502|HTTP 503|HTTP 504/iu.test(message)) throw error;
      await sleep(Math.min(1500 * 2 ** (attempt - 1), 20_000));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function fetchWikidataProfileChunk({ plan, rawOutput, normalizedOutput }) {
  if (plan?.schemaVersion !== 1 || plan?.enrichmentId !== 'saints-profile-v1' || plan?.sourceId !== 'wikidata') throw new Error('Profile plan has the wrong identity/schema.');
  if (!plan.shouldRun || plan.completed || !Array.isArray(plan.selectedQids) || plan.selectedQids.length !== plan.entityCount) throw new Error('Profile plan is not runnable.');
  if (plan.expectedQueryCount !== 1) throw new Error('Profile run must contain exactly one query.');
  const query = buildProfileQuery(plan.selectedQids);
  const startedAt = new Date().toISOString();
  const { text, attempts } = await fetchSparql(query);
  let response;
  try { response = JSON.parse(text); } catch (error) { throw new Error(`Wikidata returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`); }
  const normalized = normalizeProfileBindings(response, plan.selectedQids);
  const finishedAt = new Date().toISOString();
  const raw = {
    schemaVersion: 1,
    enrichmentId: plan.enrichmentId,
    sourceId: plan.sourceId,
    endpoint: ENDPOINT,
    mode: 'archive-only',
    publish: false,
    productionMutation: false,
    identityRootSha256: plan.identityRootSha256,
    startEntityOffset: plan.startEntityOffset,
    nextEntityOffset: plan.nextEntityOffset,
    entityCount: plan.entityCount,
    selectedQids: plan.selectedQids,
    querySha256: sha256(query),
    responseSha256: sha256(text),
    responseBytes: Buffer.byteLength(text),
    startedAt,
    finishedAt,
    attempts,
    response
  };
  const normalizedPackage = {
    ...normalized,
    identityRootSha256: plan.identityRootSha256,
    startEntityOffset: plan.startEntityOffset,
    nextEntityOffset: plan.nextEntityOffset,
    rawResponseSha256: raw.responseSha256,
    sourceRetrievedAt: finishedAt,
    publish: false
  };
  fs.mkdirSync(path.dirname(path.resolve(rawOutput)), { recursive: true });
  fs.mkdirSync(path.dirname(path.resolve(normalizedOutput)), { recursive: true });
  fs.writeFileSync(path.resolve(rawOutput), `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve(normalizedOutput), `${JSON.stringify(normalizedPackage, null, 2)}\n`, 'utf8');
  return { raw, normalized: normalizedPackage };
}

async function main() {
  const planPath = argument('--plan');
  const rawOutput = argument('--raw-output');
  const normalizedOutput = argument('--normalized-output');
  if (!planPath || !rawOutput || !normalizedOutput) throw new Error('--plan, --raw-output and --normalized-output are required.');
  const result = await fetchWikidataProfileChunk({ plan: readJson(planPath), rawOutput, normalizedOutput });
  process.stdout.write(`${JSON.stringify({ entityCount: result.raw.entityCount, startEntityOffset: result.raw.startEntityOffset, nextEntityOffset: result.raw.nextEntityOffset, responseBytes: result.raw.responseBytes, productionMutation: false }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Wikidata profile fetch failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

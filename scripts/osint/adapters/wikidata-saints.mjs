#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const endpoint = 'https://query.wikidata.org/sparql';

export function buildQuery(limit, offset) {
  return `PREFIX bd: <http://www.bigdata.com/rdf#>\nPREFIX schema: <http://schema.org/>\nPREFIX wd: <http://www.wikidata.org/entity/>\nPREFIX wdt: <http://www.wikidata.org/prop/direct/>\nPREFIX wikibase: <http://wikiba.se/ontology#>\nSELECT DISTINCT ?item ?itemLabel ?itemDescription ?recognitionStatus ?recognitionStatusLabel ?birth ?death ?image ?article WHERE {\n  { ?item wdt:P411 ?recognitionStatus. } UNION { ?item wdt:P31 wd:Q43115. BIND(wd:Q43115 AS ?recognitionStatus) }\n  OPTIONAL { ?item wdt:P569 ?birth. }\n  OPTIONAL { ?item wdt:P570 ?death. }\n  OPTIONAL { ?item wdt:P18 ?image. }\n  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://pt.wikipedia.org/>. }\n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"pt,en,es,it,fr,de,pl,ru,uk,el,la\". }\n}\nORDER BY ?item ?recognitionStatus\nLIMIT ${limit}\nOFFSET ${offset}`;
}

export function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

export function parseRetryAfterMs(value, nowMs = Date.now()) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const seconds = Number(value.trim());
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, timestamp - nowMs);
}

export function retryDelayMs({ attempt, retryAfter, baseMs = 5000, maximumMs = 60000, nowMs = Date.now() }) {
  const headerDelay = parseRetryAfterMs(retryAfter, nowMs);
  if (headerDelay !== null) return Math.min(maximumMs, headerDelay);
  return Math.min(maximumMs, baseMs * (2 ** Math.max(0, attempt - 1)));
}

export async function fetchPageWithRetry({
  fetchImpl = fetch,
  sleepImpl = sleep,
  requestUrl = endpoint,
  requestInit,
  requestTimeoutMs = 90000,
  signalFactory = (timeoutMs) => AbortSignal.timeout(timeoutMs),
  maxAttempts = 4,
  retryBaseMs = 5000,
  retryMaximumMs = 60000,
  now = () => Date.now(),
}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('maxAttempts must be at least 1.');
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1000) throw new Error('requestTimeoutMs must be at least 1000ms.');
  if (requestInit?.signal) throw new Error('requestInit.signal must not be supplied; the retry helper owns a fresh timeout signal per attempt.');
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = new Date(now()).toISOString();
    const signal = signalFactory(requestTimeoutMs);
    try {
      const response = await fetchImpl(requestUrl, { ...requestInit, signal });
      const bytes = Buffer.from(await response.arrayBuffer());
      const finishedAt = new Date(now()).toISOString();
      const retryable = !response.ok && isRetryableStatus(response.status);
      const record = {
        attempt,
        startedAt,
        finishedAt,
        outcome: response.ok ? 'success' : 'http-error',
        httpStatus: response.status,
        retryable,
        retryAfter: response.headers?.get?.('retry-after') ?? null,
        byteSize: bytes.length,
        requestTimeoutMs,
      };
      attempts.push(record);
      if (response.ok || !retryable || attempt === maxAttempts) return { response, bytes, attempts };
      const delay = retryDelayMs({ attempt, retryAfter: record.retryAfter, baseMs: retryBaseMs, maximumMs: retryMaximumMs, nowMs: now() });
      record.retryDelayMs = delay;
      await sleepImpl(delay);
    } catch (error) {
      const finishedAt = new Date(now()).toISOString();
      const record = {
        attempt,
        startedAt,
        finishedAt,
        outcome: 'network-error',
        errorName: error?.name ?? 'Error',
        errorMessage: error instanceof Error ? error.message : String(error),
        retryable: true,
        requestTimeoutMs,
      };
      attempts.push(record);
      if (attempt === maxAttempts) {
        const finalError = new Error(`Wikidata request failed after ${maxAttempts} attempts: ${record.errorMessage}`);
        finalError.cause = error;
        finalError.attempts = attempts;
        throw finalError;
      }
      const delay = retryDelayMs({ attempt, retryAfter: null, baseMs: retryBaseMs, maximumMs: retryMaximumMs, nowMs: now() });
      record.retryDelayMs = delay;
      await sleepImpl(delay);
    }
  }
  throw new Error('Unreachable Wikidata retry state.');
}

export async function runWikidataAdapter({
  sourceId = 'wikidata',
  outputRoot = 'data/osint/runs',
  env = process.env,
  fetchImpl = fetch,
  sleepImpl = sleep,
  now = () => Date.now(),
  uuid = randomUUID,
  signalFactory = (timeoutMs) => AbortSignal.timeout(timeoutMs),
} = {}) {
  const queryVersion = env.OSINT_WIKIDATA_QUERY_VERSION || 'recognition-v1';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(queryVersion)) throw new Error('Invalid OSINT_WIKIDATA_QUERY_VERSION.');
  const pageSize = boundedInteger(env.OSINT_WIKIDATA_PAGE_SIZE, 500, 50, 1000);
  const startPage = boundedInteger(env.OSINT_WIKIDATA_START_PAGE, 0, 0, 1000000);
  const maxPages = boundedInteger(env.OSINT_WIKIDATA_MAX_PAGES, 1, 1, 200);
  const delayMs = boundedInteger(env.OSINT_WIKIDATA_DELAY_MS, 10000, 1000, 60000);
  const requestTimeoutMs = boundedInteger(env.OSINT_WIKIDATA_REQUEST_TIMEOUT_MS, 90000, 30000, 180000);
  const retryAttempts = boundedInteger(env.OSINT_WIKIDATA_RETRY_ATTEMPTS, 4, 1, 6);
  const retryBaseMs = boundedInteger(env.OSINT_WIKIDATA_RETRY_BASE_MS, 5000, 1000, 30000);
  const retryMaximumMs = boundedInteger(env.OSINT_WIKIDATA_RETRY_MAX_MS, 60000, 1000, 120000);
  const startedAt = new Date(now()).toISOString();
  const runId = `${startedAt.replace(/[:.]/g, '-')}-${uuid()}`;
  const runDir = join(outputRoot, sourceId, runId);
  await mkdir(runDir, { recursive: true });

  const summary = {
    adapterVersion: '1.3',
    queryVersion,
    runId,
    sourceId,
    endpoint,
    mode: 'archive-only',
    publish: false,
    licence: 'CC0-1.0',
    candidateSemantics: 'high-recall-religious-recognition-not-canonical-sainthood',
    startedAt,
    finishedAt: startedAt,
    pageSize,
    startPage,
    maxPages,
    retryPolicy: {
      maxAttempts: retryAttempts,
      requestTimeoutMs,
      freshTimeoutPerAttempt: true,
      baseDelayMs: retryBaseMs,
      maximumDelayMs: retryMaximumMs,
      statuses: ['429', '5xx'],
      networkErrors: true,
    },
    pages: [],
    totalBindings: 0,
    exhausted: false,
    nextPage: startPage,
    status: 'running',
  };

  try {
    for (let localPage = 0; localPage < maxPages; localPage += 1) {
      const page = startPage + localPage;
      const offset = page * pageSize;
      const query = buildQuery(pageSize, offset);
      const pageStartedAt = new Date(now()).toISOString();
      const body = new URLSearchParams({ query, format: 'json' });
      const { response, bytes, attempts } = await fetchPageWithRetry({
        fetchImpl,
        sleepImpl,
        requestUrl: endpoint,
        requestInit: {
          method: 'POST',
          redirect: 'follow',
          headers: {
            'user-agent': 'SantosDiaOSINT/1.3 (+https://www.santosdodia.com/about)',
            accept: 'application/sparql-results+json, application/json;q=0.9',
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body,
        },
        requestTimeoutMs,
        signalFactory,
        maxAttempts: retryAttempts,
        retryBaseMs,
        retryMaximumMs,
        now,
      });

      const sha256 = createHash('sha256').update(bytes).digest('hex');
      const archivePath = join(runDir, `${String(page).padStart(4, '0')}-${sha256}.json`);
      await writeFile(archivePath, bytes, { flag: 'wx' });
      const receipt = {
        receiptVersion: '1.3',
        queryVersion,
        runId: `${runId}-page-${page}`,
        sourceId,
        requestedUrl: endpoint,
        finalUrl: response.url,
        startedAt: pageStartedAt,
        finishedAt: new Date(now()).toISOString(),
        status: response.ok ? 'fetched' : 'failed',
        attempts,
        http: {
          status: response.status,
          contentType: response.headers.get('content-type') ?? 'application/octet-stream',
          etag: response.headers.get('etag') ?? undefined,
          lastModified: response.headers.get('last-modified') ?? undefined,
          redirects: response.redirected ? [response.url] : [],
        },
        content: { sha256, bytes: bytes.length, archivePath, mimeType: 'application/sparql-results+json' },
        request: { page, pageSize, offset, querySha256: createHash('sha256').update(query).digest('hex'), timeoutMs: requestTimeoutMs },
      };

      let bindingCount = 0;
      if (response.ok) {
        const parsed = JSON.parse(bytes.toString('utf8'));
        if (!Array.isArray(parsed?.results?.bindings)) throw new Error('Wikidata returned an invalid SPARQL JSON result.');
        bindingCount = parsed.results.bindings.length;
      } else {
        receipt.error = { code: `HTTP_${response.status}`, message: response.statusText, retryable: isRetryableStatus(response.status), attempts: attempts.length };
      }
      receipt.bindingCount = bindingCount;
      await writeFile(join(runDir, `${String(page).padStart(4, '0')}-receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
      summary.pages.push({ page, offset, bindingCount, sha256, archivePath, httpStatus: response.status, attemptCount: attempts.length });

      if (!response.ok) throw new Error(`Wikidata returned HTTP ${response.status} after ${attempts.length} attempt${attempts.length === 1 ? '' : 's'}`);
      summary.totalBindings += bindingCount;
      summary.nextPage = page + 1;
      if (bindingCount < pageSize) {
        summary.exhausted = true;
        break;
      }
      if (localPage + 1 < maxPages) await sleepImpl(delayMs);
    }
    summary.status = 'fetched';
  } catch (error) {
    summary.status = 'failed';
    summary.error = { code: error?.name ?? 'WIKIDATA_ADAPTER_ERROR', message: error instanceof Error ? error.message : String(error) };
    if (Array.isArray(error?.attempts)) summary.error.attempts = error.attempts;
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), { adapterSummary: summary });
  } finally {
    summary.finishedAt = new Date(now()).toISOString();
    await writeFile(join(runDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, { flag: 'wx' });
  }

  return { summary, runDir };
}

function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [sourceId = 'wikidata', outputRoot = 'data/osint/runs'] = process.argv.slice(2);
  try {
    const { summary } = await runWikidataAdapter({ sourceId, outputRoot });
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    const summary = error?.adapterSummary;
    if (summary) console.log(JSON.stringify(summary, null, 2));
    else console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();

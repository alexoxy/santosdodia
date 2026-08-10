#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [sourceId = 'wikidata', outputRoot = 'data/osint/runs'] = process.argv.slice(2);
const endpoint = 'https://query.wikidata.org/sparql';
const pageSize = boundedInteger(process.env.OSINT_WIKIDATA_PAGE_SIZE, 500, 50, 1000);
const startPage = boundedInteger(process.env.OSINT_WIKIDATA_START_PAGE, 0, 0, 1000000);
const maxPages = boundedInteger(process.env.OSINT_WIKIDATA_MAX_PAGES, 1, 1, 200);
const delayMs = boundedInteger(process.env.OSINT_WIKIDATA_DELAY_MS, 10000, 1000, 60000);
const startedAt = new Date().toISOString();
const runId = `${startedAt.replace(/[:.]/g, '-')}-${randomUUID()}`;
const runDir = join(outputRoot, sourceId, runId);
await mkdir(runDir, { recursive: true });

const summary = {
  adapterVersion: '1.2',
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
    const pageStartedAt = new Date().toISOString();
    const body = new URLSearchParams({ query, format: 'json' });
    const response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'user-agent': 'SantosDiaOSINT/1.2 (+https://www.santosdodia.com/about)',
        accept: 'application/sparql-results+json, application/json;q=0.9',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body,
      signal: AbortSignal.timeout(90000),
    });

    const bytes = Buffer.from(await response.arrayBuffer());
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const archivePath = join(runDir, `${String(page).padStart(4, '0')}-${sha256}.json`);
    await writeFile(archivePath, bytes, { flag: 'wx' });

    const receipt = {
      receiptVersion: '1.2',
      runId: `${runId}-page-${page}`,
      sourceId,
      requestedUrl: endpoint,
      finalUrl: response.url,
      startedAt: pageStartedAt,
      finishedAt: new Date().toISOString(),
      status: response.ok ? 'fetched' : 'failed',
      http: {
        status: response.status,
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
        etag: response.headers.get('etag') ?? undefined,
        lastModified: response.headers.get('last-modified') ?? undefined,
        redirects: response.redirected ? [response.url] : [],
      },
      content: {
        sha256,
        bytes: bytes.length,
        archivePath,
        mimeType: 'application/sparql-results+json',
      },
      request: { page, pageSize, offset, querySha256: createHash('sha256').update(query).digest('hex') },
    };

    let bindingCount = 0;
    if (response.ok) {
      const parsed = JSON.parse(bytes.toString('utf8'));
      bindingCount = Array.isArray(parsed?.results?.bindings) ? parsed.results.bindings.length : 0;
    } else {
      receipt.error = {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        retryable: response.status === 429 || response.status >= 500,
      };
    }

    receipt.bindingCount = bindingCount;
    await writeFile(join(runDir, `${String(page).padStart(4, '0')}-receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
    summary.pages.push({ page, offset, bindingCount, sha256, archivePath, httpStatus: response.status });
    summary.totalBindings += bindingCount;
    summary.nextPage = page + 1;

    if (!response.ok) throw new Error(`Wikidata returned HTTP ${response.status}`);
    if (bindingCount < pageSize) {
      summary.exhausted = true;
      break;
    }
    if (localPage + 1 < maxPages) await sleep(delayMs);
  }

  summary.status = 'fetched';
} catch (error) {
  summary.status = 'failed';
  summary.error = {
    code: error?.name ?? 'WIKIDATA_ADAPTER_ERROR',
    message: error instanceof Error ? error.message : String(error),
  };
  process.exitCode = 1;
} finally {
  summary.finishedAt = new Date().toISOString();
  await writeFile(join(runDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify(summary, null, 2));
}

function buildQuery(limit, offset) {
  return `PREFIX bd: <http://www.bigdata.com/rdf#>\nPREFIX schema: <http://schema.org/>\nPREFIX wd: <http://www.wikidata.org/entity/>\nPREFIX wdt: <http://www.wikidata.org/prop/direct/>\nPREFIX wikibase: <http://wikiba.se/ontology#>\nSELECT DISTINCT ?item ?itemLabel ?itemDescription ?recognitionStatus ?recognitionStatusLabel ?birth ?death ?image ?article WHERE {\n  { ?item wdt:P411 ?recognitionStatus. } UNION { ?item wdt:P31 wd:Q43115. BIND(wd:Q43115 AS ?recognitionStatus) }\n  OPTIONAL { ?item wdt:P569 ?birth. }\n  OPTIONAL { ?item wdt:P570 ?death. }\n  OPTIONAL { ?item wdt:P18 ?image. }\n  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://pt.wikipedia.org/>. }\n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"pt,en,es,it,fr,de,pl,ru,uk,el,la\". }\n}\nORDER BY ?item ?recognitionStatus\nLIMIT ${limit}\nOFFSET ${offset}`;
}

function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

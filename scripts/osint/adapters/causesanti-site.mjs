#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import config from '../../../config/causesanti-source.json' with { type: 'json' };

const sourceId = config.sourceId;
const host = config.host;
const robotsUrl = `https://${host}/robots.txt`;

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}
function normalizeUrl(value, base) {
  let url;
  try { url = new URL(value, base); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (url.hostname.toLowerCase() !== host.toLowerCase()) return null;
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(?:utm_|fbclid|gclid)/iu.test(key)) url.searchParams.delete(key);
  }
  if (!config.crawl.allowedPathPrefixes.some((prefix) => url.pathname.startsWith(prefix))) return null;
  return url.toString();
}
function extensionFor(contentType = '', url = '') {
  const type = contentType.toLowerCase();
  if (type.includes('text/html')) return 'html';
  if (type.includes('application/pdf')) return 'pdf';
  if (type.includes('application/json')) return 'json';
  if (type.includes('xml')) return 'xml';
  if (type.startsWith('text/')) return 'txt';
  const pathname = new URL(url).pathname.toLowerCase();
  for (const ext of ['pdf','doc','docx','xls','xlsx','ppt','pptx','rtf','odt']) if (pathname.endsWith(`.${ext}`)) return ext;
  return 'bin';
}
function extractLinks(html, baseUrl) {
  const links = [];
  const regex = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/giu;
  for (const match of html.matchAll(regex)) {
    const raw = match[1] ?? match[2] ?? match[3];
    const normalized = normalizeUrl(raw, baseUrl);
    if (normalized) links.push(normalized);
  }
  return [...new Set(links)].sort();
}
function robotsRules(text) {
  const disallow = [];
  let applies = false;
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.replace(/#.*/u, '').trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') applies = value === '*';
    else if (applies && key === 'disallow' && value) disallow.push(value);
  }
  return disallow;
}
function robotsAllows(url, disallow) {
  const path = new URL(url).pathname;
  return !disallow.some((rule) => rule === '/' || path.startsWith(rule));
}
async function fetchWithRetry(url, { fetchImpl, maxAttempts, timeoutMs, userAgent, now }) {
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = new Date(now()).toISOString();
    try {
      const response = await fetchImpl(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'user-agent': userAgent, accept: 'text/html,application/pdf,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5' },
      });
      const bytes = Buffer.from(await response.arrayBuffer());
      const retryable = response.status === 429 || response.status >= 500;
      attempts.push({ attempt, startedAt, finishedAt: new Date(now()).toISOString(), httpStatus: response.status, retryable, bytes: bytes.length });
      if (response.ok || !retryable || attempt === maxAttempts) return { response, bytes, attempts };
    } catch (error) {
      attempts.push({ attempt, startedAt, finishedAt: new Date(now()).toISOString(), networkError: error instanceof Error ? error.message : String(error), retryable: true });
      if (attempt === maxAttempts) throw Object.assign(new Error(`Request failed after ${maxAttempts} attempts: ${url}`), { attempts, cause: error });
    }
    await sleep(Math.min(30000, 2000 * (2 ** (attempt - 1))));
  }
  throw new Error(`Unreachable retry state: ${url}`);
}

export async function runCausesantiCrawler({ outputRoot = 'data/osint/runs', env = process.env, fetchImpl = fetch, now = () => Date.now(), uuid = randomUUID } = {}) {
  const delayMs = boundedInteger(env.CAUSESANTI_DELAY_MS, config.crawl.defaultDelayMs, 1000, 15000);
  const maxUrls = boundedInteger(env.CAUSESANTI_MAX_URLS, config.crawl.defaultMaxUrls, 1, 20000);
  const timeoutMs = boundedInteger(env.CAUSESANTI_REQUEST_TIMEOUT_MS, config.crawl.requestTimeoutMs, 5000, 180000);
  const maxAttempts = boundedInteger(env.CAUSESANTI_MAX_ATTEMPTS, config.crawl.maxAttempts, 1, 6);
  const startedAt = new Date(now()).toISOString();
  const runId = `${startedAt.replace(/[:.]/g, '-')}-${uuid()}`;
  const runDir = join(outputRoot, 'causesanti', runId);
  const pagesDir = join(runDir, 'pages');
  const receiptsDir = join(runDir, 'receipts');
  await mkdir(pagesDir, { recursive: true });
  await mkdir(receiptsDir, { recursive: true });

  let disallow = [];
  try {
    const { response, bytes } = await fetchWithRetry(robotsUrl, { fetchImpl, maxAttempts, timeoutMs, userAgent: config.crawl.userAgent, now });
    if (response.status === 404) disallow = [];
    else if (!response.ok) throw new Error(`robots.txt returned HTTP ${response.status}`);
    else disallow = robotsRules(bytes.toString('utf8'));
    await writeFile(join(runDir, 'robots.txt'), bytes, { flag: 'wx' });
  } catch (error) {
    if (config.crawl.robotsFailClosed) throw error;
  }

  const queue = config.crawl.seedUrls.map((url) => normalizeUrl(url, config.baseUrl)).filter(Boolean);
  const queued = new Set(queue);
  const visited = new Set();
  const manifest = [];
  let failures = 0;

  while (queue.length && visited.size < maxUrls) {
    const requestedUrl = queue.shift();
    if (!requestedUrl || visited.has(requestedUrl)) continue;
    visited.add(requestedUrl);
    if (!robotsAllows(requestedUrl, disallow)) {
      manifest.push({ requestedUrl, status: 'robots-disallowed' });
      continue;
    }
    const pageStartedAt = new Date(now()).toISOString();
    try {
      const { response, bytes, attempts } = await fetchWithRetry(requestedUrl, { fetchImpl, maxAttempts, timeoutMs, userAgent: config.crawl.userAgent, now });
      const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      const ext = extensionFor(contentType, response.url || requestedUrl);
      const filename = `${String(visited.size).padStart(5, '0')}-${sha256}.${ext}`;
      await writeFile(join(pagesDir, filename), bytes, { flag: 'wx' });
      let links = [];
      if (response.ok && contentType.toLowerCase().includes('text/html')) links = extractLinks(bytes.toString('utf8'), response.url || requestedUrl);
      for (const link of links) {
        if (!queued.has(link) && !visited.has(link)) { queue.push(link); queued.add(link); }
      }
      const receipt = {
        schemaVersion: 1,
        sourceId,
        requestedUrl,
        finalUrl: response.url || requestedUrl,
        startedAt: pageStartedAt,
        finishedAt: new Date(now()).toISOString(),
        status: response.ok ? 'fetched' : 'http-error',
        httpStatus: response.status,
        contentType,
        bytes: bytes.length,
        sha256,
        archiveFile: `pages/${filename}`,
        discoveredLinks: links.length,
        attempts,
      };
      await writeFile(join(receiptsDir, `${String(visited.size).padStart(5, '0')}.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
      manifest.push(receipt);
      if (!response.ok) failures += 1;
    } catch (error) {
      failures += 1;
      const receipt = { schemaVersion: 1, sourceId, requestedUrl, startedAt: pageStartedAt, finishedAt: new Date(now()).toISOString(), status: 'network-error', error: error instanceof Error ? error.message : String(error), attempts: error?.attempts ?? [] };
      await writeFile(join(receiptsDir, `${String(visited.size).padStart(5, '0')}.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
      manifest.push(receipt);
    }
    if (queue.length && visited.size < maxUrls) await sleep(delayMs);
  }

  const summary = {
    schemaVersion: 1,
    sourceId,
    authorityClass: config.authorityClass,
    runId,
    startedAt,
    finishedAt: new Date(now()).toISOString(),
    status: failures ? 'fetched-with-errors' : 'fetched',
    visitedUrls: visited.size,
    queuedUrls: queued.size,
    remainingQueue: queue.length,
    failures,
    maxUrls,
    delayMs,
    exhausted: queue.length === 0,
    publicationMutation: false,
    indexationMutation: false,
    adsenseReviewState: 'PREPARING',
  };
  await writeFile(join(runDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
  await writeFile(join(runDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, { flag: 'wx' });
  return { runDir, summary };
}

async function main() {
  try {
    const { summary } = await runCausesantiCrawler();
    console.log(JSON.stringify(summary, null, 2));
    if (!summary.exhausted) process.exitCode = 2;
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  }
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();

#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [registryPath = 'data/source-registry/seed.json', outputRoot = 'data/osint/policy-runs'] = process.argv.slice(2);
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
const sources = registry.sources.filter((source) => source.priority === 'P0');
const startedAt = new Date().toISOString();
const runId = `${startedAt.replace(/[:.]/g, '-')}-${randomUUID()}`;
const runDir = join(outputRoot, runId);
await mkdir(runDir, { recursive: true });

const results = [];
for (const source of sources) {
  const robotsUrl = new URL('/robots.txt', source.url).toString();
  const result = await inspect(source.id, robotsUrl, runDir);
  results.push(result);
  await sleep(2000);
}

const failed = results.filter((result) => result.status === 'failed');
const report = {
  reportVersion: '1.0',
  runId,
  registryPath,
  mode: 'policy-evidence-only',
  publish: false,
  startedAt,
  finishedAt: new Date().toISOString(),
  total: results.length,
  succeeded: results.length - failed.length,
  failed: failed.length,
  results,
};
await writeFile(join(runDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exitCode = 1;

async function inspect(sourceId, robotsUrl, runDir) {
  const startedAt = new Date().toISOString();
  try {
    const response = await fetch(robotsUrl, {
      redirect: 'follow',
      headers: {
        'user-agent': 'SantosDiaOSINT/1.0 (+https://www.santosdodia.com/about)',
        accept: 'text/plain,*/*;q=0.1',
      },
      signal: AbortSignal.timeout(30000),
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    const text = bytes.toString('utf8');
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const archivePath = join(runDir, `${sourceId}-${sha256}.txt`);
    await writeFile(archivePath, bytes, { flag: 'wx' });
    return {
      sourceId,
      robotsUrl,
      finalUrl: response.url,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: response.ok ? 'fetched' : 'failed',
      httpStatus: response.status,
      sha256,
      bytes: bytes.length,
      archivePath,
      policy: parseRobots(text),
      error: response.ok ? undefined : { code: `HTTP_${response.status}`, message: response.statusText },
    };
  } catch (error) {
    return {
      sourceId,
      robotsUrl,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'failed',
      error: { code: error?.name ?? 'ROBOTS_FETCH_ERROR', message: error instanceof Error ? error.message : String(error) },
    };
  }
}

function parseRobots(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const userAgents = [];
  const allows = [];
  const disallows = [];
  const sitemaps = [];
  const contentSignals = [];
  const crawlDelays = [];
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === 'user-agent') userAgents.push(value);
    if (key === 'allow') allows.push(value);
    if (key === 'disallow') disallows.push(value);
    if (key === 'sitemap') sitemaps.push(value);
    if (key === 'content-signal') contentSignals.push(value);
    if (key === 'crawl-delay') crawlDelays.push(value);
  }
  return {
    userAgents: [...new Set(userAgents)],
    allows: [...new Set(allows)],
    disallows: [...new Set(disallows)],
    sitemaps: [...new Set(sitemaps)],
    contentSignals: [...new Set(contentSignals)],
    crawlDelays: [...new Set(crawlDelays)],
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

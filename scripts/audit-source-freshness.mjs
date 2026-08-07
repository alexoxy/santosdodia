#!/usr/bin/env node

import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const network = process.argv.includes('--network');
const output = path.resolve(argument('--output', 'reports/source-freshness.json'));
const maximum = Number(argument('--max-urls', '60'));
if (!Number.isInteger(maximum) || maximum < 1 || maximum > 100) throw new Error('--max-urls must be between 1 and 100.');

const inputs = [
  'data/ecclesiastical-source-registry.json',
  'data/live-streams.ts',
  'data/observances.ts',
  'data/source-registry/seed.json',
  'data/calendar-engine-policy.json'
];

function isPublicHttps(candidate) {
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === 'https:' && net.isIP(hostname) === 0 && hostname !== 'localhost' && !hostname.endsWith('.local') && !hostname.endsWith('.internal');
  } catch {
    return false;
  }
}

const urls = new Set();
for (const input of inputs) {
  const source = fs.readFileSync(input, 'utf8');
  for (const match of source.matchAll(/https:\/\/[^\s'"`<>\])}]+/g)) {
    const candidate = match[0].replace(/[.,;:]$/, '');
    if (!isPublicHttps(candidate)) continue;
    const url = new URL(candidate);
    url.hash = '';
    urls.add(url.toString());
  }
}

const allUrls = [...urls].sort();
const week = Math.floor(Date.now() / (7 * 86_400_000));
const start = allUrls.length > maximum ? (week * maximum) % allUrls.length : 0;
const selected = Array.from({ length: Math.min(maximum, allUrls.length) }, (_, index) => allUrls[(start + index) % allUrls.length]);

async function inspect(url) {
  const started = Date.now();
  try {
    let currentUrl = url;
    let response;
    for (let redirect = 0; redirect <= 5; redirect += 1) {
      if (!isPublicHttps(currentUrl)) throw new Error('Redirect target is not a public HTTPS URL.');
      response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: {
          Accept: 'text/html,application/json;q=0.9,*/*;q=0.5',
          Range: 'bytes=0-0',
          'User-Agent': 'SantosDia-Source-Audit/1.0 (+https://www.santosdodia.com/copyright)'
        },
        signal: AbortSignal.timeout(15_000)
      });
      if (response.status < 300 || response.status >= 400) break;
      const location = response.headers.get('location');
      await response.body?.cancel().catch(() => {});
      if (!location) break;
      if (redirect === 5) throw new Error('Redirect limit exceeded.');
      currentUrl = new URL(location, currentUrl).toString();
    }
    if (!response) throw new Error('Source did not return a response.');
    await response.body?.cancel().catch(() => {});
    const reachable = response.ok || [401, 403, 405, 416, 429].includes(response.status);
    return { url, finalUrl: currentUrl, status: response.status, reachable, durationMs: Date.now() - started };
  } catch (error) {
    return {
      url,
      finalUrl: null,
      status: null,
      reachable: false,
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function mapWithConcurrency(values, concurrency, operation) {
  const results = new Array(values.length);
  let next = 0;
  async function worker() {
    while (next < values.length) {
      const index = next;
      next += 1;
      results[index] = await operation(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

const checks = network
  ? await mapWithConcurrency(selected, 4, inspect)
  : selected.map((url) => ({ url, checked: false }));
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  networkChecked: network,
  inventory: { files: inputs, urls: allUrls.length, selected: selected.length, rotationOffset: start },
  summary: {
    reachable: checks.filter((item) => item.reachable === true).length,
    unreachable: checks.filter((item) => item.reachable === false).length,
    notChecked: checks.filter((item) => item.checked === false).length
  },
  policy: {
    unreachableLinksAreReviewCandidates: true,
    unreachableLinksAreNotDeletedAutomatically: true,
    productionWritesAutomatic: false
  },
  checks
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));

#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const [sourceId, requestedUrl, outputRoot = 'data/osint/runs'] = process.argv.slice(2);
if (!sourceId || !requestedUrl) {
  console.error('Usage: node scripts/osint/fetch-source.mjs <source-id> <url> [output-root]');
  process.exit(2);
}

const startedAt = new Date().toISOString();
const runId = `${startedAt.replace(/[:.]/g, '-')}-${randomUUID()}`;
const runDir = join(outputRoot, sourceId, runId);
await mkdir(runDir, { recursive: true });

const receipt = {
  receiptVersion: '1.0',
  runId,
  sourceId,
  requestedUrl,
  startedAt,
  finishedAt: startedAt,
  status: 'failed',
  content: { sha256: '0'.repeat(64), bytes: 0 },
};

try {
  const response = await fetch(requestedUrl, {
    redirect: 'follow',
    headers: {
      'user-agent': 'SantosDiaOSINT/1.0 (+https://www.santosdodia.com/about)',
      accept: 'text/html,application/json,application/xml,text/xml,text/calendar,application/pdf;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(45000),
  });

  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
  const suffix = inferExtension(contentType, response.url);
  const rawName = `${sha256}${suffix}`;
  const archivePath = join(runDir, rawName);
  await writeFile(archivePath, bytes, { flag: 'wx' });

  Object.assign(receipt, {
    finishedAt: new Date().toISOString(),
    finalUrl: response.url,
    status: response.ok ? 'fetched' : 'failed',
    http: {
      status: response.status,
      etag: response.headers.get('etag') ?? undefined,
      lastModified: response.headers.get('last-modified') ?? undefined,
      contentType,
      redirects: response.redirected ? [response.url] : [],
    },
    content: {
      sha256,
      bytes: bytes.length,
      archivePath,
      mimeType: contentType.split(';')[0],
    },
  });

  if (!response.ok) {
    receipt.error = { code: `HTTP_${response.status}`, message: response.statusText, retryable: response.status >= 500 || response.status === 429 };
  }
} catch (error) {
  receipt.finishedAt = new Date().toISOString();
  receipt.error = {
    code: error?.name ?? 'FETCH_ERROR',
    message: error instanceof Error ? error.message : String(error),
    retryable: true,
  };
}

await writeFile(join(runDir, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(receipt, null, 2));
if (receipt.status !== 'fetched') process.exitCode = 1;

function inferExtension(contentType, finalUrl) {
  const type = contentType.toLowerCase();
  if (type.includes('json')) return '.json';
  if (type.includes('calendar')) return '.ics';
  if (type.includes('xml')) return '.xml';
  if (type.includes('pdf')) return '.pdf';
  if (type.includes('html')) return '.html';
  const urlExt = extname(new URL(finalUrl).pathname);
  return urlExt && urlExt.length <= 8 ? urlExt : '.bin';
}

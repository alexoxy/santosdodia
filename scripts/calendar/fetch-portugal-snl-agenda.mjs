#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ID = 'portugal-national-liturgy-secretariat';
const SOURCE_URL = 'https://www.liturgia.pt/agenda/agenda.ics';
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 4;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

async function fetchCalendar(url = SOURCE_URL) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'text/calendar,text/plain;q=0.9,*/*;q=0.1',
          'User-Agent': 'SantosDoDia-PortugalCalendar/1.0 (+https://www.santosdodia.com)'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const body = await response.text();
      if (!/^BEGIN:VCALENDAR\r?$/mu.test(body) || !/^BEGIN:VEVENT\r?$/mu.test(body)) {
        throw new Error('SNL agenda response is not a usable iCalendar feed.');
      }
      return { body, finalUrl: response.url || url, contentType: response.headers.get('content-type') ?? null };
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) break;
      await sleep(Math.min(1_000 * 2 ** (attempt - 1), 12_000));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function fetchPortugalSnlAgenda({ outputDir = 'staging/portugal-snl', sourceUrl = SOURCE_URL } = {}) {
  const retrievedAt = new Date().toISOString();
  const { body, finalUrl, contentType } = await fetchCalendar(sourceUrl);
  const hash = sha256(body);
  const eventCount = (body.match(/^BEGIN:VEVENT\r?$/gmu) ?? []).length;
  const root = path.resolve(outputDir);
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, 'agenda.ics'), body, 'utf8');
  const manifest = {
    schemaVersion: 1,
    sourceId: SOURCE_ID,
    publisher: 'Secretariado Nacional de Liturgia',
    jurisdictionId: 'PT',
    churchId: 'roman-catholic',
    sourceUrl: finalUrl,
    canonicalSubscriptionUrl: SOURCE_URL,
    retrievedAt,
    contentType,
    sha256: hash,
    byteSize: Buffer.byteLength(body),
    eventCount,
    contentUse: 'structured-calendar-facts',
    publicationAllowed: false,
    productionMutation: false
  };
  fs.writeFileSync(path.join(root, 'source-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

async function main() {
  const outputDir = argument('--output-dir', 'staging/portugal-snl');
  const sourceUrl = argument('--source-url', SOURCE_URL);
  const result = await fetchPortugalSnlAgenda({ outputDir, sourceUrl });
  console.log(JSON.stringify(result, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exit(1); });
}

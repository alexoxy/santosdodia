#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.vaticannews.va';
const SOURCE_ID = 'vatican-news-saint-of-day-pt';
const DEFAULT_OUTPUT = 'staging/vatican-saints/raw.json';
const DEFAULT_RATE_PER_MINUTE = 20;
const MAX_ATTEMPTS = 4;
const TIMEOUT_MS = 30_000;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function pad(value) { return String(value).padStart(2, '0'); }

function decodeEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value
    .replace(/&#x([0-9a-f]+);/giu, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/gu, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-z]+);/giu, (match, name) => named[name.toLowerCase()] ?? match);
}

function textFromHtml(value) {
  return decodeEntities(String(value)
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' '))
    .replace(/\s+/gu, ' ')
    .trim();
}

function isGenericHeading(value) {
  const normalized = value.toLocaleLowerCase('pt').replace(/[.:]/gu, '').trim();
  return [
    'santo do dia', 'santos do dia', 'saint of the day', 'pope activities',
    'atividades do papa', 'últimas notícias', 'ultimas noticias'
  ].includes(normalized);
}

export function extractSaintsFromCalendarHtml(html, { month, day, pageUrl }) {
  const headings = [...String(html).matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)];
  const expectedPt = `/pt/santo-do-dia/${pad(month)}/${pad(day)}/`;
  const expectedEn = `/en/saints/${pad(month)}/${pad(day)}/`;
  const records = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const name = textFromHtml(heading[2]);
    if (!name || isGenericHeading(name)) continue;
    const start = (heading.index ?? 0) + heading[0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : String(html).length;
    const section = String(html).slice(start, end);
    const links = [...section.matchAll(/href=["']([^"']+)["']/giu)].map((match) => match[1]);
    const href = links.find((value) => value.includes(expectedPt) || value.includes(expectedEn));
    if (!href) continue;
    const detailUrl = new URL(href, pageUrl).toString();
    records.push({ name, detailUrl });
  }

  const unique = new Map();
  for (const record of records) unique.set(record.detailUrl, record);
  return [...unique.values()];
}

export function monthDays(month) {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`Invalid month ${month}`);
  const days = new Date(Date.UTC(2028, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, index) => ({ month, day: index + 1 }));
}

export function selectedDays(scope, now = new Date()) {
  if (scope === 'all') return Array.from({ length: 12 }, (_, index) => monthDays(index + 1)).flat();
  if (scope === 'current-month') return monthDays(now.getUTCMonth() + 1);
  const match = /^month:(\d{1,2})$/u.exec(scope);
  if (match) return monthDays(Number(match[1]));
  throw new Error(`Unsupported scope ${scope}. Use all, current-month or month:MM.`);
}

async function fetchPage(url) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'SantosDoDia-ReferenceIndexer/1.0 (+https://www.santosdodia.com)'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (response.ok) return { html: await response.text(), finalUrl: response.url };
      const error = new Error(`HTTP ${response.status} ${response.statusText}`);
      lastError = error;
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === MAX_ATTEMPTS) throw error;
      const retryAfter = Number(response.headers.get('retry-after'));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 60_000) : Math.min(1000 * 2 ** (attempt - 1), 15_000));
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) break;
      const message = error instanceof Error ? error.message : String(error);
      if (!/timeout|fetch failed|aborted/i.test(message)) throw error;
      await sleep(Math.min(1000 * 2 ** (attempt - 1), 15_000));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function harvestVaticanSaints({ scope = 'current-month', output = DEFAULT_OUTPUT, ratePerMinute = DEFAULT_RATE_PER_MINUTE, now = new Date() } = {}) {
  if (!Number.isFinite(ratePerMinute) || ratePerMinute < 1 || ratePerMinute > 60) throw new RangeError('ratePerMinute must be between 1 and 60.');
  const days = selectedDays(scope, now);
  const intervalMs = Math.ceil(60_000 / ratePerMinute);
  const results = [];
  const failures = [];

  for (let index = 0; index < days.length; index += 1) {
    const { month, day } = days[index];
    const pageUrl = `${BASE}/pt/santo-do-dia/${pad(month)}/${pad(day)}.html`;
    const retrievedAt = new Date().toISOString();
    try {
      const { html, finalUrl } = await fetchPage(pageUrl);
      const saints = extractSaintsFromCalendarHtml(html, { month, day, pageUrl: finalUrl });
      const pageSha256 = sha256(html);
      results.push({
        month,
        day,
        locale: 'pt',
        sourceId: SOURCE_ID,
        sourceUrl: finalUrl,
        retrievedAt,
        pageSha256,
        byteSize: Buffer.byteLength(html),
        saints: saints.map((saint) => ({
          ...saint,
          sourceRecordHash: sha256(`${finalUrl}\n${saint.name}\n${saint.detailUrl}`)
        }))
      });
      if (!saints.length) failures.push({ month, day, sourceUrl: finalUrl, reason: 'no-saints-extracted' });
    } catch (error) {
      failures.push({ month, day, sourceUrl: pageUrl, reason: error instanceof Error ? error.message : String(error) });
    }
    if (index + 1 < days.length) await sleep(intervalMs);
  }

  const saintCount = results.reduce((sum, item) => sum + item.saints.length, 0);
  const report = {
    schemaVersion: 1,
    source: {
      id: SOURCE_ID,
      publisher: 'Vatican News',
      canonicalUrl: `${BASE}/pt/santo-do-dia.html`,
      authority: 'official-church-media',
      contentUse: 'metadata-only-reference',
      robotsEvidence: `${BASE}/robots.txt`,
      aiTrainingAllowed: false
    },
    generatedAt: new Date().toISOString(),
    scope,
    requestedDayCount: days.length,
    successfulDayCount: results.length,
    saintCount,
    complete: failures.length === 0 && results.length === days.length,
    publicationAllowed: false,
    productionMutation: false,
    days: results,
    failures
  };

  const resolvedOutput = path.resolve(output);
  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
  fs.writeFileSync(resolvedOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

async function main() {
  const scope = argument('--scope', 'current-month');
  const output = argument('--output', DEFAULT_OUTPUT);
  const ratePerMinute = Number(argument('--rate-per-minute', String(DEFAULT_RATE_PER_MINUTE)));
  const report = await harvestVaticanSaints({ scope, output, ratePerMinute });
  process.stdout.write(`${JSON.stringify({ scope: report.scope, requestedDayCount: report.requestedDayCount, successfulDayCount: report.successfulDayCount, saintCount: report.saintCount, complete: report.complete, failures: report.failures }, null, 2)}\n`);
  if (!report.complete) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function pad(value) { return String(value).padStart(2, '0'); }

export function normalizeVaticanSaints(raw) {
  if (raw?.schemaVersion !== 1) throw new Error('Unsupported Vatican saints raw schema.');
  if (raw?.source?.id !== 'vatican-news-saint-of-day-pt') throw new Error('Unexpected Vatican saints source id.');
  if (raw?.source?.contentUse !== 'metadata-only-reference') throw new Error('Vatican saints source must remain metadata-only-reference.');
  if (!Array.isArray(raw.days)) throw new Error('Vatican saints raw days are missing.');
  if (raw.publicationAllowed !== false || raw.productionMutation !== false) throw new Error('Raw acquisition must not permit publication or production mutation.');

  const events = [];
  const seen = new Set();
  const dayCoverage = new Map();
  for (const day of raw.days) {
    if (!Number.isInteger(day?.month) || !Number.isInteger(day?.day) || !Array.isArray(day?.saints)) throw new Error('Invalid Vatican saints day record.');
    const dateKey = `${pad(day.month)}-${pad(day.day)}`;
    dayCoverage.set(dateKey, (dayCoverage.get(dateKey) ?? 0) + day.saints.length);
    for (const saint of day.saints) {
      if (typeof saint?.name !== 'string' || !saint.name.trim()) throw new Error(`Missing saint name for ${dateKey}.`);
      if (typeof saint?.detailUrl !== 'string' || !saint.detailUrl.startsWith('https://www.vaticannews.va/pt/santo-do-dia/')) {
        throw new Error(`Unexpected saint detail URL for ${dateKey}.`);
      }
      if (!/^[a-f0-9]{64}$/u.test(saint.sourceRecordHash ?? '')) throw new Error(`Invalid source record hash for ${dateKey}.`);
      const occurrenceKey = `${dateKey}|${saint.detailUrl}`;
      if (seen.has(occurrenceKey)) continue;
      seen.add(occurrenceKey);
      const externalHash = sha256(saint.detailUrl);
      events.push({
        id: `vatican-news-${dateKey}-${externalHash.slice(0, 20)}`,
        canonicalEventCandidateId: `source:vatican-news:${externalHash.slice(0, 24)}`,
        personEntityId: null,
        personLinkStatus: 'unresolved',
        churchId: 'roman-catholic',
        jurisdictionId: 'holy-see',
        category: 'saint',
        rule: { type: 'fixed-date', month: day.month, day: day.day },
        month: day.month,
        day: day.day,
        names: {
          pt: { value: saint.name.trim(), status: 'source', sourceLocale: 'pt' }
        },
        source: {
          sourceId: raw.source.id,
          calendarPageUrl: day.sourceUrl,
          detailUrl: saint.detailUrl,
          pageSha256: day.pageSha256,
          sourceRecordHash: saint.sourceRecordHash,
          retrievedAt: day.retrievedAt
        },
        validationStatus: 'provisional',
        publicationStatus: 'withheld',
        productionMutation: false
      });
    }
  }

  const missingCoveredDays = [...dayCoverage.entries()].filter(([, count]) => count < 1).map(([date]) => date).sort();
  const expected = raw.scope === 'all' ? 366 : raw.requestedDayCount;
  const covered = [...dayCoverage.values()].filter((count) => count > 0).length;
  const coverageComplete = raw.complete === true && covered === expected && missingCoveredDays.length === 0;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceId: raw.source.id,
    sourceGeneratedAt: raw.generatedAt,
    sourceScope: raw.scope,
    contract: {
      personIsNotObservance: true,
      nameOnlyIdentityMergeForbidden: true,
      sourceNamesAreEvidenceOnly: true,
      productionPublication: false
    },
    coverage: {
      expectedDays: expected,
      coveredDays: covered,
      complete: coverageComplete,
      missingCoveredDays
    },
    eventCount: events.length,
    events
  };
}

async function main() {
  const input = path.resolve(argument('--input', 'staging/vatican-saints/raw.json'));
  const output = path.resolve(argument('--output', 'staging/vatican-saints/normalized.json'));
  const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
  const normalized = normalizeVaticanSaints(raw);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ eventCount: normalized.eventCount, coverage: normalized.coverage, publicationAllowed: false }, null, 2)}\n`);
  if (!normalized.coverage.complete) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

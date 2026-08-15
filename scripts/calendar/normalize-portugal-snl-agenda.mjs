#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ID = 'portugal-national-liturgy-secretariat';
const DROPBOX_MANIFEST_PATH = '/Santos do Dia/02_Dados_Eclesiasticos/calendar/portugal-snl/v1/source-manifest.json';
const RANK_LABELS = new Map([
  ['SOLENIDADE', 'solemnity'], ['FESTA', 'feast'], ['MO', 'memorial'],
  ['MEMÓRIA OBRIGATÓRIA', 'memorial'], ['MF', 'optional-memorial'],
  ['MEMÓRIA FACULTATIVA', 'optional-memorial'],
]);
const COLOUR_LINE = /^(?:Branco|Vermelho|Verde|Roxo|Rosa|Preto)\b/iu;
const RANK_SUFFIX = /(?:\s+[–—-]\s*|\s+)(SOLENIDADE|FESTA|MO|MF|MEMÓRIA OBRIGATÓRIA|MEMÓRIA FACULTATIVA)\s*$/iu;
const DASH_RANK_MARKER = /\s+[–—-]\s*(SOLENIDADE|FESTA|MO|MF|MEMÓRIA OBRIGATÓRIA|MEMÓRIA FACULTATIVA)(?=\s|$)/giu;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function unfoldLines(value) {
  const lines = String(value).replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').split('\n');
  const output = [];
  for (const line of lines) {
    if (/^[ \t]/u.test(line) && output.length) output[output.length - 1] += line.slice(1);
    else output.push(line);
  }
  return output;
}
function decodeIcsText(value) {
  return String(value ?? '').replace(/\\[nN]/gu, '\n').replace(/\\,/gu, ',')
    .replace(/\\;/gu, ';').replace(/\\\\/gu, '\\').normalize('NFC').trim();
}
function property(line) {
  const colon = line.indexOf(':');
  if (colon < 1) return null;
  const head = line.slice(0, colon);
  const semicolon = head.indexOf(';');
  return { name: (semicolon >= 0 ? head.slice(0, semicolon) : head).toUpperCase(), value: line.slice(colon + 1) };
}
function parseDate(value) {
  const match = /^(\d{4})(\d{2})(\d{2})/u.exec(String(value ?? ''));
  if (!match) return null;
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso ? null : iso;
}
function slugHash(value) { return sha256(value).slice(0, 24); }
function compactLines(value) {
  return String(value ?? '').replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').split('\n').map((line) => line.trim());
}
function canonicalRank(value) { return RANK_LABELS.get(String(value ?? '').trim().toUpperCase()) ?? null; }
function trimLabel(value) {
  return String(value ?? '').replace(/^[\s,;–—-]+|[\s,;–—-]+$/gu, '').replace(/\s+/gu, ' ').trim();
}
function leadingLiturgicalBlock(description) {
  const headingLines = [];
  let officeLine = '';
  for (const raw of compactLines(description)) {
    const line = raw.trim();
    if (!line) continue;
    if (COLOUR_LINE.test(line)) { officeLine = line; break; }
    if (line.startsWith('*')) break;
    headingLines.push(line);
  }
  return { heading: headingLines.join(' ').replace(/\s+/gu, ' ').trim(), officeLine };
}
function rankedHeadingItems(heading) {
  if (!heading) return [];
  const dashMatches = [...heading.matchAll(DASH_RANK_MARKER)];
  if (dashMatches.length) {
    const items = [];
    let cursor = 0;
    for (const match of dashMatches) {
      const label = trimLabel(heading.slice(cursor, match.index));
      const rank = canonicalRank(match[1]);
      if (!label || !rank) return [];
      items.push({ label, rank });
      cursor = (match.index ?? 0) + match[0].length;
    }
    return items;
  }
  const suffix = RANK_SUFFIX.exec(heading);
  if (!suffix) return [];
  const rank = canonicalRank(suffix[1]);
  const label = trimLabel(heading.slice(0, suffix.index));
  return label && rank ? [{ label, rank }] : [];
}

export function extractSnlObservances(summary, description) {
  const dayLabel = String(summary ?? '').normalize('NFC').trim();
  const { heading, officeLine } = leadingLiturgicalBlock(description);
  const ranked = rankedHeadingItems(heading);
  if (ranked.length) {
    return ranked.map((item, index) => ({
      ...item,
      rankSource: 'description-leading-heading',
      dayLabel,
      evidenceHeading: heading,
      sourceOrdinal: index,
      groupedAlternative: ranked.length > 1,
    }));
  }

  let inferredRank = null;
  if (/Ofício da solenidade/iu.test(officeLine)) inferredRank = 'solemnity';
  else if (/Ofício da festa/iu.test(officeLine)) inferredRank = 'feast';
  else if (/Ofício da memória/iu.test(officeLine)) inferredRank = 'memorial';
  return [{
    label: dayLabel,
    rank: inferredRank,
    rankSource: inferredRank ? 'leading-office-line' : 'none',
    dayLabel,
    evidenceHeading: officeLine || dayLabel,
    sourceOrdinal: 0,
    groupedAlternative: false,
  }];
}

export function extractPrimarySnlObservance(summary, description) {
  return extractSnlObservances(summary, description)[0];
}

export function parseSnlIcs(ics) {
  const lines = unfoldLines(ics);
  const events = [];
  let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { current = []; continue; }
    if (line === 'END:VEVENT') { if (current) events.push(current); current = null; continue; }
    if (current) current.push(line);
  }
  return events.map((linesForEvent) => {
    const properties = linesForEvent.map(property).filter(Boolean);
    const first = (name) => properties.find((item) => item.name === name);
    return {
      dateISO: parseDate(first('DTSTART')?.value),
      summary: decodeIcsText(first('SUMMARY')?.value),
      uid: decodeIcsText(first('UID')?.value) || null,
      description: decodeIcsText(first('DESCRIPTION')?.value) || null,
      location: decodeIcsText(first('LOCATION')?.value) || null,
      url: decodeIcsText(first('URL')?.value) || null,
    };
  });
}

export function normalizePortugalSnlAgenda(ics, manifest) {
  if (manifest?.schemaVersion !== 1 || manifest?.sourceId !== SOURCE_ID) throw new Error('Unexpected SNL source manifest.');
  if (manifest.publicationAllowed !== false || manifest.productionMutation !== false) throw new Error('SNL source manifest must remain staging-only.');
  if (sha256(ics) !== manifest.sha256) throw new Error('SNL ICS hash does not match source manifest.');
  const parsed = parseSnlIcs(ics);
  const invalid = parsed.filter((event) => !event.dateISO || !event.summary);
  if (invalid.length) throw new Error(`SNL ICS contains ${invalid.length} event(s) without a valid date or summary.`);
  if (!parsed.length) throw new Error('SNL ICS contains no events.');

  const seenDays = new Set();
  const events = [];
  for (const event of parsed) {
    const sourceDayKey = `${event.dateISO}|${event.uid ?? event.summary}`;
    if (seenDays.has(sourceDayKey)) continue;
    seenDays.add(sourceDayKey);
    const [year, month, day] = event.dateISO.split('-').map(Number);
    const sourceObservances = extractSnlObservances(event.summary, event.description);
    const alternativeGroupId = sourceObservances.length > 1 ? `snl-pt-group-${slugHash(sourceDayKey)}` : null;
    for (const observance of sourceObservances) {
      const occurrenceKey = `${sourceDayKey}|${observance.sourceOrdinal}|${observance.label}|${observance.rank ?? ''}`;
      events.push({
        id: `snl-pt-${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${slugHash(occurrenceKey)}`,
        canonicalEventId: `source:snl-pt:${slugHash(occurrenceKey)}`,
        churchId: 'roman-catholic', jurisdictionId: 'PT', dateISO: event.dateISO,
        rule: { type: 'annual-source-table', month, day },
        names: { pt: { value: observance.label, status: 'source', sourceLocale: 'pt' } },
        sourceId: SOURCE_ID,
        sourceRecordHash: sha256(JSON.stringify({ event, observance })),
        validationStatus: 'provisional', publicationStatus: 'withheld',
        sourceFacts: {
          uid: event.uid, sourceDayKey, sourceOrdinal: observance.sourceOrdinal,
          alternativeGroupId, groupedAlternative: sourceObservances.length > 1,
          dayLabel: event.summary, primaryObservance: observance,
          description: observance.evidenceHeading, rawDescription: event.description,
          location: event.location, url: event.url,
          laterSourceMaterialPreservedOnly: true,
        },
      });
    }
  }

  const years = [...new Set(events.map((event) => Number(event.dateISO.slice(0, 4))))].sort((a, b) => a - b);
  const civilDays = new Set(events.map((event) => event.dateISO)).size;
  const explicitPrimaryObservances = events.filter((event) => event.sourceFacts.primaryObservance.rankSource === 'description-leading-heading').length;
  const multiObservanceDays = new Set(events.filter((event) => event.sourceFacts.groupedAlternative).map((event) => event.dateISO)).size;
  return {
    schemaVersion: 1,
    packageId: `portugal-snl-${manifest.sha256.slice(0, 16)}`,
    run: { createdAt: new Date().toISOString(), retrievedAt: manifest.retrievedAt, manifestPath: DROPBOX_MANIFEST_PATH, status: 'provisional', publicationAllowed: false, promotionAllowed: false },
    sources: [{ id: SOURCE_ID, churchId: 'roman-catholic', jurisdictionId: 'PT', name: 'Secretariado Nacional de Liturgia — Agenda Litúrgica Portugal', url: manifest.canonicalSubscriptionUrl, authority: 'official-jurisdiction', factsSha256: manifest.sha256, usagePolicy: 'Structured calendar facts only; raw ICS evidence is archived and public promotion is separately reviewed.' }],
    policies: [{ id: 'policy-roman-catholic-pt-snl', churchId: 'roman-catholic', jurisdictionId: 'PT', engineId: 'snl-portugal-agenda-ics', fixedDatePolicy: 'Use only the leading national day block for same-day observances; preserve later vigils, local notes and related material as source evidence without promoting them to the civil day.', calendarSystem: 'gregorian', sourceId: SOURCE_ID, validationStatus: 'provisional' }],
    events,
    coverage: { years, sourceDayCount: seenDays.size, eventCount: events.length, civilDays, explicitPrimaryObservances, multiObservanceDays, completeSourceFeed: true, publicationStatus: 'withheld' },
  };
}

function main() {
  const inputDir = path.resolve(argument('--input-dir', 'staging/portugal-snl'));
  const output = path.resolve(argument('--output', 'staging/portugal-snl/normalized-package.json'));
  const ics = fs.readFileSync(path.join(inputDir, 'agenda.ics'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(inputDir, 'source-manifest.json'), 'utf8'));
  const result = normalizePortugalSnlAgenda(ics, manifest);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result.coverage, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ID = 'portugal-national-liturgy-secretariat';
const DROPBOX_MANIFEST_PATH = '/Santos do Dia/02_Dados_Eclesiasticos/calendar/portugal-snl/v1/source-manifest.json';
const RANK_LABELS = new Map([
  ['SOLENIDADE', 'solemnity'],
  ['FESTA', 'feast'],
  ['MO', 'memorial'],
  ['MEMÓRIA OBRIGATÓRIA', 'memorial'],
  ['MF', 'optional-memorial'],
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
  return String(value ?? '')
    .replace(/\\[nN]/gu, '\n')
    .replace(/\\,/gu, ',')
    .replace(/\\;/gu, ';')
    .replace(/\\\\/gu, '\\')
    .normalize('NFC')
    .trim();
}
function property(line) {
  const colon = line.indexOf(':');
  if (colon < 1) return null;
  const head = line.slice(0, colon);
  const semicolon = head.indexOf(';');
  return {
    name: (semicolon >= 0 ? head.slice(0, semicolon) : head).toUpperCase(),
    params: semicolon >= 0 ? head.slice(semicolon + 1) : '',
    value: line.slice(colon + 1),
  };
}
function parseDate(value) {
  const match = /^(\d{4})(\d{2})(\d{2})/u.exec(String(value ?? ''));
  if (!match) return null;
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso;
}
function slugHash(value) { return sha256(value).slice(0, 24); }
function compactLines(value) {
  return String(value ?? '').replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').split('\n').map((line) => line.trim());
}
function canonicalRank(value) {
  const key = String(value ?? '').trim().toUpperCase();
  return RANK_LABELS.get(key) ?? null;
}
function trimLabel(value) {
  return String(value ?? '').replace(/^[\s,;–—-]+|[\s,;–—-]+$/gu, '').replace(/\s+/gu, ' ').trim();
}
function splitRankedHeading(heading) {
  const matches = [...heading.matchAll(DASH_RANK_MARKER)];
  if (!matches.length) return [];
  const result = [];
  let cursor = 0;
  for (const match of matches) {
    const label = trimLabel(heading.slice(cursor, match.index));
    const rank = canonicalRank(match[1]);
    if (!label || !rank) return [];
    result.push({ label, rank });
    cursor = (match.index ?? 0) + match[0].length;
  }
  if (trimLabel(heading.slice(cursor))) return [];
  return result;
}

export function extractSnlObservances(summary, description) {
  const dayLabel = String(summary ?? '').normalize('NFC').trim();
  const paragraphs = String(description ?? '').replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').split(/\n\s*\n+/u);

  for (const paragraph of paragraphs) {
    const lines = compactLines(paragraph).filter(Boolean);
    if (!lines.length || lines[0].startsWith('*')) continue;
    const colourIndex = lines.findIndex((line) => COLOUR_LINE.test(line));
    const headingLines = colourIndex >= 0 ? lines.slice(0, colourIndex) : lines;
    if (!headingLines.length) continue;
    const heading = headingLines.join(' ').replace(/\s+/gu, ' ').trim();
    const suffix = RANK_SUFFIX.exec(heading);
    if (!suffix) continue;

    const split = splitRankedHeading(heading);
    if (split.length) {
      return split.map((item, index) => ({
        ...item,
        rankSource: 'description-heading',
        dayLabel,
        evidenceHeading: heading,
        sourceOrdinal: index,
        groupedAlternative: split.length > 1,
      }));
    }

    const rank = canonicalRank(suffix[1]);
    const label = trimLabel(heading.slice(0, suffix.index));
    if (!rank || !label) continue;
    return [{
      label,
      rank,
      rankSource: 'description-heading',
      dayLabel,
      evidenceHeading: heading,
      sourceOrdinal: 0,
      groupedAlternative: false,
    }];
  }

  const descriptionLines = compactLines(description).filter(Boolean);
  const firstColourLine = descriptionLines.find((line) => COLOUR_LINE.test(line)) ?? '';
  let inferredRank = null;
  if (/Ofício da solenidade/iu.test(firstColourLine)) inferredRank = 'solemnity';
  else if (/Ofício da festa/iu.test(firstColourLine)) inferredRank = 'feast';
  else if (/Ofício da memória/iu.test(firstColourLine)) inferredRank = 'memorial';

  return [{
    label: dayLabel,
    rank: inferredRank,
    rankSource: inferredRank ? 'office-line' : 'none',
    dayLabel,
    evidenceHeading: firstColourLine || dayLabel,
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
    if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (current) current.push(line);
  }
  return events.map((linesForEvent) => {
    const properties = linesForEvent.map(property).filter(Boolean);
    const first = (name) => properties.find((item) => item.name === name);
    const dateISO = parseDate(first('DTSTART')?.value);
    const summary = decodeIcsText(first('SUMMARY')?.value);
    const uid = decodeIcsText(first('UID')?.value);
    const description = decodeIcsText(first('DESCRIPTION')?.value);
    const location = decodeIcsText(first('LOCATION')?.value);
    const url = decodeIcsText(first('URL')?.value);
    return { dateISO, summary, uid: uid || null, description: description || null, location: location || null, url: url || null };
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
      const recordHash = sha256(JSON.stringify({ event, observance }));
      events.push({
        id: `snl-pt-${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${slugHash(occurrenceKey)}`,
        canonicalEventId: `source:snl-pt:${slugHash(occurrenceKey)}`,
        churchId: 'roman-catholic',
        jurisdictionId: 'PT',
        dateISO: event.dateISO,
        rule: { type: 'annual-source-table', month, day },
        names: { pt: { value: observance.label, status: 'source', sourceLocale: 'pt' } },
        sourceId: SOURCE_ID,
        sourceRecordHash: recordHash,
        validationStatus: 'provisional',
        publicationStatus: 'withheld',
        sourceFacts: {
          uid: event.uid,
          sourceDayKey,
          sourceOrdinal: observance.sourceOrdinal,
          alternativeGroupId,
          groupedAlternative: sourceObservances.length > 1,
          dayLabel: event.summary,
          primaryObservance: observance,
          description: observance.evidenceHeading,
          rawDescription: event.description,
          location: event.location,
          url: event.url,
        },
      });
    }
  }

  const years = [...new Set(events.map((event) => Number(event.dateISO.slice(0, 4))))].sort((a, b) => a - b);
  const civilDays = new Set(events.map((event) => event.dateISO)).size;
  const explicitPrimaryObservances = events.filter((event) => event.sourceFacts.primaryObservance.rankSource === 'description-heading').length;
  const multiObservanceDays = new Set(events.filter((event) => event.sourceFacts.groupedAlternative).map((event) => event.dateISO)).size;
  return {
    schemaVersion: 1,
    packageId: `portugal-snl-${manifest.sha256.slice(0, 16)}`,
    run: {
      createdAt: new Date().toISOString(),
      retrievedAt: manifest.retrievedAt,
      manifestPath: DROPBOX_MANIFEST_PATH,
      status: 'provisional',
      publicationAllowed: false,
      promotionAllowed: false,
    },
    sources: [{
      id: SOURCE_ID,
      churchId: 'roman-catholic',
      jurisdictionId: 'PT',
      name: 'Secretariado Nacional de Liturgia — Agenda Litúrgica Portugal',
      url: manifest.canonicalSubscriptionUrl,
      authority: 'official-jurisdiction',
      factsSha256: manifest.sha256,
      usagePolicy: 'Structured calendar facts only; raw ICS evidence is archived and public promotion is separately reviewed.',
    }],
    policies: [{
      id: 'policy-roman-catholic-pt-snl',
      churchId: 'roman-catholic',
      jurisdictionId: 'PT',
      engineId: 'snl-portugal-agenda-ics',
      fixedDatePolicy: 'Use the Portuguese national agenda as emitted, preserving national transfers, grouped alternatives and proper observances without rewriting the General Roman Calendar.',
      calendarSystem: 'gregorian',
      sourceId: SOURCE_ID,
      validationStatus: 'provisional',
    }],
    events,
    coverage: {
      years,
      sourceDayCount: seenDays.size,
      eventCount: events.length,
      civilDays,
      explicitPrimaryObservances,
      multiObservanceDays,
      completeSourceFeed: true,
      publicationStatus: 'withheld',
    },
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

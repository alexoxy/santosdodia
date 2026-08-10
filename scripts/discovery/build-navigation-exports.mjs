#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : fallback; }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function stableJson(value) { return `${JSON.stringify(value, null, 2)}\n`; }
function unique(values) { return [...new Set(values)]; }
function pad(value) { return String(value).padStart(2, '0'); }
function validCoordinate(lat, lon) { return Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180; }

export function centuryForYear(year) {
  if (!Number.isInteger(year) || year === 0) return null;
  if (year > 0) return Math.floor((year - 1) / 100) + 1;
  return -(Math.floor((Math.abs(year) - 1) / 100) + 1);
}
function centuryLabel(century) { if (!Number.isInteger(century) || century === 0) return null; return century > 0 ? `${century}` : `${Math.abs(century)} BCE`; }
function displayName(person, locale) { return person?.names?.[locale] || person?.names?.en || person?.canonicalName || person?.entityId || ''; }
function includePerson(person, mode) {
  if (!person || typeof person.entityId !== 'string' || !person.entityId) return false;
  if (mode === 'public') return person.publicationStatus === 'published' && ['verified', 'cross-checked'].includes(person.validationStatus);
  return person.publicationStatus !== 'rejected' && person.validationStatus !== 'rejected';
}
function includeObservance(observance, mode) {
  if (!observance || !Number.isInteger(observance.month) || !Number.isInteger(observance.day) || !observance.id) return false;
  if (mode === 'public') return observance.publicationStatus === 'published' && ['verified', 'cross-checked'].includes(observance.validationStatus);
  return observance.publicationStatus !== 'rejected' && observance.validationStatus !== 'rejected';
}
function normalizedPerson(person, locale) {
  const birthYear = Number.isInteger(person?.birth?.year) ? person.birth.year : null;
  const deathYear = Number.isInteger(person?.death?.year) ? person.death.year : null;
  const anchorYear = birthYear ?? deathYear; const century = centuryForYear(anchorYear);
  return { entityId: person.entityId, qid: person.qid ?? null, name: displayName(person, locale), names: person.names ?? {}, birth: person.birth ?? null, death: person.death ?? null, anchorYear, century, centuryLabel: centuryLabel(century), traditions: unique(person.traditions ?? []).sort(), categories: unique(person.categories ?? []).sort(), validationStatus: person.validationStatus, publicationStatus: person.publicationStatus };
}
function calendarEntry(observance, { entityId = null, fallbackName = '' } = {}) {
  const localizedName = observance?.names?.pt?.value ?? observance?.names?.pt ?? observance?.names?.en?.value ?? observance?.names?.en ?? observance?.name ?? fallbackName;
  return {
    observanceId: observance.id,
    entityId,
    personLinkStatus: observance.personLinkStatus ?? (entityId ? 'linked' : 'unresolved'),
    name: localizedName,
    names: observance.names ?? {},
    churchId: observance.churchId ?? null,
    jurisdictionId: observance.jurisdictionId ?? null,
    rankCode: observance.rankCode ?? null,
    sourceIds: unique(observance.sourceIds ?? (observance.source?.sourceId ? [observance.source.sourceId] : [])).sort(),
    validationStatus: observance.validationStatus,
    publicationStatus: observance.publicationStatus
  };
}

export function buildNavigationExports(input, { mode = 'staging', locale = 'pt' } = {}) {
  if (input?.schemaVersion !== 1 || !Array.isArray(input.people)) throw new Error('Navigation source must use schemaVersion 1 with a people array.');
  if (!['staging', 'public'].includes(mode)) throw new Error('Export mode must be staging or public.');
  const people = input.people.filter((person) => includePerson(person, mode));
  const index = people.map((person) => normalizedPerson(person, locale)).sort((a, b) => a.name.localeCompare(b.name, locale) || a.entityId.localeCompare(b.entityId));
  const personById = new Map(index.map((person) => [person.entityId, person]));

  const features = [];
  for (const source of people) {
    const person = personById.get(source.entityId);
    for (const place of source.places ?? []) {
      const lat = Number(place?.lat); const lon = Number(place?.lon);
      if (!validCoordinate(lat, lon) || typeof place?.relationType !== 'string') continue;
      features.push({ type: 'Feature', id: `${source.entityId}:${place.relationType}:${place.placeId ?? `${lat},${lon}`}`, geometry: { type: 'Point', coordinates: [lon, lat] }, properties: { entityId: source.entityId, qid: source.qid ?? null, name: person.name, relationType: place.relationType, placeId: place.placeId ?? null, placeName: place.currentName ?? place.name ?? null, historicalName: place.historicalName ?? null, countryCode: place.countryCode ?? null, century: person.century, anchorYear: person.anchorYear, confidence: Number.isFinite(place.confidence) ? place.confidence : null, sourceIds: unique(place.sourceIds ?? []).sort() } });
    }
  }
  features.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const timelineItems = index.filter((person) => person.anchorYear !== null).map((person) => ({ entityId: person.entityId, qid: person.qid, name: person.name, birth: person.birth, death: person.death, anchorYear: person.anchorYear, century: person.century, centuryLabel: person.centuryLabel, traditions: person.traditions, categories: person.categories })).sort((a, b) => a.anchorYear - b.anchorYear || a.name.localeCompare(b.name, locale));
  const byCentury = {};
  for (const item of timelineItems) { const key = String(item.century); byCentury[key] ??= []; byCentury[key].push(item.entityId); }

  const calendar = {};
  const add = (observance, context = {}) => {
    if (!includeObservance(observance, mode)) return;
    const key = `${pad(observance.month)}-${pad(observance.day)}`; calendar[key] ??= []; calendar[key].push(calendarEntry(observance, context));
  };
  for (const source of people) for (const observance of source.observances ?? []) add(observance, { entityId: source.entityId, fallbackName: personById.get(source.entityId)?.name ?? source.entityId });
  for (const observance of input.unlinkedObservances ?? []) add(observance, { entityId: observance.personEntityId ?? null, fallbackName: observance.name ?? '' });
  for (const key of Object.keys(calendar)) calendar[key].sort((a, b) => a.name.localeCompare(b.name, locale) || a.observanceId.localeCompare(b.observanceId));

  const outputs = { saints: index, map: { type: 'FeatureCollection', features }, timeline: { schemaVersion: 1, items: timelineItems, byCentury }, calendar: { schemaVersion: 1, days: Object.fromEntries(Object.entries(calendar).sort(([a], [b]) => a.localeCompare(b))) } };
  const hashes = Object.fromEntries(Object.entries(outputs).map(([key, value]) => [key, sha256(JSON.stringify(value))]));
  return { ...outputs, manifest: { schemaVersion: 1, datasetVersion: input.datasetVersion ?? null, sourceSha256: input.sourceSha256 ?? null, generatedAt: new Date().toISOString(), mode, locale, personCount: index.length, mapFeatureCount: features.length, timelineItemCount: timelineItems.length, calendarDayCount: Object.keys(calendar).length, linkedCalendarEntryCount: Object.values(calendar).flat().filter((item) => item.entityId).length, unlinkedCalendarEntryCount: Object.values(calendar).flat().filter((item) => !item.entityId).length, hashes, productionMutation: false } };
}

async function main() {
  const inputArg = argument('--input'); if (!inputArg) throw new Error('--input is required.');
  const inputPath = path.resolve(inputArg); const outputDir = path.resolve(argument('--output', 'staging/navigation-exports')); const mode = argument('--mode', 'staging'); const locale = argument('--locale', 'pt');
  const result = buildNavigationExports(JSON.parse(fs.readFileSync(inputPath, 'utf8')), { mode, locale }); fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'saints.jsonl'), result.saints.length ? `${result.saints.map((item) => JSON.stringify(item)).join('\n')}\n` : '', 'utf8');
  fs.writeFileSync(path.join(outputDir, 'saints-map.geojson'), stableJson(result.map), 'utf8'); fs.writeFileSync(path.join(outputDir, 'saints-timeline.json'), stableJson(result.timeline), 'utf8'); fs.writeFileSync(path.join(outputDir, 'daily-calendar.json'), stableJson(result.calendar), 'utf8'); fs.writeFileSync(path.join(outputDir, 'manifest.json'), stableJson(result.manifest), 'utf8'); process.stdout.write(`${JSON.stringify(result.manifest, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { main().catch((error) => { console.error(error); process.exit(1); }); }

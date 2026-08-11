#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = 'data/litcal-mirror/calendars/general';
const DEFAULT_OUTPUT = 'staging/roman-calendar-baseline/candidate.json';
const PRODUCT_LOCALES = ['en','es','pt','fr','fil','ru','sw','de','it','pl'];
const SOURCE_LOCALE_MAP = new Map([
  ['en_US','en'],['en_GB','en'],['es_ES','es'],['es_MX','es'],['pt_PT','pt'],['pt_BR','pt'],
  ['fr_FR','fr'],['fr_CA','fr'],['de_DE','de'],['it_IT','it'],['ru_RU','ru'],['pl_PL','pl']
]);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function record(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : null; }
function text(value) { return typeof value === 'string' && value.trim() ? value.trim() : typeof value === 'number' && Number.isFinite(value) ? String(value) : null; }
function list(value) { return Array.isArray(value) ? value.flatMap(item => typeof item === 'string' ? [item] : []) : text(value) ? [text(value)] : []; }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function slug(value) { return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120) || 'event'; }
function directDate(value) {
  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/u)?.[0];
    if (match) return match;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0,10);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = new Date(value < 10_000_000_000 ? value * 1000 : value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0,10);
  }
  const nested = record(value);
  return nested ? directDate(nested.date ?? nested.dateISO ?? nested.timestamp ?? nested.value) : null;
}
function eventCandidates(payload) {
  if (Array.isArray(payload)) return payload;
  const root = record(payload);
  if (!root) return [];
  const candidate = root.LitCal ?? root.litcal ?? root.events ?? root.calendar ?? root.data;
  if (Array.isArray(candidate)) return candidate;
  const object = record(candidate);
  return object ? Object.values(object).flatMap(value => Array.isArray(value) ? value : [value]) : [];
}
function normalizeEvent(raw, index) {
  const item = record(raw);
  if (!item) return null;
  const name = text(item.name ?? item.name_lcl ?? item.title ?? item.event_name ?? record(item.event)?.name);
  const dateISO = directDate(item.date ?? item.dateISO ?? item.datetime ?? item.timestamp ?? record(item.event)?.date);
  if (!name || !dateISO) return null;
  const sourceEventId = text(item.event_key ?? item.event_idx ?? item.id) ?? `${slug(name)}-${dateISO}-${index}`;
  const gradeNumberRaw = item.grade;
  const gradeNumber = typeof gradeNumberRaw === 'number' && Number.isFinite(gradeNumberRaw)
    ? gradeNumberRaw
    : typeof gradeNumberRaw === 'string' && /^-?\d+(?:\.\d+)?$/u.test(gradeNumberRaw.trim())
      ? Number(gradeNumberRaw)
      : null;
  return {
    sourceEventId,
    name,
    dateISO,
    gradeNumber,
    gradeLabel: text(item.grade_lcl ?? item.grade ?? item.rank ?? item.precedence),
    colour: list(item.color_lcl ?? item.color ?? item.colour),
    common: list(item.common_lcl ?? item.common),
    season: text(item.liturgical_season_lcl ?? item.liturgical_season ?? item.season_lcl ?? item.season),
    raw: item
  };
}
function localeFromFilename(name) { return SOURCE_LOCALE_MAP.get(name.replace(/\.json$/u,'')) ?? null; }
function sourceFilesForYear(root, year) {
  const dir = path.join(root, String(year));
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith('.json') && localeFromFilename(name)).sort();
}
function normalizeSearch(value) { return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim(); }
function isVigil(event) {
  const id = normalizeSearch(event.sourceEventId);
  const name = normalizeSearch(event.name);
  return id.includes('vigil') || name.includes('vigil mass') || name.endsWith(' vigil');
}
function isGenericWeekday(event) {
  if (event.gradeNumber !== null) return event.gradeNumber <= 0;
  const grade = normalizeSearch(event.gradeLabel);
  return ['weekday','feria','ferial'].some(token => grade === token || grade.includes(token));
}
function shouldInclude(event) {
  if (isVigil(event)) return false;
  if (isGenericWeekday(event)) return false;
  return true;
}
function categoryFor(event) {
  const name = normalizeSearch(event.name);
  const common = normalizeSearch(event.common.join(' '));
  const all = `${name} ${common}`;
  if (/blessed virgin mary|our lady|immaculate conception|assumption of.*mary|nativity of.*mary|presentation of.*mary/u.test(all)) return 'marian';
  if (/apostle|apostles|evangelist/u.test(all)) return 'apostle';
  if (/martyr|martyrs/u.test(all)) return 'martyr';
  if (/^blessed\b/u.test(name)) return 'feast';
  if (/^saint\b|^saints\b|\bst\b/u.test(name) || /pastors|doctors of the church|virgins|holy men|holy women/u.test(common)) return 'saint';
  return 'feast';
}
function eventKey(event) { return `${event.sourceEventId}|${event.dateISO}`; }
function colourCode(event) { return event.colour.length ? slug(event.colour[0]) : null; }
function rankCode(event) { return slug(event.gradeLabel ?? (event.gradeNumber === null ? 'unknown' : `grade-${event.gradeNumber}`)); }

export function buildRomanLitcalBaseline({ root = DEFAULT_ROOT, years } = {}) {
  const availableYears = fs.existsSync(root)
    ? fs.readdirSync(root).filter(value => /^\d{4}$/u.test(value)).map(Number).sort((a,b) => a-b)
    : [];
  const selectedYears = (years?.length ? years : availableYears).filter(year => availableYears.includes(year));
  if (!selectedYears.length) throw new Error('No LitCal General Roman Calendar mirror years are available.');

  const occurrences = [];
  const sourceFiles = [];
  const missingEnglishYears = [];
  const localeEventCounts = Object.fromEntries(PRODUCT_LOCALES.map(locale => [locale, 0]));
  const excluded = { genericWeekday: 0, vigil: 0 };

  for (const year of selectedYears) {
    const files = sourceFilesForYear(root, year);
    const byLocale = new Map();
    for (const file of files) {
      const locale = localeFromFilename(file);
      const filePath = path.join(root, String(year), file);
      const payload = readJson(filePath);
      const events = eventCandidates(payload).map(normalizeEvent).filter(Boolean);
      byLocale.set(locale, new Map(events.map(event => [eventKey(event), event])));
      sourceFiles.push({ year, locale, path: filePath, sha256: sha256(fs.readFileSync(filePath)) });
    }
    const english = byLocale.get('en');
    if (!english) {
      missingEnglishYears.push(year);
      continue;
    }
    for (const event of english.values()) {
      if (isVigil(event)) { excluded.vigil += 1; continue; }
      if (isGenericWeekday(event)) { excluded.genericWeekday += 1; continue; }
      if (!shouldInclude(event)) continue;
      const labels = [];
      for (const [locale, events] of byLocale.entries()) {
        const translated = events.get(eventKey(event));
        if (!translated?.name) continue;
        labels.push({ locale, name: translated.name.normalize('NFC').trim(), translationStatus: 'source', sourceLocale: locale });
        localeEventCounts[locale] = (localeEventCounts[locale] ?? 0) + 1;
      }
      const canonicalEventId = `roman:${slug(event.sourceEventId)}`;
      occurrences.push({
        id: `roman-general:${event.dateISO}:${slug(event.sourceEventId)}`,
        sourceId: 'litcal-api',
        sourceEventId: event.sourceEventId,
        churchId: 'roman-catholic',
        jurisdictionId: null,
        canonicalEventId,
        dateISO: event.dateISO,
        category: categoryFor(event),
        rankCode: rankCode(event),
        colourCode: colourCode(event),
        nativeCalendarSystem: 'gregorian',
        sourceGradeNumber: event.gradeNumber,
        sourceGradeLabel: event.gradeLabel,
        sourceSeason: event.season,
        labels,
        sourceRecordHash: sha256(JSON.stringify(event.raw)),
        publicationStatus: 'withheld',
        validationStatus: 'provisional'
      });
    }
  }

  const byCategory = {};
  const byYear = {};
  for (const occurrence of occurrences) {
    byCategory[occurrence.category] = (byCategory[occurrence.category] ?? 0) + 1;
    const year = occurrence.dateISO.slice(0,4);
    byYear[year] = (byYear[year] ?? 0) + 1;
  }
  const duplicateIds = [...new Set(occurrences.map(item => item.id).filter((id, index, all) => all.indexOf(id) !== index))];
  const localesPresent = PRODUCT_LOCALES.filter(locale => (localeEventCounts[locale] ?? 0) > 0);
  const missingProductLocales = PRODUCT_LOCALES.filter(locale => !localesPresent.includes(locale));

  return {
    schemaVersion: 1,
    stage: 'calendar-baseline-candidate',
    generatedAt: new Date().toISOString(),
    sourceId: 'litcal-api',
    churchId: 'roman-catholic',
    calendarId: 'general-roman-calendar',
    selectedYears,
    policy: {
      candidateDefault: 'withheld',
      productionWrites: false,
      sourceRole: 'reference-calendar-engine',
      normativeAuthority: false,
      editorialTextIncluded: false,
      sourceLocaleLabelsOnly: true
    },
    sourceFiles,
    occurrences,
    summary: {
      occurrenceCount: occurrences.length,
      excluded,
      byCategory,
      byYear,
      localeEventCounts,
      localesPresent,
      missingProductLocales,
      missingEnglishYears,
      duplicateIds
    }
  };
}

export function auditRomanLitcalBaseline(candidate) {
  const errors = [];
  const warnings = [];
  if (candidate?.stage !== 'calendar-baseline-candidate') errors.push('stage must remain calendar-baseline-candidate');
  if (candidate?.policy?.productionWrites !== false || candidate?.policy?.candidateDefault !== 'withheld') errors.push('candidate publication boundary is not fail-closed');
  const ids = new Set();
  const years = new Set(candidate?.selectedYears ?? []);
  const counts = Object.fromEntries([...years].map(year => [String(year), 0]));
  for (const item of candidate?.occurrences ?? []) {
    if (ids.has(item.id)) errors.push(`duplicate occurrence id ${item.id}`);
    ids.add(item.id);
    if (item.publicationStatus !== 'withheld' || item.validationStatus !== 'provisional') errors.push(`candidate ${item.id} crossed publication/validation boundary`);
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(item.dateISO)) errors.push(`invalid date ${item.id}`);
    if (item.churchId !== 'roman-catholic') errors.push(`unexpected Church ${item.id}`);
    if (!['saint','feast','marian','apostle','martyr'].includes(item.category)) errors.push(`unsupported category ${item.id}`);
    if (normalizeSearch(item.sourceEventId).includes('vigil')) errors.push(`vigil leaked into candidate ${item.id}`);
    if (item.sourceGradeNumber !== null && item.sourceGradeNumber <= 0) errors.push(`generic weekday grade leaked into candidate ${item.id}`);
    if (!Array.isArray(item.labels) || !item.labels.some(label => label.locale === 'en' && label.translationStatus === 'source')) errors.push(`English source label missing ${item.id}`);
    if (item.labels.some(label => !PRODUCT_LOCALES.includes(label.locale) || label.translationStatus !== 'source')) errors.push(`invalid label policy ${item.id}`);
    counts[item.dateISO.slice(0,4)] = (counts[item.dateISO.slice(0,4)] ?? 0) + 1;
  }
  for (const [year, count] of Object.entries(counts)) {
    if (count < 80) errors.push(`year ${year} has suspiciously low selected coverage: ${count}`);
    if (count > 400) errors.push(`year ${year} has suspiciously high selected coverage: ${count}`);
  }
  if ((candidate?.summary?.missingProductLocales ?? []).length) warnings.push(`missing product locales: ${candidate.summary.missingProductLocales.join(', ')}`);
  if ((candidate?.summary?.missingEnglishYears ?? []).length) errors.push(`missing English mirror years: ${candidate.summary.missingEnglishYears.join(', ')}`);
  return { ok: errors.length === 0, errors, warnings, occurrenceCount: candidate?.occurrences?.length ?? 0, byYear: counts };
}

async function main() {
  const root = path.resolve(argument('--root', DEFAULT_ROOT));
  const output = path.resolve(argument('--output', DEFAULT_OUTPUT));
  const yearsArg = argument('--years');
  const years = yearsArg ? yearsArg.split(',').map(value => Number(value.trim())).filter(Number.isInteger) : undefined;
  const candidate = buildRomanLitcalBaseline({ root, years });
  const audit = auditRomanLitcalBaseline(candidate);
  if (!audit.ok) throw new Error(`Roman LitCal baseline audit failed: ${audit.errors.join('; ')}`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ ...candidate.summary, auditWarnings: audit.warnings }, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write(`Roman LitCal baseline failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

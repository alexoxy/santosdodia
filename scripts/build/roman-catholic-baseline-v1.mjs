import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const year = Number(argument('--year', String(new Date().getUTCFullYear())));
const outputPath = path.resolve(argument('--output', `reports/product-build/roman-catholic-${year}.json`));
const portugalIcsPath = argument('--portugal-ics');
const spanishRomcalPath = argument('--spanish-romcal');
const mirrorRoot = path.resolve(argument('--mirror-root', 'data/litcal-mirror/calendars/general'));
const publicLocales = ['en', 'pt', 'es', 'fr', 'it'];
const mirrorLocales = { en: 'en_US', fr: 'fr_FR', it: 'it_IT', pt: 'pt_PT', es: 'es_ES' };

if (!Number.isInteger(year) || year < 1970 || year > 2200) throw new Error(`Invalid year: ${year}`);

function readJsonIfPresent(file) {
  if (!file) return null;
  try { return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')); } catch { return null; }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function daysInYear(value) {
  return ((value % 4 === 0 && value % 100 !== 0) || value % 400 === 0) ? 366 : 365;
}

function allDates(value) {
  const result = [];
  const date = new Date(Date.UTC(value, 0, 1));
  const end = new Date(Date.UTC(value + 1, 0, 1));
  while (date < end) {
    result.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return result;
}

function isVigil(event) {
  return /_vigil$/i.test(String(event.id ?? ''));
}

function rankWeight(grade) {
  const value = String(grade ?? '').toLowerCase();
  if (/precedence|precedenza|préséance/.test(value)) return 100;
  if (/solemn|solenn|solennité/.test(value)) return 90;
  if (/feast of the lord|festa del signore|fête du seigneur/.test(value)) return 80;
  if (/feast|festa|fête/.test(value)) return 70;
  if (/memorial|memoria|mémoire/.test(value) && !/optional|facoltativa|facultative/.test(value)) return 60;
  if (/optional|facoltativa|facultative/.test(value)) return 50;
  if (/weekday|feria|férie/.test(value)) return 10;
  return 30;
}

function categoryFor(event) {
  const id = String(event.id ?? '');
  const name = String(event.name ?? '').toLowerCase();
  if (/ourlady|mary|bvm|immaculate|assumption|motherofgod|fatima|lourdes/i.test(id) || /mary|madre di dio|vergine maria|marie|notre-dame/.test(name)) return 'marian';
  if (/^sts?/i.test(id) || /saint|saints|san |sant'|santi |sainte? |saints? /.test(name)) return /martyr|martire/.test(name) ? 'martyr' : 'saint';
  return 'feast';
}

function normalizeEvents(payload, locale) {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  return events
    .filter((event) => String(event.dateISO ?? '').startsWith(`${year}-`))
    .filter((event) => !isVigil(event))
    .map((event) => ({
      id: String(event.id ?? ''),
      canonicalEventId: `rc:${String(event.id ?? '')}`,
      dateISO: String(event.dateISO ?? ''),
      name: String(event.name ?? '').trim(),
      grade: event.grade == null ? null : String(event.grade),
      colour: Array.isArray(event.colour) ? event.colour.map(String) : event.colour == null ? null : String(event.colour),
      season: event.season == null ? null : String(event.season),
      category: categoryFor(event),
      locale,
      sourceRecordHash: sha256(JSON.stringify(event)),
    }))
    .filter((event) => event.id && /^\d{4}-\d{2}-\d{2}$/.test(event.dateISO) && event.name);
}

function unfoldIcs(text) {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
}

function unescapeIcs(value) {
  return String(value ?? '')
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function portugueseRank(line) {
  const match = String(line ?? '').match(/\s+[–-]\s+(SOLENIDADE|FESTA|MO|MF|MEMÓRIA OBRIGATÓRIA|MEMÓRIA FACULTATIVA)\s*$/iu);
  if (!match) return { label: String(line ?? '').trim(), sourceRank: null, canonicalRank: null };
  const sourceRank = match[1].toUpperCase();
  const canonicalRank = sourceRank === 'SOLENIDADE'
    ? 'solemnity'
    : sourceRank === 'FESTA'
      ? 'feast'
      : sourceRank === 'MO' || sourceRank === 'MEMÓRIA OBRIGATÓRIA'
        ? 'memorial'
        : 'optional-memorial';
  return {
    label: String(line).slice(0, match.index).trim(),
    sourceRank,
    canonicalRank,
  };
}

function parsePortugalIcs(file) {
  if (!file) return { available: false, reason: 'not-provided', events: [], uniqueDates: 0, coverageRatio: 0 };
  let text;
  try { text = fs.readFileSync(path.resolve(file), 'utf8'); } catch {
    return { available: false, reason: 'unreadable', events: [], uniqueDates: 0, coverageRatio: 0 };
  }
  const unfolded = unfoldIcs(text);
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1).map((block) => block.split('END:VEVENT')[0]);
  const events = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    let dateISO = null;
    let summary = null;
    let description = null;
    for (const line of lines) {
      const separator = line.indexOf(':');
      if (separator < 0) continue;
      const key = line.slice(0, separator).toUpperCase();
      const value = line.slice(separator + 1);
      if (key.startsWith('DTSTART')) {
        const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
        if (match) dateISO = `${match[1]}-${match[2]}-${match[3]}`;
      } else if (key === 'SUMMARY') summary = unescapeIcs(value);
      else if (key === 'DESCRIPTION') description = unescapeIcs(value);
    }
    if (!dateISO?.startsWith(`${year}-`) || !summary) continue;
    const firstDescriptionLine = String(description ?? '').split(/\n/u).map((item) => item.trim()).find(Boolean) ?? null;
    const parsed = portugueseRank(firstDescriptionLine ?? summary);
    events.push({
      dateISO,
      liturgicalDayLabel: summary.trim(),
      displayLabel: parsed.label || summary.trim(),
      sourceRank: parsed.sourceRank,
      canonicalRank: parsed.canonicalRank,
      description,
    });
  }
  const uniqueDates = new Set(events.map((event) => event.dateISO)).size;
  return {
    available: true,
    source: 'https://www.liturgia.pt/agenda/agenda.ics',
    eventCount: events.length,
    uniqueDates,
    coverageRatio: Number((uniqueDates / daysInYear(year)).toFixed(4)),
    events,
  };
}

function normalizeSpanishRomcal(payload) {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  return events
    .map((event) => ({
      dateISO: String(event.dateISO ?? event.date ?? '').slice(0, 10),
      id: String(event.id ?? event.key ?? ''),
      name: String(event.name ?? '').trim(),
      rank: event.rank == null ? null : String(event.rank),
    }))
    .filter((event) => event.dateISO.startsWith(`${year}-`) && event.name);
}

const localePayloads = {};
const localeEvents = {};
for (const locale of publicLocales) {
  const upstreamLocale = mirrorLocales[locale];
  const file = path.join(mirrorRoot, String(year), `${upstreamLocale}.json`);
  const payload = readJsonIfPresent(file);
  localePayloads[locale] = {
    upstreamLocale,
    file: path.relative('.', file),
    available: Boolean(payload),
    eventCount: Number(payload?.eventCount ?? payload?.events?.length ?? 0),
  };
  localeEvents[locale] = payload ? normalizeEvents(payload, locale) : [];
}

const reference = localeEvents.en;
if (!reference.length) throw new Error(`Missing English LitCal reference stream for ${year}.`);

const dates = allDates(year);
const eventsByDate = new Map(dates.map((date) => [date, []]));
for (const event of reference) eventsByDate.get(event.dateISO)?.push(event);
const emptyDates = dates.filter((date) => !(eventsByDate.get(date)?.length));
const primaryByDate = dates.map((date) => {
  const candidates = [...(eventsByDate.get(date) ?? [])].sort((a, b) => rankWeight(b.grade) - rankWeight(a.grade) || a.name.localeCompare(b.name));
  return { dateISO: date, primary: candidates[0] ?? null, secondary: candidates.slice(1) };
});

const referenceIds = new Set(reference.map((event) => event.id));
const rawLabelCompleteness = {};
for (const locale of publicLocales) {
  const byId = new Map(localeEvents[locale].map((event) => [event.id, event.name]));
  let matched = 0;
  for (const id of referenceIds) if (byId.has(id)) matched += 1;
  rawLabelCompleteness[locale] = {
    sourceAvailable: localePayloads[locale].available,
    referenceEvents: referenceIds.size,
    matchedEvents: matched,
    missingEvents: referenceIds.size - matched,
    completeness: referenceIds.size ? Number((matched / referenceIds.size).toFixed(4)) : 0,
    launchGate: false,
  };
}

const portugal = parsePortugalIcs(portugalIcsPath);
const portugueseByDate = new Map(portugal.events.map((event) => [event.dateISO, event]));
const spanishRomcal = normalizeSpanishRomcal(readJsonIfPresent(spanishRomcalPath));
const spanishByDate = new Map();
for (const event of spanishRomcal) {
  const current = spanishByDate.get(event.dateISO) ?? [];
  current.push(event);
  spanishByDate.set(event.dateISO, current);
}

const localizedById = Object.fromEntries(['en', 'fr', 'it'].map((locale) => [locale, new Map(localeEvents[locale].map((event) => [event.id, event]))]));
const daily = primaryByDate.map(({ dateISO, primary, secondary }) => {
  const labels = {};
  if (primary) {
    for (const locale of ['en', 'fr', 'it']) {
      const localized = localizedById[locale].get(primary.id);
      if (localized?.name) labels[locale] = { label: localized.name, source: 'litcal-api', sourceEventId: primary.id };
    }
  }
  const pt = portugueseByDate.get(dateISO);
  if (pt?.displayLabel) labels.pt = {
    label: pt.displayLabel,
    liturgicalDayLabel: pt.liturgicalDayLabel,
    source: 'portugal-national-liturgy-secretariat',
    sourceRank: pt.sourceRank,
    canonicalRank: pt.canonicalRank,
  };
  const esCandidates = spanishByDate.get(dateISO) ?? [];
  if (esCandidates[0]?.name) labels.es = {
    label: esCandidates[0].name,
    source: 'romcal-general-roman-es',
    sourceEventId: esCandidates[0].id,
    sourceRank: esCandidates[0].rank,
    authorityScope: 'localization-crosscheck-only',
  };
  return {
    dateISO,
    primary: primary ? { id: primary.id, canonicalEventId: primary.canonicalEventId, name: primary.name, grade: primary.grade, category: primary.category } : null,
    secondaryCount: secondary.length,
    labels,
  };
});

const dailyLocaleCompleteness = {};
for (const locale of publicLocales) {
  const missingDates = daily.filter((item) => !item.labels[locale]?.label).map((item) => item.dateISO);
  dailyLocaleCompleteness[locale] = {
    expectedDays: dates.length,
    localizedDays: dates.length - missingDates.length,
    missingDates,
    completeness: Number(((dates.length - missingDates.length) / dates.length).toFixed(4)),
  };
}

const launchReady = emptyDates.length === 0
  && publicLocales.every((locale) => dailyLocaleCompleteness[locale].completeness === 1)
  && portugal.available
  && portugal.uniqueDates === daysInYear(year);

const report = {
  schemaVersion: 2,
  build: 'roman-catholic-product-baseline-v1',
  generatedAt: new Date().toISOString(),
  year,
  churchId: 'roman-catholic',
  targetJurisdiction: 'pt',
  targetPublicLocales: publicLocales,
  sources: {
    generalRomanReference: {
      id: 'litcal-api',
      role: 'reference-engine',
      base: 'https://litcal.johnromanodorazio.com/api/v5',
      mirror: 'data/litcal-mirror/calendars/general',
    },
    portugalOfficial: {
      id: 'portugal-national-liturgy-secretariat',
      role: 'official-jurisdiction',
      page: 'https://www.liturgia.pt/agenda/',
      ics: 'https://www.liturgia.pt/agenda/agenda.ics',
    },
    spanishLocalization: {
      id: 'romcal-general-roman-es',
      role: 'B2-localization-crosscheck',
      repository: 'romcal/romcal',
      version: '3.0.0-dev.125',
      pinnedSourceCommit: '878e05a56909e3adf58a85d3b6f0e9ddba3e8c5b',
      calendarAuthority: false,
    },
  },
  calendarCoverage: {
    expectedDays: daysInYear(year),
    coveredDays: dates.length - emptyDates.length,
    emptyDates,
    falseEmptyCount: emptyDates.length,
    referenceEventCount: reference.length,
    primaryDays: primaryByDate.filter((item) => item.primary).length,
  },
  localeSources: localePayloads,
  rawLabelCompleteness,
  dailyLocaleCompleteness,
  portugalOfficial: {
    available: portugal.available,
    reason: portugal.reason ?? null,
    eventCount: portugal.eventCount ?? 0,
    uniqueDates: portugal.uniqueDates ?? 0,
    coverageRatio: portugal.coverageRatio ?? 0,
  },
  spanishLocalization: {
    available: spanishRomcal.length > 0,
    eventCount: spanishRomcal.length,
    uniqueDates: new Set(spanishRomcal.map((event) => event.dateISO)).size,
  },
  productReadiness: {
    launchReady,
    blockers: [
      ...(emptyDates.length ? [`${emptyDates.length} calendar day(s) have no reference event`] : []),
      ...publicLocales.filter((locale) => dailyLocaleCompleteness[locale].completeness < 1).map((locale) => `${locale}: ${dailyLocaleCompleteness[locale].missingDates.length} public day label(s) missing`),
      ...(!portugal.available ? ['Portugal official ICS was not acquired in this build'] : []),
      ...(portugal.available && portugal.uniqueDates !== daysInYear(year) ? [`Portugal official ICS covers ${portugal.uniqueDates}/${daysInYear(year)} days`] : []),
    ],
  },
  daily,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  build: report.build,
  year,
  calendarCoverage: report.calendarCoverage,
  dailyLocaleCompleteness: report.dailyLocaleCompleteness,
  portugalOfficial: report.portugalOfficial,
  spanishLocalization: report.spanishLocalization,
  productReadiness: report.productReadiness,
}, null, 2));

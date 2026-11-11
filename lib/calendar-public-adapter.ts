import type {
  CalendarSystem,
  Category,
  Observance,
  Tradition,
  ValidationStatus,
} from '../data/observances';
import type { Locale, LocalizedText } from './i18n';
import type { CalendarOccurrenceRecord } from './calendar-d1-read-model';
import { normalizeDisplayLabel, normalizeDisplaySentence } from './linguistic/normalize-display-label.mjs';
import canonicalObservances from '../data/canonical-observance-anchors.json' with { type: 'json' };
import canonicalOccurrences from '../data/canonical-occurrence-anchors.json' with { type: 'json' };
import canonicalBridges from '../data/canonical-occurrence-legacy-bridges.json' with { type: 'json' };
import localizationReview from '../data/releases/roman-catholic-pt-2026.localization-v2.json' with { type: 'json' };

const KNOWN_TRADITIONS = new Set<Tradition>([
  'roman-catholic',
  'greek-orthodox',
  'eastern-orthodox',
  'anglican',
  'coptic-orthodox',
  'armenian-apostolic',
  'ethiopian-orthodox',
  'syriac-orthodox',
]);
const KNOWN_CATEGORIES = new Set<Category>([
  'saint',
  'feast',
  'marian',
  'apostle',
  'martyr',
  'fast',
]);
const KNOWN_CALENDAR_SYSTEMS = new Set<CalendarSystem>([
  'gregorian',
  'julian',
  'revised-julian',
  'coptic',
  'ethiopian',
  'armenian',
  'mixed',
]);
const KNOWN_LOCALES = new Set<Locale>([
  'en',
  'es',
  'pt',
  'fr',
  'fil',
  'ru',
  'sw',
  'de',
  'it',
  'pl',
]);

function knownTradition(value: string): Tradition | null {
  return KNOWN_TRADITIONS.has(value as Tradition) ? (value as Tradition) : null;
}

function knownCategory(value: string | undefined): Category | null {
  return value && KNOWN_CATEGORIES.has(value as Category) ? (value as Category) : null;
}

function calendarSystem(value: string | undefined): CalendarSystem {
  return value && KNOWN_CALENDAR_SYSTEMS.has(value as CalendarSystem)
    ? (value as CalendarSystem)
    : 'mixed';
}

function publicValidation(value: string): ValidationStatus | null {
  return value === 'verified' || value === 'cross-checked' ? value : null;
}

function supportedLocale(value: string): Locale | null {
  const base = value.trim().toLowerCase().replace('_', '-').split('-')[0];
  const alias = base === 'tl' || base === 'ph' ? 'fil' : base;
  return KNOWN_LOCALES.has(alias as Locale) ? (alias as Locale) : null;
}

function reviewedCalendarLabel(canonicalEventId: string, locale: Locale): string | undefined {
  const exact = localizationReview.canonicalLabels as Record<string, Partial<Record<Locale, string>>>;
  const exactLabel = exact[canonicalEventId]?.[locale];
  if (exactLabel) return exactLabel;
  for (const entry of localizationReview.canonicalLabelPatterns) {
    if (!new RegExp(entry.canonicalEventIdPattern, 'u').test(canonicalEventId)) continue;
    const labels = entry.labels as Partial<Record<Locale, string>>;
    if (labels[locale]) return labels[locale];
  }
  return undefined;
}

export function isRubricalPublicLabel(value: string, locale: Locale): boolean {
  if (locale !== 'pt') return false;
  return /^(?:branco|verde|vermelho|roxo|rosa)\s*[–—-]|^(?:para\s+(?:o\s+)?(?:of[ií]cio|a\s+missa)|of[ií]cio\s+|missa\s+|omite-se\s+|celebra-se\s+|onde\s+se\s+celebra|roga[cç][oõ]es\b|ladainha\b|te\s+deum\b|gl[oó]ria\b|credo\b|v[eé]speras\b|i\s+v[eé]sp)/iu.test(value.trim());
}

function hasKnownLabelIdentityConflict(
  record: CalendarOccurrenceRecord,
  locale: Locale,
  value: string,
): boolean {
  return locale === 'pt' &&
    /^rc:SatMemBVM[0-9]+$/u.test(record.canonicalEventId) &&
    semanticName(value) === semanticName('Santo Nome de Maria');
}

function normalizedLabels(
  record: CalendarOccurrenceRecord,
  requestedLocale: Locale,
): {
  names: LocalizedText;
  summaries?: Partial<Record<Locale, string>>;
  name: string;
  summary?: string;
  translationStatus: 'source' | 'editorial';
} | null {
  const names: Partial<Record<Locale, string>> = {};
  const summaries: Partial<Record<Locale, string>> = {};
  const statuses: string[] = [];

  for (const label of Object.values(record.labels)) {
    const locale = supportedLocale(label.locale);
    if (!locale) continue;
    const name = normalizeDisplayLabel(label.name.normalize('NFC').trim(), locale) as string;
    if (!name) continue;
    if (!names[locale]) names[locale] = name;
    const rawDescription = label.description?.normalize('NFC').trim();
    const description = rawDescription ? normalizeDisplaySentence(rawDescription, locale) as string : undefined;
    if (description && !summaries[locale]) summaries[locale] = description;
    statuses.push(label.translationStatus);
  }

  const reviewed = reviewedCalendarLabel(record.canonicalEventId, requestedLocale);
  if (reviewed) names[requestedLocale] = reviewed;

  // Public product rule: a launched locale must never silently fall back to
  // English (or any other language). If the requested label is absent, the D1
  // record is withheld and the repository fallback may handle the request.
  const preferred = names[requestedLocale];
  if (
    !preferred ||
    !names.en ||
    isRubricalPublicLabel(preferred, requestedLocale) ||
    hasKnownLabelIdentityConflict(record, requestedLocale, preferred)
  ) return null;
  const summary = summaries[requestedLocale];
  return {
    names: names as LocalizedText,
    summaries: Object.keys(summaries).length ? summaries : undefined,
    name: preferred,
    summary,
    translationStatus: statuses.every((status) => status === 'source') ? 'source' : 'editorial',
  };
}

export function calendarOccurrenceToObservance(
  record: CalendarOccurrenceRecord,
  locale: Locale,
): Observance | null {
  if (record.publicationStatus !== 'published') return null;
  const validationStatus = publicValidation(record.validationStatus);
  if (!validationStatus) return null;

  const tradition = knownTradition(record.churchId);
  if (!tradition) return null;
  const category = knownCategory(record.category);
  if (!category) return null;
  const labels = normalizedLabels(record, locale);
  if (!labels) return null;

  const month = Number(record.dateISO.slice(5, 7));
  const day = Number(record.dateISO.slice(8, 10));
  if (!Number.isInteger(month) || !Number.isInteger(day)) return null;

  return {
    id: record.canonicalEventId,
    month,
    day,
    traditions: [tradition],
    category,
    calendarSystem: calendarSystem(record.nativeCalendarSystem),
    names: labels.names,
    summaries: labels.summaries,
    countries: record.countryCode ? [record.countryCode.toUpperCase()] : undefined,
    sourceIds: [`d1:${record.id}`],
    translationStatus: labels.translationStatus,
    validationStatus,
    dateISO: record.dateISO,
    name: labels.name,
    summary: labels.summary,
  };
}

function observanceKey(item: Observance): string {
  return `${item.dateISO}|${item.traditions.slice().sort().join(',')}|${item.id}`;
}

const canonicalOccurrenceById = new Map(
  canonicalOccurrences.occurrences.map((item) => [item.id, item]),
);
const canonicalObservanceIds = new Set(
  canonicalObservances.observances.map((item) => item.id),
);

function canonicalObservanceIdentity(item: Observance): string | null {
  if (!item.traditions.includes('roman-catholic')) return null;

  const bridged = canonicalBridges.bridges.find((entry) =>
    entry.legacyObservanceId === item.id && entry.dateISO === item.dateISO,
  );
  if (bridged) return canonicalOccurrenceById.get(bridged.occurrenceId)?.observanceId ?? null;

  const directId = `observance:${item.id}:roman-catholic`;
  if (canonicalObservanceIds.has(directId)) return directId;

  return canonicalObservances.observances.find((entry) =>
    entry.churchId === 'church:roman-catholic' &&
    entry.subjects.some((subject) => subject.kind === 'person' && subject.personId === item.id),
  )?.id ?? null;
}

function semanticName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function semanticObservanceKey(item: Observance): string {
  return `${item.dateISO}|${item.traditions.slice().sort().join(',')}|${semanticName(item.name)}`;
}

function combineEquivalentObservances(curated: Observance, published: Observance): Observance {
  return {
    ...curated,
    ...published,
    id: curated.id,
    names: { ...curated.names, ...published.names },
    summaries: curated.summaries || published.summaries
      ? { ...curated.summaries, ...published.summaries }
      : undefined,
    countries: [...new Set([...(curated.countries ?? []), ...(published.countries ?? [])])],
    sourceIds: [...new Set([...curated.sourceIds, ...published.sourceIds])],
    validationStatus: curated.validationStatus === 'verified' || published.validationStatus === 'verified'
      ? 'verified'
      : 'cross-checked',
  };
}

export function mergePublicCalendarObservances(
  curated: Observance[],
  d1Records: CalendarOccurrenceRecord[],
  locale: Locale,
): { items: Observance[]; acceptedD1: number; withheldD1: number } {
  const merged = new Map<string, Observance>();
  const curatedCanonicalKeys = new Map<string, string>();
  const curatedSemanticKeys = new Map<string, string>();
  for (const item of curated) {
    const key = observanceKey(item);
    merged.set(key, item);
    const canonicalIdentity = canonicalObservanceIdentity(item);
    if (canonicalIdentity) curatedCanonicalKeys.set(`${item.dateISO}|${canonicalIdentity}`, key);
    curatedSemanticKeys.set(semanticObservanceKey(item), key);
  }

  let acceptedD1 = 0;
  let withheldD1 = 0;
  for (const record of d1Records) {
    const item = calendarOccurrenceToObservance(record, locale);
    if (!item) {
      withheldD1 += 1;
      continue;
    }
    acceptedD1 += 1;
    const canonicalIdentity = canonicalObservanceIdentity(item);
    const equivalentKey = canonicalIdentity
      ? curatedCanonicalKeys.get(`${item.dateISO}|${canonicalIdentity}`)
      : undefined;
    const curatedKey = equivalentKey ?? curatedSemanticKeys.get(semanticObservanceKey(item));
    if (curatedKey) {
      const curatedItem = merged.get(curatedKey);
      if (curatedItem) merged.set(curatedKey, combineEquivalentObservances(curatedItem, item));
      continue;
    }
    merged.set(observanceKey(item), item);
  }

  return {
    items: [...merged.values()].sort((left, right) =>
      left.dateISO.localeCompare(right.dateISO) || left.name.localeCompare(right.name, locale),
    ),
    acceptedD1,
    withheldD1,
  };
}

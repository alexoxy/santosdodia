import {
  CATEGORIES,
  parseCategory,
  parseTradition,
  type CalendarSystem,
  type Observance,
  type ValidationStatus,
} from '../data/observances';
import {
  normalizeLocale,
  SUPPORTED_LOCALES,
  type Locale,
  type LocalizedText,
} from './i18n';
import type { CalendarOccurrenceRecord } from './calendar-d1-read-model';

const CALENDAR_SYSTEMS = new Set<CalendarSystem>([
  'gregorian',
  'julian',
  'revised-julian',
  'coptic',
  'ethiopian',
  'armenian',
  'mixed',
]);
const SUPPORTED_LOCALE_BASES = new Set<string>(SUPPORTED_LOCALES);

function calendarSystem(value: string | undefined): CalendarSystem {
  return value && CALENDAR_SYSTEMS.has(value as CalendarSystem)
    ? (value as CalendarSystem)
    : 'mixed';
}

function publicValidation(value: string): ValidationStatus | null {
  return value === 'verified' || value === 'cross-checked' ? value : null;
}

function supportedLocale(value: string): Locale | null {
  const base = value.trim().toLowerCase().replace('_', '-').split('-')[0];
  const alias = base === 'tl' || base === 'ph' ? 'fil' : base;
  return SUPPORTED_LOCALE_BASES.has(alias) ? normalizeLocale(alias) : null;
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
    const name = label.name.normalize('NFC').trim();
    if (!name) continue;
    if (!names[locale]) names[locale] = name;
    const description = label.description?.normalize('NFC').trim();
    if (description && !summaries[locale]) summaries[locale] = description;
    statuses.push(label.translationStatus);
  }

  const preferred = names[requestedLocale] ?? names.en ?? Object.values(names)[0];
  if (!preferred) return null;
  if (!names.en) names.en = preferred;
  const summary = summaries[requestedLocale] ?? summaries.en ?? Object.values(summaries)[0];
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

  const tradition = parseTradition(record.churchId);
  if (!tradition) return null;
  const category = parseCategory(record.category);
  if (!category || !CATEGORIES.includes(category)) return null;
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

export function mergePublicCalendarObservances(
  curated: Observance[],
  d1Records: CalendarOccurrenceRecord[],
  locale: Locale,
): { items: Observance[]; acceptedD1: number; withheldD1: number } {
  const merged = new Map<string, Observance>();
  for (const item of curated) merged.set(observanceKey(item), item);

  let acceptedD1 = 0;
  let withheldD1 = 0;
  for (const record of d1Records) {
    const item = calendarOccurrenceToObservance(record, locale);
    if (!item) {
      withheldD1 += 1;
      continue;
    }
    acceptedD1 += 1;
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

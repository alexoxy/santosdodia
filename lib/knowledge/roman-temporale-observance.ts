import type { Observance, ObservanceFilters } from '../../data/observances';
import type { Locale, LocalizedText } from '../i18n';
import {
  localizeRomanTemporaleDay,
  localizeRomanTemporaleSummary,
  type LiturgicalToolLocale
} from './liturgical-calendar-localization';
import { romanDateContext, ROMAN_PORTUGAL_POLICY } from './roman-liturgical-year';

const PUBLIC_TEMPORALE_LOCALES = ['en', 'pt', 'es', 'it'] as const satisfies readonly LiturgicalToolLocale[];

function supportsTemporaleLocale(locale: Locale): locale is LiturgicalToolLocale {
  return (PUBLIC_TEMPORALE_LOCALES as readonly string[]).includes(locale);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function enumerateDateRange(fromDate: string, toDate: string): string[] {
  if (!validDate(fromDate) || !validDate(toDate) || fromDate > toDate) {
    throw new RangeError('Calculated Temporale range must contain valid ascending Gregorian dates.');
  }
  const dates: string[] = [];
  const cursor = new Date(`${fromDate}T00:00:00Z`);
  while (cursor.toISOString().slice(0, 10) <= toDate) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function calculatedRomanTemporaleIsEligible(
  locale: Locale,
  filters: ObservanceFilters
): boolean {
  return supportsTemporaleLocale(locale) &&
    (!filters.tradition || filters.tradition === 'roman-catholic') &&
    filters.country?.toUpperCase() === 'PT' &&
    !filters.patronage &&
    (!filters.category || filters.category === 'feast');
}

export function calculateRomanTemporaleObservance(
  dateISO: string,
  locale: LiturgicalToolLocale
): Observance {
  const context = romanDateContext(dateISO, ROMAN_PORTUGAL_POLICY);
  const names = Object.fromEntries(PUBLIC_TEMPORALE_LOCALES.map(value => [
    value,
    localizeRomanTemporaleDay(value, dateISO, context)
  ])) as LocalizedText;
  const summaries = Object.fromEntries(PUBLIC_TEMPORALE_LOCALES.map(value => [
    value,
    localizeRomanTemporaleSummary(value, context)
  ]));
  return {
    id: `calculated:${ROMAN_PORTUGAL_POLICY.id}:${dateISO}`,
    month: Number(dateISO.slice(5, 7)),
    day: Number(dateISO.slice(8, 10)),
    traditions: ['roman-catholic'],
    category: 'feast',
    calendarSystem: 'gregorian',
    names,
    summaries,
    countries: ['PT'],
    summarySourceIds: ['holy-see-universal-norms-liturgical-year', 'snl-portugal-precedence-table'],
    summaryTranslationStatus: 'editorial',
    sourceIds: ['holy-see-universal-norms-liturgical-year', 'snl-portugal-precedence-table'],
    translationStatus: 'editorial',
    validationStatus: 'cross-checked',
    dateISO,
    name: names[locale]!,
    summary: summaries[locale]
  };
}

export function addCalculatedRomanTemporaleFallback(
  items: Observance[],
  options: {
    fromDate: string;
    toDate: string;
    locale: Locale;
    filters: ObservanceFilters;
  }
): { items: Observance[]; calculated: number } {
  if (!calculatedRomanTemporaleIsEligible(options.locale, options.filters)) {
    return { items, calculated: 0 };
  }
  const romanDates = new Set(items
    .filter(item => item.traditions.includes('roman-catholic'))
    .map(item => item.dateISO));
  const calculated = enumerateDateRange(options.fromDate, options.toDate)
    .filter(dateISO => !romanDates.has(dateISO))
    .map(dateISO => calculateRomanTemporaleObservance(dateISO, options.locale as LiturgicalToolLocale));
  return {
    items: [...items, ...calculated].sort((left, right) =>
      left.dateISO.localeCompare(right.dateISO) || left.name.localeCompare(right.name, options.locale)
    ),
    calculated: calculated.length
  };
}

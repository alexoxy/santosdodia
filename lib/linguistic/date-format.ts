import type { Locale } from '../i18n';

export const DATE_LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-GB',
  es: 'es-ES',
  pt: 'pt-PT',
  fr: 'fr-FR',
  fil: 'fil-PH',
  ru: 'ru-RU',
  sw: 'sw-TZ',
  de: 'de-DE',
  it: 'it-IT',
  pl: 'pl-PL',
};

export type DateTextContext = 'running' | 'standalone' | 'heading';

function dateFromISO(dateISO: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(dateISO)) throw new RangeError(`Invalid ISO date: ${dateISO}`);
  const date = new Date(`${dateISO}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateISO) {
    throw new RangeError(`Invalid civil date: ${dateISO}`);
  }
  return date;
}

function uppercaseFirstLetter(value: string, localeTag: string): string {
  const characters = Array.from(value);
  const index = characters.findIndex((character) => /\p{L}/u.test(character));
  if (index < 0) return value;
  characters[index] = characters[index].toLocaleUpperCase(localeTag);
  return characters.join('');
}

function applyContext(value: string, localeTag: string, context: DateTextContext): string {
  if (context === 'running') return value;
  // Sentence/heading casing changes only the first lexical character. Never
  // title-case every word: Portuguese date prepositions must remain lowercase.
  return uppercaseFirstLetter(value, localeTag);
}

export function formatLocalizedDate(
  dateISO: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
  context: DateTextContext = 'running',
): string {
  const localeTag = DATE_LOCALE_TAGS[locale];
  const value = new Intl.DateTimeFormat(localeTag, {
    ...options,
    timeZone: 'UTC',
  }).format(dateFromISO(dateISO));
  return applyContext(value, localeTag, context);
}

export function formatFullCivilDate(dateISO: string, locale: Locale, context: DateTextContext = 'running'): string {
  return formatLocalizedDate(dateISO, locale, { dateStyle: 'full' }, context);
}

export function formatMonthYear(dateISO: string, locale: Locale, context: DateTextContext = 'running'): string {
  return formatLocalizedDate(dateISO, locale, { month: 'long', year: 'numeric' }, context);
}

export function formatWeekday(dateISO: string, locale: Locale, context: DateTextContext = 'running'): string {
  return formatLocalizedDate(dateISO, locale, { weekday: 'long' }, context);
}

export function formatDayMonthYear(dateISO: string, locale: Locale, context: DateTextContext = 'running'): string {
  return formatLocalizedDate(dateISO, locale, { day: 'numeric', month: 'long', year: 'numeric' }, context);
}

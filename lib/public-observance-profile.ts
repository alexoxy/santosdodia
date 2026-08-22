import { canonicalPersonName, getCanonicalPersonAnchor } from '../data/canonical-person-profiles';
import type { Observance } from '../data/observances';
import type { Locale } from './i18n';
import { getPublicAllObservances } from './public-observances';
import { mergePublishedCalendarRange } from './public-calendar-runtime';

const PERSON_CATEGORIES = new Set(['saint', 'apostle', 'martyr']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function getPublishedPersonObservanceById(
  id: string,
  year: number,
  locale: Locale,
  dateISO?: string,
): Promise<Observance | null> {
  const curated = getPublicAllObservances(year, locale);
  const direct = curated.find((item) => item.id === id);
  if (direct && PERSON_CATEGORIES.has(direct.category)) return direct;

  const boundedDate = dateISO && ISO_DATE.test(dateISO) && dateISO.startsWith(`${year}-`)
    ? dateISO
    : undefined;
  const runtime = await mergePublishedCalendarRange(curated, {
    fromDate: boundedDate ?? `${year}-01-01`,
    toDate: boundedDate ?? `${year}-12-31`,
    locale,
  });
  const item = runtime.items.find((candidate) => candidate.id === id);
  return item && PERSON_CATEGORIES.has(item.category) ? item : null;
}


export async function getPublishedCanonicalPersonProfileById(
  id: string,
  year: number,
  locale: Locale,
  dateISO?: string,
): Promise<Observance | null> {
  const person = getCanonicalPersonAnchor(id);
  if (!person) return null;

  const observance = await getPublishedPersonObservanceById(
    person.primaryObservanceId,
    year,
    locale,
    dateISO,
  );
  if (!observance) return null;

  return {
    ...observance,
    id: person.id,
    category: person.category,
    names: person.names,
    name: canonicalPersonName(person, locale),
    summaries: undefined,
    summary: undefined,
    summarySourceIds: undefined,
    summaryTranslationStatus: undefined,
    translationStatus: 'editorial',
  };
}

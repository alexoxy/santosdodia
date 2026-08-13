import type { Observance } from '../data/observances';
import type { Locale } from './i18n';
import { getPublicAllObservances } from './public-observances';
import { mergePublishedCalendarRange } from './public-calendar-runtime';

const PERSON_CATEGORIES = new Set(['saint', 'apostle', 'martyr']);

export async function getPublishedPersonObservanceById(
  id: string,
  year: number,
  locale: Locale,
): Promise<Observance | null> {
  const curated = getPublicAllObservances(year, locale);
  const direct = curated.find((item) => item.id === id);
  if (direct && PERSON_CATEGORIES.has(direct.category)) return direct;

  const runtime = await mergePublishedCalendarRange(curated, {
    fromDate: `${year}-01-01`,
    toDate: `${year}-12-31`,
    locale,
  });
  const item = runtime.items.find((candidate) => candidate.id === id);
  return item && PERSON_CATEGORIES.has(item.category) ? item : null;
}

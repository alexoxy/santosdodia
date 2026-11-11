import type { Observance, ObservanceFilters } from '../data/observances';
import type { Locale } from './i18n';
import { readCalendarOccurrences } from './calendar-d1-read-model';
import { mergePublicCalendarObservances } from './calendar-public-adapter';
import { getOptionalCalendarDatabase } from './cloudflare-calendar-db';
import { addCalculatedRomanTemporaleFallback } from './knowledge/roman-temporale-observance';

export type PublicCalendarRuntimeMeta = {
  sourceMode:
    | 'approved-repository'
    | 'published-d1+approved-repository'
    | 'calculated-roman-temporale+approved-repository'
    | 'published-d1+calculated-roman-temporale+approved-repository';
  calculatedTemporale: number;
  d1: {
    bound: boolean;
    status: 'unbound' | 'not-requested' | 'ok' | 'bounded' | 'fallback-error';
    publishedAccepted: number;
    withheldByAdapter: number;
    resultLimit: number;
  };
};

export async function mergePublishedCalendarRange(
  curated: Observance[],
  options: {
    fromDate: string;
    toDate: string;
    locale: Locale;
    filters?: ObservanceFilters;
    includeCalculatedTemporale?: boolean;
  },
): Promise<{ items: Observance[]; meta: PublicCalendarRuntimeMeta }> {
  const filters = options.filters ?? {};
  const database = await getOptionalCalendarDatabase();
  let status: PublicCalendarRuntimeMeta['d1']['status'] = database ? 'not-requested' : 'unbound';
  let d1Records = [] as Awaited<ReturnType<typeof readCalendarOccurrences>>;

  // Patronage is not yet part of the calendar occurrence read model. When a
  // patronage filter is requested, preserve the curated knowledge fallback
  // rather than returning calendar rows that cannot satisfy that constraint.
  if (database && !filters.patronage) {
    try {
      d1Records = await readCalendarOccurrences(database, {
        fromDate: options.fromDate,
        toDate: options.toDate,
        churchId: filters.tradition,
        countryCode: filters.country,
        locales: [...new Set([options.locale, 'en'])],
        mode: 'public',
        limit: 500,
        offset: 0,
      });
      status = d1Records.length === 500 ? 'bounded' : 'ok';
    } catch {
      d1Records = [];
      status = 'fallback-error';
    }
  }

  if (filters.category) {
    d1Records = d1Records.filter((item) => item.category === filters.category);
  }

  const merged = mergePublicCalendarObservances(curated, d1Records, options.locale);
  const withCalculated = options.includeCalculatedTemporale === false
    ? { items: merged.items, calculated: 0 }
    : addCalculatedRomanTemporaleFallback(merged.items, {
        fromDate: options.fromDate,
        toDate: options.toDate,
        locale: options.locale,
        filters,
      });
  const sourceMode = merged.acceptedD1
    ? withCalculated.calculated
      ? 'published-d1+calculated-roman-temporale+approved-repository'
      : 'published-d1+approved-repository'
    : withCalculated.calculated
      ? 'calculated-roman-temporale+approved-repository'
      : 'approved-repository';
  return {
    items: withCalculated.items,
    meta: {
      sourceMode,
      calculatedTemporale: withCalculated.calculated,
      d1: {
        bound: Boolean(database),
        status,
        publishedAccepted: merged.acceptedD1,
        withheldByAdapter: merged.withheldD1,
        resultLimit: 500,
      },
    },
  };
}

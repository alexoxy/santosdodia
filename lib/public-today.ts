import { getAnnualDateEditorial } from '../data/date-editorial';
import type { Observance, ObservanceFilters } from '../data/observances';
import {
  getSaintBiography,
  getSaintBiographyRecord,
} from '../data/saint-biography-registry';
import { localizedSummary } from './content-locale';
import type { Locale } from './i18n';
import { displayObservanceName, displayPatronages } from './locale-display';
import { getPublicObservancesForDate } from './public-observances';
import { mergePublishedCalendarRange, type PublicCalendarRuntimeMeta } from './public-calendar-runtime';
import { getExistingProfileId } from './runtime-profile-link';

export type TodayEditorial =
  | {
      kind: 'date';
      eyebrow: string;
      title: string;
      lead: string;
      context: string;
      href: string;
    }
  | {
      kind: 'profile';
      id: string;
      title: string;
      summary: string;
      paragraph?: string;
      href: string;
    };

export type PublicTodayPayload = {
  data: Observance[];
  editorial: TodayEditorial | null;
  meta: {
    date: string;
    locale: Locale;
    timeZone: string;
    timeZoneSource: 'explicit-date' | 'request' | 'utc-fallback';
    count: number;
    withheldForTranslation: number;
    filters: ObservanceFilters;
    live: false;
    requestedLive: boolean;
    sourceMode: PublicCalendarRuntimeMeta['sourceMode'];
    d1: PublicCalendarRuntimeMeta['d1'];
    generatedAt: string;
  };
};

export async function buildPublicToday(options: {
  date: string;
  locale: Locale;
  timeZone: string;
  timeZoneSource: PublicTodayPayload['meta']['timeZoneSource'];
  filters?: ObservanceFilters;
  requestedLive?: boolean;
}): Promise<PublicTodayPayload> {
  const filters = options.filters ?? {};
  const curated = getPublicObservancesForDate(options.date, options.locale, filters);
  const runtime = await mergePublishedCalendarRange(curated, {
    fromDate: options.date,
    toDate: options.date,
    locale: options.locale,
    filters,
  });
  const data = runtime.items
    .map((item) => ({
      ...item,
      originalName: item.name,
      name: displayObservanceName(item.names, options.locale, item.name),
      summary: localizedSummary(item, options.locale)?.text,
      patronages: displayPatronages(item.patronages, options.locale),
    }))
    .filter((item) => Boolean(item.name));

  const annual = getAnnualDateEditorial(options.date.slice(5), options.locale);
  let editorial: TodayEditorial | null = null;
  if (
    annual &&
    annual.observanceIds.some((id) => runtime.items.some((item) => item.id === id))
  ) {
    editorial = {
      kind: 'date',
      eyebrow: annual.eyebrow,
      title: annual.title,
      lead: annual.lead,
      context: annual.context,
      href: `/date/${options.date.slice(5)}`,
    };
  } else {
    const year = Number(options.date.slice(0, 4));
    for (const item of runtime.items) {
      const profileId = getExistingProfileId(item, year, options.locale);
      if (!profileId) continue;
      const record = getSaintBiographyRecord(profileId);
      if (!record?.summary[options.locale] || !record.paragraphs[options.locale]?.length) continue;
      const biography = getSaintBiography(profileId, options.locale);
      if (!biography) continue;
      editorial = {
        kind: 'profile',
        id: profileId,
        title: biography.title,
        summary: biography.summary,
        paragraph: biography.paragraphs[0],
        href: `/saint/${encodeURIComponent(profileId)}?date=${encodeURIComponent(options.date)}`,
      };
      break;
    }
  }

  return {
    data,
    editorial,
    meta: {
      date: options.date,
      locale: options.locale,
      timeZone: options.timeZone,
      timeZoneSource: options.timeZoneSource,
      count: data.length,
      withheldForTranslation: runtime.items.length - data.length,
      filters,
      live: false,
      requestedLive: Boolean(options.requestedLive),
      sourceMode: runtime.meta.sourceMode,
      d1: runtime.meta.d1,
      generatedAt: new Date().toISOString(),
    },
  };
}

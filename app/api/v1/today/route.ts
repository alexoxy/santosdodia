import { NextRequest } from "next/server";
import { getAnnualDateEditorial } from "../../../../data/date-editorial";
import { parseCategory, parseTradition } from "../../../../data/observances";
import {
  getSaintBiography,
  getSaintBiographyRecord,
} from "../../../../data/saint-biography-registry";
import { localizedSummary } from "../../../../lib/content-locale";
import { normalizeLocale } from "../../../../lib/i18n";
import {
  civilDateAtInstant,
  isValidIanaTimeZone,
  normalizeTimeZone,
} from "../../../../lib/knowledge/temporal-core";
import {
  displayObservanceName,
  displayPatronages,
} from "../../../../lib/locale-display";
import { getPublicObservancesForDate } from "../../../../lib/public-observances";
import { mergePublishedCalendarRange } from "../../../../lib/public-calendar-runtime";
import { getExistingProfileId } from "../../../../lib/runtime-profile-link";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = normalizeLocale(
    params.get("locale") ?? request.headers.get("accept-language"),
  );
  const requestedTimeZone = params.get("timezone") ?? params.get("tz");
  const timeZone = normalizeTimeZone(requestedTimeZone, "UTC");
  const explicitDate = params.get("date");
  const date = explicitDate ?? civilDateAtInstant(new Date(), timeZone);
  const filters = {
    tradition: parseTradition(params.get("tradition")),
    category: parseCategory(params.get("category")),
    country: params.get("country") ?? undefined,
  };
  const curated = getPublicObservancesForDate(date, locale, filters);
  const runtime = await mergePublishedCalendarRange(curated, {
    fromDate: date,
    toDate: date,
    locale,
    filters,
  });
  const data = runtime.items
    .map((item) => ({
      ...item,
      originalName: item.name,
      name: displayObservanceName(item.names, locale, item.name),
      summary: localizedSummary(item, locale)?.text,
      patronages: displayPatronages(item.patronages, locale),
    }))
    .filter((item) => Boolean(item.name));

  const annual = getAnnualDateEditorial(date.slice(5), locale);
  let editorial:
    | {
        kind: "date";
        eyebrow: string;
        title: string;
        lead: string;
        context: string;
        href: string;
      }
    | {
        kind: "profile";
        id: string;
        title: string;
        summary: string;
        paragraph?: string;
        href: string;
      }
    | null = null;

  if (
    annual &&
    annual.observanceIds.some((id) => runtime.items.some((item) => item.id === id))
  ) {
    editorial = {
      kind: "date",
      eyebrow: annual.eyebrow,
      title: annual.title,
      lead: annual.lead,
      context: annual.context,
      href: `/date/${date.slice(5)}`,
    };
  } else {
    const year = Number(date.slice(0, 4));
    for (const item of runtime.items) {
      const profileId = getExistingProfileId(item, year, locale);
      if (!profileId) continue;
      const record = getSaintBiographyRecord(profileId);
      if (!record?.summary[locale] || !record.paragraphs[locale]?.length) continue;
      const biography = getSaintBiography(profileId, locale);
      if (!biography) continue;
      editorial = {
        kind: "profile",
        id: profileId,
        title: biography.title,
        summary: biography.summary,
        paragraph: biography.paragraphs[0],
        href: `/saint/${encodeURIComponent(profileId)}?date=${encodeURIComponent(date)}`,
      };
      break;
    }
  }

  return Response.json(
    {
      data,
      editorial,
      meta: {
        date,
        locale,
        timeZone,
        timeZoneSource: explicitDate
          ? "explicit-date"
          : isValidIanaTimeZone(requestedTimeZone)
            ? "request"
            : "utc-fallback",
        count: data.length,
        withheldForTranslation: runtime.items.length - data.length,
        filters,
        live: false,
        requestedLive: params.has("live"),
        sourceMode: runtime.meta.sourceMode,
        d1: runtime.meta.d1,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": explicitDate
          ? "public, s-maxage=900, stale-while-revalidate=86400"
          : "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

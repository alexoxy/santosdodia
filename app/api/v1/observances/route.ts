import { NextRequest } from "next/server";
import { parseCategory, parseTradition } from "../../../../data/observances";
import {
  normalizeLocale,
  type Locale,
  type LocalizedText,
} from "../../../../lib/i18n";
import { localizedSummary } from "../../../../lib/content-locale";
import {
  displayObservanceName,
  displayPatronages,
} from "../../../../lib/locale-display";
import {
  getPublicAllObservances,
  getPublicMonthlyObservances,
  getPublicObservancesForDate,
} from "../../../../lib/public-observances";
import { enrichObservancesEditorial } from "../../../../lib/observance-editorial";
import { mergePublishedCalendarRange } from "../../../../lib/public-calendar-runtime";

function trustworthyNames(names: LocalizedText, locale: Locale): LocalizedText {
  if (locale === "en") return names;
  const localized = names[locale]?.normalize("NFC").trim();
  const english = names.en?.normalize("NFC").trim();
  if (
    !localized ||
    !english ||
    localized.toLocaleLowerCase() !== english.toLocaleLowerCase()
  )
    return names;
  const cleaned = { ...names };
  delete cleaned[locale];
  return cleaned;
}

function monthEnd(year: number, month: number): string {
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const locale = normalizeLocale(
    p.get("locale") ?? request.headers.get("accept-language"),
  );
  const now = new Date();
  const year = Number(p.get("year") ?? now.getUTCFullYear());
  const month = p.has("month") ? Number(p.get("month")) : undefined;
  const date = p.get("date") ?? undefined;
  const filters = {
    tradition: parseTradition(p.get("tradition")),
    category: parseCategory(p.get("category")),
    country: p.get("country") ?? undefined,
    patronage: p.get("patronage") ?? undefined,
  };
  if (!Number.isInteger(year) || year < 1900 || year > 2200)
    return Response.json({ error: "Invalid year." }, { status: 400 });
  if (
    month !== undefined &&
    (!Number.isInteger(month) || month < 1 || month > 12)
  )
    return Response.json({ error: "Invalid month." }, { status: 400 });
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return Response.json({ error: "Invalid date." }, { status: 400 });

  const curated = date
    ? getPublicObservancesForDate(date, locale, filters)
    : month
      ? getPublicMonthlyObservances(year, month - 1, locale, filters)
      : getPublicAllObservances(year, locale, filters);
  const fromDate = date ?? (month ? `${year}-${String(month).padStart(2, "0")}-01` : `${year}-01-01`);
  const toDate = date ?? (month ? monthEnd(year, month) : `${year}-12-31`);
  const runtime = await mergePublishedCalendarRange(curated, {
    fromDate,
    toDate,
    locale,
    filters,
  });
  const publicItems = enrichObservancesEditorial(runtime.items);
  const data = publicItems
    .map((item) => {
      const names = trustworthyNames(item.names, locale);
      const localizedItem = { ...item, names };
      return {
        ...localizedItem,
        originalName: item.name,
        name: displayObservanceName(names, locale, item.name),
        summary: localizedSummary(localizedItem, locale)?.text,
        patronages: displayPatronages(item.patronages, locale),
      };
    })
    .filter((item) => Boolean(item.name));

  return Response.json(
    {
      data,
      meta: {
        year,
        month,
        date,
        locale,
        count: data.length,
        withheldForTranslation: publicItems.length - data.length,
        filters,
        live: false,
        requestedLive: p.has("live"),
        sourceMode: runtime.meta.sourceMode,
        calculatedTemporale: runtime.meta.calculatedTemporale,
        d1: runtime.meta.d1,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

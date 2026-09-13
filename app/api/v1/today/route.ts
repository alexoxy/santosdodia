import { NextRequest } from "next/server";
import { parseCategory, parseTradition } from "../../../../data/observances";
import { normalizeLocale } from "../../../../lib/i18n";
import {
  civilDateAtInstant,
  isValidIanaTimeZone,
  normalizeTimeZone,
} from "../../../../lib/knowledge/temporal-core";
import { buildPublicToday } from "../../../../lib/public-today";

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
  const payload = await buildPublicToday({
    date,
    locale,
    timeZone,
    timeZoneSource: explicitDate
      ? "explicit-date"
      : isValidIanaTimeZone(requestedTimeZone)
        ? "request"
        : "utc-fallback",
    filters,
    requestedLive: params.has("live"),
  });

  return Response.json(
    {
      ...payload,
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

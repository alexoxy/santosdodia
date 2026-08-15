import type { NextRequest } from "next/server";
import { getObservanceById } from "../../../../../data/discovery";
import { traditionLabel } from "../../../../../data/observances";
import { validationStatusLabel } from "../../../../../lib/claim-evidence";
import { normalizeLocale, ui } from "../../../../../lib/i18n";
import { displayObservanceName, displayPatronages } from "../../../../../lib/locale-display";
import { getPublishedPersonObservanceById } from "../../../../../lib/public-observance-profile";
import { SITE_ORIGIN } from "../../../../../lib/site";

const escapeIcs = (value: string | undefined) =>
  String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
const compact = (value: string) => value.replaceAll("-", "");
function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return compact(date.toISOString().slice(0, 10));
}
function decodeRouteId(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: routeId } = await params;
  const id = decodeRouteId(routeId);
  const locale = normalizeLocale(
    request.nextUrl.searchParams.get("locale") ??
      request.headers.get("accept-language"),
  );
  const copy = ui[locale];
  const currentYear = new Date().getUTCFullYear();
  const items = (
    await Promise.all(
      Array.from({ length: 7 }, async (_, index) => {
        const year = currentYear + index;
        return (
          getObservanceById(id, year, locale) ??
          (await getPublishedPersonObservanceById(id, year, locale))
        );
      }),
    )
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!items.length)
    return new Response("Saint calendar feed not found.", { status: 404 });

  const first = items[0]!;
  const name = displayObservanceName(first.names, locale, first.name);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//santosdodia.com//Individual Saint Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `NAME:${escapeIcs(name)}`,
    `X-WR-CALNAME:${escapeIcs(name)}`,
    "X-PUBLISHED-TTL:PT24H",
  ];

  for (const item of items) {
    const localized = displayObservanceName(item.names, locale, item.name);
    const patronages = displayPatronages(item.patronages, locale);
    const traditions = item.traditions
      .map((value) => traditionLabel(copy, value))
      .join(", ");
    const description = [
      traditions,
      patronages.length
        ? `${copy.patronage}: ${patronages.join(", ")}`
        : undefined,
      `${copy.validation}: ${validationStatusLabel(item.validationStatus, locale)}`,
    ]
      .filter(Boolean)
      .join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.id}-${item.dateISO}@santosdodia.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(item.dateISO)}`,
      `DTEND;VALUE=DATE:${nextDate(item.dateISO)}`,
      `SUMMARY:${escapeIcs(localized)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `URL:${SITE_ORIGIN}/saint/${encodeURIComponent(item.id)}?date=${encodeURIComponent(item.dateISO)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${id}.ics"`,
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

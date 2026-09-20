import type { Metadata } from "next";
import { cookies } from "next/headers";
import { parseTradition } from "../../data/observances";
import CalendarProductNav from "../components/CalendarProductNav";
import CalendarProgressiveExplorer from "../components/CalendarProgressiveExplorer";
import TraditionFeeds from "../components/TraditionFeeds";
import { defaultReadyCalendarCountry } from "../../lib/calendar-publication-readiness";
import { dateISOInTimeZone, normalizeTimeZone } from "../../lib/date-context";
import { ui } from "../../lib/i18n";
import { addCalculatedRomanTemporaleFallback } from "../../lib/knowledge/roman-temporale-observance";
import { formatMonthYear } from "../../lib/linguistic/date-format";
import { displayObservanceName } from "../../lib/locale-display";
import { getPublicMonthlyObservances } from "../../lib/public-observances";
import { requestPublicLocale } from "../../lib/request-public-locale";

function decodeCookie(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestPublicLocale();
  const copy = ui[locale];
  return {
    title: copy.calendarTitle,
    description: copy.calendarIntro,
    alternates: { canonical: "/calendar" },
    robots: { index: false, follow: true },
  };
}

export default async function CalendarPage() {
  const locale = await requestPublicLocale();
  const copy = ui[locale];
  const cookieStore = await cookies();
  const savedChurch = cookieStore.get("sdd-tradition")?.value;
  const tradition =
    savedChurch === "all"
      ? undefined
      : parseTradition(savedChurch) ?? "roman-catholic";
  const country = defaultReadyCalendarCountry(tradition);
  const timeZone = normalizeTimeZone(
    decodeCookie(cookieStore.get("sdd-timezone")?.value),
  );
  const todayISO = dateISOInTimeZone(timeZone);
  const year = Number(todayISO.slice(0, 4));
  const month = Number(todayISO.slice(5, 7)) - 1;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const fromDate = iso(year, month, 1);
  const toDate = iso(year, month, daysInMonth);
  const filters = { tradition, country };
  const curated = getPublicMonthlyObservances(year, month, locale, filters);
  const { items } = addCalculatedRomanTemporaleFallback(curated, {
    fromDate,
    toDate,
    locale,
    filters,
  });
  const monthTitle = formatMonthYear(fromDate, locale, "heading");

  return (
    <div className="page-stack">
      <CalendarProductNav />
      <CalendarProgressiveExplorer>
        <>
          <section className="page-hero compact-hero">
            <div>
              <span className="eyebrow">
                {copy.global} · {copy.approvedData}
              </span>
              <h1>{copy.calendarTitle}</h1>
              <p>{copy.calendarIntro}</p>
            </div>
            <div className="hero-symbol" aria-hidden="true">
              ☼
            </div>
          </section>
          <section className="calendar-card" aria-label={copy.calendarTitle}>
            <div className="calendar-toolbar">
              <h2>{monthTitle}</h2>
            </div>
            <div className="calendar-mobile-agenda">
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(
                (day) => {
                  const date = iso(year, month, day);
                  const list = items.filter((item) => item.dateISO === date);
                  const weekday = new Intl.DateTimeFormat(locale, {
                    weekday: "short",
                    timeZone: "UTC",
                  }).format(new Date(`${date}T12:00:00Z`));
                  return (
                    <div
                      className={`calendar-mobile-day${date === todayISO ? " is-today" : ""}`}
                      key={date}
                    >
                      <a className="calendar-mobile-date" href={`/day/${date}`}>
                        <strong>{day}</strong>
                        <span>{weekday}</span>
                      </a>
                      <div className="calendar-mobile-items">
                        {list.length ? (
                          list.slice(0, 6).map((item) => {
                            const name = displayObservanceName(
                              item.names,
                              locale,
                              item.name,
                            );
                            return name ? (
                              <a
                                className="calendar-mobile-observance"
                                href={`/day/${date}#observance-${encodeURIComponent(item.id)}`}
                                key={item.id}
                              >
                                {name}
                              </a>
                            ) : null;
                          })
                        ) : (
                          <span className="calendar-mobile-empty">—</span>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        </>
      </CalendarProgressiveExplorer>
      <TraditionFeeds />
    </div>
  );
}

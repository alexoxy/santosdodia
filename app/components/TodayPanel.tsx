"use client";
import { useEffect, useMemo, useState } from "react";
import {
  traditionClass,
  type Observance,
} from "../../data/observances";
import { dateISOInTimeZone } from "../../lib/date-context";
import {
  defaultReadyCalendarCountry,
  PUBLIC_CALENDAR_RUNTIME_VERSION,
} from "../../lib/calendar-publication-readiness";
import type { Locale } from "../../lib/i18n";
import {
  formatMonthYear,
  formatWeekday,
} from "../../lib/linguistic/date-format";
import { displayObservanceName } from "../../lib/locale-display";
import { displayObservanceScope } from "../../lib/observance-scope";
import { getPublicObservancesForDate } from "../../lib/public-observances";
import type { PublicTodayPayload, TodayEditorial } from "../../lib/public-today";
import {
  getExistingProfileId,
  isRuntimePersonProfileEligible,
} from "../../lib/runtime-profile-link";
import TraditionTag from "./TraditionTag";
import { useLanguage } from "./LanguageProvider";

const editorialUi: Partial<
  Record<
    Locale,
    {
      profileEyebrow: string;
      openProfile: string;
      openDate: string;
      calendarReference: string;
      calendarData: string;
    }
  >
> = {
  en: {
    profileEyebrow: "Understand today",
    openProfile: "Read the full editorial profile",
    openDate: "Explore this date",
    calendarReference: "Liturgical calendar reference",
    calendarData: "Reviewed and calculated calendar",
  },
  pt: {
    profileEyebrow: "Compreender o dia de hoje",
    openProfile: "Ler o perfil editorial completo",
    openDate: "Explorar esta data",
    calendarReference: "Referência do calendário litúrgico",
    calendarData: "Calendário revisto e calculado",
  },
  es: {
    profileEyebrow: "Comprender el día de hoy",
    openProfile: "Leer el perfil editorial completo",
    openDate: "Explorar esta fecha",
    calendarReference: "Referencia del calendario litúrgico",
    calendarData: "Calendario revisado y calculado",
  },
  it: {
    profileEyebrow: "Comprendere il giorno di oggi",
    openProfile: "Leggi il profilo editoriale completo",
    openDate: "Esplora questa data",
    calendarReference: "Riferimento del calendario liturgico",
    calendarData: "Calendario revisionato e calcolato",
  },
};

export default function TodayPanel({ initialToday }: { initialToday: PublicTodayPayload }) {
  const { locale, copy, countryName, timeZone, contextReady, church } =
      useLanguage(),
    dateISO = useMemo(() => dateISOInTimeZone(timeZone), [timeZone]),
    calendarCountry = defaultReadyCalendarCountry(church),
    calendarCountryName = useMemo(() => {
      if (!calendarCountry) return undefined;
      try {
        return new Intl.DisplayNames([locale], { type: "region" }).of(calendarCountry) ?? calendarCountry;
      } catch {
        return calendarCountry;
      }
    }, [calendarCountry, locale]);
  const fallback = useMemo(
    () =>
      getPublicObservancesForDate(dateISO, locale, {
        tradition: church === "all" ? undefined : church,
        country: calendarCountry,
      }),
    [dateISO, locale, church, calendarCountry],
  );
  const [items, setItems] = useState<Observance[]>(initialToday.data);
  const [editorial, setEditorial] = useState<TodayEditorial | null>(initialToday.editorial);
  const [activeContextKey, setActiveContextKey] = useState(
    `${initialToday.meta.date}|${initialToday.meta.locale}|${initialToday.meta.timeZone}|${initialToday.meta.filters.tradition ?? "all"}|${initialToday.meta.filters.country ?? ""}`,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contextReady) return;
    const controller = new AbortController(),
      params = new URLSearchParams({
        date: dateISO,
        locale,
        timezone: timeZone,
        calendarVersion: PUBLIC_CALENDAR_RUNTIME_VERSION,
      });
    if (church !== "all") params.set("tradition", church);
    if (calendarCountry) params.set("country", calendarCountry);
    const requestContextKey = `${dateISO}|${locale}|${timeZone}|${church}|${calendarCountry ?? ""}`;
    if (requestContextKey !== activeContextKey) {
      setItems(fallback);
      setEditorial(null);
      setActiveContextKey(requestContextKey);
    }
    setLoading(true);
    fetch(`/api/v1/today?${params}`, { signal: controller.signal })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Today request failed")),
      )
      .then((payload) => {
        if (Array.isArray(payload?.data)) setItems(payload.data);
        const nextEditorial = payload?.editorial;
        setEditorial(
          nextEditorial?.kind === "date" || nextEditorial?.kind === "profile"
            ? nextEditorial
            : null,
        );
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setItems(fallback);
          setEditorial(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [dateISO, locale, timeZone, church, calendarCountry, fallback, contextReady, activeContextKey]);

  const weekday = useMemo(
    () => formatWeekday(dateISO, locale, "standalone"),
    [dateISO, locale],
  );
  const monthYear = useMemo(
    () => formatMonthYear(dateISO, locale, "standalone"),
    [dateISO, locale],
  );
  const year = Number(dateISO.slice(0, 4));
  const editorialCopy = editorialUi[locale] ?? editorialUi.en!;

  if (!contextReady) {
    return (
      <section className="today-panel today-panel-loading" aria-live="polite">
        <div className="today-context-loading">{copy.loading}</div>
      </section>
    );
  }

  return (
    <section className="today-panel">
      <div className="today-date-card">
        <span className="eyebrow">{copy.today}</span>
        <strong className="today-day">{Number(dateISO.slice(8, 10))}</strong>
        <span className="today-date-label">{weekday}</span>
        <span className="today-date-context">{monthYear}</span>
        {countryName ? (
          <span className="region-pill">
            {copy.suggestedRegion}: {countryName}
          </span>
        ) : null}
        {calendarCountryName ? (
          <span className="region-pill">
            {editorialCopy.calendarReference}: {calendarCountryName}
          </span>
        ) : null}
      </div>
      <div className="today-content">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">
              {loading ? copy.loading : editorialCopy.calendarData}
            </span>
            <h2>{copy.saintsToday}</h2>
          </div>
          <a className="text-link" href={`/day/${dateISO}`}>
            {copy.openDay} →
          </a>
        </div>
        {items.length ? (
          <div className="observance-list">
            {items.slice(0, 18).map((item) => {
              const name = displayObservanceName(item.names, locale, item.name),
                scope = displayObservanceScope(item, locale, calendarCountry),
                existingProfileId = getExistingProfileId(item, year, locale),
                profileId =
                  existingProfileId ??
                  (isRuntimePersonProfileEligible(item) ? item.id : null),
                detailHref = profileId
                  ? `/saint/${encodeURIComponent(profileId)}?date=${encodeURIComponent(dateISO)}`
                  : `/day/${dateISO}#observance-${encodeURIComponent(item.id)}`;
              return name ? (
                <article
                  className="observance-row"
                  key={`${item.id}-${item.dateISO}`}
                >
                  <div
                    className={`tradition-dot ${traditionClass(item.traditions[0])}`}
                  />
                  <div>
                    <h3>
                      <a className="observance-title-link" href={detailHref}>
                        {name}
                      </a>
                    </h3>
                    <div className="tag-row">
                      {item.traditions.map((value) => (
                        <TraditionTag
                          key={value}
                          tradition={value}
                          compact
                        />
                      ))}
                      <span>{copy[item.category]}</span>
                    </div>
                    <span className={`scope-label scope-${scope.kind}`}>
                      {scope.label}
                    </span>
                  </div>
                </article>
              ) : null;
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span>✦</span>
            <p>{loading ? copy.loading : copy.noObservances}</p>
          </div>
        )}

        {editorial?.kind === "date" ? (
          <aside className="institutional-card" aria-label={editorial.title}>
            <span className="eyebrow">{editorial.eyebrow}</span>
            <h3>{editorial.title}</h3>
            <p>{editorial.lead}</p>
            <p>{editorial.context}</p>
            <a className="text-link" href={editorial.href}>
              {editorialCopy.openDate} →
            </a>
          </aside>
        ) : editorial?.kind === "profile" ? (
          <aside className="institutional-card" aria-label={editorial.title}>
            <span className="eyebrow">{editorialCopy.profileEyebrow}</span>
            <h3>{editorial.title}</h3>
            <p>{editorial.summary}</p>
            {editorial.paragraph ? <p>{editorial.paragraph}</p> : null}
            <a className="text-link" href={editorial.href}>
              {editorialCopy.openProfile} →
            </a>
          </aside>
        ) : null}

        <div className="today-actions">
          <a className="btn btn-primary" href="/calendar">
            {copy.viewCalendar}
          </a>
          <a
            className="btn btn-secondary"
            href={`/api/ical/${church === "all" ? "all" : church}?locale=${locale}${calendarCountry ? `&country=${calendarCountry}` : ""}`}
          >
            {copy.downloadIcs}
          </a>
        </div>
      </div>
    </section>
  );
}

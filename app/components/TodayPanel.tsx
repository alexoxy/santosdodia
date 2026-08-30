"use client";
import { useEffect, useMemo, useState } from "react";
import {
  traditionClass,
  type Observance,
} from "../../data/observances";
import { dateISOInTimeZone } from "../../lib/date-context";
import type { Locale } from "../../lib/i18n";
import {
  formatMonthYear,
  formatWeekday,
} from "../../lib/linguistic/date-format";
import { displayObservanceName } from "../../lib/locale-display";
import { displayObservanceScope } from "../../lib/observance-scope";
import { getPublicObservancesForDate } from "../../lib/public-observances";
import {
  getExistingProfileId,
  isRuntimePersonProfileEligible,
} from "../../lib/runtime-profile-link";
import TraditionTag from "./TraditionTag";
import { useLanguage } from "./LanguageProvider";

type TodayEditorial =
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
    };

const editorialUi: Partial<
  Record<
    Locale,
    {
      profileEyebrow: string;
      openProfile: string;
      openDate: string;
    }
  >
> = {
  en: {
    profileEyebrow: "Understand today",
    openProfile: "Read the full editorial profile",
    openDate: "Explore this date",
  },
  pt: {
    profileEyebrow: "Compreender o dia de hoje",
    openProfile: "Ler o perfil editorial completo",
    openDate: "Explorar esta data",
  },
  es: {
    profileEyebrow: "Comprender el día de hoy",
    openProfile: "Leer el perfil editorial completo",
    openDate: "Explorar esta fecha",
  },
  it: {
    profileEyebrow: "Comprendere il giorno di oggi",
    openProfile: "Leggi il profilo editoriale completo",
    openDate: "Esplora questa data",
  },
};

export default function TodayPanel() {
  const { locale, copy, country, countryName, timeZone, contextReady, church } =
      useLanguage(),
    dateISO = useMemo(() => dateISOInTimeZone(timeZone), [timeZone]);
  const fallback = useMemo(
    () =>
      getPublicObservancesForDate(dateISO, locale, {
        tradition: church === "all" ? undefined : church,
        country,
      }),
    [dateISO, locale, church, country],
  );
  const [items, setItems] = useState<Observance[]>([]);
  const [editorial, setEditorial] = useState<TodayEditorial | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contextReady) {
      setItems(fallback);
      setEditorial(null);
    }
  }, [fallback, contextReady]);

  useEffect(() => {
    if (!contextReady) return;
    const controller = new AbortController(),
      params = new URLSearchParams({ date: dateISO, locale, timezone: timeZone });
    if (church !== "all") params.set("tradition", church);
    if (country) params.set("country", country);
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
  }, [dateISO, locale, timeZone, church, country, fallback, contextReady]);

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
      </div>
      <div className="today-content">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">
              {loading ? copy.loading : copy.approvedData}
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
                scope = displayObservanceScope(item, locale, country),
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
            href={`/api/ical/${church === "all" ? "all" : church}?locale=${locale}${country ? `&country=${country}` : ""}`}
          >
            {copy.downloadIcs}
          </a>
        </div>
      </div>
    </section>
  );
}

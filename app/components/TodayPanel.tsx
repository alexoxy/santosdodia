"use client";
import { useEffect, useMemo, useState } from "react";
import {
  traditionClass,
  type Observance,
} from "../../data/observances";
import { getAnnualDateEditorial } from "../../data/date-editorial";
import {
  getSaintBiography,
  getSaintBiographyRecord,
} from "../../data/saint-biography-registry";
import { dateISOInTimeZone } from "../../lib/date-context";
import {
  formatMonthYear,
  formatWeekday,
} from "../../lib/linguistic/date-format";
import { displayObservanceName } from "../../lib/locale-display";
import { displayObservanceScope } from "../../lib/observance-scope";
import { getPublicObservancesForDate } from "../../lib/public-observances";
import { getExistingProfileId, isRuntimePersonProfileEligible } from "../../lib/runtime-profile-link";
import type { Locale } from "../../lib/i18n";
import TraditionTag from "./TraditionTag";
import { useLanguage } from "./LanguageProvider";

const editorialUi: Partial<Record<Locale, {
  profileEyebrow: string;
  openProfile: string;
  openDate: string;
}>> = {
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
  const [items, setItems] = useState<Observance[]>([]),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (contextReady) setItems(fallback);
  }, [fallback, contextReady]);
  useEffect(() => {
    if (!contextReady) return;
    const controller = new AbortController(),
      params = new URLSearchParams({ date: dateISO, locale, timezone: timeZone });
    if (church !== "all") params.set("tradition", church);
    if (country) params.set("country", country);
    setLoading(true);
    fetch(`/api/v1/observances?${params}`, { signal: controller.signal })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Today request failed")),
      )
      .then((payload) => {
        if (Array.isArray(payload?.data)) setItems(payload.data);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setItems(fallback);
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
  const annualEditorial = useMemo(() => {
    const editorial = getAnnualDateEditorial(dateISO.slice(5), locale);
    if (!editorial) return undefined;
    return editorial.observanceIds.some(id => items.some(item => item.id === id))
      ? editorial
      : undefined;
  }, [dateISO, locale, items]);
  const profileEditorial = useMemo(() => {
    if (annualEditorial) return undefined;
    for (const item of items) {
      const profileId = getExistingProfileId(item, year, locale);
      if (!profileId) continue;
      const record = getSaintBiographyRecord(profileId);
      if (!record?.summary[locale] || !record.paragraphs[locale]?.length) continue;
      const biography = getSaintBiography(profileId, locale);
      if (biography) return { id: profileId, biography };
    }
    return undefined;
  }, [annualEditorial, items, year, locale]);

  if (!contextReady) {
    return <section className="today-panel today-panel-loading" aria-live="polite">
      <div className="today-context-loading">{copy.loading}</div>
    </section>;
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
                profileId = existingProfileId ?? (isRuntimePersonProfileEligible(item) ? item.id : null),
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
                      {item.traditions.map((value) => <TraditionTag key={value} tradition={value} compact />)}
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

        {annualEditorial ? (
          <aside className="institutional-card" aria-label={annualEditorial.title}>
            <span className="eyebrow">{annualEditorial.eyebrow}</span>
            <h3>{annualEditorial.title}</h3>
            <p>{annualEditorial.lead}</p>
            <p>{annualEditorial.context}</p>
            <a className="text-link" href={`/date/${dateISO.slice(5)}`}>
              {editorialCopy.openDate} →
            </a>
          </aside>
        ) : profileEditorial ? (
          <aside className="institutional-card" aria-label={profileEditorial.biography.title}>
            <span className="eyebrow">{editorialCopy.profileEyebrow}</span>
            <h3>{profileEditorial.biography.title}</h3>
            <p>{profileEditorial.biography.summary}</p>
            {profileEditorial.biography.paragraphs[0] ? <p>{profileEditorial.biography.paragraphs[0]}</p> : null}
            <a className="text-link" href={`/saint/${encodeURIComponent(profileEditorial.id)}?date=${encodeURIComponent(dateISO)}`}>
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

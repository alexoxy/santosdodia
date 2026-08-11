"use client";
import { useEffect, useMemo, useState } from "react";
import {
  traditionClass,
  traditionLabel,
  TRADITIONS,
  type Category,
  type Observance,
} from "../../data/observances";
import { dateISOInTimeZone } from "../../lib/date-context";
import { formatMonthYear } from "../../lib/linguistic/date-format";
import { displayObservanceName } from "../../lib/locale-display";
import { getPublicMonthlyObservances } from "../../lib/public-observances";
import { useLanguage, type ChurchPreference } from "./LanguageProvider";

const categories: Category[] = [
  "saint",
  "feast",
  "marian",
  "apostle",
  "martyr",
  "fast",
];
function matrix(year: number, month: number) {
  const start = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7,
    days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
    cells: (number | null)[] = [
      ...Array.from({ length: start }, () => null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
  while (cells.length % 7) cells.push(null);
  return cells;
}
function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
type Country = { countryCode: string; name: string };

export default function CalendarExplorer() {
  const { locale, copy, country, timeZone, contextReady, church, setChurch } = useLanguage();
  const todayISO = useMemo(() => dateISOInTimeZone(timeZone), [timeZone]);
  const todayYear = Number(todayISO.slice(0, 4));
  const todayMonth = Number(todayISO.slice(5, 7)) - 1;
  const [year, setYear] = useState(todayYear),
    [month, setMonth] = useState(todayMonth),
    [category, setCategory] = useState<"all" | Category>("all"),
    [region, setRegion] = useState(country ?? "GLOBAL"),
    [countries, setCountries] = useState<Country[]>([]),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!contextReady) return;
    setYear(todayYear);
    setMonth(todayMonth);
  }, [contextReady, todayYear, todayMonth]);
  useEffect(() => {
    if (country && region === "GLOBAL") setRegion(country);
  }, [country, region]);
  useEffect(() => {
    fetch("/api/v1/religious-holidays?mode=countries")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (Array.isArray(payload?.data)) setCountries(payload.data);
      })
      .catch(() => undefined);
  }, []);
  const filters = useMemo(
    () => ({
      tradition: church === "all" ? undefined : church,
      category: category === "all" ? undefined : category,
      country: region === "GLOBAL" ? undefined : region,
    }),
    [church, category, region],
  );
  const fallback = useMemo(
    () => getPublicMonthlyObservances(year, month, locale, filters),
    [year, month, locale, filters],
  );
  const [items, setItems] = useState<Observance[]>([]);
  useEffect(() => {
    if (contextReady) setItems(fallback);
  }, [fallback, contextReady]);
  useEffect(() => {
    if (!contextReady) return;
    const controller = new AbortController(),
      params = new URLSearchParams({
        year: String(year),
        month: String(month + 1),
        locale,
        timezone: timeZone,
      });
    if (church !== "all") params.set("tradition", church);
    if (category !== "all") params.set("category", category);
    if (region !== "GLOBAL") params.set("country", region);
    setLoading(true);
    fetch(`/api/v1/observances?${params}`, { signal: controller.signal })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Calendar request failed")),
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
  }, [year, month, locale, timeZone, church, category, region, fallback, contextReady]);
  const weekdays = useMemo(() => {
    const base = new Date(Date.UTC(2026, 0, 5));
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "UTC",
      }).format(new Date(base.getTime() + index * 86400000)),
    );
  }, [locale]);
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  function shift(value: number) {
    const date = new Date(Date.UTC(year, month + value, 1));
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth());
  }
  const feedParams = new URLSearchParams({ locale });
  if (category !== "all") feedParams.set("category", category);
  if (region !== "GLOBAL") feedParams.set("country", region);
  const monthTitle = formatMonthYear(iso(year, month, 1), locale, "heading");
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  if (!contextReady) {
    return <section className="calendar-card calendar-context-loading" aria-live="polite">{copy.loading}</section>;
  }

  return (
    <div className="page-stack">
      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow">
            {copy.global} · {copy.approvedData}
          </span>
          <h1>{copy.calendarTitle}</h1>
          <p>{copy.calendarIntro}</p>
        </div>
        <div className="hero-symbol">☼</div>
      </section>
      <section className="filter-panel">
        <div className="filter-group">
          <label>{copy.tradition}</label>
          <select
            value={church}
            onChange={(event) =>
              setChurch(event.target.value as ChurchPreference)
            }
          >
            <option value="all">{copy.all}</option>
            {TRADITIONS.map((value) => (
              <option key={value} value={value}>
                {traditionLabel(copy, value)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{copy.category}</label>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as "all" | Category)
            }
          >
            <option value="all">{copy.allCategories}</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {copy[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{copy.country}</label>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="GLOBAL">{copy.global}</option>
            {countries.map((value) => (
              <option key={value.countryCode} value={value.countryCode}>
                {regionNames.of(value.countryCode) ?? value.name}
              </option>
            ))}
          </select>
        </div>
        {country ? (
          <button
            className="btn btn-tertiary filter-action"
            onClick={() => setRegion(country)}
          >
            {copy.localSuggestion}
          </button>
        ) : null}
      </section>
      <section className="calendar-card">
        <div className="calendar-toolbar">
          <button
            className="icon-button"
            aria-label={copy.previous}
            onClick={() => shift(-1)}
          >
            ←
          </button>
          <h2>{monthTitle}</h2>
          <button
            className="icon-button"
            aria-label={copy.next}
            onClick={() => shift(1)}
          >
            →
          </button>
        </div>
        {loading ? (
          <div className="data-loading" aria-live="polite">
            {copy.loading}
          </div>
        ) : null}
        <div className="calendar-scroll">
          <div className="calendar-grid">
            {weekdays.map((day) => (
              <div className="weekday" key={day}>
                {day}
              </div>
            ))}
            {matrix(year, month).map((day, index) => {
              const date = day ? iso(year, month, day) : "",
                list = day ? items.filter((item) => item.dateISO === date) : [],
                today = Boolean(day && date === todayISO);
              return (
                <div
                  className={`calendar-cell${day ? "" : " blank"}${today ? " is-today" : ""}`}
                  key={`${date}-${index}`}
                >
                  {day ? (
                    <>
                      <a className="day-number" href={`/day/${date}`}>
                        {day}
                      </a>
                      <div className="calendar-items">
                        {list.slice(0, 10).map((item) => {
                          const name = displayObservanceName(
                            item.names,
                            locale,
                            item.name,
                          );
                          return name ? (
                            <a
                              className={`calendar-observance ${traditionClass(item.traditions[0])}`}
                              href={`/day/${date}`}
                              key={item.id}
                            >
                              {name}
                            </a>
                          ) : null;
                        })}
                      </div>
                      {list.length > 10 ? (
                        <a className="calendar-more" href={`/day/${date}`}>
                          +{list.length - 10}
                        </a>
                      ) : null;
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="calendar-mobile-agenda">
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const date = iso(year, month, day);
            const list = items.filter((item) => item.dateISO === date);
            const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
            return <div className="calendar-mobile-day" key={date}>
              <a className="calendar-mobile-date" href={`/day/${date}`} aria-label={date}>
                <strong>{day}</strong>
                <span>{weekday}</span>
              </a>
              <div className="calendar-mobile-items">
                {list.length ? list.slice(0, 6).map((item) => {
                  const name = displayObservanceName(item.names, locale, item.name);
                  return name ? <a className={`calendar-mobile-observance ${traditionClass(item.traditions[0])}`} href={`/day/${date}`} key={item.id}>{name}</a> : null;
                }) : <span className="calendar-mobile-empty">—</span>}
              </div>
            </div>;
          })}
        </div>
        {!loading && !items.length ? (
          <div className="empty-state inline">
            <span>✦</span>
            <p>{copy.noResults}</p>
          </div>
        ) : null}
      </section>
      <section className="subscription-strip">
        <div>
          <span className="eyebrow">ICS · Google · Apple · Outlook</span>
          <h2>{copy.addCalendar}</h2>
        </div>
        <div className="button-row">
          <a
            className="btn btn-primary"
            href={`/api/ical/${church === "all" ? "all" : church}?${feedParams}`}
          >
            {copy.feedAll}
          </a>
          <a
            className="btn btn-secondary"
            href={`/api/ical/roman-catholic?locale=${locale}${region !== "GLOBAL" ? `&country=${region}` : ""}`}
          >
            {copy.feedCatholic}
          </a>
          <a
            className="btn btn-secondary"
            href={`/api/ical/eastern-orthodox?locale=${locale}`}
          >
            {copy.feedOrthodox}
          </a>
        </div>
      </section>
    </div>
  );
}

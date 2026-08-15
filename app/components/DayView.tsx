"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  isValidDateISO,
  traditionClass,
  type Observance,
} from "../../data/observances";
import { validationStatusLabel } from "../../lib/claim-evidence";
import { getFeatureCopy } from "../../lib/feature-copy";
import { type Locale } from "../../lib/i18n";
import {
  formatFullCivilDate,
  formatLocalizedDate,
} from "../../lib/linguistic/date-format";
import {
  displayCalendarSystem,
  displayObservanceName,
  displayPatronages,
} from "../../lib/locale-display";
import { getPublicObservancesForDate } from "../../lib/public-observances";
import { getExistingProfileId, isRuntimePersonProfileEligible } from "../../lib/runtime-profile-link";
import AddToCalendar from "./AddToCalendar";
import CandleButton from "./CandleButton";
import TraditionTag from "./TraditionTag";
import { useLanguage } from "./LanguageProvider";

type DayMode = "dated" | "annual";

type AnnualDayCopy = {
  eyebrow: string;
  body: (year: number) => string;
  datedLink: (year: number) => string;
  annualLink: string;
};

const annualDayCopy: Record<Locale, AnnualDayCopy> = {
  en: { eyebrow: "Celebrations on this date", body: year => `Saints and Christian celebrations associated with this civil date, resolved for ${year}. Movable feasts can fall on another date in other years.`, datedLink: year => `Open the ${year} calendar`, annualLink: "Explore this date every year" },
  pt: { eyebrow: "Celebrações nesta data", body: year => `Santos e celebrações cristãs associados a esta data civil, apresentados para ${year}. As festas móveis podem ocorrer noutra data noutros anos.`, datedLink: year => `Abrir o calendário de ${year}`, annualLink: "Explorar esta data todos os anos" },
  es: { eyebrow: "Celebraciones en esta fecha", body: year => `Santos y celebraciones cristianas asociados a esta fecha civil, presentados para ${year}. Las fiestas móviles pueden caer en otra fecha en otros años.`, datedLink: year => `Abrir el calendario de ${year}`, annualLink: "Explorar esta fecha cada año" },
  fr: { eyebrow: "Célébrations à cette date", body: year => `Saints et célébrations chrétiennes associés à cette date civile, présentés pour ${year}. Les fêtes mobiles peuvent tomber à une autre date selon les années.`, datedLink: year => `Ouvrir le calendrier ${year}`, annualLink: "Explorer cette date chaque année" },
  it: { eyebrow: "Celebrazioni in questa data", body: year => `Santi e celebrazioni cristiane associati a questa data civile, presentati per il ${year}. Le feste mobili possono cadere in una data diversa negli altri anni.`, datedLink: year => `Apri il calendario ${year}`, annualLink: "Esplora questa data ogni anno" },
  de: { eyebrow: "Feiern an diesem Datum", body: year => `Heilige und christliche Feiern, die mit diesem bürgerlichen Datum verbunden sind, für ${year} dargestellt. Bewegliche Feste können in anderen Jahren auf ein anderes Datum fallen.`, datedLink: year => `Kalender ${year} öffnen`, annualLink: "Dieses Datum jedes Jahr erkunden" },
  pl: { eyebrow: "Obchody tego dnia", body: year => `Święci i chrześcijańskie obchody związane z tą datą kalendarzową, przedstawione dla ${year} roku. Święta ruchome mogą w innych latach przypadać w innym dniu.`, datedLink: year => `Otwórz kalendarz na ${year} rok`, annualLink: "Przeglądaj tę datę co roku" },
  ru: { eyebrow: "Празднования в эту дату", body: year => `Святые и христианские празднования, связанные с этой календарной датой, показаны для ${year} года. Переходящие праздники в другие годы могут приходиться на другую дату.`, datedLink: year => `Открыть календарь на ${year} год`, annualLink: "Смотреть эту дату каждый год" },
  fil: { eyebrow: "Mga pagdiriwang sa petsang ito", body: year => `Mga santo at pagdiriwang Kristiyano na kaugnay ng petsang ito, ayon sa kalendaryo ng ${year}. Maaaring mapunta sa ibang petsa ang mga gumagalaw na kapistahan sa ibang taon.`, datedLink: year => `Buksan ang kalendaryo ng ${year}`, annualLink: "Tingnan ang petsang ito bawat taon" },
  sw: { eyebrow: "Maadhimisho katika tarehe hii", body: year => `Watakatifu na maadhimisho ya Kikristo yanayohusishwa na tarehe hii, kwa kalenda ya ${year}. Sikukuu zinazohama zinaweza kuangukia tarehe nyingine katika miaka mingine.`, datedLink: year => `Fungua kalenda ya ${year}`, annualLink: "Tazama tarehe hii kila mwaka" },
};

function summaryParagraphs(value: string | undefined): string[] {
  return String(value ?? "")
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function DayView({ dateISO, mode = "dated" }: { dateISO: string; mode?: DayMode }) {
  const { locale, copy } = useLanguage();
  const feature = getFeatureCopy(locale);
  const valid = isValidDateISO(dateISO);
  const fallback = useMemo(
    () => (valid ? getPublicObservancesForDate(dateISO, locale) : []),
    [valid, dateISO, locale],
  );
  const [items, setItems] = useState<Observance[]>(fallback);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setItems(fallback);
  }, [fallback]);
  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/v1/observances?date=${dateISO}&locale=${locale}`, {
      signal: controller.signal,
    })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Day request failed")),
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
  }, [valid, dateISO, locale, fallback]);
  if (!valid)
    return (
      <section className="message-card">
        <span className="eyebrow">400</span>
        <h1>{copy.dateInvalid}</h1>
        <Link className="btn btn-primary" href="/calendar">
          {copy.backCalendar}
        </Link>
      </section>
    );
  const year = Number(dateISO.slice(0, 4));
  const annual = annualDayCopy[locale];
  const label = mode === "annual"
    ? formatLocalizedDate(dateISO, locale, { month: "long", day: "numeric" }, "heading")
    : formatFullCivilDate(dateISO, locale, "heading");
  const monthShort = formatLocalizedDate(
      dateISO,
      locale,
      { month: "short" },
      "standalone",
    );
  const contextHref = mode === "annual" ? `/day/${dateISO}` : `/date/${dateISO.slice(5)}`;
  const contextLabel = mode === "annual" ? annual.datedLink(year) : annual.annualLink;
  return (
    <div className="page-stack">
      <section className="page-hero day-hero">
        <div>
          <span className="eyebrow">{mode === "annual" ? annual.eyebrow : copy.observancesOn}</span>
          <h1>{label}</h1>
          <p>{mode === "annual" ? annual.body(year) : copy.disclaimer}</p>
          <div className="hero-actions"><Link className="btn btn-secondary" href={contextHref}>{contextLabel}</Link></div>
        </div>
        <div className="date-orb">
          <strong>{Number(dateISO.slice(8, 10))}</strong>
          <span>{monthShort}</span>
        </div>
      </section>
      {loading ? (
        <div className="data-loading" aria-live="polite">
          {copy.loading}
        </div>
      ) : null}
      <section className="day-list">
        {items.length ? (
          items.map((item) => {
            const patronages = displayPatronages(item.patronages, locale),
              existingProfileId = getExistingProfileId(item, year, locale),
              profileId = existingProfileId ?? (isRuntimePersonProfileEligible(item) ? item.id : null),
              paragraphs = summaryParagraphs(item.summaries?.[locale]);
            return (
              <article
                className="day-observance"
                id={`observance-${encodeURIComponent(item.id)}`}
                key={item.id}
              >
                <div className="day-observance-main">
                  <div
                    className={`tradition-emblem ${traditionClass(item.traditions[0])}`}
                  >
                    ✦
                  </div>
                  <div>
                    <div className="tag-row">
                      {item.traditions.map((value) => (
                        <TraditionTag key={value} tradition={value} />
                      ))}
                      <span>{copy[item.category]}</span>
                      <span>
                        {displayCalendarSystem(item.calendarSystem, locale)}
                      </span>
                      <span>
                        {validationStatusLabel(item.validationStatus, locale)}
                      </span>
                    </div>
                    <h2>
                      {displayObservanceName(item.names, locale, item.name)}
                    </h2>
                    {paragraphs.map((paragraph, index) => (
                      <p key={`${item.id}-summary-${index}`}>{paragraph}</p>
                    ))}
                    {patronages.length ? (
                      <div className="patronage-line">
                        <strong>{copy.patronage}:</strong>{" "}
                        {patronages.join(" · ")}
                      </div>
                    ) : null}
                    {profileId ? (
                      <Link className="text-link" href={`/saint/${encodeURIComponent(profileId)}?date=${encodeURIComponent(dateISO)}`}>
                        {feature.openProfile} →
                      </Link>
                    ) : null}
                  </div>
                </div>
                <CandleButton observanceId={item.id} dateISO={dateISO} />
              </article>
            );
          })
        ) : (
          <div className="empty-state large">
            <span>✦</span>
            <p>{loading ? copy.loading : copy.noObservances}</p>
          </div>
        )}
      </section>
      <section className="subscription-strip">
        <div>
          <span className="eyebrow">ICS · Google · Apple · Outlook</span>
          <h2>{copy.addCalendar}</h2>
        </div>
        <AddToCalendar
          feedPath={`/api/ical/all?locale=${locale}`}
          title={`${copy.observancesOn} ${label}`}
          dateISO={dateISO}
        />
      </section>
    </div>
  );
}

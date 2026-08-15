"use client";

import Link from "next/link";
import TodayPanel from "./components/TodayPanel";
import PatronageSearch from "./components/PatronageSearch";
import ProgressiveVaticanLive from "./components/ProgressiveVaticanLive";
import { type Locale } from "../lib/i18n";
import { getFeatureCopy } from "../lib/feature-copy";
import { useLanguage } from "./components/LanguageProvider";

const pilgrimageLabel: Record<Locale, string> = {
  en: "Pilgrimages",
  pt: "Peregrinar",
  es: "Peregrinar",
  fr: "Pèlerinages",
  fil: "Paglalakbay-dalangin",
  ru: "Паломничества",
  sw: "Hija",
  de: "Pilgerziele",
  it: "Pellegrinaggi",
  pl: "Pielgrzymki",
};

export default function HomePage() {
  const { locale, copy } = useLanguage();
  const feature = getFeatureCopy(locale);

  return (
    <div className="page-stack home-page product-home">
      <TodayPanel />

      <ProgressiveVaticanLive />

      <section className="home-search-panel" aria-label={copy.explore}>
        <div>
          <span className="eyebrow">{copy.global} · {feature.navFind}</span>
          <h2>{copy.searchTitle}</h2>
        </div>
        <PatronageSearch compact />
      </section>

      <nav className="product-destination-grid" aria-label="SantosDia">
        <Link href="/calendar" className="product-destination-card">
          <span aria-hidden="true">▦</span>
          <strong>{feature.navCalendars}</strong>
          <small>{copy.addCalendar}</small>
        </Link>
        <Link href="/explore" className="product-destination-card">
          <span aria-hidden="true">⌕</span>
          <strong>{feature.navFind}</strong>
          <small>{copy.searchTitle}</small>
        </Link>
        <Link href="/pilgrimages" className="product-destination-card">
          <span aria-hidden="true">⌖</span>
          <strong>{pilgrimageLabel[locale]}</strong>
          <small>{copy.country} · {copy.calendarTitle}</small>
        </Link>
        <Link href="/live" className="product-destination-card">
          <span aria-hidden="true">●</span>
          <strong>{feature.navLive}</strong>
          <small>{feature.liveTitle}</small>
        </Link>
      </nav>
    </div>
  );
}

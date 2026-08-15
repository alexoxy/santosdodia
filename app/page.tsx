"use client";

import Link from "next/link";
import TodayPanel from "./components/TodayPanel";
import PatronageSearch from "./components/PatronageSearch";
import ProgressiveVaticanLive from "./components/ProgressiveVaticanLive";
import AdSlot from "./components/AdSlot";
import { ADSENSE_HOME_SLOT } from "../lib/adsense";
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

const trustCopy: Partial<Record<Locale,{title:string;body:string;detail:string;link:string}>> = {
  en: { title:"One date, many Christian calendars", body:"Santos do Dia does not treat Christianity as one universal calendar. Dates are kept with their Church, rite, jurisdiction and calendar system so differences remain visible instead of being silently merged.", detail:"Official and high-authority sources are prioritised, names are normalised linguistically, and the same reviewed data powers the website, search, API and ICS feeds.", link:"How the project works" },
  pt: { title:"Uma data, vários calendários cristãos", body:"O Santos do Dia não trata o cristianismo como um único calendário universal. Cada data conserva a Igreja, rito, jurisdição e sistema de calendário, para que as diferenças fiquem visíveis em vez de serem fundidas silenciosamente.", detail:"As fontes oficiais e de elevada autoridade têm prioridade, os nomes são normalizados linguisticamente e os mesmos dados revistos alimentam o site, a pesquisa, a API e os feeds ICS.", link:"Como funciona o projeto" },
  es: { title:"Una fecha, varios calendarios cristianos", body:"Santos do Dia no trata el cristianismo como un único calendario universal. Cada fecha conserva su Iglesia, rito, jurisdicción y sistema de calendario para que las diferencias sigan siendo visibles.", detail:"Se priorizan fuentes oficiales y de alta autoridad, los nombres se normalizan lingüísticamente y los mismos datos revisados alimentan el sitio, la búsqueda, la API y los feeds ICS.", link:"Cómo funciona el proyecto" },
  it: { title:"Una data, più calendari cristiani", body:"Santos do Dia non tratta il cristianesimo come un unico calendario universale. Ogni data conserva Chiesa, rito, giurisdizione e sistema di calendario, così le differenze restano visibili.", detail:"Le fonti ufficiali e autorevoli hanno priorità, i nomi vengono normalizzati linguisticamente e gli stessi dati revisionati alimentano sito, ricerca, API e feed ICS.", link:"Come funziona il progetto" },
};

export default function HomePage() {
  const { locale, copy } = useLanguage();
  const feature = getFeatureCopy(locale);
  const trust = trustCopy[locale] ?? trustCopy.en!;

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

      <section className="institutional-grid home-trust-grid" aria-labelledby="home-trust-title">
        <article className="institutional-card">
          <span className="eyebrow">{copy.approvedData}</span>
          <h2 id="home-trust-title">{trust.title}</h2>
          <p>{trust.body}</p>
          <p>{trust.detail}</p>
          <Link className="text-link" href="/about">{trust.link} →</Link>
        </article>
      </section>

      <AdSlot slot={ADSENSE_HOME_SLOT} placement="home" />

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

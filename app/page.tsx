"use client";

import Link from "next/link";
import TodayPanel from "./components/TodayPanel";
import PatronageSearch from "./components/PatronageSearch";
import ProgressiveVaticanLive from "./components/ProgressiveVaticanLive";
import AdSlot from "./components/AdSlot";
import { ADSENSE_SIDEBAR_SLOT, ADSENSE_TOP_SLOT, isAdUnitActive } from "../lib/adsense";
import { type Locale } from "../lib/i18n";
import { getFeatureCopy } from "../lib/feature-copy";
import { getRetentionCopy } from "../lib/product-retention-i18n";
import { useLanguage } from "./components/LanguageProvider";

const trustCopy: Partial<Record<Locale,{title:string;body:string;detail:string;link:string}>> = {
  en: { title:"One date, many Christian calendars", body:"Santos do Dia does not treat Christianity as one universal calendar. Dates are kept with their Church, rite, jurisdiction and calendar system so differences remain visible instead of being silently merged.", detail:"Official and high-authority sources are prioritised, names are normalised linguistically, and the same reviewed data powers the website, search, API and ICS feeds.", link:"How the project works" },
  pt: { title:"Uma data, vários calendários cristãos", body:"O Santos do Dia não trata o cristianismo como um único calendário universal. Cada data conserva a Igreja, rito, jurisdição e sistema de calendário, para que as diferenças fiquem visíveis em vez de serem fundidas silenciosamente.", detail:"As fontes oficiais e de elevada autoridade têm prioridade, os nomes são normalizados linguisticamente e os mesmos dados revistos alimentam o site, a pesquisa, a API e os feeds ICS.", link:"Como funciona o projeto" },
  es: { title:"Una fecha, varios calendarios cristianos", body:"Santos do Dia no trata el cristianismo como un único calendario universal. Cada fecha conserva su Iglesia, rito, jurisdicción y sistema de calendario para que las diferencias sigan siendo visibles.", detail:"Se priorizan fuentes oficiales y de alta autoridad, los nombres se normalizan lingüísticamente y los mismos datos revisados alimentan el sitio, la búsqueda, la API y los feeds ICS.", link:"Cómo funciona el proyecto" },
  it: { title:"Una data, più calendari cristiani", body:"Santos do Dia non tratta il cristianesimo come un unico calendario universale. Ogni data conserva Chiesa, rito, giurisdizione e sistema di calendario, così le differenze restano visibili.", detail:"Le fonti ufficiali e autorevoli hanno priorità, i nomi vengono normalizzati linguisticamente e gli stessi dati revisionati alimentano sito, ricerca, API e feed ICS.", link:"Come funziona il progetto" },
};

const featuredCopy: Partial<Record<Locale,{eyebrow:string;title:string;open:string}>> = {
  en:{eyebrow:'Editorial profiles',title:'Read more about the saints',open:'Open profile'},
  pt:{eyebrow:'Perfis editoriais',title:'Conheça melhor os santos',open:'Abrir perfil'},
  es:{eyebrow:'Perfiles editoriales',title:'Conoce mejor a los santos',open:'Abrir perfil'},
  it:{eyebrow:'Profili editoriali',title:'Conosci meglio i santi',open:'Apri profilo'},
};

// Lightweight curated navigation labels. Full biography content remains server/page scoped.
const featuredProfiles: Array<{
  id: string;
  title: { en: string } & Partial<Record<Locale, string>>;
}> = [
  {
    id: "anthony-lisbon",
    title: {
      en: "Saint Anthony of Lisbon and Padua",
      pt: "Santo António de Lisboa e de Pádua",
      es: "San Antonio de Lisboa y Padua",
      it: "Sant’Antonio di Lisbona e Padova",
    },
  },
  {
    id: "francis-assisi",
    title: {
      en: "Saint Francis of Assisi",
      pt: "São Francisco de Assis",
      es: "San Francisco de Asís",
      it: "San Francesco d’Assisi",
    },
  },
  {
    id: "clare-assisi",
    title: {
      en: "Saint Clare of Assisi",
      pt: "Santa Clara de Assis",
      es: "Santa Clara de Asís",
      it: "Santa Chiara d’Assisi",
    },
  },
  {
    id: "teresa-avila",
    title: {
      en: "Saint Teresa of Ávila",
      pt: "Santa Teresa de Ávila",
      es: "Santa Teresa de Ávila",
      it: "Santa Teresa d’Avila",
    },
  },
];

export default function HomePage() {
  const { locale, copy } = useLanguage();
  const feature = getFeatureCopy(locale);
  const trust = trustCopy[locale] ?? trustCopy.en!;
  const featured = featuredCopy[locale] ?? featuredCopy.en!;
  const retention = getRetentionCopy(locale);
  const sidebarActive = isAdUnitActive(ADSENSE_SIDEBAR_SLOT);
  const editorialProfiles = featuredProfiles.map((item) => ({
    id: item.id,
    title: item.title[locale] ?? item.title.en,
  }));

  return (
    <div className="page-stack home-page product-home">
      <TodayPanel />
      <AdSlot slot={ADSENSE_TOP_SLOT} placement="top" />

      <div className={`home-monetized-layout${sidebarActive ? ' has-ad-rail' : ''}`}>
        <div className="home-monetized-main">
          <ProgressiveVaticanLive />

          <section className="home-search-panel" aria-label={copy.explore}>
            <div><span className="eyebrow">{copy.global} · {feature.navFind}</span><h2>{copy.searchTitle}</h2></div>
            <PatronageSearch compact />
          </section>

          {editorialProfiles.length ? <section className="institutional-grid" aria-labelledby="featured-saints-title">
            <article className="institutional-card">
              <span className="eyebrow">{featured.eyebrow}</span>
              <h2 id="featured-saints-title">{featured.title}</h2>
              <div className="related-topics"><div>{editorialProfiles.map(({id,title}) => <Link href={`/saint/${encodeURIComponent(id)}`} key={id}>{title} · {featured.open}</Link>)}</div></div>
            </article>
          </section> : null}

          <nav className="product-destination-grid" aria-label="SantosDia">
            <Link href="/calendar" className="product-destination-card"><span aria-hidden="true">▦</span><strong>{feature.navCalendars}</strong><small>{retention.calendarHint}</small></Link>
            <Link href="/explore" className="product-destination-card"><span aria-hidden="true">⌕</span><strong>{feature.navFind}</strong><small>{retention.discoverHint}</small></Link>
            <Link href="/rezar" className="product-destination-card"><span aria-hidden="true">◇</span><strong>{retention.pray}</strong><small>{retention.prayHint}</small></Link>
            <Link href="/guardados" className="product-destination-card"><span aria-hidden="true">☆</span><strong>{retention.saved}</strong><small>{retention.savedHint}</small></Link>
          </nav>

          <section className="institutional-grid home-trust-grid" aria-labelledby="home-trust-title">
            <article className="institutional-card"><span className="eyebrow">{copy.approvedData}</span><h2 id="home-trust-title">{trust.title}</h2><p>{trust.body}</p><p>{trust.detail}</p><Link className="text-link" href="/about">{trust.link} →</Link></article>
          </section>
        </div>

        {sidebarActive ? <aside className="ad-sidebar-rail" aria-label="Advertising rail"><AdSlot slot={ADSENSE_SIDEBAR_SLOT} placement="sidebar" /></aside> : null}
      </div>
    </div>
  );
}

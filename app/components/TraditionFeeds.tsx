'use client';

import Link from 'next/link';
import { traditionLabel } from '../../data/observances';
import { getFeatureCopy } from '../../lib/feature-copy';
import type { Locale } from '../../lib/i18n';
import { PLANNED_CALENDAR_TRADITIONS, PUBLIC_CALENDAR_CONTEXTS } from '../../lib/calendar-publication-readiness';
import { useLanguage } from './LanguageProvider';

type SyncLabels = {
  title:string;
  intro:string;
  ready:string;
  reference:string;
  planned:string;
  plannedIntro:string;
  explore:string;
};

const syncLabels: Partial<Record<Locale,SyncLabels>> = {
  en:{title:'Verified calendar subscriptions',intro:'Subscribe only to calendar contexts whose authority coverage and ICS semantics have passed the public readiness gate.',ready:'Ready',reference:'Portugal reference calendar',planned:'In preparation',plannedIntro:'These traditions remain in the global architecture and reviewed explorer, but complete subscriptions are not yet advertised.',explore:'Explore reviewed records'},
  pt:{title:'Subscrições de calendário verificadas',intro:'Subscreva apenas contextos cuja cobertura de autoridade e semântica ICS passaram o controlo de prontidão pública.',ready:'Pronto',reference:'Calendário de referência de Portugal',planned:'Em preparação',plannedIntro:'Estas tradições mantêm-se na arquitetura global e no explorador revisto, mas ainda não são anunciadas como subscrições completas.',explore:'Explorar registos revistos'},
  es:{title:'Suscripciones de calendario verificadas',intro:'Suscríbete solo a contextos cuya cobertura de autoridad y semántica ICS hayan superado el control de preparación pública.',ready:'Listo',reference:'Calendario de referencia de Portugal',planned:'En preparación',plannedIntro:'Estas tradiciones permanecen en la arquitectura global y el explorador revisado, pero todavía no se anuncian como suscripciones completas.',explore:'Explorar registros revisados'},
  it:{title:'Abbonamenti al calendario verificati',intro:'Abbonati solo ai contesti la cui copertura autorevole e semantica ICS hanno superato il controllo di prontezza pubblica.',ready:'Pronto',reference:'Calendario di riferimento del Portogallo',planned:'In preparazione',plannedIntro:'Queste tradizioni restano nell’architettura globale e nell’esploratore revisionato, ma non sono ancora presentate come abbonamenti completi.',explore:'Esplora i dati revisionati'},
};

export default function TraditionFeeds(){
  const {locale,copy}=useLanguage();
  const feature=getFeatureCopy(locale);
  const sync=syncLabels[locale]??syncLabels.en!;
  return <section className="source-list-section tradition-feeds">
    <div className="section-heading"><div><span className="eyebrow">ICS · webcal · Apple · Google · Outlook</span><h2>{sync.title}</h2><p>{sync.intro}</p></div></div>
    <div className="tradition-feed-grid">
      {PUBLIC_CALENDAR_CONTEXTS.map(context=><article className="tradition-feed-card" key={`${context.tradition}-${context.country}`}><span className="eyebrow">{sync.ready}</span><strong>{traditionLabel(copy,context.tradition)}</strong><p>{sync.reference}</p><Link className="btn btn-secondary" href={`/calendar/subscribe?tradition=${encodeURIComponent(context.tradition)}&country=${context.country}`}>{feature.subscribe}</Link></article>)}
      <article className="tradition-feed-card"><span className="eyebrow">{sync.planned}</span><p>{sync.plannedIntro}</p><p>{PLANNED_CALENDAR_TRADITIONS.map(value=>traditionLabel(copy,value)).join(' · ')}</p><Link className="btn btn-tertiary" href="/calendar">{sync.explore}</Link></article>
    </div>
  </section>;
}

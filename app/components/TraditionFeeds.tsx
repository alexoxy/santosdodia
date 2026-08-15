'use client';

import Link from 'next/link';
import { TRADITIONS, traditionLabel } from '../../data/observances';
import { getFeatureCopy } from '../../lib/feature-copy';
import type { Locale } from '../../lib/i18n';
import { useLanguage } from './LanguageProvider';

const syncLabels: Partial<Record<Locale,{title:string;intro:string;all:string}>> = {
  en:{title:'Ready-made calendar subscriptions',intro:'Choose a Christian tradition, then connect it to Apple Calendar, Google Calendar or Outlook. You can refine region and category on the sync page.',all:'Build a custom subscription'},
  pt:{title:'Subscrições de calendário prontas a usar',intro:'Escolha uma tradição cristã e ligue-a ao Apple Calendar, Google Calendar ou Outlook. Na página de sincronização pode ainda filtrar por região e categoria.',all:'Criar uma subscrição personalizada'},
  es:{title:'Suscripciones de calendario listas para usar',intro:'Elige una tradición cristiana y conéctala con Apple Calendar, Google Calendar u Outlook. En la página de sincronización puedes filtrar también por región y categoría.',all:'Crear una suscripción personalizada'},
  it:{title:'Abbonamenti al calendario pronti all’uso',intro:'Scegli una tradizione cristiana e collegala ad Apple Calendar, Google Calendar o Outlook. Nella pagina di sincronizzazione puoi anche filtrare per regione e categoria.',all:'Crea un abbonamento personalizzato'},
};

export default function TraditionFeeds(){
  const {locale,copy}=useLanguage();
  const feature=getFeatureCopy(locale);
  const sync=syncLabels[locale]??syncLabels.en!;
  return <section className="source-list-section tradition-feeds">
    <div className="section-heading"><div><span className="eyebrow">ICS · webcal · Apple · Google · Outlook</span><h2>{sync.title}</h2><p>{sync.intro}</p></div><Link className="btn btn-primary" href="/calendar/subscribe">{sync.all}</Link></div>
    <div className="tradition-feed-grid">{TRADITIONS.map(tradition=><article className="tradition-feed-card" key={tradition}><strong>{traditionLabel(copy,tradition)}</strong><Link className="btn btn-secondary" href={`/calendar/subscribe?tradition=${encodeURIComponent(tradition)}`}>{feature.subscribe}</Link></article>)}</div>
  </section>;
}

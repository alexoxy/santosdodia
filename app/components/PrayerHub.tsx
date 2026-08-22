'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

export default function PrayerHub() {
  const { locale } = useLanguage();
  const copy = locale === 'pt'
    ? {
        eyebrow: 'Rezar',
        title: 'Rezar com o calendário cristão',
        intro: 'Orações, novenas e leituras ligadas às celebrações, apresentadas apenas quando a fonte e os direitos de utilização estão validados.',
        readings: 'Leituras do dia',
        readingsBody: 'As referências bíblicas serão ligadas à autoridade litúrgica da sua tradição e jurisdição. Quando não pudermos reproduzir o texto, abrimos a fonte oficial.',
        novenas: 'Novenas',
        novenasBody: 'Acompanhe novenas associadas a festas futuras e retome cada dia do percurso. As datas serão confirmadas pelo calendário litúrgico oficial.',
        saints: 'Rezar com um santo',
        saintsBody: 'As páginas dos santos poderão reunir orações tradicionais ou aprovadas, sempre identificando tradição, fonte e direitos.',
        explore: 'Descobrir santos',
        liturgy: 'Ver liturgia',
      }
    : {
        eyebrow: 'Pray',
        title: 'Pray with the Christian calendar',
        intro: 'Prayers, novenas and readings linked to celebrations, shown only when the source and reuse rights have been validated.',
        readings: 'Daily readings',
        readingsBody: 'Bible references will be tied to the official liturgical authority for your tradition and jurisdiction. When text cannot be republished, we link to the authoritative source.',
        novenas: 'Novenas',
        novenasBody: 'Follow novenas connected to upcoming feasts and continue each day. Dates are checked against authoritative liturgical calendars.',
        saints: 'Pray with a saint',
        saintsBody: 'Saint pages can gather traditional or approved prayers while identifying tradition, source and rights.',
        explore: 'Discover saints',
        liturgy: 'View liturgy',
      };

  return <div className="page-stack prayer-hub">
    <section className="product-page-heading prayer-hub-hero">
      <span className="eyebrow">{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
    </section>
    <section className="retention-feature-grid" aria-label={copy.title}>
      <article className="retention-feature-card"><span aria-hidden="true">☰</span><h2>{copy.readings}</h2><p>{copy.readingsBody}</p><Link className="text-link" href="/liturgy">{copy.liturgy} →</Link></article>
      <article className="retention-feature-card"><span aria-hidden="true">9</span><h2>{copy.novenas}</h2><p>{copy.novenasBody}</p></article>
      <article className="retention-feature-card"><span aria-hidden="true">✦</span><h2>{copy.saints}</h2><p>{copy.saintsBody}</p><Link className="text-link" href="/explore">{copy.explore} →</Link></article>
    </section>
  </div>;
}

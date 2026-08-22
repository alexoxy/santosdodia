'use client';

import Link from 'next/link';
import { getRetentionCopy } from '../../lib/product-retention-i18n';
import { useLanguage } from './LanguageProvider';

export default function PrayerHub() {
  const { locale } = useLanguage();
  const copy = getRetentionCopy(locale);

  return <div className="page-stack prayer-hub">
    <section className="product-page-heading prayer-hub-hero">
      <span className="eyebrow">{copy.prayerEyebrow}</span>
      <h1>{copy.prayerTitle}</h1>
      <p>{copy.prayerIntro}</p>
    </section>
    <section className="retention-feature-grid" aria-label={copy.prayerTitle}>
      <article className="retention-feature-card"><span aria-hidden="true">☰</span><h2>{copy.readings}</h2><p>{copy.readingsBody}</p><Link className="text-link" href="/liturgy">{copy.viewLiturgy} →</Link></article>
      <article className="retention-feature-card"><span aria-hidden="true">9</span><h2>{copy.novenas}</h2><p>{copy.novenasBody}</p></article>
      <article className="retention-feature-card"><span aria-hidden="true">✦</span><h2>{copy.saintsPrayer}</h2><p>{copy.saintsPrayerBody}</p><Link className="text-link" href="/explore">{copy.discoverSaints} →</Link></article>
    </section>
  </div>;
}

'use client';
import Link from 'next/link';
import TodayPanel from './components/TodayPanel';
import PatronageSearch from './components/PatronageSearch';
import { getAllObservances, TRADITIONS } from '../data/observances';
import { SUPPORTED_LOCALES } from '../lib/i18n';
import { getFeatureCopy } from '../lib/feature-copy';
import { useLanguage } from './components/LanguageProvider';

export default function HomePage() {
  const { locale, copy } = useLanguage();const feature=getFeatureCopy(locale);
  const count = getAllObservances(new Date().getFullYear(), locale).length;
  const features = [[feature.byProfession,feature.findIntro],[feature.byPlace,copy.disclaimer],[feature.byDate,copy.calendarIntro],[feature.officialSource,copy.sourcesIntro]];
  return <div className="page-stack home-page">
    <section className="home-hero"><div className="hero-copy"><span className="eyebrow">{feature.findEyebrow}</span><h1>{feature.findTitle}</h1><p>{feature.findIntro}</p><div className="home-hero-search"><PatronageSearch compact/></div><div className="hero-proof"><div><strong>{count}+</strong><span>{copy.beta}</span></div><div><strong>{SUPPORTED_LOCALES.length}</strong><span>{copy.global}</span></div><div><strong>{TRADITIONS.length}</strong><span>{copy.tradition}</span></div></div></div><div className="hero-visual" aria-hidden="true"><div className="halo halo-one"/><div className="halo halo-two"/><div className="cross-symbol"><span>✦</span></div><div className="visual-caption">Patronages · Saints · Places · Calendars</div></div></section>
    <TodayPanel/>
    <section className="discovery-section"><article className="discovery-callout"><span className="eyebrow">{feature.navFind}</span><h2>{feature.topicResults}</h2><p>{feature.findIntro}</p><Link className="btn btn-primary" href="/explore">{feature.findButton}</Link></article><article className="live-callout"><span className="eyebrow">{feature.navLive}</span><h2>{feature.liveTitle}</h2><p>{feature.liveIntro}</p><Link className="btn btn-secondary" href="/live">{feature.openLive}</Link></article></section>
    <section className="feature-section"><div className="section-heading"><div><span className="eyebrow">Santos do Dia</span><h2>{copy.methodology}</h2></div><Link className="text-link" href="/copyright">{feature.navCopyright} →</Link></div><div className="feature-grid">{features.map(([title,body],index)=><article className="feature-card" key={title}><span className="feature-number">0{index+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
  </div>;
}

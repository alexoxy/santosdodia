'use client';
import TodayPanel from './components/TodayPanel';
import { getAllObservances, TRADITIONS } from '../data/observances';
import { SUPPORTED_LOCALES } from '../lib/i18n';
import { useLanguage } from './components/LanguageProvider';

export default function HomePage() {
  const { locale, copy } = useLanguage();
  const count = getAllObservances(new Date().getFullYear(), locale).length;
  const features = [
    [copy.tradition, copy.disclaimer],
    [copy.searchTitle, copy.searchIntro],
    [copy.calendarTitle, copy.calendarIntro],
    [copy.validation, copy.sourcesIntro]
  ];
  return (
    <div className="page-stack home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <div className="button-row hero-actions">
            <a className="btn btn-primary" href="/calendar">{copy.viewCalendar}</a>
            <a className="btn btn-secondary" href="/explore">{copy.explore}</a>
          </div>
          <div className="hero-proof">
            <div><strong>{count}+</strong><span>{copy.beta}</span></div>
            <div><strong>{SUPPORTED_LOCALES.length}</strong><span>{copy.global}</span></div>
            <div><strong>{TRADITIONS.length}</strong><span>{copy.tradition}</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="halo halo-one"/><div className="halo halo-two"/>
          <div className="cross-symbol"><span>✦</span></div>
          <div className="visual-caption">Santos · Feasts · Traditions · Sources</div>
        </div>
      </section>
      <TodayPanel/>
      <section className="feature-section">
        <div className="section-heading">
          <div><span className="eyebrow">Santos do Dia</span><h2>{copy.methodology}</h2></div>
          <a className="text-link" href="/sources">{copy.navSources} →</a>
        </div>
        <div className="feature-grid">
          {features.map(([title, body], index) => (
            <article className="feature-card" key={title}>
              <span className="feature-number">0{index + 1}</span><h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";
import Link from "next/link";
import TodayPanel from "./components/TodayPanel";
import PatronageSearch from "./components/PatronageSearch";
import ProgressiveVaticanLive from "./components/ProgressiveVaticanLive";
import EntryPoints from "./components/EntryPoints";
import { TRADITIONS } from "../data/observances";
import { SUPPORTED_LOCALES } from "../lib/i18n";
import { getFeatureCopy } from "../lib/feature-copy";
import { getPublicAllObservances } from "../lib/public-observances";
import { useLanguage } from "./components/LanguageProvider";

export default function HomePage() {
  const { locale, copy, timeZone } = useLanguage();
  const feature = getFeatureCopy(locale);
  const year = Number(
    new Intl.DateTimeFormat("en", { year: "numeric", timeZone }).format(
      new Date(),
    ),
  );
  const count = getPublicAllObservances(year, locale).length;

  return (
    <div className="page-stack home-page">
      <TodayPanel />

      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <div className="home-hero-search">
            <PatronageSearch compact />
          </div>
          <div className="hero-proof">
            <div>
              <strong>{count}+</strong>
              <span>{copy.beta}</span>
            </div>
            <div>
              <strong>{SUPPORTED_LOCALES.length}</strong>
              <span>{copy.global}</span>
            </div>
            <div>
              <strong>{TRADITIONS.length}</strong>
              <span>{copy.tradition}</span>
            </div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="halo halo-one" />
          <div className="halo halo-two" />
          <div className="cross-symbol">
            <span>✦</span>
          </div>
          <div className="visual-caption">
            Saints · Feasts · Places · Calendars
          </div>
        </div>
      </section>

      <EntryPoints />

      <section className="discovery-section">
        <article className="discovery-callout">
          <span className="eyebrow">{feature.navFind}</span>
          <h2>{feature.topicResults}</h2>
          <p>{feature.findIntro}</p>
          <Link className="btn btn-primary" href="/explore">
            {feature.findButton}
          </Link>
        </article>
        <article className="live-callout">
          <span className="eyebrow">{feature.navLive}</span>
          <h2>{feature.liveTitle}</h2>
          <p>{feature.liveIntro}</p>
          <Link className="btn btn-secondary" href="/live">
            {feature.openLive}
          </Link>
        </article>
      </section>

      <ProgressiveVaticanLive />
    </div>
  );
}

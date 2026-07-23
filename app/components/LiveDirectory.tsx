'use client';
import { LIVE_STREAM_SOURCES } from '../../data/live-streams';
import { traditionLabel } from '../../data/observances';
import { localize } from '../../lib/i18n';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage } from './LanguageProvider';

export default function LiveDirectory(){
 const{locale,copy}=useLanguage();const feature=getFeatureCopy(locale);const featured=LIVE_STREAM_SOURCES.find(source=>source.embedUrl);
 return <div className="page-stack live-page">
  <section className="page-hero compact-hero"><div><span className="eyebrow">OSINT · official media · no autoplay</span><h1>{feature.liveTitle}</h1><p>{feature.liveIntro}</p></div><div className="hero-symbol">▶</div></section>
  {featured?.embedUrl?<section className="featured-live"><div className="featured-live-copy"><span className="eyebrow">{traditionLabel(copy,featured.tradition)}</span><h2>{featured.organization}</h2><p>{localize(featured.descriptions,locale)}</p><div className="button-row"><a className="btn btn-primary" href={featured.liveUrl} target="_blank" rel="noreferrer">{feature.openLive}</a><a className="btn btn-secondary" href={featured.archiveUrl} target="_blank" rel="noreferrer">{feature.openArchive}</a></div></div><div className="live-frame"><iframe src={featured.embedUrl} title={featured.organization} loading="lazy" allow="fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"/></div></section>:null}
  <section className="live-source-grid">{LIVE_STREAM_SOURCES.map(source=><article className="live-source-card" key={source.id}><div className="live-source-top"><span className="live-indicator" aria-hidden="true"/><span>{traditionLabel(copy,source.tradition)}</span></div><h2>{source.organization}</h2><p>{localize(source.descriptions,locale)}</p><div className="live-language-row">{source.languages.map(language=><span key={language}>{language.toUpperCase()}</span>)}</div><small>{feature.liveFallback}</small><div className="live-card-actions"><a className="btn btn-primary" href={source.liveUrl} target="_blank" rel="noreferrer">{feature.openLive}</a><a className="text-link" href={source.archiveUrl} target="_blank" rel="noreferrer">{feature.openArchive} →</a></div><div className="verified-link"><a href={source.sourceUrl} target="_blank" rel="noreferrer">{feature.officialSource}</a><span>{feature.verifiedOn}: {source.verifiedAt}</span></div></article>)}</section>
  <section className="notice-card"><strong>{feature.officialSource}</strong><p>{feature.copyrightNoAffiliation}</p></section>
 </div>;
}

'use client';
import { LIVE_STREAM_SOURCES } from '../../data/live-streams';
import { traditionLabel } from '../../data/observances';
import { localize } from '../../lib/i18n';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage } from './LanguageProvider';

export default function LiveDirectory(){
 const{locale,copy}=useLanguage();const feature=getFeatureCopy(locale);
 return <div className="page-stack live-page">
  <section className="page-hero compact-hero"><div><span className="eyebrow">OSINT · official media · external links</span><h1>{feature.liveTitle}</h1><p>{feature.liveIntro}</p></div><div className="hero-symbol">▶</div></section>
  <section className="live-source-grid">{LIVE_STREAM_SOURCES.map(source=><article className="live-source-card" key={source.id}><div className="live-source-top"><span className={source.liveUrl?'live-indicator':'media-indicator'} aria-hidden="true"/><span>{traditionLabel(copy,source.tradition)}</span></div><h2>{source.organization}</h2><p>{localize(source.descriptions,locale)}</p><div className="live-language-row">{source.languages.map(language=><span key={language}>{language.toUpperCase()}</span>)}</div>{source.liveUrl?<small>{feature.liveFallback}</small>:null}<div className="live-card-actions">{source.liveUrl?<a className="btn btn-primary" href={source.liveUrl} target="_blank" rel="noreferrer">{feature.openLive}</a>:null}{source.archiveUrl?<a className={source.liveUrl?'text-link':'btn btn-secondary'} href={source.archiveUrl} target="_blank" rel="noreferrer">{feature.openArchive}{source.liveUrl?' →':''}</a>:null}</div><div className="verified-link"><a href={source.sourceUrl} target="_blank" rel="noreferrer">{feature.officialSource}</a><span>{feature.verifiedOn}: {source.verifiedAt}</span></div></article>)}</section>
  <section className="notice-card"><strong>{feature.officialSource}</strong><p>{feature.copyrightNoAffiliation}</p></section>
 </div>;
}

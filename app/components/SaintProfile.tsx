'use client';
import Link from 'next/link';
import { traditionLabel, type Observance } from '../../data/observances';
import { getObservanceById,topicLabel,topicPath,topicsForObservance } from '../../data/discovery';
import { biographyUi,getSaintBiography } from '../../data/saint-biographies';
import { ADSENSE_PROFILE_SLOT } from '../../lib/adsense';
import { claimEvidenceFor,claimEvidenceReviewedAt,claimEvidenceUi,claimTypeLabel,unresolvedPatronages,validationStatusLabel } from '../../lib/claim-evidence';
import { localizedSummary,fallbackLanguageLabel } from '../../lib/content-locale';
import { yearInTimeZone } from '../../lib/date-context';
import { displayCalendarSystem,displayObservanceName,displayPatronages } from '../../lib/locale-display';
import { displayObservanceScope } from '../../lib/observance-scope';
import { getFeatureCopy } from '../../lib/feature-copy';
import AddToCalendar from './AddToCalendar';
import AdSlot from './AdSlot';
import CandleButton from './CandleButton';
import TraditionTag from './TraditionTag';
import { useLanguage } from './LanguageProvider';

export default function SaintProfile({id,runtimeItem}:{id:string;runtimeItem?:Observance}){
 const{locale,copy,timeZone,country}=useLanguage();const feature=getFeatureCopy(locale);const year=yearInTimeZone(timeZone);const curatedItem=getObservanceById(id,year,locale);const item=curatedItem??runtimeItem;
 if(!item)return <section className="message-card"><span className="eyebrow">404</span><h1>{feature.noMatch}</h1><Link className="btn btn-primary" href="/explore">{feature.navFind}</Link></section>;
 const name=displayObservanceName(item.names,locale,item.name),patronages=displayPatronages(item.patronages,locale),topics=curatedItem?topicsForObservance(item.id):[],biography=curatedItem?getSaintBiography(item.id,locale):undefined,historyCopy=biographyUi[locale],summary=localizedSummary(item,locale),scope=displayObservanceScope(item,locale,country),evidence=curatedItem?claimEvidenceFor(item.id):[],evidenceCopy=claimEvidenceUi[locale];
 const dateLabel=new Intl.DateTimeFormat(locale,{month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.dateISO}T00:00:00Z`));
 const evidenceDate=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${claimEvidenceReviewedAt}T00:00:00Z`));
 return <div className="page-stack saint-profile-page">
  <section className="page-hero saint-profile-hero"><div><span className="eyebrow">{feature.profileIntro}</span><h1>{name}</h1><p>{dateLabel} · {item.traditions.map(value=>traditionLabel(copy,value)).join(' · ')}</p><span className={`scope-label scope-${scope.kind}`}>{scope.label}</span></div><div className="saint-monogram" aria-hidden="true">✦</div></section>
  <section className="saint-profile-layout">
   <article className="saint-profile-main">
    <div className="tag-row">{item.traditions.map(value=><TraditionTag key={value} tradition={value}/>)}<span>{copy[item.category]}</span><span>{displayCalendarSystem(item.calendarSystem,locale)}</span><span>{validationStatusLabel(item.validationStatus,locale)}</span></div>
    {biography?<section className="saint-biography saint-biography-primary"><span className="eyebrow">{historyCopy.history}</span><h2>{biography.title}</h2><p className="biography-lead">{biography.summary}</p>{biography.facts.length?<div className="biography-facts"><h3>{historyCopy.keyFacts}</h3><dl>{biography.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></div>:null}<div className="biography-text">{biography.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><div className="biography-provenance"><div><h3>{historyCopy.sources}</h3><p>{historyCopy.editorial}</p></div><span>{historyCopy.verified}: {biography.verifiedAt}</span></div></section>:summary?<section className="profile-summary profile-summary-primary"><p lang={summary.language}>{summary.text}</p>{summary.isFallback?<small className="translation-fallback">{fallbackLanguageLabel(locale)}</small>:null}</section>:null}
    {biography?<AdSlot slot={ADSENSE_PROFILE_SLOT} placement="profile"/>:null}
    {patronages.length?<section className="profile-associations"><h2>{feature.associatedWith}</h2><div className="patronage-cloud">{patronages.map(value=><span key={value}>{value}</span>)}</div></section>:null}
    {evidence.length?<section className="profile-summary profile-evidence"><span className="eyebrow">{evidenceCopy.title}</span><p><strong>{evidenceCopy.reviewed}: {evidenceDate}</strong></p>{evidence.map((entry,index)=>{const unresolved=displayPatronages(unresolvedPatronages(entry),locale);return <div key={`${entry.claimType}-${index}`}><h3>{claimTypeLabel(entry.claimType,locale)}</h3><p>{evidenceCopy.corroborated}</p><p><a className="text-link" href={entry.source.url} target="_blank" rel="noreferrer">{evidenceCopy.officialSource}: {entry.source.name} ↗</a></p>{unresolved.length?<><h3>{evidenceCopy.unresolvedTitle}</h3><p>{evidenceCopy.unresolvedBody}</p><div className="patronage-cloud">{unresolved.map(value=><span key={value}>{value}</span>)}</div></>:null}</div>})}</section>:null}
    <div className="profile-date-link"><strong>{dateLabel}</strong><Link className="text-link" href={`/day/${item.dateISO}`}>{feature.openDay} →</Link></div>
    {topics.length?<section className="related-topics"><h3>{feature.relatedSearches}</h3><div>{topics.map(topic=><Link href={topicPath(topic)} key={`${topic.kind}-${topic.slug}`}>{topicLabel(topic,locale)}</Link>)}</div></section>:null}
   </article>
   <aside className="saint-profile-actions">
    <div className="profile-action-card"><h2>{curatedItem?feature.annualCalendar:copy.addCalendar}</h2><AddToCalendar feedPath={`/api/ical/saint/${encodeURIComponent(item.id)}?locale=${locale}`} title={name}/></div>
    <div className="profile-action-card candle-profile"><CandleButton observanceId={item.id} dateISO={item.dateISO}/><p>{feature.freeCandle}</p></div>
   </aside>
  </section>
 </div>;
}

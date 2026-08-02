'use client';
import Link from 'next/link';
import { traditionLabel } from '../../data/observances';
import { getObservanceById,topicLabel,topicPath,topicsForObservance } from '../../data/discovery';
import { biographyUi,getSaintBiography } from '../../data/saint-biographies';
import { localizedSummary,fallbackLanguageLabel } from '../../lib/content-locale';
import { yearInTimeZone } from '../../lib/date-context';
import { displayCalendarSystem,displayObservanceName,displayPatronages } from '../../lib/locale-display';
import { displayObservanceScope } from '../../lib/observance-scope';
import { getFeatureCopy } from '../../lib/feature-copy';
import AddToCalendar from './AddToCalendar';
import CandleButton from './CandleButton';
import { useLanguage } from './LanguageProvider';

export default function SaintProfile({id}:{id:string}){
 const{locale,copy,timeZone,country}=useLanguage();const feature=getFeatureCopy(locale);const year=yearInTimeZone(timeZone);const item=getObservanceById(id,year,locale);
 if(!item)return <section className="message-card"><span className="eyebrow">404</span><h1>{feature.noMatch}</h1><Link className="btn btn-primary" href="/explore">{feature.navFind}</Link></section>;
 const name=displayObservanceName(item.names,locale,item.name),patronages=displayPatronages(item.patronages,locale),topics=topicsForObservance(item.id),biography=getSaintBiography(item.id,locale),historyCopy=biographyUi[locale],summary=localizedSummary(item,locale),scope=displayObservanceScope(item,locale,country);
 const dateLabel=new Intl.DateTimeFormat(locale,{month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.dateISO}T00:00:00Z`));
 return <div className="page-stack saint-profile-page">
  <section className="page-hero saint-profile-hero"><div><span className="eyebrow">{feature.profileIntro}</span><h1>{name}</h1><p>{dateLabel} · {item.traditions.map(value=>traditionLabel(copy,value)).join(' · ')}</p><span className={`scope-label scope-${scope.kind}`}>{scope.label}</span></div><div className="saint-monogram" aria-hidden="true">✦</div></section>
  <section className="saint-profile-layout">
   <article className="saint-profile-main">
    <div className="tag-row">{item.traditions.map(value=><span key={value}>{traditionLabel(copy,value)}</span>)}<span>{copy[item.category]}</span><span>{displayCalendarSystem(item.calendarSystem,locale)}</span><span>{item.validationStatus==='review-required'?copy.reviewRequired:copy.verified}</span></div>
    <h2>{feature.associatedWith}</h2>
    {patronages.length?<div className="patronage-cloud">{patronages.map(value=><span key={value}>{value}</span>)}</div>:<p>{copy.disclaimer}</p>}
    {biography?<section className="saint-biography"><span className="eyebrow">{historyCopy.history}</span><h2>{biography.title}</h2><p className="biography-lead">{biography.summary}</p><div className="biography-text">{biography.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><div className="biography-facts"><h3>{historyCopy.keyFacts}</h3><dl>{biography.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></div><div className="biography-provenance"><div><h3>{historyCopy.sources}</h3><p>{historyCopy.editorial}</p></div><span>{historyCopy.verified}: {biography.verifiedAt}</span></div></section>:summary?<div className="profile-summary"><p lang={summary.language}>{summary.text}</p>{summary.isFallback?<small className="translation-fallback">{fallbackLanguageLabel(locale)}</small>:null}</div>:null}
    <div className="profile-date-link"><strong>{dateLabel}</strong><Link className="text-link" href={`/day/${item.dateISO}`}>{feature.openDay} →</Link></div>
    {topics.length?<section className="related-topics"><h3>{feature.relatedSearches}</h3><div>{topics.map(topic=><Link href={topicPath(topic)} key={`${topic.kind}-${topic.slug}`}>{topicLabel(topic,locale)}</Link>)}</div></section>:null}
   </article>
   <aside className="saint-profile-actions">
    <div className="profile-action-card"><h2>{feature.annualCalendar}</h2><AddToCalendar feedPath={`/api/ical/saint/${item.id}?locale=${locale}`} title={name}/></div>
    <div className="profile-action-card candle-profile"><CandleButton observanceId={item.id} dateISO={item.dateISO}/><p>{feature.freeCandle}</p></div>
   </aside>
  </section>
 </div>;
}

'use client';
import Link from 'next/link';
import { traditionLabel, type Observance } from '../../data/observances';
import { getObservanceById,topicLabel,topicPath,topicsForObservance } from '../../data/discovery';
import { biographyUi,getSaintBiography,getSaintBiographyRecord } from '../../data/saint-biography-registry';
import { ADSENSE_SIDEBAR_SLOT, ADSENSE_TOP_SLOT } from '../../lib/adsense';
import { claimEvidenceFor,claimEvidenceReviewedAt,claimEvidenceUi,claimTypeLabel,unresolvedPatronages,validationStatusLabel } from '../../lib/claim-evidence';
import { localizedSummary,fallbackLanguageLabel } from '../../lib/content-locale';
import { yearInTimeZone } from '../../lib/date-context';
import { isSaintBiographyIndexable } from '../../lib/editorial-profile-quality';
import { displayCalendarSystem,displayObservanceName,displayPatronages } from '../../lib/locale-display';
import { displayObservanceScope } from '../../lib/observance-scope';
import { getFeatureCopy } from '../../lib/feature-copy';
import { type Locale } from '../../lib/i18n';
import { getRetentionCopy } from '../../lib/product-retention-i18n';
import AddToCalendar from './AddToCalendar';
import AdSlot from './AdSlot';
import CandleButton from './CandleButton';
import SaveSaintButton from './SaveSaintButton';
import TraditionTag from './TraditionTag';
import { useLanguage } from './LanguageProvider';

const editorialOrigin:Record<Locale,string>={
 en:'SantosDia editorial content, independently composed from the evidence and institutional sources listed below.',
 pt:'Conteúdo editorial SantosDia, redigido de forma autónoma a partir da evidência e das fontes institucionais indicadas abaixo.',
 es:'Contenido editorial de SantosDia, redactado de forma independiente a partir de la evidencia y de las fuentes institucionales indicadas abajo.',
 fr:'Contenu éditorial SantosDia, rédigé de manière indépendante à partir des éléments de preuve et des sources institutionnelles indiqués ci-dessous.',
 it:'Contenuto editoriale SantosDia, redatto in modo indipendente sulla base delle evidenze e delle fonti istituzionali indicate qui sotto.',
 de:'Redaktioneller Inhalt von SantosDia, eigenständig auf Grundlage der unten aufgeführten Belege und institutionellen Quellen verfasst.',
 pl:'Treść redakcyjna SantosDia, opracowana niezależnie na podstawie dowodów i źródeł instytucjonalnych wskazanych poniżej.',
 ru:'Редакционный материал SantosDia, самостоятельно подготовленный на основе указанных ниже свидетельств и институциональных источников.',
 fil:'Editoryal na nilalaman ng SantosDia, malayang binuo mula sa ebidensiya at mga institusyonal na sangguniang nakalista sa ibaba.',
 sw:'Maudhui ya uhariri ya SantosDia, yaliyoandaliwa kwa kujitegemea kutokana na ushahidi na vyanzo vya taasisi vilivyoorodheshwa hapa chini.'
};

export default function SaintProfile({id,runtimeItem,calendarObservanceId}:{id:string;runtimeItem?:Observance;calendarObservanceId?:string}){
 const{locale,copy,timeZone,country}=useLanguage();const feature=getFeatureCopy(locale);const retention=getRetentionCopy(locale);const year=yearInTimeZone(timeZone);const curatedItem=getObservanceById(id,year,locale);const item=curatedItem??runtimeItem;
 if(!item)return <section className="message-card"><span className="eyebrow">404</span><h1>{feature.noMatch}</h1><Link className="btn btn-primary" href="/explore">{feature.navFind}</Link></section>;
 const biographyRecord=getSaintBiographyRecord(id),biography=getSaintBiography(id,locale),editorialReady=Boolean(biographyRecord&&isSaintBiographyIndexable(biographyRecord,locale));
 const evidenceObservanceId=curatedItem?.id??calendarObservanceId,name=displayObservanceName(item.names,locale,item.name),patronages=displayPatronages(item.patronages,locale),topics=evidenceObservanceId?topicsForObservance(evidenceObservanceId):[],historyCopy=biographyUi[locale],summary=localizedSummary(item,locale),scope=displayObservanceScope(item,locale,country),evidence=evidenceObservanceId?claimEvidenceFor(evidenceObservanceId):[],evidenceCopy=claimEvidenceUi[locale];
 const dateLabel=new Intl.DateTimeFormat(locale,{month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.dateISO}T00:00:00Z`));
 const evidenceDate=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${claimEvidenceReviewedAt}T00:00:00Z`));
 const biographyDate=biography?new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${biography.verifiedAt}T00:00:00Z`)):'';
 const feedId=calendarObservanceId??item.id;
 return <div className="page-stack saint-profile-page">
  <section className="page-hero saint-profile-hero"><div><span className="eyebrow">{feature.profileIntro}</span><h1>{name}</h1><p>{dateLabel} · {item.traditions.map(value=>traditionLabel(copy,value)).join(' · ')}</p><span className={`scope-label scope-${scope.kind}`}>{scope.label}</span></div><div className="saint-monogram" aria-hidden="true">✦</div></section>
  {editorialReady?<AdSlot slot={ADSENSE_TOP_SLOT} placement="top"/>:null}
  <section className="saint-profile-layout">
   <article className="saint-profile-main">
    <div className="tag-row">{item.traditions.map(value=><TraditionTag key={value} tradition={value}/>)}<span>{copy[item.category]}</span><span>{displayCalendarSystem(item.calendarSystem,locale)}</span><span>{validationStatusLabel(item.validationStatus,locale)}</span></div>
    {biography?<section className="saint-biography saint-biography-primary"><span className="eyebrow">{historyCopy.history}</span><h2>{biography.title}</h2><p className="biography-lead">{biography.summary}</p>{biography.facts.length?<div className="biography-facts"><h3>{historyCopy.keyFacts}</h3><dl>{biography.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></div>:null}<div className="biography-text">{biography.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><div className="biography-provenance"><div><h3>{historyCopy.sources}</h3><p className="biography-editorial-origin">{editorialOrigin[locale]}</p><p>{historyCopy.editorial}</p><ul className="biography-source-list">{biography.sources.map(source=><li key={source.url}><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.name} · {source.publisher} ↗</a></li>)}</ul></div><span>{historyCopy.verified}: {biographyDate}</span></div></section>:summary?<section className="profile-summary profile-summary-primary"><p lang={summary.language}>{summary.text}</p>{summary.isFallback?<small className="translation-fallback">{fallbackLanguageLabel(locale)}</small>:null}</section>:null}
    {patronages.length?<section className="profile-associations"><h2>{feature.associatedWith}</h2><div className="patronage-cloud">{patronages.map(value=><span key={value}>{value}</span>)}</div></section>:null}
    {evidence.length?<section className="profile-summary profile-evidence"><span className="eyebrow">{evidenceCopy.title}</span><p><strong>{evidenceCopy.reviewed}: {evidenceDate}</strong></p>{evidence.map((entry,index)=>{const unresolved=displayPatronages(unresolvedPatronages(entry),locale);return <div key={`${entry.claimType}-${index}`}><h3>{claimTypeLabel(entry.claimType,locale)}</h3><p>{evidenceCopy.corroborated}</p><p><a className="text-link" href={entry.source.url} target="_blank" rel="noreferrer">{evidenceCopy.officialSource}: {entry.source.name} ↗</a></p>{unresolved.length?<><h3>{evidenceCopy.unresolvedTitle}</h3><p>{evidenceCopy.unresolvedBody}</p><div className="patronage-cloud">{unresolved.map(value=><span key={value}>{value}</span>)}</div></>:null}</div>})}</section>:null}
    <div className="profile-date-link"><strong>{dateLabel}</strong><Link className="text-link" href={`/date/${item.dateISO.slice(5)}`}>{feature.openDay} →</Link></div>
    {topics.length?<section className="related-topics"><h3>{feature.relatedSearches}</h3><div>{topics.map(topic=><Link href={topicPath(topic)} key={`${topic.kind}-${topic.slug}`}>{topicLabel(topic,locale)}</Link>)}</div></section>:null}
   </article>
   <aside className="saint-profile-actions">
    <div className="profile-action-card profile-save-card"><SaveSaintButton id={id} dateISO={item.dateISO} locale={locale}/><p>{retention.saveHint}</p></div>
    <div className="profile-action-card"><h2>{biography?feature.annualCalendar:copy.addCalendar}</h2><AddToCalendar feedPath={`/api/ical/saint/${encodeURIComponent(feedId)}?locale=${locale}`} title={name}/></div>
    <div className="profile-action-card candle-profile"><CandleButton observanceId={item.id} dateISO={item.dateISO}/><p>{feature.freeCandle}</p></div>
    {editorialReady?<div className="ad-sidebar-rail"><AdSlot slot={ADSENSE_SIDEBAR_SLOT} placement="sidebar"/></div>:null}
   </aside>
  </section>
 </div>;
}
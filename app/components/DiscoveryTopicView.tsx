'use client';
import Link from 'next/link';
import { getDiscoveryTopic,getObservancesForTopic,topicDescription,topicLabel,topicsForObservance,type DiscoveryKind } from '../../data/discovery';
import { displayObservanceName,displayPatronages } from '../../lib/locale-display';
import { getFeatureCopy } from '../../lib/feature-copy';
import { traditionLabel } from '../../data/observances';
import { useLanguage } from './LanguageProvider';

export default function DiscoveryTopicView({kind,slug}:{kind:DiscoveryKind;slug:string}){
 const{locale,copy}=useLanguage();const feature=getFeatureCopy(locale);const topic=getDiscoveryTopic(kind,slug);const year=new Date().getFullYear();
 if(!topic)return <section className="message-card"><span className="eyebrow">404</span><h1>{feature.noMatch}</h1><Link className="btn btn-primary" href="/explore">{feature.navFind}</Link></section>;
 const items=getObservancesForTopic(topic,year,locale);
 return <div className="page-stack">
  <section className="page-hero compact-hero discovery-hero"><div><span className="eyebrow">{kind==='place'?feature.byPlace:feature.byProfession}</span><h1>{topicLabel(topic,locale)}</h1><p>{topicDescription(topic,locale)}</p></div><div className="hero-symbol">✦</div></section>
  <section className="topic-summary"><div><strong>{items.length}</strong><span>{feature.saintResults}</span></div><p>{copy.disclaimer}</p></section>
  <section className="profile-grid">{items.map(item=>{
   const name=displayObservanceName(item.names,locale,item.name),patronages=displayPatronages(item.patronages,locale),related=topicsForObservance(item.id).filter(value=>value.slug!==topic.slug).slice(0,3);
   return <article className="saint-preview" key={item.id}><div className="saint-preview-date"><strong>{item.day}</strong><span>{new Intl.DateTimeFormat(locale,{month:'short',timeZone:'UTC'}).format(new Date(`${item.dateISO}T00:00:00Z`))}</span></div><div><div className="tag-row">{item.traditions.map(value=><span key={value}>{traditionLabel(copy,value)}</span>)}{patronages.slice(0,2).map(value=><span key={value}>{value}</span>)}</div><h2>{name}</h2>{item.summary?<p>{item.summary}</p>:null}<div className="saint-preview-links"><Link className="btn btn-primary" href={`/saint/${item.id}`}>{feature.openProfile}</Link><Link className="text-link" href={`/day/${item.dateISO}`}>{feature.openDay} →</Link></div>{related.length?<div className="related-mini">{related.map(value=><Link href={value.kind==='place'?`/place/${value.slug}`:`/patronage/${value.slug}`} key={value.slug}>{topicLabel(value,locale)}</Link>)}</div>:null}</div></article>;
  })}</section>
  <section className="notice-card"><strong>{feature.officialSource}</strong><p>{feature.copyrightNoAffiliation}</p><Link className="text-link" href="/copyright">{feature.navCopyright} →</Link></section>
 </div>;
}

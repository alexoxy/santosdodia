'use client';
import Link from 'next/link';
import { useEffect,useMemo,useState } from 'react';
import { getObservancesForDate,searchObservances,traditionLabel,TRADITIONS,type Observance,type Tradition } from '../../data/observances';
import { getObservancesForTopic,getPopularTopics,parseDiscoveryDate,searchDiscoveryTopics,topicDescription,topicLabel,topicPath } from '../../data/discovery';
import { displayObservanceName,displayPatronages } from '../../lib/locale-display';
import { getFeatureCopy } from '../../lib/feature-copy';
import PatronageSearch from './PatronageSearch';
import { useLanguage } from './LanguageProvider';

function uniqueObservances(items:Observance[]){const seen=new Map<string,Observance>();for(const item of items)seen.set(item.id,item);return [...seen.values()]}

export default function SearchExplorer(){
 const{locale,copy}=useLanguage();const feature=getFeatureCopy(locale);const[q,setQuery]=useState('');const[tradition,setTradition]=useState<'all'|Tradition>('all');const year=new Date().getFullYear();
 useEffect(()=>{const sync=()=>setQuery(new URLSearchParams(window.location.search).get('q')??'');sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
 const dateIntent=useMemo(()=>parseDiscoveryDate(q,year),[q,year]);
 const topics=useMemo(()=>q.trim()?searchDiscoveryTopics(q,locale).slice(0,9):getPopularTopics().slice(0,9),[q,locale]);
 const items=useMemo(()=>{
  const filterTradition=(item:Observance)=>tradition==='all'||item.traditions.includes(tradition);
  if(dateIntent)return getObservancesForDate(dateIntent,locale,{tradition:tradition==='all'?undefined:tradition});
  const direct=searchObservances(q,year,locale,{tradition:tradition==='all'?undefined:tradition});
  if(!q.trim())return direct;
  const associated=topics.flatMap(topic=>getObservancesForTopic(topic,year,locale)).filter(filterTradition);
  return uniqueObservances([...associated,...direct]);
 },[q,tradition,year,locale,dateIntent,topics]);
 return <div className="page-stack">
  <section className="page-hero compact-hero"><div><span className="eyebrow">{feature.findEyebrow}</span><h1>{feature.navFind}</h1><p>{feature.findIntro}</p></div><div className="hero-symbol">⌕</div></section>
  <PatronageSearch compact/>
  <section className="search-card">
   <div className="search-controls"><div className="search-field"><span>⌕</span><input value={q} onChange={event=>setQuery(event.target.value)} placeholder={feature.findPlaceholder}/>{q?<button onClick={()=>setQuery('')}>{copy.clear}</button>:null}</div><select value={tradition} onChange={event=>setTradition(event.target.value as 'all'|Tradition)}><option value="all">{copy.all}</option>{TRADITIONS.map(value=><option key={value} value={value}>{traditionLabel(copy,value)}</option>)}</select></div>
   {dateIntent?<div className="results-heading"><strong>{feature.dateMatch}</strong><Link className="text-link" href={`/day/${dateIntent}`}>{dateIntent} →</Link></div>:null}
   {topics.length?<section className="topic-results"><div className="section-heading compact"><div><span className="eyebrow">{feature.topicResults}</span><h2>{q||feature.popular}</h2></div></div><div className="topic-card-grid">{topics.map(topic=><article className="topic-card" key={`${topic.kind}-${topic.slug}`}><span>{topic.kind==='place'?feature.byPlace:topic.kind==='profession'?feature.byProfession:feature.associatedWith}</span><h2>{topicLabel(topic,locale)}</h2><p>{topicDescription(topic,locale)}</p><Link className="text-link" href={topicPath(topic)}>{feature.openTopic} →</Link></article>)}</div></section>:null}
   <div className="results-heading"><strong>{`${items.length} ${copy.results}`}</strong><span>{dateIntent||q||feature.allResults}</span></div>
   {items.length?<div className="result-grid">{items.map(item=>{const patronages=displayPatronages(item.patronages,locale);return <article className="result-card" key={`${item.id}-${item.dateISO}`}><div className="result-meta"><span>{new Intl.DateTimeFormat(locale,{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.dateISO}T00:00:00Z`))}</span><span>{item.traditions.map(value=>traditionLabel(copy,value)).join(' · ')}</span></div><h2>{displayObservanceName(item.names,locale,item.name)}</h2>{item.summary?<p>{item.summary}</p>:null}<div className="tag-row"><span>{copy[item.category]}</span>{item.validationStatus?<span>{item.validationStatus==='review-required'?copy.reviewRequired:copy.verified}</span>:null}{patronages.slice(0,3).map(value=><span key={value}>{value}</span>)}</div><div className="saint-preview-links"><Link className="btn btn-primary" href={`/saint/${item.id}`}>{feature.openProfile}</Link><Link className="text-link" href={`/day/${item.dateISO}`}>{feature.openDay} →</Link></div></article>})}</div>:<div className="empty-state"><span>✦</span><p>{feature.noMatch}</p></div>}
  </section>
 </div>;
}

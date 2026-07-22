'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  searchObservances,
  traditionLabel,
  TRADITIONS,
  type Observance,
  type Tradition
} from '../../data/observances';
import { useLanguage } from './LanguageProvider';

export default function SearchExplorer(){
  const{locale,copy}=useLanguage();
  const[q,setQuery]=useState('');
  const[tradition,setTradition]=useState<'all'|Tradition>('all');
  const[loading,setLoading]=useState(false);
  const year=new Date().getFullYear();
  const fallback=useMemo(()=>searchObservances(q,year,locale,{tradition:tradition==='all'?undefined:tradition}),[q,tradition,year,locale]);
  const[items,setItems]=useState<Observance[]>(fallback);

  useEffect(()=>{setItems(fallback)},[fallback]);
  useEffect(()=>{
    const controller=new AbortController();
    const timer=window.setTimeout(()=>{
      const params=new URLSearchParams({q,year:String(year),locale,live:'1'});
      if(tradition!=='all')params.set('tradition',tradition);
      setLoading(true);
      fetch(`/api/v1/search?${params}`,{signal:controller.signal})
        .then(response=>response.ok?response.json():Promise.reject(new Error('Search failed')))
        .then(payload=>{if(Array.isArray(payload?.data))setItems(payload.data)})
        .catch(error=>{if(error?.name!=='AbortError')setItems(fallback)})
        .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    },q?280:60);
    return()=>{window.clearTimeout(timer);controller.abort()};
  },[q,tradition,year,locale,fallback]);

  return <div className="page-stack">
    <section className="page-hero compact-hero"><div><span className="eyebrow">{copy.global} · {copy.liveData}</span><h1>{copy.searchTitle}</h1><p>{copy.searchIntro}</p></div><div className="hero-symbol">⌕</div></section>
    <section className="search-card">
      <div className="search-controls">
        <div className="search-field"><span>⌕</span><input value={q} onChange={event=>setQuery(event.target.value)} placeholder={copy.searchPlaceholder}/>{q?<button onClick={()=>setQuery('')}>{copy.clear}</button>:null}</div>
        <select value={tradition} onChange={event=>setTradition(event.target.value as 'all'|Tradition)}><option value="all">{copy.all}</option>{TRADITIONS.map(value=><option key={value} value={value}>{traditionLabel(copy,value)}</option>)}</select>
      </div>
      <div className="results-heading"><strong>{loading?copy.loading:`${items.length} ${copy.results}`}</strong><span>{q||copy.all}</span></div>
      {items.length?<div className="result-grid">{items.map(item=><article className="result-card" key={item.id}>
        <div className="result-meta"><span>{new Intl.DateTimeFormat(locale,{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.dateISO}T00:00:00Z`))}</span><span>{item.traditions.map(value=>traditionLabel(copy,value)).join(' · ')}</span></div>
        <h2>{item.name}</h2>{item.summary?<p>{item.summary}</p>:null}
        <div className="tag-row"><span>{copy[item.category]}</span>{item.validationStatus?<span>{item.validationStatus==='review-required'?copy.reviewRequired:copy.verified}</span>:null}{(item.patronages??[]).slice(0,2).map(value=><span key={value}>{value}</span>)}</div>
        <a className="text-link" href={`/day/${item.dateISO}`}>{copy.openDay} →</a>
      </article>)}</div>:<div className="empty-state"><span>✦</span><p>{copy.noResults}</p></div>}
    </section>
  </div>;
}

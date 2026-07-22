'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  getObservancesForDate,
  isValidDateISO,
  SOURCE_CATALOG,
  traditionClass,
  traditionLabel,
  type Observance
} from '../../data/observances';
import AddToCalendar from './AddToCalendar';
import CandleButton from './CandleButton';
import { useLanguage } from './LanguageProvider';

export default function DayView({dateISO}:{dateISO:string}){
  const{locale,copy}=useLanguage();
  const valid=isValidDateISO(dateISO);
  const fallback=useMemo(()=>valid?getObservancesForDate(dateISO,locale):[],[valid,dateISO,locale]);
  const[items,setItems]=useState<Observance[]>(fallback);
  const[loading,setLoading]=useState(false);

  useEffect(()=>{setItems(fallback)},[fallback]);
  useEffect(()=>{
    if(!valid)return;
    const controller=new AbortController();
    setLoading(true);
    fetch(`/api/v1/observances?date=${dateISO}&locale=${locale}&live=1`,{signal:controller.signal})
      .then(response=>response.ok?response.json():Promise.reject(new Error('Day request failed')))
      .then(payload=>{if(Array.isArray(payload?.data))setItems(payload.data)})
      .catch(error=>{if(error?.name!=='AbortError')setItems(fallback)})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[valid,dateISO,locale,fallback]);

  if(!valid)return <section className="message-card"><span className="eyebrow">400</span><h1>{copy.dateInvalid}</h1><a className="btn btn-primary" href="/calendar">{copy.backCalendar}</a></section>;
  const date=new Date(`${dateISO}T00:00:00Z`);
  const label=new Intl.DateTimeFormat(locale,{dateStyle:'full',timeZone:'UTC'}).format(date);
  return <div className="page-stack">
    <section className="page-hero day-hero"><div><span className="eyebrow">{copy.observancesOn}</span><h1>{label}</h1><p>{copy.disclaimer}</p></div><div className="date-orb"><strong>{date.getUTCDate()}</strong><span>{new Intl.DateTimeFormat(locale,{month:'short',timeZone:'UTC'}).format(date)}</span></div></section>
    {loading?<div className="data-loading" aria-live="polite">{copy.loading}</div>:null}
    <section className="day-list">{items.length?items.map(item=>{
      const sources=item.sourceIds.map(sourceId=>SOURCE_CATALOG.find(source=>source.id===sourceId)).filter(Boolean);
      return <article className="day-observance" key={item.id}>
        <div className="day-observance-main"><div className={`tradition-emblem ${traditionClass(item.traditions[0])}`}>✦</div><div>
          <div className="tag-row">{item.traditions.map(value=><span key={value}>{traditionLabel(copy,value)}</span>)}<span>{copy[item.category]}</span><span>{item.calendarSystem}</span><span>{item.validationStatus==='review-required'?copy.reviewRequired:copy.verified}</span></div>
          <h2>{item.name}</h2>{item.summary?<p>{item.summary}</p>:null}
          {item.patronages?.length?<div className="patronage-line"><strong>{copy.patronage}:</strong> {item.patronages.join(' · ')}</div>:null}
          {sources.length?<div className="source-inline"><strong>{copy.navSources}:</strong> {sources.map((source,index)=><span key={source!.id}>{index?' · ':''}<a href={source!.url} target="_blank" rel="noreferrer">{source!.name}</a></span>)}</div>:null}
        </div></div>
        <CandleButton observanceId={item.id} dateISO={dateISO}/>
      </article>;
    }):<div className="empty-state large"><span>✦</span><p>{loading?copy.loading:copy.noObservances}</p></div>}</section>
    <section className="subscription-strip"><div><span className="eyebrow">ICS · Google · Apple · Outlook</span><h2>{copy.addCalendar}</h2></div><AddToCalendar feedPath={`/api/ical/all?locale=${locale}`} title={`${copy.observancesOn} ${label}`} dateISO={dateISO}/></section>
  </div>;
}

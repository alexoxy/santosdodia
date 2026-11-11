'use client';

import { useCallback,useEffect,useMemo,useState } from 'react';
import type { LitcalCalendarRef,LitcalDayResult,LitcalEvent } from '../../lib/litcal-mirror';
import { liturgyUi } from '../../lib/liturgy-i18n';
import { useLanguage } from './LanguageProvider';
import styles from './LiturgyExplorer.module.css';

function todayISO(){const date=new Date();return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function calendarValue(calendar:LitcalCalendarRef){return calendar.kind==='general'?'general':`${calendar.kind}:${calendar.id}`}
function parseCalendar(value:string):LitcalCalendarRef{if(value==='general')return{kind:'general'};const[kind,id]=value.split(':');return kind==='nation'?{kind:'nation',id}:kind==='diocese'?{kind:'diocese',id}:{kind:'general'}}
function colourValue(event:LitcalEvent){const rawValue=event.raw.color??event.raw.colour??event.colour;const raw=Array.isArray(rawValue)?rawValue[0]:rawValue;if(!raw)return'#d8b35c';const normalized=String(raw).toLowerCase();const map:Record<string,string>={white:'#f4efe2',red:'#a84444',green:'#3f7754',purple:'#71558c',violet:'#71558c',rose:'#c87991',pink:'#c87991',black:'#24272b',gold:'#cba54d'};return map[normalized]??'#d8b35c'}
function readingRows(value:unknown):string[]{if(!value)return[];if(Array.isArray(value))return value.flatMap(readingRows);if(typeof value==='string'||typeof value==='number')return[String(value)];if(typeof value==='object')return Object.values(value as Record<string,unknown>).flatMap(readingRows);return[]}

function EventCard({event,copy}:{event:LitcalEvent;copy:(typeof liturgyUi)[keyof typeof liturgyUi]}){
 const colours=Array.isArray(event.colour)?event.colour.join(' · '):event.colour;
 const commons=Array.isArray(event.common)?event.common.join(' · '):event.common;
 const readings=readingRows(event.readings);
 const details=[[copy.colour,colours],[copy.season,event.season],[copy.common,commons],[copy.sundayCycle,event.sundayCycle],[copy.weekdayCycle,event.weekdayCycle],[copy.psalterWeek,event.psalterWeek]].filter(([,value])=>value!==undefined&&value!=='');
 return <article className={styles.event}>
  <header className={styles.eventHeader}><div>{event.grade?<span className={styles.grade}>{event.grade}</span>:null}<h2>{event.name}</h2></div><span className={styles.colour} style={{background:colourValue(event)}} title={colours}/></header>
  {details.length?<div className={styles.details}>{details.map(([label,value])=><div className={styles.detail} key={String(label)}><span>{label}</span><strong>{String(value)}</strong></div>)}</div>:null}
  {readings.length?<section className={styles.section}><h3>{copy.readings}</h3><div className={styles.readings}>{readings.map((reading,index)=><div className={styles.reading} key={`${reading}-${index}`}>{reading}</div>)}</div></section>:null}
 </article>;
}

export default function LiturgyExplorer(){
 const{locale}=useLanguage();const copy=liturgyUi[locale];
 const[date,setDate]=useState(todayISO());const[calendar,setCalendar]=useState<LitcalCalendarRef>({kind:'general'});
 const[calendars,setCalendars]=useState<LitcalCalendarRef[]>([{kind:'general',label:copy.generalCalendar}]);
 const[result,setResult]=useState<LitcalDayResult|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState('');
 const query=useMemo(()=>{const params=new URLSearchParams({date,locale,kind:calendar.kind});if(calendar.id)params.set('calendar',calendar.id);return params.toString()},[date,locale,calendar.kind,calendar.id]);
 const regionNames=useMemo(()=>{try{return new Intl.DisplayNames([locale],{type:'region'})}catch{return undefined}},[locale]);
 function calendarLabel(item:LitcalCalendarRef){if(item.kind==='general')return copy.generalCalendar;if(item.kind==='nation')return`${regionNames?.of(item.id??'')??item.id} — ${copy.nationalCalendar}`;return item.label??`${item.id} — ${copy.diocesanCalendar}`}
 useEffect(()=>{fetch('/api/v1/litcal/calendars').then(response=>response.ok?response.json():null).then(payload=>{if(Array.isArray(payload?.data))setCalendars(payload.data)}).catch(()=>undefined)},[]);
 useEffect(()=>{const fromUrl=new URLSearchParams(window.location.search).get('date');if(fromUrl&&/^\d{4}-\d{2}-\d{2}$/.test(fromUrl))setDate(fromUrl)},[]);
 const load=useCallback(()=>{setLoading(true);setError('');fetch(`/api/v1/liturgy?${query}`).then(response=>response.ok?response.json():Promise.reject(new Error('request failed'))).then(payload=>setResult(payload.data)).catch(()=>{setError(copy.sourceUnavailable);setResult(null)}).finally(()=>setLoading(false))},[query,copy.sourceUnavailable]);
 useEffect(()=>{load()},[load]);
 const sourceLabel=result?.source==='primary'?copy.sourcePrimary:result?.source==='mirror'?copy.sourceMirror:copy.sourceFallback;
 return <div className={styles.page}>
  <section className={styles.hero}><span className={styles.eyebrow}>LitCal · {copy.generalCalendar}</span><h1>{copy.title}</h1><p>{copy.intro}</p></section>
  <section className={styles.controls}>
   <label className={styles.field}><span>{copy.date}</span><input type="date" value={date} min="1970-01-01" max="9999-12-31" onChange={event=>setDate(event.target.value)}/></label>
   <label className={styles.field}><span>{copy.calendar}</span><select value={calendarValue(calendar)} onChange={event=>setCalendar(parseCalendar(event.target.value))}>{calendars.map(item=><option key={calendarValue(item)} value={calendarValue(item)}>{calendarLabel(item)}</option>)}</select></label>
   <button className={styles.button} onClick={load}>{copy.load}</button>
  </section>
  {loading?<div className={styles.status}>{copy.loading}</div>:null}
  {error?<div className={styles.status}><strong>{error}</strong><button className={styles.button} onClick={load}>{copy.retry}</button></div>:null}
  {result?<>
   <div className={styles.status}><strong>{sourceLabel}</strong><span>{copy.lastUpdated}: {new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(result.checkedAt))}</span></div>
   <section className={styles.grid}>{result.events.length?result.events.map(event=><EventCard event={event} copy={copy} key={event.id}/>):<div className={styles.empty}>{copy.noEvents}</div>}</section>
   {result.messages.length?<section className={styles.event}><div className={styles.section}><h3>{copy.messages}</h3><ul className={styles.messages}>{result.messages.map((message,index)=><li key={`${message}-${index}`}>{message}</li>)}</ul></div></section>:null}
   <section className={styles.event}><div className={styles.section}><h3>{copy.provenance}</h3><div className={styles.links}><a href={`/api/v1/liturgy?${query}`} target="_blank" rel="noreferrer">{copy.rawData}</a><a href="https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI" target="_blank" rel="noreferrer">{copy.sourceCode}</a></div></div></section>
  </>:null}
 </div>;
}

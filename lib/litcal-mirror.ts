import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Locale } from './i18n';

export const LITCAL_PRIMARY_BASE='https://litcal.johnromanodorazio.com/api/v5';
const TIMEOUT_MS=14_000;

export type LitcalCalendarRef={kind:'general'|'nation'|'diocese';id?:string;label?:string;locales?:string[]};
export type LitcalSource='primary'|'mirror'|'fallback';
export type LitcalEvent={
 id:string;name:string;dateISO:string;grade?:string;colour?:string|string[];common?:string|string[];
 season?:string;sundayCycle?:string;weekdayCycle?:string;psalterWeek?:string|number;liturgicalYear?:string;
 readings?:unknown;raw:Record<string,unknown>
};
export type LitcalDayResult={date:string;events:LitcalEvent[];messages:string[];settings:Record<string,unknown>;metadata:Record<string,unknown>;source:LitcalSource;sourceUrl?:string;checkedAt:string;raw?:unknown};

type UnknownRecord=Record<string,unknown>;

const localeMap:Record<Locale,string>={en:'en_US',es:'es_ES',pt:'pt_PT',fr:'fr_FR',fil:'en_US',ru:'ru_RU',sw:'en_US',de:'de_DE',it:'it_IT',pl:'pl_PL'};
export function litcalLocale(locale:Locale){return localeMap[locale]??'en_US'}

function record(value:unknown):UnknownRecord|undefined{return value&&typeof value==='object'&&!Array.isArray(value)?value as UnknownRecord:undefined}
function text(value:unknown):string|undefined{return typeof value==='string'&&value.trim()?value.trim():typeof value==='number'&&Number.isFinite(value)?String(value):undefined}
function stringList(value:unknown):string[]{if(Array.isArray(value))return value.flatMap(item=>typeof item==='string'?[item]:[]);const single=text(value);return single?[single]:[]}
function directDate(value:unknown):string|undefined{
 if(typeof value==='string'){
  const match=value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];if(match)return match;
  const parsed=new Date(value);if(!Number.isNaN(parsed.getTime()))return parsed.toISOString().slice(0,10);
 }
 if(typeof value==='number'&&Number.isFinite(value)){
  const parsed=new Date(value<10_000_000_000?value*1000:value);if(!Number.isNaN(parsed.getTime()))return parsed.toISOString().slice(0,10);
 }
 const nested=record(value);return nested?directDate(nested.date??nested.dateISO??nested.timestamp??nested.value):undefined;
}
function slug(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)||'event'}

export function calendarPath(ref:LitcalCalendarRef,year:number){
 if(ref.kind==='nation'&&ref.id)return`calendar/nation/${encodeURIComponent(ref.id)}/${year}`;
 if(ref.kind==='diocese'&&ref.id)return`calendar/diocese/${encodeURIComponent(ref.id)}/${year}`;
 return`calendar/${year}`;
}
function primaryUrl(ref:LitcalCalendarRef,year:number,locale:Locale){return`${LITCAL_PRIMARY_BASE}/${calendarPath(ref,year)}?locale=${encodeURIComponent(litcalLocale(locale))}&year_type=CIVIL`}
function mirrorRelativePath(ref:LitcalCalendarRef,year:number,locale:Locale){
 const id=ref.kind==='general'?'general':`${ref.kind}/${String(ref.id??'unknown').replace(/[^a-zA-Z0-9_-]/g,'')}`;
 return path.join('data','litcal-mirror','calendars',id,String(year),`${litcalLocale(locale)}.json`);
}
async function fetchJson(url:string):Promise<unknown>{
 const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SantosDoDia/3.0 (+https://santosdodia.com)'},next:{revalidate:21_600},signal:AbortSignal.timeout(TIMEOUT_MS)});
 if(!response.ok)throw new Error(`LitCal HTTP ${response.status}`);return response.json();
}
async function readMirror(ref:LitcalCalendarRef,year:number,locale:Locale):Promise<unknown>{
 const candidates=[mirrorRelativePath(ref,year,locale),mirrorRelativePath(ref,year,'en')];
 for(const relative of candidates){try{return JSON.parse(await readFile(path.join(process.cwd(),relative),'utf8'))}catch{/* try next */}}
 throw new Error('LitCal mirror unavailable');
}

function eventCandidates(payload:unknown):unknown[]{
 if(Array.isArray(payload))return payload;
 const root=record(payload);if(!root)return[];
 const candidate=root.LitCal??root.litcal??root.events??root.calendar??root.data;
 if(Array.isArray(candidate))return candidate;
 const object=record(candidate);return object?Object.values(object).flatMap(value=>Array.isArray(value)?value:[value]):[];
}
function eventName(item:UnknownRecord){return text(item.name??item.name_lcl??item.title??item.event_name??record(item.event)?.name)??'Liturgical observance'}
function normalizeEvent(raw:unknown,index:number):LitcalEvent|undefined{
 const item=record(raw);if(!item)return;
 const name=eventName(item);const dateISO=directDate(item.date??item.dateISO??item.datetime??item.timestamp??record(item.event)?.date);if(!dateISO)return;
 const grade=text(item.grade_lcl??item.grade??item.rank??item.precedence);
 const colourValue=item.color_lcl??item.color??item.colour;
 const commonValue=item.common_lcl??item.common;
 return{
  id:text(item.event_key??item.event_idx??item.id)??`${slug(name)}-${dateISO}-${index}`,name,dateISO,grade,
  colour:Array.isArray(colourValue)?stringList(colourValue):text(colourValue),
  common:Array.isArray(commonValue)?stringList(commonValue):text(commonValue),
  season:text(item.liturgical_season_lcl??item.liturgical_season??item.season_lcl??item.season),
  sundayCycle:text(item.sunday_cycle??item.year_cycle??item.cycle),weekdayCycle:text(item.weekday_cycle),
  psalterWeek:text(item.psalter_week??item.psalterWeek),liturgicalYear:text(item.liturgical_year??item.liturgicalYear),
  readings:item.readings??item.lectionary??item.reading,raw:item
 };
}
function messages(payload:unknown):string[]{const root=record(payload);return stringList(root?.Messages??root?.messages??root?.Message??root?.message)}
function settings(payload:unknown):UnknownRecord{return record(record(payload)?.Settings??record(payload)?.settings)??{}}
function metadata(payload:unknown):UnknownRecord{return record(record(payload)?.Metadata??record(payload)?.metadata??record(payload)?.litcal_metadata)??{}}
export function parseLitcalDay(payload:unknown,date:string,source:LitcalSource,sourceUrl?:string):LitcalDayResult{
 const events=eventCandidates(payload).map(normalizeEvent).filter((value):value is LitcalEvent=>Boolean(value)).filter(event=>event.dateISO===date);
 return{date,events,messages:messages(payload),settings:settings(payload),metadata:metadata(payload),source,sourceUrl,checkedAt:new Date().toISOString(),raw:payload};
}

export async function getLitcalDay(args:{date:string;locale:Locale;calendar?:LitcalCalendarRef}):Promise<LitcalDayResult>{
 const calendar=args.calendar??{kind:'general'};const year=Number(args.date.slice(0,4));const url=primaryUrl(calendar,year,args.locale);
 try{return parseLitcalDay(await fetchJson(url),args.date,'primary',url)}catch(primaryError){
  try{return parseLitcalDay(await readMirror(calendar,year,args.locale),args.date,'mirror')}catch{
   return{date:args.date,events:[],messages:[],settings:{},metadata:{error:primaryError instanceof Error?primaryError.message:'LitCal unavailable'},source:'fallback',checkedAt:new Date().toISOString()};
  }
 }
}

export async function getLitcalCalendars():Promise<{calendars:LitcalCalendarRef[];source:LitcalSource;raw?:unknown}>{
 try{const raw=await fetchJson(`${LITCAL_PRIMARY_BASE}/calendars`);return{calendars:normalizeCalendars(raw),source:'primary',raw}}catch{
  try{const raw=JSON.parse(await readFile(path.join(process.cwd(),'data','litcal-mirror','catalog.json'),'utf8'));return{calendars:normalizeCalendars(raw),source:'mirror',raw}}catch{return{calendars:[{kind:'general',label:'General Roman Calendar'}],source:'fallback'}}
 }
}
export function normalizeCalendars(payload:unknown):LitcalCalendarRef[]{
 const root=record(payload);const meta=record(root?.litcal_metadata??root?.metadata??root)??{};const output:LitcalCalendarRef[]=[{kind:'general',label:'General Roman Calendar'}];
 for(const raw of Array.isArray(meta.national_calendars)?meta.national_calendars:[]){const item=record(raw);const id=text(item?.calendar_id);if(id)output.push({kind:'nation',id,label:`${id} — National calendar`,locales:stringList(item?.locales)})}
 for(const raw of Array.isArray(meta.diocesan_calendars)?meta.diocesan_calendars:[]){const item=record(raw);const id=text(item?.calendar_id);if(id)output.push({kind:'diocese',id,label:text(item?.diocese)??id,locales:stringList(item?.locales)})}
 return output;
}

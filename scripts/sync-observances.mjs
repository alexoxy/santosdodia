import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const outputPath = new URL('../data/generated/source-snapshot.json', import.meta.url);
const timeoutMs = 30_000;
const currentYear = new Date().getUTCFullYear();
const years = [currentYear, currentYear + 1];

function record(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:null}
function text(value){return typeof value==='string'&&value.trim()?value.trim():typeof value==='number'?String(value):undefined}
function slug(value){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)||'observance'}
function dateISO(value,fallback){
 if(typeof value==='string'){
  const direct=value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];if(direct)return direct;
  const parsed=new Date(value);if(!Number.isNaN(parsed.getTime()))return parsed.toISOString().slice(0,10);
 }
 if(typeof value==='number'&&Number.isFinite(value)){
  const parsed=new Date(value<10_000_000_000?value*1000:value);if(!Number.isNaN(parsed.getTime()))return parsed.toISOString().slice(0,10);
 }
 return fallback?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
}
function category(name){
 const lower=name.toLowerCase();
 if(/fast|lent|abstin|пост/.test(lower))return'fast';
 if(/mary|virgin|theotokos|our lady|богород/.test(lower))return'marian';
 if(/apostle|evangelist|апостол/.test(lower))return'apostle';
 if(/martyr|мучен/.test(lower))return'martyr';
 if(/lord|christ|nativity|epiphany|theophany|ascension|pentecost|cross|resurrection|easter|pascha|feast|solemnity/.test(lower))return'feast';
 return'saint';
}
function observation({sourceId,externalId,date,name,tradition,calendarSystem,validationStatus,summary}){
 const[,month,day]=date.split('-').map(Number);
 return {id:`${sourceId}-${slug(externalId||name)}-${date}`,externalId,month,day,dateISO:date,traditions:[tradition],category:category(name),calendarSystem,names:{en:name},name,summaries:summary?{en:summary}:undefined,summary,countries:['GLOBAL'],sourceIds:[sourceId],translationStatus:'source',validationStatus,lastVerified:new Date().toISOString().slice(0,10)};
}
async function fetchJson(url){
 const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SantosDoDia-Sync/2.0'},signal:AbortSignal.timeout(timeoutMs)});
 if(!response.ok)throw new Error(`HTTP ${response.status}`);
 return response.json();
}
function litcalEvents(payload){
 const root=record(payload);if(!root)return Array.isArray(payload)?payload:[];
 const candidate=root.LitCal??root.litcal??root.events??root.calendar??root.data;
 if(Array.isArray(candidate))return candidate;
 const object=record(candidate);return object?Object.values(object).flatMap(value=>Array.isArray(value)?value:[value]):[];
}
function normalizeLitcal(payload,year){
 const items=[];
 for(const raw of litcalEvents(payload)){
  const event=record(raw);if(!event)continue;
  const nested=record(event.date);
  const date=dateISO(event.date??event.dateISO??event.datetime??nested?.date??event.timestamp);
  const name=text(event.name??event.title??event.event_name??event.name_lcl??record(event.event)?.name);
  if(!date||!date.startsWith(`${year}-`)||!name)continue;
  const grade=text(event.grade_lcl??event.grade??event.rank),color=text(event.color);
  items.push(observation({sourceId:'litcal-api',externalId:text(event.event_key??event.event_idx??event.id),date,name,tradition:'roman-catholic',calendarSystem:'gregorian',validationStatus:'verified',summary:[grade,color?`Liturgical colour: ${color}`:undefined].filter(Boolean).join(' · ')||undefined}));
 }
 return items;
}
function normalizeOrthodox(payload){
 const data=record(record(payload)?.data);if(!data)return[];
 const items=[];
 for(const[key,rawDay]of Object.entries(data)){
  const day=record(rawDay);if(!day)continue;
  const date=dateISO(day.gregorianDate??day.gregorian_date,key);if(!date)continue;
  for(const raw of Array.isArray(day.saints)?day.saints:[]){
   const saint=record(raw),name=text(saint?.name??saint?.label??saint?.title);if(!saint||!name)continue;
   items.push(observation({sourceId:'orthodox-range-api',externalId:text(saint.id),date,name,tradition:'eastern-orthodox',calendarSystem:'julian',validationStatus:'review-required'}));
  }
  for(const raw of Array.isArray(day.events)?day.events:[]){
   const event=record(raw),name=text(event?.label??event?.name??event?.title);if(!event||!name)continue;
   items.push(observation({sourceId:'orthodox-range-api',externalId:text(event.id),date,name,tradition:'eastern-orthodox',calendarSystem:'julian',validationStatus:'review-required'}));
  }
 }
 return items;
}
function dedupe(items){
 const map=new Map();
 for(const item of items){const key=`${item.dateISO}|${item.name.toLowerCase()}|${item.traditions.join(',')}`;if(!map.has(key))map.set(key,item)}
 return[...map.values()].sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name));
}
async function previousSnapshot(){
 try{return JSON.parse(await readFile(outputPath,'utf8'))}catch{return{generatedAt:null,years:{},sourceHealth:[]}}
}

const previous=await previousSnapshot();
const next={generatedAt:new Date().toISOString(),years:{...previous.years},sourceHealth:[]};
for(const year of years){
 const observations=[];
 for(const source of [
  {id:'litcal-api',url:`https://litcal.johnromanodorazio.com/api/v5/calendar/${year}?locale=en_US&year_type=CIVIL`,normalize:value=>normalizeLitcal(value,year)},
  {id:'orthodox-range-api',url:`https://api.ispovednik.org/api/v1/saints/year/${year}?lang=en`,normalize:normalizeOrthodox}
 ]){
  const checkedAt=new Date().toISOString();
  try{
   const payload=await fetchJson(source.url),items=source.normalize(payload);
   observations.push(...items);next.sourceHealth.push({sourceId:source.id,year,ok:items.length>0,count:items.length,checkedAt,message:items.length?'':'No records returned'});
  }catch(error){
   next.sourceHealth.push({sourceId:source.id,year,ok:false,count:0,checkedAt,message:error instanceof Error?error.message:String(error)});
  }
 }
 if(observations.length)next.years[String(year)]={observations:dedupe(observations)};
 else if(!next.years[String(year)])next.years[String(year)]={observations:[]};
}
await mkdir(dirname(outputPath.pathname),{recursive:true});
await writeFile(outputPath,`${JSON.stringify(next,null,2)}\n`,'utf8');
console.log(`Updated ${outputPath.pathname}`);
for(const health of next.sourceHealth)console.log(`${health.sourceId} ${health.year}: ${health.ok?'OK':'FAILED'} (${health.count}) ${health.message||''}`);

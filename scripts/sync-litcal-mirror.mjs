import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE='https://litcal.johnromanodorazio.com/api/v5';
const ROOT=path.resolve('data/litcal-mirror');
const TIMEOUT=45_000;
const currentYear=new Date().getUTCFullYear();
const YEARS=[currentYear-1,currentYear,currentYear+1,currentYear+2];
const SITE_LOCALES=['en_US','es_ES','pt_PT','fr_FR','ru_RU','de_DE','it_IT','pl_PL'];
const CONCURRENCY=4;

async function fetchJson(url){
 const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SantosDoDia-Mirror/3.0 (+https://santosdodia.com)'},signal:AbortSignal.timeout(TIMEOUT)});
 if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);return response.json();
}
async function writeJson(file,value){await mkdir(path.dirname(file),{recursive:true});await writeFile(file,`${JSON.stringify(value,null,2)}\n`,'utf8')}
async function existing(file){try{return JSON.parse(await readFile(file,'utf8'))}catch{return undefined}}
function safe(value){return String(value).replace(/[^a-zA-Z0-9_.-]/g,'_')}
function calendarUrl(kind,id,year,locale){
 const segment=kind==='general'?`calendar/${year}`:`calendar/${kind}/${encodeURIComponent(id)}/${year}`;
 return`${BASE}/${segment}?locale=${encodeURIComponent(locale)}&year_type=CIVIL`;
}
function calendarFile(kind,id,year,locale){const segment=kind==='general'?'general':`${kind}/${safe(id)}`;return path.join(ROOT,'calendars',segment,String(year),`${safe(locale)}.json`)}
async function pool(tasks){
 const queue=[...tasks];const workers=Array.from({length:CONCURRENCY},async()=>{while(queue.length){const task=queue.shift();if(task)await task()}});await Promise.all(workers);
}

const health=[];
async function mirrored(label,url,file){
 const checkedAt=new Date().toISOString();
 try{const payload=await fetchJson(url);await writeJson(file,payload);health.push({label,url,file:path.relative('.',file),ok:true,checkedAt});console.log(`OK ${label}`)}
 catch(error){const previous=await existing(file);health.push({label,url,file:path.relative('.',file),ok:Boolean(previous),stale:Boolean(previous),checkedAt,error:error instanceof Error?error.message:String(error)});console.warn(`FAILED ${label}: ${error instanceof Error?error.message:error}`)}
}

await mkdir(ROOT,{recursive:true});
await mirrored('calendar catalogue',`${BASE}/calendars`,path.join(ROOT,'catalog.json'));
await mirrored('OpenAPI schema',`${BASE}/schemas/openapi.json`,path.join(ROOT,'openapi.json'));
await mirrored('decrees',`${BASE}/decrees`,path.join(ROOT,'decrees.json'));
const catalog=await existing(path.join(ROOT,'catalog.json'))??{};
const metadata=catalog.litcal_metadata??catalog.metadata??catalog;
const national=Array.isArray(metadata.national_calendars)?metadata.national_calendars:[];
const diocesan=Array.isArray(metadata.diocesan_calendars)?metadata.diocesan_calendars:[];
const tasks=[];
for(const year of YEARS){
 for(const locale of SITE_LOCALES)tasks.push(()=>mirrored(`general ${year} ${locale}`,calendarUrl('general','',year,locale),calendarFile('general','',year,locale)));
 for(const item of national){const id=item.calendar_id;if(!id)continue;const locales=Array.isArray(item.locales)&&item.locales.length?item.locales:['en'];for(const locale of locales)tasks.push(()=>mirrored(`nation ${id} ${year} ${locale}`,calendarUrl('nation',id,year,locale),calendarFile('nation',id,year,locale)))}
 for(const item of diocesan){const id=item.calendar_id;if(!id)continue;const locales=Array.isArray(item.locales)&&item.locales.length?item.locales:['en'];for(const locale of locales)tasks.push(()=>mirrored(`diocese ${id} ${year} ${locale}`,calendarUrl('diocese',id,year,locale),calendarFile('diocese',id,year,locale)))}
}
await pool(tasks);
const manifest={generatedAt:new Date().toISOString(),upstream:BASE,years:YEARS,siteLocales:SITE_LOCALES,calendarCounts:{national:national.length,diocesan:diocesan.length},health};
await writeJson(path.join(ROOT,'manifest.json'),manifest);
console.log(`LitCal mirror updated: ${health.filter(item=>item.ok).length}/${health.length} resources available.`);

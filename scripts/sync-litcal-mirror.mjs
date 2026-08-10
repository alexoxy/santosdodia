import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compactLitcalPayload } from './litcal-compact.mjs';

const BASE='https://litcal.johnromanodorazio.com/api/v5';
const ROOT=path.resolve('data/litcal-mirror');
const TIMEOUT=45_000;
const MAX_ATTEMPTS=4;
const currentYear=new Date().getUTCFullYear();
const YEARS=[currentYear-1,currentYear,currentYear+1,currentYear+2];
const SITE_LOCALES=['en_US','es_ES','pt_PT','fr_FR','ru_RU','de_DE','it_IT','pl_PL'];
const CONCURRENCY=2;
const MIN_AVAILABLE_RATIO=Number(process.env.LITCAL_MIN_AVAILABLE_RATIO??'0.8');

function sleep(milliseconds){return new Promise(resolve=>setTimeout(resolve,milliseconds))}
function retryDelay(response,attempt){
 const header=response?.headers?.get('retry-after');
 const seconds=Number(header);
 if(Number.isFinite(seconds)&&seconds>0)return Math.min(seconds*1000,60_000);
 return Math.min(1_000*(2**(attempt-1)),15_000);
}
async function fetchJson(url){
 let lastError;
 for(let attempt=1;attempt<=MAX_ATTEMPTS;attempt+=1){
  try{
   const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SantosDoDia-Mirror/3.1 (+https://santosdodia.com)'},signal:AbortSignal.timeout(TIMEOUT)});
   if(response.ok)return response.json();
   const error=new Error(`${response.status} ${response.statusText}`);lastError=error;
   if(![429,502,503,504].includes(response.status)||attempt===MAX_ATTEMPTS)throw error;
   const delay=retryDelay(response,attempt);
   console.warn(`RETRY ${attempt}/${MAX_ATTEMPTS-1} ${url}: ${error.message}; waiting ${delay}ms`);
   await sleep(delay);
  }catch(error){
   lastError=error;
   if(attempt===MAX_ATTEMPTS)break;
   const message=error instanceof Error?error.message:String(error);
   if(!/timeout|fetch failed|aborted/i.test(message))throw error;
   const delay=Math.min(1_000*(2**(attempt-1)),15_000);
   console.warn(`RETRY ${attempt}/${MAX_ATTEMPTS-1} ${url}: ${message}; waiting ${delay}ms`);
   await sleep(delay);
  }
 }
 throw lastError instanceof Error?lastError:new Error(String(lastError));
}
async function writeJson(file,value,{compact=false}={}){await mkdir(path.dirname(file),{recursive:true});await writeFile(file,compact?`${JSON.stringify(value)}\n`:`${JSON.stringify(value,null,2)}\n`,'utf8')}
async function existing(file){try{return JSON.parse(await readFile(file,'utf8'))}catch{return undefined}}
function safe(value){return String(value).replace(/[^a-zA-Z0-9_.-]/g,'_')}
function calendarUrl(kind,id,year,locale){
 const segment=kind==='general'?`calendar/${year}`:`calendar/${kind}/${encodeURIComponent(id)}/${year}`;
 return`${BASE}/${segment}?locale=${encodeURIComponent(locale)}&year_type=CIVIL`;
}
function calendarFile(kind,id,year,locale){const segment=kind==='general'?'general':`${kind}/${safe(id)}`;return path.join(ROOT,'calendars',segment,String(year),`${safe(locale)}.json`)}
async function pool(tasks){const queue=[...tasks];const workers=Array.from({length:CONCURRENCY},async()=>{while(queue.length){const task=queue.shift();if(task)await task();await sleep(125)}});await Promise.all(workers)}

const health=[];
async function mirrored(label,url,file,{transform=value=>value,compact=false}={}){
 const checkedAt=new Date().toISOString();
 try{
  const payload=transform(await fetchJson(url));
  await writeJson(file,payload,{compact});
  health.push({label,url,file:path.relative('.',file),ok:true,stale:false,checkedAt});
  console.log(`OK ${label}`);
 }catch(error){
  const previous=await existing(file);
  health.push({label,url,file:path.relative('.',file),ok:Boolean(previous),stale:Boolean(previous),checkedAt,error:error instanceof Error?error.message:String(error)});
  console.warn(`FAILED ${label}: ${error instanceof Error?error.message:error}`);
 }
}

if(!Number.isFinite(MIN_AVAILABLE_RATIO)||MIN_AVAILABLE_RATIO<=0||MIN_AVAILABLE_RATIO>1)throw new Error(`Invalid LITCAL_MIN_AVAILABLE_RATIO: ${MIN_AVAILABLE_RATIO}`);

await mkdir(ROOT,{recursive:true});
await mirrored('calendar catalogue',`${BASE}/calendars`,path.join(ROOT,'catalog.json'));
const catalog=await existing(path.join(ROOT,'catalog.json'))??{};
const metadata=catalog.litcal_metadata??catalog.metadata??catalog;
const national=Array.isArray(metadata.national_calendars)?metadata.national_calendars:[];
const diocesan=Array.isArray(metadata.diocesan_calendars)?metadata.diocesan_calendars:[];
const tasks=[];
for(const year of YEARS){
 for(const locale of SITE_LOCALES)tasks.push(()=>mirrored(`general ${year} ${locale}`,calendarUrl('general','',year,locale),calendarFile('general','',year,locale),{transform:compactLitcalPayload,compact:true}));
 for(const item of national){const id=item.calendar_id;if(!id)continue;const locales=Array.isArray(item.locales)&&item.locales.length?item.locales:['en'];for(const locale of locales)tasks.push(()=>mirrored(`nation ${id} ${year} ${locale}`,calendarUrl('nation',id,year,locale),calendarFile('nation',id,year,locale),{transform:compactLitcalPayload,compact:true}))}
 for(const item of diocesan){const id=item.calendar_id;if(!id)continue;const locales=Array.isArray(item.locales)&&item.locales.length?item.locales:['en'];for(const locale of locales)tasks.push(()=>mirrored(`diocese ${id} ${year} ${locale}`,calendarUrl('diocese',id,year,locale),calendarFile('diocese',id,year,locale),{transform:compactLitcalPayload,compact:true}))}
}
await pool(tasks);

const available=health.filter(item=>item.ok).length;
const fresh=health.filter(item=>item.ok&&!item.stale).length;
const stale=health.filter(item=>item.ok&&item.stale).length;
const unavailable=health.filter(item=>!item.ok).length;
const ratio=health.length?available/health.length:0;
const criticalLabels=[
 `general ${currentYear} en_US`,
 `general ${currentYear} pt_PT`,
 `general ${currentYear+1} en_US`,
 `general ${currentYear+1} pt_PT`
];
const unavailableCritical=criticalLabels.filter(label=>!health.some(item=>item.label===label&&item.ok));
const status=unavailableCritical.length||ratio<MIN_AVAILABLE_RATIO?'blocked':stale||unavailable?'degraded':'healthy';
const manifest={schemaVersion:2,format:'compact-runtime-fallback',generatedAt:new Date().toISOString(),upstream:BASE,status,years:YEARS,siteLocales:SITE_LOCALES,calendarCounts:{national:national.length,diocesan:diocesan.length},availability:{available,total:health.length,ratio:Number(ratio.toFixed(4)),fresh,stale,unavailable,minimumRatio:MIN_AVAILABLE_RATIO},critical:{required:criticalLabels,unavailable:unavailableCritical},health};
await writeJson(path.join(ROOT,'manifest.json'),manifest);

if(unavailableCritical.length)throw new Error(`LitCal mirror integrity gate failed; unavailable critical resources: ${unavailableCritical.join(', ')}`);
if(ratio<MIN_AVAILABLE_RATIO)throw new Error(`LitCal mirror integrity gate failed; ${available}/${health.length} resources available (${(ratio*100).toFixed(1)}%), minimum ${(MIN_AVAILABLE_RATIO*100).toFixed(1)}%`);
console.log(`LitCal compact fallback updated (${status}): ${available}/${health.length} resources available; ${fresh} fresh; ${stale} stale; ${unavailable} unavailable.`);

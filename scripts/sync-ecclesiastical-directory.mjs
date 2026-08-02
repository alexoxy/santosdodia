import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const ROOT=process.cwd();
const REGISTRY_PATH=path.join(ROOT,'data','ecclesiastical-source-registry.json');
const OUTPUT_ROOT=path.join(ROOT,'data','generated','ecclesiastical-directory');
const USER_AGENT='SantosDoDia-Ecclesiastical-Directory/1.0 (+https://www.santosdodia.com/copyright)';
const MAX_BYTES=Number(process.env.ECCLESIASTICAL_MAX_BYTES??3_000_000);
const TIMEOUT_MS=Number(process.env.ECCLESIASTICAL_TIMEOUT_MS??25_000);

function args(){
 const output={source:'catholic-hierarchy',country:'',maxCountries:0,retainHtml:false,dryRun:false};
 for(const token of process.argv.slice(2)){
  if(token==='--retain-html')output.retainHtml=true;
  else if(token==='--dry-run')output.dryRun=true;
  else if(token.startsWith('--source='))output.source=token.slice(9);
  else if(token.startsWith('--country='))output.country=token.slice(10);
  else if(token.startsWith('--max-countries='))output.maxCountries=Number(token.slice(16));
 }
 return output;
}
function sha256(value){return createHash('sha256').update(value).digest('hex')}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function decodeEntities(value){
 return value.replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
  .replace(/&#39;|&apos;/gi,"'").replace(/&ndash;/gi,'–').replace(/&mdash;/gi,'—')
  .replace(/&rsquo;/gi,'’').replace(/&ldquo;|&rdquo;/gi,'"').replace(/&#(\d+);/g,(_,code)=>String.fromCodePoint(Number(code)));
}
function stripTags(value){return decodeEntities(value.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()}
function slug(value){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,110)}
function links(html,baseUrl){
 const output=[];
 for(const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  try{output.push({url:new URL(match[1],baseUrl).toString(),text:stripTags(match[2]),index:match.index??0,end:(match.index??0)+match[0].length})}catch{/* invalid link */}
 }
 return output;
}
async function readLimited(response,url){
 const declared=Number(response.headers.get('content-length')??0);
 if(declared>MAX_BYTES)throw new Error(`Declared response exceeds ${MAX_BYTES} bytes: ${url}`);
 if(!response.body)return'';
 const reader=response.body.getReader(),chunks=[];let total=0;
 for(;;){const{done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BYTES){await reader.cancel();throw new Error(`Response exceeds ${MAX_BYTES} bytes: ${url}`)}chunks.push(Buffer.from(value))}
 return Buffer.concat(chunks,total).toString('utf8');
}
function robotsRules(text){
 const rules=[];let applies=false;
 for(const raw of text.split(/\r?\n/)){
  const line=raw.replace(/#.*/,'').trim();if(!line)continue;
  const split=line.indexOf(':');if(split<0)continue;
  const key=line.slice(0,split).trim().toLowerCase(),value=line.slice(split+1).trim();
  if(key==='user-agent')applies=value==='*'||value.toLowerCase().includes('santosdodia');
  else if(applies&&key==='disallow'&&value)rules.push(value);
 }
 return rules;
}
const robotsCache=new Map();
async function allowedByRobots(source,url){
 const target=new URL(url);let rules=robotsCache.get(target.origin);
 if(!rules){
  try{const response=await fetch(new URL('/robots.txt',target.origin),{headers:{'user-agent':USER_AGENT},signal:AbortSignal.timeout(TIMEOUT_MS)});rules=response.ok?robotsRules(await response.text()):[]}
  catch{rules=[]}
  robotsCache.set(target.origin,rules);
 }
 return !rules.some(rule=>target.pathname.startsWith(rule));
}
const lastRequestAt=new Map();
async function fetchPage(source,url){
 const target=new URL(url);
 if(target.hostname!==source.host)throw new Error(`Host mismatch for ${source.id}: ${target.hostname}`);
 if(!(await allowedByRobots(source,url)))throw new Error(`robots.txt disallows ${target.pathname}`);
 const interval=Math.ceil(1000/Math.max(0.05,Number(source.requestsPerSecond??0.25)));
 const previous=lastRequestAt.get(source.id)??0,wait=Math.max(0,interval-(Date.now()-previous));if(wait)await sleep(wait);
 lastRequestAt.set(source.id,Date.now());
 const response=await fetch(target,{redirect:'follow',headers:{accept:'text/html,application/xhtml+xml,application/json;q=0.8','user-agent':USER_AGENT},signal:AbortSignal.timeout(TIMEOUT_MS)});
 const finalUrl=new URL(response.url);if(finalUrl.hostname!==source.host)throw new Error(`Redirected outside allowed host: ${finalUrl.hostname}`);
 const body=await readLimited(response,url);if(!response.ok)throw new Error(`HTTP ${response.status} for ${url}`);
 return{url:finalUrl.toString(),body,status:response.status,contentType:response.headers.get('content-type')??'',etag:response.headers.get('etag')??undefined,lastModified:response.headers.get('last-modified')??undefined,contentHash:sha256(body)};
}
async function persistSnapshot(source,page,retainHtml){
 const metadata={sourceId:source.id,sourceUrl:page.url,retrievedAt:new Date().toISOString(),httpStatus:page.status,contentType:page.contentType,etag:page.etag,lastModified:page.lastModified,contentHash:page.contentHash};
 if(retainHtml){
  const directory=path.join(OUTPUT_ROOT,'snapshots',source.id);await mkdir(directory,{recursive:true});
  const file=path.join(directory,`${page.contentHash}.html.gz`);await writeFile(file,gzipSync(page.body));metadata.snapshotPath=path.relative(ROOT,file);
 }
 return metadata;
}
function externalId(url){const name=new URL(url).pathname.split('/').filter(Boolean).at(-1)??'';return name.replace(/\.html?$/i,'')}
function countryEntries(html,baseUrl){
 const entries=new Map();
 for(const link of links(html,baseUrl)){
  const match=new URL(link.url).pathname.match(/^\/country\/([a-z0-9_-]+)\.html$/i);if(!match||!link.text)continue;
  entries.set(match[1].toLowerCase(),{code:match[1].toLowerCase(),name:link.text,url:link.url});
 }
 return [...entries.values()];
}
function localListItem(html,link){
 const start=html.lastIndexOf('<li',link.index);
 const end=html.indexOf('</li>',link.end);
 if(start<0||end<0)return html.slice(Math.max(0,link.index-500),Math.min(html.length,link.end+500));
 return html.slice(start,end+5);
}
function withoutMetrics(value){
 return value.replace(/\s*\([^)]*\d[^)]*\)\s*$/,'').replace(/\s+/g,' ').trim();
}
function officeTitle(line,personName,jurisdictionName){
 const clean=withoutMetrics(line);
 const position=clean.indexOf(personName);
 const suffix=position>=0?clean.slice(position+personName.length).replace(/^[\s,:;–—-]+/,'').trim():'';
 if(suffix)return suffix;
 return jurisdictionName?`Current office holder of ${jurisdictionName}`:'Current ecclesiastical office holder';
}
function parseCatholicHierarchyLeaders(html,pageUrl,country){
 const records=[];
 const personLinks=links(html,pageUrl).filter(item=>{
  const pathname=new URL(item.url).pathname;
  const id=externalId(item.url);
  return /^\/bishop\/b[^/]+\.html$/i.test(pathname)&&/^b[a-z0-9_-]+$/i.test(id)&&item.text.length>=4;
 });
 for(const personLink of personLinks){
  const block=localListItem(html,personLink),blockLinks=links(block,pageUrl);
  const jurisdictionLink=blockLinks.find(item=>/^\/diocese\/d[^/]+\.html$/i.test(new URL(item.url).pathname));
  const line=stripTags(block);if(!line)continue;
  const personExternalId=externalId(personLink.url),jurisdictionExternalId=jurisdictionLink?externalId(jurisdictionLink.url):undefined;
  const jurisdictionName=jurisdictionLink?.text||line.slice(0,Math.max(0,line.indexOf(':'))).trim()||undefined;
  const title=officeTitle(line,personLink.text,jurisdictionName);
  records.push({
   recordType:'current-office-reference',
   person:{id:`person:catholic-hierarchy:${personExternalId}`,name:personLink.text,externalIds:{'catholic-hierarchy':personExternalId},sourceUrl:personLink.url},
   office:{id:`office:catholic-hierarchy:${personExternalId}:${jurisdictionExternalId??slug(title)}`,title,jurisdictionExternalId,jurisdictionName,status:'provisional'},
   geography:{countryCode:country.code.toUpperCase(),countryName:country.name},
   source:{id:'catholic-hierarchy',url:pageUrl,confidence:'provisional'}
  });
 }
 const seen=new Set();return records.filter(record=>{const key=record.office.id;if(seen.has(key))return false;seen.add(key);return true});
}
function parseGcatholicEvents(html,pageUrl){
 const events=[];
 for(const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell=>stripTags(cell[1])).filter(Boolean);
  if(cells.length<2||!/^\d{4}(?:\.\d{2}\.\d{2})?$/.test(cells[0]))continue;
  events.push({date:cells[0].replaceAll('.','-'),text:cells.slice(1).join(' '),sourceUrl:pageUrl});
 }
 return events;
}
async function syncCatholicHierarchy(source,options){
 const index=await fetchPage(source,new URL('/country/',source.baseUrl).toString());
 const snapshots=[await persistSnapshot(source,index,options.retainHtml)];
 let countries=countryEntries(index.body,index.url);
 const requested=new Set(options.country.split(',').map(value=>value.trim().toLowerCase()).filter(Boolean));
 if(requested.size)countries=countries.filter(country=>requested.has(country.code));
 if(options.maxCountries>0)countries=countries.slice(0,options.maxCountries);
 const records=[],failures=[];
 for(const country of countries){
  const url=new URL(`/country/b${country.code}qv.html`,source.baseUrl).toString();
  try{const page=await fetchPage(source,url);snapshots.push(await persistSnapshot(source,page,options.retainHtml));const parsed=parseCatholicHierarchyLeaders(page.body,page.url,country);if(!parsed.length)throw new Error('No real bishop profile links were parsed');records.push(...parsed);console.log(`OK ${country.code}: ${parsed.length} office references`)}
  catch(error){failures.push({country:country.code,url,error:error instanceof Error?error.message:String(error)});console.warn(`FAILED ${country.code}: ${failures.at(-1).error}`)}
 }
 return{sourceId:source.id,countries,records,events:[],snapshots,failures};
}
async function syncGcatholic(source,options){
 const year=new Date().getUTCFullYear(),urls=[source.baseUrl,new URL(`/events/year/${year}`,source.baseUrl).toString()];
 const snapshots=[],events=[],failures=[];
 for(const url of urls){try{const page=await fetchPage(source,url);snapshots.push(await persistSnapshot(source,page,options.retainHtml));if(url.includes('/events/year/'))events.push(...parseGcatholicEvents(page.body,page.url))}catch(error){failures.push({url,error:error instanceof Error?error.message:String(error)})}}
 return{sourceId:source.id,countries:[],records:[],events,snapshots,failures};
}
async function syncReferencePage(source,options){
 const page=await fetchPage(source,source.baseUrl);return{sourceId:source.id,countries:[],records:[],events:[],snapshots:[await persistSnapshot(source,page,options.retainHtml)],failures:[]};
}
async function main(){
 const options=args(),registry=JSON.parse(await readFile(REGISTRY_PATH,'utf8')),source=registry.sources.find(item=>item.id===options.source&&item.active);
 if(!source)throw new Error(`Unknown or inactive source: ${options.source}`);
 const startedAt=new Date().toISOString();let result;
 if(source.adapter==='catholic-hierarchy')result=await syncCatholicHierarchy(source,options);
 else if(source.adapter==='gcatholic')result=await syncGcatholic(source,options);
 else result=await syncReferencePage(source,options);
 const output={schemaVersion:1,startedAt,completedAt:new Date().toISOString(),source,options:{...options},counts:{countries:result.countries.length,records:result.records.length,events:result.events.length,snapshots:result.snapshots.length,failures:result.failures.length},...result};
 if(options.dryRun){console.log(JSON.stringify(output.counts,null,2));return}
 await mkdir(OUTPUT_ROOT,{recursive:true});const file=path.join(OUTPUT_ROOT,`${source.id}.json`);await writeFile(file,`${JSON.stringify(output,null,2)}\n`,'utf8');console.log(`Wrote ${path.relative(ROOT,file)}: ${output.counts.records} records, ${output.counts.events} events, ${output.counts.failures} failures.`);
 if(result.failures.length&&result.records.length===0&&result.events.length===0)process.exitCode=2;
}
main().catch(error=>{console.error(error);process.exitCode=1});

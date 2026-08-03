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
function stripTags(value){
 return decodeEntities(value
  .replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi,' ')
  .replace(/<!--[\s\S]*?-->/g,' ')
  .replace(/<[^>]+>/g,' '))
  .replace(/\s+/g,' ').trim();
}
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
 if(!response.body)return Buffer.alloc(0);
 const reader=response.body.getReader(),chunks=[];let total=0;
 for(;;){
  const{done,value}=await reader.read();if(done)break;
  total+=value.byteLength;
  if(total>MAX_BYTES){await reader.cancel();throw new Error(`Response exceeds ${MAX_BYTES} bytes: ${url}`)}
  chunks.push(Buffer.from(value));
 }
 return Buffer.concat(chunks,total);
}
function sourceCharset(contentType,rawBody){
 const header=contentType.match(/charset\s*=\s*["']?([^;"'\s]+)/i)?.[1];
 const head=rawBody.subarray(0,8192).toString('latin1');
 const meta=head.match(/charset\s*=\s*["']?([^;"'\s/>]+)/i)?.[1];
 const value=String(header??meta??'utf-8').toLowerCase().replaceAll('_','-');
 if(value==='iso-8859-1'||value==='latin1'||value==='latin-1')return'windows-1252';
 if(value==='utf8')return'utf-8';
 return value;
}
function decodeBody(rawBody,contentType){
 const charset=sourceCharset(contentType,rawBody);
 try{return{body:new TextDecoder(charset).decode(rawBody),charset}}
 catch{return{body:new TextDecoder('utf-8').decode(rawBody),charset:'utf-8-fallback'}}
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
 const response=await fetch(target,{redirect:'follow',headers:{accept:'text/html,application/xhtml+xml;q=0.9,application/json;q=0.5','user-agent':USER_AGENT},signal:AbortSignal.timeout(TIMEOUT_MS)});
 const finalUrl=new URL(response.url);if(finalUrl.hostname!==source.host)throw new Error(`Redirected outside allowed host: ${finalUrl.hostname}`);
 const contentType=response.headers.get('content-type')??'';
 const rawBody=await readLimited(response,url);if(!response.ok)throw new Error(`HTTP ${response.status} for ${url}`);
 const decoded=decodeBody(rawBody,contentType);
 return{url:finalUrl.toString(),body:decoded.body,rawBody,charset:decoded.charset,status:response.status,contentType,etag:response.headers.get('etag')??undefined,lastModified:response.headers.get('last-modified')??undefined,contentHash:sha256(rawBody)};
}
async function persistSnapshot(source,page,retainHtml){
 const metadata={sourceId:source.id,sourceUrl:page.url,retrievedAt:new Date().toISOString(),httpStatus:page.status,contentType:page.contentType,charset:page.charset,etag:page.etag,lastModified:page.lastModified,contentHash:page.contentHash};
 if(retainHtml){
  const directory=path.join(OUTPUT_ROOT,'snapshots',source.id);await mkdir(directory,{recursive:true});
  const file=path.join(directory,`${page.contentHash}.html.gz`);await writeFile(file,gzipSync(page.rawBody));metadata.snapshotPath=path.relative(ROOT,file);
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
function earliestBoundary(block,start,maximum){
 const patterns=[/<\s*ul\b/ig,/<\s*li\b/ig,/<\s*p\b/ig,/<\s*\/ul\b/ig,/<\s*hr\b/ig,/<\s*center\b/ig];
 let end=maximum;
 for(const pattern of patterns){pattern.lastIndex=start;const match=pattern.exec(block);if(match&&match.index<end)end=match.index}
 return end;
}
function explicitOfficeTitle(raw,jurisdictionName){
 const clean=stripTags(raw)
  .replace(/^[\s,:;–—-]+/,'')
  .replace(/\(\s*[,;\s]*\)/g,' ')
  .replace(/\s+/g,' ').trim()
  .replace(/[\s,;:(-]+$/,'').trim();
 const match=clean.match(/\b(Patriarch|Auxiliary Bishop|Coadjutor Bishop|Apostolic Administrator|Apostolic Nuncio|Metropolitan|Archbishop|Bishop|Cardinal|Exarch|Vicar Apostolic|Primate)\b/i);
 if(!match)return`Current office holder of ${jurisdictionName}`;
 return clean.slice(match.index).replace(/\s*\([^)]*\)\s*$/,'').trim()||match[1];
}
function parseCatholicHierarchyLeaders(html,pageUrl,country){
 const headingIndex=html.search(/<center><h1>Structured View of Bishops<\/h1>/i);
 const noteIndex=html.search(/<center><hr[^>]*>\s*Note:/i);
 const body=html.slice(Math.max(0,headingIndex),noteIndex>headingIndex?noteIndex:html.length);
 const allLinks=links(body,pageUrl);
 const jurisdictionLinks=allLinks.filter(item=>/^\/diocese\/d[^/]+\.html$/i.test(new URL(item.url).pathname));
 const records=[];
 for(let jurisdictionIndex=0;jurisdictionIndex<jurisdictionLinks.length;jurisdictionIndex+=1){
  const jurisdictionLink=jurisdictionLinks[jurisdictionIndex];
  const blockEnd=jurisdictionIndex+1<jurisdictionLinks.length?jurisdictionLinks[jurisdictionIndex+1].index:body.length;
  const block=body.slice(jurisdictionLink.index,blockEnd);
  const personLinks=links(block,pageUrl).filter(item=>{
   const pathname=new URL(item.url).pathname;
   const id=externalId(item.url);
   return /^\/bishop\/b[^/]+\.html$/i.test(pathname)&&/^b[a-z0-9_-]+$/i.test(id)&&id.toLowerCase()!=='bvacant'&&item.text.trim().toLowerCase()!=='vacant';
  });
  for(let personIndex=0;personIndex<personLinks.length;personIndex+=1){
   const personLink=personLinks[personIndex];
   const maximum=personIndex+1<personLinks.length?personLinks[personIndex+1].index:block.length;
   const titleEnd=earliestBoundary(block,personLink.end,maximum);
   const title=explicitOfficeTitle(block.slice(personLink.end,titleEnd),jurisdictionLink.text);
   const personExternalId=externalId(personLink.url),jurisdictionExternalId=externalId(jurisdictionLink.url);
   records.push({
    recordType:'current-office-reference',
    person:{id:`person:catholic-hierarchy:${personExternalId}`,name:personLink.text,externalIds:{'catholic-hierarchy':personExternalId},sourceUrl:personLink.url},
    office:{id:`office:catholic-hierarchy:${personExternalId}:${jurisdictionExternalId}`,title,jurisdictionExternalId,jurisdictionName:jurisdictionLink.text,status:'provisional'},
    geography:{countryCode:country.code.toUpperCase(),countryName:country.name},
    source:{id:'catholic-hierarchy',url:pageUrl,confidence:'provisional'}
   });
  }
 }
 const seen=new Set();return records.filter(record=>{const key=record.office.id;if(seen.has(key))return false;seen.add(key);return true});
}
function parseGcatholicEvents(html,pageUrl){
 const events=[];
 for(const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell=>stripTags(cell[1])).filter(Boolean);
  if(cells.length<2||!/^\d{4}(?:[.-]\d{2}[.-]\d{2})?$/.test(cells[0]))continue;
  events.push({date:cells[0].replaceAll('.','-'),text:cells.slice(1).join(' '),sourceUrl:pageUrl});
 }
 return events;
}
function requireHtml(page,label){
 if(!/^(?:text\/html|application\/xhtml\+xml)\b/i.test(page.contentType))throw new Error(`${label} returned unexpected content type ${page.contentType||'<missing>'}`);
 if(!/<(?:html|table|body)\b/i.test(page.body))throw new Error(`${label} did not contain recognisable HTML`);
}
async function syncCatholicHierarchy(source,options){
 const index=await fetchPage(source,new URL('/country/',source.baseUrl).toString());requireHtml(index,'Catholic-Hierarchy country index');
 const snapshots=[await persistSnapshot(source,index,options.retainHtml)];
 let countries=countryEntries(index.body,index.url);
 const requested=new Set(options.country.split(',').map(value=>value.trim().toLowerCase()).filter(Boolean));
 if(requested.size)countries=countries.filter(country=>requested.has(country.code));
 if(options.maxCountries>0)countries=countries.slice(0,options.maxCountries);
 const records=[],failures=[];
 for(const country of countries){
  const url=new URL(`/country/b${country.code}qv.html`,source.baseUrl).toString();
  try{
   const page=await fetchPage(source,url);requireHtml(page,`Catholic-Hierarchy ${country.code}`);
   snapshots.push(await persistSnapshot(source,page,options.retainHtml));
   const parsed=parseCatholicHierarchyLeaders(page.body,page.url,country);if(!parsed.length)throw new Error('No real bishop profile links were parsed');
   records.push(...parsed);console.log(`OK ${country.code}: ${parsed.length} office references`);
  }catch(error){failures.push({country:country.code,url,error:error instanceof Error?error.message:String(error)});console.warn(`FAILED ${country.code}: ${failures.at(-1).error}`)}
 }
 return{sourceId:source.id,countries,records,events:[],snapshots,failures};
}
async function syncGcatholic(source,options){
 const url=new URL('/?tab=news',source.baseUrl).toString();
 const snapshots=[],events=[],failures=[];
 try{
  const page=await fetchPage(source,url);requireHtml(page,'GCatholic news');
  snapshots.push(await persistSnapshot(source,page,options.retainHtml));
  const parsed=parseGcatholicEvents(page.body,page.url);if(!parsed.length)throw new Error('No dated GCatholic events were parsed');
  events.push(...parsed);
 }catch(error){failures.push({url,error:error instanceof Error?error.message:String(error)})}
 return{sourceId:source.id,countries:[],records:[],events,snapshots,failures};
}
async function syncReferencePage(source,options){
 const page=await fetchPage(source,source.baseUrl);requireHtml(page,source.id);
 return{sourceId:source.id,countries:[],records:[],events:[],snapshots:[await persistSnapshot(source,page,options.retainHtml)],failures:[]};
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

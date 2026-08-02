import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const REGISTRY_PATH=path.join(ROOT,'data','ecclesiastical-source-registry.json');
const GENERATED_ROOT=path.join(ROOT,'data','generated','ecclesiastical-directory');
const OUTPUT_PATH=path.join(ROOT,'db','seeds','ecclesiastical-directory.sql');

function quote(value){return `'${String(value??'').replaceAll("'","''")}'`}
function nullable(value){return value===undefined||value===null?'NULL':quote(value)}
function sha256(value){return createHash('sha256').update(value).digest('hex')}
function stable(value){
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
 return value;
}
function json(value){return JSON.stringify(stable(value))}
function sourceInsert(source){
 return `INSERT INTO source_registry (id,name,base_url,host,authority,adapter,refresh_hours,requests_per_second,active,updated_at) VALUES (${quote(source.id)},${quote(source.name)},${quote(source.baseUrl)},${quote(source.host)},${quote(source.authority)},${quote(source.adapter)},${Number(source.refreshHours)},${Number(source.requestsPerSecond)},${source.active?1:0},CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name,base_url=excluded.base_url,host=excluded.host,authority=excluded.authority,adapter=excluded.adapter,refresh_hours=excluded.refresh_hours,requests_per_second=excluded.requests_per_second,active=excluded.active,updated_at=CURRENT_TIMESTAMP;`;
}
function ingestInsert({sourceId,externalId,recordType,payload,sourceUrl,confidence,observedAt}){
 const payloadJson=json(payload),contentHash=sha256(payloadJson),id=`ingest:${sourceId}:${sha256(`${externalId}:${contentHash}`).slice(0,32)}`;
 return `INSERT INTO source_ingest_records (id,source_id,external_record_id,record_type,payload_json,content_hash,source_url,confidence,resolution_status,first_seen_at,last_seen_at) VALUES (${quote(id)},${quote(sourceId)},${quote(externalId)},${quote(recordType)},${quote(payloadJson)},${quote(contentHash)},${quote(sourceUrl)},${quote(confidence)},'unresolved',${quote(observedAt)},${quote(observedAt)}) ON CONFLICT(id) DO UPDATE SET payload_json=excluded.payload_json,source_url=excluded.source_url,confidence=excluded.confidence,last_seen_at=excluded.last_seen_at;`;
}

const registry=JSON.parse(await readFile(REGISTRY_PATH,'utf8'));
const lines=['PRAGMA foreign_keys = ON;','BEGIN IMMEDIATE;'];
for(const source of registry.sources??[])lines.push(sourceInsert(source));

let files=[];
try{files=(await readdir(GENERATED_ROOT)).filter(file=>file.endsWith('.json')).sort()}catch(error){if(error?.code!=='ENOENT')throw error}
let recordCount=0;
for(const file of files){
 const payload=JSON.parse(await readFile(path.join(GENERATED_ROOT,file),'utf8'));
 const sourceId=payload.sourceId,observedAt=payload.completedAt??payload.startedAt??new Date(0).toISOString();
 for(const record of payload.records??[]){
  const externalId=record.office?.id??record.person?.id??sha256(json(record));
  lines.push(ingestInsert({sourceId,externalId,recordType:record.recordType??'source-record',payload:record,sourceUrl:record.source?.url??record.person?.sourceUrl??payload.source?.baseUrl,confidence:record.source?.confidence??'provisional',observedAt}));
  recordCount+=1;
 }
 for(const event of payload.events??[]){
  const externalId=`event:${event.date??'unknown'}:${sha256(json(event)).slice(0,24)}`;
  lines.push(ingestInsert({sourceId,externalId,recordType:'ecclesiastical-event',payload:event,sourceUrl:event.sourceUrl??payload.source?.baseUrl,confidence:'provisional',observedAt}));
  recordCount+=1;
 }
 for(const snapshot of payload.snapshots??[]){
  const id=`snapshot:${sourceId}:${snapshot.contentHash}`;
  lines.push(`INSERT INTO source_snapshots (id,source_id,source_url,retrieved_at,http_status,content_type,content_hash,etag,last_modified,body,body_encoding) VALUES (${quote(id)},${quote(sourceId)},${quote(snapshot.sourceUrl)},${quote(snapshot.retrievedAt)},${Number(snapshot.httpStatus)},${nullable(snapshot.contentType)},${quote(snapshot.contentHash)},${nullable(snapshot.etag)},${nullable(snapshot.lastModified)},NULL,'metadata-only') ON CONFLICT(id) DO UPDATE SET retrieved_at=excluded.retrieved_at,http_status=excluded.http_status,content_type=excluded.content_type,etag=excluded.etag,last_modified=excluded.last_modified;`);
 }
}
lines.push('COMMIT;','');
await mkdir(path.dirname(OUTPUT_PATH),{recursive:true});
await writeFile(OUTPUT_PATH,lines.join('\n'),'utf8');
console.log(`Wrote ${path.relative(ROOT,OUTPUT_PATH)} with ${registry.sources?.length??0} sources and ${recordCount} staging records.`);

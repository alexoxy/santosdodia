import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const registry=JSON.parse(await readFile(path.join(ROOT,'data','ecclesiastical-source-registry.json'),'utf8'));
const errors=[];
const warnings=[];
const allowedAuthority=new Set(['official-church-or-jurisdiction','official-appointment-bulletin','academic-directory','specialist-reference-directory','corroborated-osint']);
const ids=new Set();

if(registry.schemaVersion!==1)errors.push('Source registry schemaVersion must be 1.');
if(!Array.isArray(registry.sources)||!registry.sources.length)errors.push('Source registry must contain active sources.');
for(const source of registry.sources??[]){
 if(!source.id||ids.has(source.id))errors.push(`Duplicate or missing source id: ${source.id??'<missing>'}`);else ids.add(source.id);
 if(!allowedAuthority.has(source.authority))errors.push(`Invalid authority for ${source.id}: ${source.authority}`);
 try{const url=new URL(source.baseUrl);if(url.hostname!==source.host)errors.push(`Host mismatch for ${source.id}: ${url.hostname} != ${source.host}`);if(url.protocol!=='https:')errors.push(`Non-HTTPS source: ${source.id}`)}catch{errors.push(`Invalid baseUrl for ${source.id}`)}
 if(!Number.isFinite(source.refreshHours)||source.refreshHours<1)errors.push(`Invalid refreshHours for ${source.id}`);
 if(!Number.isFinite(source.requestsPerSecond)||source.requestsPerSecond<=0||source.requestsPerSecond>2)errors.push(`Unsafe requestsPerSecond for ${source.id}`);
 if(!Array.isArray(source.coverage)||!source.coverage.length)warnings.push(`No declared coverage for ${source.id}`);
}

const generatedRoot=path.join(ROOT,'data','generated','ecclesiastical-directory');
try{
 const files=(await readdir(generatedRoot)).filter(file=>file.endsWith('.json'));
 for(const file of files){
  const payload=JSON.parse(await readFile(path.join(generatedRoot,file),'utf8'));
  if(payload.schemaVersion!==1)errors.push(`${file}: unsupported schemaVersion`);
  if(!ids.has(payload.sourceId))errors.push(`${file}: unknown sourceId ${payload.sourceId}`);
  const officeIds=new Set();
  for(const record of payload.records??[]){
   if(!record?.person?.id||!record?.person?.name)errors.push(`${file}: record without person identity`);
   if(!record?.office?.id)errors.push(`${file}: record without office identity`);
   else if(officeIds.has(record.office.id))errors.push(`${file}: duplicate office ${record.office.id}`);
   else officeIds.add(record.office.id);
   if(record?.source?.id!==payload.sourceId)errors.push(`${file}: record source mismatch for ${record?.office?.id??'<unknown>'}`);
  }
  if(payload.counts?.records!==(payload.records??[]).length)errors.push(`${file}: records count mismatch`);
  if(payload.counts?.failures!==(payload.failures??[]).length)errors.push(`${file}: failures count mismatch`);
 }
}catch(error){
 if(error?.code!=='ENOENT')errors.push(`Unable to audit generated directory: ${error instanceof Error?error.message:String(error)}`);
}

for(const warning of warnings)console.warn(`WARN ${warning}`);
if(errors.length){for(const error of errors)console.error(`ERROR ${error}`);process.exitCode=1}else console.log(`Ecclesiastical directory audit passed: ${ids.size} registered sources.`);

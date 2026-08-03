import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const registry=JSON.parse(await readFile(path.join(ROOT,'data','ecclesiastical-source-registry.json'),'utf8'));
const errors=[];
const warnings=[];
const allowedAuthority=new Set(['official-church-or-jurisdiction','official-appointment-bulletin','academic-directory','specialist-reference-directory','corroborated-osint']);
const ids=new Set();
const navigationNames=new Set(['all','living','deceased','youngest','oldest','most junior as priest','most senior as priest','most junior as bishop','most senior as bishop','active near age limit','electors','non-voting','cardinal-bishops','cardinal-priests','cardinal-deacons','popes','vacant']);

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
  const personOfficeKeys=new Set();
  for(const snapshot of payload.snapshots??[]){
   const contentType=String(snapshot?.contentType??'');
   if(['catholic-hierarchy','gcatholic'].includes(payload.sourceId)&&contentType&&!/^(?:text\/html|application\/xhtml\+xml)\b/i.test(contentType)){
    errors.push(`${file}: unexpected source content type ${contentType} for ${snapshot?.sourceUrl??'<unknown>'}`);
   }
   if(!snapshot?.contentHash||!/^[a-f0-9]{64}$/i.test(snapshot.contentHash))errors.push(`${file}: snapshot without valid SHA-256`);
  }
  for(const record of payload.records??[]){
   const personName=String(record?.person?.name??'').trim();
   const officeTitle=String(record?.office?.title??'').trim();
   const jurisdictionName=String(record?.office?.jurisdictionName??'').trim();
   if(!record?.person?.id||!personName)errors.push(`${file}: record without person identity`);
   if(navigationNames.has(personName.toLowerCase()))errors.push(`${file}: navigation or vacancy label parsed as person: ${personName}`);
   if(personName.includes('�'))errors.push(`${file}: invalid character encoding in person name: ${personName}`);
   if(!jurisdictionName)errors.push(`${file}: record without jurisdiction for ${personName||'<unknown>'}`);
   if(jurisdictionName.includes('�'))errors.push(`${file}: invalid character encoding in jurisdiction for ${personName||'<unknown>'}`);
   if(!officeTitle)errors.push(`${file}: record without office title for ${personName||'<unknown>'}`);
   if(/[<>]/.test(officeTitle)||/writea|href=|Note: the numbers|Home \| Countries/i.test(officeTitle))errors.push(`${file}: HTML or neighbouring-record contamination in office title for ${personName||'<unknown>'}`);
   if(officeTitle.includes('�'))errors.push(`${file}: invalid character encoding in office title for ${personName||'<unknown>'}`);
   if(payload.sourceId==='catholic-hierarchy'){
    const externalId=record?.person?.externalIds?.['catholic-hierarchy'];
    if(typeof externalId!=='string'||!/^b[a-z0-9_-]+$/i.test(externalId))errors.push(`${file}: invalid Catholic-Hierarchy person identifier for ${personName||'<unknown>'}`);
    if(externalId?.toLowerCase()==='bvacant')errors.push(`${file}: Catholic-Hierarchy vacancy pseudo-profile cannot be a person`);
    if(!record?.person?.sourceUrl||!/^https:\/\/www\.catholic-hierarchy\.org\/bishop\/b[^/]+\.html$/i.test(record.person.sourceUrl))errors.push(`${file}: invalid Catholic-Hierarchy person URL for ${personName||'<unknown>'}`);
   }
   if(!record?.office?.id)errors.push(`${file}: record without office identity`);
   else if(officeIds.has(record.office.id))errors.push(`${file}: duplicate office ${record.office.id}`);
   else officeIds.add(record.office.id);
   const personOfficeKey=`${record?.person?.id??''}:${record?.office?.jurisdictionExternalId??jurisdictionName}`;
   if(personOfficeKeys.has(personOfficeKey))errors.push(`${file}: duplicate person and jurisdiction record for ${personName||'<unknown>'}`);else personOfficeKeys.add(personOfficeKey);
   if(record?.source?.id!==payload.sourceId)errors.push(`${file}: record source mismatch for ${record?.office?.id??'<unknown>'}`);
  }
  if(payload.sourceId==='gcatholic'&&(payload.events??[]).length===0&&(payload.failures??[]).length===0)errors.push(`${file}: empty GCatholic import was incorrectly marked successful`);
  if(payload.counts?.records!==(payload.records??[]).length)errors.push(`${file}: records count mismatch`);
  if(payload.counts?.events!==(payload.events??[]).length)errors.push(`${file}: events count mismatch`);
  if(payload.counts?.failures!==(payload.failures??[]).length)errors.push(`${file}: failures count mismatch`);
 }
}catch(error){
 if(error?.code!=='ENOENT')errors.push(`Unable to audit generated directory: ${error instanceof Error?error.message:String(error)}`);
}

for(const warning of warnings)console.warn(`WARN ${warning}`);
if(errors.length){for(const error of errors)console.error(`ERROR ${error}`);process.exitCode=1}else console.log(`Ecclesiastical directory audit passed: ${ids.size} registered sources.`);

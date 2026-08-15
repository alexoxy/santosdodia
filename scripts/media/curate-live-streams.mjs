#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildSupplementalSeeds,
  candidateScore,
  chooseCandidate,
  classifyMediaUrl,
  extractMediaCandidates,
  isHardFailure,
  isReachableProbe,
  nextFailureCount,
  shouldRetire,
} from './live-stream-curator-lib.mjs';

const USER_AGENT='SantosDoDia-LiveCurator/1.0 (+https://www.santosdodia.com)';
const FAILURE_THRESHOLD=3;
const MAX_DISCOVERY_PAGES=30;
const MAX_MEDIA_PROBES_PER_SOURCE=12;

function argument(name,fallback=null){const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:fallback}
async function json(file,fallback){try{return JSON.parse(await readFile(path.resolve(file),'utf8'))}catch{return fallback}}
function day(value=new Date()){return value.toISOString().slice(0,10)}
function sameSource(left,right){return JSON.stringify(left)===JSON.stringify(right)}

async function probe(url,{html=false}={}){
 try{
  const response=await fetch(url,{method:'GET',redirect:'follow',headers:{'User-Agent':USER_AGENT,Accept:html?'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5':'*/*'},signal:AbortSignal.timeout(18000)});
  const contentType=response.headers.get('content-type')??'';
  let body='';
  if(html&&response.ok&&/html|xhtml/i.test(contentType))body=(await response.text()).slice(0,1_500_000);
  return{url:response.url||url,status:response.status,ok:response.ok,contentType,body};
 }catch(error){return{url,status:0,ok:false,error:error instanceof Error?error.message:String(error),body:''}}
}

function mediaCandidates(seed,discovered){
 const map=new Map();
 const add=(url,kind,score)=>{if(!url)return;const previous=map.get(url);if(!previous||score>previous.score)map.set(url,{url,kind,score})};
 if(seed.liveUrl)add(seed.liveUrl,'live',100);
 if(seed.archiveUrl)add(seed.archiveUrl,'archive',90);
 for(const item of discovered)add(item.url,item.kind,item.score);
 return[...map.values()].sort((a,b)=>b.score-a.score||a.url.localeCompare(b.url)).slice(0,MAX_MEDIA_PROBES_PER_SOURCE);
}

async function inspectSeed(seed){
 const pages=[];const candidates=[];
 for(const discoveryUrl of (seed.discoveryUrls??[seed.sourceUrl]).slice(0,4)){
  if(pages.length>=MAX_DISCOVERY_PAGES)break;
  const result=await probe(discoveryUrl,{html:true});pages.push({url:discoveryUrl,status:result.status,ok:result.ok});
  if(result.body)candidates.push(...extractMediaCandidates(result.body,result.url||discoveryUrl));
 }
 const deduped=[];const seen=new Set();
 for(const candidate of mediaCandidates(seed,candidates)){if(seen.has(candidate.url))continue;seen.add(candidate.url);deduped.push(candidate)}
 const probed=[];
 for(const candidate of deduped){const result=await probe(candidate.url);probed.push({...candidate,probe:{status:result.status,ok:result.ok,error:result.error}})}
 const sourceProbe=pages.find(item=>item.url===seed.sourceUrl)??pages[0]??await probe(seed.sourceUrl);
 return{pages,candidates:probed,sourceProbe};
}

function publicSource(seed,current,inspection,health,today){
 const liveUrl=chooseCandidate(inspection.candidates,'live');
 const archiveUrl=chooseCandidate(inspection.candidates,'archive');
 const mediaReachable=Boolean(liveUrl||archiveUrl);
 const sourceReachable=isReachableProbe(inspection.sourceProbe);
 const hardFailure=inspection.candidates.length>0&&inspection.candidates.every(item=>isHardFailure(item.probe));
 const previousFailures=health?.consecutiveFailures??0;
 const consecutiveFailures=nextFailureCount(previousFailures,{mediaReachable,sourceReachable,hardFailure});
 const retire=shouldRetire({pinned:Boolean(seed.pinned),consecutiveFailures,threshold:FAILURE_THRESHOLD});
 if(seed.discoveredSeed&&!current&&!mediaReachable)return{source:null,health:{consecutiveFailures,lastCheckedAt:new Date().toISOString(),status:'candidate',sourceReachable,mediaReachable}};
 if(retire)return{source:null,health:{consecutiveFailures,lastCheckedAt:new Date().toISOString(),status:'retired',sourceReachable,mediaReachable}};
 const selectedLive=liveUrl??current?.liveUrl??seed.liveUrl;
 const selectedArchive=archiveUrl??current?.archiveUrl??seed.archiveUrl;
 if(!selectedLive&&!selectedArchive&&!seed.pinned)return{source:null,health:{consecutiveFailures,lastCheckedAt:new Date().toISOString(),status:'withheld',sourceReachable,mediaReachable}};
 const changed=Boolean(current)&&((current.liveUrl??null)!==(selectedLive??null)||(current.archiveUrl??null)!==(selectedArchive??null));
 const source={
  id:seed.id,
  tradition:seed.tradition,
  organization:seed.organization,
  ...(selectedLive?{liveUrl:selectedLive}:{}),
  ...(selectedArchive?{archiveUrl:selectedArchive}:{}),
  sourceUrl:seed.sourceUrl,
  descriptions:seed.descriptions,
  languages:seed.languages??[],
  verifiedAt:current?.verifiedAt??(mediaReachable?today:seed.verifiedAt??today),
 };
 if(changed&&mediaReachable)source.verifiedAt=today;
 return{source,health:{consecutiveFailures,lastCheckedAt:new Date().toISOString(),lastSuccessAt:mediaReachable||sourceReachable?new Date().toISOString():health?.lastSuccessAt??null,status:seed.pinned&&!mediaReachable?'pinned-warning':'active',sourceReachable,mediaReachable}};
}

async function main(){
 const baseFile=argument('--base','data/live-streams.base.json');
 const currentFile=argument('--registry','data/generated/live-streams.json');
 const sourceRegistryFile=argument('--source-registry','data/source-registry/seed.json');
 const previousStateFile=argument('--previous-state','');
 const outputDir=path.resolve(argument('--output','staging/live-stream-curation/current'));
 const base=await json(baseFile,{sources:[]});
 const current=await json(currentFile,{schemaVersion:1,generatedAt:null,sources:[]});
 const sourceRegistry=await json(sourceRegistryFile,{sources:[]});
 const previous=previousStateFile?await json(previousStateFile,{schemaVersion:1,sources:{}}):{schemaVersion:1,sources:{}};
 const supplemental=buildSupplementalSeeds(sourceRegistry,base.sources??[]);
 const seeds=[...(base.sources??[]),...supplemental];
 const currentById=new Map((current.sources??[]).map(item=>[item.id,item]));
 const active=[];const health={schemaVersion:1,checkedAt:new Date().toISOString(),failureThreshold:FAILURE_THRESHOLD,sources:{}};
 const report={schemaVersion:1,checkedAt:health.checkedAt,seeds:seeds.length,baseSeeds:(base.sources??[]).length,supplementalSeeds:supplemental.length,added:[],updated:[],retired:[],candidates:[],pinnedWarnings:[]};
 for(const seed of seeds){
  const inspection=await inspectSeed(seed);
  const currentSource=currentById.get(seed.id);
  const result=publicSource(seed,currentSource,inspection,previous.sources?.[seed.id],day());
  health.sources[seed.id]={...result.health,probes:{source:inspection.sourceProbe,candidates:inspection.candidates.map(item=>({url:item.url,kind:item.kind,status:item.probe.status,ok:item.probe.ok}))}};
  if(result.health.status==='candidate')report.candidates.push(seed.id);
  if(result.health.status==='retired'){if(currentSource)report.retired.push(seed.id);continue}
  if(result.health.status==='pinned-warning')report.pinnedWarnings.push(seed.id);
  if(!result.source)continue;
  active.push(result.source);
  if(!currentSource)report.added.push(seed.id);else if(!sameSource(currentSource,result.source))report.updated.push(seed.id);
 }
 active.sort((a,b)=>(a.id==='vatican-media'?-1:b.id==='vatican-media'?1:a.tradition.localeCompare(b.tradition)||a.organization.localeCompare(b.organization)));
 const sourceChanged=!sameSource(current.sources??[],active);
 const registry={schemaVersion:1,generatedAt:sourceChanged?new Date().toISOString():current.generatedAt??new Date().toISOString(),sources:active};
 await mkdir(outputDir,{recursive:true});
 await writeFile(path.resolve(currentFile),`${JSON.stringify(registry,null,2)}\n`,'utf8');
 await writeFile(path.join(outputDir,'health.json'),`${JSON.stringify(health,null,2)}\n`,'utf8');
 await writeFile(path.join(outputDir,'report.json'),`${JSON.stringify({...report,sourceChanged,active:active.length},null,2)}\n`,'utf8');
 await writeFile(path.join(outputDir,'registry.json'),`${JSON.stringify(registry,null,2)}\n`,'utf8');
 console.log(JSON.stringify({...report,sourceChanged,active:active.length},null,2));
 if(report.pinnedWarnings.length)console.warn(`Pinned live sources need attention: ${report.pinnedWarnings.join(', ')}`);
}

main().catch(error=>{console.error(`Live stream curation failed: ${error instanceof Error?error.stack??error.message:String(error)}`);process.exit(1)});

import { createHash } from 'node:crypto';

export const SUPPORTED_TRADITIONS=new Set(['roman-catholic','greek-orthodox','eastern-orthodox','anglican','coptic-orthodox','armenian-apostolic','ethiopian-orthodox','syriac-orthodox']);
const VIDEO_HOSTS=new Set(['youtube.com','www.youtube.com','youtu.be','vimeo.com','www.vimeo.com']);
const HARD_FAILURES=new Set([404,410]);

export function mapRegistryTradition(values=[]){
 const source=new Set(values);
 if(source.has('coptic-orthodox'))return'coptic-orthodox';
 if(source.has('armenian-apostolic'))return'armenian-apostolic';
 if(source.has('ethiopian-orthodox'))return'ethiopian-orthodox';
 if(source.has('syriac-orthodox'))return'syriac-orthodox';
 if(source.has('anglican'))return'anglican';
 if(source.has('catholic'))return'roman-catholic';
 if(source.has('eastern-orthodox'))return'eastern-orthodox';
 return null;
}

function canonicalUrl(value,base){
 try{
  const url=new URL(value,base);
  if(url.protocol!=='https:')return null;
  url.hash='';
  for(const key of [...url.searchParams.keys()])if(/^utm_|^(?:fbclid|gclid)$/i.test(key))url.searchParams.delete(key);
  return url.toString();
 }catch{return null}
}

export function classifyMediaUrl(value){
 let url;try{url=new URL(value)}catch{return null}
 const host=url.hostname.toLowerCase(),path=`${url.pathname}${url.search}`.toLowerCase();
 if(!VIDEO_HOSTS.has(host)&&!/(?:live|stream|broadcast|video|media|church-online|online-service|tv)/i.test(path))return null;
 if(/(?:\/live(?:[/?]|$)|live-broadcast|livestream|live_stream|church-online|online-service|broadcast)/i.test(path))return'live';
 if(VIDEO_HOSTS.has(host)||/(?:video|media|archive|recording|tv)/i.test(path))return'archive';
 return null;
}

export function candidateScore(value,kind){
 let score=0,url;try{url=new URL(value)}catch{return-1}
 const path=url.pathname.toLowerCase();
 if(kind==='live'){
  if(/\/live(?:\/|$)/.test(path))score+=60;
  if(/live-broadcast|livestream|church-online|online-service/.test(path))score+=45;
  if(VIDEO_HOSTS.has(url.hostname.toLowerCase()))score+=20;
 }else{
  if(/videos?|archive|recording|tv/.test(path))score+=35;
  if(VIDEO_HOSTS.has(url.hostname.toLowerCase()))score+=20;
 }
 score-=Math.min(url.search.length,20);
 return score;
}

export function extractMediaCandidates(html,baseUrl){
 const output=new Map();
 for(const match of String(html??'').matchAll(/href\s*=\s*["']([^"']+)["']/giu)){
  const url=canonicalUrl(match[1],baseUrl);if(!url)continue;
  const kind=classifyMediaUrl(url);if(!kind)continue;
  const existing=output.get(url);if(!existing||candidateScore(url,kind)>existing.score)output.set(url,{url,kind,score:candidateScore(url,kind)});
 }
 return [...output.values()].sort((a,b)=>b.score-a.score||a.url.localeCompare(b.url));
}

export function isReachableProbe(probe){
 if(!probe)return false;
 if(probe.ok)return true;
 return probe.status===401||probe.status===403||probe.status===429;
}

export function isHardFailure(probe){return Boolean(probe&&HARD_FAILURES.has(probe.status))}

export function chooseCandidate(candidates,kind){
 return candidates.filter(item=>item.kind===kind&&isReachableProbe(item.probe)).sort((a,b)=>b.score-a.score||a.url.localeCompare(b.url))[0]?.url;
}

export function nextFailureCount(previous=0,{mediaReachable=false,sourceReachable=false,hardFailure=false}={}){
 if(mediaReachable||sourceReachable)return 0;
 return Math.max(0,previous)+(hardFailure?1:1);
}

export function shouldRetire({pinned=false,consecutiveFailures=0,threshold=3}={}){
 return !pinned&&consecutiveFailures>=threshold;
}

export function deterministicDiscoveredId(sourceId,url){
 const hash=createHash('sha256').update(`${sourceId}\0${url}`).digest('hex').slice(0,10);
 return `${sourceId}-media-${hash}`;
}

export function genericDescriptions(organization){
 return{
  en:`Official live or media link published by ${organization}.`,
  pt:`Ligação oficial de transmissão em direto ou conteúdos multimédia publicada por ${organization}.`,
  es:`Enlace oficial de emisión en directo o contenidos multimedia publicado por ${organization}.`,
  fr:`Lien officiel de diffusion en direct ou de contenus multimédias publié par ${organization}.`
 };
}

export function buildSupplementalSeeds(registry,baseSources){
 const baseHosts=new Set(baseSources.map(item=>{try{return new URL(item.sourceUrl).hostname.replace(/^www\./,'')}catch{return''}}));
 const output=[];
 for(const source of registry?.sources??[]){
  if(!['A1','A2'].includes(source.authorityClass))continue;
  if(!(source.domains??[]).some(value=>value==='media'||value==='live-streams'))continue;
  const tradition=mapRegistryTradition(source.traditions);if(!tradition||!SUPPORTED_TRADITIONS.has(tradition))continue;
  let host;try{host=new URL(source.url).hostname.replace(/^www\./,'')}catch{continue}
  if(baseHosts.has(host))continue;
  output.push({
   id:`official-${source.id}`,
   tradition,
   organization:source.name,
   sourceUrl:source.url,
   discoveryUrls:[source.url],
   descriptions:genericDescriptions(source.name),
   languages:Array.isArray(source.languages)?source.languages:[],
   discoveredSeed:true
  });
 }
 return output;
}

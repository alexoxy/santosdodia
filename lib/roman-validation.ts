import type { LitcalDayResult } from './litcal-mirror';

export type ValidationCheck={sourceId:string;available:boolean;matched?:boolean;checkedAt:string;differences:string[];raw?:unknown;message?:string};
const TIMEOUT_MS=10_000;

type UnknownRecord=Record<string,unknown>;
function record(value:unknown):UnknownRecord|undefined{return value&&typeof value==='object'&&!Array.isArray(value)?value as UnknownRecord:undefined}
function text(value:unknown):string|undefined{return typeof value==='string'&&value.trim()?value.trim():typeof value==='number'?String(value):undefined}
function normalize(value:string|undefined){return String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function equivalent(a:string|undefined,b:string|undefined){const left=normalize(a),right=normalize(b);return Boolean(left&&right&&(left===right||left.includes(right)||right.includes(left)))}

async function fetchParishCompanion(date:string,country:string):Promise<unknown>{
 const response=await fetch(`https://api.parishcompanion.app/calendar/${encodeURIComponent(country)}?date=${encodeURIComponent(date)}`,{headers:{Accept:'application/json','User-Agent':'SantosDoDia-Validator/3.0'},next:{revalidate:21_600},signal:AbortSignal.timeout(TIMEOUT_MS)});
 if(!response.ok)throw new Error(`Parish Companion HTTP ${response.status}`);return response.json();
}

export async function validateRomanDay(args:{date:string;country?:string;litcal:LitcalDayResult}):Promise<ValidationCheck[]>{
 const checks:ValidationCheck[]=[];const country=String(args.country??'').toUpperCase();
 if(country==='AU'){
  const checkedAt=new Date().toISOString();
  try{
   const raw=await fetchParishCompanion(args.date,country);const day=record(record(raw)?.day)??record(raw);
   const name=text(day?.name),rank=text(day?.rank),colour=text(day?.colour??day?.color),season=text(day?.season);
   const primary=args.litcal.events[0];const differences:string[]=[];
   if(primary&&name&&!equivalent(primary.name,name))differences.push(`name: ${primary.name} ≠ ${name}`);
   if(primary&&rank&&!equivalent(primary.grade,rank))differences.push(`rank: ${primary.grade??'—'} ≠ ${rank}`);
   const litcalColour=Array.isArray(primary?.colour)?primary?.colour[0]:primary?.colour;
   if(primary&&colour&&!equivalent(litcalColour,colour))differences.push(`colour: ${litcalColour??'—'} ≠ ${colour}`);
   if(primary&&season&&!equivalent(primary.season,season))differences.push(`season: ${primary.season??'—'} ≠ ${season}`);
   checks.push({sourceId:'parish-companion',available:true,matched:differences.length===0,checkedAt,differences,raw});
  }catch(error){checks.push({sourceId:'parish-companion',available:false,checkedAt,differences:[],message:error instanceof Error?error.message:'Validation failed'})}
 }
 return checks;
}

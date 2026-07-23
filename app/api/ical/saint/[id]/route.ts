import type { NextRequest } from 'next/server';
import { getObservanceById } from '../../../../../data/discovery';
import { normalizeLocale,ui } from '../../../../../lib/i18n';
import { displayObservanceName,displayPatronages } from '../../../../../lib/locale-display';
import { traditionLabel } from '../../../../../data/observances';
import { SITE_ORIGIN } from '../../../../../lib/site';

const escapeIcs=(value:string|undefined)=>String(value??'').replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const compact=(value:string)=>value.replaceAll('-','');
function nextDate(value:string){const date=new Date(`${value}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+1);return compact(date.toISOString().slice(0,10))}

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;const locale=normalizeLocale(request.nextUrl.searchParams.get('locale')??request.headers.get('accept-language'));const copy=ui[locale];const currentYear=new Date().getUTCFullYear();const items=Array.from({length:7},(_,index)=>getObservanceById(id,currentYear+index,locale)).filter(Boolean);
 if(!items.length)return new Response('Saint calendar feed not found.',{status:404});
 const first=items[0]!,name=displayObservanceName(first.names,locale,first.name),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//santosdodia.com//Individual Saint Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',`NAME:${escapeIcs(name)}`,`X-WR-CALNAME:${escapeIcs(name)}`,'X-PUBLISHED-TTL:PT24H'];
 for(const item of items){if(!item)continue;const localized=displayObservanceName(item.names,locale,item.name),patronages=displayPatronages(item.patronages,locale),traditions=item.traditions.map(value=>traditionLabel(copy,value)).join(', '),description=[traditions,patronages.length?`${copy.patronage}: ${patronages.join(', ')}`:undefined,`${copy.validation}: ${item.validationStatus==='review-required'?copy.reviewRequired:copy.verified}`].filter(Boolean).join('\n');lines.push('BEGIN:VEVENT',`UID:${item.id}-${item.dateISO}@santosdodia.com`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${compact(item.dateISO)}`,`DTEND;VALUE=DATE:${nextDate(item.dateISO)}`,`SUMMARY:${escapeIcs(localized)}`,`DESCRIPTION:${escapeIcs(description)}`,`URL:${SITE_ORIGIN}/saint/${item.id}`,'TRANSP:TRANSPARENT','END:VEVENT')}
 lines.push('END:VCALENDAR');return new Response(`${lines.join('\r\n')}\r\n`,{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':`inline; filename="${id}.ics"`,'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800','Access-Control-Allow-Origin':'*'}})
}

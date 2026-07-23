import type { NextRequest } from 'next/server';
import {
  availableFeeds,
  getAllObservances,
  mergeObservances,
  parseCategory,
  parseTradition,
  traditionLabel,
  type Tradition
} from '../../../../data/observances';
import { normalizeLocale, ui } from '../../../../lib/i18n';
import { displayObservanceName, displayPatronages } from '../../../../lib/locale-display';
import { getLiveObservances } from '../../../../lib/live-sources';

const escapeIcs=(value:string|undefined)=>String(value??'').replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const compact=(value:string)=>value.replaceAll('-','');
function nextDate(value:string){const date=new Date(`${value}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+1);return compact(date.toISOString().slice(0,10))}
function feedTradition(value:string):Tradition|undefined{
  if(Object.prototype.hasOwnProperty.call(availableFeeds,value))return availableFeeds[value as keyof typeof availableFeeds] as Tradition|undefined;
  return parseTradition(value);
}

export async function GET(request:NextRequest,context:{params:Promise<{feed:string}>}){
  const{feed:raw}=await context.params;
  const feed=raw.toLowerCase(),all=feed==='all',feedSelection=feedTradition(feed);
  if(!all&&!feedSelection)return new Response('Calendar feed not found.',{status:404});
  const query=request.nextUrl.searchParams;
  const locale=normalizeLocale(query.get('locale')??request.headers.get('accept-language'));
  const copy=ui[locale];
  const explicitYear=query.has('year')?Number(query.get('year')):undefined;
  const currentYear=new Date().getUTCFullYear();
  const years=explicitYear?[explicitYear]:[currentYear,currentYear+1];
  const tradition=feedSelection??parseTradition(query.get('tradition'));
  const category=parseCategory(query.get('category'));
  const country=query.get('country')??undefined;
  const filters={tradition,category,country};
  const groups=await Promise.all(years.map(async year=>{
    const curated=getAllObservances(year,locale,filters);
    const imported=await getLiveObservances(year,'en',filters);
    return mergeObservances(curated,imported.data);
  }));
  const items=groups.flat();
  const calendarTitle=tradition?`Santos do Dia — ${traditionLabel(copy,tradition)}`:`Santos do Dia — ${copy.calendarTitle}`;
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//santosdodia.com//Christian Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',`NAME:${escapeIcs(calendarTitle)}`,`X-WR-CALNAME:${escapeIcs(calendarTitle)}`,'X-PUBLISHED-TTL:PT6H'];
  for(const item of items){
    const traditions=item.traditions.map(value=>traditionLabel(copy,value)).join(', ');
    const patronages=displayPatronages(item.patronages,locale);
    const description=[traditions,item.summaries?.[locale],patronages.length?`${copy.patronage}: ${patronages.join(', ')}`:undefined,`${copy.validation}: ${item.validationStatus==='review-required'?copy.reviewRequired:copy.verified}`,`${copy.navSources}: ${item.sourceIds.join(', ')}`].filter(Boolean).join('\n');
    lines.push('BEGIN:VEVENT',`UID:${item.id}-${item.dateISO}@santosdodia.com`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${compact(item.dateISO)}`,`DTEND;VALUE=DATE:${nextDate(item.dateISO)}`,`SUMMARY:${escapeIcs(displayObservanceName(item.names,locale,item.name))}`,`DESCRIPTION:${escapeIcs(description)}`,`CATEGORIES:${escapeIcs(copy[item.category])},${escapeIcs(traditions)}`,`URL:https://santosdodia.com/day/${item.dateISO}`,'TRANSP:TRANSPARENT','END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return new Response(`${lines.join('\r\n')}\r\n`,{headers:{
    'Content-Type':'text/calendar; charset=utf-8',
    'Content-Disposition':`inline; filename="santos-do-dia-${feed}.ics"`,
    'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin':'*'
  }});
}

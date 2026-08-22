import type { NextRequest } from "next/server";
import { availableFeeds, parseCategory, parseTradition, traditionLabel, type Tradition } from "../../../../data/observances";
import { validationStatusLabel } from "../../../../lib/claim-evidence";
import { localizedSummary } from "../../../../lib/content-locale";
import { normalizeLocale, ui } from "../../../../lib/i18n";
import { displayObservanceName, displayPatronages } from "../../../../lib/locale-display";
import { getPublicAllObservances } from "../../../../lib/public-observances";
import { mergePublishedCalendarRange } from "../../../../lib/public-calendar-runtime";
import { rollingCivilYearWindowForUtcInstant } from "../../../../lib/knowledge/rolling-materialization";
import { SITE_ORIGIN } from "../../../../lib/site";

const escapeIcs=(value:string|undefined)=>String(value??"").replaceAll("\\","\\\\").replaceAll("\n","\\n").replaceAll(",","\\,").replaceAll(";","\\;");
const compact=(value:string)=>value.replaceAll("-","");
function nextDate(value:string){const date=new Date(`${value}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+1);return compact(date.toISOString().slice(0,10));}
function feedTradition(value:string):Tradition|undefined{
 if(Object.prototype.hasOwnProperty.call(availableFeeds,value))return availableFeeds[value as keyof typeof availableFeeds] as Tradition|undefined;
 return parseTradition(value);
}
export async function GET(request:NextRequest,context:{params:Promise<{feed:string}>}){
 const{feed:raw}=await context.params,feed=raw.toLowerCase(),all=feed==="all",feedSelection=feedTradition(feed);
 if(!all&&!feedSelection)return new Response("Calendar feed not found.",{status:404});
 const query=request.nextUrl.searchParams,locale=normalizeLocale(query.get("locale")??request.headers.get("accept-language")),copy=ui[locale],
  explicitYear=query.has("year")?Number(query.get("year")):undefined,years=explicitYear?[explicitYear]:rollingCivilYearWindowForUtcInstant(),
  tradition=feedSelection??parseTradition(query.get("tradition")),category=parseCategory(query.get("category")),country=query.get("country")??undefined,filters={tradition,category,country};
 if(years.some(year=>!Number.isInteger(year)||year<1900||year>2200))return new Response("Invalid year.",{status:400});
 const runtimeYears=await Promise.all(years.map(async year=>{
  const curated=getPublicAllObservances(year,locale,filters);
  return mergePublishedCalendarRange(curated,{fromDate:`${year}-01-01`,toDate:`${year}-12-31`,locale,filters});
 }));
 const items=runtimeYears.flatMap(result=>result.items);
 const usesD1=runtimeYears.some(result=>result.meta.d1.publishedAccepted>0);
 const calendarTitle=tradition?`Santos do Dia — ${traditionLabel(copy,tradition)}`:`Santos do Dia — ${copy.calendarTitle}`;
 const calendarDescription=tradition?`${traditionLabel(copy,tradition)} · ${copy.calendarIntro}`:copy.calendarIntro;
 const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/, "Z");
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//santosdodia.com//Christian Calendar//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",`NAME:${escapeIcs(calendarTitle)}`,`X-WR-CALNAME:${escapeIcs(calendarTitle)}`,`X-WR-CALDESC:${escapeIcs(calendarDescription)}`,"REFRESH-INTERVAL;VALUE=DURATION:PT6H","X-PUBLISHED-TTL:PT6H",`X-SANTOSDIA-FEED-MODE:${explicitYear?"snapshot":"rolling"}`,`X-SANTOSDIA-YEARS:${years.join(",")}`,`X-SANTOSDIA-SOURCE:${usesD1?"published-d1+approved-repository":"approved-repository"}`];
 for(const item of items){
  const name=displayObservanceName(item.names,locale,item.name);if(!name)continue;
  const traditions=item.traditions.map(value=>traditionLabel(copy,value)).join(", "),patronages=displayPatronages(item.patronages,locale),summary=localizedSummary(item,locale)?.text;
  const description=[traditions,summary,patronages.length?`${copy.patronage}: ${patronages.join(", ")}`:undefined,`${copy.validation}: ${validationStatusLabel(item.validationStatus,locale)}`,`${copy.navSources}: ${item.sourceIds.join(", ")}`].filter(Boolean).join("\n");
  lines.push("BEGIN:VEVENT",`UID:${item.id}-${item.dateISO}@santosdodia.com`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${compact(item.dateISO)}`,`DTEND;VALUE=DATE:${nextDate(item.dateISO)}`,`SUMMARY:${escapeIcs(name)}`,`DESCRIPTION:${escapeIcs(description)}`,`CATEGORIES:${escapeIcs(copy[item.category])},${escapeIcs(traditions)}`,`URL:${SITE_ORIGIN}/day/${item.dateISO}`,"TRANSP:TRANSPARENT","END:VEVENT");
 }
 lines.push("END:VCALENDAR");
 return new Response(`${lines.join("\r\n")}\r\n`,{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":`inline; filename="santos-do-dia-${feed}.ics"`,"Cache-Control":"public, s-maxage=21600, stale-while-revalidate=86400","Access-Control-Allow-Origin":"*"}});
}

import { NextRequest } from "next/server";
import { parseCategory, parseTradition } from "../../../../data/observances";
import { localizedSummary } from "../../../../lib/content-locale";
import { normalizeLocale } from "../../../../lib/i18n";
import { displayObservanceName, displayPatronages } from "../../../../lib/locale-display";
import { getPublicObservancesForDate } from "../../../../lib/public-observances";
import { mergePublishedCalendarRange } from "../../../../lib/public-calendar-runtime";
import { civilDateAtInstant, isValidIanaTimeZone, normalizeTimeZone } from "../../../../lib/knowledge/temporal-core";

export async function GET(request: NextRequest) {
  const params=request.nextUrl.searchParams;
  const locale=normalizeLocale(params.get("locale")??request.headers.get("accept-language"));
  const requestedTimeZone=params.get("timezone")??params.get("tz");
  const timeZone=normalizeTimeZone(requestedTimeZone,"UTC");
  const explicitDate=params.get("date");
  const date=explicitDate??civilDateAtInstant(new Date(),timeZone);
  const filters={tradition:parseTradition(params.get("tradition")),category:parseCategory(params.get("category")),country:params.get("country")??undefined};
  const curated=getPublicObservancesForDate(date,locale,filters);
  const runtime=await mergePublishedCalendarRange(curated,{fromDate:date,toDate:date,locale,filters});
  const data=runtime.items.map(item=>({
    ...item,
    originalName:item.name,
    name:displayObservanceName(item.names,locale,item.name),
    summary:localizedSummary(item,locale)?.text,
    patronages:displayPatronages(item.patronages,locale),
  })).filter(item=>Boolean(item.name));
  return Response.json({data,meta:{
    date,locale,timeZone,timeZoneSource:explicitDate?"explicit-date":isValidIanaTimeZone(requestedTimeZone)?"request":"utc-fallback",
    count:data.length,withheldForTranslation:runtime.items.length-data.length,filters,live:false,requestedLive:params.has("live"),sourceMode:runtime.meta.sourceMode,d1:runtime.meta.d1,generatedAt:new Date().toISOString()
  }},{headers:{"Cache-Control":explicitDate?"public, s-maxage=900, stale-while-revalidate=86400":"public, s-maxage=60, stale-while-revalidate=300","Access-Control-Allow-Origin":"*"}});
}

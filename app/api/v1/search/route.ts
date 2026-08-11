import { NextRequest } from "next/server";
import { parseCategory, parseTradition, traditionLabel } from "../../../../data/observances";
import { localizedSummary } from "../../../../lib/content-locale";
import { normalizeLocale, ui } from "../../../../lib/i18n";
import { displayObservanceName, displayPatronages } from "../../../../lib/locale-display";
import { getPublicAllObservances } from "../../../../lib/public-observances";
import { mergePublishedCalendarRange } from "../../../../lib/public-calendar-runtime";

export async function GET(request: NextRequest) {
  const p=request.nextUrl.searchParams;
  const q=p.get("q")??"";
  const locale=normalizeLocale(p.get("locale")??request.headers.get("accept-language"));
  const year=Number(p.get("year")??new Date().getUTCFullYear());
  if(!Number.isInteger(year)||year<1900||year>2200)return Response.json({error:"Invalid year."},{status:400});
  const filters={tradition:parseTradition(p.get("tradition")),category:parseCategory(p.get("category")),country:p.get("country")??undefined,patronage:p.get("patronage")??undefined};
  const curated=getPublicAllObservances(year,locale,filters);
  const runtime=await mergePublishedCalendarRange(curated,{fromDate:`${year}-01-01`,toDate:`${year}-12-31`,locale,filters});
  const localized=runtime.items.map(item=>({
    ...item,
    originalName:item.name,
    name:displayObservanceName(item.names,locale,item.name),
    summary:localizedSummary(item,locale)?.text,
    patronages:displayPatronages(item.patronages,locale),
  })).filter(item=>Boolean(item.name));
  const needle=q.trim().toLocaleLowerCase(locale);
  const data=localized.filter(item=>!needle||[
    item.name,item.originalName,...Object.values(item.names),item.summary??"",...(item.patronages??[]),...(item.countries??[]),
    ...item.traditions.map(value=>traditionLabel(ui[locale],value)),ui[locale][item.category]
  ].join(" ").toLocaleLowerCase(locale).includes(needle)).slice(0,300);
  return Response.json({data,meta:{query:q,locale,year,count:data.length,withheldForTranslation:runtime.items.length-localized.length,filters,live:false,requestedLive:p.has("live"),sourceMode:runtime.meta.sourceMode,d1:runtime.meta.d1}},
    {headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=3600","Access-Control-Allow-Origin":"*"}});
}

import { NextRequest } from "next/server";
import { getCanonicalPersonProfileObservance } from "../../../../data/canonical-person-profiles";
import { parseCategory, parseTradition, traditionLabel } from "../../../../data/observances";
import { getSaintBiography, SAINT_BIOGRAPHIES } from "../../../../data/saint-biography-registry";
import { localizedSummary } from "../../../../lib/content-locale";
import { isSaintBiographyReadyForLaunchedLocales } from "../../../../lib/editorial-profile-quality";
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
  const runtime=await mergePublishedCalendarRange(curated,{fromDate:`${year}-01-01`,toDate:`${year}-12-31`,locale,filters,includeCalculatedTemporale:Boolean(q.trim())});
  const localized=runtime.items.map(item=>({
    ...item,
    originalName:item.name,
    name:displayObservanceName(item.names,locale,item.name),
    summary:localizedSummary(item,locale)?.text,
    patronages:displayPatronages(item.patronages,locale),
  })).filter(item=>Boolean(item.name));
  const biographyProfiles=SAINT_BIOGRAPHIES
    .filter(isSaintBiographyReadyForLaunchedLocales)
    .map(record=>{
      const item=getCanonicalPersonProfileObservance(record.id,year,locale);
      const biography=getSaintBiography(record.id,locale);
      if(!item||!biography)return null;
      if(filters.tradition&&!item.traditions.includes(filters.tradition))return null;
      if(filters.category&&item.category!==filters.category)return null;
      if(filters.country&&item.countries?.length&&!item.countries.includes(filters.country.toUpperCase()))return null;
      if(filters.patronage&&!item.patronages?.some(value=>value.toLocaleLowerCase(locale).includes(filters.patronage!.toLocaleLowerCase(locale))))return null;
      return{
        ...item,
        originalName:item.name,
        name:displayObservanceName(item.names,locale,item.name),
        summary:biography.summary,
        patronages:displayPatronages(item.patronages,locale),
        profileId:record.id,
        editorialSearchText:[
          biography.title,
          biography.summary,
          ...biography.paragraphs,
          ...biography.facts.flatMap(fact=>[fact.label,fact.value]),
        ].join(" "),
      };
    })
    .filter((item):item is NonNullable<typeof item>=>Boolean(item));
  const publicItems=[...new Map(
    [...localized,...biographyProfiles].map(item=>[
      `${item.dateISO}|${item.traditions.join(",")}|${"profileId" in item?item.profileId:item.id}`,
      item,
    ]),
  ).values()];
  const needle=q.trim().toLocaleLowerCase(locale);
  const data=publicItems.filter(item=>!needle||[
    item.name,item.originalName,...Object.values(item.names),item.summary??"",...(item.patronages??[]),...(item.countries??[]),
    ...item.traditions.map(value=>traditionLabel(ui[locale],value)),ui[locale][item.category],
    "editorialSearchText" in item?item.editorialSearchText:"",
  ].join(" ").toLocaleLowerCase(locale).includes(needle)).slice(0,300);
  return Response.json({data,meta:{query:q,locale,year,count:data.length,withheldForTranslation:runtime.items.length-localized.length,filters,live:false,requestedLive:p.has("live"),sourceMode:runtime.meta.sourceMode,calculatedTemporale:runtime.meta.calculatedTemporale,d1:runtime.meta.d1}},
    {headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=3600","Access-Control-Allow-Origin":"*"}});
}

import { NextRequest } from 'next/server';
import { getObservancesForDate,mergeObservances,parseCategory,parseTradition } from '../../../../data/observances';
import { normalizeLocale } from '../../../../lib/i18n';
import { displayObservanceName,displayPatronages } from '../../../../lib/locale-display';
import { getChurchObservances } from '../../../../lib/church-sources';

export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;const locale=normalizeLocale(params.get('locale')??request.headers.get('accept-language'));const date=params.get('date')??new Date().toISOString().slice(0,10);const year=Number(date.slice(0,4));const filters={tradition:parseTradition(params.get('tradition')),category:parseCategory(params.get('category')),country:params.get('country')??undefined};
 const curated=getObservancesForDate(date,locale,filters),live=params.get('live')!=='0',imported=live?await getChurchObservances(year,locale,filters,{date}):{data:[],sourceHealth:[]},merged=mergeObservances(curated,imported.data);
 const data=merged.map(item=>({...item,originalName:item.name,name:displayObservanceName(item.names,locale,item.name),summary:item.summaries?.[locale]??item.summary,patronages:displayPatronages(item.patronages,locale)})).filter(item=>Boolean(item.name));
 return Response.json({data,meta:{date,locale,count:data.length,withheldForTranslation:merged.length-data.length,filters,live,sourceHealth:imported.sourceHealth,generatedAt:new Date().toISOString()}},{headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=86400','Access-Control-Allow-Origin':'*'}})
}

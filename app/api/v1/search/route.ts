import { NextRequest } from 'next/server';
import { getAllObservances,mergeObservances,parseCategory,parseTradition,traditionLabel } from '../../../../data/observances';
import { normalizeLocale,ui } from '../../../../lib/i18n';
import { displayObservanceName,displayPatronages } from '../../../../lib/locale-display';
import { getChurchObservances } from '../../../../lib/church-sources';

export async function GET(request:NextRequest){
 const p=request.nextUrl.searchParams,q=p.get('q')??'',locale=normalizeLocale(p.get('locale')??request.headers.get('accept-language')),year=Number(p.get('year')??new Date().getUTCFullYear()),live=p.get('live')!=='0';
 const filters={tradition:parseTradition(p.get('tradition')),category:parseCategory(p.get('category')),country:p.get('country')??undefined,patronage:p.get('patronage')??undefined};
 const curated=getAllObservances(year,locale,filters),imported=live?await getChurchObservances(year,locale,filters):{data:[],sourceHealth:[]},merged=mergeObservances(curated,imported.data);
 const localized=merged.map(item=>{const patronages=displayPatronages(item.patronages,locale);return{...item,originalName:item.name,name:displayObservanceName(item.names,locale,item.name),summary:item.summaries?.[locale]??item.summary,patronages}}).filter(item=>Boolean(item.name));
 const needle=q.trim().toLocaleLowerCase(locale);const data=localized.filter(item=>!needle||[item.name,item.originalName,...Object.values(item.names),item.summary??'',...(item.patronages??[]),...(item.countries??[]),...item.traditions.map(value=>traditionLabel(ui[locale],value)),ui[locale][item.category]].join(' ').toLocaleLowerCase(locale).includes(needle)).slice(0,300);
 return Response.json({data,meta:{query:q,locale,year,count:data.length,withheldForTranslation:merged.length-localized.length,filters,live,sourceHealth:imported.sourceHealth}},{headers:{'Cache-Control':'public, s-maxage=600, stale-while-revalidate=3600','Access-Control-Allow-Origin':'*'}})
}

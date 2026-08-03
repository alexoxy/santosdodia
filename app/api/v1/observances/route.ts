import { NextRequest } from 'next/server';
import { mergeObservances,parseCategory,parseTradition } from '../../../../data/observances';
import { normalizeLocale,type Locale,type LocalizedText } from '../../../../lib/i18n';
import { displayObservanceName, displayPatronages } from '../../../../lib/locale-display';
import { getChurchObservances } from '../../../../lib/church-sources';
import { getPublicAllObservances,getPublicMonthlyObservances,getPublicObservancesForDate } from '../../../../lib/public-observances';

const emptyImport={data:[],sourceHealth:[],publication:{received:0,published:0,withheld:0,reasons:{}}};

function trustworthyNames(names:LocalizedText,locale:Locale):LocalizedText{
 if(locale==='en')return names;
 const localized=names[locale]?.normalize('NFC').trim();
 const english=names.en?.normalize('NFC').trim();
 if(!localized||!english||localized.toLocaleLowerCase()!==english.toLocaleLowerCase())return names;
 const cleaned={...names};delete cleaned[locale];return cleaned;
}

export async function GET(request: NextRequest) {
 const p=request.nextUrl.searchParams;const locale=normalizeLocale(p.get('locale')??request.headers.get('accept-language'));const now=new Date();const year=Number(p.get('year')??now.getUTCFullYear());const month=p.has('month')?Number(p.get('month')):undefined;const date=p.get('date')??undefined;const live=p.get('live')!=='0';
 const filters={tradition:parseTradition(p.get('tradition')),category:parseCategory(p.get('category')),country:p.get('country')??undefined,patronage:p.get('patronage')??undefined};
 if(!Number.isInteger(year)||year<1900||year>2200)return Response.json({error:'Invalid year.'},{status:400});if(month!==undefined&&(!Number.isInteger(month)||month<1||month>12))return Response.json({error:'Invalid month.'},{status:400});
 const curated=date?getPublicObservancesForDate(date,locale,filters):month?getPublicMonthlyObservances(year,month-1,locale,filters):getPublicAllObservances(year,locale,filters);
 const imported=live?await getChurchObservances(year,locale,filters,{month,date}):emptyImport;const merged=mergeObservances(curated,imported.data);
 const data=merged.map(item=>{const names=trustworthyNames(item.names,locale);return{...item,names,originalName:item.name,name:displayObservanceName(names,locale,item.name),summary:item.summaries?.[locale]??item.summary,patronages:displayPatronages(item.patronages,locale)}}).filter(item=>Boolean(item.name));
 return Response.json({data,meta:{year,month,date,locale,count:data.length,withheldForTranslation:merged.length-data.length,filters,live,sourceHealth:imported.sourceHealth,publication:imported.publication,generatedAt:new Date().toISOString()}},{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=86400','Access-Control-Allow-Origin':'*'}})
}

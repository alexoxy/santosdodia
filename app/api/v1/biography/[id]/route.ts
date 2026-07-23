import type { NextRequest } from 'next/server';
import { getObservanceById } from '../../../../../data/discovery';
import { normalizeLocale,type Locale } from '../../../../../lib/i18n';
import { displayObservanceName } from '../../../../../lib/locale-display';

type SearchPayload={pages?:Array<{key?:string;title?:string;description?:string}>};
type SummaryPayload={title?:string;description?:string;extract?:string;type?:string;content_urls?:{desktop?:{page?:string}}};
const wikiLanguage:Record<Locale,string>={en:'en',es:'es',pt:'pt',fr:'fr',fil:'tl',ru:'ru',sw:'sw',de:'de',it:'it',pl:'pl'};
const headers={'User-Agent':'SantosdoDia/3.2 (https://www.santosdodia.com/copyright)','Api-User-Agent':'SantosdoDia/3.2 (https://www.santosdodia.com/copyright)'};

async function findSummary(language:string,query:string){
 const searchUrl=new URL(`https://${language}.wikipedia.org/w/rest.php/v1/search/page`);searchUrl.searchParams.set('q',query);searchUrl.searchParams.set('limit','3');
 const searchResponse=await fetch(searchUrl,{headers,next:{revalidate:86400}});if(!searchResponse.ok)return undefined;
 const search=await searchResponse.json() as SearchPayload;
 for(const page of search.pages??[]){
  const key=page.key??page.title;if(!key)continue;
  const response=await fetch(`https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`,{headers,next:{revalidate:86400}});if(!response.ok)continue;
  const summary=await response.json() as SummaryPayload;
  if(summary.type==='disambiguation'||!summary.extract||summary.extract.length<80)continue;
  return {title:summary.title??page.title??query,description:summary.description??page.description,extract:summary.extract,url:summary.content_urls?.desktop?.page??`https://${language}.wikipedia.org/wiki/${encodeURIComponent(key)}`,language};
 }
}

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;const locale=normalizeLocale(request.nextUrl.searchParams.get('locale')??request.headers.get('accept-language'));const item=getObservanceById(id,new Date().getUTCFullYear(),locale);
 if(!item)return Response.json({error:'Saint not found.'},{status:404});
 const localizedName=displayObservanceName(item.names,locale,item.name)||item.names.en;const preferred=wikiLanguage[locale];
 const result=await findSummary(preferred,localizedName).catch(()=>undefined)??(preferred==='en'?undefined:await findSummary('en',item.names.en).catch(()=>undefined));
 if(!result)return Response.json({data:null},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400','Access-Control-Allow-Origin':'*'}});
 return Response.json({data:{...result,provider:'Wikipedia',license:'CC BY-SA',retrievedAt:new Date().toISOString()}},{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800','Access-Control-Allow-Origin':'*'}});
}

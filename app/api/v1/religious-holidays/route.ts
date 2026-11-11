import { NextRequest } from 'next/server';
import { normalizeLocale } from '../../../../lib/i18n';
import { parseTradition } from '../../../../data/observances';
import { calculatedChurchDates,localizePublicHoliday,type NagerHoliday } from '../../../../lib/religious-holidays';

const FALLBACK_COUNTRIES=[['PT','Portugal'],['ES','Spain'],['FR','France'],['IT','Italy'],['DE','Germany'],['GB','United Kingdom'],['IE','Ireland'],['PL','Poland'],['GR','Greece'],['CY','Cyprus'],['RO','Romania'],['BG','Bulgaria'],['US','United States'],['CA','Canada'],['BR','Brazil'],['MX','Mexico'],['AR','Argentina'],['CO','Colombia'],['PE','Peru'],['CL','Chile'],['PH','Philippines'],['AU','Australia'],['NZ','New Zealand'],['ZA','South Africa'],['EG','Egypt'],['ET','Ethiopia'],['AM','Armenia'],['GE','Georgia']].map(([countryCode,name])=>({countryCode,name}));
async function json(url:string){const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SantosDoDia/3.3 (+https://www.santosdodia.com)'},next:{revalidate:86_400},signal:AbortSignal.timeout(14_000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}

export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;
 if(params.get('mode')==='countries'){
  try{const payload=await json('https://date.nager.at/api/v3/AvailableCountries');const data=(Array.isArray(payload)?payload:[]).map(item=>({countryCode:String(item.countryCode??item.key??'').toUpperCase(),name:String(item.name??item.value??'')})).filter(item=>/^[A-Z]{2}$/.test(item.countryCode)&&item.name).sort((a,b)=>a.name.localeCompare(b.name));return Response.json({data,meta:{count:data.length,source:'Nager.Date'}},{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800','Access-Control-Allow-Origin':'*'}})}catch{return Response.json({data:FALLBACK_COUNTRIES,meta:{count:FALLBACK_COUNTRIES.length,source:'repository-fallback'}},{headers:{'Cache-Control':'public, s-maxage=3600','Access-Control-Allow-Origin':'*'}})}
 }
 const locale=normalizeLocale(params.get('locale')??request.headers.get('accept-language')),country=(params.get('country')??'PT').toUpperCase(),year=Number(params.get('year')??new Date().getUTCFullYear()),rawTradition=params.get('tradition'),tradition=rawTradition==='all'?'all':parseTradition(rawTradition)??'roman-catholic';
 if(!/^[A-Z]{2}$/.test(country))return Response.json({error:'Invalid country code.'},{status:400});if(!Number.isInteger(year)||year<1970||year>2100)return Response.json({error:'Year must be between 1970 and 2100.'},{status:400});
 let publicHolidays:ReturnType<typeof localizePublicHoliday>[]=[];let sourceHealth={ok:true,message:undefined as string|undefined};
 try{const payload=await json(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);publicHolidays=(Array.isArray(payload)?payload:[]).map(item=>localizePublicHoliday(item as NagerHoliday,locale)).filter(Boolean)}catch(error){sourceHealth={ok:false,message:error instanceof Error?error.message:'Public holiday source unavailable.'}}
 const churchDates=calculatedChurchDates(year,locale,tradition);
 return Response.json({data:{country,year,tradition,publicHolidays,churchDates},meta:{locale,publicHolidaySource:'Nager.Date public-holiday API',liturgicalSource:'Santos do Dia calculated calendar rules',sourceHealth,disclaimer:'A liturgical date is not necessarily a legal public holiday. National and regional rules can change.'}},{headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=604800','Access-Control-Allow-Origin':'*'}})
}

import { NextRequest } from 'next/server';
import { normalizeLocale } from '../../../../lib/i18n';
import { getLitcalDay, type LitcalCalendarRef } from '../../../../lib/litcal-mirror';

function calendarFromParams(params:URLSearchParams):LitcalCalendarRef{
 const kind=params.get('kind');const id=params.get('calendar')??undefined;
 if(kind==='nation'&&id)return{kind:'nation',id};
 if(kind==='diocese'&&id)return{kind:'diocese',id};
 return{kind:'general'};
}
function validDate(value:string){const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);if(!match)return false;const date=new Date(`${value}T00:00:00Z`);return!Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value}

export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;
 const date=params.get('date')??new Date().toISOString().slice(0,10);
 if(!validDate(date))return Response.json({error:'Invalid date.'},{status:400});
 const locale=normalizeLocale(params.get('locale')??request.headers.get('accept-language'));
 const calendar=calendarFromParams(params);
 const result=await getLitcalDay({date,locale,calendar});
 return Response.json({data:result,meta:{date,locale,calendar,provider:'Liturgical Calendar API',license:'Apache-2.0'}},{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=86400','Access-Control-Allow-Origin':'*'}});
}

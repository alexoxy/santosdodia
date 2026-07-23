import { getLitcalCalendars } from '../../../../../lib/litcal-mirror';

export async function GET(){
 const result=await getLitcalCalendars();
 return Response.json({data:result.calendars,meta:{source:result.source,provider:'Liturgical Calendar API',license:'Apache-2.0'}},{headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=604800','Access-Control-Allow-Origin':'*'}});
}

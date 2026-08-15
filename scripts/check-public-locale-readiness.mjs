#!/usr/bin/env node

const ORIGIN = process.env.SANTOSDIA_ORIGIN ?? 'https://santosdodia.alexmmpinto.workers.dev';
const YEAR = Number(process.env.SANTOSDIA_YEAR ?? new Date().getUTCFullYear());
const LOCALES = ['en','es','pt','fr','fil','ru','sw','de','it','pl'];
const PUBLIC = new Set(['en','es','pt','it']);
const EXPECTED_DAYS = (() => {
  const days=[];
  for(let date=new Date(Date.UTC(YEAR,0,1));date.getUTCFullYear()===YEAR;date.setUTCDate(date.getUTCDate()+1))days.push(date.toISOString().slice(0,10));
  return days;
})();

async function month(locale, month) {
  const url=new URL('/api/v1/observances',ORIGIN);
  url.searchParams.set('year',String(YEAR));
  url.searchParams.set('month',String(month));
  url.searchParams.set('locale',locale);
  url.searchParams.set('tradition','roman-catholic');
  url.searchParams.set('country','PT');
  const response=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`${locale} month ${month} returned HTTP ${response.status}`);
  const body=await response.json();
  if(!Array.isArray(body?.data))throw new Error(`${locale} month ${month} has no data array`);
  return body;
}

async function inspectLocale(locale) {
  const days=new Set();
  let rows=0, emptyNames=0, d1Bound=true, publishedSource=true;
  for(let start=1;start<=12;start+=3){
    const batch=await Promise.all([start,start+1,start+2].filter(value=>value<=12).map(value=>month(locale,value)));
    for(const body of batch){
      d1Bound=d1Bound&&body?.meta?.d1?.bound===true;
      publishedSource=publishedSource&&String(body?.meta?.sourceMode??'').includes('published-d1');
      for(const item of body.data){
        rows+=1;
        if(typeof item?.dateISO==='string')days.add(item.dateISO);
        if(typeof item?.name!=='string'||!item.name.trim())emptyNames+=1;
      }
    }
  }
  const missingDays=EXPECTED_DAYS.filter(date=>!days.has(date));
  const calendarComplete=missingDays.length===0&&emptyNames===0&&d1Bound&&publishedSource;
  return {
    locale,
    public:PUBLIC.has(locale),
    days:days.size,
    expectedDays:EXPECTED_DAYS.length,
    coveragePercent:Number((days.size/EXPECTED_DAYS.length*100).toFixed(2)),
    rows,
    emptyNames,
    missingDays:missingDays.length,
    d1Bound,
    publishedSource,
    calendarComplete,
    publicPromotionCandidate:!PUBLIC.has(locale)&&calendarComplete,
  };
}

const results=[];
for(const locale of LOCALES){
  try{results.push(await inspectLocale(locale));}
  catch(error){results.push({locale,public:PUBLIC.has(locale),calendarComplete:false,publicPromotionCandidate:false,error:error instanceof Error?error.message:String(error)});}
}
const report={schemaVersion:1,checkedAt:new Date().toISOString(),origin:ORIGIN,year:YEAR,criteria:{calendarDays:EXPECTED_DAYS.length,emptyNames:0,d1Bound:true,publishedSource:true},results};
console.log(JSON.stringify(report,null,2));
const brokenPublic=results.filter(item=>item.public&&!item.calendarComplete);
if(brokenPublic.length){
  console.error(`Public locale readiness failed: ${brokenPublic.map(item=>item.locale).join(', ')}`);
  process.exit(1);
}

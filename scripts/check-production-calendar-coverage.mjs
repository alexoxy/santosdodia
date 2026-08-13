const origin='https://santosdodia.alexmmpinto.workers.dev';
const year=2026;
const seen=new Set();
const personDays=new Set();
const personSamplesByMonth=new Map();
const personCategories=new Set(['saint','apostle','martyr']);
const strictProfileRoutes=process.env.GITHUB_EVENT_NAME!=='pull_request';
let rows=0;
let personRows=0;

function normalizeName(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/[’'`´.·,:;()\[\]{}\-_/\\]/gu,' ').replace(/\s+/gu,' ').trim();}
function collectiveName(value){const name=normalizeName(value);return name.startsWith('santos ')||name.startsWith('santas ')||name.startsWith('saints ')||name.startsWith('ss ')||name.includes(' e sao ')||name.includes(' e santo ')||name.includes(' e santa ')||name.includes(' and saint ');}
function profileEligible(item){return personCategories.has(item?.category)&&![item?.name,...Object.values(item?.names??{})].some(collectiveName);}

for(let month=1;month<=12;month+=1){
  const url=new URL('/api/v1/observances',origin);
  url.searchParams.set('year',String(year));
  url.searchParams.set('month',String(month));
  url.searchParams.set('locale','pt');
  url.searchParams.set('tradition','roman-catholic');
  url.searchParams.set('country','PT');
  const response=await fetch(url,{headers:{accept:'application/json'}});
  if(!response.ok)throw new Error(`Month ${month} returned HTTP ${response.status}`);
  const body=await response.json();
  if(body?.meta?.sourceMode!=='published-d1+approved-repository')throw new Error(`Month ${month} is not using the published calendar.`);
  if(body?.meta?.d1?.bound!==true)throw new Error(`Month ${month} has no production D1 binding.`);
  if(!(Number(body?.meta?.d1?.publishedAccepted)>0))throw new Error(`Month ${month} accepted no published D1 rows.`);
  if(!Array.isArray(body.data))throw new Error(`Month ${month} has no data array.`);
  for(const item of body.data){
    if(!item?.name?.trim())throw new Error(`Month ${month} contains an empty Portuguese name.`);
    if(typeof item.dateISO==='string')seen.add(item.dateISO);
    if(profileEligible(item)){
      personRows+=1;
      if(typeof item.dateISO==='string')personDays.add(item.dateISO);
      if(!personSamplesByMonth.has(month) && typeof item.id==='string' && item.id && typeof item.dateISO==='string'){
        personSamplesByMonth.set(month,{id:item.id,dateISO:item.dateISO,name:item.name});
      }
    }
  }
  rows+=body.data.length;
}

const expected=[];
for(let date=new Date(Date.UTC(year,0,1));date.getUTCFullYear()===year;date.setUTCDate(date.getUTCDate()+1))expected.push(date.toISOString().slice(0,10));
const missing=expected.filter(date=>!seen.has(date));
if(missing.length)throw new Error(`Missing ${missing.length} published day(s): ${missing.join(', ')}`);
if(!personRows)throw new Error('Published calendar contains no singular person-profile eligible rows.');

const dayPercent=((personDays.size/expected.length)*100).toFixed(1);
console.log(`Roman Catholic PT ${year}: ${seen.size}/${expected.length} days covered, ${rows} public rows.`);
console.log(`Visible profile KPI: ${personRows} singular person rows across ${personDays.size}/${expected.length} days (${dayPercent}%).`);

let profileSamplesPassed=0;
const profileFailures=[];
for(const [month,sample] of personSamplesByMonth){
  const profileUrl=new URL(`/saint/${encodeURIComponent(sample.id)}`,origin);
  profileUrl.searchParams.set('date',sample.dateISO);
  const response=await fetch(profileUrl,{headers:{'accept-language':'pt-PT,pt;q=0.9,en;q=0.5'}});
  if(response.ok){
    profileSamplesPassed+=1;
  }else{
    profileFailures.push(`month ${month}: ${sample.name} (${sample.id}) ${sample.dateISO} HTTP ${response.status}`);
  }
}
console.log(`Profile route probes: ${profileSamplesPassed}/${personSamplesByMonth.size} monthly samples passed.`);
if(profileFailures.length){
  const message=`Profile route failures: ${profileFailures.join(' | ')}`;
  if(strictProfileRoutes)throw new Error(message);
  console.warn(`PR diagnostic only — ${message}`);
}

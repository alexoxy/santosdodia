const origin='https://santosdodia.alexmmpinto.workers.dev';
const year=2026;
const seen=new Set();
let rows=0;

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
  }
  rows+=body.data.length;
}

const expected=[];
for(let date=new Date(Date.UTC(year,0,1));date.getUTCFullYear()===year;date.setUTCDate(date.getUTCDate()+1))expected.push(date.toISOString().slice(0,10));
const missing=expected.filter(date=>!seen.has(date));
if(missing.length)throw new Error(`Missing ${missing.length} published day(s): ${missing.join(', ')}`);

console.log(`Roman Catholic PT ${year}: ${seen.size}/${expected.length} days covered, ${rows} public rows.`);

// Permanent D2/D6 live sentinel: this is a published D1 person profile that does not
// depend on the legacy curated profile catalogue. It must remain reachable and exportable.
const runtimeSaintId='rc:StRayPenyafort';
const runtimeSaintDate='2026-01-07';
const encodedId=encodeURIComponent(runtimeSaintId);

const profileUrl=new URL(`/saint/${encodedId}`,origin);
profileUrl.searchParams.set('date',runtimeSaintDate);
const profileResponse=await fetch(profileUrl,{headers:{'accept-language':'pt-PT,pt;q=0.9'}});
if(!profileResponse.ok)throw new Error(`Runtime saint profile returned HTTP ${profileResponse.status}.`);
const profileHtml=await profileResponse.text();
if(!profileHtml.includes('Raimundo'))throw new Error('Runtime saint profile did not render the expected localized identity.');

const icsUrl=new URL(`/api/ical/saint/${encodedId}`,origin);
icsUrl.searchParams.set('locale','pt');
const icsResponse=await fetch(icsUrl,{headers:{accept:'text/calendar'}});
if(!icsResponse.ok)throw new Error(`Runtime saint calendar returned HTTP ${icsResponse.status}.`);
const contentType=icsResponse.headers.get('content-type')??'';
if(!contentType.toLowerCase().includes('text/calendar'))throw new Error(`Runtime saint calendar has unexpected Content-Type: ${contentType}`);
const ics=await icsResponse.text();
for(const marker of ['BEGIN:VCALENDAR','BEGIN:VEVENT',`UID:${runtimeSaintId}-${runtimeSaintDate}@santosdodia.com`,'END:VCALENDAR']){
  if(!ics.includes(marker))throw new Error(`Runtime saint calendar is missing ${marker}.`);
}

console.log(`Runtime saint live sentinel: profile 200 + calendar 200 (${runtimeSaintId}).`);

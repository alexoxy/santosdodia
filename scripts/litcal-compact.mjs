function record(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:undefined}
function text(value){return typeof value==='string'&&value.trim()?value.trim():typeof value==='number'&&Number.isFinite(value)?String(value):undefined}
function stringList(value){if(Array.isArray(value))return value.flatMap(item=>typeof item==='string'&&item.trim()?[item.trim()]:[]);const single=text(value);return single?[single]:[]}
function directDate(value){
 if(typeof value==='string'){
  const match=value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];if(match)return match;
  const parsed=new Date(value);if(!Number.isNaN(parsed.getTime()))return parsed.toISOString().slice(0,10);
 }
 if(typeof value==='number'&&Number.isFinite(value)){
  const parsed=new Date(value<10_000_000_000?value*1000:value);if(!Number.isNaN(parsed.getTime()))return parsed.toISOString().slice(0,10);
 }
 const nested=record(value);return nested?directDate(nested.date??nested.dateISO??nested.timestamp??nested.value):undefined;
}
function slug(value){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)||'event'}
function eventCandidates(payload){
 if(Array.isArray(payload))return payload;
 const root=record(payload);if(!root)return[];
 const candidate=root.LitCal??root.litcal??root.events??root.calendar??root.data;
 if(Array.isArray(candidate))return candidate;
 const object=record(candidate);return object?Object.values(object).flatMap(value=>Array.isArray(value)?value:[value]):[];
}
function compactEvent(raw,index){
 const item=record(raw);if(!item)return;
 const name=text(item.name??item.name_lcl??item.title??item.event_name??record(item.event)?.name);
 const dateISO=directDate(item.date??item.dateISO??item.datetime??item.timestamp??record(item.event)?.date);
 if(!name||!dateISO)return;
 const event={
  id:text(item.event_key??item.event_idx??item.id)??`${slug(name)}-${dateISO}-${index}`,
  name,
  dateISO
 };
 const grade=text(item.grade_lcl??item.grade??item.rank??item.precedence);if(grade)event.grade=grade;
 const colours=stringList(item.color_lcl??item.color??item.colour);if(colours.length)event.colour=colours.length===1?colours[0]:colours;
 const commons=stringList(item.common_lcl??item.common);if(commons.length)event.common=commons.length===1?commons[0]:commons;
 const season=text(item.liturgical_season_lcl??item.liturgical_season??item.season_lcl??item.season);if(season)event.season=season;
 const sundayCycle=text(item.sunday_cycle??item.year_cycle??item.cycle??item.sundayCycle);if(sundayCycle)event.sundayCycle=sundayCycle;
 const weekdayCycle=text(item.weekday_cycle??item.weekdayCycle);if(weekdayCycle)event.weekdayCycle=weekdayCycle;
 const psalterWeek=text(item.psalter_week??item.psalterWeek);if(psalterWeek)event.psalterWeek=psalterWeek;
 const liturgicalYear=text(item.liturgical_year??item.liturgicalYear);if(liturgicalYear)event.liturgicalYear=liturgicalYear;
 return event;
}

export function compactLitcalPayload(payload){
 const candidates=eventCandidates(payload);
 const events=candidates.map(compactEvent).filter(Boolean);
 if(candidates.length&&events.length===0)throw new Error('LitCal payload contains candidates but no compactable events.');
 return{
  schemaVersion:1,
  format:'santosdia-litcal-runtime-fallback',
  eventCount:events.length,
  events
 };
}

export function compactLitcalJson(textValue){return `${JSON.stringify(compactLitcalPayload(JSON.parse(textValue)))}\n`}

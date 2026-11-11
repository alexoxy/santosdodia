export function normalizeTimeZone(value:string|null|undefined):string{
 const candidate=String(value??'').trim();
 if(!candidate)return'UTC';
 try{new Intl.DateTimeFormat('en',{timeZone:candidate}).format(new Date());return candidate}catch{return'UTC'}
}

export function dateISOInTimeZone(timeZone:string,date=new Date()):string{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:normalizeTimeZone(timeZone),year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
 return`${values.year}-${values.month}-${values.day}`;
}

export function yearInTimeZone(timeZone:string,date=new Date()):number{
 return Number(dateISOInTimeZone(timeZone,date).slice(0,4));
}

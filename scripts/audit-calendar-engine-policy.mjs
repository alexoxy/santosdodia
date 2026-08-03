import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const policy=JSON.parse(fs.readFileSync(path.join(root,'data/calendar-engine-policy.json'),'utf8'));
const traditions=['roman-catholic','anglican','greek-orthodox','eastern-orthodox','coptic-orthodox','armenian-apostolic','ethiopian-orthodox','syriac-orthodox'];
const errors=[];

for(const tradition of traditions){
 const entry=policy[tradition];
 if(!entry)errors.push(`Missing calendar engine policy for ${tradition}`);
 else{
  if(!entry.engine)errors.push(`Missing engine for ${tradition}`);
  if(!entry.fixedDatePolicy)errors.push(`Missing fixed-date policy for ${tradition}`);
  if(!Array.isArray(entry.sourceIds)||!entry.sourceIds.length)errors.push(`Missing source IDs for ${tradition}`);
 }
}

for(const tradition of ['coptic-orthodox','armenian-apostolic','ethiopian-orthodox','syriac-orthodox']){
 const entry=policy[tradition];
 if(entry?.engine==='byzantine-paschalion')errors.push(`${tradition} must not use the Byzantine engine`);
 if(entry?.publicationStatus!=='staging-only')errors.push(`${tradition} must remain staging-only until its dedicated rules pass validation`);
}

if(policy['greek-orthodox']?.engine!=='byzantine-paschalion')errors.push('Greek Orthodox policy must use the Byzantine Paschalion');
if(policy['eastern-orthodox']?.engine!=='byzantine-paschalion')errors.push('Eastern Orthodox policy must use the Byzantine Paschalion');
if(policy['roman-catholic']?.engine!=='western-gregorian')errors.push('Roman Catholic policy must use Western Gregorian computus');
if(policy.anglican?.engine!=='western-gregorian')errors.push('Anglican policy must use Western Gregorian computus');

function iso(date){return date.toISOString().slice(0,10)}
function addDays(date,days){const next=new Date(date);next.setUTCDate(next.getUTCDate()+days);return next}
function gregorianEaster(year){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;return new Date(Date.UTC(year,month-1,day))}
function orthodoxEaster(year){const a=year%4,b=year%7,c=year%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,month=Math.floor((d+e+114)/31),day=(d+e+114)%31+1,julian=new Date(Date.UTC(year,month-1,day)),shift=Math.floor(year/100)-Math.floor(year/400)-2;return addDays(julian,shift)}

if(iso(gregorianEaster(2026))!=='2026-04-05')errors.push('Gregorian Easter regression for 2026');
if(iso(orthodoxEaster(2026))!=='2026-04-12')errors.push('Orthodox Pascha regression for 2026');

if(errors.length){
 console.error(`Calendar engine audit failed with ${errors.length} error(s):`);
 for(const error of errors)console.error(`- ${error}`);
 process.exit(1);
}

console.log(`Calendar engine audit passed for ${traditions.length} traditions.`);

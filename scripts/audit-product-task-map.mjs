import fs from 'node:fs';
const map=JSON.parse(fs.readFileSync('docs/product/requirements-task-map.json','utf8'));
const errors=[];
let sections=0;
const known=new Set(map.referencedTaskIds);
for(const [kind,sources] of Object.entries({json:map.jsonSources,markdown:map.documentSources})){
 for(const [file,entry] of Object.entries(sources)){
  const source=fs.readFileSync(file,'utf8');
  const actual=kind==='json'?Object.keys(JSON.parse(source)):[...source.matchAll(/^## (.+)$/gm)].map(m=>m[1]);
  const owned=Object.keys(entry.sections);
  const ignored=Object.keys(entry.nonRequirementSections??{});
  for(const key of actual)if(!owned.includes(key)&&!ignored.includes(key))errors.push(`${file}: unowned section ${key}`);
  for(const key of [...owned,...ignored])if(!actual.includes(key))errors.push(`${file}: stale section ${key}`);
  for(const [key,ids] of Object.entries(entry.sections)){
   if(!Array.isArray(ids)||!ids.length||ids.some(id=>!/^E\d{2}\.\d{2}$/.test(id)||!known.has(id)))errors.push(`${file}: invalid task ownership for ${key}`);
   sections++;
  }
 }
}
console.log(JSON.stringify({ok:!errors.length,sources:Object.keys(map.jsonSources).length+Object.keys(map.documentSources).length,sections,taskIds:known.size,errors},null,2));
if(errors.length)process.exitCode=1;

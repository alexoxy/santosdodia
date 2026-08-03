import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const output=path.join(os.tmpdir(),`santosdia-calendar-${process.pid}.sql`);
const result=spawnSync(process.execPath,[
  'scripts/build-calendar-staging-sql.mjs',
  '--input','test/fixtures/calendar-staging.valid.json',
  '--output',output
],{encoding:'utf8'});

if(result.status!==0){
 console.error(result.stdout);
 console.error(result.stderr);
 process.exit(result.status??1);
}

const sql=fs.readFileSync(output,'utf8');
const required=[
 'BEGIN IMMEDIATE;',
 'INSERT OR REPLACE INTO calendar_import_runs',
 'INSERT OR REPLACE INTO calendar_sources',
 'INSERT OR REPLACE INTO jurisdiction_calendar_policies',
 'INSERT OR REPLACE INTO calendar_rules',
 'INSERT OR REPLACE INTO calendar_occurrences',
 'INSERT OR REPLACE INTO calendar_occurrence_labels',
 "'2026-04-12'",
 "'Páscoa Ortodoxa'",
 'COMMIT;'
];
const missing=required.filter(token=>!sql.includes(token));
if(missing.length){
 console.error(`Generated SQL is missing ${missing.length} required token(s):`);
 for(const token of missing)console.error(`- ${token}`);
 process.exit(1);
}

const unsafe={...JSON.parse(fs.readFileSync('test/fixtures/calendar-staging.valid.json','utf8'))};
unsafe.run={...unsafe.run,status:'provisional'};
const unsafePath=path.join(os.tmpdir(),`santosdia-calendar-unsafe-${process.pid}.json`);
fs.writeFileSync(unsafePath,JSON.stringify(unsafe),'utf8');
const rejected=spawnSync(process.execPath,[
 'scripts/build-calendar-staging-sql.mjs','--input',unsafePath,'--output',`${output}.unsafe`
],{encoding:'utf8'});
if(rejected.status===0){
 console.error('Generator accepted a provisional run containing publishable data.');
 process.exit(1);
}

fs.rmSync(output,{force:true});
fs.rmSync(unsafePath,{force:true});
fs.rmSync(`${output}.unsafe`,{force:true});
console.log('Calendar staging SQL generator tests passed.');

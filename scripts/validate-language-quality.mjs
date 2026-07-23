import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';

const CATALOG=path.resolve('data/generated/translation-catalog.json');
const AUTHORITIES=path.resolve('data/language-authorities.json');
const OUTPUT=path.resolve('data/generated/translation-quality.json');
const CYRILLIC=/[\u0400-\u052f]/u;
const GREEK=/[\u0370-\u03ff\u1f00-\u1fff]/u;
const OTHER=/[\u0530-\u058f\u0600-\u074f\u1200-\u137f\u2c80-\u2cff]/u;
const LATIN=/[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]/u;
const ENGLISH=/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu;

async function json(file,fallback){try{return JSON.parse(await readFile(file,'utf8'))}catch{return fallback}}
function issues(value,locale){
 const out=[];
 if(!value||!/[\p{L}]/u.test(value))out.push('empty-or-nonlexical');
 if(/[�]/u.test(value))out.push('replacement-character');
 if(locale==='ru'){
  if(GREEK.test(value)||OTHER.test(value)||LATIN.test(value)&&!CYRILLIC.test(value))out.push('foreign-script');
 }else if(CYRILLIC.test(value)||GREEK.test(value)||OTHER.test(value))out.push('foreign-script');
 if(locale!=='en'&&ENGLISH.test(value))out.push('english-liturgical-vocabulary');
 return out;
}

const catalog=await json(CATALOG,{entries:{}});
const authorities=await json(AUTHORITIES,{});
const critical=[];
const coverage={};
for(const locale of Object.keys(authorities))coverage[locale]={labels:0,authority:authorities[locale]};
for(const[entryKey,entry]of Object.entries(catalog.entries??{})){
 for(const[locale,label]of Object.entries(entry.labels??{})){
  coverage[locale]??={labels:0};coverage[locale].labels++;
  const found=issues(label,locale);if(found.length)critical.push({entry:entryKey,locale,label,issues:found});
 }
}
const report={generatedAt:new Date().toISOString(),catalogGeneratedAt:catalog.generatedAt??null,entries:Object.keys(catalog.entries??{}).length,critical,coverage};
await mkdir(path.dirname(OUTPUT),{recursive:true});
await writeFile(OUTPUT,`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(`Language quality: ${report.entries} entries, ${critical.length} critical issues.`);
if(critical.length)process.exitCode=1;

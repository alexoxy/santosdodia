import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';

const INPUT=path.resolve('data/generated/translation-catalog.json');
const OUTPUT=path.resolve('data/generated/languagetool-audit.json');
const ENDPOINT=process.env.LANGUAGE_TOOL_URL;
const LANGUAGE={en:'en-GB',es:'es',pt:'pt-PT',fr:'fr',ru:'ru',de:'de-DE',it:'it',pl:'pl'};

async function json(file,fallback){try{return JSON.parse(await readFile(file,'utf8'))}catch{return fallback}}
async function check(locale,labels){
 if(!ENDPOINT||!LANGUAGE[locale]||!labels.length)return{enabled:false,matches:[]};
 const text=labels.slice(0,350).join('\n');
 const body=new URLSearchParams({text,language:LANGUAGE[locale]});
 try{
  const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'SantosDoDia-LanguageAudit/1.0'},body,signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const data=await response.json();
  return{enabled:true,matches:(data.matches??[]).slice(0,250).map(match=>({message:match.message,offset:match.offset,length:match.length,rule:match.rule?.id,category:match.rule?.category?.id,replacements:(match.replacements??[]).slice(0,5).map(item=>item.value)}))};
 }catch(error){return{enabled:true,error:error instanceof Error?error.message:String(error),matches:[]}}
}

const catalog=await json(INPUT,{entries:{}});const byLocale={};
for(const entry of Object.values(catalog.entries??{}))for(const[locale,label]of Object.entries(entry.labels??{})){byLocale[locale]??=[];byLocale[locale].push(label)}
const locales={};for(const locale of Object.keys(LANGUAGE))locales[locale]=await check(locale,[...new Set(byLocale[locale]??[])]);
await mkdir(path.dirname(OUTPUT),{recursive:true});await writeFile(OUTPUT,`${JSON.stringify({generatedAt:new Date().toISOString(),locales},null,2)}\n`,'utf8');
console.log('LanguageTool advisory audit completed.');

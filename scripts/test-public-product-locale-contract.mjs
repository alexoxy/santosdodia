// Public-language promises are product contracts: never downgrade them to best-effort fallbacks.
import assert from 'node:assert/strict';
import fs from 'node:fs';

function source(file){return fs.readFileSync(file,'utf8')}
function objectBlock(text,marker){
 const start=text.indexOf(marker);assert.ok(start>=0,`Missing ${marker}`);
 const open=text.indexOf('{',start);assert.ok(open>=0,`Missing object for ${marker}`);
 let depth=0,quote=null,escape=false;
 for(let index=open;index<text.length;index+=1){
  const char=text[index];
  if(quote){if(escape)escape=false;else if(char==='\\')escape=true;else if(char===quote)quote=null;continue}
  if(char==="'"||char==='"'||char==='`'){quote=char;continue}
  if(char==='{')depth+=1;
  if(char==='}'){depth-=1;if(depth===0)return text.slice(open,index+1)}
 }
 throw new Error(`Unclosed object for ${marker}`);
}
function keys(block){return [...block.matchAll(/(?:^|[,\n]\s*)([A-Za-z][A-Za-z0-9]*):/g)].map(match=>match[1]).sort()}

const i18n=source('lib/i18n.ts');
assert.match(i18n,/PUBLIC_LOCALES\s*=\s*\['en','es','pt','fr','it'\]/);
const enUi=objectBlock(i18n,'const en=');
const itUi=objectBlock(i18n,'const it:UiCopy=');
assert.deepEqual(keys(itUi),keys(enUi),'Italian UI copy must implement every English UI key explicitly.');
assert.doesNotMatch(i18n,/const it:UiCopy=\{\.\.\.en/,'Italian UI must never inherit English wholesale.');
assert.match(itUi,/noObservances:'Non sono ancora disponibili ricorrenze verificate per questa data\.'/);
assert.match(itUi,/romanCatholic:'Cattolica romana'/);

const feature=source('lib/feature-copy.ts');
const enFeature=objectBlock(feature,'const en:FeatureCopy=');
const itFeature=objectBlock(feature,'const it:FeatureCopy=');
assert.deepEqual(keys(itFeature),keys(enFeature),'Italian feature copy must implement every product feature key.');
assert.match(feature,/locale==='it'\?it:en/,'Italian feature copy must be selected before English fallback.');
assert.match(itFeature,/navFind:'Trova una ricorrenza'/);

const scope=source('lib/observance-scope.ts');
assert.match(scope,/it:'Universale in questa Chiesa'/);
assert.match(scope,/it:'Celebrata in questo Paese'/);

const content=source('lib/content-locale.ts');
assert.match(content,/it:\(name,date\)=>`Celebrazione cristiana di \$\{name\}, commemorata il \$\{date\}\.`/);
assert.doesNotMatch(content,/Testo della fonte in inglese/,'Italian UI must not advertise or emit English summary fallback.');
assert.match(content,/it:'Sintesi generata da dati strutturati verificati'/);

const priority=source('data/priority-observances.ts');
assert.match(priority,/id:'clare-assisi'/);
assert.match(priority,/month:8,\s*day:11/);
assert.match(priority,/it:'Santa Chiara d’Assisi'/);
assert.match(priority,/it:'Memoria cattolica romana di Santa Chiara d’Assisi, vergine e fondatrice delle Clarisse, celebrata l’11 agosto\.'/);
assert.match(priority,/validationStatus:'verified'/);

const publicObservances=source('lib/public-observances.ts');
assert.match(publicObservances,/getPriorityObservancesForDate/,'Today fallback must include priority verified observances.');
assert.match(publicObservances,/getPriorityObservances\(year, locale, filters\)/,'Calendar/search fallback must include priority verified observances.');

for(const route of ['app/api/v1/observances/route.ts','app/api/v1/search/route.ts','app/api/v1/today/route.ts','app/api/ical/[feed]/route.ts']){
 const text=source(route);assert.match(text,/localizedSummary/ ,`${route} must use the locale-safe summary contract.`);
 assert.doesNotMatch(text,/summaries\?\.\[locale\]\s*\?\?\s*item\.summary/,`${route} reintroduced English summary fallback.`);
}

const chrome=source('app/components/SiteChrome.tsx');
assert.match(chrome,/PUBLIC_LOCALES\.map/,'The public language selector must show only complete locales.');
assert.doesNotMatch(chrome,/SUPPORTED_LOCALES\.map/,'Incomplete locales must not be advertised as public-complete.');

const institutionalPage=source('app/components/InstitutionalPage.tsx');
const italianInstitutional=source('lib/institutional-copy-it.ts');
assert.match(institutionalPage,/locale==='it'\?italianInstitutionalCopy/);
for(const phrase of ['Termini di utilizzo','Domande frequenti','Correzioni e richieste relative ai diritti','Tutto il contenuto appare nella lingua selezionata?'])assert.ok(italianInstitutional.includes(phrase),`Missing Italian institutional product copy: ${phrase}`);

const localeCoverage=source('lib/locale-coverage.ts');
assert.match(localeCoverage,/"complete" \| "internal-review"/);
assert.doesNotMatch(localeCoverage,/return "complete";/,'Locale coverage must not mark every internal language complete.');

console.log('Public product locale contract passed: Italian is end-to-end and 11 August has verified Saint Clare fallback.');

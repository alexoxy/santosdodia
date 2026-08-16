#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildPortugalD1ReleaseV2 } from './roman-catholic-d1-release-v2.mjs';

function dates2026() {
  const dates=[]; const current=new Date('2026-01-01T00:00:00Z');
  while(current.getUTCFullYear()===2026){ dates.push(current.toISOString().slice(0,10)); current.setUTCDate(current.getUTCDate()+1); }
  return dates;
}
const locales=['en','pt','es','fr','it'];
const dates=dates2026();
const occurrences=[];
for(let index=0;index<365;index+=1){
  const dateISO=dates[index];
  const canonicalEventId=`rc:Fixture${String(index+1).padStart(3,'0')}`;
  occurrences.push({
    sourceOccurrenceId:`source-${index}`, dateISO, canonicalEventId, category:'feast', rank:'weekday',
    labels:Object.fromEntries(locales.map((locale)=>[locale,{label:`${locale.toUpperCase()} ${canonicalEventId}`,source:locale==='pt'?'portugal-national-liturgy-secretariat':locale==='es'?'romcal-general-roman-es':'litcal-api',translationStatus:'source',sourceLocale:locale}])),
    source:{occurrenceAssertion:true,sourceRecordHash:`record-${index}`}, decisionId:null,
  });
}
for(let index=0;index<24;index+=1){
  const dateISO=dates[index]; const canonicalEventId=`rc-pt:Proper${String(index+1).padStart(3,'0')}`;
  occurrences.push({
    sourceOccurrenceId:`proper-${index}`, dateISO, canonicalEventId, category:'saint', rank:'optional-memorial',
    labels:{
      pt:{label:`PT ${canonicalEventId}`,source:'portugal-national-liturgy-secretariat',translationStatus:'source',sourceLocale:'pt'},
      en:{label:`EN ${canonicalEventId}`,source:'santosdia-reviewed-calendar-localization',translationStatus:'reviewed',sourceLocale:'pt'},
      es:{label:`ES ${canonicalEventId}`,source:'santosdia-reviewed-calendar-localization',translationStatus:'reviewed',sourceLocale:'pt'},
      fr:{label:`FR ${canonicalEventId}`,source:'santosdia-reviewed-calendar-localization',translationStatus:'reviewed',sourceLocale:'pt'},
      it:{label:`IT ${canonicalEventId}`,source:'santosdia-reviewed-calendar-localization',translationStatus:'reviewed',sourceLocale:'pt'},
    },
    source:{occurrenceAssertion:true,sourceRecordHash:`proper-record-${index}`}, decisionId:`decision-${index}`,
  });
}
const report={
  build:'roman-catholic-pt-overlay-v2', year:2026, productionWriteAllowed:false,
  calendarCoverage:{occurrences:389,coveredDays:365},
  localeCompleteness:Object.fromEntries(locales.map((locale)=>[locale,{completeness:1}])),
  productReadiness:{stagingReady:true,productionApproved:false,productionWriteAllowed:false,labelCount:1945},
  occurrences,
};
const path='/Santos do Dia/02_Dados_Eclesiasticos/Calendar/releases/roman-catholic-pt-2026-v2/manifest.json';
const result=buildPortugalD1ReleaseV2({report,dropboxManifestPath:path,publicationStatus:'publishable',generatedAt:'2026-08-16T23:55:00.000Z'});
assert.equal(result.manifest.release,'roman-catholic-pt-2026-v2');
assert.equal(result.manifest.expectedOccurrences,389);
assert.equal(result.manifest.expectedDays,365);
assert.equal(result.manifest.expectedLabels,1945);
assert.equal(result.manifest.expectedCalendarAssertions,389);
assert.equal(result.manifest.expectedLabelAssertions,1945);
assert.equal(result.manifest.publicationStatus,'publishable');
assert.equal(result.manifest.safety.productionApproved,false);
assert.equal(result.manifest.safety.stagingOnly,true);
assert.equal(result.manifest.provenancePolicy.generalRomanAndRomcalNeverAssertTransferredPortugalDates,true);
assert.match(result.sql,/DELETE FROM calendar_occurrences WHERE church_id='roman-catholic' AND jurisdiction_id='pt'/u);
assert.equal((result.sql.match(/INSERT INTO calendar_occurrences \(/gu)??[]).length,389);
assert.equal((result.sql.match(/INSERT INTO calendar_occurrence_labels \(/gu)??[]).length,1945);
assert.equal((result.sql.match(/INSERT INTO calendar_occurrence_assertions \(/gu)??[]).length,389);
assert.equal((result.sql.match(/calendar_occurrence_assertions[^\n]*litcal-api/gu)??[]).length,0);
assert.equal((result.sql.match(/calendar_occurrence_assertions[^\n]*romcal-general-roman-es/gu)??[]).length,0);
assert.equal(new Set(occurrences.map((item)=>`${item.dateISO}|${item.canonicalEventId}`)).size,389);

const bad=structuredClone(report); bad.occurrences[0].labels.es=null;
assert.throws(()=>buildPortugalD1ReleaseV2({report:bad,dropboxManifestPath:path}),/missing validated es label provenance/u);
const unsafe=structuredClone(report); unsafe.productReadiness.productionApproved=true;
assert.throws(()=>buildPortugalD1ReleaseV2({report:unsafe,dropboxManifestPath:path}),/production still gated/u);
assert.throws(()=>buildPortugalD1ReleaseV2({report,dropboxManifestPath:path,publicationStatus:'published'}),/staging-only until a separate production approval gate exists/u);

console.log('Portugal v2 D1 package preserves 389 observances, five labels each, SNL-only Portugal date assertions and cannot generate a published release.');

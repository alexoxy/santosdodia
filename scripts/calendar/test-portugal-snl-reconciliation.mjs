#!/usr/bin/env node

import assert from 'node:assert/strict';
import { reconcilePortugalSnl } from './reconcile-portugal-snl.mjs';

function snl(id,dateISO,label,rank='') {
  return { id, canonicalEventId:`source:snl-pt:${id}`, dateISO, names:{pt:{value:label,status:'source',sourceLocale:'pt'}}, sourceFacts:{uid:`${id}@liturgia.pt`,description:rank} };
}
function roman(id,dateISO,name,grade=null) {
  return { id, canonicalEventId:`rc:${id}`, dateISO, grade,
    rank:grade==='Solemnity'?'solemnity':grade==='Feast'?'feast':grade==='Memorial'?'memorial':grade==='Optional Memorial'?'optional-memorial':grade==='Weekday'?'weekday':null,
    names:{en_US:name} };
}

const snlPackage={run:{publicationAllowed:false,promotionAllowed:false},events:[
  snl('peter-paul','2026-06-29','Santos Pedro e Paulo, apóstolos','SOLENIDADE'),
  snl('teresa-rank','2026-10-15','S. Teresa de Ávila','SOLENIDADE'),
  snl('immaculate','2026-12-09','Imaculada Conceição da Virgem Santa Maria','SOLENIDADE'),
  snl('proper','2026-07-01','Beato Exemplo Português','MO'),
  snl('ambiguous','2026-09-30','S. Teresa','MO'),
  snl('juan-diego','2026-12-09','S. João Diogo','MF'),
  snl('saturday-mary','2026-06-06','Santa Maria no Sábado','MF'),
  snl('anthony-lisbon','2026-06-13','S. António de Lisboa, presbítero e doutor da Igreja, Padroeiro de Portugal','FESTA'),
  snl('hilary','2026-01-13','S. Hilário, bispo e doutor da Igreja','MF'),
]};
const generalRoman=[
  roman('StsPeterPaulApostles','2026-06-29','Saints Peter and Paul, Apostles','Solemnity'),
  roman('StTeresaAvila','2026-10-15','Saint Teresa of Avila','Feast'),
  roman('ImmaculateConception','2026-12-08','Immaculate Conception of the Blessed Virgin Mary','Solemnity'),
  roman('OrdinaryWeekdayJul01','2026-07-01','Wednesday of the Thirteenth Week in Ordinary Time','Weekday'),
  roman('StTeresaExampleA','2026-09-30','Saint Teresa Example','Memorial'),
  roman('StTeresaExampleB','2026-09-30','Saint Teresa Another Example','Memorial'),
  roman('JuanDiego','2026-12-09','Saint Juan Diego','Optional Memorial'),
  roman('SatMemBVM3','2026-06-06','Saturday Memorial of the Blessed Virgin Mary','Optional Memorial'),
  roman('StNorbert','2026-06-06','Saint Norbert, Bishop','Optional Memorial'),
  roman('StAnthonyPadua','2026-06-13','Saint Anthony of Padua, Priest and Doctor of the Church','Memorial'),
  roman('ImmaculateHeart','2026-06-13','Immaculate Heart of Mary','Memorial'),
  roman('StHilaryPoitiers','2026-01-13','Saint Hilary, Bishop and Doctor of the Church','Optional Memorial'),
  roman('OrdWeekday1Tuesday','2026-01-13','Tuesday of the First Week in Ordinary Time','Weekday'),
];

const result=reconcilePortugalSnl({snlPackage,generalRoman});
assert.equal(result.mode,'proposal-only');
assert.equal(result.productionWriteAllowed,false);
assert.equal(result.automaticLinkAllowed,false);
assert.equal(result.summary.inputOccurrences,9);
assert.ok(result.items.every((item)=>item.reviewRequired===true&&item.automaticLinkAllowed===false));

const byId=(id)=>result.items.find((item)=>item.sourceOccurrenceId===id);
assert.equal(byId('peter-paul').disposition,'canonical-link-proposal');
assert.equal(byId('peter-paul').candidate.canonicalEventId,'rc:StsPeterPaulApostles');
assert.equal(byId('teresa-rank').disposition,'rank-delta-review');
assert.equal(byId('immaculate').disposition,'transfer-candidate-review');
assert.equal(byId('immaculate').candidate.dateDistanceDays,1);
assert.equal(byId('proper').disposition,'structural-review');
assert.equal(byId('ambiguous').disposition,'ambiguous-review');

assert.equal(byId('juan-diego').disposition,'canonical-link-proposal');
assert.equal(byId('juan-diego').candidate.generalRomanId,'JuanDiego');
assert.ok(byId('juan-diego').candidate.lexicalScore>=0.72);
assert.equal(byId('saturday-mary').disposition,'canonical-link-proposal');
assert.equal(byId('saturday-mary').candidate.generalRomanId,'SatMemBVM3');
assert.equal(byId('saturday-mary').candidate.matchingBasis,'reviewed-semantic-alias');
assert.equal(byId('anthony-lisbon').candidate.generalRomanId,'StAnthonyPadua');
assert.equal(byId('anthony-lisbon').candidate.matchingBasis,'reviewed-semantic-alias');
assert.equal(byId('anthony-lisbon').disposition,'rank-delta-review');
assert.equal(byId('hilary').disposition,'canonical-link-proposal');
assert.equal(byId('hilary').candidate.generalRomanId,'StHilaryPoitiers');

const unsafe=structuredClone(snlPackage); unsafe.run.publicationAllowed=true;
assert.throws(()=>reconcilePortugalSnl({snlPackage:unsafe,generalRoman}),/staging-only/u);
console.log('Portugal multilingual semantic reconciliation tests passed.');

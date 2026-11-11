#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadGeneralRomanReference, reconcilePortugalSnl } from './reconcile-portugal-snl.mjs';

function snl(id,dateISO,label,rank='') {
  return { id, canonicalEventId:`source:snl-pt:${id}`, dateISO, names:{pt:{value:label,status:'source',sourceLocale:'pt'}}, sourceFacts:{uid:`${id}@liturgia.pt`,description:rank} };
}
function canonicalRank(grade) {
  const value=String(grade??'').toLowerCase();
  if(value.includes('solemn')) return 'solemnity';
  if(value.includes('feast')) return 'feast';
  if(value.includes('optional')) return 'optional-memorial';
  if(value.includes('memorial')) return 'memorial';
  if(value.includes('weekday')) return 'weekday';
  return null;
}
function roman(id,dateISO,name,grade=null) {
  return { id, canonicalEventId:`rc:${id}`, dateISO, grade, rank:canonicalRank(grade), names:{en_US:name} };
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
  snl('lent-monday','2026-02-23','Segunda-feira da semana I'),
  snl('fidelis','2026-04-24','S. Fiel de Sigmaringa','MF'),
  snl('bernardine','2026-05-20','S. Bernardino de Sena','MF'),
  snl('rita','2026-05-22','S. Rita de Cássia','MF'),
  snl('augustine-canterbury','2026-05-27','S. Agostinho de Cantuária','MF'),
  snl('john-baptist-nativity','2026-06-24','Nascimento de São João Batista','SOLENIDADE'),
  snl('ignatius-loyola','2026-07-31','S. Inácio de Loiola','MO'),
  snl('louis-france','2026-08-25','S. Luís de França','MF'),
  snl('john-baptist-martyrdom','2026-08-29','Martírio de São João Batista','MO'),
  snl('mother-teresa','2026-09-05','S. Teresa de Calcutá','MF'),
  snl('lateran','2026-11-09','Dedicação da Basílica de Latrão','FESTA'),
  snl('elizabeth-hungary','2026-11-17','S. Isabel da Hungria','MO'),
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
  roman('LentWeekday1Monday','2026-02-23','Monday of the First Week of Lent','Weekday'),
  roman('StPolycarp','2026-02-23','Saint Polycarp, Bishop and Martyr','Memorial'),
  roman('StFidelisSigmaringen','2026-04-24','Saint Fidelis of Sigmaringen, Priest and Martyr','Optional Memorial'),
  roman('StBernardineSiena','2026-05-20','Saint Bernardine of Siena, Priest','Optional Memorial'),
  roman('StRitaCascia','2026-05-22','Saint Rita of Cascia, Religious','Optional Memorial'),
  roman('StAugustineCanterbury','2026-05-27','Saint Augustine of Canterbury, Bishop','Optional Memorial'),
  roman('NativityJohnBaptist','2026-06-24','The Nativity of Saint John the Baptist','Solemnity'),
  roman('StIgnatiusLoyola','2026-07-31','Saint Ignatius of Loyola, Priest','Memorial'),
  roman('StLouis','2026-08-25','Saint Louis','Optional Memorial'),
  roman('StJosephCalasanz','2026-08-25','Saint Joseph Calasanz, Priest','Optional Memorial'),
  roman('BeheadingJohnBaptist','2026-08-29','The Beheading of Saint John the Baptist, Martyr','Memorial'),
  roman('StMotherTeresa','2026-09-05','Saint Teresa of Calcutta, Virgin','Optional Memorial'),
  roman('DedicationLateran','2026-11-09','The Dedication of the Lateran Basilica','Feast'),
  roman('StElizabethHungary','2026-11-17','Saint Elizabeth of Hungary, Religious','Memorial'),
];

const result=reconcilePortugalSnl({snlPackage,generalRoman});
assert.equal(result.mode,'proposal-only');
assert.equal(result.productionWriteAllowed,false);
assert.equal(result.automaticLinkAllowed,false);
assert.equal(result.summary.inputOccurrences,snlPackage.events.length);
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
assert.equal(byId('saturday-mary').candidate.generalRomanId,'SatMemBVM3');
assert.equal(byId('saturday-mary').candidate.matchingBasis,'reviewed-semantic-alias');
assert.equal(byId('anthony-lisbon').candidate.generalRomanId,'StAnthonyPadua');
assert.equal(byId('anthony-lisbon').disposition,'rank-delta-review');
assert.equal(byId('hilary').candidate.generalRomanId,'StHilaryPoitiers');

assert.equal(byId('lent-monday').disposition,'canonical-link-proposal');
assert.equal(byId('lent-monday').candidate.generalRomanId,'LentWeekday1Monday');
assert.equal(byId('lent-monday').candidate.matchingBasis,'same-date-structural-day-inheritance');
for (const [id,canonicalId] of [
  ['fidelis','StFidelisSigmaringen'],
  ['bernardine','StBernardineSiena'],
  ['rita','StRitaCascia'],
  ['augustine-canterbury','StAugustineCanterbury'],
  ['john-baptist-nativity','NativityJohnBaptist'],
  ['ignatius-loyola','StIgnatiusLoyola'],
  ['louis-france','StLouis'],
  ['john-baptist-martyrdom','BeheadingJohnBaptist'],
  ['mother-teresa','StMotherTeresa'],
  ['lateran','DedicationLateran'],
  ['elizabeth-hungary','StElizabethHungary'],
]) {
  assert.equal(byId(id).candidate.generalRomanId,canonicalId,`${id} candidate`);
  assert.equal(byId(id).disposition,'canonical-link-proposal',`${id} should inherit General Roman semantics`);
}

// The operational mirror can lag normative decrees. Higher Holy See authority corrects the
// General Roman reference before Portugal comparison, so these never become false PT deltas.
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'santosdia-roman-authority-'));
try {
  const yearDir=path.join(temporary,'2026'); fs.mkdirSync(yearDir,{recursive:true});
  fs.writeFileSync(path.join(yearDir,'en_US.json'),JSON.stringify({events:[
    {id:'StMaryMagdalene',name:'Saint Mary Magdalene',dateISO:'2026-07-22',grade:'Memorial'},
    {id:'OrdWeekday27Friday',name:'Friday of the 27th Week of Ordinary Time',dateISO:'2026-10-09',grade:'weekday'},
  ]}));
  const corrected=loadGeneralRomanReference(temporary,[2026]);
  const magdalene=corrected.find((item)=>item.id==='StMaryMagdalene');
  const newman=corrected.find((item)=>item.id==='StJohnHenryNewman');
  assert.equal(magdalene.rank,'feast');
  assert.ok(magdalene.authorityCorrection?.source.includes('vatican.va'));
  assert.equal(newman.dateISO,'2026-10-09');
  assert.equal(newman.rank,'optional-memorial');
  assert.ok(newman.authorityCorrection?.source.includes('vatican.va'));

  const authorityResult=reconcilePortugalSnl({
    snlPackage:{run:{publicationAllowed:false,promotionAllowed:false},events:[
      snl('magdalene','2026-07-22','S. Maria Madalena','FESTA'),
      snl('newman','2026-10-09','S. João Henrique Newman, presbítero e doutor da Igreja','MF'),
    ]},
    generalRoman:corrected,
  });
  const authorityById=(id)=>authorityResult.items.find((item)=>item.sourceOccurrenceId===id);
  assert.equal(authorityById('magdalene').disposition,'canonical-link-proposal');
  assert.equal(authorityById('magdalene').candidate.generalRomanId,'StMaryMagdalene');
  assert.equal(authorityById('newman').disposition,'canonical-link-proposal');
  assert.equal(authorityById('newman').candidate.generalRomanId,'StJohnHenryNewman');
  assert.ok(authorityById('newman').candidate.authorityCorrection?.source.includes('vatican.va'));
} finally {
  fs.rmSync(temporary,{recursive:true,force:true});
}

const unsafe=structuredClone(snlPackage); unsafe.run.publicationAllowed=true;
assert.throws(()=>reconcilePortugalSnl({snlPackage:unsafe,generalRoman}),/staging-only/u);
console.log('Portugal delta reduction and General Roman authority correction tests passed.');

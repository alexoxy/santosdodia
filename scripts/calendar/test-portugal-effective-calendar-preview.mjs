#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildPortugalEffectiveCalendarPreview } from './build-portugal-effective-calendar-preview.mjs';

function source(id, dateISO, label) {
  return {
    id,
    dateISO,
    names: { pt: { value: label } },
    sourceRecordHash: 'a'.repeat(64),
    sourceFacts: { uid: `${id}@liturgia.pt` },
  };
}
function rec(id, dateISO, label, disposition, candidate = null, sourceRank = null) {
  return {
    sourceOccurrenceId: id,
    dateISO,
    sourceLabel: label,
    sourceRank,
    disposition,
    candidate,
  };
}
function candidate(id, dateISO, rank = 'memorial') {
  return { canonicalEventId: `rc:${id}`, generalRomanId: id, generalRomanDateISO: dateISO, generalRomanRank: rank };
}

const normalized = {
  packageId: 'portugal-snl-test',
  run: { publicationAllowed: false, promotionAllowed: false },
  events: [
    source('inherited', '2026-04-29', 'S. Catarina de Sena'),
    source('epiphany-destination', '2026-01-04', 'DOMINGO – EPIFANIA DO SENHOR – SOLENIDADE'),
    source('epiphany-origin', '2026-01-06', 'Terça-feira depois da Epifania'),
    source('proper', '2026-02-07', 'As Cinco Chagas do Senhor'),
    source('rank', '2026-07-11', 'S. Bento, Abade, Padroeiro da Europa'),
  ],
};
const reconciliation = {
  mode: 'proposal-only',
  productionWriteAllowed: false,
  items: [
    rec('inherited', '2026-04-29', 'S. Catarina de Sena', 'canonical-link-proposal', candidate('StCatherineSiena','2026-04-29','memorial'), 'memorial'),
    rec('epiphany-destination', '2026-01-04', 'DOMINGO – EPIFANIA DO SENHOR – SOLENIDADE', 'transfer-candidate-review', candidate('Epiphany','2026-01-06','solemnity'), 'solemnity'),
    rec('epiphany-origin', '2026-01-06', 'Terça-feira depois da Epifania', 'precedence-delta-review', candidate('Epiphany','2026-01-06','solemnity')),
    rec('proper', '2026-02-07', 'As Cinco Chagas do Senhor', 'precedence-delta-review', candidate('OrdWeekday4Saturday','2026-02-07','weekday'), 'feast'),
    rec('rank', '2026-07-11', 'S. Bento, Abade, Padroeiro da Europa', 'rank-delta-review', candidate('StBenedict','2026-07-11','memorial'), 'feast'),
  ],
};
const pendingPlan = {
  year: 2026,
  status: 'prepared-human-approval-required',
  approved: false,
  productionWriteAllowed: false,
  decisions: [
    {
      id:'epiphany', type:'date-transfer', canonicalEventId:'rc:Epiphany', fromDate:'2026-01-06', toDate:'2026-01-04', rank:'solemnity',
      sourceLabels:['DOMINGO – EPIFANIA DO SENHOR – SOLENIDADE','Terça-feira depois da Epifania'], coversBlockingDates:['2026-01-04','2026-01-06'],
      replacementAtOrigin:{ canonicalEventId:'rc-pt:TuesdayAfterEpiphany', category:'feast', labels:{pt:'Terça-feira depois da Epifania',en:'Tuesday after Epiphany',es:'Martes después de la Epifanía',fr:'Mardi après l’Épiphanie',it:'Martedì dopo l’Epifania'} },
      decision:'pending-human-approval',
    },
    {
      id:'five-wounds', type:'portugal-proper-observance', canonicalEventId:'rc-pt:FiveWoundsLord', dateISO:'2026-02-07', rank:'feast',
      sourceLabel:'As Cinco Chagas do Senhor', coversBlockingDates:['2026-02-07'], labels:{pt:'As Cinco Chagas do Senhor',en:'The Five Wounds of the Lord',es:'Las Cinco Llagas del Señor',fr:'Les Cinq Plaies du Seigneur',it:'Le Cinque Piaghe del Signore'}, decision:'pending-human-approval',
    },
    {
      id:'benedict', type:'rank-override', canonicalEventId:'rc:StBenedict', dateISO:'2026-07-11', rank:'feast',
      sourceLabel:'S. Bento, Abade, Padroeiro da Europa', coversBlockingDates:['2026-07-11'], decision:'pending-human-approval',
    },
  ],
};

const preview = buildPortugalEffectiveCalendarPreview({ normalized, reconciliation, reviewPlan: pendingPlan });
assert.equal(preview.publicationAllowed, false);
assert.equal(preview.productionWriteAllowed, false);
assert.equal(preview.summary.sourceOccurrences, 5);
assert.equal(preview.summary.uniqueDays, 4);
assert.equal(preview.summary.inheritedSafe, 1);
assert.equal(preview.summary.pendingReviewRows, 4);
assert.equal(preview.summary.preparedDecisionsUsed, 3);
assert.equal(preview.items.find((item)=>item.sourceOccurrenceId==='epiphany-destination').canonicalEventId, 'rc:Epiphany');
assert.equal(preview.items.find((item)=>item.sourceOccurrenceId==='epiphany-origin').canonicalEventId, 'rc-pt:TuesdayAfterEpiphany');
assert.equal(preview.items.find((item)=>item.sourceOccurrenceId==='proper').canonicalEventId, 'rc-pt:FiveWoundsLord');
assert.equal(preview.items.find((item)=>item.sourceOccurrenceId==='rank').rank, 'feast');
assert.ok(preview.items.filter((item)=>item.reviewStatus==='pending-human-approval').every((item)=>item.publicationAllowed===false));
assert.equal(preview.provenancePolicy.firstEventByCivilDateMatchingForbidden, true);

const approvedPlan = structuredClone(pendingPlan);
approvedPlan.approved = true;
approvedPlan.status = 'approved';
for (const decision of approvedPlan.decisions) decision.decision = 'approved';
const approvedPreview = buildPortugalEffectiveCalendarPreview({ normalized, reconciliation, reviewPlan: approvedPlan });
assert.equal(approvedPreview.publicationAllowed, true);
assert.equal(approvedPreview.productionWriteAllowed, false);

const incompletePlan = structuredClone(pendingPlan);
incompletePlan.decisions.pop();
assert.throws(() => buildPortugalEffectiveCalendarPreview({ normalized, reconciliation, reviewPlan: incompletePlan }), /exactly one prepared delta decision|fully consumed/u);

console.log('Effective Portugal calendar preview maps every SNL source occurrence, forbids date-only identity binding and remains fail-closed until explicit approval.');

#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildPortugalOverlayV2 } from './roman-catholic-pt-overlay-v2.mjs';

function dates2026() {
  const dates = [];
  const current = new Date('2026-01-01T00:00:00Z');
  while (current.getUTCFullYear() === 2026) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}
function mirrorEvent(id, dateISO, name, grade='weekday') { return { id, dateISO, name, grade }; }
function reviewDecision(id, canonicalEventId, labels=null) {
  return { id, canonicalEventId, decision:'approved', ...(labels ? { labels } : {}) };
}

const dates = dates2026();
const items = [];
const mirrorBase = [];
const romcalEnglish = [];
const romcalSpanish = [];

for (let index = 0; index < dates.length; index += 1) {
  const dateISO = dates[index];
  let id = `Event${String(index + 1).padStart(3, '0')}`;
  let name = `Event ${String(index + 1).padStart(3, '0')}`;
  let canonicalEventId = `rc:${id}`;
  let rank = 'weekday';
  let generalDate = dateISO;
  let decisionId = null;

  if (dateISO === '2026-02-07') {
    id = 'FiveWoundsLord';
    canonicalEventId = 'rc-pt:FiveWoundsLord';
    name = 'As Cinco Chagas do Senhor';
    rank = 'feast';
    decisionId = 'pt-2026-five-wounds';
  } else if (dateISO === '2026-05-17') {
    id = 'Ascension';
    canonicalEventId = 'rc:Ascension';
    name = 'Ascension of the Lord';
    rank = 'solemnity';
    generalDate = '2026-05-14';
    decisionId = 'pt-2026-ascension-transfer';
  } else if (dateISO === '2026-10-09') {
    id = 'StJohnHenryNewman';
    canonicalEventId = 'rc:StJohnHenryNewman';
    name = 'São João Henrique Newman, presbítero e Doutor da Igreja';
    rank = 'optional-memorial';
  }

  items.push({
    id:`effective-${index}`,
    sourceOccurrenceId:`source-${index}`,
    sourceUid:`uid-${index}`,
    dateISO,
    canonicalEventId,
    category: canonicalEventId.includes('FiveWounds') ? 'feast' : 'saint',
    rank,
    labels:{ pt:name },
    source:{ id:'portugal-national-liturgy-secretariat', sourceRecordHash:`hash-${index}`, occurrenceAssertion:true },
    generalRomanBinding: canonicalEventId.startsWith('rc:') ? { generalRomanId:id, generalRomanDateISO:generalDate } : null,
    resolution: decisionId ? 'approved-delta' : 'inherit-general',
    reviewStatus: decisionId ? 'approved' : 'inherited-safe',
    decisionId,
    publicationAllowed:false,
  });

  if (canonicalEventId.startsWith('rc:') && id !== 'StJohnHenryNewman') {
    mirrorBase.push(mirrorEvent(id, generalDate, name === 'São João Henrique Newman, presbítero e Doutor da Igreja' ? 'Saint John Henry Newman' : name, rank));
    const romcalId = `romcal_${id}`;
    romcalEnglish.push({ id:romcalId, dateISO:generalDate, name:name === 'Ascension of the Lord' ? 'Ascension of the Lord' : name, rank });
    romcalSpanish.push({ id:romcalId, dateISO:generalDate, name:`ES ${name}`, rank });
  }
}

// Add 24 secondary observances so the build proves it preserves 389 rows across 365 days.
for (let index = 0; index < 24; index += 1) {
  const dateISO = dates[index];
  const id = `Extra${String(index + 1).padStart(3, '0')}`;
  const name = `Extra ${String(index + 1).padStart(3, '0')}`;
  items.push({
    id:`effective-extra-${index}`,
    sourceOccurrenceId:`source-extra-${index}`,
    sourceUid:`uid-extra-${index}`,
    dateISO,
    canonicalEventId:`rc:${id}`,
    category:'saint',
    rank:'optional-memorial',
    labels:{ pt:name },
    source:{ id:'portugal-national-liturgy-secretariat', sourceRecordHash:`extra-hash-${index}`, occurrenceAssertion:true },
    generalRomanBinding:{ generalRomanId:id, generalRomanDateISO:dateISO },
    resolution:'inherit-general',
    reviewStatus:'inherited-safe',
    decisionId:null,
    publicationAllowed:false,
  });
  mirrorBase.push(mirrorEvent(id, dateISO, name, 'optional memorial'));
  const romcalId = `romcal_${id}`;
  romcalEnglish.push({ id:romcalId, dateISO, name, rank:'optional memorial' });
  romcalSpanish.push({ id:romcalId, dateISO, name:`ES ${name}`, rank:'optional memorial' });
}

const effective = {
  mode:'effective-portugal-calendar-preview', reviewPlanStatus:'approved-liturgical-decisions', publicationAllowed:true, productionWriteAllowed:false,
  summary:{ sourceOccurrences:389, uniqueDays:365, preparedDecisionsUsed:15 },
  items,
};
const properLabels = { pt:'As Cinco Chagas do Senhor', en:'The Five Wounds of the Lord', es:'Las Cinco Llagas del Señor', fr:'Les Cinq Plaies du Seigneur', it:'Le Cinque Piaghe del Signore' };
const decisions = [reviewDecision('pt-2026-five-wounds','rc-pt:FiveWoundsLord',properLabels), reviewDecision('pt-2026-ascension-transfer','rc:Ascension')];
for (let index = decisions.length; index < 15; index += 1) decisions.push(reviewDecision(`dummy-${index}`,`rc:Dummy${index}`));
const review = { status:'approved-liturgical-decisions', approved:true, productionWriteAllowed:false, decisions };
const mirrorPayload = (locale) => ({ events: mirrorBase.map((event) => ({ ...event, name: locale === 'fr' ? `FR ${event.name}` : locale === 'it' ? `IT ${event.name}` : event.name })) });
const result = buildPortugalOverlayV2({
  effective,
  review,
  mirrorPayloads:{ en:mirrorPayload('en'), fr:mirrorPayload('fr'), it:mirrorPayload('it') },
  romcalPayload:{ packageVersion:'test', pinnedSourceCommit:'test', english:romcalEnglish, spanish:romcalSpanish },
  year:2026,
  sourceCommit:'fixture',
});

assert.equal(result.build, 'roman-catholic-pt-overlay-v2');
assert.equal(result.productReadiness.stagingReady, true);
assert.equal(result.productReadiness.productionApproved, false);
assert.equal(result.productionWriteAllowed, false);
assert.equal(result.calendarCoverage.occurrences, 389);
assert.equal(result.calendarCoverage.coveredDays, 365);
assert.equal(result.calendarCoverage.multiObservanceDays, 24);
assert.equal(result.productReadiness.labelCount, 1945);
assert.ok(Object.values(result.localeCompleteness).every((value) => value.completeness === 1));
assert.equal(new Set(result.occurrences.map((item) => `${item.dateISO}|${item.canonicalEventId}`)).size, 389);

const ascension = result.occurrences.find((item) => item.canonicalEventId === 'rc:Ascension');
assert.equal(ascension.dateISO, '2026-05-17');
assert.equal(ascension.generalRomanBinding.generalRomanDateISO, '2026-05-14');
assert.equal(ascension.labels.es.source, 'romcal-general-roman-es');
assert.equal(ascension.labels.es.label, 'ES Ascension of the Lord');

const fiveWounds = result.occurrences.find((item) => item.canonicalEventId === 'rc-pt:FiveWoundsLord');
assert.deepEqual(Object.fromEntries(Object.entries(fiveWounds.labels).map(([locale, value]) => [locale, value.label])), properLabels);
assert.equal(fiveWounds.labels.en.translationStatus, 'reviewed');

const newman = result.occurrences.find((item) => item.canonicalEventId === 'rc:StJohnHenryNewman');
assert.equal(newman.labels.en.label, 'Saint John Henry Newman, Priest and Doctor of the Church');
assert.equal(newman.labels.es.label, 'San Juan Enrique Newman, presbítero y doctor de la Iglesia');

const unsafe = structuredClone(effective);
unsafe.productionWriteAllowed = true;
assert.throws(() => buildPortugalOverlayV2({ effective:unsafe, review, mirrorPayloads:{ en:mirrorPayload('en'), fr:mirrorPayload('fr'), it:mirrorPayload('it') }, romcalPayload:{ english:romcalEnglish, spanish:romcalSpanish }, year:2026 }), /not approved and release-build eligible/u);

console.log('Portugal v2 build preserves 389 observances, 365 days, event-level localization and separate production authority.');

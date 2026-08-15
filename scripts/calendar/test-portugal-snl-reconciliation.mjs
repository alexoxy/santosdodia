#!/usr/bin/env node

import assert from 'node:assert/strict';
import { reconcilePortugalSnl } from './reconcile-portugal-snl.mjs';

function snl(id, dateISO, label, description = '') {
  return {
    id,
    canonicalEventId: `source:snl-pt:${id}`,
    dateISO,
    names: { pt: { value: label, status: 'source', sourceLocale: 'pt' } },
    sourceFacts: { uid: `${id}@liturgia.pt`, description },
  };
}
function roman(id, dateISO, name, grade = null) {
  return {
    id,
    canonicalEventId: `rc:${id}`,
    dateISO,
    grade,
    rank: grade === 'Solemnity' ? 'solemnity' : grade === 'Feast' ? 'feast' : grade === 'Memorial' ? 'memorial' : grade === 'Weekday' ? 'weekday' : null,
    names: { en_US: name },
  };
}

const snlPackage = {
  run: { publicationAllowed: false, promotionAllowed: false },
  events: [
    snl('peter-paul', '2026-06-29', 'Santos Pedro e Paulo, apóstolos – SOLENIDADE'),
    snl('teresa-rank', '2026-10-15', 'S. Teresa de Ávila – SOLENIDADE'),
    snl('immaculate', '2026-12-09', 'Imaculada Conceição da Virgem Santa Maria – SOLENIDADE'),
    snl('portugal-proper', '2026-07-01', 'Beato Exemplo Português – MO'),
    snl('ambiguous', '2026-09-30', 'S. Teresa – MO'),
  ],
};

const generalRoman = [
  roman('StsPeterPaulApostles', '2026-06-29', 'Saints Peter and Paul, Apostles', 'Solemnity'),
  roman('StTeresaAvila', '2026-10-15', 'Saint Teresa of Avila', 'Feast'),
  roman('ImmaculateConception', '2026-12-08', 'Immaculate Conception of the Blessed Virgin Mary', 'Solemnity'),
  roman('OrdinaryWeekdayJul01', '2026-07-01', 'Wednesday of the Thirteenth Week in Ordinary Time', 'Weekday'),
  roman('StTeresaExampleA', '2026-09-30', 'Saint Teresa Example', 'Memorial'),
  roman('StTeresaExampleB', '2026-09-30', 'Saint Teresa Another Example', 'Memorial'),
];

const result = reconcilePortugalSnl({ snlPackage, generalRoman });
assert.equal(result.mode, 'proposal-only');
assert.equal(result.productionWriteAllowed, false);
assert.equal(result.automaticLinkAllowed, false);
assert.equal(result.summary.inputOccurrences, 5);
assert.ok(result.items.every((item) => item.reviewRequired === true && item.automaticLinkAllowed === false));

const peterPaul = result.items.find((item) => item.sourceOccurrenceId === 'peter-paul');
assert.equal(peterPaul.disposition, 'canonical-link-proposal');
assert.equal(peterPaul.candidate.canonicalEventId, 'rc:StsPeterPaulApostles');

const teresa = result.items.find((item) => item.sourceOccurrenceId === 'teresa-rank');
assert.equal(teresa.disposition, 'rank-delta-review');
assert.equal(teresa.candidate.canonicalEventId, 'rc:StTeresaAvila');

const immaculate = result.items.find((item) => item.sourceOccurrenceId === 'immaculate');
assert.equal(immaculate.disposition, 'transfer-candidate-review');
assert.equal(immaculate.candidate.canonicalEventId, 'rc:ImmaculateConception');
assert.equal(immaculate.candidate.dateDistanceDays, 1);

const proper = result.items.find((item) => item.sourceOccurrenceId === 'portugal-proper');
assert.equal(proper.disposition, 'structural-review');
assert.equal(proper.reason, 'single-general-roman-event-on-date-without-semantic-proof');

const ambiguous = result.items.find((item) => item.sourceOccurrenceId === 'ambiguous');
assert.equal(ambiguous.disposition, 'ambiguous-review');

const unsafe = structuredClone(snlPackage);
unsafe.run.publicationAllowed = true;
assert.throws(() => reconcilePortugalSnl({ snlPackage: unsafe, generalRoman }), /staging-only/u);

console.log('Portugal SNL event-level reconciliation tests passed.');

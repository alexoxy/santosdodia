#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildPortugalJurisdictionOverlayPlan } from './build-portugal-jurisdiction-overlay-plan.mjs';

function normalizedEvent(id, dateISO, label, ordinal = 0, group = null) {
  return {
    id,
    dateISO,
    names: { pt: { value: label } },
    sourceFacts: {
      sourceDayKey: `${dateISO}|uid`,
      sourceOrdinal: ordinal,
      alternativeGroupId: group,
      groupedAlternative: Boolean(group),
    },
  };
}
function candidate(id, dateISO, rank = 'memorial') {
  return {
    canonicalEventId: `rc:${id}`,
    generalRomanId: id,
    generalRomanDateISO: dateISO,
    generalRomanRank: rank,
    lexicalScore: .92,
    score: .96,
    sameDate: true,
    dateDistanceDays: 0,
    ranksAgree: true,
  };
}

const normalized = {
  run: { publicationAllowed: false, promotionAllowed: false },
  coverage: { sourceDayCount: 4, civilDays: 4, eventCount: 5 },
  events: [
    normalizedEvent('structural', '2026-01-02', 'Sexta-feira do Tempo do Natal'),
    normalizedEvent('same', '2026-06-29', 'Santos Pedro e Paulo'),
    normalizedEvent('ambiguous', '2026-07-01', 'S. Exemplo'),
    normalizedEvent('proper-a', '2026-10-16', 'S. Um', 0, 'g1'),
    normalizedEvent('proper-b', '2026-10-16', 'S. Dois', 1, 'g1'),
  ],
};
const reconciliation = {
  mode: 'proposal-only',
  productionWriteAllowed: false,
  automaticLinkAllowed: false,
  items: [
    { sourceOccurrenceId:'structural', sourceCanonicalEventId:'source:structural', sourceUid:'uid1', dateISO:'2026-01-02', sourceLabel:'Sexta-feira do Tempo do Natal', sourceRank:null, disposition:'structural-review', reason:'single-general-roman-event-on-date-without-semantic-proof', candidate:candidate('ChristmasWeekday','2026-01-02','weekday'), alternatives:[] },
    { sourceOccurrenceId:'same', sourceCanonicalEventId:'source:same', sourceUid:'uid2', dateISO:'2026-06-29', sourceLabel:'Santos Pedro e Paulo', sourceRank:'solemnity', disposition:'canonical-link-proposal', reason:'same-date-lexical-and-structural-match', candidate:candidate('StsPeterPaulAp','2026-06-29','solemnity'), alternatives:[] },
    { sourceOccurrenceId:'ambiguous', sourceCanonicalEventId:'source:ambiguous', sourceUid:'uid3', dateISO:'2026-07-01', sourceLabel:'S. Exemplo', sourceRank:'optional-memorial', disposition:'ambiguous-review', reason:'same-date-match-below-safe-threshold', candidate:candidate('Example','2026-07-01'), alternatives:[candidate('Example','2026-07-01')] },
    { sourceOccurrenceId:'proper-a', sourceCanonicalEventId:'source:proper-a', sourceUid:'uid4', dateISO:'2026-10-16', sourceLabel:'S. Um', sourceRank:'optional-memorial', disposition:'portugal-proper-or-unmatched', reason:'no-safe-general-roman-candidate', candidate:null, alternatives:[] },
    { sourceOccurrenceId:'proper-b', sourceCanonicalEventId:'source:proper-b', sourceUid:'uid4', dateISO:'2026-10-16', sourceLabel:'S. Dois', sourceRank:'optional-memorial', disposition:'portugal-proper-or-unmatched', reason:'no-safe-general-roman-candidate', candidate:null, alternatives:[] },
  ],
};

const result = buildPortugalJurisdictionOverlayPlan({ normalized, reconciliation });
assert.equal(result.mode, 'jurisdiction-delta-overlay-plan');
assert.equal(result.baseCalendar, 'roman-catholic-general');
assert.equal(result.productionWriteAllowed, false);
assert.equal(result.overlayPublicationAllowed, false);
assert.equal(result.summary.inputOccurrences, 5);
assert.equal(result.summary.inheritGeneralNoPtRow, 2);
assert.equal(result.summary.optionalProvenanceBindingReview, 1);
assert.equal(result.summary.blockingDeltaReview, 3);
assert.equal(result.summary.humanReviewReductionPercent, 40);
assert.equal(result.inheritGeneral.find((item)=>item.sourceOccurrenceId==='structural').humanReviewRequired, false);
assert.equal(result.inheritGeneral.find((item)=>item.sourceOccurrenceId==='same').blocksPortugalPublication, false);
assert.equal(result.provenanceBindingCandidates[0].blocksPortugalPublication, false);
assert.ok(result.blockingDeltaReview.every((item)=>item.blocksPortugalPublication===true && item.humanReviewRequired===true));
assert.equal(result.blockingDeltaReview.filter((item)=>item.alternativeGroupId==='g1').length, 2);
assert.ok([...result.inheritGeneral, ...result.provenanceBindingCandidates, ...result.blockingDeltaReview].every((item)=>item.productionWriteAllowed===false));

const unsafe = structuredClone(normalized);
unsafe.run.promotionAllowed = true;
assert.throws(() => buildPortugalJurisdictionOverlayPlan({ normalized: unsafe, reconciliation }), /withheld/u);
console.log('Portugal jurisdiction overlay planning tests passed.');

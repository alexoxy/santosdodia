#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildPortugalReviewBundle } from './build-portugal-snl-review-bundle.mjs';

const normalized = {
  run: { publicationAllowed: false, promotionAllowed: false },
  coverage: { sourceDayCount: 3, eventCount: 4, civilDays: 3, multiObservanceDays: 1 },
  events: [
    { id: 'a', sourceFacts: { sourceDayKey: '2026-01-01|a', sourceOrdinal: 0, alternativeGroupId: null, groupedAlternative: false, dayLabel: 'Dia A', description: 'S. Exemplo – MO' } },
    { id: 'b', sourceFacts: { sourceDayKey: '2026-01-02|b', sourceOrdinal: 0, alternativeGroupId: 'g1', groupedAlternative: true, dayLabel: 'Dia B', description: 'S. Um – MF S. Dois – MF' } },
    { id: 'c', sourceFacts: { sourceDayKey: '2026-01-02|b', sourceOrdinal: 1, alternativeGroupId: 'g1', groupedAlternative: true, dayLabel: 'Dia B', description: 'S. Um – MF S. Dois – MF' } },
    { id: 'd', sourceFacts: { sourceDayKey: '2026-01-03|d', sourceOrdinal: 0, alternativeGroupId: null, groupedAlternative: false, dayLabel: 'Dia D', description: 'Dia D' } },
  ],
};
function candidate(id, date='2026-01-01') {
  return { canonicalEventId:`rc:${id}`, generalRomanId:id, generalRomanDateISO:date, generalRomanRank:'memorial', generalRomanGrade:'Memorial', bestComparedName:id, lexicalScore:.9, score:.95, sameDate:true, dateDistanceDays:0, ranksAgree:true };
}
const reconciliation = {
  mode: 'proposal-only', productionWriteAllowed: false, automaticLinkAllowed: false,
  items: [
    { sourceOccurrenceId:'a', sourceCanonicalEventId:'source:a', sourceUid:'a@snl', dateISO:'2026-01-01', sourceLabel:'S. Exemplo', sourceRank:'memorial', disposition:'canonical-link-proposal', reason:'same-date', candidate:candidate('Example'), alternatives:[candidate('Example')] },
    { sourceOccurrenceId:'b', sourceCanonicalEventId:'source:b', sourceUid:'b@snl', dateISO:'2026-01-02', sourceLabel:'S. Um', sourceRank:'optional-memorial', disposition:'ambiguous-review', reason:'ambiguous', candidate:candidate('One','2026-01-02'), alternatives:[candidate('One','2026-01-02')] },
    { sourceOccurrenceId:'c', sourceCanonicalEventId:'source:c', sourceUid:'b@snl', dateISO:'2026-01-02', sourceLabel:'S. Dois', sourceRank:'optional-memorial', disposition:'portugal-proper-or-unmatched', reason:'unmatched', candidate:null, alternatives:[] },
    { sourceOccurrenceId:'d', sourceCanonicalEventId:'source:d', sourceUid:'d@snl', dateISO:'2026-01-03', sourceLabel:'Dia D', sourceRank:null, disposition:'structural-review', reason:'structural', candidate:candidate('DayD','2026-01-03'), alternatives:[candidate('DayD','2026-01-03')] },
  ],
};

const result = buildPortugalReviewBundle({ normalized, reconciliation });
assert.equal(result.mode, 'human-review-by-exception');
assert.equal(result.productionWriteAllowed, false);
assert.equal(result.summary.inputOccurrences, 4);
assert.equal(result.summary['link-confirmation'], 1);
assert.equal(result.summary['semantic-ambiguity'], 1);
assert.equal(result.summary['portugal-proper-or-unmatched'], 1);
assert.equal(result.summary['structural-day'], 1);
assert.equal(result.queues['link-confirmation'][0].decision, 'pending-human-review');
assert.equal(result.queues['link-confirmation'][0].candidate.canonicalEventId, 'rc:Example');
assert.equal(result.queues['semantic-ambiguity'][0].alternativeGroupId, 'g1');
assert.equal(result.queues['portugal-proper-or-unmatched'][0].sourceOrdinal, 1);
assert.ok(Object.values(result.queues).flat().every((item) => item.productionWriteAllowed === false));

const unsafe = structuredClone(reconciliation);
unsafe.automaticLinkAllowed = true;
assert.throws(() => buildPortugalReviewBundle({ normalized, reconciliation: unsafe }), /proposal-only/u);
console.log('Portugal human-review bundle tests passed.');

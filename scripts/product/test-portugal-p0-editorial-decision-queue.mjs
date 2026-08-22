import assert from 'node:assert/strict';
import { buildPortugalP0EditorialDecisionQueue } from './build-portugal-p0-editorial-decision-queue.mjs';

const safety={adsenseReviewState:'PREPARING'};
const p0Pack={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{safety},items:[
  {reviewId:'r1',sourceOccurrenceId:'o1',canonicalEventId:'c1',dateISO:'2026-01-01',alreadyPublic:false},
  {reviewId:'r2',sourceOccurrenceId:'o2',canonicalEventId:'c2',dateISO:'2026-01-02',alreadyPublic:false},
  {reviewId:'r3',sourceOccurrenceId:'o3',canonicalEventId:'c3',dateISO:'2026-01-03',alreadyPublic:true},
]};
const corroboration={schemaVersion:1,release:p0Pack.release,publicationAllowed:false,productionMutation:false,summary:{safety},items:[
  {reviewId:'r1',sourceOccurrenceId:'o1',canonicalEventId:'c1',dateISO:'2026-01-01',qid:'Q1',entityId:'wikidata:Q1',calendarLabelPt:'São Um',personNamePt:'São Um',disposition:'candidate-for-reviewed-binding',sourceRecords:[{id:'v1'}]},
  {reviewId:'r2',sourceOccurrenceId:'o2',canonicalEventId:'c2',dateISO:'2026-01-02',qid:'Q2',entityId:'wikidata:Q2',calendarLabelPt:'São Dois',personNamePt:'São Dois',disposition:'needs-independent-source-research',sourceRecords:[]},
  {reviewId:'r3',sourceOccurrenceId:'o3',canonicalEventId:'c3',dateISO:'2026-01-03',qid:'Q3',entityId:'wikidata:Q3',calendarLabelPt:'São Três',personNamePt:'São Três',disposition:'reviewed-binding-live-match',sourceRecords:[{id:'v3'}],reviewedBinding:{bindingId:'b3'}},
]};
const researchQueue={schemaVersion:1,release:p0Pack.release,publicationAllowed:false,productionMutation:false,summary:{safety},items:[
  {reviewId:'r2',status:'evidence-ready-for-editorial-review',sourceGapKind:'vatican-same-day-unmatched',primaryEvidenceCandidates:[{evidenceId:'e2'}]},
]};
const result=buildPortugalP0EditorialDecisionQueue({p0Pack,corroboration,researchQueue});
assert.equal(result.items.length,3);
assert.equal(result.summary.readyForExplicitEditorialDecision,3);
assert.equal(result.summary.blockedPendingResearch,0);
assert.equal(result.summary.pendingNewDecisions,2);
assert.equal(result.summary.existingReviewedBindingChecks,1);
assert.equal(result.summary.decisionClasses['review-new-calendar-person-link'],1);
assert.equal(result.summary.decisionClasses['review-primary-source-supported-link'],1);
assert.equal(result.summary.decisionClasses['verify-existing-reviewed-binding'],1);
assert.ok(result.items.every((item)=>item.editorialDecision===null&&item.automaticLinkAllowed===false&&item.publicationAllowed===false));
console.log('Portugal P0 editorial decision queue tests passed.');

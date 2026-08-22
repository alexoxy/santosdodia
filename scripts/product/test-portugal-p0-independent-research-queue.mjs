import assert from 'node:assert/strict';
import { buildPortugalP0IndependentResearchQueue } from './build-portugal-p0-independent-research-queue.mjs';

const p0Pack={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{safety:{adsenseReviewState:'PREPARING'}},items:[
  {reviewId:'r:1',sourceOccurrenceId:'one',canonicalEventId:'rc:one',dateISO:'2026-01-01'},
  {reviewId:'r:2',sourceOccurrenceId:'two',canonicalEventId:'rc:two',dateISO:'2026-01-02'},
  {reviewId:'r:3',sourceOccurrenceId:'three',canonicalEventId:'rc:three',dateISO:'2026-01-03'},
]};
const base=(reviewId,id,qid,disposition,sourceRecords=[])=>({reviewId,sourceOccurrenceId:id,canonicalEventId:`rc:${id}`,dateISO:'2026-01-01',qid,entityId:`wikidata:${qid}`,calendarLabelPt:`S. ${id}`,personNamePt:id,disposition,reason:'test',sourceRecords});
const corroboration={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{unresolvedForIndependentResearch:2,safety:{adsenseReviewState:'PREPARING'}},items:[
  base('r:1','one','Q1','candidate-for-reviewed-binding',[{labelPt:'S. one'}]),
  base('r:2','two','Q2','needs-independent-source-research',[{labelPt:'S. outro'}]),
  base('r:3','three','Q3','needs-independent-source-research',[]),
]};
const result=buildPortugalP0IndependentResearchQueue({p0Pack,corroboration});
assert.equal(result.items.length,2);
assert.equal(result.summary.researchItems,2);
assert.equal(result.summary.sourceGapKinds['vatican-same-day-unmatched'],1);
assert.equal(result.summary.sourceGapKinds['vatican-no-record'],1);
assert.equal(result.summary.priorities.R1,1);
assert.equal(result.summary.priorities.R2,1);
assert.equal(result.summary.evidencePolicy.singleFirstPartyAuthorityAllowed,true);
assert.ok(result.items.every((item)=>item.status==='research-required'&&item.publicationAllowed===false&&item.automaticLinkAllowed===false&&item.advertisingEligible===false));
console.log('Portugal P0 independent research queue tests passed.');

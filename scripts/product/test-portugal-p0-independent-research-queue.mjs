import assert from 'node:assert/strict';
import { buildPortugalP0IndependentResearchQueue } from './build-portugal-p0-independent-research-queue.mjs';

const p0Pack={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{safety:{adsenseReviewState:'PREPARING'}},items:[
  {reviewId:'r:1',sourceOccurrenceId:'one',canonicalEventId:'rc:one',dateISO:'2026-01-01'},
  {reviewId:'r:2',sourceOccurrenceId:'two',canonicalEventId:'rc:two',dateISO:'2026-01-02'},
  {reviewId:'r:3',sourceOccurrenceId:'three',canonicalEventId:'rc:three',dateISO:'2026-01-03'},
]};
const base=(reviewId,id,qid,dateISO,disposition,sourceRecords=[])=>({reviewId,sourceOccurrenceId:id,canonicalEventId:`rc:${id}`,dateISO,qid,entityId:`wikidata:${qid}`,calendarLabelPt:`S. ${id}`,personNamePt:id,disposition,reason:'test',sourceRecords});
const liveHash='a'.repeat(64);
const corroboration={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{unresolvedForIndependentResearch:2,safety:{adsenseReviewState:'PREPARING'}},items:[
  base('r:1','one','Q1','2026-01-01','candidate-for-reviewed-binding',[{labelPt:'S. one'}]),
  base('r:2','two','Q2','2026-01-02','needs-independent-source-research',[{labelPt:'S. outro',sourceRecordHash:liveHash}]),
  base('r:3','three','Q3','2026-01-03','needs-independent-source-research',[]),
]};
const primaryEvidence={schemaVersion:1,evidenceSetId:'test',release:'roman-catholic-pt-2026-v2',claimClass:'feast-or-observance-link',publicationAllowed:false,productionMutation:false,records:[
  {evidenceId:'vatican-test',qid:'Q2',dateISO:'2026-01-02',sourceId:'vatican-news-saint-of-day-pt',sourcePublisher:'Vatican News',sourceClass:'official-holy-see-calendar',sourceUrl:'https://www.vaticannews.va/test',sourceRecordHash:liveHash,observedSourceLabel:'S. outro',evidenceKind:'same-day-primary-source-semantic-candidate',firstParty:true},
  {evidenceId:'external-test',qid:'Q3',dateISO:'2026-01-03',sourceId:'official-diocese-test',sourcePublisher:'Official Diocese',sourceClass:'official-diocesan-liturgical-source',sourceUrl:'https://example.org/official',observedSourceLabel:'Three — 3 January',evidenceKind:'official-primary-source-observance',firstParty:true},
],safety:{proposalOnly:true,sourceEvidenceDoesNotEqualBindingApproval:true,reviewedBindingRegistryMutationAllowed:false,adsenseReviewState:'PREPARING'}};
const result=buildPortugalP0IndependentResearchQueue({p0Pack,corroboration,primaryEvidence});
assert.equal(result.items.length,2);
assert.equal(result.summary.researchItems,2);
assert.equal(result.summary.sourceGapKinds['vatican-same-day-unmatched'],1);
assert.equal(result.summary.sourceGapKinds['vatican-no-record'],1);
assert.equal(result.summary.priorities.R1,1);
assert.equal(result.summary.priorities.R2,1);
assert.equal(result.summary.primaryEvidence.configuredRecords,2);
assert.equal(result.summary.primaryEvidence.evidenceReadyForEditorialReview,2);
assert.equal(result.summary.primaryEvidence.remainingOpenResearch,0);
assert.equal(result.summary.evidencePolicy.singleFirstPartyAuthorityAllowed,true);
assert.ok(result.items.every((item)=>item.status==='evidence-ready-for-editorial-review'&&item.evidenceStatus==='primary-source-evidence-ready'&&item.primaryEvidenceCandidates.length===1&&item.publicationAllowed===false&&item.automaticLinkAllowed===false&&item.advertisingEligible===false));
assert.ok(result.items.every((item)=>item.primaryEvidenceCandidates[0].bindingDecisionStatus==='pending-editorial-review'&&item.primaryEvidenceCandidates[0].automaticBindingAllowed===false));
console.log('Portugal P0 independent research queue tests passed.');

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

// Regression fixture mirrors the live Portugal P0 distribution measured on 2026-08-22:
// 59 Vatican proposals + 1 additional observance + 1 reviewed live binding + 9 primary-source residuals = 70.
const liveP0Items=[];
const liveCorroborationItems=[];
const liveResearchItems=[];
const addLive=(index,disposition,{research=false,alreadyPublic=false}={})=>{
  const reviewId=`live-r${index}`;
  const sourceOccurrenceId=`live-o${index}`;
  const dateISO=`2026-${String(((index-1)%12)+1).padStart(2,'0')}-${String(((index-1)%28)+1).padStart(2,'0')}`;
  liveP0Items.push({reviewId,sourceOccurrenceId,canonicalEventId:`live-c${index}`,dateISO,alreadyPublic});
  liveCorroborationItems.push({
    reviewId,sourceOccurrenceId,canonicalEventId:`live-c${index}`,dateISO,qid:`Q${1000+index}`,entityId:`wikidata:Q${1000+index}`,
    calendarLabelPt:`Santo ${index}`,personNamePt:`Santo ${index}`,disposition,
    sourceRecords:disposition==='needs-independent-source-research'?[]:[{id:`v${index}`}],
    ...(disposition==='reviewed-binding-live-match'?{reviewedBinding:{bindingId:`b${index}`}}:{}),
  });
  if(research) liveResearchItems.push({reviewId,status:'evidence-ready-for-editorial-review',sourceGapKind:'vatican-same-day-unmatched',primaryEvidenceCandidates:[{evidenceId:`e${index}`}]});
};
for(let index=1;index<=59;index+=1) addLive(index,'candidate-for-reviewed-binding');
addLive(60,'candidate-for-reviewed-binding-additional-observance');
addLive(61,'reviewed-binding-live-match',{alreadyPublic:true});
for(let index=62;index<=70;index+=1) addLive(index,'needs-independent-source-research',{research:true});

const liveP0Pack={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'live-regression',publicationAllowed:false,productionMutation:false,summary:{safety},items:liveP0Items};
const liveCorroboration={schemaVersion:1,release:liveP0Pack.release,publicationAllowed:false,productionMutation:false,summary:{safety},items:liveCorroborationItems};
const liveResearchQueue={schemaVersion:1,release:liveP0Pack.release,publicationAllowed:false,productionMutation:false,summary:{safety},items:liveResearchItems};
const liveResult=buildPortugalP0EditorialDecisionQueue({p0Pack:liveP0Pack,corroboration:liveCorroboration,researchQueue:liveResearchQueue});
assert.equal(liveResult.items.length,70);
assert.equal(liveResult.summary.readyForExplicitEditorialDecision,70);
assert.equal(liveResult.summary.blockedPendingResearch,0);
assert.equal(liveResult.summary.pendingNewDecisions,69);
assert.equal(liveResult.summary.existingReviewedBindingChecks,1);
assert.equal(liveResult.summary.decisionClasses['review-new-calendar-person-link'],59);
assert.equal(liveResult.summary.decisionClasses['review-additional-observance-link'],1);
assert.equal(liveResult.summary.decisionClasses['review-primary-source-supported-link'],9);
assert.equal(liveResult.summary.decisionClasses['verify-existing-reviewed-binding'],1);
assert.ok(liveResult.items.every((item)=>item.editorialDecision===null&&item.automaticLinkAllowed===false&&item.publicationAllowed===false&&item.productionMutation===false&&item.indexationAllowed===false&&item.advertisingEligible===false));

assert.throws(()=>buildPortugalP0EditorialDecisionQueue({
  p0Pack:liveP0Pack,
  corroboration:{...liveCorroboration,items:liveCorroboration.items.slice(0,69)},
  researchQueue:liveResearchQueue,
}),/Editorial decision input accounting mismatch: p0=70, corroboration=69/u);

console.log('Portugal P0 editorial decision queue tests passed.');

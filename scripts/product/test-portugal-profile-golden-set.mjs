import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildPortugalProfileGoldenSet } from './build-portugal-profile-golden-set.mjs';

const selection=JSON.parse(fs.readFileSync('config/portugal-profile-golden-set.v1.json','utf8'));
const safety={adsenseReviewState:'PREPARING'};
const edgeQids=new Set(['Q110299','Q128267','Q272511','Q32520','Q167477','Q132473','Q235857','Q313803','Q153850','Q1355472','Q44490']);
const p0Items=selection.profiles.map((profile,index)=>({
  reviewId:`r:${profile.qid}`,
  sourceOccurrenceId:`o:${profile.qid}`,
  canonicalEventId:`c:${profile.qid}`,
  dateISO:profile.dateISO,
  proposedPerson:{entityId:`wikidata:${profile.qid}`,qid:profile.qid,names:{pt:`Pessoa ${index+1}`}},
}));
const decisionItems=selection.profiles.map((profile,index)=>({
  decisionId:`d:${profile.qid}`,
  reviewId:`r:${profile.qid}`,
  sourceOccurrenceId:`o:${profile.qid}`,
  canonicalEventId:`c:${profile.qid}`,
  dateISO:profile.dateISO,
  qid:profile.qid,
  entityId:`wikidata:${profile.qid}`,
  calendarLabelPt:`Santo ${index+1}`,
  personNamePt:`Pessoa ${index+1}`,
  decisionClass:profile.qid==='Q128267'?'review-additional-observance-link':profile.qid==='Q167477'?'verify-existing-reviewed-binding':edgeQids.has(profile.qid)?'review-primary-source-supported-link':'review-new-calendar-person-link',
  reviewStatus:'ready-for-explicit-editorial-decision',
  editorialDecision:null,
  evidence:{primaryEvidenceCandidates:edgeQids.has(profile.qid)?[{evidenceId:`e:${profile.qid}`}]:[]},
}));
const p0Pack={schemaVersion:1,release:selection.release,datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{safety},items:p0Items};
const editorialDecisionQueue={schemaVersion:1,release:selection.release,publicationAllowed:false,productionMutation:false,summary:{safety:{...safety,explicitEditorialDecisionRequired:true}},items:decisionItems};
const result=buildPortugalProfileGoldenSet({p0Pack,editorialDecisionQueue,selection});

assert.equal(result.items.length,40);
assert.equal(result.summary.selectedProfiles,40);
assert.equal(result.summary.sourceEdgeCasesIncluded,11);
assert.equal(result.summary.editorialState.pendingReview,40);
assert.equal(result.summary.editorialState.approved,0);
assert.equal(result.summary.editorialState.published,0);
assert.ok(result.summary.coveredMonths.length>=11);
assert.ok(result.summary.coverageTagCounts['portugal-anchor']>=3);
assert.ok(result.summary.coverageTagCounts['women-represented']>=10);
assert.ok(result.items.every((item)=>item.profileEditorialDecision===null&&item.automaticBiographyGenerationAllowed===false&&item.automaticPublicationAllowed===false&&item.publicationAllowed===false&&item.indexationAllowed===false&&item.advertisingEligible===false));

const withoutEdge={...selection,targetSize:39,profiles:selection.profiles.filter((profile)=>profile.qid!=='Q110299')};
assert.throws(()=>buildPortugalProfileGoldenSet({p0Pack,editorialDecisionQueue,selection:withoutEdge}),/Golden set omitted required source edge case r:Q110299/u);
assert.throws(()=>buildPortugalProfileGoldenSet({
  p0Pack,
  editorialDecisionQueue:{...editorialDecisionQueue,items:editorialDecisionQueue.items.map((item)=>item.qid==='Q44490'?{...item,reviewStatus:'blocked-pending-research'}:item)},
  selection,
}),/Configured golden profile Q44490 is not ready/u);

console.log('Portugal profile golden set tests passed.');

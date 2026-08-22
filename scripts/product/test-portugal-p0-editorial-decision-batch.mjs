import assert from 'node:assert/strict';
import { buildPortugalP0EditorialDecisionBatch } from './build-portugal-p0-editorial-decision-batch.mjs';

const p0=(id,qid,alreadyPublic=false)=>({reviewId:`r:${id}`,sourceOccurrenceId:id,canonicalEventId:`rc:${id}`,dateISO:'2026-01-01',calendar:{labels:{pt:`S. ${id}`}},proposedPerson:{qid,entityId:`wikidata:${qid}`,names:{pt:`S. ${id}`}},matchEvidence:[{kind:'test'}],alreadyPublic,publicationAllowed:false,productionMutation:false,advertisingEligible:false});
const corr=(id,qid,disposition)=>({reviewId:`r:${id}`,sourceOccurrenceId:id,canonicalEventId:`rc:${id}`,dateISO:'2026-01-01',qid,entityId:`wikidata:${qid}`,disposition,reason:'test',sourceRecords:[{sourceRecordHash:`hash-${id}`}],matchEvidence:[{mode:'test'}]});
const research=(id,qid,evidenceReady)=>({reviewId:`r:${id}`,sourceOccurrenceId:id,qid,entityId:`wikidata:${qid}`,evidenceStatus:evidenceReady?'primary-source-evidence-ready':'open-research',primaryEvidenceCandidates:evidenceReady?[{evidenceId:`e:${id}`,bindingDecisionStatus:'pending-editorial-review'}]:[]});
const pack={
  schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,
  summary:{safety:{adsenseReviewState:'PREPARING',automaticLinkAllowed:false,automaticPublicationAllowed:false}},
  items:[p0('normal','Q1'),p0('reviewed','Q2'),p0('additional','Q3'),p0('primary','Q4'),p0('open','Q5'),p0('public','Q6',true)],
  vaticanCorroboration:{schemaVersion:1,publicationAllowed:false,productionMutation:false,items:[
    corr('normal','Q1','candidate-for-reviewed-binding'),
    corr('reviewed','Q2','reviewed-binding-live-match'),
    corr('additional','Q3','candidate-for-reviewed-binding-additional-observance'),
    corr('primary','Q4','needs-independent-source-research'),
    corr('open','Q5','needs-independent-source-research'),
    corr('public','Q6','candidate-for-reviewed-binding'),
  ]},
  independentResearchQueue:{schemaVersion:1,publicationAllowed:false,productionMutation:false,items:[research('primary','Q4',true),research('open','Q5',false)]},
};
const result=buildPortugalP0EditorialDecisionBatch({p0Pack:pack});
assert.equal(result.items.length,6);
assert.equal(result.summary.lanes['vatican-corroborated-link-review'],1);
assert.equal(result.summary.lanes['reviewed-source-binding-verification'],1);
assert.equal(result.summary.lanes['additional-observance-review'],1);
assert.equal(result.summary.lanes['primary-evidence-link-review'],1);
assert.equal(result.summary.lanes['defer-open-research'],1);
assert.equal(result.summary.lanes['existing-public-link-review'],1);
assert.equal(result.summary.readiness.evidenceReady,5);
assert.equal(result.summary.readiness.blockedOpenResearch,1);
assert.equal(result.summary.decisionState.undecided,6);
assert.ok(result.items.every((item)=>item.decision===null&&item.agentMayApplyDecision===false&&item.allowedDecisions.join(',')==='accept-link,reject-link,defer'));
assert.ok(result.items.every((item)=>item.publicationAllowed===false&&item.automaticLinkAllowed===false&&item.advertisingEligible===false));
console.log('Portugal P0 editorial decision batch tests passed.');

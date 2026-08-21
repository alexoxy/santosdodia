import assert from 'node:assert/strict';
import { buildPortugalP0VaticanCorroborationCandidates } from './build-portugal-p0-vatican-corroboration-candidates.mjs';

const safety={adsenseReviewState:'PREPARING',automaticLinkAllowed:false,automaticPublicationAllowed:false};
const row=(id,date,qid,label,aliases=[])=>({reviewId:`r:${id}`,reviewBucket:'identity-review-ready',sourceOccurrenceId:id,dateISO:date,canonicalEventId:`rc:${id}`,calendar:{labels:{pt:label}},proposedPerson:{entityId:`wikidata:${qid}`,qid,names:{pt:label},aliases:{pt:aliases}},reviewRequired:true,automaticLinkAllowed:false,publicationAllowed:false,advertisingEligible:false});
const p0Pack={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{safety},items:[
  row('existing','2026-06-13','Q1','Santo António de Lisboa'),
  row('candidate','2026-08-11','Q2','Santa Clara de Assis'),
  row('ambiguous','2026-01-02','Q3','São Basílio'),
  row('research','2026-01-03','Q4','São Nome Sem Correspondência'),
]};
const event=(id,month,day,label)=>({id,month,day,names:{pt:{value:label}},source:{calendarPageUrl:`https://www.vaticannews.va/pt/santo-do-dia/${month}/${day}.html`,detailUrl:`https://www.vaticannews.va/pt/santo-do-dia/${month}/${day}/${id}.html`,sourceRecordHash:'a'.repeat(64),retrievedAt:'2026-08-22T00:00:00Z'}});
const vatican={schemaVersion:1,sourceId:'vatican-news-saint-of-day-pt',sourceScope:'all',contract:{productionPublication:false,nameOnlyIdentityMergeForbidden:true},coverage:{coveredDays:366,complete:true},events:[
  event('anthony',6,13,'Santo António de Lisboa'),
  event('clare',8,11,'Santa Clara de Assis'),
  event('basil-a',1,2,'São Basílio'),
  event('basil-b',1,2,'São Basílio'),
  event('other',1,3,'Santa Genoveva'),
]};
const bindings={schemaVersion:1,sourceId:'vatican-news-saint-of-day-pt',bindings:[{bindingId:'existing-binding',canonicalPersonId:'anthony',qid:'Q1',month:6,day:13,acceptedLabels:['Santo António de Lisboa'],reviewedAt:'2026-08-15',allowedClaimClasses:['localized-source-label']}]};
const result=buildPortugalP0VaticanCorroborationCandidates({p0Pack,vatican,bindings});
assert.equal(result.items.length,4);
assert.equal(result.summary.dispositions['reviewed-binding-live-match'],1);
assert.equal(result.summary.dispositions['candidate-for-reviewed-binding'],1);
assert.equal(result.summary.dispositions['ambiguous-vatican-record'],1);
assert.equal(result.summary.dispositions['needs-independent-source-research'],1);
assert.equal(result.summary.editorialCandidates,1);
assert.equal(result.summary.existingReviewedBindingLiveMatches,1);
assert.equal(result.summary.unresolvedForIndependentResearch,2);
assert.equal(result.summary.safety.adsenseReviewState,'PREPARING');
assert.ok(result.items.every((item)=>item.reviewedBindingMutationAllowed===false&&item.automaticLinkAllowed===false&&item.publicationAllowed===false&&item.advertisingEligible===false));

const unavailable=buildPortugalP0VaticanCorroborationCandidates({p0Pack,vatican:null,bindings});
assert.equal(unavailable.summary.dispositions['source-unavailable'],4);
assert.equal(unavailable.summary.source.available,false);
console.log('Portugal P0 Vatican corroboration candidate tests passed.');

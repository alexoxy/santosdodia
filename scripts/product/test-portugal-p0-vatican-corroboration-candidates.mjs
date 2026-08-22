import assert from 'node:assert/strict';
import { buildPortugalP0VaticanCorroborationCandidates } from './build-portugal-p0-vatican-corroboration-candidates.mjs';

const safety={adsenseReviewState:'PREPARING',automaticLinkAllowed:false,automaticPublicationAllowed:false};
const row=(id,date,qid,label,aliases=[])=>({reviewId:`r:${id}`,reviewBucket:'identity-review-ready',sourceOccurrenceId:id,dateISO:date,canonicalEventId:`rc:${id}`,calendar:{labels:{pt:label}},proposedPerson:{entityId:`wikidata:${qid}`,qid,names:{pt:label},aliases:{pt:aliases}},reviewRequired:true,automaticLinkAllowed:false,publicationAllowed:false,advertisingEligible:false});
const p0Pack={schemaVersion:1,release:'roman-catholic-pt-2026-v2',datasetVersion:'test',publicationAllowed:false,productionMutation:false,summary:{safety},items:[
  row('existing','2026-06-13','Q1','Santo António de Lisboa'),
  row('candidate','2026-08-11','Q2','Santa Clara de Assis'),
  row('descriptor','2026-05-26','Q3','S. Filipe Néri, presbítero'),
  row('object-alias','2026-02-02','Q4','Santa Nome Diferente',[{value:'Santa Alias Correta',status:'source'}]),
  row('ambiguous','2026-01-02','Q5','São Basílio'),
  row('research','2026-10-09','Q6','São João Henrique Newman'),
  row('additional-observance','2026-05-01','Q7','S. José Operário'),
]};
const event=(id,month,day,label)=>({id,month,day,names:{pt:{value:label}},source:{calendarPageUrl:`https://www.vaticannews.va/pt/santo-do-dia/${month}/${day}.html`,detailUrl:`https://www.vaticannews.va/pt/santo-do-dia/${month}/${day}/${id}.html`,sourceRecordHash:'a'.repeat(64),retrievedAt:'2026-08-22T00:00:00Z'}});
const vatican={schemaVersion:1,sourceId:'vatican-news-saint-of-day-pt',sourceScope:'all',contract:{productionPublication:false,nameOnlyIdentityMergeForbidden:true},coverage:{coveredDays:366,complete:true},events:[
  event('anthony',6,13,'S. Antônio de Pádua, sacerdote franciscano e doutor da Igreja'),
  event('clare',8,11,'S. Clara de Assis, virgem'),
  event('philip',5,26,'S. Filipe Néri, presbítero, fundador da Congregação dos Padres do Oratório'),
  event('alias',2,2,'S. Alias Correta, virgem'),
  event('basil-a',1,2,'São Basílio'),
  event('basil-b',1,2,'São Basílio'),
  event('other',10,9,'S. João Leonardi, fundador dos Clérigos Regulares da Mãe de Deus'),
  event('joseph-worker',5,1,'S. José operário, esposo da Santíssima Virgem Maria, protetor dos trabalhadores'),
]};
const bindings={schemaVersion:1,sourceId:'vatican-news-saint-of-day-pt',bindings:[
  {bindingId:'existing-binding',canonicalPersonId:'anthony',qid:'Q1',month:6,day:13,acceptedLabels:['Santo António de Pádua'],reviewedAt:'2026-08-15',allowedClaimClasses:['localized-source-label']},
  {bindingId:'joseph-spouse',canonicalPersonId:'joseph',qid:'Q7',month:3,day:19,acceptedLabels:['São José'],reviewedAt:'2026-08-15',allowedClaimClasses:['localized-source-label']},
]};
const result=buildPortugalP0VaticanCorroborationCandidates({p0Pack,vatican,bindings});
assert.equal(result.items.length,7);
assert.equal(result.summary.dispositions['reviewed-binding-live-match'],1);
assert.equal(result.summary.dispositions['candidate-for-reviewed-binding'],3);
assert.equal(result.summary.dispositions['candidate-for-reviewed-binding-additional-observance'],1);
assert.equal(result.summary.dispositions['ambiguous-vatican-record'],1);
assert.equal(result.summary.dispositions['needs-independent-source-research'],1);
assert.equal(result.summary.editorialCandidates,4);
assert.equal(result.summary.additionalObservanceCandidates,1);
assert.equal(result.summary.existingReviewedBindingLiveMatches,1);
assert.equal(result.summary.unresolvedForIndependentResearch,2);
assert.equal(result.summary.safety.adsenseReviewState,'PREPARING');
const anthony=result.items.find((item)=>item.qid==='Q1');
assert.equal(anthony.disposition,'reviewed-binding-live-match');
assert.equal(anthony.matchEvidence[0].mode,'normalized-name-prefix');
assert.equal(anthony.matchEvidence[0].normalizedProposal,'antonio de padua');
assert.ok(anthony.matchEvidence[0].normalizedSource.startsWith('antonio de padua '));
const alias=result.items.find((item)=>item.qid==='Q4');
assert.ok(alias.proposalLabelsPt.includes('Santa Alias Correta'));
assert.ok(!alias.proposalLabelsPt.includes('[object Object]'));
const joseph=result.items.find((item)=>item.qid==='Q7');
assert.equal(joseph.disposition,'candidate-for-reviewed-binding-additional-observance');
assert.equal(joseph.relatedReviewedBindings[0].bindingId,'joseph-spouse');
assert.ok(result.items.every((item)=>item.reviewedBindingMutationAllowed===false&&item.automaticLinkAllowed===false&&item.publicationAllowed===false&&item.advertisingEligible===false));

const unavailable=buildPortugalP0VaticanCorroborationCandidates({p0Pack,vatican:null,bindings});
assert.equal(unavailable.summary.dispositions['source-unavailable'],7);
assert.equal(unavailable.summary.source.available,false);
console.log('Portugal P0 Vatican corroboration candidate tests passed.');

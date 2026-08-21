import assert from 'node:assert/strict';
import { buildPortugalSaintPublicationQueue } from './build-portugal-saint-publication-queue.mjs';

const navigation={schemaVersion:1,datasetVersion:'test',publicationAllowed:false,productionMutation:false,people:[
  {entityId:'wikidata:Q1',qid:'Q1',canonicalName:'John Mary Vianney',names:{pt:'João Maria Vianney',en:'John Mary Vianney'},aliases:{pt:['João Vianney']},publicationStatus:'withheld'},
  {entityId:'wikidata:Q2',qid:'Q2',canonicalName:'John',names:{en:'John'},aliases:{},publicationStatus:'withheld'},
]};
const publicNavigation={schemaVersion:1,productionMutation:false,people:[{entityId:'wikidata:Q1',publicationStatus:'published'}]};
const occurrence=(id,category,pt,en)=>({sourceOccurrenceId:id,dateISO:'2026-01-01',canonicalEventId:id,category,rank:null,labels:{pt:{label:pt},en:{label:en},es:{label:en},fr:{label:en},it:{label:en}}});
const calendar={build:'roman-catholic-pt-overlay-v2',productionWriteAllowed:false,calendarCoverage:{occurrences:5,coveredDays:1},productReadiness:{labelCount:25},occurrences:[
 occurrence('rc:StJohnVianney','saint','São João Maria Vianney','Saint John Mary Vianney'),
 occurrence('rc:StsPeterAndPaul','saint','São Pedro e São Paulo','Saints Peter and Paul'),
 occurrence('rc:OurLadyOfFatima','marian','Nossa Senhora de Fátima','Our Lady of Fatima'),
 occurrence('rc:HolyTrinity','feast','Santíssima Trindade','Holy Trinity'),
 occurrence('rc:OrdinarySunday','feast','Domingo do Tempo Comum','Sunday in Ordinary Time'),
]};
const result=buildPortugalSaintPublicationQueue({calendar,navigation,publicNavigation,strict:false});
assert.equal(result.items.length,5);
assert.equal(result.items[0].classification.kind,'single-person-observance');
assert.equal(result.items[0].identityMatch.status,'unique-exact-candidate');
assert.equal(result.items[0].alreadyPublic,true);
assert.equal(result.items[1].classification.kind,'collective-person-observance');
assert.equal(result.items[2].classification.kind,'marian-observance');
assert.equal(result.items[3].classification.kind,'christological-or-doctrinal-observance');
assert.equal(result.items[4].classification.kind,'non-person-liturgical-observance');
assert.equal(result.publicationAllowed,false);
assert.equal(result.productionMutation,false);
assert.equal(result.summary.safety.adsenseReviewState,'PREPARING');
assert.ok(result.items.every((item)=>item.publicationAllowed===false&&item.advertisingEligibleByQueue===false));
console.log('Portugal saint publication queue tests passed.');

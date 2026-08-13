import assert from 'node:assert/strict';
import { proposeLiturgicalPersonLinks } from './propose-liturgical-person-links.mjs';

const report = proposeLiturgicalPersonLinks({
  schemaVersion: 1,
  publicationAllowed: false,
  productionMutation: false,
  people: [
    { entityId: 'wikidata:Q3', qid: 'Q3', names: { pt: 'São João Maria Vianney' }, aliases: { pt: [] } },
    { entityId: 'wikidata:Q4', qid: 'Q4', names: { pt: 'São Ponciano' }, aliases: { pt: [] } }
  ],
  unlinkedObservances: [
    { id: 'vianney', month: 8, day: 4, names: { pt: { value: 'S. João Maria Vianney, Cura de Ars' } }, sourceIds: ['vatican-news-saint-of-day-pt'] },
    { id: 'collective', month: 8, day: 13, names: { pt: { value: 'SS. Ponciano, papa e Hipólito, presbítero, mártires' } }, sourceIds: ['vatican-news-saint-of-day-pt'] }
  ]
});

assert.equal(report.proposals[0].status, 'candidate-review-required');
assert.equal(report.proposals[0].matchMethod, 'exact-leading-person-name-pt');
assert.deepEqual(report.proposals[0].candidatePersonIds, ['wikidata:Q3']);
assert.equal(report.proposals[0].automaticLinkAllowed, false);
assert.equal(report.proposals[1].status, 'unmatched');
assert.deepEqual(report.proposals[1].candidatePersonIds, []);
assert.equal(report.proposals[1].automaticLinkAllowed, false);

console.log('Liturgical person link candidate tests passed.');

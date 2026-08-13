import assert from 'node:assert/strict';
import { proposeLiturgicalPersonLinks } from './propose-liturgical-person-links.mjs';

const report = proposeLiturgicalPersonLinks({
  schemaVersion: 1,
  publicationAllowed: false,
  productionMutation: false,
  people: [
    { entityId: 'person:multi', names: { pt: 'Alpha Beta' }, aliases: { pt: [] } },
    { entityId: 'person:single', names: { pt: 'Gamma' }, aliases: { pt: [] } }
  ],
  unlinkedObservances: [
    { id: 'multi', month: 1, day: 1, names: { pt: { value: 'Alpha Beta, qualifier' } }, sourceIds: ['test'] },
    { id: 'single', month: 1, day: 2, names: { pt: { value: 'Gamma, qualifier' } }, sourceIds: ['test'] }
  ]
});

assert.equal(report.proposals[0].status, 'candidate-review-required');
assert.equal(report.proposals[0].matchMethod, 'exact-leading-person-name-pt');
assert.deepEqual(report.proposals[0].candidatePersonIds, ['person:multi']);
assert.equal(report.proposals[1].status, 'unmatched');
assert.equal(report.proposals[1].matchMethod, 'none');
assert.deepEqual(report.proposals[1].candidatePersonIds, []);
assert.equal(report.proposals.every((item) => item.automaticLinkAllowed === false), true);

console.log('Leading person-name discrimination tests passed.');

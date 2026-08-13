import assert from 'node:assert/strict';
import { applyReviewedLiturgicalPersonLinks } from './apply-reviewed-liturgical-person-links.mjs';

const base = {
  schemaVersion: 1,
  publicationAllowed: false,
  productionMutation: false,
  people: [{ entityId: 'wikidata:Q1', qid: 'Q1', names: { pt: 'São Exemplo' }, aliases: { pt: [] } }],
  unlinkedObservances: [
    { id: 'obs-one', month: 8, day: 24, personEntityId: null, names: { pt: { value: 'S. Exemplo' } }, source: { sourceId: 'vatican-news-saint-of-day-pt' }, validationStatus: 'provisional', publicationStatus: 'withheld' },
    { id: 'obs-group', month: 8, day: 25, personEntityId: null, names: { pt: { value: 'SS. Exemplos mártires' } }, source: { sourceId: 'vatican-news-saint-of-day-pt' }, validationStatus: 'provisional', publicationStatus: 'withheld' }
  ]
};
const copy = () => structuredClone(base);
const ledger = (decisions) => ({ schemaVersion: 1, publicationAllowed: false, productionMutation: false, decisions });

const reviewed = applyReviewedLiturgicalPersonLinks(copy(), ledger([
  {
    observanceId: 'obs-one', decision: 'link-single-person', personEntityId: 'wikidata:Q1', reviewer: 'test', reviewedAt: '2026-08-13T12:00:00Z',
    evidenceSources: [
      { sourceId: 'vatican-news-saint-of-day-pt', sourceFamily: 'vatican-news', reference: 'source-day' },
      { sourceId: 'independent-calendar', sourceFamily: 'independent-church', reference: 'official-calendar' }
    ]
  },
  {
    observanceId: 'obs-group', decision: 'collective', reviewer: 'test', reviewedAt: '2026-08-13T12:00:00Z',
    evidenceSources: [{ sourceId: 'vatican-news-saint-of-day-pt', sourceFamily: 'vatican-news', reference: 'source-day' }]
  }
]));
assert.equal(reviewed.publicationAllowed, false);
assert.equal(reviewed.productionMutation, false);
assert.equal(reviewed.linkReview.linked, 1);
assert.equal(reviewed.linkReview.collective, 1);
assert.equal(reviewed.unlinkedObservances[0].personEntityId, 'wikidata:Q1');
assert.equal(reviewed.unlinkedObservances[0].personLinkStatus, 'reviewed-linked');
assert.equal(reviewed.unlinkedObservances[0].publicationStatus, 'withheld');
assert.equal(reviewed.unlinkedObservances[1].personLinkStatus, 'reviewed-collective');

const weak = ledger([{
  observanceId: 'obs-one', decision: 'link-single-person', personEntityId: 'wikidata:Q1', reviewer: 'test', reviewedAt: '2026-08-13T12:00:00Z',
  evidenceSources: [
    { sourceId: 'vatican-news-saint-of-day-pt', sourceFamily: 'same', reference: 'one' },
    { sourceId: 'second', sourceFamily: 'same', reference: 'two' }
  ]
}]);
assert.throws(() => applyReviewedLiturgicalPersonLinks(copy(), weak), /two independent source families/);

const unsafe = ledger([]);
unsafe.publicationAllowed = true;
assert.throws(() => applyReviewedLiturgicalPersonLinks(copy(), unsafe), /staging-only/);

console.log('Reviewed liturgical person link decision tests passed.');

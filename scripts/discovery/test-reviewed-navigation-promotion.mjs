import assert from 'node:assert/strict';
import { promoteReviewedNavigation } from './promote-reviewed-navigation.mjs';
import { buildNavigationExports } from './build-navigation-exports.mjs';

const reviewedEvidence = [
  { sourceId: 'vatican-news-saint-of-day-pt', sourceFamily: 'vatican-news', reference: 'pt-calendar:08-24' },
  { sourceId: 'official-calendar', sourceFamily: 'official-church-calendar', reference: '08-24:apostle' },
  { sourceId: 'wikidata-q1', sourceFamily: 'wikidata', reference: 'Q1' },
];

const source = {
  schemaVersion: 1,
  datasetVersion: 'navigation-v1:test',
  identityRootSha256: 'a'.repeat(64),
  sourceSha256: 'b'.repeat(64),
  publicationAllowed: false,
  productionMutation: false,
  people: [
    {
      entityId: 'wikidata:Q1',
      qid: 'Q1',
      canonicalName: 'Bartholomew',
      names: { pt: 'São Bartolomeu', en: 'Saint Bartholomew' },
      aliases: {},
      birth: { year: 1, value: '+0001-01-01T00:00:00Z' },
      death: { year: 70, value: '+0070-01-01T00:00:00Z' },
      places: [{ relationType: 'death', lat: 40, lon: 44, sourceIds: ['wikidata'] }],
      traditions: [],
      categories: ['saint-candidate'],
      identityStatus: 'recognized-candidate',
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
      sourceIds: ['wikidata'],
      observances: [],
    },
    {
      entityId: 'wikidata:Q2',
      qid: 'Q2',
      canonicalName: 'Withheld candidate',
      names: { pt: 'Candidato retido' },
      aliases: {},
      birth: null,
      death: null,
      places: [],
      traditions: [],
      categories: ['saint-candidate'],
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
      sourceIds: ['wikidata'],
      observances: [],
    },
  ],
  unlinkedObservances: [
    {
      id: 'reviewed-08-24',
      month: 8,
      day: 24,
      names: { pt: { value: 'S. Bartolomeu, Apóstolo', status: 'source' } },
      sourceIds: ['vatican-news-saint-of-day-pt'],
      personEntityId: 'wikidata:Q1',
      personLinkStatus: 'reviewed-linked',
      linkReview: {
        decision: 'link-single-person',
        reviewer: 'editor',
        reviewedAt: '2026-08-15T00:00:00Z',
        evidenceSources: reviewedEvidence,
      },
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
    },
    {
      id: 'unreviewed-08-25',
      month: 8,
      day: 25,
      names: { pt: { value: 'Outro santo', status: 'source' } },
      sourceIds: ['vatican-news-saint-of-day-pt'],
      personEntityId: 'wikidata:Q2',
      personLinkStatus: 'candidate',
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
    },
  ],
};

const ledger = {
  schemaVersion: 1,
  publicationAllowed: false,
  productionMutation: false,
  decisions: [
    {
      decision: 'publish-reviewed-identity-observance',
      publicationScope: 'identity-observance-only',
      personEntityId: 'wikidata:Q1',
      observanceIds: ['reviewed-08-24'],
      reviewer: 'editor',
      reviewedAt: '2026-08-15T01:00:00Z',
    },
  ],
};

const promoted = promoteReviewedNavigation(source, ledger);
assert.equal(promoted.publicationAllowed, false);
assert.equal(promoted.productionMutation, false);
assert.equal(promoted.publicPromotion.publishedPersonCount, 1);
assert.equal(promoted.publicPromotion.publishedObservanceCount, 1);

const person = promoted.people.find((item) => item.entityId === 'wikidata:Q1');
assert.equal(person.validationStatus, 'cross-checked');
assert.equal(person.publicationStatus, 'published');
assert.equal(person.publicationScope, 'identity-observance-only');
assert.equal(person.birth, null, 'single-source profile date must stay out of public scope');
assert.equal(person.death, null, 'single-source profile date must stay out of public scope');
assert.deepEqual(person.places, [], 'single-source place facts must stay out of public scope');
assert.deepEqual(person.traditions, ['roman-catholic']);
assert.deepEqual(person.categories, ['saint']);
assert.equal(person.publicEvidence.length, 3);

const withheld = promoted.people.find((item) => item.entityId === 'wikidata:Q2');
assert.equal(withheld.validationStatus, 'provisional');
assert.equal(withheld.publicationStatus, 'withheld');

const event = promoted.unlinkedObservances.find((item) => item.id === 'reviewed-08-24');
assert.equal(event.validationStatus, 'cross-checked');
assert.equal(event.publicationStatus, 'published');
assert.equal(event.personEntityId, 'wikidata:Q1');
assert.equal(event.churchId, 'roman-catholic');

const publicExport = buildNavigationExports(promoted, { mode: 'public', locale: 'pt' });
assert.equal(publicExport.manifest.personCount, 1);
assert.equal(publicExport.manifest.mapFeatureCount, 0, 'withheld single-source places must not leak into public map');
assert.equal(publicExport.manifest.timelineItemCount, 0, 'withheld single-source dates must not leak into public timeline');
assert.equal(publicExport.manifest.calendarDayCount, 1);
assert.equal(publicExport.calendar.days['08-24'][0].entityId, 'wikidata:Q1');
assert.equal(publicExport.calendar.days['08-24'][0].publicationStatus, 'published');
assert.equal(publicExport.calendar.days['08-25'], undefined);

assert.throws(
  () => promoteReviewedNavigation(source, {
    ...ledger,
    decisions: [{ ...ledger.decisions[0], personEntityId: 'wikidata:Q2', observanceIds: ['unreviewed-08-25'] }],
  }),
  /not explicitly reviewed-linked/,
);

const weakSource = structuredClone(source);
weakSource.unlinkedObservances[0].linkReview.evidenceSources = [
  { sourceId: 'vatican-news-saint-of-day-pt', sourceFamily: 'vatican-news', reference: 'pt-calendar:08-24' },
  { sourceId: 'vatican-news-copy', sourceFamily: 'vatican-news', reference: 'copy' },
];
assert.throws(() => promoteReviewedNavigation(weakSource, ledger), /two independent source families/);

assert.throws(
  () => promoteReviewedNavigation(source, { ...ledger, publicationAllowed: true }),
  /Publication ledger must remain staging-only/,
);

console.log('Reviewed saint navigation promotion tests passed.');

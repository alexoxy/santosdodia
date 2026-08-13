import assert from 'node:assert/strict';
import { buildNavigationExports, centuryForYear } from './build-navigation-exports.mjs';
import { proposeLiturgicalPersonLinks } from './propose-liturgical-person-links.mjs';

assert.equal(centuryForYear(1), 1);
assert.equal(centuryForYear(100), 1);
assert.equal(centuryForYear(101), 2);
assert.equal(centuryForYear(1200), 12);
assert.equal(centuryForYear(-1), -1);
assert.equal(centuryForYear(0), null);

const input = {
  schemaVersion: 1,
  datasetVersion: 'test-v1',
  sourceSha256: 'a'.repeat(64),
  publicationAllowed: false,
  productionMutation: false,
  people: [
    {
      entityId: 'wikidata:Q1',
      qid: 'Q1',
      canonicalName: 'Lawrence',
      names: { pt: 'São Lourenço', en: 'Saint Lawrence' },
      aliases: { pt: [] },
      birth: { year: 225, precision: 'year' },
      death: { year: 258, precision: 'year' },
      traditions: ['roman-catholic'],
      categories: ['martyr'],
      validationStatus: 'verified',
      publicationStatus: 'published',
      places: [
        {
          placeId: 'wikidata:Q220',
          relationType: 'martyrdom',
          currentName: 'Roma',
          historicalName: 'Roma, Império Romano',
          countryCode: 'IT',
          lat: 41.8933,
          lon: 12.4829,
          confidence: 0.9,
          sourceIds: ['wikidata', 'vatican-news-saint-of-day-pt']
        }
      ],
      observances: [
        { id: 'lawrence-08-10', month: 8, day: 10, names: { pt: 'São Lourenço' }, churchId: 'roman-catholic', validationStatus: 'verified', publicationStatus: 'published' }
      ]
    },
    {
      entityId: 'wikidata:Q2',
      qid: 'Q2',
      names: { pt: 'Candidato retido' },
      aliases: { pt: [{ value: 'Nome Alternativo', status: 'source', scriptStatus: 'expected' }] },
      death: { year: 900 },
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
      places: [{ relationType: 'death', lat: 40, lon: -8 }],
      observances: [{ id: 'withheld-01-01', month: 1, day: 1, names: { pt: 'Candidato retido' }, validationStatus: 'provisional', publicationStatus: 'withheld' }]
    }
  ],
  unlinkedObservances: [
    {
      id: 'vatican-withheld-08-10',
      month: 8,
      day: 10,
      personEntityId: null,
      personLinkStatus: 'unresolved',
      names: { pt: { value: 'S. Lourenço', status: 'source' } },
      churchId: 'roman-catholic',
      sourceIds: ['vatican-news-saint-of-day-pt'],
      validationStatus: 'provisional',
      publicationStatus: 'withheld'
    },
    {
      id: 'vatican-published-08-11',
      month: 8,
      day: 11,
      personEntityId: null,
      personLinkStatus: 'unresolved',
      names: { pt: { value: 'Nome Alternativo', status: 'source' } },
      churchId: 'roman-catholic',
      sourceIds: ['vatican-news-saint-of-day-pt'],
      validationStatus: 'verified',
      publicationStatus: 'published'
    }
  ]
};

const staging = buildNavigationExports(input, { mode: 'staging', locale: 'pt' });
assert.equal(staging.manifest.personCount, 2);
assert.equal(staging.manifest.mapFeatureCount, 2);
assert.equal(staging.timeline.byCentury['3'].includes('wikidata:Q1'), true);
assert.equal(staging.calendar.days['08-10'].some((item) => item.entityId === 'wikidata:Q1'), true);
const unresolved = staging.calendar.days['08-10'].find((item) => item.observanceId === 'vatican-withheld-08-10');
assert.equal(unresolved.entityId, null);
assert.equal(unresolved.personLinkStatus, 'unresolved');
assert.equal(unresolved.name, 'S. Lourenço');
assert.deepEqual(unresolved.sourceIds, ['vatican-news-saint-of-day-pt']);
assert.equal(staging.manifest.unlinkedCalendarEntryCount, 2);
assert.equal(staging.manifest.productionMutation, false);
assert.match(staging.map.features[0].type, /Feature/);

const publicExport = buildNavigationExports(input, { mode: 'public', locale: 'pt' });
assert.equal(publicExport.manifest.personCount, 1);
assert.equal(publicExport.manifest.mapFeatureCount, 1);
assert.equal(publicExport.calendar.days['01-01'], undefined);
assert.equal(publicExport.calendar.days['08-10'].some((item) => item.observanceId === 'vatican-withheld-08-10'), false);
assert.equal(publicExport.calendar.days['08-11'][0].observanceId, 'vatican-published-08-11');
assert.equal(publicExport.calendar.days['08-11'][0].entityId, null);
assert.equal(publicExport.saints[0].name, 'São Lourenço');
assert.equal(publicExport.map.features[0].properties.historicalName, 'Roma, Império Romano');
assert.equal(publicExport.map.features[0].geometry.coordinates[0], 12.4829);

const proposals = proposeLiturgicalPersonLinks(input);
assert.equal(proposals.policy.nameOnlyIdentityMergeForbidden, true);
assert.equal(proposals.policy.publicationAllowed, false);
assert.equal(proposals.proposals[0].status, 'candidate-review-required');
assert.deepEqual(proposals.proposals[0].candidatePersonIds, ['wikidata:Q1']);
assert.equal(proposals.proposals[0].matchMethod, 'exact-title-stripped-pt-name');
assert.equal(proposals.proposals[1].status, 'candidate-review-required');
assert.deepEqual(proposals.proposals[1].candidatePersonIds, ['wikidata:Q2']);
assert.equal(proposals.proposals.every((item) => item.automaticLinkAllowed === false), true);

console.log('Saints navigation export tests passed.');

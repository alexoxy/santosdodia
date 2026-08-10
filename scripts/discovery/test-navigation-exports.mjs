import assert from 'node:assert/strict';
import { buildNavigationExports, centuryForYear } from './build-navigation-exports.mjs';

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
  people: [
    {
      entityId: 'wikidata:Q1',
      qid: 'Q1',
      canonicalName: 'Lawrence',
      names: { pt: 'São Lourenço', en: 'Saint Lawrence' },
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
        { id: 'lawrence-08-10', month: 8, day: 10, churchId: 'roman-catholic', validationStatus: 'verified', publicationStatus: 'published' }
      ]
    },
    {
      entityId: 'wikidata:Q2',
      qid: 'Q2',
      names: { pt: 'Candidato retido' },
      death: { year: 900 },
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
      places: [{ relationType: 'death', lat: 40, lon: -8 }],
      observances: [{ id: 'withheld-01-01', month: 1, day: 1, publicationStatus: 'withheld' }]
    }
  ]
};

const staging = buildNavigationExports(input, { mode: 'staging', locale: 'pt' });
assert.equal(staging.manifest.personCount, 2);
assert.equal(staging.manifest.mapFeatureCount, 2);
assert.equal(staging.timeline.byCentury['3'].includes('wikidata:Q1'), true);
assert.equal(staging.calendar.days['08-10'][0].entityId, 'wikidata:Q1');
assert.equal(staging.manifest.productionMutation, false);
assert.match(staging.map.features[0].type, /Feature/);

const publicExport = buildNavigationExports(input, { mode: 'public', locale: 'pt' });
assert.equal(publicExport.manifest.personCount, 1);
assert.equal(publicExport.manifest.mapFeatureCount, 1);
assert.equal(publicExport.calendar.days['01-01'], undefined);
assert.equal(publicExport.saints[0].name, 'São Lourenço');
assert.equal(publicExport.map.features[0].properties.historicalName, 'Roma, Império Romano');
assert.equal(publicExport.map.features[0].geometry.coordinates[0], 12.4829);

console.log('Saints navigation export tests passed.');

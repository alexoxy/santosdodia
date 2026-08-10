import assert from 'node:assert/strict';
import { buildProfileQuery, normalizeProfileBindings, parsePoint } from './wikidata-profile-core.mjs';

assert.match(buildProfileQuery(['Q1', 'Q2']), /VALUES \?item \{ wd:Q1 wd:Q2 \}/u);
assert.match(buildProfileQuery(['Q1']), /wdt:P19/u);
assert.match(buildProfileQuery(['Q1']), /wdt:P20/u);
assert.throws(() => buildProfileQuery(['Q1', 'Q1']), /unique exact Wikidata QIDs/);
assert.throws(() => buildProfileQuery(['Saint Lawrence']), /exact Wikidata QIDs/);
assert.deepEqual(parsePoint('Point(12.4829 41.8933)'), { lat: 41.8933, lon: 12.4829 });
assert.equal(parsePoint('Point(500 20)'), null);

const response = {
  results: {
    bindings: [
      {
        item: { value: 'http://www.wikidata.org/entity/Q1' },
        birth: { value: '+0225-01-01T00:00:00Z' },
        death: { value: '+0258-08-10T00:00:00Z' },
        relationType: { value: 'death' },
        place: { value: 'http://www.wikidata.org/entity/Q220' },
        placeLabel: { value: 'Roma' },
        coord: { value: 'Point(12.4829 41.8933)' },
        country: { value: 'http://www.wikidata.org/entity/Q38' },
        countryLabel: { value: 'Itália' }
      },
      {
        item: { value: 'http://www.wikidata.org/entity/Q2' }
      }
    ]
  }
};

const normalized = normalizeProfileBindings(response, ['Q1', 'Q2']);
assert.equal(normalized.entityCount, 2);
assert.equal(normalized.entities[0].entityId, 'wikidata:Q1');
assert.equal(normalized.entities[0].identityBasis, 'exact-wikidata-identifier');
assert.equal(normalized.entities[0].dates.death.resolutionStatus, 'single-source-value');
assert.equal(normalized.entities[0].places[0].historicalName, null);
assert.equal(normalized.entities[0].places[0].currentName, 'Roma');
assert.equal(normalized.entities[0].places[0].lat, 41.8933);
assert.equal(normalized.entities[0].historicalGeographyStatus, 'not-inferred');
assert.equal(normalized.entities[0].publish, false);
assert.equal(normalized.entities[1].dates.birth.resolutionStatus, 'missing');
assert.equal(normalized.productionMutation, false);

const unexpected = structuredClone(response);
unexpected.results.bindings[0].item.value = 'http://www.wikidata.org/entity/Q999';
assert.throws(() => normalizeProfileBindings(unexpected, ['Q1', 'Q2']), /unexpected entity/);

console.log('Wikidata profile enrichment core tests passed.');

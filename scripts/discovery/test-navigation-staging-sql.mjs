import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { buildNavigationStagingSql } from './build-navigation-staging-sql.mjs';

const source = {
  schemaVersion: 1,
  datasetVersion: 'navigation-v1:test',
  identityRootSha256: 'a'.repeat(64),
  sourceSha256: 'b'.repeat(64),
  generatedAt: '2026-08-10T22:00:00Z',
  publicationAllowed: false,
  productionMutation: false,
  people: [
    {
      entityId: 'wikidata:Q1', qid: 'Q1', names: { pt: 'São Lourenço', en: 'Saint Lawrence' },
      birth: { year: 225 }, death: { year: 258 }, validationStatus: 'provisional',
      places: [{ relationType: 'death', placeId: 'wikidata:Q220', currentName: 'Roma', historicalName: null, lat: 41.8933, lon: 12.4829, confidence: 0.68, sourceIds: ['wikidata'] }],
      observances: []
    }
  ],
  unlinkedObservances: [
    {
      id: 'vatican-08-10', personEntityId: null, personLinkStatus: 'unresolved', month: 8, day: 10,
      churchId: 'roman-catholic', jurisdictionId: 'holy-see', validationStatus: 'provisional',
      names: { pt: { value: 'S. Lourenço, diácono e mártir', status: 'source' } },
      sourceIds: ['vatican-news-saint-of-day-pt']
    }
  ]
};
const readiness = {
  schemaVersion: 1,
  identityRootSha256: source.identityRootSha256,
  datasetVersion: source.datasetVersion,
  status: 'partial-staging',
  publicationAllowed: false,
  productionMutation: false
};

const built = buildNavigationStagingSql(source, readiness);
if (built.personCount !== 1 || built.placeCount !== 1 || built.observanceCount !== 1) throw new Error('Staging counts are incorrect.');
if (!built.datasetId.startsWith('navigation-')) throw new Error('Dataset id is not deterministic.');
if (!built.sql.includes("'staging'")) throw new Error('Staging SQL does not declare staging status.');
if (built.sql.includes("'published'")) throw new Error('Staging SQL contains published status.');
if (/active\s*=\s*1/iu.test(built.sql)) throw new Error('Staging SQL activates a dataset.');

const db = new DatabaseSync(':memory:');
try {
  db.exec(fs.readFileSync('db/migrations/0011_saints_navigation_read_model.sql', 'utf8'));
  db.exec(built.sql);
  const dataset = db.prepare('SELECT status, active, person_count, place_count, observance_count FROM saint_navigation_datasets').get();
  if (dataset.status !== 'staging' || dataset.active !== 0) throw new Error('Generated dataset escaped staging.');
  if (dataset.person_count !== 1 || dataset.place_count !== 1 || dataset.observance_count !== 1) throw new Error('Dataset counters do not match projection.');
  const person = db.prepare('SELECT entity_id, qid, century FROM saint_navigation_people').get();
  if (person.entity_id !== 'wikidata:Q1' || person.qid !== 'Q1' || person.century !== 3) throw new Error('Person projection is incorrect.');
  const observance = db.prepare('SELECT entity_id, person_link_status, month, day FROM saint_navigation_observances').get();
  if (observance.entity_id !== null || observance.person_link_status !== 'unresolved' || observance.month !== 8 || observance.day !== 10) throw new Error('Unresolved observance semantics were lost.');
  const label = db.prepare("SELECT name, label_status FROM saint_navigation_observance_labels WHERE locale='pt'").get();
  if (label.name !== 'S. Lourenço, diácono e mártir' || label.label_status !== 'source') throw new Error('Source label was not preserved.');
} finally {
  db.close();
}

const blocked = { ...readiness, status: 'blocked' };
let rejected = false;
try { buildNavigationStagingSql(source, blocked); } catch { rejected = true; }
if (!rejected) throw new Error('Blocked navigation source was allowed into staging SQL.');

const unsafe = { ...source, publicationAllowed: true };
rejected = false;
try { buildNavigationStagingSql(unsafe, readiness); } catch { rejected = true; }
if (!rejected) throw new Error('Publication-open navigation source was accepted.');

console.log('Staging-only saints navigation SQL generation tests passed.');

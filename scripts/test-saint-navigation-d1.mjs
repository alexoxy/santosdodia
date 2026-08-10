import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(path.resolve('lib/saint-navigation-d1.ts')).href;
const {
  readActiveNavigationDataset,
  readSaintMapPoints,
  readSaintTimeline,
  readDailySaints,
  readSaintPlaces
} = await import(moduleUrl);

const calls = [];
let nextRows = [];
const db = {
  prepare(sql) {
    return {
      bind(...params) {
        calls.push({ sql, params });
        return { async all() { return { success: true, results: nextRows }; } };
      }
    };
  }
};

nextRows = [{ id: 'nav-1', identity_root_sha256: 'a'.repeat(64), source_sha256: 'b'.repeat(64), generated_at: '2026-08-10T00:00:00Z', published_at: '2026-08-10T01:00:00Z', person_count: 100, place_count: 80, observance_count: 400 }];
const status = await readActiveNavigationDataset(db);
if (status?.id !== 'nav-1' || status.personCount !== 100) throw new Error('Active dataset status was not mapped.');
if (!calls.at(-1).sql.includes("active = 1 AND status = 'published'")) throw new Error('Dataset status read does not fail closed to active published data.');

nextRows = [{ id: 'point-1', entity_id: 'wikidata:Q1', qid: 'Q1', name: 'São Lourenço', relation_type: 'martyrdom', place_id: 'wikidata:Q220', current_name: 'Roma', historical_name: 'Roma, Império Romano', country_code: 'IT', latitude: 41.8933, longitude: 12.4829, century: 3, anchor_year: 225, confidence: 0.9, source_ids_json: '["wikidata","vatican"]' }];
const map = await readSaintMapPoints(db, { locale: 'pt', century: 3, countryCode: 'it', relationType: 'martyrdom', limit: 10 });
if (map[0].name !== 'São Lourenço' || map[0].historicalName !== 'Roma, Império Romano') throw new Error('Map point metadata was lost.');
const mapCall = calls.at(-1);
if (!mapCall.sql.includes("d.active = 1") || !mapCall.sql.includes("d.status = 'published'")) throw new Error('Map read does not require an active published dataset.');
if (mapCall.params.join('|') !== 'pt|3|IT|martyrdom|10') throw new Error(`Unexpected map params: ${mapCall.params.join('|')}`);

nextRows = [{ entity_id: 'wikidata:Q1', qid: 'Q1', name: 'São Lourenço', birth_year: 225, death_year: 258, anchor_year: 225, century: 3 }];
const timeline = await readSaintTimeline(db, { locale: 'pt', fromYear: 200, toYear: 300, limit: 20, offset: 0 });
if (timeline[0].century !== 3 || timeline[0].deathYear !== 258) throw new Error('Timeline row was not mapped.');
if (!calls.at(-1).sql.includes('p.anchor_year IS NOT NULL')) throw new Error('Timeline permits undated rows.');

nextRows = [{ id: 'lawrence-08-10', entity_id: null, person_link_status: 'unresolved', name: 'S. Lourenço, diácono e mártir', month: 8, day: 10, church_id: 'roman-catholic', jurisdiction_id: 'holy-see', rank_code: 'feast', validation_status: 'verified', source_ids_json: '["vatican-news-saint-of-day-pt"]' }];
const day = await readDailySaints(db, { locale: 'pt', month: 8, day: 10, churchId: 'roman-catholic' });
if (day[0].entityId !== undefined || day[0].personLinkStatus !== 'unresolved') throw new Error('Unlinked official observance was incorrectly forced onto a Person.');
if (day[0].sourceIds[0] !== 'vatican-news-saint-of-day-pt') throw new Error('Daily source provenance was lost.');

nextRows = [{ place_id: 'wikidata:Q220', current_name: 'Roma', country_code: 'IT', saint_count: 37 }];
const places = await readSaintPlaces(db, { locale: 'pt', countryCode: 'it', limit: 25, offset: 0 });
if (places[0].saintCount !== 37 || places[0].placeName !== 'Roma') throw new Error('Place summary was not mapped.');

for (const invalid of [
  () => readSaintMapPoints(db, { locale: '../pt' }),
  () => readSaintMapPoints(db, { locale: 'pt', countryCode: 'ITALY' }),
  () => readSaintMapPoints(db, { locale: 'pt', relationType: 'invented' }),
  () => readSaintTimeline(db, { locale: 'pt', limit: 0 }),
  () => readDailySaints(db, { locale: 'pt', month: 13, day: 1 })
]) {
  let rejected = false;
  try { await invalid(); } catch { rejected = true; }
  if (!rejected) throw new Error('Invalid navigation filter was accepted.');
}

const failingDb = { prepare() { return { bind() { return { async all() { return { success: false, error: 'boom' }; } }; } }; } };
let failedClosed = false;
try { await readActiveNavigationDataset(failingDb); } catch { failedClosed = true; }
if (!failedClosed) throw new Error('D1 navigation errors did not fail closed.');

console.log('Publication-safe saints navigation D1 read model tests passed.');

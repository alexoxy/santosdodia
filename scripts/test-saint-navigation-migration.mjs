import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
function expectConstraint(label, operation) {
  try { operation(); } catch { return; }
  throw new Error(`${label} did not trigger the expected constraint.`);
}
function scalar(sql) { return Number(db.prepare(sql).get().value); }

try {
  db.exec(fs.readFileSync(path.resolve('db/migrations/0011_saints_navigation_read_model.sql'), 'utf8'));

  expectConstraint('Active staging dataset', () => db.exec(`
    INSERT INTO saint_navigation_datasets (
      id, identity_root_sha256, source_sha256, status, generated_at, active
    ) VALUES ('bad-staging', '${'a'.repeat(64)}', '${'b'.repeat(64)}', 'staging', '2026-08-10T22:00:00Z', 1);
  `));

  db.exec(`
    INSERT INTO saint_navigation_datasets (
      id, identity_root_sha256, source_sha256, status, generated_at, published_at, active,
      person_count, place_count, observance_count
    ) VALUES (
      'published-a', '${'a'.repeat(64)}', '${'b'.repeat(64)}', 'published',
      '2026-08-10T22:00:00Z', '2026-08-10T22:30:00Z', 1, 1, 1, 2
    );
  `);

  expectConstraint('Second active dataset', () => db.exec(`
    INSERT INTO saint_navigation_datasets (
      id, identity_root_sha256, source_sha256, status, generated_at, published_at, active
    ) VALUES (
      'published-b', '${'c'.repeat(64)}', '${'d'.repeat(64)}', 'published',
      '2026-08-10T22:00:00Z', '2026-08-10T22:30:00Z', 1
    );
  `));

  db.exec(`
    INSERT INTO saint_navigation_people (
      dataset_id, entity_id, qid, birth_year, death_year, anchor_year, century, validation_status
    ) VALUES ('published-a', 'wikidata:Q1', 'Q1', 225, 258, 225, 3, 'verified');
    INSERT INTO saint_navigation_person_labels (
      dataset_id, entity_id, locale, name, label_status
    ) VALUES ('published-a', 'wikidata:Q1', 'pt', 'São Lourenço', 'reviewed');
    INSERT INTO saint_navigation_places (
      id, dataset_id, entity_id, relation_type, place_id, current_name,
      historical_name, country_code, latitude, longitude, confidence, source_ids_json
    ) VALUES (
      'point-1', 'published-a', 'wikidata:Q1', 'martyrdom', 'wikidata:Q220', 'Roma',
      'Roma, Império Romano', 'IT', 41.8933, 12.4829, 0.9, '["wikidata"]'
    );
    INSERT INTO saint_navigation_observances (
      id, dataset_id, entity_id, person_link_status, month, day, church_id,
      jurisdiction_id, rank_code, validation_status, source_ids_json
    ) VALUES (
      'linked-08-10', 'published-a', 'wikidata:Q1', 'linked', 8, 10,
      'roman-catholic', 'holy-see', 'feast', 'verified', '["vatican"]'
    );
    INSERT INTO saint_navigation_observances (
      id, dataset_id, entity_id, person_link_status, month, day, church_id,
      jurisdiction_id, validation_status, source_ids_json
    ) VALUES (
      'unresolved-08-10', 'published-a', NULL, 'unresolved', 8, 10,
      'roman-catholic', 'holy-see', 'verified', '["vatican"]'
    );
    INSERT INTO saint_navigation_observance_labels (
      dataset_id, observance_id, locale, name, label_status
    ) VALUES
      ('published-a', 'linked-08-10', 'pt', 'São Lourenço', 'reviewed'),
      ('published-a', 'unresolved-08-10', 'pt', 'Santo ainda não ligado', 'source');
  `);

  expectConstraint('Malformed QID', () => db.exec(`
    INSERT INTO saint_navigation_people (
      dataset_id, entity_id, qid, validation_status
    ) VALUES ('published-a', 'bad-qid', 'Q1abc', 'verified');
  `));
  expectConstraint('Linked observance without person', () => db.exec(`
    INSERT INTO saint_navigation_observances (
      id, dataset_id, entity_id, person_link_status, month, day, validation_status
    ) VALUES ('bad-linked', 'published-a', NULL, 'linked', 1, 1, 'verified');
  `));
  expectConstraint('Unresolved observance with forced person', () => db.exec(`
    INSERT INTO saint_navigation_observances (
      id, dataset_id, entity_id, person_link_status, month, day, validation_status
    ) VALUES ('bad-unresolved', 'published-a', 'wikidata:Q1', 'unresolved', 1, 2, 'verified');
  `));
  expectConstraint('Invalid latitude', () => db.exec(`
    INSERT INTO saint_navigation_places (
      id, dataset_id, entity_id, relation_type, latitude, longitude
    ) VALUES ('bad-point', 'published-a', 'wikidata:Q1', 'birth', 91, 0);
  `));

  const foreignKeyErrors = db.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeyErrors.length) throw new Error(`Foreign-key validation returned ${foreignKeyErrors.length} error(s).`);
  if (scalar("SELECT COUNT(*) AS value FROM saint_navigation_observances WHERE dataset_id='published-a'") !== 2) throw new Error('Expected both linked and unresolved observations.');

  db.exec("DELETE FROM saint_navigation_datasets WHERE id='published-a'");
  for (const table of ['saint_navigation_people','saint_navigation_person_labels','saint_navigation_places','saint_navigation_observances','saint_navigation_observance_labels']) {
    if (scalar(`SELECT COUNT(*) AS value FROM ${table}`) !== 0) throw new Error(`${table} did not cascade on dataset deletion.`);
  }

  console.log('Saints navigation projection migration tests passed.');
} finally {
  db.close();
}

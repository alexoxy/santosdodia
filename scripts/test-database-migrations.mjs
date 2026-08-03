import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const root = process.cwd();
const output = path.join(os.tmpdir(), `santosdia-calendar-db-${process.pid}.sql`);
const database = new DatabaseSync(':memory:');

function count(table) {
  return Number(database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count);
}

function expectConstraint(label, operation) {
  try {
    operation();
  } catch {
    return;
  }
  throw new Error(`${label} did not trigger the expected database constraint.`);
}

try {
  database.exec(fs.readFileSync(path.join(root, 'db/migrations/0001_ecclesiastical_directory.sql'), 'utf8'));
  database.exec(fs.readFileSync(path.join(root, 'db/migrations/0002_multichurch_calendar.sql'), 'utf8'));

  database.exec(`
    INSERT INTO churches (
      id, family, tradition, canonical_name, active, first_seen_at, last_verified_at
    ) VALUES (
      'eastern-orthodox', 'orthodox', 'byzantine', 'Eastern Orthodox Church', 1,
      '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z'
    );
    INSERT INTO jurisdictions (
      id, church_id, level, canonical_name, country_code, official_url,
      first_seen_at, last_verified_at
    ) VALUES (
      'oca', 'eastern-orthodox', 'autocephalous-church',
      'Orthodox Church in America', 'US', 'https://www.oca.org/',
      '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z'
    );
  `);

  const generated = spawnSync(process.execPath, [
    'scripts/build-calendar-staging-sql.mjs',
    '--input', 'test/fixtures/calendar-staging.valid.json',
    '--output', output
  ], { cwd: root, encoding: 'utf8' });

  if (generated.status !== 0) {
    throw new Error(`Calendar SQL generation failed:\n${generated.stdout}\n${generated.stderr}`);
  }

  const sql = fs.readFileSync(output, 'utf8');
  database.exec(sql);
  database.exec(sql);

  const expectedCounts = {
    calendar_import_runs: 1,
    source_registry: 1,
    calendar_sources: 1,
    calendar_observances: 1,
    jurisdiction_calendar_policies: 1,
    calendar_rules: 1,
    calendar_occurrences: 1,
    calendar_occurrence_assertions: 1,
    calendar_occurrence_labels: 2
  };

  for (const [table, expected] of Object.entries(expectedCounts)) {
    const actual = count(table);
    if (actual !== expected) {
      throw new Error(`${table} expected ${expected} row(s) after idempotent replay, found ${actual}.`);
    }
  }

  const foreignKeyErrors = database.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeyErrors.length) {
    throw new Error(`Foreign-key validation returned ${foreignKeyErrors.length} error(s).`);
  }

  database.exec(`
    INSERT INTO source_registry (
      id, name, base_url, host, authority, adapter, usage_policy,
      refresh_hours, requests_per_second, active
    ) VALUES (
      'global-calendar-test', 'Global calendar test', 'https://example.invalid/calendar',
      'example.invalid', 'test-fixture', 'test', 'test-only', 168, 0.1, 1
    );
    INSERT INTO calendar_sources (
      id, church_id, jurisdiction_id, usage_policy, active
    ) VALUES ('global-calendar-test', 'eastern-orthodox', NULL, 'test-only', 1);
    INSERT INTO calendar_observances (
      id, church_id, canonical_key, active, created_at, updated_at
    ) VALUES (
      'global-test-observance', 'eastern-orthodox', 'global-test-observance', 1,
      '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z'
    );
    INSERT INTO calendar_occurrences (
      id, import_run_id, church_id, jurisdiction_id, canonical_event_id,
      date_iso, validation_status, publication_status, created_at, updated_at
    ) VALUES (
      'global-test-occurrence-1', 'calendar-test-2026', 'eastern-orthodox', NULL,
      'global-test-observance', '2026-05-01', 'verified', 'withheld',
      '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z'
    );
  `);

  expectConstraint('Global occurrence uniqueness', () => database.exec(`
    INSERT INTO calendar_occurrences (
      id, import_run_id, church_id, jurisdiction_id, canonical_event_id,
      date_iso, validation_status, publication_status, created_at, updated_at
    ) VALUES (
      'global-test-occurrence-2', 'calendar-test-2026', 'eastern-orthodox', NULL,
      'global-test-observance', '2026-05-01', 'verified', 'withheld',
      '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z'
    );
  `));

  expectConstraint('Assertion checksum validation', () => database.exec(`
    INSERT INTO calendar_occurrence_assertions (
      id, occurrence_id, source_id, asserted_date_iso, source_record_hash,
      observed_at, validation_status
    ) VALUES (
      'invalid-hash-assertion', 'global-test-occurrence-1', 'global-calendar-test',
      '2026-05-01', 'not-a-sha256', '2026-08-03T10:00:00Z', 'verified'
    );
  `));

  database.exec(`
    BEGIN IMMEDIATE;
    INSERT INTO calendar_import_runs (
      id, created_at, retrieved_at, dropbox_manifest_path, manifest_sha256, status
    ) VALUES (
      'rollback-test', '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z',
      '/Santos do Dia/02_Dados_Eclesiasticos/99_Manifestos/rollback-test.json',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'provisional'
    );
    ROLLBACK;
  `);

  if (database.prepare("SELECT COUNT(*) AS count FROM calendar_import_runs WHERE id='rollback-test'").get().count !== 0) {
    throw new Error('Rollback test left a partial import run in the database.');
  }

  console.log('Database migration and transactional promotion tests passed.');
} finally {
  database.close();
  fs.rmSync(output, { force: true });
}

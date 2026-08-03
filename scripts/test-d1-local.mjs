import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-d1-'));
const persist = path.join(work, 'state');
const config = path.join(work, 'wrangler.d1-test.jsonc');
const seed = path.join(work, 'seed.sql');
const packageSql = path.join(work, 'calendar-package.sql');
const wrangler = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true' },
    ...options
  });
  if (result.status !== 0) {
    throw new Error([
      `${path.basename(command)} ${args.join(' ')} failed with exit code ${result.status}.`,
      result.stdout,
      result.stderr
    ].filter(Boolean).join('\n'));
  }
  return result.stdout.trim();
}

function d1(args) {
  return run(wrangler, [
    'd1', ...args,
    '--local',
    '--persist-to', persist,
    '--config', config
  ]);
}

try {
  fs.writeFileSync(config, `${JSON.stringify({
    name: 'santosdodia-d1-compatibility-test',
    compatibility_date: '2026-08-02',
    d1_databases: [{
      binding: 'DATA_DB',
      database_name: 'santosdodia-architecture-test',
      database_id: '00000000-0000-0000-0000-000000000001',
      migrations_dir: 'db/migrations',
      migrations_table: 'd1_migrations'
    }]
  }, null, 2)}\n`, 'utf8');

  d1(['execute', 'DATA_DB', '--file', 'db/migrations/0001_ecclesiastical_directory.sql', '--yes']);
  d1(['execute', 'DATA_DB', '--file', 'db/migrations/0002_multichurch_calendar.sql', '--yes']);

  fs.writeFileSync(seed, `
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
  `, 'utf8');
  d1(['execute', 'DATA_DB', '--file', seed, '--yes']);

  run(process.execPath, [
    'scripts/build-calendar-staging-sql.mjs',
    '--input', 'test/fixtures/calendar-staging.valid.json',
    '--output', packageSql
  ]);

  d1(['execute', 'DATA_DB', '--file', packageSql, '--yes']);
  d1(['execute', 'DATA_DB', '--file', packageSql, '--yes']);

  const output = d1([
    'execute', 'DATA_DB',
    '--command', `SELECT
      (SELECT COUNT(*) FROM calendar_import_runs) AS import_runs,
      (SELECT COUNT(*) FROM calendar_occurrences) AS occurrences,
      (SELECT COUNT(*) FROM calendar_occurrence_assertions) AS assertions,
      (SELECT COUNT(*) FROM calendar_occurrence_labels) AS labels`,
    '--json'
  ]);
  const parsed = JSON.parse(output);
  const row = (Array.isArray(parsed) ? parsed : [parsed])
    .flatMap(item => Array.isArray(item?.results) ? item.results : [])
    .at(0);

  const expected = { import_runs: 1, occurrences: 1, assertions: 1, labels: 2 };
  if (!row) throw new Error('Wrangler returned no D1 validation row.');
  for (const [field, value] of Object.entries(expected)) {
    if (Number(row[field]) !== value) {
      throw new Error(`D1 ${field} expected ${value}, found ${String(row[field])}.`);
    }
  }

  console.log('Wrangler D1 local compatibility and idempotent promotion tests passed.');
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}

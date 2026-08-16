import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const input = argument('--input');
if (!input) throw new Error('Usage: node scripts/build/test-roman-catholic-d1-release.mjs --input <build-report.json>');

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-release-'));
const sqlPath = path.join(temporary, 'release.sql');
const manifestPath = path.join(temporary, 'release.json');
const dropboxPath = '/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/test/manifest.json';

const generated = spawnSync(process.execPath, [
  'scripts/build/roman-catholic-d1-release.mjs',
  '--input', input,
  '--sql', sqlPath,
  '--manifest', manifestPath,
  '--dropbox-manifest-path', dropboxPath,
  '--publication-status', 'publishable',
], { encoding: 'utf8' });
if (generated.status !== 0) throw new Error(`Release generation failed:\n${generated.stdout}\n${generated.stderr}`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const database = new DatabaseSync(':memory:');
try {
  database.exec(fs.readFileSync('db/migrations/0001_ecclesiastical_directory.sql', 'utf8'));
  database.exec(fs.readFileSync('db/migrations/0002_multichurch_calendar.sql', 'utf8'));
  database.exec(fs.readFileSync(sqlPath, 'utf8'));
  database.exec(fs.readFileSync(sqlPath, 'utf8'));

  const scalar = (query, params = []) => database.prepare(query).get(...params);
  const occurrenceCount = Number(scalar("SELECT COUNT(*) AS n FROM calendar_occurrences WHERE church_id='roman-catholic' AND jurisdiction_id='pt' AND date_iso BETWEEN '2026-01-01' AND '2026-12-31'").n);
  const uniqueDates = Number(scalar("SELECT COUNT(DISTINCT date_iso) AS n FROM calendar_occurrences WHERE church_id='roman-catholic' AND jurisdiction_id='pt' AND date_iso BETWEEN '2026-01-01' AND '2026-12-31'").n);
  const labelCount = Number(scalar("SELECT COUNT(*) AS n FROM calendar_occurrence_labels l JOIN calendar_occurrences o ON o.id=l.occurrence_id WHERE o.church_id='roman-catholic' AND o.jurisdiction_id='pt' AND o.date_iso BETWEEN '2026-01-01' AND '2026-12-31'").n);
  const dateAssertions = Number(scalar("SELECT COUNT(*) AS n FROM calendar_occurrence_assertions a JOIN calendar_occurrences o ON o.id=a.occurrence_id WHERE o.church_id='roman-catholic' AND o.jurisdiction_id='pt' AND o.date_iso BETWEEN '2026-01-01' AND '2026-12-31'").n);
  const generalRomanAssertions = Number(scalar("SELECT COUNT(*) AS n FROM calendar_occurrence_assertions a JOIN calendar_occurrences o ON o.id=a.occurrence_id WHERE o.church_id='roman-catholic' AND o.jurisdiction_id='pt' AND a.source_id='litcal-api' AND o.date_iso BETWEEN '2026-01-01' AND '2026-12-31'").n);
  const snlDateAssertions = Number(scalar("SELECT COUNT(*) AS n FROM calendar_occurrence_assertions a JOIN calendar_occurrences o ON o.id=a.occurrence_id WHERE o.church_id='roman-catholic' AND o.jurisdiction_id='pt' AND a.source_id='portugal-national-liturgy-secretariat' AND o.date_iso BETWEEN '2026-01-01' AND '2026-12-31'").n);
  const labelAssertions = Number(scalar("SELECT COUNT(*) AS n FROM source_assertions WHERE subject_type='calendar-occurrence' AND field LIKE 'label.%'").n);
  const categorized = Number(scalar("SELECT COUNT(*) AS n FROM calendar_occurrences o JOIN calendar_observances ob ON ob.id=o.canonical_event_id WHERE o.church_id='roman-catholic' AND o.jurisdiction_id='pt' AND ob.category IN ('saint','feast','marian','apostle','martyr','fast')").n);

  const expected = {
    occurrences: manifest.expectedOccurrences,
    uniqueDates: manifest.expectedOccurrences,
    labels: manifest.expectedLabels,
    dateAssertions: manifest.expectedCalendarAssertions,
    generalRomanAssertions: manifest.expectedGeneralRomanCalendarAssertions,
    snlDateAssertions: manifest.expectedSnlCalendarAssertions,
    labelAssertions: manifest.expectedLabelAssertions,
    categorized: manifest.expectedOccurrences,
  };
  const actual = { occurrences: occurrenceCount, uniqueDates, labels: labelCount, dateAssertions, generalRomanAssertions, snlDateAssertions, labelAssertions, categorized };
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) throw new Error(`${key}: expected ${value}, found ${actual[key]}.`);
  }
  if (manifest.provenancePolicy?.labelSourceIsNotCalendarIdentity !== true || manifest.provenancePolicy?.snlOccurrenceAssertionRequiresReviewedBinding !== true) {
    throw new Error('Release manifest does not enforce the label-vs-calendar-identity provenance boundary.');
  }
  // Legacy BUILD v1 has Portuguese labels sourced by civil date but no reviewed SNL↔canonical
  // event binding. It may cite the label source, but must produce zero SNL occurrence assertions.
  if (snlDateAssertions !== 0) throw new Error(`Legacy unbound SNL labels created ${snlDateAssertions} false calendar assertion(s).`);

  const sample = (dateISO, locale) => scalar(`SELECT l.name AS name FROM calendar_occurrences o JOIN calendar_occurrence_labels l ON l.occurrence_id=o.id WHERE o.date_iso=? AND o.church_id='roman-catholic' AND o.jurisdiction_id='pt' AND l.locale=?`, [dateISO, locale])?.name ?? '';
  const checks = [
    ['2026-08-11', 'en', /clare/i], ['2026-08-11', 'pt', /clara/i], ['2026-08-11', 'es', /clara/i], ['2026-08-11', 'fr', /claire/i], ['2026-08-11', 'it', /chiara/i],
    ['2026-01-01', 'pt', /(maria|mãe de deus)/i], ['2026-01-01', 'it', /(maria|madre di dio)/i],
  ];
  for (const [dateISO, locale, pattern] of checks) {
    const value = String(sample(dateISO, locale));
    if (!pattern.test(value)) throw new Error(`${dateISO} ${locale} sample failed: ${value}`);
  }

  const foreignKeys = database.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeys.length) throw new Error(`Foreign-key check returned ${foreignKeys.length} problem(s).`);

  console.log(JSON.stringify({ ...actual, semanticSamples: 'passed', provenanceBoundary: 'passed', foreignKeys: 0, idempotentReplay: true }, null, 2));
} finally {
  database.close();
  fs.rmSync(temporary, { recursive: true, force: true });
}

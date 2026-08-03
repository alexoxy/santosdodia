import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-normalized-calendar-'));
const canonicalPath = path.join(directory, 'canonical.json');
const sqlPath = path.join(directory, 'calendar.sql');
const d1Path = path.join(directory, 'calendar.d1.json');
const invalidPath = path.join(directory, 'invalid.json');
const fixturePath = path.join(root, 'test/fixtures/normalized-calendar-package.valid.json');
const manifestSha = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
const validationPath = '/Santos do Dia/02_Dados_Eclesiasticos/02_Validacao/relatorios/normalized-calendar-test.json';

function run(args, expectedSuccess = true) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  if (expectedSuccess && result.status !== 0) {
    throw new Error(`${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  }
  if (!expectedSuccess && result.status === 0) {
    throw new Error(`${args.join(' ')} unexpectedly accepted an unsafe package.`);
  }
  return result;
}

try {
  run([
    'scripts/normalize-calendar-staging-package.mjs',
    '--input', fixturePath,
    '--output', canonicalPath,
    '--manifest-sha256', manifestSha,
    '--validation-report-path', validationPath
  ]);

  const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  if (canonical.schemaVersion !== '1.0') throw new Error('Canonical schema version is incorrect.');
  if (canonical.run.id !== 'normalized-calendar-test' || canonical.run.status !== 'provisional') {
    throw new Error('Canonical run metadata was not preserved.');
  }
  if (canonical.run.manifestSha256 !== manifestSha || canonical.run.validationReportPath !== validationPath) {
    throw new Error('Canonical provenance metadata is incomplete.');
  }
  if (canonical.sources.length !== 1 || canonical.policies.length !== 1 || canonical.rules.length !== 1) {
    throw new Error('Canonical source, policy or rule count is incorrect.');
  }
  if (canonical.sources[0].authority !== 'official-church') {
    throw new Error('Official Church department authority was not normalized to the canonical source authority.');
  }
  if (canonical.occurrences.length !== 1 || canonical.labels.length !== 2) {
    throw new Error('Canonical occurrence or label count is incorrect.');
  }
  if (canonical.occurrences[0].publicationStatus !== 'withheld') {
    throw new Error('Provisional occurrence was not retained as withheld.');
  }
  if (canonical.rules[0].calendarSystem !== 'julian-paschalion') {
    throw new Error('Event did not inherit the matching Church calendar policy.');
  }

  run(['scripts/build-calendar-staging-sql.mjs', '--input', canonicalPath, '--output', sqlPath]);
  run(['scripts/prepare-d1-calendar-package.mjs', '--input', sqlPath, '--output', d1Path]);
  const d1 = JSON.parse(fs.readFileSync(d1Path, 'utf8'));
  if (d1.execution !== 'D1Database.batch' || d1.atomic !== true || d1.statementCount < 8) {
    throw new Error('Canonical package did not produce a valid atomic D1 batch.');
  }

  const unsafe = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  unsafe.events[0].publicationStatus = 'publishable';
  fs.writeFileSync(invalidPath, JSON.stringify(unsafe), 'utf8');
  run([
    'scripts/normalize-calendar-staging-package.mjs',
    '--input', invalidPath,
    '--output', `${canonicalPath}.unsafe`,
    '--manifest-sha256', manifestSha
  ], false);

  console.log('Normalized Dropbox calendar package conversion tests passed.');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

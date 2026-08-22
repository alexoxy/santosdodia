#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-materialization-'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function transpile(sourcePath, outputName, rewrites = []) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some(item => item.category === ts.DiagnosticCategory.Error), `${path.basename(sourcePath)} transpilation returned errors.`);
  let output = compiled.outputText;
  for (const [from, to] of rewrites) output = output.replaceAll(from, to);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), output, 'utf8');
}

function solemnity(id, dateISO, observanceId) {
  return {
    id,
    dateISO,
    origin: 'sanctorale',
    observanceId,
    precedenceClass: 'general-calendar-solemnity',
    isSolemnity: true,
    sourceIds: ['test-source']
  };
}

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  transpile(path.join(root, 'lib/knowledge/roman-precedence.ts'), 'roman-precedence.js');
  transpile(
    path.join(root, 'lib/knowledge/roman-annual-calendar.ts'),
    'roman-annual-calendar.js',
    [
      ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"],
      ["'./roman-precedence'", "'./roman-precedence.js'"]
    ]
  );
  transpile(
    path.join(root, 'lib/knowledge/roman-solemnity-transfer.ts'),
    'roman-solemnity-transfer.js',
    [
      ["'./roman-annual-calendar'", "'./roman-annual-calendar.js'"],
      ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"],
      ["'./roman-precedence'", "'./roman-precedence.js'"]
    ]
  );
  transpile(
    path.join(root, 'lib/knowledge/roman-annual-materialization.ts'),
    'roman-annual-materialization.js',
    [
      ["'./roman-annual-calendar'", "'./roman-annual-calendar.js'"],
      ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"],
      ["'./roman-solemnity-transfer'", "'./roman-solemnity-transfer.js'"]
    ]
  );

  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const materialize = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-annual-materialization.js')).href}?v=${Date.now()}`);

  const josephId = 'occurrence:2023-03-19:saint-joseph:test';
  const josephInput = [solemnity(josephId, '2023-03-19', 'observance:saint-joseph:roman-catholic')];
  const joseph = materialize.materializeRomanAnnualCalendarWithTransfers(2023, roman.ROMAN_PORTUGAL_POLICY, josephInput);
  assert(joseph.status === 'resolved' && joseph.finalCalendar, 'St Joseph 2023 materialization must resolve atomically.');
  assert(joseph.appliedTransfers.length === 1 && joseph.appliedTransfers[0].targetDateISO === '2023-03-20', 'St Joseph 2023 must be materialized on 20 March.');
  assert(josephInput[0].dateISO === '2023-03-19', 'Annual materialization must not mutate caller-owned candidate input.');
  const josephOriginalDay = joseph.finalCalendar.days.find(day => day.dateISO === '2023-03-19');
  const josephTargetDay = joseph.finalCalendar.days.find(day => day.dateISO === '2023-03-20');
  assert(josephOriginalDay?.celebratedCandidateId?.startsWith('temporale:'), 'After transfer, the original Lent Sunday must remain the celebrated Temporale.');
  assert(!josephOriginalDay?.candidates.some(item => item.id === josephId), 'Transferred solemnity must be removed from its impeded original date in the second pass.');
  assert(josephTargetDay?.celebratedCandidateId === josephId, 'Transferred St Joseph must win precedence on its resolved target date.');
  const movedJoseph = josephTargetDay?.candidates.find(item => item.id === josephId);
  assert(movedJoseph?.sourceIds?.includes('snl-portugal-liturgical-year-transfer-rules'), 'Materialized transferred candidate must retain transfer provenance.');

  const annunciationId = 'occurrence:2024-03-25:annunciation:test';
  const annunciation = materialize.materializeRomanAnnualCalendarWithTransfers(2024, roman.ROMAN_PORTUGAL_POLICY, [
    solemnity(annunciationId, '2024-03-25', 'observance:annunciation:roman-catholic')
  ]);
  assert(annunciation.status === 'resolved' && annunciation.finalCalendar, 'Annunciation 2024 materialization must resolve.');
  assert(annunciation.appliedTransfers[0]?.targetDateISO === '2024-04-08', 'Annunciation 2024 must materialize on 8 April.');
  assert(annunciation.finalCalendar.days.find(day => day.dateISO === '2024-04-08')?.celebratedCandidateId === annunciationId, 'Annunciation must be celebrated on the transferred date after second-pass precedence.');

  const joseph2026Id = 'occurrence:2026-03-19:saint-joseph:test';
  const joseph2026 = materialize.materializeRomanAnnualCalendarWithTransfers(2026, roman.ROMAN_PORTUGAL_POLICY, [
    solemnity(joseph2026Id, '2026-03-19', 'observance:saint-joseph:roman-catholic')
  ]);
  assert(joseph2026.status === 'resolved' && joseph2026.appliedTransfers.length === 0, 'A non-impeded 2026 St Joseph must need no transfer.');
  assert(joseph2026.finalCalendar?.days.find(day => day.dateISO === '2026-03-19')?.celebratedCandidateId === joseph2026Id, 'St Joseph must remain on 19 March 2026.');

  const tie = materialize.materializeRomanAnnualCalendarWithTransfers(2026, roman.ROMAN_PORTUGAL_POLICY, [
    { id: 'tie-a', dateISO: '2026-09-21', origin: 'sanctorale', precedenceClass: 'general-marian-or-saint-feast', isSolemnity: false },
    { id: 'tie-b', dateISO: '2026-09-21', origin: 'proper', precedenceClass: 'general-marian-or-saint-feast', isSolemnity: false }
  ]);
  assert(tie.status === 'unresolved-first-pass' && tie.finalCalendar === null && tie.appliedTransfers.length === 0, 'Equal top precedence must block the entire second-pass materialization.');

  const equidistantSolemnity = solemnity('synthetic:equidistant', '2026-06-10', 'observance:synthetic');
  const equidistant = materialize.materializeRomanAnnualCalendarWithTransfers(2026, roman.ROMAN_PORTUGAL_POLICY, [
    equidistantSolemnity,
    { id: 'synthetic:higher', dateISO: '2026-06-10', origin: 'proper', precedenceClass: 'principal-temporale', isSolemnity: false }
  ]);
  assert(equidistant.status === 'unresolved-transfer-schedule' && equidistant.finalCalendar === null, 'An unresolved transfer target must block all second-pass materialization.');
  assert(equidistant.appliedTransfers.length === 0, 'No resolved transfer may be applied when the transfer schedule contains an unresolved proposal.');

  assert(joseph.publicationAllowed === false && annunciation.publicationAllowed === false, 'Second-pass annual materialization must remain shadow-only.');

  console.log('Roman annual materialization passed: transfers are applied atomically, precedence is recomputed at target dates, provenance is retained and unresolved schedules fail closed.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

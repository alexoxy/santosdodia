#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-annual-calendar-'));
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

  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const annual = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-annual-calendar.js')).href}?v=${Date.now()}`);

  const calendar2026 = annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY);
  assert(calendar2026.modelVersion === '0.2-shadow' && calendar2026.publicationAllowed === false, 'Annual generator must remain shadow-only.');
  assert(calendar2026.days.length === 365 && calendar2026.counts.leapYear === false, '2026 must generate exactly 365 civil days.');
  assert(calendar2026.days.every(day => day.candidates.some(candidate => candidate.origin === 'temporale')), 'Every civil day must have a deterministic Temporale candidate.');
  assert(calendar2026.unresolvedDates.length === 0 && calendar2026.transferQueue.length === 0, 'Pure Temporale generation must resolve without artificial conflicts.');
  assert(calendar2026.counts.datesWithOptions === 0, 'Pure Temporale generation must not create artificial optional-choice dates.');

  const byDate = new Map(calendar2026.days.map(day => [day.dateISO, day]));
  assert(byDate.get('2026-04-05')?.precedence.winningPrecedenceLevel === 1, 'Easter Sunday must resolve inside the Paschal Triduum at precedence level 1.');
  assert(byDate.get('2026-04-02')?.precedence.winningPrecedenceLevel === 1, 'Holy Thursday principal celebration must resolve at precedence level 1.');
  assert(byDate.get('2026-03-30')?.precedence.winningPrecedenceLevel === 2, 'Monday of Holy Week must resolve at precedence level 2.');
  assert(byDate.get('2026-04-06')?.precedence.winningPrecedenceLevel === 2, 'Monday within the Easter Octave must resolve at precedence level 2.');
  assert(byDate.get('2026-05-24')?.precedence.winningPrecedenceLevel === 2, 'Pentecost must resolve at precedence level 2.');
  assert(byDate.get('2026-06-07')?.precedence.winningPrecedenceLevel === 6, 'Ordinary Time Sunday must resolve at precedence level 6.');
  assert(byDate.get('2026-06-01')?.precedence.winningPrecedenceLevel === 13, 'Ordinary Time weekday must resolve at precedence level 13 before Sanctorale candidates are added.');
  assert(byDate.get('2026-12-16')?.precedence.winningPrecedenceLevel === 13, 'Advent weekday before 17 December must remain level 13.');
  assert(byDate.get('2026-12-17')?.precedence.winningPrecedenceLevel === 9, 'Advent weekday from 17-24 December must resolve at precedence level 9.');
  assert(byDate.get('2026-12-26')?.precedence.winningPrecedenceLevel === 9, 'A weekday within the Christmas Octave must resolve at precedence level 9 before Sanctorale candidates are added.');

  const leap2028 = annual.generateRomanAnnualCalendar(2028, roman.ROMAN_PORTUGAL_POLICY);
  assert(leap2028.days.length === 366 && leap2028.counts.leapYear === true, '2028 must generate 366 days without an annual source file.');

  const joseph2026 = annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY, [{
    id: 'occurrence:2026-03-19:saint-joseph:test',
    dateISO: '2026-03-19',
    origin: 'sanctorale',
    precedenceClass: 'general-calendar-solemnity',
    isSolemnity: true
  }]);
  const joseph2026Day = joseph2026.days.find(day => day.dateISO === '2026-03-19');
  assert(joseph2026Day?.celebratedCandidateId === 'occurrence:2026-03-19:saint-joseph:test', 'St Joseph must outrank an ordinary Lenten weekday in 2026.');
  assert(joseph2026Day?.omittedCandidateIds.some(id => id.startsWith('temporale:')), 'The lower Lenten weekday candidate must be suppressed in 2026.');

  const joseph2023 = annual.generateRomanAnnualCalendar(2023, roman.ROMAN_PORTUGAL_POLICY, [{
    id: 'occurrence:2023-03-19:saint-joseph:test',
    dateISO: '2023-03-19',
    origin: 'sanctorale',
    precedenceClass: 'general-calendar-solemnity',
    isSolemnity: true
  }]);
  const joseph2023Day = joseph2023.days.find(day => day.dateISO === '2023-03-19');
  assert(joseph2023Day?.precedence.winningPrecedenceLevel === 2 && joseph2023Day.celebratedCandidateId?.startsWith('temporale:'), 'A Sunday of Lent must outrank St Joseph when they coincide.');
  assert(joseph2023Day?.transferRequiredCandidateIds.includes('occurrence:2023-03-19:saint-joseph:test'), 'The impeded St Joseph solemnity must enter the transfer queue.');
  assert(joseph2023.transferQueue.some(item => item.candidateId === 'occurrence:2023-03-19:saint-joseph:test'), 'Annual result must expose impeded solemnities for a later transfer scheduler.');

  const optional2026 = annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY, [
    { id: 'optional-a', dateISO: '2026-02-03', origin: 'sanctorale', precedenceClass: 'optional-memorial', isSolemnity: false },
    { id: 'optional-b', dateISO: '2026-02-03', origin: 'sanctorale', precedenceClass: 'optional-memorial', isSolemnity: false }
  ]);
  const optionalDay = optional2026.days.find(day => day.dateISO === '2026-02-03');
  assert(optionalDay?.precedence.status === 'resolved-options' && optionalDay.celebratedCandidateId === null, 'Multiple optional memorials must remain legitimate options rather than a forced winner.');
  assert(optionalDay?.permittedCandidateIds.includes('optional-a') && optionalDay?.permittedCandidateIds.includes('optional-b'), 'Annual day must expose every optional memorial choice.');
  assert(optionalDay?.permittedCandidateIds.some(id => id.startsWith('temporale:')), 'Ordinary feria must remain a permitted alternative to optional memorials.');
  assert(optional2026.counts.datesWithOptions === 1 && !optional2026.unresolvedDates.includes('2026-02-03'), 'Optional choices must be counted separately from unresolved errors.');

  const tie2026 = annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY, [
    { id: 'feast-a', dateISO: '2026-09-21', origin: 'sanctorale', precedenceClass: 'general-marian-or-saint-feast', isSolemnity: false },
    { id: 'feast-b', dateISO: '2026-09-21', origin: 'proper', precedenceClass: 'general-marian-or-saint-feast', isSolemnity: false }
  ]);
  assert(tie2026.unresolvedDates.includes('2026-09-21'), 'Equal mandatory highest precedence must keep the annual date unresolved rather than invent a winner.');

  let outsideYearRejected = false;
  try {
    annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY, [
      { id: 'outside', dateISO: '2027-01-01', origin: 'sanctorale', precedenceClass: 'general-calendar-solemnity', isSolemnity: true }
    ]);
  } catch { outsideYearRejected = true; }
  assert(outsideYearRejected, 'Supplied candidates outside the requested civil year must fail closed.');

  console.log('Roman annual calendar generator passed: 365/366-day autonomous Temporale, precedence collisions, optional choices, transfer queue and fail-closed mandatory ties.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

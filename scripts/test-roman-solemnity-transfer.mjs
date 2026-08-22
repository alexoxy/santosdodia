#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-transfer-'));
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

function candidate(id, dateISO, observanceId = undefined) {
  return {
    id,
    dateISO,
    origin: 'sanctorale',
    observanceId,
    precedenceClass: 'general-calendar-solemnity',
    isSolemnity: true
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

  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const annual = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-annual-calendar.js')).href}?v=${Date.now()}`);
  const transfer = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-solemnity-transfer.js')).href}?v=${Date.now()}`);

  const joseph2023Id = 'occurrence:2023-03-19:saint-joseph:test';
  const joseph2023Calendar = annual.generateRomanAnnualCalendar(2023, roman.ROMAN_PORTUGAL_POLICY, [
    candidate(joseph2023Id, '2023-03-19', 'observance:saint-joseph:roman-catholic')
  ]);
  const joseph2023 = transfer.scheduleRomanSolemnityTransfers(joseph2023Calendar, roman.ROMAN_PORTUGAL_POLICY);
  const joseph2023Proposal = joseph2023.proposals.find(item => item.candidateId === joseph2023Id);
  assert(joseph2023Proposal?.status === 'resolved', 'St Joseph 2023 transfer must resolve.');
  assert(joseph2023Proposal?.targetDateISO === '2023-03-20', `St Joseph 2023 expected transfer to 2023-03-20, got ${joseph2023Proposal?.targetDateISO}.`);
  assert(joseph2023Proposal?.method === 'following-monday-after-privileged-sunday', 'St Joseph 2023 must use the privileged-Sunday Monday rule.');

  const annunciation2024Id = 'occurrence:2024-03-25:annunciation:test';
  const annunciation2024Calendar = annual.generateRomanAnnualCalendar(2024, roman.ROMAN_PORTUGAL_POLICY, [
    candidate(annunciation2024Id, '2024-03-25', 'observance:annunciation:roman-catholic')
  ]);
  const annunciation2024 = transfer.scheduleRomanSolemnityTransfers(annunciation2024Calendar, roman.ROMAN_PORTUGAL_POLICY);
  const annunciationProposal = annunciation2024.proposals.find(item => item.candidateId === annunciation2024Id);
  assert(annunciationProposal?.status === 'resolved', 'Annunciation 2024 transfer must resolve.');
  assert(annunciationProposal?.targetDateISO === '2024-04-08', `Annunciation 2024 expected transfer to 2024-04-08, got ${annunciationProposal?.targetDateISO}.`);
  assert(annunciationProposal?.method === 'annunciation-after-second-sunday-of-easter', 'Annunciation during Holy Week must use its special post-Easter transfer rule.');
  assert(annunciationProposal?.sourceIds.includes('snl-portugal-annunciation-transfer'), 'Annunciation special transfer must retain its dedicated normative source.');

  const joseph2008Id = 'occurrence:2008-03-19:saint-joseph:test';
  const joseph2008Calendar = annual.generateRomanAnnualCalendar(2008, roman.ROMAN_PORTUGAL_POLICY, [
    candidate(joseph2008Id, '2008-03-19', 'observance:saint-joseph:roman-catholic')
  ]);
  const joseph2008 = transfer.scheduleRomanSolemnityTransfers(joseph2008Calendar, roman.ROMAN_PORTUGAL_POLICY);
  const joseph2008Proposal = joseph2008.proposals.find(item => item.candidateId === joseph2008Id);
  assert(joseph2008Proposal?.status === 'resolved', 'St Joseph 2008 Holy Week transfer must resolve.');
  assert(joseph2008Proposal?.targetDateISO === '2008-03-15', `St Joseph 2008 expected nearest free day 2008-03-15, got ${joseph2008Proposal?.targetDateISO}.`);
  assert(joseph2008Proposal?.method === 'nearest-free-day', 'St Joseph 2008 must use the general nearest-free-day rule.');

  const equidistantSolemnity = candidate('synthetic:solemnity:equidistant', '2026-06-10');
  const equidistantCalendar = annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY, [
    equidistantSolemnity,
    {
      id: 'synthetic:higher:2026-06-10',
      dateISO: '2026-06-10',
      origin: 'proper',
      precedenceClass: 'principal-temporale',
      isSolemnity: false
    }
  ]);
  const equidistant = transfer.scheduleRomanSolemnityTransfers(equidistantCalendar, roman.ROMAN_PORTUGAL_POLICY);
  const equidistantProposal = equidistant.proposals.find(item => item.candidateId === equidistantSolemnity.id);
  assert(equidistantProposal?.status === 'unresolved-equidistant' && equidistantProposal.targetDateISO === null, 'Equally near free days must fail closed rather than choose before/after arbitrarily.');

  const collisionCalendar = annual.generateRomanAnnualCalendar(2023, roman.ROMAN_PORTUGAL_POLICY, [
    candidate('synthetic:solemnity:a', '2023-03-19'),
    candidate('synthetic:solemnity:b', '2023-03-19')
  ]);
  const collision = transfer.scheduleRomanSolemnityTransfers(collisionCalendar, roman.ROMAN_PORTUGAL_POLICY);
  assert(collision.proposals.length === 2, 'Both impeded solemnities must remain in the transfer schedule.');
  assert(collision.proposals.every(item => item.targetDateISO === '2023-03-20' && item.status === 'unresolved-target-collision'), 'Two transfers targeting the same Monday must fail closed as a target collision.');
  assert(collision.resolved === 0 && collision.unresolved === 2, 'Colliding transfer proposals must not count as resolved.');

  let mismatchRejected = false;
  try { transfer.scheduleRomanSolemnityTransfers(joseph2023Calendar, roman.ROMAN_GENERAL_POLICY); } catch { mismatchRejected = true; }
  assert(mismatchRejected, 'Transfer scheduler must reject a policy/calendar jurisdiction mismatch.');

  assert(joseph2023.publicationAllowed === false && annunciation2024.publicationAllowed === false, 'Transfer scheduling must remain shadow-only.');
  assert(joseph2023Proposal?.sourceIds.includes('snl-portugal-liturgical-year-transfer-rules'), 'General transfer decisions must retain the SNL transfer source.');

  console.log('Roman solemnity transfer scheduler passed: privileged-Sunday Monday, Annunciation special transfer, nearest free day, equidistant fail-closed and target-collision safeguards.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

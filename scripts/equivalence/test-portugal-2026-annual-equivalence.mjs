#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'data/equivalence/roman-catholic-pt-2026-approved.json'), 'utf8'));
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/equivalence/roman-catholic-pt-2026-precedence-policy.json'), 'utf8'));
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-pt-2026-equivalence-'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function rowsFromFixture() {
  const rows = [];
  for (const [rankKey, items] of Object.entries(fixture.occurrencesByRank ?? {})) {
    const rank = rankKey === 'unranked' ? null : rankKey;
    for (const [dateISO, legacyId] of items) rows.push({ dateISO, legacyId, rank });
  }
  return rows.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.legacyId.localeCompare(b.legacyId));
}

const temporalPatterns = Object.entries(policy.temporalIdentityFamilies ?? {})
  .filter(([, value]) => typeof value === 'string')
  .map(([, value]) => new RegExp(value, 'u'));
const temporalSpecialIds = new Set(policy.temporalIdentityFamilies?.specialIds ?? []);
const generalLordFeasts = new Set(policy.generalLordFeasts ?? []);
const properFeasts = new Set(policy.properFeasts ?? []);
const properObligatoryMemorials = new Set(policy.properObligatoryMemorials ?? []);
const properOptionalMemorials = new Set(policy.properOptionalMemorials ?? []);
const levelThreeNonSolemnity = new Set(policy.levelThreeNonSolemnity ?? []);
const knownMissingPerennialRules = new Set(policy.knownMissingPerennialRulesAtBaseline ?? []);

function isTemporal(row) {
  if (row.rank === 'weekday') return true;
  if (row.legacyId === 'rc-pt:TuesdayAfterEpiphany') return true;
  return temporalSpecialIds.has(row.legacyId) || temporalPatterns.some(pattern => pattern.test(row.legacyId));
}

function temporalExpectedClass(row) {
  const id = row.legacyId;
  if (['rc:HolyThurs','rc:GoodFri','rc:EasterVigil','rc:Easter'].includes(id)) return 'paschal-triduum';
  if (['rc:Trinity','rc:CorpusChristi','rc:SacredHeart','rc:ChristKing'].includes(id)) return 'general-calendar-solemnity';
  if (['rc:BaptismLord','rc:HolyFamily'].includes(id)) return 'general-lord-feast';
  if (/^rc:OrdSunday\d+$/u.test(id)) return 'christmas-or-ordinary-sunday';
  if (/^rc:(?:Advent[1-4]|Lent[1-5]|Easter[2-6])$/u.test(id)) return 'principal-temporale';
  if (['rc:Epiphany','rc:AshWednesday','rc:PalmSun','rc:MonHolyWeek','rc:TueHolyWeek','rc:WedHolyWeek','rc:Ascension','rc:Pentecost','rc:Christmas','rc:MonOctaveEaster','rc:TueOctaveEaster','rc:WedOctaveEaster','rc:ThuOctaveEaster','rc:FriOctaveEaster','rc:SatOctaveEaster'].includes(id)) return 'principal-temporale';
  if (/^rc:LentWeekday/u.test(id) || /^(?:rc:)?(?:Thursday|Friday|Saturday)AfterAshWednesday$/u.test(id)) return 'privileged-weekday';
  if (/^rc:AdventWeekdayDec(?:17|18|19|20|21|22|23|24)$/u.test(id)) return 'privileged-weekday';
  if (/^rc:ChristmasWeekdayDec(?:29|30|31)$/u.test(id)) return 'privileged-weekday';
  return 'ordinary-weekday';
}

function classifyNonTemporal(row) {
  let precedenceClass;
  if (generalLordFeasts.has(row.legacyId)) precedenceClass = 'general-lord-feast';
  else if (properFeasts.has(row.legacyId)) precedenceClass = 'proper-feast';
  else if (properObligatoryMemorials.has(row.legacyId)) precedenceClass = 'proper-obligatory-memorial';
  else precedenceClass = policy.defaultNonTemporalRankClassification?.[row.rank];
  if (!precedenceClass) throw new Error(`No explicit precedence classification for ${row.dateISO} ${row.legacyId} (${row.rank}).`);

  const proper = properFeasts.has(row.legacyId)
    || properObligatoryMemorials.has(row.legacyId)
    || properOptionalMemorials.has(row.legacyId)
    || row.legacyId.startsWith('rc-pt:');
  const isSolemnity = row.rank === 'solemnity' && !levelThreeNonSolemnity.has(row.legacyId);
  return {
    id: `equivalence:${row.legacyId}`,
    dateISO: row.dateISO,
    origin: proper ? 'proper' : 'sanctorale',
    observanceId: `legacy-equivalence:${row.legacyId}`,
    precedenceClass,
    isSolemnity,
    sourceIds: ['portugal-2026-approved-equivalence-fixture']
  };
}

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
  const rows = rowsFromFixture();
  assert(fixture.schemaVersion === 1 && fixture.releaseId === 'roman-catholic-pt-2026-v2', 'Equivalence fixture identity drifted.');
  assert(fixture.artifactId === 9277632698, 'Equivalence fixture must remain pinned to the approved production artifact.');
  assert(fixture.buildJsonSha256 === '159f38f1ee763517ee4dfae738237ced2c7f243146ba3f593e5b096feaaafc06', 'Equivalence fixture build hash drifted.');
  assert(rows.length === 389 && new Set(rows.map(row => row.legacyId)).size === 389, 'Approved Portugal 2026 equivalence fixture must contain exactly 389 unique source rows.');
  assert(rows.filter(row => row.rank === 'solemnity').length === 46, 'Approved solemnity source-row count drifted.');
  assert(rows.filter(row => row.rank === 'feast').length === 56, 'Approved feast source-row count drifted.');
  assert(rows.filter(row => row.rank === 'memorial').length === 59, 'Approved memorial source-row count drifted.');
  assert(rows.filter(row => row.rank === 'optional-memorial').length === 105, 'Approved optional memorial source-row count drifted.');
  assert(rows.filter(row => row.rank === 'weekday').length === 122 && rows.filter(row => row.rank === null).length === 1, 'Approved weekday/unranked source-row topology drifted.');
  assert(policy.runtimeDependency === false && policy.publicationAllowed === false, 'Equivalence classification policy must remain test-only and publication-blocked.');

  const temporalRows = rows.filter(isTemporal);
  const nonTemporalRows = rows.filter(row => !isTemporal(row));
  assert(temporalRows.length === 190 && nonTemporalRows.length === 199, `Expected 190 temporal + 199 Sanctorale/Proper rows, got ${temporalRows.length} + ${nonTemporalRows.length}.`);

  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  transpile(path.join(root, 'lib/knowledge/roman-precedence.ts'), 'roman-precedence.js');
  transpile(path.join(root, 'lib/knowledge/roman-annual-calendar.ts'), 'roman-annual-calendar.js', [
    ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"],
    ["'./roman-precedence'", "'./roman-precedence.js'"]
  ]);

  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const annual = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-annual-calendar.js')).href}?v=${Date.now()}`);
  const supplied = nonTemporalRows.map(classifyNonTemporal);
  const calendar = annual.generateRomanAnnualCalendar(2026, roman.ROMAN_PORTUGAL_POLICY, supplied);
  const byDate = new Map(calendar.days.map(day => [day.dateISO, day]));

  const nonTemporalFailures = [];
  let nonTemporalMatched = 0;
  for (const row of nonTemporalRows) {
    const day = byDate.get(row.dateISO);
    const candidateId = `equivalence:${row.legacyId}`;
    const decision = day?.precedence.decisions.find(item => item.id === candidateId);
    const expectedAction = row.rank === 'optional-memorial' ? 'permitted-option' : 'celebrate';
    if (decision?.action === expectedAction) nonTemporalMatched += 1;
    else nonTemporalFailures.push({ dateISO: row.dateISO, legacyId: row.legacyId, rank: row.rank, expectedAction, actualAction: decision?.action ?? null, status: day?.precedence.status ?? null });
  }

  const temporalFailures = [];
  let temporalMatched = 0;
  for (const row of temporalRows) {
    const day = byDate.get(row.dateISO);
    const temporale = day?.candidates.find(item => item.origin === 'temporale');
    const expectedClass = temporalExpectedClass(row);
    if (temporale?.precedenceClass === expectedClass) temporalMatched += 1;
    else temporalFailures.push({ dateISO: row.dateISO, legacyId: row.legacyId, expectedClass, actualClass: temporale?.precedenceClass ?? null });
  }

  const missingRuleIds = temporalFailures.map(item => item.legacyId).sort();
  assert(nonTemporalFailures.length === 0 && nonTemporalMatched === 199, `Sanctorale/Proper classification regressions: ${JSON.stringify(nonTemporalFailures.slice(0, 12))}`);
  assert(JSON.stringify(missingRuleIds) === JSON.stringify([...knownMissingPerennialRules].sort()), `Unexpected temporal-rule gap set: ${JSON.stringify(temporalFailures)}`);
  assert(temporalMatched === 189 && temporalFailures.length === 1, `Expected 189/190 temporal rows explained at baseline, got ${temporalMatched}/190.`);
  assert(calendar.counts.datesWithOptions === 81, `Expected 81 dates with optional liturgical choices, got ${calendar.counts.datesWithOptions}.`);
  assert(calendar.unresolvedDates.length === 0, `Approved Portugal 2026 source rows must not create unresolved mandatory ties: ${calendar.unresolvedDates.join(', ')}.`);

  const explained = nonTemporalMatched + temporalMatched;
  assert(explained === 388, `Expected initial annual generator semantic baseline 388/389, got ${explained}/389.`);
  console.log(`Portugal 2026 annual generator semantic baseline passed: ${explained}/389 source rows explained (${temporalMatched}/190 Temporale + ${nonTemporalMatched}/199 Sanctorale/Proper); one known missing perennial rule: ${missingRuleIds.join(', ')}. Canonical migration coverage remains independently gated at 58/389.`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

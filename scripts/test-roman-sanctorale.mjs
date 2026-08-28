#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-sanctorale-'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));

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

function deepClone(value) { return JSON.parse(JSON.stringify(value)); }

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  transpile(path.join(root, 'lib/knowledge/roman-precedence.ts'), 'roman-precedence.js');
  transpile(
    path.join(root, 'lib/knowledge/roman-annual-calendar.ts'),
    'roman-annual-calendar.js',
    [["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"], ["'./roman-precedence'", "'./roman-precedence.js'"]]
  );
  transpile(
    path.join(root, 'lib/knowledge/roman-solemnity-transfer.ts'),
    'roman-solemnity-transfer.js',
    [["'./roman-annual-calendar'", "'./roman-annual-calendar.js'"], ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"], ["'./roman-precedence'", "'./roman-precedence.js'"]]
  );
  transpile(
    path.join(root, 'lib/knowledge/roman-annual-materialization.ts'),
    'roman-annual-materialization.js',
    [["'./roman-annual-calendar'", "'./roman-annual-calendar.js'"], ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"], ["'./roman-solemnity-transfer'", "'./roman-solemnity-transfer.js'"]]
  );
  transpile(
    path.join(root, 'lib/knowledge/roman-sanctorale.ts'),
    'roman-sanctorale.js',
    [["'./roman-annual-calendar'", "'./roman-annual-calendar.js'"], ["'./roman-precedence'", "'./roman-precedence.js'"]]
  );

  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const precedence = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-precedence.js')).href}?v=${Date.now()}`);
  const materialize = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-annual-materialization.js')).href}?v=${Date.now()}`);
  const sanctorale = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-sanctorale.js')).href}?v=${Date.now()}`);

  const rules = readJson('data/canonical-roman-sanctorale-rule-anchors.json');
  const policies = readJson('data/roman-sanctorale-jurisdiction-policies.json');
  const occurrences = readJson('data/canonical-occurrence-anchors.json');
  const observances = readJson('data/canonical-observance-anchors.json');
  const ptPolicy = policies.policies.find(policy => policy.id === 'roman-sanctorale-policy:pt');

  assert(ptPolicy, 'Portugal Roman Sanctorale policy is missing.');
  assert(JSON.stringify(ptPolicy.inheritedScopeKeys) === JSON.stringify(['general-roman', 'europe', 'portugal']), 'Portugal must inherit General Roman, Europe, then Portugal scopes in specificity order.');
  assert(ptPolicy.scopeOrderSemantics === 'least-to-most-specific' && ptPolicy.overrideKey === 'observanceId', 'Portugal scope inheritance semantics drifted.');
  assert(!JSON.stringify(rules.rules).includes('"year"'), 'Perennial Sanctorale rules must not embed an annual year field.');

  const canonicalObservanceIds = new Set(observances.observances.map(item => item.id));
  for (const rule of rules.rules) assert(canonicalObservanceIds.has(rule.observanceId), `Sanctorale rule ${rule.id} references a non-canonical Observance.`);

  sanctorale.validateRomanSanctoraleInputs(rules, policies);
  const pt2026 = sanctorale.materializeRomanSanctoraleCandidates(2026, rules, policies, 'roman-sanctorale-policy:pt');
  assert(pt2026.publicationAllowed === false && pt2026.candidates.length === 7, 'Portugal Sanctorale materialization must remain shadow-only with seven reviewed rules.');
  assert(pt2026.jurisdictionId === 'jurisdiction:roman-catholic:pt', 'Portugal Sanctorale materialization jurisdiction drifted.');

  const expected = new Map([
    ['observance:thomas-aquinas:roman-catholic', ['2026-01-28', 'obligatory-memorial', 10, 'general-roman']],
    ['observance:saint-joseph:roman-catholic', ['2026-03-19', 'solemnity', 3, 'general-roman']],
    ['observance:catherine-siena:roman-catholic', ['2026-04-29', 'feast', 8, 'europe']],
    ['observance:john-baptist-nativity:roman-catholic', ['2026-06-24', 'solemnity', 3, 'general-roman']],
    ['observance:peter-paul:roman-catholic', ['2026-06-29', 'solemnity', 3, 'general-roman']],
    ['observance:elizabeth-portugal:roman-catholic', ['2026-07-04', 'obligatory-memorial', 11, 'portugal']],
    ['observance:matthew-apostle:roman-catholic', ['2026-09-21', 'feast', 7, 'general-roman']]
  ]);

  for (const candidate of pt2026.candidates) {
    const vector = expected.get(candidate.observanceId);
    assert(vector, `Unexpected Portugal Sanctorale candidate ${candidate.observanceId}.`);
    const [dateISO, rank, level, scope] = vector;
    assert(candidate.dateISO === dateISO, `${candidate.observanceId} expected ${dateISO}, got ${candidate.dateISO}.`);
    assert(candidate.liturgicalRank === rank, `${candidate.observanceId} rank drifted.`);
    assert(precedence.romanPrecedenceLevelForClass(candidate.precedenceClass) === level, `${candidate.observanceId} precedence level drifted.`);
    assert(candidate.scopeKey === scope, `${candidate.observanceId} scope drifted.`);
    assert(candidate.id === `sanctorale:${candidate.observanceId}:jurisdiction:roman-catholic:pt:2026`, `${candidate.observanceId} stable candidate ID drifted.`);
  }

  assert(occurrences.occurrences.length === 7, 'Occurrence anchor count changed; update the Sanctorale equivalence vector intentionally.');
  for (const occurrence of occurrences.occurrences) {
    const candidate = pt2026.candidates.find(item => item.observanceId === occurrence.observanceId);
    assert(candidate, `Missing perennial Sanctorale candidate for ${occurrence.observanceId}.`);
    assert(candidate.dateISO === occurrence.dateISO, `${occurrence.observanceId} perennial date differs from the canonical 2026 Occurrence.`);
    assert(candidate.liturgicalRank === occurrence.rank, `${occurrence.observanceId} perennial rank differs from the canonical 2026 Occurrence.`);
    assert(pt2026.jurisdictionId === occurrence.jurisdictionId, `${occurrence.observanceId} jurisdiction differs from the canonical Occurrence.`);
  }

  const annual2026 = materialize.materializeRomanAnnualCalendarWithTransfers(2026, roman.ROMAN_PORTUGAL_POLICY, pt2026.candidates);
  assert(annual2026.status === 'resolved' && annual2026.finalCalendar, 'The seven reviewed 2026 Sanctorale rules must resolve through the full annual engine.');
  assert(annual2026.appliedTransfers.length === 0, 'The seven reviewed 2026 Sanctorale vectors must not require a transfer.');
  for (const candidate of pt2026.candidates) {
    const day = annual2026.finalCalendar.days.find(item => item.dateISO === candidate.dateISO);
    assert(day?.celebratedCandidateId === candidate.id, `${candidate.observanceId} must win the final 2026 precedence resolution on ${candidate.dateISO}.`);
  }

  const pt2025 = sanctorale.materializeRomanSanctoraleCandidates(2025, rules, policies, 'roman-sanctorale-policy:pt');
  const annual2025 = materialize.materializeRomanAnnualCalendarWithTransfers(2025, roman.ROMAN_PORTUGAL_POLICY, pt2025.candidates);
  assert(annual2025.status === 'resolved' && annual2025.finalCalendar, 'The reviewed Sanctorale rules must also generate autonomously for 2025.');
  const peterPaul2025 = pt2025.candidates.find(item => item.observanceId === 'observance:peter-paul:roman-catholic');
  const june29 = annual2025.finalCalendar.days.find(item => item.dateISO === '2025-06-29');
  assert(peterPaul2025 && june29?.celebratedCandidateId === peterPaul2025.id, 'Peter and Paul solemnity must outrank an Ordinary Time Sunday in 2025.');
  assert(june29.precedence.winningPrecedenceLevel === 3, 'Peter and Paul 2025 must resolve at precedence level 3 over the level-6 Sunday.');

  const pt2023 = sanctorale.materializeRomanSanctoraleCandidates(2023, rules, policies, 'roman-sanctorale-policy:pt');
  const annual2023 = materialize.materializeRomanAnnualCalendarWithTransfers(2023, roman.ROMAN_PORTUGAL_POLICY, pt2023.candidates);
  const joseph2023 = pt2023.candidates.find(item => item.observanceId === 'observance:saint-joseph:roman-catholic');
  assert(annual2023.status === 'resolved' && annual2023.finalCalendar, 'The reviewed Sanctorale rules must resolve through the 2023 transfer case.');
  assert(joseph2023 && annual2023.appliedTransfers.some(item => item.candidateId === joseph2023.id && item.targetDateISO === '2023-03-20'), 'The canonical Saint Joseph rule must transfer from the 2023 Lent Sunday to 20 March.');
  assert(annual2023.finalCalendar.days.find(item => item.dateISO === '2023-03-20')?.celebratedCandidateId === joseph2023.id, 'The transferred canonical Saint Joseph candidate must win on 20 March 2023.');

  const overrideRules = deepClone(rules);
  overrideRules.rules.push({
    id: 'sanctorale-rule:elizabeth-portugal:general-roman-test',
    observanceId: 'observance:elizabeth-portugal:roman-catholic',
    scopeKey: 'general-roman',
    dateRule: { type: 'fixed', month: 7, day: 4 },
    liturgicalRank: 'optional-memorial',
    precedenceClass: 'optional-memorial',
    isSolemnity: false,
    evidence: [{ publisher: 'Test SNL authority', url: 'https://www.liturgia.pt/', claimTypes: ['test-general-rule'] }],
    verifiedAt: '2026-08-23'
  });
  const overridePt = sanctorale.materializeRomanSanctoraleCandidates(2026, overrideRules, policies, 'roman-sanctorale-policy:pt');
  const elizabeth = overridePt.candidates.find(item => item.observanceId === 'observance:elizabeth-portugal:roman-catholic');
  assert(elizabeth?.scopeKey === 'portugal' && elizabeth.liturgicalRank === 'obligatory-memorial', 'Portugal-specific Elizabeth rule must override a less-specific General Roman rule without duplication.');
  assert(overridePt.candidates.filter(item => item.observanceId === 'observance:elizabeth-portugal:roman-catholic').length === 1, 'Scope override must materialize exactly one candidate per observance.');

  const duplicateSlot = deepClone(rules);
  duplicateSlot.rules.push({ ...deepClone(duplicateSlot.rules[0]), id: 'sanctorale-rule:duplicate-slot:test' });
  let duplicateRejected = false;
  try { sanctorale.validateRomanSanctoraleInputs(duplicateSlot, policies); } catch { duplicateRejected = true; }
  assert(duplicateRejected, 'Duplicate observance+scope Sanctorale rules must fail closed.');

  const unknownScope = deepClone(rules);
  unknownScope.rules[0].scopeKey = 'unknown-scope';
  let unknownScopeRejected = false;
  try { sanctorale.validateRomanSanctoraleInputs(unknownScope, policies); } catch { unknownScopeRejected = true; }
  assert(unknownScopeRejected, 'Sanctorale rules in an undeclared scope must fail closed.');

  const untrustedDomain = deepClone(rules);
  untrustedDomain.rules[0].evidence[0].url = 'https://example.com/not-authoritative';
  let untrustedDomainRejected = false;
  try { sanctorale.validateRomanSanctoraleInputs(untrustedDomain, policies); } catch { untrustedDomainRejected = true; }
  assert(untrustedDomainRejected, 'Evidence outside the jurisdiction policy authority domains must fail closed.');

  const duplicateJurisdiction = deepClone(policies);
  duplicateJurisdiction.policies.push({ ...deepClone(duplicateJurisdiction.policies[0]), id: 'roman-sanctorale-policy:duplicate-pt' });
  let duplicateJurisdictionRejected = false;
  try { sanctorale.validateRomanSanctoraleInputs(rules, duplicateJurisdiction); } catch { duplicateJurisdictionRejected = true; }
  assert(duplicateJurisdictionRejected, 'Duplicate jurisdiction policies must fail closed.');

  const wrongSolemnity = deepClone(rules);
  wrongSolemnity.rules[0].isSolemnity = true;
  let wrongSolemnityRejected = false;
  try { sanctorale.validateRomanSanctoraleInputs(wrongSolemnity, policies); } catch { wrongSolemnityRejected = true; }
  assert(wrongSolemnityRejected, 'Sanctorale rank/isSolemnity mismatch must fail closed.');

  console.log('Roman Sanctorale passed: authority-isolated scope inheritance, seven perennial Portugal vectors, 2026 canonical equivalence, 2025 regeneration, 2023 Saint Joseph transfer and specific-over-general overrides.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

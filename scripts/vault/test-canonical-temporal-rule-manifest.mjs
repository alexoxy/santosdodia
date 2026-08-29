#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { buildCanonicalTemporalRuleVaultRelease } from './build-canonical-temporal-rule-manifest.mjs';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-temporal-rules-'));
function assert(condition, message) { if (!condition) throw new Error(message); }
function expectFailure(label, fn, expectedText) {
  let failed = false;
  try { fn(); } catch (error) {
    failed = true;
    assert(String(error?.message ?? error).includes(expectedText), `${label} failed for wrong reason: ${String(error?.message ?? error)}`);
  }
  assert(failed, `${label} unexpectedly passed.`);
}
function transpile(sourcePath, outputName) {
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  if ((compiled.diagnostics ?? []).some((item) => item.category === ts.DiagnosticCategory.Error)) throw new Error(`${path.basename(sourcePath)} transpilation returned errors.`);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), compiled.outputText, 'utf8');
}

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  const calendar = await import(`${pathToFileURL(path.join(temporaryDirectory, 'calendar-engine.js')).href}?v=${Date.now()}`);

  const ruleBytes = fs.readFileSync(path.join(root, 'data/canonical-temporal-rule-anchors.json'), 'utf8');
  const observanceBytes = fs.readFileSync(path.join(root, 'data/canonical-temporal-observance-anchors.json'), 'utf8');
  const ecclesialBytes = fs.readFileSync(path.join(root, 'data/canonical-ecclesial-context-anchors.json'), 'utf8');
  const vectors = JSON.parse(fs.readFileSync(path.join(root, 'data/canonical-temporal-rule-reference-vectors.json'), 'utf8'));
  const ruleDataset = JSON.parse(ruleBytes);
  const observanceDataset = JSON.parse(observanceBytes);
  const ecclesialDataset = JSON.parse(ecclesialBytes);
  const build = (dataset = ruleDataset, options = {}) => buildCanonicalTemporalRuleVaultRelease(dataset, observanceDataset, ecclesialDataset, options);

  const first = build(ruleDataset, { sourceBytes: ruleBytes, sourceCommit: 'commit-a', generatedAt: '2026-08-22T00:00:00.000Z' });
  const second = build(ruleDataset, { sourceBytes: ruleBytes, sourceCommit: 'commit-b', generatedAt: '2026-08-23T00:00:00.000Z' });
  const reformatted = build(ruleDataset, { sourceBytes: `${JSON.stringify(ruleDataset)}\n`, sourceCommit: 'commit-c', generatedAt: '2026-08-24T00:00:00.000Z' });

  assert(first.manifest.rootSha256 === second.manifest.rootSha256, 'TemporalRule root must be deterministic across runs.');
  assert(first.manifest.rootSha256 === reformatted.manifest.rootSha256, 'Formatting-only rule changes must not change canonical root.');
  assert(JSON.stringify(first.manifest) === JSON.stringify(second.manifest), 'TemporalRule manifest must be deterministic.');
  assert(first.buildReceipt.sourceCommit !== second.buildReceipt.sourceCommit, 'Run metadata belongs in build receipt.');
  assert(first.buildReceipt.sourceDatasetSha256 !== reformatted.buildReceipt.sourceDatasetSha256, 'Source-byte provenance must detect formatting changes.');
  assert(first.manifest.temporalRuleCount === 16, 'Reviewed TemporalRule bootstrap count changed.');
  assert(first.manifest.runtimePublicationAllowed === false && first.manifest.productionMutationAllowed === false, 'TemporalRule bootstrap must remain shadow-only.');
  assert(first.manifest.semantics.temporalRuleSeparateFromObservance === true, 'TemporalRule must remain separate from Observance.');
  assert(first.manifest.semantics.temporalRuleSeparateFromOccurrence === true, 'TemporalRule must remain separate from Occurrence.');
  assert(first.manifest.semantics.ruleContainsNoAnnualOccurrenceState === true, 'TemporalRule must not contain annual occurrence state.');
  assert(first.manifest.semantics.temporalRuleResolvesThroughSharedCalendarEngine === true, 'TemporalRule must resolve through shared calendar engine.');

  const byId = new Map(first.rules.map((item) => [item.temporalRuleId, item]));
  assert(vectors?.schemaVersion === 1 && vectors?.status === 'official-temporal-reference-vectors' && Array.isArray(vectors?.vectors), 'Official temporal reference vectors are invalid.');
  assert(vectors.vectors.length === 16, 'Expected sixteen official temporal reference vectors.');
  for (const vector of vectors.vectors) {
    const rule = byId.get(vector.temporalRuleId);
    assert(rule, `Reference vector points to unknown TemporalRule ${vector.temporalRuleId}.`);
    assert(/^https:\/\/www\.vatican\.va\//u.test(vector.sourceUrl), `${vector.temporalRuleId} reference vector must be Vatican authority evidence.`);
    const resolved = calendar.resolveDateRule(rule.dateRule, vector.year);
    assert(resolved.status === 'resolved', `${vector.temporalRuleId} did not resolve for ${vector.year}: ${resolved.reason ?? 'unknown reason'}.`);
    assert(resolved.dateISO === vector.expectedDateISO, `${vector.temporalRuleId} expected ${vector.expectedDateISO}, got ${resolved.dateISO}.`);
  }

  assert(calendar.resolveDateRule(byId.get('temporal-rule:ash-wednesday:roman-catholic').dateRule, 2026).dateISO === '2026-02-18', 'Ash Wednesday 2026 reference failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:first-sunday-lent:roman-catholic').dateRule, 2026).dateISO === '2026-02-22', 'First Sunday of Lent 2026 reference failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:easter-sunday:roman-catholic').dateRule, 2026).dateISO === '2026-04-05', 'Easter 2026 reference failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:pentecost-sunday:roman-catholic').dateRule, 2026).dateISO === '2026-05-24', 'Pentecost 2026 reference failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:first-sunday-advent:roman-catholic').dateRule, 2026).dateISO === '2026-11-29', 'First Sunday of Advent 2026 reference failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:epiphany:roman-catholic').dateRule, 2026).dateISO === '2026-01-06', 'General Roman Epiphany base date failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:ascension:roman-catholic').dateRule, 2026).dateISO === '2026-05-14', 'General Roman Ascension base date failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:immaculate-heart:roman-catholic').dateRule, 2026).dateISO === '2026-06-13', 'General Roman Immaculate Heart base date failed.');
  assert(calendar.resolveDateRule(byId.get('temporal-rule:christ-the-king:roman-catholic').dateRule, 2026).dateISO === '2026-11-22', 'Christ the King 2026 reference failed.');

  for (const rule of first.rules) {
    for (const forbidden of ['year', 'date', 'dateISO', 'rank', 'grade', 'jurisdictionId', 'precedence', 'observedDesignation']) {
      assert(!(forbidden in rule), `${rule.temporalRuleId} leaked ${forbidden} into TemporalRule.`);
    }
  }

  const leakedYear = structuredClone(ruleDataset);
  leakedYear.rules[0].year = 2026;
  expectFailure('TemporalRule annual-state boundary', () => build(leakedYear), 'leaks Occurrence field year');
  const hiddenWeekday = structuredClone(ruleDataset);
  hiddenWeekday.rules[0].dateRule.weekdayAdjustment = { direction: 'next', weekday: 0 };
  expectFailure('Hidden weekday adjustment guard', () => build(hiddenWeekday), 'does not allow hidden weekday adjustments');
  const wrongCalendar = structuredClone(ruleDataset);
  wrongCalendar.rules[0].dateRule.calendar = 'julian';
  expectFailure('TemporalRule calendar consistency guard', () => build(wrongCalendar), 'DateRule calendar differs');
  const impossibleFixedDate = structuredClone(ruleDataset);
  impossibleFixedDate.rules.find((item) => item.id === 'temporal-rule:epiphany:roman-catholic').dateRule.day = 32;
  expectFailure('Fixed TemporalRule date guard', () => build(impossibleFixedDate), 'invalid fixed day');
  const mixedFixedDate = structuredClone(ruleDataset);
  mixedFixedDate.rules.find((item) => item.id === 'temporal-rule:epiphany:roman-catholic').dateRule.offsetDays = 0;
  expectFailure('Mixed fixed/relative TemporalRule guard', () => build(mixedFixedDate), 'contains relative-date fields');

  console.log(`Canonical TemporalRule v1 test passed: ${first.rules.length} rules resolve all official 2026 vectors through the shared calendar engine; deterministic root ${first.manifest.rootSha256}.`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

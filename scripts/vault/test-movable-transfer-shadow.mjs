#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-movable-transfer-'));

function host(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch { return ''; }
}

function isHost(value, domain) {
  const hostname = host(value);
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function transpile(sourcePath, outputName, rewrites = []) {
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some(item => item.category === ts.DiagnosticCategory.Error), `${path.basename(sourcePath)} transpilation returned errors.`);
  let output = compiled.outputText;
  for (const [from, to] of rewrites) output = output.replaceAll(from, to);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), output, 'utf8');
}

function validate(dataset, ruleDataset, review, approval, calendar, roman) {
  assert(dataset?.schemaVersion === 1 && dataset?.status === 'approved-release-movable-transfer-shadow', 'Movable/transfer shadow identity is invalid.');
  assert(dataset.sourceReleaseId === 'roman-catholic-pt-2026-v2' && dataset.mutationAllowed === false, 'Movable/transfer shadow must remain read-only and bound to Portugal v2.');
  assert(dataset.target?.churchId === 'church:roman-catholic' && dataset.target?.jurisdictionId === 'jurisdiction:roman-catholic:pt', 'Movable/transfer shadow Church/Jurisdiction is invalid.');
  assert(dataset.target?.calendarSystem === 'gregorian' && dataset.target?.year === 2026 && dataset.target?.policyId === 'roman-portugal', 'Movable/transfer shadow policy/year is invalid.');
  assert(dataset.sourceArtifact?.workflowRunId === 31998552573 && dataset.sourceArtifact?.artifactId === 9277632698, 'Movable/transfer shadow is not bound to the approved artifact.');
  assert(dataset.sourceArtifact?.buildJsonSha256 === '159f38f1ee763517ee4dfae738237ced2c7f243146ba3f593e5b096feaaafc06', 'Movable/transfer shadow build hash drifted.');
  assert(isHost(dataset.authorityEvidence?.universalCalendar, 'vatican.va'), 'Movable/transfer shadow lacks competent universal calendar evidence.');
  assert(isHost(dataset.authorityEvidence?.portugalAnnualCalendar, 'liturgia.pt') && isHost(dataset.authorityEvidence?.portugalTransferRules, 'liturgia.pt'), 'Movable/transfer shadow lacks competent Portugal authority evidence.');
  assert(review?.schemaVersion === 2 && review?.releaseScope === 'roman-catholic-pt-2026-overlay-v2' && review?.year === 2026, 'Transfer review scope is invalid.');
  assert(approval?.schemaVersion === 1 && approval?.releaseScope === review.releaseScope && approval?.approved === true && approval?.productionWriteAllowed === false, 'Transfer decisions require the exact non-production overlay approval.');
  assert(Array.isArray(dataset.mappings) && dataset.mappings.length === 11, 'Movable/transfer shadow must contain exactly eleven reviewed mappings.');

  const rules = new Map((ruleDataset?.rules ?? []).map(item => [item.id, item]));
  const reviewDecisions = new Map((review.decisions ?? []).map(item => [item.id, item]));
  const approvedDecisionIds = new Set(approval.decisionIds ?? []);
  const seen = { rule: new Set(), legacy: new Set(), occurrence: new Set(), source: new Set(), date: new Set() };
  const portugal = roman.calculateRomanLiturgicalYear(2026, roman.ROMAN_PORTUGAL_POLICY);
  let transferCount = 0;

  for (const mapping of dataset.mappings) {
    const rule = rules.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown TemporalRule ${mapping.temporalRuleId}.`);
    const resolved = calendar.resolveDateRule(rule.dateRule, dataset.target.year);
    assert(resolved.status === 'resolved' && resolved.dateISO === mapping.baseDateISO, `${mapping.temporalRuleId} does not resolve to base date ${mapping.baseDateISO}.`);
    assert(mapping.occurrenceId === `occurrence:${mapping.expectedDateISO}:${rule.observanceId.slice('observance:'.length)}:pt`, `${mapping.temporalRuleId} has an invalid canonical Occurrence identity.`);
    assert(typeof mapping.legacyObservanceId === 'string' && mapping.legacyObservanceId.startsWith('rc:'), `${mapping.temporalRuleId} lacks its exact legacy identity.`);
    assert(mapping.sourceOccurrenceId.startsWith(`snl-pt-${mapping.expectedDateISO}-`) && /^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash), `${mapping.temporalRuleId} lacks its exact approved source row.`);
    assert(typeof mapping.legacyRank === 'string' && mapping.legacyRank.trim(), `${mapping.temporalRuleId} lacks its approved rank.`);
    for (const [key, value] of [['rule', mapping.temporalRuleId], ['legacy', mapping.legacyObservanceId], ['occurrence', mapping.occurrenceId], ['source', mapping.sourceOccurrenceId], ['date', mapping.expectedDateISO]]) {
      assert(!seen[key].has(value), `Duplicate movable/transfer ${key} ${value}.`);
      seen[key].add(value);
    }

    if (mapping.transfer) {
      transferCount += 1;
      const decision = reviewDecisions.get(mapping.transfer.decisionId);
      assert(decision?.type === 'date-transfer', `${mapping.temporalRuleId} lacks its reviewed date-transfer decision.`);
      assert(approvedDecisionIds.has(decision.id), `${decision.id} lacks explicit project-owner approval.`);
      assert(decision.canonicalEventId === mapping.legacyObservanceId && decision.fromDate === mapping.baseDateISO && decision.toDate === mapping.expectedDateISO && decision.rank === mapping.legacyRank, `${decision.id} differs from the shadow mapping.`);
      assert(mapping.transfer.fromDateISO === mapping.baseDateISO && mapping.transfer.toDateISO === mapping.expectedDateISO, `${decision.id} transfer dates differ from the TemporalRule and destination.`);
      assert(mapping.reviewStatus === 'approved' && mapping.resolution === 'pending-transfer-destination', `${decision.id} lacks its approved destination outcome.`);
      const origin = mapping.transfer.originReplacement;
      assert(typeof origin?.legacyObservanceId === 'string' && origin.legacyObservanceId !== mapping.legacyObservanceId, `${decision.id} lacks its distinct origin replacement.`);
      assert(origin.sourceOccurrenceId.startsWith(`snl-pt-${mapping.baseDateISO}-`) && /^[a-f0-9]{64}$/u.test(origin.sourceRecordHash), `${decision.id} lacks its exact origin replacement source row.`);
      if (decision.replacementAtOrigin) assert(decision.replacementAtOrigin.canonicalEventId === origin.legacyObservanceId, `${decision.id} origin replacement differs from the review.`);
    } else {
      assert(mapping.baseDateISO === mapping.expectedDateISO, `${mapping.temporalRuleId} changes date without a reviewed transfer.`);
      assert(mapping.reviewStatus === 'inherited-safe' && mapping.resolution === 'inherit-general-canonical-binding', `${mapping.temporalRuleId} lacks its inherited-safe outcome.`);
    }

    if (mapping.principalDay) assert(portugal.keyDates[mapping.principalDay] === mapping.expectedDateISO, `${mapping.temporalRuleId} differs from the Portugal Roman kernel.`);
  }

  assert(transferCount === 3, 'Movable/transfer shadow must preserve exactly three Portugal transfer decisions.');
  assert(JSON.stringify([...seen.rule].sort()) === JSON.stringify([
    'temporal-rule:ascension:roman-catholic',
    'temporal-rule:christ-the-king:roman-catholic',
    'temporal-rule:corpus-christi:roman-catholic',
    'temporal-rule:epiphany:roman-catholic',
    'temporal-rule:good-friday:roman-catholic',
    'temporal-rule:holy-saturday:roman-catholic',
    'temporal-rule:holy-thursday:roman-catholic',
    'temporal-rule:immaculate-heart:roman-catholic',
    'temporal-rule:palm-sunday:roman-catholic',
    'temporal-rule:sacred-heart:roman-catholic',
    'temporal-rule:trinity-sunday:roman-catholic'
  ]), 'Movable/transfer rule set drifted.');
}

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  const calendar = await import(`${pathToFileURL(path.join(temporaryDirectory, 'calendar-engine.js')).href}?v=${Date.now()}`);
  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const dataset = read('data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json');
  const rules = read('data/canonical-temporal-rule-anchors.json');
  const review = read('data/releases/roman-catholic-pt-2026.overlay-review.json');
  const approval = read('data/releases/roman-catholic-pt-2026.overlay-approval.json');

  validate(dataset, rules, review, approval, calendar, roman);

  const wrongBase = clone(dataset);
  wrongBase.mappings[0].baseDateISO = '2026-01-05';
  assertRejects(() => validate(wrongBase, rules, review, approval, calendar, roman), 'Wrong movable base date');
  const unapproved = clone(approval);
  unapproved.decisionIds = unapproved.decisionIds.filter(id => id !== 'pt-2026-ascension-transfer');
  assertRejects(() => validate(dataset, rules, review, unapproved, calendar, roman), 'Unapproved transfer');
  const duplicate = clone(dataset);
  duplicate.mappings[1].sourceOccurrenceId = duplicate.mappings[0].sourceOccurrenceId;
  assertRejects(() => validate(duplicate, rules, review, approval, calendar, roman), 'Duplicate source row');

  console.log('Movable/transfer shadow passed: 11 exact Portugal 2026 mappings resolve through canonical TemporalRules, including three explicitly approved jurisdiction transfers; runtime publication remains blocked.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

function assertRejects(fn, label) {
  let rejected = false;
  try { fn(); } catch { rejected = true; }
  assert(rejected, `${label} must fail closed.`);
}

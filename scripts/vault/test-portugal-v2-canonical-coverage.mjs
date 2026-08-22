#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
function readJson(relativePath) { return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8')); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const coverage = readJson('data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json');
const approval = readJson('data/releases/roman-catholic-pt-2026-v2.production-request.json');
const occurrenceDataset = readJson('data/canonical-occurrence-anchors.json');
const bridgeDataset = readJson('data/canonical-occurrence-legacy-bridges.json');
const jurisdictionDataset = readJson('data/canonical-jurisdiction-anchors.json');
const temporalRuleDataset = readJson('data/canonical-temporal-rule-anchors.json');
const temporalShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.temporal-shadow.json');

assert(coverage?.schemaVersion === 1 && coverage?.migrationId === 'roman-catholic-pt-2026-v2-to-canonical-occurrence-v1', 'Canonical migration coverage gate identity changed unexpectedly.');
assert(coverage?.status === 'shadow-equivalence-in-progress', 'Portugal canonical migration must remain in shadow equivalence until complete.');
assert(coverage?.sourceReleaseId === 'roman-catholic-pt-2026-v2', 'Coverage gate targets the wrong production release.');
assert(approval?.schemaVersion === 1 && approval?.releaseId === coverage.sourceReleaseId && approval?.approved === true, 'Coverage source is not the exact approved Portugal v2 production request.');
assert(coverage.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId, 'Coverage workflow run differs from approval.');
assert(coverage.sourceArtifact.artifactId === approval.artifacts.release.id, 'Coverage artifact id differs from approval.');
assert(coverage.sourceArtifact.artifactName === approval.artifacts.release.name, 'Coverage artifact name differs from approval.');
assert(`sha256:${coverage.sourceArtifact.artifactSha256}` === approval.artifacts.release.digest, 'Coverage artifact digest differs from approval.');
assert(`sha256:${coverage.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Coverage build.json digest differs from approval.');
assert(`sha256:${coverage.sourceArtifact.releaseJsonSha256}` === approval.artifacts.release.files['release.json'], 'Coverage release.json digest differs from approval.');
assert(coverage.sourceArtifact.sourceCommit === approval.sourceMainCommit, 'Coverage source commit differs from approval.');
assert(coverage.sourcePopulation.occurrences === approval.expected.occurrences && coverage.sourcePopulation.occurrences === 389, 'Source occurrence population drifted.');
assert(coverage.sourcePopulation.days === 365 && coverage.sourcePopulation.labels === 1945, 'Source release topology drifted.');

const explicitOccurrences = occurrenceDataset?.occurrences ?? [];
const explicitBridges = bridgeDataset?.bridges ?? [];
assert(occurrenceDataset?.status === 'repository-reviewed-occurrence-anchors', 'Coverage requires reviewed canonical Occurrences.');
assert(bridgeDataset?.status === 'repository-reviewed-read-only-compatibility-bridge' && bridgeDataset?.mutationAllowed === false, 'Coverage requires read-only legacy bridges.');
assert(bridgeDataset?.legacyReleaseId === coverage.sourceReleaseId, 'Legacy bridge targets a different source release.');
assert(explicitOccurrences.length === 6 && explicitOccurrences.length === coverage.coverage.explicitOccurrenceAnchors, 'Explicit canonical Occurrence count must remain exactly six in this tranche.');
assert(explicitBridges.length === 6 && explicitBridges.length === coverage.coverage.explicitOccurrenceAnchors, 'Explicit legacy bridge count must equal the six canonical Occurrences.');

assert(temporalShadow?.schemaVersion === 1 && temporalShadow?.status === 'approved-release-temporal-shadow-mappings', 'Temporal shadow mapping dataset is invalid.');
assert(temporalShadow?.sourceReleaseId === coverage.sourceReleaseId, 'Temporal shadow targets the wrong release.');
assert(temporalShadow?.mutationAllowed === false, 'Temporal shadow mappings must remain read-only.');
assert(temporalShadow.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId, 'Temporal shadow workflow run differs from approval.');
assert(temporalShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Temporal shadow artifact differs from approval.');
assert(`sha256:${temporalShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Temporal shadow build.json hash differs from approved artifact.');
assert(temporalShadow.target.churchId === coverage.canonicalTarget.churchId, 'Temporal shadow Church differs from target.');
assert(temporalShadow.target.jurisdictionId === coverage.canonicalTarget.jurisdictionId, 'Temporal shadow Jurisdiction differs from target.');
assert(temporalShadow.target.calendarSystem === coverage.canonicalTarget.calendarSystem && temporalShadow.target.year === coverage.canonicalTarget.year, 'Temporal shadow calendar/year differs from target.');
assert(Array.isArray(temporalShadow.mappings) && temporalShadow.mappings.length === 5 && temporalShadow.mappings.length === coverage.coverage.temporalRuleShadowOccurrences, 'Temporal shadow mapping count must be exactly five.');

const totalMapped = explicitOccurrences.length + temporalShadow.mappings.length;
assert(totalMapped === 11 && totalMapped === coverage.coverage.mappedOccurrenceAnchors, 'Combined canonical shadow coverage must be exactly 11/389.');
assert(coverage.coverage.remainingLegacyOccurrences === 378 && coverage.coverage.remainingLegacyOccurrences === 389 - totalMapped, 'Remaining legacy count must be exactly 378.');
assert(coverage.coverage.requiredForPromotion === 389, 'Promotion threshold must remain full 389/389 coverage.');
assert(coverage.coverage.promotionAllowed === false, 'Incomplete canonical coverage must not permit promotion.');

const jurisdiction = (jurisdictionDataset?.jurisdictions ?? []).find((item) => item.id === coverage.canonicalTarget.jurisdictionId);
assert(jurisdiction?.churchId === coverage.canonicalTarget.churchId, 'Coverage target Jurisdiction/Church mismatch.');
assert((jurisdiction.calendarSystems ?? []).includes(coverage.canonicalTarget.calendarSystem), 'Coverage target calendar is invalid for its Jurisdiction.');

const explicitOccurrenceById = new Map(explicitOccurrences.map((item) => [item.id, item]));
const legacyIds = new Set();
for (const bridge of explicitBridges) {
  assert(!legacyIds.has(bridge.legacyObservanceId), `Duplicate legacy coverage: ${bridge.legacyObservanceId}.`);
  legacyIds.add(bridge.legacyObservanceId);
  const occurrence = explicitOccurrenceById.get(bridge.occurrenceId);
  assert(occurrence, `Bridge ${bridge.occurrenceId} lacks canonical Occurrence.`);
  assert(bridge.dateISO === occurrence.dateISO, `Bridge ${bridge.occurrenceId} date differs from canonical Occurrence.`);
  assert(occurrence.churchId === coverage.canonicalTarget.churchId, `${bridge.occurrenceId} Church differs from target.`);
  assert(occurrence.jurisdictionId === coverage.canonicalTarget.jurisdictionId, `${bridge.occurrenceId} Jurisdiction differs from target.`);
  assert(occurrence.calendarSystem === coverage.canonicalTarget.calendarSystem && occurrence.year === 2026, `${bridge.occurrenceId} calendar/year differs from target.`);
  const expectedLegacyRank = occurrence.rank === 'obligatory-memorial' ? 'memorial' : occurrence.rank;
  assert(['memorial', 'feast', 'solemnity'].includes(expectedLegacyRank), `${bridge.occurrenceId} lacks an explicit legacy-rank equivalence class.`);
}

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-coverage-temporal-'));
try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  const sourcePath = path.join(root, 'lib', 'knowledge', 'calendar-engine.ts');
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some((item) => item.category === ts.DiagnosticCategory.Error), 'calendar-engine.ts transpilation returned errors in migration coverage gate.');
  fs.writeFileSync(path.join(temporaryDirectory, 'calendar-engine.js'), compiled.outputText, 'utf8');
  const calendar = await import(`${pathToFileURL(path.join(temporaryDirectory, 'calendar-engine.js')).href}?v=${Date.now()}`);
  const temporalRules = new Map((temporalRuleDataset?.rules ?? []).map((item) => [item.id, item]));

  for (const mapping of temporalShadow.mappings) {
    assert(!legacyIds.has(mapping.legacyObservanceId), `Duplicate legacy coverage across explicit/temporal mappings: ${mapping.legacyObservanceId}.`);
    legacyIds.add(mapping.legacyObservanceId);
    const rule = temporalRules.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown TemporalRule ${mapping.temporalRuleId}.`);
    assert(rule.churchId === coverage.canonicalTarget.churchId, `${mapping.occurrenceId} TemporalRule Church differs from target.`);
    assert(rule.calendarSystem === coverage.canonicalTarget.calendarSystem, `${mapping.occurrenceId} TemporalRule calendar differs from target.`);
    const resolved = calendar.resolveDateRule(rule.dateRule, temporalShadow.target.year);
    assert(resolved.status === 'resolved', `${mapping.temporalRuleId} did not resolve for 2026: ${resolved.reason ?? 'unknown reason'}.`);
    assert(resolved.dateISO === mapping.expectedDateISO, `${mapping.temporalRuleId} resolved ${resolved.dateISO}, expected approved row ${mapping.expectedDateISO}.`);
    assert(mapping.occurrenceId.startsWith(`occurrence:${mapping.expectedDateISO}:`), `${mapping.occurrenceId} does not encode its resolved date.`);
    assert(/^rc:[A-Za-z0-9]+$/u.test(mapping.legacyObservanceId), `${mapping.occurrenceId} has invalid legacy ID.`);
    assert(/^snl-pt-2026-\d{2}-\d{2}-[a-f0-9]+$/u.test(mapping.sourceOccurrenceId), `${mapping.occurrenceId} lacks the exact approved SNL source occurrence id.`);
    assert(/^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash), `${mapping.occurrenceId} lacks an approved source record hash.`);
    assert(mapping.legacyRank === 'solemnity', `${mapping.occurrenceId} temporal bootstrap rank differs from approved release.`);
  }
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

for (const requiredLegacyId of ['rc:NativityJohnBaptist', 'rc:StsPeterPaulAp', 'rc:AshWednesday', 'rc:Lent1', 'rc:Easter', 'rc:Pentecost', 'rc:Advent1']) {
  assert(legacyIds.has(requiredLegacyId), `Exact approved source mapping missing ${requiredLegacyId}.`);
}
assert(!legacyIds.has('rc:StsJoachimAnne'), 'Joachim/Anne must not be fabricated in the Portugal 2026 source release.');
assert(legacyIds.size === totalMapped, 'Every canonical/shadow mapping must cover a unique legacy occurrence identity.');

const policy = coverage.equivalencePolicy ?? {};
for (const key of [
  'exactLegacyObservanceIdBridgeRequired','exactDateRequired','rankCompatibilityRequired',
  'legacyMemorialMayRefineToObligatoryMemorialWhenOfficialSourceCodeIsMO','churchAndJurisdictionMustRemainFixed',
  'temporalShadowMustResolveThroughCanonicalTemporalRule','temporalShadowMustAnchorExactApprovedSourceRow',
  'noAutomaticCanonicalIdentityCreation','noD1MutationBeforeFullCoverage','noRuntimeSwitchBeforeFullCoverage','noDropboxPromotionImplied'
]) assert(policy[key] === true, `Coverage safety policy ${key} must remain true.`);

const coveragePercent = Number(((totalMapped / 389) * 100).toFixed(3));
assert(coveragePercent === 2.828, `Unexpected canonical coverage percentage ${coveragePercent}.`);
console.log(`Portugal v2 canonical migration gate passed: ${totalMapped}/389 (${coveragePercent}%) exact shadow mappings = 6 explicit + 5 TemporalRule-derived, 378 remaining, promotion blocked.`);

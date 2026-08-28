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
const temporalFamilyShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json');

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
assert(explicitOccurrences.length === 13 && explicitOccurrences.length === coverage.coverage.explicitOccurrenceAnchors, 'Explicit canonical Occurrence count must remain exactly thirteen.');
assert(explicitBridges.length === 13 && explicitBridges.length === coverage.coverage.explicitOccurrenceAnchors, 'Explicit legacy bridge count must equal the thirteen canonical Occurrences.');

assert(temporalShadow?.schemaVersion === 1 && temporalShadow?.status === 'approved-release-temporal-shadow-mappings', 'Temporal shadow mapping dataset is invalid.');
assert(temporalShadow?.sourceReleaseId === coverage.sourceReleaseId && temporalShadow?.mutationAllowed === false, 'Temporal shadow must target the approved release and remain read-only.');
assert(temporalShadow.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId && temporalShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Temporal shadow artifact identity differs from approval.');
assert(`sha256:${temporalShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Temporal shadow build hash differs from approval.');
assert(temporalShadow.target.churchId === coverage.canonicalTarget.churchId && temporalShadow.target.jurisdictionId === coverage.canonicalTarget.jurisdictionId, 'Temporal shadow Church/Jurisdiction differs from target.');
assert(temporalShadow.target.calendarSystem === coverage.canonicalTarget.calendarSystem && temporalShadow.target.year === coverage.canonicalTarget.year, 'Temporal shadow calendar/year differs from target.');
assert(Array.isArray(temporalShadow.mappings) && temporalShadow.mappings.length === 5 && temporalShadow.mappings.length === coverage.coverage.temporalRuleShadowOccurrences, 'Temporal shadow mapping count must be exactly five.');

assert(temporalFamilyShadow?.schemaVersion === 1 && temporalFamilyShadow?.status === 'approved-release-temporal-family-shadow', 'Temporal family shadow is invalid.');
assert(temporalFamilyShadow?.sourceReleaseId === coverage.sourceReleaseId && temporalFamilyShadow?.mutationAllowed === false, 'Temporal family shadow must target the approved release and remain read-only.');
assert(temporalFamilyShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Temporal family shadow artifact differs from approval.');
assert(`sha256:${temporalFamilyShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Temporal family shadow build hash differs from approval.');
assert(temporalFamilyShadow.year === 2026, 'Temporal family shadow must remain bound to the reviewed 2026 equivalence snapshot.');
const familyPresentLegacyIds = (temporalFamilyShadow.families ?? []).flatMap((item) => item.presentLegacyIds ?? []);
const familyPresentSet = new Set(familyPresentLegacyIds);
assert(familyPresentLegacyIds.length === 47 && familyPresentSet.size === 47 && familyPresentLegacyIds.length === coverage.coverage.temporalRuleFamilyShadowOccurrences, 'Temporal family coverage must be exactly 47 unique precedence-surviving rows.');
assert(Array.isArray(temporalFamilyShadow.suppressedCandidates) && temporalFamilyShadow.suppressedCandidates.length === 19, 'Temporal family snapshot must preserve exactly 19 precedence suppressions.');
for (const suppression of temporalFamilyShadow.suppressedCandidates) {
  assert(!familyPresentSet.has(suppression.suppressingLegacyObservanceId), 'A suppressing observance must not be counted as the suppressed temporal candidate.');
  assert(/^2026-\d{2}-\d{2}$/u.test(suppression.candidateDateISO), 'Temporal family suppression requires an exact 2026 candidate date.');
  assert(typeof suppression.suppressingLegacyObservanceId === 'string' && ['optional-memorial','memorial','feast','solemnity'].includes(suppression.suppressingRank), 'Temporal family suppression lacks an explicit precedence outcome.');
}

const jurisdiction = (jurisdictionDataset?.jurisdictions ?? []).find((item) => item.id === coverage.canonicalTarget.jurisdictionId);
assert(jurisdiction?.churchId === coverage.canonicalTarget.churchId, 'Coverage target Jurisdiction/Church mismatch.');
assert((jurisdiction.calendarSystems ?? []).includes(coverage.canonicalTarget.calendarSystem), 'Coverage target calendar is invalid for its Jurisdiction.');

const explicitOccurrenceById = new Map(explicitOccurrences.map((item) => [item.id, item]));
const legacyIds = new Set();
for (const bridge of explicitBridges) {
  assert(!legacyIds.has(bridge.legacyObservanceId), `Duplicate legacy coverage: ${bridge.legacyObservanceId}.`);
  legacyIds.add(bridge.legacyObservanceId);
  const occurrence = explicitOccurrenceById.get(bridge.occurrenceId);
  assert(occurrence && bridge.dateISO === occurrence.dateISO, `Bridge ${bridge.occurrenceId} lacks exact canonical date equivalence.`);
  assert(occurrence.churchId === coverage.canonicalTarget.churchId && occurrence.jurisdictionId === coverage.canonicalTarget.jurisdictionId, `${bridge.occurrenceId} Church/Jurisdiction differs from target.`);
  assert(occurrence.calendarSystem === coverage.canonicalTarget.calendarSystem && occurrence.year === 2026, `${bridge.occurrenceId} calendar/year differs from target.`);
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
    const resolved = calendar.resolveDateRule(rule.dateRule, temporalShadow.target.year);
    assert(resolved.status === 'resolved' && resolved.dateISO === mapping.expectedDateISO, `${mapping.temporalRuleId} does not match approved date ${mapping.expectedDateISO}.`);
    assert(mapping.legacyRank === 'solemnity', `${mapping.occurrenceId} temporal bootstrap rank differs from approved release.`);
  }
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

for (const familyLegacyId of familyPresentLegacyIds) {
  assert(!legacyIds.has(familyLegacyId), `Temporal family row ${familyLegacyId} collides with existing explicit/TemporalRule coverage.`);
  legacyIds.add(familyLegacyId);
}

const totalMapped = explicitOccurrences.length + temporalShadow.mappings.length + familyPresentLegacyIds.length;
assert(totalMapped === 65 && totalMapped === coverage.coverage.mappedOccurrenceAnchors, 'Combined canonical shadow coverage must be exactly 65/389.');
assert(coverage.coverage.remainingLegacyOccurrences === 324 && coverage.coverage.remainingLegacyOccurrences === 389 - totalMapped, 'Remaining legacy count must be exactly 324.');
assert(coverage.coverage.requiredForPromotion === 389 && coverage.coverage.promotionAllowed === false, 'Promotion must remain blocked until 389/389.');
assert(legacyIds.size === totalMapped, 'Every counted mapping must cover one unique legacy occurrence identity.');
assert(!legacyIds.has('rc:StsJoachimAnne'), 'Joachim/Anne must not be fabricated in the Portugal 2026 source release.');
assert(!familyPresentSet.has('rc:LentWeekday4Thursday'), 'Suppressed St Joseph Lent weekday must not count as family coverage.');
assert(!familyPresentSet.has('rc:EasterWeekday6Wednesday'), 'Suppressed Fatima Easter weekday must not count as family coverage.');

const policy = coverage.equivalencePolicy ?? {};
for (const key of [
  'exactLegacyObservanceIdBridgeRequired','exactDateRequired','rankCompatibilityRequired',
  'legacyMemorialMayRefineToObligatoryMemorialWhenOfficialSourceCodeIsMO','churchAndJurisdictionMustRemainFixed',
  'temporalShadowMustResolveThroughCanonicalTemporalRule','temporalShadowMustAnchorExactApprovedSourceRow',
  'temporalFamilyCandidatesRequirePrecedenceResolution','suppressedTemporalFamilyCandidatesMustNotCountAsCoverage',
  'noAutomaticCanonicalIdentityCreation','noD1MutationBeforeFullCoverage','noRuntimeSwitchBeforeFullCoverage','noDropboxPromotionImplied'
]) assert(policy[key] === true, `Coverage safety policy ${key} must remain true.`);

const coveragePercent = Number(((totalMapped / 389) * 100).toFixed(3));
assert(coveragePercent === 16.71, `Unexpected canonical coverage percentage ${coveragePercent}.`);
console.log(`Portugal v2 canonical migration gate passed: ${totalMapped}/389 (${coveragePercent}%) = 13 explicit + 5 TemporalRule + 47 precedence-surviving family rows; 324 remaining, promotion blocked.`);

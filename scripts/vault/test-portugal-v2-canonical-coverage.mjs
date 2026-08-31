#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = process.cwd();
function readJson(relativePath) { return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8')); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const coverage = readJson('data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json');
const approval = readJson('data/releases/roman-catholic-pt-2026-v2.production-request.json');
const occurrenceDataset = readJson('data/canonical-occurrence-anchors.json');
const bridgeDataset = readJson('data/canonical-occurrence-legacy-bridges.json');
const sanctoraleRuleDataset = readJson('data/canonical-roman-sanctorale-rule-anchors.json');
const fixedSanctoraleShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json');
const jurisdictionDataset = readJson('data/canonical-jurisdiction-anchors.json');
const temporalRuleDataset = readJson('data/canonical-temporal-rule-anchors.json');
const temporalShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.temporal-shadow.json');
const temporalFamilyDataset = readJson('data/canonical-temporal-rule-families.json');
const temporalFamilyShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json');
const movableTransferShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json');
const overlayReview = readJson('data/releases/roman-catholic-pt-2026.overlay-review.json');
const overlayApproval = readJson('data/releases/roman-catholic-pt-2026.overlay-approval.json');

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
assert(explicitOccurrences.length === 27 && explicitOccurrences.length === coverage.coverage.explicitOccurrenceAnchors, 'Explicit canonical Occurrence count must remain exactly twenty-seven.');
assert(explicitBridges.length === 27 && explicitBridges.length === coverage.coverage.explicitOccurrenceAnchors, 'Explicit legacy bridge count must equal the twenty-seven canonical Occurrences.');

assert(fixedSanctoraleShadow?.schemaVersion === 1 && fixedSanctoraleShadow?.status === 'approved-release-fixed-sanctorale-shadow', 'Fixed Sanctorale shadow is invalid.');
assert(fixedSanctoraleShadow.sourceReleaseId === coverage.sourceReleaseId && fixedSanctoraleShadow.mutationAllowed === false, 'Fixed Sanctorale shadow must target the approved release and remain read-only.');
assert(fixedSanctoraleShadow.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId && fixedSanctoraleShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Fixed Sanctorale shadow workflow/artifact differs from approval.');
assert(`sha256:${fixedSanctoraleShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Fixed Sanctorale shadow build hash differs from approval.');
assert(fixedSanctoraleShadow.target.churchId === coverage.canonicalTarget.churchId && fixedSanctoraleShadow.target.jurisdictionId === coverage.canonicalTarget.jurisdictionId, 'Fixed Sanctorale shadow Church/Jurisdiction differs from target.');
assert(fixedSanctoraleShadow.target.calendarSystem === coverage.canonicalTarget.calendarSystem && fixedSanctoraleShadow.target.year === coverage.canonicalTarget.year, 'Fixed Sanctorale shadow calendar/year differs from target.');
assert(Array.isArray(fixedSanctoraleShadow.mappings) && fixedSanctoraleShadow.mappings.length === 27, 'Fixed Sanctorale shadow must contain exactly twenty-seven exact source bindings.');
const fixedSanctoraleMappingDigest = createHash('sha256').update(JSON.stringify(fixedSanctoraleShadow.mappings)).digest('hex');
assert(fixedSanctoraleMappingDigest === 'a95e134259fa48ccfe8ef18fcdcb7dd1d3384170669fa543cff801b54c188ce0', `Fixed Sanctorale mapping set differs from the explicitly reviewed approved-artifact rows: ${fixedSanctoraleMappingDigest}.`);
assert(/^https:\/\/(?:www\.)?liturgia\.pt\//u.test(fixedSanctoraleShadow.authorityEvidence?.portugalAnnualCalendar ?? ''), 'Fixed Sanctorale shadow lacks competent Portugal authority evidence.');

assert(temporalShadow?.schemaVersion === 1 && temporalShadow?.status === 'approved-release-temporal-shadow-mappings', 'Temporal shadow mapping dataset is invalid.');
assert(temporalShadow?.sourceReleaseId === coverage.sourceReleaseId && temporalShadow?.mutationAllowed === false, 'Temporal shadow must target the approved release and remain read-only.');
assert(temporalShadow.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId && temporalShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Temporal shadow artifact identity differs from approval.');
assert(`sha256:${temporalShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Temporal shadow build hash differs from approval.');
assert(temporalShadow.target.churchId === coverage.canonicalTarget.churchId && temporalShadow.target.jurisdictionId === coverage.canonicalTarget.jurisdictionId, 'Temporal shadow Church/Jurisdiction differs from target.');
assert(temporalShadow.target.calendarSystem === coverage.canonicalTarget.calendarSystem && temporalShadow.target.year === coverage.canonicalTarget.year, 'Temporal shadow calendar/year differs from target.');
assert(Array.isArray(temporalShadow.mappings) && temporalShadow.mappings.length === 5 && temporalShadow.mappings.length === coverage.coverage.temporalRuleShadowOccurrences, 'Temporal shadow mapping count must be exactly five.');

assert(temporalFamilyShadow?.schemaVersion === 1 && temporalFamilyShadow?.status === 'approved-release-temporal-family-shadow', 'Temporal family shadow is invalid.');
assert(temporalFamilyShadow?.sourceReleaseId === coverage.sourceReleaseId && temporalFamilyShadow?.mutationAllowed === false, 'Temporal family shadow must target the approved release and remain read-only.');
assert(temporalFamilyShadow.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId && temporalFamilyShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Temporal family shadow workflow/artifact differs from approval.');
assert(`sha256:${temporalFamilyShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Temporal family shadow build hash differs from approval.');
assert(temporalFamilyShadow.year === 2026, 'Temporal family shadow must remain bound to the reviewed 2026 equivalence snapshot.');
const familyPresentLegacyIds = (temporalFamilyShadow.families ?? []).flatMap((item) => item.presentLegacyIds ?? []);
const familyMappings = (temporalFamilyShadow.families ?? []).flatMap((item) => (item.presentMappings ?? []).map((mapping) => ({ ...mapping, familyId: item.familyId })));
const familyPresentSet = new Set(familyPresentLegacyIds);
assert(familyPresentLegacyIds.length === 47 && familyPresentSet.size === 47 && familyPresentLegacyIds.length === coverage.coverage.temporalRuleFamilyShadowOccurrences, 'Temporal family coverage must be exactly 47 unique precedence-surviving rows.');
assert(familyMappings.length === 47 && new Set(familyMappings.map((item) => item.sourceOccurrenceId)).size === 47 && new Set(familyMappings.map((item) => item.sourceRecordHash)).size === 47 && new Set(familyMappings.map((item) => item.occurrenceId)).size === 47, 'Temporal family coverage requires 47 unique exact source and canonical occurrence mappings.');
assert(familyMappings.every((item) => familyPresentSet.has(item.legacyObservanceId) && item.legacyRank === 'weekday' && item.reviewStatus === 'inherited-safe' && item.resolution === 'inherit-general-canonical-binding'), 'Temporal family exact mappings differ from the approved precedence-surviving identities.');
assert(Array.isArray(temporalFamilyShadow.suppressedCandidates) && temporalFamilyShadow.suppressedCandidates.length === 19, 'Temporal family snapshot must preserve exactly 19 precedence suppressions.');
for (const suppression of temporalFamilyShadow.suppressedCandidates) {
  assert(!familyPresentSet.has(suppression.suppressingLegacyObservanceId), 'A suppressing observance must not be counted as the suppressed temporal candidate.');
  assert(/^2026-\d{2}-\d{2}$/u.test(suppression.candidateDateISO), 'Temporal family suppression requires an exact 2026 candidate date.');
  assert(typeof suppression.suppressingLegacyObservanceId === 'string' && ['optional-memorial','memorial','feast','solemnity'].includes(suppression.suppressingRank), 'Temporal family suppression lacks an explicit precedence outcome.');
}

assert(movableTransferShadow?.schemaVersion === 1 && movableTransferShadow?.status === 'approved-release-movable-transfer-shadow', 'Movable/transfer shadow is invalid.');
assert(movableTransferShadow.sourceReleaseId === coverage.sourceReleaseId && movableTransferShadow.mutationAllowed === false, 'Movable/transfer shadow must target the approved release and remain read-only.');
assert(movableTransferShadow.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId && movableTransferShadow.sourceArtifact.artifactId === approval.artifacts.release.id, 'Movable/transfer shadow workflow/artifact differs from approval.');
assert(`sha256:${movableTransferShadow.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Movable/transfer shadow build hash differs from approval.');
assert(movableTransferShadow.target.churchId === coverage.canonicalTarget.churchId && movableTransferShadow.target.jurisdictionId === coverage.canonicalTarget.jurisdictionId, 'Movable/transfer Church/Jurisdiction differs from target.');
assert(movableTransferShadow.target.calendarSystem === coverage.canonicalTarget.calendarSystem && movableTransferShadow.target.year === coverage.canonicalTarget.year && movableTransferShadow.target.policyId === 'roman-portugal', 'Movable/transfer calendar/year/policy differs from target.');
assert(Array.isArray(movableTransferShadow.mappings) && movableTransferShadow.mappings.length === 11 && movableTransferShadow.mappings.length === coverage.coverage.movableTransferShadowOccurrences, 'Movable/transfer shadow coverage must be exactly eleven rows.');
assert(/^https:\/\/(?:www\.)?vatican\.va\//u.test(movableTransferShadow.authorityEvidence?.universalCalendar ?? ''), 'Movable/transfer shadow lacks Holy See authority evidence.');
assert([movableTransferShadow.authorityEvidence?.portugalAnnualCalendar, movableTransferShadow.authorityEvidence?.portugalTransferRules].every(url => /^https:\/\/(?:www\.)?liturgia\.pt\//u.test(url ?? '')), 'Movable/transfer shadow lacks Portugal authority evidence.');
assert(overlayReview?.schemaVersion === 2 && overlayReview?.releaseScope === 'roman-catholic-pt-2026-overlay-v2' && overlayReview?.year === 2026, 'Movable transfer review scope is invalid.');
assert(overlayApproval?.schemaVersion === 1 && overlayApproval?.releaseScope === overlayReview.releaseScope && overlayApproval?.approved === true && overlayApproval?.productionWriteAllowed === false, 'Movable transfers require the exact non-production overlay approval.');

const jurisdiction = (jurisdictionDataset?.jurisdictions ?? []).find((item) => item.id === coverage.canonicalTarget.jurisdictionId);
assert(jurisdiction?.churchId === coverage.canonicalTarget.churchId, 'Coverage target Jurisdiction/Church mismatch.');
assert((jurisdiction.calendarSystems ?? []).includes(coverage.canonicalTarget.calendarSystem), 'Coverage target calendar is invalid for its Jurisdiction.');

const explicitOccurrenceById = new Map(explicitOccurrences.map((item) => [item.id, item]));
const explicitBridgeByOccurrence = new Map(explicitBridges.map((item) => [item.occurrenceId, item]));
const sanctoraleRulesById = new Map((sanctoraleRuleDataset?.rules ?? []).map((item) => [item.id, item]));
const fixedMappingByOccurrence = new Map(fixedSanctoraleShadow.mappings.map((item) => [item.occurrenceId, item]));
assert(explicitOccurrenceById.size === 27 && explicitBridgeByOccurrence.size === 27 && fixedMappingByOccurrence.size === 27, 'Fixed Sanctorale canonical/source identities must be unique.');
const fixedSourceIds = new Set();
const fixedSourceHashes = new Set();
const legacyIds = new Set();
for (const bridge of explicitBridges) {
  assert(!legacyIds.has(bridge.legacyObservanceId), `Duplicate legacy coverage: ${bridge.legacyObservanceId}.`);
  legacyIds.add(bridge.legacyObservanceId);
  const occurrence = explicitOccurrenceById.get(bridge.occurrenceId);
  assert(occurrence && bridge.dateISO === occurrence.dateISO, `Bridge ${bridge.occurrenceId} lacks exact canonical date equivalence.`);
  assert(occurrence.churchId === coverage.canonicalTarget.churchId && occurrence.jurisdictionId === coverage.canonicalTarget.jurisdictionId, `${bridge.occurrenceId} Church/Jurisdiction differs from target.`);
  assert(occurrence.calendarSystem === coverage.canonicalTarget.calendarSystem && occurrence.year === 2026, `${bridge.occurrenceId} calendar/year differs from target.`);
  const mapping = fixedMappingByOccurrence.get(bridge.occurrenceId);
  assert(mapping, `${bridge.occurrenceId} lacks an exact approved source mapping.`);
  const rule = sanctoraleRulesById.get(mapping.sanctoraleRuleId);
  assert(rule && rule.observanceId === occurrence.observanceId && mapping.observanceId === occurrence.observanceId, `${bridge.occurrenceId} does not resolve through its canonical Sanctorale rule.`);
  assert(mapping.legacyObservanceId === bridge.legacyObservanceId && mapping.expectedDateISO === occurrence.dateISO, `${bridge.occurrenceId} fixed source binding differs from its legacy/date bridge.`);
  assert(rule.dateRule?.type === 'fixed' && rule.dateRule.month === Number(occurrence.dateISO.slice(5, 7)) && rule.dateRule.day === Number(occurrence.dateISO.slice(8, 10)), `${bridge.occurrenceId} perennial fixed rule differs from the approved annual date.`);
  assert(mapping.canonicalRank === occurrence.rank && rule.liturgicalRank === occurrence.rank && mapping.sourceRankCode === occurrence.sourceRankCode, `${bridge.occurrenceId} canonical rank/source code differs from its reviewed rule or Occurrence.`);
  const rankExact = mapping.legacyRank === mapping.canonicalRank;
  const rankRefinement = mapping.legacyRank === 'memorial' && mapping.canonicalRank === 'obligatory-memorial' && mapping.sourceRankCode === 'MO';
  assert(rankExact || rankRefinement, `${bridge.occurrenceId} has an unreviewed legacy/canonical rank change.`);
  assert(mapping.sourceOccurrenceId.startsWith(`snl-pt-${mapping.expectedDateISO}-`) && /^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash), `${bridge.occurrenceId} lacks an exact approved source row.`);
  assert(!fixedSourceIds.has(mapping.sourceOccurrenceId) && !fixedSourceHashes.has(mapping.sourceRecordHash), `${bridge.occurrenceId} reuses a fixed source identity.`);
  assert(mapping.reviewStatus === 'source-bound-exact' && mapping.resolution === 'exact-fixed-date-binding', `${bridge.occurrenceId} lacks an exact fixed binding outcome.`);
  fixedSourceIds.add(mapping.sourceOccurrenceId);
  fixedSourceHashes.add(mapping.sourceRecordHash);
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
  const temporalFamilies = new Map((temporalFamilyDataset?.families ?? []).map((item) => [item.id, item]));
  const overlayDecisions = new Map((overlayReview.decisions ?? []).map((item) => [item.id, item]));
  const approvedDecisionIds = new Set(overlayApproval.decisionIds ?? []);
  const coveredSourceIds = new Set([
    ...fixedSourceIds,
    ...temporalShadow.mappings.map(item => item.sourceOccurrenceId),
    ...familyMappings.map(item => item.sourceOccurrenceId)
  ]);
  const coveredSourceHashes = new Set([
    ...fixedSourceHashes,
    ...temporalShadow.mappings.map(item => item.sourceRecordHash),
    ...familyMappings.map(item => item.sourceRecordHash)
  ]);
  const coveredOccurrenceIds = new Set([
    ...fixedMappingByOccurrence.keys(),
    ...temporalShadow.mappings.map(item => item.occurrenceId),
    ...familyMappings.map(item => item.occurrenceId)
  ]);
  assert(coveredSourceIds.size === 79 && coveredSourceHashes.size === 79 && coveredOccurrenceIds.size === 79, 'Fixed, TemporalRule and TemporalRuleFamily source/canonical identities must not overlap.');

  for (const mapping of temporalShadow.mappings) {
    assert(!legacyIds.has(mapping.legacyObservanceId), `Duplicate legacy coverage across explicit/temporal mappings: ${mapping.legacyObservanceId}.`);
    legacyIds.add(mapping.legacyObservanceId);
    const rule = temporalRules.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown TemporalRule ${mapping.temporalRuleId}.`);
    const resolved = calendar.resolveDateRule(rule.dateRule, temporalShadow.target.year);
    assert(resolved.status === 'resolved' && resolved.dateISO === mapping.expectedDateISO, `${mapping.temporalRuleId} does not match approved date ${mapping.expectedDateISO}.`);
    assert(mapping.legacyRank === 'solemnity', `${mapping.occurrenceId} temporal bootstrap rank differs from approved release.`);
  }

  for (const mapping of familyMappings) {
    const family = temporalFamilies.get(mapping.familyId);
    assert(family?.candidateRequiresPrecedenceResolution === true, `${mapping.occurrenceId} references unknown or unsafe TemporalRuleFamily ${mapping.familyId}.`);
    const weekdayOffset = family.weekdayOffsets?.[mapping.weekday];
    assert(Number.isInteger(weekdayOffset), `${mapping.occurrenceId} has an invalid weekday family member.`);
    const offsetDays = family.baseOffsetDays + ((mapping.week - 1) * family.weekStrideDays) + weekdayOffset;
    const resolved = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: family.anchor, offsetDays }, temporalFamilyShadow.year);
    assert(resolved.status === 'resolved' && resolved.dateISO === mapping.expectedDateISO, `${mapping.occurrenceId} does not match its canonical TemporalRuleFamily date.`);
    assert(mapping.sourceOccurrenceId.startsWith(`snl-pt-${mapping.expectedDateISO}-`) && /^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash), `${mapping.occurrenceId} lacks an exact approved source row.`);
  }

  let transferCount = 0;
  for (const mapping of movableTransferShadow.mappings) {
    assert(!legacyIds.has(mapping.legacyObservanceId), `Duplicate legacy coverage across explicit/temporal/movable mappings: ${mapping.legacyObservanceId}.`);
    legacyIds.add(mapping.legacyObservanceId);
    const rule = temporalRules.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown movable TemporalRule ${mapping.temporalRuleId}.`);
    const resolved = calendar.resolveDateRule(rule.dateRule, movableTransferShadow.target.year);
    assert(resolved.status === 'resolved' && resolved.dateISO === mapping.baseDateISO, `${mapping.temporalRuleId} does not match canonical base date ${mapping.baseDateISO}.`);
    assert(mapping.occurrenceId === `occurrence:${mapping.expectedDateISO}:${rule.observanceId.slice('observance:'.length)}:pt`, `${mapping.temporalRuleId} has an invalid canonical Occurrence identity.`);
    assert(!coveredSourceIds.has(mapping.sourceOccurrenceId) && !coveredSourceHashes.has(mapping.sourceRecordHash) && mapping.sourceOccurrenceId.startsWith(`snl-pt-${mapping.expectedDateISO}-`) && /^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash), `${mapping.occurrenceId} lacks a unique exact approved source row.`);
    assert(!coveredOccurrenceIds.has(mapping.occurrenceId), `${mapping.occurrenceId} duplicates existing canonical coverage.`);
    coveredSourceIds.add(mapping.sourceOccurrenceId);
    coveredSourceHashes.add(mapping.sourceRecordHash);
    coveredOccurrenceIds.add(mapping.occurrenceId);
    if (mapping.transfer) {
      transferCount += 1;
      const decision = overlayDecisions.get(mapping.transfer.decisionId);
      assert(decision?.type === 'date-transfer' && approvedDecisionIds.has(decision.id), `${mapping.temporalRuleId} lacks an explicitly approved transfer decision.`);
      assert(decision.canonicalEventId === mapping.legacyObservanceId && decision.fromDate === mapping.baseDateISO && decision.toDate === mapping.expectedDateISO && decision.rank === mapping.legacyRank, `${decision.id} differs from its shadow mapping.`);
      assert(mapping.transfer.fromDateISO === mapping.baseDateISO && mapping.transfer.toDateISO === mapping.expectedDateISO && mapping.reviewStatus === 'approved' && mapping.resolution === 'pending-transfer-destination', `${decision.id} lacks its approved transfer outcome.`);
      const origin = mapping.transfer.originReplacement;
      assert(origin?.sourceOccurrenceId?.startsWith(`snl-pt-${mapping.baseDateISO}-`) && /^[a-f0-9]{64}$/u.test(origin.sourceRecordHash), `${decision.id} lacks its exact origin source row.`);
      if (decision.replacementAtOrigin) assert(decision.replacementAtOrigin.canonicalEventId === origin.legacyObservanceId, `${decision.id} origin replacement differs from review.`);
      if (origin.decisionId) assert(approvedDecisionIds.has(origin.decisionId), `${decision.id} origin replacement relies on an unapproved decision.`);
    } else {
      assert(mapping.baseDateISO === mapping.expectedDateISO && mapping.reviewStatus === 'inherited-safe' && mapping.resolution === 'inherit-general-canonical-binding', `${mapping.temporalRuleId} lacks its inherited-safe canonical outcome.`);
    }
  }
  assert(transferCount === 3, 'Movable/transfer coverage must preserve exactly three approved Portugal transfers.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

for (const familyLegacyId of familyPresentLegacyIds) {
  assert(!legacyIds.has(familyLegacyId), `Temporal family row ${familyLegacyId} collides with existing explicit/TemporalRule coverage.`);
  legacyIds.add(familyLegacyId);
}

const totalMapped = explicitOccurrences.length + temporalShadow.mappings.length + familyPresentLegacyIds.length + movableTransferShadow.mappings.length;
assert(totalMapped === 90 && totalMapped === coverage.coverage.mappedOccurrenceAnchors, 'Combined canonical shadow coverage must be exactly 90/389.');
assert(coverage.coverage.remainingLegacyOccurrences === 299 && coverage.coverage.remainingLegacyOccurrences === 389 - totalMapped, 'Remaining legacy count must be exactly 299.');
assert(coverage.coverage.requiredForPromotion === 389 && coverage.coverage.promotionAllowed === false, 'Promotion must remain blocked until 389/389.');
assert(legacyIds.size === totalMapped, 'Every counted mapping must cover one unique legacy occurrence identity.');
assert(!legacyIds.has('rc:StsJoachimAnne'), 'Joachim/Anne must not be fabricated in the Portugal 2026 source release.');
assert(!familyPresentSet.has('rc:LentWeekday4Thursday'), 'Suppressed St Joseph Lent weekday must not count as family coverage.');
assert(!familyPresentSet.has('rc:EasterWeekday6Wednesday'), 'Suppressed Fatima Easter weekday must not count as family coverage.');

const policy = coverage.equivalencePolicy ?? {};
for (const key of [
  'exactLegacyObservanceIdBridgeRequired','exactDateRequired','rankCompatibilityRequired',
  'legacyMemorialMayRefineToObligatoryMemorialWhenOfficialSourceCodeIsMO','churchAndJurisdictionMustRemainFixed',
  'fixedSanctoraleShadowMustResolveThroughCanonicalRule','fixedSanctoraleShadowMustAnchorExactApprovedSourceRow',
  'temporalShadowMustResolveThroughCanonicalTemporalRule','temporalShadowMustAnchorExactApprovedSourceRow',
  'temporalFamilyCandidatesRequirePrecedenceResolution','suppressedTemporalFamilyCandidatesMustNotCountAsCoverage',
  'movableTransferShadowMustResolveThroughCanonicalTemporalRule','reviewedJurisdictionTransferRequired','movableTransferShadowMustAnchorExactApprovedSourceRow',
  'rollingCalculationProjectionMustNotCountAsAnnualCoverage',
  'noAutomaticCanonicalIdentityCreation','noD1MutationBeforeFullCoverage','noRuntimeSwitchBeforeFullCoverage','noDropboxPromotionImplied'
]) assert(policy[key] === true, `Coverage safety policy ${key} must remain true.`);

const coveragePercent = Number(((totalMapped / 389) * 100).toFixed(3));
assert(coveragePercent === 23.136, `Unexpected canonical coverage percentage ${coveragePercent}.`);
console.log(`Portugal v2 canonical migration gate passed: ${totalMapped}/389 (${coveragePercent}%) = 27 exact fixed Sanctorale + 5 TemporalRule + 47 precedence-surviving family rows + 11 movable/transfer rows; 299 remaining, promotion blocked.`);

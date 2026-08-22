#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const [coverageBytes, approvalBytes, occurrenceBytes, bridgeBytes, jurisdictionBytes] = await Promise.all([
  readFile(path.join(root, 'data', 'migrations', 'roman-catholic-pt-2026-v2.canonical-coverage.json'), 'utf8'),
  readFile(path.join(root, 'data', 'releases', 'roman-catholic-pt-2026-v2.production-request.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-occurrence-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-occurrence-legacy-bridges.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-jurisdiction-anchors.json'), 'utf8')
]);
const coverage = JSON.parse(coverageBytes);
const approval = JSON.parse(approvalBytes);
const occurrenceDataset = JSON.parse(occurrenceBytes);
const bridgeDataset = JSON.parse(bridgeBytes);
const jurisdictionDataset = JSON.parse(jurisdictionBytes);
function assert(condition, message) { if (!condition) throw new Error(message); }

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

const occurrences = occurrenceDataset?.occurrences ?? [];
const bridges = bridgeDataset?.bridges ?? [];
assert(occurrenceDataset?.status === 'repository-reviewed-occurrence-anchors', 'Coverage requires reviewed canonical Occurrences.');
assert(bridgeDataset?.status === 'repository-reviewed-read-only-compatibility-bridge' && bridgeDataset?.mutationAllowed === false, 'Coverage requires read-only legacy bridges.');
assert(bridgeDataset?.legacyReleaseId === coverage.sourceReleaseId, 'Legacy bridge targets a different source release.');
assert(occurrences.length === 6 && occurrences.length === coverage.coverage.mappedOccurrenceAnchors, 'Mapped canonical Occurrence count must be exactly six in this tranche.');
assert(bridges.length === 6 && bridges.length === coverage.coverage.mappedOccurrenceAnchors, 'Legacy bridge count must equal the six canonical mappings.');
assert(coverage.coverage.remainingLegacyOccurrences === 383 && coverage.coverage.remainingLegacyOccurrences === 389 - occurrences.length, 'Remaining legacy count must be exactly 383.');
assert(coverage.coverage.requiredForPromotion === 389, 'Promotion threshold must remain full 389/389 coverage.');
assert(coverage.coverage.promotionAllowed === false, 'Incomplete canonical coverage must not permit promotion.');

const jurisdiction = (jurisdictionDataset?.jurisdictions ?? []).find((item) => item.id === coverage.canonicalTarget.jurisdictionId);
assert(jurisdiction?.churchId === coverage.canonicalTarget.churchId, 'Coverage target Jurisdiction/Church mismatch.');
assert((jurisdiction.calendarSystems ?? []).includes(coverage.canonicalTarget.calendarSystem), 'Coverage target calendar is invalid for its Jurisdiction.');

const occurrenceById = new Map(occurrences.map((item) => [item.id, item]));
const legacyIds = new Set();
for (const bridge of bridges) {
  assert(!legacyIds.has(bridge.legacyObservanceId), `Duplicate legacy coverage: ${bridge.legacyObservanceId}.`);
  legacyIds.add(bridge.legacyObservanceId);
  const occurrence = occurrenceById.get(bridge.occurrenceId);
  assert(occurrence, `Bridge ${bridge.occurrenceId} lacks canonical Occurrence.`);
  assert(bridge.dateISO === occurrence.dateISO, `Bridge ${bridge.occurrenceId} date differs from canonical Occurrence.`);
  assert(occurrence.churchId === coverage.canonicalTarget.churchId, `${bridge.occurrenceId} Church differs from target.`);
  assert(occurrence.jurisdictionId === coverage.canonicalTarget.jurisdictionId, `${bridge.occurrenceId} Jurisdiction differs from target.`);
  assert(occurrence.calendarSystem === coverage.canonicalTarget.calendarSystem && occurrence.year === 2026, `${bridge.occurrenceId} calendar/year differs from target.`);
  const expectedLegacyRank = occurrence.rank === 'obligatory-memorial' ? 'memorial' : occurrence.rank;
  assert(['memorial', 'feast', 'solemnity'].includes(expectedLegacyRank), `${bridge.occurrenceId} lacks an explicit legacy-rank equivalence class.`);
}

for (const requiredLegacyId of ['rc:NativityJohnBaptist', 'rc:StsPeterPaulAp']) {
  assert(legacyIds.has(requiredLegacyId), `R1.8 exact source mapping missing ${requiredLegacyId}.`);
}
assert(!legacyIds.has('rc:StsJoachimAnne'), 'Joachim/Anne must not be fabricated in the Portugal 2026 source release.');

const policy = coverage.equivalencePolicy ?? {};
for (const key of [
  'exactLegacyObservanceIdBridgeRequired','exactDateRequired','rankCompatibilityRequired',
  'legacyMemorialMayRefineToObligatoryMemorialWhenOfficialSourceCodeIsMO','churchAndJurisdictionMustRemainFixed',
  'noAutomaticCanonicalIdentityCreation','noD1MutationBeforeFullCoverage','noRuntimeSwitchBeforeFullCoverage','noDropboxPromotionImplied'
]) assert(policy[key] === true, `Coverage safety policy ${key} must remain true.`);

const coveragePercent = Number(((occurrences.length / 389) * 100).toFixed(3));
assert(coveragePercent === 1.542, `Unexpected canonical coverage percentage ${coveragePercent}.`);
console.log(`Portugal v2 canonical migration gate passed: 6/389 (${coveragePercent}%) exact shadow mappings, 383 remaining, promotion blocked.`);

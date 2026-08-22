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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(coverage?.schemaVersion === 1 && coverage?.migrationId === 'roman-catholic-pt-2026-v2-to-canonical-occurrence-v1', 'Canonical migration coverage gate identity changed unexpectedly.');
assert(coverage?.status === 'shadow-equivalence-in-progress', 'Portugal canonical migration must remain in shadow equivalence until complete.');
assert(coverage?.sourceReleaseId === 'roman-catholic-pt-2026-v2', 'Coverage gate targets the wrong production release.');
assert(approval?.schemaVersion === 1 && approval?.releaseId === coverage.sourceReleaseId && approval?.approved === true, 'Coverage gate source release is not the exact approved Portugal v2 production request.');

assert(coverage.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId, 'Coverage gate workflow run differs from approved production request.');
assert(coverage.sourceArtifact.artifactId === approval.artifacts.release.id, 'Coverage gate artifact id differs from approved production request.');
assert(coverage.sourceArtifact.artifactName === approval.artifacts.release.name, 'Coverage gate artifact name differs from approved production request.');
assert(`sha256:${coverage.sourceArtifact.artifactSha256}` === approval.artifacts.release.digest, 'Coverage gate artifact digest differs from approved production request.');
assert(`sha256:${coverage.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Coverage gate build.json digest differs from approved production request.');
assert(`sha256:${coverage.sourceArtifact.releaseJsonSha256}` === approval.artifacts.release.files['release.json'], 'Coverage gate release.json digest differs from approved production request.');
assert(coverage.sourceArtifact.sourceCommit === approval.sourceMainCommit, 'Coverage gate source commit differs from approved production request.');

assert(coverage.sourcePopulation.occurrences === approval.expected.occurrences && coverage.sourcePopulation.occurrences === 389, 'Coverage gate source occurrence population drifted.');
assert(coverage.sourcePopulation.days === approval.expected.days && coverage.sourcePopulation.days === 365, 'Coverage gate source day population drifted.');
assert(coverage.sourcePopulation.labels === approval.expected.labels && coverage.sourcePopulation.labels === 1945, 'Coverage gate source label population drifted.');

const occurrences = occurrenceDataset?.occurrences ?? [];
const bridges = bridgeDataset?.bridges ?? [];
assert(occurrenceDataset?.status === 'repository-reviewed-occurrence-anchors', 'Coverage gate requires reviewed canonical Occurrence anchors.');
assert(bridgeDataset?.status === 'repository-reviewed-read-only-compatibility-bridge' && bridgeDataset?.mutationAllowed === false, 'Coverage gate requires a read-only legacy bridge.');
assert(bridgeDataset?.legacyReleaseId === coverage.sourceReleaseId, 'Legacy bridge targets a different source release.');
assert(occurrences.length === coverage.coverage.mappedOccurrenceAnchors, 'Mapped canonical Occurrence count differs from coverage gate.');
assert(bridges.length === coverage.coverage.mappedOccurrenceAnchors, 'Legacy bridge count differs from mapped canonical coverage.');
assert(coverage.coverage.remainingLegacyOccurrences === coverage.sourcePopulation.occurrences - coverage.coverage.mappedOccurrenceAnchors, 'Remaining legacy occurrence count is not arithmetically exact.');
assert(coverage.coverage.requiredForPromotion === coverage.sourcePopulation.occurrences, 'Promotion threshold must equal the full approved source population.');
assert(coverage.coverage.promotionAllowed === false, 'Incomplete canonical coverage must not permit promotion.');
assert(coverage.coverage.remainingLegacyOccurrences > 0, 'This gate is intended to fail closed until full canonical coverage exists.');

const jurisdiction = (jurisdictionDataset?.jurisdictions ?? []).find((item) => item.id === coverage.canonicalTarget.jurisdictionId);
assert(jurisdiction, 'Coverage target Jurisdiction is not canonicalized.');
assert(jurisdiction.churchId === coverage.canonicalTarget.churchId, 'Coverage target Jurisdiction belongs to a different Church.');
assert((jurisdiction.calendarSystems ?? []).includes(coverage.canonicalTarget.calendarSystem), 'Coverage target calendar is not valid for its Jurisdiction.');

const occurrenceById = new Map(occurrences.map((item) => [item.id, item]));
const legacyIds = new Set();
const canonicalIds = new Set();
for (const bridge of bridges) {
  assert(!legacyIds.has(bridge.legacyObservanceId), `Duplicate legacy observance coverage: ${bridge.legacyObservanceId}.`);
  legacyIds.add(bridge.legacyObservanceId);
  assert(!canonicalIds.has(bridge.occurrenceId), `Duplicate canonical Occurrence coverage: ${bridge.occurrenceId}.`);
  canonicalIds.add(bridge.occurrenceId);
  const occurrence = occurrenceById.get(bridge.occurrenceId);
  assert(occurrence, `Bridge ${bridge.occurrenceId} lacks a canonical Occurrence anchor.`);
  assert(bridge.dateISO === occurrence.dateISO, `Bridge ${bridge.occurrenceId} date differs from canonical Occurrence.`);
  assert(occurrence.churchId === coverage.canonicalTarget.churchId, `${bridge.occurrenceId} Church differs from migration target.`);
  assert(occurrence.jurisdictionId === coverage.canonicalTarget.jurisdictionId, `${bridge.occurrenceId} Jurisdiction differs from migration target.`);
  assert(occurrence.calendarSystem === coverage.canonicalTarget.calendarSystem, `${bridge.occurrenceId} calendar differs from migration target.`);
  assert(occurrence.year === coverage.canonicalTarget.year, `${bridge.occurrenceId} year differs from migration target.`);
  assert(bridgeDataset.mutationAllowed === false, `${bridge.occurrenceId} legacy bridge unexpectedly permits mutation.`);

  const expectedLegacyRank = occurrence.rank === 'obligatory-memorial' ? 'memorial' : occurrence.rank;
  assert(['memorial', 'feast'].includes(expectedLegacyRank), `${bridge.occurrenceId} bootstrap rank lacks an explicit legacy-equivalence rule.`);
}

const policy = coverage.equivalencePolicy ?? {};
for (const key of [
  'exactLegacyObservanceIdBridgeRequired',
  'exactDateRequired',
  'rankCompatibilityRequired',
  'legacyMemorialMayRefineToObligatoryMemorialWhenOfficialSourceCodeIsMO',
  'churchAndJurisdictionMustRemainFixed',
  'noAutomaticCanonicalIdentityCreation',
  'noD1MutationBeforeFullCoverage',
  'noRuntimeSwitchBeforeFullCoverage',
  'noDropboxPromotionImplied'
]) assert(policy[key] === true, `Coverage safety policy ${key} must remain true.`);

const coveragePercent = Number(((coverage.coverage.mappedOccurrenceAnchors / coverage.sourcePopulation.occurrences) * 100).toFixed(3));
assert(coveragePercent === 1.028, `Unexpected initial canonical coverage percentage ${coveragePercent}.`);

console.log(`Portugal v2 canonical migration gate passed: ${coverage.coverage.mappedOccurrenceAnchors}/${coverage.sourcePopulation.occurrences} (${coveragePercent}%) exact shadow mappings, ${coverage.coverage.remainingLegacyOccurrences} remaining, promotion blocked.`);

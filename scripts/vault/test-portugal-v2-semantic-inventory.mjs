#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const inventory = read('data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json');
const coverage = read('data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json');
const fixed = read('data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json');
const temporal = read('data/migrations/roman-catholic-pt-2026-v2.temporal-shadow.json');
const families = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json');
const movable = read('data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json');
const receipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-seasonal-sundays.json');

assert(inventory?.schemaVersion === 1 && inventory?.status === 'approved-release-unresolved-semantic-inventory', 'Portugal semantic inventory identity changed unexpectedly.');
assert(inventory.sourceReleaseId === coverage.sourceReleaseId, 'Semantic inventory targets another source release.');
assert(inventory.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && inventory.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && inventory.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Semantic inventory is not pinned to the approved source artifact.');
assert(inventory.sourceArtifact.dropboxManifestId === 'id:oANWCGUyYBwAAAAAAAAWmQ' && inventory.sourceArtifact.validatedManifestPath.endsWith('/4e154c0ebb30ee648d065617acb3634fd1b8365d/manifest.json'), 'Semantic inventory lost its validated external manifest identity.');
assert(inventory.target.churchId === coverage.canonicalTarget.churchId && inventory.target.jurisdictionId === coverage.canonicalTarget.jurisdictionId && inventory.target.calendarSystem === coverage.canonicalTarget.calendarSystem && inventory.target.year === coverage.canonicalTarget.year, 'Semantic inventory context dimensions drifted.');

const coveredRows = [
  ...fixed.mappings,
  ...temporal.mappings,
  ...families.families.flatMap((family) => family.presentMappings),
  ...movable.mappings
];
const coveredSourceIds = new Set(coveredRows.map((row) => row.sourceOccurrenceId));
assert(coveredRows.length === 155 && coveredSourceIds.size === 155, 'Semantic inventory coverage boundary must contain exactly 155 unique approved source rows.');
const seasonalSundayMappings = families.families.filter((family) => family.familyId.endsWith('-sunday:roman-catholic')).flatMap((family) => family.presentMappings);
const temporalFamilyMappings = families.families.flatMap((family) => family.presentMappings);
assert(receipt?.schemaVersion === 1 && receipt?.status === 'seasonal-sunday-temporal-family-shadow-promotion' && receipt?.mutationAllowed === false, 'Seasonal Sunday promotion receipt is invalid or permits mutation.');
assert(receipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && receipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && receipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Seasonal Sunday promotion receipt is not pinned to the approved artifact.');
assert(seasonalSundayMappings.length === 12 && receipt.promotedSourceOccurrences === 12, 'Seasonal Sunday promotion receipt must cover exactly twelve source rows.');
assert(createHash('sha256').update(JSON.stringify(seasonalSundayMappings)).digest('hex') === receipt.promotedMappingDigestSha256, 'Seasonal Sunday promotion mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(temporalFamilyMappings)).digest('hex') === receipt.temporalFamilyMappingDigestSha256, 'Combined TemporalRuleFamily mapping digest drifted.');
assert(receipt.coverageAfter.mappedOccurrenceAnchors === coverage.coverage.mappedOccurrenceAnchors && receipt.coverageAfter.remainingLegacyOccurrences === coverage.coverage.remainingLegacyOccurrences && receipt.coverageAfter.promotionAllowed === false, 'Seasonal Sunday promotion receipt differs from the fail-closed coverage gate.');

const remaining = inventory.remaining ?? [];
const remainingSourceIds = new Set();
const remainingSourceHashes = new Set();
const familyCounts = new Map();
for (const row of remaining) {
  assert(typeof row.sourceOccurrenceId === 'string' && row.sourceOccurrenceId.startsWith(`snl-pt-${row.dateISO}-`), `Inventory row ${String(row.sourceOccurrenceId)} lacks an exact Portugal source identity.`);
  assert(/^[a-f0-9]{64}$/u.test(row.sourceRecordHash ?? ''), `Inventory row ${row.sourceOccurrenceId} lacks an exact source hash.`);
  assert(/^2026-\d{2}-\d{2}$/u.test(row.dateISO ?? ''), `Inventory row ${row.sourceOccurrenceId} has an invalid date.`);
  assert(typeof row.canonicalEventId === 'string' && row.canonicalEventId.startsWith('rc'), `Inventory row ${row.sourceOccurrenceId} lacks its source canonical event identity.`);
  assert(!coveredSourceIds.has(row.sourceOccurrenceId), `Covered source row ${row.sourceOccurrenceId} remains in the unresolved inventory.`);
  assert(!remainingSourceIds.has(row.sourceOccurrenceId) && !remainingSourceHashes.has(row.sourceRecordHash), `Inventory duplicates source identity ${row.sourceOccurrenceId}.`);
  assert(!Object.hasOwn(row, 'label') && !Object.hasOwn(row, 'labels'), `Inventory row ${row.sourceOccurrenceId} must not use labels as semantic input.`);
  remainingSourceIds.add(row.sourceOccurrenceId);
  remainingSourceHashes.add(row.sourceRecordHash);
  familyCounts.set(row.semanticFamily, (familyCounts.get(row.semanticFamily) ?? 0) + 1);
}

assert(remaining.length === 234 && remainingSourceIds.size === 234 && remainingSourceHashes.size === 234, 'Semantic inventory must preserve exactly 234 unique unresolved approved-source rows.');
assert(coveredSourceIds.size + remainingSourceIds.size === 389, 'Covered and unresolved source identities must partition all 389 approved occurrences.');
assert(inventory.coverageAtInventory.approvedSourceOccurrences === 389 && inventory.coverageAtInventory.sourceBoundOccurrences === 155 && inventory.coverageAtInventory.remainingOccurrences === 234 && inventory.coverageAtInventory.promotionAllowed === false, 'Semantic inventory coverage summary drifted or unlocked promotion.');

const actualCounts = Object.fromEntries([...familyCounts.entries()].sort(([left], [right]) => left.localeCompare(right)));
assert(JSON.stringify(actualCounts) === JSON.stringify(inventory.familyCounts), 'Semantic family counts differ from the exact unresolved rows.');
assert(actualCounts['temporal-weekday-family'] === 83 && actualCounts['temporal-sunday-family'] === 28 && actualCounts['saturday-marian-family'] === 14, 'Algorithmic temporal backlog classification drifted.');
assert(actualCounts['fixed-person'] === 52, 'Fixed-person backlog classification drifted.');
assert(actualCounts['jurisdiction-structural-overlay'] + actualCounts['portugal-proper'] + actualCounts['jurisdiction-rank-override'] === 21 && inventory.humanReviewBoundary.occurrenceCount === 21, 'Portugal-specific human-review boundary must remain explicit.');
assert(inventory.classificationPolicy.labelsCreateIdentity === false && inventory.classificationPolicy.annualDateCreatesPerennialRule === false && inventory.classificationPolicy.suppressedCandidatesCountAsCoverage === false && inventory.classificationPolicy.transferOriginsCountAsCoverage === false, 'Semantic inventory fail-closed policy weakened.');

console.log('Portugal semantic inventory passed: 155 covered + 234 exact unresolved source rows = 389; 125 remaining temporal-family rows and 21 Portugal-specific rows are explicitly partitioned.');

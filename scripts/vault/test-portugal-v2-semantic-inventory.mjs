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
const seasonalReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-seasonal-sundays.json');
const ordinaryReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-sundays.json');
const holyWeekOctaveReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-holy-week-easter-octave.json');
const adventWeekdayReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-advent-weekdays.json');
const lateAdventReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-promotion-advent-late-fixed-days.json');
const christmasOctaveReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-promotion-christmas-octave-fixed-days.json');

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
assert(coveredRows.length === 205 && coveredSourceIds.size === 205, 'Semantic inventory coverage boundary must contain exactly 205 unique approved source rows.');
const adventWeekdayFamilyIds = new Set(adventWeekdayReceipt.families);
const seasonalSundayMappings = families.families.filter((family) => family.familyId.endsWith('-sunday:roman-catholic')).flatMap((family) => family.presentMappings);
const seasonalCheckpointMappings = families.families.filter((family) => !family.familyId.includes('ordinary-time-sunday') && !family.familyId.includes('holy-week-weekday') && !family.familyId.includes('easter-octave-weekday') && !adventWeekdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const ordinarySundayFamilies = families.families.filter((family) => family.familyId.includes('ordinary-time-sunday'));
const ordinarySundayMappings = ordinarySundayFamilies.flatMap((family) => family.presentMappings);
const ordinarySundaySuppressions = families.suppressedCandidates.filter((item) => item.familyId.includes('ordinary-time-sunday'));
const holyWeekOctaveFamilyIds = new Set(holyWeekOctaveReceipt.families);
const holyWeekOctaveFamilies = families.families.filter((family) => holyWeekOctaveFamilyIds.has(family.familyId));
const holyWeekOctaveMappings = holyWeekOctaveFamilies.flatMap((family) => family.presentMappings);
const ordinaryCheckpointMappings = families.families.filter((family) => !holyWeekOctaveFamilyIds.has(family.familyId) && !adventWeekdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const holyWeekOctaveCheckpointMappings = families.families.filter((family) => !adventWeekdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const adventWeekdayFamilies = families.families.filter((family) => adventWeekdayFamilyIds.has(family.familyId));
const adventWeekdayMappings = adventWeekdayFamilies.flatMap((family) => family.presentMappings);
const adventWeekdaySuppressions = families.suppressedCandidates.filter((item) => adventWeekdayFamilyIds.has(item.familyId));
const temporalFamilyMappings = families.families.flatMap((family) => family.presentMappings);
assert(seasonalReceipt?.schemaVersion === 1 && seasonalReceipt?.status === 'seasonal-sunday-temporal-family-shadow-promotion' && seasonalReceipt?.mutationAllowed === false, 'Seasonal Sunday promotion receipt is invalid or permits mutation.');
assert(seasonalReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && seasonalReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && seasonalReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Seasonal Sunday promotion receipt is not pinned to the approved artifact.');
assert(seasonalSundayMappings.length === 12 && seasonalReceipt.promotedSourceOccurrences === 12, 'Seasonal Sunday promotion receipt must cover exactly twelve source rows.');
assert(createHash('sha256').update(JSON.stringify(seasonalSundayMappings)).digest('hex') === seasonalReceipt.promotedMappingDigestSha256, 'Seasonal Sunday promotion mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(seasonalCheckpointMappings)).digest('hex') === seasonalReceipt.temporalFamilyMappingDigestSha256, 'Historical seasonal-Sunday family checkpoint digest drifted.');
assert(seasonalReceipt.coverageAfter.mappedOccurrenceAnchors === 155 && seasonalReceipt.coverageAfter.remainingLegacyOccurrences === 234 && seasonalReceipt.coverageAfter.promotionAllowed === false, 'Historical seasonal-Sunday coverage receipt drifted.');
assert(ordinaryReceipt?.schemaVersion === 1 && ordinaryReceipt?.status === 'ordinary-time-sunday-temporal-family-shadow-promotion' && ordinaryReceipt?.mutationAllowed === false, 'Ordinary Time Sunday promotion receipt is invalid or permits mutation.');
assert(ordinaryReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Ordinary Time Sunday receipt is not pinned to the approved artifact.');
assert(ordinarySundayFamilies.length === 2 && ordinarySundayMappings.length === 28 && ordinarySundaySuppressions.length === 5, 'Ordinary Time must remain a two-segment family with 28 present and five suppressed 2026 candidates.');
assert(ordinaryReceipt.candidateOutcomes.candidates === 33 && ordinaryReceipt.candidateOutcomes.presentSourceOccurrences === 28 && ordinaryReceipt.candidateOutcomes.suppressedCandidates === 5, 'Ordinary Time candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinarySundayMappings)).digest('hex') === ordinaryReceipt.promotedMappingDigestSha256, 'Ordinary Time Sunday promotion mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinarySundaySuppressions)).digest('hex') === ordinaryReceipt.promotedSuppressionDigestSha256, 'Ordinary Time Sunday suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryCheckpointMappings)).digest('hex') === ordinaryReceipt.temporalFamilyMappingDigestSha256, 'Historical Ordinary Time TemporalRuleFamily checkpoint digest drifted.');
assert(ordinaryReceipt.coverageAfter.mappedOccurrenceAnchors === 183 && ordinaryReceipt.coverageAfter.remainingLegacyOccurrences === 206 && ordinaryReceipt.coverageAfter.promotionAllowed === false, 'Historical Ordinary Time receipt drifted.');
assert(holyWeekOctaveReceipt?.schemaVersion === 1 && holyWeekOctaveReceipt?.status === 'holy-week-easter-octave-temporal-family-shadow-promotion' && holyWeekOctaveReceipt?.mutationAllowed === false, 'Holy Week/Easter Octave promotion receipt is invalid or permits mutation.');
assert(holyWeekOctaveReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && holyWeekOctaveReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && holyWeekOctaveReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Holy Week/Easter Octave receipt is not pinned to the approved artifact.');
assert(holyWeekOctaveFamilies.length === 2 && holyWeekOctaveMappings.length === 9, 'Holy Week/Easter Octave promotion must contain two families and nine exact source rows.');
assert(holyWeekOctaveReceipt.candidateOutcomes.candidates === 9 && holyWeekOctaveReceipt.candidateOutcomes.presentSourceOccurrences === 9 && holyWeekOctaveReceipt.candidateOutcomes.suppressedCandidates === 0, 'Holy Week/Easter Octave candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(holyWeekOctaveMappings)).digest('hex') === holyWeekOctaveReceipt.promotedMappingDigestSha256, 'Holy Week/Easter Octave promotion mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(holyWeekOctaveCheckpointMappings)).digest('hex') === holyWeekOctaveReceipt.temporalFamilyMappingDigestSha256, 'Historical Holy Week/Easter Octave TemporalRuleFamily checkpoint digest drifted.');
assert(holyWeekOctaveReceipt.coverageAfter.mappedOccurrenceAnchors === 192 && holyWeekOctaveReceipt.coverageAfter.remainingLegacyOccurrences === 197 && holyWeekOctaveReceipt.coverageAfter.promotionAllowed === false, 'Historical Holy Week/Easter Octave coverage receipt drifted.');
assert(adventWeekdayReceipt?.schemaVersion === 1 && adventWeekdayReceipt?.status === 'advent-weekday-temporal-family-shadow-promotion' && adventWeekdayReceipt?.mutationAllowed === false, 'Advent weekday promotion receipt is invalid or permits mutation.');
assert(adventWeekdayReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && adventWeekdayReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && adventWeekdayReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Advent weekday receipt is not pinned to the approved artifact.');
assert(adventWeekdayFamilies.length === 1 && adventWeekdayMappings.length === 4 && adventWeekdaySuppressions.length === 2, 'Reviewed Advent weekday family must contain four present and two suppressed 2026 candidates.');
assert(adventWeekdayReceipt.candidateOutcomes.candidates === 6 && adventWeekdayReceipt.candidateOutcomes.presentSourceOccurrences === 4 && adventWeekdayReceipt.candidateOutcomes.suppressedCandidates === 2, 'Advent weekday candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(adventWeekdayMappings)).digest('hex') === adventWeekdayReceipt.promotedMappingDigestSha256, 'Advent weekday promotion mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(adventWeekdaySuppressions)).digest('hex') === adventWeekdayReceipt.promotedSuppressionDigestSha256, 'Advent weekday promotion suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(temporalFamilyMappings)).digest('hex') === adventWeekdayReceipt.temporalFamilyMappingDigestSha256, 'Combined TemporalRuleFamily mapping digest drifted.');
assert(adventWeekdayReceipt.coverageAfter.mappedOccurrenceAnchors === 196 && adventWeekdayReceipt.coverageAfter.remainingLegacyOccurrences === 193 && adventWeekdayReceipt.coverageAfter.promotionAllowed === false, 'Historical Advent weekday receipt drifted.');

const lateAdventRuleIds = new Set(lateAdventReceipt.temporalRuleIds ?? []);
const lateAdventMappings = temporal.mappings.filter((mapping) => lateAdventRuleIds.has(mapping.temporalRuleId));
const preChristmasOctaveMappings = temporal.mappings.filter((mapping) => !mapping.temporalRuleId.includes('christmas-octave-day'));
assert(lateAdventReceipt?.schemaVersion === 1 && lateAdventReceipt?.status === 'late-advent-fixed-temporal-shadow-promotion' && lateAdventReceipt?.mutationAllowed === false, 'Late Advent fixed-date promotion receipt is invalid or permits mutation.');
assert(lateAdventReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && lateAdventReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && lateAdventReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Late Advent receipt is not pinned to the approved artifact.');
assert(lateAdventRuleIds.size === 8 && lateAdventMappings.length === 6, 'Late Advent receipt must distinguish eight perennial rules from six promoted Portugal 2026 source rows.');
assert(lateAdventReceipt.candidateOutcomes.candidates === 8 && lateAdventReceipt.candidateOutcomes.presentSourceOccurrences === 6 && lateAdventReceipt.candidateOutcomes.precedenceSuppressedCandidates === 1 && lateAdventReceipt.candidateOutcomes.withheldJurisdictionRows === 1, 'Late Advent annual candidate partition drifted.');
assert(lateAdventReceipt.precedenceSuppressedCandidates?.length === 1 && lateAdventReceipt.precedenceSuppressedCandidates[0].temporalRuleId.endsWith('december-20:roman-catholic') && lateAdventReceipt.precedenceSuppressedCandidates[0].winningLegacyObservanceId === 'rc:Advent4', 'Late Advent December 20 precedence outcome drifted.');
assert(lateAdventReceipt.withheldJurisdictionRows?.length === 1 && lateAdventReceipt.withheldJurisdictionRows[0].temporalRuleId.endsWith('december-24:roman-catholic') && lateAdventReceipt.withheldJurisdictionRows[0].sourceOccurrenceId === 'snl-pt-2026-12-24-d12c962ba23beb9e81fa91e4', 'Late Advent December 24 jurisdiction boundary drifted.');
assert(createHash('sha256').update(JSON.stringify(lateAdventMappings)).digest('hex') === lateAdventReceipt.promotedMappingDigestSha256, 'Late Advent promoted mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(preChristmasOctaveMappings)).digest('hex') === lateAdventReceipt.temporalRuleMappingDigestSha256, 'Historical late-Advent TemporalRule checkpoint digest drifted.');
assert(lateAdventReceipt.coverageBefore.mappedOccurrenceAnchors === 196 && lateAdventReceipt.coverageBefore.remainingLegacyOccurrences === 193, 'Late Advent coverage-before checkpoint drifted.');
assert(lateAdventReceipt.coverageAfter.mappedOccurrenceAnchors === 202 && lateAdventReceipt.coverageAfter.remainingLegacyOccurrences === 187 && lateAdventReceipt.coverageAfter.promotionAllowed === false, 'Historical late-Advent coverage receipt drifted.');

const christmasOctaveRuleIds = new Set(christmasOctaveReceipt.temporalRuleIds ?? []);
const christmasOctaveMappings = temporal.mappings.filter((mapping) => christmasOctaveRuleIds.has(mapping.temporalRuleId));
assert(christmasOctaveReceipt?.schemaVersion === 1 && christmasOctaveReceipt?.status === 'christmas-octave-fixed-temporal-shadow-promotion' && christmasOctaveReceipt?.mutationAllowed === false, 'Christmas Octave promotion receipt is invalid or permits mutation.');
assert(christmasOctaveReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && christmasOctaveReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && christmasOctaveReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Christmas Octave receipt is not pinned to the approved artifact.');
assert(christmasOctaveRuleIds.size === 3 && christmasOctaveMappings.length === 3 && christmasOctaveReceipt.promotedSourceOccurrences === 3, 'Christmas Octave receipt must preserve three rules and three exact Portugal 2026 source rows.');
assert(christmasOctaveReceipt.candidateOutcomes.candidates === 3 && christmasOctaveReceipt.candidateOutcomes.presentSourceOccurrences === 3 && christmasOctaveReceipt.candidateOutcomes.suppressedCandidates === 0 && christmasOctaveReceipt.candidateOutcomes.withheldJurisdictionRows === 0, 'Christmas Octave annual candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(christmasOctaveMappings)).digest('hex') === christmasOctaveReceipt.promotedMappingDigestSha256, 'Christmas Octave promoted mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(temporal.mappings)).digest('hex') === christmasOctaveReceipt.temporalRuleMappingDigestSha256, 'Combined TemporalRule mapping digest drifted.');
assert(christmasOctaveReceipt.coverageBefore.mappedOccurrenceAnchors === 202 && christmasOctaveReceipt.coverageBefore.remainingLegacyOccurrences === 187, 'Christmas Octave coverage-before checkpoint drifted.');
assert(christmasOctaveReceipt.coverageAfter.mappedOccurrenceAnchors === coverage.coverage.mappedOccurrenceAnchors && christmasOctaveReceipt.coverageAfter.remainingLegacyOccurrences === coverage.coverage.remainingLegacyOccurrences && christmasOctaveReceipt.coverageAfter.promotionAllowed === false, 'Christmas Octave receipt differs from the fail-closed coverage gate.');

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

assert(remaining.length === 184 && remainingSourceIds.size === 184 && remainingSourceHashes.size === 184, 'Semantic inventory must preserve exactly 184 unique unresolved approved-source rows.');
assert(coveredSourceIds.size + remainingSourceIds.size === 389, 'Covered and unresolved source identities must partition all 389 approved occurrences.');
assert(inventory.coverageAtInventory.approvedSourceOccurrences === 389 && inventory.coverageAtInventory.sourceBoundOccurrences === 205 && inventory.coverageAtInventory.remainingOccurrences === 184 && inventory.coverageAtInventory.promotionAllowed === false, 'Semantic inventory coverage summary drifted or unlocked promotion.');
assert(remainingSourceIds.has('snl-pt-2026-12-24-d12c962ba23beb9e81fa91e4'), 'Portugal December 24 morning form must remain in the human-review inventory.');

const actualCounts = Object.fromEntries([...familyCounts.entries()].sort(([left], [right]) => left.localeCompare(right)));
assert(JSON.stringify(actualCounts) === JSON.stringify(inventory.familyCounts), 'Semantic family counts differ from the exact unresolved rows.');
assert(actualCounts['temporal-weekday-family'] === 61 && (actualCounts['temporal-sunday-family'] ?? 0) === 0 && actualCounts['saturday-marian-family'] === 14, 'Algorithmic temporal backlog classification drifted.');
assert(actualCounts['fixed-person'] === 52, 'Fixed-person backlog classification drifted.');
assert(actualCounts['jurisdiction-structural-overlay'] + actualCounts['portugal-proper'] + actualCounts['jurisdiction-rank-override'] === 21 && inventory.humanReviewBoundary.occurrenceCount === 21, 'Portugal-specific human-review boundary must remain explicit.');
assert(inventory.classificationPolicy.labelsCreateIdentity === false && inventory.classificationPolicy.annualDateCreatesPerennialRule === false && inventory.classificationPolicy.suppressedCandidatesCountAsCoverage === false && inventory.classificationPolicy.transferOriginsCountAsCoverage === false, 'Semantic inventory fail-closed policy weakened.');

console.log('Portugal semantic inventory passed: 205 covered + 184 exact unresolved source rows = 389; 75 remaining temporal-family rows and 21 Portugal-specific rows are explicitly partitioned.');

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
const epiphanyIntervalReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-epiphany-interval.json');
const ordinaryWeekdayEarlyReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-early.json');
const ordinaryWeekdayPreLentReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-pre-lent.json');
const ordinaryWeekdayLate812Receipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-late-8-12.json');
const ordinaryWeekdayLate1318Receipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-late-13-18.json');
const ordinaryWeekdayLate1924Receipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-late-19-24.json');
const ordinaryWeekdayLate2530Receipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-late-25-30.json');
const ordinaryWeekdayLate3134Receipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-ordinary-time-weekdays-late-31-34.json');
const saturdayMarianReceipt = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-promotion-saturday-marian.json');

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
assert(coveredRows.length === 304 && coveredSourceIds.size === 304, 'Semantic inventory coverage boundary must contain exactly 303 unique approved source rows.');
const adventWeekdayFamilyIds = new Set(adventWeekdayReceipt.families);
const epiphanyIntervalFamilyId = epiphanyIntervalReceipt.familyId;
const ordinaryWeekdayEarlyFamilyId = ordinaryWeekdayEarlyReceipt.familyId;
const ordinaryWeekdayLateFamilyId = ordinaryWeekdayLate812Receipt.familyId;
const seasonalSundayMappings = families.families.filter((family) => family.familyId.endsWith('-sunday:roman-catholic')).flatMap((family) => family.presentMappings);
const seasonalCheckpointMappings = families.families.filter((family) => family.familyId !== epiphanyIntervalFamilyId && family.familyId !== ordinaryWeekdayEarlyFamilyId && family.familyId !== ordinaryWeekdayLateFamilyId && !family.familyId.includes('saturday-marian') && !family.familyId.includes('ordinary-time-sunday') && !family.familyId.includes('holy-week-weekday') && !family.familyId.includes('easter-octave-weekday') && !adventWeekdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const ordinarySundayFamilies = families.families.filter((family) => family.familyId.includes('ordinary-time-sunday'));
const ordinarySundayMappings = ordinarySundayFamilies.flatMap((family) => family.presentMappings);
const ordinarySundaySuppressions = families.suppressedCandidates.filter((item) => item.familyId.includes('ordinary-time-sunday'));
const holyWeekOctaveFamilyIds = new Set(holyWeekOctaveReceipt.families);
const holyWeekOctaveFamilies = families.families.filter((family) => holyWeekOctaveFamilyIds.has(family.familyId));
const holyWeekOctaveMappings = holyWeekOctaveFamilies.flatMap((family) => family.presentMappings);
const ordinaryCheckpointMappings = families.families.filter((family) => family.familyId !== epiphanyIntervalFamilyId && family.familyId !== ordinaryWeekdayEarlyFamilyId && family.familyId !== ordinaryWeekdayLateFamilyId && !family.familyId.includes('saturday-marian') && !holyWeekOctaveFamilyIds.has(family.familyId) && !adventWeekdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const holyWeekOctaveCheckpointMappings = families.families.filter((family) => family.familyId !== epiphanyIntervalFamilyId && family.familyId !== ordinaryWeekdayEarlyFamilyId && family.familyId !== ordinaryWeekdayLateFamilyId && !family.familyId.includes('saturday-marian') && !adventWeekdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const adventWeekdayFamilies = families.families.filter((family) => adventWeekdayFamilyIds.has(family.familyId));
const adventWeekdayMappings = adventWeekdayFamilies.flatMap((family) => family.presentMappings);
const adventWeekdaySuppressions = families.suppressedCandidates.filter((item) => adventWeekdayFamilyIds.has(item.familyId));
const temporalFamilyMappings = families.families.filter((family) => family.familyId !== epiphanyIntervalFamilyId && family.familyId !== ordinaryWeekdayEarlyFamilyId && family.familyId !== ordinaryWeekdayLateFamilyId && !family.familyId.includes('saturday-marian')).flatMap((family) => family.presentMappings);
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
assert(christmasOctaveReceipt.coverageAfter.mappedOccurrenceAnchors === 205 && christmasOctaveReceipt.coverageAfter.remainingLegacyOccurrences === 184 && christmasOctaveReceipt.coverageAfter.promotionAllowed === false, 'Historical Christmas Octave coverage receipt drifted.');

const epiphanyFamily = families.families.find((family) => family.familyId === epiphanyIntervalReceipt.familyId);
const epiphanySuppressions = families.suppressedCandidates.filter((item) => item.familyId === epiphanyIntervalReceipt.familyId);
assert(epiphanyIntervalReceipt?.schemaVersion === 1 && epiphanyIntervalReceipt?.status === 'epiphany-interval-temporal-family-shadow-promotion' && epiphanyIntervalReceipt?.mutationAllowed === false && epiphanyIntervalReceipt?.publicationAllowed === false, 'Epiphany interval promotion receipt is invalid or permits mutation/publication.');
assert(epiphanyIntervalReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && epiphanyIntervalReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && epiphanyIntervalReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Epiphany interval receipt is not pinned to the approved artifact.');
assert(epiphanyFamily?.presentMappings.length === 3 && epiphanySuppressions.length === 3, 'Epiphany interval must preserve three exact source rows and three explicit precedence outcomes.');
assert(epiphanyIntervalReceipt.candidateOutcomes.candidates === 6 && epiphanyIntervalReceipt.candidateOutcomes.presentSourceOccurrences === 3 && epiphanyIntervalReceipt.candidateOutcomes.suppressedCandidates === 3, 'Epiphany interval candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(epiphanyFamily.presentMappings)).digest('hex') === epiphanyIntervalReceipt.promotedMappingDigestSha256, 'Epiphany interval promoted mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(epiphanySuppressions)).digest('hex') === epiphanyIntervalReceipt.promotedSuppressionDigestSha256, 'Epiphany interval suppression digest drifted.');
assert(epiphanyIntervalReceipt.coverageBefore.mappedOccurrenceAnchors === 205 && epiphanyIntervalReceipt.coverageBefore.remainingLegacyOccurrences === 184, 'Epiphany interval coverage-before checkpoint drifted.');
assert(epiphanyIntervalReceipt.coverageAfter.mappedOccurrenceAnchors === 208 && epiphanyIntervalReceipt.coverageAfter.remainingLegacyOccurrences === 181 && epiphanyIntervalReceipt.coverageAfter.promotionAllowed === false, 'Historical Epiphany interval coverage checkpoint drifted.');

const ordinaryWeekdayEarlyFamily = families.families.find((family) => family.familyId === ordinaryWeekdayEarlyFamilyId);
const ordinaryWeekdayEarlyMappings = ordinaryWeekdayEarlyFamily.presentMappings.filter((item) => item.week <= 3);
const ordinaryWeekdayEarlySuppressions = families.suppressedCandidates.filter((item) => item.familyId === ordinaryWeekdayEarlyFamilyId && item.week <= 3);
const ordinaryWeekdayPreLentMappings = ordinaryWeekdayEarlyFamily.presentMappings.filter((item) => item.week >= 4);
const ordinaryWeekdayPreLentSuppressions = families.suppressedCandidates.filter((item) => item.familyId === ordinaryWeekdayEarlyFamilyId && item.week >= 4);
const ordinaryWeekdayPreLentWithheld = (families.withheldCandidates ?? []).filter((item) => item.familyId === ordinaryWeekdayEarlyFamilyId && item.week >= 4);
assert(ordinaryWeekdayEarlyReceipt?.schemaVersion === 1 && ordinaryWeekdayEarlyReceipt?.status === 'ordinary-time-weekday-early-temporal-family-shadow-promotion' && ordinaryWeekdayEarlyReceipt?.mutationAllowed === false && ordinaryWeekdayEarlyReceipt?.publicationAllowed === false, 'Early Ordinary Time weekday promotion receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayEarlyReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayEarlyReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayEarlyReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Early Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayEarlyMappings.length === 8 && ordinaryWeekdayEarlySuppressions.length === 10, 'Early Ordinary Time weekday family must preserve eight exact source rows and ten explicit precedence outcomes.');
assert(ordinaryWeekdayEarlyReceipt.candidateOutcomes.candidates === 18 && ordinaryWeekdayEarlyReceipt.candidateOutcomes.presentSourceOccurrences === 8 && ordinaryWeekdayEarlyReceipt.candidateOutcomes.suppressedCandidates === 10, 'Early Ordinary Time weekday candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayEarlyMappings)).digest('hex') === ordinaryWeekdayEarlyReceipt.promotedMappingDigestSha256, 'Early Ordinary Time weekday mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayEarlySuppressions)).digest('hex') === ordinaryWeekdayEarlyReceipt.promotedSuppressionDigestSha256, 'Early Ordinary Time weekday suppression digest drifted.');
assert(ordinaryWeekdayEarlyReceipt.coverageBefore.mappedOccurrenceAnchors === 208 && ordinaryWeekdayEarlyReceipt.coverageBefore.remainingLegacyOccurrences === 181, 'Early Ordinary Time weekday coverage-before checkpoint drifted.');
assert(ordinaryWeekdayEarlyReceipt.coverageAfter.mappedOccurrenceAnchors === 216 && ordinaryWeekdayEarlyReceipt.coverageAfter.remainingLegacyOccurrences === 173 && ordinaryWeekdayEarlyReceipt.coverageAfter.promotionAllowed === false, 'Historical early Ordinary Time weekday coverage receipt drifted.');
assert(ordinaryWeekdayPreLentReceipt?.schemaVersion === 1 && ordinaryWeekdayPreLentReceipt?.status === 'ordinary-time-weekday-pre-lent-temporal-family-shadow-promotion' && ordinaryWeekdayPreLentReceipt?.mutationAllowed === false && ordinaryWeekdayPreLentReceipt?.publicationAllowed === false, 'Pre-Lent Ordinary Time weekday promotion receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayPreLentReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayPreLentReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayPreLentReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Pre-Lent Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayPreLentMappings.length === 4 && ordinaryWeekdayPreLentSuppressions.length === 9 && ordinaryWeekdayPreLentWithheld.length === 1, 'Pre-Lent Ordinary Time family must preserve four exact source rows, nine suppressions and one withheld jurisdiction row.');
assert(ordinaryWeekdayPreLentReceipt.candidateOutcomes.candidates === 14 && ordinaryWeekdayPreLentReceipt.candidateOutcomes.presentSourceOccurrences === 4 && ordinaryWeekdayPreLentReceipt.candidateOutcomes.suppressedCandidates === 9 && ordinaryWeekdayPreLentReceipt.candidateOutcomes.withheldJurisdictionRows === 1, 'Pre-Lent Ordinary Time candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayPreLentMappings)).digest('hex') === ordinaryWeekdayPreLentReceipt.promotedMappingDigestSha256, 'Pre-Lent Ordinary Time weekday mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayPreLentSuppressions)).digest('hex') === ordinaryWeekdayPreLentReceipt.promotedSuppressionDigestSha256, 'Pre-Lent Ordinary Time weekday suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayPreLentWithheld)).digest('hex') === ordinaryWeekdayPreLentReceipt.withheldCandidateDigestSha256, 'Pre-Lent Ordinary Time withheld-candidate digest drifted.');
assert(ordinaryWeekdayPreLentReceipt.coverageBefore.mappedOccurrenceAnchors === 216 && ordinaryWeekdayPreLentReceipt.coverageBefore.remainingLegacyOccurrences === 173, 'Pre-Lent Ordinary Time coverage-before checkpoint drifted.');
assert(ordinaryWeekdayPreLentReceipt.coverageAfter.mappedOccurrenceAnchors === 220 && ordinaryWeekdayPreLentReceipt.coverageAfter.remainingLegacyOccurrences === 169 && ordinaryWeekdayPreLentReceipt.coverageAfter.promotionAllowed === false, 'Historical pre-Lent Ordinary Time coverage receipt drifted.');

const ordinaryWeekdayLateFamily = families.families.find((family) => family.familyId === ordinaryWeekdayLateFamilyId);
const ordinaryWeekdayLateMappings = ordinaryWeekdayLateFamily?.presentMappings ?? [];
const ordinaryWeekdayLateSuppressions = families.suppressedCandidates.filter((item) => item.familyId === ordinaryWeekdayLateFamilyId);
const ordinaryWeekdayLate812Mappings = ordinaryWeekdayLateMappings.filter((item) => item.week >= 8 && item.week <= 12);
const ordinaryWeekdayLate812Suppressions = ordinaryWeekdayLateSuppressions.filter((item) => item.week >= 8 && item.week <= 12);
assert(ordinaryWeekdayLate812Receipt?.schemaVersion === 1 && ordinaryWeekdayLate812Receipt?.status === 'ordinary-time-weekday-late-8-12-temporal-family-shadow-promotion' && ordinaryWeekdayLate812Receipt?.mutationAllowed === false && ordinaryWeekdayLate812Receipt?.publicationAllowed === false, 'Weeks 8-12 Ordinary Time weekday receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayLate812Receipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayLate812Receipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayLate812Receipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Weeks 8-12 Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayLate812Mappings.length === 9 && ordinaryWeekdayLate812Suppressions.length === 21, 'Weeks 8-12 must preserve nine exact source rows and 21 precedence outcomes.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate812Mappings)).digest('hex') === ordinaryWeekdayLate812Receipt.promotedMappingDigestSha256, 'Weeks 8-12 mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate812Suppressions)).digest('hex') === ordinaryWeekdayLate812Receipt.promotedSuppressionDigestSha256, 'Weeks 8-12 suppression digest drifted.');
assert(ordinaryWeekdayLate812Receipt.coverageBefore.mappedOccurrenceAnchors === 220 && ordinaryWeekdayLate812Receipt.coverageAfter.mappedOccurrenceAnchors === 229, 'Weeks 8-12 historical coverage receipt drifted.');

const ordinaryWeekdayLate1318Mappings = ordinaryWeekdayLateMappings.filter((item) => item.week >= 13 && item.week <= 18);
const ordinaryWeekdayLate1318Suppressions = ordinaryWeekdayLateSuppressions.filter((item) => item.week >= 13 && item.week <= 18);
const ordinaryWeekdayLate1318Withheld = families.withheldCandidates.filter((item) => item.familyId === ordinaryWeekdayLateFamilyId && item.week >= 13 && item.week <= 18);
assert(ordinaryWeekdayLate1318Receipt?.schemaVersion === 1 && ordinaryWeekdayLate1318Receipt?.status === 'ordinary-time-weekday-late-13-18-temporal-family-shadow-promotion' && ordinaryWeekdayLate1318Receipt?.mutationAllowed === false && ordinaryWeekdayLate1318Receipt?.publicationAllowed === false, 'Weeks 13-18 Ordinary Time weekday receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayLate1318Receipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayLate1318Receipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayLate1318Receipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Weeks 13-18 Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayLate1318Receipt.perennialBoundaries.exclusiveStartAnchor === 'pentecost' && ordinaryWeekdayLate1318Receipt.perennialBoundaries.exclusiveEndAnchor === 'advent-start' && ordinaryWeekdayLate1318Receipt.perennialBoundaries.weekNumbering === 'backward-from-advent', 'Weeks 13-18 perennial boundaries drifted.');
assert(ordinaryWeekdayLate1318Mappings.length === 8 && ordinaryWeekdayLate1318Suppressions.length === 27 && ordinaryWeekdayLate1318Withheld.length === 1, 'Weeks 13-18 must preserve eight exact rows, 27 precedence outcomes and one withheld jurisdiction row.');
assert(ordinaryWeekdayLate1318Receipt.candidateOutcomes.candidates === 36 && ordinaryWeekdayLate1318Receipt.candidateOutcomes.presentSourceOccurrences === 8 && ordinaryWeekdayLate1318Receipt.candidateOutcomes.suppressedCandidates === 27 && ordinaryWeekdayLate1318Receipt.candidateOutcomes.withheldCandidates === 1, 'Weeks 13-18 candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate1318Mappings)).digest('hex') === ordinaryWeekdayLate1318Receipt.promotedMappingDigestSha256, 'Weeks 13-18 mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate1318Suppressions)).digest('hex') === ordinaryWeekdayLate1318Receipt.promotedSuppressionDigestSha256, 'Weeks 13-18 suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate1318Withheld)).digest('hex') === ordinaryWeekdayLate1318Receipt.withheldCandidateDigestSha256, 'Weeks 13-18 withheld-candidate digest drifted.');
assert(ordinaryWeekdayLate1318Receipt.coverageBefore.mappedOccurrenceAnchors === 229 && ordinaryWeekdayLate1318Receipt.coverageAfter.mappedOccurrenceAnchors === 237 && ordinaryWeekdayLate1318Receipt.coverageAfter.remainingLegacyOccurrences === 152 && ordinaryWeekdayLate1318Receipt.coverageAfter.promotionAllowed === false, 'Weeks 13-18 historical coverage receipt drifted.');
const ordinaryWeekdayLate1924Mappings = ordinaryWeekdayLateMappings.filter((item) => item.week >= 19 && item.week <= 24);
const ordinaryWeekdayLate1924Suppressions = ordinaryWeekdayLateSuppressions.filter((item) => item.week >= 19 && item.week <= 24);
const ordinaryWeekdayLate1924Withheld = families.withheldCandidates.filter((item) => item.familyId === ordinaryWeekdayLateFamilyId && item.week >= 19 && item.week <= 24);
assert(ordinaryWeekdayLate1924Receipt?.schemaVersion === 1 && ordinaryWeekdayLate1924Receipt?.status === 'ordinary-time-weekday-late-19-24-temporal-family-shadow-promotion' && ordinaryWeekdayLate1924Receipt?.mutationAllowed === false && ordinaryWeekdayLate1924Receipt?.publicationAllowed === false, 'Weeks 19-24 Ordinary Time weekday receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayLate1924Receipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayLate1924Receipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayLate1924Receipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Weeks 19-24 Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayLate1924Receipt.perennialBoundaries.exclusiveStartAnchor === 'pentecost' && ordinaryWeekdayLate1924Receipt.perennialBoundaries.exclusiveEndAnchor === 'advent-start' && ordinaryWeekdayLate1924Receipt.perennialBoundaries.weekNumbering === 'backward-from-advent', 'Weeks 19-24 perennial boundaries drifted.');
assert(ordinaryWeekdayLate1924Mappings.length === 10 && ordinaryWeekdayLate1924Suppressions.length === 25 && ordinaryWeekdayLate1924Withheld.length === 1, 'Weeks 19-24 must preserve ten exact rows, 25 precedence outcomes and one withheld jurisdiction row.');
assert(ordinaryWeekdayLate1924Receipt.candidateOutcomes.candidates === 36 && ordinaryWeekdayLate1924Receipt.candidateOutcomes.presentSourceOccurrences === 10 && ordinaryWeekdayLate1924Receipt.candidateOutcomes.suppressedCandidates === 25 && ordinaryWeekdayLate1924Receipt.candidateOutcomes.withheldCandidates === 1, 'Weeks 19-24 candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate1924Mappings)).digest('hex') === ordinaryWeekdayLate1924Receipt.promotedMappingDigestSha256, 'Weeks 19-24 mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate1924Suppressions)).digest('hex') === ordinaryWeekdayLate1924Receipt.promotedSuppressionDigestSha256, 'Weeks 19-24 suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate1924Withheld)).digest('hex') === ordinaryWeekdayLate1924Receipt.withheldCandidateDigestSha256, 'Weeks 19-24 withheld-candidate digest drifted.');
assert(ordinaryWeekdayLate1924Receipt.coverageBefore.mappedOccurrenceAnchors === 237 && ordinaryWeekdayLate1924Receipt.coverageAfter.mappedOccurrenceAnchors === 247 && ordinaryWeekdayLate1924Receipt.coverageAfter.remainingLegacyOccurrences === 142 && ordinaryWeekdayLate1924Receipt.coverageAfter.promotionAllowed === false, 'Weeks 19-24 historical coverage receipt drifted.');

const ordinaryWeekdayLate2530Mappings = ordinaryWeekdayLateMappings.filter((item) => item.week >= 25 && item.week <= 30);
const ordinaryWeekdayLate2530Suppressions = ordinaryWeekdayLateSuppressions.filter((item) => item.week >= 25 && item.week <= 30);
const ordinaryWeekdayLate2530Withheld = families.withheldCandidates.filter((item) => item.familyId === ordinaryWeekdayLateFamilyId && item.week >= 25 && item.week <= 30);
assert(ordinaryWeekdayLate2530Receipt?.schemaVersion === 1 && ordinaryWeekdayLate2530Receipt?.status === 'ordinary-time-weekday-late-25-30-temporal-family-shadow-promotion' && ordinaryWeekdayLate2530Receipt?.mutationAllowed === false && ordinaryWeekdayLate2530Receipt?.publicationAllowed === false, 'Weeks 25-30 Ordinary Time weekday receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayLate2530Receipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayLate2530Receipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayLate2530Receipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Weeks 25-30 Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayLate2530Receipt.perennialBoundaries.exclusiveStartAnchor === 'pentecost' && ordinaryWeekdayLate2530Receipt.perennialBoundaries.exclusiveEndAnchor === 'advent-start' && ordinaryWeekdayLate2530Receipt.perennialBoundaries.weekNumbering === 'backward-from-advent', 'Weeks 25-30 perennial boundaries drifted.');
assert(ordinaryWeekdayLate2530Mappings.length === 11 && ordinaryWeekdayLate2530Suppressions.length === 24 && ordinaryWeekdayLate2530Withheld.length === 1, 'Weeks 25-30 must preserve eleven exact rows, 24 precedence outcomes and one withheld jurisdiction row.');
assert(ordinaryWeekdayLate2530Receipt.candidateOutcomes.candidates === 36 && ordinaryWeekdayLate2530Receipt.candidateOutcomes.presentSourceOccurrences === 11 && ordinaryWeekdayLate2530Receipt.candidateOutcomes.suppressedCandidates === 24 && ordinaryWeekdayLate2530Receipt.candidateOutcomes.withheldCandidates === 1, 'Weeks 25-30 candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate2530Mappings)).digest('hex') === ordinaryWeekdayLate2530Receipt.promotedMappingDigestSha256, 'Weeks 25-30 mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate2530Suppressions)).digest('hex') === ordinaryWeekdayLate2530Receipt.promotedSuppressionDigestSha256, 'Weeks 25-30 suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate2530Withheld)).digest('hex') === ordinaryWeekdayLate2530Receipt.withheldCandidateDigestSha256, 'Weeks 25-30 withheld-candidate digest drifted.');
assert(ordinaryWeekdayLate2530Receipt.coverageBefore.mappedOccurrenceAnchors === 247 && ordinaryWeekdayLate2530Receipt.coverageAfter.mappedOccurrenceAnchors === 258 && ordinaryWeekdayLate2530Receipt.coverageAfter.remainingLegacyOccurrences === 131 && ordinaryWeekdayLate2530Receipt.coverageAfter.promotionAllowed === false, 'Weeks 25-30 historical coverage receipt drifted.');

const ordinaryWeekdayLate3134Mappings = ordinaryWeekdayLateMappings.filter((item) => item.week >= 31 && item.week <= 34);
const ordinaryWeekdayLate3134Suppressions = ordinaryWeekdayLateSuppressions.filter((item) => item.week >= 31 && item.week <= 34);
const ordinaryWeekdayLate3134Withheld = families.withheldCandidates.filter((item) => item.familyId === ordinaryWeekdayLateFamilyId && item.week >= 31 && item.week <= 34);
assert(ordinaryWeekdayLate3134Receipt?.schemaVersion === 1 && ordinaryWeekdayLate3134Receipt?.status === 'ordinary-time-weekday-late-31-34-temporal-family-shadow-promotion' && ordinaryWeekdayLate3134Receipt?.mutationAllowed === false && ordinaryWeekdayLate3134Receipt?.publicationAllowed === false, 'Weeks 31-34 Ordinary Time weekday receipt is invalid or permits mutation/publication.');
assert(ordinaryWeekdayLate3134Receipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && ordinaryWeekdayLate3134Receipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && ordinaryWeekdayLate3134Receipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Weeks 31-34 Ordinary Time weekday receipt is not pinned to the approved artifact.');
assert(ordinaryWeekdayLate3134Receipt.perennialBoundaries.exclusiveStartAnchor === 'pentecost' && ordinaryWeekdayLate3134Receipt.perennialBoundaries.exclusiveEndAnchor === 'advent-start' && ordinaryWeekdayLate3134Receipt.perennialBoundaries.weekNumbering === 'backward-from-advent', 'Weeks 31-34 perennial boundaries drifted.');
assert(ordinaryWeekdayLate3134Mappings.length === 6 && ordinaryWeekdayLate3134Suppressions.length === 17 && ordinaryWeekdayLate3134Withheld.length === 1, 'Weeks 31-34 must preserve six exact rows, 17 precedence outcomes and one withheld jurisdiction row.');
assert(ordinaryWeekdayLate3134Receipt.candidateOutcomes.candidates === 24 && ordinaryWeekdayLate3134Receipt.candidateOutcomes.presentSourceOccurrences === 6 && ordinaryWeekdayLate3134Receipt.candidateOutcomes.suppressedCandidates === 17 && ordinaryWeekdayLate3134Receipt.candidateOutcomes.withheldCandidates === 1, 'Weeks 31-34 candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate3134Mappings)).digest('hex') === ordinaryWeekdayLate3134Receipt.promotedMappingDigestSha256, 'Weeks 31-34 mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate3134Suppressions)).digest('hex') === ordinaryWeekdayLate3134Receipt.promotedSuppressionDigestSha256, 'Weeks 31-34 suppression digest drifted.');
assert(createHash('sha256').update(JSON.stringify(ordinaryWeekdayLate3134Withheld)).digest('hex') === ordinaryWeekdayLate3134Receipt.withheldCandidateDigestSha256, 'Weeks 31-34 withheld-candidate digest drifted.');
assert(ordinaryWeekdayLate3134Receipt.coverageBefore.mappedOccurrenceAnchors === 258 && ordinaryWeekdayLate3134Receipt.coverageAfter.mappedOccurrenceAnchors === 264 && ordinaryWeekdayLate3134Receipt.coverageAfter.remainingLegacyOccurrences === 125 && ordinaryWeekdayLate3134Receipt.coverageAfter.promotionAllowed === false, 'Weeks 31-34 historical coverage receipt drifted.');

const saturdayFamilyIds = new Set(saturdayMarianReceipt.familyIds);
const saturdayMappings = families.families.filter((family) => saturdayFamilyIds.has(family.familyId)).flatMap((family) => family.presentMappings);
const saturdaySuppressions = families.suppressedCandidates.filter((item) => saturdayFamilyIds.has(item.familyId));
assert(saturdayMarianReceipt?.schemaVersion === 1 && saturdayMarianReceipt?.status === 'saturday-marian-temporal-family-shadow-promotion' && saturdayMarianReceipt?.mutationAllowed === false && saturdayMarianReceipt?.publicationAllowed === false, 'Saturday Marian promotion receipt is invalid or permits mutation/publication.');
assert(saturdayMarianReceipt.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && saturdayMarianReceipt.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && saturdayMarianReceipt.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256, 'Saturday Marian receipt is not pinned to the approved artifact.');
assert(saturdayMarianReceipt.canonicalPolicy.selectionMode === 'optional-alternative' && saturdayMarianReceipt.canonicalPolicy.obligatory === false && saturdayMarianReceipt.canonicalPolicy.precedenceResolutionRequired === true, 'Saturday Marian receipt weakened optionality or precedence policy.');
assert(saturdayMappings.length === 14 && saturdaySuppressions.length === 18 && saturdayMarianReceipt.candidateOutcomes.candidates === 32, 'Saturday Marian annual candidate partition drifted.');
assert(createHash('sha256').update(JSON.stringify(saturdayMappings)).digest('hex') === saturdayMarianReceipt.promotedMappingDigestSha256, 'Saturday Marian mapping digest drifted.');
assert(createHash('sha256').update(JSON.stringify(saturdaySuppressions)).digest('hex') === saturdayMarianReceipt.promotedSuppressionDigestSha256, 'Saturday Marian suppression digest drifted.');
assert(saturdayMarianReceipt.coverageBefore.mappedOccurrenceAnchors === 264 && saturdayMarianReceipt.coverageAfter.mappedOccurrenceAnchors === 278 && saturdayMarianReceipt.coverageAfter.remainingLegacyOccurrences === 111 && saturdayMarianReceipt.coverageAfter.promotionAllowed === false, 'Saturday Marian historical receipt drifted or permits promotion.');
assert(coverage.coverage.mappedOccurrenceAnchors > saturdayMarianReceipt.coverageAfter.mappedOccurrenceAnchors && coverage.coverage.remainingLegacyOccurrences < saturdayMarianReceipt.coverageAfter.remainingLegacyOccurrences, 'Subsequent reviewed Sanctorale promotions must advance beyond the Saturday Marian checkpoint.');


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

assert(remaining.length === 85 && remainingSourceIds.size === 85 && remainingSourceHashes.size === 85, 'Semantic inventory must preserve exactly 86 unique unresolved approved-source rows.');
assert(coveredSourceIds.size + remainingSourceIds.size === 389, 'Covered and unresolved source identities must partition all 389 approved occurrences.');
assert(inventory.coverageAtInventory.approvedSourceOccurrences === 389 && inventory.coverageAtInventory.sourceBoundOccurrences === 304 && inventory.coverageAtInventory.remainingOccurrences === 85 && inventory.coverageAtInventory.promotionAllowed === false, 'Semantic inventory coverage summary drifted or unlocked promotion.');
assert(remainingSourceIds.has('snl-pt-2026-12-24-d12c962ba23beb9e81fa91e4'), 'Portugal December 24 morning form must remain in the human-review inventory.');

const actualCounts = Object.fromEntries([...familyCounts.entries()].sort(([left], [right]) => left.localeCompare(right)));
assert(JSON.stringify(actualCounts) === JSON.stringify(inventory.familyCounts), 'Semantic family counts differ from the exact unresolved rows.');
assert(actualCounts['temporal-weekday-family'] === 3 && (actualCounts['temporal-sunday-family'] ?? 0) === 0 && (actualCounts['saturday-marian-family'] ?? 0) === 0, 'Algorithmic temporal backlog classification drifted.');
assert(actualCounts['fixed-person'] === 38, 'Fixed-person backlog classification drifted.');
assert((actualCounts['fixed-collective'] ?? 0) === 0, 'Fixed-collective backlog must be empty after the Archangels promotion.');
assert(actualCounts['jurisdiction-structural-overlay'] + actualCounts['portugal-proper'] + actualCounts['jurisdiction-rank-override'] === 20 && inventory.humanReviewBoundary.occurrenceCount === 20, 'Portugal-specific human-review boundary must remain explicit.');
assert(inventory.classificationPolicy.labelsCreateIdentity === false && inventory.classificationPolicy.annualDateCreatesPerennialRule === false && inventory.classificationPolicy.suppressedCandidatesCountAsCoverage === false && inventory.classificationPolicy.withheldCandidatesCountAsCoverage === false && inventory.classificationPolicy.transferOriginsCountAsCoverage === false, 'Semantic inventory fail-closed policy weakened.');

console.log('Portugal semantic inventory passed: 304 covered + 85 exact unresolved source rows = 389; three remaining temporal-family rows and 20 Portugal-specific rows are explicitly partitioned.');

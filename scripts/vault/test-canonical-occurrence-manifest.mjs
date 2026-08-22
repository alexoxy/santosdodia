#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCanonicalOccurrenceVaultRelease } from './build-canonical-occurrence-manifest.mjs';

const root = process.cwd();
const [occurrenceBytes, observanceBytes, jurisdictionBytes, ecclesialBytes, bridgeBytes] = await Promise.all([
  readFile(path.join(root, 'data', 'canonical-occurrence-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-observance-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-jurisdiction-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-ecclesial-context-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-occurrence-legacy-bridges.json'), 'utf8')
]);

const occurrenceDataset = JSON.parse(occurrenceBytes);
const observanceDataset = JSON.parse(observanceBytes);
const jurisdictionDataset = JSON.parse(jurisdictionBytes);
const ecclesialDataset = JSON.parse(ecclesialBytes);
const bridgeDataset = JSON.parse(bridgeBytes);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function build(dataset = occurrenceDataset, jurisdictions = jurisdictionDataset, bridges = bridgeDataset, options = {}) {
  return buildCanonicalOccurrenceVaultRelease(dataset, observanceDataset, jurisdictions, ecclesialDataset, bridges, options);
}

function expectFailure(label, fn, expectedText) {
  let failed = false;
  try { fn(); }
  catch (error) {
    failed = true;
    assert(String(error?.message ?? error).includes(expectedText), `${label} failed for the wrong reason: ${String(error?.message ?? error)}`);
  }
  assert(failed, `${label} unexpectedly passed.`);
}

const first = build(occurrenceDataset, jurisdictionDataset, bridgeDataset, {
  sourceBytes: occurrenceBytes,
  bridgeBytes,
  sourceCommit: 'commit-a',
  generatedAt: '2026-08-22T00:00:00.000Z'
});
const second = build(occurrenceDataset, jurisdictionDataset, bridgeDataset, {
  sourceBytes: occurrenceBytes,
  bridgeBytes,
  sourceCommit: 'commit-b',
  generatedAt: '2026-08-23T00:00:00.000Z'
});
const reformattedOccurrenceBytes = `${JSON.stringify(occurrenceDataset)}\n`;
const reformattedBridgeBytes = `${JSON.stringify(bridgeDataset)}\n`;
const reformatted = build(occurrenceDataset, jurisdictionDataset, bridgeDataset, {
  sourceBytes: reformattedOccurrenceBytes,
  bridgeBytes: reformattedBridgeBytes,
  sourceCommit: 'commit-c',
  generatedAt: '2026-08-24T00:00:00.000Z'
});

assert(first.manifest.rootSha256 === second.manifest.rootSha256, 'Occurrence root must be deterministic across runs.');
assert(first.manifest.rootSha256 === reformatted.manifest.rootSha256, 'Formatting-only source changes must not alter Occurrence root.');
assert(JSON.stringify(first.manifest) === JSON.stringify(second.manifest), 'Occurrence manifest must be deterministic for equal canonical semantics.');
assert(JSON.stringify(first.manifest) === JSON.stringify(reformatted.manifest), 'Formatting-only changes must not alter immutable Occurrence manifest bytes.');
assert(first.buildReceipt.sourceCommit !== second.buildReceipt.sourceCommit, 'Run-specific commit belongs in the Occurrence build receipt.');
assert(first.buildReceipt.generatedAt !== second.buildReceipt.generatedAt, 'Run-specific generatedAt belongs in the Occurrence build receipt.');
assert(first.buildReceipt.sourceDatasetSha256 !== reformatted.buildReceipt.sourceDatasetSha256, 'Occurrence build receipt must preserve source-byte provenance changes.');
assert(first.buildReceipt.compatibilityBridgeSha256 !== reformatted.buildReceipt.compatibilityBridgeSha256, 'Occurrence receipt must preserve bridge-byte provenance changes.');
assert(first.buildReceipt.publicationChanged === false && first.buildReceipt.productionMutation === false && first.buildReceipt.d1Changed === false, 'Building Occurrence must not mutate publication or D1.');

assert(first.manifest.artifactType === 'canonical-liturgical-occurrences', 'Occurrence artifact type changed unexpectedly.');
assert(first.manifest.vaultLayer === 'canonical', 'Occurrence release must target canonical Vault.');
assert(first.manifest.occurrenceCount === 4, 'Bootstrap Occurrence count changed and requires explicit review.');
assert(first.manifest.legacyBridgeCount === 4, 'Bootstrap legacy bridge count changed and requires explicit review.');
assert(JSON.stringify(first.manifest.churches) === JSON.stringify(['church:roman-catholic']), 'Bootstrap Church coverage changed unexpectedly.');
assert(JSON.stringify(first.manifest.jurisdictions) === JSON.stringify(['jurisdiction:roman-catholic:pt']), 'Bootstrap Jurisdiction coverage changed unexpectedly.');
assert(JSON.stringify(first.manifest.years) === JSON.stringify([2026]), 'Bootstrap year coverage changed unexpectedly.');
assert(first.manifest.runtimePublicationAllowed === false && first.manifest.productionMutationAllowed === false, 'Occurrence bootstrap must remain shadow-only.');
assert(first.manifest.currentPointerPath === '/vault/canonical/occurrences/v1/current.json', 'Occurrence current pointer path changed unexpectedly.');
assert(first.manifest.immutableReleaseRoot.endsWith(first.manifest.rootSha256), 'Occurrence release root must be content-addressed.');
assert(first.manifest.semantics.occurrenceBindsObservanceToConcreteContext === true, 'Occurrence must bind Observance to concrete context.');
assert(first.manifest.semantics.annualDateIsAuthorityDriven === true, 'Annual dates must remain authority-driven.');
assert(first.manifest.semantics.rankIsAuthorityDriven === true, 'Liturgical rank must remain authority-driven.');
assert(first.manifest.semantics.legacyBridgeIsNonCanonicalAndReadOnly === true, 'Legacy bridge must remain non-canonical/read-only.');
assert(first.manifest.d1Projection.status === 'equivalence-shadow-only' && first.manifest.d1Projection.mutationAllowed === false, 'Occurrence D1 projection must remain shadow-only.');
assert(first.manifest.d1Projection.targetLegacyRelease === 'roman-catholic-pt-2026-v2', 'Occurrence shadow must remain pinned to reviewed Portugal v2 release.');

const expected = new Map([
  ['observance:thomas-aquinas:roman-catholic', ['2026-01-28', 'obligatory-memorial', 'MO', 'rc:StThomasAquinas']],
  ['observance:catherine-siena:roman-catholic', ['2026-04-29', 'feast', 'FESTA', 'rc:StCatherineSiena']],
  ['observance:elizabeth-portugal:roman-catholic', ['2026-07-04', 'obligatory-memorial', 'MO', 'rc:StElizabethPortugal']],
  ['observance:matthew-apostle:roman-catholic', ['2026-09-21', 'feast', 'FESTA', 'rc:StMatthewEvangelist']]
]);
const bridgeByOccurrence = new Map(first.legacyOccurrenceBridges.map((item) => [item.occurrenceId, item]));

for (const occurrence of first.occurrences) {
  assert(occurrence.entityType === 'Occurrence', `${occurrence.occurrenceId} is not emitted as Occurrence.`);
  assert(occurrence.churchId === 'church:roman-catholic', `${occurrence.occurrenceId} changed Church.`);
  assert(occurrence.jurisdictionId === 'jurisdiction:roman-catholic:pt', `${occurrence.occurrenceId} changed Jurisdiction.`);
  assert(occurrence.calendarSystem === 'gregorian', `${occurrence.occurrenceId} changed calendar system.`);
  assert(occurrence.year === 2026, `${occurrence.occurrenceId} changed year.`);
  assert(occurrence.resolutionStatus === 'canonical-anchor', `${occurrence.occurrenceId} lost canonical-anchor status.`);
  assert(occurrence.deletionPolicy === 'tombstone-only', `${occurrence.occurrenceId} lost tombstone-only deletion.`);
  const vector = expected.get(occurrence.observanceId);
  assert(vector, `${occurrence.occurrenceId} is not one of the reviewed semantic vectors.`);
  assert(occurrence.dateISO === vector[0], `${occurrence.occurrenceId} date drifted from reviewed SNL vector.`);
  assert(occurrence.rank === vector[1], `${occurrence.occurrenceId} rank drifted from reviewed SNL vector.`);
  assert(occurrence.sourceRankCode === vector[2], `${occurrence.occurrenceId} source rank code drifted.`);
  const bridge = bridgeByOccurrence.get(occurrence.occurrenceId);
  assert(bridge?.legacyObservanceId === vector[3], `${occurrence.occurrenceId} legacy bridge drifted.`);
  assert(bridge?.dateISO === occurrence.dateISO && bridge?.mutationAllowed === false, `${occurrence.occurrenceId} bridge is not exact/read-only.`);
}

const wrongDateYear = structuredClone(occurrenceDataset);
wrongDateYear.occurrences[0].dateISO = '2025-01-28';
expectFailure('Year/date consistency guard', () => build(wrongDateYear), 'does not match declared year');

const impossibleDate = structuredClone(occurrenceDataset);
impossibleDate.occurrences[0].dateISO = '2026-02-30';
expectFailure('Civil date validity guard', () => build(impossibleDate), 'not a real civil date');

const wrongRank = structuredClone(occurrenceDataset);
wrongRank.occurrences[0].rank = 'feast';
expectFailure('Source rank mapping guard', () => build(wrongRank), 'does not map to canonical rank');

const wrongChurch = structuredClone(occurrenceDataset);
wrongChurch.occurrences[0].churchId = 'church:orthodox-church-america';
expectFailure('Observance Church guard', () => build(wrongChurch), 'Church does not match its canonical Observance');

const wrongJurisdictionChurch = structuredClone(jurisdictionDataset);
wrongJurisdictionChurch.jurisdictions[0].churchId = 'church:orthodox-church-america';
expectFailure('Jurisdiction Church guard', () => build(occurrenceDataset, wrongJurisdictionChurch), 'Jurisdiction belongs to a different Church');

const wrongCalendar = structuredClone(occurrenceDataset);
wrongCalendar.occurrences[0].calendarSystem = 'julian';
expectFailure('Jurisdiction calendar guard', () => build(wrongCalendar), 'is not valid for its Jurisdiction');

const crossAuthority = structuredClone(occurrenceDataset);
crossAuthority.occurrences[0].evidence[0].url = 'https://www.vaticannews.va/en/saints/01/28/st--thomas-aquinas.html';
expectFailure('Jurisdiction evidence authority guard', () => build(crossAuthority), 'outside canonical Jurisdiction authority domains');

const duplicate = structuredClone(occurrenceDataset);
duplicate.occurrences.push({ ...structuredClone(duplicate.occurrences[0]), id: 'occurrence:2026-01-28:thomas-aquinas:roman-catholic:pt:duplicate' });
expectFailure('Duplicate canonical Occurrence guard', () => build(duplicate), 'duplicates canonical Occurrence state');

const bridgeMutation = structuredClone(bridgeDataset);
bridgeMutation.mutationAllowed = true;
expectFailure('Legacy bridge mutation guard', () => build(occurrenceDataset, jurisdictionDataset, bridgeMutation), 'Read-only legacy Occurrence bridge is required');

const bridgeDateDrift = structuredClone(bridgeDataset);
bridgeDateDrift.bridges[0].dateISO = '2026-01-29';
expectFailure('Legacy bridge date guard', () => build(occurrenceDataset, jurisdictionDataset, bridgeDateDrift), 'date differs from canonical Occurrence');

console.log(`Canonical Occurrence Vault release test passed: ${first.occurrences.length} Portugal 2026 shadow occurrences with reviewed SNL date/rank vectors and read-only legacy equivalence bridges, deterministic root ${first.manifest.rootSha256}.`);

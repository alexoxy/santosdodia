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

function assert(condition, message) { if (!condition) throw new Error(message); }
function build(dataset = occurrenceDataset, jurisdictions = jurisdictionDataset, bridges = bridgeDataset, options = {}) {
  return buildCanonicalOccurrenceVaultRelease(dataset, observanceDataset, jurisdictions, ecclesialDataset, bridges, options);
}
function expectFailure(label, fn, expectedText) {
  let failed = false;
  try { fn(); } catch (error) {
    failed = true;
    assert(String(error?.message ?? error).includes(expectedText), `${label} failed for the wrong reason: ${String(error?.message ?? error)}`);
  }
  assert(failed, `${label} unexpectedly passed.`);
}

const first = build(occurrenceDataset, jurisdictionDataset, bridgeDataset, { sourceBytes: occurrenceBytes, bridgeBytes, sourceCommit: 'commit-a', generatedAt: '2026-08-22T00:00:00.000Z' });
const second = build(occurrenceDataset, jurisdictionDataset, bridgeDataset, { sourceBytes: occurrenceBytes, bridgeBytes, sourceCommit: 'commit-b', generatedAt: '2026-08-23T00:00:00.000Z' });
const reformatted = build(occurrenceDataset, jurisdictionDataset, bridgeDataset, {
  sourceBytes: `${JSON.stringify(occurrenceDataset)}\n`,
  bridgeBytes: `${JSON.stringify(bridgeDataset)}\n`,
  sourceCommit: 'commit-c',
  generatedAt: '2026-08-24T00:00:00.000Z'
});

assert(first.manifest.rootSha256 === second.manifest.rootSha256, 'Occurrence root must be deterministic across runs.');
assert(first.manifest.rootSha256 === reformatted.manifest.rootSha256, 'Formatting-only source changes must not alter Occurrence root.');
assert(JSON.stringify(first.manifest) === JSON.stringify(second.manifest), 'Occurrence manifest must be deterministic for equal canonical semantics.');
assert(JSON.stringify(first.manifest) === JSON.stringify(reformatted.manifest), 'Formatting-only changes must not alter immutable Occurrence manifest bytes.');
assert(first.buildReceipt.sourceCommit !== second.buildReceipt.sourceCommit, 'Run-specific commit belongs in the Occurrence build receipt.');
assert(first.buildReceipt.generatedAt !== second.buildReceipt.generatedAt, 'Run-specific generatedAt belongs in the Occurrence build receipt.');
assert(first.buildReceipt.publicationChanged === false && first.buildReceipt.productionMutation === false && first.buildReceipt.d1Changed === false, 'Building Occurrence must not mutate publication or D1.');

assert(first.manifest.artifactType === 'canonical-liturgical-occurrences', 'Occurrence artifact type changed unexpectedly.');
assert(first.manifest.vaultLayer === 'canonical', 'Occurrence release must target canonical Vault.');
assert(first.manifest.occurrenceCount === 38, 'Reviewed Occurrence count changed and requires explicit review.');
assert(first.manifest.legacyBridgeCount === 38, 'Reviewed legacy bridge count changed and requires explicit review.');
assert(JSON.stringify(first.manifest.churches) === JSON.stringify(['church:roman-catholic']), 'Church coverage changed unexpectedly.');
assert(JSON.stringify(first.manifest.jurisdictions) === JSON.stringify(['jurisdiction:roman-catholic:pt']), 'Jurisdiction coverage changed unexpectedly.');
assert(JSON.stringify(first.manifest.years) === JSON.stringify([2026]), 'Year coverage changed unexpectedly.');
assert(first.manifest.runtimePublicationAllowed === false && first.manifest.productionMutationAllowed === false, 'Occurrence shadow must remain publication-safe.');
assert(first.manifest.semantics.annualDateIsAuthorityDriven === true && first.manifest.semantics.rankIsAuthorityDriven === true, 'Occurrence date/rank must remain authority-driven.');
assert(first.manifest.semantics.legacyBridgeIsNonCanonicalAndReadOnly === true, 'Legacy bridge must remain non-canonical/read-only.');
assert(first.manifest.d1Projection.status === 'equivalence-shadow-only' && first.manifest.d1Projection.mutationAllowed === false, 'Occurrence D1 projection must remain shadow-only.');

const expected = new Map([
  ['observance:mary-mother-of-god:roman-catholic', ['2026-01-01', 'solemnity', 'SOLENIDADE', 'rc:MaryMotherOfGod']],
  ['observance:thomas-aquinas:roman-catholic', ['2026-01-28', 'obligatory-memorial', 'MO', 'rc:StThomasAquinas']],
  ['observance:saint-joseph:roman-catholic', ['2026-03-19', 'solemnity', 'SOLENIDADE', 'rc:StJoseph']],
  ['observance:mark-evangelist:roman-catholic', ['2026-04-25', 'feast', 'FESTA', 'rc:StMarkEvangelist']],
  ['observance:catherine-siena:roman-catholic', ['2026-04-29', 'feast', 'FESTA', 'rc:StCatherineSiena']],
  ['observance:john-baptist-nativity:roman-catholic', ['2026-06-24', 'solemnity', 'SOLENIDADE', 'rc:NativityJohnBaptist']],
  ['observance:peter-paul:roman-catholic', ['2026-06-29', 'solemnity', 'SOLENIDADE', 'rc:StsPeterPaulAp']],
  ['observance:elizabeth-portugal:roman-catholic', ['2026-07-04', 'obligatory-memorial', 'MO', 'rc:StElizabethPortugal']],
  ['observance:benedict-nursia:roman-catholic', ['2026-07-11', 'feast', 'FESTA', 'rc:StBenedict']],
  ['observance:thomas-apostle:roman-catholic', ['2026-07-03', 'feast', 'FESTA', 'rc:StThomasAp']],
  ['observance:mary-magdalene:roman-catholic', ['2026-07-22', 'feast', 'FESTA', 'rc:StMaryMagdalene']],
  ['observance:bridget-sweden:roman-catholic', ['2026-07-23', 'feast', 'FESTA', 'rc:StBridget']],
  ['observance:james-greater-apostle:roman-catholic', ['2026-07-25', 'feast', 'FESTA', 'rc:StJamesAp']],
  ['observance:assumption-mary:roman-catholic', ['2026-08-15', 'solemnity', 'SOLENIDADE', 'rc:Assumption']],
  ['observance:matthew-apostle:roman-catholic', ['2026-09-21', 'feast', 'FESTA', 'rc:StMatthewEvangelist']],
  ['observance:immaculate-conception-mary:roman-catholic', ['2026-12-08', 'solemnity', 'SOLENIDADE', 'rc:ImmaculateConception']],
  ['observance:matthias-apostle:roman-catholic', ['2026-05-14', 'feast', 'FESTA', 'rc:StMatthias']],
  ['observance:bartholomew-apostle:roman-catholic', ['2026-08-24', 'feast', 'FESTA', 'rc:StBartholomewAp']],
  ['observance:simon-jude-apostles:roman-catholic', ['2026-10-28', 'feast', 'FESTA', 'rc:StSimonStJudeAp']],
  ['observance:andrew-apostle:roman-catholic', ['2026-11-30', 'feast', 'FESTA', 'rc:StAndrewAp']],
  ['observance:lawrence-rome:roman-catholic', ['2026-08-10', 'feast', 'FESTA', 'rc:StLawrenceDeacon']],
  ['observance:stephen-protomartyr:roman-catholic', ['2026-12-26', 'feast', 'FESTA', 'rc:StStephenProtomartyr']],
  ['observance:cyril-methodius:roman-catholic', ['2026-02-14', 'feast', 'FESTA', 'rc:StsCyrilMethodius']],
  ['observance:anthony-lisbon:roman-catholic', ['2026-06-13', 'feast', 'FESTA', 'rc:StAnthonyPadua']],
  ['observance:anthony-great:roman-catholic', ['2026-01-17', 'obligatory-memorial', 'MO', 'rc:StAnthonyEgypt']],
  ['observance:clare-assisi:roman-catholic', ['2026-08-11', 'obligatory-memorial', 'MO', 'rc:StClare']],
  ['observance:teresa-avila:roman-catholic', ['2026-10-15', 'obligatory-memorial', 'MO', 'rc:StTeresaJesus']],
  ['observance:augustine-hippo:roman-catholic', ['2026-08-28', 'obligatory-memorial', 'MO', 'rc:StAugustineHippo']],
  ['observance:jerome-stridon:roman-catholic', ['2026-09-30', 'obligatory-memorial', 'MO', 'rc:StJerome']],
  ['observance:therese-lisieux:roman-catholic', ['2026-10-01', 'obligatory-memorial', 'MO', 'rc:StThereseChildJesus']],
  ['observance:dominic-guzman:roman-catholic', ['2026-08-08', 'obligatory-memorial', 'MO', 'rc:StDominic']],
  ['observance:ignatius-loyola:roman-catholic', ['2026-07-31', 'obligatory-memorial', 'MO', 'rc:StIgnatiusLoyola']],
  ['observance:francis-xavier:roman-catholic', ['2026-12-03', 'obligatory-memorial', 'MO', 'rc:StFrancisXavier']],
  ['observance:john-cross:roman-catholic', ['2026-12-14', 'obligatory-memorial', 'MO', 'rc:StJohnCross']],
  ['observance:ambrose-milan:roman-catholic', ['2026-12-07', 'obligatory-memorial', 'MO', 'rc:StAmbrose']],
  ['observance:gregory-great:roman-catholic', ['2026-09-03', 'obligatory-memorial', 'MO', 'rc:StGregoryGreat']],
  ['observance:francis-de-sales:roman-catholic', ['2026-01-24', 'obligatory-memorial', 'MO', 'rc:StFrancisDeSales']],
  ['observance:alphonsus-liguori:roman-catholic', ['2026-08-01', 'obligatory-memorial', 'MO', 'rc:StAlphonsusMariaDeLiguori']]
]);
const bridgeByOccurrence = new Map(first.legacyOccurrenceBridges.map((item) => [item.occurrenceId, item]));

for (const occurrence of first.occurrences) {
  assert(occurrence.entityType === 'Occurrence', `${occurrence.occurrenceId} is not emitted as Occurrence.`);
  assert(occurrence.churchId === 'church:roman-catholic', `${occurrence.occurrenceId} changed Church.`);
  assert(occurrence.jurisdictionId === 'jurisdiction:roman-catholic:pt', `${occurrence.occurrenceId} changed Jurisdiction.`);
  assert(occurrence.calendarSystem === 'gregorian', `${occurrence.occurrenceId} changed calendar system.`);
  assert(occurrence.year === 2026, `${occurrence.occurrenceId} changed year.`);
  assert(occurrence.resolutionStatus === 'canonical-anchor', `${occurrence.occurrenceId} lost canonical-anchor status.`);
  const vector = expected.get(occurrence.observanceId);
  assert(vector, `${occurrence.occurrenceId} is not one of the reviewed semantic vectors.`);
  assert(occurrence.dateISO === vector[0], `${occurrence.occurrenceId} date drifted from reviewed SNL vector.`);
  assert(occurrence.rank === vector[1], `${occurrence.occurrenceId} rank drifted from reviewed SNL vector.`);
  assert(occurrence.sourceRankCode === vector[2], `${occurrence.occurrenceId} source rank code drifted.`);
  const bridge = bridgeByOccurrence.get(occurrence.occurrenceId);
  assert(bridge?.legacyObservanceId === vector[3], `${occurrence.occurrenceId} legacy bridge drifted.`);
  assert(bridge?.dateISO === occurrence.dateISO && bridge?.mutationAllowed === false, `${occurrence.occurrenceId} bridge is not exact/read-only.`);
}

assert(!first.occurrences.some((item) => item.observanceId === 'observance:joachim-anne:roman-catholic'), 'Joachim and Anne must not gain a fabricated Portugal 2026 Occurrence when the reviewed calendar has none.');

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

console.log(`Canonical Occurrence Vault release test passed: ${first.occurrences.length} Portugal 2026 shadow occurrences with reviewed SNL date/rank vectors, three distinct Marian solemnities share one Person without identity collapse, and Joachim/Anne remain correctly absent from the annual slice, deterministic root ${first.manifest.rootSha256}.`);

#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCanonicalRecognitionVaultRelease } from './build-canonical-recognition-manifest.mjs';

const root = process.cwd();
const recognitionPath = path.join(root, 'data', 'canonical-recognition-anchors.json');
const personPath = path.join(root, 'data', 'canonical-person-anchors.json');
const ecclesialPath = path.join(root, 'data', 'canonical-ecclesial-context-anchors.json');

function assert(condition, message) { if (!condition) throw new Error(message); }
function expectFailure(label, fn, expectedText) {
  let failed = false;
  try { fn(); } catch (error) {
    failed = true;
    assert(String(error?.message ?? error).includes(expectedText), `${label} failed for the wrong reason: ${String(error?.message ?? error)}`);
  }
  assert(failed, `${label} unexpectedly passed.`);
}

const [recognitionBytes, personBytes, ecclesialBytes] = await Promise.all([
  readFile(recognitionPath, 'utf8'),
  readFile(personPath, 'utf8'),
  readFile(ecclesialPath, 'utf8')
]);
const recognitionDataset = JSON.parse(recognitionBytes);
const personDataset = JSON.parse(personBytes);
const ecclesialDataset = JSON.parse(ecclesialBytes);
const build = (dataset, options = {}) => buildCanonicalRecognitionVaultRelease(dataset, personDataset, ecclesialDataset, options);

const first = build(recognitionDataset, { sourceBytes: recognitionBytes, sourceCommit: 'commit-a', generatedAt: '2026-08-22T00:00:00.000Z' });
const second = build(recognitionDataset, { sourceBytes: recognitionBytes, sourceCommit: 'commit-b', generatedAt: '2026-08-23T00:00:00.000Z' });
const reformattedBytes = `${JSON.stringify(recognitionDataset)}\n`;
const reformatted = build(recognitionDataset, { sourceBytes: reformattedBytes, sourceCommit: 'commit-c', generatedAt: '2026-08-24T00:00:00.000Z' });

assert(first.manifest.rootSha256 === second.manifest.rootSha256, 'Recognition root must be deterministic across runs.');
assert(first.manifest.rootSha256 === reformatted.manifest.rootSha256, 'Formatting-only source changes must not alter Recognition root.');
assert(JSON.stringify(first.manifest) === JSON.stringify(second.manifest), 'Recognition manifest must be deterministic for equal canonical semantics.');
assert(JSON.stringify(first.manifest) === JSON.stringify(reformatted.manifest), 'Formatting-only changes must not alter immutable Recognition manifest bytes.');
assert(first.buildReceipt.sourceCommit !== second.buildReceipt.sourceCommit, 'Run-specific commit belongs in the Recognition build receipt.');
assert(first.buildReceipt.generatedAt !== second.buildReceipt.generatedAt, 'Run-specific generatedAt belongs in the Recognition build receipt.');
assert(first.buildReceipt.sourceDatasetSha256 !== reformatted.buildReceipt.sourceDatasetSha256, 'Recognition build receipt must preserve source-byte provenance changes.');
assert(first.buildReceipt.publicationChanged === false && first.buildReceipt.d1Changed === false, 'Building Recognition must not publish or mutate D1.');

assert(first.manifest.artifactType === 'canonical-ecclesial-recognitions', 'Recognition artifact type changed unexpectedly.');
assert(first.manifest.vaultLayer === 'canonical', 'Recognition release must target canonical Vault.');
assert(first.manifest.recognitionCount === 5, 'Bootstrap Recognition count changed and requires explicit review.');
assert(first.manifest.personCoverageCount === 4, 'Bootstrap Recognition Person coverage changed unexpectedly.');
assert(JSON.stringify(first.manifest.churches) === JSON.stringify(['church:orthodox-church-america', 'church:roman-catholic']), 'Bootstrap Recognition canonical Churches changed unexpectedly.');
assert(first.manifest.runtimePublicationAllowed === false, 'Recognition Vault write must not imply runtime publication.');
assert(first.manifest.currentPointerPath === '/vault/canonical/recognitions/v1/current.json', 'Recognition current pointer path changed unexpectedly.');
assert(first.manifest.immutableReleaseRoot.endsWith(first.manifest.rootSha256), 'Recognition release root must be content-addressed.');
assert(first.manifest.deletionPolicy === 'tombstone-only', 'Recognition deletion must remain tombstone-only.');
assert(first.manifest.semantics.canonicalChurchReferenceRequired === true, 'Recognition must require canonical Church references.');
assert(first.manifest.semantics.evidenceMustMatchChurchAuthorityDomain === true, 'Recognition evidence must remain authority-isolated by Church domain.');
assert(first.manifest.semantics.recognitionSeparateFromPerson === true, 'Recognition must remain separate from Person.');
assert(first.manifest.semantics.recognitionSeparateFromObservance === true, 'Recognition must remain separate from Observance.');
assert(first.manifest.semantics.recognitionSeparateFromOccurrence === true, 'Recognition must remain separate from Occurrence.');
assert(first.manifest.semantics.recognitionStateSeparateFromRecognitionEvent === true, 'Recognition state must remain separate from historical recognition events.');
assert(first.manifest.semantics.oneChurchCannotEstablishAnotherChurchRecognition === true, 'Church authority isolation must remain explicit.');
assert(first.manifest.d1Projection.status === 'deferred', 'Recognition state must not be silently forced into sanctity_recognition_events.');

const recognitionIds = first.recognitions.map((item) => item.recognitionId);
assert(new Set(recognitionIds).size === recognitionIds.length, 'Recognition release contains duplicate IDs.');
assert(JSON.stringify(recognitionIds) === JSON.stringify([...recognitionIds].sort()), 'Recognition release must be deterministically sorted.');
assert(first.recognitions.filter((item) => item.personId === 'matthew-apostle').length === 2, 'Matthew must demonstrate one Person with separate Church-scoped Recognitions.');
assert(first.recognitions.some((item) => item.recognitionId === 'recognition:matthew-apostle:orthodox-church-america'), 'OCA Matthew Recognition lost its Church-specific identity.');

for (const recognition of first.recognitions) {
  assert(recognition.entityType === 'Recognition', `${recognition.recognitionId} is not emitted as Recognition.`);
  assert(recognition.churchId.startsWith('church:'), `${recognition.recognitionId} does not reference a canonical Church ID.`);
  assert(recognition.resolutionStatus === 'canonical-anchor', `${recognition.recognitionId} lost canonical-anchor status.`);
  assert(recognition.calendarMembershipImplied === false, `${recognition.recognitionId} incorrectly implies calendar membership.`);
  assert(recognition.observanceDateImplied === false, `${recognition.recognitionId} incorrectly implies an observance date.`);
  assert(recognition.deletionPolicy === 'tombstone-only', `${recognition.recognitionId} lost tombstone-only deletion.`);
  assert(Array.isArray(recognition.evidence) && recognition.evidence.length > 0, `${recognition.recognitionId} lost evidence.`);
  for (const forbidden of ['month', 'day', 'date', 'dateISO', 'feastDate', 'calendarSystem', 'rank', 'precedence']) {
    assert(!(forbidden in recognition), `${recognition.recognitionId} leaked ${forbidden} into Recognition.`);
  }
}

const unknownPerson = structuredClone(recognitionDataset);
unknownPerson.recognitions[0].personId = 'person-that-does-not-exist';
expectFailure('Unknown Person guard', () => build(unknownPerson), 'unknown canonical Person');

const unknownChurch = structuredClone(recognitionDataset);
unknownChurch.recognitions[0].churchId = 'church:not-reviewed';
expectFailure('Unknown Church guard', () => build(unknownChurch), 'unknown canonical Church');

const crossChurchEvidence = structuredClone(recognitionDataset);
crossChurchEvidence.recognitions[0].evidence[0].url = 'https://www.oca.org/saints/lives/2007/11/16/103313-apostle-and-evangelist-matthew';
expectFailure('Cross-Church evidence guard', () => build(crossChurchEvidence), 'outside canonical Church authority domains');

const leakedDate = structuredClone(recognitionDataset);
leakedDate.recognitions[0].feastDate = '09-21';
expectFailure('Recognition/Observance boundary guard', () => build(leakedDate), 'leaks observance/date field feastDate');

const duplicate = structuredClone(recognitionDataset);
duplicate.recognitions.push({ ...structuredClone(duplicate.recognitions[0]), id: 'recognition:matthew-apostle:roman-catholic:duplicate' });
expectFailure('Duplicate canonical Recognition state guard', () => build(duplicate), 'duplicates canonical Recognition state');

console.log(`Canonical Recognition Vault release test passed: ${first.recognitions.length} recognitions across ${first.manifest.personCoverageCount} people and ${first.manifest.churches.length} canonical Churches, deterministic root ${first.manifest.rootSha256}.`);

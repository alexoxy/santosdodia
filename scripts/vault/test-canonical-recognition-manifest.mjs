#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCanonicalRecognitionVaultRelease } from './build-canonical-recognition-manifest.mjs';

const root = process.cwd();
const recognitionPath = path.join(root, 'data', 'canonical-recognition-anchors.json');
const personPath = path.join(root, 'data', 'canonical-person-anchors.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

const [recognitionBytes, personBytes] = await Promise.all([
  readFile(recognitionPath, 'utf8'),
  readFile(personPath, 'utf8'),
]);
const recognitionDataset = JSON.parse(recognitionBytes);
const personDataset = JSON.parse(personBytes);

const first = buildCanonicalRecognitionVaultRelease(recognitionDataset, personDataset, {
  sourceBytes: recognitionBytes,
  sourceCommit: 'commit-a',
  generatedAt: '2026-08-22T00:00:00.000Z',
});
const second = buildCanonicalRecognitionVaultRelease(recognitionDataset, personDataset, {
  sourceBytes: recognitionBytes,
  sourceCommit: 'commit-b',
  generatedAt: '2026-08-23T00:00:00.000Z',
});
const reformattedBytes = `${JSON.stringify(recognitionDataset)}\n`;
const reformatted = buildCanonicalRecognitionVaultRelease(recognitionDataset, personDataset, {
  sourceBytes: reformattedBytes,
  sourceCommit: 'commit-c',
  generatedAt: '2026-08-24T00:00:00.000Z',
});

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
assert(JSON.stringify(first.manifest.churches) === JSON.stringify(['eastern-orthodox', 'roman-catholic']), 'Bootstrap Recognition churches changed unexpectedly.');
assert(first.manifest.runtimePublicationAllowed === false, 'Recognition Vault write must not imply runtime publication.');
assert(first.manifest.currentPointerPath === '/vault/canonical/recognitions/v1/current.json', 'Recognition current pointer path changed unexpectedly.');
assert(first.manifest.immutableReleaseRoot.endsWith(first.manifest.rootSha256), 'Recognition release root must be content-addressed.');
assert(first.manifest.deletionPolicy === 'tombstone-only', 'Recognition deletion must remain tombstone-only.');
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

for (const recognition of first.recognitions) {
  assert(recognition.entityType === 'Recognition', `${recognition.recognitionId} is not emitted as Recognition.`);
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
expectFailure('Unknown Person guard', () => buildCanonicalRecognitionVaultRelease(unknownPerson, personDataset), 'unknown canonical Person');

const leakedDate = structuredClone(recognitionDataset);
leakedDate.recognitions[0].feastDate = '09-21';
expectFailure('Recognition/Observance boundary guard', () => buildCanonicalRecognitionVaultRelease(leakedDate, personDataset), 'leaks observance/date field feastDate');

const crossChurchDuplicate = structuredClone(recognitionDataset);
crossChurchDuplicate.recognitions.push({
  ...structuredClone(crossChurchDuplicate.recognitions[0]),
  id: 'recognition:matthew-apostle:roman-catholic:duplicate',
});
expectFailure('Duplicate canonical Recognition state guard', () => buildCanonicalRecognitionVaultRelease(crossChurchDuplicate, personDataset), 'duplicates canonical Recognition state');

console.log(`Canonical Recognition Vault release test passed: ${first.recognitions.length} recognitions across ${first.manifest.personCoverageCount} people and ${first.manifest.churches.length} Churches, deterministic root ${first.manifest.rootSha256}.`);

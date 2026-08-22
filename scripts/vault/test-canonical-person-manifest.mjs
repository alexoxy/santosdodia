#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCanonicalPersonVaultRelease } from './build-canonical-person-manifest.mjs';

const root = process.cwd();
const sourcePath = path.join(root, 'data', 'canonical-person-anchors.json');
const runtimePath = path.join(root, 'data', 'canonical-person-profiles.ts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sourceBytes = await readFile(sourcePath, 'utf8');
const dataset = JSON.parse(sourceBytes);
const first = buildCanonicalPersonVaultRelease(dataset, {
  sourceBytes,
  sourceCommit: 'commit-a',
  generatedAt: '2026-08-22T00:00:00.000Z',
});
const second = buildCanonicalPersonVaultRelease(dataset, {
  sourceBytes,
  sourceCommit: 'commit-b',
  generatedAt: '2026-08-23T00:00:00.000Z',
});

assert(first.manifest.rootSha256 === second.manifest.rootSha256, 'Canonical Person root hash must be content-deterministic across runs/commits.');
assert(JSON.stringify(first.manifest) === JSON.stringify(second.manifest), 'Canonical manifest bytes must remain deterministic for the same content root.');
assert(first.buildReceipt.sourceCommit !== second.buildReceipt.sourceCommit, 'Run-specific source commit must live in the build receipt.');
assert(first.buildReceipt.generatedAt !== second.buildReceipt.generatedAt, 'Run-specific generatedAt must live in the build receipt.');
assert(!('sourceCommit' in first.manifest), 'Immutable canonical manifest must not contain a run-specific sourceCommit.');
assert(!('generatedAt' in first.manifest), 'Immutable canonical manifest must not contain a run-specific generatedAt.');
assert(first.buildReceipt.rootSha256 === first.manifest.rootSha256, 'Build receipt must point to the immutable canonical root it generated.');
assert(first.buildReceipt.publicationChanged === false, 'Building a canonical release must not imply runtime publication.');
assert(first.manifest.peopleCount === dataset.people.length, 'Canonical Person manifest count must match the reviewed anchor dataset.');
assert(first.manifest.peopleCount === 13, 'The current reviewed canonical Person anchor baseline unexpectedly changed; review the migration explicitly.');
assert(first.people.length === first.legacyObservanceBridges.length, 'Every migrated Person anchor must retain one explicit legacy observance bridge during compatibility migration.');
assert(first.manifest.vaultLayer === 'canonical', 'Canonical Person manifest must target the canonical Vault layer.');
assert(first.manifest.runtimePublicationAllowed === false, 'Writing a canonical Vault release must not itself publish runtime content.');
assert(first.manifest.deletionPolicy === 'tombstone-only', 'Canonical Person identities must use tombstone-only deletion.');
assert(first.manifest.immutableReleaseRoot.endsWith(first.manifest.rootSha256), 'Immutable canonical release path must be content-addressed by root hash.');
assert(!first.manifest.immutableReleaseRoot.includes('/slots/'), 'Canonical Person releases must not use the legacy fixed-ring slot model.');
assert(first.manifest.currentPointerPath === '/vault/canonical/people/v1/current.json', 'Canonical Person current pointer path changed unexpectedly.');
assert(first.manifest.semantics.personSeparateFromRecognition === true, 'Person must remain separate from Recognition.');
assert(first.manifest.semantics.personSeparateFromObservance === true, 'Person must remain separate from Observance.');
assert(first.manifest.semantics.localizedNameSeparateFromIdentityKey === true, 'Localized names must remain projections, not identity keys.');
assert(first.manifest.semantics.legacyBridgeIsCanonicalSemantics === false, 'Legacy observance bridge must never become canonical Person semantics.');

const ids = first.people.map((person) => person.personId);
assert(new Set(ids).size === ids.length, 'Canonical Person release contains duplicate Person IDs.');
assert(JSON.stringify(ids) === JSON.stringify([...ids].sort()), 'Canonical Person release must be deterministically sorted by Person ID.');
for (const person of first.people) {
  assert(person.entityType === 'Person', `${person.personId} is not emitted as a Person entity.`);
  assert(person.identityStatus === 'canonical-anchor', `${person.personId} lost canonical-anchor status.`);
  assert(person.deletionPolicy === 'tombstone-only', `${person.personId} does not use tombstone-only deletion.`);
  assert(!('category' in person), `${person.personId} leaked legacy liturgical/category semantics into the Person entity.`);
  assert(!('primaryObservanceId' in person), `${person.personId} leaked primaryObservanceId into the Person identity.`);
  for (const locale of ['en', 'pt', 'es', 'it']) {
    assert(typeof person.localizedNames?.[locale] === 'string' && person.localizedNames[locale].length > 0, `${person.personId} is missing ${locale} localized identity name.`);
  }
}
for (const bridge of first.legacyObservanceBridges) {
  assert(bridge.canonicalSemantics === false, `${bridge.personId} legacy bridge incorrectly claims canonical semantics.`);
  assert(bridge.relationType === 'legacy-primary-observance-bridge', `${bridge.personId} legacy bridge relation changed unexpectedly.`);
}

const runtimeSource = await readFile(runtimePath, 'utf8');
assert(runtimeSource.includes("import personAnchorDataset from './canonical-person-anchors.json'"), 'Runtime canonical Person profiles no longer use the deterministic anchor dataset.');
assert(!runtimeSource.includes('CANONICAL_PERSON_ANCHORS: CanonicalPersonAnchor[] = ['), 'Canonical Person anchors were duplicated back into TypeScript.');

console.log(`Canonical Person Vault release test passed: ${first.people.length} people, deterministic manifest root ${first.manifest.rootSha256}.`);

#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from '../dropbox/oauth.mjs';
import {
  assert,
  dropboxContentHash,
  sha256,
  uploadCanonicalVaultRelease,
} from './canonical-dropbox-vault.mjs';

const CANONICAL_FILES = ['manifest.json', 'people.json', 'legacy-observance-bridges.json'];
const ROLLBACK_BASE = '/vault/rollback/canonical/people/v1';

export { dropboxContentHash };

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function flag(name, fallback = false) {
  const value = argument(name, null);
  if (value === null) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} must be true or false.`);
}

export async function loadCanonicalPersonRelease(inputRoot) {
  const root = path.resolve(inputRoot);
  const fileBytes = Object.fromEntries(await Promise.all(CANONICAL_FILES.map(async (name) => [name, await readFile(path.join(root, name))])));
  const manifest = JSON.parse(fileBytes['manifest.json'].toString('utf8'));
  const people = JSON.parse(fileBytes['people.json'].toString('utf8'));
  const bridges = JSON.parse(fileBytes['legacy-observance-bridges.json'].toString('utf8'));
  const buildReceiptBytes = await readFile(path.join(root, 'build-receipt.json'));
  const buildReceipt = JSON.parse(buildReceiptBytes.toString('utf8'));

  assert(manifest?.schemaVersion === 1 && manifest?.artifactType === 'canonical-person-identities', 'Unsupported canonical Person manifest.');
  assert(manifest?.vaultLayer === 'canonical', 'Canonical Person manifest targets the wrong Vault layer.');
  assert(manifest?.runtimePublicationAllowed === false, 'Canonical Vault write must not imply runtime publication.');
  assert(manifest?.deletionPolicy === 'tombstone-only', 'Canonical Person deletion policy must remain tombstone-only.');
  assert(Array.isArray(people) && people.length === manifest.peopleCount, 'Canonical Person people count mismatch.');
  assert(Array.isArray(bridges) && bridges.length === manifest.legacyBridgeCount, 'Canonical Person bridge count mismatch.');
  assert(buildReceipt?.rootSha256 === manifest.rootSha256, 'Build receipt root differs from canonical manifest.');
  assert(buildReceipt?.publicationChanged === false, 'Build receipt unexpectedly claims publication changed.');

  const stablePayload = {
    schemaVersion: 1,
    artifactType: 'canonical-person-identities',
    identityModelVersion: manifest.identityModelVersion,
    people,
    legacyObservanceBridges: bridges,
  };
  const calculatedRoot = sha256(JSON.stringify(stablePayload));
  assert(calculatedRoot === manifest.rootSha256, 'Canonical Person release root hash does not match its payload.');
  assert(manifest.immutableReleaseRoot === `/vault/canonical/people/v1/releases/${calculatedRoot}`, 'Canonical Person immutable release path is not content-addressed.');
  assert(manifest.currentPointerPath === '/vault/canonical/people/v1/current.json', 'Canonical Person current pointer path changed unexpectedly.');

  return { manifest, people, bridges, fileBytes, buildReceipt, buildReceiptBytes };
}

function buildPersonPointer(release, { previousRootSha256 = null, rollbackPointerPath = null, transitionIntentPath, transitionCommitPath } = {}) {
  const { manifest, fileBytes } = release;
  return {
    schemaVersion: 1,
    pointerType: 'canonical-current',
    artifactType: manifest.artifactType,
    identityModelVersion: manifest.identityModelVersion,
    releaseId: manifest.releaseId,
    rootSha256: manifest.rootSha256,
    immutableReleaseRoot: manifest.immutableReleaseRoot,
    manifestSha256: sha256(fileBytes['manifest.json']),
    peopleCount: manifest.peopleCount,
    deletionPolicy: manifest.deletionPolicy,
    previousRootSha256,
    rollbackPointerPath,
    transitionIntentPath,
    transitionCommitPath,
  };
}

function assertPersonPointerMatchesRelease(pointer, release) {
  assert(pointer?.pointerType === 'canonical-current' && pointer?.artifactType === release.manifest.artifactType, 'Existing canonical Person current pointer has incompatible semantics.');
  assert(pointer.identityModelVersion === release.manifest.identityModelVersion, 'Existing current pointer identity model differs from the canonical release.');
  assert(pointer.releaseId === release.manifest.releaseId, 'Existing current pointer releaseId differs from the canonical release.');
  assert(pointer.rootSha256 === release.manifest.rootSha256, 'Existing current pointer root differs from the canonical release.');
  assert(pointer.immutableReleaseRoot === release.manifest.immutableReleaseRoot, 'Existing current pointer immutable root differs from the canonical release.');
  assert(pointer.manifestSha256 === sha256(release.fileBytes['manifest.json']), 'Existing current pointer manifest hash differs from the canonical release.');
  assert(pointer.peopleCount === release.manifest.peopleCount, 'Existing current pointer people count differs from the canonical release.');
  assert(pointer.deletionPolicy === release.manifest.deletionPolicy, 'Existing current pointer deletion policy differs from the canonical release.');
  assert(typeof pointer.transitionIntentPath === 'string' && typeof pointer.transitionCommitPath === 'string', 'Existing current pointer is missing transition receipt paths.');
}

export async function uploadCanonicalPersonRelease({ inputRoot, token, fetchImpl = globalThis.fetch, promoteCurrent = false } = {}) {
  assert(inputRoot, 'Canonical Person Vault inputRoot is required.');
  const release = await loadCanonicalPersonRelease(inputRoot);
  return uploadCanonicalVaultRelease({
    release,
    canonicalFiles: CANONICAL_FILES,
    rollbackBase: ROLLBACK_BASE,
    buildPointer: buildPersonPointer,
    assertPointerMatchesRelease: assertPersonPointerMatchesRelease,
    artifactLabel: 'canonical Person Vault',
    token,
    fetchImpl,
    promoteCurrent,
  });
}

async function main() {
  const inputRoot = argument('--input');
  if (!inputRoot) throw new Error('--input is required.');
  const promoteCurrent = flag('--promote-current', false);
  const dryRun = flag('--dry-run', false);
  const release = await loadCanonicalPersonRelease(inputRoot);
  if (dryRun) {
    process.stdout.write(`${JSON.stringify({
      dryRun: true,
      releaseId: release.manifest.releaseId,
      rootSha256: release.manifest.rootSha256,
      immutableReleaseRoot: release.manifest.immutableReleaseRoot,
      canonicalFiles: CANONICAL_FILES,
      promoteCurrent,
      currentPointerPath: release.manifest.currentPointerPath,
      dropboxWritePerformed: false,
    }, null, 2)}\n`);
    return;
  }
  const token = await refreshDropboxAccessToken();
  const result = await uploadCanonicalPersonRelease({ inputRoot, token, promoteCurrent });
  process.stdout.write(`${JSON.stringify({ ...result, dropboxWritePerformed: true }, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

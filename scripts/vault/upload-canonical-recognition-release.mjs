#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from '../dropbox/oauth.mjs';
import {
  assert,
  sha256,
  uploadCanonicalVaultRelease,
} from './canonical-dropbox-vault.mjs';

const CANONICAL_FILES = ['manifest.json', 'recognitions.json'];
const ROLLBACK_BASE = '/vault/rollback/canonical/recognitions/v1';

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

export async function loadCanonicalRecognitionRelease(inputRoot) {
  const root = path.resolve(inputRoot);
  const fileBytes = Object.fromEntries(await Promise.all(CANONICAL_FILES.map(async (name) => [name, await readFile(path.join(root, name))])));
  const manifest = JSON.parse(fileBytes['manifest.json'].toString('utf8'));
  const recognitions = JSON.parse(fileBytes['recognitions.json'].toString('utf8'));
  const buildReceiptBytes = await readFile(path.join(root, 'build-receipt.json'));
  const buildReceipt = JSON.parse(buildReceiptBytes.toString('utf8'));

  assert(manifest?.schemaVersion === 1 && manifest?.artifactType === 'canonical-ecclesial-recognitions', 'Unsupported canonical Recognition manifest.');
  assert(manifest?.vaultLayer === 'canonical', 'Canonical Recognition manifest targets the wrong Vault layer.');
  assert(manifest?.runtimePublicationAllowed === false, 'Canonical Recognition Vault write must not imply runtime publication.');
  assert(manifest?.deletionPolicy === 'tombstone-only', 'Canonical Recognition deletion policy must remain tombstone-only.');
  assert(Array.isArray(recognitions) && recognitions.length === manifest.recognitionCount, 'Canonical Recognition count mismatch.');
  assert(buildReceipt?.rootSha256 === manifest.rootSha256, 'Recognition build receipt root differs from canonical manifest.');
  assert(buildReceipt?.publicationChanged === false && buildReceipt?.d1Changed === false, 'Recognition build receipt unexpectedly claims runtime or D1 mutation.');

  const stablePayload = {
    schemaVersion: 1,
    artifactType: 'canonical-ecclesial-recognitions',
    recognitionModelVersion: manifest.recognitionModelVersion,
    recognitions,
  };
  const calculatedRoot = sha256(JSON.stringify(stablePayload));
  assert(calculatedRoot === manifest.rootSha256, 'Canonical Recognition release root hash does not match its payload.');
  assert(manifest.immutableReleaseRoot === `/vault/canonical/recognitions/v1/releases/${calculatedRoot}`, 'Canonical Recognition immutable release path is not content-addressed.');
  assert(manifest.currentPointerPath === '/vault/canonical/recognitions/v1/current.json', 'Canonical Recognition current pointer path changed unexpectedly.');

  return { manifest, recognitions, fileBytes, buildReceipt, buildReceiptBytes };
}

function buildRecognitionPointer(release, { previousRootSha256 = null, rollbackPointerPath = null, transitionIntentPath, transitionCommitPath } = {}) {
  const { manifest, fileBytes } = release;
  return {
    schemaVersion: 1,
    pointerType: 'canonical-current',
    artifactType: manifest.artifactType,
    recognitionModelVersion: manifest.recognitionModelVersion,
    releaseId: manifest.releaseId,
    rootSha256: manifest.rootSha256,
    immutableReleaseRoot: manifest.immutableReleaseRoot,
    manifestSha256: sha256(fileBytes['manifest.json']),
    recognitionCount: manifest.recognitionCount,
    personCoverageCount: manifest.personCoverageCount,
    churches: manifest.churches,
    deletionPolicy: manifest.deletionPolicy,
    previousRootSha256,
    rollbackPointerPath,
    transitionIntentPath,
    transitionCommitPath,
  };
}

function assertRecognitionPointerMatchesRelease(pointer, release) {
  const { manifest, fileBytes } = release;
  assert(pointer?.pointerType === 'canonical-current' && pointer?.artifactType === manifest.artifactType, 'Existing canonical Recognition current pointer has incompatible semantics.');
  assert(pointer.recognitionModelVersion === manifest.recognitionModelVersion, 'Existing current pointer Recognition model differs from the canonical release.');
  assert(pointer.releaseId === manifest.releaseId, 'Existing Recognition current pointer releaseId differs from the canonical release.');
  assert(pointer.rootSha256 === manifest.rootSha256, 'Existing Recognition current pointer root differs from the canonical release.');
  assert(pointer.immutableReleaseRoot === manifest.immutableReleaseRoot, 'Existing Recognition current pointer immutable root differs from the canonical release.');
  assert(pointer.manifestSha256 === sha256(fileBytes['manifest.json']), 'Existing Recognition current pointer manifest hash differs from the canonical release.');
  assert(pointer.recognitionCount === manifest.recognitionCount, 'Existing Recognition current pointer count differs from the canonical release.');
  assert(pointer.personCoverageCount === manifest.personCoverageCount, 'Existing Recognition current pointer Person coverage differs from the canonical release.');
  assert(JSON.stringify(pointer.churches) === JSON.stringify(manifest.churches), 'Existing Recognition current pointer Church coverage differs from the canonical release.');
  assert(pointer.deletionPolicy === manifest.deletionPolicy, 'Existing Recognition current pointer deletion policy differs from the canonical release.');
  assert(typeof pointer.transitionIntentPath === 'string' && typeof pointer.transitionCommitPath === 'string', 'Existing Recognition current pointer is missing transition receipt paths.');
}

export async function uploadCanonicalRecognitionRelease({ inputRoot, token, fetchImpl = globalThis.fetch, promoteCurrent = false } = {}) {
  assert(inputRoot, 'Canonical Recognition Vault inputRoot is required.');
  const release = await loadCanonicalRecognitionRelease(inputRoot);
  return uploadCanonicalVaultRelease({
    release,
    canonicalFiles: CANONICAL_FILES,
    rollbackBase: ROLLBACK_BASE,
    buildPointer: buildRecognitionPointer,
    assertPointerMatchesRelease: assertRecognitionPointerMatchesRelease,
    artifactLabel: 'canonical Recognition Vault',
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
  const release = await loadCanonicalRecognitionRelease(inputRoot);
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
      d1WritePerformed: false,
      runtimePublicationChanged: false,
    }, null, 2)}\n`);
    return;
  }
  const token = await refreshDropboxAccessToken();
  const result = await uploadCanonicalRecognitionRelease({ inputRoot, token, promoteCurrent });
  process.stdout.write(`${JSON.stringify({
    ...result,
    dropboxWritePerformed: true,
    d1WritePerformed: false,
    runtimePublicationChanged: false,
  }, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

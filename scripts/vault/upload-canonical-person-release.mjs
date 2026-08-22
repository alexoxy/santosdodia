#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from '../dropbox/oauth.mjs';

const DROPBOX_CONTENT_BLOCK_BYTES = 4 * 1024 * 1024;
const CANONICAL_FILES = ['manifest.json', 'people.json', 'legacy-observance-bridges.json'];

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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function dropboxContentHash(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  const aggregate = createHash('sha256');
  for (let offset = 0; offset < buffer.length; offset += DROPBOX_CONTENT_BLOCK_BYTES) {
    aggregate.update(createHash('sha256').update(buffer.subarray(offset, offset + DROPBOX_CONTENT_BLOCK_BYTES)).digest());
  }
  return aggregate.digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function errorSummary(value) {
  return value?.error_summary ?? value?.error_description ?? value?.error?.['.tag'] ?? 'unknown_error';
}

async function jsonResponse(response, operation, { allowNotFound = false } = {}) {
  const text = await response.text();
  let value = {};
  if (text) {
    try { value = JSON.parse(text); }
    catch { throw new Error(`${operation} returned invalid JSON (HTTP ${response.status}).`); }
  }
  if (response.ok) return value;
  const summary = errorSummary(value);
  if (allowNotFound && response.status === 409 && /(?:^|\/)not_found(?:\/|$)/u.test(summary)) return null;
  throw new Error(`${operation} failed (HTTP ${response.status}): ${summary}`);
}

async function metadata(fetchImpl, token, remotePath) {
  const response = await fetchImpl('https://api.dropboxapi.com/2/files/get_metadata', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: remotePath, include_deleted: false }),
  });
  return jsonResponse(response, `Dropbox metadata ${remotePath}`, { allowNotFound: true });
}

async function downloadBytes(fetchImpl, token, remotePath) {
  const response = await fetchImpl('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Dropbox-API-Arg': JSON.stringify({ path: remotePath }) },
  });
  if (response.status === 409) {
    const text = await response.text();
    let value = {};
    try { value = text ? JSON.parse(text) : {}; } catch { value = {}; }
    if (/(?:^|\/)not_found(?:\/|$)/u.test(errorSummary(value))) return null;
    throw new Error(`Dropbox download ${remotePath} failed (HTTP 409): ${errorSummary(value)}`);
  }
  if (!response.ok) throw new Error(`Dropbox download ${remotePath} failed (HTTP ${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadBytes(fetchImpl, token, remotePath, bytes, mode) {
  const response = await fetchImpl('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: remotePath,
        mode,
        autorename: false,
        mute: true,
        strict_conflict: mode === 'add',
      }),
    },
    body: bytes,
  });
  return jsonResponse(response, `Dropbox upload ${remotePath}`);
}

async function ensureImmutableFile(fetchImpl, token, remotePath, bytes) {
  const expectedHash = dropboxContentHash(bytes);
  const existing = await metadata(fetchImpl, token, remotePath);
  if (existing) {
    assert(existing['.tag'] === 'file', `${remotePath} exists but is not a file.`);
    assert(existing.size === bytes.length, `${remotePath} exists with a different size; immutable release conflict.`);
    assert(existing.content_hash === expectedHash, `${remotePath} exists with different content; immutable release conflict.`);
    return { path: remotePath, status: 'already-identical', contentHash: expectedHash, bytes: bytes.length };
  }
  const created = await uploadBytes(fetchImpl, token, remotePath, bytes, 'add');
  assert(created.size === bytes.length, `${remotePath} upload size verification failed.`);
  assert(created.content_hash === expectedHash, `${remotePath} upload content-hash verification failed.`);
  return { path: remotePath, status: 'created', contentHash: expectedHash, bytes: bytes.length };
}

async function writeMutablePointer(fetchImpl, token, remotePath, bytes) {
  const uploaded = await uploadBytes(fetchImpl, token, remotePath, bytes, 'overwrite');
  assert(uploaded.size === bytes.length, `${remotePath} pointer upload size verification failed.`);
  assert(uploaded.content_hash === dropboxContentHash(bytes), `${remotePath} pointer content-hash verification failed.`);
  const readBack = await downloadBytes(fetchImpl, token, remotePath);
  assert(readBack && readBack.equals(bytes), `${remotePath} pointer read-back verification failed.`);
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

function transitionPaths(fromRootSha256, toRootSha256) {
  const from = fromRootSha256 ?? 'none';
  const base = '/vault/rollback/canonical/people/v1';
  return {
    intentPath: `${base}/transition-intents/${from}--${toRootSha256}.json`,
    commitPath: `${base}/transition-commits/${from}--${toRootSha256}.json`,
  };
}

function currentPointerFor(release, { previousRootSha256 = null, rollbackPointerPath = null, transitionIntentPath, transitionCommitPath } = {}) {
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

function transitionIntentFor(previousBytes, nextPointer) {
  return {
    schemaVersion: 1,
    receiptType: 'canonical-current-transition-intent',
    artifactType: nextPointer.artifactType,
    fromRootSha256: nextPointer.previousRootSha256,
    toRootSha256: nextPointer.rootSha256,
    fromPointerSha256: previousBytes ? sha256(previousBytes) : null,
    toPointerSha256: sha256(jsonBytes(nextPointer)),
    rollbackPointerPath: nextPointer.rollbackPointerPath,
    currentPointerPath: '/vault/canonical/people/v1/current.json',
    committed: false,
    publicationChanged: false,
  };
}

function transitionCommitFor(nextPointer) {
  return {
    schemaVersion: 1,
    receiptType: 'canonical-current-transition-commit',
    artifactType: nextPointer.artifactType,
    fromRootSha256: nextPointer.previousRootSha256,
    toRootSha256: nextPointer.rootSha256,
    transitionIntentPath: nextPointer.transitionIntentPath,
    rollbackPointerPath: nextPointer.rollbackPointerPath,
    currentPointerPath: '/vault/canonical/people/v1/current.json',
    currentPointerSha256: sha256(jsonBytes(nextPointer)),
    committed: true,
    publicationChanged: false,
  };
}

function assertPointerMatchesRelease(pointer, release) {
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

async function ensureTransitionReceipts(fetchImpl, token, previousBytes, nextPointer) {
  const expectedPaths = transitionPaths(nextPointer.previousRootSha256, nextPointer.rootSha256);
  assert(nextPointer.transitionIntentPath === expectedPaths.intentPath, 'Current pointer transition intent path is not deterministic.');
  assert(nextPointer.transitionCommitPath === expectedPaths.commitPath, 'Current pointer transition commit path is not deterministic.');
  const intent = transitionIntentFor(previousBytes, nextPointer);
  const commit = transitionCommitFor(nextPointer);
  const intentResult = await ensureImmutableFile(fetchImpl, token, nextPointer.transitionIntentPath, jsonBytes(intent));
  const commitResult = await ensureImmutableFile(fetchImpl, token, nextPointer.transitionCommitPath, jsonBytes(commit));
  return { intentResult, commitResult };
}

async function previousBytesForCurrentPointer(fetchImpl, token, pointer) {
  if (pointer.previousRootSha256 === null) {
    assert(pointer.rollbackPointerPath === null, 'Initial current pointer unexpectedly declares rollback history.');
    return null;
  }
  assert(typeof pointer.rollbackPointerPath === 'string' && pointer.rollbackPointerPath.startsWith('/vault/rollback/canonical/people/v1/current-history/'), 'Current pointer with previous root is missing a valid rollback pointer path.');
  const previousBytes = await downloadBytes(fetchImpl, token, pointer.rollbackPointerPath);
  assert(previousBytes, 'Current pointer rollback history is missing; refusing to treat transition as complete.');
  let previousPointer;
  try { previousPointer = JSON.parse(previousBytes.toString('utf8')); }
  catch { throw new Error('Rollback pointer history is not valid JSON.'); }
  assert(previousPointer?.pointerType === 'canonical-current' && previousPointer?.rootSha256 === pointer.previousRootSha256, 'Rollback pointer history does not match current.previousRootSha256.');
  return previousBytes;
}

export async function uploadCanonicalPersonRelease({ inputRoot, token, fetchImpl = globalThis.fetch, promoteCurrent = false } = {}) {
  assert(inputRoot, 'Canonical Person Vault inputRoot is required.');
  assert(token, 'Dropbox access token is required for a Vault write.');
  assert(typeof fetchImpl === 'function', 'A fetch implementation is required.');
  const release = await loadCanonicalPersonRelease(inputRoot);
  const immutableResults = [];

  for (const name of CANONICAL_FILES) {
    immutableResults.push(await ensureImmutableFile(fetchImpl, token, `${release.manifest.immutableReleaseRoot}/${name}`, release.fileBytes[name]));
  }

  for (const result of immutableResults) {
    const checked = await metadata(fetchImpl, token, result.path);
    assert(checked?.['.tag'] === 'file' && checked.size === result.bytes && checked.content_hash === result.contentHash, `${result.path} failed post-write immutable verification.`);
  }

  const pointerResult = { status: 'not-requested', path: release.manifest.currentPointerPath };
  if (!promoteCurrent) return { releaseId: release.manifest.releaseId, rootSha256: release.manifest.rootSha256, immutableResults, pointer: pointerResult };

  const previousCurrentBytes = await downloadBytes(fetchImpl, token, release.manifest.currentPointerPath);
  let previousPointer = null;
  if (previousCurrentBytes) {
    try { previousPointer = JSON.parse(previousCurrentBytes.toString('utf8')); }
    catch { throw new Error('Existing canonical Person current pointer is not valid JSON; refusing to overwrite it.'); }
    assert(previousPointer?.pointerType === 'canonical-current' && previousPointer?.artifactType === release.manifest.artifactType, 'Existing canonical Person current pointer has incompatible semantics.');

    if (previousPointer.rootSha256 === release.manifest.rootSha256) {
      assertPointerMatchesRelease(previousPointer, release);
      const transitionPreviousBytes = await previousBytesForCurrentPointer(fetchImpl, token, previousPointer);
      const receipts = await ensureTransitionReceipts(fetchImpl, token, transitionPreviousBytes, previousPointer);
      return {
        releaseId: release.manifest.releaseId,
        rootSha256: release.manifest.rootSha256,
        immutableResults,
        pointer: {
          status: 'already-current',
          path: release.manifest.currentPointerPath,
          rootSha256: previousPointer.rootSha256,
          previousRootSha256: previousPointer.previousRootSha256,
          rollbackPointerPath: previousPointer.rollbackPointerPath,
          transitionIntentPath: previousPointer.transitionIntentPath,
          transitionCommitPath: previousPointer.transitionCommitPath,
          transitionReceipts: receipts,
        },
      };
    }
  }

  let rollbackPointerPath = null;
  if (previousCurrentBytes) {
    rollbackPointerPath = `/vault/rollback/canonical/people/v1/current-history/${sha256(previousCurrentBytes)}.json`;
    await ensureImmutableFile(fetchImpl, token, rollbackPointerPath, previousCurrentBytes);
  }

  const previousRootSha256 = previousPointer?.rootSha256 ?? null;
  const paths = transitionPaths(previousRootSha256, release.manifest.rootSha256);
  const nextPointer = currentPointerFor(release, {
    previousRootSha256,
    rollbackPointerPath,
    transitionIntentPath: paths.intentPath,
    transitionCommitPath: paths.commitPath,
  });
  const nextPointerBytes = jsonBytes(nextPointer);
  const intent = transitionIntentFor(previousCurrentBytes, nextPointer);

  // Intent is explicitly uncommitted. If pointer promotion fails, no receipt can
  // falsely claim that current moved.
  await ensureImmutableFile(fetchImpl, token, paths.intentPath, jsonBytes(intent));
  await writeMutablePointer(fetchImpl, token, release.manifest.currentPointerPath, nextPointerBytes);

  // The commit receipt is written only after current.json has been read back and
  // verified. A rerun can reconstruct a missing commit receipt from current.
  const commit = transitionCommitFor(nextPointer);
  await ensureImmutableFile(fetchImpl, token, paths.commitPath, jsonBytes(commit));

  return {
    releaseId: release.manifest.releaseId,
    rootSha256: release.manifest.rootSha256,
    immutableResults,
    pointer: {
      status: previousPointer ? 'advanced' : 'initialized',
      path: release.manifest.currentPointerPath,
      rootSha256: nextPointer.rootSha256,
      previousRootSha256,
      rollbackPointerPath,
      transitionIntentPath: paths.intentPath,
      transitionCommitPath: paths.commitPath,
    },
  };
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

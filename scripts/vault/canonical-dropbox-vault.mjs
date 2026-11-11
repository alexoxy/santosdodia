#!/usr/bin/env node

import { createHash } from 'node:crypto';

const DROPBOX_CONTENT_BLOCK_BYTES = 4 * 1024 * 1024;

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function dropboxContentHash(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  const aggregate = createHash('sha256');
  for (let offset = 0; offset < buffer.length; offset += DROPBOX_CONTENT_BLOCK_BYTES) {
    aggregate.update(createHash('sha256').update(buffer.subarray(offset, offset + DROPBOX_CONTENT_BLOCK_BYTES)).digest());
  }
  return aggregate.digest('hex');
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

function transitionPaths(rollbackBase, fromRootSha256, toRootSha256) {
  const from = fromRootSha256 ?? 'none';
  return {
    intentPath: `${rollbackBase}/transition-intents/${from}--${toRootSha256}.json`,
    commitPath: `${rollbackBase}/transition-commits/${from}--${toRootSha256}.json`,
  };
}

function transitionIntentFor(previousBytes, nextPointer, currentPointerPath) {
  return {
    schemaVersion: 1,
    receiptType: 'canonical-current-transition-intent',
    artifactType: nextPointer.artifactType,
    fromRootSha256: nextPointer.previousRootSha256,
    toRootSha256: nextPointer.rootSha256,
    fromPointerSha256: previousBytes ? sha256(previousBytes) : null,
    toPointerSha256: sha256(jsonBytes(nextPointer)),
    rollbackPointerPath: nextPointer.rollbackPointerPath,
    currentPointerPath,
    committed: false,
    publicationChanged: false,
  };
}

function transitionCommitFor(nextPointer, currentPointerPath) {
  return {
    schemaVersion: 1,
    receiptType: 'canonical-current-transition-commit',
    artifactType: nextPointer.artifactType,
    fromRootSha256: nextPointer.previousRootSha256,
    toRootSha256: nextPointer.rootSha256,
    transitionIntentPath: nextPointer.transitionIntentPath,
    rollbackPointerPath: nextPointer.rollbackPointerPath,
    currentPointerPath,
    currentPointerSha256: sha256(jsonBytes(nextPointer)),
    committed: true,
    publicationChanged: false,
  };
}

async function ensureTransitionReceipts({ fetchImpl, token, previousBytes, nextPointer, rollbackBase, currentPointerPath }) {
  const expectedPaths = transitionPaths(rollbackBase, nextPointer.previousRootSha256, nextPointer.rootSha256);
  assert(nextPointer.transitionIntentPath === expectedPaths.intentPath, 'Current pointer transition intent path is not deterministic.');
  assert(nextPointer.transitionCommitPath === expectedPaths.commitPath, 'Current pointer transition commit path is not deterministic.');
  const intent = transitionIntentFor(previousBytes, nextPointer, currentPointerPath);
  const commit = transitionCommitFor(nextPointer, currentPointerPath);
  const intentResult = await ensureImmutableFile(fetchImpl, token, nextPointer.transitionIntentPath, jsonBytes(intent));
  const commitResult = await ensureImmutableFile(fetchImpl, token, nextPointer.transitionCommitPath, jsonBytes(commit));
  return { intentResult, commitResult };
}

async function previousBytesForCurrentPointer({ fetchImpl, token, pointer, rollbackBase }) {
  if (pointer.previousRootSha256 === null) {
    assert(pointer.rollbackPointerPath === null, 'Initial current pointer unexpectedly declares rollback history.');
    return null;
  }
  assert(typeof pointer.rollbackPointerPath === 'string' && pointer.rollbackPointerPath.startsWith(`${rollbackBase}/current-history/`), 'Current pointer with previous root is missing a valid rollback pointer path.');
  const previousBytes = await downloadBytes(fetchImpl, token, pointer.rollbackPointerPath);
  assert(previousBytes, 'Current pointer rollback history is missing; refusing to treat transition as complete.');
  let previousPointer;
  try { previousPointer = JSON.parse(previousBytes.toString('utf8')); }
  catch { throw new Error('Rollback pointer history is not valid JSON.'); }
  assert(previousPointer?.pointerType === 'canonical-current' && previousPointer?.rootSha256 === pointer.previousRootSha256, 'Rollback pointer history does not match current.previousRootSha256.');
  return previousBytes;
}

export async function uploadCanonicalVaultRelease({
  release,
  canonicalFiles,
  rollbackBase,
  buildPointer,
  assertPointerMatchesRelease,
  artifactLabel = 'Canonical Vault',
  token,
  fetchImpl = globalThis.fetch,
  promoteCurrent = false,
} = {}) {
  assert(release?.manifest && release?.fileBytes, `${artifactLabel} release is required.`);
  assert(Array.isArray(canonicalFiles) && canonicalFiles.length > 0, `${artifactLabel} canonicalFiles are required.`);
  assert(typeof rollbackBase === 'string' && rollbackBase.startsWith('/vault/rollback/'), `${artifactLabel} rollbackBase is invalid.`);
  assert(typeof buildPointer === 'function', `${artifactLabel} buildPointer adapter is required.`);
  assert(typeof assertPointerMatchesRelease === 'function', `${artifactLabel} pointer validator is required.`);
  assert(token, 'Dropbox access token is required for a Vault write.');
  assert(typeof fetchImpl === 'function', 'A fetch implementation is required.');

  const { manifest, fileBytes } = release;
  assert(manifest?.runtimePublicationAllowed === false, `${artifactLabel} write must not imply runtime publication.`);
  assert(manifest?.deletionPolicy === 'tombstone-only', `${artifactLabel} deletion policy must remain tombstone-only.`);
  assert(typeof manifest?.immutableReleaseRoot === 'string' && manifest.immutableReleaseRoot.startsWith('/vault/canonical/'), `${artifactLabel} immutable release root is invalid.`);
  assert(typeof manifest?.currentPointerPath === 'string' && manifest.currentPointerPath.startsWith('/vault/canonical/'), `${artifactLabel} current pointer path is invalid.`);

  const immutableResults = [];
  for (const name of canonicalFiles) {
    assert(fileBytes[name], `${artifactLabel} release is missing ${name}.`);
    immutableResults.push(await ensureImmutableFile(fetchImpl, token, `${manifest.immutableReleaseRoot}/${name}`, fileBytes[name]));
  }

  for (const result of immutableResults) {
    const checked = await metadata(fetchImpl, token, result.path);
    assert(checked?.['.tag'] === 'file' && checked.size === result.bytes && checked.content_hash === result.contentHash, `${result.path} failed post-write immutable verification.`);
  }

  const pointerResult = { status: 'not-requested', path: manifest.currentPointerPath };
  if (!promoteCurrent) return { releaseId: manifest.releaseId, rootSha256: manifest.rootSha256, immutableResults, pointer: pointerResult };

  const previousCurrentBytes = await downloadBytes(fetchImpl, token, manifest.currentPointerPath);
  let previousPointer = null;
  if (previousCurrentBytes) {
    try { previousPointer = JSON.parse(previousCurrentBytes.toString('utf8')); }
    catch { throw new Error(`Existing ${artifactLabel} current pointer is not valid JSON; refusing to overwrite it.`); }
    assert(previousPointer?.pointerType === 'canonical-current' && previousPointer?.artifactType === manifest.artifactType, `Existing ${artifactLabel} current pointer has incompatible semantics.`);

    if (previousPointer.rootSha256 === manifest.rootSha256) {
      assertPointerMatchesRelease(previousPointer, release);
      const transitionPreviousBytes = await previousBytesForCurrentPointer({ fetchImpl, token, pointer: previousPointer, rollbackBase });
      const receipts = await ensureTransitionReceipts({
        fetchImpl,
        token,
        previousBytes: transitionPreviousBytes,
        nextPointer: previousPointer,
        rollbackBase,
        currentPointerPath: manifest.currentPointerPath,
      });
      return {
        releaseId: manifest.releaseId,
        rootSha256: manifest.rootSha256,
        immutableResults,
        pointer: {
          status: 'already-current',
          path: manifest.currentPointerPath,
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
    rollbackPointerPath = `${rollbackBase}/current-history/${sha256(previousCurrentBytes)}.json`;
    await ensureImmutableFile(fetchImpl, token, rollbackPointerPath, previousCurrentBytes);
  }

  const previousRootSha256 = previousPointer?.rootSha256 ?? null;
  const paths = transitionPaths(rollbackBase, previousRootSha256, manifest.rootSha256);
  const nextPointer = buildPointer(release, {
    previousRootSha256,
    rollbackPointerPath,
    transitionIntentPath: paths.intentPath,
    transitionCommitPath: paths.commitPath,
  });
  assert(nextPointer?.pointerType === 'canonical-current' && nextPointer?.artifactType === manifest.artifactType, `${artifactLabel} adapter produced an incompatible current pointer.`);
  assert(nextPointer.rootSha256 === manifest.rootSha256, `${artifactLabel} adapter produced a pointer for the wrong release root.`);

  const nextPointerBytes = jsonBytes(nextPointer);
  const intent = transitionIntentFor(previousCurrentBytes, nextPointer, manifest.currentPointerPath);
  await ensureImmutableFile(fetchImpl, token, paths.intentPath, jsonBytes(intent));
  await writeMutablePointer(fetchImpl, token, manifest.currentPointerPath, nextPointerBytes);
  const commit = transitionCommitFor(nextPointer, manifest.currentPointerPath);
  await ensureImmutableFile(fetchImpl, token, paths.commitPath, jsonBytes(commit));

  return {
    releaseId: manifest.releaseId,
    rootSha256: manifest.rootSha256,
    immutableResults,
    pointer: {
      status: previousPointer ? 'advanced' : 'initialized',
      path: manifest.currentPointerPath,
      rootSha256: nextPointer.rootSha256,
      previousRootSha256,
      rollbackPointerPath,
      transitionIntentPath: paths.intentPath,
      transitionCommitPath: paths.commitPath,
    },
  };
}

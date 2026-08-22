#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildCanonicalPersonVaultRelease } from './build-canonical-person-manifest.mjs';
import { dropboxContentHash, uploadCanonicalPersonRelease } from './upload-canonical-person-release.mjs';

const root = process.cwd();
const sourceBytes = await readFile(path.join(root, 'data', 'canonical-person-anchors.json'), 'utf8');
const baselineDataset = JSON.parse(sourceBytes);

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeRelease(dataset, generatedAt) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'santosdia-vault-release-'));
  const datasetBytes = `${JSON.stringify(dataset, null, 2)}\n`;
  const built = buildCanonicalPersonVaultRelease(dataset, {
    sourceBytes: datasetBytes,
    sourceCommit: 'test-commit',
    generatedAt,
  });
  await Promise.all([
    writeFile(path.join(directory, 'manifest.json'), jsonBytes(built.manifest)),
    writeFile(path.join(directory, 'people.json'), jsonBytes(built.people)),
    writeFile(path.join(directory, 'legacy-observance-bridges.json'), jsonBytes(built.legacyObservanceBridges)),
    writeFile(path.join(directory, 'build-receipt.json'), jsonBytes(built.buildReceipt)),
  ]);
  return { directory, built };
}

function mockDropbox() {
  const files = new Map();
  const uploads = [];

  function notFound() {
    return new Response(JSON.stringify({ error_summary: 'path/not_found/..' }), {
      status: 409,
      headers: { 'content-type': 'application/json' },
    });
  }

  async function fetchImpl(url, options = {}) {
    if (url.endsWith('/2/files/get_metadata')) {
      const { path: remotePath } = JSON.parse(options.body);
      const bytes = files.get(remotePath);
      if (!bytes) return notFound();
      return new Response(JSON.stringify({
        '.tag': 'file',
        path_display: remotePath,
        size: bytes.length,
        content_hash: dropboxContentHash(bytes),
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (url.endsWith('/2/files/download')) {
      const { path: remotePath } = JSON.parse(options.headers['Dropbox-API-Arg']);
      const bytes = files.get(remotePath);
      if (!bytes) return notFound();
      return new Response(bytes, { status: 200, headers: { 'content-type': 'application/octet-stream' } });
    }

    if (url.endsWith('/2/files/upload')) {
      const args = JSON.parse(options.headers['Dropbox-API-Arg']);
      const bytes = Buffer.from(options.body);
      if (args.mode === 'add' && files.has(args.path)) {
        return new Response(JSON.stringify({ error_summary: 'path/conflict/file/..' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        });
      }
      assert.ok(args.mode === 'add' || args.mode === 'overwrite', `Unexpected Dropbox write mode ${String(args.mode)}.`);
      if (args.mode === 'add') assert.equal(args.strict_conflict, true, 'Immutable upload must use strict conflict mode.');
      files.set(args.path, bytes);
      uploads.push({ path: args.path, mode: args.mode, bytes: Buffer.from(bytes) });
      return new Response(JSON.stringify({
        '.tag': 'file',
        path_display: args.path,
        size: bytes.length,
        content_hash: dropboxContentHash(bytes),
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    throw new Error(`Unexpected mock Dropbox request: ${url}`);
  }

  return { files, uploads, fetchImpl };
}

const temporaryDirectories = [];
try {
  const first = await writeRelease(baselineDataset, '2026-08-22T19:30:00.000Z');
  temporaryDirectories.push(first.directory);
  const dropbox = mockDropbox();

  const firstWrite = await uploadCanonicalPersonRelease({
    inputRoot: first.directory,
    token: 'test-token',
    fetchImpl: dropbox.fetchImpl,
    promoteCurrent: true,
  });
  assert.equal(firstWrite.immutableResults.length, 3);
  assert.ok(firstWrite.immutableResults.every(item => item.status === 'created'));
  assert.equal(firstWrite.pointer.status, 'initialized');
  assert.equal(firstWrite.pointer.previousRootSha256, null);
  assert.equal(firstWrite.pointer.rollbackPointerPath, null);
  assert.ok(firstWrite.pointer.transitionPath.includes('/vault/rollback/canonical/people/v1/transitions/none--'));
  const currentPath = '/vault/canonical/people/v1/current.json';
  const firstPointerBytes = dropbox.files.get(currentPath);
  assert.ok(firstPointerBytes, 'First canonical write did not initialize current.json.');
  const firstPointer = JSON.parse(firstPointerBytes.toString('utf8'));
  assert.equal(firstPointer.rootSha256, first.built.manifest.rootSha256);
  assert.ok(!('updatedAt' in firstPointer), 'Current pointer must be deterministic for a canonical root.');
  assert.ok(dropbox.uploads.filter(item => item.mode === 'add').every(item => !item.path.includes('/archive/')), 'Canonical Vault uploader must not write to the legacy archive.');

  const uploadCountAfterFirst = dropbox.uploads.length;
  const repeated = await uploadCanonicalPersonRelease({
    inputRoot: first.directory,
    token: 'test-token',
    fetchImpl: dropbox.fetchImpl,
    promoteCurrent: true,
  });
  assert.ok(repeated.immutableResults.every(item => item.status === 'already-identical'));
  assert.equal(repeated.pointer.status, 'already-current');
  assert.equal(dropbox.uploads.length, uploadCountAfterFirst, 'Idempotent canonical rerun unexpectedly wrote Dropbox bytes.');

  const secondDataset = structuredClone(baselineDataset);
  const changed = secondDataset.people.find(item => item.id === 'thomas-aquinas');
  assert.ok(changed, 'Fixture is missing Thomas Aquinas.');
  changed.names.en = 'Saint Thomas Aquinas (canonical test revision)';
  const second = await writeRelease(secondDataset, '2026-08-22T19:31:00.000Z');
  temporaryDirectories.push(second.directory);
  assert.notEqual(second.built.manifest.rootSha256, first.built.manifest.rootSha256, 'Changed canonical content did not produce a new root.');

  const advanced = await uploadCanonicalPersonRelease({
    inputRoot: second.directory,
    token: 'test-token',
    fetchImpl: dropbox.fetchImpl,
    promoteCurrent: true,
  });
  assert.equal(advanced.pointer.status, 'advanced');
  assert.equal(advanced.pointer.previousRootSha256, first.built.manifest.rootSha256);
  assert.ok(advanced.pointer.rollbackPointerPath?.startsWith('/vault/rollback/canonical/people/v1/current-history/'));
  assert.ok(dropbox.files.get(advanced.pointer.rollbackPointerPath)?.equals(firstPointerBytes), 'Rollback history does not preserve exact previous pointer bytes.');
  const secondPointer = JSON.parse(dropbox.files.get(currentPath).toString('utf8'));
  assert.equal(secondPointer.rootSha256, second.built.manifest.rootSha256, 'Current pointer did not advance to the verified second release.');
  const transition = JSON.parse(dropbox.files.get(advanced.pointer.transitionPath).toString('utf8'));
  assert.equal(transition.fromRootSha256, first.built.manifest.rootSha256);
  assert.equal(transition.toRootSha256, second.built.manifest.rootSha256);
  assert.equal(transition.publicationChanged, false);

  // Immutable conflict: corrupt an already-addressed release file. The uploader
  // must fail closed and must not move current.json.
  const secondPeoplePath = `${second.built.manifest.immutableReleaseRoot}/people.json`;
  const stableCurrentBeforeConflict = Buffer.from(dropbox.files.get(currentPath));
  dropbox.files.set(secondPeoplePath, Buffer.from('corrupt immutable bytes\n'));
  await assert.rejects(
    uploadCanonicalPersonRelease({
      inputRoot: second.directory,
      token: 'test-token',
      fetchImpl: dropbox.fetchImpl,
      promoteCurrent: true,
    }),
    /immutable release conflict/u,
  );
  assert.ok(dropbox.files.get(currentPath).equals(stableCurrentBeforeConflict), 'Immutable conflict moved current.json.');

  // Invalid current pointer: even with a complete immutable release, a malformed
  // mutable pointer may never be silently replaced.
  dropbox.files.set(secondPeoplePath, await readFile(path.join(second.directory, 'people.json')));
  dropbox.files.set(currentPath, Buffer.from('{not-json}\n'));
  await assert.rejects(
    uploadCanonicalPersonRelease({
      inputRoot: first.directory,
      token: 'test-token',
      fetchImpl: dropbox.fetchImpl,
      promoteCurrent: true,
    }),
    /current pointer is not valid JSON/u,
  );

  console.log(`Immutable Dropbox canonical Vault uploader tests passed: ${first.built.manifest.rootSha256.slice(0, 12)} → ${second.built.manifest.rootSha256.slice(0, 12)} with rollback preservation.`);
} finally {
  await Promise.all(temporaryDirectories.map(directory => rm(directory, { recursive: true, force: true })));
}

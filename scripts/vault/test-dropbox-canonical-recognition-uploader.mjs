#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildCanonicalRecognitionVaultRelease } from './build-canonical-recognition-manifest.mjs';
import { dropboxContentHash } from './canonical-dropbox-vault.mjs';
import { uploadCanonicalRecognitionRelease } from './upload-canonical-recognition-release.mjs';

const root = process.cwd();
const [recognitionBytes, personBytes, ecclesialBytes] = await Promise.all([
  readFile(path.join(root, 'data', 'canonical-recognition-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-person-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-ecclesial-context-anchors.json'), 'utf8')
]);
const baselineDataset = JSON.parse(recognitionBytes);
const personDataset = JSON.parse(personBytes);
const ecclesialDataset = JSON.parse(ecclesialBytes);

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeRelease(dataset, generatedAt) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'santosdia-recognition-vault-'));
  const datasetBytes = `${JSON.stringify(dataset, null, 2)}\n`;
  const built = buildCanonicalRecognitionVaultRelease(dataset, personDataset, ecclesialDataset, {
    sourceBytes: datasetBytes,
    sourceCommit: 'test-commit',
    generatedAt
  });
  await Promise.all([
    writeFile(path.join(directory, 'manifest.json'), jsonBytes(built.manifest)),
    writeFile(path.join(directory, 'recognitions.json'), jsonBytes(built.recognitions)),
    writeFile(path.join(directory, 'build-receipt.json'), jsonBytes(built.buildReceipt))
  ]);
  return { directory, built };
}

function mockDropbox() {
  const files = new Map();
  const uploads = [];
  function notFound() {
    return new Response(JSON.stringify({ error_summary: 'path/not_found/..' }), { status: 409, headers: { 'content-type': 'application/json' } });
  }
  async function fetchImpl(url, options = {}) {
    if (url.endsWith('/2/files/get_metadata')) {
      const { path: remotePath } = JSON.parse(options.body);
      const bytes = files.get(remotePath);
      if (!bytes) return notFound();
      return new Response(JSON.stringify({ '.tag': 'file', path_display: remotePath, size: bytes.length, content_hash: dropboxContentHash(bytes) }), { status: 200, headers: { 'content-type': 'application/json' } });
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
        return new Response(JSON.stringify({ error_summary: 'path/conflict/file/..' }), { status: 409, headers: { 'content-type': 'application/json' } });
      }
      assert.ok(args.mode === 'add' || args.mode === 'overwrite');
      if (args.mode === 'add') assert.equal(args.strict_conflict, true);
      files.set(args.path, bytes);
      uploads.push({ path: args.path, mode: args.mode, bytes: Buffer.from(bytes) });
      return new Response(JSON.stringify({ '.tag': 'file', path_display: args.path, size: bytes.length, content_hash: dropboxContentHash(bytes) }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    throw new Error(`Unexpected mock Dropbox request: ${url}`);
  }
  return { files, uploads, fetchImpl };
}

const temporaryDirectories = [];
try {
  const first = await writeRelease(baselineDataset, '2026-08-22T20:00:00.000Z');
  temporaryDirectories.push(first.directory);
  const dropbox = mockDropbox();

  const initialized = await uploadCanonicalRecognitionRelease({ inputRoot: first.directory, token: 'test-token', fetchImpl: dropbox.fetchImpl, promoteCurrent: true });
  assert.equal(initialized.immutableResults.length, 2);
  assert.ok(initialized.immutableResults.every((item) => item.status === 'created'));
  assert.equal(initialized.pointer.status, 'initialized');
  assert.equal(initialized.pointer.previousRootSha256, null);
  assert.ok(initialized.pointer.transitionIntentPath.startsWith('/vault/rollback/canonical/recognitions/v1/transition-intents/none--'));
  assert.ok(initialized.pointer.transitionCommitPath.startsWith('/vault/rollback/canonical/recognitions/v1/transition-commits/none--'));

  const currentPath = '/vault/canonical/recognitions/v1/current.json';
  const firstPointerBytes = dropbox.files.get(currentPath);
  assert.ok(firstPointerBytes, 'Recognition write did not initialize current.json.');
  const firstPointer = JSON.parse(firstPointerBytes.toString('utf8'));
  assert.equal(firstPointer.artifactType, 'canonical-ecclesial-recognitions');
  assert.equal(firstPointer.rootSha256, first.built.manifest.rootSha256);
  assert.equal(firstPointer.recognitionCount, first.built.manifest.recognitionCount);
  assert.equal(firstPointer.personCoverageCount, first.built.manifest.personCoverageCount);
  assert.equal(firstPointer.recognitionCount, 17);
  assert.equal(firstPointer.personCoverageCount, 16);
  assert.deepEqual(firstPointer.churches, ['church:orthodox-church-america', 'church:roman-catholic']);
  assert.ok(!('peopleCount' in firstPointer), 'Recognition pointer leaked Person-specific count semantics.');
  assert.ok(dropbox.uploads.every((item) => !item.path.includes('/canonical/people/v1/')), 'Recognition uploader touched Person Vault paths.');
  assert.ok(dropbox.uploads.every((item) => !item.path.includes('/archive/')), 'Recognition uploader touched legacy archive paths.');

  const uploadCount = dropbox.uploads.length;
  const repeated = await uploadCanonicalRecognitionRelease({ inputRoot: first.directory, token: 'test-token', fetchImpl: dropbox.fetchImpl, promoteCurrent: true });
  assert.ok(repeated.immutableResults.every((item) => item.status === 'already-identical'));
  assert.equal(repeated.pointer.status, 'already-current');
  assert.equal(dropbox.uploads.length, uploadCount, 'Idempotent Recognition rerun unexpectedly wrote bytes.');

  const secondDataset = structuredClone(baselineDataset);
  const catherine = secondDataset.recognitions.find((item) => item.personId === 'catherine-siena');
  assert.ok(catherine, 'Recognition fixture is missing Catherine of Siena.');
  catherine.ecclesialTitles.push('patron-of-europe');
  const second = await writeRelease(secondDataset, '2026-08-22T20:01:00.000Z');
  temporaryDirectories.push(second.directory);
  assert.notEqual(second.built.manifest.rootSha256, first.built.manifest.rootSha256);

  const advanced = await uploadCanonicalRecognitionRelease({ inputRoot: second.directory, token: 'test-token', fetchImpl: dropbox.fetchImpl, promoteCurrent: true });
  assert.equal(advanced.pointer.status, 'advanced');
  assert.equal(advanced.pointer.previousRootSha256, first.built.manifest.rootSha256);
  assert.ok(advanced.pointer.rollbackPointerPath.startsWith('/vault/rollback/canonical/recognitions/v1/current-history/'));
  assert.ok(dropbox.files.get(advanced.pointer.rollbackPointerPath).equals(firstPointerBytes), 'Recognition rollback did not preserve exact previous pointer bytes.');

  const secondPointer = JSON.parse(dropbox.files.get(currentPath).toString('utf8'));
  assert.equal(secondPointer.rootSha256, second.built.manifest.rootSha256);
  assert.equal(secondPointer.previousRootSha256, first.built.manifest.rootSha256);
  assert.equal(JSON.parse(dropbox.files.get(secondPointer.transitionIntentPath).toString('utf8')).committed, false);
  assert.equal(JSON.parse(dropbox.files.get(secondPointer.transitionCommitPath).toString('utf8')).committed, true);

  const recognitionPath = `${second.built.manifest.immutableReleaseRoot}/recognitions.json`;
  const currentBeforeConflict = Buffer.from(dropbox.files.get(currentPath));
  dropbox.files.set(recognitionPath, Buffer.from('corrupt immutable recognition bytes\n'));
  await assert.rejects(
    uploadCanonicalRecognitionRelease({ inputRoot: second.directory, token: 'test-token', fetchImpl: dropbox.fetchImpl, promoteCurrent: true }),
    /immutable release conflict/u
  );
  assert.ok(dropbox.files.get(currentPath).equals(currentBeforeConflict), 'Recognition immutable conflict moved current.json.');

  console.log(`Canonical Recognition Dropbox uploader passed canonical Church isolation: ${first.built.manifest.rootSha256.slice(0, 12)} → ${second.built.manifest.rootSha256.slice(0, 12)}.`);
} finally {
  await Promise.all(temporaryDirectories.map((directory) => rm(directory, { recursive: true, force: true })));
}

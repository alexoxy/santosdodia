#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const fixture = mkdtempSync(join(root, 'dropbox-archive-fixture-'));
const relativeFixture = relative(root, fixture);

function execute(runNumber) {
  const result = spawnSync(process.execPath, [
    'scripts/archive-to-dropbox.mjs',
    '--dry-run',
    '--stream',
    'test-stream',
    '--source',
    relativeFixture,
    '--run-number',
    String(runNumber),
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

try {
  mkdirSync(join(fixture, 'nested'));
  writeFileSync(join(fixture, 'alpha.txt'), 'alpha\n');
  writeFileSync(join(fixture, 'nested', 'beta.txt'), 'beta\n');

  const first = execute(1);
  const sameSlot = execute(9);
  const lastSlot = execute(8);

  assert.equal(first.current.slot, '01');
  assert.equal(sameSlot.current.slot, '01');
  assert.equal(lastSlot.current.slot, '08');
  assert.equal(first.current.sha256, sameSlot.current.sha256, 'Archive output must be deterministic.');
  assert.equal(first.current.archivePath, '/archive/test-stream/slots/01/package.tar.gz');
  assert.equal(first.indexPath, '/archive/test-stream/index.json');
  assert.ok(!first.current.archivePath.toLowerCase().includes('santosdodia orchestrator'));
  assert.deepEqual(first.current.sources, [basename(fixture)]);

  process.stdout.write('Dropbox archive ring, paths and deterministic package: OK\n');
} finally {
  rmSync(fixture, { force: true, recursive: true });
}

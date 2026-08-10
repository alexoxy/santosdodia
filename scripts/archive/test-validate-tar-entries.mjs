#!/usr/bin/env node

import assert from 'node:assert/strict';
import { validateTarArchive, validateTarEntry } from './validate-tar-entries.mjs';

for (const safe of [
  'staging/file.json',
  'nested/path/entities.jsonl',
  './relative/file.txt',
]) {
  assert.doesNotThrow(() => validateTarEntry(safe));
}

for (const unsafe of [
  '/etc/passwd',
  '../secret.txt',
  'nested/../../secret.txt',
  'nested\\..\\secret.txt',
]) {
  assert.throws(() => validateTarEntry(unsafe), /Unsafe/u);
}

{
  const result = validateTarArchive('/tmp/fake.tar.gz', {
    execFile: (command, args, options) => {
      assert.equal(command, 'tar');
      assert.deepEqual(args, ['-tzf', '/tmp/fake.tar.gz']);
      assert.equal(options.encoding, 'utf8');
      return 'safe/file.txt\nnested/data.json\n';
    },
  });
  assert.deepEqual(result, { archivePath: '/tmp/fake.tar.gz', entryCount: 2, safe: true });
}

assert.throws(
  () => validateTarArchive('/tmp/fake.tar.gz', { execFile: () => 'safe/file.txt\n../escape.txt\n' }),
  /Unsafe parent traversal/u,
);

console.log('TAR archive path safety tests passed.');

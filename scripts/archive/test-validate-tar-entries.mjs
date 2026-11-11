#!/usr/bin/env node

import assert from 'node:assert/strict';
import { extractSafeTar } from './extract-safe-tar.mjs';
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

{
  const calls = [];
  const directories = [];
  const result = extractSafeTar('/tmp/fake.tar.gz', '/tmp/out', {
    execFile: (command, args, options) => {
      calls.push({ command, args, options });
      if (args[0] === '-tzf') return 'safe/file.txt\n';
      return '';
    },
    mkdir: (directory) => directories.push(directory),
  });
  assert.equal(result.extracted, true);
  assert.deepEqual(directories, ['/tmp/out']);
  assert.deepEqual(calls[0].args, ['-tzf', '/tmp/fake.tar.gz']);
  assert.deepEqual(calls[1].args, ['-xzf', '/tmp/fake.tar.gz', '-C', '/tmp/out', '--no-same-owner', '--no-same-permissions']);
}

{
  const calls = [];
  assert.throws(
    () => extractSafeTar('/tmp/fake.tar.gz', '/tmp/out', {
      execFile: (_command, args) => {
        calls.push(args);
        if (args[0] === '-tzf') return '../escape.txt\n';
        throw new Error('extraction must not run');
      },
      mkdir: () => { throw new Error('mkdir must not run for unsafe archive'); },
    }),
    /Unsafe parent traversal/u,
  );
  assert.equal(calls.length, 1, 'Unsafe archive must fail before extraction.');
}

console.log('TAR archive path safety and extraction tests passed.');

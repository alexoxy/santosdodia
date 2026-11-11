#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTarArchive } from './validate-tar-entries.mjs';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

export function extractSafeTar(archivePath, destination, {
  execFile = execFileSync,
  mkdir = (directory) => fs.mkdirSync(directory, { recursive: true }),
} = {}) {
  if (!archivePath) throw new Error('Archive path is required.');
  if (!destination) throw new Error('Extraction destination is required.');
  validateTarArchive(archivePath, { execFile });
  mkdir(destination);
  execFile('tar', [
    '-xzf', archivePath,
    '-C', destination,
    '--no-same-owner',
    '--no-same-permissions',
  ], { stdio: 'inherit' });
  return { archivePath, destination, extracted: true };
}

function main() {
  const archivePath = argument('--archive');
  const destination = argument('--destination');
  const result = extractSafeTar(archivePath, destination);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`Safe archive extraction failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

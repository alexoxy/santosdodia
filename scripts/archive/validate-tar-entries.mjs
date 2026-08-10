#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

export function validateTarEntry(entry) {
  if (!entry) return;
  if (entry.startsWith('/')) throw new Error(`Unsafe absolute archive entry: ${entry}`);
  const normalized = entry.replaceAll('\\', '/');
  if (normalized.split('/').includes('..')) throw new Error(`Unsafe parent traversal archive entry: ${entry}`);
}

export function validateTarArchive(archivePath, { execFile = execFileSync } = {}) {
  if (!archivePath) throw new Error('Archive path is required.');
  const listing = execFile('tar', ['-tzf', archivePath], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const entries = listing.split(/\r?\n/u).filter(Boolean);
  for (const entry of entries) validateTarEntry(entry);
  return { archivePath, entryCount: entries.length, safe: true };
}

function main() {
  const archivePath = argument('--archive') ?? process.argv[2];
  const result = validateTarArchive(archivePath);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`Archive safety validation failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

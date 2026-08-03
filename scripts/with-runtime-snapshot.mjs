import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const targetModule = process.argv[2];
if (!targetModule) {
  throw new Error('Usage: node scripts/with-runtime-snapshot.mjs <module> [...args]');
}

const root = process.cwd();
const runtimeSnapshot = path.resolve(root, process.env.RUNTIME_SNAPSHOT_PATH ?? 'data/generated/runtime-fallback.json');
const legacySnapshot = path.join(root, 'data', 'generated', 'source-snapshot.json');
let createdCompatibilityFile = false;

try {
  await mkdir(path.dirname(legacySnapshot), { recursive: true });
  await copyFile(runtimeSnapshot, legacySnapshot);
  createdCompatibilityFile = true;
  await import(pathToFileURL(path.resolve(root, targetModule)).href);
} finally {
  if (createdCompatibilityFile) await rm(legacySnapshot, { force: true });
}

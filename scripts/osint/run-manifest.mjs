#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const [manifestPath = 'data/osint/manifests/p0-initial-dump.json', outputRoot = 'data/osint/runs'] = process.argv.slice(2);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.publish !== false || manifest.mode !== 'archive-only') {
  throw new Error('Initial OSINT runner only accepts archive-only manifests with publish=false.');
}

const results = [];
for (const source of manifest.sources) {
  const code = await run(process.execPath, ['scripts/osint/fetch-source.mjs', source.id, source.url, outputRoot]);
  results.push({ sourceId: source.id, url: source.url, exitCode: code });
}

const failures = results.filter((result) => result.exitCode !== 0);
console.log(JSON.stringify({ manifestPath, total: results.length, succeeded: results.length - failures.length, failed: failures.length, results }, null, 2));
if (failures.length) process.exitCode = 1;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

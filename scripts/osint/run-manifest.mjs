#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { normalize, sep } from 'node:path';

const [manifestPath = 'data/osint/manifests/p0-initial-dump.json', outputRoot = 'data/osint/runs'] = process.argv.slice(2);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.publish !== false || manifest.mode !== 'archive-only') {
  throw new Error('Initial OSINT runner only accepts archive-only manifests with publish=false.');
}
if (!manifest.policyRegistry) {
  throw new Error('Manifest must name an explicit policyRegistry.');
}

const policyRegistry = JSON.parse(await readFile(manifest.policyRegistry, 'utf8'));
const policyById = new Map(policyRegistry.sources.map((policy) => [policy.id, policy]));
const enabled = manifest.sources.filter((source) => source.enabled === true);
const skipped = manifest.sources.filter((source) => source.enabled !== true).map((source) => ({ sourceId: source.id, reason: 'disabled' }));

if (enabled.length === 0) {
  throw new Error('Manifest has no enabled sources.');
}

const results = [];
for (const source of enabled) {
  const policy = policyById.get(source.id);
  if (!policy || policy.decision !== 'approved') {
    throw new Error(`Source ${source.id} is enabled without an approved policy.`);
  }
  if (!source.adapter) {
    throw new Error(`Source ${source.id} is enabled without a source-specific adapter.`);
  }

  const adapter = safeAdapterPath(source.adapter);
  const code = await run(process.execPath, [adapter, source.id, outputRoot]);
  results.push({ sourceId: source.id, adapter, exitCode: code });
}

const failures = results.filter((result) => result.exitCode !== 0);
console.log(JSON.stringify({
  manifestPath,
  policyRegistry: manifest.policyRegistry,
  mode: manifest.mode,
  publish: manifest.publish,
  total: manifest.sources.length,
  enabled: enabled.length,
  skipped,
  succeeded: results.length - failures.length,
  failed: failures.length,
  results,
}, null, 2));
if (failures.length) process.exitCode = 1;

function safeAdapterPath(value) {
  const normalized = normalize(value);
  const prefix = `scripts${sep}osint${sep}adapters${sep}`;
  if (!normalized.startsWith(prefix) || normalized.includes(`..${sep}`)) {
    throw new Error(`Adapter path is outside the approved adapter directory: ${value}`);
  }
  return normalized;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

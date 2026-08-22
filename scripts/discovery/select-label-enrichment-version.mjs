#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function validateProgress(progress, enrichmentId, root) {
  if (progress?.schemaVersion !== 1 || progress?.enrichmentId !== enrichmentId || progress?.sourceId !== 'wikidata') return false;
  if (progress.identityRootSha256 !== root || !Number.isSafeInteger(progress.identityCount) || !Number.isSafeInteger(progress.nextEntityOffset)) return false;
  if (progress.nextEntityOffset < 0 || progress.nextEntityOffset > progress.identityCount) return false;
  return true;
}

function complete(progress) {
  return progress?.completed === true && progress.nextEntityOffset === progress.identityCount;
}

export function selectLabelEnrichmentVersion({ identityManifest, v2Progress, v3Progress = null } = {}) {
  const root = identityManifest?.rootSha256;
  if (!root || identityManifest?.stage !== 'global-candidate-identity-ledger' || identityManifest?.publish !== false) throw new Error('Label selector requires the verified staging identity root.');
  if (!validateProgress(v2Progress, 'saints-labels-v2', root) || !complete(v2Progress)) throw new Error('Label selector requires one complete v2 fallback on the current identity root.');

  if (v3Progress && validateProgress(v3Progress, 'saints-labels-v3', root) && complete(v3Progress)) {
    return {
      schemaVersion: 1,
      selectedVersion: 'v3',
      enrichmentId: 'saints-labels-v3',
      streamPrefix: 'enrichment/saints/v1/normalized/wikidata/labels-v3',
      reason: 'v3-complete-current-identity-root',
      automaticSwitch: true,
      publicationAllowed: false,
      productionMutation: false,
    };
  }

  return {
    schemaVersion: 1,
    selectedVersion: 'v2',
    enrichmentId: 'saints-labels-v2',
    streamPrefix: 'enrichment/saints/v1/normalized/wikidata/labels-v2',
    reason: v3Progress ? 'v3-not-complete-current-identity-root' : 'v3-not-yet-available',
    automaticSwitch: false,
    publicationAllowed: false,
    productionMutation: false,
  };
}

function read(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
}

function main() {
  const manifestPath = argument('--identity-manifest');
  const v2Path = argument('--v2-progress');
  const v3Path = argument('--v3-progress');
  const output = argument('--output');
  if (!manifestPath || !v2Path || !output) throw new Error('--identity-manifest, --v2-progress and --output are required.');
  const selection = selectLabelEnrichmentVersion({
    identityManifest: read(manifestPath),
    v2Progress: read(v2Path),
    v3Progress: v3Path && fs.existsSync(path.resolve(v3Path)) ? read(v3Path) : null,
  });
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(selection, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(selection, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

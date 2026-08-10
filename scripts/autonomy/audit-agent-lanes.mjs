#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(moduleDir, '../..');
const configPath = path.join(ROOT, 'config/agent-lanes.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const errors = [];

if (config.schemaVersion !== 1) errors.push('agent-lanes schemaVersion must be 1.');
if (JSON.stringify(config.stages) !== JSON.stringify(['scout', 'normalizer', 'importer'])) {
  errors.push('Exactly three ordered stages are required: scout, normalizer, importer.');
}
for (const rule of ['noGlobalQueue','noGlobalLock','sourceFailureIsolation','lastKnownGoodOnFailure','immutableDropboxBoundaryBetweenStages','idempotencyRequired','checksumsRequired','deadLetterRequired']) {
  if (config.globalRules?.[rule] !== true) errors.push(`Global rule ${rule} must remain enabled.`);
}
if (!Number.isInteger(config.globalRules?.boundedRetries) || config.globalRules.boundedRetries < 1 || config.globalRules.boundedRetries > 5) {
  errors.push('boundedRetries must be an integer between 1 and 5.');
}
if (config.globalRules?.productionWritesDuringShadow !== false) errors.push('Production writes must remain disabled during shadow phase.');

const lanes = Array.isArray(config.lanes) ? config.lanes : [];
const ids = new Set();
for (const lane of lanes) {
  if (!lane.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(lane.id)) errors.push(`Invalid lane id: ${lane.id ?? '<missing>'}.`);
  if (ids.has(lane.id)) errors.push(`Duplicate lane id: ${lane.id}.`);
  ids.add(lane.id);
  if (!Array.isArray(lane.domains) || lane.domains.length === 0) errors.push(`Lane ${lane.id} must declare domains.`);
  if (!lane.partitionKey) errors.push(`Lane ${lane.id} must declare a partitionKey.`);
  if (!lane.rawStreamTemplate?.startsWith(`osint-raw/${lane.id}/`)) errors.push(`Lane ${lane.id} raw stream is not lane-scoped.`);
  if (!lane.normalizedStreamTemplate?.startsWith(`osint-normalized/${lane.id}/`)) errors.push(`Lane ${lane.id} normalized stream is not lane-scoped.`);
  if (!Number.isInteger(lane.maxConcurrentPartitions) || lane.maxConcurrentPartitions < 2) errors.push(`Lane ${lane.id} must allow at least two concurrent partitions.`);
}

for (const handoff of ['scoutToNormalizer', 'normalizerToImporter']) {
  if (config.handoffContract?.[handoff]?.store !== 'dropbox') errors.push(`${handoff} must use Dropbox.`);
  if (!Array.isArray(config.handoffContract?.[handoff]?.required) || !config.handoffContract[handoff].required.includes('sha256')) {
    errors.push(`${handoff} must require SHA-256 lineage.`);
  }
}
if (config.handoffContract?.importerToProduction?.store !== 'cloudflare-d1') errors.push('Importer target must be Cloudflare D1.');
for (const field of ['idempotency_key','pre_import_bookmark','post_import_verification','rollback_receipt']) {
  if (!config.handoffContract?.importerToProduction?.required?.includes(field)) errors.push(`Importer handoff must require ${field}.`);
}

const report = { ok: errors.length === 0, errors, laneCount: lanes.length, laneIds: [...ids].sort() };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

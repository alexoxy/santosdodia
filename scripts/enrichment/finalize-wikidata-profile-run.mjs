#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

export function finalizeWikidataProfileRun({ config, plan, raw, normalized, previousProgress = null, now = new Date() } = {}) {
  if (config?.schemaVersion !== 1 || config?.enrichmentId !== 'saints-profile-v1') throw new Error('Profile enrichment config has the wrong identity/schema.');
  if (!plan?.shouldRun || plan?.completed === true || plan?.enrichmentId !== config.enrichmentId) throw new Error('Cannot finalize a non-running profile plan.');
  if (raw?.mode !== 'archive-only' || raw?.publish !== false || raw?.productionMutation !== false) throw new Error('Raw profile package opened a prohibited publication gate.');
  if (normalized?.publish !== false || normalized?.productionMutation !== false) throw new Error('Normalized profile package opened a prohibited publication gate.');
  for (const packageValue of [raw, normalized]) {
    if (packageValue?.enrichmentId !== config.enrichmentId || packageValue?.sourceId !== config.sourceId) throw new Error('Profile package identity mismatch.');
    if (packageValue?.identityRootSha256 !== plan.identityRootSha256) throw new Error('Profile package identity root mismatch.');
    if (packageValue?.startEntityOffset !== plan.startEntityOffset || packageValue?.nextEntityOffset !== plan.nextEntityOffset || packageValue?.entityCount !== plan.entityCount) throw new Error('Profile package cursor differs from plan.');
  }
  if (JSON.stringify(raw.selectedQids) !== JSON.stringify(plan.selectedQids)) throw new Error('Raw profile QIDs differ from the plan.');
  if (normalized.entityCount !== plan.entityCount || !Array.isArray(normalized.entities) || normalized.entities.length !== plan.entityCount) throw new Error('Normalized profile entity count differs from the plan.');
  if (!raw.responseSha256 || raw.responseSha256 !== normalized.rawResponseSha256 || !Number.isSafeInteger(raw.responseBytes) || raw.responseBytes < 1) throw new Error('Profile response integrity metadata is incomplete.');
  if (!Array.isArray(raw.attempts) || raw.attempts.length < 1 || raw.attempts.at(-1)?.outcome !== 'success') throw new Error('Profile acquisition does not end in success.');
  if (normalized.entities.some((entity) => entity.entityId !== `wikidata:${entity.qid}` || entity.identityBasis !== 'exact-wikidata-identifier' || entity.publish !== false)) throw new Error('Normalized profile contains an unsafe identity/publication record.');

  const previousRuns = Number(previousProgress?.successfulRuns ?? 0);
  const previousEntities = Number(previousProgress?.cumulativeEntitiesRequested ?? 0);
  if (!Number.isSafeInteger(previousRuns) || previousRuns < 0 || !Number.isSafeInteger(previousEntities) || previousEntities < 0) throw new Error('Previous profile progress counters are invalid.');
  if (previousProgress) {
    if (previousProgress.identityRootSha256 !== plan.identityRootSha256) throw new Error('Previous profile progress belongs to another identity root.');
    if (previousProgress.nextEntityOffset !== plan.startEntityOffset) throw new Error('Previous profile cursor does not align with the current plan.');
  }

  const completed = plan.nextEntityOffset >= plan.identityCount;
  return {
    schemaVersion: 1,
    enrichmentId: config.enrichmentId,
    sourceId: config.sourceId,
    identityRootSha256: plan.identityRootSha256,
    updatedAt: new Date(now).toISOString(),
    completed,
    identityCount: plan.identityCount,
    nextEntityOffset: plan.nextEntityOffset,
    successfulRuns: previousRuns + 1,
    cumulativeEntitiesRequested: previousEntities + plan.entityCount,
    lastRun: {
      startEntityOffset: plan.startEntityOffset,
      nextEntityOffset: plan.nextEntityOffset,
      entityCount: plan.entityCount,
      rawStream: plan.rawStream,
      normalizedStream: plan.normalizedStream,
      responseSha256: raw.responseSha256,
      finishedAt: raw.finishedAt
    }
  };
}

function main() {
  const configPath = argument('--config', 'config/saints-profile-enrichment-v1.json');
  const planPath = argument('--plan');
  const rawPath = argument('--raw');
  const normalizedPath = argument('--normalized');
  const previousPath = argument('--previous-progress');
  const output = argument('--output');
  if (!planPath || !rawPath || !normalizedPath || !output) throw new Error('--plan, --raw, --normalized and --output are required.');
  const progress = finalizeWikidataProfileRun({
    config: readJson(configPath),
    plan: readJson(planPath),
    raw: readJson(rawPath),
    normalized: readJson(normalizedPath),
    previousProgress: previousPath && fs.existsSync(previousPath) ? readJson(previousPath) : null
  });
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(progress, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Wikidata profile finalization failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

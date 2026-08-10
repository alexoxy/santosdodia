#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

export function finalizeWikidataLabelRun({ config, plan, raw, normalized, previousProgress = null, now = new Date() } = {}) {
  if (config?.schemaVersion !== 1 || config?.enrichmentId !== 'saints-labels-v2') throw new Error('Labels v2 config has the wrong identity/schema.');
  if (!plan?.shouldRun || plan.completed || plan.enrichmentId !== config.enrichmentId) throw new Error('Cannot finalize a non-running Labels v2 plan.');
  if (raw?.mode !== 'archive-only' || raw?.publish !== false || raw?.productionMutation !== false || normalized?.publish !== false || normalized?.productionMutation !== false) throw new Error('Labels v2 opened a prohibited publication gate.');
  for (const value of [raw, normalized]) {
    if (value?.enrichmentId !== config.enrichmentId || value?.sourceId !== config.sourceId || value?.identityRootSha256 !== plan.identityRootSha256) throw new Error('Labels v2 package identity mismatch.');
    if (value?.startEntityOffset !== plan.startEntityOffset || value?.nextEntityOffset !== plan.nextEntityOffset || value?.entityCount !== plan.entityCount) throw new Error('Labels v2 package cursor mismatch.');
  }
  if (raw.requestCount !== plan.expectedRequestCount || !Array.isArray(raw.requests) || raw.requests.length !== plan.expectedRequestCount) throw new Error('Labels v2 request count mismatch.');
  if (JSON.stringify(raw.selectedQids) !== JSON.stringify(plan.selectedQids)) throw new Error('Labels v2 requested QIDs differ from plan.');
  if (!Array.isArray(normalized.entities) || normalized.entities.length !== plan.entityCount) throw new Error('Labels v2 normalized entity count mismatch.');
  if (normalized.languageFallbacksEnabled !== false || normalized.automaticCanonicalNameSelection !== false || normalized.sourceEvidenceOnly !== true) throw new Error('Labels v2 linguistic safeguards were not preserved.');
  for (const request of raw.requests) if (!request.responseSha256 || !Number.isSafeInteger(request.responseBytes) || request.responseBytes < 1 || request.attempts?.at(-1)?.outcome !== 'success') throw new Error('Labels v2 raw response integrity is incomplete.');
  for (const entity of normalized.entities) if (entity.entityId !== `wikidata:${entity.qid}` || entity.identityBasis !== 'exact-wikidata-identifier' || entity.publish !== false) throw new Error('Labels v2 normalized identity is unsafe.');

  const previousRuns = Number(previousProgress?.successfulRuns ?? 0);
  const previousEntities = Number(previousProgress?.cumulativeEntitiesRequested ?? 0);
  if (!Number.isSafeInteger(previousRuns) || previousRuns < 0 || !Number.isSafeInteger(previousEntities) || previousEntities < 0) throw new Error('Previous Labels v2 counters are invalid.');
  if (previousProgress && (previousProgress.identityRootSha256 !== plan.identityRootSha256 || previousProgress.nextEntityOffset !== plan.startEntityOffset)) throw new Error('Previous Labels v2 watermark does not align with the current plan.');
  return {
    schemaVersion: 1,
    enrichmentId: config.enrichmentId,
    sourceId: config.sourceId,
    identityRootSha256: plan.identityRootSha256,
    updatedAt: new Date(now).toISOString(),
    completed: plan.nextEntityOffset >= plan.identityCount,
    identityCount: plan.identityCount,
    nextEntityOffset: plan.nextEntityOffset,
    successfulRuns: previousRuns + 1,
    cumulativeEntitiesRequested: previousEntities + plan.entityCount,
    lastRun: {
      startEntityOffset: plan.startEntityOffset,
      nextEntityOffset: plan.nextEntityOffset,
      entityCount: plan.entityCount,
      requestCount: raw.requestCount,
      missingQidCount: normalized.missingQids?.length ?? 0,
      rawStream: plan.rawStream,
      normalizedStream: plan.normalizedStream,
      finishedAt: raw.finishedAt
    }
  };
}

function main() {
  const planPath = argument('--plan'); const rawPath = argument('--raw'); const normalizedPath = argument('--normalized'); const output = argument('--output');
  if (!planPath || !rawPath || !normalizedPath || !output) throw new Error('--plan, --raw, --normalized and --output are required.');
  const previous = argument('--previous-progress');
  const progress = finalizeWikidataLabelRun({ config: readJson(argument('--config', 'config/saints-label-enrichment-v2.json')), plan: readJson(planPath), raw: readJson(rawPath), normalized: readJson(normalizedPath), previousProgress: previous && fs.existsSync(previous) ? readJson(previous) : null });
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(path.resolve(output), `${JSON.stringify(progress, null, 2)}\n`, 'utf8'); process.stdout.write(`${JSON.stringify(progress, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }

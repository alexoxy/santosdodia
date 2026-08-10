#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

export function finalizeWikidataLabelEnrichment({ config, plan, summary, previousProgress = null, now = new Date() } = {}) {
  if (!plan?.shouldRun || plan.completed === true) throw new Error('Cannot finalize a non-running labels plan.');
  if (summary?.status !== 'fetched' || summary.mode !== 'archive-only' || summary.publish !== false) throw new Error('Wikidata labels raw summary is not a completed archive-only run.');
  if (summary.acquisitionVersion !== config.acquisitionVersion || summary.adapterVersion !== config.adapterVersion) throw new Error('Wikidata labels run version mismatch.');
  if (summary.identityRootSha256 !== config.identityRootSha256 || plan.identityRootSha256 !== config.identityRootSha256) throw new Error('Wikidata labels identity root mismatch.');
  if (summary.startEntityOffset !== plan.startEntityOffset || summary.nextEntityOffset !== plan.nextEntityOffset || summary.entityCount !== plan.entityCount) throw new Error('Wikidata labels run cursor differs from the plan.');
  if (summary.requestCount !== plan.expectedRequestCount || !Array.isArray(summary.requests) || summary.requests.length !== plan.expectedRequestCount) throw new Error('Wikidata labels request count differs from the plan.');
  if (summary.languageFallbacksEnabled !== false || summary.automaticCanonicalNameSelection !== false || summary.sourceEvidenceOnly !== true) throw new Error('Wikidata labels run opened a prohibited linguistic/publication gate.');
  const requestQids = summary.requests.flatMap((request) => request.qids ?? []);
  if (JSON.stringify(requestQids) !== JSON.stringify(plan.selectedQids)) throw new Error('Wikidata labels run requested QIDs differ from the plan.');
  for (const request of summary.requests) {
    if (!request.responseSha256 || !Number.isSafeInteger(request.responseBytes) || request.responseBytes < 1) throw new Error('Wikidata labels raw response integrity metadata is incomplete.');
    if (!Array.isArray(request.attempts) || request.attempts.length < 1 || request.attempts.at(-1)?.outcome !== 'success') throw new Error('Wikidata labels request does not end in a verified successful attempt.');
  }

  const previousRuns = Number(previousProgress?.successfulRuns ?? 0);
  const previousEntities = Number(previousProgress?.cumulativeEntitiesRequested ?? 0);
  if (!Number.isSafeInteger(previousRuns) || previousRuns < 0 || !Number.isSafeInteger(previousEntities) || previousEntities < 0) throw new Error('Previous labels progress counters are invalid.');
  if (previousProgress && previousProgress.nextEntityOffset !== plan.startEntityOffset) throw new Error('Previous labels cursor does not align with the current plan.');

  const completed = plan.nextEntityOffset >= plan.identityCount;
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    acquisitionVersion: config.acquisitionVersion,
    adapterVersion: config.adapterVersion,
    identityRootSha256: config.identityRootSha256,
    updatedAt: new Date(now).toISOString(),
    completed,
    identityCount: plan.identityCount,
    nextEntityOffset: plan.nextEntityOffset,
    successfulRuns: previousRuns + 1,
    cumulativeEntitiesRequested: previousEntities + plan.entityCount,
    lastRun: {
      runId: summary.runId,
      startEntityOffset: plan.startEntityOffset,
      nextEntityOffset: plan.nextEntityOffset,
      entityCount: plan.entityCount,
      requestCount: summary.requestCount,
      rawStream: plan.rawStream,
      missingQidCount: summary.missingQidCount,
      siteLocaleCounts: summary.siteLocaleCounts,
      finishedAt: summary.finishedAt,
    },
  };
}

function main() {
  const configPath = argument('--config', 'config/saints-baseline-wikidata-labels.json');
  const planPath = argument('--plan');
  const summaryPath = argument('--summary');
  const previousPath = argument('--previous-progress');
  const output = argument('--output');
  if (!planPath || !summaryPath || !output) throw new Error('--plan, --summary and --output are required.');
  const progress = finalizeWikidataLabelEnrichment({
    config: readJson(configPath),
    plan: readJson(planPath),
    summary: readJson(summaryPath),
    previousProgress: previousPath && fs.existsSync(previousPath) ? readJson(previousPath) : null,
  });
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(progress, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(progress, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Wikidata label enrichment finalization failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

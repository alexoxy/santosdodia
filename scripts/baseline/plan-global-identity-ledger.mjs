#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

export function planGlobalIdentityLedger({
  progress,
  previousManifest = null,
  previousSourceBatches = null,
  previousLanguageCoverage = null,
  identityVersion = '1.0',
  languageCoverageVersion = null,
  queryVersion = 'recognition-v1',
} = {}) {
  if (!progress || progress.schemaVersion !== 1 || progress.baselineId !== 'saints-v1' || progress.sourceId !== 'wikidata') {
    throw new Error('Reviewed progress has the wrong identity/schema.');
  }
  let shouldRun = progress.sourceCompleted === true && progress.caughtUp === true;
  let reason = shouldRun ? 'reviewed-baseline-complete' : 'reviewed-baseline-not-complete';
  if (shouldRun && previousManifest && previousSourceBatches) {
    const sourceBatches = previousSourceBatches.batches ?? [];
    const last = sourceBatches.at(-1);
    const latest = progress.lastReviewed;
    const identityCurrent = previousManifest.identityVersion === identityVersion &&
      previousManifest.queryVersion === queryVersion &&
      previousManifest.sourceEntityOccurrences === progress.cumulativeEntitiesReviewed &&
      last?.startPage === latest?.sourceStartPage &&
      last?.nextPage === latest?.sourceNextPage &&
      last?.sourceRunId === latest?.sourceRunId;
    const languageCurrent = languageCoverageVersion === null || previousLanguageCoverage?.languageCoverageVersion === languageCoverageVersion;
    if (identityCurrent && languageCurrent) { shouldRun = false; reason = 'identity-ledger-already-current'; }
    else if (identityCurrent && !languageCurrent) reason = 'language-coverage-contract-changed';
  }
  return { schemaVersion: 1, shouldRun, reason };
}

function main() {
  const progressPath = argument('--review-progress');
  const output = argument('--output');
  if (!progressPath || !output) throw new Error('--review-progress and --output are required.');
  const previousManifestPath = argument('--previous-manifest');
  const previousSourceBatchesPath = argument('--previous-source-batches');
  const previousLanguageCoveragePath = argument('--previous-language-coverage');
  const plan = planGlobalIdentityLedger({
    progress: readJson(progressPath),
    previousManifest: previousManifestPath && fs.existsSync(previousManifestPath) ? readJson(previousManifestPath) : null,
    previousSourceBatches: previousSourceBatchesPath && fs.existsSync(previousSourceBatchesPath) ? readJson(previousSourceBatchesPath) : null,
    previousLanguageCoverage: previousLanguageCoveragePath && fs.existsSync(previousLanguageCoveragePath) ? readJson(previousLanguageCoveragePath) : null,
    identityVersion: argument('--identity-version', '1.0'),
    languageCoverageVersion: argument('--language-coverage-version'),
    queryVersion: argument('--query-version', 'recognition-v1'),
  });
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(plan, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Global identity ledger planning failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

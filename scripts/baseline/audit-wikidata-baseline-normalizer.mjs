#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/saints-baseline-wikidata.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root, 'config/automation-registry.json'), 'utf8'));
const workflowPath = path.join(root, '.github/workflows/normalize-saints-baseline-wikidata.yml');
const errors = [];

const expected = {
  queryVersion: 'recognition-v1',
  normalizationVersion: '1.1',
  progressStream: 'baseline-progress/saints/v1/wikidata/recognition-v1',
  rawStreamPrefix: 'baseline/saints/v1/raw/wikidata/recognition-v1',
  normalizationProgressStream: 'baseline-normalized-progress/saints/v1/wikidata/recognition-v1',
  normalizedStreamPrefix: 'baseline/saints/v1/normalized/wikidata/recognition-v1',
};
for (const [key, value] of Object.entries(expected)) {
  if (config[key] !== value) errors.push(`Baseline normalizer config ${key} must be ${value}.`);
}
if (config.policy?.normalizationReadsDropboxOnly !== true) errors.push('Baseline normalization must be explicitly Dropbox-only.');
if (config.policy?.productionPublication !== false) errors.push('Baseline normalization must not publish to production.');

if (!fs.existsSync(workflowPath)) {
  errors.push('Baseline normalization workflow is missing.');
} else {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const needle of [
    "workflows: ['Build Saints Baseline v1 candidates']",
    "cron: '43 * * * *'",
    `WIKIDATA_QUERY_VERSION: ${config.queryVersion}`,
    `NORMALIZATION_VERSION: '${config.normalizationVersion}'`,
    `ACQUISITION_PROGRESS_STREAM: ${config.progressStream}`,
    `RAW_STREAM_PREFIX: ${config.rawStreamPrefix}`,
    `NORMALIZATION_PROGRESS_STREAM: ${config.normalizationProgressStream}`,
    `NORMALIZED_STREAM_PREFIX: ${config.normalizedStreamPrefix}`,
    'npm run dropbox:pull-stream',
    'npm run osint:normalize',
    'Archive immutable NORMALIZED batch in Dropbox',
    'Advance verified normalization watermark',
  ]) {
    if (!workflow.includes(needle)) errors.push(`Baseline normalization workflow is missing required contract: ${needle}`);
  }
  for (const forbidden of ['scripts/osint/adapters/', 'wikidata.org', 'OSINT_WIKIDATA_PAGE_SIZE', 'OSINT_WIKIDATA_MAX_PAGES', 'run-manifest.mjs']) {
    if (workflow.includes(forbidden)) errors.push(`Baseline normalizer contains forbidden acquisition dependency: ${forbidden}`);
  }
  if (!workflow.includes("reason: previous ? (targetIsLatest ? 'normalize-latest-source-run' : 'drain-normalization-backlog')")) {
    const planner = fs.readFileSync(path.join(root, 'scripts/baseline/plan-wikidata-baseline-normalization.mjs'), 'utf8');
    if (!planner.includes("'drain-normalization-backlog'")) errors.push('Baseline normalizer planner has no ordered backlog-drain state.');
  }
}

const task = (registry.tasks ?? []).find((item) => item.id === 'saints-baseline-v1-normalizer');
if (!task) errors.push('Automation registry is missing saints-baseline-v1-normalizer.');
else {
  if (task.mode !== 'scheduled') errors.push('Baseline normalizer must retain a scheduled recovery path.');
  if (JSON.stringify(task.crons) !== JSON.stringify(['43 * * * *'])) errors.push('Baseline normalizer recovery cron must be hourly at minute 43 UTC.');
  if (task.publicationMode !== 'staging-only') errors.push('Baseline normalizer must remain staging-only.');
  if (task.archiveStream !== config.normalizedStreamPrefix) errors.push('Baseline normalizer registry archive stream differs from epoch config.');
}

const report = {
  ok: errors.length === 0,
  errors,
  queryVersion: config.queryVersion,
  normalizationVersion: config.normalizationVersion,
  rawStreamPrefix: config.rawStreamPrefix,
  normalizedStreamPrefix: config.normalizedStreamPrefix,
  recoveryCron: task?.crons?.[0] ?? null,
  generatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

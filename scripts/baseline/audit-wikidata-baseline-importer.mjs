#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/saints-baseline-wikidata.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root, 'config/automation-registry.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const workflowPath = path.join(root, '.github/workflows/import-saints-baseline-d1.yml');
const builderPath = path.join(root, 'scripts/autonomy/build-knowledge-d1-batch.mjs');
const managerPath = path.join(root, 'scripts/manage-d1-knowledge-staging.mjs');
const bootstrapGuardPath = path.join(root, 'scripts/baseline/check-wikidata-baseline-d1-chunk.mjs');
const errors = [];

const expected = {
  d1ImportVersion: '1.0',
  d1ImportEntityLimit: 125,
  d1ImportMaxRowsWrittenPerChunk: 2000,
  d1ImportMaxOperationsPerUtcDay: 1,
  d1ImportMaxRowsWrittenPerUtcDay: 2000,
  reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
  importProgressStream: 'baseline-import-progress/saints/v1/wikidata/recognition-v1',
  importReceiptStreamPrefix: 'baseline-import-receipts/saints/v1/wikidata/recognition-v1',
};
for (const [key, value] of Object.entries(expected)) if (config[key] !== value) errors.push(`Baseline importer config ${key} must equal ${value}.`);
if (config.d1ImportMaxRowsWrittenPerChunk * config.d1ImportMaxOperationsPerUtcDay !== config.d1ImportMaxRowsWrittenPerUtcDay) {
  errors.push('Baseline importer row ceiling must equal per-chunk row ceiling × allowed operation ceiling.');
}
if (config.d1ImportMaxRowsWrittenPerUtcDay > 2000) errors.push('Baseline autonomous D1 row ceiling may not exceed 2,000 rows in the weekly operating day.');
for (const flag of ['importReadsReviewedDropboxOnly','d1StagingOnly','withheldLocalizedNamesNeverEnterDisplayTable','baselineBootstrapThroughputOnly','transientSourceFailuresRetryWithoutCursorAdvance','freshRequestTimeoutPerRetryAttempt']) {
  if (config.policy?.[flag] !== true) errors.push(`Baseline importer/upstream policy ${flag} must be true.`);
}
if (config.policy?.productionPublication !== false) errors.push('Baseline importer must not publish to production.');

if (packageJson.scripts?.['db:knowledge-import'] !== 'node scripts/manage-d1-knowledge-staging.mjs') {
  errors.push('db:knowledge-import must remain bound to scripts/manage-d1-knowledge-staging.mjs.');
}

if (!fs.existsSync(bootstrapGuardPath)) errors.push('Baseline-specific D1 bootstrap row guard is missing.');
else {
  const guard = fs.readFileSync(bootstrapGuardPath, 'utf8');
  for (const needle of ['d1ImportMaxRowsWrittenPerChunk','d1ImportMaxOperationsPerUtcDay','d1ImportMaxRowsWrittenPerUtcDay','statementCount']) {
    if (!guard.includes(needle)) errors.push(`Baseline D1 bootstrap guard is missing ${needle}.`);
  }
}

if (!fs.existsSync(workflowPath)) errors.push('Baseline importer workflow is missing.');
else {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const needle of [
    "workflows: ['Review Saints Baseline v1 language']",
    "D1_ENTITY_LIMIT: '125'",
    "D1_MAX_ROWS_PER_CHUNK: '2000'",
    "D1_MAX_OPERATIONS_PER_DAY: '1'",
    `REVIEW_PROGRESS_STREAM: ${config.languageReviewProgressStream}`,
    `REVIEWED_STREAM_PREFIX: ${config.reviewedStreamPrefix}`,
    `IMPORT_PROGRESS_STREAM: ${config.importProgressStream}`,
    `IMPORT_RECEIPT_PREFIX: ${config.importReceiptStreamPrefix}`,
    'check-d1-daily-budget.mjs',
    '--maximum "$D1_MAX_OPERATIONS_PER_DAY"',
    'check-wikidata-baseline-d1-chunk.mjs',
    'npm run db:knowledge-import',
    'finalize-wikidata-baseline-import.mjs',
  ]) if (!workflow.includes(needle)) errors.push(`Baseline importer workflow is missing required contract: ${needle}`);
  if (/\bcron:/u.test(workflow)) errors.push('Baseline D1 importer must not poll on an independent cron; the weekly language-review completion drives it.');

  const prepareStart = workflow.indexOf('  prepare-reviewed-chunk:');
  const d1Start = workflow.indexOf('  import-d1-staging:');
  const archiveStart = workflow.indexOf('  archive-import-receipt:');
  if (!(prepareStart >= 0 && d1Start > prepareStart && archiveStart > d1Start)) errors.push('Importer credential-isolation jobs are missing or reordered.');
  else {
    const prepare = workflow.slice(prepareStart, d1Start);
    const d1 = workflow.slice(d1Start, archiveStart);
    const archive = workflow.slice(archiveStart);
    if (/CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_API_TOKEN/u.test(prepare)) errors.push('Prepare job must not receive Cloudflare credentials.');
    if (/DROPBOX_APP_KEY|DROPBOX_APP_SECRET|DROPBOX_REFRESH_TOKEN/u.test(d1)) errors.push('D1 job must not receive Dropbox credentials.');
    if (/CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_API_TOKEN/u.test(archive)) errors.push('Receipt archive job must not receive Cloudflare credentials.');
    if (!/DROPBOX_APP_KEY/u.test(prepare) || !/DROPBOX_APP_KEY/u.test(archive)) errors.push('Dropbox credentials must be scoped to prepare/archive jobs only.');
    if (!/CLOUDFLARE_ACCOUNT_ID/u.test(d1) || !/CLOUDFLARE_API_TOKEN/u.test(d1)) errors.push('D1 staging job is missing scoped Cloudflare credentials.');
  }
}

const builder = fs.readFileSync(builderPath, 'utf8');
for (const needle of ['--entity-offset','--entity-limit','withheld-by-language-editor','is_preferred=0','localized-name-decisions.jsonl','sourceOnlyIsNotCanonical']) {
  if (!builder.includes(needle)) errors.push(`D1 builder is missing reviewed-name/chunk safety: ${needle}`);
}
if (!builder.includes('entityOffset') || !builder.includes('nextEntityOffset') || !builder.includes('chunkFingerprint')) errors.push('D1 builder is missing chunk cursor metadata.');

const manager = fs.readFileSync(managerPath, 'utf8');
for (const needle of ['applyBatchWithRollback','restoreDatabaseBookmark','verifiedIdempotent: true','productionMutation: false']) if (!manager.includes(needle)) errors.push(`D1 manager is missing rollback/idempotency safeguard: ${needle}`);

const sharedBudget = fs.readFileSync(path.join(root, 'scripts/autonomy/check-d1-daily-budget.mjs'), 'utf8');
if (sharedBudget.includes('event=workflow_dispatch')) errors.push('Shared D1 budget must count all trigger types, not only workflow_dispatch.');
for (const needle of ['canonicalBudgetRuns','effectiveMaximum','assertWeeklyD1Window','--maximum']) if (!sharedBudget.includes(needle)) errors.push(`Shared D1 budget is missing ${needle}.`);

const task = (registry.tasks ?? []).find((item) => item.id === 'saints-baseline-v1-importer');
if (!task) errors.push('Automation registry is missing saints-baseline-v1-importer.');
else {
  if (task.mode !== 'event-driven' || JSON.stringify(task.crons) !== JSON.stringify([])) errors.push('Baseline importer must be event-driven from the weekly review workflow and have no recovery polling cron.');
  if (task.publicationMode !== 'staging-only') errors.push('Baseline importer must remain staging-only.');
  if (task.archiveStream !== config.importReceiptStreamPrefix) errors.push('Baseline importer receipt stream differs from config.');
}

const report = {
  ok: errors.length === 0,
  errors,
  d1ImportVersion: config.d1ImportVersion,
  entityLimit: config.d1ImportEntityLimit,
  maxRowsPerChunk: config.d1ImportMaxRowsWrittenPerChunk,
  maxOperationsPerUtcDay: config.d1ImportMaxOperationsPerUtcDay,
  maxRowsPerUtcDay: config.d1ImportMaxRowsWrittenPerUtcDay,
  reviewedStreamPrefix: config.reviewedStreamPrefix,
  importProgressStream: config.importProgressStream,
  importReceiptStreamPrefix: config.importReceiptStreamPrefix,
  importCommand: packageJson.scripts?.['db:knowledge-import'] ?? null,
  mode: task?.mode ?? null,
  generatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

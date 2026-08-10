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
const errors = [];

const expected = {
  d1ImportVersion: '1.0',
  d1ImportEntityLimit: 200,
  reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
  importProgressStream: 'baseline-import-progress/saints/v1/wikidata/recognition-v1',
  importReceiptStreamPrefix: 'baseline-import-receipts/saints/v1/wikidata/recognition-v1',
};
for (const [key, value] of Object.entries(expected)) if (config[key] !== value) errors.push(`Baseline importer config ${key} must equal ${value}.`);
for (const flag of ['importReadsReviewedDropboxOnly','d1StagingOnly','withheldLocalizedNamesNeverEnterDisplayTable']) if (config.policy?.[flag] !== true) errors.push(`Baseline importer policy ${flag} must be true.`);
if (config.policy?.productionPublication !== false) errors.push('Baseline importer must not publish to production.');

if (packageJson.scripts?.['db:knowledge-import'] !== 'node scripts/manage-d1-knowledge-staging.mjs') {
  errors.push('db:knowledge-import must remain bound to scripts/manage-d1-knowledge-staging.mjs.');
}

if (!fs.existsSync(workflowPath)) errors.push('Baseline importer workflow is missing.');
else {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const needle of [
    "workflows: ['Review Saints Baseline v1 language']",
    "cron: '7 6 * * *'",
    "D1_ENTITY_LIMIT: '200'",
    `REVIEW_PROGRESS_STREAM: ${config.languageReviewProgressStream}`,
    `REVIEWED_STREAM_PREFIX: ${config.reviewedStreamPrefix}`,
    `IMPORT_PROGRESS_STREAM: ${config.importProgressStream}`,
    `IMPORT_RECEIPT_PREFIX: ${config.importReceiptStreamPrefix}`,
    'check-d1-daily-budget.mjs',
    'npm run db:knowledge-import',
    'finalize-wikidata-baseline-import.mjs',
  ]) if (!workflow.includes(needle)) errors.push(`Baseline importer workflow is missing required contract: ${needle}`);

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
for (const needle of [
  '--entity-offset',
  '--entity-limit',
  'withheld-by-language-editor',
  'is_preferred=0',
  'localized-name-decisions.jsonl',
  'sourceOnlyIsNotCanonical',
]) if (!builder.includes(needle)) errors.push(`D1 builder is missing reviewed-name/chunk safety: ${needle}`);
if (!builder.includes('entityOffset') || !builder.includes('nextEntityOffset') || !builder.includes('chunkFingerprint')) errors.push('D1 builder is missing chunk cursor metadata.');

const manager = fs.readFileSync(managerPath, 'utf8');
for (const needle of ['applyBatchWithRollback','restoreDatabaseBookmark','verifiedIdempotent: true','productionMutation: false']) if (!manager.includes(needle)) errors.push(`D1 manager is missing rollback/idempotency safeguard: ${needle}`);

const sharedBudget = fs.readFileSync(path.join(root, 'scripts/autonomy/check-d1-daily-budget.mjs'), 'utf8');
if (sharedBudget.includes('event=workflow_dispatch')) errors.push('Shared D1 budget must count all trigger types, not only workflow_dispatch.');
if (!sharedBudget.includes('workflows')) errors.push('Shared D1 budget must aggregate multiple autonomous importer workflows.');
if (!sharedBudget.includes('canonicalBudgetRuns')) errors.push('Shared D1 budget must canonicalize and deduplicate run IDs before accounting.');

const task = (registry.tasks ?? []).find((item) => item.id === 'saints-baseline-v1-importer');
if (!task) errors.push('Automation registry is missing saints-baseline-v1-importer.');
else {
  if (task.mode !== 'scheduled' || JSON.stringify(task.crons) !== JSON.stringify(['7 6 * * *'])) errors.push('Baseline importer must retain daily recovery at 06:07 UTC.');
  if (task.publicationMode !== 'staging-only') errors.push('Baseline importer must remain staging-only.');
  if (task.archiveStream !== config.importReceiptStreamPrefix) errors.push('Baseline importer receipt stream differs from config.');
}

const report = {
  ok: errors.length === 0,
  errors,
  d1ImportVersion: config.d1ImportVersion,
  entityLimit: config.d1ImportEntityLimit,
  reviewedStreamPrefix: config.reviewedStreamPrefix,
  importProgressStream: config.importProgressStream,
  importReceiptStreamPrefix: config.importReceiptStreamPrefix,
  importCommand: packageJson.scripts?.['db:knowledge-import'] ?? null,
  generatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

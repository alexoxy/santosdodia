import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  assertActualD1Usage,
  assertDailyActionBudget,
  assertOsintRecordCount,
  auditRepository,
  estimateBatchUsage,
  estimateCalendarPackageUsage,
  loadGuardrails,
  relevantRunsToday,
  summarizeD1Usage
} from './cloudflare-free-guardrails.mjs';

const policy = loadGuardrails();
assert.equal(policy.plan, 'workers-free');
assert.deepEqual(assertOsintRecordCount(500, policy), { records: 500, maximum: 500 });
assert.throws(() => assertOsintRecordCount(501, policy), /maximum is 500/);

const smallPackage = {
  sources: [{ id: 'source-1' }],
  policies: [{ id: 'policy-1' }],
  rules: [{ id: 'rule-1', canonicalEventId: 'event-1' }],
  occurrences: [{ id: 'occurrence-1', canonicalEventId: 'event-1' }],
  labels: [{ occurrenceId: 'occurrence-1' }],
  assertions: [{ occurrenceId: 'occurrence-1' }]
};
const estimate = estimateCalendarPackageUsage(smallPackage, policy);
assert.equal(estimate.counts.occurrences, 1);
assert.ok(estimate.estimatedRowsWritten < policy.autonomousLimits.d1EstimatedRowsWrittenPerOperation);

const oversizedPackage = { labels: Array.from({ length: 13_000 }, (_, index) => ({ id: index })) };
assert.throws(() => estimateCalendarPackageUsage(oversizedPackage, policy), /rows written/);

const safeBatch = {
  statementCount: 2,
  statements: ['INSERT INTO example VALUES (1)', 'SELECT 1']
};
assert.equal(estimateBatchUsage(safeBatch, policy).statementCount, 2);
assert.throws(() => estimateBatchUsage({
  statementCount: 10_001,
  statements: Array.from({ length: 10_001 }, () => 'SELECT 1')
}, policy), /maximum is 10000/);

const now = new Date('2026-08-07T01:00:00Z');
const todayRun = { id: 10, status: 'completed', conclusion: 'success', created_at: '2026-08-07T00:30:00Z' };
const yesterdayRun = { id: 11, status: 'completed', conclusion: 'success', created_at: '2026-08-06T23:59:59Z' };
const currentRun = { id: 12, status: 'in_progress', conclusion: null, created_at: '2026-08-07T00:45:00Z' };
assert.equal(relevantRunsToday([todayRun, yesterdayRun, currentRun], { currentRunId: 12, now }).length, 1);
assert.throws(() => assertDailyActionBudget([todayRun, currentRun], {
  currentRunId: 12,
  maximum: 1,
  now
}), /budget is exhausted/);
assert.deepEqual(assertDailyActionBudget([yesterdayRun, currentRun], {
  currentRunId: 12,
  maximum: 1,
  now
}), { used: 0, maximum: 1, resetAt: '2026-08-08T00:00:00.000Z' });

const usage = summarizeD1Usage([
  { meta: { rows_read: 100, rows_written: 20 } },
  { results: [{ meta: { rows_read: 50, rows_written: 5 } }] }
]);
assert.deepEqual(usage, { rowsRead: 150, rowsWritten: 25, queryCount: 2 });
assert.deepEqual(assertActualD1Usage(usage, policy), { rowsRead: 150, rowsWritten: 25 });

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdodia-cf-guard-'));
fs.mkdirSync(path.join(temporaryRoot, '.github/workflows'), { recursive: true });
fs.writeFileSync(path.join(temporaryRoot, 'wrangler.jsonc'), JSON.stringify({
  preview_urls: false,
  observability: { enabled: true, head_sampling_rate: 0.1 }
}, null, 2));
fs.writeFileSync(path.join(temporaryRoot, '.github/workflows/quality.yml'), 'name: Quality\non: pull_request\n');
assert.equal(auditRepository(temporaryRoot, policy).workflowFilesChecked, 1);
fs.writeFileSync(path.join(temporaryRoot, 'wrangler.jsonc'), JSON.stringify({
  preview_urls: false,
  observability: { enabled: true, head_sampling_rate: 1 }
}, null, 2));
assert.throws(() => auditRepository(temporaryRoot, policy), /sampled at 10%/);
fs.writeFileSync(path.join(temporaryRoot, 'wrangler.jsonc'), JSON.stringify({
  preview_urls: false,
  observability: { enabled: true, head_sampling_rate: 0.1 }
}, null, 2));
fs.writeFileSync(path.join(temporaryRoot, '.github/workflows/deploy.yml'), 'run: npm run cloudflare:deploy\n');
assert.throws(() => auditRepository(temporaryRoot, policy), /deployment command is forbidden/);
fs.rmSync(temporaryRoot, { recursive: true, force: true });

assert.doesNotThrow(() => auditRepository(process.cwd(), policy));
const productionWrangler = fs.readFileSync(path.resolve('wrangler.jsonc'), 'utf8');
assert.match(productionWrangler, /"binding"\s*:\s*"CALENDAR_DB"/);
assert.match(productionWrangler, /"database_name"\s*:\s*"santosdodia-production"/);
assert.match(productionWrangler, /"database_id"\s*:\s*"e1ad3640-b334-49d1-a6fc-a73f54924803"/);
assert.doesNotMatch(productionWrangler, /"binding"\s*:\s*"CALENDAR_DB"[\s\S]{0,180}"database_name"\s*:\s*"santosdodia-staging"/);
console.log('Cloudflare Free guardrails passed.');
#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const inputArg = argument('--input');
if (!inputArg) throw new Error('--input is required.');
const batch = JSON.parse(fs.readFileSync(path.resolve(inputArg), 'utf8'));
const config = JSON.parse(fs.readFileSync('config/saints-baseline-wikidata.json', 'utf8'));

const entityLimit = Number(config.d1ImportEntityLimit);
const maxRowsPerChunk = Number(config.d1ImportMaxRowsWrittenPerChunk);
const maxOperationsPerDay = Number(config.d1ImportMaxOperationsPerUtcDay);
const maxRowsPerDay = Number(config.d1ImportMaxRowsWrittenPerUtcDay);

for (const [name, value] of Object.entries({ entityLimit, maxRowsPerChunk, maxOperationsPerDay, maxRowsPerDay })) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`Invalid baseline D1 bootstrap limit: ${name}.`);
}
if (maxRowsPerChunk * maxOperationsPerDay !== maxRowsPerDay) {
  throw new Error('Baseline D1 daily row ceiling must equal per-chunk rows × daily operations.');
}
if (maxRowsPerDay > 40000) {
  throw new Error('Baseline D1 bootstrap safety ceiling may not exceed 40,000 rows written per UTC day.');
}
if (config.policy?.baselineBootstrapThroughputOnly !== true || config.policy?.d1StagingOnly !== true || config.policy?.productionPublication !== false) {
  throw new Error('Baseline D1 bootstrap policy is not staging-only/closed-production.');
}
if (!Number.isSafeInteger(batch.entityCount) || batch.entityCount < 1 || batch.entityCount > entityLimit) {
  throw new Error(`D1 chunk entityCount ${batch.entityCount} exceeds baseline limit ${entityLimit}.`);
}
if (!Number.isSafeInteger(batch.statementCount) || batch.statementCount < 1 || batch.statementCount > maxRowsPerChunk) {
  throw new Error(`D1 chunk statementCount ${batch.statementCount} exceeds baseline row-write ceiling ${maxRowsPerChunk}.`);
}
if (!Array.isArray(batch.statements) || batch.statements.length !== batch.statementCount) {
  throw new Error('D1 chunk statement count does not match statements payload.');
}
if (batch.atomic !== true || !batch.idempotencyKey || !batch.statementsSha256) {
  throw new Error('D1 chunk is missing atomic/idempotency/integrity safeguards.');
}

const report = {
  ok: true,
  baselineId: config.baselineId,
  queryVersion: config.queryVersion,
  entityCount: batch.entityCount,
  entityLimit,
  statementCount: batch.statementCount,
  maxRowsPerChunk,
  maxOperationsPerUtcDay: maxOperationsPerDay,
  maxRowsPerUtcDay: maxRowsPerDay,
  productionPublication: false,
};
console.log(JSON.stringify(report, null, 2));

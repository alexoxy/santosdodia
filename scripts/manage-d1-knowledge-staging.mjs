#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  applyBatchWithRollback,
  queryDatabase,
  restoreDatabaseBookmark,
  validateBatchPackage,
  validateDatabaseId,
} from './d1-staging-api.mjs';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function row(result) {
  const first = Array.isArray(result) ? result[0] : result;
  return first?.results?.[0] ?? null;
}

const databaseId = validateDatabaseId(argument('--database-id'));
const packagePath = argument('--package');
const outputPath = argument('--output', 'reports/d1-knowledge-import.json');
if (!packagePath) throw new Error('--package is required.');
const accountId = requiredEnvironment('CLOUDFLARE_ACCOUNT_ID');
const token = requiredEnvironment('CLOUDFLARE_API_TOKEN');
const batchPackage = JSON.parse(fs.readFileSync(path.resolve(packagePath), 'utf8'));
validateBatchPackage(batchPackage);
if (batchPackage.lane !== 'saints' || !batchPackage.sourceId || !batchPackage.idempotencyKey) {
  throw new Error('Knowledge batch is missing lane/source/idempotency metadata.');
}
if (!Number.isInteger(batchPackage.entityCount) || batchPackage.entityCount < 1) {
  throw new Error('Knowledge batch entityCount must be positive.');
}

const prefix = `${batchPackage.sourceId}:%`;
const countSql = `SELECT
  (SELECT COUNT(*) FROM knowledge_entities WHERE id LIKE ?) AS entities,
  (SELECT COUNT(*) FROM knowledge_assertions WHERE subject_entity_id LIKE ?) AS assertions,
  (SELECT COUNT(*) FROM knowledge_evidence e JOIN knowledge_assertions a ON a.id = e.assertion_id WHERE a.subject_entity_id LIKE ?) AS evidence;`;
const params = [prefix, prefix, prefix];

const before = row(await queryDatabase({ accountId, token, databaseId, sql: countSql, params }));
const first = await applyBatchWithRollback({ accountId, token, databaseId, batchPackage });
let afterFirst;
try {
  afterFirst = row(await queryDatabase({ accountId, token, databaseId, sql: countSql, params }));
  if (!afterFirst) throw new Error('Post-import verification returned no counts.');
  if (Number(afterFirst.entities) < batchPackage.entityCount) {
    throw new Error(`Post-import entity count ${afterFirst.entities} is below package count ${batchPackage.entityCount}.`);
  }
} catch (error) {
  const restored = await restoreDatabaseBookmark({ accountId, token, databaseId, bookmark: first.bookmarkBefore });
  throw new Error(`Knowledge verification failed and D1 was restored: ${error.message}; restore=${restored.message ?? 'ok'}`);
}

const second = await applyBatchWithRollback({ accountId, token, databaseId, batchPackage });
let afterSecond;
try {
  afterSecond = row(await queryDatabase({ accountId, token, databaseId, sql: countSql, params }));
  if (!afterSecond || JSON.stringify(afterSecond) !== JSON.stringify(afterFirst)) {
    throw new Error('Second application changed source-partition counts; import is not idempotent.');
  }
} catch (error) {
  const restored = await restoreDatabaseBookmark({ accountId, token, databaseId, bookmark: second.bookmarkBefore });
  throw new Error(`Idempotency verification failed and the second apply was restored: ${error.message}; restore=${restored.message ?? 'ok'}`);
}

const receipt = {
  schemaVersion: 1,
  operation: 'autonomous-knowledge-staging-import',
  lane: batchPackage.lane,
  partition: batchPackage.partition,
  sourceId: batchPackage.sourceId,
  sourceRunId: batchPackage.sourceRunId,
  idempotencyKey: batchPackage.idempotencyKey,
  databaseId,
  statementCount: first.statementCount,
  bookmarkBeforeImport: first.bookmarkBefore,
  bookmarkBeforeIdempotencyCheck: second.bookmarkBefore,
  countsBefore: before,
  countsAfter: afterFirst,
  verifiedIdempotent: true,
  productionMutation: false,
  completedAt: new Date().toISOString(),
};
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(receipt, null, 2));

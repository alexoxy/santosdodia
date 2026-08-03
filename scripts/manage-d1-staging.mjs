import fs from 'node:fs';
import path from 'node:path';
import {
  applyBatchWithRollback,
  provisionStagingDatabase,
  queryDatabase,
  validateDatabaseId
} from './d1-staging-api.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const command = process.argv[2];
const accountId = requiredEnvironment('CLOUDFLARE_ACCOUNT_ID');
const token = requiredEnvironment('CLOUDFLARE_API_TOKEN');

if (command === 'provision') {
  const outputPath = argument('--output') ?? 'reports/d1-staging-provision.json';
  const result = await provisionStagingDatabase({ accountId, token });
  const database = result.database ?? {};
  const receipt = {
    schemaVersion: 1,
    operation: 'provision',
    created: result.created,
    database: {
      uuid: database.uuid,
      name: database.name,
      jurisdiction: database.jurisdiction,
      createdAt: database.created_at
    },
    completedAt: new Date().toISOString()
  };
  writeJson(outputPath, receipt);
  console.log(JSON.stringify(receipt));
  process.exit(0);
}

if (command === 'apply') {
  const databaseId = validateDatabaseId(argument('--database-id'));
  const packagePath = argument('--package');
  const runId = argument('--run-id');
  const outputPath = argument('--output') ?? 'reports/d1-staging-promotion.json';
  if (!packagePath || !runId) throw new Error('--package and --run-id are required.');
  const batchPackage = JSON.parse(fs.readFileSync(path.resolve(packagePath), 'utf8'));
  const first = await applyBatchWithRollback({ accountId, token, databaseId, batchPackage });

  const verificationSql = `SELECT
    (SELECT COUNT(*) FROM calendar_import_runs WHERE id = ?) AS import_runs,
    (SELECT COUNT(*) FROM calendar_occurrences WHERE import_run_id = ?) AS occurrences,
    (SELECT COUNT(*) FROM calendar_occurrence_labels l JOIN calendar_occurrences o ON o.id = l.occurrence_id WHERE o.import_run_id = ?) AS labels,
    (SELECT COUNT(*) FROM calendar_source_assertions a JOIN calendar_occurrences o ON o.id = a.occurrence_id WHERE o.import_run_id = ?) AS assertions;`;
  const firstVerification = await queryDatabase({
    accountId,
    token,
    databaseId,
    sql: verificationSql,
    params: [runId, runId, runId, runId]
  });

  const second = await applyBatchWithRollback({ accountId, token, databaseId, batchPackage });
  const secondVerification = await queryDatabase({
    accountId,
    token,
    databaseId,
    sql: verificationSql,
    params: [runId, runId, runId, runId]
  });
  const firstRow = (Array.isArray(firstVerification) ? firstVerification[0] : firstVerification)?.results?.[0];
  const secondRow = (Array.isArray(secondVerification) ? secondVerification[0] : secondVerification)?.results?.[0];
  if (!firstRow || !secondRow || JSON.stringify(firstRow) !== JSON.stringify(secondRow)) {
    throw new Error('D1 idempotency verification failed.');
  }
  if (Number(firstRow.import_runs) !== 1) throw new Error('The import run was not stored exactly once.');

  const receipt = {
    schemaVersion: 1,
    operation: 'apply-with-idempotency-check',
    databaseId,
    runId,
    statementCount: first.statementCount,
    bookmarkBeforeFirstApply: first.bookmarkBefore,
    bookmarkBeforeSecondApply: second.bookmarkBefore,
    counts: firstRow,
    completedAt: new Date().toISOString()
  };
  writeJson(outputPath, receipt);
  console.log(JSON.stringify(receipt));
  process.exit(0);
}

throw new Error('Usage: manage-d1-staging.mjs provision|apply [options]');

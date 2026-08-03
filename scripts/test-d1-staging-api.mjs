import { createHash } from 'node:crypto';
import {
  applyBatchWithRollback,
  provisionStagingDatabase,
  validateBatchPackage
} from './d1-staging-api.mjs';

const databaseId = '123e4567-e89b-42d3-a456-426614174000';
const bookmark = '00000001-00000002-00004e2f-testbookmark';
const statements = ['INSERT INTO example (id) VALUES (1);', 'UPDATE example SET id = 1 WHERE id = 1;'];
const batchPackage = {
  schemaVersion: 1,
  execution: 'D1Database.batch',
  atomic: true,
  sourceSqlSha256: 'a'.repeat(64),
  statementsSha256: createHash('sha256').update(JSON.stringify(statements)).digest('hex'),
  statementCount: statements.length,
  statements
};

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

validateBatchPackage(batchPackage);
try {
  validateBatchPackage({ ...batchPackage, statements: ['BEGIN;'] });
  throw new Error('Unsafe transaction control was accepted.');
} catch (error) {
  if (!String(error.message).includes('transaction control') && !String(error.message).includes('mismatch')) throw error;
}

const successCalls = [];
const successFetch = async (url, options = {}) => {
  successCalls.push({ url, options });
  if (url.endsWith('/time_travel/bookmark')) return response({ success: true, result: { bookmark } });
  if (url.endsWith('/query')) {
    const body = JSON.parse(options.body);
    if (!Array.isArray(body.batch) || body.batch.length !== statements.length) throw new Error('Batch payload was malformed.');
    return response({ success: true, result: statements.map(() => ({ success: true, results: [] })) });
  }
  throw new Error(`Unexpected success URL ${url}`);
};
const applied = await applyBatchWithRollback({
  accountId: 'account', token: 'token', databaseId, batchPackage, fetchImpl: successFetch
});
if (applied.statementCount !== 2 || successCalls.length !== 2) throw new Error('Successful D1 batch flow is incorrect.');

const failureCalls = [];
const failureFetch = async (url, options = {}) => {
  failureCalls.push({ url, options });
  if (url.endsWith('/time_travel/bookmark')) return response({ success: true, result: { bookmark } });
  if (url.endsWith('/query')) return response({ success: false, errors: [{ message: 'simulated batch failure' }] }, 500);
  if (url.includes('/time_travel/restore?bookmark=')) {
    return response({ success: true, result: { message: 'Database restored successfully', previous_bookmark: bookmark } });
  }
  throw new Error(`Unexpected failure URL ${url}`);
};
try {
  await applyBatchWithRollback({
    accountId: 'account', token: 'token', databaseId, batchPackage, fetchImpl: failureFetch
  });
  throw new Error('Failed D1 batch did not throw.');
} catch (error) {
  if (!String(error.message).includes('was restored')) throw error;
}
if (failureCalls.length !== 3 || !failureCalls[2].url.includes(encodeURIComponent(bookmark))) {
  throw new Error('Failed D1 batch did not invoke bookmark restore.');
}

const provisionCalls = [];
const provisionFetch = async (url, options = {}) => {
  provisionCalls.push({ url, options });
  return response({
    success: true,
    result: [{ uuid: databaseId, name: 'santosdodia-staging', jurisdiction: 'eu' }]
  });
};
const provision = await provisionStagingDatabase({ accountId: 'account', token: 'token', fetchImpl: provisionFetch });
if (provision.created !== false || provision.database.uuid !== databaseId || provisionCalls.length !== 1) {
  throw new Error('Existing staging database was not reused safely.');
}

console.log('D1 staging API safeguards passed.');

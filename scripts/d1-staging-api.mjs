import { createHash } from 'node:crypto';

const API_ROOT = 'https://api.cloudflare.com/client/v4';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FORBIDDEN_SQL = /\b(?:BEGIN|COMMIT|ROLLBACK|SAVEPOINT|PRAGMA\s+foreign_keys)\b/i;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function validateDatabaseId(value) {
  if (!UUID.test(String(value ?? ''))) throw new Error('A valid D1 database UUID is required.');
  return String(value);
}

export function validateBatchPackage(value) {
  if (!value || typeof value !== 'object') throw new Error('The D1 batch package must be an object.');
  if (value.schemaVersion !== 1 || value.execution !== 'D1Database.batch' || value.atomic !== true) {
    throw new Error('The package is not an atomic SantosDia D1 batch.');
  }
  if (!Array.isArray(value.statements) || value.statements.length === 0) {
    throw new Error('The D1 batch contains no statements.');
  }
  if (value.statementCount !== value.statements.length) throw new Error('D1 statement count mismatch.');
  const statements = value.statements.map((statement, index) => {
    if (typeof statement !== 'string' || !statement.trim()) throw new Error(`Statement ${index + 1} is empty.`);
    if (FORBIDDEN_SQL.test(statement)) throw new Error(`Statement ${index + 1} contains transaction control.`);
    if (Buffer.byteLength(statement, 'utf8') > 100_000) throw new Error(`Statement ${index + 1} exceeds 100 KB.`);
    return statement.trim();
  });
  const expectedHash = sha256(JSON.stringify(statements));
  if (value.statementsSha256 !== expectedHash) throw new Error('D1 statements SHA-256 mismatch.');
  return statements;
}

async function apiRequest({ accountId, token, path, method = 'GET', body, fetchImpl = fetch }) {
  if (!accountId || !token) throw new Error('Cloudflare account ID and API token are required.');
  const response = await fetchImpl(`${API_ROOT}/accounts/${accountId}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({ success: false, errors: [{ message: 'Non-JSON Cloudflare response.' }] }));
  if (!response.ok || payload.success !== true) {
    const message = payload.errors?.map(error => error.message).filter(Boolean).join('; ') || `Cloudflare API HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload.result;
}

export async function provisionStagingDatabase({ accountId, token, name = 'santosdodia-staging', fetchImpl = fetch }) {
  if (name !== 'santosdodia-staging') throw new Error('Only the santosdodia-staging database may be provisioned.');
  const existing = await apiRequest({
    accountId,
    token,
    path: `/d1/database?name=${encodeURIComponent(name)}&per_page=20`,
    fetchImpl
  });
  const exact = Array.isArray(existing) ? existing.find(database => database.name === name) : undefined;
  if (exact?.uuid) return { created: false, database: exact };
  const database = await apiRequest({
    accountId,
    token,
    path: '/d1/database',
    method: 'POST',
    body: { name, jurisdiction: 'eu', primary_location_hint: 'weur' },
    fetchImpl
  });
  return { created: true, database };
}

export async function queryDatabase({ accountId, token, databaseId, sql, params = [], fetchImpl = fetch }) {
  validateDatabaseId(databaseId);
  if (typeof sql !== 'string' || !sql.trim()) throw new Error('A non-empty D1 query is required.');
  return apiRequest({
    accountId,
    token,
    path: `/d1/database/${databaseId}/query`,
    method: 'POST',
    body: { sql, params },
    fetchImpl
  });
}

export async function applyBatchWithRollback({ accountId, token, databaseId, batchPackage, fetchImpl = fetch }) {
  validateDatabaseId(databaseId);
  const statements = validateBatchPackage(batchPackage);
  const bookmarkResult = await apiRequest({
    accountId,
    token,
    path: `/d1/database/${databaseId}/time_travel/bookmark`,
    fetchImpl
  });
  const bookmark = bookmarkResult?.bookmark;
  if (!bookmark) throw new Error('Cloudflare did not return a pre-promotion bookmark.');

  try {
    const result = await apiRequest({
      accountId,
      token,
      path: `/d1/database/${databaseId}/query`,
      method: 'POST',
      body: { batch: statements.map(sql => ({ sql, params: [] })) },
      fetchImpl
    });
    const results = Array.isArray(result) ? result : [result];
    if (results.length !== statements.length || results.some(entry => entry?.success !== true)) {
      throw new Error('Cloudflare returned an incomplete or failed D1 batch result.');
    }
    return { bookmarkBefore: bookmark, statementCount: statements.length, results };
  } catch (error) {
    let restore;
    try {
      restore = await apiRequest({
        accountId,
        token,
        path: `/d1/database/${databaseId}/time_travel/restore?bookmark=${encodeURIComponent(bookmark)}`,
        method: 'POST',
        fetchImpl
      });
    } catch (restoreError) {
      throw new Error(`D1 batch failed and automatic restore also failed: ${error.message}; restore: ${restoreError.message}`);
    }
    throw new Error(`D1 batch failed; the staging database was restored to ${bookmark}. ${restore?.message ?? error.message}`);
  }
}

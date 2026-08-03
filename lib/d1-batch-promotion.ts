export type D1BatchPackage = {
  schemaVersion: 1;
  execution: 'D1Database.batch';
  atomic: true;
  sourceSqlSha256: string;
  statementsSha256: string;
  statementCount: number;
  statements: string[];
};

type D1PreparedStatementLike = object;
type D1BatchResultLike = {
  success?: boolean;
  error?: string;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike;
  batch(statements: D1PreparedStatementLike[]): Promise<D1BatchResultLike[]>;
};

const LOWERCASE_SHA256 = /^[a-f0-9]{64}$/;
const FORBIDDEN_CONTROL = /\b(?:BEGIN|COMMIT|ROLLBACK|SAVEPOINT|PRAGMA\s+foreign_keys)\b/i;
const MAX_D1_STATEMENT_BYTES = 100_000;

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function validateD1BatchPackage(input: unknown): Promise<D1BatchPackage> {
  if (!input || typeof input !== 'object') throw new Error('D1 batch package must be an object.');
  const value = input as Partial<D1BatchPackage>;
  if (value.schemaVersion !== 1) throw new Error('Unsupported D1 batch package schema version.');
  if (value.execution !== 'D1Database.batch' || value.atomic !== true) {
    throw new Error('D1 batch package must require atomic D1Database.batch execution.');
  }
  if (!LOWERCASE_SHA256.test(value.sourceSqlSha256 ?? '')) throw new Error('Invalid source SQL checksum.');
  if (!LOWERCASE_SHA256.test(value.statementsSha256 ?? '')) throw new Error('Invalid statement-list checksum.');
  if (!Array.isArray(value.statements) || value.statements.some(statement => typeof statement !== 'string')) {
    throw new Error('D1 batch package statements must be an array of SQL strings.');
  }
  if (!Number.isInteger(value.statementCount) || value.statementCount !== value.statements.length) {
    throw new Error('D1 batch package statement count is inconsistent.');
  }
  if (!value.statements.length) throw new Error('D1 batch package contains no statements.');

  for (const [index, statement] of value.statements.entries()) {
    if (!statement.trim()) throw new Error(`D1 statement ${index + 1} is empty.`);
    if (FORBIDDEN_CONTROL.test(statement)) {
      throw new Error(`D1 statement ${index + 1} contains forbidden transaction control.`);
    }
    if (new TextEncoder().encode(statement).byteLength > MAX_D1_STATEMENT_BYTES) {
      throw new Error(`D1 statement ${index + 1} exceeds the 100 KB D1 limit.`);
    }
  }

  const checksum = await sha256(JSON.stringify(value.statements));
  if (checksum !== value.statementsSha256) throw new Error('D1 statement-list checksum mismatch.');
  return value as D1BatchPackage;
}

export async function executeD1BatchPackage(
  database: D1DatabaseLike,
  input: unknown
): Promise<D1BatchResultLike[]> {
  const batchPackage = await validateD1BatchPackage(input);
  const prepared = batchPackage.statements.map(statement => database.prepare(statement));
  const results = await database.batch(prepared);
  if (!Array.isArray(results) || results.length !== prepared.length) {
    throw new Error('D1 returned an inconsistent number of batch results.');
  }
  const failedIndex = results.findIndex(result => result?.success === false);
  if (failedIndex >= 0) {
    throw new Error(`D1 batch statement ${failedIndex + 1} failed: ${results[failedIndex]?.error ?? 'unknown error'}`);
  }
  return results;
}

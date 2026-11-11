import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { portableD1Statements } from './sql-statement-list.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const inputPath = argument('--input');
const outputPath = argument('--output');
if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/prepare-d1-calendar-package.mjs --input <generated.sql> --output <batch.json>');
  process.exit(2);
}

const source = fs.readFileSync(path.resolve(inputPath), 'utf8');
const statements = portableD1Statements(source);
if (!statements.length) throw new Error('The generated package contains no D1 statements.');

const forbidden = /\b(?:BEGIN|COMMIT|ROLLBACK|SAVEPOINT|PRAGMA\s+foreign_keys)\b/i;
for (const [index, statement] of statements.entries()) {
  if (forbidden.test(statement)) throw new Error(`Statement ${index + 1} contains transaction control that D1 must manage.`);
  if (Buffer.byteLength(statement, 'utf8') > 100_000) {
    throw new Error(`Statement ${index + 1} exceeds the D1 100 KB statement limit.`);
  }
}

const sourceSha256 = createHash('sha256').update(source).digest('hex');
const statementSha256 = createHash('sha256').update(JSON.stringify(statements)).digest('hex');
const output = {
  schemaVersion: 1,
  execution: 'D1Database.batch',
  atomic: true,
  sourceSqlSha256: sourceSha256,
  statementsSha256: statementSha256,
  statementCount: statements.length,
  statements
};

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Prepared ${statements.length} statements for atomic D1 batch execution.`);

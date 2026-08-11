import fs from 'node:fs';
import path from 'node:path';
import { provisionProductionDatabase, queryDatabase, validateDatabaseId } from './d1-staging-api.mjs';

const PRODUCTION_DATABASE_ID = 'e1ad3640-b334-49d1-a6fc-a73f54924803';
const REQUIRED_TABLES = [
  'churches',
  'jurisdictions',
  'calendar_sources',
  'calendar_observances',
  'calendar_occurrences',
  'calendar_occurrence_labels',
  'knowledge_entities',
  'entity_names'
];

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function rows(result) {
  const payload = Array.isArray(result) ? result[0] : result;
  return Array.isArray(payload?.results) ? payload.results : [];
}

const command = process.argv[2];
if (!['provision', 'verify-schema'].includes(command)) {
  throw new Error('Usage: manage-d1-production.mjs provision|verify-schema [options]');
}

const accountId = requiredEnvironment('CLOUDFLARE_ACCOUNT_ID');
const token = requiredEnvironment('CLOUDFLARE_API_TOKEN');

if (command === 'provision') {
  const outputPath = argument('--output', 'reports/d1-production-provision.json');
  const result = await provisionProductionDatabase({ accountId, token });
  const database = result.database ?? {};
  if (database.name !== 'santosdodia-production' || database.jurisdiction !== 'eu') {
    throw new Error('Production D1 identity or jurisdiction is not the expected SantosDia EU target.');
  }
  const receipt = {
    schemaVersion: 1,
    operation: 'provision-production-empty-database',
    created: result.created,
    dataWritten: false,
    migrationsApplied: false,
    bindingChanged: false,
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
}

if (command === 'verify-schema') {
  const databaseId = validateDatabaseId(argument('--database-id'));
  if (databaseId !== PRODUCTION_DATABASE_ID) throw new Error('Refusing to verify an unexpected production D1 UUID.');
  const outputPath = argument('--output', 'reports/d1-production-schema.json');
  const result = await queryDatabase({
    accountId,
    token,
    databaseId,
    sql: `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`
  });
  const tableNames = new Set(rows(result).map((row) => String(row.name ?? '')));
  const missing = REQUIRED_TABLES.filter((name) => !tableNames.has(name));
  if (missing.length) throw new Error(`Production D1 schema is missing required table(s): ${missing.join(', ')}`);
  const receipt = {
    schemaVersion: 1,
    operation: 'verify-production-schema',
    databaseId,
    requiredTables: REQUIRED_TABLES,
    missingTables: [],
    dataWrittenByVerification: false,
    verifiedAt: new Date().toISOString()
  };
  writeJson(outputPath, receipt);
  console.log(JSON.stringify(receipt));
}
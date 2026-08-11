import fs from 'node:fs';
import path from 'node:path';
import { provisionProductionDatabase } from './d1-staging-api.mjs';

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

if (process.argv[2] !== 'provision') {
  throw new Error('Usage: manage-d1-production.mjs provision [--output path]');
}

const accountId = requiredEnvironment('CLOUDFLARE_ACCOUNT_ID');
const token = requiredEnvironment('CLOUDFLARE_API_TOKEN');
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
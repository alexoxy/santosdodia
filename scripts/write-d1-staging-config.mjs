import fs from 'node:fs';
import path from 'node:path';
import { validateDatabaseId } from './d1-staging-api.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const databaseId = validateDatabaseId(argument('--database-id'));
const outputPath = argument('--output');
if (!outputPath) throw new Error('--output is required.');

const config = {
  $schema: './node_modules/wrangler/config-schema.json',
  name: 'santosdodia-d1-staging-control',
  main: '.open-next/worker.js',
  compatibility_date: '2026-08-03',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: [
    {
      binding: 'CALENDAR_DB',
      database_name: 'santosdodia-staging',
      database_id: databaseId,
      migrations_dir: 'migrations'
    }
  ]
};

const resolved = path.resolve(outputPath);
fs.mkdirSync(path.dirname(resolved), { recursive: true });
fs.writeFileSync(resolved, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`Wrote ephemeral D1 staging config to ${resolved}.`);

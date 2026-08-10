import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDatabaseId } from './d1-staging-api.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function buildD1StagingConfig(databaseId, { repositoryRoot = process.cwd() } = {}) {
  const validatedDatabaseId = validateDatabaseId(databaseId);
  const migrationsDir = path.resolve(repositoryRoot, 'db/migrations');
  if (!fs.existsSync(migrationsDir) || !fs.statSync(migrationsDir).isDirectory()) {
    throw new Error(`D1 migrations directory does not exist: ${migrationsDir}`);
  }
  return {
    $schema: path.resolve(repositoryRoot, 'node_modules/wrangler/config-schema.json'),
    name: 'santosdodia-d1-staging-control',
    main: path.resolve(repositoryRoot, '.open-next/worker.js'),
    compatibility_date: '2026-08-03',
    compatibility_flags: ['nodejs_compat'],
    d1_databases: [
      {
        binding: 'CALENDAR_DB',
        database_name: 'santosdodia-staging',
        database_id: validatedDatabaseId,
        migrations_dir: migrationsDir,
      },
    ],
  };
}

function main() {
  const databaseId = argument('--database-id');
  const outputPath = argument('--output');
  if (!outputPath) throw new Error('--output is required.');
  const config = buildD1StagingConfig(databaseId);
  const resolved = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`Wrote ephemeral D1 staging config to ${resolved}.`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main();

#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildD1StagingConfig } from './write-d1-staging-config.mjs';
import { buildD1ProductionConfig } from './write-d1-production-config.mjs';

const stagingDatabaseId = 'e212681b-a958-4554-9d44-d48cf85f2978';
const productionDatabaseId = 'e1ad3640-b334-49d1-a6fc-a73f54924803';
const repositoryRoot = process.cwd();

const staging = buildD1StagingConfig(stagingDatabaseId, { repositoryRoot });
const stagingDatabase = staging.d1_databases?.[0];
assert.equal(stagingDatabase?.binding, 'CALENDAR_DB');
assert.equal(stagingDatabase?.database_name, 'santosdodia-staging');
assert.equal(stagingDatabase?.database_id, stagingDatabaseId);
assert.equal(stagingDatabase?.migrations_dir, path.resolve(repositoryRoot, 'db/migrations'));
assert.equal(path.isAbsolute(stagingDatabase.migrations_dir), true, 'Ephemeral Wrangler config must use an absolute migrations path.');
assert.equal(fs.existsSync(stagingDatabase.migrations_dir), true, 'Configured D1 migrations directory must exist.');
assert.equal(fs.readdirSync(stagingDatabase.migrations_dir).some((name) => /^\d+.*\.sql$/u.test(name)), true, 'Configured D1 migrations directory must contain SQL migrations.');
assert.equal(path.isAbsolute(staging.main), true, 'Ephemeral Wrangler config main path must be repository-root absolute.');
assert.equal(path.isAbsolute(staging.$schema), true, 'Ephemeral Wrangler schema path must be repository-root absolute.');

const production = buildD1ProductionConfig(productionDatabaseId, { repositoryRoot });
const productionDatabase = production.d1_databases?.[0];
assert.equal(productionDatabase?.binding, 'CALENDAR_DB');
assert.equal(productionDatabase?.database_name, 'santosdodia-production');
assert.equal(productionDatabase?.database_id, productionDatabaseId);
assert.equal(productionDatabase?.migrations_dir, path.resolve(repositoryRoot, 'db/migrations'));
assert.equal(path.isAbsolute(productionDatabase.migrations_dir), true);
assert.equal(fs.existsSync(productionDatabase.migrations_dir), true);
assert.throws(
  () => buildD1ProductionConfig(stagingDatabaseId, { repositoryRoot }),
  /Refusing any D1 production UUID/,
  'Production migration config must never accept the staging UUID.'
);

console.log('D1 staging and production config repository-root path tests passed.');
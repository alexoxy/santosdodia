#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildD1StagingConfig } from './write-d1-staging-config.mjs';

const databaseId = 'e212681b-a958-4554-9d44-d48cf85f2978';
const repositoryRoot = process.cwd();
const config = buildD1StagingConfig(databaseId, { repositoryRoot });
const database = config.d1_databases?.[0];

assert.equal(database?.binding, 'CALENDAR_DB');
assert.equal(database?.database_name, 'santosdodia-staging');
assert.equal(database?.database_id, databaseId);
assert.equal(database?.migrations_dir, path.resolve(repositoryRoot, 'db/migrations'));
assert.equal(path.isAbsolute(database.migrations_dir), true, 'Ephemeral Wrangler config must use an absolute migrations path.');
assert.equal(fs.existsSync(database.migrations_dir), true, 'Configured D1 migrations directory must exist.');
assert.equal(fs.readdirSync(database.migrations_dir).some((name) => /^\d+.*\.sql$/u.test(name)), true, 'Configured D1 migrations directory must contain SQL migrations.');
assert.equal(path.isAbsolute(config.main), true, 'Ephemeral Wrangler config main path must be repository-root absolute.');
assert.equal(path.isAbsolute(config.$schema), true, 'Ephemeral Wrangler schema path must be repository-root absolute.');

console.log('D1 staging config repository-root path tests passed.');

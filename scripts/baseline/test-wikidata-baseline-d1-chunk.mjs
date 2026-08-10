#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santos-baseline-d1-guard-'));
try {
  const allowedPath = path.join(temporary, 'allowed.json');
  writeBatch(allowedPath, { entityCount: 125, statementCount: 2000 });
  const output = execFileSync(process.execPath, ['scripts/baseline/check-wikidata-baseline-d1-chunk.mjs', '--input', allowedPath], { cwd: root, encoding: 'utf8' });
  const allowed = JSON.parse(output);
  assert.equal(allowed.ok, true);
  assert.equal(allowed.entityLimit, 125);
  assert.equal(allowed.maxRowsPerChunk, 2000);
  assert.equal(allowed.maxOperationsPerUtcDay, 20);
  assert.equal(allowed.maxRowsPerUtcDay, 40000);

  const tooManyStatements = path.join(temporary, 'too-many-statements.json');
  writeBatch(tooManyStatements, { entityCount: 125, statementCount: 2001 });
  assert.throws(() => execFileSync(process.execPath, ['scripts/baseline/check-wikidata-baseline-d1-chunk.mjs', '--input', tooManyStatements], { cwd: root, stdio: 'pipe' }), /Command failed/u);

  const tooManyEntities = path.join(temporary, 'too-many-entities.json');
  writeBatch(tooManyEntities, { entityCount: 126, statementCount: 1000 });
  assert.throws(() => execFileSync(process.execPath, ['scripts/baseline/check-wikidata-baseline-d1-chunk.mjs', '--input', tooManyEntities], { cwd: root, stdio: 'pipe' }), /Command failed/u);

  console.log('Saints Baseline D1 bootstrap row-ceiling tests passed.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

function writeBatch(file, { entityCount, statementCount }) {
  const statements = Array.from({ length: statementCount }, (_, index) => `INSERT INTO t(id) VALUES (${index});`);
  fs.writeFileSync(file, `${JSON.stringify({
    schemaVersion: 1,
    atomic: true,
    entityCount,
    statementCount,
    statements,
    idempotencyKey: `test:${entityCount}:${statementCount}`,
    statementsSha256: 'test-sha',
  }, null, 2)}\n`);
}

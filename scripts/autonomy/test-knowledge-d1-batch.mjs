#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-knowledge-batch-'));
try {
  const input = path.join(temporary, 'input');
  const output = path.join(temporary, 'knowledge-batch.json');
  fs.mkdirSync(input, { recursive: true });
  writeJson(path.join(input, 'staging-manifest.json'), {
    stagingVersion: '1.1',
    sourceId: 'wikidata',
    sourceRunId: 'test-recognition-v1',
    queryVersion: 'recognition-v1',
    sourceFingerprint: 'test-fingerprint',
    mode: 'staging',
    publish: false,
    entityCount: 1,
    conflictCount: 0,
  });
  writeJson(path.join(input, 'quality-report.json'), {
    reportVersion: '1.1',
    sourceId: 'wikidata',
    sourceRunId: 'test-recognition-v1',
    queryVersion: 'recognition-v1',
    sourceDocuments: [],
    metrics: {},
  });
  fs.writeFileSync(path.join(input, 'entities.jsonl'), `${JSON.stringify({
    stagingVersion: '1.1',
    id: 'wikidata:Q1',
    entityType: 'historical-person',
    qid: 'Q1',
    canonicalName: 'Candidate One',
    canonicalSlug: 'candidate-one-q1',
    status: 'candidate',
    names: [],
    recognition: {
      sourceStatusCandidates: [{ qid: 'Q123110154', labels: [{ language: 'en', value: 'canonized saint' }], evidenceType: 'wikidata-recognition-status' }],
      resolutionStatus: 'source_candidates',
      churchConfirmed: false,
    },
    dates: { birth: { canonical: null }, death: { canonical: null } },
    provenance: { sourceId: 'wikidata', sourceDocuments: [] },
    publish: false,
  })}\n`, 'utf8');

  execFileSync(process.execPath, ['scripts/autonomy/build-knowledge-d1-batch.mjs', '--input', input, '--output', output], {
    cwd: root,
    encoding: 'utf8',
  });
  const batch = JSON.parse(fs.readFileSync(output, 'utf8'));
  const sql = batch.statements.join('\n');
  assert.match(sql, /'historical-person'/u, 'Candidate entity must remain a neutral historical-person.');
  assert.match(sql, /entity_type=excluded\.entity_type/u, 'Re-import must correct a stale staging entity type.');
  assert.match(sql, /'recognition-status-candidate'/u, 'Recognition status must be stored as a provisional assertion.');
  assert.match(sql, /'Q123110154'/u, 'Recognition status QID must be preserved.');
  assert.match(sql, /0\.45, 'source_candidate'/u, 'Recognition status must retain provisional confidence and resolution state.');
  assert.doesNotMatch(sql, /VALUES \([^\n]*'saint'/u, 'Wikidata discovery must not promote this candidate to saint.');

  console.log('Knowledge D1 recognition-candidate batch test passed.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

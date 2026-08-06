#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { normalizeWikidataSaints } from './normalize-wikidata-saints.mjs';

const root = await mkdtemp(join(tmpdir(), 'santosdodia-osint-normalize-'));
try {
  const input = join(root, '0000-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json');
  const firstOutput = join(root, 'first');
  const secondOutput = join(root, 'second');
  const bindings = [
    binding('Q1', { label: ['pt', 'Santo Um'], birth: literalDate('1900-01-01'), image: 'https://commons.example/a.jpg' }),
    binding('Q1', { label: ['pt', 'Santo Um'], birth: literalDate('1901-01-01'), image: 'https://commons.example/b.jpg' }),
    binding('Q2', { label: ['en', 'Saint Two'], birth: { type: 'uri', value: 'http://www.wikidata.org/.well-known/genid/uncertain' } }),
    binding('Q3', { label: ['', 'Q3'], death: literalDate('2000-02-03') }),
  ];
  await writeFile(input, `${JSON.stringify({ head: { vars: [] }, results: { bindings } })}\n`, 'utf8');

  const first = await normalizeWikidataSaints(input, firstOutput);
  await normalizeWikidataSaints(input, secondOutput);

  assert.equal(first.manifest.publish, false);
  assert.equal(first.manifest.entityCount, 3);
  assert.equal(first.manifest.conflictCount, 1);
  assert.equal(first.qualityReport.metrics.inputRows, 4);
  assert.equal(first.qualityReport.metrics.uniqueEntities, 3);
  assert.equal(first.qualityReport.metrics.duplicateRowsCollapsed, 1);
  assert.equal(first.qualityReport.metrics.duplicatedQids, 1);
  assert.equal(first.qualityReport.metrics.dateConflicts.birth, 1);
  assert.equal(first.qualityReport.metrics.invalidDateNodes.birth, 1);

  const q1 = first.entities.find((entity) => entity.qid === 'Q1');
  assert.equal(q1.status, 'needs_review');
  assert.equal(q1.dates.birth.canonical, null);
  assert.deepEqual(q1.media.images, ['https://commons.example/a.jpg', 'https://commons.example/b.jpg']);

  const q2 = first.entities.find((entity) => entity.qid === 'Q2');
  assert.equal(q2.status, 'needs_review');
  assert.equal(q2.dates.birth.invalidNodes.length, 1);

  const q3 = first.entities.find((entity) => entity.qid === 'Q3');
  assert.equal(q3.canonicalName, 'Q3');
  assert.ok(q3.quality.warnings.includes('canonical_name_falls_back_to_qid'));

  for (const filename of ['entities.jsonl', 'conflicts.jsonl', 'quality-report.json', 'staging-manifest.json']) {
    const firstBytes = await readFile(join(firstOutput, filename));
    const secondBytes = await readFile(join(secondOutput, filename));
    assert.deepEqual(firstBytes, secondBytes, `${filename} must be deterministic`);
  }

  console.log('Wikidata saint normalization tests passed.');
} finally {
  await rm(root, { recursive: true, force: true });
}

function binding(qid, options = {}) {
  const result = {
    item: { type: 'uri', value: `http://www.wikidata.org/entity/${qid}` },
  };
  if (options.label) result.itemLabel = { type: 'literal', 'xml:lang': options.label[0], value: options.label[1] };
  if (options.description) result.itemDescription = { type: 'literal', 'xml:lang': options.description[0], value: options.description[1] };
  if (options.birth) result.birth = options.birth;
  if (options.death) result.death = options.death;
  if (options.image) result.image = { type: 'uri', value: options.image };
  if (options.article) result.article = { type: 'uri', value: options.article };
  return result;
}

function literalDate(date) {
  return { type: 'literal', datatype: 'http://www.w3.org/2001/XMLSchema#dateTime', value: `${date}T00:00:00Z` };
}

#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-reviewed-d1-'));
try {
  const input = path.join(temporary, 'reviewed');
  fs.mkdirSync(input, { recursive: true });
  writeJson(path.join(input, 'staging-manifest.json'), {
    stagingVersion: '1.1', sourceId: 'wikidata', sourceRunId: 'run-a', queryVersion: 'recognition-v1', sourceFingerprint: 'fp-a',
    mode: 'staging', stage: 'linguistically-reviewed', linguisticReviewVersion: '1.1', publish: false, entityCount: 3, conflictCount: 0,
  });
  writeJson(path.join(input, 'quality-report.json'), { sourceDocuments: [], metrics: {} });
  writeJson(path.join(input, 'linguistic-review.json'), {
    reviewVersion: '1.1', batchFatalCount: 0, criticalCount: 0,
    policy: { sourceOnlyIsNotCanonical: true, localeIsolation: true, missingLocaleDoesNotBlockOtherLocales: true },
  });
  const entities = [
    entity('Q1', [name('pt', 'Santo Um'), name('ru', 'Saint One')]),
    entity('Q2', [name('en', 'Saint Two')]),
    entity('Q3', [name('pt', 'Santo Três')]),
  ];
  fs.writeFileSync(path.join(input, 'entities.jsonl'), `${entities.map(JSON.stringify).join('\n')}\n`);
  const decisions = [
    decision('Q1', 'pt', 'Santo Um', 'candidate'),
    decision('Q1', 'ru', 'Saint One', 'withheld'),
    decision('Q2', 'en', 'Saint Two', 'candidate'),
    decision('Q3', 'pt', 'Santo Três', 'candidate'),
  ];
  fs.writeFileSync(path.join(input, 'localized-name-decisions.jsonl'), `${decisions.map(JSON.stringify).join('\n')}\n`);

  const firstPath = path.join(temporary, 'first.json');
  execFileSync(process.execPath, ['scripts/autonomy/build-knowledge-d1-batch.mjs', '--input', input, '--output', firstPath, '--entity-offset', '0', '--entity-limit', '2'], { cwd: root });
  const first = JSON.parse(fs.readFileSync(firstPath, 'utf8'));
  assert.equal(first.sourceEntityCount, 3);
  assert.equal(first.entityOffset, 0);
  assert.equal(first.entityCount, 2);
  assert.equal(first.nextEntityOffset, 2);
  assert.equal(first.localizedNamesAccepted, 2);
  assert.equal(first.localizedNamesWithheld, 1);
  assert.equal(first.languageReviewVersion, '1.1');
  assert.equal(first.statements.filter((statement) => statement.startsWith('INSERT INTO knowledge_localized_names ')).length, 2);
  assert.ok(first.statements.some((statement) => statement.includes("'Saint One'")), 'Withheld source name must remain preserved as source evidence.');
  assert.ok(first.statements.every((statement) => !statement.includes("wikidata:Q3") && !statement.includes("'Santo Três'")), 'First D1 chunk must not leak the next entity.');

  const secondPath = path.join(temporary, 'second.json');
  execFileSync(process.execPath, ['scripts/autonomy/build-knowledge-d1-batch.mjs', '--input', input, '--output', secondPath, '--entity-offset', '2', '--entity-limit', '2'], { cwd: root });
  const second = JSON.parse(fs.readFileSync(secondPath, 'utf8'));
  assert.equal(second.entityOffset, 2);
  assert.equal(second.entityCount, 1);
  assert.equal(second.nextEntityOffset, 3);
  assert.notEqual(first.idempotencyKey, second.idempotencyKey);
  assert.ok(second.idempotencyKey.includes(':2:'));

  assert.throws(() => execFileSync(process.execPath, ['scripts/autonomy/build-knowledge-d1-batch.mjs', '--input', input, '--output', path.join(temporary, 'bad.json'), '--entity-offset', '3', '--entity-limit', '1'], { cwd: root, stdio: 'pipe' }), /Command failed/u);

  console.log('Reviewed D1 chunk and locale-withholding tests passed.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

function entity(qid, names) {
  return {
    stagingVersion: '1.1', id: `wikidata:${qid}`, entityType: 'historical-person', qid,
    canonicalName: names[0].name, canonicalSlug: `${qid.toLowerCase()}-candidate`, status: 'candidate', names,
    recognition: { sourceStatusCandidates: [], resolutionStatus: 'missing', churchConfirmed: false },
    dates: { birth: { canonical: null }, death: { canonical: null } }, provenance: { sourceId: 'wikidata', sourceDocuments: [] }, publish: false,
  };
}
function name(language, value) { return { language, name: value, nameType: 'label', normalizedName: value.toLocaleLowerCase('und') }; }
function decision(qid, locale, value, scriptGate) {
  return {
    reviewVersion: '1.1', entityId: `wikidata:${qid}`, qid, locale, sourceLanguage: locale, name: value,
    normalizedName: value.toLocaleLowerCase('und'), sourceNameType: 'label', sourceTextHash: 'hash', scriptGate,
    blockingIssues: scriptGate === 'withheld' ? ['required-cyrillic-script-missing'] : [], qualityStatus: 'source-only', publicationEligible: false,
  };
}
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }

#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildGlobalIdentityLedger } from './build-global-identity-ledger.mjs';

function entity(qid, name, { birth = null, death = null } = {}) {
  const projection = (value) => ({
    canonical: value,
    candidates: value ? [{ date: value, raw: `${value}T00:00:00Z` }] : [],
    invalidNodes: [],
    resolutionStatus: value ? 'single_source_value' : 'missing',
  });
  return {
    stagingVersion: '1.1',
    id: `wikidata:${qid}`,
    entityType: 'historical-person',
    qid,
    canonicalName: name,
    canonicalSlug: `${name.toLowerCase().replace(/\s+/gu, '-')}-${qid.toLowerCase()}`,
    status: 'candidate',
    recognition: { sourceStatusCandidates: [{ qid: 'Q43115', labels: [], evidenceType: 'wikidata-recognition-status' }], resolutionStatus: 'source_candidates', churchConfirmed: false },
    names: [{ language: 'en', name, nameType: 'canonical', normalizedName: name.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase() }],
    descriptions: [],
    dates: { birth: projection(birth), death: projection(death) },
    media: { images: [], portugueseArticles: [] },
    provenance: { sourceId: 'wikidata', queryVersion: 'recognition-v1', licence: 'CC0-1.0', sourceDocuments: ['doc'], rawRowCount: 1 },
    scope: { candidateUniverse: 'wikidata-recognition', churchRecognition: 'unverified', liturgicalCalendarEligibility: 'unverified' },
    quality: { conflictIds: [], warnings: [] },
    publish: false,
  };
}

async function writeBatch(root, startPage, nextPage, runId, entities) {
  const batchName = `batch-${String(startPage).padStart(6, '0')}`;
  const base = path.join(root, batchName, 'extracted', 'staging', 'baseline-language');
  const reviewed = path.join(base, 'reviewed');
  await mkdir(reviewed, { recursive: true });
  const manifest = {
    stagingVersion: '1.1',
    sourceId: 'wikidata',
    sourceRunId: runId,
    queryVersion: 'recognition-v1',
    sourceFingerprint: `fingerprint-${startPage}`,
    mode: 'staging',
    publish: false,
    entityCount: entities.length,
    conflictCount: 0,
    stage: 'linguistically-reviewed',
    linguisticReviewVersion: '1.1',
  };
  await writeFile(path.join(reviewed, 'staging-manifest.json'), `${JSON.stringify(manifest)}\n`);
  await writeFile(path.join(reviewed, 'entities.jsonl'), `${entities.map((item) => JSON.stringify(item)).join('\n')}\n`);
  await writeFile(path.join(base, 'upstream-summary.json'), `${JSON.stringify({ queryVersion: 'recognition-v1', startPage, nextPage, runId, status: 'fetched' })}\n`);
  return batchName;
}

function progress() {
  return {
    schemaVersion: 1,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion: 'recognition-v1',
    normalizationVersion: '1.1',
    languageReviewVersion: '1.1',
    sourceCompleted: true,
    caughtUp: true,
    successfulReviews: 2,
    cumulativeEntitiesReviewed: 4,
    lastReviewed: { sourceRunId: 'run-10', sourceStartPage: 10, sourceNextPage: 20 },
  };
}

const root = await mkdtemp(path.join(tmpdir(), 'santosdodia-identity-test-'));
try {
  await writeBatch(root, 0, 10, 'run-0', [
    entity('Q1', 'Shared Name', { death: '0100-01-01' }),
    entity('Q2', 'Second Person', { death: '0200-02-02' }),
  ]);
  await writeBatch(root, 10, 20, 'run-10', [
    entity('Q2', 'Second Person Variant', { death: '0200-02-02' }),
    entity('Q3', 'Shared Name', { birth: '0300-03-03' }),
  ]);

  const first = await buildGlobalIdentityLedger({ inputRoot: root, reviewedProgress: progress() });
  const second = await buildGlobalIdentityLedger({ inputRoot: root, reviewedProgress: progress() });
  assert.equal(first.report.sourceEntityOccurrences, 4);
  assert.equal(first.report.uniqueIdentityCount, 3);
  assert.equal(first.report.duplicateOccurrencesCollapsed, 1);
  assert.equal(first.report.crossBatchDuplicateIdentityCount, 1);
  assert.equal(first.report.identityConflictCount, 0);
  assert.equal(first.report.nameOnlyMergeCount, 0);
  assert.equal(first.report.nameCollisionKeyCount, 1);
  assert.equal(first.report.freezeIdentityGateEligible, true);
  assert.equal(first.report.rootSha256, second.report.rootSha256, 'Identity root hash must be deterministic.');
  const q2 = first.ledger.find((item) => item.qid === 'Q2');
  assert.equal(q2.identityStatus, 'resolved-duplicate-occurrences');
  assert.equal(q2.resolutionBasis.signal, 'exactExternalIdentifier');
  assert.equal(q2.resolutionBasis.nameOnlyMerge, false);
  assert.deepEqual(q2.canonicalNameCandidates, ['Second Person', 'Second Person Variant']);
  assert.deepEqual(first.nameCollisions[0].qids, ['Q1', 'Q3']);
  assert.equal(first.nameCollisions[0].identityAction, 'none-name-is-not-identity');

  const conflictingRoot = await mkdtemp(path.join(tmpdir(), 'santosdodia-identity-conflict-'));
  try {
    await writeBatch(conflictingRoot, 0, 10, 'run-0', [
      entity('Q1', 'One'),
      entity('Q2', 'Two', { death: '0200-02-02' }),
    ]);
    await writeBatch(conflictingRoot, 10, 20, 'run-10', [
      entity('Q2', 'Two', { death: '0201-02-02' }),
      entity('Q3', 'Three'),
    ]);
    const result = await buildGlobalIdentityLedger({ inputRoot: conflictingRoot, reviewedProgress: progress() });
    assert.equal(result.report.identityConflictCount, 1);
    assert.equal(result.report.freezeIdentityGateEligible, false);
    assert.equal(result.conflicts[0].reason, 'incompatible-precise-death-dates');
    assert.equal(result.ledger.find((item) => item.qid === 'Q2').identityStatus, 'conflict');
  } finally {
    await rm(conflictingRoot, { recursive: true, force: true });
  }

  const incomplete = progress();
  incomplete.caughtUp = false;
  await assert.rejects(() => buildGlobalIdentityLedger({ inputRoot: root, reviewedProgress: incomplete }), /completed and caught-up/u);
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('Global candidate identity ledger tests passed.');

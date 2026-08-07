#!/usr/bin/env node

import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeWikidataSaints } from './osint/normalize-wikidata-saints.mjs';

const root = process.cwd();
const outputRoot = path.resolve(process.argv[2] ?? 'staging/dropbox-hygiene');
const generatedAt = new Date().toISOString();
const sourceCommit = process.env.GITHUB_SHA ?? 'local-validation';

async function copyInto(source, destinationRoot) {
  const destination = path.join(destinationRoot, source);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, source), destination);
}

async function writeManifest(destinationRoot, stream, details = {}) {
  await writeFile(path.join(destinationRoot, 'STAGING_MANIFEST.json'), `${JSON.stringify({
    schemaVersion: 1,
    stream,
    generatedAt,
    sourceCommit,
    status: 'hygiene-bootstrap',
    publicationAllowed: false,
    purpose: 'Prove bounded GitHub-to-Dropbox archive coverage without publishing product data.',
    ...details,
  }, null, 2)}\n`);
}

async function prepareObservances() {
  const destination = path.join(outputRoot, 'observances');
  await mkdir(destination, { recursive: true });
  for (const source of [
    'data/observances.ts',
    'data/editorial-claim-evidence.json',
    'data/editorial-patronage-review-queue.json',
    'docs/data-quality-baseline.md',
    'docs/verified-profile-standard.md',
  ]) await copyInto(source, destination);
  await writeManifest(destination, 'observances', { packageType: 'approved-repository-editorial-snapshot' });
}

function binding(qid, label, dateField, date) {
  return {
    item: { type: 'uri', value: `http://www.wikidata.org/entity/${qid}` },
    itemLabel: { type: 'literal', 'xml:lang': label[0], value: label[1] },
    [dateField]: { type: 'literal', datatype: 'http://www.w3.org/2001/XMLSchema#dateTime', value: `${date}T00:00:00Z` },
  };
}

async function prepareWikidata() {
  const destination = path.join(outputRoot, 'wikidata-normalized');
  const raw = path.join(outputRoot, 'wikidata-bootstrap-source.json');
  await mkdir(destination, { recursive: true });
  await writeFile(raw, `${JSON.stringify({
    head: { vars: [] },
    results: { bindings: [
      binding('Q1', ['pt', 'Registo de validação Um'], 'birth', '1900-01-01'),
      binding('Q2', ['en', 'Validation Record Two'], 'death', '2000-02-03'),
    ] },
  })}\n`);
  await normalizeWikidataSaints(raw, destination);
  await copyInto('data/osint/schemas/wikidata-saint-staging.schema.json', destination);
  await writeManifest(destination, 'wikidata-normalized', {
    packageType: 'deterministic-normalizer-validation-fixture',
    dataStatus: 'synthetic-test-only',
  });
}

async function prepareDirectoryFoundation() {
  const destination = path.join(outputRoot, 'ecclesiastical-directory-foundation');
  await mkdir(destination, { recursive: true });
  for (const source of [
    'data/ecclesiastical-source-registry.json',
    'db/migrations/0001_ecclesiastical_directory.sql',
    'docs/data-staging-policy.md',
    'docs/ecclesiastical-directory-plan.md',
  ]) await copyInto(source, destination);
  await writeManifest(destination, 'ecclesiastical-directory/foundation', {
    packageType: 'schema-policy-and-source-registry',
    containsSourceRecords: false,
  });
}

async function prepareSourceFreshness() {
  const destination = path.join(outputRoot, 'source-freshness');
  await mkdir(destination, { recursive: true });
  await writeManifest(destination, 'source-freshness', {
    packageType: 'bounded-network-review-report',
    automaticDeletion: false,
  });
}

await Promise.all([
  prepareObservances(),
  prepareWikidata(),
  prepareDirectoryFoundation(),
  prepareSourceFreshness(),
]);

console.log(`Prepared Dropbox hygiene packages at ${path.relative(root, outputRoot)}.`);

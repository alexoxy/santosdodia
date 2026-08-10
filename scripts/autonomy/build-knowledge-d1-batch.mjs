#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite number cannot be serialized to SQL.');
    return String(value);
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

function stableId(prefix, ...values) {
  return `${prefix}:${createHash('sha256').update(values.join('\u0000')).digest('hex').slice(0, 32)}`;
}

function sourceAuthority(sourceId, sourceRegistry) {
  const source = sourceRegistry.sources.find((item) => item.id === sourceId);
  if (!source) throw new Error(`Source ${sourceId} is missing from the source registry.`);
  return source;
}

function sourcePolicy(sourceId, policyRegistry) {
  const policy = policyRegistry.sources.find((item) => item.id === sourceId);
  if (!policy || policy.decision !== 'approved') throw new Error(`Source ${sourceId} is not approved for import.`);
  return policy;
}

function assertionConfidence(status) {
  if (status === 'single_source_value') return 0.62;
  if (status === 'conflict') return 0.25;
  return 0.4;
}

const input = path.resolve(argument('--input', 'staging/dropbox-intake/osint-normalized/extracted/staging/osint-normalized/wikidata'));
const output = path.resolve(argument('--output', 'staging/d1-import/knowledge-batch.json'));
const manifest = readJson(path.join(input, 'staging-manifest.json'));
const quality = readJson(path.join(input, 'quality-report.json'));
const entities = readJsonLines(path.join(input, 'entities.jsonl'));
const upstreamReceiptPath = path.join(input, 'upstream-raw-receipt.json');
const upstreamReceipt = fs.existsSync(upstreamReceiptPath) ? readJson(upstreamReceiptPath) : null;
const sourceRegistry = readJson(path.resolve('data/source-registry/seed.json'));
const policyRegistry = readJson(path.resolve('data/osint/policies/p0-policy-registry.json'));

if (manifest.mode !== 'staging' || manifest.publish !== false) throw new Error('Only staging-only normalized packages may be imported.');
if (manifest.entityCount !== entities.length) throw new Error('Normalized entity count does not match entities.jsonl.');
const sourceId = manifest.sourceId;
const authority = sourceAuthority(sourceId, sourceRegistry);
const policy = sourcePolicy(sourceId, policyRegistry);
const ingestionRunId = manifest.sourceRunId ?? `normalized:${manifest.sourceFingerprint}`;
const packageArchivePath = upstreamReceipt?.archivePath ?? 'dropbox:/archive/osint-raw/unknown';
const documents = quality.sourceDocuments ?? [];

const statements = [];
statements.push(`INSERT INTO osint_sources (id, name, canonical_url, authority_score, independence_group, licence_status, robots_policy, active, updated_at) VALUES (${sql(sourceId)}, ${sql(authority.name)}, ${sql(authority.url)}, ${sql(authority.authorityScore)}, ${sql(new URL(authority.url).hostname)}, ${sql(policy.licenceStatus)}, ${sql(policy.robotsPolicy)}, 1, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name, canonical_url=excluded.canonical_url, authority_score=excluded.authority_score, licence_status=excluded.licence_status, robots_policy=excluded.robots_policy, active=1, updated_at=CURRENT_TIMESTAMP`);
statements.push(`INSERT INTO osint_ingestion_runs (id, source_id, started_at, finished_at, status, receipt_path) VALUES (${sql(ingestionRunId)}, ${sql(sourceId)}, ${sql(upstreamReceipt?.sourceRun?.createdAt ?? quality.generatedAt ?? new Date().toISOString())}, ${sql(new Date().toISOString())}, 'normalized', ${sql(upstreamReceipt?.sourceIndexPath ?? null)}) ON CONFLICT(id) DO UPDATE SET finished_at=excluded.finished_at, status='normalized', receipt_path=excluded.receipt_path`);

for (const document of documents) {
  const documentId = `${sourceId}:${document.sha256}`;
  statements.push(`INSERT INTO osint_source_documents (id, source_id, ingestion_run_id, requested_url, final_url, retrieved_at, content_sha256, content_type, byte_size, archive_path, language) VALUES (${sql(documentId)}, ${sql(sourceId)}, ${sql(ingestionRunId)}, ${sql(authority.url)}, ${sql(authority.url)}, ${sql(upstreamReceipt?.consumedAt ?? new Date().toISOString())}, ${sql(document.sha256)}, 'application/json', ${sql(document.bytes)}, ${sql(`${packageArchivePath}#${document.filename}`)}, NULL) ON CONFLICT(source_id, content_sha256) DO UPDATE SET ingestion_run_id=excluded.ingestion_run_id, retrieved_at=excluded.retrieved_at, archive_path=excluded.archive_path`);
}

for (const entity of entities) {
  const firstDocumentSha = entity.provenance?.sourceDocuments?.[0] ?? documents[0]?.sha256 ?? null;
  const sourceDocumentId = firstDocumentSha ? `${sourceId}:${firstDocumentSha}` : null;
  statements.push(`INSERT INTO knowledge_entities (id, entity_type, canonical_name, canonical_slug, status, updated_at) VALUES (${sql(entity.id)}, ${sql(entity.entityType)}, ${sql(entity.canonicalName)}, ${sql(entity.canonicalSlug)}, ${sql(entity.status)}, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET canonical_name=excluded.canonical_name, canonical_slug=excluded.canonical_slug, status=excluded.status, updated_at=CURRENT_TIMESTAMP`);

  for (const name of entity.names ?? []) {
    const nameId = stableId('name', entity.id, name.language, name.nameType, name.name);
    statements.push(`INSERT INTO knowledge_entity_names (id, entity_id, language, script, name, name_type, normalized_name, source_document_id) VALUES (${sql(nameId)}, ${sql(entity.id)}, ${sql(name.language)}, NULL, ${sql(name.name)}, ${sql(name.nameType)}, ${sql(name.normalizedName)}, ${sql(sourceDocumentId)}) ON CONFLICT(id) DO UPDATE SET name=excluded.name, normalized_name=excluded.normalized_name, source_document_id=excluded.source_document_id`);
  }

  for (const predicate of ['birth', 'death']) {
    const date = entity.dates?.[predicate];
    if (!date || !date.canonical) continue;
    const assertionId = stableId('assertion', entity.id, predicate, date.canonical, sourceId);
    const confidence = assertionConfidence(date.resolutionStatus);
    statements.push(`INSERT INTO knowledge_assertions (id, subject_entity_id, predicate, object_value, object_type, confidence, resolution_status) VALUES (${sql(assertionId)}, ${sql(entity.id)}, ${sql(`${predicate}:${date.canonical}`)}, ${sql(date.canonical)}, 'date', ${sql(confidence)}, ${sql(date.resolutionStatus)}) ON CONFLICT(id) DO UPDATE SET object_value=excluded.object_value, confidence=excluded.confidence, resolution_status=excluded.resolution_status`);
    if (sourceDocumentId) {
      const evidenceId = stableId('evidence', assertionId, sourceDocumentId);
      statements.push(`INSERT INTO knowledge_evidence (id, assertion_id, source_document_id, source_authority_score, evidence_locator, extracted_text_hash, supports, observed_at) VALUES (${sql(evidenceId)}, ${sql(assertionId)}, ${sql(sourceDocumentId)}, ${sql(authority.authorityScore)}, ${sql(`normalized:${entity.qid}:${predicate}`)}, NULL, 1, ${sql(upstreamReceipt?.consumedAt ?? new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET source_authority_score=excluded.source_authority_score, observed_at=excluded.observed_at`);
    }
  }
}

const statementSha256 = createHash('sha256').update(JSON.stringify(statements)).digest('hex');
const batch = {
  schemaVersion: 1,
  execution: 'D1Database.batch',
  atomic: true,
  lane: 'saints',
  partition: sourceId,
  sourceId,
  sourceRunId: ingestionRunId,
  sourceFingerprint: manifest.sourceFingerprint,
  entityCount: entities.length,
  conflictCount: manifest.conflictCount,
  idempotencyKey: `saints:${sourceId}:${manifest.sourceFingerprint}`,
  statementsSha256: statementSha256,
  statementCount: statements.length,
  statements,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(batch, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output, lane: batch.lane, partition: batch.partition, entityCount: batch.entityCount, statementCount: batch.statementCount, idempotencyKey: batch.idempotencyKey }, null, 2));

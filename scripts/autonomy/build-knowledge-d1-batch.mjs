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

const localeAlias = { tl: 'fil', 'pt-br': 'pt', 'pt-pt': 'pt', 'en-gb': 'en', 'en-us': 'en' };
const supportedLocales = new Set(['en','es','pt','fr','fil','ru','sw','de','it','pl']);
function canonicalLocale(language) {
  const raw = String(language ?? '').trim().toLowerCase().replace('_', '-');
  return localeAlias[raw] ?? raw.split('-')[0];
}
function scriptForName(value) {
  if (/[\u0400-\u052f]/u.test(value)) return 'Cyrl';
  if (/[\u0370-\u03ff\u1f00-\u1fff]/u.test(value)) return 'Grek';
  if (/[\u0530-\u058f]/u.test(value)) return 'Armn';
  if (/[\u1200-\u137f]/u.test(value)) return 'Ethi';
  if (/[\u0700-\u074f]/u.test(value)) return 'Syrc';
  if (/[\u0600-\u06ff]/u.test(value)) return 'Arab';
  return 'Latn';
}

const input = path.resolve(argument('--input', 'staging/dropbox-intake/osint-reviewed/extracted/staging/osint-reviewed/wikidata'));
const output = path.resolve(argument('--output', 'staging/d1-import/knowledge-batch.json'));
const manifest = readJson(path.join(input, 'staging-manifest.json'));
const quality = readJson(path.join(input, 'quality-report.json'));
const entities = readJsonLines(path.join(input, 'entities.jsonl'));
const linguisticPath = path.join(input, 'linguistic-review.json');
const linguistic = fs.existsSync(linguisticPath) ? readJson(linguisticPath) : null;
const upstreamReceiptPath = path.join(input, 'upstream-raw-receipt.json');
const upstreamReceipt = fs.existsSync(upstreamReceiptPath) ? readJson(upstreamReceiptPath) : null;
const sourceRegistry = readJson(path.resolve('data/source-registry/seed.json'));
const policyRegistry = readJson(path.resolve('data/osint/policies/p0-policy-registry.json'));

if (manifest.mode !== 'staging' || manifest.publish !== false) throw new Error('Only staging-only normalized packages may be imported.');
if (manifest.entityCount !== entities.length) throw new Error('Normalized entity count does not match entities.jsonl.');
if (linguistic && linguistic.criticalCount !== 0) throw new Error('Package contains unresolved critical linguistic issues.');
const sourceId = manifest.sourceId;
const authority = sourceAuthority(sourceId, sourceRegistry);
const policy = sourcePolicy(sourceId, policyRegistry);
const ingestionRunId = manifest.sourceRunId ?? `normalized:${manifest.sourceFingerprint}`;
const packageArchivePath = upstreamReceipt?.archivePath ?? 'dropbox:/archive/osint-raw/unknown';
const documents = quality.sourceDocuments ?? [];
const independenceGroup = new URL(authority.url).hostname;
const observedAt = upstreamReceipt?.consumedAt ?? new Date().toISOString();

const statements = [];
statements.push(`INSERT INTO osint_sources (id, name, canonical_url, authority_score, independence_group, licence_status, robots_policy, active, updated_at) VALUES (${sql(sourceId)}, ${sql(authority.name)}, ${sql(authority.url)}, ${sql(authority.authorityScore)}, ${sql(independenceGroup)}, ${sql(policy.licenceStatus)}, ${sql(policy.robotsPolicy)}, 1, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name, canonical_url=excluded.canonical_url, authority_score=excluded.authority_score, independence_group=excluded.independence_group, licence_status=excluded.licence_status, robots_policy=excluded.robots_policy, active=1, updated_at=CURRENT_TIMESTAMP`);
statements.push(`INSERT INTO osint_ingestion_runs (id, source_id, started_at, finished_at, status, receipt_path) VALUES (${sql(ingestionRunId)}, ${sql(sourceId)}, ${sql(upstreamReceipt?.sourceRun?.createdAt ?? quality.generatedAt ?? observedAt)}, ${sql(observedAt)}, 'normalized', ${sql(upstreamReceipt?.sourceIndexPath ?? null)}) ON CONFLICT(id) DO UPDATE SET finished_at=excluded.finished_at, status='normalized', receipt_path=excluded.receipt_path`);

for (const document of documents) {
  const documentId = `${sourceId}:${document.sha256}`;
  statements.push(`INSERT INTO osint_source_documents (id, source_id, ingestion_run_id, requested_url, final_url, retrieved_at, content_sha256, content_type, byte_size, archive_path, language) VALUES (${sql(documentId)}, ${sql(sourceId)}, ${sql(ingestionRunId)}, ${sql(authority.url)}, ${sql(authority.url)}, ${sql(observedAt)}, ${sql(document.sha256)}, 'application/json', ${sql(document.bytes)}, ${sql(`${packageArchivePath}#${document.filename}`)}, NULL) ON CONFLICT(source_id, content_sha256) DO UPDATE SET ingestion_run_id=excluded.ingestion_run_id, retrieved_at=excluded.retrieved_at, archive_path=excluded.archive_path`);
}

for (const entity of entities) {
  const firstDocumentSha = entity.provenance?.sourceDocuments?.[0] ?? documents[0]?.sha256 ?? null;
  const sourceDocumentId = firstDocumentSha ? `${sourceId}:${firstDocumentSha}` : null;
  statements.push(`INSERT INTO knowledge_entities (id, entity_type, canonical_name, canonical_slug, status, updated_at) VALUES (${sql(entity.id)}, ${sql(entity.entityType)}, ${sql(entity.canonicalName)}, ${sql(entity.canonicalSlug)}, ${sql(entity.status)}, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET canonical_name=excluded.canonical_name, canonical_slug=excluded.canonical_slug, status=excluded.status, updated_at=CURRENT_TIMESTAMP`);

  if (entity.qid) {
    const externalId = stableId('external-id', 'wikidata', entity.qid);
    statements.push(`INSERT INTO knowledge_external_identifiers (id, entity_id, scheme, external_value, source_document_id, confidence, resolution_status, updated_at) VALUES (${sql(externalId)}, ${sql(entity.id)}, 'wikidata', ${sql(entity.qid)}, ${sql(sourceDocumentId)}, 1.0, 'resolved', CURRENT_TIMESTAMP) ON CONFLICT(scheme, external_value) DO UPDATE SET entity_id=excluded.entity_id, source_document_id=excluded.source_document_id, confidence=1.0, resolution_status='resolved', updated_at=CURRENT_TIMESTAMP`);
    const identityLinkId = stableId('identity-link', sourceId, entity.qid);
    statements.push(`INSERT INTO knowledge_identity_links (id, source_record_key, source_id, entity_id, confidence, resolution_status, signals_json, vetoes_json, updated_at) VALUES (${sql(identityLinkId)}, ${sql(entity.qid)}, ${sql(sourceId)}, ${sql(entity.id)}, 1.0, 'resolved', ${sql(JSON.stringify([{ signal: 'exactExternalIdentifier', scheme: 'wikidata', value: entity.qid, weight: 1.0 }]))}, '[]', CURRENT_TIMESTAMP) ON CONFLICT(source_id, source_record_key) DO UPDATE SET entity_id=excluded.entity_id, confidence=1.0, resolution_status='resolved', signals_json=excluded.signals_json, vetoes_json='[]', updated_at=CURRENT_TIMESTAMP`);
  }

  for (const name of entity.names ?? []) {
    const nameId = stableId('name', entity.id, name.language, name.nameType, name.name);
    const script = scriptForName(name.name);
    statements.push(`INSERT INTO knowledge_entity_names (id, entity_id, language, script, name, name_type, normalized_name, source_document_id) VALUES (${sql(nameId)}, ${sql(entity.id)}, ${sql(name.language)}, ${sql(script)}, ${sql(name.name)}, ${sql(name.nameType)}, ${sql(name.normalizedName)}, ${sql(sourceDocumentId)}) ON CONFLICT(id) DO UPDATE SET name=excluded.name, script=excluded.script, normalized_name=excluded.normalized_name, source_document_id=excluded.source_document_id`);

    const locale = canonicalLocale(name.language);
    if (supportedLocales.has(locale)) {
      const localizedId = stableId('localized-name', entity.id, locale, name.name);
      statements.push(`INSERT INTO knowledge_localized_names (id, entity_id, locale, language, script, name, normalized_name, name_type, quality_status, confidence, resolution_status, source_count, is_preferred, updated_at) VALUES (${sql(localizedId)}, ${sql(entity.id)}, ${sql(locale)}, ${sql(name.language)}, ${sql(script)}, ${sql(name.name)}, ${sql(name.normalizedName)}, 'source-label', 'source-only', 0.70, 'candidate', 1, 0, CURRENT_TIMESTAMP) ON CONFLICT(entity_id, locale, name, name_type) DO UPDATE SET script=excluded.script, normalized_name=excluded.normalized_name, confidence=MAX(knowledge_localized_names.confidence, excluded.confidence), updated_at=CURRENT_TIMESTAMP`);
      const evidenceId = stableId('name-evidence', localizedId, sourceId, sourceDocumentId ?? 'none');
      statements.push(`INSERT INTO knowledge_name_evidence (id, localized_name_id, source_document_id, source_id, evidence_type, source_authority_score, independence_group, supports, observed_at) VALUES (${sql(evidenceId)}, ${sql(localizedId)}, ${sql(sourceDocumentId)}, ${sql(sourceId)}, 'source-label', ${sql(authority.authorityScore)}, ${sql(independenceGroup)}, 1, ${sql(observedAt)}) ON CONFLICT(id) DO UPDATE SET source_authority_score=excluded.source_authority_score, independence_group=excluded.independence_group, observed_at=excluded.observed_at`);
    }
  }

  for (const predicate of ['birth', 'death']) {
    const date = entity.dates?.[predicate];
    if (!date || !date.canonical) continue;
    const assertionId = stableId('assertion', entity.id, predicate, date.canonical, sourceId);
    const confidence = assertionConfidence(date.resolutionStatus);
    statements.push(`INSERT INTO knowledge_assertions (id, subject_entity_id, predicate, object_value, object_type, confidence, resolution_status) VALUES (${sql(assertionId)}, ${sql(entity.id)}, ${sql(predicate)}, ${sql(date.canonical)}, 'date', ${sql(confidence)}, ${sql(date.resolutionStatus)}) ON CONFLICT(id) DO UPDATE SET object_value=excluded.object_value, confidence=excluded.confidence, resolution_status=excluded.resolution_status`);
    if (sourceDocumentId) {
      const evidenceId = stableId('evidence', assertionId, sourceDocumentId);
      statements.push(`INSERT INTO knowledge_evidence (id, assertion_id, source_document_id, source_authority_score, evidence_locator, extracted_text_hash, supports, observed_at) VALUES (${sql(evidenceId)}, ${sql(assertionId)}, ${sql(sourceDocumentId)}, ${sql(authority.authorityScore)}, ${sql(`normalized:${entity.qid}:${predicate}`)}, NULL, 1, ${sql(observedAt)}) ON CONFLICT(id) DO UPDATE SET source_authority_score=excluded.source_authority_score, observed_at=excluded.observed_at`);
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

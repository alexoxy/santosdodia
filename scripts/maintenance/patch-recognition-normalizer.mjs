#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(path, before, after) {
  const source = fs.readFileSync(path, 'utf8');
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${path}: expected patch anchor not found: ${before.slice(0, 100)}`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${path}: patch anchor is not unique.`);
  fs.writeFileSync(path, source.slice(0, first) + after + source.slice(first + before.length), 'utf8');
}

const normalizer = 'scripts/osint/normalize-wikidata-saints.mjs';
replaceOnce(normalizer, "const NORMALIZATION_VERSION = '1.0';", "const NORMALIZATION_VERSION = '1.1';");
replaceOnce(normalizer,
  "    const descriptions = collectLocalizedValues(rows, 'itemDescription');\n    const birth = collectDates(rows, 'birth');",
  "    const descriptions = collectLocalizedValues(rows, 'itemDescription');\n    const recognitionStatuses = collectRecognitionStatuses(rows);\n    const birth = collectDates(rows, 'birth');");
replaceOnce(normalizer,
  "    labelLanguages: {},\n    dateConflicts: { birth: 0, death: 0 },",
  "    labelLanguages: {},\n    recognitionStatusCounts: {},\n    entitiesMissingRecognitionStatus: 0,\n    dateConflicts: { birth: 0, death: 0 },");
replaceOnce(normalizer,
  "    if (portugueseArticles.length === 0) metrics.missing.portugueseArticle += 1;\n    if (images.length > 1) metrics.multipleImages += 1;",
  "    if (portugueseArticles.length === 0) metrics.missing.portugueseArticle += 1;\n    if (images.length > 1) metrics.multipleImages += 1;\n    if (recognitionStatuses.length === 0) metrics.entitiesMissingRecognitionStatus += 1;\n    for (const recognition of recognitionStatuses) {\n      metrics.recognitionStatusCounts[recognition.qid] = (metrics.recognitionStatusCounts[recognition.qid] ?? 0) + 1;\n    }");
replaceOnce(normalizer,
  "    const entityWarnings = [];\n    const hasInvalidDateNodes",
  "    const entityWarnings = [];\n    if (recognitionStatuses.length === 0) entityWarnings.push('recognition_status_missing_or_legacy_raw');\n    const hasInvalidDateNodes");
replaceOnce(normalizer,
  "      entityType: 'saint',\n      qid,",
  "      entityType: 'historical-person',\n      qid,");
replaceOnce(normalizer,
  "      status: needsReview ? 'needs_review' : 'candidate',\n      names:",
  "      status: needsReview ? 'needs_review' : 'candidate',\n      recognition: {\n        sourceStatusCandidates: recognitionStatuses,\n        resolutionStatus: recognitionStatuses.length > 0 ? 'source_candidates' : 'missing',\n        churchConfirmed: false,\n      },\n      names:");
replaceOnce(normalizer,
  "        sourceId: 'wikidata',\n        licence: 'CC0-1.0',",
  "        sourceId: 'wikidata',\n        queryVersion: source.summary?.queryVersion ?? null,\n        licence: 'CC0-1.0',");
replaceOnce(normalizer,
  "      scope: {\n        wikidataClass: 'Q43115',\n        liturgicalCalendarEligibility: 'unverified',\n      },",
  "      scope: {\n        candidateUniverse: 'wikidata-recognition',\n        churchRecognition: 'unverified',\n        liturgicalCalendarEligibility: 'unverified',\n      },");
replaceOnce(normalizer,
  "  warnings.push('Wikidata saint classification does not establish inclusion in a specific Christian tradition or liturgical calendar.');",
  "  warnings.push('Wikidata recognition-status and saint-classification claims are discovery evidence only; they do not establish Church recognition, category or liturgical-calendar inclusion.');");
replaceOnce(normalizer,
  "    sourceRunId: source.summary?.runId ?? null,\n    sourceFingerprint,",
  "    sourceRunId: source.summary?.runId ?? null,\n    queryVersion: source.summary?.queryVersion ?? null,\n    sourceFingerprint,");
replaceOnce(normalizer,
  "    sourceRunId: source.summary?.runId ?? null,\n    sourceDocuments,",
  "    sourceRunId: source.summary?.runId ?? null,\n    queryVersion: source.summary?.queryVersion ?? null,\n    sourceDocuments,");
replaceOnce(normalizer,
  "      wikidataIdentifiers: 'validated',\n      labels: 'acquired',",
  "      wikidataIdentifiers: 'validated',\n      recognitionStatuses: 'acquired_or_legacy_missing',\n      labels: 'acquired',");
replaceOnce(normalizer,
  "function collectUris(rows, field) {",
  "function collectRecognitionStatuses(rows) {\n  const map = new Map();\n  for (const { binding } of rows) {\n    const qid = extractQid(binding?.recognitionStatus?.value);\n    if (!qid) continue;\n    const current = map.get(qid) ?? { qid, labels: new Map() };\n    const labelNode = binding?.recognitionStatusLabel;\n    if (labelNode && typeof labelNode.value === 'string' && labelNode.value.trim()) {\n      const language = typeof labelNode['xml:lang'] === 'string' ? labelNode['xml:lang'].toLowerCase() : '';\n      const value = labelNode.value.trim();\n      current.labels.set(`${language}\\u0000${value}`, { language: language || 'und', value });\n    }\n    map.set(qid, current);\n  }\n  return [...map.values()].sort((a, b) => compareQids(a.qid, b.qid)).map((entry) => ({\n    qid: entry.qid,\n    labels: [...entry.labels.values()].sort((a, b) => languageRank(a.language === 'und' ? '' : a.language) - languageRank(b.language === 'und' ? '' : b.language) || a.value.localeCompare(b.value)),\n    evidenceType: 'wikidata-recognition-status',\n  }));\n}\n\nfunction collectUris(rows, field) {");
replaceOnce(normalizer,
  "  const header = ['qid', 'canonical_name', 'warnings', 'conflict_ids', 'birth_candidates', 'death_candidates', 'portuguese_article'];",
  "  const header = ['qid', 'canonical_name', 'recognition_status_qids', 'warnings', 'conflict_ids', 'birth_candidates', 'death_candidates', 'portuguese_article'];");
replaceOnce(normalizer,
  "    entity.canonicalName,\n    entity.quality.warnings.join('|'),",
  "    entity.canonicalName,\n    (entity.recognition?.sourceStatusCandidates ?? []).map((item) => item.qid).join('|'),\n    entity.quality.warnings.join('|'),");

const builder = 'scripts/autonomy/build-knowledge-d1-batch.mjs';
replaceOnce(builder,
  "ON CONFLICT(id) DO UPDATE SET canonical_name=excluded.canonical_name, canonical_slug=excluded.canonical_slug, status=excluded.status, updated_at=CURRENT_TIMESTAMP`);",
  "ON CONFLICT(id) DO UPDATE SET entity_type=excluded.entity_type, canonical_name=excluded.canonical_name, canonical_slug=excluded.canonical_slug, status=excluded.status, updated_at=CURRENT_TIMESTAMP`);");
replaceOnce(builder,
  "  for (const predicate of ['birth', 'death']) {",
  "  for (const recognition of entity.recognition?.sourceStatusCandidates ?? []) {\n    if (!recognition?.qid) continue;\n    const assertionId = stableId('assertion', entity.id, 'recognition-status-candidate', recognition.qid, sourceId);\n    statements.push(`INSERT INTO knowledge_assertions (id, subject_entity_id, predicate, object_value, object_type, confidence, resolution_status) VALUES (${sql(assertionId)}, ${sql(entity.id)}, 'recognition-status-candidate', ${sql(recognition.qid)}, 'wikidata-entity-id', 0.45, 'source_candidate') ON CONFLICT(id) DO UPDATE SET object_value=excluded.object_value, confidence=excluded.confidence, resolution_status=excluded.resolution_status`);\n    if (sourceDocumentId) {\n      const evidenceId = stableId('evidence', assertionId, sourceDocumentId);\n      statements.push(`INSERT INTO knowledge_evidence (id, assertion_id, source_document_id, source_authority_score, evidence_locator, extracted_text_hash, supports, observed_at) VALUES (${sql(evidenceId)}, ${sql(assertionId)}, ${sql(sourceDocumentId)}, ${sql(authority.authorityScore)}, ${sql(`normalized:${entity.qid}:recognition-status:${recognition.qid}`)}, NULL, 1, ${sql(observedAt)}) ON CONFLICT(id) DO UPDATE SET source_authority_score=excluded.source_authority_score, observed_at=excluded.observed_at`);\n    }\n  }\n\n  for (const predicate of ['birth', 'death']) {");

const test = 'scripts/osint/test-normalize-wikidata-saints.mjs';
replaceOnce(test,
  "binding('Q1', { label: ['pt', 'Santo Um'], birth: literalDate('1900-01-01'), image: 'https://commons.example/a.jpg' }),\n    binding('Q1', { label: ['pt', 'Santo Um'], birth: literalDate('1901-01-01'), image: 'https://commons.example/b.jpg' }),\n    binding('Q2', { label: ['en', 'Saint Two'], birth: { type: 'uri', value: 'http://www.wikidata.org/.well-known/genid/uncertain' } }),",
  "binding('Q1', { label: ['pt', 'Santo Um'], recognition: ['Q123110154', 'pt', 'santo canonizado'], birth: literalDate('1900-01-01'), image: 'https://commons.example/a.jpg' }),\n    binding('Q1', { label: ['pt', 'Santo Um'], recognition: ['Q123110154', 'pt', 'santo canonizado'], birth: literalDate('1901-01-01'), image: 'https://commons.example/b.jpg' }),\n    binding('Q2', { label: ['en', 'Blessed Two'], recognition: ['Q2369287', 'en', 'blessed'], birth: { type: 'uri', value: 'http://www.wikidata.org/.well-known/genid/uncertain' } }),");
replaceOnce(test,
  "  assert.equal(first.qualityReport.metrics.invalidDateNodes.birth, 1);\n  assert.equal(first.qualityReport.sourceFieldCoverage.birthPlaces, 'not_acquired');",
  "  assert.equal(first.qualityReport.metrics.invalidDateNodes.birth, 1);\n  assert.equal(first.qualityReport.metrics.entitiesMissingRecognitionStatus, 1);\n  assert.equal(first.qualityReport.metrics.recognitionStatusCounts.Q123110154, 1);\n  assert.equal(first.qualityReport.metrics.recognitionStatusCounts.Q2369287, 1);\n  assert.equal(first.qualityReport.sourceFieldCoverage.recognitionStatuses, 'acquired_or_legacy_missing');\n  assert.equal(first.qualityReport.sourceFieldCoverage.birthPlaces, 'not_acquired');");
replaceOnce(test,
  "  assert.equal(q1.status, 'needs_review');\n  assert.equal(q1.dates.birth.canonical, null);",
  "  assert.equal(q1.status, 'needs_review');\n  assert.equal(q1.entityType, 'historical-person');\n  assert.equal(q1.recognition.churchConfirmed, false);\n  assert.deepEqual(q1.recognition.sourceStatusCandidates.map((item) => item.qid), ['Q123110154']);\n  assert.equal(q1.dates.birth.canonical, null);");
replaceOnce(test,
  "  assert.equal(q2.status, 'needs_review');\n  assert.equal(q2.dates.birth.invalidNodes.length, 1);",
  "  assert.equal(q2.status, 'needs_review');\n  assert.equal(q2.entityType, 'historical-person');\n  assert.deepEqual(q2.recognition.sourceStatusCandidates.map((item) => item.qid), ['Q2369287']);\n  assert.equal(q2.dates.birth.invalidNodes.length, 1);");
replaceOnce(test,
  "  assert.equal(q3.canonicalName, 'Q3');\n  assert.ok(q3.quality.warnings.includes('canonical_name_falls_back_to_qid'));",
  "  assert.equal(q3.canonicalName, 'Q3');\n  assert.ok(q3.quality.warnings.includes('canonical_name_falls_back_to_qid'));\n  assert.ok(q3.quality.warnings.includes('recognition_status_missing_or_legacy_raw'));\n  assert.equal(q3.entityType, 'historical-person');");
replaceOnce(test,
  "  if (options.description) result.itemDescription = { type: 'literal', 'xml:lang': options.description[0], value: options.description[1] };\n  if (options.birth) result.birth = options.birth;",
  "  if (options.description) result.itemDescription = { type: 'literal', 'xml:lang': options.description[0], value: options.description[1] };\n  if (options.recognition) {\n    result.recognitionStatus = { type: 'uri', value: `http://www.wikidata.org/entity/${options.recognition[0]}` };\n    result.recognitionStatusLabel = { type: 'literal', 'xml:lang': options.recognition[1], value: options.recognition[2] };\n  }\n  if (options.birth) result.birth = options.birth;");

console.log('Recognition-aware normalizer, D1 staging assertions and tests patched.');

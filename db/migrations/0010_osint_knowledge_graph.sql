PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS osint_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  publisher TEXT,
  authority_score INTEGER NOT NULL CHECK(authority_score BETWEEN 0 AND 100),
  independence_group TEXT,
  licence_status TEXT NOT NULL,
  robots_policy TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS osint_ingestion_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES osint_sources(id),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,
  receipt_path TEXT,
  error_code TEXT,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS osint_source_documents (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES osint_sources(id),
  ingestion_run_id TEXT NOT NULL REFERENCES osint_ingestion_runs(id),
  requested_url TEXT NOT NULL,
  final_url TEXT,
  retrieved_at TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  content_type TEXT,
  byte_size INTEGER NOT NULL,
  archive_path TEXT NOT NULL,
  language TEXT,
  UNIQUE(source_id, content_sha256)
);

CREATE TABLE IF NOT EXISTS knowledge_entities (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  canonical_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, canonical_slug)
);

CREATE TABLE IF NOT EXISTS knowledge_entity_names (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  script TEXT,
  name TEXT NOT NULL,
  name_type TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  source_document_id TEXT REFERENCES osint_source_documents(id),
  UNIQUE(entity_id, language, name, name_type)
);

CREATE TABLE IF NOT EXISTS knowledge_assertions (
  id TEXT PRIMARY KEY,
  subject_entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  predicate TEXT NOT NULL,
  object_entity_id TEXT REFERENCES knowledge_entities(id),
  object_value TEXT,
  object_type TEXT NOT NULL,
  valid_from TEXT,
  valid_to TEXT,
  tradition_id TEXT,
  jurisdiction_id TEXT,
  calendar_system TEXT,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
  resolution_status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(object_entity_id IS NOT NULL OR object_value IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS knowledge_evidence (
  id TEXT PRIMARY KEY,
  assertion_id TEXT NOT NULL REFERENCES knowledge_assertions(id) ON DELETE CASCADE,
  source_document_id TEXT NOT NULL REFERENCES osint_source_documents(id),
  source_authority_score INTEGER NOT NULL,
  evidence_locator TEXT,
  extracted_text_hash TEXT,
  supports INTEGER NOT NULL DEFAULT 1,
  observed_at TEXT NOT NULL,
  UNIQUE(assertion_id, source_document_id, evidence_locator)
);

CREATE TABLE IF NOT EXISTS knowledge_conflicts (
  id TEXT PRIMARY KEY,
  subject_entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  predicate TEXT NOT NULL,
  assertion_a_id TEXT NOT NULL REFERENCES knowledge_assertions(id),
  assertion_b_id TEXT NOT NULL REFERENCES knowledge_assertions(id),
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS publication_snapshots (
  id TEXT PRIMARY KEY,
  dataset_version TEXT NOT NULL UNIQUE,
  content_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL,
  previous_snapshot_id TEXT REFERENCES publication_snapshots(id),
  rollback_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_assertions_subject_predicate ON knowledge_assertions(subject_entity_id, predicate);
CREATE INDEX IF NOT EXISTS idx_evidence_assertion ON knowledge_evidence(assertion_id);
CREATE INDEX IF NOT EXISTS idx_documents_source_retrieved ON osint_source_documents(source_id, retrieved_at);

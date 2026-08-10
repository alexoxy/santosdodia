PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS knowledge_external_identifiers (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  scheme TEXT NOT NULL,
  external_value TEXT NOT NULL,
  source_document_id TEXT REFERENCES osint_source_documents(id),
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
  resolution_status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scheme, external_value)
);

CREATE TABLE IF NOT EXISTS knowledge_localized_names (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  language TEXT NOT NULL,
  script TEXT NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  name_type TEXT NOT NULL,
  quality_status TEXT NOT NULL,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
  resolution_status TEXT NOT NULL DEFAULT 'candidate',
  source_count INTEGER NOT NULL DEFAULT 1 CHECK(source_count >= 1),
  is_preferred INTEGER NOT NULL DEFAULT 0 CHECK(is_preferred IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_id, locale, name, name_type)
);

CREATE TABLE IF NOT EXISTS knowledge_name_evidence (
  id TEXT PRIMARY KEY,
  localized_name_id TEXT NOT NULL REFERENCES knowledge_localized_names(id) ON DELETE CASCADE,
  source_document_id TEXT REFERENCES osint_source_documents(id),
  source_id TEXT NOT NULL REFERENCES osint_sources(id),
  evidence_type TEXT NOT NULL,
  source_authority_score INTEGER NOT NULL CHECK(source_authority_score BETWEEN 0 AND 100),
  independence_group TEXT,
  supports INTEGER NOT NULL DEFAULT 1 CHECK(supports IN (0,1)),
  observed_at TEXT NOT NULL,
  UNIQUE(localized_name_id, source_id, source_document_id, evidence_type)
);

CREATE TABLE IF NOT EXISTS knowledge_identity_links (
  id TEXT PRIMARY KEY,
  source_record_key TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES osint_sources(id),
  entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
  resolution_status TEXT NOT NULL,
  signals_json TEXT NOT NULL,
  vetoes_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_id, source_record_key)
);

CREATE INDEX IF NOT EXISTS idx_external_identifiers_entity ON knowledge_external_identifiers(entity_id, scheme);
CREATE INDEX IF NOT EXISTS idx_localized_names_entity_locale ON knowledge_localized_names(entity_id, locale, is_preferred);
CREATE INDEX IF NOT EXISTS idx_localized_names_normalized ON knowledge_localized_names(locale, normalized_name);
CREATE INDEX IF NOT EXISTS idx_name_evidence_localized_name ON knowledge_name_evidence(localized_name_id);
CREATE INDEX IF NOT EXISTS idx_identity_links_entity ON knowledge_identity_links(entity_id, source_id);

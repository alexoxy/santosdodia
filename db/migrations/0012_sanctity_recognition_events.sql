PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sanctity_recognition_events (
  id TEXT PRIMARY KEY,
  person_entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  church_id TEXT NOT NULL,
  jurisdiction_id TEXT,
  event_type TEXT NOT NULL,
  recognition_state TEXT,
  announced_at TEXT,
  effective_from TEXT,
  feast_date_rule_json TEXT,
  scope_json TEXT,
  source_document_id TEXT REFERENCES osint_source_documents(id),
  source_id TEXT NOT NULL REFERENCES osint_sources(id),
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
  resolution_status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_entity_id, church_id, event_type, effective_from, source_id)
);

CREATE TABLE IF NOT EXISTS baseline_registry_versions (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  version TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  entity_count INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  frozen_at TEXT NOT NULL,
  supersedes_id TEXT REFERENCES baseline_registry_versions(id),
  change_reason TEXT,
  UNIQUE(domain, version)
);

CREATE TABLE IF NOT EXISTS baseline_change_events (
  id TEXT PRIMARY KEY,
  baseline_id TEXT NOT NULL REFERENCES baseline_registry_versions(id),
  entity_id TEXT REFERENCES knowledge_entities(id),
  change_type TEXT NOT NULL,
  source_document_id TEXT REFERENCES osint_source_documents(id),
  source_id TEXT REFERENCES osint_sources(id),
  effective_at TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recognition_events_person_church ON sanctity_recognition_events(person_entity_id, church_id, effective_from);
CREATE INDEX IF NOT EXISTS idx_baseline_change_events_entity ON baseline_change_events(entity_id, change_type, effective_at);

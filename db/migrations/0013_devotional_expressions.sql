PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS devotional_expressions (
  id TEXT PRIMARY KEY,
  subject_entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  expression_type TEXT NOT NULL,
  canonical_key TEXT NOT NULL UNIQUE,
  church_id TEXT,
  jurisdiction_id TEXT,
  status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devotional_expression_names (
  id TEXT PRIMARY KEY,
  expression_id TEXT NOT NULL REFERENCES devotional_expressions(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  language TEXT NOT NULL,
  script TEXT NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  name_type TEXT NOT NULL,
  quality_status TEXT NOT NULL,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
  source_document_id TEXT REFERENCES osint_source_documents(id),
  source_id TEXT NOT NULL REFERENCES osint_sources(id),
  is_preferred INTEGER NOT NULL DEFAULT 0 CHECK(is_preferred IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(expression_id, locale, name, name_type)
);

CREATE TABLE IF NOT EXISTS devotional_events (
  id TEXT PRIMARY KEY,
  subject_entity_id TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  canonical_key TEXT NOT NULL UNIQUE,
  occurred_from TEXT,
  occurred_to TEXT,
  place_entity_id TEXT REFERENCES knowledge_entities(id),
  church_id TEXT,
  recognition_status TEXT NOT NULL DEFAULT 'unreviewed',
  recognition_authority TEXT,
  source_document_id TEXT REFERENCES osint_source_documents(id),
  source_id TEXT REFERENCES osint_sources(id),
  confidence REAL CHECK(confidence BETWEEN 0 AND 1),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devotional_expression_relations (
  id TEXT PRIMARY KEY,
  expression_id TEXT NOT NULL REFERENCES devotional_expressions(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  related_expression_id TEXT REFERENCES devotional_expressions(id),
  related_event_id TEXT REFERENCES devotional_events(id),
  related_entity_id TEXT REFERENCES knowledge_entities(id),
  source_document_id TEXT REFERENCES osint_source_documents(id),
  source_id TEXT REFERENCES osint_sources(id),
  confidence REAL CHECK(confidence BETWEEN 0 AND 1),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(related_expression_id IS NOT NULL OR related_event_id IS NOT NULL OR related_entity_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_devotional_expressions_subject ON devotional_expressions(subject_entity_id, expression_type);
CREATE INDEX IF NOT EXISTS idx_devotional_names_locale ON devotional_expression_names(expression_id, locale, is_preferred);
CREATE INDEX IF NOT EXISTS idx_devotional_events_subject ON devotional_events(subject_entity_id, event_type, occurred_from);

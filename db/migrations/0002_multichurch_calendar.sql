PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS calendar_import_runs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  dropbox_manifest_path TEXT NOT NULL CHECK (dropbox_manifest_path LIKE '/Santos do Dia/02_Dados_Eclesiasticos/%'),
  manifest_sha256 TEXT NOT NULL CHECK (length(manifest_sha256) = 64),
  status TEXT NOT NULL CHECK (status IN ('provisional','validated','rejected','promoted','rolled-back')),
  validation_report_path TEXT CHECK (validation_report_path IS NULL OR validation_report_path LIKE '/Santos do Dia/02_Dados_Eclesiasticos/%'),
  promoted_at TEXT,
  promoted_by TEXT,
  rollback_of_run_id TEXT REFERENCES calendar_import_runs(id),
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS calendar_sources (
  id TEXT PRIMARY KEY REFERENCES source_registry(id),
  church_id TEXT NOT NULL REFERENCES churches(id),
  jurisdiction_id TEXT REFERENCES jurisdictions(id),
  usage_policy TEXT NOT NULL,
  copyright_policy TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  UNIQUE(id, church_id, jurisdiction_id)
);

CREATE TABLE IF NOT EXISTS calendar_observances (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL REFERENCES churches(id),
  canonical_key TEXT NOT NULL,
  category TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(church_id, canonical_key)
);

CREATE TABLE IF NOT EXISTS jurisdiction_calendar_policies (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL REFERENCES churches(id),
  jurisdiction_id TEXT REFERENCES jurisdictions(id),
  engine_id TEXT NOT NULL,
  fixed_date_policy TEXT NOT NULL,
  calendar_system TEXT NOT NULL,
  effective_from TEXT,
  effective_to TEXT,
  source_id TEXT NOT NULL REFERENCES calendar_sources(id),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('provisional','cross-checked','verified','retired')),
  UNIQUE(church_id, jurisdiction_id, effective_from)
);

CREATE TABLE IF NOT EXISTS calendar_rules (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL REFERENCES churches(id),
  jurisdiction_id TEXT REFERENCES jurisdictions(id),
  canonical_event_id TEXT NOT NULL REFERENCES calendar_observances(id),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('fixed-date','easter-offset','weekday-relative-to-fixed-date','weekday-relative-to-easter','native-calendar-date','annual-source-table','transfer-or-omission')),
  calendar_system TEXT NOT NULL,
  anchor_event_id TEXT REFERENCES calendar_observances(id),
  offset_days INTEGER,
  month INTEGER CHECK (month BETWEEN 1 AND 13),
  day INTEGER CHECK (day BETWEEN 1 AND 31),
  native_month TEXT,
  native_day INTEGER,
  weekday_rule TEXT,
  date_range_start TEXT,
  date_range_end TEXT,
  effective_from TEXT,
  effective_to TEXT,
  source_id TEXT NOT NULL REFERENCES calendar_sources(id),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('provisional','cross-checked','verified','rejected','retired')),
  UNIQUE(church_id, jurisdiction_id, canonical_event_id, effective_from, source_id)
);

CREATE TABLE IF NOT EXISTS calendar_occurrences (
  id TEXT PRIMARY KEY,
  import_run_id TEXT NOT NULL REFERENCES calendar_import_runs(id),
  church_id TEXT NOT NULL REFERENCES churches(id),
  jurisdiction_id TEXT REFERENCES jurisdictions(id),
  canonical_event_id TEXT NOT NULL REFERENCES calendar_observances(id),
  date_iso TEXT NOT NULL,
  end_date_iso TEXT,
  native_calendar_system TEXT,
  native_year INTEGER,
  native_month TEXT,
  native_day INTEGER,
  rank_code TEXT,
  colour_code TEXT,
  rule_id TEXT REFERENCES calendar_rules(id),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('provisional','cross-checked','verified','rejected')),
  publication_status TEXT NOT NULL DEFAULT 'withheld' CHECK (publication_status IN ('withheld','publishable','published','withdrawn')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(church_id, jurisdiction_id, canonical_event_id, date_iso)
);

CREATE TABLE IF NOT EXISTS calendar_occurrence_assertions (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL REFERENCES calendar_occurrences(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES calendar_sources(id),
  asserted_date_iso TEXT NOT NULL,
  source_record_url TEXT,
  source_record_hash TEXT,
  observed_at TEXT NOT NULL,
  validation_status TEXT NOT NULL CHECK (validation_status IN ('provisional','cross-checked','verified','rejected')),
  UNIQUE(occurrence_id, source_id, source_record_hash)
);

CREATE TABLE IF NOT EXISTS calendar_occurrence_labels (
  occurrence_id TEXT NOT NULL REFERENCES calendar_occurrences(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  translation_status TEXT NOT NULL CHECK (translation_status IN ('source','reviewed','assisted','missing','rejected')),
  source_locale TEXT,
  PRIMARY KEY (occurrence_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_calendar_occurrences_date ON calendar_occurrences(date_iso);
CREATE INDEX IF NOT EXISTS idx_calendar_occurrences_church_date ON calendar_occurrences(church_id, date_iso);
CREATE INDEX IF NOT EXISTS idx_calendar_occurrences_jurisdiction_date ON calendar_occurrences(jurisdiction_id, date_iso);
CREATE INDEX IF NOT EXISTS idx_calendar_occurrences_publication ON calendar_occurrences(publication_status, validation_status, date_iso);
CREATE INDEX IF NOT EXISTS idx_calendar_assertions_occurrence ON calendar_occurrence_assertions(occurrence_id, validation_status);
CREATE INDEX IF NOT EXISTS idx_calendar_assertions_source ON calendar_occurrence_assertions(source_id, observed_at);
CREATE INDEX IF NOT EXISTS idx_calendar_rules_church_event ON calendar_rules(church_id, canonical_event_id);

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS source_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  host TEXT NOT NULL,
  authority TEXT NOT NULL,
  adapter TEXT NOT NULL,
  usage_policy TEXT NOT NULL DEFAULT 'reference-only',
  copyright_policy TEXT,
  refresh_hours INTEGER NOT NULL,
  requests_per_second REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_snapshots (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES source_registry(id),
  source_url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  http_status INTEGER NOT NULL,
  content_type TEXT,
  content_hash TEXT NOT NULL,
  content_bytes INTEGER CHECK (content_bytes IS NULL OR content_bytes >= 0),
  etag TEXT,
  last_modified TEXT,
  dropbox_path TEXT NOT NULL CHECK (dropbox_path LIKE '/Santos do Dia/02_Dados_Eclesiasticos/%'),
  manifest_sha256 TEXT NOT NULL CHECK (length(manifest_sha256) = 64),
  content_encoding TEXT NOT NULL DEFAULT 'binary',
  UNIQUE(source_id, source_url, content_hash)
);

CREATE TABLE IF NOT EXISTS source_ingest_records (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES source_registry(id),
  external_record_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_url TEXT NOT NULL,
  confidence TEXT NOT NULL,
  resolution_status TEXT NOT NULL DEFAULT 'unresolved',
  canonical_entity_type TEXT,
  canonical_entity_id TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE(source_id, external_record_id, content_hash)
);

CREATE TABLE IF NOT EXISTS churches (
  id TEXT PRIMARY KEY,
  family TEXT NOT NULL,
  tradition TEXT,
  canonical_name TEXT NOT NULL,
  canonical_url TEXT,
  parent_church_id TEXT REFERENCES churches(id),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  first_seen_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jurisdictions (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL REFERENCES churches(id),
  parent_jurisdiction_id TEXT REFERENCES jurisdictions(id),
  level TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  country_code TEXT,
  region_code TEXT,
  city TEXT,
  official_url TEXT,
  active_from TEXT,
  active_until TEXT,
  first_seen_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  birth_date TEXT,
  death_date TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  first_seen_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS person_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  quality TEXT NOT NULL,
  source_id TEXT REFERENCES source_registry(id),
  UNIQUE(person_id, locale, value)
);

CREATE TABLE IF NOT EXISTS external_identifiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES source_registry(id),
  external_id TEXT NOT NULL,
  external_url TEXT,
  UNIQUE(source_id, external_id)
);

CREATE TABLE IF NOT EXISTS ecclesiastical_offices (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id),
  jurisdiction_id TEXT NOT NULL REFERENCES jurisdictions(id),
  office_type TEXT NOT NULL,
  title TEXT,
  appointed_at TEXT,
  installed_at TEXT,
  ended_at TEXT,
  status TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS source_assertions (
  id TEXT PRIMARY KEY,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  field TEXT NOT NULL,
  value_json TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES source_registry(id),
  snapshot_id TEXT REFERENCES source_snapshots(id),
  source_url TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  effective_from TEXT,
  effective_until TEXT,
  content_hash TEXT,
  confidence TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS validation_records (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  validation_status TEXT NOT NULL CHECK (validation_status IN ('provisional','cross-checked','verified','rejected','retired')),
  validator TEXT NOT NULL,
  report_dropbox_path TEXT CHECK (report_dropbox_path IS NULL OR report_dropbox_path LIKE '/Santos do Dia/02_Dados_Eclesiasticos/%'),
  evidence_json TEXT,
  validated_at TEXT NOT NULL,
  supersedes_id TEXT REFERENCES validation_records(id)
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES source_registry(id),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  pages_requested INTEGER NOT NULL DEFAULT 0,
  pages_succeeded INTEGER NOT NULL DEFAULT 0,
  pages_failed INTEGER NOT NULL DEFAULT 0,
  people_seen INTEGER NOT NULL DEFAULT 0,
  offices_seen INTEGER NOT NULL DEFAULT 0,
  error_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingest_records_source ON source_ingest_records(source_id, record_type, resolution_status);
CREATE INDEX IF NOT EXISTS idx_ingest_records_canonical ON source_ingest_records(canonical_entity_type, canonical_entity_id);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_church ON jurisdictions(church_id);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_country_region ON jurisdictions(country_code, region_code);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(canonical_name);
CREATE INDEX IF NOT EXISTS idx_offices_status ON ecclesiastical_offices(status);
CREATE INDEX IF NOT EXISTS idx_offices_jurisdiction ON ecclesiastical_offices(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_assertions_subject ON source_assertions(subject_type, subject_id, field);
CREATE INDEX IF NOT EXISTS idx_snapshots_source_date ON source_snapshots(source_id, retrieved_at);
CREATE INDEX IF NOT EXISTS idx_validation_entity ON validation_records(entity_type, entity_id, validated_at);

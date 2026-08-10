PRAGMA foreign_keys = ON;

-- Rebuildable projection for public discovery. These tables are never the
-- canonical source of truth; they contain only approved snapshots derived from
-- the canonical knowledge/calendar stores.
CREATE TABLE IF NOT EXISTS saint_navigation_datasets (
  id TEXT PRIMARY KEY,
  identity_root_sha256 TEXT NOT NULL,
  source_sha256 TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('staging','published','retired')),
  generated_at TEXT NOT NULL,
  published_at TEXT,
  active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1)),
  person_count INTEGER NOT NULL DEFAULT 0,
  place_count INTEGER NOT NULL DEFAULT 0,
  observance_count INTEGER NOT NULL DEFAULT 0,
  CHECK(length(identity_root_sha256) = 64),
  CHECK(length(source_sha256) = 64),
  CHECK((status = 'published' AND published_at IS NOT NULL) OR status <> 'published'),
  CHECK(active = 0 OR status = 'published')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saint_navigation_one_active_dataset
  ON saint_navigation_datasets(active)
  WHERE active = 1;

CREATE TABLE IF NOT EXISTS saint_navigation_people (
  dataset_id TEXT NOT NULL REFERENCES saint_navigation_datasets(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL,
  qid TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  anchor_year INTEGER,
  century INTEGER,
  validation_status TEXT NOT NULL,
  PRIMARY KEY(dataset_id, entity_id),
  CHECK(qid IS NULL OR qid GLOB 'Q[0-9]*')
);

CREATE TABLE IF NOT EXISTS saint_navigation_person_labels (
  dataset_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  label_status TEXT NOT NULL CHECK(label_status IN ('source','reviewed')),
  PRIMARY KEY(dataset_id, entity_id, locale),
  FOREIGN KEY(dataset_id, entity_id)
    REFERENCES saint_navigation_people(dataset_id, entity_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saint_navigation_places (
  id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  relation_type TEXT NOT NULL CHECK(relation_type IN ('birth','death','burial','activity','martyrdom','other')),
  place_id TEXT,
  current_name TEXT,
  historical_name TEXT,
  country_code TEXT,
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  confidence REAL CHECK(confidence IS NULL OR confidence BETWEEN 0 AND 1),
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY(dataset_id, id),
  FOREIGN KEY(dataset_id, entity_id)
    REFERENCES saint_navigation_people(dataset_id, entity_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saint_navigation_observances (
  id TEXT NOT NULL,
  dataset_id TEXT NOT NULL REFERENCES saint_navigation_datasets(id) ON DELETE CASCADE,
  entity_id TEXT,
  person_link_status TEXT NOT NULL CHECK(person_link_status IN ('linked','unresolved','withheld')),
  month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
  day INTEGER NOT NULL CHECK(day BETWEEN 1 AND 31),
  church_id TEXT,
  jurisdiction_id TEXT,
  rank_code TEXT,
  validation_status TEXT NOT NULL,
  source_ids_json TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY(dataset_id, id),
  FOREIGN KEY(dataset_id, entity_id)
    REFERENCES saint_navigation_people(dataset_id, entity_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS saint_navigation_observance_labels (
  dataset_id TEXT NOT NULL,
  observance_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  label_status TEXT NOT NULL CHECK(label_status IN ('source','reviewed')),
  PRIMARY KEY(dataset_id, observance_id, locale),
  FOREIGN KEY(dataset_id, observance_id)
    REFERENCES saint_navigation_observances(dataset_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saint_navigation_people_timeline
  ON saint_navigation_people(dataset_id, century, anchor_year);
CREATE INDEX IF NOT EXISTS idx_saint_navigation_labels_locale
  ON saint_navigation_person_labels(dataset_id, locale, name);
CREATE INDEX IF NOT EXISTS idx_saint_navigation_places_geo
  ON saint_navigation_places(dataset_id, country_code, relation_type, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_saint_navigation_observances_day
  ON saint_navigation_observances(dataset_id, month, day, church_id);
CREATE INDEX IF NOT EXISTS idx_saint_navigation_observance_labels_locale
  ON saint_navigation_observance_labels(dataset_id, locale, name);

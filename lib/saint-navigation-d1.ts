export type NavigationD1Result<Row> = { success?: boolean; results?: Row[]; error?: string };
export type NavigationD1BoundStatement = { all<Row>(): Promise<NavigationD1Result<Row>>; first?<Row>(): Promise<Row | null> };
export type NavigationD1PreparedStatement = { bind(...values: unknown[]): NavigationD1BoundStatement };
export type NavigationD1Database = { prepare(sql: string): NavigationD1PreparedStatement };

export type NavigationDatasetStatus = {
  id: string;
  identityRootSha256: string;
  sourceSha256: string;
  generatedAt: string;
  publishedAt: string;
  personCount: number;
  placeCount: number;
  observanceCount: number;
};

export type SaintMapPoint = {
  id: string;
  entityId: string;
  qid?: string;
  name: string;
  relationType: string;
  placeId?: string;
  placeName?: string;
  historicalName?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  century?: number;
  anchorYear?: number;
  confidence?: number;
  sourceIds: string[];
};

export type SaintTimelineItem = {
  entityId: string;
  qid?: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  anchorYear: number;
  century: number;
};

export type DailySaintObservance = {
  id: string;
  entityId?: string;
  personLinkStatus: string;
  name: string;
  month: number;
  day: number;
  churchId?: string;
  jurisdictionId?: string;
  rankCode?: string;
  validationStatus: string;
  sourceIds: string[];
};

export type SaintPlaceSummary = {
  placeId?: string;
  placeName: string;
  countryCode?: string;
  saintCount: number;
};

const LOCALE = /^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})?$/;
const CODE = /^[A-Za-z0-9:_-]{1,160}$/;
const RELATIONS = new Set(['birth', 'death', 'burial', 'activity', 'martyrdom', 'other']);

function integer(value: number | undefined, fallback: number, min: number, max: number, label: string) {
  const selected = value ?? fallback;
  if (!Number.isInteger(selected) || selected < min || selected > max) throw new RangeError(`${label} must be ${min}-${max}.`);
  return selected;
}
function locale(value: string) { if (!LOCALE.test(value)) throw new RangeError('locale is invalid.'); return value; }
function code(value: string | undefined, label: string) { if (value !== undefined && !CODE.test(value)) throw new RangeError(`${label} is invalid.`); return value; }
function jsonList(value: string | null): string[] {
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []; } catch { return []; }
}
async function rows<Row>(db: NavigationD1Database, sql: string, params: unknown[]): Promise<Row[]> {
  const result = await db.prepare(sql).bind(...params).all<Row>();
  if (result.success === false) throw new Error(result.error || 'Navigation D1 query failed.');
  return result.results ?? [];
}

export async function readActiveNavigationDataset(db: NavigationD1Database): Promise<NavigationDatasetStatus | null> {
  type Row = { id: string; identity_root_sha256: string; source_sha256: string; generated_at: string; published_at: string; person_count: number; place_count: number; observance_count: number };
  const result = await rows<Row>(db, `SELECT id, identity_root_sha256, source_sha256, generated_at, published_at, person_count, place_count, observance_count
    FROM saint_navigation_datasets WHERE active = 1 AND status = 'published' LIMIT 1`, []);
  const row = result[0];
  return row ? { id: row.id, identityRootSha256: row.identity_root_sha256, sourceSha256: row.source_sha256, generatedAt: row.generated_at, publishedAt: row.published_at, personCount: row.person_count, placeCount: row.place_count, observanceCount: row.observance_count } : null;
}

export async function readSaintMapPoints(db: NavigationD1Database, filters: { locale: string; century?: number; countryCode?: string; relationType?: string; limit?: number } ): Promise<SaintMapPoint[]> {
  const selectedLocale = locale(filters.locale);
  const limit = integer(filters.limit, 500, 1, 2000, 'limit');
  const where = ["d.active = 1", "d.status = 'published'", 'l.locale = ?'];
  const params: unknown[] = [selectedLocale];
  if (filters.century !== undefined) { where.push('p.century = ?'); params.push(integer(filters.century, filters.century, -50, 50, 'century')); }
  if (filters.countryCode) { const country = filters.countryCode.toUpperCase(); if (!/^[A-Z]{2}$/.test(country)) throw new RangeError('countryCode is invalid.'); where.push('pl.country_code = ?'); params.push(country); }
  if (filters.relationType) { if (!RELATIONS.has(filters.relationType)) throw new RangeError('relationType is invalid.'); where.push('pl.relation_type = ?'); params.push(filters.relationType); }
  params.push(limit);
  type Row = { id: string; entity_id: string; qid: string | null; name: string; relation_type: string; place_id: string | null; current_name: string | null; historical_name: string | null; country_code: string | null; latitude: number; longitude: number; century: number | null; anchor_year: number | null; confidence: number | null; source_ids_json: string | null };
  const result = await rows<Row>(db, `SELECT pl.id, pl.entity_id, p.qid, l.name, pl.relation_type, pl.place_id, pl.current_name, pl.historical_name, pl.country_code, pl.latitude, pl.longitude, p.century, p.anchor_year, pl.confidence, pl.source_ids_json
    FROM saint_navigation_datasets d
    JOIN saint_navigation_people p ON p.dataset_id = d.id
    JOIN saint_navigation_person_labels l ON l.dataset_id = p.dataset_id AND l.entity_id = p.entity_id
    JOIN saint_navigation_places pl ON pl.dataset_id = p.dataset_id AND pl.entity_id = p.entity_id
    WHERE ${where.join(' AND ')}
    ORDER BY p.century, p.anchor_year, l.name, pl.id LIMIT ?`, params);
  return result.map((row) => ({ id: row.id, entityId: row.entity_id, qid: row.qid ?? undefined, name: row.name, relationType: row.relation_type, placeId: row.place_id ?? undefined, placeName: row.current_name ?? undefined, historicalName: row.historical_name ?? undefined, countryCode: row.country_code ?? undefined, latitude: row.latitude, longitude: row.longitude, century: row.century ?? undefined, anchorYear: row.anchor_year ?? undefined, confidence: row.confidence ?? undefined, sourceIds: jsonList(row.source_ids_json) }));
}

export async function readSaintTimeline(db: NavigationD1Database, filters: { locale: string; century?: number; fromYear?: number; toYear?: number; limit?: number; offset?: number }): Promise<SaintTimelineItem[]> {
  const selectedLocale = locale(filters.locale); const limit = integer(filters.limit, 200, 1, 1000, 'limit'); const offset = integer(filters.offset, 0, 0, 1_000_000, 'offset');
  const where = ["d.active = 1", "d.status = 'published'", 'l.locale = ?', 'p.anchor_year IS NOT NULL', 'p.century IS NOT NULL']; const params: unknown[] = [selectedLocale];
  if (filters.century !== undefined) { where.push('p.century = ?'); params.push(integer(filters.century, filters.century, -50, 50, 'century')); }
  if (filters.fromYear !== undefined) { where.push('p.anchor_year >= ?'); params.push(integer(filters.fromYear, filters.fromYear, -5000, 3000, 'fromYear')); }
  if (filters.toYear !== undefined) { where.push('p.anchor_year <= ?'); params.push(integer(filters.toYear, filters.toYear, -5000, 3000, 'toYear')); }
  params.push(limit, offset);
  type Row = { entity_id: string; qid: string | null; name: string; birth_year: number | null; death_year: number | null; anchor_year: number; century: number };
  const result = await rows<Row>(db, `SELECT p.entity_id, p.qid, l.name, p.birth_year, p.death_year, p.anchor_year, p.century
    FROM saint_navigation_datasets d
    JOIN saint_navigation_people p ON p.dataset_id = d.id
    JOIN saint_navigation_person_labels l ON l.dataset_id = p.dataset_id AND l.entity_id = p.entity_id
    WHERE ${where.join(' AND ')}
    ORDER BY p.anchor_year, l.name, p.entity_id LIMIT ? OFFSET ?`, params);
  return result.map((row) => ({ entityId: row.entity_id, qid: row.qid ?? undefined, name: row.name, birthYear: row.birth_year ?? undefined, deathYear: row.death_year ?? undefined, anchorYear: row.anchor_year, century: row.century }));
}

export async function readDailySaints(db: NavigationD1Database, filters: { locale: string; month: number; day: number; churchId?: string }): Promise<DailySaintObservance[]> {
  const selectedLocale = locale(filters.locale); const month = integer(filters.month, filters.month, 1, 12, 'month'); const day = integer(filters.day, filters.day, 1, 31, 'day');
  const where = ["d.active = 1", "d.status = 'published'", 'o.month = ?', 'o.day = ?', 'l.locale = ?']; const params: unknown[] = [month, day, selectedLocale];
  if (filters.churchId) { where.push('o.church_id = ?'); params.push(code(filters.churchId, 'churchId')); }
  type Row = { id: string; entity_id: string | null; person_link_status: string; name: string; month: number; day: number; church_id: string | null; jurisdiction_id: string | null; rank_code: string | null; validation_status: string; source_ids_json: string | null };
  const result = await rows<Row>(db, `SELECT o.id, o.entity_id, o.person_link_status, l.name, o.month, o.day, o.church_id, o.jurisdiction_id, o.rank_code, o.validation_status, o.source_ids_json
    FROM saint_navigation_datasets d
    JOIN saint_navigation_observances o ON o.dataset_id = d.id
    JOIN saint_navigation_observance_labels l ON l.dataset_id = o.dataset_id AND l.observance_id = o.id
    WHERE ${where.join(' AND ')} ORDER BY o.rank_code, l.name, o.id`, params);
  return result.map((row) => ({ id: row.id, entityId: row.entity_id ?? undefined, personLinkStatus: row.person_link_status, name: row.name, month: row.month, day: row.day, churchId: row.church_id ?? undefined, jurisdictionId: row.jurisdiction_id ?? undefined, rankCode: row.rank_code ?? undefined, validationStatus: row.validation_status, sourceIds: jsonList(row.source_ids_json) }));
}

export async function readSaintPlaces(db: NavigationD1Database, filters: { locale: string; countryCode?: string; limit?: number; offset?: number }): Promise<SaintPlaceSummary[]> {
  locale(filters.locale); const limit = integer(filters.limit, 100, 1, 500, 'limit'); const offset = integer(filters.offset, 0, 0, 1_000_000, 'offset');
  const where = ["d.active = 1", "d.status = 'published'"]; const params: unknown[] = [];
  if (filters.countryCode) { const country = filters.countryCode.toUpperCase(); if (!/^[A-Z]{2}$/.test(country)) throw new RangeError('countryCode is invalid.'); where.push('pl.country_code = ?'); params.push(country); }
  params.push(limit, offset);
  type Row = { place_id: string | null; current_name: string | null; country_code: string | null; saint_count: number };
  const result = await rows<Row>(db, `SELECT pl.place_id, COALESCE(pl.current_name, pl.place_id, 'Unknown') AS current_name, pl.country_code, COUNT(DISTINCT pl.entity_id) AS saint_count
    FROM saint_navigation_datasets d JOIN saint_navigation_places pl ON pl.dataset_id = d.id
    WHERE ${where.join(' AND ')} GROUP BY pl.place_id, pl.current_name, pl.country_code
    ORDER BY saint_count DESC, current_name LIMIT ? OFFSET ?`, params);
  return result.map((row) => ({ placeId: row.place_id ?? undefined, placeName: row.current_name ?? 'Unknown', countryCode: row.country_code ?? undefined, saintCount: Number(row.saint_count) }));
}

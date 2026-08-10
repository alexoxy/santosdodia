import type { NavigationD1Database } from './saint-navigation-d1';

export type SaintCenturySummary = { century: number; saintCount: number };
export type SaintCountrySummary = { countryCode: string; saintCount: number; placeCount: number };

const LOCALE = /^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})?$/;
function validLocale(value: string) { if (!LOCALE.test(value)) throw new RangeError('locale is invalid.'); return value; }
async function rows<Row>(db: NavigationD1Database, sql: string, params: unknown[]) {
  const result = await db.prepare(sql).bind(...params).all<Row>();
  if (result.success === false) throw new Error(result.error || 'Navigation summary query failed.');
  return result.results ?? [];
}

export async function readSaintCenturySummary(db: NavigationD1Database, locale: string): Promise<SaintCenturySummary[]> {
  const selectedLocale = validLocale(locale);
  type Row = { century: number; saint_count: number };
  const result = await rows<Row>(db, `SELECT p.century, COUNT(DISTINCT p.entity_id) AS saint_count
    FROM saint_navigation_datasets d
    JOIN saint_navigation_people p ON p.dataset_id = d.id
    JOIN saint_navigation_person_labels l ON l.dataset_id = p.dataset_id AND l.entity_id = p.entity_id
    WHERE d.active = 1 AND d.status = 'published' AND l.locale = ? AND p.century IS NOT NULL
    GROUP BY p.century ORDER BY p.century`, [selectedLocale]);
  return result.map((row) => ({ century: Number(row.century), saintCount: Number(row.saint_count) }));
}

export async function readSaintCountrySummary(db: NavigationD1Database, locale: string): Promise<SaintCountrySummary[]> {
  validLocale(locale);
  type Row = { country_code: string; saint_count: number; place_count: number };
  const result = await rows<Row>(db, `SELECT pl.country_code, COUNT(DISTINCT pl.entity_id) AS saint_count, COUNT(DISTINCT COALESCE(pl.place_id, pl.current_name, CAST(pl.latitude AS TEXT) || ',' || CAST(pl.longitude AS TEXT))) AS place_count
    FROM saint_navigation_datasets d
    JOIN saint_navigation_places pl ON pl.dataset_id = d.id
    WHERE d.active = 1 AND d.status = 'published' AND pl.country_code IS NOT NULL
    GROUP BY pl.country_code ORDER BY saint_count DESC, pl.country_code`, []);
  return result.map((row) => ({ countryCode: row.country_code, saintCount: Number(row.saint_count), placeCount: Number(row.place_count) }));
}

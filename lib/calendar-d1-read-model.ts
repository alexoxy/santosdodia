export type CalendarReadMode = 'public' | 'staging';

export type CalendarReadFilters = {
  fromDate: string;
  toDate: string;
  churchId?: string;
  jurisdictionId?: string;
  countryCode?: string;
  regionCode?: string;
  locales?: string[];
  mode?: CalendarReadMode;
  limit?: number;
  offset?: number;
};

export type CalendarOccurrenceLabel = {
  locale: string;
  name: string;
  description?: string;
  translationStatus: string;
  sourceLocale?: string;
};

export type CalendarOccurrenceRecord = {
  id: string;
  churchId: string;
  churchName: string;
  jurisdictionId?: string;
  jurisdictionName?: string;
  countryCode?: string;
  regionCode?: string;
  canonicalEventId: string;
  category?: string;
  dateISO: string;
  endDateISO?: string;
  nativeCalendarSystem?: string;
  nativeYear?: number;
  nativeMonth?: string;
  nativeDay?: number;
  rankCode?: string;
  colourCode?: string;
  validationStatus: string;
  publicationStatus: string;
  labels: Record<string, CalendarOccurrenceLabel>;
};

export type D1QueryResultLike<Row> = {
  success?: boolean;
  results?: Row[];
  error?: string;
};

export type D1BoundStatementLike = {
  all<Row>(): Promise<D1QueryResultLike<Row>>;
};

export type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1BoundStatementLike;
};

export type D1DatabaseLike = {
  prepare(sql: string): D1PreparedStatementLike;
};

type CalendarRow = {
  id: string;
  church_id: string;
  church_name: string;
  jurisdiction_id: string | null;
  jurisdiction_name: string | null;
  country_code: string | null;
  region_code: string | null;
  canonical_event_id: string;
  category: string | null;
  date_iso: string;
  end_date_iso: string | null;
  native_calendar_system: string | null;
  native_year: number | null;
  native_month: string | null;
  native_day: number | null;
  rank_code: string | null;
  colour_code: string | null;
  validation_status: string;
  publication_status: string;
  locale: string | null;
  label_name: string | null;
  label_description: string | null;
  translation_status: string | null;
  source_locale: string | null;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IDENTIFIER = /^[A-Za-z0-9:_-]{1,160}$/;
const LOCALE = /^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})?$/;

function assertDate(value: string, label: string): string {
  if (!ISO_DATE.test(value)) throw new RangeError(`${label} must be an ISO date.`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new RangeError(`${label} must be a real civil date.`);
  }
  return value;
}

function optionalIdentifier(value: string | undefined, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (!IDENTIFIER.test(value)) throw new RangeError(`${label} contains unsupported characters.`);
  return value;
}

function boundedInteger(value: number | undefined, fallback: number, minimum: number, maximum: number, label: string): number {
  const selected = value ?? fallback;
  if (!Number.isInteger(selected) || selected < minimum || selected > maximum) {
    throw new RangeError(`${label} must be an integer from ${minimum} to ${maximum}.`);
  }
  return selected;
}

export function buildCalendarReadQuery(filters: CalendarReadFilters): { sql: string; params: unknown[] } {
  const fromDate = assertDate(filters.fromDate, 'fromDate');
  const toDate = assertDate(filters.toDate, 'toDate');
  if (fromDate > toDate) throw new RangeError('fromDate must not be after toDate.');
  const churchId = optionalIdentifier(filters.churchId, 'churchId');
  const jurisdictionId = optionalIdentifier(filters.jurisdictionId, 'jurisdictionId');
  const countryCode = filters.countryCode?.toUpperCase();
  const regionCode = filters.regionCode?.toUpperCase();
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) throw new RangeError('countryCode must be ISO alpha-2.');
  if (regionCode && !/^[A-Z0-9-]{1,24}$/.test(regionCode)) throw new RangeError('regionCode is invalid.');
  const locales = [...new Set(filters.locales ?? [])];
  if (locales.some(locale => !LOCALE.test(locale))) throw new RangeError('One or more locales are invalid.');
  const limit = boundedInteger(filters.limit, 100, 1, 500, 'limit');
  const offset = boundedInteger(filters.offset, 0, 0, 1_000_000, 'offset');
  const mode = filters.mode ?? 'public';
  if (mode !== 'public' && mode !== 'staging') throw new RangeError('mode is invalid.');

  const where = ['o.date_iso BETWEEN ? AND ?'];
  const params: unknown[] = [fromDate, toDate];
  if (mode === 'public') {
    where.push("o.publication_status = 'published'");
    where.push("o.validation_status IN ('cross-checked','verified')");
  } else {
    where.push("o.publication_status IN ('withheld','publishable','published')");
    where.push("o.validation_status <> 'rejected'");
  }
  if (churchId) { where.push('o.church_id = ?'); params.push(churchId); }
  if (jurisdictionId) { where.push('o.jurisdiction_id = ?'); params.push(jurisdictionId); }
  if (countryCode) { where.push('j.country_code = ?'); params.push(countryCode); }
  if (regionCode) { where.push('j.region_code = ?'); params.push(regionCode); }
  params.push(limit, offset);

  const localeClause = locales.length
    ? `AND l.locale IN (${locales.map(() => '?').join(',')})`
    : '';
  const labelVisibilityClause = mode === 'public'
    ? "AND l.translation_status IN ('source','reviewed')"
    : "AND l.translation_status <> 'rejected'";
  params.push(...locales);

  const sql = `WITH selected AS (
    SELECT o.id
    FROM calendar_occurrences o
    LEFT JOIN jurisdictions j ON j.id = o.jurisdiction_id
    WHERE ${where.join('\n      AND ')}
    ORDER BY o.date_iso, o.church_id, o.canonical_event_id, o.id
    LIMIT ? OFFSET ?
  )
  SELECT
    o.id,
    o.church_id,
    c.canonical_name AS church_name,
    o.jurisdiction_id,
    j.canonical_name AS jurisdiction_name,
    j.country_code,
    j.region_code,
    o.canonical_event_id,
    ob.category,
    o.date_iso,
    o.end_date_iso,
    o.native_calendar_system,
    o.native_year,
    o.native_month,
    o.native_day,
    o.rank_code,
    o.colour_code,
    o.validation_status,
    o.publication_status,
    l.locale,
    l.name AS label_name,
    l.description AS label_description,
    l.translation_status,
    l.source_locale
  FROM selected s
  JOIN calendar_occurrences o ON o.id = s.id
  JOIN calendar_observances ob ON ob.id = o.canonical_event_id
  JOIN churches c ON c.id = o.church_id
  LEFT JOIN jurisdictions j ON j.id = o.jurisdiction_id
  LEFT JOIN calendar_occurrence_labels l ON l.occurrence_id = o.id ${labelVisibilityClause} ${localeClause}
  ORDER BY o.date_iso, o.church_id, o.canonical_event_id, o.id, l.locale;`;

  return { sql, params };
}

export async function readCalendarOccurrences(
  database: D1DatabaseLike,
  filters: CalendarReadFilters
): Promise<CalendarOccurrenceRecord[]> {
  const { sql, params } = buildCalendarReadQuery(filters);
  const result = await database.prepare(sql).bind(...params).all<CalendarRow>();
  if (result.success === false) throw new Error(result.error || 'D1 calendar query failed.');
  const rows = result.results ?? [];
  const records = new Map<string, CalendarOccurrenceRecord>();

  for (const row of rows) {
    let record = records.get(row.id);
    if (!record) {
      record = {
        id: row.id,
        churchId: row.church_id,
        churchName: row.church_name,
        jurisdictionId: row.jurisdiction_id ?? undefined,
        jurisdictionName: row.jurisdiction_name ?? undefined,
        countryCode: row.country_code ?? undefined,
        regionCode: row.region_code ?? undefined,
        canonicalEventId: row.canonical_event_id,
        category: row.category ?? undefined,
        dateISO: row.date_iso,
        endDateISO: row.end_date_iso ?? undefined,
        nativeCalendarSystem: row.native_calendar_system ?? undefined,
        nativeYear: row.native_year ?? undefined,
        nativeMonth: row.native_month ?? undefined,
        nativeDay: row.native_day ?? undefined,
        rankCode: row.rank_code ?? undefined,
        colourCode: row.colour_code ?? undefined,
        validationStatus: row.validation_status,
        publicationStatus: row.publication_status,
        labels: {}
      };
      records.set(row.id, record);
    }
    if (row.locale && row.label_name && row.translation_status) {
      record.labels[row.locale] = {
        locale: row.locale,
        name: row.label_name,
        description: row.label_description ?? undefined,
        translationStatus: row.translation_status,
        sourceLocale: row.source_locale ?? undefined
      };
    }
  }

  return [...records.values()];
}

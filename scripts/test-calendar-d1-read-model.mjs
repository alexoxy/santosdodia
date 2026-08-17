import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(path.resolve('lib/calendar-d1-read-model.ts')).href;
const { buildCalendarReadQuery, readCalendarOccurrences } = await import(moduleUrl);

const publicQuery = buildCalendarReadQuery({
  fromDate: '2026-04-01',
  toDate: '2026-04-30',
  churchId: 'coptic-orthodox',
  countryCode: 'eg',
  locales: ['pt', 'en', 'pt'],
  limit: 25,
  offset: 5
});
if (!publicQuery.sql.includes("o.publication_status = 'published'")) throw new Error('Public read does not fail closed to published rows.');
if (!publicQuery.sql.includes("o.validation_status IN ('cross-checked','verified')")) throw new Error('Public read does not enforce the validation threshold.');
if (!publicQuery.sql.includes("l.translation_status IN ('source','reviewed')")) throw new Error('Public read exposes unreviewed labels.');
if (publicQuery.sql.includes("'withheld'")) throw new Error('Public read SQL contains withheld visibility.');
if (publicQuery.sql.includes("'assisted'")) throw new Error('Public read SQL contains assisted label visibility.');
if (!publicQuery.sql.includes('LIMIT ? OFFSET ?')) throw new Error('Read pagination is not parameterized.');
if (publicQuery.sql.includes('o.jurisdiction_id IS NULL')) throw new Error('Country-scoped public read was incorrectly forced to the global calendar.');
if (publicQuery.params.some(value => typeof value === 'string' && value.includes('SELECT'))) throw new Error('Unexpected SQL fragment in parameters.');
if (publicQuery.params.join('|') !== '2026-04-01|2026-04-30|coptic-orthodox|EG|25|5|pt|en') {
  throw new Error(`Unexpected public parameter order: ${publicQuery.params.join('|')}`);
}

const globalPublicQuery = buildCalendarReadQuery({
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  churchId: 'roman-catholic',
  locales: ['pt', 'en'],
  limit: 500
});
if (!globalPublicQuery.sql.includes('o.jurisdiction_id IS NULL')) {
  throw new Error('Unscoped public read can leak jurisdiction-specific overlays into the global calendar.');
}
if (globalPublicQuery.params.join('|') !== '2026-01-01|2026-12-31|roman-catholic|500|0|pt|en') {
  throw new Error(`Unexpected global public parameter order: ${globalPublicQuery.params.join('|')}`);
}

const canonicalQuery = buildCalendarReadQuery({
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  canonicalEventId: 'rc:saint-example',
  locales: ['pt', 'en'],
  limit: 20
});
if (!canonicalQuery.sql.includes('o.canonical_event_id = ?')) throw new Error('Canonical event reads are not parameterized.');
if (canonicalQuery.params[2] !== 'rc:saint-example') throw new Error('Canonical event ID is not bound in the expected position.');
if (!canonicalQuery.sql.includes("o.publication_status = 'published'")) throw new Error('Canonical event lookup bypasses public publication gates.');
if (!canonicalQuery.sql.includes('o.jurisdiction_id IS NULL')) throw new Error('Unscoped canonical public lookup is not constrained to the global calendar.');

const stagingQuery = buildCalendarReadQuery({
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  mode: 'staging',
  jurisdictionId: 'jurisdiction:test',
  regionCode: 'pt-11'
});
if (!stagingQuery.sql.includes("IN ('withheld','publishable','published')")) throw new Error('Staging read does not include withheld rows.');
if (!stagingQuery.sql.includes("l.translation_status <> 'rejected'")) throw new Error('Staging read does not exclude rejected labels.');
if (stagingQuery.params[3] !== 'PT-11') throw new Error('Region code was not normalized.');

const unscopedStagingQuery = buildCalendarReadQuery({
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  mode: 'staging'
});
if (unscopedStagingQuery.sql.includes('o.jurisdiction_id IS NULL')) {
  throw new Error('Unscoped staging reads must retain cross-jurisdiction review visibility.');
}

for (const invalid of [
  { fromDate: '2026-02-30', toDate: '2026-03-01' },
  { fromDate: '2026-05-01', toDate: '2026-04-01' },
  { fromDate: '2026-01-01', toDate: '2026-12-31', countryCode: 'PORTUGAL' },
  { fromDate: '2026-01-01', toDate: '2026-12-31', canonicalEventId: 'bad id with spaces' },
  { fromDate: '2026-01-01', toDate: '2026-12-31', limit: 0 }
]) {
  let rejected = false;
  try { buildCalendarReadQuery(invalid); } catch { rejected = true; }
  if (!rejected) throw new Error(`Invalid read filter was accepted: ${JSON.stringify(invalid)}`);
}

const rows = [
  {
    id: 'coptic-resurrection-2026', church_id: 'coptic-orthodox', church_name: 'Coptic Orthodox Church',
    jurisdiction_id: null, jurisdiction_name: null, country_code: null, region_code: null,
    canonical_event_id: 'coptic-resurrection', category: 'feast', date_iso: '2026-04-12', end_date_iso: null,
    native_calendar_system: 'coptic', native_year: 1742, native_month: 'Paremoude', native_day: 4,
    rank_code: 'principal-feast', colour_code: 'gold', validation_status: 'verified', publication_status: 'published',
    locale: 'en', label_name: 'Feast of the Resurrection', label_description: null,
    translation_status: 'source', source_locale: 'en'
  },
  {
    id: 'coptic-resurrection-2026', church_id: 'coptic-orthodox', church_name: 'Coptic Orthodox Church',
    jurisdiction_id: null, jurisdiction_name: null, country_code: null, region_code: null,
    canonical_event_id: 'coptic-resurrection', category: 'feast', date_iso: '2026-04-12', end_date_iso: null,
    native_calendar_system: 'coptic', native_year: 1742, native_month: 'Paremoude', native_day: 4,
    rank_code: 'principal-feast', colour_code: 'gold', validation_status: 'verified', publication_status: 'published',
    locale: 'pt', label_name: 'Festa da Ressurreição', label_description: null,
    translation_status: 'reviewed', source_locale: 'en'
  }
];
let capturedSql = '';
let capturedParams = [];
const database = {
  prepare(sql) {
    capturedSql = sql;
    return {
      bind(...params) {
        capturedParams = params;
        return { async all() { return { success: true, results: rows }; } };
      }
    };
  }
};
const records = await readCalendarOccurrences(database, {
  fromDate: '2026-04-12', toDate: '2026-04-12', locales: ['en', 'pt']
});
if (records.length !== 1) throw new Error('Multilingual rows were not grouped into one occurrence.');
if (records[0].labels.en?.name !== 'Feast of the Resurrection' || records[0].labels.pt?.name !== 'Festa da Ressurreição') {
  throw new Error('Multilingual labels were not preserved.');
}
if (records[0].nativeCalendarSystem !== 'coptic' || records[0].publicationStatus !== 'published') {
  throw new Error('Occurrence metadata was not mapped correctly.');
}
if (!capturedSql.includes("o.publication_status = 'published'") || !capturedSql.includes('o.jurisdiction_id IS NULL') || capturedParams.at(-1) !== 'pt') {
  throw new Error('Public read execution did not use the guarded global query.');
}

await import('./test-calendar-public-adapter.mjs');
console.log('Publication-safe D1 calendar read model tests passed.');

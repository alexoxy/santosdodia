import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const inputPath = argument('--input');
const sqlPath = argument('--sql');
const manifestPath = argument('--manifest');
const dropboxManifestPath = argument('--dropbox-manifest-path');
const publicationStatus = argument('--publication-status', 'publishable');
if (!inputPath || !sqlPath || !manifestPath || !dropboxManifestPath) {
  throw new Error('Usage: node scripts/build/roman-catholic-d1-release.mjs --input <report.json> --sql <release.sql> --manifest <manifest.json> --dropbox-manifest-path <Dropbox path> [--publication-status publishable|published]');
}
if (!['publishable', 'published'].includes(publicationStatus)) throw new Error('publication status must be publishable or published.');
if (!dropboxManifestPath.startsWith('/Santos do Dia/02_Dados_Eclesiasticos/')) throw new Error('Dropbox manifest path is outside the canonical ecclesiastical root.');

const report = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
if (report?.build !== 'roman-catholic-product-baseline-v1' || report?.productReadiness?.launchReady !== true) {
  throw new Error('Input is not a launch-ready Roman Catholic product BUILD.');
}
if (report?.calendarCoverage?.coveredDays !== report?.calendarCoverage?.expectedDays || report?.calendarCoverage?.falseEmptyCount !== 0) {
  throw new Error('Calendar coverage is incomplete.');
}
for (const locale of ['en', 'pt', 'es', 'fr', 'it']) {
  if (report?.dailyLocaleCompleteness?.[locale]?.completeness !== 1) throw new Error(`Locale ${locale} is incomplete.`);
}

function hash(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}
function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}
function category(value) {
  return ['saint', 'feast', 'marian', 'apostle', 'martyr', 'fast'].includes(value) ? value : 'feast';
}
function cleanRank(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}
function sourceForLocale(locale) {
  if (locale === 'pt') return 'portugal-national-liturgy-secretariat';
  if (locale === 'es') return 'romcal-general-roman-es';
  return 'litcal-api';
}

const generatedAt = new Date().toISOString();
const year = Number(report.year);
const releaseDigest = hash(report.daily);
const runId = `product-build:roman-catholic:pt:${year}:${releaseDigest.slice(0, 16)}`;
const validationReportPath = dropboxManifestPath.replace(/manifest\.json$/u, 'validation.json');
const occurrences = report.daily ?? [];
if (occurrences.length !== report.calendarCoverage.expectedDays) throw new Error(`Expected ${report.calendarCoverage.expectedDays} daily rows, found ${occurrences.length}.`);

const sources = [
  {
    id: 'litcal-api', name: 'LitCal API', url: 'https://litcal.johnromanodorazio.com/api/v5', host: 'litcal.johnromanodorazio.com',
    authority: 'reference-engine', adapter: 'product-build-roman-catholic', usage: 'Structured calendar facts and source-provided labels only.', copyright: 'No substantial editorial text copied.'
  },
  {
    id: 'portugal-national-liturgy-secretariat', name: 'Secretariado Nacional de Liturgia — Agenda Litúrgica', url: 'https://www.liturgia.pt/agenda/', host: 'www.liturgia.pt',
    authority: 'official-jurisdiction', adapter: 'product-build-roman-catholic', usage: 'Official Portugal calendar dates, ranks and Portuguese labels.', copyright: 'Structured calendar facts and short labels only.'
  },
  {
    id: 'romcal-general-roman-es', name: 'Romcal General Roman Spanish locale', url: 'https://github.com/romcal/romcal', host: 'github.com',
    authority: 'reference-directory', adapter: 'product-build-roman-catholic', usage: 'Spanish localization cross-check only; never calendar authority.', copyright: 'MIT-licensed localization data; attribution retained in release manifest.'
  },
];

const statements = [
  'PRAGMA foreign_keys = ON;',
  'BEGIN IMMEDIATE;',
  `INSERT INTO churches (id,family,tradition,canonical_name,canonical_url,active,first_seen_at,last_verified_at) VALUES ('roman-catholic','catholic','roman-catholic','Roman Catholic Church','https://www.vatican.va/',1,${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET family=excluded.family,tradition=excluded.tradition,canonical_name=excluded.canonical_name,canonical_url=excluded.canonical_url,active=1,last_verified_at=excluded.last_verified_at;`,
  `INSERT INTO jurisdictions (id,church_id,level,canonical_name,country_code,official_url,first_seen_at,last_verified_at) VALUES ('pt','roman-catholic','national-calendar','Portugal','PT','https://www.liturgia.pt/agenda/',${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,level=excluded.level,canonical_name=excluded.canonical_name,country_code=excluded.country_code,official_url=excluded.official_url,last_verified_at=excluded.last_verified_at;`,
];

for (const source of sources) {
  statements.push(`INSERT INTO source_registry (id,name,base_url,host,authority,adapter,usage_policy,copyright_policy,refresh_hours,requests_per_second,active,updated_at) VALUES (${sql(source.id)},${sql(source.name)},${sql(source.url)},${sql(source.host)},${sql(source.authority)},${sql(source.adapter)},${sql(source.usage)},${sql(source.copyright)},168,0.25,1,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name,base_url=excluded.base_url,host=excluded.host,authority=excluded.authority,adapter=excluded.adapter,usage_policy=excluded.usage_policy,copyright_policy=excluded.copyright_policy,active=1,updated_at=CURRENT_TIMESTAMP;`);
  statements.push(`INSERT INTO calendar_sources (id,church_id,jurisdiction_id,usage_policy,copyright_policy,active) VALUES (${sql(source.id)},'roman-catholic',${source.id === 'portugal-national-liturgy-secretariat' ? "'pt'" : 'NULL'},${sql(source.usage)},${sql(source.copyright)},1) ON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,jurisdiction_id=excluded.jurisdiction_id,usage_policy=excluded.usage_policy,copyright_policy=excluded.copyright_policy,active=1;`);
}

statements.push(`INSERT INTO calendar_import_runs (id,created_at,retrieved_at,dropbox_manifest_path,manifest_sha256,status,validation_report_path) VALUES (${sql(runId)},${sql(generatedAt)},${sql(generatedAt)},${sql(dropboxManifestPath)},${sql(hash(report))},'validated',${sql(validationReportPath)}) ON CONFLICT(id) DO UPDATE SET retrieved_at=excluded.retrieved_at,dropbox_manifest_path=excluded.dropbox_manifest_path,manifest_sha256=excluded.manifest_sha256,status='validated',validation_report_path=excluded.validation_report_path;`);
statements.push(`INSERT INTO jurisdiction_calendar_policies (id,church_id,jurisdiction_id,engine_id,fixed_date_policy,calendar_system,effective_from,effective_to,source_id,validation_status) VALUES (${sql(`roman-catholic-pt-${year}`)},'roman-catholic','pt','western-gregorian','general-roman-plus-portugal-proper','gregorian',${sql(`${year}-01-01`)},${sql(`${year}-12-31`)},'portugal-national-liturgy-secretariat','cross-checked') ON CONFLICT(id) DO UPDATE SET engine_id=excluded.engine_id,fixed_date_policy=excluded.fixed_date_policy,calendar_system=excluded.calendar_system,effective_from=excluded.effective_from,effective_to=excluded.effective_to,source_id=excluded.source_id,validation_status=excluded.validation_status;`);

for (const day of occurrences) {
  const dateISO = String(day.dateISO);
  const eventId = String(day.primary?.canonicalEventId ?? '').trim();
  const primaryName = String(day.primary?.name ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !eventId || !primaryName) throw new Error(`Invalid daily row for ${dateISO || 'unknown date'}.`);
  const occurrenceId = `rc-pt-${dateISO}`;
  const eventCategory = category(day.primary?.category);
  const sourceRecordHash = hash({ dateISO, primary: day.primary });
  statements.push(`INSERT INTO calendar_observances (id,church_id,canonical_key,category,active,created_at,updated_at) VALUES (${sql(eventId)},'roman-catholic',${sql(eventId)},${sql(eventCategory)},1,${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,canonical_key=excluded.canonical_key,category=excluded.category,active=1,updated_at=excluded.updated_at;`);
  statements.push(`INSERT INTO calendar_occurrences (id,import_run_id,church_id,jurisdiction_id,canonical_event_id,date_iso,native_calendar_system,native_year,rank_code,validation_status,publication_status,created_at,updated_at) VALUES (${sql(occurrenceId)},${sql(runId)},'roman-catholic','pt',${sql(eventId)},${sql(dateISO)},'gregorian',${year},${sql(cleanRank(day.primary?.grade))},'cross-checked',${sql(publicationStatus)},${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET import_run_id=excluded.import_run_id,church_id=excluded.church_id,jurisdiction_id=excluded.jurisdiction_id,canonical_event_id=excluded.canonical_event_id,date_iso=excluded.date_iso,native_calendar_system=excluded.native_calendar_system,native_year=excluded.native_year,rank_code=excluded.rank_code,validation_status='cross-checked',publication_status=excluded.publication_status,updated_at=excluded.updated_at;`);

  const assertions = [
    ['litcal-api', 'https://litcal.johnromanodorazio.com/api/v5', sourceRecordHash],
    ['portugal-national-liturgy-secretariat', 'https://www.liturgia.pt/agenda/agenda.ics', hash({ dateISO, label: day.labels?.pt })],
  ];
  for (const [sourceId, sourceUrl, recordHash] of assertions) {
    const assertionId = hash(`${occurrenceId}|${sourceId}|${recordHash}`);
    statements.push(`INSERT INTO calendar_occurrence_assertions (id,occurrence_id,source_id,asserted_date_iso,source_record_url,source_record_hash,observed_at,validation_status) VALUES (${sql(assertionId)},${sql(occurrenceId)},${sql(sourceId)},${sql(dateISO)},${sql(sourceUrl)},${sql(recordHash)},${sql(generatedAt)},'cross-checked') ON CONFLICT(id) DO UPDATE SET observed_at=excluded.observed_at,validation_status='cross-checked';`);
  }

  for (const locale of ['en', 'pt', 'es', 'fr', 'it']) {
    const label = String(day.labels?.[locale]?.label ?? '').normalize('NFC').trim();
    if (!label) throw new Error(`${dateISO} is missing ${locale} label.`);
    statements.push(`INSERT INTO calendar_occurrence_labels (occurrence_id,locale,name,description,translation_status,source_locale) VALUES (${sql(occurrenceId)},${sql(locale)},${sql(label)},NULL,'source',${sql(locale)}) ON CONFLICT(occurrence_id,locale) DO UPDATE SET name=excluded.name,description=NULL,translation_status='source',source_locale=excluded.source_locale;`);
    const sourceId = sourceForLocale(locale);
    const claimId = hash(`${occurrenceId}|label.${locale}|${sourceId}|${label}`);
    statements.push(`INSERT INTO source_assertions (id,subject_type,subject_id,field,value_json,source_id,source_url,observed_at,content_hash,confidence) VALUES (${sql(claimId)},'calendar-occurrence',${sql(occurrenceId)},${sql(`label.${locale}`)},${sql(JSON.stringify(label))},${sql(sourceId)},${sql(sources.find((item) => item.id === sourceId)?.url ?? '')},${sql(generatedAt)},${sql(hash(label))},'cross-checked') ON CONFLICT(id) DO UPDATE SET value_json=excluded.value_json,observed_at=excluded.observed_at,content_hash=excluded.content_hash,confidence=excluded.confidence;`);
  }
}

statements.push('COMMIT;');

const manifest = {
  schemaVersion: 1,
  release: 'roman-catholic-pt-2026',
  runId,
  generatedAt,
  sourceBuild: report.build,
  sourceBuildDigest: releaseDigest,
  publicationStatus,
  churchId: 'roman-catholic',
  jurisdictionId: 'pt',
  year,
  expectedOccurrences: occurrences.length,
  expectedLabels: occurrences.length * 5,
  expectedCalendarAssertions: occurrences.length * 2,
  expectedLabelAssertions: occurrences.length * 5,
  publicLocales: ['en', 'pt', 'es', 'fr', 'it'],
  dropboxManifestPath,
  validationReportPath,
  sources: sources.map(({ id, name, url, authority, usage }) => ({ id, name, url, authority, usage })),
  safety: {
    automaticFutureProductionWrites: false,
    generatedFromLaunchReadyBuildOnly: true,
    descriptionsCopied: false,
    validationStatus: 'cross-checked',
  },
};

fs.mkdirSync(path.dirname(path.resolve(sqlPath)), { recursive: true });
fs.mkdirSync(path.dirname(path.resolve(manifestPath)), { recursive: true });
fs.writeFileSync(path.resolve(sqlPath), `${statements.join('\n')}\n`, 'utf8');
fs.writeFileSync(path.resolve(manifestPath), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ runId, publicationStatus, occurrences: manifest.expectedOccurrences, labels: manifest.expectedLabels, dateAssertions: manifest.expectedCalendarAssertions, labelAssertions: manifest.expectedLabelAssertions }, null, 2));

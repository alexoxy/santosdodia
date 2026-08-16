#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const PUBLIC_LOCALES = ['en','pt','es','fr','it'];

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function text(value) { return String(value ?? '').normalize('NFC').trim(); }
function hash(value) { return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex'); }
function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}
function category(value) { return ['saint','feast','marian','apostle','martyr','fast'].includes(value) ? value : 'feast'; }
function sourceUrl(sourceId) {
  if (sourceId === 'portugal-national-liturgy-secretariat') return 'https://www.liturgia.pt/agenda/agenda.ics';
  if (sourceId === 'romcal-general-roman-es') return 'https://github.com/romcal/romcal';
  if (sourceId === 'litcal-api') return 'https://litcal.johnromanodorazio.com/api/v5';
  if (sourceId === 'santosdia-reviewed-calendar-localization') return 'https://www.santosdodia.com/';
  return '';
}
function occurrenceId(item) {
  return `rc-pt-v2-${item.dateISO}-${hash(item.sourceOccurrenceId).slice(0, 16)}`;
}

export function buildPortugalD1ReleaseV2({ report, dropboxManifestPath, publicationStatus = 'publishable', generatedAt = new Date().toISOString() }) {
  if (publicationStatus !== 'publishable') throw new Error('Portugal v2 D1 package is staging-only until a separate production approval gate exists.');
  if (!text(dropboxManifestPath).startsWith('/Santos do Dia/02_Dados_Eclesiasticos/')) throw new Error('Dropbox manifest path is outside the canonical ecclesiastical root.');
  if (report?.build !== 'roman-catholic-pt-overlay-v2' || report?.productReadiness?.stagingReady !== true || report?.productionWriteAllowed !== false || report?.productReadiness?.productionApproved !== false) {
    throw new Error('Input is not a staging-ready Portugal overlay v2 build with production still gated.');
  }
  if (report?.calendarCoverage?.occurrences !== 389 || report?.calendarCoverage?.coveredDays !== 365 || report?.productReadiness?.labelCount !== 1945) {
    throw new Error('Portugal v2 release requires exactly 389 observances, 365 days and 1,945 labels.');
  }
  for (const locale of PUBLIC_LOCALES) {
    if (report?.localeCompleteness?.[locale]?.completeness !== 1) throw new Error(`Locale ${locale} is incomplete.`);
  }
  const occurrences = Array.isArray(report.occurrences) ? report.occurrences : [];
  if (occurrences.length !== 389) throw new Error(`Expected 389 occurrence rows, found ${occurrences.length}.`);
  const pairSet = new Set(occurrences.map((item) => `${text(item.dateISO)}|${text(item.canonicalEventId)}`));
  if (pairSet.size !== occurrences.length) throw new Error('Portugal v2 contains duplicate date/canonical-event pairs.');
  if (new Set(occurrences.map((item) => text(item.dateISO))).size !== 365) throw new Error('Portugal v2 does not cover 365 unique days.');

  const sources = [
    {
      id:'portugal-national-liturgy-secretariat', name:'Secretariado Nacional de Liturgia — Agenda Litúrgica', url:'https://www.liturgia.pt/agenda/', host:'www.liturgia.pt', authority:'official-jurisdiction', jurisdiction:"'pt'",
      usage:'Official Portugal occurrence dates, ranks and Portuguese labels after reviewed canonical binding.', copyright:'Structured calendar facts and short labels only.'
    },
    {
      id:'litcal-api', name:'LitCal API', url:'https://litcal.johnromanodorazio.com/api/v5', host:'litcal.johnromanodorazio.com', authority:'reference-engine', jurisdiction:'NULL',
      usage:'General Roman identity-linked English, French and Italian labels only in this Portugal v2 release.', copyright:'No substantial editorial text copied.'
    },
    {
      id:'romcal-general-roman-es', name:'Romcal General Roman Spanish locale', url:'https://github.com/romcal/romcal', host:'github.com', authority:'reference-directory', jurisdiction:'NULL',
      usage:'Spanish General Roman localization by event identity; never Portugal calendar authority.', copyright:'MIT-licensed localization data; attribution retained.'
    },
    {
      id:'santosdia-reviewed-calendar-localization', name:'Santos do Dia reviewed calendar localization', url:'https://www.santosdodia.com/', host:'www.santosdodia.com', authority:'reviewed-editorial', jurisdiction:"'pt'",
      usage:'Human-reviewed localization for Portugal-specific canonical observances and explicit authority corrections.', copyright:'Original reviewed localization produced for Santos do Dia.'
    },
  ];

  const releaseDigest = hash(occurrences.map((item) => ({ sourceOccurrenceId:item.sourceOccurrenceId, dateISO:item.dateISO, canonicalEventId:item.canonicalEventId, rank:item.rank, labels:item.labels, decisionId:item.decisionId })));
  const runId = `product-build:roman-catholic:pt:${report.year}:v2:${releaseDigest.slice(0, 16)}`;
  const validationReportPath = dropboxManifestPath.replace(/manifest\.json$/u, 'validation.json');
  const statements = [
    'PRAGMA foreign_keys = ON;',
    `INSERT INTO churches (id,family,tradition,canonical_name,canonical_url,active,first_seen_at,last_verified_at) VALUES ('roman-catholic','catholic','roman-catholic','Roman Catholic Church','https://www.vatican.va/',1,${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET family=excluded.family,tradition=excluded.tradition,canonical_name=excluded.canonical_name,canonical_url=excluded.canonical_url,active=1,last_verified_at=excluded.last_verified_at;`,
    `INSERT INTO jurisdictions (id,church_id,level,canonical_name,country_code,official_url,first_seen_at,last_verified_at) VALUES ('pt','roman-catholic','national-calendar','Portugal','PT','https://www.liturgia.pt/agenda/',${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,level=excluded.level,canonical_name=excluded.canonical_name,country_code=excluded.country_code,official_url=excluded.official_url,last_verified_at=excluded.last_verified_at;`,
  ];
  for (const source of sources) {
    statements.push(`INSERT INTO source_registry (id,name,base_url,host,authority,adapter,usage_policy,copyright_policy,refresh_hours,requests_per_second,active,updated_at) VALUES (${sql(source.id)},${sql(source.name)},${sql(source.url)},${sql(source.host)},${sql(source.authority)},'product-build-roman-catholic-pt-v2',${sql(source.usage)},${sql(source.copyright)},168,0.25,1,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name,base_url=excluded.base_url,host=excluded.host,authority=excluded.authority,adapter=excluded.adapter,usage_policy=excluded.usage_policy,copyright_policy=excluded.copyright_policy,active=1,updated_at=CURRENT_TIMESTAMP;`);
    statements.push(`INSERT INTO calendar_sources (id,church_id,jurisdiction_id,usage_policy,copyright_policy,active) VALUES (${sql(source.id)},'roman-catholic',${source.jurisdiction},${sql(source.usage)},${sql(source.copyright)},1) ON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,jurisdiction_id=excluded.jurisdiction_id,usage_policy=excluded.usage_policy,copyright_policy=excluded.copyright_policy,active=1;`);
  }
  statements.push(`INSERT INTO calendar_import_runs (id,created_at,retrieved_at,dropbox_manifest_path,manifest_sha256,status,validation_report_path) VALUES (${sql(runId)},${sql(generatedAt)},${sql(generatedAt)},${sql(dropboxManifestPath)},${sql(hash(report))},'validated',${sql(validationReportPath)}) ON CONFLICT(id) DO UPDATE SET retrieved_at=excluded.retrieved_at,dropbox_manifest_path=excluded.dropbox_manifest_path,manifest_sha256=excluded.manifest_sha256,status='validated',validation_report_path=excluded.validation_report_path;`);
  statements.push(`INSERT INTO jurisdiction_calendar_policies (id,church_id,jurisdiction_id,engine_id,fixed_date_policy,calendar_system,effective_from,effective_to,source_id,validation_status) VALUES ('roman-catholic-pt-2026-v2','roman-catholic','pt','snl-portugal-reviewed-overlay-v2','general-roman-plus-reviewed-portugal-overlay','gregorian','2026-01-01','2026-12-31','portugal-national-liturgy-secretariat','cross-checked') ON CONFLICT(id) DO UPDATE SET engine_id=excluded.engine_id,fixed_date_policy=excluded.fixed_date_policy,calendar_system=excluded.calendar_system,effective_from=excluded.effective_from,effective_to=excluded.effective_to,source_id=excluded.source_id,validation_status=excluded.validation_status;`);

  // Staging replacement strategy: clear only the PT/2026 materialized occurrence slice.
  // Observance identities and source registries are shared and are intentionally retained.
  statements.push(`DELETE FROM source_assertions WHERE subject_type='calendar-occurrence' AND subject_id IN (SELECT id FROM calendar_occurrences WHERE church_id='roman-catholic' AND jurisdiction_id='pt' AND date_iso BETWEEN '2026-01-01' AND '2026-12-31');`);
  statements.push(`DELETE FROM calendar_occurrences WHERE church_id='roman-catholic' AND jurisdiction_id='pt' AND date_iso BETWEEN '2026-01-01' AND '2026-12-31';`);

  const usedOccurrenceIds = new Set();
  let labelAssertions = 0;
  let snlAssertions = 0;
  for (const item of occurrences) {
    const dateISO = text(item.dateISO);
    const canonicalEventId = text(item.canonicalEventId);
    if (!/^2026-\d{2}-\d{2}$/u.test(dateISO) || !canonicalEventId || !text(item.sourceOccurrenceId)) throw new Error(`Invalid v2 occurrence ${canonicalEventId || item.sourceOccurrenceId || 'unknown'}.`);
    const id = occurrenceId(item);
    if (usedOccurrenceIds.has(id)) throw new Error(`Duplicate generated occurrence id ${id}.`);
    usedOccurrenceIds.add(id);
    statements.push(`INSERT INTO calendar_observances (id,church_id,canonical_key,category,active,created_at,updated_at) VALUES (${sql(canonicalEventId)},'roman-catholic',${sql(canonicalEventId)},${sql(category(item.category))},1,${sql(generatedAt)},${sql(generatedAt)}) ON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,canonical_key=excluded.canonical_key,category=excluded.category,active=1,updated_at=excluded.updated_at;`);
    statements.push(`INSERT INTO calendar_occurrences (id,import_run_id,church_id,jurisdiction_id,canonical_event_id,date_iso,native_calendar_system,native_year,rank_code,validation_status,publication_status,created_at,updated_at) VALUES (${sql(id)},${sql(runId)},'roman-catholic','pt',${sql(canonicalEventId)},${sql(dateISO)},'gregorian',2026,${sql(text(item.rank) || null)},'cross-checked',${sql(publicationStatus)},${sql(generatedAt)},${sql(generatedAt)});`);

    if (item?.source?.occurrenceAssertion !== true || !text(item?.source?.sourceRecordHash)) throw new Error(`${canonicalEventId} lacks exact SNL occurrence provenance.`);
    const assertionHash = text(item.source.sourceRecordHash);
    const assertionId = hash(`${id}|portugal-national-liturgy-secretariat|${assertionHash}`);
    statements.push(`INSERT INTO calendar_occurrence_assertions (id,occurrence_id,source_id,asserted_date_iso,source_record_url,source_record_hash,observed_at,validation_status) VALUES (${sql(assertionId)},${sql(id)},'portugal-national-liturgy-secretariat',${sql(dateISO)},'https://www.liturgia.pt/agenda/agenda.ics',${sql(assertionHash)},${sql(generatedAt)},'cross-checked');`);
    snlAssertions += 1;

    for (const locale of PUBLIC_LOCALES) {
      const labelInfo = item.labels?.[locale];
      const label = text(labelInfo?.label);
      const sourceId = text(labelInfo?.source);
      const translationStatus = text(labelInfo?.translationStatus);
      if (!label || !sourceId || !['source','reviewed'].includes(translationStatus)) throw new Error(`${canonicalEventId} is missing validated ${locale} label provenance.`);
      statements.push(`INSERT INTO calendar_occurrence_labels (occurrence_id,locale,name,description,translation_status,source_locale) VALUES (${sql(id)},${sql(locale)},${sql(label)},NULL,${sql(translationStatus)},${sql(text(labelInfo?.sourceLocale) || locale)});`);
      const claimId = hash(`${id}|label.${locale}|${sourceId}|${label}`);
      statements.push(`INSERT INTO source_assertions (id,subject_type,subject_id,field,value_json,source_id,source_url,observed_at,content_hash,confidence) VALUES (${sql(claimId)},'calendar-occurrence',${sql(id)},${sql(`label.${locale}`)},${sql(JSON.stringify(label))},${sql(sourceId)},${sql(sourceUrl(sourceId))},${sql(generatedAt)},${sql(hash(label))},${sql(translationStatus === 'reviewed' ? 'reviewed' : 'cross-checked')}) ON CONFLICT(id) DO UPDATE SET value_json=excluded.value_json,source_id=excluded.source_id,source_url=excluded.source_url,observed_at=excluded.observed_at,content_hash=excluded.content_hash,confidence=excluded.confidence;`);
      labelAssertions += 1;
    }
  }

  const manifest = {
    schemaVersion:3,
    release:'roman-catholic-pt-2026-v2',
    runId,
    generatedAt,
    sourceBuild:report.build,
    sourceBuildDigest:releaseDigest,
    publicationStatus,
    churchId:'roman-catholic',
    jurisdictionId:'pt',
    year:2026,
    expectedOccurrences:occurrences.length,
    expectedDays:365,
    expectedLabels:occurrences.length * PUBLIC_LOCALES.length,
    expectedCalendarAssertions:snlAssertions,
    expectedLabelAssertions:labelAssertions,
    publicLocales:PUBLIC_LOCALES,
    dropboxManifestPath,
    validationReportPath,
    sources:sources.map(({id,name,url,authority,usage}) => ({id,name,url,authority,usage})),
    provenancePolicy:{
      portugalDateAuthority:'portugal-national-liturgy-secretariat',
      labelSourceIsNotCalendarIdentity:true,
      generalRomanAndRomcalNeverAssertTransferredPortugalDates:true,
      firstEventByCivilDateMatchingForbidden:true,
      portugalSpecificLocalizationMustBeReviewed:true,
    },
    replacementPolicy:{
      scope:'roman-catholic/pt/2026 only',
      stagingSliceReplacement:true,
      sharedCanonicalObservancesRetained:true,
    },
    safety:{
      automaticFutureProductionWrites:false,
      productionApproved:false,
      generatedFromExactApprovedOverlayOnly:true,
      descriptionsCopied:false,
      validationStatus:'cross-checked',
      d1ImportCompatible:true,
      stagingOnly:true,
    },
  };
  return { sql:`${statements.join('\n')}\n`, manifest };
}

function main() {
  const inputPath = argument('--input');
  const sqlPath = argument('--sql');
  const manifestPath = argument('--manifest');
  const dropboxManifestPath = argument('--dropbox-manifest-path');
  const publicationStatus = argument('--publication-status','publishable');
  if (!inputPath || !sqlPath || !manifestPath || !dropboxManifestPath) throw new Error('Usage: --input <build.json> --sql <release.sql> --manifest <manifest.json> --dropbox-manifest-path <path> [--publication-status publishable]');
  const report = JSON.parse(fs.readFileSync(path.resolve(inputPath),'utf8'));
  const result = buildPortugalD1ReleaseV2({ report, dropboxManifestPath, publicationStatus });
  fs.mkdirSync(path.dirname(path.resolve(sqlPath)), { recursive:true });
  fs.mkdirSync(path.dirname(path.resolve(manifestPath)), { recursive:true });
  fs.writeFileSync(path.resolve(sqlPath), result.sql, 'utf8');
  fs.writeFileSync(path.resolve(manifestPath), `${JSON.stringify(result.manifest,null,2)}\n`, 'utf8');
  console.log(JSON.stringify({ release:result.manifest.release, runId:result.manifest.runId, occurrences:result.manifest.expectedOccurrences, days:result.manifest.expectedDays, labels:result.manifest.expectedLabels, calendarAssertions:result.manifest.expectedCalendarAssertions, labelAssertions:result.manifest.expectedLabelAssertions, publicationStatus }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

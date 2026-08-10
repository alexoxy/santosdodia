#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function sql(value) { if (value === null || value === undefined) return 'NULL'; if (typeof value === 'number') return String(value); return `'${String(value).replaceAll("'", "''")}'`; }
function json(value) { return sql(JSON.stringify(value ?? [])); }
function text(value, label) { if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string.`); return value.trim(); }
function hash(value, label) { const v = text(value, label); if (!/^[a-f0-9]{64}$/u.test(v)) throw new Error(`${label} must be a lowercase SHA-256.`); return v; }
function labelValue(value) {
  if (typeof value === 'string' && value.trim()) return { value: value.trim(), status: 'source' };
  if (value && typeof value === 'object' && typeof value.value === 'string' && value.value.trim()) return { value: value.value.trim(), status: value.status === 'reviewed' ? 'reviewed' : 'source' };
  return null;
}
function validCoordinate(lat, lon) { return Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180; }
function datasetId(sourceSha256) { return `navigation-${sourceSha256.slice(0, 24)}`; }

export function buildNavigationStagingSql(source, readiness) {
  if (source?.schemaVersion !== 1 || !Array.isArray(source?.people) || !Array.isArray(source?.unlinkedObservances)) throw new Error('Navigation source has the wrong schema.');
  if (source.publicationAllowed !== false || source.productionMutation !== false) throw new Error('Navigation source must remain non-publishable and non-production.');
  if (readiness?.schemaVersion !== 1 || readiness?.identityRootSha256 !== source.identityRootSha256 || readiness?.datasetVersion !== source.datasetVersion) throw new Error('Navigation readiness does not match the source.');
  if (readiness.publicationAllowed !== false || readiness.productionMutation !== false || readiness.status === 'blocked') throw new Error('Blocked or publication-open navigation readiness cannot be staged.');
  const identityRoot = hash(source.identityRootSha256, 'identityRootSha256');
  const sourceSha = hash(source.sourceSha256, 'sourceSha256');
  const id = datasetId(sourceSha);
  const peopleIds = new Set();
  const statements = ['PRAGMA foreign_keys = ON;', 'BEGIN IMMEDIATE;'];

  statements.push(`DELETE FROM saint_navigation_datasets WHERE id=${sql(id)};`);
  statements.push(`INSERT INTO saint_navigation_datasets (id,identity_root_sha256,source_sha256,status,generated_at,published_at,active,person_count,place_count,observance_count) VALUES (${sql(id)},${sql(identityRoot)},${sql(sourceSha)},'staging',${sql(text(source.generatedAt, 'generatedAt'))},NULL,0,0,0,0);`);

  let placeCount = 0;
  let observanceCount = 0;
  for (const [index, person] of source.people.entries()) {
    const prefix = `people[${index}]`;
    const entityId = text(person?.entityId, `${prefix}.entityId`);
    if (peopleIds.has(entityId)) throw new Error(`Duplicate entityId ${entityId}.`);
    peopleIds.add(entityId);
    const qid = person?.qid ?? null;
    if (qid !== null && !/^Q[1-9]\d*$/u.test(qid)) throw new Error(`${prefix}.qid is invalid.`);
    const birthYear = Number.isInteger(person?.birth?.year) ? person.birth.year : null;
    const deathYear = Number.isInteger(person?.death?.year) ? person.death.year : null;
    const anchorYear = birthYear ?? deathYear;
    const century = Number.isInteger(anchorYear) ? (anchorYear > 0 ? Math.floor((anchorYear - 1) / 100) + 1 : -(Math.floor((Math.abs(anchorYear) - 1) / 100) + 1)) : null;
    statements.push(`INSERT INTO saint_navigation_people (dataset_id,entity_id,qid,birth_year,death_year,anchor_year,century,validation_status) VALUES (${sql(id)},${sql(entityId)},${sql(qid)},${sql(birthYear)},${sql(deathYear)},${sql(anchorYear)},${sql(century)},${sql(person.validationStatus ?? 'provisional')});`);

    for (const [locale, raw] of Object.entries(person.names ?? {})) {
      const label = labelValue(raw); if (!label) continue;
      statements.push(`INSERT INTO saint_navigation_person_labels (dataset_id,entity_id,locale,name,label_status) VALUES (${sql(id)},${sql(entityId)},${sql(locale)},${sql(label.value)},${sql(label.status)});`);
    }

    for (const [placeIndex, place] of (person.places ?? []).entries()) {
      const lat = Number(place?.lat); const lon = Number(place?.lon);
      if (!validCoordinate(lat, lon)) continue;
      const relationType = ['birth','death','burial','activity','martyrdom'].includes(place?.relationType) ? place.relationType : 'other';
      const pointId = `${entityId}:${relationType}:${place.placeId ?? `${lat},${lon}`}:${placeIndex}`;
      statements.push(`INSERT INTO saint_navigation_places (id,dataset_id,entity_id,relation_type,place_id,current_name,historical_name,country_code,latitude,longitude,confidence,source_ids_json) VALUES (${sql(pointId)},${sql(id)},${sql(entityId)},${sql(relationType)},${sql(place.placeId ?? null)},${sql(place.currentName ?? null)},${sql(place.historicalName ?? null)},${sql(place.countryCode ?? null)},${sql(lat)},${sql(lon)},${sql(Number.isFinite(place.confidence) ? place.confidence : null)},${json(place.sourceIds)});`);
      placeCount += 1;
    }

    for (const observance of person.observances ?? []) {
      const obsId = text(observance?.id, `${prefix}.observance.id`);
      const status = observance.personLinkStatus ?? 'linked';
      if (status !== 'linked') throw new Error(`Person-attached observance ${obsId} must be linked.`);
      statements.push(...observanceStatements(id, observance, entityId, 'linked'));
      observanceCount += 1;
    }
  }

  for (const [index, observance] of source.unlinkedObservances.entries()) {
    const status = observance?.personLinkStatus ?? 'unresolved';
    if (!['unresolved','withheld'].includes(status) || observance?.personEntityId) throw new Error(`unlinkedObservances[${index}] must remain unresolved/withheld without entityId.`);
    statements.push(...observanceStatements(id, observance, null, status));
    observanceCount += 1;
  }

  statements.push(`UPDATE saint_navigation_datasets SET person_count=${source.people.length},place_count=${placeCount},observance_count=${observanceCount} WHERE id=${sql(id)};`);
  statements.push('COMMIT;');
  const output = `${statements.join('\n')}\n`;
  if (/status[^\n]*'published'|active[^\n]*=\s*1|VALUES\s*\([^\n]*'published'/iu.test(output)) throw new Error('Staging SQL unexpectedly contains a publication activation.');
  return { datasetId: id, personCount: source.people.length, placeCount, observanceCount, readinessStatus: readiness.status, sql: output };
}

function observanceStatements(datasetIdValue, observance, entityId, linkStatus) {
  const id = text(observance?.id, 'observance.id');
  if (!Number.isInteger(observance?.month) || observance.month < 1 || observance.month > 12 || !Number.isInteger(observance?.day) || observance.day < 1 || observance.day > 31) throw new Error(`Observance ${id} has an invalid month/day.`);
  const sourceIds = observance.sourceIds ?? (observance.source?.sourceId ? [observance.source.sourceId] : []);
  const statements = [`INSERT INTO saint_navigation_observances (id,dataset_id,entity_id,person_link_status,month,day,church_id,jurisdiction_id,rank_code,validation_status,source_ids_json) VALUES (${sql(id)},${sql(datasetIdValue)},${sql(entityId)},${sql(linkStatus)},${observance.month},${observance.day},${sql(observance.churchId ?? null)},${sql(observance.jurisdictionId ?? null)},${sql(observance.rankCode ?? null)},${sql(observance.validationStatus ?? 'provisional')},${json(sourceIds)});`];
  for (const [locale, raw] of Object.entries(observance.names ?? {})) {
    const label = labelValue(raw); if (!label) continue;
    statements.push(`INSERT INTO saint_navigation_observance_labels (dataset_id,observance_id,locale,name,label_status) VALUES (${sql(datasetIdValue)},${sql(id)},${sql(locale)},${sql(label.value)},${sql(label.status)});`);
  }
  return statements;
}

function main() {
  const input = argument('--input'); const readinessPath = argument('--readiness'); const output = argument('--output');
  if (!input || !readinessPath || !output) throw new Error('--input, --readiness and --output are required.');
  const result = buildNavigationStagingSql(JSON.parse(fs.readFileSync(path.resolve(input), 'utf8')), JSON.parse(fs.readFileSync(path.resolve(readinessPath), 'utf8')));
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(path.resolve(output), result.sql, 'utf8');
  process.stdout.write(`${JSON.stringify({ datasetId: result.datasetId, personCount: result.personCount, placeCount: result.placeCount, observanceCount: result.observanceCount, readinessStatus: result.readinessStatus, publicationAllowed: false }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }

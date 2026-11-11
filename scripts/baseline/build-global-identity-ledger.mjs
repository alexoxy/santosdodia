#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BATCH_PATTERN = /^batch-(\d{6})$/u;
const QID_PATTERN = /^Q[1-9]\d*$/u;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function jsonLines(values) {
  return values.length === 0 ? '' : `${values.map((value) => JSON.stringify(value)).join('\n')}\n`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function compareQids(a, b) {
  const left = BigInt(a.slice(1));
  const right = BigInt(b.slice(1));
  return left < right ? -1 : left > right ? 1 : 0;
}

function uniqueSorted(values, compare = (a, b) => String(a).localeCompare(String(b))) {
  return [...new Set(values)].sort(compare);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readJsonLines(filePath) {
  const body = await readFile(filePath, 'utf8');
  return body.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
}

async function findNamedFiles(root, target, found = []) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) await findNamedFiles(absolute, target, found);
    else if (entry.isFile() && entry.name === target) found.push(absolute);
  }
  return found;
}

async function findExactlyOne(root, target) {
  const matches = await findNamedFiles(root, target);
  if (matches.length !== 1) throw new Error(`${root}: expected exactly one ${target}, found ${matches.length}.`);
  return matches[0];
}

function preciseDate(entity, predicate) {
  const projection = entity?.dates?.[predicate];
  if (projection?.resolutionStatus !== 'single_source_value' || !projection.canonical) return null;
  return projection.canonical;
}

function entityNameKeys(entity) {
  const values = [];
  for (const name of entity?.names ?? []) {
    if (!name?.language || !name?.normalizedName || !name?.name) continue;
    values.push({
      language: name.language,
      normalizedName: name.normalizedName,
      name: name.name,
      nameType: name.nameType ?? 'label',
    });
  }
  return values;
}

function recognitionQids(entity) {
  return (entity?.recognition?.sourceStatusCandidates ?? []).map((item) => item?.qid).filter((qid) => QID_PATTERN.test(qid ?? ''));
}

function conflictRecord({ qid, predicate, values, batches, reason }) {
  return {
    schemaVersion: 1,
    id: `identity:wikidata:${qid}:${predicate}`,
    entityId: `wikidata:${qid}`,
    qid,
    predicate,
    severity: 'high',
    status: 'open',
    reason,
    values: uniqueSorted(values),
    sourceBatches: uniqueSorted(batches),
    automaticMergeBlocked: true,
  };
}

async function loadBatch(batchDir, expectations) {
  const batchName = path.basename(batchDir);
  const match = batchName.match(BATCH_PATTERN);
  if (!match) throw new Error(`Invalid reviewed batch directory: ${batchName}.`);
  const startPage = Number(match[1]);
  const manifestPath = await findExactlyOne(batchDir, 'staging-manifest.json');
  const entitiesPath = await findExactlyOne(batchDir, 'entities.jsonl');
  const summaryPath = await findExactlyOne(batchDir, 'upstream-summary.json');
  const [manifest, entities, summary] = await Promise.all([
    readJson(manifestPath),
    readJsonLines(entitiesPath),
    readJson(summaryPath),
  ]);

  if (manifest.stage !== 'linguistically-reviewed' || manifest.mode !== 'staging' || manifest.publish !== false) {
    throw new Error(`${batchName}: identity ledger requires linguistically-reviewed staging-only input.`);
  }
  if (manifest.sourceId !== 'wikidata' || manifest.queryVersion !== expectations.queryVersion) throw new Error(`${batchName}: source/query epoch mismatch.`);
  if (manifest.stagingVersion !== expectations.normalizationVersion) throw new Error(`${batchName}: normalization version mismatch.`);
  if (manifest.linguisticReviewVersion !== expectations.reviewVersion) throw new Error(`${batchName}: language-review version mismatch.`);
  if (manifest.entityCount !== entities.length) throw new Error(`${batchName}: manifest entity count differs from entities.jsonl.`);
  if (summary.queryVersion !== expectations.queryVersion || summary.startPage !== startPage || !Number.isInteger(summary.nextPage) || summary.nextPage <= startPage) {
    throw new Error(`${batchName}: upstream summary does not match batch identity.`);
  }
  if (summary.status !== 'fetched' || !summary.runId) throw new Error(`${batchName}: upstream source run is not a completed fetched run.`);
  if (manifest.sourceRunId && manifest.sourceRunId !== summary.runId) throw new Error(`${batchName}: manifest sourceRunId differs from upstream summary.`);

  for (const entity of entities) {
    if (!QID_PATTERN.test(entity?.qid ?? '')) throw new Error(`${batchName}: entity has invalid or missing QID.`);
    if (entity.id !== `wikidata:${entity.qid}`) throw new Error(`${batchName}: entity ${entity.qid} does not use the stable Wikidata identity key.`);
    if (entity.entityType !== 'historical-person') throw new Error(`${batchName}: entity ${entity.qid} is not a historical-person candidate.`);
    if (entity.publish !== false) throw new Error(`${batchName}: entity ${entity.qid} unexpectedly permits publication.`);
  }

  return {
    batchName,
    startPage,
    nextPage: summary.nextPage,
    sourceRunId: summary.runId,
    sourceFingerprint: manifest.sourceFingerprint,
    entityCount: entities.length,
    entities,
  };
}

export async function buildGlobalIdentityLedger({
  inputRoot,
  reviewedProgress,
  queryVersion = 'recognition-v1',
  normalizationVersion = '1.1',
  reviewVersion = '1.1',
  identityVersion = '1.0',
} = {}) {
  if (!inputRoot) throw new Error('Identity ledger input root is required.');
  if (!reviewedProgress || reviewedProgress.schemaVersion !== 1 || reviewedProgress.baselineId !== 'saints-v1' || reviewedProgress.sourceId !== 'wikidata') {
    throw new Error('Reviewed progress has the wrong identity/schema.');
  }
  if (reviewedProgress.queryVersion !== queryVersion || reviewedProgress.normalizationVersion !== normalizationVersion || reviewedProgress.languageReviewVersion !== reviewVersion) {
    throw new Error('Reviewed progress belongs to a different pipeline version.');
  }
  if (reviewedProgress.sourceCompleted !== true || reviewedProgress.caughtUp !== true) {
    throw new Error('Global identity ledger requires a completed and caught-up reviewed baseline.');
  }

  const children = await readdir(inputRoot, { withFileTypes: true });
  const batchDirs = children
    .filter((entry) => entry.isDirectory() && BATCH_PATTERN.test(entry.name))
    .map((entry) => path.join(inputRoot, entry.name))
    .sort((a, b) => Number(path.basename(a).slice(6)) - Number(path.basename(b).slice(6)));
  if (batchDirs.length === 0) throw new Error('No reviewed baseline batch directories were found.');

  const batches = [];
  for (const batchDir of batchDirs) batches.push(await loadBatch(batchDir, { queryVersion, normalizationVersion, reviewVersion }));

  const sourceEntityOccurrences = batches.reduce((total, batch) => total + batch.entityCount, 0);
  if (sourceEntityOccurrences !== reviewedProgress.cumulativeEntitiesReviewed) {
    throw new Error(`Reviewed batch occurrence count ${sourceEntityOccurrences} does not match watermark ${reviewedProgress.cumulativeEntitiesReviewed}.`);
  }
  const latest = reviewedProgress.lastReviewed;
  const finalBatch = batches.at(-1);
  if (!latest || finalBatch.nextPage !== latest.sourceNextPage || finalBatch.startPage !== latest.sourceStartPage || finalBatch.sourceRunId !== latest.sourceRunId) {
    throw new Error('Reviewed batch set does not end at the current language-review watermark.');
  }

  const occurrencesByQid = new Map();
  const nameIndex = new Map();
  for (const batch of batches) {
    for (const entity of batch.entities) {
      const occurrence = {
        batch: batch.batchName,
        sourceRunId: batch.sourceRunId,
        entityType: entity.entityType,
        canonicalName: entity.canonicalName,
        status: entity.status,
        birth: preciseDate(entity, 'birth'),
        death: preciseDate(entity, 'death'),
        recognitionStatusQids: recognitionQids(entity),
      };
      const list = occurrencesByQid.get(entity.qid) ?? [];
      list.push(occurrence);
      occurrencesByQid.set(entity.qid, list);

      for (const name of entityNameKeys(entity)) {
        const key = `${name.language}\u0000${name.normalizedName}`;
        const current = nameIndex.get(key) ?? { language: name.language, normalizedName: name.normalizedName, qids: new Set(), sourceForms: new Set() };
        current.qids.add(entity.qid);
        current.sourceForms.add(name.name);
        nameIndex.set(key, current);
      }
    }
  }

  const conflicts = [];
  const ledger = [];
  const crossBatchDuplicates = [];
  for (const qid of [...occurrencesByQid.keys()].sort(compareQids)) {
    const occurrences = occurrencesByQid.get(qid).sort((a, b) => a.batch.localeCompare(b.batch));
    const sourceBatches = uniqueSorted(occurrences.map((item) => item.batch));
    const entityTypes = uniqueSorted(occurrences.map((item) => item.entityType));
    const birthValues = uniqueSorted(occurrences.map((item) => item.birth).filter(Boolean));
    const deathValues = uniqueSorted(occurrences.map((item) => item.death).filter(Boolean));
    const conflictIds = [];

    if (entityTypes.length > 1) {
      const conflict = conflictRecord({ qid, predicate: 'entity-type', values: entityTypes, batches: sourceBatches, reason: 'person-versus-nonperson-type' });
      conflicts.push(conflict);
      conflictIds.push(conflict.id);
    }
    if (birthValues.length > 1) {
      const conflict = conflictRecord({ qid, predicate: 'birth', values: birthValues, batches: sourceBatches, reason: 'incompatible-precise-birth-dates-without-source-conflict' });
      conflicts.push(conflict);
      conflictIds.push(conflict.id);
    }
    if (deathValues.length > 1) {
      const conflict = conflictRecord({ qid, predicate: 'death', values: deathValues, batches: sourceBatches, reason: 'incompatible-precise-death-dates' });
      conflicts.push(conflict);
      conflictIds.push(conflict.id);
    }

    const entry = {
      schemaVersion: 1,
      identityVersion,
      entityId: `wikidata:${qid}`,
      qid,
      entityType: entityTypes[0] ?? 'historical-person',
      identityClass: 'candidate-source-identity',
      identityStatus: conflictIds.length > 0 ? 'conflict' : occurrences.length > 1 ? 'resolved-duplicate-occurrences' : 'resolved-single-occurrence',
      resolutionBasis: {
        signal: 'exactExternalIdentifier',
        scheme: 'wikidata',
        externalValue: qid,
        confidence: 1,
        nameOnlyMerge: false,
      },
      occurrenceCount: occurrences.length,
      sourceBatches,
      sourceRunIds: uniqueSorted(occurrences.map((item) => item.sourceRunId)),
      canonicalNameCandidates: uniqueSorted(occurrences.map((item) => item.canonicalName).filter(Boolean)),
      recognitionStatusQids: uniqueSorted(occurrences.flatMap((item) => item.recognitionStatusQids), compareQids),
      preciseDateEvidence: { birth: birthValues, death: deathValues },
      conflictIds,
      publish: false,
    };
    ledger.push(entry);

    if (occurrences.length > 1) {
      crossBatchDuplicates.push({
        schemaVersion: 1,
        entityId: entry.entityId,
        qid,
        occurrenceCount: occurrences.length,
        sourceBatches,
        resolvedBy: 'exact-wikidata-identifier',
        conflictIds,
      });
    }
  }

  const nameCollisions = [...nameIndex.values()]
    .filter((entry) => entry.qids.size > 1)
    .map((entry) => ({
      schemaVersion: 1,
      language: entry.language,
      normalizedName: entry.normalizedName,
      qids: [...entry.qids].sort(compareQids),
      sourceForms: [...entry.sourceForms].sort((a, b) => a.localeCompare(b)),
      identityAction: 'none-name-is-not-identity',
    }))
    .sort((a, b) => a.language.localeCompare(b.language) || a.normalizedName.localeCompare(b.normalizedName));

  const sourceBatches = batches.map((batch) => ({
    batch: batch.batchName,
    startPage: batch.startPage,
    nextPage: batch.nextPage,
    sourceRunId: batch.sourceRunId,
    sourceFingerprint: batch.sourceFingerprint,
    entityOccurrences: batch.entityCount,
  }));
  const stablePayload = {
    identityVersion,
    queryVersion,
    normalizationVersion,
    reviewVersion,
    sourceBatches,
    ledger,
    conflicts,
    nameCollisions,
  };
  const rootSha256 = sha256(JSON.stringify(stablePayload));
  const uniqueIdentityCount = ledger.length;
  const duplicateOccurrencesCollapsed = sourceEntityOccurrences - uniqueIdentityCount;
  const report = {
    schemaVersion: 1,
    identityVersion,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion,
    generatedAt: new Date().toISOString(),
    sourceCompleted: true,
    caughtUp: true,
    sourceBatchCount: batches.length,
    sourceEntityOccurrences,
    uniqueIdentityCount,
    duplicateOccurrencesCollapsed,
    crossBatchDuplicateIdentityCount: crossBatchDuplicates.length,
    identityConflictCount: conflicts.length,
    nameCollisionKeyCount: nameCollisions.length,
    nameOnlyMergeCount: 0,
    exactExternalIdentifierResolutionCount: uniqueIdentityCount,
    freezeIdentityGateEligible: conflicts.length === 0,
    rootSha256,
  };
  const manifest = {
    schemaVersion: 1,
    identityVersion,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion,
    normalizationVersion,
    languageReviewVersion: reviewVersion,
    stage: 'global-candidate-identity-ledger',
    mode: 'staging',
    publish: false,
    rootSha256,
    sourceBatchCount: batches.length,
    sourceEntityOccurrences,
    uniqueIdentityCount,
    identityConflictCount: conflicts.length,
    files: {
      ledger: 'identity-ledger.jsonl',
      crossBatchDuplicates: 'cross-batch-duplicates.jsonl',
      conflicts: 'identity-conflicts.jsonl',
      nameCollisions: 'name-collisions.jsonl',
      report: 'identity-report.json',
    },
  };

  return { manifest, report, ledger, crossBatchDuplicates, conflicts, nameCollisions, sourceBatches };
}

async function main() {
  const inputRoot = argument('--input-root');
  const reviewedProgressPath = argument('--review-progress');
  const outputDir = path.resolve(argument('--output', 'staging/baseline-identity/output'));
  const queryVersion = argument('--query-version', 'recognition-v1');
  const normalizationVersion = argument('--normalization-version', '1.1');
  const reviewVersion = argument('--review-version', '1.1');
  const identityVersion = argument('--identity-version', '1.0');
  if (!inputRoot || !reviewedProgressPath) throw new Error('--input-root and --review-progress are required.');
  const reviewedProgress = await readJson(path.resolve(reviewedProgressPath));
  const result = await buildGlobalIdentityLedger({ inputRoot: path.resolve(inputRoot), reviewedProgress, queryVersion, normalizationVersion, reviewVersion, identityVersion });
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, 'identity-ledger.jsonl'), jsonLines(result.ledger), 'utf8'),
    writeFile(path.join(outputDir, 'cross-batch-duplicates.jsonl'), jsonLines(result.crossBatchDuplicates), 'utf8'),
    writeFile(path.join(outputDir, 'identity-conflicts.jsonl'), jsonLines(result.conflicts), 'utf8'),
    writeFile(path.join(outputDir, 'name-collisions.jsonl'), jsonLines(result.nameCollisions), 'utf8'),
    writeFile(path.join(outputDir, 'identity-report.json'), `${JSON.stringify(result.report, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputDir, 'identity-manifest.json'), `${JSON.stringify(result.manifest, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputDir, 'source-batches.json'), `${JSON.stringify({ schemaVersion: 1, batches: result.sourceBatches }, null, 2)}\n`, 'utf8'),
  ]);
  process.stdout.write(`${JSON.stringify(result.report, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Global identity ledger failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

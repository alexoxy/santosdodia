#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const pack = readJson('data/migrations/roman-catholic-pt-2026-v2.sanctorale-review-batch-2.json');
const coverage = readJson('data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json');
const approval = readJson('data/releases/roman-catholic-pt-2026-v2.production-request.json');
const people = readJson('data/canonical-person-anchors.json').people ?? [];
const recognitions = readJson('data/canonical-recognition-anchors.json').recognitions ?? [];
const observances = readJson('data/canonical-observance-anchors.json').observances ?? [];
const occurrences = readJson('data/canonical-occurrence-anchors.json').occurrences ?? [];
const bridges = readJson('data/canonical-occurrence-legacy-bridges.json').bridges ?? [];
const sanctoraleRules = readJson('data/canonical-roman-sanctorale-rule-anchors.json').rules ?? [];
const fixedShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json');

assert(pack?.schemaVersion === 1 && pack?.status === 'reviewed-sanctorale-promotion-candidate-pack', 'Sanctorale review pack identity changed unexpectedly.');
assert(pack.sourceReleaseId === coverage.sourceReleaseId && pack.sourceReleaseId === approval.releaseId, 'Review pack source release differs from the approved Portugal v2 release.');
assert(pack.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && pack.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId, 'Review pack workflow run differs from the approved artifact.');
assert(pack.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && pack.sourceArtifact.artifactId === approval.artifacts.release.id, 'Review pack artifact id differs from approval.');
assert(pack.sourceArtifact.artifactName === coverage.sourceArtifact.artifactName && pack.sourceArtifact.artifactName === approval.artifacts.release.name, 'Review pack artifact name differs from approval.');
assert(pack.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256 && `sha256:${pack.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], 'Review pack build digest differs from the approved artifact.');
assert(pack.sourceArtifact.sourceCommit === coverage.sourceArtifact.sourceCommit && pack.sourceArtifact.sourceCommit === approval.sourceMainCommit, 'Review pack source commit differs from approval.');
assert(pack.canonicalTarget.churchId === coverage.canonicalTarget.churchId && pack.canonicalTarget.jurisdictionId === coverage.canonicalTarget.jurisdictionId, 'Review pack Church/Jurisdiction differs from the canonical target.');
assert(pack.canonicalTarget.calendarSystem === coverage.canonicalTarget.calendarSystem && pack.canonicalTarget.year === coverage.canonicalTarget.year, 'Review pack calendar/year differs from the canonical target.');
assert(pack.mutationAllowed === false && pack.promotionAllowed === false, 'Review pack must remain non-mutating and non-promoting.');
assert(pack.verifiedAt === '2026-08-31', 'Review pack verification date drifted unexpectedly.');
assert(Array.isArray(pack.candidates) && pack.candidates.length === 3, 'Review pack must contain exactly three reviewed candidates.');

const candidateDigest = createHash('sha256').update(JSON.stringify(pack.candidates)).digest('hex');
assert(candidateDigest === pack.reviewDigestSha256, 'Review pack digest does not match its candidate payload.');
assert(candidateDigest === '167062ead74a3821b62ea6c45e0e06a00b6ed4e9cffdfe4573286535d01a3b6b', 'Review pack candidate set changed and requires explicit review.');

const expected = new Map([
  ['rc:StAugustineHippo', ['augustine-hippo', '2026-08-28', 'S. Agostinho, bispo e doutor da Igreja – MO']],
  ['rc:StJerome', ['jerome-stridon', '2026-09-30', 'S. Jerónimo, presbítero e doutor da Igreja – MO']],
  ['rc:StThereseChildJesus', ['therese-lisieux', '2026-10-01', 'S. Teresa do Menino Jesus, virgem e doutora da Igreja – MO']]
]);

const existingPersonIds = new Set(people.map((item) => item.id));
const existingRecognitionIds = new Set(recognitions.map((item) => item.id));
const existingObservanceIds = new Set(observances.map((item) => item.id));
const existingOccurrenceIds = new Set(occurrences.map((item) => item.id));
const existingBridgeIds = new Set(bridges.map((item) => item.legacyObservanceId));
const existingRuleIds = new Set(sanctoraleRules.map((item) => item.id));
const existingFixedSourceIds = new Set((fixedShadow.mappings ?? []).map((item) => item.sourceOccurrenceId));
const existingFixedSourceHashes = new Set((fixedShadow.mappings ?? []).map((item) => item.sourceRecordHash));

const seenPersonIds = new Set();
const seenRecognitionIds = new Set();
const seenObservanceIds = new Set();
const seenRuleIds = new Set();
const seenLegacyIds = new Set();
const seenSourceIds = new Set();
const seenSourceHashes = new Set();

for (const candidate of pack.candidates) {
  const source = candidate.source;
  const expectedRow = expected.get(source.canonicalEventId);
  assert(expectedRow, `Unexpected review candidate ${source.canonicalEventId}.`);
  assert(candidate.person.id === expectedRow[0] && source.dateISO === expectedRow[1] && source.observedDesignation === expectedRow[2], `${source.canonicalEventId} identity/date/designation differs from the reviewed vector.`);
  assert(candidate.person.primaryObservanceId === source.canonicalEventId && candidate.person.category === 'saint', `${candidate.person.id} must remain explicitly bridged to the approved legacy event.`);
  assert(['en', 'pt', 'es', 'it'].every((locale) => typeof candidate.person.names?.[locale] === 'string' && candidate.person.names[locale].trim().length > 0), `${candidate.person.id} lacks required canonical names.`);

  assert(candidate.recognition.id === `recognition:${candidate.person.id}:roman-catholic`, `${candidate.person.id} Recognition identity is invalid.`);
  assert(Array.isArray(candidate.recognition.ecclesialTitles) && candidate.recognition.ecclesialTitles.length >= 2, `${candidate.person.id} Recognition lacks reviewed ecclesial titles.`);
  assert(/^https:\/\/www\.vaticannews\.va\/en\/saints\//u.test(candidate.recognition.evidenceUrl), `${candidate.person.id} Recognition lacks Vatican News authority evidence.`);

  assert(candidate.observanceId === `observance:${candidate.person.id}:roman-catholic`, `${candidate.person.id} Observance identity is invalid.`);
  assert(candidate.sanctoraleRuleId === `sanctorale-rule:${candidate.person.id}:general-roman`, `${candidate.person.id} Sanctorale rule identity is invalid.`);
  assert(source.legacyRank === 'memorial' && source.sourceRankCode === 'MO' && source.canonicalRank === 'obligatory-memorial', `${candidate.person.id} reviewed rank refinement changed unexpectedly.`);
  assert(/^2026-\d{2}-\d{2}$/u.test(source.dateISO), `${candidate.person.id} lacks an exact 2026 date.`);
  assert(source.sourceOccurrenceId.startsWith(`snl-pt-${source.dateISO}-`), `${candidate.person.id} source occurrence is not bound to its exact SNL date.`);
  assert(/^[a-f0-9]{64}$/u.test(source.sourceRecordHash), `${candidate.person.id} source row hash is invalid.`);
  assert(/^https:\/\/(?:www\.)?liturgia\.pt\/liturgiadiaria\/dia\.php\?data=2026-/u.test(source.snlUrl), `${candidate.person.id} lacks Secretariado Nacional de Liturgia evidence.`);
  assert(source.sourceLabelPt.length > 10 && source.observedDesignation.endsWith(' – MO'), `${candidate.person.id} Portugal designation/rank evidence is incomplete.`);

  assert(!existingPersonIds.has(candidate.person.id), `${candidate.person.id} already exists in the canonical Person anchors.`);
  assert(!existingRecognitionIds.has(candidate.recognition.id), `${candidate.recognition.id} already exists in the canonical Recognition anchors.`);
  assert(!existingObservanceIds.has(candidate.observanceId), `${candidate.observanceId} already exists in the canonical Observance anchors.`);
  assert(!existingRuleIds.has(candidate.sanctoraleRuleId), `${candidate.sanctoraleRuleId} already exists in the Sanctorale anchors.`);
  assert(!existingBridgeIds.has(source.canonicalEventId), `${source.canonicalEventId} already has a canonical legacy bridge.`);
  assert(!existingFixedSourceIds.has(source.sourceOccurrenceId) && !existingFixedSourceHashes.has(source.sourceRecordHash), `${candidate.person.id} reuses an already-covered fixed Sanctorale source row.`);

  const proposedOccurrenceId = `occurrence:${source.dateISO}:${candidate.person.id}:roman-catholic:pt`;
  assert(!existingOccurrenceIds.has(proposedOccurrenceId), `${proposedOccurrenceId} already exists in canonical Occurrences.`);

  assert(!seenPersonIds.has(candidate.person.id) && !seenRecognitionIds.has(candidate.recognition.id) && !seenObservanceIds.has(candidate.observanceId) && !seenRuleIds.has(candidate.sanctoraleRuleId), `${candidate.person.id} duplicates an identity inside the review pack.`);
  assert(!seenLegacyIds.has(source.canonicalEventId) && !seenSourceIds.has(source.sourceOccurrenceId) && !seenSourceHashes.has(source.sourceRecordHash), `${candidate.person.id} duplicates a legacy/source identity inside the review pack.`);

  seenPersonIds.add(candidate.person.id);
  seenRecognitionIds.add(candidate.recognition.id);
  seenObservanceIds.add(candidate.observanceId);
  seenRuleIds.add(candidate.sanctoraleRuleId);
  seenLegacyIds.add(source.canonicalEventId);
  seenSourceIds.add(source.sourceOccurrenceId);
  seenSourceHashes.add(source.sourceRecordHash);
}

assert(seenPersonIds.size === 3 && seenLegacyIds.size === 3 && seenSourceIds.size === 3 && seenSourceHashes.size === 3, 'Review pack uniqueness gate failed.');
console.log('Portugal v2 Sanctorale review batch 2 passed: Augustine of Hippo, Jerome and Thérèse of Lisieux are exact approved-artifact candidates, authority-bound, non-mutating and not yet promoted.');

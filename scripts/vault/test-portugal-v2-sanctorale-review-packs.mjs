#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const migrationsDir = path.join(root, 'data', 'migrations');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const packPattern = /^roman-catholic-pt-2026-v2\.sanctorale-review-batch-(\d+)\.json$/u;
const packFiles = fs.readdirSync(migrationsDir).filter((name) => packPattern.test(name)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const approvedDigests = new Map([
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-2.json', '167062ead74a3821b62ea6c45e0e06a00b6ed4e9cffdfe4573286535d01a3b6b'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-3.json', '3a125eb283da6ca7be7b699109257887361f516f060e44ee5f8f98b97e90e9dc']
]);

assert(packFiles.length > 0, 'At least one reviewed Portugal v2 Sanctorale pack must exist.');
assert(packFiles.length === approvedDigests.size, 'Every Sanctorale review pack requires an explicit reviewed digest allowlist entry.');

const coverage = readJson('data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json');
const approval = readJson('data/releases/roman-catholic-pt-2026-v2.production-request.json');
const people = readJson('data/canonical-person-anchors.json').people ?? [];
const recognitions = readJson('data/canonical-recognition-anchors.json').recognitions ?? [];
const observances = readJson('data/canonical-observance-anchors.json').observances ?? [];
const occurrences = readJson('data/canonical-occurrence-anchors.json').occurrences ?? [];
const bridges = readJson('data/canonical-occurrence-legacy-bridges.json').bridges ?? [];
const sanctoraleRules = readJson('data/canonical-roman-sanctorale-rule-anchors.json').rules ?? [];
const fixedShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json');

const existingPersonIds = new Set(people.map((item) => item.id));
const existingRecognitionIds = new Set(recognitions.map((item) => item.id));
const existingObservanceIds = new Set(observances.map((item) => item.id));
const existingOccurrenceIds = new Set(occurrences.map((item) => item.id));
const existingBridgeIds = new Set(bridges.map((item) => item.legacyObservanceId));
const existingRuleIds = new Set(sanctoraleRules.map((item) => item.id));
const fixedMappings = fixedShadow.mappings ?? [];
const fixedByLegacyId = new Map(fixedMappings.map((item) => [item.legacyObservanceId, item]));
const fixedBySourceId = new Map(fixedMappings.map((item) => [item.sourceOccurrenceId, item]));
const fixedBySourceHash = new Map(fixedMappings.map((item) => [item.sourceRecordHash, item]));

const globalPackPersonIds = new Set();
const globalPackRecognitionIds = new Set();
const globalPackObservanceIds = new Set();
const globalPackRuleIds = new Set();
const globalPackLegacyIds = new Set();
const globalPackSourceIds = new Set();
const globalPackSourceHashes = new Set();

let candidateCount = 0;
let promotedPackCount = 0;

for (const fileName of packFiles) {
  const match = fileName.match(packPattern);
  const batchNumber = match?.[1];
  const relativePath = `data/migrations/${fileName}`;
  const pack = readJson(relativePath);
  const expectedDigest = approvedDigests.get(fileName);

  assert(expectedDigest, `${fileName} is not explicitly review-digest allowlisted.`);
  assert(pack?.schemaVersion === 1 && pack?.status === 'reviewed-sanctorale-promotion-candidate-pack', `${fileName} identity changed unexpectedly.`);
  assert(pack.sourceReleaseId === coverage.sourceReleaseId && pack.sourceReleaseId === approval.releaseId, `${fileName} source release differs from the approved Portugal v2 release.`);
  assert(pack.sourceArtifact.workflowRunId === coverage.sourceArtifact.workflowRunId && pack.sourceArtifact.workflowRunId === approval.stagingWorkflow.runId, `${fileName} workflow run differs from the approved artifact.`);
  assert(pack.sourceArtifact.artifactId === coverage.sourceArtifact.artifactId && pack.sourceArtifact.artifactId === approval.artifacts.release.id, `${fileName} artifact id differs from approval.`);
  assert(pack.sourceArtifact.artifactName === coverage.sourceArtifact.artifactName && pack.sourceArtifact.artifactName === approval.artifacts.release.name, `${fileName} artifact name differs from approval.`);
  assert(pack.sourceArtifact.buildJsonSha256 === coverage.sourceArtifact.buildJsonSha256 && `sha256:${pack.sourceArtifact.buildJsonSha256}` === approval.artifacts.release.files['build.json'], `${fileName} build digest differs from approval.`);
  assert(pack.sourceArtifact.sourceCommit === coverage.sourceArtifact.sourceCommit && pack.sourceArtifact.sourceCommit === approval.sourceMainCommit, `${fileName} source commit differs from approval.`);
  assert(pack.canonicalTarget.churchId === coverage.canonicalTarget.churchId && pack.canonicalTarget.jurisdictionId === coverage.canonicalTarget.jurisdictionId, `${fileName} Church/Jurisdiction differs from the canonical target.`);
  assert(pack.canonicalTarget.calendarSystem === coverage.canonicalTarget.calendarSystem && pack.canonicalTarget.year === coverage.canonicalTarget.year, `${fileName} calendar/year differs from the canonical target.`);
  assert(pack.mutationAllowed === false && pack.promotionAllowed === false, `${fileName} must remain non-mutating and non-promoting.`);
  assert(/^2026-\d{2}-\d{2}$/u.test(pack.verifiedAt), `${fileName} requires an exact 2026 review date.`);
  assert(Array.isArray(pack.candidates) && pack.candidates.length > 0 && pack.candidates.length <= 5, `${fileName} must remain a small bounded reviewed batch.`);

  const candidateDigest = createHash('sha256').update(JSON.stringify(pack.candidates)).digest('hex');
  assert(candidateDigest === pack.reviewDigestSha256, `${fileName} digest does not match its candidate payload.`);
  assert(candidateDigest === expectedDigest, `${fileName} candidate payload changed and requires explicit digest review.`);

  const receiptFile = `roman-catholic-pt-2026-v2.sanctorale-promotion-batch-${batchNumber}.json`;
  const receiptPath = path.join(migrationsDir, receiptFile);
  const promoted = fs.existsSync(receiptPath);
  let receipt = null;
  if (promoted) {
    receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    promotedPackCount += 1;
    assert(receipt?.schemaVersion === 1 && receipt?.status === 'canonical-sanctorale-promotion-completed', `${receiptFile} identity is invalid.`);
    assert(receipt.reviewPack === fileName && receipt.reviewDigestSha256 === candidateDigest, `${receiptFile} is not bound to the exact reviewed pack.`);
    assert(receipt.sourceReleaseId === pack.sourceReleaseId && receipt.runtimePublicationAllowed === false && receipt.productionWriteAllowed === false, `${receiptFile} must remain publication-safe.`);
    assert(Array.isArray(receipt.promotedPersonIds) && receipt.promotedPersonIds.length === pack.candidates.length, `${receiptFile} promoted Person count differs from its review pack.`);
  }

  const seenPersonIds = new Set();
  const seenRecognitionIds = new Set();
  const seenObservanceIds = new Set();
  const seenRuleIds = new Set();
  const seenLegacyIds = new Set();
  const seenSourceIds = new Set();
  const seenSourceHashes = new Set();

  for (const candidate of pack.candidates) {
    candidateCount += 1;
    const source = candidate.source;
    const proposedOccurrenceId = `occurrence:${source.dateISO}:${candidate.person.id}:roman-catholic:pt`;

    assert(candidate.person.primaryObservanceId === source.canonicalEventId && candidate.person.category === 'saint', `${candidate.person.id} must remain explicitly bridged to its approved legacy event.`);
    assert(['en', 'pt', 'es', 'it'].every((locale) => typeof candidate.person.names?.[locale] === 'string' && candidate.person.names[locale].trim().length > 0), `${candidate.person.id} lacks required canonical names.`);
    assert(candidate.recognition.id === `recognition:${candidate.person.id}:roman-catholic`, `${candidate.person.id} Recognition identity is invalid.`);
    assert(Array.isArray(candidate.recognition.ecclesialTitles) && candidate.recognition.ecclesialTitles.length >= 2, `${candidate.person.id} Recognition lacks reviewed ecclesial titles.`);
    assert(/^https:\/\/www\.vaticannews\.va\/en\/saints\//u.test(candidate.recognition.evidenceUrl), `${candidate.person.id} Recognition lacks Vatican News evidence.`);
    assert(candidate.observanceId === `observance:${candidate.person.id}:roman-catholic`, `${candidate.person.id} Observance identity is invalid.`);
    assert(candidate.sanctoraleRuleId === `sanctorale-rule:${candidate.person.id}:general-roman`, `${candidate.person.id} Sanctorale rule identity is invalid.`);
    assert(source.legacyRank === 'memorial' && source.sourceRankCode === 'MO' && source.canonicalRank === 'obligatory-memorial', `${candidate.person.id} reviewed rank refinement changed unexpectedly.`);
    assert(/^2026-\d{2}-\d{2}$/u.test(source.dateISO), `${candidate.person.id} lacks an exact 2026 date.`);
    assert(source.sourceOccurrenceId.startsWith(`snl-pt-${source.dateISO}-`), `${candidate.person.id} source occurrence is not bound to its exact SNL date.`);
    assert(/^[a-f0-9]{64}$/u.test(source.sourceRecordHash), `${candidate.person.id} source row hash is invalid.`);
    assert(/^https:\/\/(?:www\.)?liturgia\.pt\/liturgiadiaria\/dia\.php\?data=2026-/u.test(source.snlUrl), `${candidate.person.id} lacks Secretariado Nacional de Liturgia evidence.`);
    assert(source.sourceLabelPt.length > 10 && source.observedDesignation.endsWith(' – MO'), `${candidate.person.id} Portugal designation/rank evidence is incomplete.`);

    assert(!seenPersonIds.has(candidate.person.id) && !seenRecognitionIds.has(candidate.recognition.id) && !seenObservanceIds.has(candidate.observanceId) && !seenRuleIds.has(candidate.sanctoraleRuleId), `${candidate.person.id} duplicates an identity inside ${fileName}.`);
    assert(!seenLegacyIds.has(source.canonicalEventId) && !seenSourceIds.has(source.sourceOccurrenceId) && !seenSourceHashes.has(source.sourceRecordHash), `${candidate.person.id} duplicates a legacy/source identity inside ${fileName}.`);
    assert(!globalPackPersonIds.has(candidate.person.id) && !globalPackRecognitionIds.has(candidate.recognition.id) && !globalPackObservanceIds.has(candidate.observanceId) && !globalPackRuleIds.has(candidate.sanctoraleRuleId), `${candidate.person.id} duplicates an identity across Sanctorale review packs.`);
    assert(!globalPackLegacyIds.has(source.canonicalEventId) && !globalPackSourceIds.has(source.sourceOccurrenceId) && !globalPackSourceHashes.has(source.sourceRecordHash), `${candidate.person.id} duplicates a legacy/source identity across Sanctorale review packs.`);

    if (promoted) {
      const mapping = fixedByLegacyId.get(source.canonicalEventId);
      assert(existingPersonIds.has(candidate.person.id), `${candidate.person.id} promotion receipt exists but canonical Person is missing.`);
      assert(existingRecognitionIds.has(candidate.recognition.id), `${candidate.recognition.id} promotion receipt exists but canonical Recognition is missing.`);
      assert(existingObservanceIds.has(candidate.observanceId), `${candidate.observanceId} promotion receipt exists but canonical Observance is missing.`);
      assert(existingRuleIds.has(candidate.sanctoraleRuleId), `${candidate.sanctoraleRuleId} promotion receipt exists but Sanctorale rule is missing.`);
      assert(existingBridgeIds.has(source.canonicalEventId), `${source.canonicalEventId} promotion receipt exists but compatibility bridge is missing.`);
      assert(existingOccurrenceIds.has(proposedOccurrenceId), `${proposedOccurrenceId} promotion receipt exists but canonical Occurrence is missing.`);
      assert(mapping?.sourceOccurrenceId === source.sourceOccurrenceId && mapping?.sourceRecordHash === source.sourceRecordHash && mapping?.expectedDateISO === source.dateISO, `${candidate.person.id} promoted fixed source binding differs from the reviewed pack.`);
      assert(receipt.promotedPersonIds.includes(candidate.person.id), `${receiptFile} does not enumerate promoted Person ${candidate.person.id}.`);
    } else {
      assert(!existingPersonIds.has(candidate.person.id), `${candidate.person.id} exists canonically before a promotion receipt.`);
      assert(!existingRecognitionIds.has(candidate.recognition.id), `${candidate.recognition.id} exists canonically before a promotion receipt.`);
      assert(!existingObservanceIds.has(candidate.observanceId), `${candidate.observanceId} exists canonically before a promotion receipt.`);
      assert(!existingRuleIds.has(candidate.sanctoraleRuleId), `${candidate.sanctoraleRuleId} exists canonically before a promotion receipt.`);
      assert(!existingBridgeIds.has(source.canonicalEventId), `${source.canonicalEventId} has a canonical bridge before a promotion receipt.`);
      assert(!existingOccurrenceIds.has(proposedOccurrenceId), `${proposedOccurrenceId} exists canonically before a promotion receipt.`);
      assert(!fixedBySourceId.has(source.sourceOccurrenceId) && !fixedBySourceHash.has(source.sourceRecordHash), `${candidate.person.id} reuses an already-covered fixed Sanctorale source row.`);
    }

    seenPersonIds.add(candidate.person.id);
    seenRecognitionIds.add(candidate.recognition.id);
    seenObservanceIds.add(candidate.observanceId);
    seenRuleIds.add(candidate.sanctoraleRuleId);
    seenLegacyIds.add(source.canonicalEventId);
    seenSourceIds.add(source.sourceOccurrenceId);
    seenSourceHashes.add(source.sourceRecordHash);
    globalPackPersonIds.add(candidate.person.id);
    globalPackRecognitionIds.add(candidate.recognition.id);
    globalPackObservanceIds.add(candidate.observanceId);
    globalPackRuleIds.add(candidate.sanctoraleRuleId);
    globalPackLegacyIds.add(source.canonicalEventId);
    globalPackSourceIds.add(source.sourceOccurrenceId);
    globalPackSourceHashes.add(source.sourceRecordHash);
  }
}

assert(globalPackPersonIds.size === candidateCount && globalPackLegacyIds.size === candidateCount && globalPackSourceIds.size === candidateCount && globalPackSourceHashes.size === candidateCount, 'Cross-pack Sanctorale review uniqueness gate failed.');
console.log(`Portugal v2 Sanctorale review packs passed: ${packFiles.length} pack(s), ${candidateCount} reviewed candidate(s), ${promotedPackCount} promoted pack(s); all authority-bound and publication-safe.`);

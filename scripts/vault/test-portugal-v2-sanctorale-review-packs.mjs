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
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-3.json', '3a125eb283da6ca7be7b699109257887361f516f060e44ee5f8f98b97e90e9dc'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-4.json', 'cccb4c22979975a05fad2457f0d16ed82ef77765e6bdb92bcfc8c80b488817b9'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-5.json', '34a036067ec2311ea1a2aa842f65da557ab0d8fb9d5ce71e0cbc15c733177a26'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-6.json', 'f3f89c6a5f9f70ec97b7613f5874bb3703b53ae7ae77017f49f7e287fd001699'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-7.json', 'd202a84a23baaaf98f81a4e600cbb7880d146b26dc7a234886543115cb33d2fa'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-8.json', '529efbf1d0c84bf6d43ea5b7e4a2aee354e1614e396a70becdfdb8a024f6b9d7'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-9.json', '7af9e680eee683ef89129c227da0a2f0dfd98a5491eabda51601c1ec95f5bb52'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-10.json', '07f0008b0a8b273d2a287b608bbf89f6f7fac0a8db9c096e23896bdb8d985a90'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-11.json', '48081e95d5d1e6c728741688d44889c7a29d39eeedfb4b51db5d4aace4df6d04'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-12.json', '744cdc97923d7ff5a5a6efe2121610639f8f49eec6ee33b07b0059f12a9a3e6d'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-13.json', '83f0dac3ab362ba6a75997c9c0705ebca2bf281cf8eda0e1c83c0ef22a636d93'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-14.json', 'f58959a164f60ec91c15d455e41fb082464935514d6d694368f5c4af4b06e412'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-15.json', 'f613a70489f4e145c687ab79d71cf9b51ae9a6aa6eab7281728013912f66d0af'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-16.json', 'c09fec9b89927b6b640ebab540fcfa80543c5660e49dc43891a71c219e25b5fd'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-17.json', 'a0bb30f211716adebf34291153ad7a84156047794884efe34409193d70fb8f17'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-18.json', '8c19cab7fbab2da8cc83f94b06c8ea357982736c8bc310eca199a2ac71918fda'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-19.json', '7c7af2cb7ab9cfac086869dfc6c43496130d6a98a0d409e27a2940689d241158'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-20.json', 'ee256b35ed2fb388a9b606d75d17ea51a69a7c01e3fb2782718a7e01dc0fc127'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-21.json', '0b440d6cdf85da74bd55ebed54952330e97d08096efa1f12bd6e63422d469f4e']
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

const rankProfiles = {
  MO: { legacyRank: 'memorial', canonicalRank: 'obligatory-memorial' },
  MF: { legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial' }
};

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
    const reviewedPersonIds = pack.candidates.flatMap((candidate) => (candidate.persons ?? [candidate.person]).map((person) => person.id));
    assert(Array.isArray(receipt.promotedPersonIds) && receipt.promotedPersonIds.length === reviewedPersonIds.length, `${receiptFile} promoted Person count differs from its review pack.`);
    assert(reviewedPersonIds.every((personId) => receipt.promotedPersonIds.includes(personId)), `${receiptFile} does not enumerate every reviewed Person.`);
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
    const rankProfile = rankProfiles[source.sourceRankCode];
    const candidatePeople = candidate.persons ?? [candidate.person];
    const candidateRecognitions = candidate.recognitions ?? [candidate.recognition];
    const occurrenceKey = candidate.occurrenceKey ?? candidate.person.id;
    const proposedOccurrenceId = `occurrence:${source.dateISO}:${occurrenceKey}:roman-catholic:pt`;
    const collective = candidatePeople.length > 1;

    assert(candidatePeople.length === candidateRecognitions.length && candidatePeople.length > 0, `${occurrenceKey} Person/Recognition cardinality differs.`);
    for (const person of candidatePeople) {
      const recognition = candidateRecognitions.find((item) => item.personId === person.id) ?? (candidatePeople.length === 1 ? candidateRecognitions[0] : null);
      assert(person.primaryObservanceId === source.canonicalEventId && person.category === 'saint', `${person.id} must remain explicitly bridged to its approved legacy event.`);
      assert(['en', 'pt', 'es', 'it'].every((locale) => typeof person.names?.[locale] === 'string' && person.names[locale].trim().length > 0), `${person.id} lacks required canonical names.`);
      assert(recognition?.id === `recognition:${person.id}:roman-catholic`, `${person.id} Recognition identity is invalid.`);
      assert(Array.isArray(recognition.ecclesialTitles) && recognition.ecclesialTitles.length >= 2, `${person.id} Recognition lacks reviewed ecclesial titles.`);
      assert(/^https:\/\/(?:www\.)?(?:vaticannews\.va\/en\/saints\/|vatican\.va\/news_services\/liturgy\/saints\/|liturgia\.pt\/liturgiadiaria\/)/u.test(recognition.evidenceUrl), `${person.id} Recognition lacks competent official Catholic evidence.`);
      assert(!seenPersonIds.has(person.id) && !seenRecognitionIds.has(recognition.id), `${person.id} duplicates an identity inside ${fileName}.`);
      assert(!globalPackPersonIds.has(person.id) && !globalPackRecognitionIds.has(recognition.id), `${person.id} duplicates an identity across Sanctorale review packs.`);
    }
    assert(candidate.observanceId === `observance:${occurrenceKey}:roman-catholic`, `${occurrenceKey} Observance identity is invalid.`);
    assert(candidate.sanctoraleRuleId === `sanctorale-rule:${occurrenceKey}:general-roman`, `${occurrenceKey} Sanctorale rule identity is invalid.`);
    assert((collective ? candidate.observanceType === 'multi-person-commemoration' : !candidate.observanceType || candidate.observanceType === 'person-commemoration'), `${occurrenceKey} Observance type does not match its Person subjects.`);
    assert(rankProfile && source.legacyRank === rankProfile.legacyRank && source.canonicalRank === rankProfile.canonicalRank, `${occurrenceKey} reviewed rank refinement changed unexpectedly.`);
    assert(/^2026-\d{2}-\d{2}$/u.test(source.dateISO), `${occurrenceKey} lacks an exact 2026 date.`);
    assert(source.sourceOccurrenceId.startsWith(`snl-pt-${source.dateISO}-`), `${occurrenceKey} source occurrence is not bound to its exact SNL date.`);
    assert(/^[a-f0-9]{64}$/u.test(source.sourceRecordHash), `${occurrenceKey} source row hash is invalid.`);
    assert(/^https:\/\/(?:www\.)?liturgia\.pt\/liturgiadiaria\/dia\.php\?data=2026-/u.test(source.snlUrl), `${occurrenceKey} lacks Secretariado Nacional de Liturgia evidence.`);
    assert(source.sourceLabelPt.trim().length >= 5 && source.observedDesignation === `${source.sourceLabelPt} – ${source.sourceRankCode}`, `${occurrenceKey} Portugal designation/rank evidence is incomplete.`);

    assert(!seenObservanceIds.has(candidate.observanceId) && !seenRuleIds.has(candidate.sanctoraleRuleId), `${occurrenceKey} duplicates an Observance/rule identity inside ${fileName}.`);
    assert(!seenLegacyIds.has(source.canonicalEventId) && !seenSourceIds.has(source.sourceOccurrenceId) && !seenSourceHashes.has(source.sourceRecordHash), `${occurrenceKey} duplicates a legacy/source identity inside ${fileName}.`);
    assert(!globalPackObservanceIds.has(candidate.observanceId) && !globalPackRuleIds.has(candidate.sanctoraleRuleId), `${occurrenceKey} duplicates an Observance/rule identity across Sanctorale review packs.`);
    assert(!globalPackLegacyIds.has(source.canonicalEventId) && !globalPackSourceIds.has(source.sourceOccurrenceId) && !globalPackSourceHashes.has(source.sourceRecordHash), `${occurrenceKey} duplicates a legacy/source identity across Sanctorale review packs.`);

    if (promoted) {
      const mapping = fixedByLegacyId.get(source.canonicalEventId);
      for (const person of candidatePeople) assert(existingPersonIds.has(person.id), `${person.id} promotion receipt exists but canonical Person is missing.`);
      for (const recognition of candidateRecognitions) assert(existingRecognitionIds.has(recognition.id), `${recognition.id} promotion receipt exists but canonical Recognition is missing.`);
      assert(existingObservanceIds.has(candidate.observanceId), `${candidate.observanceId} promotion receipt exists but canonical Observance is missing.`);
      assert(existingRuleIds.has(candidate.sanctoraleRuleId), `${candidate.sanctoraleRuleId} promotion receipt exists but Sanctorale rule is missing.`);
      assert(existingBridgeIds.has(source.canonicalEventId), `${source.canonicalEventId} promotion receipt exists but compatibility bridge is missing.`);
      assert(existingOccurrenceIds.has(proposedOccurrenceId), `${proposedOccurrenceId} promotion receipt exists but canonical Occurrence is missing.`);
      assert(mapping?.sourceOccurrenceId === source.sourceOccurrenceId && mapping?.sourceRecordHash === source.sourceRecordHash && mapping?.expectedDateISO === source.dateISO, `${occurrenceKey} promoted fixed source binding differs from the reviewed pack.`);
      for (const person of candidatePeople) assert(receipt.promotedPersonIds.includes(person.id), `${receiptFile} does not enumerate promoted Person ${person.id}.`);
    } else {
      for (const person of candidatePeople) assert(!existingPersonIds.has(person.id), `${person.id} exists canonically before a promotion receipt.`);
      for (const recognition of candidateRecognitions) assert(!existingRecognitionIds.has(recognition.id), `${recognition.id} exists canonically before a promotion receipt.`);
      assert(!existingObservanceIds.has(candidate.observanceId), `${candidate.observanceId} exists canonically before a promotion receipt.`);
      assert(!existingRuleIds.has(candidate.sanctoraleRuleId), `${candidate.sanctoraleRuleId} exists canonically before a promotion receipt.`);
      assert(!existingBridgeIds.has(source.canonicalEventId), `${source.canonicalEventId} has a canonical bridge before a promotion receipt.`);
      assert(!existingOccurrenceIds.has(proposedOccurrenceId), `${proposedOccurrenceId} exists canonically before a promotion receipt.`);
      assert(!fixedBySourceId.has(source.sourceOccurrenceId) && !fixedBySourceHash.has(source.sourceRecordHash), `${occurrenceKey} reuses an already-covered fixed Sanctorale source row.`);
    }

    for (const person of candidatePeople) seenPersonIds.add(person.id);
    for (const recognition of candidateRecognitions) seenRecognitionIds.add(recognition.id);
    seenObservanceIds.add(candidate.observanceId);
    seenRuleIds.add(candidate.sanctoraleRuleId);
    seenLegacyIds.add(source.canonicalEventId);
    seenSourceIds.add(source.sourceOccurrenceId);
    seenSourceHashes.add(source.sourceRecordHash);
    for (const person of candidatePeople) globalPackPersonIds.add(person.id);
    for (const recognition of candidateRecognitions) globalPackRecognitionIds.add(recognition.id);
    globalPackObservanceIds.add(candidate.observanceId);
    globalPackRuleIds.add(candidate.sanctoraleRuleId);
    globalPackLegacyIds.add(source.canonicalEventId);
    globalPackSourceIds.add(source.sourceOccurrenceId);
    globalPackSourceHashes.add(source.sourceRecordHash);
  }
}

assert(globalPackPersonIds.size >= candidateCount && globalPackRecognitionIds.size === globalPackPersonIds.size && globalPackLegacyIds.size === candidateCount && globalPackSourceIds.size === candidateCount && globalPackSourceHashes.size === candidateCount, 'Cross-pack Sanctorale review uniqueness gate failed.');
console.log(`Portugal v2 Sanctorale review packs passed: ${packFiles.length} pack(s), ${candidateCount} reviewed candidate(s), ${promotedPackCount} promoted pack(s); all authority-bound and publication-safe.`);

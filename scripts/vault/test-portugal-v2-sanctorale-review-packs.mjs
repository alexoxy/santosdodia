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
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-21.json', '0b440d6cdf85da74bd55ebed54952330e97d08096efa1f12bd6e63422d469f4e'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-22.json', '41d15abc19c8899398838a59a15fed36016541b448aea55a2dd79cab89d38e87'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-23.json', '4d2d7e8e36179974b139f5d5be336b601b31f5a3a77512cf7031e9c8534ba9f7'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-24.json', '68a2322a1e1ed9a9f27e319edd3501304597847adaf0ffe4ae8aae06a5ba33c7'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-25.json', 'e9471beb6a129effeb29447055b4234ce9925573e0c5f233cdad8715790127f2'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-26.json', '74f27c141117f8bde14b8ebdefe8c0db27bcd0039612aacdc3bd6a9101e8728f'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-27.json', '21c8f47963106fccfac81f7acf332ed4db84ebb47475970695c994a5b3d54abc'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-28.json', '4a921686f82106386f4152eedba1348c6f34c7acf24d7785eed2727bf79dc037'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-29.json', '6c405243024be6eed4effb828d760d304721bfabed1175ed040987fc74b60d67'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-30.json', 'c2ea16b11385cf4759f585aca6932c84a7aaf92ea7bac4bdac45bf20b216bcd4'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-31.json', '5c61a16f7f130713bd9c6cf357ecd76ad8113be803b14e083cc662f99a52579d'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-32.json', 'b4a67f5a73f02f60c0b53d80e0b536f2461e0707cc47ca11c8f24d796723509f'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-33.json', 'fb5badce4be9169c89886941d6c688188c6cac79f8a816c8f4fdfd82bb495660'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-34.json', '368a10fb2855f7dd1022d98372b75b0ecc9a6789f88162c10cc79b0c1de6e8fe'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-35.json', 'a07676b8fed37cf9a6038c4bc2d4ca3ff2eee6c2a2535f4b3f9682fa464f5116'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-36.json', 'e27a5708afd670e4d1ab0ac3efc72ec93ce7141bd4fc47f998975535ffa6c440'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-37.json', 'df032b8eff404e1bdd00198b17e6ebd56c15671a223217f5254b8d9ec160e4be'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-38.json', '10cd4f1d1176bf6b2f40b598fa1fba95598ab821a95b935474dc607603f76576'],
  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-39.json', '145105cc66cdd6c58de66d2697a8c289988dcdc624d0781d6476930b15071d7f']
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
  MF: { legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial' },
  FESTA: { legacyRank: 'feast', canonicalRank: 'feast' }
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
    const reviewedPersonIds = pack.candidates.flatMap((candidate) => (candidate.persons ?? (candidate.person ? [candidate.person] : [])).map((person) => person.id));
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
    const candidatePeople = candidate.persons ?? (candidate.person ? [candidate.person] : []);
    const candidateRecognitions = candidate.recognitions ?? (candidate.recognition ? [candidate.recognition] : []);
    const reusedSubjects = candidate.reusedSubjects ?? [];
    const occurrenceKey = candidate.occurrenceKey ?? candidate.person?.id;
    const proposedOccurrenceId = `occurrence:${source.dateISO}:${occurrenceKey}:roman-catholic:pt`;
    const collective = candidatePeople.length > 1;
    const subjectlessCollective = candidate.subjectlessCollective === true;
    const subjectlessNonHuman = candidate.subjectlessNonHuman === true;
    const namedPersonWithCompanions = candidate.namedPersonWithCompanions === true;
    const subjectless = subjectlessCollective || subjectlessNonHuman;

    assert(candidatePeople.length === candidateRecognitions.length, `${occurrenceKey} Person/Recognition cardinality differs.`);
    assert(!(subjectlessCollective && subjectlessNonHuman), `${occurrenceKey} cannot be both collective-human and non-human subjectless.`);
    assert(subjectless ? candidatePeople.length === 0 && reusedSubjects.length === 0 : candidatePeople.length + reusedSubjects.length > 0, subjectless
      ? `${occurrenceKey} subjectless Observance must not create Person/Recognition records.`
      : `${occurrenceKey} requires at least one Person/Recognition pair.`);
    for (const subject of reusedSubjects) {
      assert(existingPersonIds.has(subject.personId) && existingRecognitionIds.has(subject.recognitionId), `${occurrenceKey} reuses a missing canonical Person/Recognition pair.`);
      assert(subject.recognitionId === `recognition:${subject.personId}:roman-catholic`, `${occurrenceKey} reused Recognition identity is invalid.`);
      assert(Array.isArray(candidate.identityReuseEvidence) && candidate.identityReuseEvidence.length >= 2, `${occurrenceKey} requires competent evidence before canonical identity reuse.`);
      assert(candidate.identityReuseEvidence.some((item) => /^https:\/\/(?:www\.)?vatican\.va\//u.test(item.url) && item.claimTypes?.includes('same-person-identity')), `${occurrenceKey} lacks direct Holy See evidence for same-person reuse.`);
      assert(candidate.identityReuseEvidence.some((item) => /^https:\/\/(?:www\.)?liturgia\.pt\//u.test(item.url) && item.claimTypes?.includes('observance-attestation')), `${occurrenceKey} lacks exact Portugal observance evidence for identity reuse.`);
    }
    if (subjectlessCollective) {
      assert(candidate.observanceType === 'collective-commemoration', `${occurrenceKey} subjectless collective must use the dedicated Observance type.`);
      assert(candidate.anonymousPersonsCreated === false, `${occurrenceKey} must explicitly prohibit anonymous Person creation.`);
      assert(['en', 'pt'].every((locale) => typeof candidate.collectiveLabels?.[locale] === 'string' && candidate.collectiveLabels[locale].trim().length > 0), `${occurrenceKey} lacks reviewed collective labels.`);
      assert(Array.isArray(candidate.collectiveEvidence) && candidate.collectiveEvidence.length >= 2, `${occurrenceKey} requires independent competent-authority collective evidence.`);
      assert(candidate.collectiveEvidence.every((item) => item.claimTypes?.includes('collective-commemoration') && item.claimTypes?.includes('observance-attestation')), `${occurrenceKey} evidence does not attest the collective Observance.`);
      assert(candidate.collectiveEvidence.some((item) => /^https:\/\/(?:www\.)?vatican\.va\//u.test(item.url)), `${occurrenceKey} lacks direct Holy See evidence.`);
    }
    if (subjectlessNonHuman) {
      assert(candidate.observanceType === 'angelic-commemoration', `${occurrenceKey} non-human Observance must use the dedicated angelic type.`);
      assert(candidate.personRecordsCreated === false, `${occurrenceKey} must explicitly prohibit Person/Recognition coercion.`);
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(candidate.subjectlessKey ?? ''), `${occurrenceKey} lacks a stable subjectlessKey.`);
      assert(candidate.nonHumanKind === 'archangels', `${occurrenceKey} non-human kind changed unexpectedly.`);
      assert(['en', 'pt'].every((locale) => typeof candidate.nonHumanLabels?.[locale] === 'string' && candidate.nonHumanLabels[locale].trim().length > 0), `${occurrenceKey} lacks reviewed non-human labels.`);
      assert(Array.isArray(candidate.nonHumanEvidence) && candidate.nonHumanEvidence.length >= 2, `${occurrenceKey} requires competent-authority non-human evidence.`);
      assert(candidate.nonHumanEvidence.every((item) => item.claimTypes?.includes('non-human-subjects') && item.claimTypes?.includes('observance-attestation')), `${occurrenceKey} evidence does not attest the non-human Observance.`);
      assert(candidate.nonHumanEvidence.some((item) => /^https:\/\/(?:www\.)?vatican\.va\//u.test(item.url)), `${occurrenceKey} lacks direct Holy See non-human evidence.`);
    }
    if (namedPersonWithCompanions) {
      assert(candidate.observanceType === 'named-person-with-companions-commemoration', `${occurrenceKey} bounded companions must use the dedicated Observance type.`);
      assert(candidatePeople.length === 1 && reusedSubjects.length === 0, `${occurrenceKey} must materialize exactly one named lead Person.`);
      assert(candidate.companionGroup?.attestedCount === 119, `${occurrenceKey} must preserve the officially attested 119 companions.`);
      assert(candidate.companionGroup?.enumerationStatus === 'officially-bounded-not-materialized' && candidate.companionGroup?.anonymousPersonsCreated === false, `${occurrenceKey} must not fabricate anonymous companion Persons.`);
      assert(Array.isArray(candidate.companionGroup?.evidence) && candidate.companionGroup.evidence.length >= 2, `${occurrenceKey} requires competent official evidence for the bounded companion group.`);
      assert(candidate.companionGroup.evidence.every((item) => item.claimTypes?.includes('bounded-companion-group')), `${occurrenceKey} companion evidence does not attest the bounded group.`);
    }
    for (const person of candidatePeople) {
      const recognition = candidateRecognitions.find((item) => item.personId === person.id) ?? (candidatePeople.length === 1 ? candidateRecognitions[0] : null);
      assert(person.primaryObservanceId === source.canonicalEventId && person.category === 'saint', `${person.id} must remain explicitly bridged to its approved legacy event.`);
      assert(['en', 'pt', 'es', 'it'].every((locale) => typeof person.names?.[locale] === 'string' && person.names[locale].trim().length > 0), `${person.id} lacks required canonical names.`);
      assert(recognition?.id === `recognition:${person.id}:roman-catholic`, `${person.id} Recognition identity is invalid.`);
      assert(Array.isArray(recognition.ecclesialTitles) && recognition.ecclesialTitles.length >= 2, `${person.id} Recognition lacks reviewed ecclesial titles.`);
      assert(/^https:\/\/(?:www\.)?(?:vaticannews\.va\/en\/saints\/|vatican\.va\/(?:content\/[^/]+\/[^/]+\/audiences\/|news_services\/liturgy\/saints\/|roman_curia\/congregations\/ccdds\/documents\/)|liturgia\.pt\/liturgiadiaria\/)/u.test(recognition.evidenceUrl), `${person.id} Recognition lacks competent official Catholic evidence.`);
      assert(!seenPersonIds.has(person.id) && !seenRecognitionIds.has(recognition.id), `${person.id} duplicates an identity inside ${fileName}.`);
      assert(!globalPackPersonIds.has(person.id) && !globalPackRecognitionIds.has(recognition.id), `${person.id} duplicates an identity across Sanctorale review packs.`);
    }
    assert(candidate.observanceId === `observance:${occurrenceKey}:roman-catholic`, `${occurrenceKey} Observance identity is invalid.`);
    assert(candidate.sanctoraleRuleId === `sanctorale-rule:${occurrenceKey}:general-roman`, `${occurrenceKey} Sanctorale rule identity is invalid.`);
    assert(subjectless || namedPersonWithCompanions || (collective ? candidate.observanceType === 'multi-person-commemoration' : !candidate.observanceType || candidate.observanceType === 'person-commemoration'), `${occurrenceKey} Observance type does not match its subjects.`);
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
      for (const subject of reusedSubjects) assert(receipt.reusedPersonIds?.includes(subject.personId), `${receiptFile} does not enumerate reused Person ${subject.personId}.`);
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

assert(globalPackRecognitionIds.size === globalPackPersonIds.size && globalPackLegacyIds.size === candidateCount && globalPackSourceIds.size === candidateCount && globalPackSourceHashes.size === candidateCount, 'Cross-pack Sanctorale review uniqueness gate failed.');
console.log(`Portugal v2 Sanctorale review packs passed: ${packFiles.length} pack(s), ${candidateCount} reviewed candidate(s), ${promotedPackCount} promoted pack(s); all authority-bound and publication-safe.`);

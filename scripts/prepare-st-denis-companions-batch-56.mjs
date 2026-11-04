import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-04';
const dateISO = '2026-10-09';
const legacyId = 'rc:StDenis';
const sourceOccurrenceId = 'snl-pt-2026-10-09-d03038c144ea382cc2f91bf2';
const sourceRecordHash = '49fef918da166c474008ecd467b603727e7c89ac93c1a5dddbfbada1371d9598';
const sourceLabelPt = 'Santos Dinis, bispo, e companheiros, mártires';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-09';
const martirology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-10-09';
const vaticanNews = 'https://www.vaticannews.va/pt/santo-do-dia/10/09/ss--dinis--bispo--e-companheiros--martires-de-paris.html';
const occurrenceKey = 'denis-rusticus-eleutherius';
const observanceId = `observance:${occurrenceKey}:roman-catholic`;
const ruleId = `sanctorale-rule:${occurrenceKey}:general-roman`;
const occurrenceId = `occurrence:${dateISO}:${occurrenceKey}:roman-catholic:pt`;
const subjects = [
  {
    id: 'denis-paris',
    names: { en: 'Saint Denis of Paris', pt: 'São Dinis de Paris', es: 'San Dionisio de París', it: 'San Dionigi di Parigi' },
    ecclesialTitles: ['bishop', 'martyr', 'first-bishop-of-paris']
  },
  {
    id: 'rusticus-paris',
    names: { en: 'Saint Rusticus of Paris', pt: 'São Rústico de Paris', es: 'San Rústico de París', it: 'San Rustico di Parigi' },
    ecclesialTitles: ['priest', 'martyr', 'companion-of-denis']
  },
  {
    id: 'eleutherius-paris',
    names: { en: 'Saint Eleutherius of Paris', pt: 'Santo Eleutério de Paris', es: 'San Eleuterio de París', it: 'Sant’Eleuterio di Parigi' },
    ecclesialTitles: ['deacon', 'martyr', 'companion-of-denis']
  }
];

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  if (data[key].some(item => item[idKey] === value[idKey])) throw new Error(`${value[idKey]} already exists in ${path}`);
  data[key].push(value);
  write(path, data);
};

for (const subject of subjects) {
  appendUnique('data/canonical-person-anchors.json', 'people', {
    id: subject.id, primaryObservanceId: legacyId, category: 'saint', names: subject.names
  });
  appendUnique('data/canonical-recognition-anchors.json', 'recognitions', {
    id: `recognition:${subject.id}:roman-catholic`, personId: subject.id, churchId: 'church:roman-catholic',
    jurisdictionId: 'global', recognizedAs: 'saint', recognitionBasis: 'official-church-attestation',
    ecclesialTitles: subject.ecclesialTitles, scope: 'church-wide', calendarMembershipImplied: false,
    observanceDateImplied: false,
    evidence: [{
      publisher: 'Secretariado Nacional de Liturgia', url: martirology,
      claimTypes: ['saint-designation', 'identity', ...subject.ecclesialTitles]
    }],
    verifiedAt
  });
}

appendUnique('data/canonical-observance-anchors.json', 'observances', {
  id: observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
  observanceType: 'multi-person-commemoration',
  subjects: subjects.map(subject => ({
    kind: 'person', personId: subject.id, recognitionId: `recognition:${subject.id}:roman-catholic`
  })),
  scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false,
  jurisdictionImplied: false, rankImplied: false, precedenceImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: martirology, claimTypes: ['observance-attestation', 'subject-enumeration', 'denis-rusticus-eleutherius', 'martyrdom-tradition'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['observance-attestation', 'martyrs-of-paris'] }
  ],
  verifiedAt
});
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', {
  id: ruleId, observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 10, day: 9 },
  liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'portugal-inherits-general-calendar'] }],
  verifiedAt
});
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', {
  id: occurrenceId, observanceId, churchId: 'church:roman-catholic', jurisdictionId: 'jurisdiction:roman-catholic:pt',
  calendarSystem: 'gregorian', year: 2026, dateISO, rank: 'optional-memorial', sourceRankCode: 'MF',
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'], observedDesignation: `${sourceLabelPt} – MF` }],
  verifiedAt
});
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', {
  occurrenceId, legacyObservanceId: legacyId, dateISO
}, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push({
  occurrenceId, observanceId, sanctoraleRuleId: ruleId, legacyObservanceId: legacyId,
  expectedDateISO: dateISO, sourceOccurrenceId, sourceRecordHash, legacyRank: 'optional-memorial',
  canonicalRank: 'optional-memorial', sourceRankCode: 'MF', reviewStatus: 'source-bound-exact',
  resolution: 'exact-fixed-date-binding'
});
fixed.fixedMappingCount = 128;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 128;
coverage.coverage.mappedOccurrenceAnchors = 326;
coverage.coverage.remainingLegacyOccurrences = 63;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Denis source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 326;
inventory.coverageAtInventory.remainingOccurrences = 63;
inventory.familyCounts['fixed-person'] = 18;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  occurrenceKey,
  persons: subjects.map(subject => ({ id: subject.id, primaryObservanceId: legacyId, category: 'saint', names: subject.names })),
  recognitions: subjects.map(subject => ({
    id: `recognition:${subject.id}:roman-catholic`, personId: subject.id,
    ecclesialTitles: subject.ecclesialTitles, evidenceUrl: martirology
  })),
  observanceId, observanceType: 'multi-person-commemoration', sanctoraleRuleId: ruleId,
  subjectReview: {
    source: martirology,
    result: 'officially-enumerated-three-person-group',
    subjects: subjects.map(subject => subject.id),
    anonymousPersonsCreated: false,
    roleConflictPolicy: 'SNL Roman Martyrology roles retained; Vatican News wording not used to override them'
  },
  source: {
    canonicalEventId: legacyId, dateISO, sourceOccurrenceId, sourceRecordHash, sourceLabelPt,
    observedDesignation: `${sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial', snlUrl: snl
  }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-56.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-56.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(subject => subject.id),
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 326, requiredForPromotion: 389, remainingLegacyOccurrences: 63 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(subject => subject.id) }, null, 2));

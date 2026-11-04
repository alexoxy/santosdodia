import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-04';
const dateISO = '2026-10-05';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-5';
const identityUrl = 'https://www.vatican.va/content/dam/wss/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20200518_decreto-celebrazione-santafaustina_po.html';
const subject = {
  personId: 'faustina-kowalska',
  legacyId: 'rc:StFaustinaKowalska',
  sourceOccurrenceId: 'snl-pt-2026-10-05-77b84533920b536c8cdc8328',
  sourceRecordHash: 'e77f8fcb38121bec900be25118efdd5d0b33a8019aa500058529ed704a4e4977',
  sourceLabelPt: 'Santa Faustina Kowalska, virgem',
  names: { en: 'Saint Faustina Kowalska', pt: 'Santa Faustina Kowalska', es: 'Santa Faustina Kowalska', it: 'Santa Faustina Kowalska' },
  recognitionId: 'recognition:faustina-kowalska:roman-catholic',
  observanceId: 'observance:faustina-kowalska:roman-catholic',
  ruleId: 'sanctorale-rule:faustina-kowalska:general-roman',
  occurrenceId: 'occurrence:2026-10-05:faustina-kowalska:roman-catholic:pt'
};

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  if (data[key].some(item => item[idKey] === value[idKey])) throw new Error(`${value[idKey]} already exists in ${path}`);
  data[key].push(value);
  write(path, data);
};

appendUnique('data/canonical-person-anchors.json', 'people', {
  id: subject.personId, primaryObservanceId: subject.legacyId, category: 'saint', names: subject.names
});
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', {
  id: subject.recognitionId, personId: subject.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global',
  recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: ['virgin', 'religious'],
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [{ publisher: 'Holy See', url: identityUrl, claimTypes: ['identity', 'virgin', 'religious', 'canonization', 'general-roman-calendar', 'liturgical-date'] }],
  verifiedAt
});
appendUnique('data/canonical-observance-anchors.json', 'observances', {
  id: subject.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
  observanceType: 'person-commemoration', subjects: [{ kind: 'person', personId: subject.personId, recognitionId: subject.recognitionId }],
  scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false, jurisdictionImplied: false,
  rankImplied: false, precedenceImplied: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'proper-calendar-contexts-kept-independent'] }],
  verifiedAt
});
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', {
  id: subject.ruleId, observanceId: subject.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 10, day: 5 },
  liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'portugal-inherits-general-calendar'] }],
  verifiedAt
});
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', {
  id: subject.occurrenceId, observanceId: subject.observanceId, churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt', calendarSystem: 'gregorian', year: 2026, dateISO,
  rank: 'optional-memorial', sourceRankCode: 'MF',
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'], observedDesignation: `${subject.sourceLabelPt} – MF` }],
  verifiedAt
});
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', {
  occurrenceId: subject.occurrenceId, legacyObservanceId: subject.legacyId, dateISO
}, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push({
  occurrenceId: subject.occurrenceId, observanceId: subject.observanceId, sanctoraleRuleId: subject.ruleId,
  legacyObservanceId: subject.legacyId, expectedDateISO: dateISO, sourceOccurrenceId: subject.sourceOccurrenceId,
  sourceRecordHash: subject.sourceRecordHash, legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial',
  sourceRankCode: 'MF', reviewStatus: 'source-bound-exact', resolution: 'exact-fixed-date-binding'
});
fixed.fixedMappingCount = 126;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 126;
coverage.coverage.mappedOccurrenceAnchors = 324;
coverage.coverage.remainingLegacyOccurrences = 65;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== subject.sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Wenceslaus source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 324;
inventory.coverageAtInventory.remainingOccurrences = 65;
inventory.familyCounts['fixed-person'] = 20;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person: { id: subject.personId, primaryObservanceId: subject.legacyId, category: 'saint', names: subject.names },
  recognition: { id: subject.recognitionId, personId: subject.personId, ecclesialTitles: ['virgin', 'religious'], evidenceUrl: identityUrl },
  observanceId: subject.observanceId, sanctoraleRuleId: subject.ruleId,
  contextualBoundary: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', properCalendarGradesPublished: false },
  source: { canonicalEventId: subject.legacyId, dateISO, sourceOccurrenceId: subject.sourceOccurrenceId,
    sourceRecordHash: subject.sourceRecordHash, sourceLabelPt: subject.sourceLabelPt,
    observedDesignation: `${subject.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial', snlUrl: snl }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-54.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-54.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: [subject.personId], promotedObservanceIds: [subject.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 324, requiredForPromotion: 389, remainingLegacyOccurrences: 65 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [subject.personId] }, null, 2));

import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-04';
const dateISO = '2026-10-06';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-6';
const identityUrl = 'https://www.vatican.va/content/john-paul-ii/pt/messages/pont_messages/2001/documents/hf_jp-ii_mes_20010515_san-bruno.html';
const subject = {
  personId: 'bruno-carthusian',
  legacyId: 'rc:StBruno',
  sourceOccurrenceId: 'snl-pt-2026-10-06-08e0a06f050cd03a37142399',
  sourceRecordHash: 'f708b9b92c8780bb90325abcca8d0a2aea297eef28bbd7839c1d5a0a9dde8812',
  sourceLabelPt: 'S. Bruno, presbítero',
  names: { en: 'Saint Bruno of Cologne', pt: 'São Bruno', es: 'San Bruno de Colonia', it: 'San Bruno di Colonia' },
  recognitionId: 'recognition:bruno-carthusian:roman-catholic',
  observanceId: 'observance:bruno-carthusian:roman-catholic',
  ruleId: 'sanctorale-rule:bruno-carthusian:general-roman',
  occurrenceId: 'occurrence:2026-10-06:bruno-carthusian:roman-catholic:pt'
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
  recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: ['priest', 'hermit', 'founder'],
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [{ publisher: 'Holy See', url: identityUrl, claimTypes: ['identity', 'priest', 'hermit', 'founder', 'carthusian-family', 'death-date'] }],
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
  id: subject.ruleId, observanceId: subject.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 10, day: 6 },
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
fixed.fixedMappingCount = 127;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 127;
coverage.coverage.mappedOccurrenceAnchors = 325;
coverage.coverage.remainingLegacyOccurrences = 64;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== subject.sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Bruno source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 325;
inventory.coverageAtInventory.remainingOccurrences = 64;
inventory.familyCounts['fixed-person'] = 19;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person: { id: subject.personId, primaryObservanceId: subject.legacyId, category: 'saint', names: subject.names },
  recognition: { id: subject.recognitionId, personId: subject.personId, ecclesialTitles: ['priest', 'hermit', 'founder'], evidenceUrl: identityUrl },
  observanceId: subject.observanceId, sanctoraleRuleId: subject.ruleId,
  contextualBoundary: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', properCalendarGradesPublished: false },
  source: { canonicalEventId: subject.legacyId, dateISO, sourceOccurrenceId: subject.sourceOccurrenceId,
    sourceRecordHash: subject.sourceRecordHash, sourceLabelPt: subject.sourceLabelPt,
    observedDesignation: `${subject.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial', snlUrl: snl }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-55.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-55.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: [subject.personId], promotedObservanceIds: [subject.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 325, requiredForPromotion: 389, remainingLegacyOccurrences: 64 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [subject.personId] }, null, 2));

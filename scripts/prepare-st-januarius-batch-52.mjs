import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-04';
const dateISO = '2026-09-19';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-9-19';
const identityUrl = 'https://www.vaticannews.va/en/saints/09/19/st--januarius--bishop-of--benevento-and-martyr.html';
const subject = {
  personId: 'januarius-benevento',
  legacyId: 'rc:StJanuarius',
  sourceOccurrenceId: 'snl-pt-2026-09-19-2ceac0782836862e97af2eba',
  sourceRecordHash: '116df1cbb60e094c1b5891fa2582da12a2aba2ddd7b0e0c0796c6028cd5b528f',
  sourceLabelPt: 'S. Januário, bispo e mártir',
  names: { en: 'Saint Januarius', pt: 'São Januário', es: 'San Jenaro', it: 'San Gennaro' },
  recognitionId: 'recognition:januarius-benevento:roman-catholic',
  observanceId: 'observance:januarius-benevento:roman-catholic',
  ruleId: 'sanctorale-rule:januarius-benevento:general-roman',
  occurrenceId: 'occurrence:2026-09-19:januarius-benevento:roman-catholic:pt'
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
  recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: ['bishop', 'martyr'],
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [{ publisher: 'Vatican News', url: identityUrl, claimTypes: ['identity', 'bishop-of-benevento', 'martyr', 'death-period', 'liturgical-date'] }],
  verifiedAt
});
appendUnique('data/canonical-observance-anchors.json', 'observances', {
  id: subject.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
  observanceType: 'person-commemoration', subjects: [{ kind: 'person', personId: subject.personId, recognitionId: subject.recognitionId }],
  scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false, jurisdictionImplied: false,
  rankImplied: false, precedenceImplied: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial'] }],
  verifiedAt
});
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', {
  id: subject.ruleId, observanceId: subject.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 9, day: 19 },
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
fixed.fixedMappingCount = 115;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 124;
coverage.coverage.mappedOccurrenceAnchors = 322;
coverage.coverage.remainingLegacyOccurrences = 67;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== subject.sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Januarius source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 322;
inventory.coverageAtInventory.remainingOccurrences = 67;
inventory.familyCounts['fixed-person'] = 22;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person: { id: subject.personId, primaryObservanceId: subject.legacyId, category: 'saint', names: subject.names },
  recognition: { id: subject.recognitionId, personId: subject.personId, ecclesialTitles: ['bishop', 'martyr'], evidenceUrl: identityUrl },
  observanceId: subject.observanceId, sanctoraleRuleId: subject.ruleId,
  contextualBoundary: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', naplesPatronagePublished: false },
  source: { canonicalEventId: subject.legacyId, dateISO, sourceOccurrenceId: subject.sourceOccurrenceId,
    sourceRecordHash: subject.sourceRecordHash, sourceLabelPt: subject.sourceLabelPt,
    observedDesignation: `${subject.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial', snlUrl: snl }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-52.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-52.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: [subject.personId], promotedObservanceIds: [subject.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 322, requiredForPromotion: 389, remainingLegacyOccurrences: 67 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

const replace = (path, replacements) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!text.includes(from)) throw new Error(`Missing expected text in ${path}: ${from}`);
    text = text.replace(from, to);
  }
  fs.writeFileSync(path, text);
};
replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['fixedSanctorale === 123 && ledger.counts.fixedSanctoraleDays === 114', 'fixedSanctorale === 124 && ledger.counts.fixedSanctoraleDays === 115'],
  ['preserve 123 exact Sanctorale occurrences across 114 civil days', 'preserve 124 exact Sanctorale occurrences across 115 civil days'],
  ['sourceBound === 308 && ledger.counts.sourceBoundOccurrences === 321', 'sourceBound === 309 && ledger.counts.sourceBoundOccurrences === 322'],
  ['distinguish 308 source-bound days from 321 source-bound canonical occurrences', 'distinguish 309 source-bound days from 322 source-bound canonical occurrences'],
  ["const september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');", "const september19 = ledger.entries.find(item => item.dateISO === '2026-09-19');\nassert(september19?.classification === 'fixed-sanctorale' && september19.canonicalObservanceId === 'observance:januarius-benevento:roman-catholic' && september19.sourceBinding?.legacyObservanceId === 'rc:StJanuarius', 'Saint Januarius must retain the exact optional-memorial source binding on 19 September.');\nconst september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');"],
  ['+ 123 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 321 source-bound occurrences across 308 days', '+ 124 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 322 source-bound occurrences across 309 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 123', 'candidates.length === 124'], ['one hundred and twenty-three reviewed rules', 'one hundred and twenty-four reviewed rules'],
  ["['observance:pius-pietrelcina:roman-catholic', ['2026-09-23', 'obligatory-memorial', 10, 'general-roman']],", "['observance:januarius-benevento:roman-catholic', ['2026-09-19', 'optional-memorial', 12, 'general-roman']],\n    ['observance:pius-pietrelcina:roman-catholic', ['2026-09-23', 'obligatory-memorial', 10, 'general-roman']],"],
  ['occurrences.occurrences.length === 123', 'occurrences.occurrences.length === 124'],
  ['Roman Sanctorale passed: 123 authority-isolated', 'Roman Sanctorale passed: 124 authority-isolated'],
  ['including Saints Hildegard', 'including Saint Januarius on 19 September; Saints Hildegard']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [['peopleCount === 204', 'peopleCount === 205'], ["'hildegard-bingen', 'robert-bellarmine',", "'hildegard-bingen', 'robert-bellarmine', 'januarius-benevento',"]]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 202', 'recognitionCount === 203'], ['personCoverageCount === 201', 'personCoverageCount === 202'],
  ["'recognition:robert-bellarmine:roman-catholic',", "'recognition:robert-bellarmine:roman-catholic',\n  'recognition:januarius-benevento:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 202', 'recognitionCount, 203'], ['personCoverageCount, 201', 'personCoverageCount, 202']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 125', 'observanceCount === 126'], ['personCoverageCount === 201', 'personCoverageCount === 202'],
  ["const hildegard = first.observances.find", "const januarius = first.observances.find((item) => item.observanceId === 'observance:januarius-benevento:roman-catholic');\nassert(januarius?.subjects?.[0]?.personId === 'januarius-benevento', 'Saint Januarius must remain a distinct person-scoped Observance.');\n\nconst hildegard = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 123', 'occurrenceCount === 124'], ['legacyBridgeCount === 123', 'legacyBridgeCount === 124'],
  ["['observance:robert-bellarmine:roman-catholic', ['2026-09-17', 'optional-memorial', 'MF', 'rc:StRobertBellarmine']],", "['observance:robert-bellarmine:roman-catholic', ['2026-09-17', 'optional-memorial', 'MF', 'rc:StRobertBellarmine']],\n  ['observance:januarius-benevento:roman-catholic', ['2026-09-19', 'optional-memorial', 'MF', 'rc:StJanuarius']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 123 && explicitOccurrences.length', 'length === 124 && explicitOccurrences.length'], ['one hundred and twenty-three', 'one hundred and twenty-four'],
  ['length === 123 && explicitBridges.length', 'length === 124 && explicitBridges.length'], ['the one hundred and twenty-three', 'the one hundred and twenty-four'],
  ['mappings.length === 123', 'mappings.length === 124'],
  ['explicitOccurrenceById.size === 123 && explicitBridgeByOccurrence.size === 123 && fixedMappingByOccurrence.size === 123', 'explicitOccurrenceById.size === 124 && explicitBridgeByOccurrence.size === 124 && fixedMappingByOccurrence.size === 124'],
  ['coveredSourceIds.size === 310 && coveredSourceHashes.size === 310 && coveredOccurrenceIds.size === 310', 'coveredSourceIds.size === 311 && coveredSourceHashes.size === 311 && coveredOccurrenceIds.size === 311'],
  ['totalMapped === 321', 'totalMapped === 322'], ['exactly 321/389', 'exactly 322/389'],
  ['remainingLegacyOccurrences === 68', 'remainingLegacyOccurrences === 67'], ['exactly 68.', 'exactly 67.'],
  ['coveragePercent === 82.519', 'coveragePercent === 82.776'], ['= 123 exact fixed Sanctorale', '= 124 exact fixed Sanctorale'], ['; 68 remaining,', '; 67 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 321 && coveredSourceIds.size === 321', 'coveredRows.length === 322 && coveredSourceIds.size === 322'], ['exactly 321 unique', 'exactly 322 unique'],
  ['remaining.length === 68 && remainingSourceIds.size === 68 && remainingSourceHashes.size === 68', 'remaining.length === 67 && remainingSourceIds.size === 67 && remainingSourceHashes.size === 67'], ['exactly 68 unique', 'exactly 67 unique'],
  ['sourceBoundOccurrences === 321 && inventory.coverageAtInventory.remainingOccurrences === 68', 'sourceBoundOccurrences === 322 && inventory.coverageAtInventory.remainingOccurrences === 67'],
  ["actualCounts['fixed-person'] === 23", "actualCounts['fixed-person'] === 22"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StHildegardBingen')", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJanuarius'), 'Saint Januarius must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StHildegardBingen')"],
  ['Portugal semantic inventory passed: 321 covered + 68 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 322 covered + 67 exact unresolved source rows = 389; Saint Januarius is source-bound on 19 September;']
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [subject.personId] }, null, 2));

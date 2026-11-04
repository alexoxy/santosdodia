import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-04';
const dateISO = '2026-09-28';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-9-28';
const identityUrl = 'https://www.vaticannews.va/en/saints/09/28.html';
const subject = {
  personId: 'wenceslaus-bohemia',
  legacyId: 'rc:StWenceslaus',
  sourceOccurrenceId: 'snl-pt-2026-09-28-5d81cc270a1ea95295a9d9b5',
  sourceRecordHash: '58ed6857828dee73d3c623aa4e574da2714a2cd66bcde45c29e2949d07d81998',
  sourceLabelPt: 'S. Venceslau, mártir',
  names: { en: 'Saint Wenceslaus', pt: 'São Venceslau', es: 'San Wenceslao', it: 'San Venceslao' },
  recognitionId: 'recognition:wenceslaus-bohemia:roman-catholic',
  observanceId: 'observance:wenceslaus-bohemia:roman-catholic',
  ruleId: 'sanctorale-rule:wenceslaus-bohemia:general-roman',
  occurrenceId: 'occurrence:2026-09-28:wenceslaus-bohemia:roman-catholic:pt'
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
  recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: ['ruler', 'martyr'],
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [{ publisher: 'Vatican News', url: identityUrl, claimTypes: ['identity', 'ruler-of-bohemia', 'martyr', 'liturgical-date'] }],
  verifiedAt
});
appendUnique('data/canonical-observance-anchors.json', 'observances', {
  id: subject.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
  observanceType: 'person-commemoration', subjects: [{ kind: 'person', personId: subject.personId, recognitionId: subject.recognitionId }],
  scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false, jurisdictionImplied: false,
  rankImplied: false, precedenceImplied: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-contexts-kept-independent'] }],
  verifiedAt
});
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', {
  id: subject.ruleId, observanceId: subject.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 9, day: 28 },
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
fixed.fixedMappingCount = 125;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 125;
coverage.coverage.mappedOccurrenceAnchors = 323;
coverage.coverage.remainingLegacyOccurrences = 66;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== subject.sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Wenceslaus source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 323;
inventory.coverageAtInventory.remainingOccurrences = 66;
inventory.familyCounts['fixed-person'] = 21;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person: { id: subject.personId, primaryObservanceId: subject.legacyId, category: 'saint', names: subject.names },
  recognition: { id: subject.recognitionId, personId: subject.personId, ecclesialTitles: ['ruler', 'martyr'], evidenceUrl: identityUrl },
  observanceId: subject.observanceId, sanctoraleRuleId: subject.ruleId,
  contextualBoundary: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', czechPatronagePublished: false },
  source: { canonicalEventId: subject.legacyId, dateISO, sourceOccurrenceId: subject.sourceOccurrenceId,
    sourceRecordHash: subject.sourceRecordHash, sourceLabelPt: subject.sourceLabelPt,
    observedDesignation: `${subject.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial', snlUrl: snl }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-53.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-53.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: [subject.personId], promotedObservanceIds: [subject.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 323, requiredForPromotion: 389, remainingLegacyOccurrences: 66 },
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
  ['fixedSanctorale === 124 && ledger.counts.fixedSanctoraleDays === 115', 'fixedSanctorale === 125 && ledger.counts.fixedSanctoraleDays === 115'],
  ['preserve 124 exact Sanctorale occurrences across 115 civil days', 'preserve 125 exact Sanctorale occurrences across 115 civil days'],
  ['sourceBound === 308 && ledger.counts.sourceBoundOccurrences === 322', 'sourceBound === 308 && ledger.counts.sourceBoundOccurrences === 323'],
  ['distinguish 308 source-bound days from 322 source-bound canonical occurrences', 'distinguish 308 source-bound days from 323 source-bound canonical occurrences'],
  ["const september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');", "const september28 = ledger.entries.find(item => item.dateISO === '2026-09-28');\nassert(september28?.classification === 'fixed-sanctorale' && september28.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:wenceslaus-bohemia:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StWenceslaus'), 'Saint Wenceslaus must retain the exact optional-memorial source binding on 28 September.');\nconst september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');"],
  ['+ 124 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 322 source-bound occurrences across 308 days', '+ 125 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 323 source-bound occurrences across 308 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 124', 'candidates.length === 125'], ['one hundred and twenty-four reviewed rules', 'one hundred and twenty-five reviewed rules'],
  ["['observance:pius-pietrelcina:roman-catholic', ['2026-09-23', 'obligatory-memorial', 10, 'general-roman']],", "['observance:pius-pietrelcina:roman-catholic', ['2026-09-23', 'obligatory-memorial', 10, 'general-roman']],\n    ['observance:wenceslaus-bohemia:roman-catholic', ['2026-09-28', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 124', 'occurrences.occurrences.length === 125'],
  ['Roman Sanctorale passed: 124 authority-isolated', 'Roman Sanctorale passed: 125 authority-isolated'],
  ['including Saint Januarius', 'including Saint Wenceslaus on 28 September; Saint Januarius']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [['peopleCount === 205', 'peopleCount === 206'], ["'hildegard-bingen', 'robert-bellarmine', 'januarius-benevento',", "'hildegard-bingen', 'robert-bellarmine', 'januarius-benevento', 'wenceslaus-bohemia',"]]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 203', 'recognitionCount === 204'], ['personCoverageCount === 202', 'personCoverageCount === 203'],
  ["'recognition:januarius-benevento:roman-catholic',", "'recognition:januarius-benevento:roman-catholic',\n  'recognition:wenceslaus-bohemia:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 203', 'recognitionCount, 204'], ['personCoverageCount, 202', 'personCoverageCount, 203']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 126', 'observanceCount === 127'], ['personCoverageCount === 202', 'personCoverageCount === 203'],
  ["const januarius = first.observances.find", "const wenceslaus = first.observances.find((item) => item.observanceId === 'observance:wenceslaus-bohemia:roman-catholic');\nassert(wenceslaus?.subjects?.[0]?.personId === 'wenceslaus-bohemia', 'Saint Wenceslaus must remain a distinct person-scoped Observance.');\n\nconst januarius = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 124', 'occurrenceCount === 125'], ['legacyBridgeCount === 124', 'legacyBridgeCount === 125'],
  ["['observance:januarius-benevento:roman-catholic', ['2026-09-19', 'optional-memorial', 'MF', 'rc:StJanuarius']],", "['observance:januarius-benevento:roman-catholic', ['2026-09-19', 'optional-memorial', 'MF', 'rc:StJanuarius']],\n  ['observance:wenceslaus-bohemia:roman-catholic', ['2026-09-28', 'optional-memorial', 'MF', 'rc:StWenceslaus']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['e4913a2272f57557d843b7c1b0a79aed291cc5a04e6a1c00fb8ca53ea0eb7390', mappingDigest],
  ['length === 124 && explicitOccurrences.length', 'length === 125 && explicitOccurrences.length'], ['one hundred and twenty-four', 'one hundred and twenty-five'],
  ['length === 124 && explicitBridges.length', 'length === 125 && explicitBridges.length'], ['the one hundred and twenty-four', 'the one hundred and twenty-five'],
  ['mappings.length === 124', 'mappings.length === 125'],
  ['explicitOccurrenceById.size === 124 && explicitBridgeByOccurrence.size === 124 && fixedMappingByOccurrence.size === 124', 'explicitOccurrenceById.size === 125 && explicitBridgeByOccurrence.size === 125 && fixedMappingByOccurrence.size === 125'],
  ['coveredSourceIds.size === 311 && coveredSourceHashes.size === 311 && coveredOccurrenceIds.size === 311', 'coveredSourceIds.size === 312 && coveredSourceHashes.size === 312 && coveredOccurrenceIds.size === 312'],
  ['totalMapped === 322', 'totalMapped === 323'], ['exactly 322/389', 'exactly 323/389'],
  ['remainingLegacyOccurrences === 67', 'remainingLegacyOccurrences === 66'], ['exactly 67.', 'exactly 66.'],
  ['coveragePercent === 82.776', 'coveragePercent === 83.033'], ['= 124 exact fixed Sanctorale', '= 125 exact fixed Sanctorale'], ['; 67 remaining,', '; 66 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 322 && coveredSourceIds.size === 322', 'coveredRows.length === 323 && coveredSourceIds.size === 323'], ['exactly 322 unique', 'exactly 323 unique'],
  ['remaining.length === 67 && remainingSourceIds.size === 67 && remainingSourceHashes.size === 67', 'remaining.length === 66 && remainingSourceIds.size === 66 && remainingSourceHashes.size === 66'], ['exactly 67 unique', 'exactly 66 unique'],
  ['sourceBoundOccurrences === 322 && inventory.coverageAtInventory.remainingOccurrences === 67', 'sourceBoundOccurrences === 323 && inventory.coverageAtInventory.remainingOccurrences === 66'],
  ["actualCounts['fixed-person'] === 22", "actualCounts['fixed-person'] === 21"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJanuarius')", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StWenceslaus'), 'Saint Wenceslaus must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StJanuarius')"],
  ['Portugal semantic inventory passed: 322 covered + 67 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 323 covered + 66 exact unresolved source rows = 389; Saint Wenceslaus is source-bound on 28 September;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-52.json', '0c46d520e612ee3285c437cfa5a899e648071110964fe6ed3c7345d8cd85aa28']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-52.json', '0c46d520e612ee3285c437cfa5a899e648071110964fe6ed3c7345d8cd85aa28'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-53.json', reviewDigest]"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [subject.personId] }, null, 2));

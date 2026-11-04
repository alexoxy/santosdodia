import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-04';
const dateISO = '2026-09-17';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-9-17';

const subjects = [
  {
    personId: 'hildegard-bingen',
    legacyId: 'rc:StHildegardBingen',
    sourceOccurrenceId: 'snl-pt-2026-09-17-5b3cd876d3c030e024f7172c',
    sourceRecordHash: 'ae18d1a83eb8528954390808fdbace0d0d2bd0d9bcfdba9930de169a78b1f2e2',
    sourceLabelPt: 'S. Hildegarda de Bingen, virgem e doutora da Igreja',
    names: { en: 'Saint Hildegard of Bingen', pt: 'Santa Hildegarda de Bingen', es: 'Santa Hildegarda de Bingen', it: 'Santa Ildegarda di Bingen' },
    titles: ['virgin', 'religious', 'abbess', 'doctor-of-church'],
    identityUrl: 'https://www.vatican.va/content/benedict-xvi/en/apost_letters/documents/hf_ben-xvi_apl_20121007_ildegarda-bingen.html',
    calendarUrl: 'https://press.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20210125_decreto-dottori_en.html',
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      benedictineOrder: 'optional-memorial', cistercianOrder: 'optional-memorial',
      properRanksMaterializedAsGeneral: false, sameDateContextsKeptIndependent: true
    }
  },
  {
    personId: 'robert-bellarmine',
    legacyId: 'rc:StRobertBellarmine',
    sourceOccurrenceId: 'snl-pt-2026-09-17-bc740e34d1b995e1c90c8455',
    sourceRecordHash: '82c0267e6ee5ed403a192a1c9c8f767e408262fb1c85f55adc401d8d9e59a827',
    sourceLabelPt: 'S. Roberto Belarmino, bispo e doutor da Igreja',
    names: { en: 'Saint Robert Bellarmine', pt: 'São Roberto Belarmino', es: 'San Roberto Belarmino', it: 'San Roberto Bellarmino' },
    titles: ['priest', 'religious', 'bishop', 'cardinal', 'doctor-of-church'],
    identityUrl: 'https://www.vatican.va/content/benedict-xvi/en/audiences/2011/documents/hf_ben-xvi_aud_20110223.html',
    calendarUrl: 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=155',
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      societyOfJesus: 'obligatory-memorial', properRanksMaterializedAsGeneral: false,
      sameDateContextsKeptIndependent: true
    }
  }
].map(item => ({
  ...item,
  recognitionId: `recognition:${item.personId}:roman-catholic`,
  observanceId: `observance:${item.personId}:roman-catholic`,
  ruleId: `sanctorale-rule:${item.personId}:general-roman`,
  occurrenceId: `occurrence:${dateISO}:${item.personId}:roman-catholic:pt`
}));

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  if (data[key].some(item => item[idKey] === value[idKey])) throw new Error(`${value[idKey]} already exists in ${path}`);
  data[key].push(value);
  write(path, data);
};

for (const item of subjects) {
  const person = { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names };
  const recognition = {
    id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global',
    recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles,
    scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
    evidence: [{ publisher: 'Holy See', url: item.identityUrl, claimTypes: ['identity', 'ecclesial-status', 'doctor-of-church', 'death-date'] }],
    verifiedAt
  };
  const observance = {
    id: item.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
    observanceType: 'person-commemoration', subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }],
    scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false, jurisdictionImplied: false,
    rankImplied: false, precedenceImplied: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-contexts-kept-independent', 'proper-institute-ranks-kept-separate'] }],
    verifiedAt
  };
  const rule = {
    id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 9, day: 17 },
    liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'portugal-inherits-general-calendar', 'proper-institute-ranks-kept-separate'] }],
    verifiedAt
  };
  const occurrence = {
    id: item.occurrenceId, observanceId: item.observanceId, churchId: 'church:roman-catholic',
    jurisdictionId: 'jurisdiction:roman-catholic:pt', calendarSystem: 'gregorian', year: 2026, dateISO,
    rank: 'optional-memorial', sourceRankCode: 'MF',
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank', 'same-date-contexts-kept-independent', 'proper-institute-ranks-kept-separate'], observedDesignation: `${item.sourceLabelPt} – MF` }],
    verifiedAt
  };

  appendUnique('data/canonical-person-anchors.json', 'people', person);
  appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
  appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
  appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
  appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
  appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId: item.occurrenceId, legacyObservanceId: item.legacyId, dateISO }, 'legacyObservanceId');
}

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
for (const item of subjects) fixed.mappings.push({
  occurrenceId: item.occurrenceId, observanceId: item.observanceId, sanctoraleRuleId: item.ruleId,
  legacyObservanceId: item.legacyId, expectedDateISO: dateISO, sourceOccurrenceId: item.sourceOccurrenceId,
  sourceRecordHash: item.sourceRecordHash, legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial',
  sourceRankCode: 'MF', reviewStatus: 'source-bound-exact', resolution: 'exact-fixed-date-binding'
});
fixed.fixedMappingCount = 114;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 123;
coverage.coverage.mappedOccurrenceAnchors = 321;
coverage.coverage.remainingLegacyOccurrences = 68;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const sourceIds = new Set(subjects.map(item => item.sourceOccurrenceId));
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => !sourceIds.has(item.sourceOccurrenceId));
if (inventory.remaining.length !== before - 2) throw new Error('17 September source rows missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 321;
inventory.coverageAtInventory.remainingOccurrences = 68;
inventory.familyCounts['fixed-person'] = 23;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidates = subjects.map(item => ({
  person: { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names },
  recognition: { id: item.recognitionId, personId: item.personId, ecclesialTitles: item.titles, evidenceUrl: item.identityUrl },
  observanceId: item.observanceId, sanctoraleRuleId: item.ruleId, contextualBoundary: item.context,
  source: { canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId, sourceRecordHash: item.sourceRecordHash,
    sourceLabelPt: item.sourceLabelPt, observedDesignation: `${item.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF', canonicalRank: 'optional-memorial', snlUrl: snl }
}));
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-51.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-51.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(item => item.personId),
  promotedObservanceIds: subjects.map(item => item.observanceId),
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 321, requiredForPromotion: 389, remainingLegacyOccurrences: 68 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

const replace = (path, replacements) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (from instanceof RegExp) {
      if (!from.test(text)) throw new Error(`Missing expected pattern in ${path}: ${from}`);
      text = text.replace(from, to);
    } else {
      if (!text.includes(from)) throw new Error(`Missing expected text in ${path}: ${from}`);
      text = text.replace(from, to);
    }
  }
  fs.writeFileSync(path, text);
};

replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['fixedSanctorale === 121 && ledger.counts.fixedSanctoraleDays === 113', 'fixedSanctorale === 123 && ledger.counts.fixedSanctoraleDays === 114'],
  ['preserve 121 exact Sanctorale occurrences across 113 civil days', 'preserve 123 exact Sanctorale occurrences across 114 civil days'],
  ['sourceBound === 307 && ledger.counts.sourceBoundOccurrences === 319', 'sourceBound === 308 && ledger.counts.sourceBoundOccurrences === 321'],
  ['distinguish 307 source-bound days from 319 source-bound canonical occurrences', 'distinguish 308 source-bound days from 321 source-bound canonical occurrences'],
  ["ledger.counts.unresolved === 58", "ledger.counts.unresolved === 57"], ['58 wholly unbound days', '57 wholly unbound days'],
  ["const september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');", "const september17 = ledger.entries.find(item => item.dateISO === '2026-09-17');\nassert(september17?.classification === 'fixed-sanctorale' && september17.fixedOptions?.length === 2 && september17.fixedOptions.some(item => item.canonicalObservanceId === 'observance:hildegard-bingen:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StHildegardBingen') && september17.fixedOptions.some(item => item.canonicalObservanceId === 'observance:robert-bellarmine:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StRobertBellarmine'), '17 September must retain both independent optional memorials.');\nconst september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');"],
  ['+ 121 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 319 source-bound occurrences across 307 days', '+ 123 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 321 source-bound occurrences across 308 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 121', 'candidates.length === 123'], ['one hundred and twenty-one reviewed rules', 'one hundred and twenty-three reviewed rules'],
  ["['observance:peter-claver:roman-catholic', ['2026-09-09', 'optional-memorial', 12, 'general-roman']],", "['observance:peter-claver:roman-catholic', ['2026-09-09', 'optional-memorial', 12, 'general-roman']],\n    ['observance:hildegard-bingen:roman-catholic', ['2026-09-17', 'optional-memorial', 12, 'general-roman']],\n    ['observance:robert-bellarmine:roman-catholic', ['2026-09-17', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 121', 'occurrences.occurrences.length === 123'],
  ['Roman Sanctorale passed: 121 authority-isolated perennial Portugal vectors, including Saint Peter Claver', 'Roman Sanctorale passed: 123 authority-isolated perennial Portugal vectors, including Saints Hildegard of Bingen and Robert Bellarmine as independent 17 September optional memorials; Saint Peter Claver']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 202', 'peopleCount === 204'], ["'louis-ix-france', 'teresa-calcutta', 'peter-claver',", "'louis-ix-france', 'teresa-calcutta', 'peter-claver', 'hildegard-bingen', 'robert-bellarmine',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 200', 'recognitionCount === 202'], ['personCoverageCount === 199', 'personCoverageCount === 201'],
  ["'recognition:peter-claver:roman-catholic',", "'recognition:peter-claver:roman-catholic',\n  'recognition:hildegard-bingen:roman-catholic',\n  'recognition:robert-bellarmine:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 200', 'recognitionCount, 202'], ['personCoverageCount, 199', 'personCoverageCount, 201']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 123', 'observanceCount === 125'], ['personCoverageCount === 199', 'personCoverageCount === 201'],
  ['const peterClaver = first.observances.find', "const hildegard = first.observances.find((item) => item.observanceId === 'observance:hildegard-bingen:roman-catholic');\nassert(hildegard?.subjects?.[0]?.personId === 'hildegard-bingen', 'Saint Hildegard must remain a distinct person-scoped Observance.');\nconst bellarmine = first.observances.find((item) => item.observanceId === 'observance:robert-bellarmine:roman-catholic');\nassert(bellarmine?.subjects?.[0]?.personId === 'robert-bellarmine', 'Saint Robert Bellarmine must remain a distinct person-scoped Observance.');\n\nconst peterClaver = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 121', 'occurrenceCount === 123'], ['legacyBridgeCount === 121', 'legacyBridgeCount === 123'],
  ["['observance:peter-claver:roman-catholic', ['2026-09-09', 'optional-memorial', 'MF', 'rc:StPeterClaver']],", "['observance:peter-claver:roman-catholic', ['2026-09-09', 'optional-memorial', 'MF', 'rc:StPeterClaver']],\n  ['observance:hildegard-bingen:roman-catholic', ['2026-09-17', 'optional-memorial', 'MF', 'rc:StHildegardBingen']],\n  ['observance:robert-bellarmine:roman-catholic', ['2026-09-17', 'optional-memorial', 'MF', 'rc:StRobertBellarmine']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 121 && explicitOccurrences.length', 'length === 123 && explicitOccurrences.length'], ['exactly one hundred and twenty-one', 'exactly one hundred and twenty-three'],
  ['length === 121 && explicitBridges.length', 'length === 123 && explicitBridges.length'], ['the one hundred and twenty-one canonical Occurrences', 'the one hundred and twenty-three canonical Occurrences'],
  ['mappings.length === 121', 'mappings.length === 123'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 121 && explicitBridgeByOccurrence.size === 121 && fixedMappingByOccurrence.size === 121', 'explicitOccurrenceById.size === 123 && explicitBridgeByOccurrence.size === 123 && fixedMappingByOccurrence.size === 123'],
  ['coveredSourceIds.size === 308 && coveredSourceHashes.size === 308 && coveredOccurrenceIds.size === 308', 'coveredSourceIds.size === 310 && coveredSourceHashes.size === 310 && coveredOccurrenceIds.size === 310'],
  ['totalMapped === 319', 'totalMapped === 321'], ['exactly 319/389', 'exactly 321/389'], ['remainingLegacyOccurrences === 70', 'remainingLegacyOccurrences === 68'],
  ['exactly 70.', 'exactly 68.'], ['coveragePercent === 82.005', 'coveragePercent === 82.519'], ['= 121 exact fixed Sanctorale', '= 123 exact fixed Sanctorale'], ['; 70 remaining,', '; 68 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 319 && coveredSourceIds.size === 319', 'coveredRows.length === 321 && coveredSourceIds.size === 321'], ['exactly 319 unique', 'exactly 321 unique'],
  ['remaining.length === 70 && remainingSourceIds.size === 70 && remainingSourceHashes.size === 70', 'remaining.length === 68 && remainingSourceIds.size === 68 && remainingSourceHashes.size === 68'],
  ['exactly 70 unique', 'exactly 68 unique'], ['sourceBoundOccurrences === 319 && inventory.coverageAtInventory.remainingOccurrences === 70', 'sourceBoundOccurrences === 321 && inventory.coverageAtInventory.remainingOccurrences === 68'],
  ["actualCounts['fixed-person'] === 25", "actualCounts['fixed-person'] === 23"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StPeterClaver'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StHildegardBingen'), 'Saint Hildegard must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StRobertBellarmine'), 'Saint Robert Bellarmine must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StPeterClaver'),"],
  ['Portugal semantic inventory passed: 319 covered + 70 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 321 covered + 68 exact unresolved source rows = 389; Saints Hildegard and Robert Bellarmine remain independent on their shared date;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-50.json', '9e05534ce782e6646bf9ffc69719284936024d1ef31b57e31397d83e97c4180e']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-50.json', '9e05534ce782e6646bf9ffc69719284936024d1ef31b57e31397d83e97c4180e'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-51.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(item => item.personId) }, null, 2));

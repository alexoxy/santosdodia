import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'teresa-calcutta';
const recognitionId = `recognition:${personId}:roman-catholic`;
const observanceId = `observance:${personId}:roman-catholic`;
const ruleId = `sanctorale-rule:${personId}:general-roman`;
const occurrenceId = `occurrence:2026-09-05:${personId}:roman-catholic:pt`;
const legacyId = 'rc:StMotherTeresa';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-9-5';
const biography = 'https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20031019_madre-teresa_en.html';
const sourceOccurrenceId = 'snl-pt-2026-09-05-27f372db03e5c9841ce06c2a';
const sourceRecordHash = '09cc29463193bbaa50f2eabfbc06275cd4a998948b3e1aba9656c4c950771b2f';

const person = {
  id: personId,
  primaryObservanceId: legacyId,
  category: 'saint',
  names: {
    en: 'Saint Teresa of Calcutta',
    pt: 'Santa Teresa de Calcutá',
    es: 'Santa Teresa de Calcuta',
    it: 'Santa Teresa di Calcutta'
  }
};

const recognition = {
  id: recognitionId,
  personId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'global',
  recognizedAs: 'saint',
  recognitionBasis: 'official-church-attestation',
  ecclesialTitles: ['virgin', 'religious', 'founder'],
  scope: 'church-wide',
  calendarMembershipImplied: false,
  observanceDateImplied: false,
  evidence: [
    { publisher: 'Holy See', url: biography, claimTypes: ['identity', 'birth-name', 'religious-name', 'founder', 'death-date'] }
  ],
  verifiedAt: '2026-10-28'
};

const observance = {
  id: observanceId,
  churchId: 'church:roman-catholic',
  observanceKey: 'principal-commemoration',
  observanceType: 'person-commemoration',
  subjects: [{ kind: 'person', personId, recognitionId }],
  scope: 'church-attested',
  occurrenceDateImplied: false,
  calendarSystemImplied: false,
  jurisdictionImplied: false,
  rankImplied: false,
  precedenceImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-alternatives-kept-independent', 'proper-institute-rank-kept-separate'] }
  ],
  verifiedAt: '2026-10-28'
};

const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 9, day: 5 },
  liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'optional-memorial', 'portugal-inherits-general-calendar', 'proper-institute-rank-kept-separate']
  }],
  verifiedAt: '2026-10-28'
};

const occurrence = {
  id: occurrenceId,
  observanceId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt',
  calendarSystem: 'gregorian',
  year: 2026,
  dateISO: '2026-09-05',
  rank: 'optional-memorial',
  sourceRankCode: 'MF',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank', 'same-date-alternatives-kept-independent'],
    observedDesignation: 'S. Teresa de Calcutá, virgem – MF'
  }],
  verifiedAt: '2026-10-28'
};

const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-09-05',
  sourceOccurrenceId,
  sourceRecordHash,
  legacyRank: 'optional-memorial',
  canonicalRank: 'optional-memorial',
  sourceRankCode: 'MF',
  reviewStatus: 'source-bound-exact',
  resolution: 'exact-fixed-date-binding'
};

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  if (data[key].some(item => item[idKey] === value[idKey])) throw new Error(`${value[idKey]} already exists in ${path}`);
  data[key].push(value);
  write(path, data);
};

appendUnique('data/canonical-person-anchors.json', 'people', person);
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-09-05' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-28';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 120;
coverage.coverage.mappedOccurrenceAnchors = 318;
coverage.coverage.remainingLegacyOccurrences = 71;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Mother Teresa source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 318;
inventory.coverageAtInventory.remainingOccurrences = 71;
inventory.familyCounts['fixed-person'] = 26;
inventory.verifiedAt = '2026-10-28';
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: recognitionId, personId, ecclesialTitles: recognition.ecclesialTitles, evidenceUrl: biography },
  observanceId,
  sanctoraleRuleId: ruleId,
  contextualBoundary: {
    generalRoman: 'optional-memorial',
    portugal2026: 'optional-memorial',
    missionariesOfCharity: 'solemnity',
    properRankMaterializedAsGeneral: false,
    saturdayMarianAlternativeKeptIndependent: true,
    patronageClaimsPublished: 0
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-09-05',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'S. Teresa de Calcutá, virgem',
    observedDesignation: 'S. Teresa de Calcutá, virgem – MF',
    legacyRank: 'optional-memorial',
    sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-49.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1,
  status: 'reviewed-sanctorale-promotion-candidate-pack',
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact,
  canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates,
  reviewDigestSha256: reviewDigest,
  mutationAllowed: false,
  promotionAllowed: false,
  verifiedAt: '2026-10-28'
});

const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-49.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 318, requiredForPromotion: 389, remainingLegacyOccurrences: 71 },
  fixedSanctoraleMappingDigestSha256: mappingDigest,
  runtimePublicationAllowed: false,
  productionWriteAllowed: false,
  promotionAllowed: false,
  verifiedAt: '2026-10-28'
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
  ['fixedSanctorale === 119 && ledger.counts.fixedSanctoraleDays === 111', 'fixedSanctorale === 120 && ledger.counts.fixedSanctoraleDays === 112'],
  ['preserve 119 exact Sanctorale occurrences across 111 civil days', 'preserve 120 exact Sanctorale occurrences across 112 civil days'],
  ['sourceBound === 306 && ledger.counts.sourceBoundOccurrences === 317', 'sourceBound === 306 && ledger.counts.sourceBoundOccurrences === 318'],
  ['distinguish 306 source-bound days from 317 source-bound canonical occurrences', 'distinguish 306 source-bound days from 318 source-bound canonical occurrences'],
  ["const september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');", "const september5 = ledger.entries.find(item => item.dateISO === '2026-09-05');\nassert(september5?.classification === 'mixed-optional-alternatives' && september5.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:teresa-calcutta:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StMotherTeresa'), 'Saint Teresa of Calcutta must retain the exact optional-memorial source binding on 5 September.');\nassert(september5.temporalFamilyOptions?.some(item => item.sourceBinding?.sourceOccurrenceId === 'snl-pt-2026-09-05-d772503ec771dffc3ca8520c'), 'The Saturday Marian optional alternative must remain independently source-bound on 5 September.');\nconst september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');"],
  ['+ 119 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 317 source-bound occurrences across 306 days', '+ 120 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 318 source-bound occurrences across 306 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 119', 'candidates.length === 120'], ['one hundred and nineteen reviewed rules', 'one hundred and twenty reviewed rules'],
  ["['observance:john-baptist-martyrdom:roman-catholic', ['2026-08-29', 'obligatory-memorial', 10, 'general-roman']],", "['observance:john-baptist-martyrdom:roman-catholic', ['2026-08-29', 'obligatory-memorial', 10, 'general-roman']],\n    ['observance:teresa-calcutta:roman-catholic', ['2026-09-05', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 119', 'occurrences.occurrences.length === 120'],
  ['Roman Sanctorale passed: 119 authority-isolated perennial Portugal vectors, including a distinct John the Baptist martyrdom Observance reusing the canonical Person;', 'Roman Sanctorale passed: 120 authority-isolated perennial Portugal vectors, including Saint Teresa of Calcutta with her proper institute solemnity kept separate; a distinct John the Baptist martyrdom Observance reuses the canonical Person;']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 200', 'peopleCount === 201'], ["'joseph-calasanz', 'louis-ix-france',", "'joseph-calasanz', 'louis-ix-france', 'teresa-calcutta',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 198', 'recognitionCount === 199'], ['personCoverageCount === 197', 'personCoverageCount === 198'],
  ["'recognition:john-baptist:roman-catholic',", "'recognition:john-baptist:roman-catholic',\n  'recognition:teresa-calcutta:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 198', 'recognitionCount, 199'], ['personCoverageCount, 197', 'personCoverageCount, 198']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 121', 'observanceCount === 122'], ['personCoverageCount === 197', 'personCoverageCount === 198'],
  ['const johnMartyrdom = first.observances.find', "const motherTeresa = first.observances.find((item) => item.observanceId === 'observance:teresa-calcutta:roman-catholic');\nassert(motherTeresa?.observanceType === 'person-commemoration' && motherTeresa.subjects?.[0]?.personId === 'teresa-calcutta', 'Saint Teresa of Calcutta must remain one person-scoped Observance.');\nassert(motherTeresa.evidence.some((item) => item.claimTypes?.includes('proper-institute-rank-kept-separate')), 'The Missionaries of Charity proper solemnity must remain contextual.');\n\nconst johnMartyrdom = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 119', 'occurrenceCount === 120'], ['legacyBridgeCount === 119', 'legacyBridgeCount === 120'],
  ["['observance:john-baptist-martyrdom:roman-catholic', ['2026-08-29', 'obligatory-memorial', 'MO', 'rc:BeheadingJohnBaptist']],", "['observance:john-baptist-martyrdom:roman-catholic', ['2026-08-29', 'obligatory-memorial', 'MO', 'rc:BeheadingJohnBaptist']],\n  ['observance:teresa-calcutta:roman-catholic', ['2026-09-05', 'optional-memorial', 'MF', 'rc:StMotherTeresa']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 119 && explicitOccurrences.length', 'length === 120 && explicitOccurrences.length'], ['exactly one hundred and nineteen', 'exactly one hundred and twenty'],
  ['length === 119 && explicitBridges.length', 'length === 120 && explicitBridges.length'], ['the one hundred and nineteen canonical Occurrences', 'the one hundred and twenty canonical Occurrences'],
  ['mappings.length === 119', 'mappings.length === 120'],
  ["fixedSanctoraleMappingDigest === 'fd8f2992ee8e31565afebf05bcc1e9e3cd5ad64a1c0ff9d327abf0698151a5e4'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 119 && explicitBridgeByOccurrence.size === 119 && fixedMappingByOccurrence.size === 119', 'explicitOccurrenceById.size === 120 && explicitBridgeByOccurrence.size === 120 && fixedMappingByOccurrence.size === 120'],
  ['coveredSourceIds.size === 306 && coveredSourceHashes.size === 306 && coveredOccurrenceIds.size === 306', 'coveredSourceIds.size === 307 && coveredSourceHashes.size === 307 && coveredOccurrenceIds.size === 307'],
  ['totalMapped === 317', 'totalMapped === 318'], ['exactly 317/389', 'exactly 318/389'], ['remainingLegacyOccurrences === 72', 'remainingLegacyOccurrences === 71'],
  ['exactly 72.', 'exactly 71.'], ['coveragePercent === 81.491', 'coveragePercent === 81.748'], ['= 119 exact fixed Sanctorale', '= 120 exact fixed Sanctorale'], ['; 72 remaining,', '; 71 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 317 && coveredSourceIds.size === 317', 'coveredRows.length === 318 && coveredSourceIds.size === 318'], ['exactly 317 unique', 'exactly 318 unique'],
  ['remaining.length === 72 && remainingSourceIds.size === 72 && remainingSourceHashes.size === 72', 'remaining.length === 71 && remainingSourceIds.size === 71 && remainingSourceHashes.size === 71'],
  ['exactly 72 unique', 'exactly 71 unique'], ['sourceBoundOccurrences === 317 && inventory.coverageAtInventory.remainingOccurrences === 72', 'sourceBoundOccurrences === 318 && inventory.coverageAtInventory.remainingOccurrences === 71'],
  ["actualCounts['fixed-person'] === 27", "actualCounts['fixed-person'] === 26"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnEudes'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StMotherTeresa'), 'Saint Teresa of Calcutta must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnEudes'),"],
  ['Portugal semantic inventory passed: 317 covered + 72 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 318 covered + 71 exact unresolved source rows = 389; Saint Teresa of Calcutta is source-bound while her proper institute solemnity remains contextual;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-48.json', '947f2d88954fbdb9f92529c3e4ced6a6bd786c443e311ba8bcf7563ccadb12ba']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-48.json', '947f2d88954fbdb9f92529c3e4ced6a6bd786c443e311ba8bcf7563ccadb12ba'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-49.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));

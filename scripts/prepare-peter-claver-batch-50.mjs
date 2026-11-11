import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'peter-claver';
const recognitionId = `recognition:${personId}:roman-catholic`;
const observanceId = `observance:${personId}:roman-catholic`;
const ruleId = `sanctorale-rule:${personId}:general-roman`;
const occurrenceId = `occurrence:2026-09-09:${personId}:roman-catholic:pt`;
const legacyId = 'rc:StPeterClaver';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-9-9';
const biography = 'https://www.vaticannews.va/en/saints/09/09/st--peter-claver--jesuit--apostle-of--slaves-.html';
const sourceOccurrenceId = 'snl-pt-2026-09-09-753b3544942002565550ff79';
const sourceRecordHash = '7035b9b51aea111c9fa63aa0e576c1f9c83d5760dc14213fcfe4d789b87a8fbb';

const person = {
  id: personId,
  primaryObservanceId: legacyId,
  category: 'saint',
  names: {
    en: 'Saint Peter Claver',
    pt: 'São Pedro Claver',
    es: 'San Pedro Claver',
    it: 'San Pietro Claver'
  }
};

const recognition = {
  id: recognitionId,
  personId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'global',
  recognizedAs: 'saint',
  recognitionBasis: 'official-church-attestation',
  ecclesialTitles: ['priest', 'religious', 'missionary'],
  scope: 'church-wide',
  calendarMembershipImplied: false,
  observanceDateImplied: false,
  evidence: [
    { publisher: 'Holy See', url: biography, claimTypes: ['identity', 'priest', 'jesuit', 'missionary', 'death-date', 'canonization'] }
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
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-contexts-kept-independent', 'proper-institute-ranks-kept-separate'] }
  ],
  verifiedAt: '2026-10-28'
};

const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 9, day: 9 },
  liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'optional-memorial', 'portugal-inherits-general-calendar', 'proper-institute-ranks-kept-separate']
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
  dateISO: '2026-09-09',
  rank: 'optional-memorial',
  sourceRankCode: 'MF',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank', 'same-date-contexts-kept-independent'],
    observedDesignation: 'S. Pedro Claver, presbítero – MF'
  }],
  verifiedAt: '2026-10-28'
};

const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-09-09',
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
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-09-09' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-28';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 121;
coverage.coverage.mappedOccurrenceAnchors = 319;
coverage.coverage.remainingLegacyOccurrences = 70;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Peter Claver source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 319;
inventory.coverageAtInventory.remainingOccurrences = 70;
inventory.familyCounts['fixed-person'] = 25;
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
    societyOfJesusAndComboni: 'obligatory-memorial-or-feast',
    missionarySistersOfSaintPeterClaver: 'solemnity',
    properRanksMaterializedAsGeneral: false,
    sameDateContextsKeptIndependent: true,
    patronageClaimsPublished: 0,
    scopedPatronageEvidenceRetained: true
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-09-09',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'S. Pedro Claver, presbítero',
    observedDesignation: 'S. Pedro Claver, presbítero – MF',
    legacyRank: 'optional-memorial',
    sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-50.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-50.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 319, requiredForPromotion: 389, remainingLegacyOccurrences: 70 },
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
  ['fixedSanctorale === 120 && ledger.counts.fixedSanctoraleDays === 112', 'fixedSanctorale === 121 && ledger.counts.fixedSanctoraleDays === 113'],
  ['preserve 120 exact Sanctorale occurrences across 112 civil days', 'preserve 121 exact Sanctorale occurrences across 113 civil days'],
  ['sourceBound === 306 && ledger.counts.sourceBoundOccurrences === 318', 'sourceBound === 307 && ledger.counts.sourceBoundOccurrences === 319'],
  ['distinguish 306 source-bound days from 318 source-bound canonical occurrences', 'distinguish 307 source-bound days from 319 source-bound canonical occurrences'],
  ["ledger.counts.unresolved === 59", "ledger.counts.unresolved === 58"],
  ['59 wholly unbound days', '58 wholly unbound days'],
  ["const september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');", "const september9 = ledger.entries.find(item => item.dateISO === '2026-09-09');\nassert(september9?.classification === 'fixed-sanctorale' && september9.canonicalObservanceId === 'observance:peter-claver:roman-catholic' && september9.sourceBinding?.legacyObservanceId === 'rc:StPeterClaver', 'Saint Peter Claver must retain the exact optional-memorial source binding on 9 September.');\nconst september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');"],
  ['+ 120 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 318 source-bound occurrences across 306 days', '+ 121 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 319 source-bound occurrences across 307 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 120', 'candidates.length === 121'], ['one hundred and twenty reviewed rules', 'one hundred and twenty-one reviewed rules'],
  ["['observance:teresa-calcutta:roman-catholic', ['2026-09-05', 'optional-memorial', 12, 'general-roman']],", "['observance:teresa-calcutta:roman-catholic', ['2026-09-05', 'optional-memorial', 12, 'general-roman']],\n    ['observance:peter-claver:roman-catholic', ['2026-09-09', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 120', 'occurrences.occurrences.length === 121'],
  ['Roman Sanctorale passed: 120 authority-isolated perennial Portugal vectors, including Saint Teresa of Calcutta with her proper institute solemnity kept separate;', 'Roman Sanctorale passed: 121 authority-isolated perennial Portugal vectors, including Saint Peter Claver with his proper institute ranks and scoped patronage evidence kept separate; Saint Teresa of Calcutta retains her proper institute solemnity;']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 201', 'peopleCount === 202'], ["'louis-ix-france', 'teresa-calcutta',", "'louis-ix-france', 'teresa-calcutta', 'peter-claver',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 199', 'recognitionCount === 200'], ['personCoverageCount === 198', 'personCoverageCount === 199'],
  ["'recognition:teresa-calcutta:roman-catholic',", "'recognition:teresa-calcutta:roman-catholic',\n  'recognition:peter-claver:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 199', 'recognitionCount, 200'], ['personCoverageCount, 198', 'personCoverageCount, 199']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 122', 'observanceCount === 123'], ['personCoverageCount === 198', 'personCoverageCount === 199'],
  ['const motherTeresa = first.observances.find', "const peterClaver = first.observances.find((item) => item.observanceId === 'observance:peter-claver:roman-catholic');\nassert(peterClaver?.observanceType === 'person-commemoration' && peterClaver.subjects?.[0]?.personId === 'peter-claver', 'Saint Peter Claver must remain one person-scoped Observance.');\nassert(peterClaver.evidence.some((item) => item.claimTypes?.includes('proper-institute-ranks-kept-separate')), 'Saint Peter Claver proper institute ranks must remain contextual.');\n\nconst motherTeresa = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 120', 'occurrenceCount === 121'], ['legacyBridgeCount === 120', 'legacyBridgeCount === 121'],
  ["['observance:teresa-calcutta:roman-catholic', ['2026-09-05', 'optional-memorial', 'MF', 'rc:StMotherTeresa']],", "['observance:teresa-calcutta:roman-catholic', ['2026-09-05', 'optional-memorial', 'MF', 'rc:StMotherTeresa']],\n  ['observance:peter-claver:roman-catholic', ['2026-09-09', 'optional-memorial', 'MF', 'rc:StPeterClaver']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 120 && explicitOccurrences.length', 'length === 121 && explicitOccurrences.length'], ['exactly one hundred and twenty', 'exactly one hundred and twenty-one'],
  ['length === 120 && explicitBridges.length', 'length === 121 && explicitBridges.length'], ['the one hundred and twenty canonical Occurrences', 'the one hundred and twenty-one canonical Occurrences'],
  ['mappings.length === 120', 'mappings.length === 121'],
  ["fixedSanctoraleMappingDigest === '9d5add77ab133027cc2174034d40942d6086b7f9bfc681ba4430105b1a3959ee'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 120 && explicitBridgeByOccurrence.size === 120 && fixedMappingByOccurrence.size === 120', 'explicitOccurrenceById.size === 121 && explicitBridgeByOccurrence.size === 121 && fixedMappingByOccurrence.size === 121'],
  ['coveredSourceIds.size === 307 && coveredSourceHashes.size === 307 && coveredOccurrenceIds.size === 307', 'coveredSourceIds.size === 308 && coveredSourceHashes.size === 308 && coveredOccurrenceIds.size === 308'],
  ['totalMapped === 318', 'totalMapped === 319'], ['exactly 318/389', 'exactly 319/389'], ['remainingLegacyOccurrences === 71', 'remainingLegacyOccurrences === 70'],
  ['exactly 71.', 'exactly 70.'], ['coveragePercent === 81.748', 'coveragePercent === 82.005'], ['= 120 exact fixed Sanctorale', '= 121 exact fixed Sanctorale'], ['; 71 remaining,', '; 70 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 318 && coveredSourceIds.size === 318', 'coveredRows.length === 319 && coveredSourceIds.size === 319'], ['exactly 318 unique', 'exactly 319 unique'],
  ['remaining.length === 71 && remainingSourceIds.size === 71 && remainingSourceHashes.size === 71', 'remaining.length === 70 && remainingSourceIds.size === 70 && remainingSourceHashes.size === 70'],
  ['exactly 71 unique', 'exactly 70 unique'], ['sourceBoundOccurrences === 318 && inventory.coverageAtInventory.remainingOccurrences === 71', 'sourceBoundOccurrences === 319 && inventory.coverageAtInventory.remainingOccurrences === 70'],
  ["actualCounts['fixed-person'] === 26", "actualCounts['fixed-person'] === 25"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StMotherTeresa'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StPeterClaver'), 'Saint Peter Claver must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StMotherTeresa'),"],
  ['Portugal semantic inventory passed: 318 covered + 71 exact unresolved source rows = 389; Saint Teresa of Calcutta is source-bound while her proper institute solemnity remains contextual;', 'Portugal semantic inventory passed: 319 covered + 70 exact unresolved source rows = 389; Saint Peter Claver is source-bound while proper institute ranks and scoped patronage evidence remain contextual;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-49.json', 'f2f154d3061ab0f10b10cfce38a608b9348a1d07672f10ed01fb290d825e8158']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-49.json', 'f2f154d3061ab0f10b10cfce38a608b9348a1d07672f10ed01fb290d825e8158'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-50.json', '" + reviewDigest + "']"]
]);


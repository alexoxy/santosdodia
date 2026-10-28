import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'mary-of-nazareth';
const recognitionId = `recognition:${personId}:roman-catholic`;
const occurrenceKey = 'queenship-mary';
const observanceId = `observance:${occurrenceKey}:roman-catholic`;
const ruleId = `sanctorale-rule:${occurrenceKey}:general-roman`;
const occurrenceId = `occurrence:2026-08-22:${occurrenceKey}:roman-catholic:pt`;
const legacyId = 'rc:QueenshipMary';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-8-22';
const snlSaint = 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=138';
const holySee = 'https://www.vatican.va/content/benedict-xvi/en/audiences/2012/documents/hf_ben-xvi_aud_20120822.html';
const sourceOccurrenceId = 'snl-pt-2026-08-22-5682a2fac70e8dae5466d6d2';
const sourceRecordHash = '4d4afd410b114610f1bab9169dc1e408fc25f62cb15fa9577257d1bcda5a4a51';

const observance = {
  id: observanceId,
  churchId: 'church:roman-catholic',
  observanceKey: 'queenship',
  observanceType: 'marian-title',
  subjects: [{ kind: 'person', personId, recognitionId }],
  scope: 'church-attested',
  occurrenceDateImplied: false,
  calendarSystemImplied: false,
  jurisdictionImplied: false,
  rankImplied: false,
  precedenceImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'obligatory-memorial', 'proper-contexts-kept-separate'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: snlSaint, claimTypes: ['observance-attestation', 'marian-title', 'same-person-identity'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['observance-attestation', 'fixed-date', 'marian-title', 'same-person-identity'] }
  ],
  verifiedAt: '2026-10-28'
};

const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 8, day: 22 },
  liturgicalRank: 'obligatory-memorial',
  precedenceClass: 'general-obligatory-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'obligatory-memorial', 'general-calendar', 'portugal-materialization', 'proper-contexts-kept-separate']
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
  dateISO: '2026-08-22',
  rank: 'obligatory-memorial',
  sourceRankCode: 'MO',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'],
    observedDesignation: 'Virgem santa Maria, Rainha – MO'
  }],
  verifiedAt: '2026-10-28'
};

const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-08-22',
  sourceOccurrenceId,
  sourceRecordHash,
  legacyRank: 'memorial',
  canonicalRank: 'obligatory-memorial',
  sourceRankCode: 'MO',
  reviewStatus: 'source-bound-exact',
  resolution: 'exact-fixed-date-binding'
};

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  if (data[key].some((item) => item[idKey] === value[idKey])) throw new Error(`${value[idKey]} already exists in ${path}`);
  data[key].push(value);
  write(path, data);
};

appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-08-22' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-28';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 116;
coverage.coverage.mappedOccurrenceAnchors = 314;
coverage.coverage.remainingLegacyOccurrences = 75;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter((item) => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Queenship of Mary source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 314;
inventory.coverageAtInventory.remainingOccurrences = 75;
inventory.familyCounts['fixed-marian-title'] = 7;
inventory.verifiedAt = '2026-10-28';
write(inventoryPath, inventory);

const candidate = {
  occurrenceKey,
  persons: [],
  recognitions: [],
  reusedSubjects: [{ personId, recognitionId }],
  identityReuseEvidence: [
    { publisher: 'Holy See', url: holySee, claimTypes: ['same-person-identity', 'marian-title', 'observance-attestation', 'fixed-date'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['same-person-identity', 'observance-attestation', 'liturgical-designation', 'jurisdictional-rank'] }
  ],
  observanceId,
  observanceType: 'marian-title',
  sanctoraleRuleId: ruleId,
  contextualBoundary: {
    generalRomanPortugal: 'obligatory-memorial',
    properContextCelebrationsMaterialized: false
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-08-22',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'Virgem santa Maria, Rainha',
    observedDesignation: 'Virgem santa Maria, Rainha – MO',
    legacyRank: 'memorial',
    sourceRankCode: 'MO',
    canonicalRank: 'obligatory-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-45.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-45.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [],
  reusedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 314, requiredForPromotion: 389, remainingLegacyOccurrences: 75 },
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
  ['fixedSanctorale === 115 && ledger.counts.fixedSanctoraleDays === 108', 'fixedSanctorale === 116 && ledger.counts.fixedSanctoraleDays === 109'],
  ['preserve 115 exact Sanctorale occurrences across 108 civil days', 'preserve 116 exact Sanctorale occurrences across 109 civil days'],
  ['sourceBound === 303 && ledger.counts.sourceBoundOccurrences === 313', 'sourceBound === 304 && ledger.counts.sourceBoundOccurrences === 314'],
  ['distinguish 303 source-bound days from 313 source-bound canonical occurrences', 'distinguish 304 source-bound days from 314 source-bound canonical occurrences'],
  ['unresolved === 62', 'unresolved === 61'],
  ["dateISO === '2026-08-22')?.classification === 'unresolved'", "dateISO === '2026-08-25')?.classification === 'unresolved'"],
  ["assert(ledger.entries.find(item => item.dateISO === '2026-08-21')?.canonicalObservanceId === 'observance:pius-x-pope:roman-catholic'", "assert(ledger.entries.find(item => item.dateISO === '2026-08-22')?.canonicalObservanceId === 'observance:queenship-mary:roman-catholic' && ledger.entries.find(item => item.dateISO === '2026-08-22')?.sourceBinding?.legacyObservanceId === 'rc:QueenshipMary', 'Queenship of Mary must retain the exact obligatory-memorial Portugal source binding on 22 August.');\nassert(ledger.entries.find(item => item.dateISO === '2026-08-21')?.canonicalObservanceId === 'observance:pius-x-pope:roman-catholic'"],
  ['+ 115 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 313 source-bound occurrences across 303 days, 62 wholly unbound days', '+ 116 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 314 source-bound occurrences across 304 days, 61 wholly unbound days']
]);

replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 115', 'candidates.length === 116'],
  ['one hundred and fifteen reviewed rules', 'one hundred and sixteen reviewed rules'],
  ["['observance:pius-x-pope:roman-catholic', ['2026-08-21', 'obligatory-memorial', 10, 'general-roman']],", "['observance:pius-x-pope:roman-catholic', ['2026-08-21', 'obligatory-memorial', 10, 'general-roman']],\n    ['observance:queenship-mary:roman-catholic', ['2026-08-22', 'obligatory-memorial', 10, 'general-roman']],"],
  ['occurrences.occurrences.length === 115', 'occurrences.occurrences.length === 116'],
  ['Roman Sanctorale passed: 115 authority-isolated perennial Portugal vectors, including Saint Pius X as a general obligatory memorial with unrelated same-page local observances kept separate', 'Roman Sanctorale passed: 116 authority-isolated perennial Portugal vectors, including the Queenship of Mary as a distinct Marian title reusing one canonical Mary identity while proper contexts remain separate']
]);

replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 117', 'observanceCount === 118'],
  ["assert(marianObservances.length === 3", "assert(marianObservances.length === 4"],
  ["JSON.stringify(['assumption', 'divine-maternity', 'immaculate-conception'])", "JSON.stringify(['assumption', 'divine-maternity', 'immaculate-conception', 'queenship'])"],
  ["marianObservances.every((item) => item.observanceType === 'marian-solemnity'", "marianObservances.every((item) => ['marian-solemnity', 'marian-title'].includes(item.observanceType)"],
  ['for (const observance of first.observances) {', "const queenship = first.observances.find((item) => item.observanceId === 'observance:queenship-mary:roman-catholic');\nassert(queenship?.observanceKey === 'queenship' && queenship.observanceType === 'marian-title' && queenship.subjects?.[0]?.personId === 'mary-of-nazareth', 'Queenship of Mary must be a distinct Marian Observance reusing Mary of Nazareth.');\nassert(queenship.evidence.some((item) => item.claimTypes?.includes('proper-contexts-kept-separate')), 'Proper-context celebrations must remain separate from the general Queenship memorial.');\n\nfor (const observance of first.observances) {"]
]);

replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 115', 'occurrenceCount === 116'],
  ['legacyBridgeCount === 115', 'legacyBridgeCount === 116'],
  ["['observance:pius-x-pope:roman-catholic', ['2026-08-21', 'obligatory-memorial', 'MO', 'rc:StPiusX']],", "['observance:pius-x-pope:roman-catholic', ['2026-08-21', 'obligatory-memorial', 'MO', 'rc:StPiusX']],\n  ['observance:queenship-mary:roman-catholic', ['2026-08-22', 'obligatory-memorial', 'MO', 'rc:QueenshipMary']],"]
]);

replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 115 && explicitOccurrences.length', 'length === 116 && explicitOccurrences.length'],
  ['exactly one hundred and fifteen', 'exactly one hundred and sixteen'],
  ['length === 115 && explicitBridges.length', 'length === 116 && explicitBridges.length'],
  ['the one hundred and fifteen canonical Occurrences', 'the one hundred and sixteen canonical Occurrences'],
  ['mappings.length === 115', 'mappings.length === 116'],
  ['exactly one hundred and fifteen exact source bindings', 'exactly one hundred and sixteen exact source bindings'],
  ["fixedSanctoraleMappingDigest === 'd7403a803626f432d189d536f3d6f219ca545502c1d0cf9439cce47db3e3761f'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 115 && explicitBridgeByOccurrence.size === 115 && fixedMappingByOccurrence.size === 115', 'explicitOccurrenceById.size === 116 && explicitBridgeByOccurrence.size === 116 && fixedMappingByOccurrence.size === 116'],
  ['coveredSourceIds.size === 302 && coveredSourceHashes.size === 302 && coveredOccurrenceIds.size === 302', 'coveredSourceIds.size === 303 && coveredSourceHashes.size === 303 && coveredOccurrenceIds.size === 303'],
  ['totalMapped === 313', 'totalMapped === 314'],
  ['exactly 313/389', 'exactly 314/389'],
  ['remainingLegacyOccurrences === 76', 'remainingLegacyOccurrences === 75'],
  ['exactly 76.', 'exactly 75.'],
  ['coveragePercent === 80.463', 'coveragePercent === 80.72'],
  ['= 115 exact fixed Sanctorale', '= 116 exact fixed Sanctorale'],
  ['; 76 remaining,', '; 75 remaining,']
]);

replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 313 && coveredSourceIds.size === 313', 'coveredRows.length === 314 && coveredSourceIds.size === 314'],
  ['exactly 313 unique', 'exactly 314 unique'],
  ['remaining.length === 76 && remainingSourceIds.size === 76 && remainingSourceHashes.size === 76', 'remaining.length === 75 && remainingSourceIds.size === 75 && remainingSourceHashes.size === 75'],
  ['exactly 76 unique', 'exactly 75 unique'],
  ['sourceBoundOccurrences === 313 && inventory.coverageAtInventory.remainingOccurrences === 76', 'sourceBoundOccurrences === 314 && inventory.coverageAtInventory.remainingOccurrences === 75'],
  ["assert(actualCounts['fixed-person'] === 29, 'Fixed-person backlog classification drifted.');", "assert(actualCounts['fixed-person'] === 29, 'Fixed-person backlog classification drifted.');\nassert(actualCounts['fixed-marian-title'] === 7, 'Fixed Marian-title backlog classification drifted.');"],
  ["assert((actualCounts['fixed-collective']", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:QueenshipMary'), 'Queenship of Mary must leave the unresolved inventory after exact promotion.');\nassert((actualCounts['fixed-collective']"],
  ['Portugal semantic inventory passed: 313 covered + 76 exact unresolved source rows = 389; Saint Pius X is source-bound as an obligatory memorial while unrelated same-page local observances remain separate', 'Portugal semantic inventory passed: 314 covered + 75 exact unresolved source rows = 389; Queenship of Mary reuses the canonical Mary identity while general and proper-context ranks remain separate']
]);

replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["assert(subjectless || namedPersonWithCompanions || (collective ? candidate.observanceType === 'multi-person-commemoration' : !candidate.observanceType || candidate.observanceType === 'person-commemoration'), \`${occurrenceKey} Observance type does not match its subjects.\`);", "assert(subjectless || namedPersonWithCompanions || (collective\n      ? candidate.observanceType === 'multi-person-commemoration'\n      : !candidate.observanceType || ['person-commemoration', 'marian-title'].includes(candidate.observanceType)),\n    \`${occurrenceKey} Observance type does not match its subjects.\`);"],
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-44.json', '20f635a0a49548ed8b3087740619ddca60d05fdfa5c25a34c9ad95efbb860436']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-44.json', '20f635a0a49548ed8b3087740619ddca60d05fdfa5c25a34c9ad95efbb860436'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-45.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));

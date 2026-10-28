import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'john-baptist';
const recognitionId = 'recognition:john-baptist:roman-catholic';
const observanceId = 'observance:john-baptist-martyrdom:roman-catholic';
const ruleId = 'sanctorale-rule:john-baptist-martyrdom:general-roman';
const occurrenceId = 'occurrence:2026-08-29:john-baptist-martyrdom:roman-catholic:pt';
const legacyId = 'rc:BeheadingJohnBaptist';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-8-29';
const snlProper = 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=145';
const holySee = 'https://www.vatican.va/content/benedict-xvi/pt/audiences/2012/documents/hf_ben-xvi_aud_20120829.html';
const vaticanNews = 'https://www.vaticannews.va/en/liturgical-holidays/memorial-of-the-passion-of-saint-john-the-baptist.html';
const sourceOccurrenceId = 'snl-pt-2026-08-29-2d826fedfb9c76412bd23c06';
const sourceRecordHash = '0d25b3b7dcd0d8861964f860b757c194343bc75d7bc914373786f4d46f3476b6';

const people = read('data/canonical-person-anchors.json');
const recognitions = read('data/canonical-recognition-anchors.json');
if (!people.people.some((item) => item.id === personId)) throw new Error('Canonical John the Baptist Person is missing');
if (!recognitions.recognitions.some((item) => item.id === recognitionId && item.personId === personId)) throw new Error('Canonical John the Baptist Recognition is missing');

const observance = {
  id: observanceId,
  churchId: 'church:roman-catholic',
  observanceKey: 'martyrdom',
  observanceType: 'person-commemoration',
  subjects: [{ kind: 'person', personId, recognitionId }],
  scope: 'church-attested',
  occurrenceDateImplied: false,
  calendarSystemImplied: false,
  jurisdictionImplied: false,
  rankImplied: false,
  precedenceImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'obligatory-memorial', 'proper-context-rank-kept-separate'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: snlProper, claimTypes: ['observance-attestation', 'martyrdom', 'identity-reuse'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['observance-attestation', 'roman-calendar-memorial', 'nativity-and-martyrdom-distinct-observances', 'identity-reuse'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['observance-attestation', 'fixed-date', 'passion-title', 'nativity-and-passion-distinct-observances'] }
  ],
  verifiedAt: '2026-10-28'
};

const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 8, day: 29 },
  liturgicalRank: 'obligatory-memorial',
  precedenceClass: 'general-obligatory-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'obligatory-memorial', 'general-calendar', 'portugal-materialization', 'proper-context-rank-kept-separate', 'precedence-not-inferred']
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
  dateISO: '2026-08-29',
  rank: 'obligatory-memorial',
  sourceRankCode: 'MO',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'],
    observedDesignation: 'Martírio de São João Batista – MO'
  }],
  verifiedAt: '2026-10-28'
};

const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-08-29',
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
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-08-29' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-28';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 119;
coverage.coverage.mappedOccurrenceAnchors = 317;
coverage.coverage.remainingLegacyOccurrences = 72;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter((item) => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('John the Baptist source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 317;
inventory.coverageAtInventory.remainingOccurrences = 72;
inventory.familyCounts['fixed-or-major-observance'] = 15;
inventory.verifiedAt = '2026-10-28';
write(inventoryPath, inventory);

const candidate = {
  occurrenceKey: 'john-baptist-martyrdom',
  reusedSubjects: [{ personId, recognitionId }],
  identityReuseEvidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'same-person-identity'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['observance-attestation', 'same-person-identity', 'nativity-and-martyrdom-distinct-observances'] }
  ],
  observanceId,
  observanceKey: 'martyrdom',
  sanctoraleRuleId: ruleId,
  contextualBoundary: {
    generalRomanPortugal: 'obligatory-memorial',
    orderOfMalta: 'feast',
    properRankPromotedToGeneral: false,
    personIdentityReused: true,
    precedenceInferred: false
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-08-29',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'Martírio de São João Batista',
    observedDesignation: 'Martírio de São João Batista – MO',
    legacyRank: 'memorial',
    sourceRankCode: 'MO',
    canonicalRank: 'obligatory-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-48.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-48.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [],
  reusedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 317, requiredForPromotion: 389, remainingLegacyOccurrences: 72 },
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
  ['fixedSanctorale === 118 && ledger.counts.fixedSanctoraleDays === 110', 'fixedSanctorale === 119 && ledger.counts.fixedSanctoraleDays === 111'],
  ['preserve 118 exact Sanctorale occurrences across 110 civil days', 'preserve 119 exact Sanctorale occurrences across 111 civil days'],
  ['sourceBound === 305 && ledger.counts.sourceBoundOccurrences === 316', 'sourceBound === 306 && ledger.counts.sourceBoundOccurrences === 317'],
  ['distinguish 305 source-bound days from 316 source-bound canonical occurrences', 'distinguish 306 source-bound days from 317 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 60', 'ledger.counts.unresolved === 59'],
  ["const september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');", "const august29 = ledger.entries.find(item => item.dateISO === '2026-08-29');\nassert(august29?.canonicalObservanceId === 'observance:john-baptist-martyrdom:roman-catholic' && august29.sourceBinding?.legacyObservanceId === 'rc:BeheadingJohnBaptist', 'The Passion of John the Baptist must reuse the canonical identity through a distinct source-bound Observance on 29 August.');\nconst september26 = ledger.entries.find(item => item.dateISO === '2026-09-26');"],
  ['+ 118 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 316 source-bound occurrences across 305 days, 60 wholly unbound days', '+ 119 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 317 source-bound occurrences across 306 days, 59 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 118', 'candidates.length === 119'],
  ['one hundred and eighteen reviewed rules', 'one hundred and nineteen reviewed rules'],
  ["['observance:louis-ix-france:roman-catholic', ['2026-08-25', 'optional-memorial', 12, 'general-roman']],", "['observance:louis-ix-france:roman-catholic', ['2026-08-25', 'optional-memorial', 12, 'general-roman']],\n    ['observance:john-baptist-martyrdom:roman-catholic', ['2026-08-29', 'obligatory-memorial', 10, 'general-roman']],"],
  ['occurrences.occurrences.length === 118', 'occurrences.occurrences.length === 119'],
  ['Roman Sanctorale passed: 118 authority-isolated perennial Portugal vectors, including Saint Louis and Saint Joseph Calasanz as independent optional memorials on the shared date', 'Roman Sanctorale passed: 119 authority-isolated perennial Portugal vectors, including a distinct John the Baptist martyrdom Observance reusing the canonical Person; Saint Louis and Saint Joseph Calasanz remain independent optional memorials on their shared date']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 120', 'observanceCount === 121'],
  ['const secondJohnObservance = structuredClone(observanceDataset);', "const johnMartyrdom = first.observances.find((item) => item.observanceId === 'observance:john-baptist-martyrdom:roman-catholic');\nassert(johnMartyrdom?.observanceKey === 'martyrdom' && johnMartyrdom.observanceType === 'person-commemoration' && johnMartyrdom.subjects?.[0]?.personId === 'john-baptist', 'John the Baptist martyrdom must be a distinct Observance reusing the canonical Person.');\nassert(johnMartyrdom.evidence.some((item) => item.claimTypes?.includes('proper-context-rank-kept-separate')), 'The Order of Malta proper feast rank must remain contextual.');\n\nconst secondJohnObservance = structuredClone(observanceDataset);"],
  ["secondJohnObservance.observances.push({\n  ...structuredClone(johnSource),\n  id: 'observance:john-baptist-martyrdom:roman-catholic',\n  observanceKey: 'martyrdom',", "secondJohnObservance.observances.push({\n  ...structuredClone(johnSource),\n  id: 'observance:john-baptist-deposition:roman-catholic',\n  observanceKey: 'deposition',"],
  ['length === 2, \'Distinct Observance keys must allow multiple Observances for one Person in one Church.\'', 'length === 3, \'Distinct Observance keys must allow multiple Observances for one Person in one Church.\'']
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 118', 'occurrenceCount === 119'], ['legacyBridgeCount === 118', 'legacyBridgeCount === 119'],
  ["['observance:louis-ix-france:roman-catholic', ['2026-08-25', 'optional-memorial', 'MF', 'rc:StLouis']],", "['observance:louis-ix-france:roman-catholic', ['2026-08-25', 'optional-memorial', 'MF', 'rc:StLouis']],\n  ['observance:john-baptist-martyrdom:roman-catholic', ['2026-08-29', 'obligatory-memorial', 'MO', 'rc:BeheadingJohnBaptist']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 118 && explicitOccurrences.length', 'length === 119 && explicitOccurrences.length'], ['one hundred and eighteen', 'one hundred and nineteen'],
  ['length === 118 && explicitBridges.length', 'length === 119 && explicitBridges.length'], ['the one hundred and eighteen canonical Occurrences', 'the one hundred and nineteen canonical Occurrences'],
  ['mappings.length === 118', 'mappings.length === 119'], ['exactly one hundred and eighteen exact source bindings', 'exactly one hundred and nineteen exact source bindings'],
  ["fixedSanctoraleMappingDigest === '9f52941d391c5e66f8e201684d56a0735ec48f2a04ade29c375880447d8e09e7'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 118 && explicitBridgeByOccurrence.size === 118 && fixedMappingByOccurrence.size === 118', 'explicitOccurrenceById.size === 119 && explicitBridgeByOccurrence.size === 119 && fixedMappingByOccurrence.size === 119'],
  ['coveredSourceIds.size === 305 && coveredSourceHashes.size === 305 && coveredOccurrenceIds.size === 305', 'coveredSourceIds.size === 306 && coveredSourceHashes.size === 306 && coveredOccurrenceIds.size === 306'],
  ['totalMapped === 316', 'totalMapped === 317'], ['exactly 316/389', 'exactly 317/389'],
  ['remainingLegacyOccurrences === 73', 'remainingLegacyOccurrences === 72'], ['exactly 73.', 'exactly 72.'],
  ['coveragePercent === 81.234', 'coveragePercent === 81.491'],
  ['= 118 exact fixed Sanctorale', '= 119 exact fixed Sanctorale'], ['; 73 remaining,', '; 72 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 316 && coveredSourceIds.size === 316', 'coveredRows.length === 317 && coveredSourceIds.size === 317'], ['exactly 316 unique', 'exactly 317 unique'],
  ['remaining.length === 73 && remainingSourceIds.size === 73 && remainingSourceHashes.size === 73', 'remaining.length === 72 && remainingSourceIds.size === 72 && remainingSourceHashes.size === 72'], ['exactly 73 unique', 'exactly 72 unique'],
  ['sourceBoundOccurrences === 316 && inventory.coverageAtInventory.remainingOccurrences === 73', 'sourceBoundOccurrences === 317 && inventory.coverageAtInventory.remainingOccurrences === 72'],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StLouis'), 'Saint Louis must leave the unresolved inventory after exact promotion.');", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StLouis'), 'Saint Louis must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:BeheadingJohnBaptist'), 'John the Baptist martyrdom must leave the unresolved inventory after exact promotion.');"],
  ['Portugal semantic inventory passed: 316 covered + 73 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 317 covered + 72 exact unresolved source rows = 389; John the Baptist martyrdom reuses the canonical Person;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-47.json', 'ac1cbb496c2e8b98e2259eee9681990ba6104bea7b14290e2577baaa34ec9e12']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-47.json', 'ac1cbb496c2e8b98e2259eee9681990ba6104bea7b14290e2577baaa34ec9e12'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-48.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));

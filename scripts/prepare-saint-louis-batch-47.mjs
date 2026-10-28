import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'louis-ix-france';
const recognitionId = `recognition:${personId}:roman-catholic`;
const observanceId = `observance:${personId}:roman-catholic`;
const ruleId = `sanctorale-rule:${personId}:general-roman`;
const occurrenceId = `occurrence:2026-08-25:${personId}:roman-catholic:pt`;
const legacyId = 'rc:StLouis';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-8-25';
const snlSaint = 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=141';
const vaticanNews = 'https://www.vaticannews.va/en/saints/08/25/st--louis---king-of-france-.html';
const holySee = 'https://www.vatican.va/content/john-paul-ii/en/speeches/1997/august/documents/hf_jp-ii_spe_19970824_nunziatura-parigi.html';
const sourceOccurrenceId = 'snl-pt-2026-08-25-b6788316a8c4e9cb5762a749';
const sourceRecordHash = 'e7ba2c942945225495483ee23ce36a01ca4656ad20eb42c4db5e851c49537da1';

const person = {
  id: personId,
  primaryObservanceId: legacyId,
  category: 'saint',
  names: {
    en: 'Saint Louis IX, King of France',
    pt: 'São Luís de França',
    es: 'San Luis IX, rey de Francia',
    it: 'San Luigi IX, re di Francia'
  }
};

const recognition = {
  id: recognitionId,
  personId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'global',
  recognizedAs: 'saint',
  recognitionBasis: 'official-church-attestation',
  ecclesialTitles: ['king', 'layman'],
  scope: 'church-wide',
  calendarMembershipImplied: false,
  observanceDateImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snlSaint, claimTypes: ['saint-designation', 'identity', 'king-of-france', 'death-date'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['saint-designation', 'identity', 'king-of-france', 'canonization', 'fixed-date'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['saint-designation', 'king-of-france', 'feast-attestation'] }
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
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-alternatives-kept-independent'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['observance-attestation', 'fixed-date', 'identity'] }
  ],
  verifiedAt: '2026-10-28'
};

const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 8, day: 25 },
  liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'optional-memorial', 'general-calendar', 'portugal-materialization', 'same-date-alternatives-kept-independent', 'precedence-not-inferred']
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
  dateISO: '2026-08-25',
  rank: 'optional-memorial',
  sourceRankCode: 'MF',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'],
    observedDesignation: 'S. Luís de França – MF'
  }],
  verifiedAt: '2026-10-28'
};

const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-08-25',
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
  if (data[key].some((item) => item[idKey] === value[idKey])) throw new Error(`${value[idKey]} already exists in ${path}`);
  data[key].push(value);
  write(path, data);
};

appendUnique('data/canonical-person-anchors.json', 'people', person);
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-08-25' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-28';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 118;
coverage.coverage.mappedOccurrenceAnchors = 316;
coverage.coverage.remainingLegacyOccurrences = 73;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter((item) => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Saint Louis source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 316;
inventory.coverageAtInventory.remainingOccurrences = 73;
inventory.familyCounts['fixed-person'] = 27;
inventory.verifiedAt = '2026-10-28';
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: recognitionId, personId, ecclesialTitles: ['king', 'layman'], evidenceUrl: vaticanNews },
  observanceId,
  sanctoraleRuleId: ruleId,
  contextualBoundary: {
    generalRomanPortugal: 'optional-memorial',
    sameDateJosephCalasanz: 'optional-memorial',
    sameDateAlternativesMaterializedIndependently: true,
    precedenceInferred: false
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-08-25',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'S. Luís de França',
    observedDesignation: 'S. Luís de França – MF',
    legacyRank: 'optional-memorial',
    sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-47.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-47.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 316, requiredForPromotion: 389, remainingLegacyOccurrences: 73 },
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
  ['fixedSanctorale === 117 && ledger.counts.fixedSanctoraleDays === 110', 'fixedSanctorale === 118 && ledger.counts.fixedSanctoraleDays === 110'],
  ['preserve 117 exact Sanctorale occurrences across 110 civil days', 'preserve 118 exact Sanctorale occurrences across 110 civil days'],
  ['sourceBound === 305 && ledger.counts.sourceBoundOccurrences === 315', 'sourceBound === 305 && ledger.counts.sourceBoundOccurrences === 316'],
  ['distinguish 305 source-bound days from 315 source-bound canonical occurrences', 'distinguish 305 source-bound days from 316 source-bound canonical occurrences'],
  ["assert(august25?.canonicalObservanceId === 'observance:joseph-calasanz:roman-catholic' && august25.sourceBinding?.legacyObservanceId === 'rc:StJosephCalasanz', 'Saint Joseph Calasanz must retain the exact optional-memorial Portugal source binding on 25 August.');\nassert(august25.fixedOptions?.length === 1 && !august25.fixedOptions.some(item => item.sourceBinding?.legacyObservanceId === 'rc:StLouis'), 'Saint Louis must not be collapsed into the Calasanz binding before its independent review.');", "assert(august25?.classification === 'fixed-sanctorale' && august25.fixedOptions?.length === 2, 'The two reviewed optional memorials on 25 August must materialize as two fixed Sanctorale options.');\nassert(august25.fixedOptions.some(item => item.canonicalObservanceId === 'observance:joseph-calasanz:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StJosephCalasanz'), 'Saint Joseph Calasanz must retain its independent optional-memorial source binding.');\nassert(august25.fixedOptions.some(item => item.canonicalObservanceId === 'observance:louis-ix-france:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StLouis'), 'Saint Louis must retain its independent optional-memorial source binding.');"],
  ['+ 117 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 315 source-bound occurrences across 305 days', '+ 118 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 316 source-bound occurrences across 305 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 117', 'candidates.length === 118'], ['one hundred and seventeen reviewed rules', 'one hundred and eighteen reviewed rules'],
  ["['observance:joseph-calasanz:roman-catholic', ['2026-08-25', 'optional-memorial', 12, 'general-roman']],", "['observance:joseph-calasanz:roman-catholic', ['2026-08-25', 'optional-memorial', 12, 'general-roman']],\n    ['observance:louis-ix-france:roman-catholic', ['2026-08-25', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 117', 'occurrences.occurrences.length === 118'],
  ['Roman Sanctorale passed: 117 authority-isolated perennial Portugal vectors, including Saint Joseph Calasanz as an optional memorial independent from Saint Louis on the shared date', 'Roman Sanctorale passed: 118 authority-isolated perennial Portugal vectors, including Saint Louis and Saint Joseph Calasanz as independent optional memorials on the shared date']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 199', 'peopleCount === 200'], ["'pius-x-pope', 'joseph-calasanz',", "'pius-x-pope', 'joseph-calasanz', 'louis-ix-france',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [['recognitionCount === 197', 'recognitionCount === 198'], ['personCoverageCount === 196', 'personCoverageCount === 197']]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 197', 'recognitionCount, 198'], ['personCoverageCount, 196', 'personCoverageCount, 197']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 119', 'observanceCount === 120'], ['personCoverageCount === 196', 'personCoverageCount === 197'],
  ['for (const observance of first.observances) {', "const saintLouis = first.observances.find((item) => item.observanceId === 'observance:louis-ix-france:roman-catholic');\nassert(saintLouis?.observanceType === 'person-commemoration' && saintLouis.subjects?.[0]?.personId === 'louis-ix-france', 'Saint Louis must remain one person-scoped Observance.');\nassert(saintLouis.evidence.some((item) => item.claimTypes?.includes('same-date-alternatives-kept-independent')), 'Saint Louis and Joseph Calasanz must remain independent same-date optional memorials.');\n\nfor (const observance of first.observances) {"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 117', 'occurrenceCount === 118'], ['legacyBridgeCount === 117', 'legacyBridgeCount === 118'],
  ["['observance:joseph-calasanz:roman-catholic', ['2026-08-25', 'optional-memorial', 'MF', 'rc:StJosephCalasanz']],", "['observance:joseph-calasanz:roman-catholic', ['2026-08-25', 'optional-memorial', 'MF', 'rc:StJosephCalasanz']],\n  ['observance:louis-ix-france:roman-catholic', ['2026-08-25', 'optional-memorial', 'MF', 'rc:StLouis']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 117 && explicitOccurrences.length', 'length === 118 && explicitOccurrences.length'], ['exactly one hundred and seventeen', 'exactly one hundred and eighteen'],
  ['length === 117 && explicitBridges.length', 'length === 118 && explicitBridges.length'], ['the one hundred and seventeen canonical Occurrences', 'the one hundred and eighteen canonical Occurrences'],
  ['mappings.length === 117', 'mappings.length === 118'], ['exactly one hundred and seventeen exact source bindings', 'exactly one hundred and eighteen exact source bindings'],
  ["fixedSanctoraleMappingDigest === '622600c8515c0550e43f516702c70e49846f4c4a48734b457958df66ae1a6029'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 117 && explicitBridgeByOccurrence.size === 117 && fixedMappingByOccurrence.size === 117', 'explicitOccurrenceById.size === 118 && explicitBridgeByOccurrence.size === 118 && fixedMappingByOccurrence.size === 118'],
  ['coveredSourceIds.size === 304 && coveredSourceHashes.size === 304 && coveredOccurrenceIds.size === 304', 'coveredSourceIds.size === 305 && coveredSourceHashes.size === 305 && coveredOccurrenceIds.size === 305'],
  ['totalMapped === 315', 'totalMapped === 316'], ['exactly 315/389', 'exactly 316/389'], ['remainingLegacyOccurrences === 74', 'remainingLegacyOccurrences === 73'],
  ['exactly 74.', 'exactly 73.'], ['coveragePercent === 80.977', 'coveragePercent === 81.234'], ['= 117 exact fixed Sanctorale', '= 118 exact fixed Sanctorale'], ['; 74 remaining,', '; 73 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 315 && coveredSourceIds.size === 315', 'coveredRows.length === 316 && coveredSourceIds.size === 316'], ['exactly 315 unique', 'exactly 316 unique'],
  ['remaining.length === 74 && remainingSourceIds.size === 74 && remainingSourceHashes.size === 74', 'remaining.length === 73 && remainingSourceIds.size === 73 && remainingSourceHashes.size === 73'],
  ['exactly 74 unique', 'exactly 73 unique'], ['sourceBoundOccurrences === 315 && inventory.coverageAtInventory.remainingOccurrences === 74', 'sourceBoundOccurrences === 316 && inventory.coverageAtInventory.remainingOccurrences === 73'],
  ["actualCounts['fixed-person'] === 28", "actualCounts['fixed-person'] === 27"],
  ["assert(remaining.some((row) => row.canonicalEventId === 'rc:StLouis'), 'Saint Louis must remain independently unresolved on the shared date.');", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StLouis'), 'Saint Louis must leave the unresolved inventory after exact promotion.');"],
  ['Portugal semantic inventory passed: 315 covered + 74 exact unresolved source rows = 389; Saint Joseph Calasanz is source-bound while Saint Louis remains independently unresolved on the shared date', 'Portugal semantic inventory passed: 316 covered + 73 exact unresolved source rows = 389; Saint Louis and Saint Joseph Calasanz are independently source-bound on the shared date']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-46.json', '8cfe266e33845b1dedb83ddf5ebac2980b7e4e250e2d8ec851e16d7fa15975c4']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-46.json', '8cfe266e33845b1dedb83ddf5ebac2980b7e4e250e2d8ec851e16d7fa15975c4'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-47.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));

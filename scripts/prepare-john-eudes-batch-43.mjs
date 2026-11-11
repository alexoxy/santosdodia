import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'john-eudes';
const recognitionId = `recognition:${personId}:roman-catholic`;
const observanceId = `observance:${personId}:roman-catholic`;
const ruleId = `sanctorale-rule:${personId}:general-roman`;
const occurrenceId = `occurrence:2026-08-19:${personId}:roman-catholic:pt`;
const legacyId = 'rc:StJohnEudes';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-8-19';
const vaticanNews = 'https://www.vaticannews.va/en/saints/08/19/st--john-eudes--priest--founder-of-the-eudists.html';
const holySee = 'https://www.vatican.va/content/benedict-xvi/en/audiences/2009/documents/hf_ben-xvi_aud_20090819.html';
const sourceOccurrenceId = 'snl-pt-2026-08-19-7592021925eb8d366b8c28e5';
const sourceRecordHash = 'bd9d2de4b6530f81bf420c7d9209a6e90e40deeea8bc2ac51235a00edd70fedd';

const person = {
  id: personId,
  primaryObservanceId: legacyId,
  category: 'saint',
  names: {
    en: 'Saint John Eudes, Priest',
    pt: 'São João Eudes, presbítero',
    es: 'San Juan Eudes, presbítero',
    it: 'San Giovanni Eudes, presbitero'
  }
};
const recognition = {
  id: recognitionId,
  personId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'global',
  recognizedAs: 'saint',
  recognitionBasis: 'official-church-attestation',
  ecclesialTitles: ['priest', 'founder'],
  scope: 'church-wide',
  calendarMembershipImplied: false,
  observanceDateImplied: false,
  evidence: [
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['saint-designation', 'identity', 'priest', 'founder-of-the-eudists'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['saint-designation', 'identity', 'priest', 'founder'] }
  ],
  verifiedAt: '2026-10-26'
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
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'contextual-rank-distinction'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['observance-attestation', 'fixed-date', 'identity'] }
  ],
  verifiedAt: '2026-10-26'
};
const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 8, day: 19 },
  liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia', url: snl,
    claimTypes: ['fixed-date', 'optional-memorial', 'general-calendar', 'portugal-materialization', 'institute-proper-ranks-kept-separate']
  }],
  verifiedAt: '2026-10-26'
};
const occurrence = {
  id: occurrenceId,
  observanceId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt',
  calendarSystem: 'gregorian',
  year: 2026,
  dateISO: '2026-08-19',
  rank: 'optional-memorial',
  sourceRankCode: 'MF',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia', url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'],
    observedDesignation: 'S. João Eudes, presbítero – MF'
  }],
  verifiedAt: '2026-10-26'
};
const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-08-19',
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
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-08-19' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-26';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 114;
coverage.coverage.mappedOccurrenceAnchors = 312;
coverage.coverage.remainingLegacyOccurrences = 77;
coverage.verifiedAt = '2026-10-26';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter((item) => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('John Eudes source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 312;
inventory.coverageAtInventory.remainingOccurrences = 77;
inventory.familyCounts['fixed-person'] = 30;
inventory.verifiedAt = '2026-10-26';
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: recognitionId, personId, ecclesialTitles: ['priest', 'founder'], evidenceUrl: vaticanNews },
  observanceId,
  sanctoraleRuleId: ruleId,
  contextualRankBoundary: {
    generalRomanPortugal: 'optional-memorial',
    congregationOfOurLadyOfCharityOfTheGoodShepherd: 'solemnity',
    congregationOfPriestsOfTheSacredHeart: 'obligatory-memorial',
    institutePropersMaterialized: false
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-08-19',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'S. João Eudes, presbítero',
    observedDesignation: 'S. João Eudes, presbítero – MF',
    legacyRank: 'optional-memorial',
    sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial',
    snlUrl: snl
  }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-43.json';
const reviewPack = {
  schemaVersion: 1,
  status: 'reviewed-sanctorale-promotion-candidate-pack',
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact,
  canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates,
  reviewDigestSha256: reviewDigest,
  mutationAllowed: false,
  promotionAllowed: false,
  verifiedAt: '2026-10-26'
};
write(`data/migrations/${reviewFile}`, reviewPack);
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-43.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 312, requiredForPromotion: 389, remainingLegacyOccurrences: 77 },
  fixedSanctoraleMappingDigestSha256: mappingDigest,
  runtimePublicationAllowed: false,
  productionWriteAllowed: false,
  promotionAllowed: false,
  verifiedAt: '2026-10-26'
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
  ['fixedSanctorale === 113 && ledger.counts.fixedSanctoraleDays === 106', 'fixedSanctorale === 114 && ledger.counts.fixedSanctoraleDays === 107'],
  ['preserve 113 exact Sanctorale occurrences across 106 civil days', 'preserve 114 exact Sanctorale occurrences across 107 civil days'],
  ['sourceBound === 301 && ledger.counts.sourceBoundOccurrences === 311', 'sourceBound === 302 && ledger.counts.sourceBoundOccurrences === 312'],
  ['distinguish 301 source-bound days from 311 source-bound canonical occurrences', 'distinguish 302 source-bound days from 312 source-bound canonical occurrences'],
  ['unresolved === 64', 'unresolved === 63'],
  ['An unreviewed day must remain unresolved; text similarity must not create an identity binding.\');', 'An unreviewed day must remain unresolved; text similarity must not create an identity binding.\');'],
  ["ledger.entries.find(item => item.dateISO === '2026-08-19')?.classification === 'unresolved'", "ledger.entries.find(item => item.dateISO === '2026-08-21')?.classification === 'unresolved'"],
  ['+ 113 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 311 source-bound occurrences across 301 days, 64 wholly unbound days', '+ 114 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 312 source-bound occurrences across 302 days, 63 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 113', 'candidates.length === 114'],
  ['one hundred and thirteen reviewed rules', 'one hundred and fourteen reviewed rules'],
  ["['observance:jane-frances-de-chantal:roman-catholic', ['2026-08-12', 'optional-memorial', 12, 'general-roman']],", "['observance:jane-frances-de-chantal:roman-catholic', ['2026-08-12', 'optional-memorial', 12, 'general-roman']],\n    ['observance:john-eudes:roman-catholic', ['2026-08-19', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 113', 'occurrences.occurrences.length === 114'],
  ['Roman Sanctorale passed: 113 authority-isolated perennial Portugal vectors', 'Roman Sanctorale passed: 114 authority-isolated perennial Portugal vectors']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 196', 'peopleCount === 197'],
  ["'sixtus-ii', 'jane-frances-de-chantal',", "'sixtus-ii', 'jane-frances-de-chantal', 'john-eudes',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 194', 'recognitionCount === 195'], ['personCoverageCount === 193', 'personCoverageCount === 194']
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 194', 'recognitionCount, 195'], ['personCoverageCount, 193', 'personCoverageCount, 194']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 115', 'observanceCount === 116'], ['personCoverageCount === 193', 'personCoverageCount === 194'],
  ['for (const observance of first.observances) {', "const johnEudes = first.observances.find((item) => item.observanceId === 'observance:john-eudes:roman-catholic');\nassert(johnEudes?.observanceType === 'person-commemoration' && johnEudes.subjects?.[0]?.personId === 'john-eudes', 'Saint John Eudes must remain one person-scoped Observance.');\nassert(johnEudes.evidence.some((item) => item.claimTypes?.includes('contextual-rank-distinction')), 'John Eudes must preserve evidence that institute proper ranks are context-specific.');\n\nfor (const observance of first.observances) {"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 113', 'occurrenceCount === 114'], ['legacyBridgeCount === 113', 'legacyBridgeCount === 114'],
  ["['observance:jane-frances-de-chantal:roman-catholic', ['2026-08-12', 'optional-memorial', 'MF', 'rc:StJaneFrancesDeChantal']],", "['observance:jane-frances-de-chantal:roman-catholic', ['2026-08-12', 'optional-memorial', 'MF', 'rc:StJaneFrancesDeChantal']],\n  ['observance:john-eudes:roman-catholic', ['2026-08-19', 'optional-memorial', 'MF', 'rc:StJohnEudes']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 113 && explicitOccurrences.length', 'length === 114 && explicitOccurrences.length'],
  ['one hundred and thirteen', 'one hundred and fourteen'],
  ['length === 113 && explicitBridges.length', 'length === 114 && explicitBridges.length'],
  ['mappings.length === 113', 'mappings.length === 114'],
  ["fixedSanctoraleMappingDigest === '6f6dcebfc32b7c2b8204e4d1b218c7f92666a5839aa82474289f265bbfb2aba1'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 113 && explicitBridgeByOccurrence.size === 113 && fixedMappingByOccurrence.size === 113', 'explicitOccurrenceById.size === 114 && explicitBridgeByOccurrence.size === 114 && fixedMappingByOccurrence.size === 114'],
  ['coveredSourceIds.size === 300 && coveredSourceHashes.size === 300 && coveredOccurrenceIds.size === 300', 'coveredSourceIds.size === 301 && coveredSourceHashes.size === 301 && coveredOccurrenceIds.size === 301'],
  ['totalMapped === 311', 'totalMapped === 312'],
  ['exactly 311/389', 'exactly 312/389'],
  ['remainingLegacyOccurrences === 78', 'remainingLegacyOccurrences === 77'],
  ['exactly 78.', 'exactly 77.'],
  ['coveragePercent === 79.949', 'coveragePercent === 80.206'],
  ['= 113 exact fixed Sanctorale', '= 114 exact fixed Sanctorale'],
  ['; 78 remaining,', '; 77 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 311 && coveredSourceIds.size === 311', 'coveredRows.length === 312 && coveredSourceIds.size === 312'],
  ['exactly 311 unique', 'exactly 312 unique'],
  ['remaining.length === 78 && remainingSourceIds.size === 78 && remainingSourceHashes.size === 78', 'remaining.length === 77 && remainingSourceIds.size === 77 && remainingSourceHashes.size === 77'],
  ['exactly 78 unique', 'exactly 77 unique'],
  ['sourceBoundOccurrences === 311 && inventory.coverageAtInventory.remainingOccurrences === 78', 'sourceBoundOccurrences === 312 && inventory.coverageAtInventory.remainingOccurrences === 77'],
  ["actualCounts['fixed-person'] === 31", "actualCounts['fixed-person'] === 30"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJaneFrancesDeChantal'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJaneFrancesDeChantal'),"],
  ["assert((actualCounts['fixed-collective']", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnEudes'), 'Saint John Eudes must leave the unresolved inventory after exact promotion.');\nassert((actualCounts['fixed-collective']"],
  ['Portugal semantic inventory passed: 311 covered + 78 exact unresolved', 'Portugal semantic inventory passed: 312 covered + 77 exact unresolved']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-42.json', '782830e5ca0535315877a5893efd83fbbd74d36097fd573bc739d19cfc502f5c']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-42.json', '782830e5ca0535315877a5893efd83fbbd74d36097fd573bc739d19cfc502f5c'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-43.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));

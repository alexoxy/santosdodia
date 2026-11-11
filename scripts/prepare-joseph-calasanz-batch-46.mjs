import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'joseph-calasanz';
const recognitionId = `recognition:${personId}:roman-catholic`;
const observanceId = `observance:${personId}:roman-catholic`;
const ruleId = `sanctorale-rule:${personId}:general-roman`;
const occurrenceId = `occurrence:2026-08-25:${personId}:roman-catholic:pt`;
const legacyId = 'rc:StJosephCalasanz';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-8-25';
const vaticanNews = 'https://www.vaticannews.va/en/saints/08/25/st--joseph--calasanz--priest--founder-of-piarists.html';
const holySee = 'https://www.vatican.va/content/leo-xiv/en/apost_exhortations/documents/20251004-dilexi-te.html';
const sourceOccurrenceId = 'snl-pt-2026-08-25-9d39b2030aab128ff54e1165';
const sourceRecordHash = 'ec4b0d1075e7d9d8067a481244712dc862599b66e50fc10f231a0b789e745c53';

const person = {
  id: personId,
  primaryObservanceId: legacyId,
  category: 'saint',
  names: {
    en: 'Saint Joseph Calasanz, Priest',
    pt: 'São José de Calasanz, presbítero',
    es: 'San José de Calasanz, presbítero',
    it: 'San Giuseppe Calasanzio, presbitero'
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
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['saint-designation', 'identity', 'priest', 'founder', 'fixed-date'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['saint-designation', 'identity', 'priest', 'founder', 'education-charism'] }
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
    observedDesignation: 'S. José de Calasanz, presbítero – MF'
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
coverage.coverage.explicitOccurrenceAnchors = 117;
coverage.coverage.mappedOccurrenceAnchors = 315;
coverage.coverage.remainingLegacyOccurrences = 74;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter((item) => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Joseph Calasanz source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 315;
inventory.coverageAtInventory.remainingOccurrences = 74;
inventory.familyCounts['fixed-person'] = 28;
inventory.verifiedAt = '2026-10-28';
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: recognitionId, personId, ecclesialTitles: ['priest', 'founder'], evidenceUrl: vaticanNews },
  observanceId,
  sanctoraleRuleId: ruleId,
  contextualBoundary: {
    generalRomanPortugal: 'optional-memorial',
    sameDateSaintLouis: 'optional-memorial',
    sameDateAlternativesMaterializedIndependently: true,
    precedenceInferred: false
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-08-25',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'S. José de Calasanz, presbítero',
    observedDesignation: 'S. José de Calasanz, presbítero – MF',
    legacyRank: 'optional-memorial',
    sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-46.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-46.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 315, requiredForPromotion: 389, remainingLegacyOccurrences: 74 },
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
  ['fixedSanctorale === 116 && ledger.counts.fixedSanctoraleDays === 109', 'fixedSanctorale === 117 && ledger.counts.fixedSanctoraleDays === 110'],
  ['preserve 116 exact Sanctorale occurrences across 109 civil days', 'preserve 117 exact Sanctorale occurrences across 110 civil days'],
  ['sourceBound === 304 && ledger.counts.sourceBoundOccurrences === 314', 'sourceBound === 305 && ledger.counts.sourceBoundOccurrences === 315'],
  ['distinguish 304 source-bound days from 314 source-bound canonical occurrences', 'distinguish 305 source-bound days from 315 source-bound canonical occurrences'],
  ['unresolved === 61', 'unresolved === 60'],
  ["assert(ledger.entries.find(item => item.dateISO === '2026-08-25')?.classification === 'unresolved', 'An unreviewed day must remain unresolved; text similarity must not create an identity binding.');", "const august25 = ledger.entries.find(item => item.dateISO === '2026-08-25');\nassert(august25?.canonicalObservanceId === 'observance:joseph-calasanz:roman-catholic' && august25.sourceBinding?.legacyObservanceId === 'rc:StJosephCalasanz', 'Saint Joseph Calasanz must retain the exact optional-memorial Portugal source binding on 25 August.');\nassert(august25.fixedOptions?.length === 1 && !august25.fixedOptions.some(item => item.sourceBinding?.legacyObservanceId === 'rc:StLouis'), 'Saint Louis must not be collapsed into the Calasanz binding before its independent review.');"],
  ['+ 116 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 314 source-bound occurrences across 304 days, 61 wholly unbound days', '+ 117 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 315 source-bound occurrences across 305 days, 60 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 116', 'candidates.length === 117'], ['one hundred and sixteen reviewed rules', 'one hundred and seventeen reviewed rules'],
  ["['observance:queenship-mary:roman-catholic', ['2026-08-22', 'obligatory-memorial', 10, 'general-roman']],", "['observance:queenship-mary:roman-catholic', ['2026-08-22', 'obligatory-memorial', 10, 'general-roman']],\n    ['observance:joseph-calasanz:roman-catholic', ['2026-08-25', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 116', 'occurrences.occurrences.length === 117'],
  ['Roman Sanctorale passed: 116 authority-isolated perennial Portugal vectors, including the Queenship of Mary as a distinct Marian title reusing one canonical Mary identity while proper contexts remain separate', 'Roman Sanctorale passed: 117 authority-isolated perennial Portugal vectors, including Saint Joseph Calasanz as an optional memorial independent from Saint Louis on the shared date']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 198', 'peopleCount === 199'], ["'sixtus-ii', 'jane-frances-de-chantal', 'john-eudes', 'pius-x-pope',", "'sixtus-ii', 'jane-frances-de-chantal', 'john-eudes', 'pius-x-pope', 'joseph-calasanz',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [['recognitionCount === 196', 'recognitionCount === 197'], ['personCoverageCount === 195', 'personCoverageCount === 196']]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 196', 'recognitionCount, 197'], ['personCoverageCount, 195', 'personCoverageCount, 196']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 118', 'observanceCount === 119'], ['personCoverageCount === 195', 'personCoverageCount === 196'],
  ['for (const observance of first.observances) {', "const josephCalasanz = first.observances.find((item) => item.observanceId === 'observance:joseph-calasanz:roman-catholic');\nassert(josephCalasanz?.observanceType === 'person-commemoration' && josephCalasanz.subjects?.[0]?.personId === 'joseph-calasanz', 'Saint Joseph Calasanz must remain one person-scoped Observance.');\nassert(josephCalasanz.evidence.some((item) => item.claimTypes?.includes('same-date-alternatives-kept-independent')), 'Joseph Calasanz and Saint Louis must remain independent same-date optional memorials.');\n\nfor (const observance of first.observances) {"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 116', 'occurrenceCount === 117'], ['legacyBridgeCount === 116', 'legacyBridgeCount === 117'],
  ["['observance:queenship-mary:roman-catholic', ['2026-08-22', 'obligatory-memorial', 'MO', 'rc:QueenshipMary']],", "['observance:queenship-mary:roman-catholic', ['2026-08-22', 'obligatory-memorial', 'MO', 'rc:QueenshipMary']],\n  ['observance:joseph-calasanz:roman-catholic', ['2026-08-25', 'optional-memorial', 'MF', 'rc:StJosephCalasanz']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 116 && explicitOccurrences.length', 'length === 117 && explicitOccurrences.length'], ['exactly one hundred and sixteen', 'exactly one hundred and seventeen'],
  ['length === 116 && explicitBridges.length', 'length === 117 && explicitBridges.length'], ['the one hundred and sixteen canonical Occurrences', 'the one hundred and seventeen canonical Occurrences'],
  ['mappings.length === 116', 'mappings.length === 117'], ['exactly one hundred and sixteen exact source bindings', 'exactly one hundred and seventeen exact source bindings'],
  ["fixedSanctoraleMappingDigest === 'b21653b60841b09cc4d8b6906e21890a8c92f79c6137befcac476b049e5734b9'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 116 && explicitBridgeByOccurrence.size === 116 && fixedMappingByOccurrence.size === 116', 'explicitOccurrenceById.size === 117 && explicitBridgeByOccurrence.size === 117 && fixedMappingByOccurrence.size === 117'],
  ['coveredSourceIds.size === 303 && coveredSourceHashes.size === 303 && coveredOccurrenceIds.size === 303', 'coveredSourceIds.size === 304 && coveredSourceHashes.size === 304 && coveredOccurrenceIds.size === 304'],
  ['totalMapped === 314', 'totalMapped === 315'], ['exactly 314/389', 'exactly 315/389'], ['remainingLegacyOccurrences === 75', 'remainingLegacyOccurrences === 74'],
  ['exactly 75.', 'exactly 74.'], ['coveragePercent === 80.72', 'coveragePercent === 80.977'], ['= 116 exact fixed Sanctorale', '= 117 exact fixed Sanctorale'], ['; 75 remaining,', '; 74 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 314 && coveredSourceIds.size === 314', 'coveredRows.length === 315 && coveredSourceIds.size === 315'], ['exactly 314 unique', 'exactly 315 unique'],
  ['remaining.length === 75 && remainingSourceIds.size === 75 && remainingSourceHashes.size === 75', 'remaining.length === 74 && remainingSourceIds.size === 74 && remainingSourceHashes.size === 74'],
  ['exactly 75 unique', 'exactly 74 unique'], ['sourceBoundOccurrences === 314 && inventory.coverageAtInventory.remainingOccurrences === 75', 'sourceBoundOccurrences === 315 && inventory.coverageAtInventory.remainingOccurrences === 74'],
  ["actualCounts['fixed-person'] === 29", "actualCounts['fixed-person'] === 28"],
  ["assert((actualCounts['fixed-collective']", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJosephCalasanz'), 'Saint Joseph Calasanz must leave the unresolved inventory after exact promotion.');\nassert(remaining.some((row) => row.canonicalEventId === 'rc:StLouis'), 'Saint Louis must remain independently unresolved on the shared date.');\nassert((actualCounts['fixed-collective']"],
  ['Portugal semantic inventory passed: 314 covered + 75 exact unresolved source rows = 389; Queenship of Mary reuses the canonical Mary identity while general and proper-context ranks remain separate', 'Portugal semantic inventory passed: 315 covered + 74 exact unresolved source rows = 389; Saint Joseph Calasanz is source-bound while Saint Louis remains independently unresolved on the shared date']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-45.json', 'b40353531538d6f40035519525db9ce75d0d575d1de8ab275c7ea04119f73a2e']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-45.json', 'b40353531538d6f40035519525db9ce75d0d575d1de8ab275c7ea04119f73a2e'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-46.json', '" + reviewDigest + "']"]
]);
console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));


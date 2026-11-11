import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-11';
const dateISO = '2026-10-23';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-23';
const identityUrl = 'https://liturgia.pt/santos/santo_v.php?cod_santo=181';
const holySeeCalendarAttestation = 'https://www.vatican.va/news_services/press/sinodo/documents/bollettino_23_ii_speciale-africa-2009/02_inglese/b29_02.html';
const patronageEvidenceUrl = 'https://www.vaticannews.va/it/santo-del-giorno/10/23.html';

const item = {
  personId: 'john-of-capistrano',
  legacyId: 'rc:StJohnCapistrano',
  sourceOccurrenceId: 'snl-pt-2026-10-23-a2ade784a299fb0b8c30f8d3',
  sourceRecordHash: '7e067e45de894b07edb980ea8b9704a8e4024c6b72021e5e6ba17d806aff1c35',
  sourceLabelPt: 'S. João de Capistrano, presbítero',
  names: {
    en: 'Saint John of Capistrano',
    pt: 'São João de Capistrano',
    es: 'San Juan de Capistrano',
    it: 'San Giovanni da Capestrano'
  },
  titles: ['priest', 'religious', 'missionary'],
  recognitionId: 'recognition:john-of-capistrano:roman-catholic',
  observanceId: 'observance:john-of-capistrano:roman-catholic',
  ruleId: 'sanctorale-rule:john-of-capistrano:general-roman',
  occurrenceId: 'occurrence:2026-10-23:john-of-capistrano:roman-catholic:pt'
};

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  const existing = data[key].find(row => row[idKey] === value[idKey]);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(value)) throw new Error(`${value[idKey]} already exists with different semantics in ${path}`);
    return;
  }
  data[key].push(value);
  write(path, data);
};

const person = { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names };
const recognition = {
  id: item.recognitionId,
  personId: item.personId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'global',
  recognizedAs: 'saint',
  recognitionBasis: 'official-church-attestation',
  ecclesialTitles: item.titles,
  scope: 'church-wide',
  calendarMembershipImplied: false,
  observanceDateImplied: false,
  evidence: [
    {
      publisher: 'Secretariado Nacional de Liturgia',
      url: identityUrl,
      claimTypes: ['identity', 'ecclesial-status', 'priesthood', 'religious-order', 'birth-date', 'death-date']
    },
    {
      publisher: 'Holy See',
      url: holySeeCalendarAttestation,
      claimTypes: ['ecclesial-status', 'priesthood', 'franciscan-order', 'optional-memorial', 'fixed-date']
    }
  ],
  verifiedAt
};
const observance = {
  id: item.observanceId,
  churchId: 'church:roman-catholic',
  observanceKey: 'principal-commemoration',
  observanceType: 'person-commemoration',
  subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }],
  scope: 'church-attested',
  occurrenceDateImplied: false,
  calendarSystemImplied: false,
  jurisdictionImplied: false,
  rankImplied: false,
  precedenceImplied: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'contextual-alternatives-kept-independent']
  }],
  verifiedAt
};
const rule = {
  id: item.ruleId,
  observanceId: item.observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 10, day: 23 },
  liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'contextual-alternatives-kept-independent']
  }],
  verifiedAt
};
const occurrence = {
  id: item.occurrenceId,
  observanceId: item.observanceId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt',
  calendarSystem: 'gregorian',
  year: 2026,
  dateISO,
  rank: 'optional-memorial',
  sourceRankCode: 'MF',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'],
    observedDesignation: `${item.sourceLabelPt} – MF`
  }],
  verifiedAt
};

appendUnique('data/canonical-person-anchors.json', 'people', person);
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', {
  occurrenceId: item.occurrenceId,
  legacyObservanceId: item.legacyId,
  dateISO
}, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
const mapping = {
  occurrenceId: item.occurrenceId,
  observanceId: item.observanceId,
  sanctoraleRuleId: item.ruleId,
  legacyObservanceId: item.legacyId,
  expectedDateISO: dateISO,
  sourceOccurrenceId: item.sourceOccurrenceId,
  sourceRecordHash: item.sourceRecordHash,
  legacyRank: 'optional-memorial',
  canonicalRank: 'optional-memorial',
  sourceRankCode: 'MF',
  reviewStatus: 'source-bound-exact',
  resolution: 'exact-fixed-date-binding'
};
const existingMapping = fixed.mappings.find(row => row.occurrenceId === mapping.occurrenceId);
if (existingMapping && JSON.stringify(existingMapping) !== JSON.stringify(mapping)) throw new Error(`Mapping ${mapping.occurrenceId} already exists with different semantics`);
if (!existingMapping) fixed.mappings.push(mapping);
fixed.fixedMappingCount = 136;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 136;
coverage.coverage.mappedOccurrenceAnchors = 334;
coverage.coverage.remainingLegacyOccurrences = 55;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 55)) throw new Error('Saint John of Capistrano source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 334;
inventory.coverageAtInventory.remainingOccurrences = 55;
inventory.familyCounts['fixed-person'] = 10;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: {
    id: item.recognitionId,
    personId: item.personId,
    ecclesialTitles: item.titles,
    evidenceUrl: snl
  },
  observanceId: item.observanceId,
  sanctoraleRuleId: item.ruleId,
  contextualBoundary: {
    generalRoman: 'optional-memorial',
    portugal2026: 'optional-memorial',
    holySeeCalendarAttestation: 'optional-memorial-on-23-october',
    portugalContextualAlternativesKeptIndependent: true,
    contextualRanksKeptSeparate: true,
    franciscanProperRank: 'obligatory-memorial',
    patronageEvidence: {
      claim: 'patron-of-military-chaplains',
      publisher: 'Vatican News',
      url: patronageEvidenceUrl,
      publicationStatus: 'evidence-only'
    },
    patronagePublished: false
  },
  source: {
    canonicalEventId: item.legacyId,
    dateISO,
    sourceOccurrenceId: item.sourceOccurrenceId,
    sourceRecordHash: item.sourceRecordHash,
    sourceLabelPt: item.sourceLabelPt,
    observedDesignation: `${item.sourceLabelPt} – MF`,
    legacyRank: 'optional-memorial',
    sourceRankCode: 'MF',
    canonicalRank: 'optional-memorial',
    snlUrl: snl
  }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-62.json';
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
  verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-62.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId],
  promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: {
    mappedOccurrenceAnchors: 334,
    requiredForPromotion: 389,
    remainingLegacyOccurrences: 55
  },
  fixedSanctoraleMappingDigestSha256: mappingDigest,
  runtimePublicationAllowed: false,
  productionWriteAllowed: false,
  promotionAllowed: false,
  verifiedAt
});

const replace = (path, replacements) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (text.includes(to)) continue;
    if (from instanceof RegExp) {
      if (from.test(text)) text = text.replace(from, to);
      else if (!text.includes(to)) throw new Error(`Missing expected pattern in ${path}: ${from}`);
    } else if (text.includes(from)) text = text.replace(from, to);
    else if (!text.includes(to)) throw new Error(`Missing expected text in ${path}: ${from}`);
  }
  fs.writeFileSync(path, text);
};

replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 135', 'candidates.length === 136'],
  ['one hundred and thirty-five reviewed rules', 'one hundred and thirty-six reviewed rules'],
  ["['observance:john-paul-ii:roman-catholic', ['2026-10-22', 'optional-memorial', 12, 'general-roman']],", "['observance:john-paul-ii:roman-catholic', ['2026-10-22', 'optional-memorial', 12, 'general-roman']],\n    ['observance:john-of-capistrano:roman-catholic', ['2026-10-23', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 135', 'occurrences.occurrences.length === 136'],
  ['Roman Sanctorale passed: 135 authority-isolated perennial Portugal vectors, including Saint John Paul II on 22 October with contextual alternatives kept independent', 'Roman Sanctorale passed: 136 authority-isolated perennial Portugal vectors, including Saint John of Capistrano on 23 October with the Franciscan proper rank kept contextual']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 218', 'peopleCount === 219'],
  ["'john-paul-ii',", "'john-paul-ii', 'john-of-capistrano',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 216', 'recognitionCount === 217'],
  ['personCoverageCount === 215', 'personCoverageCount === 216'],
  ["'recognition:john-paul-ii:roman-catholic',", "'recognition:john-paul-ii:roman-catholic',\n  'recognition:john-of-capistrano:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 216', 'recognitionCount, 217'],
  ['personCoverageCount, 215', 'personCoverageCount, 216']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 137', 'observanceCount === 138'],
  ['personCoverageCount === 215', 'personCoverageCount === 216'],
  ["const johnPaulII = first.observances.find", "const johnCapistrano = first.observances.find((row) => row.observanceId === 'observance:john-of-capistrano:roman-catholic');\nassert(johnCapistrano?.subjects?.[0]?.personId === 'john-of-capistrano', 'Saint John of Capistrano must remain a distinct person-scoped Observance.');\n\nconst johnPaulII = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 135', 'occurrenceCount === 136'],
  ['legacyBridgeCount === 135', 'legacyBridgeCount === 136'],
  ["['observance:john-paul-ii:roman-catholic', ['2026-10-22', 'optional-memorial', 'MF', 'rc:StJohnPaulII']],", "['observance:john-paul-ii:roman-catholic', ['2026-10-22', 'optional-memorial', 'MF', 'rc:StJohnPaulII']],\n  ['observance:john-of-capistrano:roman-catholic', ['2026-10-23', 'optional-memorial', 'MF', 'rc:StJohnCapistrano']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 135 && explicitOccurrences.length', 'length === 136 && explicitOccurrences.length'],
  ['one hundred and thirty-five', 'one hundred and thirty-six'],
  ['length === 135 && explicitBridges.length', 'length === 136 && explicitBridges.length'],
  ['the one hundred and thirty-five canonical Occurrences', 'the one hundred and thirty-six canonical Occurrences'],
  ['mappings.length === 135', 'mappings.length === 136'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 135 && explicitBridgeByOccurrence.size === 135 && fixedMappingByOccurrence.size === 135', 'explicitOccurrenceById.size === 136 && explicitBridgeByOccurrence.size === 136 && fixedMappingByOccurrence.size === 136'],
  ['coveredSourceIds.size === 322 && coveredSourceHashes.size === 322 && coveredOccurrenceIds.size === 322', 'coveredSourceIds.size === 323 && coveredSourceHashes.size === 323 && coveredOccurrenceIds.size === 323'],
  ['totalMapped === 333', 'totalMapped === 334'],
  ['exactly 333/389', 'exactly 334/389'],
  ['remainingLegacyOccurrences === 56', 'remainingLegacyOccurrences === 55'],
  ['exactly 56.', 'exactly 55.'],
  ['coveragePercent === 85.604', 'coveragePercent === 85.861'],
  ['= 135 exact fixed Sanctorale', '= 136 exact fixed Sanctorale'],
  ['; 56 remaining,', '; 55 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 333 && coveredSourceIds.size === 333', 'coveredRows.length === 334 && coveredSourceIds.size === 334'],
  ['exactly 333 unique', 'exactly 334 unique'],
  ['remaining.length === 56 && remainingSourceIds.size === 56 && remainingSourceHashes.size === 56', 'remaining.length === 55 && remainingSourceIds.size === 55 && remainingSourceHashes.size === 55'],
  ['exactly 56 unique', 'exactly 55 unique'],
  ['sourceBoundOccurrences === 333 && inventory.coverageAtInventory.remainingOccurrences === 56', 'sourceBoundOccurrences === 334 && inventory.coverageAtInventory.remainingOccurrences === 55'],
  ["actualCounts['fixed-person'] === 11", "actualCounts['fixed-person'] === 10"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnPaulII'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnCapistrano'), 'Saint John of Capistrano must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnPaulII'),"],
  ['Portugal semantic inventory passed: 333 covered + 56 exact unresolved source rows = 389; Saint John Paul II is source-bound on 22 October with contextual alternatives kept independent;', 'Portugal semantic inventory passed: 334 covered + 55 exact unresolved source rows = 389; Saint John of Capistrano is source-bound on 23 October with the Franciscan proper rank kept contextual;']
]);
const reviewPackTestPath = 'scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs';
let reviewPackTest = fs.readFileSync(reviewPackTestPath, 'utf8');
reviewPackTest = reviewPackTest.replace(/^\s*\['roman-catholic-pt-2026-v2\.sanctorale-review-batch-62\.json', '[a-f0-9]{64}'\],?\n/gmu, '');
const batch61Entry = "  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-61.json', 'aa6c210986a720f77c87d7e9908b249d6160a3b4623f1335292d4e417a296171'],";
if (!reviewPackTest.includes(batch61Entry)) throw new Error('Missing reviewed batch 61 digest entry');
reviewPackTest = reviewPackTest.replace(batch61Entry, `${batch61Entry}\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-62.json', '${reviewDigest}'],`);
fs.writeFileSync(reviewPackTestPath, reviewPackTest);
replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['ledger.counts.fixedSanctorale === 135 && ledger.counts.fixedSanctoraleDays === 121', 'ledger.counts.fixedSanctorale === 136 && ledger.counts.fixedSanctoraleDays === 122'],
  ['preserve 135 exact Sanctorale occurrences across 121 civil days', 'preserve 136 exact Sanctorale occurrences across 122 civil days'],
  ['ledger.counts.sourceBound === 314 && ledger.counts.sourceBoundOccurrences === 333', 'ledger.counts.sourceBound === 315 && ledger.counts.sourceBoundOccurrences === 334'],
  ['distinguish 314 source-bound days from 333 source-bound canonical occurrences', 'distinguish 315 source-bound days from 334 source-bound canonical occurrences'],
  ["ledger.counts.unresolved === 51", "ledger.counts.unresolved === 50"],
  ["const october22 = ledger.entries.find", "const october23 = ledger.entries.find((day) => day.dateISO === '2026-10-23');\nassert(october23?.classification === 'fixed-sanctorale' && october23.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:john-of-capistrano:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StJohnCapistrano'), 'Saint John of Capistrano must retain the exact optional-memorial source binding on 23 October.');\n\nconst october22 = ledger.entries.find"],
  ['135 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 333 source-bound occurrences across 314 days, 51 wholly unbound days', '136 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 334 source-bound occurrences across 315 days, 50 wholly unbound days']
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));


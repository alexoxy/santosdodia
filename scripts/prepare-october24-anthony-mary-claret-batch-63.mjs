import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-11';
const dateISO = '2026-10-24';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-24';
const identityUrl = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-10-24';
const vaticanIdentityAttestation = 'https://www.vaticanstate.va/en/component/content/article/october-24-saint-anthony-mary-claret.html';
const patronageEvidenceUrl = 'https://www.claret.org/our-congregation/st-anthony-mary-claret/';

const item = {
  personId: 'anthony-mary-claret',
  legacyId: 'rc:StAnthonyMaryClaret',
  sourceOccurrenceId: 'snl-pt-2026-10-24-0d12f5faa2b67b6ded439033',
  sourceRecordHash: 'ca0dea63d820389b70bc77ae1eff321ecaa9638c28a316eefd83dbf5ec7ed400',
  sourceLabelPt: 'S. António Maria Claret, bispo',
  names: {
    en: 'Saint Anthony Mary Claret',
    pt: 'Santo António Maria Claret',
    es: 'San Antonio María Claret',
    it: "Sant'Antonio Maria Claret"
  },
  titles: ['bishop', 'missionary', 'founder'],
  recognitionId: 'recognition:anthony-mary-claret:roman-catholic',
  observanceId: 'observance:anthony-mary-claret:roman-catholic',
  ruleId: 'sanctorale-rule:anthony-mary-claret:general-roman',
  occurrenceId: 'occurrence:2026-10-24:anthony-mary-claret:roman-catholic:pt'
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
      claimTypes: ['identity', 'ecclesial-status', 'priesthood', 'episcopate', 'missionary-work', 'founder-status', 'death-date']
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
  dateRule: { type: 'fixed', month: 10, day: 24 },
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
fixed.fixedMappingCount = 137;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 137;
coverage.coverage.mappedOccurrenceAnchors = 335;
coverage.coverage.remainingLegacyOccurrences = 54;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 54)) throw new Error('Saint Anthony Mary Claret source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 335;
inventory.coverageAtInventory.remainingOccurrences = 54;
inventory.familyCounts['fixed-person'] = 9;
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
    vaticanIdentityEvidence: {
      claim: 'bishop-founder-canonized-fixed-death-date-24-october',
      publisher: 'Vatican City State',
      url: vaticanIdentityAttestation,
      publicationStatus: 'evidence-only'
    },
    portugalContextualAlternativesKeptIndependent: true,
    contextualRanksKeptSeparate: true,
    claretianProperRank: 'solemnity',
    saturdayMemorialOfMaryKeptIndependent: true,
    bejaSaintSisenandoSolemnityKeptIndependent: true,
    patronageEvidence: {
      claim: 'co-patron-of-diocese-of-las-palmas',
      publisher: 'Claretian Missionaries',
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
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-63.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-63.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId],
  promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: {
    mappedOccurrenceAnchors: 335,
    requiredForPromotion: 389,
    remainingLegacyOccurrences: 54
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
  ['candidates.length === 136', 'candidates.length === 137'],
  ['one hundred and thirty-six reviewed rules', 'one hundred and thirty-seven reviewed rules'],
  ["['observance:john-of-capistrano:roman-catholic', ['2026-10-23', 'optional-memorial', 12, 'general-roman']],", "['observance:john-of-capistrano:roman-catholic', ['2026-10-23', 'optional-memorial', 12, 'general-roman']],\n    ['observance:anthony-mary-claret:roman-catholic', ['2026-10-24', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 136', 'occurrences.occurrences.length === 137'],
  ['Roman Sanctorale passed: 136 authority-isolated perennial Portugal vectors, including Saint John of Capistrano on 23 October with the Franciscan proper rank kept contextual', 'Roman Sanctorale passed: 137 authority-isolated perennial Portugal vectors, including Saint Anthony Mary Claret on 24 October with the Claretian proper rank kept contextual']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 219', 'peopleCount === 220'],
  ["'john-of-capistrano',", "'john-of-capistrano', 'anthony-mary-claret',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 217', 'recognitionCount === 218'],
  ['personCoverageCount === 216', 'personCoverageCount === 217'],
  ["'recognition:john-of-capistrano:roman-catholic',", "'recognition:john-of-capistrano:roman-catholic',\n  'recognition:anthony-mary-claret:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 217', 'recognitionCount, 218'],
  ['personCoverageCount, 216', 'personCoverageCount, 217']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 138', 'observanceCount === 139'],
  ['personCoverageCount === 216', 'personCoverageCount === 217'],
  ["const johnCapistrano = first.observances.find", "const anthonyMaryClaret = first.observances.find((row) => row.observanceId === 'observance:anthony-mary-claret:roman-catholic');\nassert(anthonyMaryClaret?.subjects?.[0]?.personId === 'anthony-mary-claret', 'Saint Anthony Mary Claret must remain a distinct person-scoped Observance.');\n\nconst johnCapistrano = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 136', 'occurrenceCount === 137'],
  ['legacyBridgeCount === 136', 'legacyBridgeCount === 137'],
  ["['observance:john-of-capistrano:roman-catholic', ['2026-10-23', 'optional-memorial', 'MF', 'rc:StJohnCapistrano']],", "['observance:john-of-capistrano:roman-catholic', ['2026-10-23', 'optional-memorial', 'MF', 'rc:StJohnCapistrano']],\n  ['observance:anthony-mary-claret:roman-catholic', ['2026-10-24', 'optional-memorial', 'MF', 'rc:StAnthonyMaryClaret']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 136 && explicitOccurrences.length', 'length === 137 && explicitOccurrences.length'],
  ['one hundred and thirty-six', 'one hundred and thirty-seven'],
  ['length === 136 && explicitBridges.length', 'length === 137 && explicitBridges.length'],
  ['the one hundred and thirty-six canonical Occurrences', 'the one hundred and thirty-seven canonical Occurrences'],
  ['mappings.length === 136', 'mappings.length === 137'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 136 && explicitBridgeByOccurrence.size === 136 && fixedMappingByOccurrence.size === 136', 'explicitOccurrenceById.size === 137 && explicitBridgeByOccurrence.size === 137 && fixedMappingByOccurrence.size === 137'],
  ['coveredSourceIds.size === 323 && coveredSourceHashes.size === 323 && coveredOccurrenceIds.size === 323', 'coveredSourceIds.size === 324 && coveredSourceHashes.size === 324 && coveredOccurrenceIds.size === 324'],
  ['totalMapped === 334', 'totalMapped === 335'],
  ['exactly 334/389', 'exactly 335/389'],
  ['remainingLegacyOccurrences === 55', 'remainingLegacyOccurrences === 54'],
  ['exactly 55.', 'exactly 54.'],
  ['coveragePercent === 85.861', 'coveragePercent === 86.118'],
  ['= 136 exact fixed Sanctorale', '= 137 exact fixed Sanctorale'],
  ['; 55 remaining,', '; 54 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 334 && coveredSourceIds.size === 334', 'coveredRows.length === 335 && coveredSourceIds.size === 335'],
  ['exactly 334 unique', 'exactly 335 unique'],
  ['remaining.length === 55 && remainingSourceIds.size === 55 && remainingSourceHashes.size === 55', 'remaining.length === 54 && remainingSourceIds.size === 54 && remainingSourceHashes.size === 54'],
  ['exactly 55 unique', 'exactly 54 unique'],
  ['sourceBoundOccurrences === 334 && inventory.coverageAtInventory.remainingOccurrences === 55', 'sourceBoundOccurrences === 335 && inventory.coverageAtInventory.remainingOccurrences === 54'],
  ["actualCounts['fixed-person'] === 10", "actualCounts['fixed-person'] === 9"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnCapistrano'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StAnthonyMaryClaret'), 'Saint Anthony Mary Claret must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnCapistrano'),"],
  ['Portugal semantic inventory passed: 334 covered + 55 exact unresolved source rows = 389; Saint John of Capistrano is source-bound on 23 October with the Franciscan proper rank kept contextual;', 'Portugal semantic inventory passed: 335 covered + 54 exact unresolved source rows = 389; Saint Anthony Mary Claret is source-bound on 24 October with the Claretian proper rank kept contextual;']
]);
const reviewPackTestPath = 'scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs';
let reviewPackTest = fs.readFileSync(reviewPackTestPath, 'utf8');
reviewPackTest = reviewPackTest.replace(/^\s*\['roman-catholic-pt-2026-v2\.sanctorale-review-batch-63\.json', '[a-f0-9]{64}'\],?\n/gmu, '');
const batch62Entry = "  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-62.json', '95b78c7c43a8990269780a36f0bdfa6ce982cc6b530aed000659f7575012a8c0'],";
if (!reviewPackTest.includes(batch62Entry)) throw new Error('Missing reviewed batch 62 digest entry');
reviewPackTest = reviewPackTest.replace(batch62Entry, `${batch62Entry}\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-63.json', '${reviewDigest}'],`);
fs.writeFileSync(reviewPackTestPath, reviewPackTest);
replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['ledger.counts.fixedSanctorale === 136 && ledger.counts.fixedSanctoraleDays === 122', 'ledger.counts.fixedSanctorale === 137 && ledger.counts.fixedSanctoraleDays === 123'],
  ['preserve 136 exact Sanctorale occurrences across 122 civil days', 'preserve 137 exact Sanctorale occurrences across 123 civil days'],
  ['ledger.counts.sourceBound === 315 && ledger.counts.sourceBoundOccurrences === 334', 'ledger.counts.sourceBound === 315 && ledger.counts.sourceBoundOccurrences === 335'],
  ['distinguish 315 source-bound days from 334 source-bound canonical occurrences', 'distinguish 315 source-bound days from 335 source-bound canonical occurrences'],
  ["const october23 = ledger.entries.find", "const october24 = ledger.entries.find((day) => day.dateISO === '2026-10-24');\nassert(october24?.classification === 'mixed-optional-alternatives' && october24.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:anthony-mary-claret:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StAnthonyMaryClaret'), 'Saint Anthony Mary Claret must retain the exact optional-memorial source binding on 24 October.');\nassert(october24?.temporalFamilyOptions?.some(item => item.sourceBinding?.legacyObservanceId === 'rc:SatMemBVM14'), 'The Saturday Marian optional memorial must remain independently source-bound on 24 October.');\n\nconst october23 = ledger.entries.find"],
  ['136 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 334 source-bound occurrences across 315 days, 50 wholly unbound days', '137 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 335 source-bound occurrences across 315 days, 50 wholly unbound days']
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));




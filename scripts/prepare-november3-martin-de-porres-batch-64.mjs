import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-11';
const dateISO = '2026-11-03';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-11-3';
const identityUrl = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-11-03';
const vaticanIdentityAttestation = 'https://www.vatican.va/content/john-xxiii/es/speeches/1962/documents/hf_j-xxiii_spe_19620412_de-porres.html';
const patronageEvidenceUrl = 'https://es.op.org/santos/s-martini-de-porres/';

const item = {
  personId: 'martin-de-porres',
  legacyId: 'rc:StMartinPorres',
  sourceOccurrenceId: 'snl-pt-2026-11-03-0b7154e0895de737831b7baf',
  sourceRecordHash: 'b96c07c2ba9885553d86654c429a004a347ce29faeac9e4f6b935a53c1c01345',
  sourceLabelPt: 'S. Martinho de Porres, religioso',
  names: {
    en: 'Saint Martin de Porres',
    pt: 'São Martinho de Porres',
    es: 'San Martín de Porres',
    it: 'San Martino de Porres'
  },
  titles: ['religious', 'dominican-brother'],
  recognitionId: 'recognition:martin-de-porres:roman-catholic',
  observanceId: 'observance:martin-de-porres:roman-catholic',
  ruleId: 'sanctorale-rule:martin-de-porres:general-roman',
  occurrenceId: 'occurrence:2026-11-03:martin-de-porres:roman-catholic:pt'
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
      claimTypes: ['identity', 'ecclesial-status', 'religious-order', 'charitable-service', 'death-year']
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
  dateRule: { type: 'fixed', month: 11, day: 3 },
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
fixed.fixedMappingCount = 138;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 138;
coverage.coverage.mappedOccurrenceAnchors = 336;
coverage.coverage.remainingLegacyOccurrences = 53;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 53)) throw new Error('Saint Martin de Porres source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 336;
inventory.coverageAtInventory.remainingOccurrences = 53;
inventory.familyCounts['fixed-person'] = 8;
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
      claim: 'canonization-approved-religious-charity',
      publisher: 'Holy See',
      url: vaticanIdentityAttestation,
      publicationStatus: 'evidence-only'
    },
    portugalContextualAlternativesKeptIndependent: true,
    contextualRanksKeptSeparate: true,
    dominicanProperRank: 'feast',
    vianaCathedralDedicationKeptIndependent: true,
    jesuitRupertMayerKeptIndependent: true,
    passionistPioCampidelliKeptIndependent: true,
    patronageEvidence: {
      claim: 'heavenly-patron-of-dominican-cooperator-brothers',
      publisher: 'Order of Preachers',
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
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-64.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-64.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId],
  promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: {
    mappedOccurrenceAnchors: 336,
    requiredForPromotion: 389,
    remainingLegacyOccurrences: 53
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
  ['candidates.length === 137', 'candidates.length === 138'],
  ['one hundred and thirty-seven reviewed rules', 'one hundred and thirty-eight reviewed rules'],
  ["['observance:anthony-mary-claret:roman-catholic', ['2026-10-24', 'optional-memorial', 12, 'general-roman']],", "['observance:anthony-mary-claret:roman-catholic', ['2026-10-24', 'optional-memorial', 12, 'general-roman']],\n    ['observance:martin-de-porres:roman-catholic', ['2026-11-03', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 137', 'occurrences.occurrences.length === 138'],
  ['Roman Sanctorale passed: 137 authority-isolated perennial Portugal vectors, including Saint Anthony Mary Claret on 24 October with the Claretian proper rank kept contextual', 'Roman Sanctorale passed: 138 authority-isolated perennial Portugal vectors, including Saint Martin de Porres on 3 November with the Dominican proper rank kept contextual']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 220', 'peopleCount === 221'],
  ["'anthony-mary-claret',", "'anthony-mary-claret', 'martin-de-porres',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 218', 'recognitionCount === 219'],
  ['personCoverageCount === 217', 'personCoverageCount === 218'],
  ["'recognition:anthony-mary-claret:roman-catholic',", "'recognition:anthony-mary-claret:roman-catholic',\n  'recognition:martin-de-porres:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 218', 'recognitionCount, 219'],
  ['personCoverageCount, 217', 'personCoverageCount, 218']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 139', 'observanceCount === 140'],
  ['personCoverageCount === 217', 'personCoverageCount === 218'],
  ["const anthonyMaryClaret = first.observances.find", "const martinDePorres = first.observances.find((row) => row.observanceId === 'observance:martin-de-porres:roman-catholic');\nassert(martinDePorres?.subjects?.[0]?.personId === 'martin-de-porres', 'Saint Martin de Porres must remain a distinct person-scoped Observance.');\n\nconst anthonyMaryClaret = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 137', 'occurrenceCount === 138'],
  ['legacyBridgeCount === 137', 'legacyBridgeCount === 138'],
  ["['observance:anthony-mary-claret:roman-catholic', ['2026-10-24', 'optional-memorial', 'MF', 'rc:StAnthonyMaryClaret']],", "['observance:anthony-mary-claret:roman-catholic', ['2026-10-24', 'optional-memorial', 'MF', 'rc:StAnthonyMaryClaret']],\n  ['observance:martin-de-porres:roman-catholic', ['2026-11-03', 'optional-memorial', 'MF', 'rc:StMartinPorres']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 137 && explicitOccurrences.length', 'length === 138 && explicitOccurrences.length'],
  ['one hundred and thirty-seven', 'one hundred and thirty-eight'],
  ['length === 137 && explicitBridges.length', 'length === 138 && explicitBridges.length'],
  ['the one hundred and thirty-seven canonical Occurrences', 'the one hundred and thirty-eight canonical Occurrences'],
  ['mappings.length === 137', 'mappings.length === 138'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 137 && explicitBridgeByOccurrence.size === 137 && fixedMappingByOccurrence.size === 137', 'explicitOccurrenceById.size === 138 && explicitBridgeByOccurrence.size === 138 && fixedMappingByOccurrence.size === 138'],
  ['coveredSourceIds.size === 324 && coveredSourceHashes.size === 324 && coveredOccurrenceIds.size === 324', 'coveredSourceIds.size === 325 && coveredSourceHashes.size === 325 && coveredOccurrenceIds.size === 325'],
  ['totalMapped === 335', 'totalMapped === 336'],
  ['exactly 335/389', 'exactly 336/389'],
  ['remainingLegacyOccurrences === 54', 'remainingLegacyOccurrences === 53'],
  ['exactly 54.', 'exactly 53.'],
  ['coveragePercent === 86.118', 'coveragePercent === 86.375'],
  ['= 137 exact fixed Sanctorale', '= 138 exact fixed Sanctorale'],
  ['; 54 remaining,', '; 53 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 335 && coveredSourceIds.size === 335', 'coveredRows.length === 336 && coveredSourceIds.size === 336'],
  ['exactly 335 unique', 'exactly 336 unique'],
  ['remaining.length === 54 && remainingSourceIds.size === 54 && remainingSourceHashes.size === 54', 'remaining.length === 53 && remainingSourceIds.size === 53 && remainingSourceHashes.size === 53'],
  ['exactly 54 unique', 'exactly 53 unique'],
  ['sourceBoundOccurrences === 335 && inventory.coverageAtInventory.remainingOccurrences === 54', 'sourceBoundOccurrences === 336 && inventory.coverageAtInventory.remainingOccurrences === 53'],
  ["actualCounts['fixed-person'] === 9", "actualCounts['fixed-person'] === 8"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StAnthonyMaryClaret'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StMartinPorres'), 'Saint Martin de Porres must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StAnthonyMaryClaret'),"],
  ['Portugal semantic inventory passed: 335 covered + 54 exact unresolved source rows = 389; Saint Anthony Mary Claret is source-bound on 24 October with the Claretian proper rank kept contextual;', 'Portugal semantic inventory passed: 336 covered + 53 exact unresolved source rows = 389; Saint Martin de Porres is source-bound on 3 November with the Dominican proper rank kept contextual;']
]);
const reviewPackTestPath = 'scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs';
let reviewPackTest = fs.readFileSync(reviewPackTestPath, 'utf8');
reviewPackTest = reviewPackTest.replace(/^\s*\['roman-catholic-pt-2026-v2\.sanctorale-review-batch-64\.json', '[a-f0-9]{64}'\],?\n/gmu, '');
const batch63Entry = "  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-63.json', '5f3031318235154c0e1bce0f366a41bbb21173ec6d2fd12a6451a549a50eb53e'],";
if (!reviewPackTest.includes(batch63Entry)) throw new Error('Missing reviewed batch 63 digest entry');
reviewPackTest = reviewPackTest.replace(batch63Entry, `${batch63Entry}\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-64.json', '${reviewDigest}'],`);
fs.writeFileSync(reviewPackTestPath, reviewPackTest);
replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['ledger.counts.fixedSanctorale === 137 && ledger.counts.fixedSanctoraleDays === 123', 'ledger.counts.fixedSanctorale === 138 && ledger.counts.fixedSanctoraleDays === 124'],
  ['preserve 137 exact Sanctorale occurrences across 123 civil days', 'preserve 138 exact Sanctorale occurrences across 124 civil days'],
  ['ledger.counts.sourceBound === 315 && ledger.counts.sourceBoundOccurrences === 335', 'ledger.counts.sourceBound === 316 && ledger.counts.sourceBoundOccurrences === 336'],
  ['distinguish 315 source-bound days from 335 source-bound canonical occurrences', 'distinguish 316 source-bound days from 336 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 50', 'ledger.counts.unresolved === 49'],
  ["const october24 = ledger.entries.find", "const november3 = ledger.entries.find((day) => day.dateISO === '2026-11-03');\nassert(november3?.classification === 'fixed-sanctorale' && november3.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:martin-de-porres:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StMartinPorres'), 'Saint Martin de Porres must retain the exact optional-memorial source binding on 3 November.');\nassert(!november3?.temporalFamilyOptions?.some(item => item.sourceBinding?.legacyObservanceId === 'rc:OrdWeekday31Tuesday'), 'The suppressed Ordinary Time weekday candidate must not become a second source-bound option on 3 November.');\n\nconst october24 = ledger.entries.find"],
  ['137 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 335 source-bound occurrences across 315 days, 50 wholly unbound days', '138 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 336 source-bound occurrences across 316 days, 49 wholly unbound days']
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));






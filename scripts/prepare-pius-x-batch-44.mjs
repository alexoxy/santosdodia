import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const personId = 'pius-x-pope';
const recognitionId = `recognition:${personId}:roman-catholic`;
const observanceId = `observance:${personId}:roman-catholic`;
const ruleId = `sanctorale-rule:${personId}:general-roman`;
const occurrenceId = `occurrence:2026-08-21:${personId}:roman-catholic:pt`;
const legacyId = 'rc:StPiusX';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-8-21';
const vaticanNews = 'https://www.vaticannews.va/en/saints/08/21/st--pius-x--pope.html';
const holySee = 'https://www.vatican.va/content/vatican/en/holy-father/pio-x.html';
const sourceOccurrenceId = 'snl-pt-2026-08-21-3bb0d8183f01222a96745226';
const sourceRecordHash = '23b573b25487406fabf4b4faa837c712cb838e526f96c98c1c265527bf72e33f';

const person = {
  id: personId,
  primaryObservanceId: legacyId,
  category: 'saint',
  names: {
    en: 'Saint Pius X, Pope',
    pt: 'São Pio X, papa',
    es: 'San Pío X, papa',
    it: 'San Pio X, papa'
  }
};

const recognition = {
  id: recognitionId,
  personId,
  churchId: 'church:roman-catholic',
  jurisdictionId: 'global',
  recognizedAs: 'saint',
  recognitionBasis: 'official-church-attestation',
  ecclesialTitles: ['pope', 'bishop'],
  scope: 'church-wide',
  calendarMembershipImplied: false,
  observanceDateImplied: false,
  evidence: [
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['saint-designation', 'identity', 'pope', 'fixed-date'] },
    { publisher: 'Holy See', url: holySee, claimTypes: ['identity', 'pope', 'secular-name', 'pontificate'] }
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
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'obligatory-memorial', 'same-page-local-notes-kept-separate'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['observance-attestation', 'fixed-date', 'identity'] }
  ],
  verifiedAt: '2026-10-28'
};

const rule = {
  id: ruleId,
  observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 8, day: 21 },
  liturgicalRank: 'obligatory-memorial',
  precedenceClass: 'general-obligatory-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'obligatory-memorial', 'general-calendar', 'portugal-materialization', 'unrelated-local-observances-kept-separate']
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
  dateISO: '2026-08-21',
  rank: 'obligatory-memorial',
  sourceRankCode: 'MO',
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'],
    observedDesignation: 'S. Pio X, papa – MO'
  }],
  verifiedAt: '2026-10-28'
};

const mapping = {
  occurrenceId,
  observanceId,
  sanctoraleRuleId: ruleId,
  legacyObservanceId: legacyId,
  expectedDateISO: '2026-08-21',
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

appendUnique('data/canonical-person-anchors.json', 'people', person);
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId, legacyObservanceId: legacyId, dateISO: '2026-08-21' }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
fixed.mappings.push(mapping);
fixed.verifiedAt = '2026-10-28';
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 115;
coverage.coverage.mappedOccurrenceAnchors = 313;
coverage.coverage.remainingLegacyOccurrences = 76;
coverage.verifiedAt = '2026-10-28';
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter((item) => item.sourceOccurrenceId !== sourceOccurrenceId);
if (inventory.remaining.length !== before - 1) throw new Error('Pius X source row missing from unresolved inventory');
inventory.coverageAtInventory.sourceBoundOccurrences = 313;
inventory.coverageAtInventory.remainingOccurrences = 76;
inventory.familyCounts['fixed-person'] = 29;
inventory.verifiedAt = '2026-10-28';
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: recognitionId, personId, ecclesialTitles: ['pope', 'bishop'], evidenceUrl: vaticanNews },
  observanceId,
  sanctoraleRuleId: ruleId,
  contextualBoundary: {
    generalRomanPortugal: 'obligatory-memorial',
    samePageLocalNotesMaterialized: false
  },
  source: {
    canonicalEventId: legacyId,
    dateISO: '2026-08-21',
    sourceOccurrenceId,
    sourceRecordHash,
    sourceLabelPt: 'S. Pio X, papa',
    observedDesignation: 'S. Pio X, papa – MO',
    legacyRank: 'memorial',
    sourceRankCode: 'MO',
    canonicalRank: 'obligatory-memorial',
    snlUrl: snl
  }
};

const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-44.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-44.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [personId],
  promotedObservanceIds: [observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 313, requiredForPromotion: 389, remainingLegacyOccurrences: 76 },
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
  ['fixedSanctorale === 114 && ledger.counts.fixedSanctoraleDays === 107', 'fixedSanctorale === 115 && ledger.counts.fixedSanctoraleDays === 108'],
  ['preserve 114 exact Sanctorale occurrences across 107 civil days', 'preserve 115 exact Sanctorale occurrences across 108 civil days'],
  ['sourceBound === 302 && ledger.counts.sourceBoundOccurrences === 312', 'sourceBound === 303 && ledger.counts.sourceBoundOccurrences === 313'],
  ['distinguish 302 source-bound days from 312 source-bound canonical occurrences', 'distinguish 303 source-bound days from 313 source-bound canonical occurrences'],
  ['unresolved === 63', 'unresolved === 62'],
  ["assert(ledger.entries.find(item => item.dateISO === '2026-08-12')?.canonicalObservanceId === 'observance:jane-frances-de-chantal:roman-catholic'", "assert(ledger.entries.find(item => item.dateISO === '2026-08-21')?.canonicalObservanceId === 'observance:pius-x-pope:roman-catholic' && ledger.entries.find(item => item.dateISO === '2026-08-21')?.sourceBinding?.legacyObservanceId === 'rc:StPiusX', 'Saint Pius X must retain the exact obligatory-memorial Portugal source binding on 21 August.');\nassert(ledger.entries.find(item => item.dateISO === '2026-08-12')?.canonicalObservanceId === 'observance:jane-frances-de-chantal:roman-catholic'"],
  ['+ 114 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 312 source-bound occurrences across 302 days, 63 wholly unbound days', '+ 115 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 313 source-bound occurrences across 303 days, 62 wholly unbound days']
]);

replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 114', 'candidates.length === 115'],
  ['one hundred and fourteen reviewed rules', 'one hundred and fifteen reviewed rules'],
  ["['observance:john-eudes:roman-catholic', ['2026-08-19', 'optional-memorial', 12, 'general-roman']],", "['observance:john-eudes:roman-catholic', ['2026-08-19', 'optional-memorial', 12, 'general-roman']],\n    ['observance:pius-x-pope:roman-catholic', ['2026-08-21', 'obligatory-memorial', 10, 'general-roman']],"],
  ['occurrences.occurrences.length === 114', 'occurrences.occurrences.length === 115'],
  ['Roman Sanctorale passed: 114 authority-isolated perennial Portugal vectors, including Saint John Eudes as a general optional memorial distinct from unmaterialized institute-proper ranks', 'Roman Sanctorale passed: 115 authority-isolated perennial Portugal vectors, including Saint Pius X as a general obligatory memorial with unrelated same-page local observances kept separate']
]);

replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 197', 'peopleCount === 198'],
  ["'sixtus-ii', 'jane-frances-de-chantal', 'john-eudes',", "'sixtus-ii', 'jane-frances-de-chantal', 'john-eudes', 'pius-x-pope',"]
]);

replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 195', 'recognitionCount === 196'],
  ['personCoverageCount === 194', 'personCoverageCount === 195']
]);

replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 195', 'recognitionCount, 196'],
  ['personCoverageCount, 194', 'personCoverageCount, 195']
]);

replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 116', 'observanceCount === 117'],
  ['personCoverageCount === 194', 'personCoverageCount === 195'],
  ['for (const observance of first.observances) {', "const piusX = first.observances.find((item) => item.observanceId === 'observance:pius-x-pope:roman-catholic');\nassert(piusX?.observanceType === 'person-commemoration' && piusX.subjects?.[0]?.personId === 'pius-x-pope', 'Saint Pius X must remain one person-scoped Observance.');\nassert(piusX.evidence.some((item) => item.claimTypes?.includes('same-page-local-notes-kept-separate')), 'Unrelated local observances printed on the same source page must remain separate from Saint Pius X.');\n\nfor (const observance of first.observances) {"]
]);

replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 114', 'occurrenceCount === 115'],
  ['legacyBridgeCount === 114', 'legacyBridgeCount === 115'],
  ["['observance:john-eudes:roman-catholic', ['2026-08-19', 'optional-memorial', 'MF', 'rc:StJohnEudes']],", "['observance:john-eudes:roman-catholic', ['2026-08-19', 'optional-memorial', 'MF', 'rc:StJohnEudes']],\n  ['observance:pius-x-pope:roman-catholic', ['2026-08-21', 'obligatory-memorial', 'MO', 'rc:StPiusX']],"]
]);

replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 114 && explicitOccurrences.length', 'length === 115 && explicitOccurrences.length'],
  ['exactly one hundred and fourteen', 'exactly one hundred and fifteen'],
  ['length === 114 && explicitBridges.length', 'length === 115 && explicitBridges.length'],
  ['the one hundred and thirteen canonical Occurrences', 'the one hundred and fifteen canonical Occurrences'],
  ['mappings.length === 114', 'mappings.length === 115'],
  ['exactly one hundred and thirteen exact source bindings', 'exactly one hundred and fifteen exact source bindings'],
  ["fixedSanctoraleMappingDigest === 'f987437ab99b692b36373bdad6bd3306b6dc33934bd8b2e177da62e327665749'", `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 114 && explicitBridgeByOccurrence.size === 114 && fixedMappingByOccurrence.size === 114', 'explicitOccurrenceById.size === 115 && explicitBridgeByOccurrence.size === 115 && fixedMappingByOccurrence.size === 115'],
  ['coveredSourceIds.size === 301 && coveredSourceHashes.size === 301 && coveredOccurrenceIds.size === 301', 'coveredSourceIds.size === 302 && coveredSourceHashes.size === 302 && coveredOccurrenceIds.size === 302'],
  ['totalMapped === 312', 'totalMapped === 313'],
  ['exactly 312/389', 'exactly 313/389'],
  ['remainingLegacyOccurrences === 77', 'remainingLegacyOccurrences === 76'],
  ['exactly 77.', 'exactly 76.'],
  ['coveragePercent === 80.206', 'coveragePercent === 80.463'],
  ['= 114 exact fixed Sanctorale', '= 115 exact fixed Sanctorale'],
  ['; 77 remaining,', '; 76 remaining,']
]);

replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 312 && coveredSourceIds.size === 312', 'coveredRows.length === 313 && coveredSourceIds.size === 313'],
  ['exactly 312 unique', 'exactly 313 unique'],
  ['remaining.length === 77 && remainingSourceIds.size === 77 && remainingSourceHashes.size === 77', 'remaining.length === 76 && remainingSourceIds.size === 76 && remainingSourceHashes.size === 76'],
  ['exactly 77 unique', 'exactly 76 unique'],
  ['sourceBoundOccurrences === 312 && inventory.coverageAtInventory.remainingOccurrences === 77', 'sourceBoundOccurrences === 313 && inventory.coverageAtInventory.remainingOccurrences === 76'],
  ["actualCounts['fixed-person'] === 30", "actualCounts['fixed-person'] === 29"],
  ["assert((actualCounts['fixed-collective']", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StPiusX'), 'Saint Pius X must leave the unresolved inventory after exact promotion.');\nassert((actualCounts['fixed-collective']"],
  ['Portugal semantic inventory passed: 312 covered + 77 exact unresolved source rows = 389; Saint John Eudes is source-bound at general-calendar rank while institute-proper solemnity and obligatory memorial ranks remain context-specific', 'Portugal semantic inventory passed: 313 covered + 76 exact unresolved source rows = 389; Saint Pius X is source-bound as an obligatory memorial while unrelated same-page local observances remain separate']
]);

replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-43.json', '1ca7db5447aa29024d16359a020396005b59d688c597adad5b5eb26e37d8edce']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-43.json', '1ca7db5447aa29024d16359a020396005b59d688c597adad5b5eb26e37d8edce'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-44.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest }, null, 2));

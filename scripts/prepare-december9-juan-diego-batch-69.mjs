import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-11';
const dateISO = '2026-12-09';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-12-9';
const martyrology = 'https://www.liturgia.pt/martirologio/elogio.php?data=2025-12-09';
const canonization = 'https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20020731_canonization-mexico.html';
const holySeeBiography = 'https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020731_juan-diego_po.html';

const item = {
  personId: 'juan-diego-cuauhtlatoatzin',
  legacyId: 'rc:JuanDiego',
  occurrenceKey: 'juan-diego-cuauhtlatoatzin',
  sourceOccurrenceId: 'snl-pt-2026-12-09-faeec407f430a64dd9bc86cd',
  sourceRecordHash: '6edf53c5069d314deb5201d3eab586033cae8073768a896318d95911319b51ba',
  sourceLabelPt: 'S. João Diogo',
  names: {
    en: 'Saint Juan Diego Cuauhtlatoatzin',
    pt: 'São João Diogo Cuauhtlatoatzin',
    es: 'San Juan Diego Cuauhtlatoatzin',
    it: 'San Juan Diego Cuauhtlatoatzin'
  },
  titles: ['layman', 'marian-visionary']
};
item.recognitionId = `recognition:${item.personId}:roman-catholic`;
item.observanceId = `observance:${item.occurrenceKey}:roman-catholic`;
item.ruleId = `sanctorale-rule:${item.occurrenceKey}:general-roman`;
item.occurrenceId = `occurrence:${dateISO}:${item.occurrenceKey}:roman-catholic:pt`;

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  const existing = data[key].find(row => row[idKey] === value[idKey]);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(value)) throw new Error(`${value[idKey]} exists with different semantics in ${path}`);
    return;
  }
  data[key].push(value);
  write(path, data);
};

const person = { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names };
const recognition = {
  id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global',
  recognizedAs: 'saint', recognitionBasis: 'formal-recognition-event', ecclesialTitles: item.titles,
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [
    { publisher: 'Holy See', url: canonization, claimTypes: ['identity', 'canonization', 'saint-designation', 'indigenous-identity', 'guadalupe-association'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['identity', 'saint-designation', 'indigenous-origin', 'guadalupe-association', 'death-year'] }
  ],
  verifiedAt
};
const observance = {
  id: item.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
  observanceType: 'person-commemoration',
  subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }],
  scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false,
  jurisdictionImplied: false, rankImplied: false, precedenceImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'contextual-alternative-kept-independent'] }
  ],
  verifiedAt
};
const rule = {
  id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 12, day: 9 }, liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial', isSolemnity: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'contextual-alternative-kept-independent'] }],
  verifiedAt
};
const occurrence = {
  id: item.occurrenceId, observanceId: item.observanceId, churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt', calendarSystem: 'gregorian', year: 2026,
  dateISO, rank: 'optional-memorial', sourceRankCode: 'MF',
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'], observedDesignation: `${item.sourceLabelPt} – MF` }],
  verifiedAt
};

appendUnique('data/canonical-person-anchors.json', 'people', person);
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId: item.occurrenceId, legacyObservanceId: item.legacyId, dateISO }, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
const mapping = {
  occurrenceId: item.occurrenceId, observanceId: item.observanceId, sanctoraleRuleId: item.ruleId,
  legacyObservanceId: item.legacyId, expectedDateISO: dateISO, sourceOccurrenceId: item.sourceOccurrenceId,
  sourceRecordHash: item.sourceRecordHash, legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial',
  sourceRankCode: 'MF', reviewStatus: 'source-bound-exact', resolution: 'exact-fixed-date-binding'
};
const existingMapping = fixed.mappings.find(row => row.occurrenceId === mapping.occurrenceId);
if (existingMapping && JSON.stringify(existingMapping) !== JSON.stringify(mapping)) throw new Error(`${mapping.occurrenceId} mapping differs`);
if (!existingMapping) fixed.mappings.push(mapping);
fixed.fixedMappingCount = 145;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 145;
coverage.coverage.mappedOccurrenceAnchors = 343;
coverage.coverage.remainingLegacyOccurrences = 46;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 46)) throw new Error('December 9 source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 343;
inventory.coverageAtInventory.remainingOccurrences = 46;
inventory.familyCounts['fixed-person'] = 1;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global', recognizedAs: 'saint', recognitionBasis: 'formal-recognition-event', ecclesialTitles: item.titles, evidenceUrl: holySeeBiography },
  observanceId: item.observanceId,
  sanctoraleRuleId: item.ruleId,
  occurrenceKey: item.occurrenceKey,
  contextualBoundary: {
    generalRoman: 'optional-memorial',
    portugal2026: 'optional-memorial',
    indigenousIdentityPreserved: true,
    guadalupeAssociationSourceAttested: true,
    ourLadyOfGuadalupeObservanceConflated: false,
    passionistBlessedBernardoSilvestrelliKeptIndependent: true,
    localOrInstitutionalRankUniversalized: false
  },
  source: {
    canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId,
    sourceRecordHash: item.sourceRecordHash, sourceLabelPt: item.sourceLabelPt,
    observedDesignation: `${item.sourceLabelPt} – MF`, legacyRank: 'optional-memorial',
    sourceRankCode: 'MF', canonicalRank: 'optional-memorial', snlUrl: snl
  }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-69.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-69.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest, sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId], promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 343, requiredForPromotion: 389, remainingLegacyOccurrences: 46 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false,
  productionWriteAllowed: false, promotionAllowed: false, verifiedAt
});

const replace = (path, pairs) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of pairs) {
    if (text.includes(to)) continue;
    if (!text.includes(from)) throw new Error(`Missing expected text in ${path}: ${from}`);
    text = text.replace(from, to);
  }
  fs.writeFileSync(path, text);
};

replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ["assert(ledger.entries.find(item => item.dateISO === '2026-12-09')?.classification === 'unresolved', 'Suppressed Juan Diego Advent-weekday candidate must not count as a TemporalRuleFamily occurrence.');", "assert(!ledger.entries.find(item => item.dateISO === '2026-12-09')?.temporalFamilyOptions?.some(item => item.temporalFamilyMember?.familyId === 'temporal-rule-family:advent-weekday-tuesday-wednesday:roman-catholic'), 'Suppressed Juan Diego Advent-weekday candidate must not count as a TemporalRuleFamily occurrence.');"],
  ['fixedSanctorale === 144 && ledger.counts.fixedSanctoraleDays === 128', 'fixedSanctorale === 145 && ledger.counts.fixedSanctoraleDays === 129'],
  ['preserve 144 exact Sanctorale occurrences across 128 civil days', 'preserve 145 exact Sanctorale occurrences across 129 civil days'],
  ['sourceBound === 320 && ledger.counts.sourceBoundOccurrences === 342', 'sourceBound === 321 && ledger.counts.sourceBoundOccurrences === 343'],
  ['distinguish 320 source-bound days from 342 source-bound canonical occurrences', 'distinguish 321 source-bound days from 343 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 45', 'ledger.counts.unresolved === 44'],
  ["const november25 = ledger.entries.find((day) => day.dateISO === '2026-11-25');", "const december9 = ledger.entries.find((day) => day.dateISO === '2026-12-09');\nassert(december9?.classification === 'fixed-sanctorale' && december9.fixedOptions?.length === 1 && december9.fixedOptions[0]?.canonicalObservanceId === 'observance:juan-diego-cuauhtlatoatzin:roman-catholic' && december9.fixedOptions[0]?.sourceBinding?.legacyObservanceId === 'rc:JuanDiego', 'Saint Juan Diego must retain the exact optional-memorial source binding on 9 December.');\nassert(!december9?.temporalFamilyOptions?.some(item => item.sourceBinding?.legacyObservanceId === 'rc:AdventWeekday2Wednesday'), 'The suppressed Advent weekday candidate must not become a second source-bound option on 9 December.');\n\nconst november25 = ledger.entries.find((day) => day.dateISO === '2026-11-25');"],
  ['+ 144 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 342 source-bound occurrences across 320 days, 45 wholly unbound days', '+ 145 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 343 source-bound occurrences across 321 days, 44 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 144', 'candidates.length === 145'], ['one hundred and forty-four reviewed rules', 'one hundred and forty-five reviewed rules'],
  ["['observance:catherine-alexandria:roman-catholic', ['2026-11-25', 'optional-memorial', 12, 'general-roman']],", "['observance:catherine-alexandria:roman-catholic', ['2026-11-25', 'optional-memorial', 12, 'general-roman']],\n    ['observance:juan-diego-cuauhtlatoatzin:roman-catholic', ['2026-12-09', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 144', 'occurrences.occurrences.length === 145'],
  ['Roman Sanctorale passed: 144 authority-isolated perennial Portugal vectors, including Saint Catherine of Alexandria', 'Roman Sanctorale passed: 145 authority-isolated perennial Portugal vectors, including Saint Juan Diego on 9 December with the Guadalupan association and Passionist proper kept contextually distinct; Saint Catherine of Alexandria']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 227', 'peopleCount === 228'], ["'andrew-dung-lac', 'catherine-alexandria',", "'andrew-dung-lac', 'catherine-alexandria', 'juan-diego-cuauhtlatoatzin',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 225', 'recognitionCount === 226'], ['personCoverageCount === 224', 'personCoverageCount === 225'],
  ["'recognition:catherine-alexandria:roman-catholic',", "'recognition:catherine-alexandria:roman-catholic',\n  'recognition:juan-diego-cuauhtlatoatzin:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 225', 'recognitionCount, 226'], ['personCoverageCount, 224', 'personCoverageCount, 225']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 146', 'observanceCount === 147'], ['personCoverageCount === 224', 'personCoverageCount === 225'],
  ["const catherineAlexandria = first.observances.find", "const juanDiego = first.observances.find((row) => row.observanceId === 'observance:juan-diego-cuauhtlatoatzin:roman-catholic');\nassert(juanDiego?.subjects?.[0]?.personId === 'juan-diego-cuauhtlatoatzin', 'Saint Juan Diego must remain a distinct person-scoped Observance.');\n\nconst catherineAlexandria = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 144', 'occurrenceCount === 145'], ['legacyBridgeCount === 144', 'legacyBridgeCount === 145'],
  ["['observance:catherine-alexandria:roman-catholic', ['2026-11-25', 'optional-memorial', 'MF', 'rc:StCatherineAlexandria']],", "['observance:catherine-alexandria:roman-catholic', ['2026-11-25', 'optional-memorial', 'MF', 'rc:StCatherineAlexandria']],\n  ['observance:juan-diego-cuauhtlatoatzin:roman-catholic', ['2026-12-09', 'optional-memorial', 'MF', 'rc:JuanDiego']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['explicitOccurrences.length === 144', 'explicitOccurrences.length === 145'], ['one hundred and forty-four.', 'one hundred and forty-five.'],
  ['explicitBridges.length === 144', 'explicitBridges.length === 145'], ['the one hundred and forty-four canonical Occurrences', 'the one hundred and forty-five canonical Occurrences'],
  ['mappings.length === 144', 'mappings.length === 145'],
  [`fixedSanctoraleMappingDigest === 'e96668903daf790ed04f4b06e42035b4bbc2061362f64b673681a6ed475de4f6'`, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 144 && explicitBridgeByOccurrence.size === 144 && fixedMappingByOccurrence.size === 144', 'explicitOccurrenceById.size === 145 && explicitBridgeByOccurrence.size === 145 && fixedMappingByOccurrence.size === 145'],
  ['coveredSourceIds.size === 331 && coveredSourceHashes.size === 331 && coveredOccurrenceIds.size === 331', 'coveredSourceIds.size === 332 && coveredSourceHashes.size === 332 && coveredOccurrenceIds.size === 332'],
  ['totalMapped === 342', 'totalMapped === 343'], ['exactly 342/389', 'exactly 343/389'],
  ['remainingLegacyOccurrences === 47', 'remainingLegacyOccurrences === 46'], ['exactly 47.', 'exactly 46.'],
  ['coveragePercent === 87.918', 'coveragePercent === 88.175'], ['= 144 exact fixed Sanctorale', '= 145 exact fixed Sanctorale'], ['; 47 remaining,', '; 46 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 342 && coveredSourceIds.size === 342', 'coveredRows.length === 343 && coveredSourceIds.size === 343'], ['exactly 342 unique', 'exactly 343 unique'],
  ['remaining.length === 47 && remainingSourceIds.size === 47 && remainingSourceHashes.size === 47', 'remaining.length === 46 && remainingSourceIds.size === 46 && remainingSourceHashes.size === 46'], ['exactly 47 unique', 'exactly 46 unique'],
  ['sourceBoundOccurrences === 342 && inventory.coverageAtInventory.remainingOccurrences === 47', 'sourceBoundOccurrences === 343 && inventory.coverageAtInventory.remainingOccurrences === 46'],
  ["actualCounts['fixed-person'] === 2", "actualCounts['fixed-person'] === 1"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StCatherineAlexandria'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:JuanDiego'), 'Saint Juan Diego must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StCatherineAlexandria'),"],
  ['Portugal semantic inventory passed: 342 covered + 47 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 343 covered + 46 exact unresolved source rows = 389; Saint Juan Diego is source-bound on 9 December with the Guadalupan association and Passionist proper kept contextually distinct;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-68.json', '16117e407ca54a43e856d19522233d2faebde2df897565906dd64d599b103a7f'],", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-68.json', '16117e407ca54a43e856d19522233d2faebde2df897565906dd64d599b103a7f'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-69.json', '${reviewDigest}'],`]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));

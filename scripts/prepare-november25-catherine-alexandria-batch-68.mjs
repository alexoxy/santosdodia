import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-11';
const dateISO = '2026-11-25';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-11-25';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-11-25';
const snlProfile = 'https://liturgia.pt/santos/santo_v.php?cod_santo=242';
const vaticanNews = 'https://www.vaticannews.va/en/saints/11/25/st--catherine-of-alexandria.html';
const vaticanState = 'https://vaticanstate.va/en/state-and-government/general-informations/saint-of-the-day/3085-25-november-catherine-of-alexandria-virgin-and-martyr.html';

const item = {
  personId: 'catherine-alexandria',
  legacyId: 'rc:StCatherineAlexandria',
  occurrenceKey: 'catherine-alexandria',
  sourceOccurrenceId: 'snl-pt-2026-11-25-1ac6f5e76e77386a765b5284',
  sourceRecordHash: '8c8f50639a4a677193f0865f434386a2e8cb637f15f877a0524fb98354dbc020',
  sourceLabelPt: 'S. Catarina de Alexandria, virgem e mártir',
  names: {
    en: 'Saint Catherine of Alexandria',
    pt: 'Santa Catarina de Alexandria',
    es: 'Santa Catalina de Alejandría',
    it: 'Santa Caterina d’Alessandria'
  },
  titles: ['virgin', 'martyr']
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
  recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles,
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['identity', 'saint-designation', 'virginity', 'martyrdom', 'alexandria-association', 'uncertain-death-date'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['identity', 'saint-designation', 'martyrdom', 'traditional-biography'] }
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
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'contextual-alternatives-kept-independent'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: snlProfile, claimTypes: ['observance-attestation', 'virginity', 'martyrdom'] }
  ],
  verifiedAt
};
const rule = {
  id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 11, day: 25 }, liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial', isSolemnity: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'contextual-alternatives-kept-independent'] }],
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
fixed.fixedMappingCount = 144;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 144;
coverage.coverage.mappedOccurrenceAnchors = 342;
coverage.coverage.remainingLegacyOccurrences = 47;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 47)) throw new Error('November 25 source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 342;
inventory.coverageAtInventory.remainingOccurrences = 47;
inventory.familyCounts['fixed-person'] = 2;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: { id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global', recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles, evidenceUrl: martyrology },
  observanceId: item.observanceId,
  sanctoraleRuleId: item.ruleId,
  occurrenceKey: item.occurrenceKey,
  contextualBoundary: {
    generalRoman: 'optional-memorial',
    portugal2026: 'optional-memorial',
    deathDateCertain: false,
    traditionLanguagePreserved: true,
    carmeliteBlessedAnneOfJesusKeptIndependent: true,
    orderOfMaltaCommemorationKeptIndependent: true,
    diocesanAnniversariesKeptIndependent: true,
    patronageEvidence: {
      publisher: 'Vatican City State',
      url: vaticanState,
      claims: ['studies', 'teachers', 'potters', 'religious-orders', 'italian-municipalities'],
      publicationStatus: 'evidence-only'
    },
    patronagePublished: false
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
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-68.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-68.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest, sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId], promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 342, requiredForPromotion: 389, remainingLegacyOccurrences: 47 },
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
  ['fixedSanctorale === 143 && ledger.counts.fixedSanctoraleDays === 127', 'fixedSanctorale === 144 && ledger.counts.fixedSanctoraleDays === 128'],
  ['preserve 143 exact Sanctorale occurrences across 127 civil days', 'preserve 144 exact Sanctorale occurrences across 128 civil days'],
  ['sourceBound === 319 && ledger.counts.sourceBoundOccurrences === 341', 'sourceBound === 320 && ledger.counts.sourceBoundOccurrences === 342'],
  ['distinguish 319 source-bound days from 341 source-bound canonical occurrences', 'distinguish 320 source-bound days from 342 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 46', 'ledger.counts.unresolved === 45'],
  ["const november24 = ledger.entries.find((day) => day.dateISO === '2026-11-24');", "const november25 = ledger.entries.find((day) => day.dateISO === '2026-11-25');\nassert(november25?.classification === 'fixed-sanctorale' && november25.fixedOptions?.length === 1 && november25.fixedOptions[0]?.canonicalObservanceId === 'observance:catherine-alexandria:roman-catholic' && november25.fixedOptions[0]?.sourceBinding?.legacyObservanceId === 'rc:StCatherineAlexandria', 'Saint Catherine of Alexandria must retain the exact optional-memorial source binding on 25 November.');\nassert(!november25?.temporalFamilyOptions?.some(item => item.sourceBinding?.legacyObservanceId === 'rc:OrdWeekday34Wednesday'), 'The suppressed Ordinary Time weekday candidate must not become a second source-bound option on 25 November.');\n\nconst november24 = ledger.entries.find((day) => day.dateISO === '2026-11-24');"],
  ['+ 143 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 341 source-bound occurrences across 319 days, 46 wholly unbound days', '+ 144 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 342 source-bound occurrences across 320 days, 45 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 143', 'candidates.length === 144'], ['one hundred and forty-three reviewed rules', 'one hundred and forty-four reviewed rules'],
  ["['observance:andrew-dung-lac-companions:roman-catholic', ['2026-11-24', 'obligatory-memorial', 10, 'general-roman']],", "['observance:andrew-dung-lac-companions:roman-catholic', ['2026-11-24', 'obligatory-memorial', 10, 'general-roman']],\n    ['observance:catherine-alexandria:roman-catholic', ['2026-11-25', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 143', 'occurrences.occurrences.length === 144'],
  ['Roman Sanctorale passed: 143 authority-isolated perennial Portugal vectors, including Saint Andrew Dung-Lac', 'Roman Sanctorale passed: 144 authority-isolated perennial Portugal vectors, including Saint Catherine of Alexandria on 25 November with contextual alternatives kept independent; Saint Andrew Dung-Lac']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 226', 'peopleCount === 227'], ["'andrew-dung-lac',", "'andrew-dung-lac', 'catherine-alexandria',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 224', 'recognitionCount === 225'], ['personCoverageCount === 223', 'personCoverageCount === 224'],
  ["'recognition:andrew-dung-lac:roman-catholic',", "'recognition:andrew-dung-lac:roman-catholic',\n  'recognition:catherine-alexandria:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 224', 'recognitionCount, 225'], ['personCoverageCount, 223', 'personCoverageCount, 224']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 145', 'observanceCount === 146'], ['personCoverageCount === 223', 'personCoverageCount === 224'],
  ["const dungLac = first.observances.find", "const catherineAlexandria = first.observances.find((row) => row.observanceId === 'observance:catherine-alexandria:roman-catholic');\nassert(catherineAlexandria?.subjects?.[0]?.personId === 'catherine-alexandria', 'Saint Catherine of Alexandria must remain a distinct person-scoped Observance.');\n\nconst dungLac = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 143', 'occurrenceCount === 144'], ['legacyBridgeCount === 143', 'legacyBridgeCount === 144'],
  ["['observance:andrew-dung-lac-companions:roman-catholic', ['2026-11-24', 'obligatory-memorial', 'MO', 'rc:StAndrewDungLac']],", "['observance:andrew-dung-lac-companions:roman-catholic', ['2026-11-24', 'obligatory-memorial', 'MO', 'rc:StAndrewDungLac']],\n  ['observance:catherine-alexandria:roman-catholic', ['2026-11-25', 'optional-memorial', 'MF', 'rc:StCatherineAlexandria']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['explicitOccurrences.length === 143', 'explicitOccurrences.length === 144'], ['one hundred and forty-three.', 'one hundred and forty-four.'],
  ['explicitBridges.length === 143', 'explicitBridges.length === 144'], ['the one hundred and forty-three canonical Occurrences', 'the one hundred and forty-four canonical Occurrences'],
  ['mappings.length === 143', 'mappings.length === 144'],
  [`fixedSanctoraleMappingDigest === 'a07258c263053c15b1f7efc907fc55d1933eca7b642b3d25ac40dc5980f92e9c'`, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 143 && explicitBridgeByOccurrence.size === 143 && fixedMappingByOccurrence.size === 143', 'explicitOccurrenceById.size === 144 && explicitBridgeByOccurrence.size === 144 && fixedMappingByOccurrence.size === 144'],
  ['coveredSourceIds.size === 330 && coveredSourceHashes.size === 330 && coveredOccurrenceIds.size === 330', 'coveredSourceIds.size === 331 && coveredSourceHashes.size === 331 && coveredOccurrenceIds.size === 331'],
  ['totalMapped === 341', 'totalMapped === 342'], ['exactly 341/389', 'exactly 342/389'],
  ['remainingLegacyOccurrences === 48', 'remainingLegacyOccurrences === 47'], ['exactly 48.', 'exactly 47.'],
  ['coveragePercent === 87.661', 'coveragePercent === 87.918'], ['= 143 exact fixed Sanctorale', '= 144 exact fixed Sanctorale'], ['; 48 remaining,', '; 47 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 341 && coveredSourceIds.size === 341', 'coveredRows.length === 342 && coveredSourceIds.size === 342'], ['exactly 341 unique', 'exactly 342 unique'],
  ['remaining.length === 48 && remainingSourceIds.size === 48 && remainingSourceHashes.size === 48', 'remaining.length === 47 && remainingSourceIds.size === 47 && remainingSourceHashes.size === 47'], ['exactly 48 unique', 'exactly 47 unique'],
  ['sourceBoundOccurrences === 341 && inventory.coverageAtInventory.remainingOccurrences === 48', 'sourceBoundOccurrences === 342 && inventory.coverageAtInventory.remainingOccurrences === 47'],
  ["actualCounts['fixed-person'] === 3", "actualCounts['fixed-person'] === 2"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StAndrewDungLac'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StCatherineAlexandria'), 'Saint Catherine of Alexandria must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StAndrewDungLac'),"],
  ['Portugal semantic inventory passed: 341 covered + 48 exact unresolved source rows = 389;', 'Portugal semantic inventory passed: 342 covered + 47 exact unresolved source rows = 389; Saint Catherine of Alexandria is source-bound on 25 November with contextual alternatives kept independent;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-67.json', 'c29e3a808e7f020eece799d6b91b4b2a544fb51174674d59cec8fafecc4feca9'],", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-67.json', 'c29e3a808e7f020eece799d6b91b4b2a544fb51174674d59cec8fafecc4feca9'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-68.json', '${reviewDigest}'],`]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));

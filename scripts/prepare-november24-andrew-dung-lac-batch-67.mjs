import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-11';
const dateISO = '2026-11-24';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-11-24';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-11-24';
const vaticanNews = 'https://www.vaticannews.va/en/saints/11/24/sts--andrew-d_ng-lc--and-his-companions--martyrs.html';
const canonization = 'https://www.vatican.va/news_services/liturgy/saints/index_saints_en.html';

const item = {
  personId: 'andrew-dung-lac',
  legacyId: 'rc:StAndrewDungLac',
  occurrenceKey: 'andrew-dung-lac-companions',
  sourceOccurrenceId: 'snl-pt-2026-11-24-0d92880655ca29c9708bf28d',
  sourceRecordHash: '2553a653abd3a004d3666df76af79dbfa70913d13981c605e89483e5f8f429b5',
  sourceLabelPt: 'Santos André Dung-Lac, presbítero, e companheiros, mártires',
  names: {
    en: 'Saint Andrew Dung-Lac, Priest and Martyr',
    pt: 'Santo André Dung-Lac, presbítero e mártir',
    es: 'San Andrés Dung-Lac, presbítero y mártir',
    it: 'Sant’Andrea Dung-Lac, sacerdote e martire'
  },
  titles: ['priest', 'martyr'],
  companionGroup: {
    groupKey: 'martyrs-of-vietnam-companions',
    attestedCount: 116,
    enumerationStatus: 'officially-bounded-not-materialized',
    anonymousPersonsCreated: false,
    evidence: [
      { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['bounded-companion-group', 'observance-attestation', 'martyrs', 'official-enumeration'] },
      { publisher: 'Holy See', url: canonization, claimTypes: ['bounded-companion-group', 'observance-attestation', 'canonization'] },
      { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['bounded-companion-group', 'observance-attestation', 'martyrs', 'canonization'] }
    ]
  }
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

appendUnique('data/canonical-person-anchors.json', 'people', {
  id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names
});
appendUnique('data/canonical-recognition-anchors.json', 'recognitions', {
  id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global',
  recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles,
  scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
  evidence: [
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['identity', 'saint-designation', 'priesthood', 'martyrdom', 'canonization'] },
    { publisher: 'Holy See', url: canonization, claimTypes: ['identity', 'saint-designation', 'canonization', 'collective-membership'] },
    { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['identity', 'ecclesial-status', 'liturgical-commemoration', 'collective-membership'] }
  ],
  verifiedAt
});
appendUnique('data/canonical-observance-anchors.json', 'observances', {
  id: item.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
  observanceType: 'named-person-with-companions-commemoration',
  subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }],
  companionGroup: item.companionGroup,
  scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false,
  jurisdictionImplied: false, rankImplied: false, precedenceImplied: false,
  evidence: [
    { publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'obligatory-memorial', 'bounded-companion-group'] },
    { publisher: 'Vatican News', url: vaticanNews, claimTypes: ['observance-attestation', 'identity', 'bounded-companion-group', 'martyrs'] }
  ],
  verifiedAt
});
appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', {
  id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 11, day: 24 }, liturgicalRank: 'obligatory-memorial',
  precedenceClass: 'general-obligatory-memorial', isSolemnity: false,
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'obligatory-memorial', 'general-roman-calendar', 'bounded-companion-group'] }],
  verifiedAt
});
appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', {
  id: item.occurrenceId, observanceId: item.observanceId, churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt', calendarSystem: 'gregorian', year: 2026,
  dateISO, rank: 'obligatory-memorial', sourceRankCode: 'MO',
  evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank', 'bounded-companion-group'], observedDesignation: `${item.sourceLabelPt} – MO` }],
  verifiedAt
});
appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', {
  occurrenceId: item.occurrenceId, legacyObservanceId: item.legacyId, dateISO
}, 'legacyObservanceId');

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
const mapping = {
  occurrenceId: item.occurrenceId, observanceId: item.observanceId, sanctoraleRuleId: item.ruleId,
  legacyObservanceId: item.legacyId, expectedDateISO: dateISO, sourceOccurrenceId: item.sourceOccurrenceId,
  sourceRecordHash: item.sourceRecordHash, legacyRank: 'memorial', canonicalRank: 'obligatory-memorial',
  sourceRankCode: 'MO', reviewStatus: 'source-bound-exact', resolution: 'exact-fixed-date-binding'
};
const existingMapping = fixed.mappings.find(row => row.occurrenceId === mapping.occurrenceId);
if (existingMapping && JSON.stringify(existingMapping) !== JSON.stringify(mapping)) throw new Error(`${mapping.occurrenceId} mapping differs`);
if (!existingMapping) fixed.mappings.push(mapping);
fixed.fixedMappingCount = 143;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 143;
coverage.coverage.mappedOccurrenceAnchors = 341;
coverage.coverage.remainingLegacyOccurrences = 48;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 48)) throw new Error('November 24 source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 341;
inventory.coverageAtInventory.remainingOccurrences = 48;
inventory.familyCounts['fixed-person'] = 3;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person: { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names },
  recognition: { id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global', recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles, evidenceUrl: vaticanNews },
  namedPersonWithCompanions: true,
  companionGroup: item.companionGroup,
  observanceId: item.observanceId,
  observanceType: 'named-person-with-companions-commemoration',
  sanctoraleRuleId: item.ruleId,
  occurrenceKey: item.occurrenceKey,
  source: {
    canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId,
    sourceRecordHash: item.sourceRecordHash, sourceLabelPt: item.sourceLabelPt,
    observedDesignation: `${item.sourceLabelPt} – MO`, legacyRank: 'memorial',
    sourceRankCode: 'MO', canonicalRank: 'obligatory-memorial', snlUrl: snl
  }
};
const candidates = [candidate];
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-67.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-67.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest, sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId], promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 341, requiredForPromotion: 389, remainingLegacyOccurrences: 48 },
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
  ['fixedSanctorale === 142 && ledger.counts.fixedSanctoraleDays === 126', 'fixedSanctorale === 143 && ledger.counts.fixedSanctoraleDays === 127'],
  ['preserve 142 exact Sanctorale occurrences across 126 civil days', 'preserve 143 exact Sanctorale occurrences across 127 civil days'],
  ['sourceBound === 318 && ledger.counts.sourceBoundOccurrences === 340', 'sourceBound === 319 && ledger.counts.sourceBoundOccurrences === 341'],
  ['distinguish 318 source-bound days from 340 source-bound canonical occurrences', 'distinguish 319 source-bound days from 341 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 47', 'ledger.counts.unresolved === 46'],
  ["const november23 = ledger.entries.find((day) => day.dateISO === '2026-11-23');", "const november24 = ledger.entries.find((day) => day.dateISO === '2026-11-24');\nassert(november24?.classification === 'fixed-sanctorale' && november24.fixedOptions?.length === 1 && november24.fixedOptions[0]?.canonicalObservanceId === 'observance:andrew-dung-lac-companions:roman-catholic' && november24.fixedOptions[0]?.sourceBinding?.legacyObservanceId === 'rc:StAndrewDungLac', 'Saint Andrew Dung-Lac and the bounded companion group must remain one collective observance on 24 November.');\n\nconst november23 = ledger.entries.find((day) => day.dateISO === '2026-11-23');"],
  ['+ 142 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 340 source-bound occurrences across 318 days, 47 wholly unbound days', '+ 143 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 341 source-bound occurrences across 319 days, 46 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 142', 'candidates.length === 143'], ['one hundred and forty-two reviewed rules', 'one hundred and forty-three reviewed rules'],
  ["['observance:columban-luxeuil:roman-catholic', ['2026-11-23', 'optional-memorial', 12, 'general-roman']],", "['observance:columban-luxeuil:roman-catholic', ['2026-11-23', 'optional-memorial', 12, 'general-roman']],\n    ['observance:andrew-dung-lac-companions:roman-catholic', ['2026-11-24', 'obligatory-memorial', 10, 'general-roman']],"],
  ['occurrences.occurrences.length === 142', 'occurrences.occurrences.length === 143'],
  ['Roman Sanctorale passed: 142 authority-isolated perennial Portugal vectors, including Saint Clement I and Saint Columban as independent alternatives on 23 November', 'Roman Sanctorale passed: 143 authority-isolated perennial Portugal vectors, including Saint Andrew Dung-Lac with 116 bounded, unmaterialized companions on 24 November; Saint Clement I and Saint Columban as independent alternatives on 23 November']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 225', 'peopleCount === 226'], ["'clement-i-pope', 'columban-luxeuil',", "'clement-i-pope', 'columban-luxeuil', 'andrew-dung-lac',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 223', 'recognitionCount === 224'], ['personCoverageCount === 222', 'personCoverageCount === 223'],
  ["'recognition:columban-luxeuil:roman-catholic',", "'recognition:columban-luxeuil:roman-catholic',\n  'recognition:andrew-dung-lac:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 223', 'recognitionCount, 224'], ['personCoverageCount, 222', 'personCoverageCount, 223']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 144', 'observanceCount === 145'], ['personCoverageCount === 222', 'personCoverageCount === 223'],
  ["const clement = first.observances.find", "const dungLac = first.observances.find((row) => row.observanceId === 'observance:andrew-dung-lac-companions:roman-catholic');\nassert(dungLac?.observanceType === 'named-person-with-companions-commemoration', 'Saint Andrew Dung-Lac and companions must use the bounded companion-group type.');\nassert(dungLac.subjects.length === 1 && dungLac.subjects[0].personId === 'andrew-dung-lac', 'Only the directly reviewed Saint Andrew Dung-Lac Person may be materialized in this batch.');\nassert(dungLac.companionGroup?.attestedCount === 116 && dungLac.companionGroup.anonymousPersonsCreated === false, 'The officially bounded 116 companions must remain unmaterialized without inferred Persons.');\n\nconst clement = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 142', 'occurrenceCount === 143'], ['legacyBridgeCount === 142', 'legacyBridgeCount === 143'],
  ["['observance:columban-luxeuil:roman-catholic', ['2026-11-23', 'optional-memorial', 'MF', 'rc:StColumban']],", "['observance:columban-luxeuil:roman-catholic', ['2026-11-23', 'optional-memorial', 'MF', 'rc:StColumban']],\n  ['observance:andrew-dung-lac-companions:roman-catholic', ['2026-11-24', 'obligatory-memorial', 'MO', 'rc:StAndrewDungLac']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['explicitOccurrences.length === 142', 'explicitOccurrences.length === 143'], ['one hundred and forty-two.', 'one hundred and forty-three.'],
  ['explicitBridges.length === 142', 'explicitBridges.length === 143'], ['the one hundred and forty-two canonical Occurrences', 'the one hundred and forty-three canonical Occurrences'],
  ['mappings.length === 142', 'mappings.length === 143'],
  [`fixedSanctoraleMappingDigest === '19e0be7316c894282483e42388a0f632ae5c7012933b3576648e3824f29ee3f7'`, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 142 && explicitBridgeByOccurrence.size === 142 && fixedMappingByOccurrence.size === 142', 'explicitOccurrenceById.size === 143 && explicitBridgeByOccurrence.size === 143 && fixedMappingByOccurrence.size === 143'],
  ['coveredSourceIds.size === 329 && coveredSourceHashes.size === 329 && coveredOccurrenceIds.size === 329', 'coveredSourceIds.size === 330 && coveredSourceHashes.size === 330 && coveredOccurrenceIds.size === 330'],
  ['totalMapped === 340', 'totalMapped === 341'], ['exactly 340/389', 'exactly 341/389'],
  ['remainingLegacyOccurrences === 49', 'remainingLegacyOccurrences === 48'], ['exactly 49.', 'exactly 48.'],
  ['coveragePercent === 87.404', 'coveragePercent === 87.661'], ['= 142 exact fixed Sanctorale', '= 143 exact fixed Sanctorale'], ['; 49 remaining,', '; 48 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 340 && coveredSourceIds.size === 340', 'coveredRows.length === 341 && coveredSourceIds.size === 341'], ['exactly 340 unique', 'exactly 341 unique'],
  ['remaining.length === 49 && remainingSourceIds.size === 49 && remainingSourceHashes.size === 49', 'remaining.length === 48 && remainingSourceIds.size === 48 && remainingSourceHashes.size === 48'], ['exactly 49 unique', 'exactly 48 unique'],
  ['sourceBoundOccurrences === 340 && inventory.coverageAtInventory.remainingOccurrences === 49', 'sourceBoundOccurrences === 341 && inventory.coverageAtInventory.remainingOccurrences === 48'],
  ["actualCounts['fixed-person'] === 4", "actualCounts['fixed-person'] === 3"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StClementIPope'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StAndrewDungLac'), 'Saint Andrew Dung-Lac and companions must leave the unresolved inventory after exact collective promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StClementIPope'),"],
  ['Portugal semantic inventory passed: 340 covered + 49 exact unresolved source rows = 389; Saint Clement I and Saint Columban are independent source-bound alternatives on 23 November;', 'Portugal semantic inventory passed: 341 covered + 48 exact unresolved source rows = 389; Saint Andrew Dung-Lac remains the named lead of a bounded 117-martyr collective on 24 November; Saint Clement I and Saint Columban are independent source-bound alternatives on 23 November;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-66.json', '443737cb7829fe9eeb51572bcb3ed7362229c917e766ff1e233f1fc85e69ac50'],", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-66.json', '443737cb7829fe9eeb51572bcb3ed7362229c917e766ff1e233f1fc85e69ac50'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-67.json', '${reviewDigest}'],`]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId], boundedCompanions: 116 }, null, 2));

import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-11';
const dateISO = '2026-10-19';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-19';
const identityUrl = 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=180';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-10-19';

const item = {
  personId: 'paul-of-the-cross',
  legacyId: 'rc:StPaulCross',
  sourceOccurrenceId: 'snl-pt-2026-10-19-5a3c4acfe1b261e78486f1c1',
  sourceRecordHash: '9ce09b023afc7dd24e87e536672fc916bb0392e5c3837505ea8d19bc5ee93cf4',
  sourceLabelPt: 'S. Paulo da Cruz, presbítero',
  names: {
    en: 'Saint Paul of the Cross',
    pt: 'São Paulo da Cruz',
    es: 'San Pablo de la Cruz',
    it: 'San Paolo della Croce'
  },
  titles: ['priest', 'founder'],
  recognitionId: 'recognition:paul-of-the-cross:roman-catholic',
  observanceId: 'observance:paul-of-the-cross:roman-catholic',
  ruleId: 'sanctorale-rule:paul-of-the-cross:general-roman',
  occurrenceId: 'occurrence:2026-10-19:paul-of-the-cross:roman-catholic:pt'
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
      claimTypes: ['identity', 'ecclesial-status', 'priesthood', 'founder', 'birth-year', 'death-date']
    },
    {
      publisher: 'Holy See',
      url: 'https://www.vatican.va/roman_curia/pontifical_academies/cult-martyrum/martiri/010.html',
      claimTypes: ['identity', 'ecclesial-status', 'founder', 'canonization', 'death-year']
    },
    {
      publisher: 'Secretariado Nacional de Liturgia',
      url: martyrology,
      claimTypes: ['identity', 'ecclesial-status', 'priesthood', 'founder', 'death-date']
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
    claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-alternatives-kept-independent']
  }],
  verifiedAt
};
const rule = {
  id: item.ruleId,
  observanceId: item.observanceId,
  scopeKey: 'general-roman',
  dateRule: { type: 'fixed', month: 10, day: 19 },
  liturgicalRank: 'optional-memorial',
  precedenceClass: 'optional-memorial',
  isSolemnity: false,
  evidence: [{
    publisher: 'Secretariado Nacional de Liturgia',
    url: snl,
    claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'same-date-alternatives-kept-independent']
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
fixed.fixedMappingCount = 134;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 134;
coverage.coverage.mappedOccurrenceAnchors = 332;
coverage.coverage.remainingLegacyOccurrences = 57;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 57)) throw new Error('Saint Paul of the Cross source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 332;
inventory.coverageAtInventory.remainingOccurrences = 57;
inventory.familyCounts['fixed-person'] = 12;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidate = {
  person,
  recognition: {
    id: item.recognitionId,
    personId: item.personId,
    ecclesialTitles: item.titles,
    evidenceUrl: martyrology
  },
  observanceId: item.observanceId,
  sanctoraleRuleId: item.ruleId,
  contextualBoundary: {
    generalRoman: 'optional-memorial',
    portugal2026: 'optional-memorial',
    passionistProper2026: 'solemnity',
    institutionalRankKeptContextual: true,
    sameDateAlternativesKeptIndependent: true,
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
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-60.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-60.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId],
  promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: {
    mappedOccurrenceAnchors: 332,
    requiredForPromotion: 389,
    remainingLegacyOccurrences: 57
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
  ['candidates.length === 133', 'candidates.length === 134'],
  ['one hundred and thirty-three reviewed rules', 'one hundred and thirty-four reviewed rules'],
  ["['observance:margaret-mary-alacoque:roman-catholic', ['2026-10-16', 'optional-memorial', 12, 'general-roman']],", "['observance:margaret-mary-alacoque:roman-catholic', ['2026-10-16', 'optional-memorial', 12, 'general-roman']],\n    ['observance:paul-of-the-cross:roman-catholic', ['2026-10-19', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 133', 'occurrences.occurrences.length === 134'],
  ['Roman Sanctorale passed: 133 authority-isolated perennial Portugal vectors, including Saint Hedwig and Saint Margaret Mary Alacoque as independent alternatives on 16 October', 'Roman Sanctorale passed: 134 authority-isolated perennial Portugal vectors, including Saint Paul of the Cross and the Canadian martyrs as independent alternatives on 19 October']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 216', 'peopleCount === 217'],
  ["'hedwig-of-silesia', 'margaret-mary-alacoque',", "'hedwig-of-silesia', 'margaret-mary-alacoque', 'paul-of-the-cross',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 214', 'recognitionCount === 215'],
  ['personCoverageCount === 213', 'personCoverageCount === 214'],
  ["'recognition:margaret-mary-alacoque:roman-catholic',", "'recognition:margaret-mary-alacoque:roman-catholic',\n  'recognition:paul-of-the-cross:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 214', 'recognitionCount, 215'],
  ['personCoverageCount, 213', 'personCoverageCount, 214']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 135', 'observanceCount === 136'],
  ['personCoverageCount === 213', 'personCoverageCount === 214'],
  ["const callistus = first.observances.find", "const paulCross = first.observances.find((row) => row.observanceId === 'observance:paul-of-the-cross:roman-catholic');\nassert(paulCross?.subjects?.[0]?.personId === 'paul-of-the-cross', 'Saint Paul of the Cross must remain a distinct person-scoped Observance.');\n\nconst callistus = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 133', 'occurrenceCount === 134'],
  ['legacyBridgeCount === 133', 'legacyBridgeCount === 134'],
  ["['observance:john-brebeuf-isaac-jogues-companions:roman-catholic', ['2026-10-19', 'optional-memorial', 'MF', 'rc:StsJeanBrebeuf']],", "['observance:john-brebeuf-isaac-jogues-companions:roman-catholic', ['2026-10-19', 'optional-memorial', 'MF', 'rc:StsJeanBrebeuf']],\n  ['observance:paul-of-the-cross:roman-catholic', ['2026-10-19', 'optional-memorial', 'MF', 'rc:StPaulCross']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 133 && explicitOccurrences.length', 'length === 134 && explicitOccurrences.length'],
  ['one hundred and thirty-three', 'one hundred and thirty-four'],
  ['length === 133 && explicitBridges.length', 'length === 134 && explicitBridges.length'],
  ['the one hundred and thirty-three canonical Occurrences', 'the one hundred and thirty-four canonical Occurrences'],
  ['mappings.length === 133', 'mappings.length === 134'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 133 && explicitBridgeByOccurrence.size === 133 && fixedMappingByOccurrence.size === 133', 'explicitOccurrenceById.size === 134 && explicitBridgeByOccurrence.size === 134 && fixedMappingByOccurrence.size === 134'],
  ['coveredSourceIds.size === 320 && coveredSourceHashes.size === 320 && coveredOccurrenceIds.size === 320', 'coveredSourceIds.size === 321 && coveredSourceHashes.size === 321 && coveredOccurrenceIds.size === 321'],
  ['totalMapped === 331', 'totalMapped === 332'],
  ['exactly 331/389', 'exactly 332/389'],
  ['remainingLegacyOccurrences === 58', 'remainingLegacyOccurrences === 57'],
  ['exactly 58.', 'exactly 57.'],
  ['coveragePercent === 85.09', 'coveragePercent === 85.347'],
  ['= 133 exact fixed Sanctorale', '= 134 exact fixed Sanctorale'],
  ['; 58 remaining,', '; 57 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 331 && coveredSourceIds.size === 331', 'coveredRows.length === 332 && coveredSourceIds.size === 332'],
  ['exactly 331 unique', 'exactly 332 unique'],
  ['remaining.length === 58 && remainingSourceIds.size === 58 && remainingSourceHashes.size === 58', 'remaining.length === 57 && remainingSourceIds.size === 57 && remainingSourceHashes.size === 57'],
  ['exactly 58 unique', 'exactly 57 unique'],
  ['sourceBoundOccurrences === 331 && inventory.coverageAtInventory.remainingOccurrences === 58', 'sourceBoundOccurrences === 332 && inventory.coverageAtInventory.remainingOccurrences === 57'],
  ["actualCounts['fixed-person'] === 13", "actualCounts['fixed-person'] === 12"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StHedwig'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StPaulCross'), 'Saint Paul of the Cross must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StHedwig'),"],
  ['Portugal semantic inventory passed: 331 covered + 58 exact unresolved source rows = 389; Saint Hedwig and Saint Margaret Mary Alacoque are independent source-bound alternatives on 16 October;', 'Portugal semantic inventory passed: 332 covered + 57 exact unresolved source rows = 389; Saint Paul of the Cross and the Canadian martyrs are independent source-bound alternatives on 19 October;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-59.json', '46606ca8d14b804f630f2b4bf7678a9e016948e3f21649f0f58c6fd6b6905454']", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-59.json', '46606ca8d14b804f630f2b4bf7678a9e016948e3f21649f0f58c6fd6b6905454'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-60.json', '${reviewDigest}']`]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));

import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-11';
const dateISO = '2026-10-22';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-22';
const identityUrl = 'https://www.vatican.va/content/john-paul-ii/en/biografia/documents/hf_jp-ii_spe_20190722_biografia.html';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-10-22';

const item = {
  personId: 'john-paul-ii',
  legacyId: 'rc:StJohnPaulII',
  sourceOccurrenceId: 'snl-pt-2026-10-22-2d9d67aa059f219de9dc687b',
  sourceRecordHash: 'ed7b4df4a7b84002de33627f1cda53340cea8af0a830ac02686d4c0b3536a48d',
  sourceLabelPt: 'S. João Paulo II, papa',
  names: {
    en: 'Saint John Paul II',
    pt: 'São João Paulo II',
    es: 'San Juan Pablo II',
    it: 'San Giovanni Paolo II'
  },
  titles: ['pope', 'bishop'],
  recognitionId: 'recognition:john-paul-ii:roman-catholic',
  observanceId: 'observance:john-paul-ii:roman-catholic',
  ruleId: 'sanctorale-rule:john-paul-ii:general-roman',
  occurrenceId: 'occurrence:2026-10-22:john-paul-ii:roman-catholic:pt'
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
      publisher: 'Holy See',
      url: identityUrl,
      claimTypes: ['identity', 'ecclesial-status', 'papacy', 'birth-date', 'death-date', 'canonization']
    },
    {
      publisher: 'Holy See',
      url: 'https://www.vatican.va/content/dam/wss/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20140529_decreto-calendario-generale-gxxiii-gpii_en.html',
      claimTypes: ['ecclesial-status', 'canonization', 'general-roman-calendar', 'optional-memorial', 'fixed-date']
    },
    {
      publisher: 'Secretariado Nacional de Liturgia',
      url: martyrology,
      claimTypes: ['identity', 'ecclesial-status', 'papacy', 'death-date']
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
  dateRule: { type: 'fixed', month: 10, day: 22 },
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
fixed.fixedMappingCount = 135;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 135;
coverage.coverage.mappedOccurrenceAnchors = 333;
coverage.coverage.remainingLegacyOccurrences = 56;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(row => row.sourceOccurrenceId !== item.sourceOccurrenceId);
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 56)) throw new Error('Saint Paul of the Cross source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 333;
inventory.coverageAtInventory.remainingOccurrences = 56;
inventory.familyCounts['fixed-person'] = 11;
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
    generalRomanDecree2014: 'optional-memorial-on-22-october',
    portugalContextualAlternativesKeptIndependent: true,
    contextualRanksKeptSeparate: true,
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
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-61.json';
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
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-61.json', {
  schemaVersion: 1,
  status: 'canonical-sanctorale-promotion-completed',
  reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2',
  promotedPersonIds: [item.personId],
  promotedObservanceIds: [item.observanceId],
  canonicalCoverageAfterPromotion: {
    mappedOccurrenceAnchors: 333,
    requiredForPromotion: 389,
    remainingLegacyOccurrences: 56
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
  ['candidates.length === 134', 'candidates.length === 135'],
  ['one hundred and thirty-four reviewed rules', 'one hundred and thirty-five reviewed rules'],
  ["['observance:paul-of-the-cross:roman-catholic', ['2026-10-19', 'optional-memorial', 12, 'general-roman']],", "['observance:paul-of-the-cross:roman-catholic', ['2026-10-19', 'optional-memorial', 12, 'general-roman']],\n    ['observance:john-paul-ii:roman-catholic', ['2026-10-22', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 134', 'occurrences.occurrences.length === 135'],
  ['Roman Sanctorale passed: 134 authority-isolated perennial Portugal vectors, including Saint Paul of the Cross and the Canadian martyrs as independent alternatives on 19 October', 'Roman Sanctorale passed: 135 authority-isolated perennial Portugal vectors, including Saint John Paul II on 22 October with contextual alternatives kept independent']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 217', 'peopleCount === 218'],
  ["'paul-of-the-cross',", "'paul-of-the-cross', 'john-paul-ii',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 215', 'recognitionCount === 216'],
  ['personCoverageCount === 214', 'personCoverageCount === 215'],
  ["'recognition:paul-of-the-cross:roman-catholic',", "'recognition:paul-of-the-cross:roman-catholic',\n  'recognition:john-paul-ii:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [
  ['recognitionCount, 215', 'recognitionCount, 216'],
  ['personCoverageCount, 214', 'personCoverageCount, 215']
]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 136', 'observanceCount === 137'],
  ['personCoverageCount === 214', 'personCoverageCount === 215'],
  ["const paulCross = first.observances.find", "const johnPaulII = first.observances.find((row) => row.observanceId === 'observance:john-paul-ii:roman-catholic');\nassert(johnPaulII?.subjects?.[0]?.personId === 'john-paul-ii', 'Saint John Paul II must remain a distinct person-scoped Observance.');\n\nconst paulCross = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 134', 'occurrenceCount === 135'],
  ['legacyBridgeCount === 134', 'legacyBridgeCount === 135'],
  ["['observance:paul-of-the-cross:roman-catholic', ['2026-10-19', 'optional-memorial', 'MF', 'rc:StPaulCross']],", "['observance:paul-of-the-cross:roman-catholic', ['2026-10-19', 'optional-memorial', 'MF', 'rc:StPaulCross']],\n  ['observance:john-paul-ii:roman-catholic', ['2026-10-22', 'optional-memorial', 'MF', 'rc:StJohnPaulII']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 134 && explicitOccurrences.length', 'length === 135 && explicitOccurrences.length'],
  ['one hundred and thirty-four', 'one hundred and thirty-five'],
  ['length === 134 && explicitBridges.length', 'length === 135 && explicitBridges.length'],
  ['the one hundred and thirty-four canonical Occurrences', 'the one hundred and thirty-five canonical Occurrences'],
  ['mappings.length === 134', 'mappings.length === 135'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 134 && explicitBridgeByOccurrence.size === 134 && fixedMappingByOccurrence.size === 134', 'explicitOccurrenceById.size === 135 && explicitBridgeByOccurrence.size === 135 && fixedMappingByOccurrence.size === 135'],
  ['coveredSourceIds.size === 321 && coveredSourceHashes.size === 321 && coveredOccurrenceIds.size === 321', 'coveredSourceIds.size === 322 && coveredSourceHashes.size === 322 && coveredOccurrenceIds.size === 322'],
  ['totalMapped === 332', 'totalMapped === 333'],
  ['exactly 332/389', 'exactly 333/389'],
  ['remainingLegacyOccurrences === 57', 'remainingLegacyOccurrences === 56'],
  ['exactly 57.', 'exactly 56.'],
  ['coveragePercent === 85.347', 'coveragePercent === 85.604'],
  ['= 134 exact fixed Sanctorale', '= 135 exact fixed Sanctorale'],
  ['; 57 remaining,', '; 56 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 332 && coveredSourceIds.size === 332', 'coveredRows.length === 333 && coveredSourceIds.size === 333'],
  ['exactly 332 unique', 'exactly 333 unique'],
  ['remaining.length === 57 && remainingSourceIds.size === 57 && remainingSourceHashes.size === 57', 'remaining.length === 56 && remainingSourceIds.size === 56 && remainingSourceHashes.size === 56'],
  ['exactly 57 unique', 'exactly 56 unique'],
  ['sourceBoundOccurrences === 332 && inventory.coverageAtInventory.remainingOccurrences === 57', 'sourceBoundOccurrences === 333 && inventory.coverageAtInventory.remainingOccurrences === 56'],
  ["actualCounts['fixed-person'] === 12", "actualCounts['fixed-person'] === 11"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StPaulCross'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnPaulII'), 'Saint John Paul II must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StPaulCross'),"],
  ['Portugal semantic inventory passed: 332 covered + 57 exact unresolved source rows = 389; Saint Paul of the Cross and the Canadian martyrs are independent source-bound alternatives on 19 October;', 'Portugal semantic inventory passed: 333 covered + 56 exact unresolved source rows = 389; Saint John Paul II is source-bound on 22 October with contextual alternatives kept independent;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  [/\['roman-catholic-pt-2026-v2\.sanctorale-review-batch-61\.json', '[a-f0-9]{64}'\]/u, `['roman-catholic-pt-2026-v2.sanctorale-review-batch-61.json', '${reviewDigest}']`],
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-60.json', 'f36f83e81f16f9c1fbdcb85dc348f8e3e3685b2eb08843f505838426fca0f397']", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-60.json', 'f36f83e81f16f9c1fbdcb85dc348f8e3e3685b2eb08843f505838426fca0f397'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-61.json', '${reviewDigest}']`]
]);
replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['ledger.counts.fixedSanctorale === 134 && ledger.counts.fixedSanctoraleDays === 120', 'ledger.counts.fixedSanctorale === 135 && ledger.counts.fixedSanctoraleDays === 121'],
  ['preserve 134 exact Sanctorale occurrences across 120 civil days', 'preserve 135 exact Sanctorale occurrences across 121 civil days'],
  ['ledger.counts.sourceBound === 313 && ledger.counts.sourceBoundOccurrences === 332', 'ledger.counts.sourceBound === 314 && ledger.counts.sourceBoundOccurrences === 333'],
  ['distinguish 313 source-bound days from 332 source-bound canonical occurrences', 'distinguish 314 source-bound days from 333 source-bound canonical occurrences'],
  ["ledger.counts.unresolved === 52", "ledger.counts.unresolved === 51"],
  ["const october14 = ledger.entries.find", "const october22 = ledger.entries.find((day) => day.dateISO === '2026-10-22');\nassert(october22?.classification === 'fixed-sanctorale' && october22.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:john-paul-ii:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StJohnPaulII'), 'Saint John Paul II must retain the exact optional-memorial source binding on 22 October.');\n\nconst october14 = ledger.entries.find"],
  ['134 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 332 source-bound occurrences across 313 days, 52 wholly unbound days', '135 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 333 source-bound occurrences across 314 days, 51 wholly unbound days']
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: [item.personId] }, null, 2));


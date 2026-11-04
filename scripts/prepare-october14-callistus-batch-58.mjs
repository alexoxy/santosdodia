import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-04';
const dateISO = '2026-10-14';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-14';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?month=9&year=2026';
const holySeeCallistus = 'https://www.vatican.va/content/vatican/pt/holy-father/callisto-i.html';

const subjects = [
  {
    personId: 'callistus-i',
    legacyId: 'rc:StCallistusIPope',
    sourceOccurrenceId: 'snl-pt-2026-10-14-5566fe98311b72494f4c0231',
    sourceRecordHash: '7bd8eafc229644b2aae4cba805fbc899c9974b5c05b459e4c6b439d802554317',
    sourceLabelPt: 'S. Calisto I, papa e mártir',
    names: { en: 'Saint Callistus I', pt: 'São Calisto I', es: 'San Calixto I', it: 'San Callisto I' },
    titles: ['pope', 'martyr'],
    identityUrl: holySeeCallistus,
    recognitionClaimTypes: ['identity', 'ecclesial-status', 'papacy'],
    calendarUrl: martyrology,
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      popeAndMartyrSourceBound: true, patronagePublished: false
    }
  }
].map(item => ({
  ...item,
  recognitionId: `recognition:${item.personId}:roman-catholic`,
  observanceId: `observance:${item.personId}:roman-catholic`,
  ruleId: `sanctorale-rule:${item.personId}:general-roman`,
  occurrenceId: `occurrence:${dateISO}:${item.personId}:roman-catholic:pt`
}));

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  const existing = data[key].find(item => item[idKey] === value[idKey]);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(value)) throw new Error(`${value[idKey]} already exists with different semantics in ${path}`);
    return;
  }
  data[key].push(value);
  write(path, data);
};

for (const item of subjects) {
  const person = { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names };
  const recognition = {
    id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global',
    recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles,
    scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
    evidence: [
      { publisher: 'Holy See', url: item.identityUrl, claimTypes: item.recognitionClaimTypes },
      { publisher: 'Secretariado Nacional de Liturgia', url: item.calendarUrl, claimTypes: ['identity', 'ecclesial-status', 'martyrdom', 'death-period'] }
    ],
    verifiedAt
  };
  const observance = {
    id: item.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
    observanceType: 'person-commemoration', subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }],
    scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false, jurisdictionImplied: false,
    rankImplied: false, precedenceImplied: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial'] }],
    verifiedAt
  };
  const rule = {
    id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 10, day: 14 },
    liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar'] }],
    verifiedAt
  };
  const occurrence = {
    id: item.occurrenceId, observanceId: item.observanceId, churchId: 'church:roman-catholic',
    jurisdictionId: 'jurisdiction:roman-catholic:pt', calendarSystem: 'gregorian', year: 2026, dateISO,
    rank: 'optional-memorial', sourceRankCode: 'MF',
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'], observedDesignation: `${item.sourceLabelPt} – MF` }],
    verifiedAt
  };

  appendUnique('data/canonical-person-anchors.json', 'people', person);
  appendUnique('data/canonical-recognition-anchors.json', 'recognitions', recognition);
  appendUnique('data/canonical-observance-anchors.json', 'observances', observance);
  appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', rule);
  appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', occurrence);
  appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId: item.occurrenceId, legacyObservanceId: item.legacyId, dateISO }, 'legacyObservanceId');
}

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
for (const item of subjects) {
  const mapping = {
    occurrenceId: item.occurrenceId, observanceId: item.observanceId, sanctoraleRuleId: item.ruleId,
    legacyObservanceId: item.legacyId, expectedDateISO: dateISO, sourceOccurrenceId: item.sourceOccurrenceId,
    sourceRecordHash: item.sourceRecordHash, legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial',
    sourceRankCode: 'MF', reviewStatus: 'source-bound-exact', resolution: 'exact-fixed-date-binding'
  };
  const existing = fixed.mappings.find(row => row.occurrenceId === mapping.occurrenceId);
  if (existing && JSON.stringify(existing) !== JSON.stringify(mapping)) throw new Error(`Mapping ${mapping.occurrenceId} already exists with different semantics`);
  if (!existing) fixed.mappings.push(mapping);
}
fixed.fixedMappingCount = 131;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 131;
coverage.coverage.mappedOccurrenceAnchors = 329;
coverage.coverage.remainingLegacyOccurrences = 60;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const sourceIds = new Set(subjects.map(item => item.sourceOccurrenceId));
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => !sourceIds.has(item.sourceOccurrenceId));
if (![before, before - 1].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 60)) throw new Error('Saint Callistus I source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 329;
inventory.coverageAtInventory.remainingOccurrences = 60;
inventory.familyCounts['fixed-person'] = 15;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidates = subjects.map(item => ({
  person: { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names },
  recognition: { id: item.recognitionId, personId: item.personId, ecclesialTitles: item.titles, evidenceUrl: item.calendarUrl },
  observanceId: item.observanceId, sanctoraleRuleId: item.ruleId, contextualBoundary: item.context,
  source: { canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId, sourceRecordHash: item.sourceRecordHash,
    sourceLabelPt: item.sourceLabelPt, observedDesignation: `${item.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF', canonicalRank: 'optional-memorial', snlUrl: snl }
}));
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-58.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-58.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(item => item.personId),
  promotedObservanceIds: subjects.map(item => item.observanceId),
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 329, requiredForPromotion: 389, remainingLegacyOccurrences: 60 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

const replace = (path, replacements) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (text.includes(to)) continue;
    if (from instanceof RegExp) {
      if (from.test(text)) text = text.replace(from, to);
      else if (!text.includes(to)) throw new Error(`Missing expected pattern in ${path}: ${from}`);
    } else {
      if (text.includes(from)) text = text.replace(from, to);
      else if (!text.includes(to)) throw new Error(`Missing expected text in ${path}: ${from}`);
    }
  }
  fs.writeFileSync(path, text);
};

replace('scripts/build/test-roman-catholic-reconciliation-ledger.mjs', [
  ['fixedSanctorale === 130 && ledger.counts.fixedSanctoraleDays === 118', 'fixedSanctorale === 131 && ledger.counts.fixedSanctoraleDays === 119'],
  ['preserve 130 exact Sanctorale occurrences across 118 civil days', 'preserve 131 exact Sanctorale occurrences across 119 civil days'],
  ['sourceBound === 311 && ledger.counts.sourceBoundOccurrences === 328', 'sourceBound === 312 && ledger.counts.sourceBoundOccurrences === 329'],
  ['distinguish 311 source-bound days from 328 source-bound canonical occurrences', 'distinguish 312 source-bound days from 329 source-bound canonical occurrences'],
  ["ledger.counts.unresolved === 54", "ledger.counts.unresolved === 53"],
  ["assert(october9?.classification", "const october14 = ledger.entries.find((day) => day.dateISO === '2026-10-14');\nassert(october14?.classification === 'fixed-sanctorale' && october14.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:callistus-i:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StCallistusIPope'), 'Saint Callistus I must retain the exact optional-memorial source binding on 14 October.');\n\nassert(october9?.classification"],
  ['+ 130 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 328 source-bound occurrences across 311 days, 54 wholly unbound days', '+ 131 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 329 source-bound occurrences across 312 days, 53 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 130', 'candidates.length === 131'], ['one hundred and thirty reviewed rules', 'one hundred and thirty-one reviewed rules'],
  ["['observance:john-leonardi:roman-catholic', ['2026-10-09', 'optional-memorial', 12, 'general-roman']],", "['observance:john-leonardi:roman-catholic', ['2026-10-09', 'optional-memorial', 12, 'general-roman']],\n    ['observance:callistus-i:roman-catholic', ['2026-10-14', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 130', 'occurrences.occurrences.length === 131'],
  ['Roman Sanctorale passed: 130 authority-isolated perennial Portugal vectors, including John Henry Newman and John Leonardi as independent 9 October alternatives alongside the collective Observance of Saint Denis, Rusticus and Eleutherius', 'Roman Sanctorale passed: 131 authority-isolated perennial Portugal vectors, including Saint Callistus I on 14 October']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 213', 'peopleCount === 214'], ["'john-henry-newman', 'john-leonardi',", "'john-henry-newman', 'john-leonardi', 'callistus-i',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 211', 'recognitionCount === 212'], ['personCoverageCount === 210', 'personCoverageCount === 211'],
  ["'recognition:john-leonardi:roman-catholic',", "'recognition:john-leonardi:roman-catholic',\n  'recognition:callistus-i:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 211', 'recognitionCount, 212'], ['personCoverageCount, 210', 'personCoverageCount, 211']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 132', 'observanceCount === 133'], ['personCoverageCount === 210', 'personCoverageCount === 211'],
  ["const denisCompanions = first.observances.find", "const callistus = first.observances.find((item) => item.observanceId === 'observance:callistus-i:roman-catholic');\nassert(callistus?.subjects?.[0]?.personId === 'callistus-i', 'Saint Callistus I must remain a distinct person-scoped Observance.');\n\nconst denisCompanions = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 130', 'occurrenceCount === 131'], ['legacyBridgeCount === 130', 'legacyBridgeCount === 131'],
  ["['observance:john-leonardi:roman-catholic', ['2026-10-09', 'optional-memorial', 'MF', 'rc:StJohnLeonardi']],", "['observance:john-leonardi:roman-catholic', ['2026-10-09', 'optional-memorial', 'MF', 'rc:StJohnLeonardi']],\n  ['observance:callistus-i:roman-catholic', ['2026-10-14', 'optional-memorial', 'MF', 'rc:StCallistusIPope']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 130 && explicitOccurrences.length', 'length === 131 && explicitOccurrences.length'], ['one hundred and thirty', 'one hundred and thirty-one'],
  ['length === 130 && explicitBridges.length', 'length === 131 && explicitBridges.length'], ['the one hundred and thirty canonical Occurrences', 'the one hundred and thirty-one canonical Occurrences'],
  ['mappings.length === 130', 'mappings.length === 131'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 130 && explicitBridgeByOccurrence.size === 130 && fixedMappingByOccurrence.size === 130', 'explicitOccurrenceById.size === 131 && explicitBridgeByOccurrence.size === 131 && fixedMappingByOccurrence.size === 131'],
  ['coveredSourceIds.size === 317 && coveredSourceHashes.size === 317 && coveredOccurrenceIds.size === 317', 'coveredSourceIds.size === 318 && coveredSourceHashes.size === 318 && coveredOccurrenceIds.size === 318'],
  ['totalMapped === 328', 'totalMapped === 329'], ['exactly 328/389', 'exactly 329/389'], ['remainingLegacyOccurrences === 61', 'remainingLegacyOccurrences === 60'],
  ['exactly 61.', 'exactly 60.'], ['coveragePercent === 84.319', 'coveragePercent === 84.576'], ['= 130 exact fixed Sanctorale', '= 131 exact fixed Sanctorale'], ['; 61 remaining,', '; 60 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 328 && coveredSourceIds.size === 328', 'coveredRows.length === 329 && coveredSourceIds.size === 329'], ['exactly 328 unique', 'exactly 329 unique'],
  ['remaining.length === 61 && remainingSourceIds.size === 61 && remainingSourceHashes.size === 61', 'remaining.length === 60 && remainingSourceIds.size === 60 && remainingSourceHashes.size === 60'],
  ['exactly 61 unique', 'exactly 60 unique'], ['sourceBoundOccurrences === 328 && inventory.coverageAtInventory.remainingOccurrences === 61', 'sourceBoundOccurrences === 329 && inventory.coverageAtInventory.remainingOccurrences === 60'],
  ["actualCounts['fixed-person'] === 16", "actualCounts['fixed-person'] === 15"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnHenryNewman'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StCallistusIPope'), 'Saint Callistus I must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnHenryNewman'),"],
  ['Portugal semantic inventory passed: 328 covered + 61 exact unresolved source rows = 389; John Henry Newman and John Leonardi are independent source-bound alternatives on 9 October alongside the collective Denis memorial;', 'Portugal semantic inventory passed: 329 covered + 60 exact unresolved source rows = 389; Saint Callistus I is source-bound on 14 October;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-57.json', '5eb8563b1ab146201d83b86200e7980552b164766d6423164560665728f8158c']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-57.json', '5eb8563b1ab146201d83b86200e7980552b164766d6423164560665728f8158c'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-58.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(item => item.personId) }, null, 2));



import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-11';
const dateISO = '2026-11-16';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-11-16';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-11-16';

const subjects = [
  {
    personId: 'gertrude-the-great', legacyId: 'rc:StGertrudeGreat',
    sourceOccurrenceId: 'snl-pt-2026-11-16-f0eb14fec23ed50e8ad4e64d',
    sourceRecordHash: '08fab6337dc7342e438ce8e19591d783cc0dc350e2e29595740b85c49684d224',
    sourceLabelPt: 'S. Gertrudes, virgem',
    names: { en: 'Saint Gertrude the Great', pt: 'Santa Gertrudes', es: 'Santa Gertrudis la Magna', it: 'Santa Gertrude la Grande' },
    titles: ['virgin', 'cistercian'],
    identityEvidence: { publisher: 'Holy See', url: 'https://www.vatican.va/content/benedict-xvi/pt/audiences/2010/documents/hf_ben-xvi_aud_20101006.html', claimTypes: ['identity', 'ecclesial-status', 'virginity', 'cistercian-life', 'contemplative-life'] },
    context: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', benedictineProper2026: 'obligatory-memorial', cistercianProper2026: 'feast', dehonianProper2026: 'obligatory-memorial', institutionalRanksKeptContextual: true, sameDateAlternativesKeptIndependent: true }
  },
  {
    personId: 'margaret-of-scotland', legacyId: 'rc:StMargaretScotland',
    sourceOccurrenceId: 'snl-pt-2026-11-16-bfa726f8b26659de5d5bb9f6',
    sourceRecordHash: '35fbe8b6a29820610a61d18e6661651b754d7fe8aa86f4d4ddd5813127c3492a',
    sourceLabelPt: 'S. Margarida da Escócia',
    names: { en: 'Saint Margaret of Scotland', pt: 'Santa Margarida da Escócia', es: 'Santa Margarita de Escocia', it: 'Santa Margherita di Scozia' },
    titles: ['queen', 'mother', 'laywoman'],
    identityEvidence: { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['identity', 'ecclesial-status', 'queen', 'mother', 'charitable-service', 'death-year'] },
    context: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', sameDateAlternativesKeptIndependent: true }
  }
].map(item => ({ ...item, recognitionId: `recognition:${item.personId}:roman-catholic`, observanceId: `observance:${item.personId}:roman-catholic`, ruleId: `sanctorale-rule:${item.personId}:general-roman`, occurrenceId: `occurrence:${dateISO}:${item.personId}:roman-catholic:pt` }));

const appendUnique = (path, key, value, idKey = 'id') => {
  const data = read(path);
  const existing = data[key].find(item => item[idKey] === value[idKey]);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(value)) throw new Error(`${value[idKey]} exists with different semantics in ${path}`);
    return;
  }
  data[key].push(value);
  write(path, data);
};

for (const item of subjects) {
  appendUnique('data/canonical-person-anchors.json', 'people', { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names });
  appendUnique('data/canonical-recognition-anchors.json', 'recognitions', {
    id: item.recognitionId, personId: item.personId, churchId: 'church:roman-catholic', jurisdictionId: 'global',
    recognizedAs: 'saint', recognitionBasis: 'official-church-attestation', ecclesialTitles: item.titles,
    scope: 'church-wide', calendarMembershipImplied: false, observanceDateImplied: false,
    evidence: [item.identityEvidence, { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['identity', 'ecclesial-status', 'liturgical-commemoration'] }], verifiedAt
  });
  appendUnique('data/canonical-observance-anchors.json', 'observances', {
    id: item.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration', observanceType: 'person-commemoration',
    subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }], scope: 'church-attested', occurrenceDateImplied: false,
    calendarSystemImplied: false, jurisdictionImplied: false, rankImplied: false, precedenceImplied: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-alternatives-kept-independent'] }], verifiedAt
  });
  appendUnique('data/canonical-roman-sanctorale-rule-anchors.json', 'rules', {
    id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 11, day: 16 },
    liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'same-date-alternatives-kept-independent'] }], verifiedAt
  });
  appendUnique('data/canonical-occurrence-anchors.json', 'occurrences', {
    id: item.occurrenceId, observanceId: item.observanceId, churchId: 'church:roman-catholic', jurisdictionId: 'jurisdiction:roman-catholic:pt',
    calendarSystem: 'gregorian', year: 2026, dateISO, rank: 'optional-memorial', sourceRankCode: 'MF',
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank'], observedDesignation: `${item.sourceLabelPt} – MF` }], verifiedAt
  });
  appendUnique('data/canonical-occurrence-legacy-bridges.json', 'bridges', { occurrenceId: item.occurrenceId, legacyObservanceId: item.legacyId, dateISO }, 'legacyObservanceId');
}

const fixedPath = 'data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json';
const fixed = read(fixedPath);
for (const item of subjects) {
  const mapping = { occurrenceId: item.occurrenceId, observanceId: item.observanceId, sanctoraleRuleId: item.ruleId, legacyObservanceId: item.legacyId,
    expectedDateISO: dateISO, sourceOccurrenceId: item.sourceOccurrenceId, sourceRecordHash: item.sourceRecordHash,
    legacyRank: 'optional-memorial', canonicalRank: 'optional-memorial', sourceRankCode: 'MF', reviewStatus: 'source-bound-exact', resolution: 'exact-fixed-date-binding' };
  const existing = fixed.mappings.find(row => row.occurrenceId === mapping.occurrenceId);
  if (existing && JSON.stringify(existing) !== JSON.stringify(mapping)) throw new Error(`${mapping.occurrenceId} mapping differs`);
  if (!existing) fixed.mappings.push(mapping);
}
fixed.fixedMappingCount = 140;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 140;
coverage.coverage.mappedOccurrenceAnchors = 338;
coverage.coverage.remainingLegacyOccurrences = 51;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const sourceIds = new Set(subjects.map(item => item.sourceOccurrenceId));
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => !sourceIds.has(item.sourceOccurrenceId));
if (![before, before - 2].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 51)) throw new Error('November 16 source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 338;
inventory.coverageAtInventory.remainingOccurrences = 51;
inventory.familyCounts['fixed-person'] = 6;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidates = subjects.map(item => ({
  person: { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names },
  recognition: { id: item.recognitionId, personId: item.personId, ecclesialTitles: item.titles, evidenceUrl: item.identityEvidence.url },
  observanceId: item.observanceId, sanctoraleRuleId: item.ruleId, contextualBoundary: item.context,
  source: { canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId, sourceRecordHash: item.sourceRecordHash, sourceLabelPt: item.sourceLabelPt,
    observedDesignation: `${item.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF', canonicalRank: 'optional-memorial', snlUrl: snl }
}));
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-65.json';
write(`data/migrations/${reviewFile}`, { schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2', sourceArtifact: coverage.sourceArtifact,
  canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' }, candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt });
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-65.json', { schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest, sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(item => item.personId), promotedObservanceIds: subjects.map(item => item.observanceId),
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 338, requiredForPromotion: 389, remainingLegacyOccurrences: 51 }, fixedSanctoraleMappingDigestSha256: mappingDigest,
  runtimePublicationAllowed: false, productionWriteAllowed: false, promotionAllowed: false, verifiedAt });

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
  ['fixedSanctorale === 138 && ledger.counts.fixedSanctoraleDays === 124', 'fixedSanctorale === 140 && ledger.counts.fixedSanctoraleDays === 125'],
  ['preserve 138 exact Sanctorale occurrences across 124 civil days', 'preserve 140 exact Sanctorale occurrences across 125 civil days'],
  ['sourceBound === 316 && ledger.counts.sourceBoundOccurrences === 336', 'sourceBound === 317 && ledger.counts.sourceBoundOccurrences === 338'],
  ['distinguish 316 source-bound days from 336 source-bound canonical occurrences', 'distinguish 317 source-bound days from 338 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 49', 'ledger.counts.unresolved === 48'],
  ["const november3 = ledger.entries.find((day) => day.dateISO === '2026-11-03');", "const november16 = ledger.entries.find((day) => day.dateISO === '2026-11-16');\nassert(november16?.classification === 'fixed-sanctorale' && november16.fixedOptions?.length === 2 && november16.fixedOptions.some(item => item.canonicalObservanceId === 'observance:gertrude-the-great:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StGertrudeGreat') && november16.fixedOptions.some(item => item.canonicalObservanceId === 'observance:margaret-of-scotland:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StMargaretScotland'), 'Saint Gertrude and Saint Margaret of Scotland must remain independent optional alternatives on 16 November.');\n\nconst november3 = ledger.entries.find((day) => day.dateISO === '2026-11-03');"],
  ['+ 138 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 336 source-bound occurrences across 316 days, 49 wholly unbound days', '+ 140 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 338 source-bound occurrences across 317 days, 48 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 138', 'candidates.length === 140'], ['one hundred and thirty-eight reviewed rules', 'one hundred and forty reviewed rules'],
  ["['observance:martin-de-porres:roman-catholic', ['2026-11-03', 'optional-memorial', 12, 'general-roman']],", "['observance:martin-de-porres:roman-catholic', ['2026-11-03', 'optional-memorial', 12, 'general-roman']],\n    ['observance:gertrude-the-great:roman-catholic', ['2026-11-16', 'optional-memorial', 12, 'general-roman']],\n    ['observance:margaret-of-scotland:roman-catholic', ['2026-11-16', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 138', 'occurrences.occurrences.length === 140'],
  ['Roman Sanctorale passed: 138 authority-isolated perennial Portugal vectors, including Saint Martin de Porres on 3 November with the Dominican proper rank kept contextual', 'Roman Sanctorale passed: 140 authority-isolated perennial Portugal vectors, including Saint Gertrude and Saint Margaret of Scotland as independent alternatives on 16 November']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [['peopleCount === 221', 'peopleCount === 223'], ["'anthony-mary-claret', 'martin-de-porres',", "'anthony-mary-claret', 'martin-de-porres', 'gertrude-the-great', 'margaret-of-scotland',"]]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 219', 'recognitionCount === 221'], ['personCoverageCount === 218', 'personCoverageCount === 220'],
  ["'recognition:martin-de-porres:roman-catholic',", "'recognition:martin-de-porres:roman-catholic',\n  'recognition:gertrude-the-great:roman-catholic',\n  'recognition:margaret-of-scotland:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 219', 'recognitionCount, 221'], ['personCoverageCount, 218', 'personCoverageCount, 220']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 140', 'observanceCount === 142'], ['personCoverageCount === 218', 'personCoverageCount === 220'],
  ["const martinDePorres = first.observances.find", "const gertrude = first.observances.find((row) => row.observanceId === 'observance:gertrude-the-great:roman-catholic');\nassert(gertrude?.subjects?.[0]?.personId === 'gertrude-the-great', 'Saint Gertrude must remain a distinct person-scoped Observance.');\nconst margaretScotland = first.observances.find((row) => row.observanceId === 'observance:margaret-of-scotland:roman-catholic');\nassert(margaretScotland?.subjects?.[0]?.personId === 'margaret-of-scotland', 'Saint Margaret of Scotland must remain a distinct person-scoped Observance.');\n\nconst martinDePorres = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 138', 'occurrenceCount === 140'], ['legacyBridgeCount === 138', 'legacyBridgeCount === 140'],
  ["['observance:martin-de-porres:roman-catholic', ['2026-11-03', 'optional-memorial', 'MF', 'rc:StMartinPorres']],", "['observance:martin-de-porres:roman-catholic', ['2026-11-03', 'optional-memorial', 'MF', 'rc:StMartinPorres']],\n  ['observance:gertrude-the-great:roman-catholic', ['2026-11-16', 'optional-memorial', 'MF', 'rc:StGertrudeGreat']],\n  ['observance:margaret-of-scotland:roman-catholic', ['2026-11-16', 'optional-memorial', 'MF', 'rc:StMargaretScotland']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['explicitOccurrences.length === 138', 'explicitOccurrences.length === 140'], ['one hundred and thirty-eight', 'one hundred and forty'],
  ['explicitBridges.length === 138', 'explicitBridges.length === 140'], ['the one hundred and thirty-eight canonical Occurrences', 'the one hundred and forty canonical Occurrences'],
  ['mappings.length === 138', 'mappings.length === 140'],
  [`fixedSanctoraleMappingDigest === 'b1a196c192674e844e902743b9a452e042fddb0e861add860ad563fad6f2f9db'`, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 138 && explicitBridgeByOccurrence.size === 138 && fixedMappingByOccurrence.size === 138', 'explicitOccurrenceById.size === 140 && explicitBridgeByOccurrence.size === 140 && fixedMappingByOccurrence.size === 140'],
  ['coveredSourceIds.size === 325 && coveredSourceHashes.size === 325 && coveredOccurrenceIds.size === 325', 'coveredSourceIds.size === 327 && coveredSourceHashes.size === 327 && coveredOccurrenceIds.size === 327'],
  ['totalMapped === 336', 'totalMapped === 338'], ['exactly 336/389', 'exactly 338/389'], ['remainingLegacyOccurrences === 53', 'remainingLegacyOccurrences === 51'],
  ['exactly 53.', 'exactly 51.'], ['coveragePercent === 86.375', 'coveragePercent === 86.889'], ['= 138 exact fixed Sanctorale', '= 140 exact fixed Sanctorale'], ['; 53 remaining,', '; 51 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 336 && coveredSourceIds.size === 336', 'coveredRows.length === 338 && coveredSourceIds.size === 338'], ['exactly 336 unique', 'exactly 338 unique'],
  ['remaining.length === 53 && remainingSourceIds.size === 53 && remainingSourceHashes.size === 53', 'remaining.length === 51 && remainingSourceIds.size === 51 && remainingSourceHashes.size === 51'],
  ['exactly 53 unique', 'exactly 51 unique'], ['sourceBoundOccurrences === 336 && inventory.coverageAtInventory.remainingOccurrences === 53', 'sourceBoundOccurrences === 338 && inventory.coverageAtInventory.remainingOccurrences === 51'],
  ["actualCounts['fixed-person'] === 8", "actualCounts['fixed-person'] === 6"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StMartinPorres'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StGertrudeGreat'), 'Saint Gertrude must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StMargaretScotland'), 'Saint Margaret of Scotland must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StMartinPorres'),"],
  ['Portugal semantic inventory passed: 336 covered + 53 exact unresolved source rows = 389; Saint Martin de Porres is source-bound on 3 November with the Dominican proper rank kept contextual;', 'Portugal semantic inventory passed: 338 covered + 51 exact unresolved source rows = 389; Saint Gertrude and Saint Margaret of Scotland are independent source-bound alternatives on 16 November;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [["['roman-catholic-pt-2026-v2.sanctorale-review-batch-64.json', '77e8fd083b809fef0d5f0efb57050f5bd2e9a6bc0a1296d76d59d46c204fa0cb'],", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-64.json', '77e8fd083b809fef0d5f0efb57050f5bd2e9a6bc0a1296d76d59d46c204fa0cb'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-65.json', '${reviewDigest}'],`]]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(item => item.personId) }, null, 2));

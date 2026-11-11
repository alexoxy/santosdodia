import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-04';
const dateISO = '2026-10-16';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-16';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-10-16';

const subjects = [
  {
    personId: 'hedwig-of-silesia',
    legacyId: 'rc:StHedwig',
    sourceOccurrenceId: 'snl-pt-2026-10-16-c36e435717feba3a961d68e3',
    sourceRecordHash: 'f16071b86d7a10bbba78345c8994404eb13ea80cb4c320593a11764a1c250a21',
    sourceLabelPt: 'S. Hedwiges, religiosa',
    names: { en: 'Saint Hedwig of Silesia', pt: 'Santa Hedviges', es: 'Santa Eduviges de Silesia', it: 'Santa Edvige di Slesia' },
    titles: ['religious', 'duchess'],
    identityUrl: 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=175',
    recognitionClaimTypes: ['identity', 'ecclesial-status', 'religious-life', 'ducal-status', 'canonization', 'death-date'],
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      cistercianProper2026: 'optional-memorial', institutionalRankKeptContextual: true,
      sameDateAlternativesKeptIndependent: true, patronagePublished: false
    }
  },
  {
    personId: 'margaret-mary-alacoque',
    legacyId: 'rc:StMargaretAlacoque',
    sourceOccurrenceId: 'snl-pt-2026-10-16-42ba6c794a4dce057d6fab69',
    sourceRecordHash: '46d0cbbeb30541ab3295a9a1b3528d062f1e272b80a2929c87eac9070523fb0a',
    sourceLabelPt: 'S. Margarida Maria Alacoque, virgem',
    names: { en: 'Saint Margaret Mary Alacoque', pt: 'Santa Margarida Maria Alacoque', es: 'Santa Margarita María Alacoque', it: 'Santa Margherita Maria Alacoque' },
    titles: ['virgin', 'religious'],
    identityUrl: 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=176',
    recognitionClaimTypes: ['identity', 'ecclesial-status', 'virginity', 'religious-life', 'death-date'],
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      visitationProper2026: 'feast', dehonianProper2026: 'obligatory-memorial',
      institutionalRanksKeptContextual: true, sameDateAlternativesKeptIndependent: true,
      patronagePublished: false
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
      { publisher: 'Secretariado Nacional de Liturgia', url: item.identityUrl, claimTypes: item.recognitionClaimTypes },
      { publisher: 'Secretariado Nacional de Liturgia', url: martyrology, claimTypes: ['identity', 'ecclesial-status', 'religious-life', 'death-date'] }
    ],
    verifiedAt
  };
  const observance = {
    id: item.observanceId, churchId: 'church:roman-catholic', observanceKey: 'principal-commemoration',
    observanceType: 'person-commemoration', subjects: [{ kind: 'person', personId: item.personId, recognitionId: item.recognitionId }],
    scope: 'church-attested', occurrenceDateImplied: false, calendarSystemImplied: false, jurisdictionImplied: false,
    rankImplied: false, precedenceImplied: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['observance-attestation', 'liturgical-designation', 'optional-memorial', 'same-date-alternatives-kept-independent'] }],
    verifiedAt
  };
  const rule = {
    id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 10, day: 16 },
    liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'same-date-alternatives-kept-independent'] }],
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
fixed.fixedMappingCount = 133;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 133;
coverage.coverage.mappedOccurrenceAnchors = 331;
coverage.coverage.remainingLegacyOccurrences = 58;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const sourceIds = new Set(subjects.map(item => item.sourceOccurrenceId));
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => !sourceIds.has(item.sourceOccurrenceId));
if (![before, before - 2].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 58)) throw new Error('Saint Hedwig and Saint Margaret Mary Alacoque source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 331;
inventory.coverageAtInventory.remainingOccurrences = 58;
inventory.familyCounts['fixed-person'] = 13;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidates = subjects.map(item => ({
  person: { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names },
  recognition: { id: item.recognitionId, personId: item.personId, ecclesialTitles: item.titles, evidenceUrl: martyrology },
  observanceId: item.observanceId, sanctoraleRuleId: item.ruleId, contextualBoundary: item.context,
  source: { canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId, sourceRecordHash: item.sourceRecordHash,
    sourceLabelPt: item.sourceLabelPt, observedDesignation: `${item.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF', canonicalRank: 'optional-memorial', snlUrl: snl }
}));
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-59.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-59.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(item => item.personId),
  promotedObservanceIds: subjects.map(item => item.observanceId),
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 331, requiredForPromotion: 389, remainingLegacyOccurrences: 58 },
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
  ['fixedSanctorale === 131 && ledger.counts.fixedSanctoraleDays === 119', 'fixedSanctorale === 133 && ledger.counts.fixedSanctoraleDays === 120'],
  ['preserve 131 exact Sanctorale occurrences across 119 civil days', 'preserve 133 exact Sanctorale occurrences across 120 civil days'],
  ['sourceBound === 312 && ledger.counts.sourceBoundOccurrences === 329', 'sourceBound === 313 && ledger.counts.sourceBoundOccurrences === 331'],
  ['distinguish 312 source-bound days from 329 source-bound canonical occurrences', 'distinguish 313 source-bound days from 331 source-bound canonical occurrences'],
  ["ledger.counts.unresolved === 53", "ledger.counts.unresolved === 52"],
  ["const october14 = ledger.entries.find((day) => day.dateISO === '2026-10-14');", "const october16 = ledger.entries.find((day) => day.dateISO === '2026-10-16');\nassert(october16?.classification === 'fixed-sanctorale' && october16.fixedOptions?.length === 2 && october16.fixedOptions.some(item => item.canonicalObservanceId === 'observance:hedwig-of-silesia:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StHedwig') && october16.fixedOptions.some(item => item.canonicalObservanceId === 'observance:margaret-mary-alacoque:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StMargaretAlacoque'), 'Saint Hedwig and Saint Margaret Mary Alacoque must remain independent optional alternatives on 16 October.');\n\nconst october14 = ledger.entries.find((day) => day.dateISO === '2026-10-14');"],
  ['+ 131 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 329 source-bound occurrences across 312 days, 53 wholly unbound days', '+ 133 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 331 source-bound occurrences across 313 days, 52 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 131', 'candidates.length === 133'], ['one hundred and thirty-one reviewed rules', 'one hundred and thirty-three reviewed rules'],
  ["['observance:callistus-i:roman-catholic', ['2026-10-14', 'optional-memorial', 12, 'general-roman']],", "['observance:callistus-i:roman-catholic', ['2026-10-14', 'optional-memorial', 12, 'general-roman']],\n    ['observance:hedwig-of-silesia:roman-catholic', ['2026-10-16', 'optional-memorial', 12, 'general-roman']],\n    ['observance:margaret-mary-alacoque:roman-catholic', ['2026-10-16', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 131', 'occurrences.occurrences.length === 133'],
  ['Roman Sanctorale passed: 131 authority-isolated perennial Portugal vectors, including Saint Callistus I on 14 October', 'Roman Sanctorale passed: 133 authority-isolated perennial Portugal vectors, including Saint Hedwig and Saint Margaret Mary Alacoque as independent alternatives on 16 October']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 214', 'peopleCount === 216'], ["'john-henry-newman', 'john-leonardi', 'callistus-i',", "'john-henry-newman', 'john-leonardi', 'callistus-i', 'hedwig-of-silesia', 'margaret-mary-alacoque',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 212', 'recognitionCount === 214'], ['personCoverageCount === 211', 'personCoverageCount === 213'],
  ["'recognition:callistus-i:roman-catholic',", "'recognition:callistus-i:roman-catholic',\n  'recognition:hedwig-of-silesia:roman-catholic',\n  'recognition:margaret-mary-alacoque:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 212', 'recognitionCount, 214'], ['personCoverageCount, 211', 'personCoverageCount, 213']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 133', 'observanceCount === 135'], ['personCoverageCount === 211', 'personCoverageCount === 213'],
  ["const callistus = first.observances.find", "const hedwig = first.observances.find((item) => item.observanceId === 'observance:hedwig-of-silesia:roman-catholic');\nassert(hedwig?.subjects?.[0]?.personId === 'hedwig-of-silesia', 'Saint Hedwig must remain a distinct person-scoped Observance.');\nconst alacoque = first.observances.find((item) => item.observanceId === 'observance:margaret-mary-alacoque:roman-catholic');\nassert(alacoque?.subjects?.[0]?.personId === 'margaret-mary-alacoque', 'Saint Margaret Mary Alacoque must remain a distinct person-scoped Observance.');\n\nconst callistus = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 131', 'occurrenceCount === 133'], ['legacyBridgeCount === 131', 'legacyBridgeCount === 133'],
  ["['observance:callistus-i:roman-catholic', ['2026-10-14', 'optional-memorial', 'MF', 'rc:StCallistusIPope']],", "['observance:callistus-i:roman-catholic', ['2026-10-14', 'optional-memorial', 'MF', 'rc:StCallistusIPope']],\n  ['observance:hedwig-of-silesia:roman-catholic', ['2026-10-16', 'optional-memorial', 'MF', 'rc:StHedwig']],\n  ['observance:margaret-mary-alacoque:roman-catholic', ['2026-10-16', 'optional-memorial', 'MF', 'rc:StMargaretAlacoque']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 131 && explicitOccurrences.length', 'length === 133 && explicitOccurrences.length'], ['one hundred and thirty-one', 'one hundred and thirty-three'],
  ['length === 131 && explicitBridges.length', 'length === 133 && explicitBridges.length'], ['the one hundred and thirty-one canonical Occurrences', 'the one hundred and thirty-three canonical Occurrences'],
  ['mappings.length === 131', 'mappings.length === 133'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 131 && explicitBridgeByOccurrence.size === 131 && fixedMappingByOccurrence.size === 131', 'explicitOccurrenceById.size === 133 && explicitBridgeByOccurrence.size === 133 && fixedMappingByOccurrence.size === 133'],
  ['coveredSourceIds.size === 318 && coveredSourceHashes.size === 318 && coveredOccurrenceIds.size === 318', 'coveredSourceIds.size === 320 && coveredSourceHashes.size === 320 && coveredOccurrenceIds.size === 320'],
  ['totalMapped === 329', 'totalMapped === 331'], ['exactly 329/389', 'exactly 331/389'], ['remainingLegacyOccurrences === 60', 'remainingLegacyOccurrences === 58'],
  ['exactly 60.', 'exactly 58.'], ['coveragePercent === 84.576', 'coveragePercent === 85.09'], ['= 131 exact fixed Sanctorale', '= 133 exact fixed Sanctorale'], ['; 60 remaining,', '; 58 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 329 && coveredSourceIds.size === 329', 'coveredRows.length === 331 && coveredSourceIds.size === 331'], ['exactly 329 unique', 'exactly 331 unique'],
  ['remaining.length === 60 && remainingSourceIds.size === 60 && remainingSourceHashes.size === 60', 'remaining.length === 58 && remainingSourceIds.size === 58 && remainingSourceHashes.size === 58'],
  ['exactly 60 unique', 'exactly 58 unique'], ['sourceBoundOccurrences === 329 && inventory.coverageAtInventory.remainingOccurrences === 60', 'sourceBoundOccurrences === 331 && inventory.coverageAtInventory.remainingOccurrences === 58'],
  ["actualCounts['fixed-person'] === 15", "actualCounts['fixed-person'] === 13"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StCallistusIPope'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StHedwig'), 'Saint Hedwig must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StMargaretAlacoque'), 'Saint Margaret Mary Alacoque must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StCallistusIPope'),"],
  ['Portugal semantic inventory passed: 329 covered + 60 exact unresolved source rows = 389; Saint Callistus I is source-bound on 14 October;', 'Portugal semantic inventory passed: 331 covered + 58 exact unresolved source rows = 389; Saint Hedwig and Saint Margaret Mary Alacoque are independent source-bound alternatives on 16 October;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-58.json', '8970205adc27eace6d2338da6408ba7859c99c992e5e7bfe1f80566472ed9e0d']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-58.json', '8970205adc27eace6d2338da6408ba7859c99c992e5e7bfe1f80566472ed9e0d'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-59.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(item => item.personId) }, null, 2));


import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const verifiedAt = '2026-11-11';
const dateISO = '2026-11-23';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-11-23';
const martyrology = 'https://mail.liturgia.pt/martirologio/elogio.php?data=2026-11-23';

const subjects = [
  {
    personId: 'clement-i-pope', legacyId: 'rc:StClementIPope',
    sourceOccurrenceId: 'snl-pt-2026-11-23-66e04829ecf01ea414a20950',
    sourceRecordHash: 'eb391e8384a4ae0ec039c15ad641e9df23b83a1d736ea523cb16261c4dde8118',
    sourceLabelPt: 'S. Clemente I, papa e mártir',
    names: { en: 'Saint Clement I', pt: 'São Clemente I', es: 'San Clemente I', it: 'San Clemente I' },
    titles: ['pope', 'martyr'],
    identityEvidence: { publisher: 'Holy See', url: 'https://www.vatican.va/content/benedict-xvi/en/audiences/2007/documents/hf_ben-xvi_aud_20070307.html', claimTypes: ['identity', 'bishop-of-rome', 'third-successor-of-peter', 'letter-to-the-corinthians', 'martyr-title-attestation'] },
    context: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', sameDateAlternativesKeptIndependent: true }
  },
  {
    personId: 'columban-luxeuil', legacyId: 'rc:StColumban',
    sourceOccurrenceId: 'snl-pt-2026-11-23-6a3830f808141259fc4d93f5',
    sourceRecordHash: 'd51e10e60ba18cc7b4ab640b4d53d2d582ea43f619ca4ba65c666325582a9a5d',
    sourceLabelPt: 'S. Columbano, abade',
    names: { en: 'Saint Columban', pt: 'São Columbano', es: 'San Columbano', it: 'San Colombano' },
    titles: ['abbot', 'priest', 'missionary'],
    identityEvidence: { publisher: 'Holy See', url: 'https://www.vatican.va/content/benedict-xvi/en/audiences/2008/documents/hf_ben-xvi_aud_20080611.html', claimTypes: ['identity', 'abbacy', 'priesthood', 'missionary-life', 'monastic-foundations', 'death-date'] },
    context: { generalRoman: 'optional-memorial', portugal2026: 'optional-memorial', cistercianProper2026: 'optional-memorial', institutionalContextKeptSeparate: true, sameDateAlternativesKeptIndependent: true }
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
    id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 11, day: 23 },
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
fixed.fixedMappingCount = 142;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 142;
coverage.coverage.mappedOccurrenceAnchors = 340;
coverage.coverage.remainingLegacyOccurrences = 49;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const sourceIds = new Set(subjects.map(item => item.sourceOccurrenceId));
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => !sourceIds.has(item.sourceOccurrenceId));
if (![before, before - 2].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 49)) throw new Error('November 23 source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 340;
inventory.coverageAtInventory.remainingOccurrences = 49;
inventory.familyCounts['fixed-person'] = 4;
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
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-66.json';
write(`data/migrations/${reviewFile}`, { schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2', sourceArtifact: coverage.sourceArtifact,
  canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' }, candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt });
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-66.json', { schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile,
  reviewDigestSha256: reviewDigest, sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(item => item.personId), promotedObservanceIds: subjects.map(item => item.observanceId),
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 340, requiredForPromotion: 389, remainingLegacyOccurrences: 49 }, fixedSanctoraleMappingDigestSha256: mappingDigest,
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
  ['fixedSanctorale === 140 && ledger.counts.fixedSanctoraleDays === 125', 'fixedSanctorale === 142 && ledger.counts.fixedSanctoraleDays === 126'],
  ['preserve 140 exact Sanctorale occurrences across 125 civil days', 'preserve 142 exact Sanctorale occurrences across 126 civil days'],
  ['sourceBound === 317 && ledger.counts.sourceBoundOccurrences === 338', 'sourceBound === 318 && ledger.counts.sourceBoundOccurrences === 340'],
  ['distinguish 317 source-bound days from 338 source-bound canonical occurrences', 'distinguish 318 source-bound days from 340 source-bound canonical occurrences'],
  ['ledger.counts.unresolved === 48', 'ledger.counts.unresolved === 47'],
  ["const november16 = ledger.entries.find((day) => day.dateISO === '2026-11-16');", "const november23 = ledger.entries.find((day) => day.dateISO === '2026-11-23');\nassert(november23?.classification === 'fixed-sanctorale' && november23.fixedOptions?.length === 2 && november23.fixedOptions.some(item => item.canonicalObservanceId === 'observance:clement-i-pope:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StClementIPope') && november23.fixedOptions.some(item => item.canonicalObservanceId === 'observance:columban-luxeuil:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StColumban'), 'Saint Clement I and Saint Columban must remain independent optional alternatives on 23 November.');\n\nconst november16 = ledger.entries.find((day) => day.dateISO === '2026-11-16');"],
  ['+ 140 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 338 source-bound occurrences across 317 days, 48 wholly unbound days', '+ 142 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 340 source-bound occurrences across 318 days, 47 wholly unbound days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 140', 'candidates.length === 142'], ['one hundred and forty reviewed rules', 'one hundred and forty-two reviewed rules'],
  ["['observance:margaret-of-scotland:roman-catholic', ['2026-11-16', 'optional-memorial', 12, 'general-roman']],", "['observance:margaret-of-scotland:roman-catholic', ['2026-11-16', 'optional-memorial', 12, 'general-roman']],\n    ['observance:clement-i-pope:roman-catholic', ['2026-11-23', 'optional-memorial', 12, 'general-roman']],\n    ['observance:columban-luxeuil:roman-catholic', ['2026-11-23', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 140', 'occurrences.occurrences.length === 142'],
  ['Roman Sanctorale passed: 140 authority-isolated perennial Portugal vectors, including Saint Gertrude and Saint Margaret of Scotland as independent alternatives on 16 November', 'Roman Sanctorale passed: 142 authority-isolated perennial Portugal vectors, including Saint Clement I and Saint Columban as independent alternatives on 23 November']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [['peopleCount === 223', 'peopleCount === 225'], ["'gertrude-the-great', 'margaret-of-scotland',", "'gertrude-the-great', 'margaret-of-scotland', 'clement-i-pope', 'columban-luxeuil',"]]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 221', 'recognitionCount === 223'], ['personCoverageCount === 220', 'personCoverageCount === 222'],
  ["'recognition:margaret-of-scotland:roman-catholic',", "'recognition:margaret-of-scotland:roman-catholic',\n  'recognition:clement-i-pope:roman-catholic',\n  'recognition:columban-luxeuil:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 221', 'recognitionCount, 223'], ['personCoverageCount, 220', 'personCoverageCount, 222']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 142', 'observanceCount === 144'], ['personCoverageCount === 220', 'personCoverageCount === 222'],
  ["const gertrude = first.observances.find", "const clement = first.observances.find((row) => row.observanceId === 'observance:clement-i-pope:roman-catholic');\nassert(clement?.subjects?.[0]?.personId === 'clement-i-pope', 'Saint Clement I must remain a distinct person-scoped Observance.');\nconst columban = first.observances.find((row) => row.observanceId === 'observance:columban-luxeuil:roman-catholic');\nassert(columban?.subjects?.[0]?.personId === 'columban-luxeuil', 'Saint Columban must remain a distinct person-scoped Observance.');\n\nconst gertrude = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 140', 'occurrenceCount === 142'], ['legacyBridgeCount === 140', 'legacyBridgeCount === 142'],
  ["['observance:margaret-of-scotland:roman-catholic', ['2026-11-16', 'optional-memorial', 'MF', 'rc:StMargaretScotland']],", "['observance:margaret-of-scotland:roman-catholic', ['2026-11-16', 'optional-memorial', 'MF', 'rc:StMargaretScotland']],\n  ['observance:clement-i-pope:roman-catholic', ['2026-11-23', 'optional-memorial', 'MF', 'rc:StClementIPope']],\n  ['observance:columban-luxeuil:roman-catholic', ['2026-11-23', 'optional-memorial', 'MF', 'rc:StColumban']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['explicitOccurrences.length === 140', 'explicitOccurrences.length === 142'], ['one hundred and forty.', 'one hundred and forty-two.'],
  ['explicitBridges.length === 140', 'explicitBridges.length === 142'], ['the one hundred and forty canonical Occurrences', 'the one hundred and forty-two canonical Occurrences'],
  ['mappings.length === 140', 'mappings.length === 142'],
  [`fixedSanctoraleMappingDigest === '9c7b12a5a9784fd1c1011f7c32be118947813eb263d33faaed4c3534646761b7'`, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 140 && explicitBridgeByOccurrence.size === 140 && fixedMappingByOccurrence.size === 140', 'explicitOccurrenceById.size === 142 && explicitBridgeByOccurrence.size === 142 && fixedMappingByOccurrence.size === 142'],
  ['coveredSourceIds.size === 327 && coveredSourceHashes.size === 327 && coveredOccurrenceIds.size === 327', 'coveredSourceIds.size === 329 && coveredSourceHashes.size === 329 && coveredOccurrenceIds.size === 329'],
  ['totalMapped === 338', 'totalMapped === 340'], ['exactly 338/389', 'exactly 340/389'], ['remainingLegacyOccurrences === 51', 'remainingLegacyOccurrences === 49'],
  ['exactly 51.', 'exactly 49.'], ['coveragePercent === 86.889', 'coveragePercent === 87.404'], ['= 140 exact fixed Sanctorale', '= 142 exact fixed Sanctorale'], ['; 51 remaining,', '; 49 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 338 && coveredSourceIds.size === 338', 'coveredRows.length === 340 && coveredSourceIds.size === 340'], ['exactly 338 unique', 'exactly 340 unique'],
  ['remaining.length === 51 && remainingSourceIds.size === 51 && remainingSourceHashes.size === 51', 'remaining.length === 49 && remainingSourceIds.size === 49 && remainingSourceHashes.size === 49'],
  ['exactly 51 unique', 'exactly 49 unique'], ['sourceBoundOccurrences === 338 && inventory.coverageAtInventory.remainingOccurrences === 51', 'sourceBoundOccurrences === 340 && inventory.coverageAtInventory.remainingOccurrences === 49'],
  ["actualCounts['fixed-person'] === 6", "actualCounts['fixed-person'] === 4"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StGertrudeGreat'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StClementIPope'), 'Saint Clement I must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StColumban'), 'Saint Columban must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StGertrudeGreat'),"],
  ['Portugal semantic inventory passed: 338 covered + 51 exact unresolved source rows = 389; Saint Gertrude and Saint Margaret of Scotland are independent source-bound alternatives on 16 November;', 'Portugal semantic inventory passed: 340 covered + 49 exact unresolved source rows = 389; Saint Clement I and Saint Columban are independent source-bound alternatives on 23 November;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [["['roman-catholic-pt-2026-v2.sanctorale-review-batch-65.json', '8617726ab27b4335ed48614208fb8846c975558b266cda1e638afd8949649cd5'],", `['roman-catholic-pt-2026-v2.sanctorale-review-batch-65.json', '8617726ab27b4335ed48614208fb8846c975558b266cda1e638afd8949649cd5'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-66.json', '${reviewDigest}'],`]]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(item => item.personId) }, null, 2));

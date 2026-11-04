import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const verifiedAt = '2026-11-04';
const dateISO = '2026-10-09';
const snl = 'https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-10-09';
const newmanDecree = 'https://www.vatican.va/content/romancuria/pt/dicasteri/dicastero-culto-divino-e-disciplina-sacramenti/documenti/20251109-decreto-iscrizione-newman.html';

const subjects = [
  {
    personId: 'john-henry-newman',
    legacyId: 'rc:StJohnHenryNewman',
    sourceOccurrenceId: 'snl-pt-2026-10-09-a9328f9111964c8c13843287',
    sourceRecordHash: 'a1131e89db2f1fd50fe1fc68fd03a05b39e3cad7d54aeb42188200905b9cd9f9',
    sourceLabelPt: 'S. João Henrique Newman, presbítero e doutor da Igreja',
    names: { en: 'Saint John Henry Newman', pt: 'São João Henrique Newman', es: 'San John Henry Newman', it: 'San Giovanni Enrico Newman' },
    titles: ['priest', 'cardinal', 'doctor-of-church'],
    identityUrl: 'https://www.vatican.va/news_services/liturgy/libretti/2019/20191013-libretto-canonizzazione.pdf',
    recognitionClaimTypes: ['identity', 'ecclesial-status', 'priesthood', 'cardinalate', 'canonization'],
    calendarUrl: newmanDecree,
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      doctorTitleSourceBound: true, recentGeneralCalendarInscriptionSourceBound: true,
      sameDateAlternativesKeptIndependent: true
    }
  },
  {
    personId: 'john-leonardi',
    legacyId: 'rc:StJohnLeonardi',
    sourceOccurrenceId: 'snl-pt-2026-10-09-7a799b9a9d12efe130706928',
    sourceRecordHash: 'a19898b6af7aabf28772d3173602d27f500b5f7fccbc0e3334645e42908b5c27',
    sourceLabelPt: 'S. João Leonardo, presbítero',
    names: { en: 'Saint John Leonardi', pt: 'São João Leonardo', es: 'San Juan Leonardi', it: 'San Giovanni Leonardi' },
    titles: ['priest', 'religious-founder'],
    identityUrl: 'https://www.vatican.va/content/benedict-xvi/pt/audiences/2009/documents/hf_ben-xvi_aud_20091007.html',
    recognitionClaimTypes: ['identity', 'ecclesial-status', 'priesthood', 'canonization', 'religious-foundation', 'death-date'],
    calendarUrl: 'https://www.liturgia.pt/santos/santo_v.php?cod_santo=172',
    context: {
      generalRoman: 'optional-memorial', portugal2026: 'optional-memorial',
      pharmacistPatronageAttestedButNotPromoted: true,
      sameDateAlternativesKeptIndependent: true
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
      ...(item.personId === 'john-henry-newman' ? [{ publisher: 'Holy See', url: newmanDecree, claimTypes: ['doctor-of-church', 'general-roman-calendar-inscription'] }] : [])
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
    id: item.ruleId, observanceId: item.observanceId, scopeKey: 'general-roman', dateRule: { type: 'fixed', month: 10, day: 9 },
    liturgicalRank: 'optional-memorial', precedenceClass: 'optional-memorial', isSolemnity: false,
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['fixed-date', 'optional-memorial', 'general-roman-calendar', 'same-date-alternatives-kept-independent'] }],
    verifiedAt
  };
  const occurrence = {
    id: item.occurrenceId, observanceId: item.observanceId, churchId: 'church:roman-catholic',
    jurisdictionId: 'jurisdiction:roman-catholic:pt', calendarSystem: 'gregorian', year: 2026, dateISO,
    rank: 'optional-memorial', sourceRankCode: 'MF',
    evidence: [{ publisher: 'Secretariado Nacional de Liturgia', url: snl, claimTypes: ['annual-date', 'jurisdictional-observance', 'liturgical-rank', 'same-date-alternatives-kept-independent'], observedDesignation: `${item.sourceLabelPt} – MF` }],
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
fixed.fixedMappingCount = 130;
fixed.verifiedAt = verifiedAt;
write(fixedPath, fixed);

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const coverage = read(coveragePath);
coverage.coverage.explicitOccurrenceAnchors = 130;
coverage.coverage.mappedOccurrenceAnchors = 328;
coverage.coverage.remainingLegacyOccurrences = 61;
coverage.verifiedAt = verifiedAt;
write(coveragePath, coverage);

const inventoryPath = 'data/migrations/roman-catholic-pt-2026-v2.semantic-inventory.json';
const inventory = read(inventoryPath);
const sourceIds = new Set(subjects.map(item => item.sourceOccurrenceId));
const before = inventory.remaining.length;
inventory.remaining = inventory.remaining.filter(item => !sourceIds.has(item.sourceOccurrenceId));
if (![before, before - 2].includes(inventory.remaining.length) || (before === inventory.remaining.length && before !== 61)) throw new Error('John Henry Newman and John Leonardi source-row transition is inconsistent');
inventory.coverageAtInventory.sourceBoundOccurrences = 328;
inventory.coverageAtInventory.remainingOccurrences = 61;
inventory.familyCounts['fixed-person'] = 16;
inventory.verifiedAt = verifiedAt;
write(inventoryPath, inventory);

const candidates = subjects.map(item => ({
  person: { id: item.personId, primaryObservanceId: item.legacyId, category: 'saint', names: item.names },
  recognition: { id: item.recognitionId, personId: item.personId, ecclesialTitles: item.titles, evidenceUrl: item.personId === 'john-henry-newman' ? snl : item.identityUrl },
  observanceId: item.observanceId, sanctoraleRuleId: item.ruleId, contextualBoundary: item.context,
  source: { canonicalEventId: item.legacyId, dateISO, sourceOccurrenceId: item.sourceOccurrenceId, sourceRecordHash: item.sourceRecordHash,
    sourceLabelPt: item.sourceLabelPt, observedDesignation: `${item.sourceLabelPt} – MF`, legacyRank: 'optional-memorial', sourceRankCode: 'MF', canonicalRank: 'optional-memorial', snlUrl: snl }
}));
const reviewDigest = hash(candidates);
const reviewFile = 'roman-catholic-pt-2026-v2.sanctorale-review-batch-57.json';
write(`data/migrations/${reviewFile}`, {
  schemaVersion: 1, status: 'reviewed-sanctorale-promotion-candidate-pack', sourceReleaseId: 'roman-catholic-pt-2026-v2',
  sourceArtifact: coverage.sourceArtifact, canonicalTarget: { ...coverage.canonicalTarget, occurrenceModelVersion: '1.0' },
  candidates, reviewDigestSha256: reviewDigest, mutationAllowed: false, promotionAllowed: false, verifiedAt
});
const mappingDigest = hash(fixed.mappings);
write('data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-57.json', {
  schemaVersion: 1, status: 'canonical-sanctorale-promotion-completed', reviewPack: reviewFile, reviewDigestSha256: reviewDigest,
  sourceReleaseId: 'roman-catholic-pt-2026-v2', promotedPersonIds: subjects.map(item => item.personId),
  promotedObservanceIds: subjects.map(item => item.observanceId),
  canonicalCoverageAfterPromotion: { mappedOccurrenceAnchors: 328, requiredForPromotion: 389, remainingLegacyOccurrences: 61 },
  fixedSanctoraleMappingDigestSha256: mappingDigest, runtimePublicationAllowed: false, productionWriteAllowed: false,
  promotionAllowed: false, verifiedAt
});

const replace = (path, replacements) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
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
  ['fixedSanctorale === 128 && ledger.counts.fixedSanctoraleDays === 118', 'fixedSanctorale === 130 && ledger.counts.fixedSanctoraleDays === 118'],
  ['preserve 128 exact Sanctorale occurrences across 118 civil days', 'preserve 130 exact Sanctorale occurrences across 118 civil days'],
  ['sourceBound === 311 && ledger.counts.sourceBoundOccurrences === 326', 'sourceBound === 311 && ledger.counts.sourceBoundOccurrences === 328'],
  ['distinguish 311 source-bound days from 326 source-bound canonical occurrences', 'distinguish 311 source-bound days from 328 source-bound canonical occurrences'],
  ["assert(october9?.classification === 'fixed-sanctorale' && october9.fixedOptions?.some(item => item.canonicalObservanceId === 'observance:denis-rusticus-eleutherius:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StDenis'), 'Saint Denis, Rusticus and Eleutherius must retain the exact collective optional-memorial source binding on 9 October.');", "assert(october9?.classification === 'fixed-sanctorale' && october9.fixedOptions?.length === 3 && october9.fixedOptions.some(item => item.canonicalObservanceId === 'observance:denis-rusticus-eleutherius:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StDenis') && october9.fixedOptions.some(item => item.canonicalObservanceId === 'observance:john-henry-newman:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StJohnHenryNewman') && october9.fixedOptions.some(item => item.canonicalObservanceId === 'observance:john-leonardi:roman-catholic' && item.sourceBinding?.legacyObservanceId === 'rc:StJohnLeonardi'), 'Saint Denis and companions, Saint John Henry Newman and Saint John Leonardi must remain three independent optional alternatives on 9 October.');"],
  ['+ 128 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 326 source-bound occurrences across 311 days', '+ 130 exact fixed Sanctorale occurrences + 11 movable/transfer bindings = 328 source-bound occurrences across 311 days']
]);
replace('scripts/test-roman-sanctorale.mjs', [
  ['candidates.length === 128', 'candidates.length === 130'], ['one hundred and twenty-eight reviewed rules', 'one hundred and thirty reviewed rules'],
  ["['observance:denis-rusticus-eleutherius:roman-catholic', ['2026-10-09', 'optional-memorial', 12, 'general-roman']],", "['observance:denis-rusticus-eleutherius:roman-catholic', ['2026-10-09', 'optional-memorial', 12, 'general-roman']],\n    ['observance:john-henry-newman:roman-catholic', ['2026-10-09', 'optional-memorial', 12, 'general-roman']],\n    ['observance:john-leonardi:roman-catholic', ['2026-10-09', 'optional-memorial', 12, 'general-roman']],"],
  ['occurrences.occurrences.length === 128', 'occurrences.occurrences.length === 130'],
  ['Roman Sanctorale passed: 128 authority-isolated perennial Portugal vectors, including Saint Denis, Rusticus and Eleutherius as one collective Observance on 9 October', 'Roman Sanctorale passed: 130 authority-isolated perennial Portugal vectors, including John Henry Newman and John Leonardi as independent 9 October alternatives alongside the collective Observance of Saint Denis, Rusticus and Eleutherius']
]);
replace('scripts/vault/test-canonical-person-manifest.mjs', [
  ['peopleCount === 211', 'peopleCount === 213'], ["'denis-paris', 'rusticus-paris', 'eleutherius-paris',", "'denis-paris', 'rusticus-paris', 'eleutherius-paris', 'john-henry-newman', 'john-leonardi',"]
]);
replace('scripts/vault/test-canonical-recognition-manifest.mjs', [
  ['recognitionCount === 209', 'recognitionCount === 211'], ['personCoverageCount === 208', 'personCoverageCount === 210'],
  ["'recognition:eleutherius-paris:roman-catholic',", "'recognition:eleutherius-paris:roman-catholic',\n  'recognition:john-henry-newman:roman-catholic',\n  'recognition:john-leonardi:roman-catholic',"]
]);
replace('scripts/vault/test-dropbox-canonical-recognition-uploader.mjs', [['recognitionCount, 209', 'recognitionCount, 211'], ['personCoverageCount, 208', 'personCoverageCount, 210']]);
replace('scripts/vault/test-canonical-observance-manifest.mjs', [
  ['observanceCount === 130', 'observanceCount === 132'], ['personCoverageCount === 208', 'personCoverageCount === 210'],
  ["const denisCompanions = first.observances.find", "const newman = first.observances.find((item) => item.observanceId === 'observance:john-henry-newman:roman-catholic');\nassert(newman?.subjects?.[0]?.personId === 'john-henry-newman', 'Saint John Henry Newman must remain a distinct person-scoped Observance.');\nconst leonardi = first.observances.find((item) => item.observanceId === 'observance:john-leonardi:roman-catholic');\nassert(leonardi?.subjects?.[0]?.personId === 'john-leonardi', 'Saint John Leonardi must remain a distinct person-scoped Observance.');\n\nconst denisCompanions = first.observances.find"]
]);
replace('scripts/vault/test-canonical-occurrence-manifest.mjs', [
  ['occurrenceCount === 128', 'occurrenceCount === 130'], ['legacyBridgeCount === 128', 'legacyBridgeCount === 130'],
  ["['observance:denis-rusticus-eleutherius:roman-catholic', ['2026-10-09', 'optional-memorial', 'MF', 'rc:StDenis']],", "['observance:denis-rusticus-eleutherius:roman-catholic', ['2026-10-09', 'optional-memorial', 'MF', 'rc:StDenis']],\n  ['observance:john-henry-newman:roman-catholic', ['2026-10-09', 'optional-memorial', 'MF', 'rc:StJohnHenryNewman']],\n  ['observance:john-leonardi:roman-catholic', ['2026-10-09', 'optional-memorial', 'MF', 'rc:StJohnLeonardi']],"]
]);
replace('scripts/vault/test-portugal-v2-canonical-coverage.mjs', [
  ['length === 128 && explicitOccurrences.length', 'length === 130 && explicitOccurrences.length'], ['one hundred and twenty-eight', 'one hundred and thirty'],
  ['length === 128 && explicitBridges.length', 'length === 130 && explicitBridges.length'], ['the one hundred and twenty-eight canonical Occurrences', 'the one hundred and thirty canonical Occurrences'],
  ['mappings.length === 128', 'mappings.length === 130'],
  [/fixedSanctoraleMappingDigest === '[a-f0-9]{64}'/u, `fixedSanctoraleMappingDigest === '${mappingDigest}'`],
  ['explicitOccurrenceById.size === 128 && explicitBridgeByOccurrence.size === 128 && fixedMappingByOccurrence.size === 128', 'explicitOccurrenceById.size === 130 && explicitBridgeByOccurrence.size === 130 && fixedMappingByOccurrence.size === 130'],
  ['coveredSourceIds.size === 315 && coveredSourceHashes.size === 315 && coveredOccurrenceIds.size === 315', 'coveredSourceIds.size === 317 && coveredSourceHashes.size === 317 && coveredOccurrenceIds.size === 317'],
  ['totalMapped === 326', 'totalMapped === 328'], ['exactly 326/389', 'exactly 328/389'], ['remainingLegacyOccurrences === 63', 'remainingLegacyOccurrences === 61'],
  ['exactly 63.', 'exactly 61.'], ['coveragePercent === 83.805', 'coveragePercent === 84.319'], ['= 128 exact fixed Sanctorale', '= 130 exact fixed Sanctorale'], ['; 63 remaining,', '; 61 remaining,']
]);
replace('scripts/vault/test-portugal-v2-semantic-inventory.mjs', [
  ['coveredRows.length === 326 && coveredSourceIds.size === 326', 'coveredRows.length === 328 && coveredSourceIds.size === 328'], ['exactly 326 unique', 'exactly 328 unique'],
  ['remaining.length === 63 && remainingSourceIds.size === 63 && remainingSourceHashes.size === 63', 'remaining.length === 61 && remainingSourceIds.size === 61 && remainingSourceHashes.size === 61'],
  ['exactly 63 unique', 'exactly 61 unique'], ['sourceBoundOccurrences === 326 && inventory.coverageAtInventory.remainingOccurrences === 63', 'sourceBoundOccurrences === 328 && inventory.coverageAtInventory.remainingOccurrences === 61'],
  ["actualCounts['fixed-person'] === 18", "actualCounts['fixed-person'] === 16"],
  ["assert(!remaining.some((row) => row.canonicalEventId === 'rc:StDenis'),", "assert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnHenryNewman'), 'Saint John Henry Newman must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StJohnLeonardi'), 'Saint John Leonardi must leave the unresolved inventory after exact promotion.');\nassert(!remaining.some((row) => row.canonicalEventId === 'rc:StDenis'),"],
  ['Portugal semantic inventory passed: 326 covered + 63 exact unresolved source rows = 389; Saint Denis, Rusticus and Eleutherius are source-bound as one collective Observance on 9 October;', 'Portugal semantic inventory passed: 328 covered + 61 exact unresolved source rows = 389; John Henry Newman and John Leonardi are independent source-bound alternatives on 9 October alongside the collective Denis memorial;']
]);
replace('scripts/vault/test-portugal-v2-sanctorale-review-packs.mjs', [
  ["['roman-catholic-pt-2026-v2.sanctorale-review-batch-56.json', 'b29e4987db05ebe60ff585ca0fac673728c0931e8d79c0f84ff8b92185407f2c']", "['roman-catholic-pt-2026-v2.sanctorale-review-batch-56.json', 'b29e4987db05ebe60ff585ca0fac673728c0931e8d79c0f84ff8b92185407f2c'],\n  ['roman-catholic-pt-2026-v2.sanctorale-review-batch-57.json', '" + reviewDigest + "']"]
]);

console.log(JSON.stringify({ reviewDigest, mappingDigest, promoted: subjects.map(item => item.personId) }, null, 2));

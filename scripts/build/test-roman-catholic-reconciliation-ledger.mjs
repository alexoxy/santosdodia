import fs from 'node:fs';
import path from 'node:path';
import { buildReconciliationLedger } from './roman-catholic-reconciliation-ledger.mjs';

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function allDates(year) {
  const result = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

const occurrences = read('data/canonical-occurrence-anchors.json');
const rules = read('data/canonical-roman-sanctorale-rule-anchors.json');
const fixedSanctoraleShadow = read('data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json');
const temporalRules = read('data/canonical-temporal-rule-anchors.json');
const temporalShadow = read('data/migrations/roman-catholic-pt-2026-v2.temporal-shadow.json');
const temporalFamilies = read('data/canonical-temporal-rule-families.json');
const temporalFamilyShadow = read('data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json');
const movableTransferShadow = read('data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json');
const overlayReview = read('data/releases/roman-catholic-pt-2026.overlay-review.json');
const overlayApproval = read('data/releases/roman-catholic-pt-2026.overlay-approval.json');
const report = {
  schemaVersion: 2,
  build: 'roman-catholic-product-baseline-v1',
  generatedAt: '2026-08-23T00:00:00.000Z',
  year: 2026,
  churchId: 'roman-catholic',
  targetJurisdiction: 'pt',
  daily: allDates(2026).map(dateISO => ({
    dateISO,
    primary: { canonicalEventId: `reference:${dateISO}` },
    labels: { pt: { label: `Dia litúrgico ${dateISO}`, source: 'portugal-national-liturgy-secretariat' } }
  }))
};

const buildLedger = ({
  baseline = report,
  occurrenceAnchors = occurrences,
  sanctoraleRules = rules,
  fixedSanctoraleMappings = fixedSanctoraleShadow,
  temporalRuleAnchors = temporalRules,
  temporalMappings = temporalShadow,
  temporalFamilyAnchors = temporalFamilies,
  temporalFamilyMappings = temporalFamilyShadow,
  movableTransferMappings = movableTransferShadow,
  review = overlayReview,
  approval = overlayApproval
} = {}) => buildReconciliationLedger(baseline, occurrenceAnchors, sanctoraleRules, fixedSanctoraleMappings, temporalRuleAnchors, temporalMappings, temporalFamilyAnchors, temporalFamilyMappings, movableTransferMappings, review, approval);

const ledger = buildLedger();
assert(ledger.counts.officialOccurrences === 365, 'Ledger must cover every Portugal 2026 day.');
assert(ledger.counts.temporale === 52 && ledger.counts.temporalRules === 5 && ledger.counts.temporalFamilyMembers === 47, 'The ledger must distinguish five TemporalRules from 47 approved TemporalRuleFamily members.');
assert(ledger.counts.fixedSanctorale === 16 && ledger.counts.movableOrTransfer === 11 && ledger.counts.sourceBound === 79, 'Only 52 reviewed Temporale, sixteen exact Sanctorale and eleven movable/transfer bindings may be marked source-bound.');
assert(ledger.counts.unresolved === 286, 'Every unreviewed official occurrence must remain explicit and unresolved.');
assert(ledger.fullSemanticEquivalence === false && ledger.publicationAllowed === false, 'Partial ledger must never authorize perennial cutover.');
assert(ledger.entries.find(item => item.dateISO === '2026-02-18')?.perennialRuleId === 'temporal-rule:ash-wednesday:roman-catholic', 'Ash Wednesday TemporalRule binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-02-22')?.classification === 'temporale', 'First Sunday of Lent must remain classified as Temporale.');
assert(ledger.entries.find(item => item.dateISO === '2026-04-05')?.sourceBinding?.legacyObservanceId === 'rc:Easter', 'Easter source binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-05-24')?.canonicalObservanceId === 'observance:pentecost-sunday:roman-catholic', 'Pentecost canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-11-29')?.perennialRuleId === 'temporal-rule:first-sunday-advent:roman-catholic', 'First Sunday of Advent TemporalRule binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-02-23')?.canonicalObservanceId === 'observance:lent-weekday-1-monday:roman-catholic', 'First Monday of Lent family binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-05-23')?.sourceBinding?.legacyObservanceId === 'rc:EasterWeekday7Saturday', 'Final Easter weekday family binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-03-25')?.classification === 'unresolved', 'Suppressed Annunciation candidate must not count as a TemporalRuleFamily occurrence.');
assert(ledger.entries.find(item => item.dateISO === '2026-05-13')?.classification === 'unresolved', 'Suppressed Fatima candidate must not count as a TemporalRuleFamily occurrence.');
assert(ledger.entries.find(item => item.dateISO === '2026-01-04')?.jurisdictionTransfer?.decisionId === 'pt-2026-epiphany-transfer', 'Portugal Epiphany transfer binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-03-29')?.movableBindingType === 'principal-movable-day', 'Palm Sunday movable binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-05-17')?.jurisdictionTransfer?.fromDateISO === '2026-05-14', 'Portugal Ascension transfer binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-06-15')?.jurisdictionTransfer?.decisionId === 'pt-2026-immaculate-heart-transfer', 'Immaculate Heart transfer binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-11-22')?.perennialRuleId === 'temporal-rule:christ-the-king:roman-catholic', 'Christ the King movable binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-03-19')?.canonicalObservanceId === 'observance:saint-joseph:roman-catholic', 'Saint Joseph canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-01-01')?.canonicalObservanceId === 'observance:mary-mother-of-god:roman-catholic', 'Mary Mother of God canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-08-15')?.canonicalObservanceId === 'observance:assumption-mary:roman-catholic', 'Assumption canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-12-08')?.canonicalObservanceId === 'observance:immaculate-conception-mary:roman-catholic', 'Immaculate Conception canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-01-01')?.sourceBinding?.sourceRecordHash === 'a459a74c707b8bff3a11803d2c3e72e774e271b4748dda539a27d24987ceff2d', 'Fixed Sanctorale source hash drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-04-25')?.canonicalObservanceId === 'observance:mark-evangelist:roman-catholic', 'Saint Mark canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-04')?.canonicalObservanceId === 'observance:elizabeth-portugal:roman-catholic', 'Portugal proper binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-03')?.canonicalObservanceId === 'observance:thomas-apostle:roman-catholic', 'Saint Thomas canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-11')?.canonicalObservanceId === 'observance:benedict-nursia:roman-catholic', 'Saint Benedict canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-22')?.canonicalObservanceId === 'observance:mary-magdalene:roman-catholic', 'Saint Mary Magdalene canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-23')?.canonicalObservanceId === 'observance:bridget-sweden:roman-catholic', 'Saint Bridget canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-25')?.canonicalObservanceId === 'observance:james-greater-apostle:roman-catholic', 'Saint James canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-08-11')?.classification === 'unresolved', 'Text similarity must not create an identity binding.');

const duplicateDate = clone(report);
duplicateDate.daily[1].dateISO = duplicateDate.daily[0].dateISO;
let duplicateRejected = false;
try { buildLedger({ baseline: duplicateDate }); } catch { duplicateRejected = true; }
assert(duplicateRejected, 'Duplicate official dates must fail closed.');

const untrusted = clone(occurrences);
untrusted.occurrences[0].evidence[0].url = 'https://example.com/not-authoritative';
let authorityRejected = false;
try { buildLedger({ occurrenceAnchors: untrusted }); } catch { authorityRejected = true; }
assert(authorityRejected, 'Untrusted annual occurrence evidence must fail closed.');

const annualizedRule = clone(rules);
annualizedRule.rules[0].year = 2026;
let annualRuleRejected = false;
try { buildLedger({ sanctoraleRules: annualizedRule }); } catch { annualRuleRejected = true; }
assert(annualRuleRejected, 'Perennial rules containing cloned annual years must fail closed.');

const wrongFixedArtifact = clone(fixedSanctoraleShadow);
wrongFixedArtifact.sourceArtifact.artifactId += 1;
let wrongFixedArtifactRejected = false;
try { buildLedger({ fixedSanctoraleMappings: wrongFixedArtifact }); } catch { wrongFixedArtifactRejected = true; }
assert(wrongFixedArtifactRejected, 'Fixed Sanctorale mappings from another artifact must fail closed.');

const wrongFixedHash = clone(fixedSanctoraleShadow);
wrongFixedHash.mappings[0].sourceRecordHash = '0'.repeat(63);
let wrongFixedHashRejected = false;
try { buildLedger({ fixedSanctoraleMappings: wrongFixedHash }); } catch { wrongFixedHashRejected = true; }
assert(wrongFixedHashRejected, 'Fixed Sanctorale source hash drift must fail closed.');

const wrongFixedDate = clone(fixedSanctoraleShadow);
wrongFixedDate.mappings[0].expectedDateISO = '2026-01-02';
let wrongFixedDateRejected = false;
try { buildLedger({ fixedSanctoraleMappings: wrongFixedDate }); } catch { wrongFixedDateRejected = true; }
assert(wrongFixedDateRejected, 'Fixed Sanctorale annual date drift must fail closed.');

const missingFixedMapping = clone(fixedSanctoraleShadow);
missingFixedMapping.mappings.pop();
let missingFixedMappingRejected = false;
try { buildLedger({ fixedSanctoraleMappings: missingFixedMapping }); } catch { missingFixedMappingRejected = true; }
assert(missingFixedMappingRejected, 'Every fixed canonical Occurrence requires one exact approved source row.');

const unknownTemporalRule = clone(temporalShadow);
unknownTemporalRule.mappings[0].temporalRuleId = 'temporal-rule:unknown:roman-catholic';
let unknownTemporalRuleRejected = false;
try { buildLedger({ temporalMappings: unknownTemporalRule }); } catch { unknownTemporalRuleRejected = true; }
assert(unknownTemporalRuleRejected, 'Unknown TemporalRule mappings must fail closed.');

const wrongTemporalDate = clone(temporalShadow);
wrongTemporalDate.mappings[0].expectedDateISO = '2026-02-19';
let wrongTemporalDateRejected = false;
try { buildLedger({ temporalMappings: wrongTemporalDate }); } catch { wrongTemporalDateRejected = true; }
assert(wrongTemporalDateRejected, 'TemporalRule date mismatches must fail closed.');

const duplicateTemporalDate = clone(temporalShadow);
duplicateTemporalDate.mappings.push(clone(duplicateTemporalDate.mappings[0]));
let duplicateTemporalDateRejected = false;
try { buildLedger({ temporalMappings: duplicateTemporalDate }); } catch { duplicateTemporalDateRejected = true; }
assert(duplicateTemporalDateRejected, 'Duplicate temporal mappings must fail closed.');

const untrustedTemporalRule = clone(temporalRules);
untrustedTemporalRule.rules[0].evidence[0].url = 'https://example.com/not-authoritative';
let temporalAuthorityRejected = false;
try { buildLedger({ temporalRuleAnchors: untrustedTemporalRule }); } catch { temporalAuthorityRejected = true; }
assert(temporalAuthorityRejected, 'TemporalRules without Holy See evidence must fail closed.');

const wrongTemporalYear = clone(temporalShadow);
wrongTemporalYear.target.year = 2025;
let temporalYearRejected = false;
try { buildLedger({ temporalMappings: wrongTemporalYear }); } catch { temporalYearRejected = true; }
assert(temporalYearRejected, 'TemporalRule shadow mappings for another year must fail closed.');

const unknownTemporalFamily = clone(temporalFamilyShadow);
unknownTemporalFamily.families[0].familyId = 'temporal-rule-family:unknown:roman-catholic';
let unknownTemporalFamilyRejected = false;
try { buildLedger({ temporalFamilyMappings: unknownTemporalFamily }); } catch { unknownTemporalFamilyRejected = true; }
assert(unknownTemporalFamilyRejected, 'Unknown TemporalRuleFamily snapshots must fail closed.');

const wrongFamilyDate = clone(temporalFamilyShadow);
wrongFamilyDate.families[0].presentMappings[0].expectedDateISO = '2026-02-24';
let wrongFamilyDateRejected = false;
try { buildLedger({ temporalFamilyMappings: wrongFamilyDate }); } catch { wrongFamilyDateRejected = true; }
assert(wrongFamilyDateRejected, 'TemporalRuleFamily date mismatches must fail closed.');

const duplicateFamilyMapping = clone(temporalFamilyShadow);
duplicateFamilyMapping.families[0].presentMappings.push(clone(duplicateFamilyMapping.families[0].presentMappings[0]));
let duplicateFamilyMappingRejected = false;
try { buildLedger({ temporalFamilyMappings: duplicateFamilyMapping }); } catch { duplicateFamilyMappingRejected = true; }
assert(duplicateFamilyMappingRejected, 'Duplicate TemporalRuleFamily mappings must fail closed.');

const missingSuppression = clone(temporalFamilyShadow);
missingSuppression.suppressedCandidates.pop();
let missingSuppressionRejected = false;
try { buildLedger({ temporalFamilyMappings: missingSuppression }); } catch { missingSuppressionRejected = true; }
assert(missingSuppressionRejected, 'Every absent TemporalRuleFamily candidate requires an explicit suppression.');

const pendingFamilyMapping = clone(temporalFamilyShadow);
pendingFamilyMapping.families[0].presentMappings[0].reviewStatus = 'pending-human-approval';
let pendingFamilyMappingRejected = false;
try { buildLedger({ temporalFamilyMappings: pendingFamilyMapping }); } catch { pendingFamilyMappingRejected = true; }
assert(pendingFamilyMappingRejected, 'Unapproved TemporalRuleFamily precedence outcomes must fail closed.');

const untrustedTemporalFamily = clone(temporalFamilies);
untrustedTemporalFamily.families[0].evidence[0].url = 'https://example.com/not-authoritative';
let temporalFamilyAuthorityRejected = false;
try { buildLedger({ temporalFamilyAnchors: untrustedTemporalFamily }); } catch { temporalFamilyAuthorityRejected = true; }
assert(temporalFamilyAuthorityRejected, 'TemporalRuleFamilies without Holy See evidence must fail closed.');

const wrongFamilyArtifact = clone(temporalFamilyShadow);
wrongFamilyArtifact.sourceArtifact.artifactId += 1;
let wrongFamilyArtifactRejected = false;
try { buildLedger({ temporalFamilyMappings: wrongFamilyArtifact }); } catch { wrongFamilyArtifactRejected = true; }
assert(wrongFamilyArtifactRejected, 'TemporalRuleFamily mappings from another artifact must fail closed.');

const wrongMovableBase = clone(movableTransferShadow);
wrongMovableBase.mappings[0].baseDateISO = '2026-01-05';
let wrongMovableBaseRejected = false;
try { buildLedger({ movableTransferMappings: wrongMovableBase }); } catch { wrongMovableBaseRejected = true; }
assert(wrongMovableBaseRejected, 'Movable base dates that differ from their TemporalRule must fail closed.');

const transferWithoutApproval = clone(overlayApproval);
transferWithoutApproval.decisionIds = transferWithoutApproval.decisionIds.filter(id => id !== 'pt-2026-ascension-transfer');
let transferWithoutApprovalRejected = false;
try { buildLedger({ approval: transferWithoutApproval }); } catch { transferWithoutApprovalRejected = true; }
assert(transferWithoutApprovalRejected, 'Transfers without the exact explicit approval must fail closed.');

const wrongMovableDestination = clone(movableTransferShadow);
wrongMovableDestination.mappings.find(item => item.temporalRuleId === 'temporal-rule:palm-sunday:roman-catholic').expectedDateISO = '2026-03-30';
let wrongMovableDestinationRejected = false;
try { buildLedger({ movableTransferMappings: wrongMovableDestination }); } catch { wrongMovableDestinationRejected = true; }
assert(wrongMovableDestinationRejected, 'Movable destination changes without a reviewed transfer must fail closed.');

const duplicateMovableSource = clone(movableTransferShadow);
duplicateMovableSource.mappings[1].sourceOccurrenceId = duplicateMovableSource.mappings[0].sourceOccurrenceId;
let duplicateMovableSourceRejected = false;
try { buildLedger({ movableTransferMappings: duplicateMovableSource }); } catch { duplicateMovableSourceRejected = true; }
assert(duplicateMovableSourceRejected, 'Duplicate movable source rows must fail closed.');

const wrongMovableArtifact = clone(movableTransferShadow);
wrongMovableArtifact.sourceArtifact.artifactId += 1;
let wrongMovableArtifactRejected = false;
try { buildLedger({ movableTransferMappings: wrongMovableArtifact }); } catch { wrongMovableArtifactRejected = true; }
assert(wrongMovableArtifactRejected, 'Movable mappings from another artifact must fail closed.');

console.log('Portugal reconciliation ledger passed: 365/365 classified, 5 TemporalRules + 47 precedence-resolved TemporalRuleFamily members + 16 exact fixed Sanctorale anchors + 11 movable/transfer bindings = 79 source-bound days, 286 explicit unresolved entries and no label-derived identity.');

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
const temporalRules = read('data/canonical-temporal-rule-anchors.json');
const temporalShadow = read('data/migrations/roman-catholic-pt-2026-v2.temporal-shadow.json');
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
  temporalRuleAnchors = temporalRules,
  temporalMappings = temporalShadow
} = {}) => buildReconciliationLedger(baseline, occurrenceAnchors, sanctoraleRules, temporalRuleAnchors, temporalMappings);

const ledger = buildLedger();
assert(ledger.counts.officialOccurrences === 365, 'Ledger must cover every Portugal 2026 day.');
assert(ledger.counts.temporale === 5 && ledger.counts.fixedSanctorale === 13 && ledger.counts.sourceBound === 18, 'Only the five TemporalRule and thirteen reviewed Sanctorale bindings may be marked source-bound.');
assert(ledger.counts.unresolved === 347, 'Every unreviewed official occurrence must remain explicit and unresolved.');
assert(ledger.fullSemanticEquivalence === false && ledger.publicationAllowed === false, 'Partial ledger must never authorize perennial cutover.');
assert(ledger.entries.find(item => item.dateISO === '2026-02-18')?.perennialRuleId === 'temporal-rule:ash-wednesday:roman-catholic', 'Ash Wednesday TemporalRule binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-02-22')?.classification === 'temporale', 'First Sunday of Lent must remain classified as Temporale.');
assert(ledger.entries.find(item => item.dateISO === '2026-04-05')?.sourceBinding?.legacyObservanceId === 'rc:Easter', 'Easter source binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-05-24')?.canonicalObservanceId === 'observance:pentecost-sunday:roman-catholic', 'Pentecost canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-11-29')?.perennialRuleId === 'temporal-rule:first-sunday-advent:roman-catholic', 'First Sunday of Advent TemporalRule binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-03-19')?.canonicalObservanceId === 'observance:saint-joseph:roman-catholic', 'Saint Joseph canonical binding drifted.');
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

console.log('Portugal reconciliation ledger passed: 365/365 classified, five source-bound TemporalRule mappings, thirteen source-bound fixed Sanctorale anchors, 347 explicit unresolved entries and no label-derived identity.');

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

const ledger = buildReconciliationLedger(report, occurrences, rules);
assert(ledger.counts.officialOccurrences === 365, 'Ledger must cover every Portugal 2026 day.');
assert(ledger.counts.fixedSanctorale === 8 && ledger.counts.sourceBound === 8, 'Only the eight reviewed canonical Sanctorale bindings may be marked source-bound.');
assert(ledger.counts.unresolved === 357, 'Every unreviewed official occurrence must remain explicit and unresolved.');
assert(ledger.fullSemanticEquivalence === false && ledger.publicationAllowed === false, 'Partial ledger must never authorize perennial cutover.');
assert(ledger.entries.find(item => item.dateISO === '2026-03-19')?.canonicalObservanceId === 'observance:saint-joseph:roman-catholic', 'Saint Joseph canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-04')?.canonicalObservanceId === 'observance:elizabeth-portugal:roman-catholic', 'Portugal proper binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-07-11')?.canonicalObservanceId === 'observance:benedict-nursia:roman-catholic', 'Saint Benedict canonical binding drifted.');
assert(ledger.entries.find(item => item.dateISO === '2026-08-11')?.classification === 'unresolved', 'Text similarity must not create an identity binding.');

const duplicateDate = clone(report);
duplicateDate.daily[1].dateISO = duplicateDate.daily[0].dateISO;
let duplicateRejected = false;
try { buildReconciliationLedger(duplicateDate, occurrences, rules); } catch { duplicateRejected = true; }
assert(duplicateRejected, 'Duplicate official dates must fail closed.');

const untrusted = clone(occurrences);
untrusted.occurrences[0].evidence[0].url = 'https://example.com/not-authoritative';
let authorityRejected = false;
try { buildReconciliationLedger(report, untrusted, rules); } catch { authorityRejected = true; }
assert(authorityRejected, 'Untrusted annual occurrence evidence must fail closed.');

const annualizedRule = clone(rules);
annualizedRule.rules[0].year = 2026;
let annualRuleRejected = false;
try { buildReconciliationLedger(report, occurrences, annualizedRule); } catch { annualRuleRejected = true; }
assert(annualRuleRejected, 'Perennial rules containing cloned annual years must fail closed.');

console.log('Portugal reconciliation ledger passed: 365/365 classified, eight source-bound fixed Sanctorale anchors, 357 explicit unresolved entries and no label-derived identity.');

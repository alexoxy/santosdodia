import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditCompactCalendar, auditLitcalDailyCoverage, civilDatesForYear } from './audit-litcal-daily-coverage.mjs';

function payloadFor(year, { omit = [] } = {}) {
  const omitted = new Set(omit);
  return {
    schemaVersion: 1,
    format: 'santosdia-litcal-runtime-fallback',
    events: civilDatesForYear(year)
      .filter((dateISO) => !omitted.has(dateISO))
      .map((dateISO, index) => ({ id: `event-${index}`, name: `Event ${index}`, dateISO }))
  };
}

assert.equal(civilDatesForYear(2026).length, 365);
assert.equal(civilDatesForYear(2028).length, 366);
assert.equal(auditCompactCalendar(payloadFor(2028), 2028).ok, true);

const missingLeapDay = auditCompactCalendar(payloadFor(2028, { omit: ['2028-02-29'] }), 2028);
assert.equal(missingLeapDay.ok, false);
assert.deepEqual(missingLeapDay.missingDates, ['2028-02-29']);

const boundaryVigil = payloadFor(2026);
boundaryVigil.events.unshift({ id: 'new-year-vigil', name: 'New Year Vigil Mass', dateISO: '2025-12-31' });
const boundaryAudit = auditCompactCalendar(boundaryVigil, 2026);
assert.equal(boundaryAudit.ok, true);
assert.equal(boundaryAudit.invalidDates, 0);
assert.equal(boundaryAudit.outOfYearDates, 1);
assert.equal(boundaryAudit.coveredDays, 365);

const invalid = payloadFor(2026);
invalid.events.push({ id: 'invalid-date', name: 'Invalid date', dateISO: '2026-02-30' });
const invalidAudit = auditCompactCalendar(invalid, 2026);
assert.equal(invalidAudit.ok, false);
assert.equal(invalidAudit.invalidDates, 1);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-litcal-coverage-'));
try {
  const yearRoot = path.join(root, '2026');
  fs.mkdirSync(yearRoot, { recursive: true });
  fs.writeFileSync(path.join(yearRoot, 'en_US.json'), JSON.stringify(payloadFor(2026)), 'utf8');
  fs.writeFileSync(path.join(yearRoot, 'pt_PT.json'), JSON.stringify(payloadFor(2026)), 'utf8');

  const defaultReference = auditLitcalDailyCoverage({ root, years: [2026] });
  assert.equal(defaultReference.ok, true, defaultReference.errors.join('\n'));
  assert.deepEqual(defaultReference.referenceLocales, ['en_US']);

  const complete = auditLitcalDailyCoverage({ root, years: [2026], locales: ['en_US', 'pt_PT'] });
  assert.equal(complete.ok, true, complete.errors.join('\n'));
  assert.equal(complete.results.every((result) => result.coveredDays === 365), true);

  fs.unlinkSync(path.join(yearRoot, 'pt_PT.json'));
  const missingLocale = auditLitcalDailyCoverage({ root, years: [2026], locales: ['en_US', 'pt_PT'] });
  assert.equal(missingLocale.ok, false);
  assert.match(missingLocale.errors.join('\n'), /2026 pt_PT: critical reference calendar is missing/);

  fs.writeFileSync(path.join(yearRoot, 'pt_PT.json'), JSON.stringify(payloadFor(2026, { omit: ['2026-08-10'] })), 'utf8');
  const missingDay = auditLitcalDailyCoverage({ root, years: [2026], locales: ['en_US', 'pt_PT'] });
  assert.equal(missingDay.ok, false);
  assert.equal(missingDay.results.find((result) => result.locale === 'pt_PT').missingDates.includes('2026-08-10'), true);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Strict LitCal daily coverage tests passed.');

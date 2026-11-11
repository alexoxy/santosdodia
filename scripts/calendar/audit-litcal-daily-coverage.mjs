#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve('data/litcal-mirror/calendars/general');
const DEFAULT_LOCALES = ['en_US'];

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function civilDatesForYear(year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2200) {
    throw new RangeError(`Unsupported civil year: ${year}`);
  }
  const dates = [];
  for (let cursor = new Date(Date.UTC(year, 0, 1)); cursor.getUTCFullYear() === year; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function auditCompactCalendar(payload, year) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('payload must be an object');
  const events = Array.isArray(payload?.events) ? payload.events : [];
  if (!events.length) errors.push('calendar contains no events');

  const observedDates = new Set();
  let invalidDates = 0;
  let outOfYearDates = 0;
  for (const event of events) {
    if (!validDate(event?.dateISO)) {
      invalidDates += 1;
      continue;
    }
    if (!event.dateISO.startsWith(`${year}-`)) {
      outOfYearDates += 1;
      continue;
    }
    observedDates.add(event.dateISO);
  }
  if (invalidDates) errors.push(`${invalidDates} event(s) have invalid dates`);

  const expectedDates = civilDatesForYear(year);
  const missingDates = expectedDates.filter((date) => !observedDates.has(date));
  if (missingDates.length) errors.push(`${missingDates.length} civil day(s) have no liturgical event`);

  return {
    ok: errors.length === 0,
    year,
    expectedDays: expectedDates.length,
    coveredDays: observedDates.size,
    eventCount: events.length,
    invalidDates,
    outOfYearDates,
    missingDates,
    errors
  };
}

export function auditLitcalDailyCoverage({ root = DEFAULT_ROOT, years, locales = DEFAULT_LOCALES } = {}) {
  const selectedYears = years?.length ? years : [new Date().getUTCFullYear(), new Date().getUTCFullYear() + 1];
  const results = [];
  const errors = [];

  for (const year of selectedYears) {
    for (const locale of locales) {
      const file = path.join(root, String(year), `${locale}.json`);
      if (!fs.existsSync(file)) {
        const result = {
          ok: false,
          year,
          locale,
          file,
          expectedDays: civilDatesForYear(year).length,
          coveredDays: 0,
          eventCount: 0,
          invalidDates: 0,
          outOfYearDates: 0,
          missingDates: civilDatesForYear(year),
          errors: ['critical reference calendar is missing']
        };
        results.push(result);
        errors.push(`${year} ${locale}: critical reference calendar is missing`);
        continue;
      }

      let payload;
      try {
        payload = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (error) {
        const message = `invalid JSON: ${error instanceof Error ? error.message : String(error)}`;
        results.push({ ok: false, year, locale, file, errors: [message] });
        errors.push(`${year} ${locale}: ${message}`);
        continue;
      }

      const audited = auditCompactCalendar(payload, year);
      const result = { ...audited, locale, file };
      results.push(result);
      for (const error of audited.errors) errors.push(`${year} ${locale}: ${error}`);
    }
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    invariant: 'Every civil day in every critical LitCal reference stream must contain at least one liturgical event.',
    referenceLocales: [...locales],
    languageReadinessGate: 'separate-post-normalization',
    years: [...selectedYears],
    ok: errors.length === 0,
    errors,
    results
  };
}

async function main() {
  const root = path.resolve(argument('--root') ?? DEFAULT_ROOT);
  const years = (argument('--years') ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number);
  const locales = (argument('--locales') ?? DEFAULT_LOCALES.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const output = argument('--output');
  const report = auditLitcalDailyCoverage({ root, years: years.length ? years : undefined, locales });
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (output) {
    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
    fs.writeFileSync(path.resolve(output), serialized, 'utf8');
  }
  process.stdout.write(serialized);
  if (!report.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

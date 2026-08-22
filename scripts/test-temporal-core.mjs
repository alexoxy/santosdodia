import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-temporal-core-'));

function transpile(sourcePath, outputName, rewrites = []) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
    reportDiagnostics: true,
  });
  const diagnostics = compiled.diagnostics ?? [];
  if (diagnostics.some((item) => item.category === ts.DiagnosticCategory.Error)) {
    throw new Error(`${path.basename(sourcePath)} transpilation returned errors.`);
  }
  let output = compiled.outputText;
  for (const [from, to] of rewrites) output = output.replaceAll(from, to);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), output, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(
    path.join(root, 'lib/knowledge/temporal-core.ts'),
    'temporal-core.js',
    [["'./calendar-engine'", "'./calendar-engine.js'"]],
  );

  const temporal = await import(`${pathToFileURL(path.join(temporaryDirectory, 'temporal-core.js')).href}?v=${Date.now()}`);

  assert(temporal.civilDateAtInstant('2026-08-10T00:30:00Z', 'America/New_York') === '2026-08-09', 'New York civil date regression failed.');
  assert(temporal.civilDateAtInstant('2026-08-10T00:30:00Z', 'Europe/Lisbon') === '2026-08-10', 'Lisbon civil date regression failed.');
  assert(temporal.civilDateAtInstant('2026-12-31T23:30:00Z', 'Pacific/Kiritimati') === '2027-01-01', 'UTC+14 year-boundary regression failed.');
  assert(temporal.civilDateAtInstant('2026-01-01T00:30:00Z', 'Pacific/Honolulu') === '2025-12-31', 'UTC-10 year-boundary regression failed.');
  assert(temporal.normalizeTimeZone('Not/AZone', 'UTC') === 'UTC', 'Invalid timezone fallback failed.');
  assert(temporal.isValidIanaTimeZone('Europe/Lisbon') === true, 'Europe/Lisbon must be accepted as an IANA timezone.');

  const julianChristmas = temporal.bridgeDateRule({ type: 'fixed', calendar: 'julian', month: 12, day: 25 }, 2026);
  assert(julianChristmas.status === 'resolved', 'Julian Christmas must resolve inside civil year 2026.');
  assert(julianChristmas.canonicalGregorianDate === '2026-01-07', `Julian Christmas expected 2026-01-07, got ${julianChristmas.canonicalGregorianDate}.`);
  assert(julianChristmas.native.year === 2025, `Julian Christmas native year expected 2025, got ${julianChristmas.native.year}.`);

  const julianNewYear = temporal.bridgeDateRule({ type: 'fixed', calendar: 'julian', month: 1, day: 1 }, 2026);
  assert(julianNewYear.canonicalGregorianDate === '2026-01-14', 'Julian January 1 projection failed.');
  assert(julianNewYear.native.year === 2026, 'Julian January 1 native year projection failed.');

  for (const dateISO of ['2026-01-01', '2026-04-12', '2026-12-31']) {
    const jdn = temporal.gregorianDateToJdn(dateISO);
    assert(temporal.gregorianDateFromJdn(jdn) === dateISO, `JDN round-trip failed for ${dateISO}.`);
  }

  console.log('Temporal core tests passed: timezone boundaries, Julian bridging and JDN round-trips.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

// Canonical TemporalRule validation is part of the mandatory temporal gate.
await import('./vault/test-canonical-temporal-rule-manifest.mjs');
// Parameterized weekday families and precedence outcomes are part of the same gate.
await import('./vault/test-temporal-rule-families.mjs');
// The public Roman calculator must remain annual-file-free and valid across centuries.
await import('./test-roman-liturgical-year.mjs');

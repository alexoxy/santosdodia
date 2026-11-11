#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-temporale-observance-'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function transpile(sourcePath, outputName, rewrites = []) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some(item => item.category === ts.DiagnosticCategory.Error), `${path.basename(sourcePath)} transpilation returned errors.`);
  let output = compiled.outputText;
  for (const [from, to] of rewrites) output = output.replaceAll(from, to);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), output, 'utf8');
}

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  transpile(path.join(root, 'lib/knowledge/liturgical-calendar-localization.ts'), 'liturgical-calendar-localization.js', [["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"]]);
  transpile(
    path.join(root, 'lib/knowledge/roman-temporale-observance.ts'),
    'roman-temporale-observance.js',
    [
      ["'./liturgical-calendar-localization'", "'./liturgical-calendar-localization.js'"],
      ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"]
    ]
  );

  const temporale = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-temporale-observance.js')).href}?v=${Date.now()}`);
  const ordinarySunday = temporale.calculateRomanTemporaleObservance('2026-09-13', 'pt');
  assert(ordinarySunday.name === 'XXIV Domingo do Tempo Comum', `Unexpected Portugal Ordinary Sunday label: ${ordinarySunday.name}`);
  assert(ordinarySunday.names.en === '24th Sunday in Ordinary Time', 'English Ordinary Sunday label regressed.');
  assert(ordinarySunday.names.es === 'XXIV Domingo del Tiempo Ordinario', 'Spanish Ordinary Sunday label regressed.');
  assert(ordinarySunday.names.it === 'XXIV Domenica del Tempo Ordinario', 'Italian Ordinary Sunday label regressed.');
  assert(ordinarySunday.summary?.includes('ciclo dominical A'), 'Calculated summary must expose the Sunday cycle.');

  const epiphany = temporale.calculateRomanTemporaleObservance('2026-01-04', 'pt');
  assert(epiphany.name === 'Epifania do Senhor', `Portugal Epiphany policy regressed: ${epiphany.name}`);
  const easter = temporale.calculateRomanTemporaleObservance('2026-04-05', 'en');
  assert(easter.name === 'Easter Sunday', `Gregorian Easter calculation regressed: ${easter.name}`);

  const fullYear = temporale.addCalculatedRomanTemporaleFallback([], {
    fromDate: '2026-01-01',
    toDate: '2026-12-31',
    locale: 'pt',
    filters: { tradition: 'roman-catholic', country: 'PT' }
  });
  assert(fullYear.calculated === 365 && fullYear.items.length === 365, 'Autonomous Portugal Temporale must cover all 365 civil days in 2026.');
  assert(fullYear.items.every(item => ['en', 'pt', 'es', 'it'].every(locale => Boolean(item.names[locale]))), 'Every calculated day must be complete in all launched locales.');
  assert(fullYear.items.every(item => item.sourceIds.includes('holy-see-universal-norms-liturgical-year')), 'Calculated days must retain their normative rule source.');

  const publishedWins = temporale.addCalculatedRomanTemporaleFallback([ordinarySunday], {
    fromDate: '2026-09-13',
    toDate: '2026-09-13',
    locale: 'pt',
    filters: { tradition: 'roman-catholic', country: 'PT' }
  });
  assert(publishedWins.calculated === 0 && publishedWins.items.length === 1, 'Existing Roman publication must outrank the structural fallback.');
  for (const filters of [
    { tradition: 'roman-catholic', country: 'BE' },
    { tradition: 'anglican', country: 'PT' },
    { tradition: 'roman-catholic', country: 'PT', category: 'saint' },
    { tradition: 'roman-catholic', country: 'PT', patronage: 'students' }
  ]) {
    const rejected = temporale.addCalculatedRomanTemporaleFallback([], {
      fromDate: '2026-09-13', toDate: '2026-09-13', locale: 'pt', filters
    });
    assert(rejected.calculated === 0, `Calculated Temporale escaped its Portugal Roman scope: ${JSON.stringify(filters)}`);
  }

  console.log('Roman Temporale product projection passed: perennial rules, Portugal policy, four-language labels, full-year coverage and fail-closed scope.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

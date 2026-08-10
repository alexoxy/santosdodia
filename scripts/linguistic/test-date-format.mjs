#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(root, 'lib/linguistic/date-format.ts');
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-date-language-'));
const compiledPath = path.join(temporaryDirectory, 'date-format.mjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true,
  });
  if ((compiled.diagnostics ?? []).some((item) => item.category === ts.DiagnosticCategory.Error)) {
    throw new Error('Localized date formatter transpilation failed.');
  }
  fs.writeFileSync(compiledPath, compiled.outputText, 'utf8');
  const formatter = await import(`${pathToFileURL(compiledPath).href}?v=${Date.now()}`);
  const date = '2026-08-10';

  const ptRunning = formatter.formatDayMonthYear(date, 'pt', 'running');
  const ptHeading = formatter.formatMonthYear(date, 'pt', 'heading');
  assert(/^10 de agosto de 2026$/iu.test(ptRunning), `Unexpected pt-PT date: ${ptRunning}`);
  assert(/^Agosto de 2026$/u.test(ptHeading), `Unexpected pt-PT heading: ${ptHeading}`);
  assert(!/\bDe\b/u.test(ptHeading), `Portuguese preposition was capitalized: ${ptHeading}`);

  const en = formatter.formatDayMonthYear(date, 'en');
  assert(/^10 August 2026$/u.test(en), `Unexpected en-GB date: ${en}`);

  const es = formatter.formatDayMonthYear(date, 'es');
  assert(/10.*agosto.*2026/iu.test(es), `Unexpected Spanish date: ${es}`);
  assert(/\bde\b/iu.test(es), `Spanish date lost its preposition: ${es}`);

  const fr = formatter.formatDayMonthYear(date, 'fr');
  assert(/10.*ao[uû]t.*2026/iu.test(fr.normalize('NFC')), `Unexpected French date: ${fr}`);

  const de = formatter.formatDayMonthYear(date, 'de');
  assert(/10\..*August.*2026/u.test(de), `Unexpected German date: ${de}`);

  const it = formatter.formatDayMonthYear(date, 'it');
  assert(/10.*agosto.*2026/iu.test(it), `Unexpected Italian date: ${it}`);

  const pl = formatter.formatDayMonthYear(date, 'pl');
  assert(/10.*sierp.*2026/iu.test(pl), `Unexpected Polish date: ${pl}`);

  const ru = formatter.formatDayMonthYear(date, 'ru');
  assert(/10.*август.*2026/iu.test(ru), `Unexpected Russian date: ${ru}`);

  const fil = formatter.formatDayMonthYear(date, 'fil');
  assert(/Agosto|Ago/iu.test(fil), `Unexpected Filipino date: ${fil}`);

  const sw = formatter.formatDayMonthYear(date, 'sw');
  assert(/Agosti|Ago/iu.test(sw), `Unexpected Kiswahili date: ${sw}`);

  for (const locale of Object.keys(formatter.DATE_LOCALE_TAGS)) {
    const full = formatter.formatFullCivilDate(date, locale, 'heading');
    assert(typeof full === 'string' && full.length >= 6, `Empty localized full date for ${locale}.`);
    assert(!/\s{2,}/u.test(full), `Repeated spaces in localized date for ${locale}: ${full}`);
  }

  console.log('Multilingual date-format tests passed for 10 locales.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

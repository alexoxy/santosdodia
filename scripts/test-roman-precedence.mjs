#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-precedence-'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  const sourcePath = path.join(root, 'lib/knowledge/roman-precedence.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some(item => item.category === ts.DiagnosticCategory.Error), 'Roman precedence core transpilation returned errors.');
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  fs.writeFileSync(path.join(temporaryDirectory, 'roman-precedence.js'), compiled.outputText, 'utf8');
  const precedence = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-precedence.js')).href}?v=${Date.now()}`);

  assert(precedence.ROMAN_PRECEDENCE_TABLE.length === 13, 'Roman precedence table must contain exactly 13 normative levels.');
  assert(precedence.ROMAN_PRECEDENCE_TABLE.map(entry => entry.level).join(',') === '1,2,3,4,5,6,7,8,9,10,11,12,13', 'Roman precedence levels must remain ordered 1 through 13.');
  assert(precedence.romanPrecedenceLevelForClass('paschal-triduum') === 1, 'Paschal Triduum must remain level 1.');
  assert(precedence.romanPrecedenceLevelForClass('ordinary-weekday') === 13, 'Ordinary weekday must remain level 13.');

  const lentSundayVsJoseph = precedence.resolveRomanPrecedence([
    { id: 'lent-sunday', precedenceClass: 'principal-temporale', isSolemnity: false },
    { id: 'saint-joseph', precedenceClass: 'general-calendar-solemnity', isSolemnity: true }
  ]);
  assert(lentSundayVsJoseph.status === 'resolved' && lentSundayVsJoseph.winnerId === 'lent-sunday', 'A Sunday of Lent must outrank a General Calendar solemnity.');
  assert(lentSundayVsJoseph.decisions.find(item => item.id === 'saint-joseph')?.action === 'transfer-required', 'An impeded solemnity must be marked for transfer rather than silently omitted.');

  const ordinarySundayVsProperFeast = precedence.resolveRomanPrecedence([
    { id: 'ordinary-sunday', precedenceClass: 'christmas-or-ordinary-sunday', isSolemnity: false },
    { id: 'proper-feast', precedenceClass: 'proper-feast', isSolemnity: false }
  ]);
  assert(ordinarySundayVsProperFeast.winnerId === 'ordinary-sunday', 'An Ordinary Time Sunday must outrank a proper feast at level 8.');
  assert(ordinarySundayVsProperFeast.decisions.find(item => item.id === 'proper-feast')?.action === 'omit', 'A lower non-solemnity celebration must be omitted for that year.');

  const privilegedWeekdayVsMemorial = precedence.resolveRomanPrecedence([
    { id: 'lent-weekday', precedenceClass: 'privileged-weekday', isSolemnity: false },
    { id: 'general-memorial', precedenceClass: 'general-obligatory-memorial', isSolemnity: false }
  ]);
  assert(privilegedWeekdayVsMemorial.winnerId === 'lent-weekday', 'A privileged Lenten weekday must outrank an obligatory memorial.');
  assert(privilegedWeekdayVsMemorial.decisions.find(item => item.id === 'general-memorial')?.action === 'omit', 'An impeded memorial must not be transferred as if it were a solemnity.');

  const memorialVsWeekday = precedence.resolveRomanPrecedence([
    { id: 'obligatory-memorial', precedenceClass: 'general-obligatory-memorial', isSolemnity: false },
    { id: 'ordinary-weekday', precedenceClass: 'ordinary-weekday', isSolemnity: false }
  ]);
  assert(memorialVsWeekday.winnerId === 'obligatory-memorial', 'An obligatory memorial must outrank an ordinary weekday.');

  const equalFeasts = precedence.resolveRomanPrecedence([
    { id: 'feast-a', precedenceClass: 'general-marian-or-saint-feast', isSolemnity: false },
    { id: 'feast-b', precedenceClass: 'general-marian-or-saint-feast', isSolemnity: false }
  ]);
  assert(equalFeasts.status === 'tie-requires-policy' && equalFeasts.winnerId === null, 'Equal highest precedence must fail closed rather than invent a winner.');
  assert(equalFeasts.decisions.filter(item => item.action === 'unresolved-tie').length === 2, 'All equal top candidates must remain explicitly unresolved.');

  let duplicateRejected = false;
  try {
    precedence.resolveRomanPrecedence([
      { id: 'same', precedenceClass: 'ordinary-weekday', isSolemnity: false },
      { id: 'same', precedenceClass: 'optional-memorial', isSolemnity: false }
    ]);
  } catch { duplicateRejected = true; }
  assert(duplicateRejected, 'Duplicate precedence candidate IDs must fail closed.');

  let fakeSolemnityRejected = false;
  try {
    precedence.resolveRomanPrecedence([
      { id: 'fake-solemnity', precedenceClass: 'optional-memorial', isSolemnity: true }
    ]);
  } catch { fakeSolemnityRejected = true; }
  assert(fakeSolemnityRejected, 'Lower-rank celebrations must not be allowed to masquerade as solemnities.');

  assert(JSON.stringify(lentSundayVsJoseph.transferRule.destinationMustBeFreeOfLevels) === JSON.stringify([1,2,3,4,5,6,7,8]), 'Transferred solemnities must target a day free from precedence levels 1-8.');
  assert(lentSundayVsJoseph.transferRule.targetDateResolvedByThisFunction === false, 'Collision resolution must not silently invent a transfer date before the annual calendar is available.');
  assert(lentSundayVsJoseph.sourceIds.includes('snl-portugal-precedence-table'), 'Precedence decisions must retain their normative source id.');

  console.log('Roman precedence core passed: 13 levels, celebrate/transfer/omit semantics, candidate validation and fail-closed equal-precedence handling.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

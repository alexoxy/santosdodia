#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-liturgical-year-'));
function assert(condition, message) { if (!condition) throw new Error(message); }

function transpile(sourcePath, outputName, rewrites = []) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some((item) => item.category === ts.DiagnosticCategory.Error), `${path.basename(sourcePath)} transpilation returned errors.`);
  let output = compiled.outputText;
  for (const [from, to] of rewrites) output = output.replaceAll(from, to);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), output, 'utf8');
}

function date(value) { return new Date(`${value}T00:00:00Z`); }
function days(a, b) { return Math.round((date(b).getTime() - date(a).getTime()) / 86_400_000); }

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  transpile(path.join(root, 'lib/knowledge/roman-vestment-colours.ts'), 'roman-vestment-colours.js');
  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const colours = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-vestment-colours.js')).href}?v=${Date.now()}`);

  assert(roman.romanSundayCycle(2024) === 'B', '2024 must use Sunday cycle B.');
  assert(roman.romanSundayCycle(2025) === 'C', '2025 must use Sunday cycle C.');
  assert(roman.romanSundayCycle(2026) === 'A', '2026 must use Sunday cycle A.');
  assert(roman.romanSundayCycle(2027) === 'B', '2027 must use Sunday cycle B.');
  assert(roman.romanWeekdayCycle(2026) === 'II' && roman.romanWeekdayCycle(2027) === 'I', 'Weekday I/II liturgical-year parity rule regressed.');

  const portugal2026 = roman.calculateRomanLiturgicalYear(2026, roman.ROMAN_PORTUGAL_POLICY);
  const expected2026 = {
    startDate: '2025-11-30',
    'epiphany': '2026-01-04',
    'baptism-of-the-lord': '2026-01-11',
    'ash-wednesday': '2026-02-18',
    'first-sunday-of-lent': '2026-02-22',
    'easter-sunday': '2026-04-05',
    'ascension': '2026-05-17',
    'pentecost': '2026-05-24',
    'trinity-sunday': '2026-05-31',
    'corpus-christi': '2026-06-04',
    'sacred-heart': '2026-06-12',
    'christ-the-king': '2026-11-22'
  };
  assert(portugal2026.startDate === expected2026.startDate, `Portugal 2026 Advent start drifted: ${portugal2026.startDate}.`);
  assert(portugal2026.sundayCycle === 'A' && portugal2026.weekdayCycle === 'II', 'Portugal liturgical year 2026 must be A/II.');
  for (const [key, value] of Object.entries(expected2026)) {
    if (key === 'startDate') continue;
    assert(portugal2026.keyDates[key] === value, `Portugal 2026 ${key} expected ${value}, got ${portugal2026.keyDates[key]}.`);
  }

  const portugal2027 = roman.calculateRomanLiturgicalYear(2027, roman.ROMAN_PORTUGAL_POLICY);
  assert(portugal2027.sundayCycle === 'B' && portugal2027.weekdayCycle === 'I', 'Portugal liturgical year 2027 must be B/I.');
  assert(portugal2027.keyDates['easter-sunday'] === '2027-03-28', 'Portugal 2027 Easter regression.');
  assert(portugal2027.keyDates.ascension === '2027-05-09', 'Portugal 2027 Sunday Ascension regression.');

  const global2026 = roman.calculateRomanLiturgicalYear(2026, roman.ROMAN_GENERAL_POLICY);
  assert(global2026.keyDates.epiphany === '2026-01-06', 'General Roman Epiphany must remain January 6.');
  assert(global2026.keyDates.ascension === '2026-05-14', 'General Roman Ascension must remain Easter +39 Thursday.');

  const june1 = roman.romanDateContext('2026-06-01', roman.ROMAN_PORTUGAL_POLICY);
  assert(june1.liturgicalYear === 2026 && june1.sundayCycle === 'A' && june1.weekdayCycle === 'II', 'June 2026 cycle context regressed.');
  assert(june1.weekdayCycleAppliesToDate === true && june1.weekdayLectionaryPattern === 'ordinary-time-two-year', 'Ordinary Time date must expose the two-year weekday cycle as applicable.');
  assert(june1.season === 'ordinary-time' && june1.seasonWeek === 9, `2026-06-01 must be Ordinary Time week IX, got ${june1.season}/${june1.seasonWeek}.`);
  const june7 = roman.romanDateContext('2026-06-07', roman.ROMAN_PORTUGAL_POLICY);
  assert(june7.season === 'ordinary-time' && june7.seasonWeek === 10, '2026-06-07 must resolve as Ordinary Time week X.');

  const adventBoundary = roman.romanDateContext('2026-12-01', roman.ROMAN_PORTUGAL_POLICY);
  assert(adventBoundary.liturgicalYear === 2027, 'December 2026 after Advent start must belong to liturgical year 2027.');
  assert(adventBoundary.sundayCycle === 'B', 'December 2026 must already use Sunday cycle B.');
  assert(adventBoundary.weekdayCycle === 'I', 'December 2026 after Advent start must expose the 2026/2027 liturgical-year weekday cycle I.');
  assert(adventBoundary.weekdayCycleAppliesToDate === false && adventBoundary.weekdayLectionaryPattern === 'seasonal-annual', 'Advent weekday readings must be identified as the annual seasonal series rather than an I/II Ordinary Time selection.');
  assert(adventBoundary.season === 'advent' && adventBoundary.seasonWeek === 1, '2026-12-01 must be Advent week I.');

  const ascensionColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-05-17', roman.ROMAN_PORTUGAL_POLICY));
  assert(ascensionColour.resolvedColour === 'white', 'Portugal 2026 Ascension must resolve to white vestments.');
  const pentecostColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-05-24', roman.ROMAN_PORTUGAL_POLICY));
  assert(pentecostColour.resolvedColour === 'red', 'Portugal 2026 Pentecost must resolve to red vestments.');
  const palmColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-03-29', roman.ROMAN_PORTUGAL_POLICY));
  assert(palmColour.resolvedColour === 'red', 'Portugal 2026 Palm Sunday must resolve to red vestments.');
  const laetareColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-03-15', roman.ROMAN_PORTUGAL_POLICY));
  assert(laetareColour.defaultColour === 'violet' && laetareColour.permittedAlternativeColours.includes('rose') && laetareColour.resolvedColour === null, 'Laetare must keep violet as default with optional rose.');
  const gaudeteColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-12-13', roman.ROMAN_PORTUGAL_POLICY));
  assert(gaudeteColour.defaultColour === 'violet' && gaudeteColour.permittedAlternativeColours.includes('rose') && gaudeteColour.resolvedColour === null, 'Gaudete must keep violet as default with optional rose.');
  const ordinaryColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-06-01', roman.ROMAN_PORTUGAL_POLICY));
  assert(ordinaryColour.defaultColour === 'green' && ordinaryColour.resolvedColour === null && ordinaryColour.finalOccurrenceResolutionRequired === true, 'Ordinary Time must expose green as seasonal default without pretending the final sanctoral colour is resolved.');
  const holySaturdayColour = colours.romanVestmentColoursForDateContext(roman.romanDateContext('2026-04-04', roman.ROMAN_PORTUGAL_POLICY));
  assert(holySaturdayColour.defaultColour === null && holySaturdayColour.specialCase === 'holy-saturday-no-mass-before-easter-vigil', 'Holy Saturday must not be assigned a fake daytime Mass colour.');
  const deadColours = colours.romanMassForTheDeadColourOptions();
  assert(deadColours.permittedColours.some(item => item.colour === 'violet' && item.condition === 'permitted'), 'Masses for the Dead must permit violet.');
  assert(deadColours.permittedColours.some(item => item.colour === 'black' && item.condition === 'where-customary'), 'Masses for the Dead must permit black only where customary.');
  assert(JSON.stringify(colours.ROMAN_VESTMENT_COLOUR_CODES) === JSON.stringify(['white','red','green','violet','black','rose']), 'Canonical Roman vestment colour code set drifted.');

  for (let liturgicalYear = 1900; liturgicalYear <= 2200; liturgicalYear += 1) {
    const calculated = roman.calculateRomanLiturgicalYear(liturgicalYear, roman.ROMAN_PORTUGAL_POLICY);
    const start = date(calculated.startDate);
    const easter = date(calculated.keyDates['easter-sunday']);
    assert(calculated.weekdayCycle === (liturgicalYear % 2 === 0 ? 'II' : 'I'), `${liturgicalYear} weekday cycle parity drifted.`);
    assert(start.getUTCDay() === 0, `${liturgicalYear} Advent start is not Sunday.`);
    assert(start.getUTCMonth() === 10 || start.getUTCMonth() === 11, `${liturgicalYear} Advent start month is invalid.`);
    const monthDay = (start.getUTCMonth() + 1) * 100 + start.getUTCDate();
    assert(monthDay >= 1127 && monthDay <= 1203, `${liturgicalYear} Advent start is outside Nov 27-Dec 3.`);
    const easterMonthDay = (easter.getUTCMonth() + 1) * 100 + easter.getUTCDate();
    assert(easter.getUTCDay() === 0 && easterMonthDay >= 322 && easterMonthDay <= 425, `${liturgicalYear} Gregorian Easter invariant failed.`);
    assert(days(calculated.keyDates['easter-sunday'], calculated.keyDates.pentecost) === 49, `${liturgicalYear} Pentecost is not Easter +49.`);
    assert(days(calculated.keyDates['christ-the-king'], date(calculated.endDate).toISOString().slice(0, 10)) >= 0, `${liturgicalYear} Christ the King is outside the liturgical year.`);
    const nextAdvent = new Date(date(calculated.endDate).getTime() + 86_400_000).toISOString().slice(0, 10);
    assert(days(calculated.keyDates['christ-the-king'], nextAdvent) === 7, `${liturgicalYear} Christ the King must be seven days before the next Advent.`);
  }

  console.log('Roman liturgical-year kernel passed cycles, perennial dates and Roman vestment-colour rules including white/red/green/violet/black/rose semantics.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

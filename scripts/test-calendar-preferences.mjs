import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync('lib/calendar-preferences.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const { parseCalendarRegion, preferredTimeZone, countryFromLanguages, languagesFromHeader } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
assert.equal(parseCalendarRegion('GLOBAL'), 'GLOBAL');
assert.equal(parseCalendarRegion('pt'), 'PT');
assert.equal(parseCalendarRegion('PT; path=/'), undefined);
assert.equal(parseCalendarRegion(''), undefined);
assert.equal(preferredTimeZone('Europe%2FLisbon', 'America/New_York'), 'Europe/Lisbon');
assert.equal(preferredTimeZone('UTC', 'Pacific/Kiritimati'), 'UTC');
assert.equal(preferredTimeZone(undefined, 'America/New_York'), 'America/New_York');
assert.equal(preferredTimeZone('Invalid/Zone', 'Europe/Lisbon'), 'Europe/Lisbon');
assert.equal(preferredTimeZone('%invalid', 'Invalid/Zone'), 'UTC');
console.log('Calendar preference validation and timezone precedence passed.');

assert.equal(countryFromLanguages(['pt-PT']), 'PT');
assert.equal(countryFromLanguages(['pt-BR']), 'BR');
assert.equal(countryFromLanguages(['en-GB']), 'GB');
assert.equal(countryFromLanguages(['pt']), 'BR'); // CLDR likely region, not residence.
assert.equal(countryFromLanguages(['not_a_locale', 'fr-FR']), 'FR');
assert.equal(countryFromLanguages([]), undefined);
console.log('Browser language regional and default-country fallbacks passed.');

assert.deepEqual(languagesFromHeader('pt-BR;q=0.5,en-GB;q=1,fr;q=0'), ['en-GB', 'pt-BR']);
assert.equal(countryFromLanguages(languagesFromHeader('pt-BR;q=0.5,en-GB;q=1')), 'GB');
assert.deepEqual(languagesFromHeader('fr;q=invalid,de;q=2'), []);

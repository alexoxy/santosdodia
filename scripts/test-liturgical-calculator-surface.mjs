#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const api = read('app/api/v1/liturgical-calendar/route.ts');
const page = read('app/tools/liturgical-calendar/page.tsx');
const localization = read('lib/knowledge/liturgical-calendar-localization.ts');
const colourLocalization = read('lib/knowledge/roman-vestment-colour-localization.ts');
const colourKernel = read('lib/knowledge/roman-vestment-colours.ts');
const openapi = read('app/openapi.json/route.ts');
const llms = read('app/llms.txt/route.ts');
const sourceRegistry = JSON.parse(read('data/liturgical-rule-sources.json'));
const kernel = read('lib/knowledge/roman-liturgical-year.ts');

assert(!/\bfetch\s*\(/u.test(api), 'Liturgical calculator API must not fetch external sources at request time.');
assert(!/getLitcalDay|litcal-mirror|axios|request\(/u.test(api), 'Liturgical calculator API must remain independent of external/mirrored annual providers.');
assert(api.includes("requestTimeExternalDependency: false"), 'API must disclose its no-runtime-external-dependency contract.');
assert(api.includes("engine: 'santosdia-roman-liturgical-year'"), 'API must expose a stable engine identifier.');
assert(api.includes("engineVersion: '1.1'"), 'Vestment-colour API expansion must bump the engine contract version.');
assert(api.includes('vestmentColours') && api.includes('vestmentColourGuide'), 'API must expose date colour resolution and the colour guide.');
assert(api.includes("canonicalCodes: ['white', 'red', 'green', 'violet', 'black', 'rose']"), 'API must expose stable language-neutral Roman vestment colour codes.');
assert(api.includes('finalColourMayBeInferredFromSeasonAlone: false'), 'API must prohibit final-colour inference from season alone.');
assert(api.includes('I/II by liturgical year'), 'API must not describe weekday I/II as a simple civil-year rule.');
assert(!api.includes('I in odd civil years; II in even civil years.'), 'Obsolete civil-year I/II explanation must not return.');
assert(page.includes("alternates: { canonical: '/tools/liturgical-calendar' }"), 'Human calculator must keep a stable canonical URL.');
assert(page.includes('/api/v1/liturgical-calendar'), 'Human calculator must expose its machine equivalent.');
assert(page.includes("new URLSearchParams({ tradition: 'roman-catholic' })"), 'Roman calculator must route its retention CTA to the matching Church feed.');
assert(page.includes("const syncPath = `/calendar/subscribe?${syncParams}`"), 'Calculator must link to the persistent calendar subscription center.');
assert(page.includes("const annualIcsPath = `${rollingIcsPath}&year=${year}`"), 'Calculator must keep explicit-year ICS as a fixed snapshot.');
assert(page.includes('{copy.subscribe}') && page.includes('{copy.annualIcs}'), 'Calculator subscription actions must remain localized.');
assert(page.includes('romanVestmentColourGuide(locale)') && page.includes('romanVestmentColoursForDateContext(context)'), 'Human calculator must display both the six-colour guide and date-specific resolution.');
assert(openapi.includes('"/api/v1/liturgical-calendar"'), 'Perennial calculator must be represented in OpenAPI.');
assert(openapi.includes('Y-1 through Y+3'), 'OpenAPI must describe the current rolling ICS window, not the retired two-year contract.');
assert(llms.includes('/api/v1/liturgical-calendar'), 'Perennial calculator must be discoverable by AI agents through llms.txt.');
assert(llms.includes('/tools/liturgical-calendar'), 'Human calculator must be discoverable through llms.txt.');
assert(sourceRegistry.runtimeDependency === false, 'Rule-learning sources must never become runtime dependencies.');
assert(sourceRegistry.changeMonitoring?.enabled === true, 'Normative/reference rule sources must remain change-monitored.');
assert(sourceRegistry.changeMonitoring?.annualCalendarGenerationRequiresReview === false, 'Normal annual calendar generation must remain autonomous.');
assert(sourceRegistry.changeMonitoring?.ruleChangesRequireReview === true, 'Normative rule changes must remain review-by-exception.');
assert(sourceRegistry.sources.some(source => source.id === 'snl-portugal-vestment-colours' && source.tier === 'A1' && source.role.includes('vestment-colours')), 'Portuguese vestment-colour authority must be registered as A1 evidence.');
assert(kernel.includes("epiphany: 'january-6' | 'sunday-january-2-to-8'"), 'Jurisdiction policy must remain separate from Roman computus.');
assert(kernel.includes("ascension: 'easter-plus-39-thursday' | 'easter-plus-42-sunday'"), 'Ascension transfer must remain jurisdiction policy.');
assert(kernel.includes("corpusChristi: 'easter-plus-60-thursday' | 'easter-plus-63-sunday'"), 'Corpus Christi transfer must remain jurisdiction policy.');
assert(colourKernel.includes("'white' | 'red' | 'green' | 'violet' | 'black' | 'rose'"), 'Roman colour kernel must keep exactly the six canonical colour codes.');
assert(colourKernel.includes("permittedAlternativeColours: ['rose']"), 'Rose must remain an optional Gaudete/Laetare colour.');
assert(colourKernel.includes("{ colour: 'black', condition: 'where-customary' }"), 'Black must remain an optional customary colour for Masses for the Dead.');
assert(colourKernel.includes("{ colour: 'violet', condition: 'permitted' }"), 'Violet must remain a permitted colour for Masses for the Dead without being mislabeled as universally mandatory.');
assert(colourKernel.includes("specialCase: 'holy-saturday-no-mass-before-easter-vigil'"), 'Holy Saturday must remain a special no-daytime-Mass case.');

for (const locale of ['pt', 'en', 'es', 'it']) {
  assert(page.includes(`<option value="${locale}">`), `Public calculator is missing locale ${locale}.`);
}

assert(page.includes('{copy.eyebrow}') && page.includes('{copy.language}') && page.includes('{copy.cycleChangeNote}'), 'Calculator presentation labels must come from the locale bundle.');
assert(!page.includes('>Language<select'), 'Calculator must not hardcode an English Language label.');
assert(!page.includes('>Perennial rules · API · AI-ready<'), 'Calculator must not hardcode its English eyebrow outside localization.');
for (const required of [
  "eyebrow: 'Regras perenes · API · preparada para IA'",
  "language: 'Idioma'",
  "subscribe: 'Manter este calendário sincronizado'",
  "eyebrow: 'Reglas perennes · API · preparada para IA'",
  "eyebrow: 'Regole perenni · API · pronta per l’IA'",
  "language: 'Lingua'"
]) assert(localization.includes(required), `Calculator localization contract missing: ${required}.`);
for (const required of [
  "white: 'Branco'",
  "red: 'Vermelho'",
  "green: 'Verde'",
  "violet: 'Roxo'",
  "black: 'Preto'",
  "rose: 'Rosa'"
]) assert(colourLocalization.includes(required), `Portuguese vestment colour localization missing: ${required}.`);

console.log('Liturgical calculator surface passed: deterministic API + rolling ICS retention + Roman vestment colours + OpenAPI + llms.txt + locale isolation + review-by-exception source policy.');

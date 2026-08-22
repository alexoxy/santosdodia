#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const api = read('app/api/v1/liturgical-calendar/route.ts');
const page = read('app/tools/liturgical-calendar/page.tsx');
const localization = read('lib/knowledge/liturgical-calendar-localization.ts');
const openapi = read('app/openapi.json/route.ts');
const llms = read('app/llms.txt/route.ts');
const sourceRegistry = JSON.parse(read('data/liturgical-rule-sources.json'));
const kernel = read('lib/knowledge/roman-liturgical-year.ts');

assert(!/\bfetch\s*\(/u.test(api), 'Liturgical calculator API must not fetch external sources at request time.');
assert(!/getLitcalDay|litcal-mirror|axios|request\(/u.test(api), 'Liturgical calculator API must remain independent of external/mirrored annual providers.');
assert(api.includes("requestTimeExternalDependency: false"), 'API must disclose its no-runtime-external-dependency contract.');
assert(api.includes("engine: 'santosdia-roman-liturgical-year'"), 'API must expose a stable engine identifier.');
assert(page.includes("alternates: { canonical: '/tools/liturgical-calendar' }"), 'Human calculator must keep a stable canonical URL.');
assert(page.includes('/api/v1/liturgical-calendar'), 'Human calculator must expose its machine equivalent.');
assert(openapi.includes('"/api/v1/liturgical-calendar"'), 'Perennial calculator must be represented in OpenAPI.');
assert(llms.includes('/api/v1/liturgical-calendar'), 'Perennial calculator must be discoverable by AI agents through llms.txt.');
assert(llms.includes('/tools/liturgical-calendar'), 'Human calculator must be discoverable through llms.txt.');
assert(sourceRegistry.runtimeDependency === false, 'Rule-learning sources must never become runtime dependencies.');
assert(sourceRegistry.changeMonitoring?.enabled === true, 'Normative/reference rule sources must remain change-monitored.');
assert(sourceRegistry.changeMonitoring?.annualCalendarGenerationRequiresReview === false, 'Normal annual calendar generation must remain autonomous.');
assert(sourceRegistry.changeMonitoring?.ruleChangesRequireReview === true, 'Normative rule changes must remain review-by-exception.');
assert(kernel.includes("epiphany: 'january-6' | 'sunday-january-2-to-8'"), 'Jurisdiction policy must remain separate from Roman computus.');
assert(kernel.includes("ascension: 'easter-plus-39-thursday' | 'easter-plus-42-sunday'"), 'Ascension transfer must remain jurisdiction policy.');
assert(kernel.includes("corpusChristi: 'easter-plus-60-thursday' | 'easter-plus-63-sunday'"), 'Corpus Christi transfer must remain jurisdiction policy.');

for (const locale of ['pt', 'en', 'es', 'it']) {
  assert(page.includes(`<option value="${locale}">`), `Public calculator is missing locale ${locale}.`);
}

assert(page.includes('{copy.eyebrow}') && page.includes('{copy.language}') && page.includes('{copy.cycleChangeNote}'), 'Calculator presentation labels must come from the locale bundle.');
assert(!page.includes('>Language<select'), 'Calculator must not hardcode an English Language label.');
assert(!page.includes('>Perennial rules · API · AI-ready<'), 'Calculator must not hardcode its English eyebrow outside localization.');
for (const required of [
  "eyebrow: 'Regras perenes · API · preparada para IA'",
  "language: 'Idioma'",
  "eyebrow: 'Reglas perennes · API · preparada para IA'",
  "eyebrow: 'Regole perenni · API · pronta per l’IA'",
  "language: 'Lingua'"
]) assert(localization.includes(required), `Calculator localization contract missing: ${required}.`);

console.log('Liturgical calculator surface passed: human page + deterministic API + OpenAPI + llms.txt + locale isolation + review-by-exception source policy.');

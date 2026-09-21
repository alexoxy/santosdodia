#!/usr/bin/env node

import fs from 'node:fs';

const editorialFiles = [
  'data/date-editorial.ts',
  'data/date-editorial-batch-2.ts',
  'data/date-editorial-batch-3.ts',
  'data/date-editorial-batch-4.ts',
  'data/date-editorial-batch-5.ts',
];
const publicLocales = ['en', 'es', 'pt', 'it'];
const thresholds = {
  eyebrowCharacters: 8,
  titleCharacters: 18,
  leadCharacters: 180,
  contextCharacters: 200,
  editorialWords: 65,
  observanceIds: 1,
};

function wordCount(value) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function validMonthDay(value) {
  if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/u.test(value)) return false;
  const [month, day] = value.split('-').map(Number);
  const candidate = new Date(Date.UTC(2024, month - 1, day));
  return candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
}

function readQuotedProperty(source, propertyName) {
  const match = new RegExp(`\\b${propertyName}\\s*:\\s*`, 'u').exec(source);
  if (!match) return '';
  let index = match.index + match[0].length;
  const quote = source[index];
  if (!['\'', '"', '`'].includes(quote)) return '';
  index += 1;
  let value = '';
  for (; index < source.length; index += 1) {
    const char = source[index];
    if (char === '\\') {
      const next = source[index + 1];
      if (next === undefined) break;
      const decoded = next === 'n' ? '\n' : next === 't' ? '\t' : next;
      value += decoded;
      index += 1;
      continue;
    }
    if (char === quote) return value;
    value += char;
  }
  return '';
}

function extractObject(source, propertyName) {
  const match = new RegExp(`\\b${propertyName}\\s*:\\s*\\{`, 'u').exec(source);
  if (!match) return '';
  const start = source.indexOf('{', match.index);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, index);
    }
  }
  return '';
}

function readObservanceIds(source) {
  const match = /\bobservanceIds\s*:\s*\[([^\]]*)\]/u.exec(source);
  if (!match) return [];
  return [...match[1].matchAll(/['"]([^'"]+)['"]/gu)].map(item => item[1]);
}

function extractEntries(file) {
  const source = fs.readFileSync(file, 'utf8');
  const matches = [...source.matchAll(/\bmonthDay\s*:\s*['"](\d{2}-\d{2})['"]/gu)];
  return matches.map((match, index) => ({
    file,
    monthDay: match[1],
    source: source.slice(match.index, matches[index + 1]?.index ?? source.length),
  }));
}

const entries = editorialFiles.flatMap(extractEntries);
const failures = [];
const seen = new Map();
const minima = Object.fromEntries(publicLocales.map(locale => [locale, {
  leadCharacters: Number.POSITIVE_INFINITY,
  contextCharacters: Number.POSITIVE_INFINITY,
  editorialWords: Number.POSITIVE_INFINITY,
}]));

for (const entry of entries) {
  if (!validMonthDay(entry.monthDay)) failures.push(`${entry.file}: invalid month-day ${entry.monthDay}`);
  if (seen.has(entry.monthDay)) failures.push(`${entry.monthDay}: duplicate editorial entry in ${seen.get(entry.monthDay)} and ${entry.file}`);
  seen.set(entry.monthDay, entry.file);

  const observanceIds = readObservanceIds(entry.source);
  if (observanceIds.length < thresholds.observanceIds) failures.push(`${entry.monthDay}: no linked observance IDs`);
  if (new Set(observanceIds).size !== observanceIds.length) failures.push(`${entry.monthDay}: duplicate linked observance IDs`);

  for (const locale of publicLocales) {
    const localized = extractObject(entry.source, locale);
    if (!localized) {
      failures.push(`${entry.monthDay}/${locale}: missing launched-locale editorial copy`);
      continue;
    }
    const eyebrow = readQuotedProperty(localized, 'eyebrow');
    const title = readQuotedProperty(localized, 'title');
    const lead = readQuotedProperty(localized, 'lead');
    const context = readQuotedProperty(localized, 'context');
    const editorialWords = wordCount(`${lead} ${context}`);

    minima[locale].leadCharacters = Math.min(minima[locale].leadCharacters, lead.length);
    minima[locale].contextCharacters = Math.min(minima[locale].contextCharacters, context.length);
    minima[locale].editorialWords = Math.min(minima[locale].editorialWords, editorialWords);

    if (eyebrow.trim().length < thresholds.eyebrowCharacters) failures.push(`${entry.monthDay}/${locale}: eyebrow too short (${eyebrow.trim().length})`);
    if (title.trim().length < thresholds.titleCharacters) failures.push(`${entry.monthDay}/${locale}: title too short (${title.trim().length})`);
    if (lead.trim().length < thresholds.leadCharacters) failures.push(`${entry.monthDay}/${locale}: lead too short (${lead.trim().length} chars)`);
    if (context.trim().length < thresholds.contextCharacters) failures.push(`${entry.monthDay}/${locale}: context too short (${context.trim().length} chars)`);
    if (editorialWords < thresholds.editorialWords) failures.push(`${entry.monthDay}/${locale}: editorial body too short (${editorialWords} words)`);
  }
}

if (!entries.length) failures.push('No annual-date editorial entries were found.');

const report = {
  generatedAt: new Date().toISOString(),
  editorialFiles,
  publicLocales,
  thresholds,
  totalIndexedDateCandidates: entries.length,
  monthDays: entries.map(entry => entry.monthDay).sort(),
  minima,
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.error(`Annual-date editorial audit failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`Annual-date editorial audit passed: ${entries.length} evergreen date pages meet the launched-locale depth floor.`);

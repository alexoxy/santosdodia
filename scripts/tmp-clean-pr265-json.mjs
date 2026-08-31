#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const specs = [
  ['data/canonical-recognition-anchors.json', 'recognitions', 'id', false],
  ['data/canonical-occurrence-anchors.json', 'occurrences', 'id', false],
  ['data/canonical-occurrence-legacy-bridges.json', 'bridges', 'occurrenceId', false],
  ['data/canonical-roman-sanctorale-rule-anchors.json', 'rules', 'id', false],
  ['data/migrations/roman-catholic-pt-2026-v2.fixed-sanctorale-shadow.json', 'mappings', 'occurrenceId', true]
];

function baseText(path) {
  return execFileSync('git', ['show', `origin/main:${path}`], { encoding: 'utf8' });
}

function findArrayBounds(text, key) {
  const marker = `"${key}"`;
  const keyIndex = text.indexOf(marker);
  if (keyIndex < 0) throw new Error(`Missing ${key} in base text`);
  const start = text.indexOf('[', keyIndex + marker.length);
  if (start < 0) throw new Error(`Missing array start for ${key}`);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) return [start, i];
    }
  }
  throw new Error(`Unclosed ${key} array`);
}

function formatExtra(item, compact) {
  if (compact) return `    ${JSON.stringify(item)}`;
  return JSON.stringify(item, null, 2).split('\n').map((line) => `    ${line}`).join('\n').replace(/^    \{/u, '    {');
}

for (const [path, arrayKey, idKey, compact] of specs) {
  const current = JSON.parse(fs.readFileSync(path, 'utf8'));
  const base = baseText(path);
  const baseJson = JSON.parse(base);
  const baseIds = new Set((baseJson[arrayKey] ?? []).map((item) => item[idKey]));
  const extras = (current[arrayKey] ?? []).filter((item) => !baseIds.has(item[idKey]));
  if (extras.length !== 3) throw new Error(`${path}: expected exactly 3 reviewed additions, got ${extras.length}`);
  const [start, end] = findArrayBounds(base, arrayKey);
  const beforeClose = base.slice(start + 1, end);
  const hasEntries = beforeClose.trim().length > 0;
  const insertion = `${hasEntries ? ',' : ''}\n${extras.map((item) => formatExtra(item, compact)).join(',\n')}\n  `;
  const rebuilt = `${base.slice(0, end)}${insertion}${base.slice(end)}`;
  JSON.parse(rebuilt);
  fs.writeFileSync(path, rebuilt, 'utf8');
}

const coveragePath = 'data/migrations/roman-catholic-pt-2026-v2.canonical-coverage.json';
const currentCoverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
let coverageText = baseText(coveragePath);
for (const key of ['explicitOccurrenceAnchors','mappedOccurrenceAnchors','remainingLegacyOccurrences']) {
  const value = currentCoverage.coverage[key];
  coverageText = coverageText.replace(new RegExp(`("${key}"\\s*:\\s*)\\d+`, 'u'), `$1${value}`);
}
coverageText = coverageText.replace(/("verifiedAt"\s*:\s*")[^"]+("\s*)/u, `$1${currentCoverage.verifiedAt}$2`);
JSON.parse(coverageText);
fs.writeFileSync(coveragePath, coverageText, 'utf8');

console.log('PR #265 JSON formatting restored from main with exactly three reviewed additions per canonical array.');

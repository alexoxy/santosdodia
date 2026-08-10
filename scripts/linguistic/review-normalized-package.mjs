#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const input = path.resolve(argument('--input'));
const output = path.resolve(argument('--output'));
if (!input || !output) throw new Error('--input and --output are required.');

const policy = JSON.parse(fs.readFileSync('data/linguistic-style-policy.json', 'utf8'));
const authorities = JSON.parse(fs.readFileSync('data/language-authorities.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(input, 'staging-manifest.json'), 'utf8'));
const entities = fs.readFileSync(path.join(input, 'entities.jsonl'), 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
const supported = new Set(Object.keys(authorities));
const localeAlias = { tl: 'fil', 'pt-br': 'pt', 'pt-pt': 'pt', 'en-gb': 'en', 'en-us': 'en' };
const CYRILLIC = /[\u0400-\u052f]/u;
const GREEK = /[\u0370-\u03ff\u1f00-\u1fff]/u;
const ARMENIAN = /[\u0530-\u058f]/u;
const ETHIOPIC = /[\u1200-\u137f]/u;
const ARABIC_SYRIAC = /[\u0600-\u074f]/u;
const LATIN = /[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]/u;

function canonicalLocale(language) {
  const raw = String(language ?? '').trim().toLowerCase().replace('_', '-');
  return localeAlias[raw] ?? raw.split('-')[0];
}

function issuesFor(value, locale) {
  const issues = [];
  if (typeof value !== 'string' || !value.trim()) return ['empty'];
  if (/�/u.test(value)) issues.push('replacement-character');
  if (/\s{2,}/u.test(value)) issues.push('repeated-space');
  if (/\s+[,.!?;:]/u.test(value) && locale !== 'fr') issues.push('suspicious-punctuation-spacing');
  if (locale === 'ru') {
    if (!CYRILLIC.test(value) && LATIN.test(value)) issues.push('unexpected-latin-script');
  } else if (supported.has(locale)) {
    if (CYRILLIC.test(value) || GREEK.test(value) || ARMENIAN.test(value) || ETHIOPIC.test(value) || ARABIC_SYRIAC.test(value)) {
      issues.push('unexpected-script-for-locale');
    }
  }
  if (locale === 'pt' && /\b(?:Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+De\b/u.test(value)) {
    issues.push('pt-date-preposition-capitalized');
  }
  return issues;
}

const reviewed = [];
const critical = [];
const advisory = [];
const localeCoverage = {};

for (const entity of entities) {
  for (const field of ['names', 'descriptions']) {
    for (const item of entity[field] ?? []) {
      const locale = canonicalLocale(item.language);
      const value = field === 'names' ? item.name : item.value;
      if (!supported.has(locale)) continue;
      localeCoverage[locale] = (localeCoverage[locale] ?? 0) + 1;
      const issues = issuesFor(value, locale);
      const record = {
        entityId: entity.id,
        field,
        sourceLanguage: item.language,
        locale,
        value,
        sourceTextHash: await sha256(value),
        translationMethod: 'external-source-label',
        qualityStatus: 'source-only',
        authority: authorities[locale]?.editorial ?? null,
        issues,
      };
      reviewed.push(record);
      for (const issue of issues) {
        const target = ['replacement-character','empty','unexpected-script-for-locale','pt-date-preposition-capitalized'].includes(issue) ? critical : advisory;
        target.push({ entityId: entity.id, locale, field, issue, value });
      }
    }
  }
}

const report = {
  schemaVersion: 1,
  agent: 'language-editor',
  lane: 'saints',
  partition: manifest.sourceId,
  sourceRunId: manifest.sourceRunId,
  sourceFingerprint: manifest.sourceFingerprint,
  generatedAt: new Date().toISOString(),
  publicationAllowed: false,
  targetQualityGate: policy.translationGate,
  reviewedFieldCount: reviewed.length,
  localeCoverage,
  criticalCount: critical.length,
  advisoryCount: advisory.length,
  critical,
  advisory,
  fields: reviewed,
};

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of fs.readdirSync(input, { withFileTypes: true })) {
  const source = path.join(input, entry.name);
  const destination = path.join(output, entry.name);
  if (entry.isDirectory()) fs.cpSync(source, destination, { recursive: true });
  else fs.copyFileSync(source, destination);
}
fs.writeFileSync(path.join(output, 'linguistic-review.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const reviewedManifest = {
  ...manifest,
  stage: 'linguistically-reviewed',
  linguisticReview: 'linguistic-review.json',
  linguisticCriticalCount: critical.length,
  linguisticAdvisoryCount: advisory.length,
  publish: false,
};
fs.writeFileSync(path.join(output, 'staging-manifest.json'), `${JSON.stringify(reviewedManifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ reviewedFieldCount: reviewed.length, localeCoverage, criticalCount: critical.length, advisoryCount: advisory.length }, null, 2));
if (critical.length) process.exitCode = 1;

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

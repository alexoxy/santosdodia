#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const inputArg = argument('--input');
const outputArg = argument('--output');
if (!inputArg || !outputArg) throw new Error('--input and --output are required.');
const input = path.resolve(inputArg);
const output = path.resolve(outputArg);

const REVIEW_VERSION = '1.1';
const policy = JSON.parse(fs.readFileSync('data/linguistic-style-policy.json', 'utf8'));
const authorities = JSON.parse(fs.readFileSync('data/language-authorities.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(input, 'staging-manifest.json'), 'utf8'));
const entities = fs.readFileSync(path.join(input, 'entities.jsonl'), 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
const supportedLocales = Object.keys(authorities);
const supported = new Set(supportedLocales);
const localeAlias = { tl: 'fil', 'pt-br': 'pt', 'pt-pt': 'pt', 'en-gb': 'en', 'en-us': 'en' };
const CYRILLIC = /[\u0400-\u052f]/u;
const GREEK = /[\u0370-\u03ff\u1f00-\u1fff]/u;
const ARMENIAN = /[\u0530-\u058f]/u;
const ETHIOPIC = /[\u1200-\u137f]/u;
const ARABIC_SYRIAC = /[\u0600-\u074f]/u;
const LATIN = /[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]/u;
const LETTER = /\p{Letter}/u;
const WITHHOLD_ISSUES = new Set([
  'empty',
  'replacement-character',
  'unexpected-script-for-locale',
  'required-cyrillic-script-missing',
  'required-latin-script-missing',
  'pt-date-preposition-capitalized',
]);

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
    if (LETTER.test(value) && !CYRILLIC.test(value)) issues.push('required-cyrillic-script-missing');
    if (LATIN.test(value) && !CYRILLIC.test(value)) issues.push('unexpected-script-for-locale');
  } else if (supported.has(locale)) {
    if (LETTER.test(value) && !LATIN.test(value)) issues.push('required-latin-script-missing');
    if (CYRILLIC.test(value) || GREEK.test(value) || ARMENIAN.test(value) || ETHIOPIC.test(value) || ARABIC_SYRIAC.test(value)) issues.push('unexpected-script-for-locale');
  }
  if (locale === 'pt' && /\b(?:Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+De\b/u.test(value)) issues.push('pt-date-preposition-capitalized');
  return [...new Set(issues)];
}

function fieldDecision(issues) {
  const blocking = issues.filter((issue) => WITHHOLD_ISSUES.has(issue));
  return {
    status: blocking.length ? 'withheld' : 'candidate',
    blockingIssues: blocking,
    publicationEligible: false,
    reason: blocking.length ? 'locale-specific-language-gate' : 'source-only-needs-quality-upgrade',
  };
}

function jsonLines(values) {
  return values.length ? `${values.map((value) => JSON.stringify(value)).join('\n')}\n` : '';
}

const fieldDecisions = [];
const withheld = [];
const advisory = [];
const localeCoverage = Object.fromEntries(supportedLocales.map((locale) => [locale, 0]));
const localeEntityStatus = Object.fromEntries(supportedLocales.map((locale) => [locale, { missing: 0, withheld: 0, sourceOnly: 0 }]));
const nameDecisions = [];
const translationQueue = [];
const entityLocaleNames = new Map();

for (const entity of entities) {
  entityLocaleNames.set(entity.id, new Map(supportedLocales.map((locale) => [locale, []])));
  for (const field of ['names', 'descriptions']) {
    for (const item of entity[field] ?? []) {
      const locale = canonicalLocale(item.language);
      const value = field === 'names' ? item.name : item.value;
      if (!supported.has(locale)) continue;
      localeCoverage[locale] += 1;
      const issues = issuesFor(value, locale);
      const decision = fieldDecision(issues);
      const record = {
        reviewVersion: REVIEW_VERSION,
        entityId: entity.id,
        field,
        sourceLanguage: item.language,
        locale,
        value,
        sourceTextHash: await sha256(value),
        translationMethod: 'external-source-label',
        qualityStatus: 'source-only',
        authority: authorities[locale]?.editorial ?? null,
        authorityVariant: authorities[locale]?.variant ?? null,
        issues,
        gate: decision.status,
        publicationEligible: false,
      };
      fieldDecisions.push(record);
      if (decision.status === 'withheld') withheld.push({ entityId: entity.id, locale, field, issues: decision.blockingIssues, value });
      for (const issue of issues.filter((issue) => !WITHHOLD_ISSUES.has(issue))) advisory.push({ entityId: entity.id, locale, field, issue, value });
      if (field === 'names') {
        const nameDecision = {
          reviewVersion: REVIEW_VERSION,
          entityId: entity.id,
          qid: entity.qid ?? null,
          locale,
          sourceLanguage: item.language,
          name: value,
          normalizedName: item.normalizedName ?? null,
          sourceNameType: item.nameType ?? 'label',
          sourceTextHash: record.sourceTextHash,
          scriptGate: decision.status,
          blockingIssues: decision.blockingIssues,
          qualityStatus: 'source-only',
          publicationEligible: false,
          authority: record.authority,
        };
        nameDecisions.push(nameDecision);
        entityLocaleNames.get(entity.id).get(locale).push(nameDecision);
      }
    }
  }
}

for (const entity of entities) {
  const localeMap = entityLocaleNames.get(entity.id);
  for (const locale of supportedLocales) {
    const candidates = localeMap.get(locale);
    const usable = candidates.filter((item) => item.scriptGate === 'candidate');
    let status;
    let action;
    if (candidates.length === 0) {
      status = 'missing';
      action = 'find-or-create-validated-localized-name';
      localeEntityStatus[locale].missing += 1;
    } else if (usable.length === 0) {
      status = 'withheld';
      action = 'replace-invalid-localized-name';
      localeEntityStatus[locale].withheld += 1;
    } else {
      status = 'source-only';
      action = 'verify-localized-name';
      localeEntityStatus[locale].sourceOnly += 1;
    }
    translationQueue.push({
      queueVersion: 1,
      entityId: entity.id,
      qid: entity.qid ?? null,
      locale,
      reason: status,
      action,
      candidateNames: usable.map((item) => item.name),
      rejectedNames: candidates.filter((item) => item.scriptGate === 'withheld').map((item) => ({ name: item.name, issues: item.blockingIssues })),
      authority: authorities[locale]?.editorial ?? null,
      variant: authorities[locale]?.variant ?? null,
      canonicalDisplayEligible: false,
      requiredQuality: policy.translationGate?.autoPublishStatuses ?? ['official','editorial','verified-machine-assisted'],
      doNotFallbackToEnglish: locale !== 'en',
      doNotInventCanonicalName: true,
    });
  }
}

const report = {
  schemaVersion: 1,
  reviewVersion: REVIEW_VERSION,
  agent: 'language-editor',
  lane: 'saints',
  partition: manifest.sourceId,
  sourceRunId: manifest.sourceRunId,
  queryVersion: manifest.queryVersion ?? null,
  sourceFingerprint: manifest.sourceFingerprint,
  generatedAt: new Date().toISOString(),
  publicationAllowed: false,
  targetQualityGate: policy.translationGate,
  entityCount: entities.length,
  reviewedFieldCount: fieldDecisions.length,
  localizedNameDecisionCount: nameDecisions.length,
  localeCoverage,
  localeEntityStatus,
  batchFatalCount: 0,
  criticalCount: 0,
  withheldCount: withheld.length,
  advisoryCount: advisory.length,
  translationQueueCount: translationQueue.length,
  withheld,
  advisory,
  detailFiles: {
    fields: 'linguistic-field-decisions.jsonl',
    localizedNames: 'localized-name-decisions.jsonl',
    translationQueue: 'translation-queue.jsonl',
  },
  policy: {
    localeIsolation: true,
    sourceOnlyIsNotCanonical: true,
    missingLocaleDoesNotBlockOtherLocales: true,
    invalidLocaleNameIsWithheldNotBatchFatal: true,
    englishFallbackBlockedForNonEnglishLocales: true,
  },
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
fs.writeFileSync(path.join(output, 'linguistic-field-decisions.jsonl'), jsonLines(fieldDecisions), 'utf8');
fs.writeFileSync(path.join(output, 'localized-name-decisions.jsonl'), jsonLines(nameDecisions), 'utf8');
fs.writeFileSync(path.join(output, 'translation-queue.jsonl'), jsonLines(translationQueue), 'utf8');
const reviewedManifest = {
  ...manifest,
  stage: 'linguistically-reviewed',
  linguisticReviewVersion: REVIEW_VERSION,
  linguisticReview: 'linguistic-review.json',
  linguisticFieldDecisions: 'linguistic-field-decisions.jsonl',
  localizedNameDecisions: 'localized-name-decisions.jsonl',
  translationQueue: 'translation-queue.jsonl',
  linguisticCriticalCount: 0,
  linguisticWithheldCount: withheld.length,
  linguisticAdvisoryCount: advisory.length,
  translationQueueCount: translationQueue.length,
  publish: false,
};
fs.writeFileSync(path.join(output, 'staging-manifest.json'), `${JSON.stringify(reviewedManifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ entityCount: entities.length, reviewedFieldCount: fieldDecisions.length, localizedNameDecisionCount: nameDecisions.length, localeCoverage, localeEntityStatus, withheldCount: withheld.length, advisoryCount: advisory.length, translationQueueCount: translationQueue.length }, null, 2));

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

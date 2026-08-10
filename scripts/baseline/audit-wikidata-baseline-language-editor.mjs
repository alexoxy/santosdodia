#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/saints-baseline-wikidata.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root, 'config/automation-registry.json'), 'utf8'));
const authorities = JSON.parse(fs.readFileSync(path.join(root, 'data/language-authorities.json'), 'utf8'));
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/linguistic-style-policy.json'), 'utf8'));
const workflowPath = path.join(root, '.github/workflows/review-saints-baseline-language.yml');
const reviewerPath = path.join(root, 'scripts/linguistic/review-normalized-package.mjs');
const errors = [];

const expected = {
  queryVersion: 'recognition-v1',
  normalizationVersion: '1.1',
  languageReviewVersion: '1.1',
  normalizationProgressStream: 'baseline-normalized-progress/saints/v1/wikidata/recognition-v1',
  normalizedStreamPrefix: 'baseline/saints/v1/normalized/wikidata/recognition-v1',
  languageReviewProgressStream: 'baseline-reviewed-progress/saints/v1/wikidata/recognition-v1',
  reviewedStreamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
};
for (const [key, value] of Object.entries(expected)) if (config[key] !== value) errors.push(`Language Editor config ${key} must be ${value}.`);
for (const flag of ['languageReviewReadsDropboxOnly','languageFailuresAreLocaleIsolated','sourceOnlyNamesAreNotCanonical']) {
  if (config.policy?.[flag] !== true) errors.push(`Language Editor policy ${flag} must be true.`);
}
if (config.policy?.productionPublication !== false) errors.push('Language Editor must not publish to production.');

const requiredLocales = ['en','es','pt','fr','fil','ru','sw','de','it','pl'];
if (JSON.stringify(Object.keys(authorities)) !== JSON.stringify(requiredLocales)) errors.push('Language authority registry must retain the ten supported locales in stable order.');
for (const locale of requiredLocales) {
  if (!authorities[locale]?.editorial || !authorities[locale]?.variant || !authorities[locale]?.reference) errors.push(`Language authority ${locale} is incomplete.`);
}
if (!/Priberam/u.test(authorities.pt?.editorial ?? '')) errors.push('Portuguese authority must retain Priberam.');
if (!/Грамота/u.test(authorities.ru?.editorial ?? '')) errors.push('Russian authority must retain Грамота.ру.');
if (policy.translationGate?.blockEnglishFallbackAsTranslation !== true) errors.push('English fallback must remain blocked as a translation for non-English locales.');
if (!policy.translationGate?.autoPublishStatuses?.includes('verified-machine-assisted')) errors.push('Translation gate is missing verified-machine-assisted status.');
if (policy.translationGate?.autoPublishStatuses?.includes('source-only')) errors.push('source-only names must never auto-publish.');

if (!fs.existsSync(workflowPath)) errors.push('Baseline language-editor workflow is missing.');
else {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const needle of [
    "workflows: ['Normalize Saints Baseline v1 candidates']",
    "cron: '53 * * * *'",
    `WIKIDATA_QUERY_VERSION: ${config.queryVersion}`,
    `NORMALIZATION_VERSION: '${config.normalizationVersion}'`,
    `LANGUAGE_REVIEW_VERSION: '${config.languageReviewVersion}'`,
    `NORMALIZATION_PROGRESS_STREAM: ${config.normalizationProgressStream}`,
    `NORMALIZED_STREAM_PREFIX: ${config.normalizedStreamPrefix}`,
    `LANGUAGE_PROGRESS_STREAM: ${config.languageReviewProgressStream}`,
    `REVIEWED_STREAM_PREFIX: ${config.reviewedStreamPrefix}`,
    'npm run dropbox:pull-stream',
    'npm run linguistic:review-package',
    'Archive immutable REVIEWED batch in Dropbox',
    'Advance verified language-review watermark',
  ]) if (!workflow.includes(needle)) errors.push(`Language-editor workflow is missing required contract: ${needle}`);
  for (const forbidden of ['scripts/osint/adapters/', 'wikidata.org', 'OSINT_WIKIDATA_PAGE_SIZE', 'OSINT_WIKIDATA_MAX_PAGES', 'run-manifest.mjs']) {
    if (workflow.includes(forbidden)) errors.push(`Language-editor workflow contains forbidden acquisition dependency: ${forbidden}`);
  }
}

const reviewer = fs.readFileSync(reviewerPath, 'utf8');
for (const needle of [
  "const REVIEW_VERSION = '1.1'",
  "status: blocking.length ? 'withheld' : 'candidate'",
  "publicationEligible: false",
  "required-cyrillic-script-missing",
  "required-latin-script-missing",
  "localized-name-decisions.jsonl",
  "translation-queue.jsonl",
  "missingLocaleDoesNotBlockOtherLocales: true",
  "sourceOnlyIsNotCanonical: true",
  "doNotInventCanonicalName: true",
]) if (!reviewer.includes(needle)) errors.push(`Language reviewer is missing required locale-isolation behavior: ${needle}`);
if (/process\.exitCode\s*=\s*1/u.test(reviewer)) errors.push('Locale-specific language findings must not fail the whole package.');

const task = (registry.tasks ?? []).find((item) => item.id === 'saints-baseline-v1-language-editor');
if (!task) errors.push('Automation registry is missing saints-baseline-v1-language-editor.');
else {
  if (task.mode !== 'scheduled' || JSON.stringify(task.crons) !== JSON.stringify(['53 * * * *'])) errors.push('Language Editor must retain hourly recovery at minute 53 UTC.');
  if (task.publicationMode !== 'staging-only') errors.push('Language Editor must remain staging-only.');
  if (task.archiveStream !== config.reviewedStreamPrefix) errors.push('Language Editor registry archive stream differs from epoch config.');
}

const report = {
  ok: errors.length === 0,
  errors,
  localeCount: requiredLocales.length,
  queryVersion: config.queryVersion,
  normalizationVersion: config.normalizationVersion,
  languageReviewVersion: config.languageReviewVersion,
  reviewedStreamPrefix: config.reviewedStreamPrefix,
  recoveryCron: task?.crons?.[0] ?? null,
  generatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

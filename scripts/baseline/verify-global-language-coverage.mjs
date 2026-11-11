#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

export function verifyGlobalLanguageCoverage(report) {
  if (report?.schemaVersion !== 1 || report?.baselineId !== 'saints-v1' || report?.sourceId !== 'wikidata') throw new Error('Language coverage report has the wrong identity/schema.');
  if (!report.coverageSha256) throw new Error('Language coverage report has no deterministic hash.');
  if (report.sourceOnlyIsNotCanonical !== true) throw new Error('Source-only localized names must remain non-canonical.');
  if (report.englishFallbackBlockedForNonEnglishLocales !== true) throw new Error('Non-English English-fallback guard is missing.');
  if (report.expectedEntityLocalePairs !== report.resolvedEntityLocalePairs) throw new Error('Global language coverage is incomplete.');
  for (const locale of report.supportedLocales ?? []) {
    const value = report.localeCoverage?.[locale];
    if (!value || value.totalIdentities !== report.uniqueIdentityCount) throw new Error(`Locale ${locale} total does not match global identity count.`);
    if (value.sourceOnly + value.missing + value.withheld !== report.uniqueIdentityCount) throw new Error(`Locale ${locale} status partition is incomplete.`);
    if (value.canonicalDisplayReady + value.needsQualityUpgrade !== report.uniqueIdentityCount) throw new Error(`Locale ${locale} quality partition is incomplete.`);
    if (value.freezeLocaleEligible !== (value.canonicalDisplayReady === report.uniqueIdentityCount)) throw new Error(`Locale ${locale} freeze gate is inconsistent.`);
  }
  const expectedGlobal = (report.supportedLocales ?? []).every((locale) => report.localeCoverage[locale].freezeLocaleEligible === true);
  if (report.freezeLanguageGateEligible !== expectedGlobal) throw new Error('Global language freeze gate is inconsistent.');
  return report;
}

function main() {
  const reportPath = argument('--report');
  if (!reportPath) throw new Error('--report is required.');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  verifyGlobalLanguageCoverage(report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Global language coverage verification failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

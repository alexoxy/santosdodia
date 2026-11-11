#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonLines(file) { return fs.readFileSync(file, 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function unique(values) { return [...new Set(values)]; }

function findNamedFiles(root, target, found = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) findNamedFiles(absolute, target, found);
    else if (entry.isFile() && entry.name === target) found.push(absolute);
  }
  return found;
}

export function buildGlobalLanguageCoverage({ identityLedger, queueRecords, supportedLocales, languageCoverageVersion = '1.0' } = {}) {
  if (!Array.isArray(identityLedger) || identityLedger.length === 0) throw new Error('Identity ledger is required.');
  if (!Array.isArray(queueRecords) || queueRecords.length === 0) throw new Error('Translation queue records are required.');
  if (!Array.isArray(supportedLocales) || supportedLocales.length === 0) throw new Error('Supported locales are required.');
  if (unique(supportedLocales).length !== supportedLocales.length) throw new Error('Supported locales contain duplicates.');

  const identities = new Map();
  for (const identity of identityLedger) {
    if (!identity?.entityId || !identity?.qid) throw new Error('Identity ledger contains an invalid identity.');
    if (identities.has(identity.entityId)) throw new Error(`Duplicate identity ledger entity: ${identity.entityId}.`);
    identities.set(identity.entityId, identity);
  }
  const supported = new Set(supportedLocales);
  const byEntityLocale = new Map();
  for (const record of queueRecords) {
    if (!record?.entityId || !record?.locale) throw new Error('Translation queue record is missing entity/locale.');
    if (!identities.has(record.entityId)) throw new Error(`Translation queue references unknown identity ${record.entityId}.`);
    if (!supported.has(record.locale)) throw new Error(`Translation queue contains unsupported locale ${record.locale}.`);
    if (!['missing', 'withheld', 'source-only'].includes(record.reason)) throw new Error(`Unknown translation queue reason ${record.reason}.`);
    if (record.qid && identities.get(record.entityId).qid !== record.qid) throw new Error(`Translation queue QID mismatch for ${record.entityId}.`);
    const key = `${record.entityId}\u0000${record.locale}`;
    const list = byEntityLocale.get(key) ?? [];
    list.push(record);
    byEntityLocale.set(key, list);
  }

  const localeCoverage = Object.fromEntries(supportedLocales.map((locale) => [locale, {
    totalIdentities: identities.size,
    sourceOnly: 0,
    missing: 0,
    withheld: 0,
    canonicalDisplayReady: 0,
    needsQualityUpgrade: 0,
  }]));
  const withheld = [];
  let resolvedEntityLocalePairs = 0;

  for (const identity of identities.values()) {
    for (const locale of supportedLocales) {
      const records = byEntityLocale.get(`${identity.entityId}\u0000${locale}`) ?? [];
      if (records.length === 0) throw new Error(`Missing translation queue coverage for ${identity.entityId}/${locale}.`);
      resolvedEntityLocalePairs += 1;
      const canonicalReady = records.some((record) => record.canonicalDisplayEligible === true);
      const sourceOnly = records.some((record) => record.reason === 'source-only');
      const withheldOnly = !sourceOnly && records.some((record) => record.reason === 'withheld');
      const summary = localeCoverage[locale];
      if (canonicalReady) summary.canonicalDisplayReady += 1;
      if (sourceOnly) summary.sourceOnly += 1;
      else if (withheldOnly) summary.withheld += 1;
      else summary.missing += 1;
      if (!canonicalReady) summary.needsQualityUpgrade += 1;
      if (withheldOnly) {
        withheld.push({
          entityId: identity.entityId,
          qid: identity.qid,
          locale,
          rejectedNames: unique(records.flatMap((record) => (record.rejectedNames ?? []).map((item) => item.name)).filter(Boolean)),
          blockingIssues: unique(records.flatMap((record) => (record.rejectedNames ?? []).flatMap((item) => item.issues ?? []))),
        });
      }
    }
  }

  for (const locale of supportedLocales) {
    const summary = localeCoverage[locale];
    if (summary.sourceOnly + summary.missing + summary.withheld !== identities.size) throw new Error(`Locale ${locale} coverage does not partition all identities.`);
    summary.sourceLabelCoveragePercent = Number(((summary.sourceOnly / identities.size) * 100).toFixed(2));
    summary.canonicalDisplayReadyPercent = Number(((summary.canonicalDisplayReady / identities.size) * 100).toFixed(2));
    summary.freezeLocaleEligible = summary.canonicalDisplayReady === identities.size;
  }

  const stablePayload = {
    languageCoverageVersion,
    uniqueIdentityCount: identities.size,
    supportedLocales,
    localeCoverage,
    withheld,
  };
  const coverageSha256 = sha256(JSON.stringify(stablePayload));
  return {
    schemaVersion: 1,
    languageCoverageVersion,
    baselineId: 'saints-v1',
    sourceId: 'wikidata',
    queryVersion: 'recognition-v1',
    generatedAt: new Date().toISOString(),
    uniqueIdentityCount: identities.size,
    supportedLocaleCount: supportedLocales.length,
    supportedLocales,
    inputQueueRecordCount: queueRecords.length,
    resolvedEntityLocalePairs,
    expectedEntityLocalePairs: identities.size * supportedLocales.length,
    localeCoverage,
    withheldCount: withheld.length,
    withheld,
    sourceOnlyIsNotCanonical: true,
    englishFallbackBlockedForNonEnglishLocales: true,
    freezeLanguageGateEligible: supportedLocales.every((locale) => localeCoverage[locale].freezeLocaleEligible),
    coverageSha256,
  };
}

function main() {
  const identityLedgerPath = argument('--identity-ledger');
  const reviewedRoot = argument('--reviewed-root');
  const output = argument('--output');
  if (!identityLedgerPath || !reviewedRoot || !output) throw new Error('--identity-ledger, --reviewed-root and --output are required.');
  const authorities = readJson(argument('--language-authorities', 'data/language-authorities.json'));
  const supportedLocales = Object.keys(authorities);
  const queueFiles = findNamedFiles(reviewedRoot, 'translation-queue.jsonl').sort();
  if (queueFiles.length === 0) throw new Error('No translation queue files were found in reviewed baseline batches.');
  const report = buildGlobalLanguageCoverage({
    identityLedger: readJsonLines(identityLedgerPath),
    queueRecords: queueFiles.flatMap((file) => readJsonLines(file)),
    supportedLocales,
    languageCoverageVersion: argument('--version', '1.0'),
  });
  const resolved = path.resolve(output);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Global language coverage failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

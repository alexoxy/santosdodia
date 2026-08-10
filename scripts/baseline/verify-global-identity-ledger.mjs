#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

export function verifyGlobalIdentityLedger({ manifest, report } = {}) {
  if (manifest?.stage !== 'global-candidate-identity-ledger' || manifest?.mode !== 'staging' || manifest?.publish !== false) {
    throw new Error('Identity ledger publication boundary is open.');
  }
  if (!manifest.rootSha256 || manifest.rootSha256 !== report?.rootSha256) throw new Error('Identity root hash mismatch.');
  if (report.nameOnlyMergeCount !== 0) throw new Error('Name-only identity merges are forbidden.');
  if (report.exactExternalIdentifierResolutionCount !== report.uniqueIdentityCount) {
    throw new Error('Every Wikidata candidate identity must resolve by its exact external identifier.');
  }
  if (!Number.isSafeInteger(report.uniqueIdentityCount) || report.uniqueIdentityCount < 1) throw new Error('Identity ledger has no valid unique identity count.');
  if (!Number.isSafeInteger(report.identityConflictCount) || report.identityConflictCount < 0) throw new Error('Identity conflict count is invalid.');
  return report;
}

function main() {
  const manifestPath = argument('--manifest');
  const reportPath = argument('--report');
  if (!manifestPath || !reportPath) throw new Error('--manifest and --report are required.');
  const report = verifyGlobalIdentityLedger({ manifest: readJson(manifestPath), report: readJson(reportPath) });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`Global identity ledger verification failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

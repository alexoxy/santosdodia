#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposeLiturgicalPersonLinks } from './propose-liturgical-person-links.mjs';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }

export function auditNavigationReadiness(source, { requireFreeze = false } = {}) {
  if (source?.schemaVersion !== 1 || !source?.identityRootSha256 || !source?.readiness || !Array.isArray(source?.people)) throw new Error('Navigation source has the wrong schema.');
  if (source.publicationAllowed !== false || source.productionMutation !== false) throw new Error('Navigation source opened a production/publication gate.');
  const errors = [];
  const warnings = [];
  const r = source.readiness;
  if (r.identityCount !== source.people.length) errors.push('identityCount differs from people length');
  if (r.profiles?.count > r.identityCount || r.labelEntities?.count > r.identityCount) errors.push('enrichment coverage exceeds identity count');
  if (r.dailySaints?.dayCount > 366) errors.push('daily saint coverage exceeds 366 civil days');
  if (!r.profiles?.complete) warnings.push(`profile enrichment partial: ${r.profiles?.count ?? 0}/${r.identityCount}`);
  if (!r.labelEntities?.complete) warnings.push(`multilingual label enrichment partial: ${r.labelEntities?.count ?? 0}/${r.identityCount}`);
  if (!r.dailySaints?.complete) warnings.push(`daily saint sweep partial: ${r.dailySaints?.dayCount ?? 0}/${r.dailySaints?.expectedDays ?? 'unknown'}`);
  for (const [locale, coverage] of Object.entries(r.labelsByLocale ?? {})) {
    if (coverage.count > coverage.total || coverage.total !== r.identityCount) errors.push(`invalid ${locale} label coverage denominator`);
  }
  const freezeReady = errors.length === 0 && r.profiles?.complete === true && r.labelEntities?.complete === true && r.dailySaints?.complete === true;
  if (requireFreeze && !freezeReady) errors.push('navigation dataset is not freeze-ready');
  const liturgicalLinkReview = Array.isArray(source.unlinkedObservances)
    ? proposeLiturgicalPersonLinks(source)
    : {
        schemaVersion: 1,
        locale: 'pt',
        policy: { nameOnlyIdentityMergeForbidden: true, proposalsAreEvidenceNotDecisions: true, explicitReviewRequired: true, publicationAllowed: false, productionMutation: false },
        stats: { people: source.people.length, observances: 0, uniqueCandidates: 0, ambiguous: 0, unmatched: 0, alreadyLinked: 0 },
        proposals: []
      };
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    identityRootSha256: source.identityRootSha256,
    datasetVersion: source.datasetVersion,
    status: errors.length ? 'blocked' : freezeReady ? 'freeze-ready' : 'partial-staging',
    freezeReady,
    publicationAllowed: false,
    productionMutation: false,
    errors,
    warnings,
    readiness: r,
    liturgicalLinkReview
  };
}

function main() {
  const input = argument('--input'); const output = argument('--output'); if (!input) throw new Error('--input is required.');
  const report = auditNavigationReadiness(JSON.parse(fs.readFileSync(path.resolve(input), 'utf8')), { requireFreeze: process.argv.includes('--require-freeze') });
  const body = `${JSON.stringify(report, null, 2)}\n`; if (output) { fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(path.resolve(output), body, 'utf8'); } process.stdout.write(body); if (report.errors.length) process.exitCode = 1;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }

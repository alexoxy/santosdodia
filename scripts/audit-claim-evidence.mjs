import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const observancesPath = resolve(root, 'data/observances.ts');
const evidencePath = resolve(root, 'data/editorial-claim-evidence.json');

const [observancesSource, evidenceSource] = await Promise.all([
  readFile(observancesPath, 'utf8'),
  readFile(evidencePath, 'utf8')
]);

const observanceIds = new Set(
  [...observancesSource.matchAll(/entry\(\s*['"]([^'"]+)['"]/g)].map(match => match[1])
);

let document;
try {
  document = JSON.parse(evidenceSource);
} catch (error) {
  console.error(`Invalid editorial evidence JSON: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const seenClaims = new Set();
const evidence = Array.isArray(document.evidence) ? document.evidence : [];

if (document.schemaVersion !== 1) errors.push('Unsupported or missing schemaVersion.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(document.reviewedAt ?? '')) errors.push('Document reviewedAt must use YYYY-MM-DD.');

for (const [index, item] of evidence.entries()) {
  const label = `evidence[${index}]`;
  if (!observanceIds.has(item.observanceId)) errors.push(`${label}: unknown observanceId ${item.observanceId ?? '<missing>'}`);
  if (typeof item.claimType !== 'string' || !item.claimType.trim()) errors.push(`${label}: missing claimType`);
  if (typeof item.claimValue !== 'string' || !item.claimValue.trim()) errors.push(`${label}: missing claimValue`);
  if (!['corroborated', 'disputed', 'rejected'].includes(item.status)) errors.push(`${label}: invalid status ${item.status ?? '<missing>'}`);

  const claimKey = `${item.observanceId}|${item.claimType}|${item.claimValue}`;
  if (seenClaims.has(claimKey)) errors.push(`${label}: duplicate claim evidence`);
  seenClaims.add(claimKey);

  const source = item.source ?? {};
  if (typeof source.name !== 'string' || !source.name.trim()) errors.push(`${label}: missing source name`);
  if (source.kind !== 'official' && source.kind !== 'scholarly') warnings.push(`${label}: source is not classified official or scholarly`);
  try {
    const url = new URL(source.url);
    if (url.protocol !== 'https:') errors.push(`${label}: source URL must use HTTPS`);
  } catch {
    errors.push(`${label}: invalid source URL`);
  }

  if (!Array.isArray(item.unresolvedClaims)) errors.push(`${label}: unresolvedClaims must be an array`);
  if (item.status === 'corroborated' && item.unresolvedClaims?.length) {
    warnings.push(`${label}: corroborated claim has ${item.unresolvedClaims.length} explicitly unresolved related claims`);
  }
}

const reviewedObservances = new Set(evidence.map(item => item.observanceId).filter(Boolean));
const report = {
  schemaVersion: document.schemaVersion,
  reviewedAt: document.reviewedAt,
  evidenceCount: evidence.length,
  reviewedObservanceCount: reviewedObservances.size,
  unresolvedClaimCount: evidence.reduce((total, item) => total + (Array.isArray(item.unresolvedClaims) ? item.unresolvedClaims.length : 0), 0),
  errors,
  warnings
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

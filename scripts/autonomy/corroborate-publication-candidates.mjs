#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
function normalizeSpace(value) { return String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim(); }
function normalizeValue(claimClass, value) {
  const raw = normalizeSpace(value);
  if (claimClass === 'localized-source-label') return raw.toLocaleLowerCase('und');
  if (claimClass === 'birth-date' || claimClass === 'death-date') return raw.slice(0, 10);
  return raw.toLocaleLowerCase('und');
}
function identityMatches(claim, evidence) {
  const pairs = [
    ['entityId', claim.entityId, evidence.entityId],
    ['qid', claim.qid, evidence.qid],
    ['observanceId', claim.observanceId, evidence.observanceId],
  ];
  const comparable = pairs.filter(([, left, right]) => left && right);
  return comparable.length > 0 && comparable.some(([, left, right]) => left === right);
}
function sourceByIdOrUrl(sourceRegistry, sourceId, sourceUrl) {
  if (sourceId) {
    const exact = sourceRegistry.sources.find((item) => item.id === sourceId);
    if (exact) return exact;
  }
  if (!sourceUrl) return null;
  let host;
  try { host = new URL(sourceUrl).hostname.replace(/^www\./u, ''); } catch { return null; }
  return sourceRegistry.sources.find((item) => {
    try { return new URL(item.url).hostname.replace(/^www\./u, '') === host; } catch { return false; }
  }) ?? null;
}
function authorityIsFirstParty(source) {
  return source?.authorityClass === 'A1' || source?.authorityClass === 'A2';
}
function genericEvidence(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const value = readJson(filePath);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.evidence)) return value.evidence;
  return [];
}
function editorialEvidence(filePath, sourceRegistry) {
  if (!fs.existsSync(filePath)) return [];
  const value = readJson(filePath);
  const records = Array.isArray(value.evidence) ? value.evidence : [];
  return records.flatMap((record) => {
    if (record.status !== 'corroborated' || !record.source?.url) return [];
    const source = sourceByIdOrUrl(sourceRegistry, record.source.catalogSourceId, record.source.url);
    if (!source) return [];
    let claimClass = null;
    if (record.claimType === 'observance-name-and-date' || record.claimType === 'observance-name-date-and-local-rank') claimClass = 'feast-or-observance-link';
    if (!claimClass) return [];
    return [{
      observanceId: record.observanceId,
      claimClass,
      value: record.claimValue,
      sourceId: record.source.catalogSourceId ?? source.id,
      sourceUrl: record.source.url,
      independenceGroup: new URL(record.source.url).hostname.replace(/^www\./u, ''),
      authorityScore: source.authorityScore,
      verified: true,
      firstParty: authorityIsFirstParty(source),
      evidenceKind: 'reviewed-editorial-claim-evidence',
    }];
  });
}
function directoryEvidence(directory) {
  if (!directory || !fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => genericEvidence(path.join(directory, name)));
}
function validateEvidence(item, sourceRegistry, policy) {
  const source = sourceByIdOrUrl(sourceRegistry, item.sourceId, item.sourceUrl);
  if (!source) return null;
  if (item.verified !== true) return null;
  if (!item.claimClass || item.value === undefined || item.value === null) return null;
  if (![item.entityId, item.qid, item.observanceId].some(Boolean)) return null;
  const authorityScore = Math.min(Number(item.authorityScore ?? source.authorityScore ?? 0), Number(source.authorityScore ?? 0));
  if (!Number.isFinite(authorityScore) || authorityScore < policy.matching.minimumAuthorityScore) return null;
  let independenceGroup = normalizeSpace(item.independenceGroup);
  if (!independenceGroup) {
    try { independenceGroup = new URL(item.sourceUrl ?? source.url).hostname.replace(/^www\./u, ''); } catch { return null; }
  }
  return {
    ...item,
    sourceId: normalizeSpace(item.sourceId) || source.id,
    authoritySourceId: source.id,
    sourceUrl: item.sourceUrl ?? source.url,
    independenceGroup,
    authorityScore,
    firstParty: item.firstParty === true || authorityIsFirstParty(source),
  };
}

export function corroborateClaims({ queue, decisions, evidence, policy, sourceRegistry }) {
  if (policy.mode !== 'shadow-corroboration' || policy.productionWriteAllowed !== false) {
    throw new Error('Corroboration must remain shadow-only.');
  }
  const originSourceId = decisions?.source?.sourceId ?? null;
  const validatedEvidence = evidence.map((item) => validateEvidence(item, sourceRegistry, policy)).filter(Boolean);
  const corroborated = [];
  const pending = [];
  const conflicts = [];

  for (const claim of queue.items ?? []) {
    const candidates = validatedEvidence.filter((item) => item.claimClass === claim.claimClass
      && identityMatches(claim, item)
      && item.sourceId !== originSourceId
      && item.authoritySourceId !== originSourceId);
    const expected = normalizeValue(claim.claimClass, claim.value ?? claim.name ?? '');
    const matching = candidates.filter((item) => normalizeValue(claim.claimClass, item.value) === expected);
    const exclusiveValue = (policy.matching.exclusiveValueClaimClasses ?? []).includes(claim.claimClass);
    const disagreeing = exclusiveValue
      ? candidates.filter((item) => normalizeValue(claim.claimClass, item.value) !== expected)
      : [];

    if (disagreeing.length) {
      conflicts.push({
        ...claim,
        disposition: 'human-review-required',
        reason: 'verified-independent-source-conflict',
        expectedValue: claim.value ?? claim.name ?? null,
        conflictingEvidence: disagreeing.map(compactEvidence),
        matchingEvidence: matching.map(compactEvidence),
      });
      continue;
    }

    const independentGroups = new Set(matching.map((item) => item.independenceGroup));
    const firstPartyMatches = matching.filter((item) => item.firstParty === true);
    const singleFirstPartyAllowed = policy.matching.allowSingleFirstPartyAuthority === true
      && policy.matching.singleFirstPartyClaimClasses.includes(claim.claimClass)
      && !policy.matching.neverSingleSourceClaimClasses.includes(claim.claimClass)
      && firstPartyMatches.length >= 1;
    const multiSourceAllowed = independentGroups.size >= policy.matching.minimumIndependentSources;

    if (multiSourceAllowed || singleFirstPartyAllowed) {
      corroborated.push({
        ...claim,
        disposition: 'corroborated-shadow',
        productionWriteAllowed: false,
        corroborationRule: multiSourceAllowed ? 'independent-multi-source' : 'authoritative-first-party',
        independentSourceCount: independentGroups.size,
        evidence: matching.map(compactEvidence),
      });
    } else {
      pending.push({
        ...claim,
        disposition: 'cross-check-required',
        reason: matching.length ? 'insufficient-independent-evidence' : 'no-matching-independent-evidence',
        matchingEvidence: matching.map(compactEvidence),
        independentSourceCount: independentGroups.size,
      });
    }
  }

  return {
    schemaVersion: 1,
    mode: policy.mode,
    productionWriteAllowed: false,
    originSourceId,
    summary: {
      inputClaims: (queue.items ?? []).length,
      validatedEvidence: validatedEvidence.length,
      corroborated: corroborated.length,
      pending: pending.length,
      conflicts: conflicts.length,
    },
    corroborated,
    pending,
    conflicts,
  };
}

function compactEvidence(item) {
  return {
    sourceId: item.sourceId,
    authoritySourceId: item.authoritySourceId,
    sourceUrl: item.sourceUrl,
    independenceGroup: item.independenceGroup,
    authorityScore: item.authorityScore,
    firstParty: item.firstParty === true,
    value: item.value,
    evidenceKind: item.evidenceKind ?? 'generic',
  };
}

function main() {
  const input = path.resolve(argument('--input', 'staging/publication-decisions/saints/wikidata'));
  const output = path.resolve(argument('--output', 'staging/corroboration/saints/wikidata'));
  const evidenceDir = path.resolve(argument('--evidence-dir', 'data/corroboration-evidence'));
  const editorialEvidencePath = path.resolve(argument('--editorial-evidence', 'data/editorial-claim-evidence.json'));
  const policy = readJson(path.resolve(argument('--policy', 'config/corroboration-policy.json')));
  const sourceRegistry = readJson(path.resolve(argument('--source-registry', 'data/source-registry/seed.json')));
  const queue = readJson(path.join(input, 'cross-check-queue.json'));
  const decisions = readJson(path.join(input, 'publication-decisions.json'));
  const evidence = [
    ...directoryEvidence(evidenceDir),
    ...editorialEvidence(editorialEvidencePath, sourceRegistry),
  ];
  const result = corroborateClaims({ queue, decisions, evidence, policy, sourceRegistry });
  const generatedAt = new Date().toISOString();
  writeJson(path.join(output, 'corroboration-report.json'), { ...result, generatedAt });
  writeJson(path.join(output, 'corroborated-shadow.json'), { schemaVersion: 1, generatedAt, productionWriteAllowed: false, items: result.corroborated });
  writeJson(path.join(output, 'pending-cross-check.json'), { schemaVersion: 1, generatedAt, items: result.pending });
  writeJson(path.join(output, 'human-review-conflicts.json'), { schemaVersion: 1, generatedAt, items: result.conflicts });
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const occurrenceSourcePath = path.join(root, 'data', 'canonical-occurrence-anchors.json');
const observanceSourcePath = path.join(root, 'data', 'canonical-observance-anchors.json');
const jurisdictionSourcePath = path.join(root, 'data', 'canonical-jurisdiction-anchors.json');
const ecclesialSourcePath = path.join(root, 'data', 'canonical-ecclesial-context-anchors.json');
const bridgeSourcePath = path.join(root, 'data', 'canonical-occurrence-legacy-bridges.json');

const ID_PATTERN = /^occurrence:\d{4}-\d{2}-\d{2}:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/u;
const CHURCH_ID_PATTERN = /^church:[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const JURISDICTION_ID_PATTERN = /^jurisdiction:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/u;
const ALLOWED_RANKS = new Set(['solemnity', 'feast', 'obligatory-memorial', 'optional-memorial', 'commemoration', 'ferial', 'other']);
const SOURCE_RANK_MAP = new Map([
  ['SOLENIDADE', 'solemnity'],
  ['FESTA', 'feast'],
  ['MO', 'obligatory-memorial'],
  ['MF', 'optional-memorial']
]);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function hostname(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./u, ''); }
  catch { return ''; }
}

function assertValidDateISO(dateISO, expectedYear) {
  assert(/^\d{4}-\d{2}-\d{2}$/u.test(dateISO ?? ''), `Invalid occurrence dateISO: ${String(dateISO)}.`);
  const [year, month, day] = dateISO.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  assert(value.getUTCFullYear() === year && value.getUTCMonth() === month - 1 && value.getUTCDate() === day, `Occurrence dateISO is not a real civil date: ${dateISO}.`);
  assert(year === expectedYear, `Occurrence date ${dateISO} does not match declared year ${expectedYear}.`);
}

export function buildCanonicalOccurrenceVaultRelease(dataset, observanceDataset, jurisdictionDataset, ecclesialDataset, bridgeDataset, { sourceBytes = null, bridgeBytes = null, sourceCommit = null, generatedAt = null } = {}) {
  assert(dataset?.schemaVersion === 1, 'Canonical occurrence dataset schemaVersion must be 1.');
  assert(dataset?.occurrenceModelVersion === '1.0', 'Canonical occurrence modelVersion must be 1.0.');
  assert(dataset?.status === 'repository-reviewed-occurrence-anchors', 'Canonical occurrence dataset is not repository-reviewed.');
  assert(Array.isArray(dataset?.occurrences) && dataset.occurrences.length > 0, 'Canonical occurrence dataset is empty.');
  assert(observanceDataset?.schemaVersion === 1 && observanceDataset?.status === 'repository-reviewed-observance-anchors' && Array.isArray(observanceDataset?.observances), 'Canonical Observance dataset is required for Occurrence validation.');
  assert(jurisdictionDataset?.schemaVersion === 1 && jurisdictionDataset?.status === 'repository-reviewed-jurisdiction-anchors' && Array.isArray(jurisdictionDataset?.jurisdictions), 'Canonical Jurisdiction dataset is required for Occurrence validation.');
  assert(ecclesialDataset?.schemaVersion === 1 && ecclesialDataset?.status === 'repository-reviewed-ecclesial-context-anchors' && Array.isArray(ecclesialDataset?.contexts), 'Canonical ecclesial context dataset is required for Occurrence validation.');
  assert(bridgeDataset?.schemaVersion === 1 && bridgeDataset?.status === 'repository-reviewed-read-only-compatibility-bridge' && bridgeDataset?.mutationAllowed === false && Array.isArray(bridgeDataset?.bridges), 'Read-only legacy Occurrence bridge is required.');

  const observances = new Map(observanceDataset.observances.map((item) => [item.id, item]));
  const jurisdictions = new Map(jurisdictionDataset.jurisdictions.map((item) => [item.id, item]));
  const churches = new Map(ecclesialDataset.contexts.filter((item) => item.kind === 'church').map((item) => [item.id, item]));
  const ids = new Set();
  const canonicalKeys = new Set();
  const churchCoverage = new Set();
  const jurisdictionCoverage = new Set();
  const yearCoverage = new Set();
  const canonicalOccurrences = [];

  for (const raw of dataset.occurrences) {
    assert(ID_PATTERN.test(raw?.id ?? ''), `Invalid Occurrence id: ${String(raw?.id)}.`);
    assert(!ids.has(raw.id), `Duplicate Occurrence id: ${raw.id}.`);
    ids.add(raw.id);
    const observance = observances.get(raw?.observanceId);
    assert(observance, `${raw.id} references unknown canonical Observance ${String(raw?.observanceId)}.`);
    assert(CHURCH_ID_PATTERN.test(raw?.churchId ?? '') && churches.has(raw.churchId), `${raw.id} references unknown canonical Church ${String(raw?.churchId)}.`);
    assert(observance.churchId === raw.churchId, `${raw.id} Church does not match its canonical Observance.`);
    assert(JURISDICTION_ID_PATTERN.test(raw?.jurisdictionId ?? '') && jurisdictions.has(raw.jurisdictionId), `${raw.id} references unknown canonical Jurisdiction ${String(raw?.jurisdictionId)}.`);
    const jurisdiction = jurisdictions.get(raw.jurisdictionId);
    assert(jurisdiction.churchId === raw.churchId, `${raw.id} Jurisdiction belongs to a different Church.`);
    assert(Number.isInteger(raw?.year) && raw.year >= 1900 && raw.year <= 2200, `${raw.id} has unsupported year ${String(raw?.year)}.`);
    assertValidDateISO(raw?.dateISO, raw.year);
    assert(typeof raw?.calendarSystem === 'string' && raw.calendarSystem.length > 0, `${raw.id} requires calendarSystem.`);
    assert((jurisdiction.calendarSystems ?? []).includes(raw.calendarSystem), `${raw.id} calendarSystem ${raw.calendarSystem} is not valid for its Jurisdiction.`);
    const church = churches.get(raw.churchId);
    assert((church.calendarSystems ?? []).includes(raw.calendarSystem), `${raw.id} calendarSystem ${raw.calendarSystem} is not valid for its Church.`);
    assert(ALLOWED_RANKS.has(raw?.rank), `${raw.id} has unsupported rank ${String(raw?.rank)}.`);
    assert(typeof raw?.sourceRankCode === 'string' && SOURCE_RANK_MAP.get(raw.sourceRankCode) === raw.rank, `${raw.id} source rank ${String(raw?.sourceRankCode)} does not map to canonical rank ${String(raw?.rank)}.`);
    assert(/^\d{4}-\d{2}-\d{2}$/u.test(raw?.verifiedAt ?? ''), `${raw.id} has invalid verifiedAt.`);

    const key = `${raw.observanceId}\u0000${raw.jurisdictionId}\u0000${raw.calendarSystem}\u0000${raw.dateISO}`;
    assert(!canonicalKeys.has(key), `${raw.id} duplicates canonical Occurrence state.`);
    canonicalKeys.add(key);

    const allowedDomains = new Set((jurisdiction.authorityDomains ?? []).map((value) => String(value).toLowerCase().replace(/^www\./u, '')));
    assert(allowedDomains.size > 0, `${raw.id} Jurisdiction has no reviewed authority domains.`);
    assert(Array.isArray(raw.evidence) && raw.evidence.length > 0, `${raw.id} requires official Occurrence evidence.`);
    const evidence = raw.evidence.map((item, index) => {
      assert(typeof item?.publisher === 'string' && item.publisher.trim().length > 0, `${raw.id} evidence ${index} requires a publisher.`);
      assert(typeof item?.url === 'string' && item.url.startsWith('https://'), `${raw.id} evidence ${index} requires an HTTPS URL.`);
      const evidenceHost = hostname(item.url);
      assert(allowedDomains.has(evidenceHost), `${raw.id} evidence ${index} domain ${evidenceHost || '(invalid)'} is outside canonical Jurisdiction authority domains.`);
      assert(Array.isArray(item?.claimTypes), `${raw.id} evidence ${index} requires claimTypes.`);
      for (const claimType of ['annual-date', 'jurisdictional-observance', 'liturgical-rank']) {
        assert(item.claimTypes.includes(claimType), `${raw.id} evidence ${index} must support ${claimType}.`);
      }
      assert(typeof item?.observedDesignation === 'string' && item.observedDesignation.trim().length > 0, `${raw.id} evidence ${index} requires observedDesignation.`);
      return {
        publisher: item.publisher.trim(),
        url: item.url,
        claimTypes: sortedUnique(item.claimTypes.map((value) => String(value))),
        observedDesignation: item.observedDesignation.trim()
      };
    }).sort((left, right) => left.url.localeCompare(right.url));

    canonicalOccurrences.push({
      schemaVersion: 1,
      occurrenceId: raw.id,
      entityType: 'Occurrence',
      observanceId: raw.observanceId,
      churchId: raw.churchId,
      jurisdictionId: raw.jurisdictionId,
      calendarSystem: raw.calendarSystem,
      year: raw.year,
      dateISO: raw.dateISO,
      rank: raw.rank,
      sourceRankCode: raw.sourceRankCode,
      resolutionStatus: 'canonical-anchor',
      evidence,
      verifiedAt: raw.verifiedAt,
      deletionPolicy: 'tombstone-only'
    });
    churchCoverage.add(raw.churchId);
    jurisdictionCoverage.add(raw.jurisdictionId);
    yearCoverage.add(raw.year);
  }

  canonicalOccurrences.sort((left, right) => left.occurrenceId.localeCompare(right.occurrenceId));
  const occurrenceById = new Map(canonicalOccurrences.map((item) => [item.occurrenceId, item]));
  assert(bridgeDataset.legacyReleaseId === 'roman-catholic-pt-2026-v2', 'Occurrence compatibility bridge must target the reviewed Portugal v2 release.');
  assert(bridgeDataset.bridges.length === canonicalOccurrences.length, 'Every bootstrap Occurrence must have exactly one read-only legacy bridge.');
  const bridgeOccurrenceIds = new Set();
  const legacyOccurrenceBridges = bridgeDataset.bridges.map((bridge) => {
    assert(!bridgeOccurrenceIds.has(bridge?.occurrenceId), `Duplicate legacy bridge for ${String(bridge?.occurrenceId)}.`);
    bridgeOccurrenceIds.add(bridge.occurrenceId);
    const occurrence = occurrenceById.get(bridge?.occurrenceId);
    assert(occurrence, `Legacy bridge references unknown canonical Occurrence ${String(bridge?.occurrenceId)}.`);
    assert(bridge.dateISO === occurrence.dateISO, `Legacy bridge ${bridge.occurrenceId} date differs from canonical Occurrence.`);
    assert(/^rc:[A-Za-z0-9]+$/u.test(bridge?.legacyObservanceId ?? ''), `Legacy bridge ${bridge.occurrenceId} has invalid legacyObservanceId.`);
    return {
      schemaVersion: 1,
      occurrenceId: bridge.occurrenceId,
      legacyReleaseId: bridgeDataset.legacyReleaseId,
      legacyObservanceId: bridge.legacyObservanceId,
      dateISO: bridge.dateISO,
      bridgeType: 'read-only-compatibility',
      mutationAllowed: false
    };
  }).sort((left, right) => left.occurrenceId.localeCompare(right.occurrenceId));

  const stablePayload = {
    schemaVersion: 1,
    artifactType: 'canonical-liturgical-occurrences',
    occurrenceModelVersion: dataset.occurrenceModelVersion,
    occurrences: canonicalOccurrences,
    legacyOccurrenceBridges
  };
  const rootSha256 = sha256(JSON.stringify(stablePayload));
  const releaseRoot = `/vault/canonical/occurrences/v1/releases/${rootSha256}`;
  const sourceSha256 = sha256(sourceBytes ?? JSON.stringify(dataset));
  const bridgeSha256 = sha256(bridgeBytes ?? JSON.stringify(bridgeDataset));

  const manifest = {
    schemaVersion: 1,
    artifactType: 'canonical-liturgical-occurrences',
    vaultLayer: 'canonical',
    occurrenceModelVersion: dataset.occurrenceModelVersion,
    releaseId: `canonical-occurrences-v1-${rootSha256.slice(0, 16)}`,
    rootSha256,
    sourceDataset: 'data/canonical-occurrence-anchors.json',
    observanceDataset: 'data/canonical-observance-anchors.json',
    jurisdictionDataset: 'data/canonical-jurisdiction-anchors.json',
    ecclesialContextDataset: 'data/canonical-ecclesial-context-anchors.json',
    compatibilityBridgeDataset: 'data/canonical-occurrence-legacy-bridges.json',
    occurrenceCount: canonicalOccurrences.length,
    legacyBridgeCount: legacyOccurrenceBridges.length,
    churches: [...churchCoverage].sort(),
    jurisdictions: [...jurisdictionCoverage].sort(),
    years: [...yearCoverage].sort((left, right) => left - right),
    runtimePublicationAllowed: false,
    productionMutationAllowed: false,
    immutableReleaseRoot: releaseRoot,
    currentPointerPath: '/vault/canonical/occurrences/v1/current.json',
    deletionPolicy: 'tombstone-only',
    semantics: {
      occurrenceBindsObservanceToConcreteContext: true,
      canonicalObservanceReferenceRequired: true,
      canonicalJurisdictionReferenceRequired: true,
      churchMustMatchObservanceAndJurisdiction: true,
      calendarMustMatchChurchAndJurisdiction: true,
      annualDateIsAuthorityDriven: true,
      rankIsAuthorityDriven: true,
      evidenceMustMatchJurisdictionAuthorityDomain: true,
      legacyBridgeIsNonCanonicalAndReadOnly: true
    },
    d1Projection: {
      status: 'equivalence-shadow-only',
      targetLegacyRelease: bridgeDataset.legacyReleaseId,
      mutationAllowed: false,
      reason: 'Bootstrap Occurrences prove semantic equivalence against reviewed Portugal v2 rows before any schema or production migration.'
    },
    files: {
      occurrences: 'occurrences.json',
      legacyOccurrenceBridges: 'legacy-occurrence-bridges.json'
    }
  };

  const buildReceipt = {
    schemaVersion: 1,
    artifactType: 'canonical-occurrence-build-receipt',
    rootSha256,
    releaseId: manifest.releaseId,
    sourceDataset: manifest.sourceDataset,
    sourceDatasetSha256: sourceSha256,
    compatibilityBridgeSha256: bridgeSha256,
    sourceCommit: sourceCommit ?? null,
    generatedAt: generatedAt ?? null,
    immutableReleaseRoot: releaseRoot,
    canonicalPayloadProduced: true,
    publicationChanged: false,
    productionMutation: false,
    d1Changed: false
  };

  return { manifest, buildReceipt, occurrences: canonicalOccurrences, legacyOccurrenceBridges, stablePayload };
}

async function main() {
  const output = argument('--output');
  if (!output) throw new Error('--output is required.');
  const [sourceBytes, observanceBytes, jurisdictionBytes, ecclesialBytes, bridgeBytes] = await Promise.all([
    readFile(occurrenceSourcePath, 'utf8'),
    readFile(observanceSourcePath, 'utf8'),
    readFile(jurisdictionSourcePath, 'utf8'),
    readFile(ecclesialSourcePath, 'utf8'),
    readFile(bridgeSourcePath, 'utf8')
  ]);
  const built = buildCanonicalOccurrenceVaultRelease(
    JSON.parse(sourceBytes),
    JSON.parse(observanceBytes),
    JSON.parse(jurisdictionBytes),
    JSON.parse(ecclesialBytes),
    JSON.parse(bridgeBytes),
    {
      sourceBytes,
      bridgeBytes,
      sourceCommit: process.env.GITHUB_SHA ?? null,
      generatedAt: new Date().toISOString()
    }
  );
  const outputRoot = path.resolve(output);
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(built.manifest, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'occurrences.json'), `${JSON.stringify(built.occurrences, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'legacy-occurrence-bridges.json'), `${JSON.stringify(built.legacyOccurrenceBridges, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'build-receipt.json'), `${JSON.stringify(built.buildReceipt, null, 2)}\n`, 'utf8')
  ]);
  process.stdout.write(`${JSON.stringify({ manifest: built.manifest, buildReceipt: built.buildReceipt }, null, 2)}\n`);
}

if (process.argv[1]?.endsWith('build-canonical-occurrence-manifest.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

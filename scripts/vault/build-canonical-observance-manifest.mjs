#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const observanceSourcePath = path.join(root, 'data', 'canonical-observance-anchors.json');
const personSourcePath = path.join(root, 'data', 'canonical-person-anchors.json');
const recognitionSourcePath = path.join(root, 'data', 'canonical-recognition-anchors.json');
const ecclesialSourcePath = path.join(root, 'data', 'canonical-ecclesial-context-anchors.json');

const ID_PATTERN = /^observance:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/u;
const CHURCH_ID_PATTERN = /^church:[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const OBSERVANCE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const ALLOWED_TYPES = new Set(['person-commemoration', 'multi-person-commemoration', 'feast', 'mystery', 'marian-title', 'other']);
const ALLOWED_SCOPES = new Set(['church-attested', 'jurisdictional', 'local', 'unknown']);
const FORBIDDEN_OCCURRENCE_KEYS = new Set(['year', 'month', 'day', 'date', 'dateISO', 'feastDate', 'calendarSystem', 'calendarId', 'jurisdictionId', 'rank', 'grade', 'precedence', 'transferRule']);

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

function assertNoOccurrenceLeak(record) {
  for (const key of FORBIDDEN_OCCURRENCE_KEYS) {
    assert(!(key in record), `${record.id} leaks Occurrence field ${key} into canonical Observance.`);
  }
}

export function buildCanonicalObservanceVaultRelease(dataset, personDataset, recognitionDataset, ecclesialDataset, { sourceBytes = null, sourceCommit = null, generatedAt = null } = {}) {
  assert(dataset?.schemaVersion === 1, 'Canonical observance dataset schemaVersion must be 1.');
  assert(dataset?.observanceModelVersion === '1.1', 'Canonical observance modelVersion must be 1.1.');
  assert(dataset?.status === 'repository-reviewed-observance-anchors', 'Canonical observance dataset is not repository-reviewed.');
  assert(Array.isArray(dataset?.observances) && dataset.observances.length > 0, 'Canonical observance dataset is empty.');
  assert(personDataset?.schemaVersion === 1 && Array.isArray(personDataset?.people), 'Canonical Person dataset is required for Observance validation.');
  assert(recognitionDataset?.schemaVersion === 1 && Array.isArray(recognitionDataset?.recognitions), 'Canonical Recognition dataset is required for Observance validation.');
  assert(ecclesialDataset?.schemaVersion === 1 && ecclesialDataset?.status === 'repository-reviewed-ecclesial-context-anchors' && Array.isArray(ecclesialDataset?.contexts), 'Canonical ecclesial context dataset is required for Observance validation.');

  const people = new Set(personDataset.people.map((item) => item.id));
  const recognitions = new Map(recognitionDataset.recognitions.map((item) => [item.id, item]));
  const churches = new Map(ecclesialDataset.contexts.filter((item) => item.kind === 'church').map((item) => [item.id, item]));
  const ids = new Set();
  const canonicalKeys = new Set();
  const personCoverage = new Set();
  const churchCoverage = new Set();
  const observances = [];

  for (const raw of dataset.observances) {
    assert(ID_PATTERN.test(raw?.id ?? ''), `Invalid Observance id: ${String(raw?.id)}.`);
    assert(!ids.has(raw.id), `Duplicate Observance id: ${raw.id}.`);
    ids.add(raw.id);
    assert(CHURCH_ID_PATTERN.test(raw?.churchId ?? '') && churches.has(raw.churchId), `${raw.id} references unknown canonical Church ${String(raw?.churchId)}.`);
    assert(OBSERVANCE_KEY_PATTERN.test(raw?.observanceKey ?? ''), `${raw.id} has invalid observanceKey ${String(raw?.observanceKey)}.`);
    assert(ALLOWED_TYPES.has(raw?.observanceType), `${raw.id} has unsupported observanceType ${String(raw?.observanceType)}.`);
    assert(ALLOWED_SCOPES.has(raw?.scope), `${raw.id} has unsupported scope ${String(raw?.scope)}.`);
    assert(raw?.occurrenceDateImplied === false, `${raw.id} must not imply an occurrence date.`);
    assert(raw?.calendarSystemImplied === false, `${raw.id} must not imply a calendar system.`);
    assert(raw?.jurisdictionImplied === false, `${raw.id} must not imply a jurisdiction.`);
    assert(raw?.rankImplied === false, `${raw.id} must not imply a rank.`);
    assert(raw?.precedenceImplied === false, `${raw.id} must not imply precedence.`);
    assert(/^\d{4}-\d{2}-\d{2}$/u.test(raw?.verifiedAt ?? ''), `${raw.id} has invalid verifiedAt.`);
    assertNoOccurrenceLeak(raw);

    assert(Array.isArray(raw.subjects) && raw.subjects.length > 0, `${raw.id} requires at least one subject.`);
    const subjects = raw.subjects.map((subject, index) => {
      assert(subject?.kind === 'person', `${raw.id} subject ${index} uses unsupported kind ${String(subject?.kind)} in bootstrap.`);
      assert(people.has(subject?.personId), `${raw.id} subject ${index} references unknown Person ${String(subject?.personId)}.`);
      const recognition = recognitions.get(subject?.recognitionId);
      assert(recognition, `${raw.id} subject ${index} references unknown Recognition ${String(subject?.recognitionId)}.`);
      assert(recognition.personId === subject.personId, `${raw.id} subject ${index} Recognition belongs to a different Person.`);
      assert(recognition.churchId === raw.churchId, `${raw.id} subject ${index} Recognition belongs to a different Church.`);
      personCoverage.add(subject.personId);
      return { kind: 'person', personId: subject.personId, recognitionId: subject.recognitionId };
    }).sort((left, right) => `${left.personId}:${left.recognitionId}`.localeCompare(`${right.personId}:${right.recognitionId}`));

    // Canonical Observance identity is Church + stable liturgical key + canonical subjects.
    // observanceType is descriptive taxonomy and may evolve without changing identity.
    const canonicalKey = `${raw.churchId}\u0000${raw.observanceKey}\u0000${subjects.map((item) => `${item.personId}:${item.recognitionId}`).join('|')}`;
    assert(!canonicalKeys.has(canonicalKey), `${raw.id} duplicates canonical Observance identity.`);
    canonicalKeys.add(canonicalKey);

    const church = churches.get(raw.churchId);
    const allowedDomains = new Set((church.authorityDomains ?? []).map((value) => String(value).toLowerCase().replace(/^www\./u, '')));
    assert(allowedDomains.size > 0, `${raw.id} canonical Church has no reviewed authority domains.`);
    assert(Array.isArray(raw.evidence) && raw.evidence.length > 0, `${raw.id} requires official observance evidence.`);
    const evidence = raw.evidence.map((item, index) => {
      assert(typeof item?.publisher === 'string' && item.publisher.trim().length > 0, `${raw.id} evidence ${index} requires a publisher.`);
      assert(typeof item?.url === 'string' && item.url.startsWith('https://'), `${raw.id} evidence ${index} requires an HTTPS URL.`);
      const evidenceHost = hostname(item.url);
      assert(allowedDomains.has(evidenceHost), `${raw.id} evidence ${index} domain ${evidenceHost || '(invalid)'} is outside canonical Church authority domains.`);
      assert(Array.isArray(item?.claimTypes) && item.claimTypes.includes('observance-attestation'), `${raw.id} evidence ${index} must explicitly attest an Observance.`);
      return {
        publisher: item.publisher.trim(),
        url: item.url,
        claimTypes: sortedUnique(item.claimTypes.map((value) => String(value)))
      };
    }).sort((left, right) => left.url.localeCompare(right.url));

    observances.push({
      schemaVersion: 1,
      observanceId: raw.id,
      entityType: 'Observance',
      churchId: raw.churchId,
      observanceKey: raw.observanceKey,
      observanceType: raw.observanceType,
      subjects,
      scope: raw.scope,
      occurrenceDateImplied: false,
      calendarSystemImplied: false,
      jurisdictionImplied: false,
      rankImplied: false,
      precedenceImplied: false,
      resolutionStatus: 'canonical-anchor',
      evidence,
      verifiedAt: raw.verifiedAt,
      deletionPolicy: 'tombstone-only'
    });
    churchCoverage.add(raw.churchId);
  }

  observances.sort((left, right) => left.observanceId.localeCompare(right.observanceId));
  const stablePayload = {
    schemaVersion: 1,
    artifactType: 'canonical-liturgical-observances',
    observanceModelVersion: dataset.observanceModelVersion,
    observances
  };
  const rootSha256 = sha256(JSON.stringify(stablePayload));
  const releaseRoot = `/vault/canonical/observances/v1/releases/${rootSha256}`;
  const sourceSha256 = sha256(sourceBytes ?? JSON.stringify(dataset));

  const manifest = {
    schemaVersion: 1,
    artifactType: 'canonical-liturgical-observances',
    vaultLayer: 'canonical',
    observanceModelVersion: dataset.observanceModelVersion,
    releaseId: `canonical-observances-v1-${rootSha256.slice(0, 16)}`,
    rootSha256,
    sourceDataset: 'data/canonical-observance-anchors.json',
    personDataset: 'data/canonical-person-anchors.json',
    recognitionDataset: 'data/canonical-recognition-anchors.json',
    ecclesialContextDataset: 'data/canonical-ecclesial-context-anchors.json',
    observanceCount: observances.length,
    personCoverageCount: personCoverage.size,
    churches: [...churchCoverage].sort(),
    runtimePublicationAllowed: false,
    immutableReleaseRoot: releaseRoot,
    currentPointerPath: '/vault/canonical/observances/v1/current.json',
    deletionPolicy: 'tombstone-only',
    semantics: {
      observanceSeparateFromPerson: true,
      observanceSeparateFromRecognition: true,
      observanceSeparateFromOccurrence: true,
      stableObservanceKeyRequired: true,
      observanceTypeIsNotIdentity: true,
      multipleObservancesPerSubjectSetSupported: true,
      occurrenceDateImplied: false,
      calendarSystemImplied: false,
      jurisdictionImplied: false,
      rankImplied: false,
      precedenceImplied: false,
      canonicalChurchReferenceRequired: true,
      recognitionMustMatchObservanceChurch: true,
      evidenceMustMatchChurchAuthorityDomain: true,
      multiSubjectReady: true
    },
    d1Projection: {
      status: 'deferred',
      reason: 'Current calendar tables primarily materialize dated occurrences; canonical Observance identity must not be collapsed into an annual occurrence row.'
    },
    files: {
      observances: 'observances.json'
    }
  };

  const buildReceipt = {
    schemaVersion: 1,
    artifactType: 'canonical-observance-build-receipt',
    rootSha256,
    releaseId: manifest.releaseId,
    sourceDataset: manifest.sourceDataset,
    sourceDatasetSha256: sourceSha256,
    sourceCommit: sourceCommit ?? null,
    generatedAt: generatedAt ?? null,
    immutableReleaseRoot: releaseRoot,
    canonicalPayloadProduced: true,
    publicationChanged: false,
    d1Changed: false
  };

  return { manifest, buildReceipt, observances, stablePayload };
}

async function main() {
  const output = argument('--output');
  if (!output) throw new Error('--output is required.');
  const [sourceBytes, personBytes, recognitionBytes, ecclesialBytes] = await Promise.all([
    readFile(observanceSourcePath, 'utf8'),
    readFile(personSourcePath, 'utf8'),
    readFile(recognitionSourcePath, 'utf8'),
    readFile(ecclesialSourcePath, 'utf8')
  ]);
  const built = buildCanonicalObservanceVaultRelease(
    JSON.parse(sourceBytes),
    JSON.parse(personBytes),
    JSON.parse(recognitionBytes),
    JSON.parse(ecclesialBytes),
    {
      sourceBytes,
      sourceCommit: process.env.GITHUB_SHA ?? null,
      generatedAt: new Date().toISOString()
    }
  );
  const outputRoot = path.resolve(output);
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(built.manifest, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'observances.json'), `${JSON.stringify(built.observances, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'build-receipt.json'), `${JSON.stringify(built.buildReceipt, null, 2)}\n`, 'utf8')
  ]);
  process.stdout.write(`${JSON.stringify({ manifest: built.manifest, buildReceipt: built.buildReceipt }, null, 2)}\n`);
}

if (process.argv[1]?.endsWith('build-canonical-observance-manifest.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

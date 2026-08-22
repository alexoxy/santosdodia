#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const recognitionSourcePath = path.join(root, 'data', 'canonical-recognition-anchors.json');
const personSourcePath = path.join(root, 'data', 'canonical-person-anchors.json');
const ecclesialSourcePath = path.join(root, 'data', 'canonical-ecclesial-context-anchors.json');
const ID_PATTERN = /^recognition:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/u;
const PERSON_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const CHURCH_ID_PATTERN = /^church:[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const JURISDICTION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const ALLOWED_RECOGNIZED_AS = new Set(['saint', 'blessed', 'venerable', 'servant-of-god', 'commemorated-person', 'other']);
const ALLOWED_BASES = new Set(['official-church-attestation', 'formal-recognition-event', 'traditional-liturgical-attestation']);
const ALLOWED_SCOPES = new Set(['church-wide', 'jurisdictional', 'local', 'unknown']);
const OFFICIAL_PUBLISHERS = new Set(['Holy See', 'Vatican News', 'Orthodox Church in America', 'Patriarchate of Lisbon']);
const FORBIDDEN_RECOGNITION_KEYS = new Set(['month', 'day', 'date', 'dateISO', 'feastDate', 'calendarSystem', 'rank', 'precedence']);

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

function assertNoObservanceLeak(record) {
  for (const key of FORBIDDEN_RECOGNITION_KEYS) {
    assert(!(key in record), `${record.id} leaks observance/date field ${key} into canonical Recognition.`);
  }
}

function hostname(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./u, ''); }
  catch { return ''; }
}

export function buildCanonicalRecognitionVaultRelease(dataset, personDataset, ecclesialDataset, { sourceBytes = null, sourceCommit = null, generatedAt = null } = {}) {
  assert(dataset?.schemaVersion === 1, 'Canonical recognition dataset schemaVersion must be 1.');
  assert(dataset?.recognitionModelVersion === '1.0', 'Canonical recognition modelVersion must be 1.0.');
  assert(dataset?.status === 'repository-reviewed-recognition-anchors', 'Canonical recognition dataset is not repository-reviewed.');
  assert(Array.isArray(dataset?.recognitions) && dataset.recognitions.length > 0, 'Canonical recognition dataset is empty.');
  assert(personDataset?.schemaVersion === 1 && Array.isArray(personDataset?.people), 'Canonical Person dataset is required for Recognition validation.');
  assert(ecclesialDataset?.schemaVersion === 1 && ecclesialDataset?.status === 'repository-reviewed-ecclesial-context-anchors' && Array.isArray(ecclesialDataset?.contexts), 'Canonical ecclesial context dataset is required for Recognition validation.');

  const canonicalPersonIds = new Set(personDataset.people.map((person) => person.id));
  const canonicalChurches = new Map(ecclesialDataset.contexts.filter((context) => context.kind === 'church').map((context) => [context.id, context]));
  const recognitionIds = new Set();
  const canonicalKeys = new Set();
  const recognitions = [];
  const churchIds = new Set();
  const personIds = new Set();

  for (const raw of dataset.recognitions) {
    assert(ID_PATTERN.test(raw?.id ?? ''), `Invalid Recognition id: ${String(raw?.id)}.`);
    assert(!recognitionIds.has(raw.id), `Duplicate Recognition id: ${raw.id}.`);
    recognitionIds.add(raw.id);
    assert(PERSON_ID_PATTERN.test(raw?.personId ?? '') && canonicalPersonIds.has(raw.personId), `${raw.id} references unknown canonical Person ${String(raw?.personId)}.`);
    assert(CHURCH_ID_PATTERN.test(raw?.churchId ?? '') && canonicalChurches.has(raw.churchId), `${raw.id} references unknown canonical Church ${String(raw?.churchId)}.`);
    assert(JURISDICTION_ID_PATTERN.test(raw?.jurisdictionId ?? ''), `${raw.id} has invalid jurisdictionId.`);
    assert(ALLOWED_RECOGNIZED_AS.has(raw?.recognizedAs), `${raw.id} has unsupported recognizedAs ${String(raw?.recognizedAs)}.`);
    assert(ALLOWED_BASES.has(raw?.recognitionBasis), `${raw.id} has unsupported recognitionBasis ${String(raw?.recognitionBasis)}.`);
    assert(ALLOWED_SCOPES.has(raw?.scope), `${raw.id} has unsupported scope ${String(raw?.scope)}.`);
    assert(raw?.calendarMembershipImplied === false, `${raw.id} must not imply calendar membership.`);
    assert(raw?.observanceDateImplied === false, `${raw.id} must not imply an observance date.`);
    assert(/^\d{4}-\d{2}-\d{2}$/u.test(raw?.verifiedAt ?? ''), `${raw.id} has invalid verifiedAt.`);
    assertNoObservanceLeak(raw);

    const canonicalKey = `${raw.personId}\u0000${raw.churchId}\u0000${raw.jurisdictionId}\u0000${raw.recognizedAs}`;
    assert(!canonicalKeys.has(canonicalKey), `${raw.id} duplicates canonical Recognition state ${canonicalKey}.`);
    canonicalKeys.add(canonicalKey);

    assert(Array.isArray(raw.ecclesialTitles), `${raw.id} ecclesialTitles must be an array.`);
    const ecclesialTitles = sortedUnique(raw.ecclesialTitles.map((value) => String(value)));
    for (const title of ecclesialTitles) assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(title), `${raw.id} has invalid ecclesial title ${title}.`);

    const church = canonicalChurches.get(raw.churchId);
    const allowedDomains = new Set((church.authorityDomains ?? []).map((value) => String(value).toLowerCase().replace(/^www\./u, '')));
    assert(allowedDomains.size > 0, `${raw.id} canonical Church has no reviewed authority domains.`);
    assert(Array.isArray(raw.evidence) && raw.evidence.length > 0, `${raw.id} requires official evidence.`);
    const evidence = raw.evidence.map((item, index) => {
      assert(OFFICIAL_PUBLISHERS.has(item?.publisher), `${raw.id} evidence ${index} uses non-bootstrap publisher ${String(item?.publisher)}.`);
      assert(typeof item?.url === 'string' && item.url.startsWith('https://'), `${raw.id} evidence ${index} requires an HTTPS URL.`);
      const evidenceHost = hostname(item.url);
      assert(allowedDomains.has(evidenceHost), `${raw.id} evidence ${index} domain ${evidenceHost || '(invalid)'} is outside canonical Church authority domains.`);
      assert(Array.isArray(item?.claimTypes) && item.claimTypes.length > 0, `${raw.id} evidence ${index} requires claimTypes.`);
      return {
        publisher: item.publisher,
        url: item.url,
        claimTypes: sortedUnique(item.claimTypes.map((value) => String(value))),
      };
    }).sort((left, right) => left.url.localeCompare(right.url));

    recognitions.push({
      schemaVersion: 1,
      recognitionId: raw.id,
      entityType: 'Recognition',
      personId: raw.personId,
      churchId: raw.churchId,
      jurisdictionId: raw.jurisdictionId,
      recognizedAs: raw.recognizedAs,
      recognitionBasis: raw.recognitionBasis,
      ecclesialTitles,
      scope: raw.scope,
      calendarMembershipImplied: false,
      observanceDateImplied: false,
      resolutionStatus: 'canonical-anchor',
      evidence,
      verifiedAt: raw.verifiedAt,
      deletionPolicy: 'tombstone-only',
    });
    churchIds.add(raw.churchId);
    personIds.add(raw.personId);
  }

  recognitions.sort((left, right) => left.recognitionId.localeCompare(right.recognitionId));
  const stablePayload = {
    schemaVersion: 1,
    artifactType: 'canonical-ecclesial-recognitions',
    recognitionModelVersion: dataset.recognitionModelVersion,
    recognitions,
  };
  const rootSha256 = sha256(JSON.stringify(stablePayload));
  const releaseRoot = `/vault/canonical/recognitions/v1/releases/${rootSha256}`;
  const sourceSha256 = sha256(sourceBytes ?? JSON.stringify(dataset));

  const manifest = {
    schemaVersion: 1,
    artifactType: 'canonical-ecclesial-recognitions',
    vaultLayer: 'canonical',
    recognitionModelVersion: dataset.recognitionModelVersion,
    releaseId: `canonical-recognitions-v1-${rootSha256.slice(0, 16)}`,
    rootSha256,
    sourceDataset: 'data/canonical-recognition-anchors.json',
    ecclesialContextDataset: 'data/canonical-ecclesial-context-anchors.json',
    recognitionCount: recognitions.length,
    personCoverageCount: personIds.size,
    churches: [...churchIds].sort(),
    runtimePublicationAllowed: false,
    immutableReleaseRoot: releaseRoot,
    currentPointerPath: '/vault/canonical/recognitions/v1/current.json',
    deletionPolicy: 'tombstone-only',
    semantics: {
      recognitionSeparateFromPerson: true,
      recognitionSeparateFromObservance: true,
      recognitionSeparateFromOccurrence: true,
      recognitionStateSeparateFromRecognitionEvent: true,
      canonicalChurchReferenceRequired: true,
      evidenceMustMatchChurchAuthorityDomain: true,
      calendarMembershipImplied: false,
      observanceDateImplied: false,
      oneChurchCannotEstablishAnotherChurchRecognition: true
    },
    d1Projection: {
      status: 'deferred',
      reason: 'Existing sanctity_recognition_events models historical recognition events; canonical Recognition state must not be forced into an event table.'
    },
    files: {
      recognitions: 'recognitions.json'
    }
  };

  const buildReceipt = {
    schemaVersion: 1,
    artifactType: 'canonical-recognition-build-receipt',
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

  return { manifest, buildReceipt, recognitions, stablePayload };
}

async function main() {
  const output = argument('--output');
  if (!output) throw new Error('--output is required.');
  const [sourceBytes, personBytes, ecclesialBytes] = await Promise.all([
    readFile(recognitionSourcePath, 'utf8'),
    readFile(personSourcePath, 'utf8'),
    readFile(ecclesialSourcePath, 'utf8')
  ]);
  const built = buildCanonicalRecognitionVaultRelease(JSON.parse(sourceBytes), JSON.parse(personBytes), JSON.parse(ecclesialBytes), {
    sourceBytes,
    sourceCommit: process.env.GITHUB_SHA ?? null,
    generatedAt: new Date().toISOString()
  });
  const outputRoot = path.resolve(output);
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(built.manifest, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'recognitions.json'), `${JSON.stringify(built.recognitions, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'build-receipt.json'), `${JSON.stringify(built.buildReceipt, null, 2)}\n`, 'utf8')
  ]);
  process.stdout.write(`${JSON.stringify({ manifest: built.manifest, buildReceipt: built.buildReceipt }, null, 2)}\n`);
}

if (process.argv[1]?.endsWith('build-canonical-recognition-manifest.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

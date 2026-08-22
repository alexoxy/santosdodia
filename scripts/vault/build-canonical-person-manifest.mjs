#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'data', 'canonical-person-anchors.json');
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const OBSERVANCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._-]*$/u;
const ALLOWED_LEGACY_CATEGORIES = new Set(['saint', 'apostle', 'martyr']);
const REQUIRED_ANCHOR_LOCALES = ['en', 'pt', 'es', 'it'];

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

function sortedObject(input) {
  return Object.fromEntries(Object.entries(input).sort(([left], [right]) => left.localeCompare(right)));
}

export function buildCanonicalPersonVaultRelease(dataset, { sourceBytes = null, sourceCommit = null, generatedAt = null } = {}) {
  assert(dataset?.schemaVersion === 1, 'Canonical person anchor dataset schemaVersion must be 1.');
  assert(dataset?.identityModelVersion === '1.0', 'Canonical person anchor identityModelVersion must be 1.0.');
  assert(dataset?.status === 'repository-reviewed-canonical-anchors', 'Canonical person anchor dataset is not repository-reviewed.');
  assert(Array.isArray(dataset?.people) && dataset.people.length > 0, 'Canonical person anchor dataset is empty.');

  const ids = new Set();
  const people = [];
  const bridges = [];
  const localeSet = new Set();

  for (const raw of dataset.people) {
    assert(ID_PATTERN.test(raw?.id ?? ''), `Invalid canonical Person id: ${String(raw?.id)}.`);
    assert(!ids.has(raw.id), `Duplicate canonical Person id: ${raw.id}.`);
    ids.add(raw.id);
    assert(OBSERVANCE_ID_PATTERN.test(raw?.primaryObservanceId ?? ''), `${raw.id} has an invalid primaryObservanceId.`);
    assert(ALLOWED_LEGACY_CATEGORIES.has(raw?.category), `${raw.id} has unsupported legacy category ${String(raw?.category)}.`);
    assert(raw?.names && typeof raw.names === 'object' && !Array.isArray(raw.names), `${raw.id} is missing localized names.`);

    const names = {};
    for (const [locale, value] of Object.entries(raw.names)) {
      assert(typeof value === 'string' && value.normalize('NFC').trim() === value && value.length > 0, `${raw.id} has invalid ${locale} name.`);
      assert(value === value.normalize('NFC'), `${raw.id} ${locale} name is not Unicode NFC.`);
      names[locale] = value;
      localeSet.add(locale);
    }
    for (const locale of REQUIRED_ANCHOR_LOCALES) assert(names[locale], `${raw.id} is missing required ${locale} identity name.`);

    people.push({
      schemaVersion: 1,
      personId: raw.id,
      entityType: 'Person',
      identityStatus: 'canonical-anchor',
      localizedNames: sortedObject(names),
      nameEvidenceStatus: 'repository-reviewed-migration-anchor',
      deletionPolicy: 'tombstone-only',
    });
    bridges.push({
      schemaVersion: 1,
      personId: raw.id,
      relationType: 'legacy-primary-observance-bridge',
      observanceId: raw.primaryObservanceId,
      legacyCategory: raw.category,
      canonicalSemantics: false,
      migrationNote: 'Temporary compatibility bridge only. Person, Recognition and Observance remain separate in SantosDia v2.',
    });
  }

  people.sort((left, right) => left.personId.localeCompare(right.personId));
  bridges.sort((left, right) => left.personId.localeCompare(right.personId));
  const locales = [...localeSet].sort();
  const stablePayload = {
    schemaVersion: 1,
    artifactType: 'canonical-person-identities',
    identityModelVersion: dataset.identityModelVersion,
    people,
    legacyObservanceBridges: bridges,
  };
  const rootSha256 = sha256(JSON.stringify(stablePayload));
  const releaseRoot = `/vault/canonical/people/v1/releases/${rootSha256}`;
  const sourceSha256 = sha256(sourceBytes ?? JSON.stringify(dataset));

  // Everything in manifest.json is derived only from canonical semantics. Raw
  // source-byte provenance belongs in the build receipt so formatting-only
  // source changes can never map one content root to different immutable bytes.
  const manifest = {
    schemaVersion: 1,
    artifactType: 'canonical-person-identities',
    vaultLayer: 'canonical',
    identityModelVersion: dataset.identityModelVersion,
    releaseId: `canonical-people-v1-${rootSha256.slice(0, 16)}`,
    rootSha256,
    sourceDataset: 'data/canonical-person-anchors.json',
    peopleCount: people.length,
    legacyBridgeCount: bridges.length,
    locales,
    runtimePublicationAllowed: false,
    immutableReleaseRoot: releaseRoot,
    currentPointerPath: '/vault/canonical/people/v1/current.json',
    deletionPolicy: 'tombstone-only',
    semantics: {
      personSeparateFromRecognition: true,
      personSeparateFromObservance: true,
      localizedNameSeparateFromIdentityKey: true,
      legacyBridgeIsCanonicalSemantics: false,
    },
    files: {
      people: 'people.json',
      legacyObservanceBridges: 'legacy-observance-bridges.json',
    },
  };
  const buildReceipt = {
    schemaVersion: 1,
    artifactType: 'canonical-person-build-receipt',
    rootSha256,
    releaseId: manifest.releaseId,
    sourceDataset: manifest.sourceDataset,
    sourceDatasetSha256: sourceSha256,
    sourceCommit: sourceCommit ?? null,
    generatedAt: generatedAt ?? null,
    immutableReleaseRoot: releaseRoot,
    canonicalPayloadProduced: true,
    publicationChanged: false,
  };

  return { manifest, buildReceipt, people, legacyObservanceBridges: bridges, stablePayload };
}

async function main() {
  const output = argument('--output');
  if (!output) throw new Error('--output is required.');
  const sourceBytes = await readFile(sourcePath, 'utf8');
  const dataset = JSON.parse(sourceBytes);
  const built = buildCanonicalPersonVaultRelease(dataset, {
    sourceBytes,
    sourceCommit: process.env.GITHUB_SHA ?? null,
    generatedAt: new Date().toISOString(),
  });
  const outputRoot = path.resolve(output);
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(built.manifest, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'people.json'), `${JSON.stringify(built.people, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'legacy-observance-bridges.json'), `${JSON.stringify(built.legacyObservanceBridges, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'build-receipt.json'), `${JSON.stringify(built.buildReceipt, null, 2)}\n`, 'utf8'),
  ]);
  process.stdout.write(`${JSON.stringify({ manifest: built.manifest, buildReceipt: built.buildReceipt }, null, 2)}\n`);
}

if (process.argv[1]?.endsWith('build-canonical-person-manifest.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

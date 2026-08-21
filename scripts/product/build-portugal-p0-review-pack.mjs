#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RESOLVED_IDENTITY_STATUSES = new Set(['resolved-single-occurrence', 'resolved-duplicate-occurrences']);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function text(value) {
  return String(value ?? '').normalize('NFC').trim();
}

function finitePlaceSummary(places) {
  return (places ?? []).map((place) => ({
    role: place.role ?? place.kind ?? null,
    qid: place.qid ?? null,
    label: place.label ?? place.name ?? null,
    countryCode: place.countryCode ?? null,
    lat: Number.isFinite(place.lat) ? place.lat : null,
    lon: Number.isFinite(place.lon) ? place.lon : null,
    sourceIds: [...new Set(place.sourceIds ?? [])],
  }));
}

function bucketFor({ item, person }) {
  if (item.alreadyPublic === true) return 'already-public-link-review';
  if (!person || !text(person.qid) || person.identityStatus === 'conflict' || !RESOLVED_IDENTITY_STATUSES.has(person.identityStatus)) return 'needs-identity-evidence';
  if (!text(person.names?.pt)) return 'needs-portuguese-name';
  return 'identity-review-ready';
}

export function buildPortugalP0ReviewPack({ queue, navigation } = {}) {
  if (queue?.schemaVersion !== 1 || queue?.release !== 'roman-catholic-pt-2026-v2' || queue?.publicationAllowed !== false || queue?.productionMutation !== false || !Array.isArray(queue?.items)) {
    throw new Error('P0 review pack requires the fail-closed Portugal 2026 publication queue.');
  }
  if (queue?.summary?.safety?.adsenseReviewState !== 'PREPARING' || queue?.summary?.safety?.adServingMutation !== false || queue?.summary?.safety?.autoAdsMutation !== false || queue?.summary?.safety?.seoIndexationMutation !== false) {
    throw new Error('P0 review pack refuses a queue outside the AdSense PREPARING safety boundary.');
  }
  if (navigation?.schemaVersion !== 1 || navigation?.publicationAllowed !== false || navigation?.productionMutation !== false || !Array.isArray(navigation?.people)) {
    throw new Error('P0 review pack requires a verified non-publishing navigation source.');
  }

  const people = new Map(navigation.people.map((person) => [person.entityId, person]));
  const p0 = queue.items.filter((item) => item.priority === 'P0');
  const rows = [];

  for (const item of p0) {
    if (item.classification?.kind !== 'single-person-observance') throw new Error(`P0 item ${item.sourceOccurrenceId} is not a single-person observance.`);
    if (item.identityMatch?.status !== 'unique-exact-candidate' || item.identityMatch?.candidates?.length !== 1) throw new Error(`P0 item ${item.sourceOccurrenceId} does not have exactly one candidate.`);
    const candidate = item.identityMatch.candidates[0];
    const person = people.get(candidate.entityId);
    if (!person) throw new Error(`P0 candidate ${candidate.entityId} is missing from the navigation source.`);
    if (person.entityId !== `wikidata:${person.qid}`) throw new Error(`P0 candidate ${person.entityId} does not use the stable QID identity key.`);

    const reviewBucket = bucketFor({ item, person });
    rows.push({
      reviewId: `pt-2026:${item.sourceOccurrenceId}:${person.entityId}`,
      reviewBucket,
      sourceOccurrenceId: item.sourceOccurrenceId,
      dateISO: item.dateISO,
      canonicalEventId: item.canonicalEventId,
      calendar: {
        category: item.category,
        rank: item.rank ?? null,
        labels: item.labels ?? {},
      },
      proposedPerson: {
        entityId: person.entityId,
        qid: person.qid,
        canonicalName: person.canonicalName,
        names: person.names ?? {},
        aliases: person.aliases ?? {},
        identityStatus: person.identityStatus,
        validationStatus: person.validationStatus,
        publicationStatus: person.publicationStatus,
        sourceIds: [...new Set(person.sourceIds ?? [])],
        birth: person.birth ?? null,
        death: person.death ?? null,
        places: finitePlaceSummary(person.places),
      },
      matchEvidence: candidate.evidence ?? [],
      alreadyPublic: item.alreadyPublic === true,
      reviewRequired: true,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowed: false,
      advertisingEligible: false,
      reviewerDecision: null,
    });
  }

  const count = (bucket) => rows.filter((row) => row.reviewBucket === bucket).length;
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: queue.release,
    datasetVersion: navigation.datasetVersion ?? null,
    p0Items: rows.length,
    buckets: {
      identityReviewReady: count('identity-review-ready'),
      needsPortugueseName: count('needs-portuguese-name'),
      needsIdentityEvidence: count('needs-identity-evidence'),
      alreadyPublicLinkReview: count('already-public-link-review'),
    },
    identityStatusCounts: Object.fromEntries([...new Set(rows.map((row) => row.proposedPerson.identityStatus))].sort().map((status) => [status, rows.filter((row) => row.proposedPerson.identityStatus === status).length])),
    portugueseNameCoverage: {
      withPtName: rows.filter((row) => text(row.proposedPerson.names?.pt)).length,
      missingPtName: rows.filter((row) => !text(row.proposedPerson.names?.pt)).length,
    },
    safety: {
      reviewOnly: true,
      nameOnlyMergeForbidden: true,
      exactNameMatchIsProposalOnly: true,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      adsenseReviewState: 'PREPARING',
      adServingMutation: false,
      autoAdsMutation: false,
      seoIndexationMutation: false,
      publicPageCreationMutation: false,
    },
  };

  if (rows.length !== queue?.summary?.operationalBacklog?.p0) throw new Error(`P0 accounting mismatch: queue=${queue?.summary?.operationalBacklog?.p0}, pack=${rows.length}.`);
  if (Object.values(summary.buckets).reduce((sum, value) => sum + value, 0) !== rows.length) throw new Error('P0 review bucket accounting mismatch.');
  if (rows.some((row) => row.reviewRequired !== true || row.automaticLinkAllowed !== false || row.publicationAllowed !== false || row.advertisingEligible !== false)) throw new Error('P0 review pack crossed its fail-closed safety boundary.');

  return {
    schemaVersion: 1,
    generatedAt: summary.generatedAt,
    release: queue.release,
    datasetVersion: navigation.datasetVersion ?? null,
    publicationAllowed: false,
    productionMutation: false,
    summary,
    items: rows,
  };
}

function main() {
  const queuePath = argument('--queue');
  const navigationPath = argument('--navigation');
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!queuePath || !navigationPath || !outputPath || !summaryPath) throw new Error('Usage: --queue <queue.json> --navigation <navigation.json> --output <review-pack.json> --summary <summary.json>');
  const result = buildPortugalP0ReviewPack({
    queue: JSON.parse(fs.readFileSync(path.resolve(queuePath), 'utf8')),
    navigation: JSON.parse(fs.readFileSync(path.resolve(navigationPath), 'utf8')),
  });
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.mkdirSync(path.dirname(path.resolve(summaryPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve(summaryPath), `${JSON.stringify(result.summary, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(result.summary, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

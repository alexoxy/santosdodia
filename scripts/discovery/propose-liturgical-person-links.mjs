#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function clean(value) { return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase('pt-PT').replace(/[’'`´.·,:;()\[\]{}\-_/\\]/gu, ' ').replace(/\s+/gu, ' ').trim(); }
function withoutSaintTitle(value) {
  return clean(value).replace(/^(?:s|sao|santo|santa|santos|santas|beato|beata|beatos|beatas|bem aventurado|bem aventurada)\s+/u, '').trim();
}
function isCollectiveHeading(value) {
  return /^(?:ss|santos|santas|beatos|beatas)\s+/u.test(clean(value));
}
function leadingPersonalName(value) {
  if (isCollectiveHeading(value)) return '';
  const [leading] = String(value ?? '').split(',', 1);
  const normalized = withoutSaintTitle(leading);
  return normalized.split(/\s+/u).filter(Boolean).length >= 2 ? normalized : '';
}
function sourceName(event) {
  const value = event?.names?.pt;
  return typeof value === 'string' ? value : value?.value ?? event?.name ?? '';
}
function portugueseEvidence(person) {
  const values = [];
  if (person?.names?.pt) values.push({ value: person.names.pt, kind: 'preferred-name' });
  for (const alias of person?.aliases?.pt ?? []) {
    const value = typeof alias === 'string' ? alias : alias?.value;
    const status = typeof alias === 'string' ? 'source' : alias?.status;
    const scriptStatus = typeof alias === 'string' ? 'expected' : alias?.scriptStatus;
    if (value && status === 'source' && scriptStatus === 'expected') values.push({ value, kind: 'alias' });
  }
  return values;
}
function add(index, key, candidate) {
  if (!key) return;
  const bucket = index.get(key) ?? new Map();
  const current = bucket.get(candidate.entityId);
  if (!current || current.kind === 'alias') bucket.set(candidate.entityId, candidate);
  index.set(key, bucket);
}
function candidates(index, key) { return [...(index.get(key)?.values() ?? [])].sort((a,b)=>a.entityId.localeCompare(b.entityId)); }
function isReviewed(event) { return String(event?.personLinkStatus ?? '').startsWith('reviewed-'); }

export function proposeLiturgicalPersonLinks(source) {
  if (source?.schemaVersion !== 1 || !Array.isArray(source.people) || !Array.isArray(source.unlinkedObservances)) throw new Error('Navigation source must contain people and unlinkedObservances.');
  if (source.publicationAllowed !== false || source.productionMutation !== false) throw new Error('Link proposal input must remain staging-only.');

  const exact = new Map();
  const titleStripped = new Map();
  for (const person of source.people) {
    if (typeof person?.entityId !== 'string' || !person.entityId) continue;
    for (const evidence of portugueseEvidence(person)) {
      const candidate = { entityId: person.entityId, qid: person.qid ?? null, matchedValue: evidence.value, evidenceKind: evidence.kind };
      add(exact, clean(evidence.value), candidate);
      add(titleStripped, withoutSaintTitle(evidence.value), candidate);
    }
  }

  const reviewableObservances = source.unlinkedObservances.filter((event) => !event.personEntityId && !isReviewed(event));
  const proposals = reviewableObservances.map((event) => {
    const name = sourceName(event);
    const exactMatches = candidates(exact, clean(name));
    const strippedMatches = exactMatches.length ? [] : candidates(titleStripped, withoutSaintTitle(name));
    const leadingMatches = exactMatches.length || strippedMatches.length
      ? []
      : candidates(titleStripped, leadingPersonalName(name));
    const matches = exactMatches.length ? exactMatches : strippedMatches.length ? strippedMatches : leadingMatches;
    const method = exactMatches.length
      ? 'exact-normalized-pt-name'
      : strippedMatches.length
        ? 'exact-title-stripped-pt-name'
        : leadingMatches.length
          ? 'exact-leading-person-name-pt'
          : 'none';
    const status = matches.length === 1 ? 'candidate-review-required' : matches.length > 1 ? 'ambiguous-review-required' : 'unmatched';
    return {
      observanceId: event.id,
      sourceName: name,
      sourceIds: event.sourceIds ?? (event.source?.sourceId ? [event.source.sourceId] : []),
      month: event.month,
      day: event.day,
      status,
      matchMethod: method,
      candidatePersonIds: matches.map((item) => item.entityId),
      candidates: matches,
      automaticLinkAllowed: false,
      reviewRequired: matches.length > 0
    };
  });

  const stats = {
    people: source.people.length,
    sourceObservances: source.unlinkedObservances.length,
    observances: proposals.length,
    reviewableObservances: proposals.length,
    uniqueCandidates: proposals.filter((item) => item.status === 'candidate-review-required').length,
    ambiguous: proposals.filter((item) => item.status === 'ambiguous-review-required').length,
    unmatched: proposals.filter((item) => item.status === 'unmatched').length,
    alreadyLinked: source.unlinkedObservances.filter((item) => Boolean(item.personEntityId)).length,
    reviewedLinked: source.unlinkedObservances.filter((item) => item.personLinkStatus === 'reviewed-linked').length,
    reviewedCollective: source.unlinkedObservances.filter((item) => item.personLinkStatus === 'reviewed-collective').length,
    reviewedNonPerson: source.unlinkedObservances.filter((item) => item.personLinkStatus === 'reviewed-non-person').length
  };
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    datasetVersion: source.datasetVersion ?? null,
    identityRootSha256: source.identityRootSha256 ?? null,
    sourceSha256: source.sourceSha256 ?? null,
    locale: 'pt',
    policy: {
      nameOnlyIdentityMergeForbidden: true,
      proposalsAreEvidenceNotDecisions: true,
      explicitReviewRequired: true,
      publicationAllowed: false,
      productionMutation: false
    },
    stats,
    proposals
  };
}

function main() {
  const input = argument('--input'); const output = argument('--output');
  if (!input || !output) throw new Error('--input and --output are required.');
  const report = proposeLiturgicalPersonLinks(JSON.parse(fs.readFileSync(path.resolve(input), 'utf8')));
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ stats: report.stats, publicationAllowed: false, productionMutation: false }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }

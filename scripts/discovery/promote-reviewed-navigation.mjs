#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function assertStagingOnly(value, label) {
  if (value?.publicationAllowed !== false || value?.productionMutation !== false) {
    throw new Error(`${label} must remain staging-only.`);
  }
}

function validateReviewMetadata(decision) {
  if (typeof decision?.reviewer !== 'string' || !decision.reviewer.trim()) {
    throw new Error(`Publication decision ${decision?.personEntityId ?? '(unknown)'} needs reviewer.`);
  }
  if (typeof decision?.reviewedAt !== 'string' || Number.isNaN(Date.parse(decision.reviewedAt))) {
    throw new Error(`Publication decision ${decision?.personEntityId ?? '(unknown)'} needs a valid reviewedAt timestamp.`);
  }
}

function reviewedEvidence(observance) {
  const evidence = observance?.linkReview?.evidenceSources;
  if (!Array.isArray(evidence) || evidence.length < 2) {
    throw new Error(`Reviewed observance ${observance?.id ?? '(unknown)'} lacks independent evidence.`);
  }
  const families = new Set();
  const sources = [];
  for (const item of evidence) {
    if (typeof item?.sourceId !== 'string' || !item.sourceId.trim()) {
      throw new Error(`Reviewed observance ${observance.id} has evidence without sourceId.`);
    }
    if (typeof item?.sourceFamily !== 'string' || !item.sourceFamily.trim()) {
      throw new Error(`Reviewed observance ${observance.id} has evidence without sourceFamily.`);
    }
    if (typeof item?.reference !== 'string' || !item.reference.trim()) {
      throw new Error(`Reviewed observance ${observance.id} has evidence without reference.`);
    }
    families.add(item.sourceFamily.trim());
    sources.push({
      sourceId: item.sourceId.trim(),
      sourceFamily: item.sourceFamily.trim(),
      reference: item.reference.trim(),
    });
  }
  if (families.size < 2) {
    throw new Error(`Reviewed observance ${observance.id} needs at least two independent source families.`);
  }
  if (!sources.some((item) => item.sourceId === 'vatican-news-saint-of-day-pt')) {
    throw new Error(`Reviewed observance ${observance.id} must retain Vatican News calendar evidence.`);
  }
  return sources;
}

function safePublicPerson(person, evidence) {
  if (!person || typeof person.entityId !== 'string' || !person.entityId) {
    throw new Error('Publication decision references an invalid person.');
  }
  if (!person.names || !Object.values(person.names).some((value) => typeof value === 'string' && value.trim())) {
    throw new Error(`Person ${person.entityId} has no source-backed public display name.`);
  }

  const categories = unique([...(person.categories ?? []).filter((value) => value !== 'saint-candidate'), 'saint']).sort();
  const sourceIds = unique([...(person.sourceIds ?? []), ...evidence.map((item) => item.sourceId)]).sort();

  return {
    ...person,
    // Identity + reviewed observance is the first safe public scope. Facts that
    // currently come from Wikidata profile enrichment alone stay in staging.
    birth: null,
    death: null,
    places: [],
    traditions: unique([...(person.traditions ?? []), 'roman-catholic']).sort(),
    categories,
    validationStatus: 'cross-checked',
    publicationStatus: 'published',
    publicationScope: 'identity-observance-only',
    sourceIds,
    publicEvidence: evidence,
  };
}

export function promoteReviewedNavigation(source, ledger) {
  if (source?.schemaVersion !== 1 || !Array.isArray(source.people) || !Array.isArray(source.unlinkedObservances)) {
    throw new Error('Navigation source must contain people and unlinkedObservances.');
  }
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.decisions)) {
    throw new Error('Publication ledger must use schemaVersion 1 with a decisions array.');
  }
  assertStagingOnly(source, 'Navigation source');
  assertStagingOnly(ledger, 'Publication ledger');

  const cloned = structuredClone(source);
  const people = new Map(cloned.people.map((person) => [person.entityId, person]));
  const observances = new Map(cloned.unlinkedObservances.map((event) => [event.id, event]));
  const seenPeople = new Set();
  const seenObservances = new Set();
  const publishedPeople = [];
  const publishedObservances = [];

  for (const decision of ledger.decisions) {
    if (decision?.decision !== 'publish-reviewed-identity-observance') {
      throw new Error(`Unsupported publication decision ${decision?.decision ?? '(missing)'}.`);
    }
    if (decision?.publicationScope !== 'identity-observance-only') {
      throw new Error(`Publication decision ${decision?.personEntityId ?? '(unknown)'} must use identity-observance-only scope.`);
    }
    if (typeof decision?.personEntityId !== 'string' || !decision.personEntityId) {
      throw new Error('Every publication decision needs personEntityId.');
    }
    if (!Array.isArray(decision.observanceIds) || !decision.observanceIds.length) {
      throw new Error(`Publication decision ${decision.personEntityId} needs at least one observanceId.`);
    }
    if (seenPeople.has(decision.personEntityId)) {
      throw new Error(`Duplicate publication decision for ${decision.personEntityId}.`);
    }
    seenPeople.add(decision.personEntityId);
    validateReviewMetadata(decision);

    const person = people.get(decision.personEntityId);
    if (!person) throw new Error(`Unknown publication person ${decision.personEntityId}.`);

    const evidence = [];
    for (const observanceId of decision.observanceIds) {
      if (typeof observanceId !== 'string' || !observanceId) {
        throw new Error(`Publication decision ${decision.personEntityId} contains an invalid observanceId.`);
      }
      if (seenObservances.has(observanceId)) throw new Error(`Observance ${observanceId} is published more than once.`);
      seenObservances.add(observanceId);
      const observance = observances.get(observanceId);
      if (!observance) throw new Error(`Publication decision references unknown observance ${observanceId}.`);
      if (observance.personEntityId !== decision.personEntityId || observance.personLinkStatus !== 'reviewed-linked') {
        throw new Error(`Observance ${observanceId} is not explicitly reviewed-linked to ${decision.personEntityId}.`);
      }
      if (observance?.linkReview?.decision !== 'link-single-person') {
        throw new Error(`Observance ${observanceId} lacks a single-person reviewed decision.`);
      }
      const sources = reviewedEvidence(observance);
      evidence.push(...sources);
      observance.validationStatus = 'cross-checked';
      observance.publicationStatus = 'published';
      observance.churchId = observance.churchId ?? 'roman-catholic';
      observance.sourceIds = unique([...(observance.sourceIds ?? []), ...sources.map((item) => item.sourceId)]).sort();
      observance.publicationScope = 'identity-observance-only';
      publishedObservances.push(observanceId);
    }

    const distinctEvidence = [...new Map(evidence.map((item) => [`${item.sourceFamily}:${item.sourceId}:${item.reference}`, item])).values()];
    const promoted = safePublicPerson(person, distinctEvidence);
    const personIndex = cloned.people.findIndex((candidate) => candidate.entityId === decision.personEntityId);
    cloned.people[personIndex] = promoted;
    people.set(decision.personEntityId, promoted);
    publishedPeople.push(decision.personEntityId);
  }

  cloned.publicPromotion = {
    schemaVersion: 1,
    appliedAt: new Date().toISOString(),
    decisionCount: ledger.decisions.length,
    publishedPersonCount: publishedPeople.length,
    publishedObservanceCount: publishedObservances.length,
    publishedPeople,
    publishedObservances,
    profileFactPolicy: 'withhold-single-source-profile-facts',
    publicationAllowed: false,
    productionMutation: false,
  };
  cloned.publicationAllowed = false;
  cloned.productionMutation = false;
  return cloned;
}

function main() {
  const input = argument('--input');
  const decisions = argument('--decisions');
  const output = argument('--output');
  if (!input || !decisions || !output) throw new Error('--input, --decisions and --output are required.');
  const source = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(path.resolve(decisions), 'utf8'));
  const promoted = promoteReviewedNavigation(source, ledger);
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(promoted, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(promoted.publicPromotion, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

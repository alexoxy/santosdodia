#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposeLiturgicalPersonLinks } from './propose-liturgical-person-links.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function assertStagingOnly(value, label) {
  if (value?.publicationAllowed !== false || value?.productionMutation !== false) {
    throw new Error(`${label} must remain staging-only.`);
  }
}

function evidenceSources(decision) {
  if (!Array.isArray(decision?.evidenceSources)) throw new Error(`Decision ${decision?.observanceId ?? '(unknown)'} must contain evidenceSources.`);
  return decision.evidenceSources.map((source) => {
    if (typeof source?.sourceId !== 'string' || !source.sourceId.trim()) throw new Error('Every evidence source needs sourceId.');
    if (typeof source?.sourceFamily !== 'string' || !source.sourceFamily.trim()) throw new Error('Every evidence source needs sourceFamily.');
    if (typeof source?.reference !== 'string' || !source.reference.trim()) throw new Error('Every evidence source needs reference.');
    return { sourceId: source.sourceId.trim(), sourceFamily: source.sourceFamily.trim(), reference: source.reference.trim() };
  });
}

function validateReviewMetadata(decision) {
  if (typeof decision?.reviewer !== 'string' || !decision.reviewer.trim()) throw new Error(`Decision ${decision?.observanceId ?? '(unknown)'} needs reviewer.`);
  if (typeof decision?.reviewedAt !== 'string' || Number.isNaN(Date.parse(decision.reviewedAt))) throw new Error(`Decision ${decision?.observanceId ?? '(unknown)'} needs a valid reviewedAt timestamp.`);
}

export function applyReviewedLiturgicalPersonLinks(source, ledger) {
  if (source?.schemaVersion !== 1 || !Array.isArray(source.people) || !Array.isArray(source.unlinkedObservances)) {
    throw new Error('Navigation source must contain people and unlinkedObservances.');
  }
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.decisions)) throw new Error('Reviewed link ledger must use schemaVersion 1 with a decisions array.');
  assertStagingOnly(source, 'Navigation source');
  assertStagingOnly(ledger, 'Reviewed link ledger');

  const people = new Map(source.people.map((person) => [person.entityId, person]));
  const observances = new Map(source.unlinkedObservances.map((event) => [event.id, event]));
  const proposals = new Map(proposeLiturgicalPersonLinks(source).proposals.map((proposal) => [proposal.observanceId, proposal]));
  const seen = new Set();
  const cloned = structuredClone(source);
  const clonedObservances = new Map(cloned.unlinkedObservances.map((event) => [event.id, event]));
  const stats = { decisions: 0, linked: 0, collective: 0, nonPerson: 0 };

  for (const decision of ledger.decisions) {
    if (typeof decision?.observanceId !== 'string' || !decision.observanceId) throw new Error('Every reviewed decision needs observanceId.');
    if (seen.has(decision.observanceId)) throw new Error(`Duplicate reviewed decision for ${decision.observanceId}.`);
    seen.add(decision.observanceId);
    validateReviewMetadata(decision);

    const original = observances.get(decision.observanceId);
    const event = clonedObservances.get(decision.observanceId);
    if (!original || !event) throw new Error(`Reviewed decision references unknown observance ${decision.observanceId}.`);
    const evidence = evidenceSources(decision);
    const eventSourceId = original?.source?.sourceId ?? original?.sourceIds?.[0] ?? null;
    if (eventSourceId && !evidence.some((item) => item.sourceId === eventSourceId)) {
      throw new Error(`Decision ${decision.observanceId} must retain the observance source as evidence.`);
    }

    if (decision.decision === 'link-single-person') {
      if (typeof decision.personEntityId !== 'string' || !people.has(decision.personEntityId)) {
        throw new Error(`Decision ${decision.observanceId} references unknown person ${decision.personEntityId ?? '(missing)'}.`);
      }
      const proposal = proposals.get(decision.observanceId);
      if (!proposal?.candidatePersonIds?.includes(decision.personEntityId)) {
        throw new Error(`Decision ${decision.observanceId} target is not a current review candidate.`);
      }
      const independentFamilies = new Set(evidence.map((item) => item.sourceFamily));
      if (independentFamilies.size < 2) {
        throw new Error(`Decision ${decision.observanceId} needs at least two independent source families.`);
      }
      if (original.personEntityId && original.personEntityId !== decision.personEntityId) {
        throw new Error(`Decision ${decision.observanceId} conflicts with an existing person link.`);
      }
      event.personEntityId = decision.personEntityId;
      event.personLinkStatus = 'reviewed-linked';
      stats.linked += 1;
    } else if (decision.decision === 'collective') {
      if (decision.personEntityId) throw new Error(`Collective decision ${decision.observanceId} must not set personEntityId.`);
      if (!evidence.length) throw new Error(`Collective decision ${decision.observanceId} needs source evidence.`);
      event.personEntityId = null;
      event.personLinkStatus = 'reviewed-collective';
      stats.collective += 1;
    } else if (decision.decision === 'non-person') {
      if (decision.personEntityId) throw new Error(`Non-person decision ${decision.observanceId} must not set personEntityId.`);
      if (!evidence.length) throw new Error(`Non-person decision ${decision.observanceId} needs source evidence.`);
      event.personEntityId = null;
      event.personLinkStatus = 'reviewed-non-person';
      stats.nonPerson += 1;
    } else {
      throw new Error(`Unsupported reviewed decision ${decision.decision ?? '(missing)'} for ${decision.observanceId}.`);
    }

    event.linkReview = {
      decision: decision.decision,
      reviewer: decision.reviewer.trim(),
      reviewedAt: new Date(decision.reviewedAt).toISOString(),
      evidenceSources: evidence
    };
    stats.decisions += 1;
  }

  cloned.linkReview = {
    schemaVersion: 1,
    appliedAt: new Date().toISOString(),
    ledgerDecisionCount: ledger.decisions.length,
    ...stats,
    publicationAllowed: false,
    productionMutation: false
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
  const reviewed = applyReviewedLiturgicalPersonLinks(source, ledger);
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(reviewed, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(reviewed.linkReview, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

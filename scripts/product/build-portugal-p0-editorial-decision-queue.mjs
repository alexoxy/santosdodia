#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REVIEWABLE_CORROBORATION = new Set([
  'candidate-for-reviewed-binding',
  'candidate-for-reviewed-binding-additional-observance',
  'reviewed-binding-live-match',
]);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function researchByReviewId(researchQueue) {
  return new Map((researchQueue?.items ?? []).map((item) => [item.reviewId, item]));
}

function decisionClassFor(corroboration, research) {
  if (corroboration.disposition === 'reviewed-binding-live-match') return 'verify-existing-reviewed-binding';
  if (corroboration.disposition === 'candidate-for-reviewed-binding-additional-observance') return 'review-additional-observance-link';
  if (corroboration.disposition === 'candidate-for-reviewed-binding') return 'review-new-calendar-person-link';
  if (research?.status === 'evidence-ready-for-editorial-review') return 'review-primary-source-supported-link';
  return 'blocked-pending-research';
}

function proposedDecisionFor(decisionClass) {
  if (decisionClass === 'verify-existing-reviewed-binding') return 'retain-existing-reviewed-link';
  if (decisionClass === 'review-additional-observance-link') return 'link-calendar-occurrence-to-person-as-additional-observance';
  if (decisionClass === 'review-new-calendar-person-link' || decisionClass === 'review-primary-source-supported-link') return 'link-calendar-occurrence-to-person';
  return null;
}

function evidenceBundle(corroboration, research) {
  return {
    vaticanSourceRecords: corroboration.sourceRecords ?? [],
    reviewedBinding: corroboration.reviewedBinding ?? null,
    primaryEvidenceCandidates: research?.primaryEvidenceCandidates ?? [],
    priorDisposition: corroboration.disposition,
    priorReason: corroboration.reason ?? null,
    researchStatus: research?.status ?? null,
    sourceGapKind: research?.sourceGapKind ?? null,
  };
}

export function buildPortugalP0EditorialDecisionQueue({ p0Pack, corroboration, researchQueue } = {}) {
  if (p0Pack?.schemaVersion !== 1 || p0Pack?.release !== 'roman-catholic-pt-2026-v2' || p0Pack?.publicationAllowed !== false || p0Pack?.productionMutation !== false || !Array.isArray(p0Pack?.items)) {
    throw new Error('Editorial decision queue requires the fail-closed Portugal P0 review pack.');
  }
  if (corroboration?.schemaVersion !== 1 || corroboration?.release !== p0Pack.release || corroboration?.publicationAllowed !== false || corroboration?.productionMutation !== false || !Array.isArray(corroboration?.items)) {
    throw new Error('Editorial decision queue requires the fail-closed Vatican corroboration result.');
  }
  if (researchQueue?.schemaVersion !== 1 || researchQueue?.release !== p0Pack.release || researchQueue?.publicationAllowed !== false || researchQueue?.productionMutation !== false || !Array.isArray(researchQueue?.items)) {
    throw new Error('Editorial decision queue requires the fail-closed independent research queue.');
  }
  if (p0Pack?.summary?.safety?.adsenseReviewState !== 'PREPARING' || corroboration?.summary?.safety?.adsenseReviewState !== 'PREPARING' || researchQueue?.summary?.safety?.adsenseReviewState !== 'PREPARING') {
    throw new Error('Editorial decision queue refuses inputs outside the AdSense PREPARING boundary.');
  }

  const p0ByReviewId = new Map(p0Pack.items.map((item) => [item.reviewId, item]));
  const researchIndex = researchByReviewId(researchQueue);
  const items = corroboration.items.map((row) => {
    const p0 = p0ByReviewId.get(row.reviewId);
    if (!p0) throw new Error(`Editorial row ${row.reviewId} is missing from the P0 pack.`);
    const research = researchIndex.get(row.reviewId) ?? null;
    const decisionClass = decisionClassFor(row, research);
    const reviewable = REVIEWABLE_CORROBORATION.has(row.disposition) || research?.status === 'evidence-ready-for-editorial-review';
    return {
      decisionId: `pt-2026-editorial:${row.sourceOccurrenceId}:${row.qid}`,
      reviewId: row.reviewId,
      sourceOccurrenceId: row.sourceOccurrenceId,
      canonicalEventId: row.canonicalEventId,
      dateISO: row.dateISO,
      qid: row.qid,
      entityId: row.entityId,
      calendarLabelPt: row.calendarLabelPt,
      personNamePt: row.personNamePt,
      alreadyPublic: p0.alreadyPublic === true,
      decisionClass,
      reviewStatus: reviewable ? 'ready-for-explicit-editorial-decision' : 'blocked-pending-research',
      proposedDecision: proposedDecisionFor(decisionClass),
      evidence: evidenceBundle(row, research),
      editorialDecision: null,
      reviewer: null,
      reviewedAt: null,
      decisionNote: null,
      decisionPolicy: {
        explicitHumanOrAuthorizedEditorialAgentDecisionRequired: true,
        proposalDoesNotEqualApproval: true,
        evidenceDoesNotEqualApproval: true,
        nameOnlyMergeForbidden: true,
        qidAndDateMustRemainStable: true,
        reviewedRegistryMutationAllowedByThisQueue: false,
      },
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowed: false,
      advertisingEligible: false,
    };
  });

  const ready = items.filter((item) => item.reviewStatus === 'ready-for-explicit-editorial-decision').length;
  const blocked = items.length - ready;
  const pendingNewDecisions = items.filter((item) => item.reviewStatus === 'ready-for-explicit-editorial-decision' && item.decisionClass !== 'verify-existing-reviewed-binding').length;
  const existingReviewedChecks = items.filter((item) => item.decisionClass === 'verify-existing-reviewed-binding').length;
  const decisionClasses = {};
  for (const item of items) decisionClasses[item.decisionClass] = (decisionClasses[item.decisionClass] ?? 0) + 1;

  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    totalItems: items.length,
    readyForExplicitEditorialDecision: ready,
    blockedPendingResearch: blocked,
    pendingNewDecisions,
    existingReviewedBindingChecks: existingReviewedChecks,
    decisionClasses,
    safety: {
      decisionQueueOnly: true,
      evidenceDoesNotEqualApproval: true,
      explicitEditorialDecisionRequired: true,
      reviewedRegistryMutationAllowed: false,
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

  if (items.length !== p0Pack.items.length) throw new Error(`Editorial decision accounting mismatch: p0=${p0Pack.items.length}, queue=${items.length}.`);
  if (ready + blocked !== items.length) throw new Error('Editorial readiness accounting mismatch.');
  if (items.some((item) => item.editorialDecision !== null || item.automaticLinkAllowed !== false || item.publicationAllowed !== false || item.advertisingEligible !== false)) {
    throw new Error('Editorial decision queue crossed its fail-closed boundary.');
  }

  return {
    schemaVersion: 1,
    generatedAt: summary.generatedAt,
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    publicationAllowed: false,
    productionMutation: false,
    summary,
    items,
  };
}

function main() {
  const p0Path = argument('--p0');
  const corroborationPath = argument('--corroboration');
  const researchPath = argument('--research');
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!p0Path || !corroborationPath || !researchPath || !outputPath || !summaryPath) {
    throw new Error('Usage: --p0 <review-pack.json> --corroboration <corroboration.json> --research <research.json> --output <decision-queue.json> --summary <summary.json>');
  }
  const result = buildPortugalP0EditorialDecisionQueue({
    p0Pack: JSON.parse(fs.readFileSync(path.resolve(p0Path), 'utf8')),
    corroboration: JSON.parse(fs.readFileSync(path.resolve(corroborationPath), 'utf8')),
    researchQueue: JSON.parse(fs.readFileSync(path.resolve(researchPath), 'utf8')),
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

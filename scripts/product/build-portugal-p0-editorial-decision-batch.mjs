#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function text(value) {
  return String(value ?? '').normalize('NFC').trim();
}

function laneFor({ p0, corroboration, research }) {
  if (p0.alreadyPublic === true) return 'existing-public-link-review';
  if (corroboration?.disposition === 'reviewed-binding-live-match') return 'reviewed-source-binding-verification';
  if (corroboration?.disposition === 'candidate-for-reviewed-binding-additional-observance') return 'additional-observance-review';
  if (corroboration?.disposition === 'candidate-for-reviewed-binding') return 'vatican-corroborated-link-review';
  if (research?.evidenceStatus === 'primary-source-evidence-ready') return 'primary-evidence-link-review';
  return 'defer-open-research';
}

function riskFor(lane) {
  if (lane === 'reviewed-source-binding-verification') return 'low';
  if (lane === 'vatican-corroborated-link-review') return 'standard';
  if (lane === 'existing-public-link-review' || lane === 'additional-observance-review') return 'elevated';
  if (lane === 'primary-evidence-link-review') return 'high';
  return 'blocked';
}

function evidenceSnapshot({ p0, corroboration, research }) {
  return {
    identityMatchEvidence: p0.matchEvidence ?? [],
    vaticanDisposition: corroboration?.disposition ?? null,
    vaticanReason: corroboration?.reason ?? null,
    vaticanSourceRecords: corroboration?.sourceRecords ?? [],
    vaticanMatchEvidence: corroboration?.matchEvidence ?? [],
    primaryEvidenceCandidates: research?.primaryEvidenceCandidates ?? [],
    evidenceStatus: research?.evidenceStatus ?? (corroboration ? 'vatican-corroboration-available' : 'missing'),
  };
}

export function buildPortugalP0EditorialDecisionBatch({ p0Pack } = {}) {
  if (p0Pack?.schemaVersion !== 1 || p0Pack?.release !== 'roman-catholic-pt-2026-v2' || p0Pack?.publicationAllowed !== false || p0Pack?.productionMutation !== false || !Array.isArray(p0Pack?.items)) {
    throw new Error('Editorial decision batch requires the fail-closed Portugal P0 review pack.');
  }
  if (p0Pack?.summary?.safety?.adsenseReviewState !== 'PREPARING' || p0Pack?.summary?.safety?.automaticLinkAllowed !== false || p0Pack?.summary?.safety?.automaticPublicationAllowed !== false) {
    throw new Error('Editorial decision batch refuses a P0 pack outside the AdSense PREPARING boundary.');
  }
  const corroboration = p0Pack?.vaticanCorroboration;
  const researchQueue = p0Pack?.independentResearchQueue;
  if (corroboration?.schemaVersion !== 1 || corroboration?.publicationAllowed !== false || corroboration?.productionMutation !== false || !Array.isArray(corroboration?.items)) {
    throw new Error('Editorial decision batch requires Vatican corroboration results.');
  }
  if (researchQueue?.schemaVersion !== 1 || researchQueue?.publicationAllowed !== false || researchQueue?.productionMutation !== false || !Array.isArray(researchQueue?.items)) {
    throw new Error('Editorial decision batch requires the residual research queue.');
  }

  const corroborationByReview = new Map(corroboration.items.map((row) => [row.reviewId, row]));
  const researchByReview = new Map(researchQueue.items.map((row) => [row.reviewId, row]));
  const items = p0Pack.items.map((p0) => {
    const corroborationRow = corroborationByReview.get(p0.reviewId) ?? null;
    const researchRow = researchByReview.get(p0.reviewId) ?? null;
    if (!corroborationRow) throw new Error(`Editorial row ${p0.reviewId} is missing Vatican corroboration.`);
    const lane = laneFor({ p0, corroboration: corroborationRow, research: researchRow });
    const evidence = evidenceSnapshot({ p0, corroboration: corroborationRow, research: researchRow });
    return {
      editorialReviewId: `editorial:${p0.reviewId}`,
      reviewId: p0.reviewId,
      sourceOccurrenceId: p0.sourceOccurrenceId,
      canonicalEventId: p0.canonicalEventId,
      dateISO: p0.dateISO,
      qid: p0.proposedPerson?.qid ?? corroborationRow.qid,
      entityId: p0.proposedPerson?.entityId ?? corroborationRow.entityId,
      calendarLabelPt: text(p0?.calendar?.labels?.pt) || null,
      personNamePt: text(p0?.proposedPerson?.names?.pt) || null,
      alreadyPublic: p0.alreadyPublic === true,
      reviewLane: lane,
      reviewRisk: riskFor(lane),
      evidence,
      allowedDecisions: ['accept-link', 'reject-link', 'defer'],
      decision: null,
      reviewer: null,
      reviewedAt: null,
      reviewerNotes: null,
      decisionAuthority: 'explicit-reviewed-ledger-only',
      evidenceDoesNotEqualApproval: true,
      agentMayPrepareDecision: true,
      agentMayApplyDecision: false,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowed: false,
      advertisingEligible: false,
    };
  });

  const lanes = {};
  const risks = {};
  for (const item of items) {
    lanes[item.reviewLane] = (lanes[item.reviewLane] ?? 0) + 1;
    risks[item.reviewRisk] = (risks[item.reviewRisk] ?? 0) + 1;
  }
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    editorialItems: items.length,
    lanes,
    risks,
    decisionState: {
      undecided: items.filter((item) => item.decision === null).length,
      accepted: 0,
      rejected: 0,
      deferred: 0,
    },
    readiness: {
      evidenceReady: items.filter((item) => item.reviewLane !== 'defer-open-research').length,
      blockedOpenResearch: items.filter((item) => item.reviewLane === 'defer-open-research').length,
    },
    safety: {
      editorialPreparationOnly: true,
      agentMayApplyDecision: false,
      explicitReviewedLedgerRequired: true,
      evidenceDoesNotEqualApproval: true,
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

  if (items.length !== p0Pack.items.length) throw new Error('Editorial decision batch accounting mismatch.');
  if (items.some((item) => item.decision !== null || item.agentMayApplyDecision !== false || item.automaticLinkAllowed !== false || item.publicationAllowed !== false || item.advertisingEligible !== false)) {
    throw new Error('Editorial decision batch crossed its preparation-only boundary.');
  }
  if (summary.readiness.evidenceReady + summary.readiness.blockedOpenResearch !== items.length) throw new Error('Editorial readiness accounting mismatch.');

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
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!p0Path || !outputPath || !summaryPath) throw new Error('Usage: --p0 <review-pack.json> --output <editorial-batch.json> --summary <summary.json>');
  const result = buildPortugalP0EditorialDecisionBatch({ p0Pack: JSON.parse(fs.readFileSync(path.resolve(p0Path), 'utf8')) });
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.mkdirSync(path.dirname(path.resolve(summaryPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve(summaryPath), `${JSON.stringify(result.summary, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(result.summary, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

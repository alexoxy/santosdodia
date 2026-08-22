#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UNRESOLVED = new Set([
  'needs-independent-source-research',
  'ambiguous-vatican-record',
  'source-unavailable',
  'reviewed-binding-live-drift',
  'reviewed-binding-live-ambiguous',
  'reviewed-binding-registry-ambiguous',
]);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function gapKind(row) {
  if (row.disposition === 'source-unavailable') return 'vatican-source-unavailable';
  if (row.disposition === 'ambiguous-vatican-record') return 'vatican-same-day-ambiguous';
  if (row.disposition === 'reviewed-binding-live-drift') return 'reviewed-binding-live-drift';
  if (row.disposition === 'reviewed-binding-live-ambiguous') return 'reviewed-binding-live-ambiguous';
  if (row.disposition === 'reviewed-binding-registry-ambiguous') return 'reviewed-binding-registry-ambiguous';
  return (row.sourceRecords ?? []).length ? 'vatican-same-day-unmatched' : 'vatican-no-record';
}

function researchPriority(kind) {
  if (kind.startsWith('reviewed-binding-')) return 'R0';
  if (kind === 'vatican-same-day-ambiguous' || kind === 'vatican-same-day-unmatched') return 'R1';
  return 'R2';
}

export function buildPortugalP0IndependentResearchQueue({ p0Pack, corroboration } = {}) {
  if (p0Pack?.schemaVersion !== 1 || p0Pack?.release !== 'roman-catholic-pt-2026-v2' || p0Pack?.publicationAllowed !== false || p0Pack?.productionMutation !== false || !Array.isArray(p0Pack?.items)) {
    throw new Error('Independent research queue requires the fail-closed Portugal P0 review pack.');
  }
  if (corroboration?.schemaVersion !== 1 || corroboration?.release !== p0Pack.release || corroboration?.publicationAllowed !== false || corroboration?.productionMutation !== false || !Array.isArray(corroboration?.items)) {
    throw new Error('Independent research queue requires the fail-closed Vatican corroboration result.');
  }
  if (p0Pack?.summary?.safety?.adsenseReviewState !== 'PREPARING' || corroboration?.summary?.safety?.adsenseReviewState !== 'PREPARING') {
    throw new Error('Independent research queue refuses inputs outside the AdSense PREPARING boundary.');
  }

  const p0ByReviewId = new Map(p0Pack.items.map((row) => [row.reviewId, row]));
  const items = corroboration.items.filter((row) => UNRESOLVED.has(row.disposition)).map((row) => {
    const p0 = p0ByReviewId.get(row.reviewId);
    if (!p0) throw new Error(`Research row ${row.reviewId} is missing from the P0 pack.`);
    const sourceGapKind = gapKind(row);
    return {
      researchId: `pt-2026-research:${row.sourceOccurrenceId}:${row.qid}`,
      reviewId: row.reviewId,
      sourceOccurrenceId: row.sourceOccurrenceId,
      canonicalEventId: row.canonicalEventId,
      dateISO: row.dateISO,
      qid: row.qid,
      entityId: row.entityId,
      calendarLabelPt: row.calendarLabelPt,
      personNamePt: row.personNamePt,
      sourceGapKind,
      researchPriority: researchPriority(sourceGapKind),
      priorDisposition: row.disposition,
      priorReason: row.reason,
      vaticanSourceRecords: row.sourceRecords ?? [],
      researchTarget: {
        claimClass: 'feast-or-observance-link',
        oneFirstPartyAuthorityMaySufficeForEvidence: true,
        otherwiseMinimumIndependentSources: 2,
        preferredSourceClasses: [
          'official-holy-see-or-diocesan-calendar',
          'official-order-or-congregation-source',
          'authoritative-national-liturgical-source',
          'independent-reviewed-hagiographic-reference',
        ],
      },
      decisionPolicy: {
        nameOnlyMergeForbidden: true,
        qidAndDateMustRemainStable: true,
        evidenceMaySupportReviewButNeverAutoApprove: true,
      },
      status: 'research-required',
      reviewerDecision: null,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowed: false,
      advertisingEligible: false,
    };
  });

  const counts = {};
  const priorities = {};
  for (const item of items) {
    counts[item.sourceGapKind] = (counts[item.sourceGapKind] ?? 0) + 1;
    priorities[item.researchPriority] = (priorities[item.researchPriority] ?? 0) + 1;
  }
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    researchItems: items.length,
    sourceGapKinds: counts,
    priorities,
    evidencePolicy: {
      claimClass: 'feast-or-observance-link',
      singleFirstPartyAuthorityAllowed: true,
      minimumIndependentSourcesOtherwise: 2,
    },
    safety: {
      researchOnly: true,
      evidenceDoesNotEqualApproval: true,
      nameOnlyMergeForbidden: true,
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

  if (items.length !== corroboration.summary.unresolvedForIndependentResearch) throw new Error(`Research queue accounting mismatch: corroboration=${corroboration.summary.unresolvedForIndependentResearch}, queue=${items.length}.`);
  if (items.some((item) => item.automaticLinkAllowed !== false || item.publicationAllowed !== false || item.advertisingEligible !== false)) throw new Error('Independent research queue crossed its fail-closed boundary.');

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
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!p0Path || !corroborationPath || !outputPath || !summaryPath) throw new Error('Usage: --p0 <review-pack.json> --corroboration <candidates.json> --output <research-queue.json> --summary <summary.json>');
  const result = buildPortugalP0IndependentResearchQueue({
    p0Pack: JSON.parse(fs.readFileSync(path.resolve(p0Path), 'utf8')),
    corroboration: JSON.parse(fs.readFileSync(path.resolve(corroborationPath), 'utf8')),
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

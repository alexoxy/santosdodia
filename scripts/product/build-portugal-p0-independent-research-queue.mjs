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

function loadDefaultPrimaryEvidence() {
  const evidencePath = path.resolve('config/corroboration-source-evidence.portugal-p0-primary.json');
  if (!fs.existsSync(evidencePath)) return null;
  return JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
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

function evidenceKey(qid, dateISO) {
  return `${qid}|${dateISO}`;
}

function validatePrimaryEvidence(primaryEvidence, release) {
  if (!primaryEvidence) return new Map();
  if (primaryEvidence.schemaVersion !== 1 || primaryEvidence.release !== release || primaryEvidence.claimClass !== 'feast-or-observance-link' || primaryEvidence.publicationAllowed !== false || primaryEvidence.productionMutation !== false || !Array.isArray(primaryEvidence.records)) {
    throw new Error('Primary evidence registry is missing its fail-closed feast-or-observance contract.');
  }
  if (primaryEvidence?.safety?.proposalOnly !== true || primaryEvidence?.safety?.sourceEvidenceDoesNotEqualBindingApproval !== true || primaryEvidence?.safety?.reviewedBindingRegistryMutationAllowed !== false || primaryEvidence?.safety?.adsenseReviewState !== 'PREPARING') {
    throw new Error('Primary evidence registry crossed its proposal-only AdSense PREPARING boundary.');
  }
  const index = new Map();
  const ids = new Set();
  for (const record of primaryEvidence.records) {
    if (!record?.evidenceId || ids.has(record.evidenceId)) throw new Error(`Invalid or duplicate primary evidence id: ${record?.evidenceId ?? '<missing>'}.`);
    ids.add(record.evidenceId);
    if (!/^Q[1-9]\d*$/u.test(record.qid ?? '') || !/^2026-\d{2}-\d{2}$/u.test(record.dateISO ?? '') || record.firstParty !== true || record.evidenceKind === undefined || !String(record.sourceUrl ?? '').startsWith('https://')) {
      throw new Error(`Invalid primary evidence record ${record.evidenceId}.`);
    }
    const key = evidenceKey(record.qid, record.dateISO);
    const list = index.get(key) ?? [];
    list.push(record);
    index.set(key, list);
  }
  return index;
}

function verifiedEvidenceForRow(row, evidenceIndex) {
  const candidates = evidenceIndex.get(evidenceKey(row.qid, row.dateISO)) ?? [];
  const sourceHashes = new Set((row.sourceRecords ?? []).map((record) => record.sourceRecordHash).filter(Boolean));
  return candidates.flatMap((record) => {
    if (record.sourceId === 'vatican-news-saint-of-day-pt') {
      // The latest Vatican acquisition may be intentionally scoped to one
      // month. Evidence for dates outside that package is not invalid; it is
      // simply unverifiable in this run and must remain in open research.
      if (!record.sourceRecordHash || !sourceHashes.has(record.sourceRecordHash)) return [];
    }
    return [{
      ...record,
      claimClass: 'feast-or-observance-link',
      evidenceStatus: 'source-verified-proposal',
      bindingDecisionStatus: 'pending-editorial-review',
      automaticBindingAllowed: false,
      automaticPublicationAllowed: false,
    }];
  });
}

export function buildPortugalP0IndependentResearchQueue({ p0Pack, corroboration, primaryEvidence } = {}) {
  if (p0Pack?.schemaVersion !== 1 || p0Pack?.release !== 'roman-catholic-pt-2026-v2' || p0Pack?.publicationAllowed !== false || p0Pack?.productionMutation !== false || !Array.isArray(p0Pack?.items)) {
    throw new Error('Independent research queue requires the fail-closed Portugal P0 review pack.');
  }
  if (corroboration?.schemaVersion !== 1 || corroboration?.release !== p0Pack.release || corroboration?.publicationAllowed !== false || corroboration?.productionMutation !== false || !Array.isArray(corroboration?.items)) {
    throw new Error('Independent research queue requires the fail-closed Vatican corroboration result.');
  }
  if (p0Pack?.summary?.safety?.adsenseReviewState !== 'PREPARING' || corroboration?.summary?.safety?.adsenseReviewState !== 'PREPARING') {
    throw new Error('Independent research queue refuses inputs outside the AdSense PREPARING boundary.');
  }

  const resolvedPrimaryEvidence = primaryEvidence === undefined ? loadDefaultPrimaryEvidence() : primaryEvidence;
  const evidenceIndex = validatePrimaryEvidence(resolvedPrimaryEvidence, p0Pack.release);
  const p0ByReviewId = new Map(p0Pack.items.map((row) => [row.reviewId, row]));
  const items = corroboration.items.filter((row) => UNRESOLVED.has(row.disposition)).map((row) => {
    const p0 = p0ByReviewId.get(row.reviewId);
    if (!p0) throw new Error(`Research row ${row.reviewId} is missing from the P0 pack.`);
    const sourceGapKind = gapKind(row);
    const primaryEvidenceCandidates = verifiedEvidenceForRow(row, evidenceIndex);
    const evidenceReady = primaryEvidenceCandidates.length > 0;
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
      primaryEvidenceCandidates,
      evidenceStatus: evidenceReady ? 'primary-source-evidence-ready' : 'open-research',
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
      status: evidenceReady ? 'evidence-ready-for-editorial-review' : 'research-required',
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
  const evidenceReadyForEditorialReview = items.filter((item) => item.status === 'evidence-ready-for-editorial-review').length;
  const remainingOpenResearch = items.filter((item) => item.status === 'research-required').length;
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    researchItems: items.length,
    sourceGapKinds: counts,
    priorities,
    primaryEvidence: {
      configuredRecords: resolvedPrimaryEvidence?.records?.length ?? 0,
      evidenceReadyForEditorialReview,
      remainingOpenResearch,
    },
    evidencePolicy: {
      claimClass: 'feast-or-observance-link',
      singleFirstPartyAuthorityAllowed: true,
      minimumIndependentSourcesOtherwise: 2,
    },
    safety: {
      researchOnly: true,
      evidenceDoesNotEqualApproval: true,
      primaryEvidenceDoesNotEqualBindingApproval: true,
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
  if (evidenceReadyForEditorialReview + remainingOpenResearch !== items.length) throw new Error('Primary evidence accounting mismatch.');
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
  const primaryEvidencePath = argument('--primary-evidence');
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!p0Path || !corroborationPath || !outputPath || !summaryPath) throw new Error('Usage: --p0 <review-pack.json> --corroboration <candidates.json> [--primary-evidence <evidence.json>] --output <research-queue.json> --summary <summary.json>');
  const result = buildPortugalP0IndependentResearchQueue({
    p0Pack: JSON.parse(fs.readFileSync(path.resolve(p0Path), 'utf8')),
    corroboration: JSON.parse(fs.readFileSync(path.resolve(corroborationPath), 'utf8')),
    primaryEvidence: primaryEvidencePath ? JSON.parse(fs.readFileSync(path.resolve(primaryEvidencePath), 'utf8')) : null,
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

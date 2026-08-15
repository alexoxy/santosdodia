#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function sourceMeta(item, normalizedById) {
  const source = normalizedById.get(item.sourceOccurrenceId);
  return {
    sourceOccurrenceId: item.sourceOccurrenceId,
    sourceCanonicalEventId: item.sourceCanonicalEventId,
    sourceUid: item.sourceUid,
    dateISO: item.dateISO,
    sourceLabel: item.sourceLabel,
    sourceRank: item.sourceRank,
    sourceDayKey: source?.sourceFacts?.sourceDayKey ?? null,
    sourceOrdinal: source?.sourceFacts?.sourceOrdinal ?? 0,
    alternativeGroupId: source?.sourceFacts?.alternativeGroupId ?? null,
    groupedAlternative: source?.sourceFacts?.groupedAlternative === true,
  };
}
function candidateMeta(item) {
  if (!item?.candidate) return null;
  return {
    canonicalEventId: item.candidate.canonicalEventId,
    generalRomanId: item.candidate.generalRomanId,
    generalRomanDateISO: item.candidate.generalRomanDateISO,
    generalRomanRank: item.candidate.generalRomanRank,
    lexicalScore: item.candidate.lexicalScore,
    score: item.candidate.score,
    sameDate: item.candidate.sameDate,
    dateDistanceDays: item.candidate.dateDistanceDays,
    ranksAgree: item.candidate.ranksAgree,
  };
}

export function buildPortugalJurisdictionOverlayPlan({ normalized, reconciliation }) {
  if (normalized?.run?.publicationAllowed !== false || normalized?.run?.promotionAllowed !== false) {
    throw new Error('Portugal overlay planning requires a withheld SNL package.');
  }
  if (reconciliation?.mode !== 'proposal-only' || reconciliation?.productionWriteAllowed !== false || reconciliation?.automaticLinkAllowed !== false) {
    throw new Error('Portugal overlay planning requires proposal-only reconciliation.');
  }

  const normalizedById = new Map((normalized.events ?? []).map((item) => [item.id, item]));
  const inheritGeneral = [];
  const provenanceBindingCandidates = [];
  const blockingDeltaReview = [];

  for (const item of reconciliation.items ?? []) {
    if (!normalizedById.has(item.sourceOccurrenceId)) throw new Error(`Missing normalized source occurrence ${item.sourceOccurrenceId}.`);
    const base = { ...sourceMeta(item, normalizedById), candidate: candidateMeta(item) };

    if (item.disposition === 'structural-review') {
      inheritGeneral.push({
        ...base,
        plan: 'inherit-general-no-pt-row',
        reason: 'No Portugal-specific semantic delta has been established; the already approved General Roman occurrence remains authoritative.',
        blocksPortugalPublication: false,
        humanReviewRequired: false,
        productionWriteAllowed: false,
      });
      continue;
    }

    if (item.disposition === 'canonical-link-proposal') {
      if (!item.candidate?.sameDate) throw new Error(`Canonical-link proposal is not on the same date: ${item.sourceOccurrenceId}`);
      inheritGeneral.push({
        ...base,
        plan: 'inherit-general-no-pt-row',
        reason: 'Strong same-date evidence indicates the SNL observance is already represented by the General Roman event; no jurisdiction override is needed.',
        blocksPortugalPublication: false,
        humanReviewRequired: false,
        productionWriteAllowed: false,
      });
      provenanceBindingCandidates.push({
        ...base,
        plan: 'optional-provenance-binding-review',
        reason: 'A reviewed source-to-canonical binding is useful for Portuguese source provenance and future monitoring, but is not required to publish an unchanged inherited calendar occurrence.',
        blocksPortugalPublication: false,
        humanReviewRequired: true,
        productionWriteAllowed: false,
      });
      continue;
    }

    if (['ambiguous-review', 'rank-delta-review', 'transfer-candidate-review', 'portugal-proper-or-unmatched'].includes(item.disposition)) {
      blockingDeltaReview.push({
        ...base,
        disposition: item.disposition,
        reconciliationReason: item.reason,
        alternatives: (item.alternatives ?? []).slice(0, 3).map(candidateMeta).filter(Boolean),
        plan: 'review-before-pt-overlay',
        reason: item.disposition === 'rank-delta-review'
          ? 'A Portugal rank difference would change the inherited calendar and requires explicit review.'
          : item.disposition === 'transfer-candidate-review'
            ? 'A Portugal date transfer would change the inherited calendar and requires explicit review.'
            : item.disposition === 'ambiguous-review'
              ? 'The source may be an inherited General Roman observance or a Portugal-specific proper; identity must be resolved before overlay publication.'
              : 'The source appears Portugal-specific or lacks a safe General Roman match and must be classified before overlay publication.',
        blocksPortugalPublication: true,
        humanReviewRequired: true,
        productionWriteAllowed: false,
      });
      continue;
    }

    throw new Error(`Unsupported Portugal reconciliation disposition ${String(item.disposition)}.`);
  }

  const sort = (a, b) => a.dateISO.localeCompare(b.dateISO) || a.sourceLabel.localeCompare(b.sourceLabel, 'pt');
  inheritGeneral.sort(sort);
  provenanceBindingCandidates.sort(sort);
  blockingDeltaReview.sort(sort);

  const inputOccurrences = reconciliation.items?.length ?? 0;
  if (inheritGeneral.length + blockingDeltaReview.length !== inputOccurrences) {
    throw new Error('Portugal overlay inheritance and blocking-delta queues do not partition source occurrences.');
  }
  if (inheritGeneral.some((item) => item.productionWriteAllowed || item.blocksPortugalPublication)) {
    throw new Error('General-calendar inheritance must never create a Portugal production mutation.');
  }

  return {
    schemaVersion: 1,
    mode: 'jurisdiction-delta-overlay-plan',
    churchId: 'roman-catholic',
    jurisdictionId: 'PT',
    baseCalendar: 'roman-catholic-general',
    generatedAt: new Date().toISOString(),
    productionWriteAllowed: false,
    overlayPublicationAllowed: false,
    model: {
      inheritance: 'Portugal inherits every approved General Roman occurrence unless a reviewed Portugal-specific delta overrides or supplements it.',
      noDuplicateRows: 'An unchanged General Roman occurrence must not be copied into the PT overlay merely to prove 365-day coverage.',
      deltaTypes: ['proper-observance', 'additional-observance', 'rank-change', 'date-transfer', 'precedence-or-omission'],
      humanBoundary: 'Only a candidate that would change or add to the inherited calendar blocks PT overlay publication. Optional provenance bindings do not.',
    },
    sourceCoverage: normalized.coverage,
    summary: {
      inputOccurrences,
      inheritGeneralNoPtRow: inheritGeneral.length,
      optionalProvenanceBindingReview: provenanceBindingCandidates.length,
      blockingDeltaReview: blockingDeltaReview.length,
      humanReviewReductionPercent: inputOccurrences ? Number(((1 - blockingDeltaReview.length / inputOccurrences) * 100).toFixed(1)) : 0,
    },
    inheritGeneral,
    provenanceBindingCandidates,
    blockingDeltaReview,
  };
}

function main() {
  const normalizedPath = path.resolve(argument('--normalized', 'staging/portugal-snl/normalized-package.json'));
  const reconciliationPath = path.resolve(argument('--reconciliation', 'staging/portugal-snl/reconciliation.json'));
  const outputPath = path.resolve(argument('--output', 'staging/portugal-snl/overlay-plan.json'));
  const result = buildPortugalJurisdictionOverlayPlan({
    normalized: readJson(normalizedPath),
    reconciliation: readJson(reconciliationPath),
  });
  writeJson(outputPath, result);
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

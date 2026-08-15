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
function compactCandidate(item) {
  if (!item?.candidate) return null;
  return {
    canonicalEventId: item.candidate.canonicalEventId,
    generalRomanId: item.candidate.generalRomanId,
    generalRomanDateISO: item.candidate.generalRomanDateISO,
    generalRomanRank: item.candidate.generalRomanRank,
    generalRomanGrade: item.candidate.generalRomanGrade,
    bestComparedName: item.candidate.bestComparedName,
    lexicalScore: item.candidate.lexicalScore,
    score: item.candidate.score,
    sameDate: item.candidate.sameDate,
    dateDistanceDays: item.candidate.dateDistanceDays,
    ranksAgree: item.candidate.ranksAgree,
  };
}
function sourceMetadata(item, normalizedById) {
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
    dayLabel: source?.sourceFacts?.dayLabel ?? null,
    evidenceHeading: source?.sourceFacts?.description ?? null,
  };
}
function reviewItem(item, normalizedById, reviewClass, reviewerQuestion) {
  return {
    ...sourceMetadata(item, normalizedById),
    reviewClass,
    reviewerQuestion,
    reconciliationReason: item.reason,
    candidate: compactCandidate(item),
    alternatives: (item.alternatives ?? []).slice(0, 3).map((candidate) => ({
      canonicalEventId: candidate.canonicalEventId,
      generalRomanId: candidate.generalRomanId,
      generalRomanDateISO: candidate.generalRomanDateISO,
      generalRomanRank: candidate.generalRomanRank,
      bestComparedName: candidate.bestComparedName,
      lexicalScore: candidate.lexicalScore,
      score: candidate.score,
    })),
    decision: 'pending-human-review',
    productionWriteAllowed: false,
  };
}

export function buildPortugalReviewBundle({ normalized, reconciliation }) {
  if (normalized?.run?.publicationAllowed !== false || normalized?.run?.promotionAllowed !== false) {
    throw new Error('Review bundle requires a withheld Portugal package.');
  }
  if (reconciliation?.mode !== 'proposal-only' || reconciliation?.productionWriteAllowed !== false || reconciliation?.automaticLinkAllowed !== false) {
    throw new Error('Review bundle requires proposal-only reconciliation.');
  }
  const normalizedById = new Map((normalized.events ?? []).map((item) => [item.id, item]));
  const queues = {
    'link-confirmation': [],
    'semantic-ambiguity': [],
    'rank-delta': [],
    'transfer': [],
    'portugal-proper-or-unmatched': [],
    'structural-day': [],
  };

  for (const item of reconciliation.items ?? []) {
    if (!normalizedById.has(item.sourceOccurrenceId)) throw new Error(`Missing normalized source occurrence ${item.sourceOccurrenceId}.`);
    if (item.disposition === 'canonical-link-proposal') {
      queues['link-confirmation'].push(reviewItem(item, normalizedById, 'canonical-link-confirmation', 'Does this SNL Portugal observance refer to the proposed General Roman canonical event?'));
    } else if (item.disposition === 'ambiguous-review') {
      queues['semantic-ambiguity'].push(reviewItem(item, normalizedById, 'semantic-ambiguity', 'Which canonical event, if any, does this SNL observance represent?'));
    } else if (item.disposition === 'rank-delta-review') {
      queues['rank-delta'].push(reviewItem(item, normalizedById, 'rank-delta', 'Is the event identity correct and is the different Portugal rank an intentional jurisdictional proper?'));
    } else if (item.disposition === 'transfer-candidate-review') {
      queues.transfer.push(reviewItem(item, normalizedById, 'transfer-candidate', 'Is this an intentional Portugal transfer of the proposed General Roman event?'));
    } else if (item.disposition === 'portugal-proper-or-unmatched') {
      queues['portugal-proper-or-unmatched'].push(reviewItem(item, normalizedById, 'portugal-proper-or-unmatched', 'Is this a Portugal proper observance, a missing General Roman match, or a parsing/matching issue?'));
    } else if (item.disposition === 'structural-review') {
      queues['structural-day'].push(reviewItem(item, normalizedById, 'structural-day', 'Is the SNL day label the same liturgical day/event as the sole General Roman event on this date?'));
    } else {
      throw new Error(`Unsupported reconciliation disposition ${String(item.disposition)}.`);
    }
  }

  for (const queue of Object.values(queues)) {
    queue.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.sourceLabel.localeCompare(b.sourceLabel, 'pt'));
  }
  const counts = Object.fromEntries(Object.entries(queues).map(([key, value]) => [key, value.length]));
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total !== (reconciliation.items ?? []).length) throw new Error('Review queues do not partition reconciliation items.');

  return {
    schemaVersion: 1,
    mode: 'human-review-by-exception',
    churchId: 'roman-catholic',
    jurisdictionId: 'PT',
    generatedAt: new Date().toISOString(),
    productionWriteAllowed: false,
    approvalSemantics: {
      defaultDecision: 'pending-human-review',
      canonicalLinkApproval: 'A reviewer must explicitly approve sourceOccurrenceId -> canonicalEventId. Matching score alone never approves a link.',
      rankAndTransferApproval: 'Rank changes and transfers require a separate explicit reviewer decision even when event identity is approved.',
      groupedAlternatives: 'Each extracted alternative is reviewed independently while retaining its common source alternativeGroupId.',
    },
    sourceCoverage: normalized.coverage,
    summary: {
      inputOccurrences: total,
      ...counts,
    },
    queues,
  };
}

function main() {
  const normalizedPath = path.resolve(argument('--normalized', 'staging/portugal-snl/normalized-package.json'));
  const reconciliationPath = path.resolve(argument('--reconciliation', 'staging/portugal-snl/reconciliation.json'));
  const outputDir = path.resolve(argument('--output-dir', 'staging/portugal-snl/review'));
  const result = buildPortugalReviewBundle({ normalized: readJson(normalizedPath), reconciliation: readJson(reconciliationPath) });
  writeJson(path.join(outputDir, 'review-bundle.json'), result);
  for (const [name, items] of Object.entries(result.queues)) {
    writeJson(path.join(outputDir, `${name}.json`), {
      schemaVersion: 1,
      mode: result.mode,
      churchId: result.churchId,
      jurisdictionId: result.jurisdictionId,
      productionWriteAllowed: false,
      generatedAt: result.generatedAt,
      count: items.length,
      items,
    });
  }
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

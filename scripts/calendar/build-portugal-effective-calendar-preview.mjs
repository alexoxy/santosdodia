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
function clean(value) { return String(value ?? '').normalize('NFC').trim(); }
function sourceLabels(decision) {
  return [...new Set([decision.sourceLabel, ...(decision.sourceLabels ?? [])].map(clean).filter(Boolean))];
}
function decisionMatchesSource(decision, item) {
  if (!(decision.coversBlockingDates ?? []).includes(item.dateISO)) return false;
  return sourceLabels(decision).includes(clean(item.sourceLabel));
}
function findDecision(plan, item) {
  const matches = (plan.decisions ?? []).filter((decision) => decisionMatchesSource(decision, item));
  if (matches.length !== 1) throw new Error(`${item.dateISO} ${item.sourceLabel}: expected exactly one prepared delta decision, found ${matches.length}.`);
  return matches[0];
}
function categoryForCanonical(canonicalEventId, decision = null) {
  if (decision?.type === 'portugal-proper-observance') {
    if (/FiveWounds/u.test(canonicalEventId)) return 'feast';
    return 'saint';
  }
  if (/Lady|Mary|Marian|Heart|Fatima|Carmel|Conception/u.test(canonicalEventId)) return 'marian';
  if (/Apost|Matthias|CyrilMethodius/u.test(canonicalEventId)) return 'apostle';
  if (/Martyr|Stephen/u.test(canonicalEventId)) return 'martyr';
  if (/Sunday|Weekday|Epiphany|Ascension|Pentecost|Trinity|Christmas|Lent|Easter|Advent|GoodFri|HolyWeek/u.test(canonicalEventId)) return 'feast';
  return 'saint';
}
function resolutionForBlocking(item, decision) {
  if (decision.type === 'date-transfer') {
    if (item.dateISO === decision.toDate && clean(item.sourceLabel) !== clean(decision.replacementAtOrigin?.labels?.pt)) {
      return { canonicalEventId: decision.canonicalEventId, rank: decision.rank ?? item.sourceRank ?? null, resolution: 'pending-transfer-destination' };
    }
    if (item.dateISO === decision.fromDate && decision.replacementAtOrigin) {
      return {
        canonicalEventId: decision.replacementAtOrigin.canonicalEventId,
        rank: decision.replacementAtOrigin.rank ?? item.sourceRank ?? null,
        labels: decision.replacementAtOrigin.labels ?? null,
        resolution: 'pending-transfer-origin-replacement',
      };
    }
    throw new Error(`${decision.id}: source row ${item.dateISO} ${item.sourceLabel} does not match transfer origin/destination semantics.`);
  }
  if (decision.type === 'rank-override') {
    return { canonicalEventId: decision.canonicalEventId, rank: decision.rank, resolution: 'pending-rank-override' };
  }
  if (decision.type === 'portugal-proper-observance') {
    return { canonicalEventId: decision.canonicalEventId, rank: decision.rank, labels: decision.labels ?? null, resolution: 'pending-portugal-proper' };
  }
  throw new Error(`Unsupported prepared decision type ${String(decision.type)}.`);
}

export function buildPortugalEffectiveCalendarPreview({ normalized, reconciliation, reviewPlan }) {
  if (normalized?.run?.publicationAllowed !== false || normalized?.run?.promotionAllowed !== false) throw new Error('Effective Portugal preview requires withheld normalized SNL data.');
  if (reconciliation?.mode !== 'proposal-only' || reconciliation?.productionWriteAllowed !== false) throw new Error('Effective Portugal preview requires proposal-only reconciliation.');
  if (reviewPlan?.productionWriteAllowed !== false) throw new Error('Portugal review plan must remain production-write disabled.');

  const normalizedById = new Map((normalized.events ?? []).map((event) => [event.id, event]));
  const items = [];
  const decisionsUsed = new Set();
  let inheritedSafe = 0;
  let pendingReviewRows = 0;

  for (const item of reconciliation.items ?? []) {
    const source = normalizedById.get(item.sourceOccurrenceId);
    if (!source) throw new Error(`Missing normalized SNL occurrence ${item.sourceOccurrenceId}.`);
    let canonicalEventId;
    let rank;
    let resolution;
    let decision = null;
    let suppliedLabels = null;
    let reviewStatus = 'inherited-safe';

    if (item.disposition === 'canonical-link-proposal' || item.disposition === 'structural-review') {
      canonicalEventId = item.candidate?.canonicalEventId;
      if (!canonicalEventId) throw new Error(`${item.sourceOccurrenceId}: non-blocking inherited row has no canonical candidate.`);
      rank = item.sourceRank ?? item.candidate?.generalRomanRank ?? null;
      resolution = item.disposition === 'canonical-link-proposal' ? 'inherit-general-canonical-binding' : 'inherit-general-structural-binding';
      inheritedSafe += 1;
    } else {
      decision = findDecision(reviewPlan, item);
      decisionsUsed.add(decision.id);
      const resolved = resolutionForBlocking(item, decision);
      canonicalEventId = resolved.canonicalEventId;
      rank = resolved.rank;
      resolution = resolved.resolution;
      suppliedLabels = resolved.labels;
      reviewStatus = decision.decision;
      pendingReviewRows += 1;
    }

    const ptSourceLabel = clean(source.names?.pt?.value ?? item.sourceLabel);
    if (!ptSourceLabel) throw new Error(`${item.sourceOccurrenceId}: missing Portuguese SNL label.`);
    items.push({
      id: `effective-pt:${source.id}`,
      sourceOccurrenceId: source.id,
      sourceUid: source.sourceFacts?.uid ?? null,
      dateISO: source.dateISO,
      canonicalEventId,
      category: categoryForCanonical(canonicalEventId, decision),
      rank,
      labels: suppliedLabels ? { ...suppliedLabels, pt: suppliedLabels.pt ?? ptSourceLabel } : { pt: ptSourceLabel },
      source: {
        id: 'portugal-national-liturgy-secretariat',
        sourceRecordHash: source.sourceRecordHash,
        occurrenceAssertion: true,
      },
      generalRomanBinding: canonicalEventId.startsWith('rc:') ? {
        canonicalEventId,
        status: reviewStatus === 'inherited-safe' ? 'non-blocking-reconciliation' : 'pending-human-approval',
        candidate: item.candidate?.canonicalEventId ?? null,
      } : null,
      resolution,
      reviewStatus,
      decisionId: decision?.id ?? null,
      publicationAllowed: false,
    });
  }

  if (items.length !== (normalized.events ?? []).length || items.length !== (reconciliation.items ?? []).length) throw new Error('Effective preview does not partition all SNL observances.');
  const duplicateSourceIds = items.length - new Set(items.map((item) => item.sourceOccurrenceId)).size;
  if (duplicateSourceIds) throw new Error(`Effective preview contains ${duplicateSourceIds} duplicate source occurrence IDs.`);
  const expectedDecisionIds = new Set((reviewPlan.decisions ?? []).map((decision) => decision.id));
  if (decisionsUsed.size !== expectedDecisionIds.size || [...expectedDecisionIds].some((id) => !decisionsUsed.has(id))) {
    throw new Error(`Prepared review decisions are not fully consumed. Used ${decisionsUsed.size}/${expectedDecisionIds.size}.`);
  }

  const allApproved = reviewPlan.approved === true && (reviewPlan.decisions ?? []).every((decision) => decision.decision === 'approved');
  const uniqueDays = new Set(items.map((item) => item.dateISO)).size;
  return {
    schemaVersion: 1,
    mode: 'effective-portugal-calendar-preview',
    churchId: 'roman-catholic',
    jurisdictionId: 'pt',
    year: reviewPlan.year,
    generatedAt: new Date().toISOString(),
    publicationAllowed: allApproved,
    productionWriteAllowed: false,
    reviewPlanStatus: reviewPlan.status,
    sourcePackageId: normalized.packageId,
    summary: {
      sourceOccurrences: items.length,
      uniqueDays,
      inheritedSafe,
      pendingReviewRows,
      preparedDecisionsUsed: decisionsUsed.size,
      portugalSpecificCanonicalIds: items.filter((item) => item.canonicalEventId.startsWith('rc-pt:')).length,
      generalRomanCanonicalIds: items.filter((item) => item.canonicalEventId.startsWith('rc:')).length,
      publicationAllowed: allApproved,
    },
    provenancePolicy: {
      everyEffectiveOccurrenceIsAssertedBySnl: true,
      generalRomanBindingIsSeparateFromSnlOccurrenceAssertion: true,
      pendingDeltaDecisionNeverBecomesPublishedByPreview: true,
      firstEventByCivilDateMatchingForbidden: true,
    },
    items,
  };
}

function main() {
  const normalizedPath = path.resolve(argument('--normalized', 'staging/portugal-snl/normalized-package.json'));
  const reconciliationPath = path.resolve(argument('--reconciliation', 'staging/portugal-snl/reconciliation.json'));
  const reviewPath = path.resolve(argument('--review', 'data/releases/roman-catholic-pt-2026.overlay-review.json'));
  const outputPath = path.resolve(argument('--output', 'staging/portugal-snl/effective-preview.json'));
  const result = buildPortugalEffectiveCalendarPreview({
    normalized: readJson(normalizedPath),
    reconciliation: readJson(reconciliationPath),
    reviewPlan: readJson(reviewPath),
  });
  writeJson(outputPath, result);
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

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
function sorted(values) { return [...values].map(String).sort(); }
function exactList(left, right) { return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right)); }

export function materializeApprovedPortugalOverlayReview({ plan, approval }) {
  if (plan?.releaseScope !== 'roman-catholic-pt-2026-overlay-v2' || plan?.year !== 2026 || plan?.churchId !== 'roman-catholic' || plan?.jurisdictionId !== 'pt') {
    throw new Error('Unexpected Portugal overlay review plan scope.');
  }
  if (plan?.approved !== false || plan?.status !== 'prepared-human-approval-required' || plan?.productionWriteAllowed !== false) {
    throw new Error('Prepared Portugal overlay plan must remain immutable and pending approval.');
  }
  if (!Array.isArray(plan.decisions) || plan.decisions.length !== 15 || !plan.decisions.every((item) => item.decision === 'pending-human-approval')) {
    throw new Error('Prepared Portugal overlay plan is not the expected 15-decision pending set.');
  }

  if (approval?.approved !== true || approval?.approvalMode !== 'explicit-project-owner-instruction' || approval?.approvalScope !== 'liturgical-decisions-only') {
    throw new Error('Portugal overlay approval receipt is not an explicit liturgical-decision approval.');
  }
  if (approval?.releaseScope !== plan.releaseScope || approval?.year !== plan.year || approval?.churchId !== plan.churchId || approval?.jurisdictionId !== plan.jurisdictionId) {
    throw new Error('Portugal overlay approval receipt scope mismatch.');
  }
  if (approval?.productionWriteAllowed !== false || approval?.safety?.thisReceiptApprovesLiturgicalDecisionsOnly !== true || approval?.safety?.d1ProductionReleaseRequiresSeparateReleaseGate !== true || approval?.safety?.automaticFutureProductionWrites !== false || approval?.safety?.newOrChangedBlockingDeltaRequiresNewApproval !== true) {
    throw new Error('Portugal overlay approval receipt crossed the production safety boundary.');
  }

  const decisionIds = plan.decisions.map((item) => item.id);
  if (approval?.decisionCount !== decisionIds.length || !exactList(approval?.decisionIds ?? [], decisionIds)) {
    throw new Error('Portugal overlay approval does not cover the exact prepared decision set.');
  }
  const preparedFields = ['mainCommit', 'workflowRunId', 'artifactId', 'snlIcsSha256'];
  for (const key of preparedFields) {
    if (approval?.preparedPlan?.[key] !== plan?.preparedFrom?.[key]) throw new Error(`Portugal overlay approval prepared-plan ${key} mismatch.`);
  }
  if (approval?.verification?.blockingSourceRows !== plan?.reviewBoundary?.blockingSourceRows || approval?.verification?.liturgicalDecisions !== plan?.reviewBoundary?.liturgicalDecisions) {
    throw new Error('Portugal overlay approval verification counts do not match the prepared plan.');
  }
  if (approval?.verification?.sourceOccurrences !== 389 || approval?.verification?.civilDays !== 365) {
    throw new Error('Portugal overlay approval is not pinned to the verified 389-occurrence / 365-day preview.');
  }

  const approvedPlan = structuredClone(plan);
  approvedPlan.status = 'approved-liturgical-decisions';
  approvedPlan.approved = true;
  approvedPlan.productionWriteAllowed = false;
  approvedPlan.approval = {
    mode: approval.approvalMode,
    scope: approval.approvalScope,
    approvedAt: approval.approvedAt,
    instruction: approval.instruction,
    verification: approval.verification,
    productionWriteAllowed: false,
  };
  for (const decision of approvedPlan.decisions) decision.decision = 'approved';
  return approvedPlan;
}

function main() {
  const planPath = path.resolve(argument('--plan', 'data/releases/roman-catholic-pt-2026.overlay-review.json'));
  const approvalPath = path.resolve(argument('--approval', 'data/releases/roman-catholic-pt-2026.overlay-approval.json'));
  const outputPath = path.resolve(argument('--output', 'staging/portugal-snl/approved-overlay-review.json'));
  const result = materializeApprovedPortugalOverlayReview({ plan: readJson(planPath), approval: readJson(approvalPath) });
  writeJson(outputPath, result);
  console.log(JSON.stringify({ releaseScope: result.releaseScope, approved: result.approved, decisions: result.decisions.length, productionWriteAllowed: result.productionWriteAllowed }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

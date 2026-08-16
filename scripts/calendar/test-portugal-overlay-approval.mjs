#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { materializeApprovedPortugalOverlayReview } from './materialize-approved-portugal-overlay-review.mjs';

const plan = JSON.parse(fs.readFileSync('data/releases/roman-catholic-pt-2026.overlay-review.json', 'utf8'));
const approval = JSON.parse(fs.readFileSync('data/releases/roman-catholic-pt-2026.overlay-approval.json', 'utf8'));

const approved = materializeApprovedPortugalOverlayReview({ plan, approval });
assert.equal(approved.releaseScope, 'roman-catholic-pt-2026-overlay-v2');
assert.equal(approved.status, 'approved-liturgical-decisions');
assert.equal(approved.approved, true);
assert.equal(approved.productionWriteAllowed, false);
assert.equal(approved.decisions.length, 15);
assert.ok(approved.decisions.every((item) => item.decision === 'approved'));
assert.equal(approved.approval.productionWriteAllowed, false);
assert.equal(approved.approval.verification.sourceOccurrences, 389);
assert.equal(approved.approval.verification.civilDays, 365);

// The prepared evidence remains immutable and pending. Approval is a separate receipt.
assert.equal(plan.status, 'prepared-human-approval-required');
assert.equal(plan.approved, false);
assert.equal(plan.productionWriteAllowed, false);
assert.ok(plan.decisions.every((item) => item.decision === 'pending-human-approval'));

const missingDecision = structuredClone(approval);
missingDecision.decisionIds.pop();
missingDecision.decisionCount -= 1;
assert.throws(
  () => materializeApprovedPortugalOverlayReview({ plan, approval: missingDecision }),
  /exact prepared decision set/u,
);

const wrongSource = structuredClone(approval);
wrongSource.preparedPlan.snlIcsSha256 = '0'.repeat(64);
assert.throws(
  () => materializeApprovedPortugalOverlayReview({ plan, approval: wrongSource }),
  /snlIcsSha256 mismatch/u,
);

const unsafe = structuredClone(approval);
unsafe.productionWriteAllowed = true;
assert.throws(
  () => materializeApprovedPortugalOverlayReview({ plan, approval: unsafe }),
  /production safety boundary/u,
);

console.log('Portugal overlay approval is exact, source-pinned and remains separate from D1 production release authority.');

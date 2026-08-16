#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateRequestShape } from './validate-portugal-v2-production-request.mjs';

const request = JSON.parse(fs.readFileSync('data/releases/roman-catholic-pt-2026-v2.production-request.json','utf8'));
const current = validateRequestShape(request, { requireApproved:false });
assert.equal(current.approved, false);
assert.equal(current.releaseId, 'roman-catholic-pt-2026-v2');
assert.equal(current.stagingRunId, 31977231879);
assert.throws(() => validateRequestShape(request, { requireApproved:true }), /not explicitly approved/u);

const hypotheticalApproval = structuredClone(request);
hypotheticalApproval.approved = true;
hypotheticalApproval.approvalRecordedAt = '2026-08-17T00:00:00+02:00';
hypotheticalApproval.approvalInstruction = 'Explicitly publish the exact Portugal v2 staging snapshot to production.';
assert.equal(validateRequestShape(hypotheticalApproval, { requireApproved:true }).approved, true);

const futureRun = structuredClone(hypotheticalApproval);
futureRun.stagingWorkflow.runId += 1;
assert.throws(() => validateRequestShape(futureRun, { requireApproved:true }), /staging workflow identity mismatch/u);

const futureArtifact = structuredClone(hypotheticalApproval);
futureArtifact.artifacts.release.digest = `sha256:${'0'.repeat(64)}`;
assert.throws(() => validateRequestShape(futureArtifact, { requireApproved:true }), /release artifact digest mismatch/u);

const automatic = structuredClone(hypotheticalApproval);
automatic.safety.automaticFutureProductionWrites = true;
assert.throws(() => validateRequestShape(automatic, { requireApproved:true }), /safety contract mismatch/u);

const unsafeVisibility = structuredClone(hypotheticalApproval);
unsafeVisibility.expected.publishedBeforeVisibility = 389;
assert.throws(() => validateRequestShape(unsafeVisibility, { requireApproved:true }), /visibility count mismatch/u);

console.log('Portugal v2 production request is unapproved by default and cannot inherit approval across staging snapshots.');

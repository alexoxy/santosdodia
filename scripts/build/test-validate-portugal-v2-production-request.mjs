#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateRequestShape } from './validate-portugal-v2-production-request.mjs';

const request = JSON.parse(fs.readFileSync('data/releases/roman-catholic-pt-2026-v2.production-request.json','utf8'));
const current = validateRequestShape(request, { requireApproved:false });
assert.equal(current.approved, request.approved === true);
assert.equal(current.releaseId, 'roman-catholic-pt-2026-v2');
assert.equal(current.stagingRunId, 31998552573);

const unapproved = structuredClone(request);
unapproved.approved = false;
unapproved.approvalRecordedAt = null;
unapproved.approvalInstruction = null;
assert.equal(validateRequestShape(unapproved, { requireApproved:false }).approved, false);
assert.throws(() => validateRequestShape(unapproved, { requireApproved:true }), /not explicitly approved/u);

const approved = structuredClone(request);
approved.approved = true;
approved.approvalRecordedAt ||= '2026-08-17T08:53:31Z';
approved.approvalInstruction ||= 'Explicitly publish the exact Portugal v2 staging snapshot to production.';
assert.equal(validateRequestShape(approved, { requireApproved:true }).approved, true);

const futureRun = structuredClone(approved);
futureRun.stagingWorkflow.runId += 1;
assert.throws(() => validateRequestShape(futureRun, { requireApproved:true }), /staging workflow identity mismatch/u);

const futureArtifact = structuredClone(approved);
futureArtifact.artifacts.release.digest = `sha256:${'0'.repeat(64)}`;
assert.throws(() => validateRequestShape(futureArtifact, { requireApproved:true }), /release artifact digest mismatch/u);

const automatic = structuredClone(approved);
automatic.safety.automaticFutureProductionWrites = true;
assert.throws(() => validateRequestShape(automatic, { requireApproved:true }), /safety contract mismatch/u);

const unsafeVisibility = structuredClone(approved);
unsafeVisibility.expected.publishedBeforeVisibility = 389;
assert.throws(() => validateRequestShape(unsafeVisibility, { requireApproved:true }), /visibility count mismatch/u);

console.log('Portugal v2 production request gate validates both explicit approval states and cannot inherit approval across staging snapshots.');

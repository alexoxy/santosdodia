#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const workflowPath = path.join(root, '.github', 'workflows', 'publish-canonical-vault.yml');
const retiredPersonWorkflowPath = path.join(root, '.github', 'workflows', 'publish-canonical-person-vault.yml');
const source = await readFile(workflowPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(/^on:\n\s+workflow_dispatch:/mu.test(source), 'Canonical Vault workflow must remain workflow_dispatch-only.');
assert(!/^\s+(?:schedule|push|pull_request|repository_dispatch|workflow_run):/mu.test(source), 'Canonical Vault workflow acquired a non-manual trigger.');
assert(/artifact:\n[\s\S]*?default:\s*person[\s\S]*?options:\n\s+-\s+person\n\s+-\s+recognition/u.test(source), 'Canonical Vault workflow must expose only the reviewed Person/Recognition artifact choices.');
assert(/default:\s*verify-only/u.test(source), 'Canonical Vault workflow must default to verify-only.');
assert(/-\s+write-and-promote-current/u.test(source), 'Canonical Vault workflow lost its explicit write mode.');
assert(/WRITE_CANONICAL_PERSON_V1/u.test(source), 'Canonical Vault workflow lost the Person write confirmation phrase.');
assert(/WRITE_CANONICAL_RECOGNITION_V1/u.test(source), 'Canonical Vault workflow lost the Recognition write confirmation phrase.');
assert(/EXPECTED_CANONICAL_WRITE_CONFIRMATION:\s*\$\{\{ steps\.entity\.outputs\.confirmation \}\}/u.test(source), 'Canonical Vault workflow no longer resolves the expected entity-specific confirmation phrase.');
assert(/CANONICAL_WRITE_CONFIRMATION[\s\S]*?!=\s*"\$EXPECTED_CANONICAL_WRITE_CONFIRMATION"/u.test(source), 'Canonical Vault workflow no longer enforces the entity-specific confirmation phrase before writes.');
assert(/if:\s*\$\{\{ inputs\.mode == 'write-and-promote-current' \}\}/u.test(source), 'Canonical Vault write steps are no longer gated by explicit write mode.');
assert(/--promote-current true/u.test(source), 'Canonical Vault write step no longer performs explicit pointer promotion.');
assert(/DROPBOX_APP_KEY:\s*\$\{\{ secrets\.DROPBOX_APP_KEY \}\}/u.test(source), 'Canonical Vault write step lost Dropbox secret isolation.');
assert(/group:\s*canonical-\$\{\{ inputs\.artifact \}\}-vault-write/u.test(source), 'Canonical Vault concurrency is no longer isolated per entity family.');
assert(/cancel-in-progress:\s*false/u.test(source), 'Canonical Vault writes must never cancel an in-progress canonical write.');
assert(!/cron:/u.test(source), 'Canonical Vault workflow must never have a cron.');
assert(!/--dry-run false/u.test(source), 'Canonical Vault workflow must not disguise a write as a dry-run setting.');
assert(/build-canonical-person-manifest\.mjs/u.test(source) && /upload-canonical-person-release\.mjs/u.test(source), 'Canonical Vault workflow lost the Person adapter.');
assert(/build-canonical-recognition-manifest\.mjs/u.test(source) && /upload-canonical-recognition-release\.mjs/u.test(source), 'Canonical Vault workflow lost the Recognition adapter.');
assert(/npm run vault:test/u.test(source) && /test-dropbox-canonical-uploader\.mjs/u.test(source), 'Canonical Vault workflow must verify canonical semantics and the shared Dropbox state machine before any write.');
assert(!/\/archive\//u.test(source), 'Canonical Vault workflow must never target legacy archive storage.');
assert(!/wrangler\s+d1|manage-d1|D1_DATABASE/u.test(source), 'Canonical Vault workflow must not mutate D1.');

const writeStepIndex = source.indexOf('Write immutable release and promote current pointer');
const confirmationStepIndex = source.indexOf('Require explicit entity-specific canonical write confirmation');
const verifyStepIndex = source.indexOf('Verify canonical semantics and determinism');
assert(verifyStepIndex >= 0 && confirmationStepIndex > verifyStepIndex && writeStepIndex > confirmationStepIndex, 'Canonical Vault must verify first, confirm second and write last.');

let retiredStillExists = true;
try { await access(retiredPersonWorkflowPath); }
catch (error) {
  if (error?.code === 'ENOENT') retiredStillExists = false;
  else throw error;
}
assert(retiredStillExists === false, 'Dedicated Person Vault workflow still exists; unified workflow must be the single control surface.');

console.log('Unified canonical Vault workflow safety passed: manual-only, verify-first, entity-isolated and exact-confirmation gates intact for Person and Recognition.');

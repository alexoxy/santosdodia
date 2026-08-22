#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'publish-canonical-person-vault.yml');
const source = await readFile(workflowPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(/^on:\n\s+workflow_dispatch:/mu.test(source), 'Canonical Person Vault workflow must remain workflow_dispatch-only.');
assert(!/^\s+(?:schedule|push|pull_request|repository_dispatch|workflow_run):/mu.test(source), 'Canonical Person Vault workflow acquired a non-manual trigger.');
assert(/default:\s*verify-only/u.test(source), 'Canonical Person Vault workflow must default to verify-only.');
assert(/-\s+write-and-promote-current/u.test(source), 'Canonical Person Vault workflow lost its explicit write mode.');
assert(/WRITE_CANONICAL_PERSON_V1/u.test(source), 'Canonical Person Vault workflow lost the exact write confirmation phrase.');
assert(/CANONICAL_WRITE_CONFIRMATION/u.test(source) && /!=\s*"WRITE_CANONICAL_PERSON_V1"/u.test(source), 'Canonical Person Vault workflow no longer enforces the confirmation phrase before writes.');
assert(/if:\s*\$\{\{ inputs\.mode == 'write-and-promote-current' \}\}/u.test(source), 'Canonical Person Vault write steps are no longer gated by explicit write mode.');
assert(/--promote-current true/u.test(source), 'Canonical Person Vault write step no longer performs explicit pointer promotion.');
assert(/DROPBOX_APP_KEY:\s*\$\{\{ secrets\.DROPBOX_APP_KEY \}\}/u.test(source), 'Canonical Person Vault write step lost Dropbox secret isolation.');
assert(/cancel-in-progress:\s*false/u.test(source), 'Canonical Person Vault writes must never cancel an in-progress canonical write.');
assert(!/cron:/u.test(source), 'Canonical Person Vault workflow must never have a cron.');
assert(!/--dry-run false/u.test(source), 'Canonical Person Vault workflow must not disguise a write as a dry-run setting.');

const writeStepIndex = source.indexOf('Write immutable release and promote current pointer');
const confirmationStepIndex = source.indexOf('Require explicit canonical write confirmation');
assert(confirmationStepIndex >= 0 && writeStepIndex > confirmationStepIndex, 'Canonical Person Vault confirmation must execute before the Dropbox write step.');

console.log('Canonical Person Vault workflow safety passed: manual-only, verify-first and explicit-confirmation write gate intact.');

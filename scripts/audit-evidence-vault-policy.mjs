#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const policyPath = path.join(root, 'config', 'evidence-vault-policy.json');
const registryPath = path.join(root, 'config', 'automation-registry.json');
const REQUIRED_LAYERS = ['raw', 'normalized', 'canonical', 'releases', 'changes', 'conflicts', 'rights', 'rollback'];
const REQUIRED_ROOTS = ['legacyArchive', ...REQUIRED_LAYERS];

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function duplicates(values) {
  const seen = new Set();
  const found = new Set();
  for (const value of values) {
    if (seen.has(value)) found.add(value);
    seen.add(value);
  }
  return [...found];
}

function main() {
  const errors = [];
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  assert(policy.schemaVersion === 1, 'Evidence Vault schemaVersion must be 1.', errors);
  assert(policy.status === 'r1-normative', 'Evidence Vault policy must remain r1-normative during migration.', errors);
  assert(policy.globalRules?.requestTimeSourceDependencyAllowed === false, 'Evidence Vault must forbid request-time source dependency.', errors);
  assert(policy.globalRules?.sourceDisappearanceMayBreakProduct === false, 'External source disappearance must not be allowed to break the product.', errors);
  assert(policy.globalRules?.canonicalDataMayExistOnlyInFixedRing === false, 'Canonical data may not exist only in a fixed ring.', errors);
  assert(policy.globalRules?.publishedReleaseMayExistOnlyInFixedRing === false, 'Published releases may not exist only in a fixed ring.', errors);
  assert(policy.globalRules?.canonicalDeletionRequiresTombstone === true, 'Canonical deletion must require a tombstone.', errors);
  assert(policy.globalRules?.stableHistoricalKnowledgeMaintenance === 'delta-detection', 'Stable historical knowledge must use delta detection.', errors);

  for (const key of REQUIRED_ROOTS) {
    const value = policy.logicalRoots?.[key];
    assert(typeof value === 'string' && value.startsWith('/'), `Evidence Vault logical root ${key} is missing or invalid.`, errors);
  }
  for (const layer of REQUIRED_LAYERS) {
    const record = policy.layers?.[layer];
    assert(record && typeof record.purpose === 'string' && record.purpose, `Evidence Vault layer ${layer} is missing a purpose.`, errors);
    assert(record && typeof record.durability === 'string' && record.durability, `Evidence Vault layer ${layer} is missing durability policy.`, errors);
    assert(record?.runtimeReadable === false, `Evidence Vault layer ${layer} must not become a request-time external dependency.`, errors);
  }
  assert(/fixed-ring overwrite is forbidden/i.test(policy.layers?.canonical?.durability ?? ''), 'Canonical layer must explicitly forbid fixed-ring overwrite.', errors);
  assert(/fixed-ring overwrite is forbidden/i.test(policy.layers?.releases?.durability ?? ''), 'Release layer must explicitly forbid fixed-ring overwrite.', errors);

  const rules = Array.isArray(policy.streamRules) ? policy.streamRules : [];
  assert(rules.length > 0, 'Evidence Vault streamRules must not be empty.', errors);
  for (const duplicate of duplicates(rules.map((rule) => rule.id))) errors.push(`Duplicate Evidence Vault stream rule id: ${duplicate}.`);

  const compiledRules = [];
  for (const rule of rules) {
    assert(typeof rule.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rule.id), `Invalid Evidence Vault rule id ${String(rule.id)}.`, errors);
    assert(REQUIRED_LAYERS.includes(rule.layer), `Evidence Vault rule ${rule.id} has invalid layer ${String(rule.layer)}.`, errors);
    assert(typeof rule.retentionClass === 'string' && Boolean(rule.retentionClass), `Evidence Vault rule ${rule.id} is missing retentionClass.`, errors);
    assert(typeof rule.targetPolicy === 'string' && Boolean(rule.targetPolicy), `Evidence Vault rule ${rule.id} is missing targetPolicy.`, errors);
    try {
      compiledRules.push({ ...rule, regex: new RegExp(rule.pattern, 'u') });
    } catch (error) {
      errors.push(`Evidence Vault rule ${rule.id} has invalid regex: ${error.message}`);
    }
    if (rule.layer === 'canonical' || rule.layer === 'releases') {
      assert(!/^bounded/i.test(rule.retentionClass), `${rule.id} cannot classify ${rule.layer} as bounded-only retention.`, errors);
    }
  }

  const archiveTasks = (registry.tasks ?? []).filter((task) => typeof task.archiveStream === 'string' && task.archiveStream);
  const coverage = new Map(REQUIRED_LAYERS.map((layer) => [layer, 0]));
  for (const task of archiveTasks) {
    const matches = compiledRules.filter((rule) => rule.regex.test(task.archiveStream));
    if (matches.length !== 1) {
      errors.push(`Task ${task.id} archiveStream ${task.archiveStream} must match exactly one Evidence Vault rule; matched ${matches.map((item) => item.id).join(', ') || 'none'}.`);
      continue;
    }
    coverage.set(matches[0].layer, (coverage.get(matches[0].layer) ?? 0) + 1);
  }

  assert(policy.migration?.phase === 'contract-before-mutation', 'Evidence Vault migration must start contract-before-mutation.', errors);
  assert(policy.migration?.moveExistingDropboxObjectsNow === false, 'R1 contract phase must not move existing Dropbox objects.', errors);
  assert(policy.migration?.deleteExistingDropboxObjectsNow === false, 'R1 contract phase must not delete existing Dropbox objects.', errors);
  assert(Array.isArray(policy.migration?.firstDurableOutputs) && policy.migration.firstDurableOutputs.includes('canonical-person-identities'), 'Evidence Vault durable migration must include canonical person identities.', errors);
  assert(Array.isArray(policy.migration?.firstDurableOutputs) && policy.migration.firstDurableOutputs.includes('published-calendar-releases'), 'Evidence Vault durable migration must include published calendar releases.', errors);
  assert(Array.isArray(policy.migration?.firstDurableOutputs) && policy.migration.firstDurableOutputs.includes('rights-ledger'), 'Evidence Vault durable migration must include a rights ledger.', errors);

  const report = {
    ok: errors.length === 0,
    archiveTasks: archiveTasks.length,
    rules: compiledRules.length,
    coverage: Object.fromEntries(coverage),
    errors,
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (errors.length) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}

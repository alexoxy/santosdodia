#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(moduleDir, '../..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function authorityFor(sourceId, sourceRegistry) {
  const source = sourceRegistry.sources.find((item) => item.id === sourceId);
  return source ? {
    authorityClass: source.authorityClass ?? null,
    authorityScore: source.authorityScore ?? null,
    priority: source.priority ?? null,
  } : { authorityClass: null, authorityScore: null, priority: null };
}

export function assertFinancialGuardrails(autonomyPolicy) {
  const guardrails = autonomyPolicy?.financialGuardrails ?? {};
  if (guardrails.authorizedSpendEur !== 0) throw new Error('Autonomous authorized spend must remain exactly 0 EUR.');
  for (const key of ['paidUsageAuthorized', 'paidOverageAuthorized', 'automaticPlanUpgradeAuthorized', 'automaticPurchaseAuthorized']) {
    if (guardrails[key] !== false) throw new Error(`${key} must remain false.`);
  }
  if (guardrails.onFreeQuotaExhausted !== 'wait-for-reset') throw new Error('Free quota exhaustion must wait for reset.');
  if (guardrails.onBillingUncertainty !== 'fail-closed') throw new Error('Billing uncertainty must fail closed.');
  if (guardrails.scope !== 'all-platforms') throw new Error('Financial guardrails must apply to all platforms.');
  return guardrails;
}

export function buildAutonomyPlan({
  autonomyPolicy = readJson('config/autonomy-policy.json'),
  manifest = readJson('data/osint/manifests/p0-initial-dump.json'),
  policyRegistry = readJson('data/osint/policies/p0-policy-registry.json'),
  sourceRegistry = readJson('data/source-registry/seed.json'),
} = {}) {
  if (autonomyPolicy.schemaVersion !== 1) throw new Error('Unsupported autonomy policy schema.');
  const financialGuardrails = assertFinancialGuardrails(autonomyPolicy);
  if (autonomyPolicy.phase === 'shadow' && autonomyPolicy.promotion?.automaticProductionWrites !== false) {
    throw new Error('Shadow phase cannot enable automatic production writes.');
  }
  if (manifest.publish !== false || manifest.mode !== 'archive-only') {
    throw new Error('Autonomous acquisition requires the archive-only P0 manifest.');
  }

  const policyById = new Map(policyRegistry.sources.map((item) => [item.id, item]));
  const executable = [];
  const held = [];

  for (const source of manifest.sources) {
    const policy = policyById.get(source.id);
    const pipeline = autonomyPolicy.sourcePipelines?.[source.id] ?? null;
    const authority = authorityFor(source.id, sourceRegistry);
    const reasons = [];

    if (source.enabled !== true) reasons.push('manifest_disabled');
    if (!policy || policy.decision !== autonomyPolicy.acquisition.requiredPolicyDecision) reasons.push('policy_not_approved');
    if (!source.adapter) reasons.push('adapter_missing');
    if (!pipeline?.normalizer) reasons.push('normalizer_missing');

    const item = {
      sourceId: source.id,
      adapter: source.adapter ?? null,
      normalizer: pipeline?.normalizer ?? null,
      publicationClass: pipeline?.publicationClass ?? null,
      canAutoPromoteAlone: pipeline?.canAutoPromoteAlone === true,
      ...authority,
    };

    if (reasons.length === 0) executable.push(item);
    else held.push({ ...item, reasons });
  }

  executable.sort((a, b) => {
    const score = (b.authorityScore ?? -1) - (a.authorityScore ?? -1);
    return score || a.sourceId.localeCompare(b.sourceId);
  });

  const maxSources = autonomyPolicy.acquisition.maxSourcesPerCycle;
  const selected = executable.slice(0, maxSources);
  const deferred = executable.slice(maxSources).map((item) => ({ ...item, reasons: ['cycle_source_limit'] }));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    targetMode: autonomyPolicy.targetMode,
    phase: autonomyPolicy.phase,
    financialGuardrails,
    agents: autonomyPolicy.agents,
    acquisition: {
      selected,
      held: [...held, ...deferred],
      selectedCount: selected.length,
      heldCount: held.length + deferred.length,
    },
    promotion: {
      mode: autonomyPolicy.promotion.automaticProductionWrites ? 'automatic' : 'hold',
      gates: autonomyPolicy.promotion,
      productionMutationAllowed: autonomyPolicy.promotion.automaticProductionWrites === true,
    },
  };
}

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function main() {
  const plan = buildAutonomyPlan();
  const output = argument('--output');
  const body = `${JSON.stringify(plan, null, 2)}\n`;
  if (output) {
    const absolute = path.resolve(output);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, body, 'utf8');
  }
  process.stdout.write(body);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}

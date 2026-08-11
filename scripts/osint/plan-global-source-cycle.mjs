#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ACTIVE_REGISTRY = 'data/source-registry/seed.json';
const DEFAULT_POLICY_REGISTRY = 'data/osint/policies/p0-policy-registry.json';
const DEFAULT_RESEARCH_CATALOG = 'data/osint/research/source-catalog-2026-08-11.json';
const DEFAULT_BASELINE_PARTITIONS = 'data/osint/research/global-baseline-partitions-v1.json';
const DEFAULT_OUTPUT = 'staging/source-orchestrator/plan.json';
const DEFAULT_POLICY_PROBES = 3;
const DELEGATED_APPROVED_SOURCES = new Set(['wikidata']);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function urlFor(source) {
  return source?.url ?? source?.rootUrl ?? null;
}

function stableNumber(value) {
  return Number.parseInt(crypto.createHash('sha256').update(value).digest('hex').slice(0, 8), 16);
}

function normalizePriority(source) {
  if (['P0', 'P1', 'P2', 'P3'].includes(source?.priority)) return source.priority;
  const role = source?.recommendedRole ?? '';
  if (['normative-evidence', 'national-authority', 'jurisdiction-authority', 'reference-feed'].includes(role)) return 'P0';
  if (['identity-enrichment', 'place-resolution', 'localization-authority', 'temporal-authority', 'structured-secondary', 'scholarly-validation'].includes(role)) return 'P1';
  return 'P2';
}

function priorityRank(priority) {
  return ({ P0: 0, P1: 1, P2: 2, P3: 3 })[priority] ?? 4;
}

function policyDecision(policy) {
  return policy?.decision ?? 'unregistered';
}

function buildBaselineSourceSet(partitions) {
  const ids = new Set();
  for (const partition of partitions?.executionPartitions ?? []) {
    for (const sourceId of partition.sourceIds ?? []) ids.add(sourceId);
  }
  return ids;
}

export function buildGlobalSourcePlan({
  activeRegistry,
  policyRegistry,
  researchCatalog,
  baselinePartitions,
  now = new Date(),
  maxPolicyProbes = DEFAULT_POLICY_PROBES,
  forcePolicy = false,
} = {}) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('now must be a valid Date.');
  if (!Number.isInteger(maxPolicyProbes) || maxPolicyProbes < 1 || maxPolicyProbes > 24) throw new Error('maxPolicyProbes must be an integer from 1 to 24.');

  const activeSources = Array.isArray(activeRegistry?.sources) ? activeRegistry.sources : [];
  const researchSources = Array.isArray(researchCatalog?.sources) ? researchCatalog.sources : [];
  const policies = new Map((policyRegistry?.sources ?? []).map((item) => [item.id, item]));
  const activeIds = new Set(activeSources.map((item) => item.id));
  const baselineSourceIds = buildBaselineSourceSet(baselinePartitions);

  const union = [
    ...activeSources.map((source) => ({ ...source, sourceSet: 'active-registry' })),
    ...researchSources.filter((source) => !activeIds.has(source.id)).map((source) => ({ ...source, sourceSet: 'research-catalog' })),
  ].filter((source) => typeof source.id === 'string' && source.id && typeof urlFor(source) === 'string');

  const records = union.map((source) => {
    const policy = policies.get(source.id) ?? null;
    const decision = policyDecision(policy);
    const priority = normalizePriority(source);
    return {
      id: source.id,
      name: source.name ?? source.id,
      url: urlFor(source),
      sourceSet: source.sourceSet,
      authorityClass: source.authorityClass ?? null,
      authorityScore: Number.isInteger(source.authorityScore) ? source.authorityScore : null,
      priority,
      recommendedRole: source.recommendedRole ?? null,
      reuseStatus: source.reuseStatus ?? null,
      decision,
      acquisitionMode: policy?.acquisitionMode ?? null,
      robotsPolicy: policy?.robotsPolicy ?? null,
      licenceStatus: policy?.licenceStatus ?? null,
      allowedUses: Array.isArray(policy?.allowedUses) ? policy.allowedUses : [],
      rateLimitPerMinute: Number.isInteger(policy?.rateLimitPerMinute) ? policy.rateLimitPerMinute : null,
      baselineReferenced: baselineSourceIds.has(source.id),
      delegated: decision === 'approved' && DELEGATED_APPROVED_SOURCES.has(source.id),
    };
  });

  const blocked = records.filter((item) => item.decision === 'blocked');
  const delegated = records.filter((item) => item.delegated);
  const approvedDispatch = records.filter((item) => item.decision === 'approved' && !item.delegated);

  const policyQueue = records
    .filter((item) => item.decision === 'pending' || item.decision === 'unregistered')
    .sort((left, right) => {
      const baselineDelta = Number(right.baselineReferenced) - Number(left.baselineReferenced);
      if (baselineDelta) return baselineDelta;
      const priorityDelta = priorityRank(left.priority) - priorityRank(right.priority);
      if (priorityDelta) return priorityDelta;
      const hashDelta = stableNumber(left.id) - stableNumber(right.id);
      return hashDelta || left.id.localeCompare(right.id);
    });

  const hourIndex = Math.floor(now.getTime() / 3_600_000);
  const probeCount = Math.min(maxPolicyProbes, policyQueue.length);
  const start = forcePolicy || policyQueue.length === 0 ? 0 : (hourIndex * maxPolicyProbes) % policyQueue.length;
  const duePolicyProbes = Array.from({ length: probeCount }, (_, offset) => policyQueue[(start + offset) % policyQueue.length]);

  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    mode: 'staging-only',
    policy: {
      automaticProductionWrites: false,
      automaticSourcePromotion: false,
      pendingSourceNetworkMode: 'head-and-robots-only',
      editorialTextAcquisitionFromPendingSources: false,
      requestTimeExternalAcquisition: false,
    },
    rotation: {
      hourIndex,
      queueLength: policyQueue.length,
      start,
      maxPolicyProbes,
      forcePolicy,
    },
    duePolicyProbes,
    approvedDispatch,
    delegatedApprovedSources: delegated,
    blockedSources: blocked.map(({ id, name, decision }) => ({ id, name, decision })),
    summary: {
      activeRegistrySources: activeSources.length,
      researchCatalogSources: researchSources.length,
      unionSources: records.length,
      policyQueue: policyQueue.length,
      duePolicyProbes: duePolicyProbes.length,
      approvedDispatch: approvedDispatch.length,
      delegatedApprovedSources: delegated.length,
      blockedSources: blocked.length,
      baselinePartitions: baselinePartitions?.executionPartitions?.length ?? 0,
    },
  };
}

export function loadGlobalSourcePlanInputs({
  activeRegistryPath = DEFAULT_ACTIVE_REGISTRY,
  policyRegistryPath = DEFAULT_POLICY_REGISTRY,
  researchCatalogPath = DEFAULT_RESEARCH_CATALOG,
  baselinePartitionsPath = DEFAULT_BASELINE_PARTITIONS,
} = {}) {
  return {
    activeRegistry: readJson(activeRegistryPath),
    policyRegistry: readJson(policyRegistryPath),
    researchCatalog: readJson(researchCatalogPath),
    baselinePartitions: readJson(baselinePartitionsPath),
  };
}

async function main() {
  const nowValue = argument('--now');
  const now = nowValue ? new Date(nowValue) : new Date();
  const maxPolicyProbes = Number(argument('--max-policy-probes', String(DEFAULT_POLICY_PROBES)));
  const output = path.resolve(argument('--output', DEFAULT_OUTPUT));
  const inputs = loadGlobalSourcePlanInputs({
    activeRegistryPath: argument('--active-registry', DEFAULT_ACTIVE_REGISTRY),
    policyRegistryPath: argument('--policy-registry', DEFAULT_POLICY_REGISTRY),
    researchCatalogPath: argument('--research-catalog', DEFAULT_RESEARCH_CATALOG),
    baselinePartitionsPath: argument('--baseline-partitions', DEFAULT_BASELINE_PARTITIONS),
  });
  const plan = buildGlobalSourcePlan({ ...inputs, now, maxPolicyProbes, forcePolicy: hasFlag('--force-policy') });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(plan.summary, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Global source planner failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

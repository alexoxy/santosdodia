#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertFinancialGuardrails, buildAutonomyPlan } from './build-plan.mjs';

const zeroSpend = {
  authorizedSpendEur: 0,
  paidUsageAuthorized: false,
  paidOverageAuthorized: false,
  automaticPlanUpgradeAuthorized: false,
  automaticPurchaseAuthorized: false,
  onFreeQuotaExhausted: 'wait-for-reset',
  onBillingUncertainty: 'fail-closed',
  scope: 'all-platforms',
};

function fixture(overrides = {}) {
  const policyOverride = overrides.autonomyPolicy ?? {};
  const autonomyPolicy = {
    schemaVersion: 1,
    targetMode: 'fully-autonomous',
    phase: 'shadow',
    agents: [],
    financialGuardrails: zeroSpend,
    acquisition: { maxSourcesPerCycle: 4, requiredPolicyDecision: 'approved' },
    promotion: { automaticProductionWrites: false },
    sourcePipelines: {
      alpha: {
        normalizer: 'scripts/osint/normalize-alpha.mjs',
        publicationClass: 'canonical',
        canAutoPromoteAlone: true,
      },
    },
    ...policyOverride,
    financialGuardrails: {
      ...zeroSpend,
      ...(policyOverride.financialGuardrails ?? {}),
    },
  };
  return {
    autonomyPolicy,
    manifest: overrides.manifest ?? {
      mode: 'archive-only',
      publish: false,
      sources: [{ id: 'alpha', enabled: true, adapter: 'scripts/osint/adapters/alpha.mjs' }],
    },
    policyRegistry: overrides.policyRegistry ?? {
      sources: [{ id: 'alpha', decision: 'approved' }],
    },
    sourceRegistry: overrides.sourceRegistry ?? {
      sources: [{ id: 'alpha', authorityClass: 'A1', authorityScore: 100, priority: 'P0' }],
    },
  };
}

{
  const plan = buildAutonomyPlan(fixture());
  assert.equal(plan.phase, 'shadow');
  assert.equal(plan.promotion.mode, 'hold');
  assert.equal(plan.promotion.productionMutationAllowed, false);
  assert.equal(plan.financialGuardrails.authorizedSpendEur, 0);
  assert.equal(plan.financialGuardrails.onFreeQuotaExhausted, 'wait-for-reset');
  assert.deepEqual(plan.acquisition.selected.map((item) => item.sourceId), ['alpha']);
}

{
  const input = fixture({ policyRegistry: { sources: [{ id: 'alpha', decision: 'pending' }] } });
  const plan = buildAutonomyPlan(input);
  assert.equal(plan.acquisition.selectedCount, 0);
  assert.deepEqual(plan.acquisition.held[0].reasons, ['policy_not_approved']);
}

{
  const input = fixture({
    autonomyPolicy: {
      schemaVersion: 1,
      targetMode: 'fully-autonomous',
      phase: 'shadow',
      agents: [],
      acquisition: { maxSourcesPerCycle: 4, requiredPolicyDecision: 'approved' },
      promotion: { automaticProductionWrites: true },
      sourcePipelines: { alpha: { normalizer: 'scripts/osint/normalize-alpha.mjs' } },
    },
  });
  assert.throws(() => buildAutonomyPlan(input), /Shadow phase cannot enable automatic production writes/u);
}

{
  assert.throws(() => assertFinancialGuardrails({ financialGuardrails: { ...zeroSpend, authorizedSpendEur: 1 } }), /exactly 0 EUR/u);
  assert.throws(() => assertFinancialGuardrails({ financialGuardrails: { ...zeroSpend, paidOverageAuthorized: true } }), /paidOverageAuthorized must remain false/u);
  assert.throws(() => assertFinancialGuardrails({ financialGuardrails: { ...zeroSpend, onFreeQuotaExhausted: 'buy-more' } }), /wait for reset/u);
  assert.throws(() => assertFinancialGuardrails({ financialGuardrails: { ...zeroSpend, onBillingUncertainty: 'continue' } }), /fail closed/u);
}

{
  const plan = buildAutonomyPlan();
  assert.equal(plan.phase, 'shadow');
  assert.equal(plan.promotion.productionMutationAllowed, false);
  assert.equal(plan.financialGuardrails.authorizedSpendEur, 0);
  assert.deepEqual(plan.acquisition.selected.map((item) => item.sourceId), ['wikidata']);
  assert.ok(plan.acquisition.heldCount >= 1);
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdodia-publication-classifier-'));
  const input = path.join(root, 'input');
  const output = path.join(root, 'output');
  fs.mkdirSync(input, { recursive: true });
  fs.writeFileSync(path.join(input, 'staging-manifest.json'), `${JSON.stringify({ mode: 'staging', stage: 'linguistically-reviewed', publish: false, entityCount: 4, sourceId: 'wikidata', sourceRunId: 'fixture-run' })}\n`);
  fs.writeFileSync(path.join(input, 'quality-report.json'), `${JSON.stringify({ conflictCount: 1 })}\n`);
  fs.writeFileSync(path.join(input, 'linguistic-review.json'), `${JSON.stringify({ criticalCount: 0, batchFatalCount: 0 })}\n`);
  const entities = [
    { id: 'person:auto', entityType: 'person', canonicalName: 'Auto Eligible', qid: 'Q1', names: [], dates: {}, recognition: { sourceStatusCandidates: [] } },
    { id: 'person:cross', entityType: 'person', canonicalName: 'Cross Check', qid: 'Q2', names: [], dates: { birth: { canonical: '1900-01-01', resolutionStatus: 'single_source_value' } }, recognition: { sourceStatusCandidates: [] } },
    { id: 'person:conflict', entityType: 'person', canonicalName: 'Conflict', qid: 'Q3', names: [], dates: { birth: { canonical: '1901-01-01', resolutionStatus: 'conflict' } }, recognition: { sourceStatusCandidates: [] } },
    { id: 'person:recognition', entityType: 'person', canonicalName: 'Recognition', qid: 'Q4', names: [], dates: {}, recognition: { sourceStatusCandidates: [{ qid: 'Q999' }] } },
  ];
  fs.writeFileSync(path.join(input, 'entities.jsonl'), `${entities.map((entity) => JSON.stringify(entity)).join('\n')}\n`);

  execFileSync(process.execPath, [
    'scripts/autonomy/classify-publication-candidates.mjs',
    '--input', input,
    '--output', output,
    '--policy', 'config/publication-decision-policy.json',
  ], { cwd: process.cwd(), stdio: 'pipe' });

  const report = JSON.parse(fs.readFileSync(path.join(output, 'publication-decisions.json'), 'utf8'));
  const human = JSON.parse(fs.readFileSync(path.join(output, 'human-review-queue.json'), 'utf8'));
  const cross = JSON.parse(fs.readFileSync(path.join(output, 'cross-check-queue.json'), 'utf8'));
  const auto = JSON.parse(fs.readFileSync(path.join(output, 'auto-eligible-shadow.json'), 'utf8'));

  assert.equal(report.productionAutoPromotionEnabled, false);
  assert.equal(auto.productionWriteAllowed, false);
  assert.equal(report.entities.find((item) => item.entityId === 'person:auto')?.disposition, 'auto-eligible');
  assert.equal(report.entities.find((item) => item.entityId === 'person:cross')?.disposition, 'cross-check-required');
  assert.equal(report.entities.find((item) => item.entityId === 'person:conflict')?.disposition, 'human-review-required');
  assert.equal(report.entities.find((item) => item.entityId === 'person:recognition')?.disposition, 'human-review-required');
  assert.ok(cross.items.some((item) => item.claimClass === 'birth-date'));
  assert.ok(human.items.some((item) => item.claimClass === 'source-conflict'));
  assert.ok(human.items.some((item) => item.claimClass === 'recognition-or-canonization-status'));
  assert.ok(auto.items.some((item) => item.claimClass === 'exact-external-identifier'));

  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Autonomy policy, zero-spend guardrails and review-by-exception classifier tests passed.');

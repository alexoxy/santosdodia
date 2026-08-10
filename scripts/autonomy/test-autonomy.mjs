#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildAutonomyPlan } from './build-plan.mjs';

function fixture(overrides = {}) {
  const autonomyPolicy = {
    schemaVersion: 1,
    targetMode: 'fully-autonomous',
    phase: 'shadow',
    agents: [],
    acquisition: { maxSourcesPerCycle: 4, requiredPolicyDecision: 'approved' },
    promotion: { automaticProductionWrites: false },
    sourcePipelines: {
      alpha: {
        normalizer: 'scripts/osint/normalize-alpha.mjs',
        publicationClass: 'canonical',
        canAutoPromoteAlone: true,
      },
    },
    ...overrides.autonomyPolicy,
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
  const plan = buildAutonomyPlan();
  assert.equal(plan.phase, 'shadow');
  assert.equal(plan.promotion.productionMutationAllowed, false);
  assert.deepEqual(plan.acquisition.selected.map((item) => item.sourceId), ['wikidata']);
  assert.ok(plan.acquisition.heldCount >= 1);
}

console.log('Autonomy policy and planner tests passed.');

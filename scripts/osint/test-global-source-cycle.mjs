import assert from 'node:assert/strict';
import { buildGlobalSourcePlan } from './plan-global-source-cycle.mjs';
import { buildPolicyProbeReport, classifyPolicyCandidate, isPrivateIp, isSafeHttpsUrl, robotsBlocksAll } from './probe-source-policy-window.mjs';

const activeRegistry = {
  sources: [
    { id: 'wikidata', name: 'Wikidata', url: 'https://www.wikidata.org/', priority: 'P0', authorityClass: 'C1', authorityScore: 68, traditions: ['cross-tradition'], languages: ['multilingual'], domains: ['identity'] },
    { id: 'pending-official', name: 'Pending official', url: 'https://example.org/', priority: 'P0', authorityClass: 'A1', authorityScore: 99, traditions: ['test'], languages: ['en'], domains: ['calendar'] },
    { id: 'blocked-source', name: 'Blocked source', url: 'https://blocked.example.org/', priority: 'P0', authorityClass: 'A1', authorityScore: 99, traditions: ['test'], languages: ['en'], domains: ['calendar'] },
  ],
};
const policyRegistry = {
  sources: [
    { id: 'wikidata', decision: 'approved', acquisitionMode: 'sparql-api', robotsPolicy: 'api-contract', licenceStatus: 'open', allowedUses: ['facts'], rateLimitPerMinute: 6 },
    { id: 'pending-official', decision: 'pending', acquisitionMode: 'blocked', robotsPolicy: 'pending', licenceStatus: 'unknown', allowedUses: [] },
    { id: 'blocked-source', decision: 'blocked', acquisitionMode: 'blocked', robotsPolicy: 'disallowed', licenceStatus: 'unknown', allowedUses: [] },
  ],
};
const researchCatalog = {
  sources: [
    { id: 'research-open', name: 'Research open', rootUrl: 'https://data.example.com/', priority: 'P1', authorityClass: 'B1', reuseStatus: 'cc-by-4.0', recommendedRole: 'structured-secondary' },
    { id: 'pending-official', name: 'Duplicate research copy', rootUrl: 'https://example.org/', priority: 'P0' },
  ],
};
const baselinePartitions = {
  executionPartitions: [
    { id: 'test-partition', sourceIds: ['pending-official'] },
  ],
};

const plan = buildGlobalSourcePlan({
  activeRegistry,
  policyRegistry,
  researchCatalog,
  baselinePartitions,
  now: new Date('2026-08-11T18:00:00Z'),
  maxPolicyProbes: 10,
  forcePolicy: true,
});

assert.equal(plan.policy.automaticProductionWrites, false);
assert.equal(plan.policy.automaticSourcePromotion, false);
assert.deepEqual(plan.delegatedApprovedSources.map((item) => item.id), ['wikidata']);
assert.equal(plan.approvedDispatch.length, 0, 'Wikidata must remain delegated to its existing automation.');
assert.ok(plan.duePolicyProbes.some((item) => item.id === 'pending-official'), 'Pending official source should be scheduled for policy evidence.');
assert.ok(plan.duePolicyProbes.some((item) => item.id === 'research-open'), 'Unregistered research source should enter the policy queue.');
assert.ok(!plan.duePolicyProbes.some((item) => item.id === 'blocked-source'), 'Blocked source must never enter the policy probe window.');
assert.equal(plan.duePolicyProbes.find((item) => item.id === 'pending-official')?.baselineReferenced, true);

const dryRun = await buildPolicyProbeReport(plan, { network: false });
assert.equal(dryRun.policy.automaticSourcePromotion, false);
assert.equal(dryRun.policy.automaticProductionWrites, false);
assert.equal(dryRun.networkChecked, false);
assert.ok(dryRun.checks.every((item) => item.contentAcquired === false));

assert.equal(isPrivateIp('127.0.0.1'), true);
assert.equal(isPrivateIp('10.1.2.3'), true);
assert.equal(isPrivateIp('172.16.0.1'), true);
assert.equal(isPrivateIp('192.168.1.1'), true);
assert.equal(isPrivateIp('169.254.1.1'), true);
assert.equal(isPrivateIp('::1'), true);
assert.equal(isPrivateIp('fd00::1'), true);
assert.equal(isPrivateIp('8.8.8.8'), false);
assert.equal(isSafeHttpsUrl('https://example.org/'), true);
assert.equal(isSafeHttpsUrl('http://example.org/'), false);
assert.equal(isSafeHttpsUrl('https://127.0.0.1/'), false);
assert.equal(isSafeHttpsUrl('https://user:pass@example.org/'), false);

assert.equal(robotsBlocksAll('User-agent: *\nDisallow: /\n'), true);
assert.equal(robotsBlocksAll('User-agent: *\nDisallow: /private\n'), false);
assert.equal(robotsBlocksAll('User-agent: OtherBot\nDisallow: /\nUser-agent: *\nDisallow:\n'), false);

assert.equal(
  classifyPolicyCandidate({ reuseStatus: 'cc-by-4.0' }, { reachable: true }, { blocksAll: false, truncated: false }),
  'eligible-policy-promotion-review',
);
assert.equal(
  classifyPolicyCandidate({ reuseStatus: 'pending-policy-review' }, { reachable: true }, { blocksAll: false, truncated: false }),
  'needs-licence-terms-review',
);
assert.equal(
  classifyPolicyCandidate({ reuseStatus: 'cc0' }, { reachable: true }, { blocksAll: true, truncated: false }),
  'blocked-by-robots-candidate',
);
assert.equal(
  classifyPolicyCandidate({ reuseStatus: 'cc0' }, { reachable: false }, null),
  'source-health-review',
);

console.log(`Global source cycle safeguards passed: ${plan.duePolicyProbes.length} policy candidates, ${plan.delegatedApprovedSources.length} delegated approved source.`);

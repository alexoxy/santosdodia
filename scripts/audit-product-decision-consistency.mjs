import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const [contract, baseline, lifecycle, causesanti, navigation, retention] = await Promise.all([
  readJson('config/product-platform-contract.json'),
  readJson('config/global-baseline-v1.json'),
  readJson('config/sanctity-lifecycle-policy.json'),
  readJson('config/causesanti-source.json'),
  readJson('data/product-navigation-model.json'),
  readFile('docs/product-retention-architecture-2026.md', 'utf8'),
]);

assert.equal(contract.humanSurface.firstPartyImagesAllowed, false);
assert.equal(contract.humanSurface.liveStreamIsOnlyAudiovisualContent, true);
assert.deepEqual(contract.rollingMaterialization.exampleFor2026, [2026, 2027]);
assert.equal(contract.rollingMaterialization.pastCivilYears, 0);
assert.equal(contract.rollingMaterialization.futureCivilYears, 1);
assert.equal(contract.operationalConstraints.adsenseState, 'REMEDIATION_REQUIRED');
assert.equal(contract.operationalConstraints.adServingWhileNotApproved, false);

assert.equal(baseline.incremental.orchestratorCadence, 'hourly-due-check-only');
for (const [id, cadence] of Object.entries(baseline.cadenceClasses)) {
  if (id === 'live-health') continue;
  assert.doesNotMatch(cadence, /^(hourly|daily|weekly)$/);
}
assert.match(lifecycle.agentCadence.recognitionWatcher, /^monthly-distributed/);
assert.match(lifecycle.agentCadence.calendarWatcher, /^monthly-distributed/);
assert.equal(causesanti.usePolicy.adsenseReviewState, 'REMEDIATION_REQUIRED');

assert.equal(navigation.status, 'implemented-reference');
assert.deepEqual(
  navigation.mobilePrimary.map(item => [item.id, item.route]),
  [['today', '/'], ['calendar', '/calendar'], ['discover', '/explore'], ['pray', '/rezar'], ['saved', '/guardados']],
);
assert.equal(navigation.guards.adsenseNotApprovedNoAdBehaviourMutation, true);
assert.doesNotMatch(retention, /portrait\/icon only|Images support identity/);

console.log('Product decision consistency audit passed.');

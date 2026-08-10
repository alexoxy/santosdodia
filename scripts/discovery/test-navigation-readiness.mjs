import assert from 'node:assert/strict';
import { auditNavigationReadiness } from './audit-navigation-readiness.mjs';

function source(overrides = {}) {
  return {
    schemaVersion: 1,
    identityRootSha256: 'a'.repeat(64),
    datasetVersion: 'navigation-v1:test',
    publicationAllowed: false,
    productionMutation: false,
    people: [{}, {}],
    readiness: {
      identityCount: 2,
      profiles: { count: 1, percent: 50, complete: false },
      labelEntities: { count: 1, percent: 50, complete: false },
      labelsByLocale: { pt: { count: 1, total: 2, percent: 50 } },
      map: { peopleWithCoordinates: 1, percent: 50 },
      timeline: { peopleWithDates: 1, percent: 50 },
      dailySaints: { dayCount: 31, expectedDays: 31, complete: true },
      globalEnrichmentComplete: false
    },
    ...overrides
  };
}

const partial = auditNavigationReadiness(source());
assert.equal(partial.status, 'partial-staging');
assert.equal(partial.freezeReady, false);
assert.equal(partial.errors.length, 0);
assert.equal(partial.warnings.length, 2);
assert.throws(() => auditNavigationReadiness({ ...source(), publicationAllowed: true }), /production\/publication gate/);

const readySource = source();
readySource.readiness.profiles = { count: 2, percent: 100, complete: true };
readySource.readiness.labelEntities = { count: 2, percent: 100, complete: true };
readySource.readiness.labelsByLocale.pt = { count: 2, total: 2, percent: 100 };
readySource.readiness.dailySaints = { dayCount: 366, expectedDays: 366, complete: true };
readySource.readiness.globalEnrichmentComplete = true;
const ready = auditNavigationReadiness(readySource, { requireFreeze: true });
assert.equal(ready.status, 'freeze-ready');
assert.equal(ready.freezeReady, true);

const incomplete = source();
const blocked = auditNavigationReadiness(incomplete, { requireFreeze: true });
assert.equal(blocked.status, 'blocked');
assert.match(blocked.errors.join('\n'), /not freeze-ready/);

const corrupt = source();
corrupt.readiness.profiles.count = 3;
assert.match(auditNavigationReadiness(corrupt).errors.join('\n'), /exceeds identity count/);

console.log('Navigation readiness tests passed.');

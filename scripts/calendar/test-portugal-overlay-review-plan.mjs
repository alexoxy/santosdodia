#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const plan = JSON.parse(fs.readFileSync('data/releases/roman-catholic-pt-2026.overlay-review.json', 'utf8'));
assert.equal(plan.schemaVersion, 2);
assert.equal(plan.releaseScope, 'roman-catholic-pt-2026-overlay-v2');
assert.equal(plan.year, 2026);
assert.equal(plan.churchId, 'roman-catholic');
assert.equal(plan.jurisdictionId, 'pt');
assert.equal(plan.approved, false);
assert.equal(plan.productionWriteAllowed, false);
assert.equal(plan.status, 'prepared-human-approval-required');
assert.equal(plan.reviewBoundary.blockingSourceRows, 17);
assert.equal(plan.reviewBoundary.liturgicalDecisions, 15);
assert.equal(plan.decisions.length, 15);
assert.ok(plan.decisions.every((item) => item.decision === 'pending-human-approval'));
assert.ok(plan.decisions.every((item) => Array.isArray(item.coversBlockingDates) && item.coversBlockingDates.length >= 1));

const coveredDates = new Set(plan.decisions.flatMap((item) => item.coversBlockingDates));
const expectedBlockingDates = [
  '2026-01-04','2026-01-06','2026-02-07','2026-02-14','2026-04-29','2026-05-12','2026-05-13','2026-05-14','2026-05-17',
  '2026-06-13','2026-06-15','2026-06-20','2026-07-04','2026-07-11','2026-07-16','2026-07-18','2026-07-23',
];
assert.deepEqual([...coveredDates].sort(), expectedBlockingDates);

const transfers = plan.decisions.filter((item) => item.type === 'date-transfer');
assert.deepEqual(transfers.map((item) => item.canonicalEventId).sort(), ['rc:Ascension','rc:Epiphany','rc:ImmaculateHeart']);
assert.ok(transfers.every((item) => /^2026-\d{2}-\d{2}$/.test(item.fromDate) && /^2026-\d{2}-\d{2}$/.test(item.toDate) && item.fromDate !== item.toDate));

const rankOverrides = plan.decisions.filter((item) => item.type === 'rank-override');
assert.equal(rankOverrides.length, 8);
assert.ok(rankOverrides.every((item) => item.canonicalEventId.startsWith('rc:') && item.rank));

const propers = plan.decisions.filter((item) => item.type === 'portugal-proper-observance');
assert.equal(propers.length, 4);
for (const item of propers) {
  assert.ok(item.canonicalEventId.startsWith('rc-pt:'));
  for (const locale of ['en','pt','es','fr','it']) assert.ok(String(item.labels?.[locale] ?? '').trim(), `${item.id} missing ${locale}`);
}

assert.equal(plan.preparedFrom.mainCommit, 'ed5b767323eb6835293ca3c54a92a3dd3cc02111');
for (const key of ['artifactSha256','normalizedPackageSha256','reconciliationSha256','overlayPlanSha256','snlIcsSha256']) {
  assert.match(plan.preparedFrom[key], /^[0-9a-f]{64}$/u, `${key} must be a sha256`);
}

console.log('Portugal 2026 overlay review plan is complete, version-pinned and fail-closed pending explicit human approval.');

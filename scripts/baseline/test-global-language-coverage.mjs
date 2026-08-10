#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildGlobalLanguageCoverage } from './build-global-language-coverage.mjs';

const identities = [
  { entityId: 'wikidata:Q1', qid: 'Q1' },
  { entityId: 'wikidata:Q2', qid: 'Q2' },
  { entityId: 'wikidata:Q3', qid: 'Q3' },
];
const queue = [
  { entityId: 'wikidata:Q1', qid: 'Q1', locale: 'en', reason: 'source-only', candidateNames: ['One'], rejectedNames: [], canonicalDisplayEligible: false },
  { entityId: 'wikidata:Q1', qid: 'Q1', locale: 'pt', reason: 'missing', candidateNames: [], rejectedNames: [], canonicalDisplayEligible: false },
  { entityId: 'wikidata:Q2', qid: 'Q2', locale: 'en', reason: 'missing', candidateNames: [], rejectedNames: [], canonicalDisplayEligible: false },
  { entityId: 'wikidata:Q2', qid: 'Q2', locale: 'pt', reason: 'withheld', candidateNames: [], rejectedNames: [{ name: 'Saint Δύο', issues: ['unexpected-script-for-locale'] }], canonicalDisplayEligible: false },
  { entityId: 'wikidata:Q3', qid: 'Q3', locale: 'en', reason: 'source-only', candidateNames: ['Three'], rejectedNames: [], canonicalDisplayEligible: true },
  { entityId: 'wikidata:Q3', qid: 'Q3', locale: 'pt', reason: 'source-only', candidateNames: ['Três'], rejectedNames: [], canonicalDisplayEligible: false },
  // Duplicate source occurrence for the same QID/locale must not double-count the identity.
  { entityId: 'wikidata:Q3', qid: 'Q3', locale: 'pt', reason: 'missing', candidateNames: [], rejectedNames: [], canonicalDisplayEligible: false },
];

const first = buildGlobalLanguageCoverage({ identityLedger: identities, queueRecords: queue, supportedLocales: ['en', 'pt'] });
const second = buildGlobalLanguageCoverage({ identityLedger: identities, queueRecords: queue, supportedLocales: ['en', 'pt'] });
assert.equal(first.uniqueIdentityCount, 3);
assert.equal(first.resolvedEntityLocalePairs, 6);
assert.equal(first.expectedEntityLocalePairs, 6);
assert.deepEqual(first.localeCoverage.en, {
  totalIdentities: 3,
  sourceOnly: 2,
  missing: 1,
  withheld: 0,
  canonicalDisplayReady: 1,
  needsQualityUpgrade: 2,
  sourceLabelCoveragePercent: 66.67,
  canonicalDisplayReadyPercent: 33.33,
  freezeLocaleEligible: false,
});
assert.deepEqual(first.localeCoverage.pt, {
  totalIdentities: 3,
  sourceOnly: 1,
  missing: 1,
  withheld: 1,
  canonicalDisplayReady: 0,
  needsQualityUpgrade: 3,
  sourceLabelCoveragePercent: 33.33,
  canonicalDisplayReadyPercent: 0,
  freezeLocaleEligible: false,
});
assert.equal(first.withheldCount, 1);
assert.deepEqual(first.withheld[0].blockingIssues, ['unexpected-script-for-locale']);
assert.equal(first.freezeLanguageGateEligible, false);
assert.equal(first.sourceOnlyIsNotCanonical, true);
assert.equal(first.coverageSha256, second.coverageSha256, 'Coverage hash must be deterministic.');

assert.throws(
  () => buildGlobalLanguageCoverage({ identityLedger: identities, queueRecords: queue.filter((record) => !(record.entityId === 'wikidata:Q2' && record.locale === 'en')), supportedLocales: ['en', 'pt'] }),
  /Missing translation queue coverage/u,
);
assert.throws(
  () => buildGlobalLanguageCoverage({ identityLedger: identities, queueRecords: [...queue, { entityId: 'wikidata:Q999', locale: 'en', reason: 'missing' }], supportedLocales: ['en', 'pt'] }),
  /unknown identity/u,
);

console.log('Global language coverage tests passed.');

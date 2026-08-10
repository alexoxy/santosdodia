import assert from 'node:assert/strict';
import { assembleNavigationSource } from './assemble-navigation-source.mjs';

const root = 'a'.repeat(64);
const identityManifest = { stage: 'global-candidate-identity-ledger', publish: false, rootSha256: root };
const identityReport = { rootSha256: root, freezeIdentityGateEligible: true, uniqueIdentityCount: 2 };
const identityLedger = [
  { entityId: 'wikidata:Q1', qid: 'Q1', publish: false, identityStatus: 'resolved', canonicalNameCandidates: ['Saint One'] },
  { entityId: 'wikidata:Q2', qid: 'Q2', publish: false, identityStatus: 'resolved', canonicalNameCandidates: ['Saint Two'] }
];
const profilePackages = [{
  enrichmentId: 'saints-profile-v1', identityRootSha256: root, publish: false,
  entities: [
    { qid: 'Q1', dates: { birth: { canonical: '+0101-01-01T00:00:00Z', resolutionStatus: 'single-source-value' }, death: { canonical: '+0175-01-01T00:00:00Z', resolutionStatus: 'single-source-value' } }, places: [{ placeId: 'wikidata:Q10', relationType: 'birth', currentName: 'Cidade A', historicalName: null, lat: 40, lon: -8, sourceIds: ['wikidata'] }] },
    { qid: 'Q2', dates: { birth: { canonical: null }, death: { canonical: '+1200-01-01T00:00:00Z', resolutionStatus: 'single-source-value' } }, places: [] }
  ]
}];
const labelPackages = [{
  enrichmentId: 'saints-labels-v2', identityRootSha256: root, publish: false, languageFallbacksEnabled: false,
  entities: [
    { qid: 'Q1', labels: { pt: { value: 'Santo Um', status: 'source', scriptStatus: 'expected' }, ru: { value: 'Saint One', status: 'source', scriptStatus: 'unexpected' } }, aliases: {} },
    { qid: 'Q2', labels: { en: { value: 'Saint Two', status: 'source', scriptStatus: 'expected' } }, aliases: {} }
  ]
}];
const vatican = {
  schemaVersion: 1, sourceId: 'vatican-news-saint-of-day-pt', sourceScope: 'all', coverage: { expectedDays: 366, complete: true },
  events: [{ id: 'vatican-08-10', month: 8, day: 10, personEntityId: null, personLinkStatus: 'unresolved', names: { pt: { value: 'S. Lourenço', status: 'source' } }, churchId: 'roman-catholic', jurisdictionId: 'holy-see', validationStatus: 'provisional', publicationStatus: 'withheld' }]
};

const result = assembleNavigationSource({ identityManifest, identityReport, identityLedger, profilePackages, labelPackages, vatican });
assert.equal(result.publicationAllowed, false);
assert.equal(result.productionMutation, false);
assert.equal(result.readiness.profiles.complete, true);
assert.equal(result.readiness.labelEntities.complete, true);
assert.equal(result.people[0].names.pt, 'Santo Um');
assert.equal(result.people[0].names.ru, undefined, 'unexpected script must not become display name');
assert.equal(result.people[0].birth.year, 101);
assert.equal(result.people[1].death.year, 1200);
assert.equal(result.people[0].places[0].historicalName, null);
assert.equal(result.unlinkedObservances[0].personLinkStatus, 'unresolved');
assert.equal(result.readiness.dailySaints.complete, true);

const wrongRoot = structuredClone(profilePackages); wrongRoot[0].identityRootSha256 = 'b'.repeat(64);
assert.throws(() => assembleNavigationSource({ identityManifest, identityReport, identityLedger, profilePackages: wrongRoot, labelPackages, vatican }), /mismatched profile/);
console.log('Canonical navigation source assembly tests passed.');

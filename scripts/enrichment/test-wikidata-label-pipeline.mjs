import assert from 'node:assert/strict';
import { planWikidataLabelRun } from './plan-wikidata-label-run.mjs';
import { buildEntityBody, normalizeLabelResponses } from './fetch-wikidata-label-chunk.mjs';
import { finalizeWikidataLabelRun } from './finalize-wikidata-label-run.mjs';

const baseLocales = [
  { siteLocale: 'en', wikidataLanguage: 'en', expectedScript: 'Latn' }, { siteLocale: 'es', wikidataLanguage: 'es', expectedScript: 'Latn' },
  { siteLocale: 'pt', wikidataLanguage: 'pt', expectedScript: 'Latn' }, { siteLocale: 'fr', wikidataLanguage: 'fr', expectedScript: 'Latn' },
  { siteLocale: 'fil', wikidataLanguage: 'tl', expectedScript: 'Latn' }, { siteLocale: 'ru', wikidataLanguage: 'ru', expectedScript: 'Cyrl' },
  { siteLocale: 'sw', wikidataLanguage: 'sw', expectedScript: 'Latn' }, { siteLocale: 'de', wikidataLanguage: 'de', expectedScript: 'Latn' },
  { siteLocale: 'it', wikidataLanguage: 'it', expectedScript: 'Latn' }, { siteLocale: 'pl', wikidataLanguage: 'pl', expectedScript: 'Latn' }
];
const sites={en:'enwiki',es:'eswiki',pt:'ptwiki',fr:'frwiki',fil:'tlwiki',ru:'ruwiki',sw:'swwiki',de:'dewiki',it:'itwiki',pl:'plwiki'};
const config = {
  schemaVersion: 1,
  enrichmentId: 'saints-labels-v2', sourceId: 'wikidata', entityLimitPerRun: 2, apiBatchSize: 1,
  rawStream: 'enrichment/saints/v1/raw/wikidata/labels-v2', normalizedStream: 'enrichment/saints/v1/normalized/wikidata/labels-v2', progressStream: 'enrichment-progress/saints/v1/wikidata/labels-v2',
  locales: baseLocales,
  policy: { exactQidInputOnly: true, languageFallbacksForbidden: true, automaticCanonicalNameSelection: false, productionPublication: false }
};
const root = 'a'.repeat(64);
const manifest = { stage: 'global-candidate-identity-ledger', mode: 'staging', publish: false, rootSha256: root };
const report = { rootSha256: root, freezeIdentityGateEligible: true, identityConflictCount: 0, uniqueIdentityCount: 3 };
const ledger = ['Q1','Q2','Q3'].map((qid) => ({ entityId: `wikidata:${qid}`, qid, publish: false }));
const plan = planWikidataLabelRun({ config, identityManifest: manifest, identityReport: report, identityLedger: ledger });
assert.deepEqual(plan.selectedQids, ['Q1','Q2']);
assert.equal(plan.identityRootSha256, root);
assert.equal(plan.expectedRequestCount, 2);

const body = buildEntityBody(['Q1'], ['en','pt']);
assert.equal(body.get('ids'), 'Q1'); assert.equal(body.get('props'), 'labels|aliases'); assert.equal(body.has('languagefallbacks'), false);
assert.throws(() => buildEntityBody(['Saint Lawrence'], ['en']), /exact QIDs/);

const requests = [{ value: { entities: {
  Q1: { labels: { en: { value: 'Saint One' }, pt: { value: 'Santo Um' }, ru: { value: 'Святой Один' } }, aliases: { pt: [{ value: 'São Um' }] } },
  Q2: { labels: { en: { value: 'Saint Two' }, ru: { value: 'Saint Two' } } }
} } }];
const normalized = normalizeLabelResponses({ config, plan, requests });
assert.equal(normalized.entities[0].labels.pt.value, 'Santo Um');
assert.equal(normalized.entities[0].labels.ru.scriptStatus, 'expected');
assert.equal(normalized.entities[1].labels.ru.scriptStatus, 'unexpected');
assert.equal(normalized.languageFallbacksEnabled, false);
assert.equal(normalized.automaticCanonicalNameSelection, false);
assert.equal(normalized.publish, false);

const raw = { schemaVersion: 1, enrichmentId: config.enrichmentId, sourceId: 'wikidata', identityRootSha256: root, mode: 'archive-only', publish: false, productionMutation: false, startEntityOffset: 0, nextEntityOffset: 2, entityCount: 2, selectedQids: ['Q1','Q2'], requestCount: 2, requests: [0,1].map((i) => ({ responseSha256: String(i + 1).repeat(64).slice(0,64), responseBytes: 10, attempts: [{ outcome: 'success' }] })), finishedAt: '2026-08-10T23:00:00Z' };
const normalizedForFinalize = { ...normalized, identityRootSha256: root, startEntityOffset: 0, nextEntityOffset: 2, entityCount: 2 };
const progress = finalizeWikidataLabelRun({ config, plan, raw, normalized: normalizedForFinalize, now: new Date('2026-08-10T23:01:00Z') });
assert.equal(progress.nextEntityOffset, 2); assert.equal(progress.successfulRuns, 1); assert.equal(progress.completed, false);

const old = { ...progress, identityRootSha256: 'b'.repeat(64) };
assert.throws(() => planWikidataLabelRun({ config, identityManifest: manifest, identityReport: report, identityLedger: ledger, previousProgress: old }), /Identity root changed/);

const configV3={
  ...config,
  enrichmentId:'saints-labels-v3',
  rawStream:'enrichment/saints/v1/raw/wikidata/labels-v3',
  normalizedStream:'enrichment/saints/v1/normalized/wikidata/labels-v3',
  progressStream:'enrichment-progress/saints/v1/wikidata/labels-v3',
  locales:baseLocales.map((locale)=>({...locale,wikipediaSite:sites[locale.siteLocale]})),
  policy:{...config.policy,translationForbidden:true,sitelinkTitleEvidenceAllowed:true}
};
const planV3=planWikidataLabelRun({config:configV3,identityManifest:manifest,identityReport:report,identityLedger:ledger});
const bodyV3=buildEntityBody(['Q1'],['en','pt'],['enwiki','ptwiki']);
assert.equal(bodyV3.get('props'),'labels|aliases|sitelinks');
assert.equal(bodyV3.get('sitefilter'),'enwiki|ptwiki');
assert.equal(bodyV3.has('languagefallbacks'),false);
const requestsV3=[{value:{entities:{
  Q1:{labels:{en:{value:'Saint One'}},aliases:{},sitelinks:{ptwiki:{title:'Santo Um'},enwiki:{title:'Saint One'}}},
  Q2:{labels:{en:{value:'Saint Two'}},aliases:{},sitelinks:{ptwiki:{title:'São Dois'},ruwiki:{title:'Святой Два'}}}
}}}];
const normalizedV3=normalizeLabelResponses({config:configV3,plan:planV3,requests:requestsV3});
assert.equal(normalizedV3.entities[0].labels.pt,undefined);
assert.equal(normalizedV3.entities[0].sitelinks.pt.value,'Santo Um');
assert.equal(normalizedV3.entities[0].sitelinks.pt.sourceKind,'wikipedia-sitelink-title');
assert.equal(normalizedV3.entities[1].sitelinks.ru.scriptStatus,'expected');
assert.equal(normalizedV3.sitelinkTitleEvidenceEnabled,true);
assert.equal(normalizedV3.translationEnabled,false);
const rawV3={...raw,enrichmentId:'saints-labels-v3'};
const normalizedV3ForFinalize={...normalizedV3,identityRootSha256:root,startEntityOffset:0,nextEntityOffset:2,entityCount:2};
const progressV3=finalizeWikidataLabelRun({config:configV3,plan:planV3,raw:rawV3,normalized:normalizedV3ForFinalize,now:new Date('2026-08-11T00:01:00Z')});
assert.equal(progressV3.enrichmentId,'saints-labels-v3');
assert.equal(progressV3.nextEntityOffset,2);

console.log('Dynamic-root multilingual label enrichment tests passed.');

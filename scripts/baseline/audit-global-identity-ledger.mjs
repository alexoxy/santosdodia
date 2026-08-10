#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config/saints-baseline-wikidata.json', 'utf8'));
const resolution = JSON.parse(fs.readFileSync('config/entity-resolution-policy.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/build-saints-baseline-identity-ledger.yml', 'utf8');
const builder = fs.readFileSync('scripts/baseline/build-global-identity-ledger.mjs', 'utf8');
const languageBuilder = fs.readFileSync('scripts/baseline/build-global-language-coverage.mjs', 'utf8');
const languageVerifier = fs.readFileSync('scripts/baseline/verify-global-language-coverage.mjs', 'utf8');
const lister = fs.readFileSync('scripts/dropbox/list-archive-batches.mjs', 'utf8');
const tarValidator = fs.readFileSync('scripts/archive/validate-tar-entries.mjs', 'utf8');
const tarExtractor = fs.readFileSync('scripts/archive/extract-safe-tar.mjs', 'utf8');
const planner = fs.readFileSync('scripts/baseline/plan-global-identity-ledger.mjs', 'utf8');
const verifier = fs.readFileSync('scripts/baseline/verify-global-identity-ledger.mjs', 'utf8');

assert.equal(config.identityResolutionVersion, '1.0');
assert.equal(config.languageCoverageVersion, '1.0');
assert.equal(config.identityLedgerStream, 'baseline/saints/v1/identity/wikidata/recognition-v1');
assert.equal(config.policy.identityReadsReviewedDropboxOnly, true);
assert.equal(config.policy.identityRequiresCompletedReviewedBaseline, true);
assert.equal(config.policy.identityCrossBatchDedupUsesExactWikidataIdentifier, true);
assert.equal(config.policy.identityNameOnlyMergeForbidden, true);
assert.equal(config.policy.identityStrongFactConflictsBlockFreeze, true);
assert.equal(config.policy.identityLedgerIsCandidateOnly, true);
assert.equal(config.policy.languageCoverageUsesGlobalUniqueIdentities, true);
assert.equal(config.policy.languageCoverageRequiresEveryIdentityLocalePair, true);
assert.equal(config.policy.languageCoverageSourceOnlyIsNotFreezeReady, true);
assert.equal(config.policy.languageCoverageEnglishFallbackForbiddenForNonEnglish, true);
assert.equal(config.policy.languageCoverageMustPassAllLocalesForFreeze, true);
assert.equal(config.policy.productionPublication, false);

assert.equal(resolution.principles.namesAreNotIdentity, true);
assert.equal(resolution.principles.contradictoryStrongFactsBlockAutomaticMerge, true);
assert.equal(resolution.principles.everyAutomaticMergeRequiresExplainableSignals, true);
assert.equal(resolution.matching.weights.exactExternalIdentifier, 1);
assert.ok(resolution.matching.hardVetoes.includes('incompatible-precise-death-dates'));
assert.ok(resolution.matching.hardVetoes.includes('incompatible-precise-birth-dates-without-source-conflict'));
assert.ok(resolution.matching.hardVetoes.includes('person-versus-nonperson-type'));

assert.match(workflow, /REVIEW_PROGRESS_STREAM: baseline-reviewed-progress\/saints\/v1\/wikidata\/recognition-v1/u);
assert.match(workflow, /REVIEWED_STREAM_PREFIX: baseline\/saints\/v1\/reviewed\/wikidata\/recognition-v1/u);
assert.match(workflow, /IDENTITY_STREAM: baseline\/saints\/v1\/identity\/wikidata\/recognition-v1/u);
assert.match(workflow, /LANGUAGE_COVERAGE_VERSION: '1\.0'/u);
assert.match(workflow, /name: Build Saints Baseline v1 identity ledger/u);
assert.match(workflow, /actions\/upload-artifact@v7/u);
assert.doesNotMatch(workflow, /CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|wrangler d1|knowledge-import/u);
assert.doesNotMatch(workflow, /<<['"]?NODE/u);
assert.match(workflow, /scripts\/archive\/extract-safe-tar\.mjs/u);
assert.match(workflow, /scripts\/baseline\/plan-global-identity-ledger\.mjs/u);
assert.match(workflow, /scripts\/baseline\/verify-global-identity-ledger\.mjs/u);
assert.match(workflow, /scripts\/baseline\/build-global-language-coverage\.mjs/u);
assert.match(workflow, /scripts\/baseline\/verify-global-language-coverage\.mjs/u);
assert.match(workflow, /language-coverage-report\.json/u);

assert.match(builder, /entity\.id !== `wikidata:\$\{entity\.qid\}`/u);
assert.match(builder, /signal: 'exactExternalIdentifier'/u);
assert.match(builder, /nameOnlyMerge: false/u);
assert.match(builder, /identityAction: 'none-name-is-not-identity'/u);
assert.match(builder, /freezeIdentityGateEligible: conflicts\.length === 0/u);
assert.match(builder, /publish: false/u);
assert.match(builder, /rootSha256/u);
assert.match(languageBuilder, /sourceOnlyIsNotCanonical: true/u);
assert.match(languageBuilder, /englishFallbackBlockedForNonEnglishLocales: true/u);
assert.match(languageBuilder, /freezeLanguageGateEligible/u);
assert.match(languageBuilder, /coverageSha256/u);
assert.match(languageVerifier, /Global language coverage is incomplete/u);
assert.match(lister, /\/2\/files\/list_folder/u);
assert.match(lister, /BATCH_PATTERN/u);
assert.match(tarValidator, /Unsafe absolute archive entry/u);
assert.match(tarValidator, /Unsafe parent traversal archive entry/u);
assert.match(tarExtractor, /validateTarArchive/u);
assert.match(planner, /language-coverage-contract-changed/u);
assert.match(verifier, /Name-only identity merges are forbidden/u);
execFileSync(process.execPath, ['scripts/archive/test-validate-tar-entries.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/baseline/test-global-identity-workflow-helpers.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/baseline/test-global-language-coverage.mjs'], { stdio: 'inherit' });

console.log('Global candidate identity and language coverage audit passed.');

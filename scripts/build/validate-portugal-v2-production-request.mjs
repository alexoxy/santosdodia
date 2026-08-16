#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const EXPECTED = Object.freeze({
  releaseId: 'roman-catholic-pt-2026-v2',
  sourceMainCommit: '13845f8fa930cdee993c405f68f4be341fbda18e',
  stagingRunId: 31977231879,
  stagingArtifactId: 9271379725,
  stagingArtifactName: 'portugal-product-v2-31977231879',
  verificationArtifactId: 9271396058,
  verificationArtifactName: 'portugal-v2-staging-verification-31977231879',
  stagingDbName: 'santosdodia-staging',
  stagingDbUuid: 'e212681b-a958-4554-9d44-d48cf85f2978',
  productionDbName: 'santosdodia-production',
  productionDbUuid: 'e1ad3640-b334-49d1-a6fc-a73f54924803',
  occurrences: 389,
  days: 365,
  labels: 1945,
  calendarAssertions: 389,
  maxObservancesPerDay: 3,
  multiObservanceDays: 22,
  decisionCount: 15,
  locales: ['en','pt','es','fr','it'],
});

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function text(value) { return String(value ?? '').normalize('NFC').trim(); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function sha256File(file) { return `sha256:${createHash('sha256').update(fs.readFileSync(file)).digest('hex')}`; }
function exactArray(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function rows(payload) { return payload?.[0]?.results ?? payload?.[0]?.result ?? payload?.results ?? payload?.result ?? []; }
function requireValue(condition, message) { if (!condition) throw new Error(message); }

export function validateRequestShape(request, { requireApproved = false } = {}) {
  requireValue(request?.schemaVersion === 1, 'Unexpected Portugal v2 production request schema.');
  requireValue(request?.releaseId === EXPECTED.releaseId, 'Unexpected Portugal v2 production release id.');
  requireValue(request?.approvalMode === 'explicit-one-shot-product-release-v2', 'Production approval mode must be explicit-one-shot-product-release-v2.');
  requireValue(request?.approvalScope === 'exact-staging-validated-snapshot-only', 'Production approval scope mismatch.');
  requireValue(typeof request?.approved === 'boolean', 'Production approval must be an explicit boolean.');
  if (requireApproved) {
    requireValue(request.approved === true, 'Portugal v2 production release is not explicitly approved.');
    requireValue(Boolean(text(request.approvalRecordedAt)), 'Approved production release is missing approvalRecordedAt.');
    requireValue(Boolean(text(request.approvalInstruction)), 'Approved production release is missing approvalInstruction.');
  } else if (request.approved === false) {
    requireValue(request.approvalRecordedAt === null, 'Unapproved production request must not carry an approval timestamp.');
    requireValue(request.approvalInstruction === null, 'Unapproved production request must not carry an approval instruction.');
  }

  requireValue(request.sourceMainCommit === EXPECTED.sourceMainCommit, 'Production request source commit drifted from the staging-validated snapshot.');
  requireValue(request?.stagingWorkflow?.runId === EXPECTED.stagingRunId && request?.stagingWorkflow?.conclusion === 'success' && request?.stagingWorkflow?.headSha === EXPECTED.sourceMainCommit, 'Production request staging workflow identity mismatch.');
  requireValue(request?.artifacts?.release?.id === EXPECTED.stagingArtifactId && request?.artifacts?.release?.name === EXPECTED.stagingArtifactName, 'Production request release artifact identity mismatch.');
  requireValue(request?.artifacts?.release?.digest === 'sha256:824e98853835bc0b4160673728304e50b266e31cdafb92de02c5a4eb73138287', 'Production request release artifact digest mismatch.');
  requireValue(request?.artifacts?.stagingVerification?.id === EXPECTED.verificationArtifactId && request?.artifacts?.stagingVerification?.name === EXPECTED.verificationArtifactName, 'Production request staging verification artifact identity mismatch.');
  requireValue(request?.artifacts?.stagingVerification?.digest === 'sha256:49988be5ecac510f24ea1eabde5243e1d0d95e4fbe1e7f7bee3a41f491c8f8de', 'Production request staging verification artifact digest mismatch.');
  requireValue(request?.stagingDatabase?.name === EXPECTED.stagingDbName && request?.stagingDatabase?.uuid === EXPECTED.stagingDbUuid, 'Production request staging database mismatch.');
  requireValue(request?.productionDatabase?.name === EXPECTED.productionDbName && request?.productionDatabase?.uuid === EXPECTED.productionDbUuid, 'Production request production database mismatch.');

  const expected = request.expected ?? {};
  requireValue(expected.occurrences === EXPECTED.occurrences && expected.days === EXPECTED.days && expected.labels === EXPECTED.labels && expected.calendarAssertions === EXPECTED.calendarAssertions, 'Production request core count mismatch.');
  requireValue(expected.publishableBeforeVisibility === 389 && expected.publishedBeforeVisibility === 0 && expected.publishedAfterVisibility === 389, 'Production request visibility count mismatch.');
  requireValue(expected.maxObservancesPerDay === EXPECTED.maxObservancesPerDay && expected.multiObservanceDays === EXPECTED.multiObservanceDays && expected.decisionCount === EXPECTED.decisionCount, 'Production request topology/decision mismatch.');
  requireValue(exactArray(expected.publicLocales, EXPECTED.locales), 'Production request locale set/order mismatch.');

  const semantic = request.semanticChecks ?? {};
  const expectedSemantic = {
    'rc:Epiphany':'2026-01-04',
    'rc-pt:TuesdayAfterEpiphany':'2026-01-06',
    'rc:StMatthias':'2026-05-14',
    'rc:Ascension':'2026-05-17',
    'rc:ImmaculateHeart':'2026-06-15',
    'rc-pt:FiveWoundsLord':'2026-02-07',
  };
  requireValue(JSON.stringify(semantic) === JSON.stringify(expectedSemantic), 'Production request semantic sentinel set mismatch.');
  const safety = request.safety ?? {};
  requireValue(
    safety.automaticFutureProductionWrites === false
    && safety.requiresExplicitApprovedTrueChange === true
    && safety.importInitiallyInvisible === true
    && safety.publishOnlyAfterRemoteVerification === true
    && safety.requiresPreReleaseTimeTravelBookmark === true
    && safety.requiresPostReleaseVerification === true
    && safety.newStagingSnapshotRequiresNewApproval === true
    && safety.approvalCannotBeInheritedByFutureSnlRuns === true,
    'Production request safety contract mismatch.',
  );
  return { approved: request.approved, releaseId: request.releaseId, stagingRunId: request.stagingWorkflow.runId };
}

function validateHashes(request, artifactDir, verificationDir) {
  for (const [relative, expected] of Object.entries(request.artifacts.release.files ?? {})) {
    const file = path.join(artifactDir, relative);
    requireValue(fs.existsSync(file), `Missing release artifact file ${relative}.`);
    requireValue(sha256File(file) === expected, `Release artifact file hash mismatch: ${relative}.`);
  }
  for (const [relative, expected] of Object.entries(request.artifacts.stagingVerification.files ?? {})) {
    const file = path.join(verificationDir, relative);
    requireValue(fs.existsSync(file), `Missing staging verification file ${relative}.`);
    requireValue(sha256File(file) === expected, `Staging verification file hash mismatch: ${relative}.`);
  }
}

function validateArtifactSemantics(request, artifactDir, verificationDir) {
  const release = readJson(path.join(artifactDir, 'release.json'));
  const validation = readJson(path.join(artifactDir, 'validation.json'));
  const build = readJson(path.join(artifactDir, 'build.json'));
  const approval = readJson(path.join(artifactDir, 'approved-overlay-review.json'));
  const localization = readJson(path.join(artifactDir, 'localization-review.json'));
  requireValue(release.release === EXPECTED.releaseId && release.publicationStatus === 'publishable', 'Pinned release is not the expected invisible v2 release.');
  requireValue(release.expectedOccurrences === 389 && release.expectedDays === 365 && release.expectedLabels === 1945 && release.expectedCalendarAssertions === 389, 'Pinned release manifest counts mismatch.');
  requireValue(release?.safety?.stagingOnly === true && release?.safety?.productionApproved === false && release?.safety?.automaticFutureProductionWrites === false, 'Pinned release crossed staging safety boundary.');
  requireValue(validation.status === 'validated-for-d1-staging' && validation.productionApproved === false && validation.sourceSha === EXPECTED.sourceMainCommit, 'Pinned validation receipt mismatch.');
  requireValue(validation.occurrences === 389 && validation.days === 365 && validation.labels === 1945 && validation.multiObservanceDays === 22 && validation.maxObservancesPerDay === 3 && validation.decisionCount === 15 && validation.policyUpsert === 'scope-safe', 'Pinned validation metrics mismatch.');
  requireValue(build.build === 'roman-catholic-pt-overlay-v2' && build.productionWriteAllowed === false && build?.productReadiness?.productionApproved === false && build?.productReadiness?.stagingReady === true, 'Pinned product build safety/readiness mismatch.');
  requireValue(build?.calendarCoverage?.occurrences === 389 && build?.calendarCoverage?.coveredDays === 365 && build?.calendarCoverage?.multiObservanceDays === 22 && build?.calendarCoverage?.maxObservancesPerDay === 3 && build?.productReadiness?.labelCount === 1945, 'Pinned product build coverage mismatch.');
  requireValue(Object.values(build.localeCompleteness ?? {}).every((item) => item.completeness === 1), 'Pinned product build is not fully localized.');
  requireValue(approval.status === 'approved-liturgical-decisions' && approval.approved === true && approval.productionWriteAllowed === false && approval.decisions?.length === 15 && approval.decisions.every((item) => item.decision === 'approved'), 'Pinned liturgical approval mismatch.');
  requireValue(localization.reviewed === true && localization.productionWriteAllowed === false && localization?.safety?.calendarAuthority === false && localization?.safety?.dateAuthority === false, 'Pinned localization review crossed its label-only boundary.');

  const countRows = rows(readJson(path.join(verificationDir, 'staging-counts.json')));
  requireValue(countRows.length === 1, 'Pinned staging count receipt must contain exactly one row.');
  const count = countRows[0];
  requireValue(Number(count.occurrences) === 389 && Number(count.days) === 365 && Number(count.labels) === 1945 && Number(count.publishable) === 389 && Number(count.published) === 0 && Number(count.max_per_day) === 3, 'Pinned remote staging count receipt mismatch.');
  const semanticRows = rows(readJson(path.join(verificationDir, 'staging-semantics.json')));
  const byId = new Map(semanticRows.map((item) => [item.canonical_event_id, item.date_iso]));
  for (const [id, date] of Object.entries(request.semanticChecks)) requireValue(byId.get(id) === date, `Pinned remote staging semantic mismatch for ${id}.`);

  const sql = fs.readFileSync(path.join(artifactDir, 'release.sql'), 'utf8');
  requireValue(sql.includes("publication_status,created_at,updated_at) VALUES") && sql.includes("'publishable'"), 'Pinned SQL is not an invisible publishable import.');
  requireValue(!sql.includes("'published'"), 'Pinned SQL contains a direct published occurrence write.');
  requireValue(sql.includes("COALESCE(jurisdiction_id,'')='pt'") && sql.includes("COALESCE(effective_from,'')='2026-01-01'"), 'Pinned SQL is missing the scope-safe jurisdiction policy upsert.');
}

export function validatePortugalV2ProductionEvidence({ request, artifactDir, verificationDir, requireApproved = false }) {
  const summary = validateRequestShape(request, { requireApproved });
  validateHashes(request, artifactDir, verificationDir);
  validateArtifactSemantics(request, artifactDir, verificationDir);
  return { ...summary, evidenceValidated: true, requireApproved };
}

function main() {
  const requestPath = path.resolve(argument('--request', 'data/releases/roman-catholic-pt-2026-v2.production-request.json'));
  const artifactDir = argument('--artifact-dir');
  const verificationDir = argument('--verification-dir');
  const requireApproved = argument('--require-approved', 'false') === 'true';
  const request = readJson(requestPath);
  if (!artifactDir || !verificationDir) {
    const result = validateRequestShape(request, { requireApproved });
    console.log(JSON.stringify({ ...result, evidenceValidated: false, requireApproved }, null, 2));
    return;
  }
  const result = validatePortugalV2ProductionEvidence({ request, artifactDir: path.resolve(artifactDir), verificationDir: path.resolve(verificationDir), requireApproved });
  console.log(JSON.stringify(result, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

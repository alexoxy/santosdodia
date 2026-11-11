import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const packagePath = argument('--package');
const approvalPath = argument('--approval');
const outputPath = argument('--output');
const metadataOutputPath = argument('--metadata-output');
if (!packagePath || !approvalPath || !outputPath || !metadataOutputPath) {
  console.error('Usage: apply-calendar-staging-approval.mjs --package <normalized.json> --approval <approval.json> --output <approved.json> --metadata-output <metadata.json>');
  process.exit(2);
}

const sourcePackage = JSON.parse(fs.readFileSync(path.resolve(packagePath), 'utf8'));
const approval = JSON.parse(fs.readFileSync(path.resolve(approvalPath), 'utf8'));
const errors = [];
const DROPBOX_ROOT = '/Santos do Dia/02_Dados_Eclesiasticos/';

function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label} must be a non-empty string`);
    return '';
  }
  return value.trim();
}

function sha256(value, label) {
  const normalized = text(value, label);
  if (!/^[a-f0-9]{64}$/.test(normalized)) errors.push(`${label} must be a lowercase SHA-256`);
  return normalized;
}

function inDropboxRoot(value, label) {
  const normalized = text(value, label);
  if (!normalized.startsWith(DROPBOX_ROOT)) errors.push(`${label} must be inside the approved Dropbox root`);
  return normalized;
}

if (sourcePackage?.schemaVersion !== 1) errors.push('Package schemaVersion must equal 1');
if (approval?.schemaVersion !== 1) errors.push('Approval schemaVersion must equal 1');
if (approval?.scope !== 'd1-staging-only') errors.push('Approval scope must equal d1-staging-only');

const packageId = text(sourcePackage?.packageId, 'package.packageId');
const approvalId = text(approval?.approvalId, 'approval.approvalId');
if (approval?.package?.packageId !== packageId) errors.push('Approval packageId does not match the immutable package');

const packageCanonicalSha = createHash('sha256').update(JSON.stringify(sourcePackage)).digest('hex');
const approvedPackageSha = sha256(approval?.package?.canonicalSha256, 'approval.package.canonicalSha256');
if (packageCanonicalSha !== approvedPackageSha) errors.push('Immutable package canonical SHA-256 does not match the approval');

const approvedPackagePath = inDropboxRoot(approval?.package?.path, 'approval.package.path');
const manifestPath = inDropboxRoot(approval?.provenance?.manifestPath, 'approval.provenance.manifestPath');
const validationReportPath = inDropboxRoot(approval?.provenance?.validationReportPath, 'approval.provenance.validationReportPath');
inDropboxRoot(approval?.provenance?.integrityReceiptPath, 'approval.provenance.integrityReceiptPath');
const manifestSha256 = sha256(approval?.provenance?.manifestCanonicalSha256, 'approval.provenance.manifestCanonicalSha256');

if (sourcePackage?.run?.manifestPath !== manifestPath) errors.push('Package manifest path does not match the approval');
if (approval?.decision?.packageStatusOverride !== 'validated') errors.push('Approval must set packageStatusOverride to validated');
if (approval?.decision?.promotionAllowed !== true) errors.push('Approval must explicitly allow staging promotion');
if (approval?.decision?.publicationAllowed !== false) errors.push('Approval must explicitly prohibit publication');
if (approval?.decision?.requiredOccurrenceStatus !== 'withheld') errors.push('Approval must require withheld occurrences');
if (approval?.decision?.productionUseAllowed !== false) errors.push('Approval must prohibit production use');

const events = Array.isArray(sourcePackage?.events) ? sourcePackage.events : [];
if (!events.length) errors.push('Package contains no events');
if (events.some(event => event?.publicationStatus !== 'withheld')) errors.push('Every occurrence must remain withheld');
if (events.length !== approval?.package?.eventCount) errors.push('Approval event count does not match the package');
const labelCount = events.reduce((count, event) => count + Object.keys(event?.names ?? {}).length, 0);
if (labelCount !== approval?.package?.labelCount) errors.push('Approval label count does not match the package');

for (const key of [
  'schemaValidated',
  'sourceProvenancePresent',
  'churchCalendarPoliciesPresent',
  'englishLabelsPresent',
  'portugueseLabelsPresent',
  'allOccurrencesWithheld'
]) {
  if (approval?.checks?.[key] !== true) errors.push(`Approval check ${key} must be true`);
}

if (errors.length) {
  console.error(`Calendar staging approval rejected with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const approvedPackage = structuredClone(sourcePackage);
approvedPackage.packageId = approvalId;
approvedPackage.run = {
  ...approvedPackage.run,
  status: 'validated',
  promotionAllowed: true,
  publicationAllowed: false
};
approvedPackage.events = approvedPackage.events.map(event => ({ ...event, publicationStatus: 'withheld' }));

const metadata = {
  schemaVersion: 1,
  approvalId,
  originalPackageId: packageId,
  originalPackagePath: approvedPackagePath,
  originalPackageCanonicalSha256: packageCanonicalSha,
  manifestPath,
  manifestSha256,
  validationReportPath,
  eventCount: events.length,
  labelCount,
  publicationAllowed: false,
  productionUseAllowed: false
};

for (const [filePath, value] of [[outputPath, approvedPackage], [metadataOutputPath, metadata]]) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

console.log(`Applied staging approval ${approvalId} to immutable package ${packageId}; ${events.length} occurrences remain withheld.`);

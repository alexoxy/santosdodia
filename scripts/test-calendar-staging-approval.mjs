import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-staging-approval-'));
const packagePath = path.join(root, 'test/fixtures/normalized-calendar-package.valid.json');
const sourcePackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const canonicalSha256 = createHash('sha256').update(JSON.stringify(sourcePackage)).digest('hex');
const manifestSha256 = 'c'.repeat(64);

function approval(overrides = {}) {
  return {
    schemaVersion: 1,
    approvalId: 'normalized-calendar-staging-approval-test',
    scope: 'd1-staging-only',
    package: {
      path: '/Santos do Dia/02_Dados_Eclesiasticos/02_Validacao/provisorios/normalized-calendar-test.json',
      packageId: sourcePackage.packageId,
      canonicalSha256,
      eventCount: sourcePackage.events.length,
      labelCount: sourcePackage.events.reduce((count, event) => count + Object.keys(event.names ?? {}).length, 0)
    },
    provenance: {
      manifestPath: sourcePackage.run.manifestPath,
      manifestCanonicalSha256: manifestSha256,
      validationReportPath: '/Santos do Dia/02_Dados_Eclesiasticos/02_Validacao/relatorios/normalized-calendar-test.json',
      integrityReceiptPath: '/Santos do Dia/02_Dados_Eclesiasticos/99_Manifestos/normalized-calendar-test-integrity.json'
    },
    decision: {
      packageStatusOverride: 'validated',
      promotionAllowed: true,
      publicationAllowed: false,
      requiredOccurrenceStatus: 'withheld',
      productionUseAllowed: false
    },
    checks: {
      schemaValidated: true,
      sourceProvenancePresent: true,
      churchCalendarPoliciesPresent: true,
      englishLabelsPresent: true,
      portugueseLabelsPresent: true,
      allOccurrencesWithheld: true,
      remoteD1PromotionTested: false
    },
    ...overrides
  };
}

function execute(packageFile, approvalValue, expectedSuccess) {
  const approvalPath = path.join(directory, `approval-${Math.random()}.json`);
  const outputPath = path.join(directory, `approved-${Math.random()}.json`);
  const metadataPath = path.join(directory, `metadata-${Math.random()}.json`);
  fs.writeFileSync(approvalPath, JSON.stringify(approvalValue), 'utf8');
  const result = spawnSync(process.execPath, [
    'scripts/apply-calendar-staging-approval.mjs',
    '--package', packageFile,
    '--approval', approvalPath,
    '--output', outputPath,
    '--metadata-output', metadataPath
  ], { cwd: root, encoding: 'utf8' });
  if (expectedSuccess && result.status !== 0) throw new Error(`Valid approval failed:\n${result.stdout}\n${result.stderr}`);
  if (!expectedSuccess && result.status === 0) throw new Error('Unsafe approval was accepted.');
  return { result, outputPath, metadataPath };
}

try {
  const valid = execute(packagePath, approval(), true);
  const approved = JSON.parse(fs.readFileSync(valid.outputPath, 'utf8'));
  const metadata = JSON.parse(fs.readFileSync(valid.metadataPath, 'utf8'));
  if (approved.packageId !== 'normalized-calendar-staging-approval-test') throw new Error('Approval ID was not applied as the import run ID.');
  if (approved.run.status !== 'validated' || approved.run.promotionAllowed !== true || approved.run.publicationAllowed !== false) {
    throw new Error('Approved package flags are incorrect.');
  }
  if (approved.events.some(event => event.publicationStatus !== 'withheld')) throw new Error('Approved package exposed an occurrence.');
  if (metadata.originalPackageCanonicalSha256 !== canonicalSha256 || metadata.manifestSha256 !== manifestSha256) {
    throw new Error('Approval metadata is incomplete.');
  }

  const tamperedPackagePath = path.join(directory, 'tampered-package.json');
  const tampered = structuredClone(sourcePackage);
  tampered.events[0].dateISO = '2026-04-13';
  fs.writeFileSync(tamperedPackagePath, JSON.stringify(tampered), 'utf8');
  execute(tamperedPackagePath, approval(), false);

  const publicPackagePath = path.join(directory, 'public-package.json');
  const publicPackage = structuredClone(sourcePackage);
  publicPackage.events[0].publicationStatus = 'publishable';
  fs.writeFileSync(publicPackagePath, JSON.stringify(publicPackage), 'utf8');
  const publicApproval = approval();
  publicApproval.package.canonicalSha256 = createHash('sha256').update(JSON.stringify(publicPackage)).digest('hex');
  execute(publicPackagePath, publicApproval, false);

  const wrongCount = approval();
  wrongCount.package.eventCount = 2;
  execute(packagePath, wrongCount, false);

  const productionApproval = approval();
  productionApproval.decision.productionUseAllowed = true;
  execute(packagePath, productionApproval, false);

  console.log('Immutable calendar staging approval tests passed.');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

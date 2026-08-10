#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAutonomyPlan } from './build-plan.mjs';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(moduleDir, '../..');

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function safeRepositoryScript(relativePath, prefix) {
  const normalized = path.normalize(relativePath);
  if (!normalized.startsWith(prefix) || normalized.split(path.sep).includes('..')) {
    throw new Error(`Script path is outside ${prefix}: ${relativePath}`);
  }
  return path.join(ROOT, normalized);
}

function runNode(script, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: ROOT,
      env: { ...process.env, ...env },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.relative(ROOT, script)} exited with code ${code ?? 1}.`));
    });
  });
}

async function newestRunDirectory(rawRoot, sourceId) {
  const sourceRoot = path.join(rawRoot, sourceId);
  const entries = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const latest = entries.at(-1);
  if (!latest) throw new Error(`No acquisition run directory was produced for ${sourceId}.`);
  return path.join(sourceRoot, latest);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function runShadowCycle(outputRoot) {
  const absoluteOutput = path.resolve(ROOT, outputRoot);
  const rawRoot = path.join(absoluteOutput, 'raw');
  const normalizedRoot = path.join(absoluteOutput, 'normalized');
  await mkdir(rawRoot, { recursive: true });
  await mkdir(normalizedRoot, { recursive: true });

  const cycleId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
  const plan = buildAutonomyPlan();
  await writeFile(path.join(absoluteOutput, 'plan.json'), `${JSON.stringify({ cycleId, ...plan }, null, 2)}\n`, 'utf8');

  const sourceResults = [];
  for (const source of plan.acquisition.selected) {
    const adapter = safeRepositoryScript(source.adapter, `scripts${path.sep}osint${path.sep}adapters${path.sep}`);
    const normalizer = safeRepositoryScript(source.normalizer, `scripts${path.sep}osint${path.sep}`);

    await runNode(adapter, [source.sourceId, path.relative(ROOT, rawRoot)], {
      OSINT_WIKIDATA_PAGE_SIZE: process.env.OSINT_WIKIDATA_PAGE_SIZE ?? '500',
      OSINT_WIKIDATA_MAX_PAGES: process.env.OSINT_WIKIDATA_MAX_PAGES ?? '1',
    });

    const runDirectory = await newestRunDirectory(rawRoot, source.sourceId);
    const normalizedDirectory = path.join(normalizedRoot, source.sourceId);
    await runNode(normalizer, [path.relative(ROOT, runDirectory), path.relative(ROOT, normalizedDirectory)]);

    const stagingManifest = await readJson(path.join(normalizedDirectory, 'staging-manifest.json'));
    const qualityReport = await readJson(path.join(normalizedDirectory, 'quality-report.json'));
    const conflictCount = Number(stagingManifest.conflictCount ?? 0);

    sourceResults.push({
      sourceId: source.sourceId,
      authorityClass: source.authorityClass,
      authorityScore: source.authorityScore,
      publicationClass: source.publicationClass,
      acquired: true,
      normalized: true,
      entityCount: Number(stagingManifest.entityCount ?? 0),
      conflictCount,
      candidateForCrossSourceResolution: true,
      standaloneAutomaticPromotionAllowed: source.canAutoPromoteAlone === true && conflictCount === 0,
      publicationGateFromNormalizer: qualityReport.publicationGate ?? null,
      rawRunDirectory: path.relative(ROOT, runDirectory),
      normalizedDirectory: path.relative(ROOT, normalizedDirectory),
    });
  }

  const report = {
    schemaVersion: 1,
    cycleId,
    generatedAt: new Date().toISOString(),
    phase: plan.phase,
    targetMode: plan.targetMode,
    status: 'completed',
    selectedSources: plan.acquisition.selectedCount,
    heldSources: plan.acquisition.heldCount,
    sources: sourceResults,
    productionDecision: {
      action: 'none',
      reason: plan.promotion.productionMutationAllowed ? 'promotion_engine_not_yet_connected' : 'shadow_mode',
      productionMutationAllowed: false,
      lastKnownGoodPreserved: true,
    },
    nextAutonomousGate: 'cross-source resolution + D1 staging + transactional promotion/rollback',
  };

  await writeFile(path.join(absoluteOutput, 'cycle-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

async function main() {
  const output = argument('--output', 'staging/autonomous-data-plane');
  const report = await runShadowCycle(output);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}

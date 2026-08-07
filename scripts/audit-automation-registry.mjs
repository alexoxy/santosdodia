#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REGISTRY_PATH = path.resolve(moduleDir, '../config/automation-registry.json');
const ALLOWED_MODES = new Set(['scheduled', 'event-driven', 'manual']);
const ALLOWED_PUBLICATION_MODES = new Set(['none', 'read-only', 'staging-only']);

function workflowCrons(source) {
  return [...source.matchAll(/-\s+cron:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]).sort();
}

export function discoverAutomationInventory(root = process.cwd()) {
  const workflowRoot = path.join(root, '.github', 'workflows');
  const workflows = new Map();
  for (const name of fs.readdirSync(workflowRoot).filter((item) => /\.ya?ml$/i.test(item)).sort()) {
    const relative = `.github/workflows/${name}`;
    const source = fs.readFileSync(path.join(workflowRoot, name), 'utf8');
    workflows.set(relative, { crons: workflowCrons(source) });
  }
  return { root, workflows };
}

function duplicates(values) {
  const seen = new Set();
  const output = new Set();
  for (const value of values) {
    if (seen.has(value)) output.add(value);
    seen.add(value);
  }
  return [...output].sort();
}

function sameValues(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function validateAutomationRegistry(registry, inventory) {
  const errors = [];
  if (registry?.schemaVersion !== 1) errors.push('Registry schemaVersion must be 1.');
  if (registry?.timezone !== 'UTC') errors.push('Automation registry timezone must remain UTC.');
  if (registry?.policy?.automaticProductionWrites !== false) errors.push('Automatic production writes must remain disabled.');
  if (registry?.policy?.requestTimeExternalAcquisition !== false) errors.push('Request-time external acquisition must remain disabled.');
  if (registry?.policy?.editorialTextRequiresHumanApproval !== true) errors.push('Editorial text must require human approval.');
  if (registry?.policy?.sourceFailuresAreReviewCandidatesOnly !== true) errors.push('Source failures must remain review candidates only.');

  const tasks = Array.isArray(registry?.tasks) ? registry.tasks : [];
  for (const duplicate of duplicates(tasks.map((task) => task.id))) errors.push(`Duplicate task id: ${duplicate}`);
  for (const duplicate of duplicates(tasks.map((task) => task.workflow))) errors.push(`Workflow is registered more than once: ${duplicate}`);

  const registeredWorkflows = new Set();
  const registeredProducers = [];
  for (const task of tasks) {
    const prefix = `Task ${task.id ?? '<missing>'}`;
    if (!task.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task.id)) errors.push(`${prefix} has an invalid id.`);
    if (!task.title || !task.owner) errors.push(`${prefix} must declare title and owner.`);
    if (!ALLOWED_MODES.has(task.mode)) errors.push(`${prefix} has invalid mode ${task.mode}.`);
    if (!ALLOWED_PUBLICATION_MODES.has(task.publicationMode)) errors.push(`${prefix} has forbidden publicationMode ${task.publicationMode}.`);

    const workflow = inventory.workflows.get(task.workflow);
    if (!workflow) errors.push(`${prefix} references missing workflow ${task.workflow}.`);
    else {
      registeredWorkflows.add(task.workflow);
      const declaredCrons = Array.isArray(task.crons) ? task.crons : [];
      if (!sameValues(declaredCrons, workflow.crons)) {
        errors.push(`${prefix} cron mismatch: registry=${JSON.stringify(declaredCrons)} workflow=${JSON.stringify(workflow.crons)}.`);
      }
      if (task.mode === 'scheduled' && workflow.crons.length === 0) errors.push(`${prefix} is scheduled but has no cron.`);
      if (task.mode !== 'scheduled' && workflow.crons.length > 0) errors.push(`${prefix} is not scheduled but declares a cron.`);
    }

    if (task.mode === 'scheduled' && task.publicationMode === 'staging-only' && !task.archiveStream) {
      errors.push(`${prefix} stages on a schedule but has no bounded archive stream.`);
    }
    for (const producer of task.producerScripts ?? []) {
      registeredProducers.push(producer);
      if (!fs.existsSync(path.join(inventory.root, producer))) errors.push(`${prefix} references missing producer ${producer}.`);
    }
  }

  for (const [workflow, details] of inventory.workflows) {
    if (details.crons.length > 0 && !registeredWorkflows.has(workflow)) {
      errors.push(`Scheduled workflow is not registered: ${workflow}`);
    }
  }
  for (const duplicate of duplicates(registeredProducers)) errors.push(`Producer is assigned to multiple tasks: ${duplicate}`);

  const freshness = tasks.find((task) => task.id === 'source-freshness');
  if (!freshness) errors.push('Weekly source-freshness task is missing.');
  else if (freshness.publicationMode !== 'staging-only' || freshness.archiveStream !== 'source-freshness') {
    errors.push('Source freshness must remain a staging-only review report.');
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      tasks: tasks.length,
      scheduledTasks: tasks.filter((task) => task.mode === 'scheduled').length,
      scheduledWorkflows: [...inventory.workflows.values()].filter((item) => item.crons.length > 0).length,
      producerScripts: registeredProducers.length
    }
  };
}

export function auditAutomationRegistry(root = process.cwd(), registryPath = DEFAULT_REGISTRY_PATH) {
  const registry = JSON.parse(fs.readFileSync(path.resolve(registryPath), 'utf8'));
  return validateAutomationRegistry(registry, discoverAutomationInventory(root));
}

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function main() {
  const root = path.resolve(argument('--root', process.cwd()));
  const registryPath = path.resolve(argument('--registry', DEFAULT_REGISTRY_PATH));
  const report = auditAutomationRegistry(root, registryPath);
  process.stdout.write(`${JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

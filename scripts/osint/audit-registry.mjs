#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const registryPath = process.argv[2] ?? 'data/source-registry/seed.json';
const manifestPath = process.argv[3] ?? 'data/osint/manifests/p0-initial-dump.json';
const policyPath = process.argv[4] ?? 'data/osint/policies/p0-policy-registry.json';

const [registry, manifest, policyRegistry] = await Promise.all([
  readJson(registryPath),
  readJson(manifestPath),
  readJson(policyPath),
]);

const errors = [];
const warnings = [];

if (!Array.isArray(registry.sources) || registry.sources.length === 0) {
  errors.push(`${registryPath}: sources must be a non-empty array`);
}
if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
  errors.push(`${manifestPath}: sources must be a non-empty array`);
}
if (!Array.isArray(policyRegistry.sources)) {
  errors.push(`${policyPath}: sources must be an array`);
}
if (manifest.mode !== 'archive-only' || manifest.publish !== false) {
  errors.push(`${manifestPath}: initial dump must remain archive-only with publish=false`);
}

const sourceById = uniqueMap(registry.sources ?? [], 'registry', errors);
const policyById = uniqueMap(policyRegistry.sources ?? [], 'policy registry', errors);
const manifestById = uniqueMap(manifest.sources ?? [], 'manifest', errors);

for (const source of registry.sources ?? []) {
  requireString(source.id, 'source.id', errors);
  requireString(source.name, `${source.id}.name`, errors);
  requireHttps(source.url, `${source.id}.url`, errors);
  requireArray(source.traditions, `${source.id}.traditions`, errors);
  requireArray(source.languages, `${source.id}.languages`, errors);
  requireArray(source.domains, `${source.id}.domains`, errors);
  if (!Number.isInteger(source.authorityScore) || source.authorityScore < 0 || source.authorityScore > 100) {
    errors.push(`${source.id}.authorityScore must be an integer from 0 to 100`);
  }
  if (!['P0', 'P1', 'P2', 'P3'].includes(source.priority)) {
    warnings.push(`${source.id}.priority is missing or non-standard`);
  }
}

for (const item of manifest.sources ?? []) {
  const source = sourceById.get(item.id);
  const policy = policyById.get(item.id);
  if (!source) errors.push(`manifest source ${item.id} is absent from the source registry`);
  if (!policy) errors.push(`manifest source ${item.id} has no explicit policy record`);
  if (source && source.url !== item.url) {
    errors.push(`manifest URL mismatch for ${item.id}: ${item.url} != ${source.url}`);
  }
  if (item.enabled === true && policy?.decision !== 'approved') {
    errors.push(`enabled source ${item.id} is not policy-approved`);
  }
  if (policy?.decision === 'approved') {
    if (policy.licenceStatus !== 'open' && !policy.allowedUses?.includes('metadata-only')) {
      errors.push(`approved source ${item.id} lacks an open licence or metadata-only restriction`);
    }
    if (!policy.robotsPolicy || policy.robotsPolicy === 'pending') {
      errors.push(`approved source ${item.id} lacks an explicit robots/API policy`);
    }
    if (!Number.isInteger(policy.rateLimitPerMinute) || policy.rateLimitPerMinute < 1) {
      errors.push(`approved source ${item.id} lacks a positive rateLimitPerMinute`);
    }
  }
}

for (const policy of policyRegistry.sources ?? []) {
  if (!manifestById.has(policy.id)) warnings.push(`policy ${policy.id} is not used by the P0 manifest`);
  if (!['approved', 'pending', 'blocked'].includes(policy.decision)) {
    errors.push(`${policy.id}.decision must be approved, pending, or blocked`);
  }
}

const enabled = (manifest.sources ?? []).filter((source) => source.enabled === true);
const approved = (policyRegistry.sources ?? []).filter((source) => source.decision === 'approved');

console.log(JSON.stringify({
  registryPath,
  manifestPath,
  policyPath,
  registrySources: sourceById.size,
  manifestSources: manifestById.size,
  enabledSources: enabled.map((source) => source.id),
  approvedSources: approved.map((source) => source.id),
  warnings,
  errors,
}, null, 2));

if (errors.length) process.exitCode = 1;

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function uniqueMap(items, label, errors) {
  const map = new Map();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id) {
      errors.push(`${label} contains an item without id`);
      continue;
    }
    if (map.has(item.id)) errors.push(`${label} contains duplicate id ${item.id}`);
    map.set(item.id, item);
  }
  return map;
}

function requireString(value, label, errors) {
  if (typeof value !== 'string' || value.trim().length === 0) errors.push(`${label} must be a non-empty string`);
}

function requireArray(value, label, errors) {
  if (!Array.isArray(value) || value.length === 0) errors.push(`${label} must be a non-empty array`);
}

function requireHttps(value, label, errors) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') errors.push(`${label} must use https`);
  } catch {
    errors.push(`${label} must be a valid URL`);
  }
}

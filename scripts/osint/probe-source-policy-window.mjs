#!/usr/bin/env node

import dns from 'node:dns/promises';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_INPUT = 'staging/source-orchestrator/plan.json';
const DEFAULT_OUTPUT = 'staging/source-orchestrator/report.json';
const USER_AGENT = 'SantosDia-Source-Policy/1.0 (+https://www.santosdodia.com/copyright)';
const MAX_REDIRECTS = 4;
const ROBOTS_MAX_BYTES = 8192;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

export function isPrivateIp(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const parts = address.split('.').map(Number);
    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (family === 6) {
    const normalized = address.toLowerCase().split('%')[0];
    return (
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      /^fe[89ab]/u.test(normalized) ||
      normalized.startsWith('ff') ||
      normalized.startsWith('2001:db8:')
    );
  }
  return true;
}

export function isSafeHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    const hostname = url.hostname.toLowerCase();
    if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) return false;
    if (net.isIP(hostname)) return !isPrivateIp(hostname);
    return true;
  } catch {
    return false;
  }
}

async function assertPublicHost(url) {
  if (!isSafeHttpsUrl(url)) throw new Error('URL is not an allowed public HTTPS target.');
  const hostname = new URL(url).hostname;
  if (net.isIP(hostname)) return;
  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length) throw new Error('DNS returned no addresses.');
  for (const item of addresses) {
    if (isPrivateIp(item.address)) throw new Error(`DNS resolved to a non-public address: ${item.address}`);
  }
}

export function robotsBlocksAll(text) {
  const lines = String(text ?? '')
    .replace(/\r\n?/gu, '\n')
    .split('\n')
    .map((line) => line.replace(/#.*$/u, '').trim())
    .filter(Boolean);
  let applies = false;
  for (const line of lines) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === 'user-agent') {
      applies = value === '*';
      continue;
    }
    if (applies && field === 'disallow' && value === '/') return true;
  }
  return false;
}

async function safeFetch(initialUrl, options = {}) {
  let current = initialUrl;
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicHost(current);
    const response = await fetch(current, {
      ...options,
      redirect: 'manual',
      headers: { 'User-Agent': USER_AGENT, ...(options.headers ?? {}) },
      signal: AbortSignal.timeout(options.timeoutMs ?? 12_000),
    });
    if (response.status < 300 || response.status >= 400) return { response, finalUrl: current };
    const location = response.headers.get('location');
    await response.body?.cancel().catch(() => {});
    if (!location) return { response, finalUrl: current };
    if (redirect === MAX_REDIRECTS) throw new Error('Redirect limit exceeded.');
    current = new URL(location, current).toString();
  }
  throw new Error('Redirect loop guard reached.');
}

async function probeAvailability(url) {
  let result = await safeFetch(url, { method: 'HEAD', headers: { Accept: '*/*' } });
  if ([405, 501].includes(result.response.status)) {
    await result.response.body?.cancel().catch(() => {});
    result = await safeFetch(url, { method: 'GET', headers: { Accept: '*/*', Range: 'bytes=0-0' } });
  }
  const status = result.response.status;
  const headers = {
    etag: result.response.headers.get('etag'),
    lastModified: result.response.headers.get('last-modified'),
    contentType: result.response.headers.get('content-type'),
  };
  await result.response.body?.cancel().catch(() => {});
  return { status, finalUrl: result.finalUrl, headers, reachable: status >= 200 && status < 500 };
}

async function probeRobots(rootUrl) {
  const origin = new URL(rootUrl).origin;
  const robotsUrl = `${origin}/robots.txt`;
  const { response, finalUrl } = await safeFetch(robotsUrl, { method: 'GET', headers: { Accept: 'text/plain,*/*;q=0.1' } });
  const status = response.status;
  if (status === 404 || status === 410) {
    await response.body?.cancel().catch(() => {});
    return { url: robotsUrl, finalUrl, status, present: false, blocksAll: false, truncated: false };
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    return { url: robotsUrl, finalUrl, status, present: null, blocksAll: null, truncated: false };
  }
  const declaredLength = Number(response.headers.get('content-length') ?? 0);
  if (declaredLength > ROBOTS_MAX_BYTES) {
    await response.body?.cancel().catch(() => {});
    return { url: robotsUrl, finalUrl, status, present: true, blocksAll: null, truncated: true, note: 'robots.txt exceeds bounded inspection size' };
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const bounded = bytes.subarray(0, ROBOTS_MAX_BYTES);
  return {
    url: robotsUrl,
    finalUrl,
    status,
    present: true,
    blocksAll: robotsBlocksAll(bounded.toString('utf8')),
    truncated: bytes.length > ROBOTS_MAX_BYTES,
  };
}

export function classifyPolicyCandidate(source, availability, robots) {
  if (!availability?.reachable) return 'source-health-review';
  if (robots?.blocksAll === true) return 'blocked-by-robots-candidate';
  if (robots?.blocksAll === null || robots?.truncated === true) return 'robots-review-required';
  const reuse = String(source?.reuseStatus ?? '').toLowerCase();
  const explicitlyOpen = /(?:^|-)cc0(?:-|$)|cc-by|odbl|apache|unicode-license|open-distribution|metadata-cc0/u.test(reuse);
  if (explicitlyOpen && robots?.blocksAll === false) return 'eligible-policy-promotion-review';
  return 'needs-licence-terms-review';
}

export async function probePolicySource(source) {
  const startedAt = new Date().toISOString();
  try {
    const availability = await probeAvailability(source.url);
    const robots = await probeRobots(availability.finalUrl ?? source.url);
    return {
      id: source.id,
      name: source.name,
      sourceSet: source.sourceSet,
      authorityClass: source.authorityClass,
      priority: source.priority,
      baselineReferenced: source.baselineReferenced,
      decisionBefore: source.decision,
      reuseStatus: source.reuseStatus,
      startedAt,
      checkedAt: new Date().toISOString(),
      availability,
      robots,
      candidateStatus: classifyPolicyCandidate(source, availability, robots),
      automaticPromotion: false,
      contentAcquired: false,
    };
  } catch (error) {
    return {
      id: source.id,
      name: source.name,
      sourceSet: source.sourceSet,
      authorityClass: source.authorityClass,
      priority: source.priority,
      baselineReferenced: source.baselineReferenced,
      decisionBefore: source.decision,
      reuseStatus: source.reuseStatus,
      startedAt,
      checkedAt: new Date().toISOString(),
      availability: { reachable: false },
      robots: null,
      candidateStatus: 'source-health-review',
      automaticPromotion: false,
      contentAcquired: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapBounded(items, limit, operation) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await operation(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, worker));
  return output;
}

export async function buildPolicyProbeReport(plan, { network = false } = {}) {
  if (plan?.policy?.automaticSourcePromotion !== false || plan?.policy?.automaticProductionWrites !== false) {
    throw new Error('Refusing a plan that enables automatic source promotion or production writes.');
  }
  const due = Array.isArray(plan?.duePolicyProbes) ? plan.duePolicyProbes : [];
  const checks = network
    ? await mapBounded(due, 3, probePolicySource)
    : due.map((source) => ({
        id: source.id,
        name: source.name,
        url: source.url,
        candidateStatus: 'dry-run-not-checked',
        automaticPromotion: false,
        contentAcquired: false,
      }));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    networkChecked: network,
    sourcePlanGeneratedAt: plan.generatedAt ?? null,
    policy: {
      automaticSourcePromotion: false,
      automaticProductionWrites: false,
      pendingSourceAcquisition: 'availability-and-robots-only',
      contentAcquisition: false,
    },
    checks,
    approvedDispatch: plan.approvedDispatch ?? [],
    delegatedApprovedSources: plan.delegatedApprovedSources ?? [],
    summary: {
      due: due.length,
      checked: network ? checks.length : 0,
      eligiblePromotionReview: checks.filter((item) => item.candidateStatus === 'eligible-policy-promotion-review').length,
      licenceTermsReview: checks.filter((item) => item.candidateStatus === 'needs-licence-terms-review').length,
      robotsReview: checks.filter((item) => /robots/u.test(item.candidateStatus)).length,
      healthReview: checks.filter((item) => item.candidateStatus === 'source-health-review').length,
      approvedDispatch: (plan.approvedDispatch ?? []).length,
      delegatedApprovedSources: (plan.delegatedApprovedSources ?? []).length,
    },
  };
}

async function main() {
  const input = path.resolve(argument('--input', DEFAULT_INPUT));
  const output = path.resolve(argument('--output', DEFAULT_OUTPUT));
  const plan = JSON.parse(fs.readFileSync(input, 'utf8'));
  const report = await buildPolicyProbeReport(plan, { network: hasFlag('--network') });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Source policy probe failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

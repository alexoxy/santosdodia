import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const observancesPath = resolve(root, 'data/observances.ts');
const discoveryPath = resolve(root, 'data/discovery.ts');
const evidencePath = resolve(root, 'data/editorial-claim-evidence.json');
const patronageQueuePath = resolve(root, 'data/editorial-patronage-review-queue.json');

const [observancesSource, discoverySource, evidenceSource, patronageQueueSource] = await Promise.all([
  readFile(observancesPath, 'utf8'),
  readFile(discoveryPath, 'utf8'),
  readFile(evidencePath, 'utf8'),
  readFile(patronageQueuePath, 'utf8')
]);

const observanceIds = new Set(
  [...observancesSource.matchAll(/entry\(\s*['"]([^'"]+)['"]/g)].map(match => match[1])
);
const catalogSourceIds = new Set(
  [...observancesSource.matchAll(/\{id:['"]([^'"]+)['"],name:/g)].map(match => match[1])
);

let document;
let patronageQueue;
try {
  document = JSON.parse(evidenceSource);
  patronageQueue = JSON.parse(patronageQueueSource);
} catch (error) {
  console.error(`Invalid editorial evidence JSON: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const seenClaims = new Set();
const evidence = Array.isArray(document.evidence) ? document.evidence : [];

if (document.schemaVersion !== 1) errors.push('Unsupported or missing schemaVersion.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(document.reviewedAt ?? '')) errors.push('Document reviewedAt must use YYYY-MM-DD.');

for (const [index, item] of evidence.entries()) {
  const label = `evidence[${index}]`;
  if (!observanceIds.has(item.observanceId)) errors.push(`${label}: unknown observanceId ${item.observanceId ?? '<missing>'}`);
  if (typeof item.claimType !== 'string' || !item.claimType.trim()) errors.push(`${label}: missing claimType`);
  if (typeof item.claimValue !== 'string' || !item.claimValue.trim()) errors.push(`${label}: missing claimValue`);
  if (!['corroborated', 'disputed', 'rejected'].includes(item.status)) errors.push(`${label}: invalid status ${item.status ?? '<missing>'}`);

  const claimKey = `${item.observanceId}|${item.claimType}|${item.claimValue}`;
  if (seenClaims.has(claimKey)) errors.push(`${label}: duplicate claim evidence`);
  seenClaims.add(claimKey);

  const source = item.source ?? {};
  if (!catalogSourceIds.has(source.catalogSourceId)) errors.push(`${label}: source is not linked to SOURCE_CATALOG`);
  if (typeof source.name !== 'string' || !source.name.trim()) errors.push(`${label}: missing source name`);
  if (source.kind !== 'official' && source.kind !== 'scholarly') warnings.push(`${label}: source is not classified official or scholarly`);
  try {
    const url = new URL(source.url);
    if (url.protocol !== 'https:') errors.push(`${label}: source URL must use HTTPS`);
  } catch {
    errors.push(`${label}: invalid source URL`);
  }

  if (!Array.isArray(item.unresolvedClaims)) errors.push(`${label}: unresolvedClaims must be an array`);
  if (item.unresolvedClaims?.length) errors.push(`${label}: unresolved related claims must be withheld in the patronage queue`);
}

if (patronageQueue.schemaVersion !== 1) errors.push('Unsupported patronage review queue schemaVersion.');
if (patronageQueue.publicationStatus !== 'withheld-pending-claim-evidence') errors.push('Patronage queue must remain publication-withheld.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(patronageQueue.reviewedAt ?? '')) errors.push('Patronage queue reviewedAt must use YYYY-MM-DD.');
if (/patronages\s*:\s*\[/.test(observancesSource)) errors.push('Unsourced patronage claims remain in the public observance dataset.');
if (!/export const DISCOVERY_TOPICS:DiscoveryTopic\[\]=DISCOVERY_TOPIC_CANDIDATES\.filter\(\(\) => false\);/.test(discoverySource)) errors.push('Discovery topics must remain fail-closed while their associations lack claim-level evidence.');

const candidateBlock = discoverySource.match(/const DISCOVERY_TOPIC_CANDIDATES:DiscoveryTopic\[\]=\[([\s\S]*?)\n\];/)?.[1] ?? '';
const candidateTopicSlugs = [...candidateBlock.matchAll(/\{slug:['"]([^'"]+)['"]/g)].map(match => match[1]);
const candidateObservanceIds = [...candidateBlock.matchAll(/observanceIds:\[([^\]]*)\]/g)]
  .flatMap(match => [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(value => value[1]));
const queuedTopicSlugs = Array.isArray(patronageQueue.withheldDiscoveryTopicSlugs) ? patronageQueue.withheldDiscoveryTopicSlugs : [];
if (!candidateTopicSlugs.length) errors.push('No withheld discovery topic candidates were detected.');
if (new Set(candidateTopicSlugs).size !== candidateTopicSlugs.length) errors.push('Duplicate discovery topic candidate slug.');
if (new Set(queuedTopicSlugs).size !== queuedTopicSlugs.length) errors.push('Duplicate withheld discovery topic slug.');
const missingQueuedTopics = candidateTopicSlugs.filter(slug => !queuedTopicSlugs.includes(slug));
const unknownQueuedTopics = queuedTopicSlugs.filter(slug => !candidateTopicSlugs.includes(slug));
if (missingQueuedTopics.length) errors.push(`Discovery candidates missing from review queue: ${missingQueuedTopics.join(', ')}`);
if (unknownQueuedTopics.length) errors.push(`Review queue has unknown discovery topics: ${unknownQueuedTopics.join(', ')}`);
for (const id of candidateObservanceIds) {
  if (!observanceIds.has(id)) errors.push(`Discovery candidate references unknown observanceId ${id}`);
}
const queuedClaims = new Set();
for (const [index, item] of (patronageQueue.items ?? []).entries()) {
  const label = `patronageQueue.items[${index}]`;
  if (!observanceIds.has(item.observanceId)) errors.push(`${label}: unknown observanceId ${item.observanceId ?? '<missing>'}`);
  if (!Array.isArray(item.claims) || !item.claims.length) errors.push(`${label}: claims must be a non-empty array`);
  for (const claim of item.claims ?? []) {
    if (typeof claim !== 'string' || !claim.trim()) errors.push(`${label}: invalid claim`);
    const key = `${item.observanceId}|${claim}`;
    if (queuedClaims.has(key)) errors.push(`${label}: duplicate withheld claim ${claim}`);
    queuedClaims.add(key);
  }
}

const reviewedObservances = new Set(evidence.map(item => item.observanceId).filter(Boolean));
const report = {
  schemaVersion: document.schemaVersion,
  reviewedAt: document.reviewedAt,
  evidenceCount: evidence.length,
  reviewedObservanceCount: reviewedObservances.size,
  unresolvedClaimCount: evidence.reduce((total, item) => total + (Array.isArray(item.unresolvedClaims) ? item.unresolvedClaims.length : 0), 0),
  withheldPatronageClaimCount: queuedClaims.size,
  withheldDiscoveryTopicCount: candidateTopicSlugs.length,
  withheldDiscoveryAssociationCount: candidateObservanceIds.length,
  errors,
  warnings
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function readJsonLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
}
function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
function push(decisions, lane, claimClass, reason, details = {}) {
  decisions.push({ lane, claimClass, reason, ...details });
}
function rank(lane) {
  return { 'auto-eligible': 0, 'cross-check-required': 1, 'human-review-required': 2 }[lane] ?? 2;
}

const input = path.resolve(argument('--input', 'staging/osint-reviewed/saints/wikidata'));
const output = path.resolve(argument('--output', 'staging/publication-decisions/saints/wikidata'));
const policyPath = path.resolve(argument('--policy', 'config/publication-decision-policy.json'));
const policy = readJson(policyPath);
const manifest = readJson(path.join(input, 'staging-manifest.json'));
const quality = readJson(path.join(input, 'quality-report.json'));
const linguisticPath = path.join(input, 'linguistic-review.json');
const linguistic = fs.existsSync(linguisticPath) ? readJson(linguisticPath) : null;
const entities = readJsonLines(path.join(input, 'entities.jsonl'));

if (policy.mode !== 'shadow-classification' || policy.productionAutoPromotionEnabled !== false) {
  throw new Error('Publication classifier must remain in shadow mode until the policy is deliberately promoted.');
}
if (manifest.publish !== false) throw new Error('Classifier only accepts non-publishable staging packages.');
if (manifest.entityCount !== entities.length) throw new Error('Manifest entity count does not match entities.jsonl.');
if (linguistic && ((linguistic.batchFatalCount ?? 0) !== 0 || (linguistic.criticalCount ?? 0) !== 0)) {
  throw new Error('Classifier refuses a package with unresolved critical linguistic issues.');
}

const classified = [];
const summary = { entities: entities.length, claims: 0, lanes: { 'auto-eligible': 0, 'cross-check-required': 0, 'human-review-required': 0 }, entityDisposition: { 'auto-eligible': 0, 'cross-check-required': 0, 'human-review-required': 0 } };

for (const entity of entities) {
  const decisions = [];

  if (entity.entityType !== 'person') {
    push(decisions, 'human-review-required', 'new-canonical-person', 'Only person entities are in scope for the current saints publication policy.', { entityType: entity.entityType });
  }

  if (entity.qid) {
    push(decisions, 'auto-eligible', 'exact-external-identifier', 'Exact Wikidata QID evidence may be retained automatically as non-editorial identity evidence.', { qid: entity.qid });
  } else {
    push(decisions, 'human-review-required', 'new-canonical-person', 'No exact external identifier is available; canonical identity resolution requires review.');
  }

  for (const name of entity.names ?? []) {
    push(decisions, 'cross-check-required', 'localized-source-label', 'Source labels remain non-preferred until language/script gates and corroboration establish a public canonical label.', { language: name.language, name: name.name });
  }

  for (const predicate of ['birth', 'death']) {
    const value = entity.dates?.[predicate];
    if (!value?.canonical) continue;
    if (value.resolutionStatus === 'conflict') {
      push(decisions, 'human-review-required', 'source-conflict', `${predicate} date has conflicting source values.`, { predicate, value: value.canonical });
    } else {
      push(decisions, 'cross-check-required', `${predicate}-date`, `${predicate} date is factual enrichment but requires independent corroboration before any future public auto-promotion.`, { predicate, value: value.canonical, resolutionStatus: value.resolutionStatus ?? null });
    }
  }

  const recognition = entity.recognition?.sourceStatusCandidates ?? [];
  if (recognition.length) {
    push(decisions, 'human-review-required', 'recognition-or-canonization-status', 'Recognition/canonization status changes ecclesial meaning and always requires human review.', { candidates: recognition.map((item) => item?.qid).filter(Boolean) });
  }

  const geography = entity.geography ?? entity.places ?? entity.locations;
  if (Array.isArray(geography) ? geography.length : Boolean(geography)) {
    push(decisions, 'cross-check-required', 'geography', 'Geographic enrichment may be automated only after claim-specific corroboration.');
  }

  if (entity.editorialSummary || entity.biography || entity.summary) {
    push(decisions, 'human-review-required', 'editorial-summary', 'Editorial or interpretive prose is never auto-promoted by this pipeline.');
  }

  if (decisions.length === 0) {
    push(decisions, 'human-review-required', 'new-canonical-person', 'No explicitly safe claim class was identified.');
  }

  const disposition = decisions.reduce((current, decision) => rank(decision.lane) > rank(current) ? decision.lane : current, 'auto-eligible');
  for (const decision of decisions) summary.lanes[decision.lane] += 1;
  summary.claims += decisions.length;
  summary.entityDisposition[disposition] += 1;
  classified.push({ entityId: entity.id, canonicalName: entity.canonicalName ?? null, qid: entity.qid ?? null, disposition, decisions });
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: policy.mode,
  productionAutoPromotionEnabled: policy.productionAutoPromotionEnabled,
  source: {
    sourceId: manifest.sourceId ?? null,
    sourceRunId: manifest.sourceRunId ?? null,
    entityCount: manifest.entityCount,
    conflictCount: manifest.conflictCount ?? quality.conflictCount ?? null
  },
  summary,
  entities: classified
};

writeJson(path.join(output, 'publication-decisions.json'), report);
writeJson(path.join(output, 'human-review-queue.json'), {
  schemaVersion: 1,
  generatedAt: report.generatedAt,
  items: classified.flatMap((entity) => entity.decisions.filter((decision) => decision.lane === 'human-review-required').map((decision) => ({ entityId: entity.entityId, canonicalName: entity.canonicalName, qid: entity.qid, ...decision })))
});
writeJson(path.join(output, 'cross-check-queue.json'), {
  schemaVersion: 1,
  generatedAt: report.generatedAt,
  items: classified.flatMap((entity) => entity.decisions.filter((decision) => decision.lane === 'cross-check-required').map((decision) => ({ entityId: entity.entityId, canonicalName: entity.canonicalName, qid: entity.qid, ...decision })))
});
writeJson(path.join(output, 'auto-eligible-shadow.json'), {
  schemaVersion: 1,
  generatedAt: report.generatedAt,
  productionWriteAllowed: false,
  items: classified.flatMap((entity) => entity.decisions.filter((decision) => decision.lane === 'auto-eligible').map((decision) => ({ entityId: entity.entityId, canonicalName: entity.canonicalName, qid: entity.qid, ...decision })))
});

console.log(JSON.stringify(summary, null, 2));

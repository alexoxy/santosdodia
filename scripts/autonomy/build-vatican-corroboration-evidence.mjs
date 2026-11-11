#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function pad(value) { return String(value).padStart(2, '0'); }
function dateKey(month, day) { return `${pad(month)}-${pad(day)}`; }
function normalizeLabel(value) {
  return String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase('pt-PT');
}
function sourceUrl(event) {
  return event?.source?.detailUrl ?? event?.source?.calendarPageUrl ?? null;
}

export function buildVaticanCorroborationEvidence(normalized, bindings) {
  if (normalized?.schemaVersion !== 1 || normalized?.sourceId !== 'vatican-news-saint-of-day-pt') {
    throw new Error('Unexpected Vatican normalized source package.');
  }
  if (normalized?.contract?.productionPublication !== false) {
    throw new Error('Vatican normalized package must remain non-publishable evidence.');
  }
  if (bindings?.schemaVersion !== 1 || bindings?.sourceId !== normalized.sourceId) {
    throw new Error('Vatican binding registry does not match the normalized source.');
  }

  const events = Array.isArray(normalized.events) ? normalized.events : [];
  const coveredDates = new Set(events.map((event) => dateKey(event.month, event.day)));
  const evidence = [];
  const review = [];
  let evaluatedBindings = 0;

  for (const binding of bindings.bindings ?? []) {
    const key = dateKey(binding.month, binding.day);
    if (!coveredDates.has(key)) continue;
    evaluatedBindings += 1;

    if (!/^Q\d+$/u.test(binding.qid ?? '')) {
      review.push({ ...binding, disposition: 'human-review-required', reason: 'binding-missing-exact-qid' });
      continue;
    }
    if (!Array.isArray(binding.acceptedLabels) || binding.acceptedLabels.length < 1) {
      review.push({ ...binding, disposition: 'human-review-required', reason: 'binding-missing-reviewed-labels' });
      continue;
    }

    const accepted = new Set(binding.acceptedLabels.map(normalizeLabel));
    const dayEvents = events.filter((event) => dateKey(event.month, event.day) === key);
    const matches = dayEvents.filter((event) => accepted.has(normalizeLabel(event?.names?.pt?.value)));

    if (matches.length !== 1) {
      review.push({
        bindingId: binding.bindingId,
        canonicalPersonId: binding.canonicalPersonId,
        qid: binding.qid,
        expectedDate: key,
        acceptedLabels: binding.acceptedLabels,
        observedLabels: dayEvents.map((event) => event?.names?.pt?.value).filter(Boolean),
        disposition: 'human-review-required',
        reason: matches.length > 1 ? 'ambiguous-reviewed-source-binding' : 'reviewed-source-binding-drift',
      });
      continue;
    }

    const event = matches[0];
    const url = sourceUrl(event);
    if (!url) {
      review.push({
        bindingId: binding.bindingId,
        canonicalPersonId: binding.canonicalPersonId,
        qid: binding.qid,
        expectedDate: key,
        disposition: 'human-review-required',
        reason: 'bound-source-record-missing-url',
      });
      continue;
    }

    for (const claimClass of binding.allowedClaimClasses ?? []) {
      if (claimClass !== 'localized-source-label') continue;
      evidence.push({
        qid: binding.qid,
        canonicalPersonId: binding.canonicalPersonId,
        bindingId: binding.bindingId,
        claimClass,
        value: event.names.pt.value,
        language: 'pt',
        sourceId: normalized.sourceId,
        sourceUrl: url,
        independenceGroup: 'vaticannews.va',
        authorityScore: 96,
        firstParty: true,
        verified: true,
        evidenceKind: 'reviewed-exact-source-binding',
        sourceRecordHash: event?.source?.sourceRecordHash ?? null,
        observedDate: key,
        bindingReviewedAt: binding.reviewedAt,
      });
    }
  }

  return {
    schemaVersion: 1,
    mode: 'shadow-evidence',
    productionWriteAllowed: false,
    sourceId: normalized.sourceId,
    sourceGeneratedAt: normalized.sourceGeneratedAt ?? null,
    sourceScope: normalized.sourceScope ?? null,
    summary: {
      sourceEvents: events.length,
      coveredDates: coveredDates.size,
      configuredBindings: (bindings.bindings ?? []).length,
      evaluatedBindings,
      evidenceItems: evidence.length,
      reviewItems: review.length,
    },
    evidence,
    review,
  };
}

function main() {
  const input = path.resolve(argument('--input', 'staging/vatican-saints/normalized.json'));
  const bindingsPath = path.resolve(argument('--bindings', 'config/corroboration-source-bindings.vatican-news-pt.json'));
  const output = path.resolve(argument('--output', 'staging/corroboration-evidence/vatican-news/pt'));
  const result = buildVaticanCorroborationEvidence(readJson(input), readJson(bindingsPath));
  const generatedAt = new Date().toISOString();
  writeJson(path.join(output, 'evidence.json'), { schemaVersion: 1, generatedAt, items: result.evidence });
  writeJson(path.join(output, 'binding-review-queue.json'), { schemaVersion: 1, generatedAt, items: result.review });
  writeJson(path.join(output, 'report.json'), { ...result, generatedAt, evidence: undefined, review: undefined });
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

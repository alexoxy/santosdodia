#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildVaticanCorroborationEvidence } from './build-vatican-corroboration-evidence.mjs';

const normalized = {
  schemaVersion: 1,
  sourceId: 'vatican-news-saint-of-day-pt',
  sourceGeneratedAt: '2026-08-15T00:00:00Z',
  sourceScope: 'month:06',
  contract: { productionPublication: false },
  events: [
    {
      month: 6,
      day: 13,
      names: { pt: { value: 'Santo António de Pádua' } },
      source: {
        detailUrl: 'https://www.vaticannews.va/pt/santo-do-dia/06/13/santo-antonio-de-padua.html',
        calendarPageUrl: 'https://www.vaticannews.va/pt/santo-do-dia/06/13.html',
        sourceRecordHash: 'a'.repeat(64),
      },
    },
    {
      month: 6,
      day: 24,
      names: { pt: { value: 'São João, precursor' } },
      source: {
        calendarPageUrl: 'https://www.vaticannews.va/pt/santo-do-dia/06/24.html',
        sourceRecordHash: 'b'.repeat(64),
      },
    },
  ],
};

const bindings = {
  schemaVersion: 1,
  sourceId: 'vatican-news-saint-of-day-pt',
  bindings: [
    {
      bindingId: 'anthony',
      canonicalPersonId: 'anthony-lisbon',
      qid: 'Q167477',
      month: 6,
      day: 13,
      acceptedLabels: ['Santo António de Pádua'],
      allowedClaimClasses: ['localized-source-label'],
      reviewedAt: '2026-08-15',
    },
    {
      bindingId: 'john',
      canonicalPersonId: 'john-baptist',
      qid: 'Q40662',
      month: 6,
      day: 24,
      acceptedLabels: ['São João Batista'],
      allowedClaimClasses: ['localized-source-label'],
      reviewedAt: '2026-08-15',
    },
    {
      bindingId: 'francis',
      canonicalPersonId: 'francis-assisi',
      qid: 'Q676555',
      month: 10,
      day: 4,
      acceptedLabels: ['São Francisco de Assis'],
      allowedClaimClasses: ['localized-source-label'],
      reviewedAt: '2026-08-15',
    },
  ],
};

const result = buildVaticanCorroborationEvidence(normalized, bindings);
assert.equal(result.productionWriteAllowed, false);
assert.equal(result.summary.configuredBindings, 3);
assert.equal(result.summary.evaluatedBindings, 2);
assert.equal(result.summary.evidenceItems, 1);
assert.equal(result.summary.reviewItems, 1);
assert.equal(result.evidence[0].qid, 'Q167477');
assert.equal(result.evidence[0].claimClass, 'localized-source-label');
assert.equal(result.evidence[0].value, 'Santo António de Pádua');
assert.equal(result.evidence[0].firstParty, true);
assert.equal(result.review[0].qid, 'Q40662');
assert.equal(result.review[0].reason, 'reviewed-source-binding-drift');
assert.deepEqual(result.review[0].observedLabels, ['São João, precursor']);

const actual = JSON.parse(fs.readFileSync('config/corroboration-source-bindings.vatican-news-pt.json', 'utf8'));
assert.equal(actual.schemaVersion, 1);
assert.equal(actual.sourceId, 'vatican-news-saint-of-day-pt');
assert.ok(Array.isArray(actual.bindings) && actual.bindings.length >= 10);
const bindingIds = new Set();
const qids = new Set();
for (const binding of actual.bindings) {
  assert.match(binding.bindingId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
  assert.equal(bindingIds.has(binding.bindingId), false, `duplicate bindingId ${binding.bindingId}`);
  bindingIds.add(binding.bindingId);
  assert.match(binding.qid, /^Q\d+$/u);
  assert.equal(qids.has(binding.qid), false, `duplicate qid ${binding.qid}`);
  qids.add(binding.qid);
  assert.ok(Number.isInteger(binding.month) && binding.month >= 1 && binding.month <= 12);
  assert.ok(Number.isInteger(binding.day) && binding.day >= 1 && binding.day <= 31);
  assert.ok(Array.isArray(binding.acceptedLabels) && binding.acceptedLabels.length >= 1);
  assert.ok(binding.acceptedLabels.every((label) => typeof label === 'string' && label.trim().length >= 3));
  assert.deepEqual(binding.allowedClaimClasses, ['localized-source-label']);
  assert.match(binding.reviewedAt, /^\d{4}-\d{2}-\d{2}$/u);
}

console.log('Vatican reviewed-binding corroboration evidence tests passed.');

#!/usr/bin/env node

import assert from 'node:assert/strict';
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

console.log('Vatican reviewed-binding corroboration evidence tests passed.');

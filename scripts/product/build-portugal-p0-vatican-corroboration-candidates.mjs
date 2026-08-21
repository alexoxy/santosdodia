#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function text(value) {
  return String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
}

function normalizePortugueseName(value) {
  return text(value)
    .toLocaleLowerCase('pt-PT')
    .replace(/[’']/gu, '')
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/^(?:são|santo|santa|beato|beata)\s+/u, '')
    .trim();
}

function dateKeyFromIso(value) {
  const match = /^\d{4}-(\d{2})-(\d{2})$/u.exec(text(value));
  return match ? `${match[1]}-${match[2]}` : null;
}

function dateKeyFromEvent(event) {
  if (!Number.isInteger(event?.month) || !Number.isInteger(event?.day)) return null;
  return `${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`;
}

function uniqueNonEmpty(values) {
  return [...new Set(values.map(text).filter(Boolean))];
}

function proposedPortugueseLabels(row) {
  const aliases = Array.isArray(row?.proposedPerson?.aliases?.pt) ? row.proposedPerson.aliases.pt : [];
  return uniqueNonEmpty([
    row?.calendar?.labels?.pt,
    row?.proposedPerson?.names?.pt,
    ...aliases,
  ]);
}

function liveSourceRecord(event) {
  return {
    eventId: event.id ?? null,
    labelPt: text(event?.names?.pt?.value) || null,
    calendarPageUrl: event?.source?.calendarPageUrl ?? null,
    detailUrl: event?.source?.detailUrl ?? null,
    sourceRecordHash: event?.source?.sourceRecordHash ?? null,
    retrievedAt: event?.source?.retrievedAt ?? null,
  };
}

function existingBindingState(row, binding, dayEvents) {
  const expectedDate = `${String(binding.month).padStart(2, '0')}-${String(binding.day).padStart(2, '0')}`;
  const rowDate = dateKeyFromIso(row.dateISO);
  if (expectedDate !== rowDate) {
    return {
      disposition: 'reviewed-binding-date-mismatch',
      reason: 'existing-reviewed-binding-is-for-a-different-calendar-date',
      existingBinding: binding,
      sourceRecords: dayEvents.map(liveSourceRecord),
    };
  }
  const accepted = new Set((binding.acceptedLabels ?? []).map(normalizePortugueseName).filter(Boolean));
  const matches = dayEvents.filter((event) => accepted.has(normalizePortugueseName(event?.names?.pt?.value)));
  if (matches.length === 1) {
    return {
      disposition: 'reviewed-binding-live-match',
      reason: 'existing-reviewed-binding-matches-one-live-vatican-record',
      existingBinding: binding,
      sourceRecords: matches.map(liveSourceRecord),
    };
  }
  return {
    disposition: matches.length > 1 ? 'reviewed-binding-live-ambiguous' : 'reviewed-binding-live-drift',
    reason: matches.length > 1 ? 'existing-reviewed-binding-matches-multiple-live-vatican-records' : 'existing-reviewed-binding-does-not-match-current-live-vatican-record',
    existingBinding: binding,
    sourceRecords: dayEvents.map(liveSourceRecord),
  };
}

export function buildPortugalP0VaticanCorroborationCandidates({ p0Pack, vatican = null, bindings } = {}) {
  if (p0Pack?.schemaVersion !== 1 || p0Pack?.release !== 'roman-catholic-pt-2026-v2' || p0Pack?.publicationAllowed !== false || p0Pack?.productionMutation !== false || !Array.isArray(p0Pack?.items)) {
    throw new Error('Vatican corroboration candidates require the fail-closed Portugal P0 review pack.');
  }
  if (p0Pack?.summary?.safety?.adsenseReviewState !== 'PREPARING' || p0Pack?.summary?.safety?.automaticLinkAllowed !== false || p0Pack?.summary?.safety?.automaticPublicationAllowed !== false) {
    throw new Error('P0 review pack is outside the AdSense PREPARING safety boundary.');
  }
  if (bindings?.schemaVersion !== 1 || bindings?.sourceId !== 'vatican-news-saint-of-day-pt' || !Array.isArray(bindings?.bindings)) {
    throw new Error('Reviewed Vatican binding registry is missing or invalid.');
  }

  const sourceAvailable = Boolean(vatican);
  if (sourceAvailable) {
    if (vatican?.schemaVersion !== 1 || vatican?.sourceId !== 'vatican-news-saint-of-day-pt' || vatican?.contract?.productionPublication !== false || vatican?.contract?.nameOnlyIdentityMergeForbidden !== true || !Array.isArray(vatican?.events)) {
      throw new Error('Vatican source package is missing its non-publishing identity contract.');
    }
  }

  const events = sourceAvailable ? vatican.events : [];
  const eventsByDate = new Map();
  for (const event of events) {
    const key = dateKeyFromEvent(event);
    if (!key) throw new Error(`Invalid Vatican source event date for ${event?.id ?? '<missing>'}.`);
    const list = eventsByDate.get(key) ?? [];
    list.push(event);
    eventsByDate.set(key, list);
  }
  const bindingByQid = new Map(bindings.bindings.map((binding) => [binding.qid, binding]));
  const rows = [];

  for (const row of p0Pack.items) {
    if (row.reviewRequired !== true || row.automaticLinkAllowed !== false || row.publicationAllowed !== false || row.advertisingEligible !== false) {
      throw new Error(`Unsafe P0 input row ${row.reviewId ?? row.sourceOccurrenceId}.`);
    }
    const qid = text(row?.proposedPerson?.qid);
    if (!/^Q[1-9]\d*$/u.test(qid)) throw new Error(`P0 row ${row.reviewId} has invalid QID.`);
    const key = dateKeyFromIso(row.dateISO);
    if (!key) throw new Error(`P0 row ${row.reviewId} has invalid dateISO.`);
    const dayEvents = eventsByDate.get(key) ?? [];
    const existingBinding = bindingByQid.get(qid) ?? null;

    let result;
    if (!sourceAvailable) {
      result = { disposition: 'source-unavailable', reason: 'vatican-source-not-available-in-this-run', sourceRecords: [] };
    } else if (existingBinding) {
      result = existingBindingState(row, existingBinding, dayEvents);
    } else {
      const proposalLabels = proposedPortugueseLabels(row);
      const normalizedProposals = new Set(proposalLabels.map(normalizePortugueseName).filter(Boolean));
      const matches = dayEvents.filter((event) => normalizedProposals.has(normalizePortugueseName(event?.names?.pt?.value)));
      if (matches.length === 1) {
        result = {
          disposition: 'candidate-for-reviewed-binding',
          reason: 'same-date-unique-conservative-portuguese-label-match',
          sourceRecords: matches.map(liveSourceRecord),
        };
      } else if (matches.length > 1) {
        result = {
          disposition: 'ambiguous-vatican-record',
          reason: 'same-date-portuguese-label-match-is-not-unique',
          sourceRecords: matches.map(liveSourceRecord),
        };
      } else {
        result = {
          disposition: 'needs-independent-source-research',
          reason: dayEvents.length ? 'same-date-vatican-records-do-not-match-conservative-portuguese-labels' : 'no-vatican-record-on-calendar-date',
          sourceRecords: dayEvents.map(liveSourceRecord),
        };
      }
    }

    rows.push({
      candidateId: `pt-2026-vatican:${row.sourceOccurrenceId}:${qid}`,
      reviewId: row.reviewId,
      sourceOccurrenceId: row.sourceOccurrenceId,
      dateISO: row.dateISO,
      canonicalEventId: row.canonicalEventId,
      qid,
      entityId: row.proposedPerson.entityId,
      calendarLabelPt: text(row?.calendar?.labels?.pt) || null,
      personNamePt: text(row?.proposedPerson?.names?.pt) || null,
      proposalLabelsPt: proposedPortugueseLabels(row),
      ...result,
      evidenceSourceId: 'vatican-news-saint-of-day-pt',
      evidenceRole: 'independent-corroboration-proposal-only',
      reviewerDecision: null,
      reviewedBindingMutationAllowed: false,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowed: false,
      advertisingEligible: false,
    });
  }

  const dispositions = {};
  for (const row of rows) dispositions[row.disposition] = (dispositions[row.disposition] ?? 0) + 1;
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    p0Items: rows.length,
    source: {
      sourceId: 'vatican-news-saint-of-day-pt',
      available: sourceAvailable,
      scope: vatican?.sourceScope ?? null,
      eventCount: events.length,
      coveredDays: vatican?.coverage?.coveredDays ?? null,
      coverageComplete: vatican?.coverage?.complete ?? false,
      configuredReviewedBindings: bindings.bindings.length,
    },
    dispositions,
    editorialCandidates: rows.filter((row) => row.disposition === 'candidate-for-reviewed-binding').length,
    existingReviewedBindingLiveMatches: rows.filter((row) => row.disposition === 'reviewed-binding-live-match').length,
    unresolvedForIndependentResearch: rows.filter((row) => ['needs-independent-source-research', 'ambiguous-vatican-record', 'source-unavailable', 'reviewed-binding-live-drift', 'reviewed-binding-live-ambiguous', 'reviewed-binding-date-mismatch'].includes(row.disposition)).length,
    safety: {
      reviewOnly: true,
      candidateDoesNotEqualApproval: true,
      reviewedBindingRegistryMutationAllowed: false,
      nameOnlyIdentityMergeForbidden: true,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      adsenseReviewState: 'PREPARING',
      adServingMutation: false,
      autoAdsMutation: false,
      seoIndexationMutation: false,
      publicPageCreationMutation: false,
    },
  };

  if (rows.length !== p0Pack.items.length) throw new Error('P0 Vatican corroboration accounting mismatch.');
  if (rows.some((row) => row.reviewedBindingMutationAllowed !== false || row.automaticLinkAllowed !== false || row.publicationAllowed !== false || row.advertisingEligible !== false)) {
    throw new Error('P0 Vatican corroboration crossed its fail-closed boundary.');
  }

  return {
    schemaVersion: 1,
    generatedAt: summary.generatedAt,
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    publicationAllowed: false,
    productionMutation: false,
    summary,
    items: rows,
  };
}

function main() {
  const p0Path = argument('--p0');
  const vaticanPath = argument('--vatican');
  const bindingsPath = argument('--bindings');
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!p0Path || !bindingsPath || !outputPath || !summaryPath) throw new Error('Usage: --p0 <review-pack.json> [--vatican <normalized.json>] --bindings <bindings.json> --output <candidates.json> --summary <summary.json>');
  const result = buildPortugalP0VaticanCorroborationCandidates({
    p0Pack: JSON.parse(fs.readFileSync(path.resolve(p0Path), 'utf8')),
    vatican: vaticanPath && fs.existsSync(path.resolve(vaticanPath)) ? JSON.parse(fs.readFileSync(path.resolve(vaticanPath), 'utf8')) : null,
    bindings: JSON.parse(fs.readFileSync(path.resolve(bindingsPath), 'utf8')),
  });
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.mkdirSync(path.dirname(path.resolve(summaryPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve(summaryPath), `${JSON.stringify(result.summary, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(result.summary, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function text(value) {
  if (value && typeof value === 'object' && typeof value.value === 'string') return value.value.normalize('NFC').replace(/\s+/gu, ' ').trim();
  return String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
}

function normalizePortugueseName(value) {
  return text(value)
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-PT')
    .replace(/[’']/gu, '')
    .replace(/^\s*s\s*\.\s*/u, '')
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/^(?:sao|santo|santa|beato|beata)\s+/u, '')
    .trim();
}

function portugueseNameVariants(value) {
  const raw = text(value);
  if (!raw) return [];
  const variants = [
    { kind: 'full', value: normalizePortugueseName(raw) },
    { kind: 'name-head', value: normalizePortugueseName(raw.split(',')[0]) },
  ].filter((entry) => entry.value);
  const seen = new Set();
  return variants.filter((entry) => {
    if (seen.has(entry.value)) return false;
    seen.add(entry.value);
    return true;
  });
}

function conservativeMatchEvidence(proposalLabel, sourceLabel) {
  for (const proposal of portugueseNameVariants(proposalLabel)) {
    for (const source of portugueseNameVariants(sourceLabel)) {
      if (proposal.value === source.value) {
        return {
          mode: 'normalized-exact',
          proposalVariant: proposal.kind,
          sourceVariant: source.kind,
          normalizedProposal: proposal.value,
          normalizedSource: source.value,
        };
      }
      const proposalTokens = proposal.value.split(/\s+/u).filter(Boolean);
      const sourceTokens = source.value.split(/\s+/u).filter(Boolean);
      const shorter = proposal.value.length <= source.value.length ? proposal : source;
      const longer = shorter === proposal ? source : proposal;
      const shorterTokens = shorter === proposal ? proposalTokens : sourceTokens;
      if (shorter.value.length >= 8 && shorterTokens.length >= 2 && (longer.value.startsWith(`${shorter.value} `) || longer.value.startsWith(`${shorter.value}-`))) {
        return {
          mode: 'normalized-name-prefix',
          proposalVariant: proposal.kind,
          sourceVariant: source.kind,
          normalizedProposal: proposal.value,
          normalizedSource: source.value,
        };
      }
    }
  }
  return null;
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

function matchSourceEvents(dayEvents, proposalLabels) {
  const matches = [];
  for (const event of dayEvents) {
    const sourceLabel = event?.names?.pt?.value;
    let evidence = null;
    let matchedProposalLabel = null;
    for (const proposalLabel of proposalLabels) {
      evidence = conservativeMatchEvidence(proposalLabel, sourceLabel);
      if (evidence) {
        matchedProposalLabel = text(proposalLabel);
        break;
      }
    }
    if (evidence) {
      matches.push({
        event,
        evidence: {
          ...evidence,
          proposalLabelPt: matchedProposalLabel,
          sourceLabelPt: text(sourceLabel),
        },
      });
    }
  }
  return matches;
}

function existingBindingState(binding, dayEvents) {
  const acceptedLabels = uniqueNonEmpty(binding.acceptedLabels ?? []);
  const matches = matchSourceEvents(dayEvents, acceptedLabels);
  if (matches.length === 1) {
    return {
      disposition: 'reviewed-binding-live-match',
      reason: 'existing-reviewed-binding-matches-one-live-vatican-record',
      existingBinding: binding,
      sourceRecords: matches.map(({ event }) => liveSourceRecord(event)),
      matchEvidence: matches.map(({ evidence }) => evidence),
    };
  }
  return {
    disposition: matches.length > 1 ? 'reviewed-binding-live-ambiguous' : 'reviewed-binding-live-drift',
    reason: matches.length > 1 ? 'existing-reviewed-binding-matches-multiple-live-vatican-records' : 'existing-reviewed-binding-does-not-match-current-live-vatican-record',
    existingBinding: binding,
    sourceRecords: (matches.length ? matches.map(({ event }) => event) : dayEvents).map(liveSourceRecord),
    matchEvidence: matches.map(({ evidence }) => evidence),
  };
}

function indexBindingsByQid(bindings) {
  const result = new Map();
  for (const binding of bindings) {
    const list = result.get(binding.qid) ?? [];
    list.push(binding);
    result.set(binding.qid, list);
  }
  return result;
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
  const bindingsByQid = indexBindingsByQid(bindings.bindings);
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
    const qidBindings = bindingsByQid.get(qid) ?? [];
    const sameDateBindings = qidBindings.filter((binding) => `${String(binding.month).padStart(2, '0')}-${String(binding.day).padStart(2, '0')}` === key);
    const relatedReviewedBindings = qidBindings.filter((binding) => !sameDateBindings.includes(binding));

    let result;
    if (!sourceAvailable) {
      result = { disposition: 'source-unavailable', reason: 'vatican-source-not-available-in-this-run', sourceRecords: [], matchEvidence: [] };
    } else if (sameDateBindings.length > 1) {
      result = {
        disposition: 'reviewed-binding-registry-ambiguous',
        reason: 'multiple-reviewed-bindings-exist-for-the-same-qid-and-date',
        existingBindings: sameDateBindings,
        sourceRecords: dayEvents.map(liveSourceRecord),
        matchEvidence: [],
      };
    } else if (sameDateBindings.length === 1) {
      result = existingBindingState(sameDateBindings[0], dayEvents);
    } else {
      const proposalLabels = proposedPortugueseLabels(row);
      const matches = matchSourceEvents(dayEvents, proposalLabels);
      if (matches.length === 1) {
        result = {
          disposition: relatedReviewedBindings.length ? 'candidate-for-reviewed-binding-additional-observance' : 'candidate-for-reviewed-binding',
          reason: relatedReviewedBindings.length ? 'same-qid-has-reviewed-binding-on-another-date-and-current-observance-has-one-conservative-vatican-match' : 'same-date-unique-conservative-portuguese-label-match',
          relatedReviewedBindings,
          sourceRecords: matches.map(({ event }) => liveSourceRecord(event)),
          matchEvidence: matches.map(({ evidence }) => evidence),
        };
      } else if (matches.length > 1) {
        result = {
          disposition: 'ambiguous-vatican-record',
          reason: 'same-date-portuguese-label-match-is-not-unique',
          relatedReviewedBindings,
          sourceRecords: matches.map(({ event }) => liveSourceRecord(event)),
          matchEvidence: matches.map(({ evidence }) => evidence),
        };
      } else {
        result = {
          disposition: 'needs-independent-source-research',
          reason: dayEvents.length ? 'same-date-vatican-records-do-not-match-conservative-portuguese-labels' : 'no-vatican-record-on-calendar-date',
          relatedReviewedBindings,
          sourceRecords: dayEvents.map(liveSourceRecord),
          matchEvidence: [],
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
  const editorialCandidateDispositions = new Set(['candidate-for-reviewed-binding', 'candidate-for-reviewed-binding-additional-observance']);
  const unresolvedDispositions = new Set(['needs-independent-source-research', 'ambiguous-vatican-record', 'source-unavailable', 'reviewed-binding-live-drift', 'reviewed-binding-live-ambiguous', 'reviewed-binding-registry-ambiguous']);
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
    editorialCandidates: rows.filter((row) => editorialCandidateDispositions.has(row.disposition)).length,
    additionalObservanceCandidates: rows.filter((row) => row.disposition === 'candidate-for-reviewed-binding-additional-observance').length,
    existingReviewedBindingLiveMatches: rows.filter((row) => row.disposition === 'reviewed-binding-live-match').length,
    unresolvedForIndependentResearch: rows.filter((row) => unresolvedDispositions.has(row.disposition)).length,
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

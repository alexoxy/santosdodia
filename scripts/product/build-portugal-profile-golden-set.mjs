#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SPECIAL_DECISION_CLASSES = new Set([
  'review-primary-source-supported-link',
  'review-additional-observance-link',
  'verify-existing-reviewed-binding',
]);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function loadDefaultSelection() {
  return JSON.parse(fs.readFileSync(path.resolve('config/portugal-profile-golden-set.v1.json'), 'utf8'));
}

function profileKey(qid, dateISO) {
  return `${qid}|${dateISO}`;
}

function validateSelection(selection, release) {
  if (selection?.schemaVersion !== 1 || selection?.release !== release || selection?.publicationAllowed !== false || selection?.productionMutation !== false || !Array.isArray(selection?.profiles)) {
    throw new Error('Profile golden set selection is missing its fail-closed contract.');
  }
  const minimum = selection?.selectionPolicy?.minimumProfiles;
  const maximum = selection?.selectionPolicy?.maximumProfiles;
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 30 || maximum > 50 || minimum > maximum) {
    throw new Error('Profile golden set selection must remain bounded between 30 and 50 profiles.');
  }
  if (!Number.isInteger(selection.targetSize) || selection.targetSize < minimum || selection.targetSize > maximum || selection.profiles.length !== selection.targetSize) {
    throw new Error(`Profile golden set target mismatch: target=${selection.targetSize}, profiles=${selection.profiles.length}.`);
  }
  if (!Array.isArray(selection?.selectionPolicy?.coverageGoals) || selection.selectionPolicy.coverageGoals.length === 0 || selection?.selectionPolicy?.stableIdentityKey !== 'wikidata-qid' || selection?.selectionPolicy?.exactCalendarDateRequired !== true || selection?.selectionPolicy?.editorialDecisionReadyRequired !== true || selection?.selectionPolicy?.allPrimarySourceEdgeCasesIncluded !== true) {
    throw new Error('Profile golden set selection weakened its stable-identity or editorial-readiness policy.');
  }
  if (selection?.safety?.proposalOnly !== true || selection?.safety?.selectionDoesNotEqualEditorialApproval !== true || selection?.safety?.reviewedBindingRegistryMutationAllowed !== false || selection?.safety?.publicNavigationRegistryMutationAllowed !== false || selection?.safety?.automaticBiographyGenerationAllowed !== false || selection?.safety?.automaticPublicationAllowed !== false || selection?.safety?.adsenseReviewState !== 'PREPARING' || selection?.safety?.adServingMutation !== false || selection?.safety?.seoIndexationMutation !== false) {
    throw new Error('Profile golden set selection crossed its proposal-only AdSense PREPARING boundary.');
  }

  const goals = new Set(selection.selectionPolicy.coverageGoals ?? []);
  const seenKeys = new Set();
  const seenQids = new Set();
  const observedTags = new Set();
  for (const profile of selection.profiles) {
    if (!/^Q[1-9]\d*$/u.test(profile?.qid ?? '') || !/^2026-\d{2}-\d{2}$/u.test(profile?.dateISO ?? '') || !Array.isArray(profile?.coverageTags) || profile.coverageTags.length === 0 || !String(profile?.selectionRationale ?? '').trim()) {
      throw new Error(`Invalid profile golden set selection row for ${profile?.qid ?? '<missing>'}.`);
    }
    const key = profileKey(profile.qid, profile.dateISO);
    if (seenKeys.has(key) || seenQids.has(profile.qid)) throw new Error(`Duplicate profile golden set identity ${key}.`);
    seenKeys.add(key);
    seenQids.add(profile.qid);
    for (const tag of profile.coverageTags) {
      if (!goals.has(tag)) throw new Error(`Unknown profile golden set coverage tag ${tag}.`);
      observedTags.add(tag);
    }
  }
  for (const goal of goals) {
    if (!observedTags.has(goal)) throw new Error(`Profile golden set does not cover configured goal ${goal}.`);
  }
}

function uniqueIndex(items, keyFor, label) {
  const index = new Map();
  for (const item of items) {
    const key = keyFor(item);
    if (!key || index.has(key)) throw new Error(`${label} contains an invalid or duplicate key ${key ?? '<missing>'}.`);
    index.set(key, item);
  }
  return index;
}

export function buildPortugalProfileGoldenSet({ p0Pack, editorialDecisionQueue, selection } = {}) {
  if (p0Pack?.schemaVersion !== 1 || p0Pack?.release !== 'roman-catholic-pt-2026-v2' || p0Pack?.publicationAllowed !== false || p0Pack?.productionMutation !== false || !Array.isArray(p0Pack?.items)) {
    throw new Error('Profile golden set requires the fail-closed Portugal P0 review pack.');
  }
  if (editorialDecisionQueue?.schemaVersion !== 1 || editorialDecisionQueue?.release !== p0Pack.release || editorialDecisionQueue?.publicationAllowed !== false || editorialDecisionQueue?.productionMutation !== false || !Array.isArray(editorialDecisionQueue?.items)) {
    throw new Error('Profile golden set requires the fail-closed editorial decision queue.');
  }
  if (p0Pack?.summary?.safety?.adsenseReviewState !== 'PREPARING' || editorialDecisionQueue?.summary?.safety?.adsenseReviewState !== 'PREPARING' || editorialDecisionQueue?.summary?.safety?.explicitEditorialDecisionRequired !== true) {
    throw new Error('Profile golden set refuses inputs outside the explicit-review AdSense PREPARING boundary.');
  }

  const resolvedSelection = selection ?? loadDefaultSelection();
  validateSelection(resolvedSelection, p0Pack.release);
  const p0ByProfile = uniqueIndex(p0Pack.items, (item) => profileKey(item?.proposedPerson?.qid, item?.dateISO), 'P0 review pack');
  const decisionsByReviewId = uniqueIndex(editorialDecisionQueue.items, (item) => item?.reviewId, 'Editorial decision queue');

  const items = resolvedSelection.profiles.map((configured, index) => {
    const p0 = p0ByProfile.get(profileKey(configured.qid, configured.dateISO));
    if (!p0) throw new Error(`Configured golden profile ${configured.qid} on ${configured.dateISO} is missing from the P0 pack.`);
    const decision = decisionsByReviewId.get(p0.reviewId);
    if (!decision || decision.qid !== configured.qid || decision.dateISO !== configured.dateISO) {
      throw new Error(`Configured golden profile ${configured.qid} is missing its exact editorial decision row.`);
    }
    if (decision.reviewStatus !== 'ready-for-explicit-editorial-decision' || decision.editorialDecision !== null) {
      throw new Error(`Configured golden profile ${configured.qid} is not ready for an explicit pending editorial decision.`);
    }
    return {
      goldenProfileId: `pt-2026-profile:${configured.qid}`,
      position: index + 1,
      reviewId: p0.reviewId,
      decisionId: decision.decisionId,
      sourceOccurrenceId: p0.sourceOccurrenceId,
      canonicalEventId: p0.canonicalEventId,
      dateISO: p0.dateISO,
      qid: configured.qid,
      entityId: p0.proposedPerson.entityId,
      calendarLabelPt: decision.calendarLabelPt,
      preferredProfileNamePt: p0.proposedPerson.names?.pt ?? decision.personNamePt,
      selectionRationale: configured.selectionRationale,
      coverageTags: [...configured.coverageTags],
      decisionClass: decision.decisionClass,
      reviewStatus: 'pending-golden-profile-editorial-review',
      evidence: decision.evidence,
      editorialChecklist: {
        identityAndObservanceLink: 'pending-explicit-review',
        substantiveBiography: 'pending-source-backed-draft',
        claimSpecificSources: 'pending-independent-cross-check',
        portugueseLanguageReview: 'pending-human-review',
        publicNavigationDecision: 'separate-explicit-decision-required',
      },
      profileEditorialDecision: null,
      reviewer: null,
      reviewedAt: null,
      decisionNote: null,
      automaticBiographyGenerationAllowed: false,
      automaticLinkAllowed: false,
      automaticPublicationAllowed: false,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowed: false,
      advertisingEligible: false,
    };
  });

  if (resolvedSelection.selectionPolicy.allPrimarySourceEdgeCasesIncluded === true) {
    const selectedReviewIds = new Set(items.map((item) => item.reviewId));
    for (const decision of editorialDecisionQueue.items.filter((item) => SPECIAL_DECISION_CLASSES.has(item.decisionClass))) {
      if (!selectedReviewIds.has(decision.reviewId)) throw new Error(`Golden set omitted required source edge case ${decision.reviewId}.`);
    }
  }

  const coverageTagCounts = {};
  const decisionClassCounts = {};
  for (const item of items) {
    for (const tag of item.coverageTags) coverageTagCounts[tag] = (coverageTagCounts[tag] ?? 0) + 1;
    decisionClassCounts[item.decisionClass] = (decisionClassCounts[item.decisionClass] ?? 0) + 1;
  }
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    goldenSetId: resolvedSelection.goldenSetId,
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    selectedProfiles: items.length,
    coveredMonths: [...new Set(items.map((item) => item.dateISO.slice(0, 7)))].sort(),
    coverageTagCounts,
    decisionClassCounts,
    sourceEdgeCasesIncluded: items.filter((item) => SPECIAL_DECISION_CLASSES.has(item.decisionClass)).length,
    editorialState: {
      pendingReview: items.length,
      approved: 0,
      published: 0,
    },
    safety: {
      goldenSetOnly: true,
      selectionDoesNotEqualEditorialApproval: true,
      explicitEditorialDecisionRequired: true,
      substantiveSourceBackedBiographyRequired: true,
      reviewedBindingRegistryMutationAllowed: false,
      publicNavigationRegistryMutationAllowed: false,
      automaticBiographyGenerationAllowed: false,
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

  if (items.length !== resolvedSelection.targetSize || items.some((item) => item.profileEditorialDecision !== null || item.publicationAllowed !== false || item.automaticBiographyGenerationAllowed !== false || item.advertisingEligible !== false)) {
    throw new Error('Profile golden set crossed its bounded fail-closed boundary.');
  }

  return {
    schemaVersion: 1,
    generatedAt: summary.generatedAt,
    goldenSetId: resolvedSelection.goldenSetId,
    release: p0Pack.release,
    datasetVersion: p0Pack.datasetVersion ?? null,
    publicationAllowed: false,
    productionMutation: false,
    summary,
    items,
  };
}

function main() {
  const p0Path = argument('--p0');
  const selectionPath = argument('--selection');
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!p0Path || !outputPath || !summaryPath) throw new Error('Usage: --p0 <p0-pack.json> [--selection <selection.json>] --output <golden-set.json> --summary <summary.json>');
  const p0Pack = JSON.parse(fs.readFileSync(path.resolve(p0Path), 'utf8'));
  const result = buildPortugalProfileGoldenSet({
    p0Pack,
    editorialDecisionQueue: p0Pack.editorialDecisionQueue,
    selection: selectionPath ? JSON.parse(fs.readFileSync(path.resolve(selectionPath), 'utf8')) : undefined,
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

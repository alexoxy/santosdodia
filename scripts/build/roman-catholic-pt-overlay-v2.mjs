#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyGeneralRomanAuthorityCorrections, GENERAL_ROMAN_AUTHORITY_CORRECTIONS } from '../calendar/general-roman-authority-corrections.mjs';

const PUBLIC_LOCALES = ['en', 'pt', 'es', 'fr', 'it'];
const MIRROR_LOCALES = { en: 'en_US', fr: 'fr_FR', it: 'it_IT' };
const RANK_WEIGHT = new Map([
  ['solemnity', 5], ['feast', 4], ['memorial', 3], ['optional-memorial', 2], ['weekday', 1],
]);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function readJson(file) { return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(path.resolve(file), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function text(value) { return String(value ?? '').normalize('NFC').trim(); }
function sha256(value) { return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex'); }
function ascii(value) {
  return text(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase().replace(/[^a-z0-9]+/gu, ' ').trim();
}
function identifierWords(value) {
  return text(value)
    .replace(/^rc:/u, '')
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1 $2')
    .replace(/[_:-]+/gu, ' ');
}
const NAME_STOP = new Set(['saint','saints','st','sts','the','of','and','a','an','blessed','blesseds']);
function tokens(value) {
  return ascii(value).split(/\s+/u).filter(Boolean).filter((token) => !NAME_STOP.has(token));
}
function dice(left, right) {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}
function rankClass(value) {
  const source = ascii(value);
  if (/solemn/u.test(source)) return 'solemnity';
  if (/feast/u.test(source)) return 'feast';
  if (/optional|facult/u.test(source)) return 'optional-memorial';
  if (/memorial|memory/u.test(source)) return 'memorial';
  if (/weekday|feria|ferial/u.test(source)) return 'weekday';
  return null;
}
function category(value) {
  return ['saint','feast','marian','apostle','martyr','fast'].includes(value) ? value : 'feast';
}
function normalizeMirrorPayload(payload, locale, year) {
  const events = (Array.isArray(payload?.events) ? payload.events : [])
    .filter((item) => text(item.dateISO).startsWith(`${year}-`))
    .filter((item) => !/_vigil$/iu.test(text(item.id)))
    .map((item) => ({ ...item, id: text(item.id), dateISO: text(item.dateISO).slice(0, 10), name: text(item.name), grade: item.grade == null ? null : text(item.grade), locale }));
  return applyGeneralRomanAuthorityCorrections(events, { year, locale });
}
function correctionName(generalId, locale, year) {
  const correction = GENERAL_ROMAN_AUTHORITY_CORRECTIONS.find((item) => item.id === generalId && year >= item.effectiveFromYear);
  return text(correction?.names?.[locale]) || null;
}
function properLabels(review) {
  const result = new Map();
  for (const decision of review.decisions ?? []) {
    if (decision.labels) result.set(text(decision.canonicalEventId), decision.labels);
    if (decision.replacementAtOrigin?.labels) result.set(text(decision.replacementAtOrigin.canonicalEventId), decision.replacementAtOrigin.labels);
  }
  return result;
}
function normalizeRomcal(payload, key, year) {
  return (Array.isArray(payload?.[key]) ? payload[key] : [])
    .map((item) => ({
      id: text(item.id),
      dateISO: text(item.dateISO ?? item.date).slice(0, 10),
      name: text(item.name),
      rank: item.rank == null ? null : text(item.rank),
    }))
    .filter((item) => item.id && item.name && item.dateISO.startsWith(`${year}-`));
}
function bestSpanishMatch({ generalId, englishName, originalDateISO, generalRank, romcalEnglish, romcalSpanishByKey }) {
  const candidates = romcalEnglish.filter((item) => item.dateISO === originalDateISO);
  if (!candidates.length) return { match: null, reason: 'no-romcal-english-candidates' };
  const scored = candidates.map((candidate) => {
    const nameScore = dice(englishName, candidate.name);
    const idScore = dice(identifierWords(generalId), identifierWords(candidate.id));
    const expectedRank = rankClass(generalRank);
    const candidateRank = rankClass(candidate.rank);
    const rankScore = expectedRank && candidateRank ? (expectedRank === candidateRank ? 1 : 0) : 0.5;
    const score = Number((Math.max(nameScore, idScore * 0.94) * 0.9 + rankScore * 0.1).toFixed(4));
    return { candidate, nameScore, idScore, rankScore, score };
  }).sort((a, b) => b.score - a.score || b.nameScore - a.nameScore || b.idScore - a.idScore || a.candidate.id.localeCompare(b.candidate.id));
  const first = scored[0];
  const second = scored[1];
  const margin = first.score - (second?.score ?? 0);
  const strong = first.nameScore >= 0.82 || first.idScore >= 0.78 || (first.score >= 0.72 && margin >= 0.1);
  const soleModerate = candidates.length === 1 && first.score >= 0.56 && (first.nameScore >= 0.5 || first.idScore >= 0.5);
  if (!strong && !soleModerate) return { match: null, reason: 'ambiguous-romcal-identity', scored: scored.slice(0, 4) };
  const key = `${first.candidate.dateISO}|${first.candidate.id}`;
  const spanish = romcalSpanishByKey.get(key);
  if (!spanish?.name) return { match: null, reason: 'missing-paired-spanish-label', scored: scored.slice(0, 4) };
  return { match: { ...spanish, englishId: first.candidate.id, score: first.score, nameScore: first.nameScore, idScore: first.idScore }, reason: 'matched' };
}

export function buildPortugalOverlayV2({ effective, review, mirrorPayloads, romcalPayload, year = 2026, sourceCommit = null }) {
  if (effective?.mode !== 'effective-portugal-calendar-preview' || effective?.reviewPlanStatus !== 'approved-liturgical-decisions' || effective?.publicationAllowed !== true || effective?.productionWriteAllowed !== false) {
    throw new Error('Effective Portugal preview is not approved and release-build eligible.');
  }
  if (review?.status !== 'approved-liturgical-decisions' || review?.approved !== true || review?.productionWriteAllowed !== false || (review.decisions ?? []).length !== 15 || review.decisions.some((item) => item.decision !== 'approved')) {
    throw new Error('Portugal reviewed overlay is not the exact approved 15-decision set.');
  }
  if (effective?.summary?.sourceOccurrences !== 389 || effective?.summary?.uniqueDays !== 365 || effective?.summary?.preparedDecisionsUsed !== 15) {
    throw new Error('Effective Portugal preview is not the verified 389-occurrence / 365-day release candidate.');
  }
  const sourceItems = Array.isArray(effective.items) ? effective.items : [];
  if (sourceItems.length !== 389 || sourceItems.some((item) => item.publicationAllowed !== false || !text(item.sourceOccurrenceId) || !text(item.canonicalEventId))) {
    throw new Error('Effective Portugal preview rows crossed their pre-release safety boundary.');
  }
  const uniquePairs = new Set(sourceItems.map((item) => `${item.dateISO}|${item.canonicalEventId}`));
  if (uniquePairs.size !== sourceItems.length) throw new Error('Effective Portugal preview contains duplicate date/canonical-event pairs.');

  const mirrors = {};
  for (const [locale, upstream] of Object.entries(MIRROR_LOCALES)) {
    const payload = mirrorPayloads?.[locale];
    if (!payload) throw new Error(`Missing ${locale} General Roman mirror payload.`);
    mirrors[locale] = normalizeMirrorPayload(payload, upstream, year);
  }
  const mirrorById = Object.fromEntries(Object.entries(mirrors).map(([locale, values]) => [locale, new Map(values.map((item) => [item.id, item]))]));
  const curated = properLabels(review);
  const romcalEnglish = normalizeRomcal(romcalPayload, 'english', year);
  const romcalSpanish = normalizeRomcal(romcalPayload, 'spanish', year);
  if (!romcalEnglish.length || !romcalSpanish.length) throw new Error('Pinned Romcal bilingual localization stream is missing.');
  const romcalSpanishByKey = new Map(romcalSpanish.map((item) => [`${item.dateISO}|${item.id}`, item]));

  const unresolved = [];
  const occurrences = [];
  for (const item of sourceItems) {
    const canonicalEventId = text(item.canonicalEventId);
    const generalId = canonicalEventId.startsWith('rc:') ? canonicalEventId.slice(3) : null;
    const curatedLabels = curated.get(canonicalEventId) ?? null;
    const labels = {};

    const ptLabel = text(item.labels?.pt);
    if (!ptLabel) unresolved.push({ sourceOccurrenceId: item.sourceOccurrenceId, canonicalEventId, locale: 'pt', reason: 'missing-snl-label' });
    else labels.pt = { label: ptLabel, source: 'portugal-national-liturgy-secretariat', translationStatus: 'source', sourceLocale: 'pt' };

    if (curatedLabels) {
      for (const locale of ['en','es','fr','it']) {
        const label = text(curatedLabels[locale]);
        if (!label) unresolved.push({ sourceOccurrenceId: item.sourceOccurrenceId, canonicalEventId, locale, reason: 'missing-reviewed-proper-label' });
        else labels[locale] = { label, source: 'santosdia-reviewed-calendar-localization', translationStatus: 'reviewed', sourceLocale: 'pt' };
      }
    } else if (generalId) {
      for (const locale of ['en','fr','it']) {
        const localized = mirrorById[locale].get(generalId);
        const label = text(localized?.name);
        if (!label) unresolved.push({ sourceOccurrenceId: item.sourceOccurrenceId, canonicalEventId, locale, reason: 'missing-general-roman-id-label', generalId });
        else labels[locale] = { label, source: 'litcal-api', translationStatus: 'source', sourceLocale: locale, sourceEventId: generalId };
      }

      const correctionEs = correctionName(generalId, 'es_ES', year);
      if (correctionEs) {
        labels.es = { label: correctionEs, source: 'santosdia-reviewed-calendar-localization', translationStatus: 'reviewed', sourceLocale: 'es', sourceEventId: generalId };
      } else {
        const en = mirrorById.en.get(generalId);
        const originalDateISO = text(item.generalRomanBinding?.generalRomanDateISO) || text(en?.dateISO);
        const englishName = text(en?.name);
        if (!originalDateISO || !englishName) {
          unresolved.push({ sourceOccurrenceId: item.sourceOccurrenceId, canonicalEventId, locale: 'es', reason: 'missing-general-reference-for-romcal' });
        } else {
          const result = bestSpanishMatch({ generalId, englishName, originalDateISO, generalRank: en?.grade, romcalEnglish, romcalSpanishByKey });
          if (!result.match) unresolved.push({ sourceOccurrenceId: item.sourceOccurrenceId, canonicalEventId, locale: 'es', reason: result.reason, originalDateISO, englishName, candidates: result.scored ?? [] });
          else labels.es = { label: result.match.name, source: 'romcal-general-roman-es', translationStatus: 'source', sourceLocale: 'es', sourceEventId: result.match.id, matchScore: result.match.score };
        }
      }
    } else {
      unresolved.push({ sourceOccurrenceId: item.sourceOccurrenceId, canonicalEventId, reason: 'non-general-event-without-reviewed-labels' });
    }

    occurrences.push({
      sourceOccurrenceId: text(item.sourceOccurrenceId),
      sourceUid: text(item.sourceUid) || null,
      dateISO: text(item.dateISO),
      canonicalEventId,
      category: category(item.category),
      rank: item.rank == null ? null : text(item.rank),
      labels,
      source: item.source,
      generalRomanBinding: item.generalRomanBinding ?? null,
      resolution: text(item.resolution),
      reviewStatus: text(item.reviewStatus),
      decisionId: item.decisionId ?? null,
      publicationAllowed: false,
    });
  }

  const localeCompleteness = {};
  for (const locale of PUBLIC_LOCALES) {
    const complete = occurrences.filter((item) => text(item.labels?.[locale]?.label)).length;
    localeCompleteness[locale] = { expectedOccurrences: occurrences.length, localizedOccurrences: complete, missingOccurrences: occurrences.length - complete, completeness: Number((complete / occurrences.length).toFixed(4)) };
  }
  const byDate = new Map();
  for (const item of occurrences) byDate.set(item.dateISO, (byDate.get(item.dateISO) ?? 0) + 1);
  const dayCounts = [...byDate.values()];
  const stagingReady = unresolved.length === 0 && PUBLIC_LOCALES.every((locale) => localeCompleteness[locale].completeness === 1) && byDate.size === 365;
  if (!stagingReady) {
    const error = new Error(`Portugal v2 build is not staging-ready: ${unresolved.length} unresolved localization/provenance issue(s).`);
    error.unresolved = unresolved;
    throw error;
  }

  return {
    schemaVersion: 3,
    build: 'roman-catholic-pt-overlay-v2',
    generatedAt: new Date().toISOString(),
    sourceCommit,
    year,
    churchId: 'roman-catholic',
    targetJurisdiction: 'pt',
    targetPublicLocales: PUBLIC_LOCALES,
    productionWriteAllowed: false,
    sourceRelease: {
      mode: effective.mode,
      reviewPlanStatus: effective.reviewPlanStatus,
      sourceOccurrences: effective.summary.sourceOccurrences,
      approvedDecisions: review.decisions.length,
      sourceEffectiveDigest: sha256(effective),
      approvedReviewDigest: sha256(review),
    },
    calendarCoverage: {
      expectedDays: 365,
      coveredDays: byDate.size,
      occurrences: occurrences.length,
      multiObservanceDays: dayCounts.filter((count) => count > 1).length,
      maxObservancesPerDay: Math.max(...dayCounts),
      singleObservanceDays: dayCounts.filter((count) => count === 1).length,
    },
    localeCompleteness,
    localizationSources: {
      en: { id: 'litcal-api', role: 'label-only-general-roman', calendarAuthorityForPortugal: false },
      pt: { id: 'portugal-national-liturgy-secretariat', role: 'official-jurisdiction-label-and-occurrence', calendarAuthorityForPortugal: true },
      es: { id: 'romcal-general-roman-es', role: 'label-only-general-roman', calendarAuthorityForPortugal: false, packageVersion: romcalPayload.packageVersion ?? null, pinnedSourceCommit: romcalPayload.pinnedSourceCommit ?? null },
      fr: { id: 'litcal-api', role: 'label-only-general-roman', calendarAuthorityForPortugal: false },
      it: { id: 'litcal-api', role: 'label-only-general-roman', calendarAuthorityForPortugal: false },
      reviewedProper: { id: 'santosdia-reviewed-calendar-localization', role: 'reviewed-localization-for-portugal-specific-canonical-events' },
    },
    provenancePolicy: {
      eventIdentityByCanonicalIdOnly: true,
      firstEventByCivilDateMatchingForbidden: true,
      portugalOccurrenceAuthority: 'portugal-national-liturgy-secretariat',
      generalRomanAndRomcalAreLabelOnlyForPortugalDates: true,
      humanApprovedDeltaDecisionsRequired: true,
    },
    productReadiness: {
      stagingReady,
      productionApproved: false,
      productionWriteAllowed: false,
      occurrenceCount: occurrences.length,
      civilDayCount: byDate.size,
      labelCount: occurrences.length * PUBLIC_LOCALES.length,
    },
    occurrences,
  };
}

function main() {
  const year = Number(argument('--year', '2026'));
  const effectivePath = argument('--effective');
  const reviewPath = argument('--review');
  const romcalPath = argument('--romcal');
  const mirrorRoot = path.resolve(argument('--mirror-root', 'data/litcal-mirror/calendars/general'));
  const outputPath = argument('--output');
  if (!effectivePath || !reviewPath || !romcalPath || !outputPath) throw new Error('Usage: --effective <json> --review <json> --romcal <json> --output <json> [--mirror-root <dir>] [--year 2026]');
  const mirrorPayloads = Object.fromEntries(Object.entries(MIRROR_LOCALES).map(([locale, upstream]) => [locale, readJson(path.join(mirrorRoot, String(year), `${upstream}.json`))]));
  try {
    const result = buildPortugalOverlayV2({ effective: readJson(effectivePath), review: readJson(reviewPath), mirrorPayloads, romcalPayload: readJson(romcalPath), year, sourceCommit: process.env.GITHUB_SHA ?? null });
    writeJson(outputPath, result);
    console.log(JSON.stringify({ build: result.build, occurrences: result.calendarCoverage.occurrences, days: result.calendarCoverage.coveredDays, multiObservanceDays: result.calendarCoverage.multiObservanceDays, maxObservancesPerDay: result.calendarCoverage.maxObservancesPerDay, labels: result.productReadiness.labelCount, stagingReady: result.productReadiness.stagingReady }, null, 2));
  } catch (error) {
    if (Array.isArray(error?.unresolved)) console.error(JSON.stringify({ unresolved: error.unresolved }, null, 2));
    throw error;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

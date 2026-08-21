#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_LOCALES = ['en', 'pt', 'es', 'fr', 'it'];
const PERSON_CATEGORIES = new Set(['saint', 'apostle', 'martyr']);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function text(value) {
  return String(value ?? '').normalize('NFC').trim();
}

function ascii(value) {
  return text(value)
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase();
}

const TITLE_WORDS = new Set([
  'saint', 'saints', 'st', 'sts', 'santo', 'santa', 'santos', 'santas', 'sao', 's',
  'san', 'santa', 'santi', 'sante', 'sainte', 'saints', 'beato', 'beata', 'beatos', 'beatas',
  'blessed', 'blesseds', 'bienheureux', 'bienheureuse', 'bienheureux', 'bienheureuses',
]);

const ROLE_WORDS = new Set([
  'pope', 'papa', 'bishop', 'bispo', 'eveque', 'vescovo', 'obispo', 'priest', 'presbitero',
  'sacerdote', 'martyr', 'martyrs', 'martir', 'martires', 'martire', 'martiri', 'virgin', 'virgem',
  'vierge', 'vergine', 'apostle', 'apostolo', 'apotre', 'apostol', 'abbot', 'abade', 'abbe', 'abate',
  'doctor', 'doutor', 'docteur', 'dottore', 'deacon', 'diacono', 'diacre', 'religious', 'religioso',
  'religiosa', 'monk', 'monge', 'nun', 'freira', 'founder', 'fundador', 'fundadora', 'foundress',
]);

function normalizedName(value) {
  const tokens = ascii(value)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .filter((token, index) => !(index === 0 && TITLE_WORDS.has(token)))
    .filter((token) => !ROLE_WORDS.has(token));
  return tokens.join(' ').trim();
}

function leadingName(value) {
  return text(value).split(/[,;()–—]/u, 1)[0].trim();
}

function identifierWords(canonicalEventId) {
  return text(canonicalEventId)
    .replace(/^rc(?:-pt)?:/u, '')
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1 $2')
    .replace(/[_:-]+/gu, ' ')
    .replace(/^Sts?\s+/u, '')
    .replace(/^Blessed\s+/u, '')
    .trim();
}

function matchForms(value) {
  const candidates = new Set();
  for (const source of [text(value), leadingName(value)]) {
    const normalized = normalizedName(source);
    if (normalized.length >= 3) candidates.add(normalized);
  }
  return candidates;
}

function flattenStrings(value, output = []) {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) for (const item of value) flattenStrings(item, output);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flattenStrings(item, output);
  return output;
}

function classifyOccurrence(item) {
  const id = ascii(item.canonicalEventId).replace(/\s+/gu, '');
  const labelText = ascii(PUBLIC_LOCALES.map((locale) => item.labels?.[locale]?.label ?? item.labels?.[locale] ?? '').join(' '));
  const category = text(item.category).toLowerCase();

  const marian = category === 'marian'
    || /(ourlady|blessedvirginmary|virginmary|bvm|immaculateconception|immaculateheart|assumption|nativitymary|nativityblessedvirgin|queenshipmary|sorrowsmary|rosary|ladyof|fatima|lourdes|carmel|visitationmary|presentationmary)/u.test(id)
    || /\b(nossa senhora|virgem maria|bem aventurada virgem maria|blessed virgin mary|our lady|vierge marie|vergine maria|virgen maria)\b/u.test(labelText);
  if (marian) return { kind: 'marian-observance', personModel: 'non-person-observance', reason: 'marian-feast-or-observance' };

  const christological = /(jesus|christ|lord|trinity|corpuschristi|eucharist|sacredheart|holycross|exaltationcross|baptismoflord|transfiguration|epiphany|nativityoflord|christmas|easter|pentecost|ascension|annunciation|holyfamily)/u.test(id)
    || /\b(jesus|cristo|senhor|trindade|corpo de cristo|sagrado coracao|sacred heart|holy trinity|body and blood of christ|holy cross)\b/u.test(labelText);
  if (christological) return { kind: 'christological-or-doctrinal-observance', personModel: 'non-person-observance', reason: 'christological-or-doctrinal-feast' };

  const collective = /^rc(?:-pt)?:sts/u.test(id)
    || /(andcompanions|companionsmartyrs|martyrs|holyinnocents|sevenfounders|maccabees|firstmartyrs)/u.test(id)
    || /\b(santos|santas|saints|martires|martyrs|martiri|martyrs)\b/u.test(labelText)
    || /\b(?:sao|santo|santa|saint|st)\b[^,;]{1,80}\b(?:e|and|et|y)\b[^,;]{1,80}\b(?:sao|santo|santa|saint|st)\b/u.test(labelText);
  if (collective) return { kind: 'collective-person-observance', personModel: 'collective', reason: 'plural-or-companion-observance' };

  if (PERSON_CATEGORIES.has(category) || /^rc(?:-pt)?:st(?!s)/u.test(id) || /^rc(?:-pt)?:bl/u.test(id)) {
    return { kind: 'single-person-observance', personModel: 'single', reason: 'singular-saint-category-or-canonical-id' };
  }

  return { kind: 'non-person-liturgical-observance', personModel: 'non-person-observance', reason: 'no-safe-person-signal' };
}

function buildPersonIndex(navigation) {
  const byKey = new Map();
  const peopleById = new Map();
  for (const person of navigation.people ?? []) {
    if (!text(person.entityId)) continue;
    peopleById.set(person.entityId, person);
    const values = [person.canonicalName, ...Object.values(person.names ?? {}), ...flattenStrings(person.aliases ?? {})];
    for (const value of values) {
      for (const key of matchForms(value)) {
        if (!byKey.has(key)) byKey.set(key, new Set());
        byKey.get(key).add(person.entityId);
      }
    }
  }
  return { byKey, peopleById };
}

function occurrenceKeys(item) {
  const keys = new Map();
  for (const locale of PUBLIC_LOCALES) {
    const value = item.labels?.[locale]?.label ?? item.labels?.[locale];
    for (const key of matchForms(value)) {
      if (!keys.has(key)) keys.set(key, []);
      keys.get(key).push(`label:${locale}`);
    }
  }
  for (const key of matchForms(identifierWords(item.canonicalEventId))) {
    if (!keys.has(key)) keys.set(key, []);
    keys.get(key).push('canonical-event-id');
  }
  return keys;
}

function candidateMatch(item, index) {
  const evidenceByPerson = new Map();
  for (const [key, evidence] of occurrenceKeys(item)) {
    for (const personId of index.byKey.get(key) ?? []) {
      if (!evidenceByPerson.has(personId)) evidenceByPerson.set(personId, []);
      evidenceByPerson.get(personId).push({ key, evidence });
    }
  }
  const candidates = [...evidenceByPerson.entries()]
    .map(([entityId, evidence]) => {
      const person = index.peopleById.get(entityId);
      return {
        entityId,
        qid: person?.qid ?? null,
        canonicalName: person?.canonicalName ?? entityId,
        publicationStatus: person?.publicationStatus ?? 'withheld',
        evidence,
      };
    })
    .sort((a, b) => a.entityId.localeCompare(b.entityId));

  if (candidates.length === 1) return { status: 'unique-exact-candidate', candidates };
  if (candidates.length > 1) return { status: 'ambiguous-exact-candidates', candidates };
  return { status: 'unmatched', candidates: [] };
}

function increment(map, key) {
  map[key] = (map[key] ?? 0) + 1;
}

export function buildPortugalSaintPublicationQueue({ calendar, navigation, publicNavigation = null, strict = true } = {}) {
  if (calendar?.build !== 'roman-catholic-pt-overlay-v2' || calendar?.productionWriteAllowed !== false || !Array.isArray(calendar?.occurrences)) {
    throw new Error('Publication queue requires a fail-closed Portugal v2 product build.');
  }
  if (strict && (calendar.calendarCoverage?.occurrences !== 389 || calendar.calendarCoverage?.coveredDays !== 365 || calendar.productReadiness?.labelCount !== 1945)) {
    throw new Error('Portugal v2 product build does not match the approved 389-occurrence / 365-day / 1945-label topology.');
  }
  if (navigation?.schemaVersion !== 1 || navigation?.publicationAllowed !== false || navigation?.productionMutation !== false || !Array.isArray(navigation?.people)) {
    throw new Error('Publication queue requires a verified non-publishing navigation source.');
  }
  if (publicNavigation && (publicNavigation?.productionMutation !== false || !Array.isArray(publicNavigation?.people))) {
    throw new Error('Public navigation input crossed the non-mutating queue boundary.');
  }

  const index = buildPersonIndex(navigation);
  const publicIds = new Set((publicNavigation?.people ?? []).filter((person) => person.publicationStatus === 'published').map((person) => person.entityId));
  const classificationCounts = {};
  const matchCounts = {};
  const actionCounts = {};
  const items = [];

  for (const occurrence of calendar.occurrences) {
    const classification = classifyOccurrence(occurrence);
    increment(classificationCounts, classification.kind);

    let match = { status: 'not-applicable', candidates: [] };
    let action = 'no-person-publication-action';
    let priority = 'P2';
    let alreadyPublic = false;

    if (classification.kind === 'single-person-observance') {
      match = candidateMatch(occurrence, index);
      increment(matchCounts, match.status);
      alreadyPublic = match.candidates.length === 1 && publicIds.has(match.candidates[0].entityId);
      if (alreadyPublic) {
        action = 'review-calendar-to-existing-public-person-link';
        priority = 'P0';
      } else if (match.status === 'unique-exact-candidate') {
        action = 'review-identity-link-then-publication';
        priority = 'P0';
      } else if (match.status === 'ambiguous-exact-candidates') {
        action = 'resolve-identity-ambiguity';
        priority = 'P1';
      } else {
        action = 'research-person-identity';
        priority = 'P1';
      }
    } else if (classification.kind === 'collective-person-observance') {
      match = { status: 'collective-not-name-matched', candidates: [] };
      increment(matchCounts, match.status);
      action = 'model-collective-observance-without-forced-person-merge';
      priority = 'P1';
    } else {
      increment(matchCounts, match.status);
    }
    increment(actionCounts, action);

    items.push({
      sourceOccurrenceId: occurrence.sourceOccurrenceId,
      dateISO: occurrence.dateISO,
      canonicalEventId: occurrence.canonicalEventId,
      category: occurrence.category,
      rank: occurrence.rank ?? null,
      labels: Object.fromEntries(PUBLIC_LOCALES.map((locale) => [locale, text(occurrence.labels?.[locale]?.label ?? occurrence.labels?.[locale])]).filter(([, value]) => value)),
      classification,
      identityMatch: match,
      alreadyPublic,
      action,
      priority,
      publicationAllowed: false,
      productionMutation: false,
      indexationAllowedByQueue: false,
      advertisingEligibleByQueue: false,
    });
  }

  const singlePersonItems = items.filter((item) => item.classification.kind === 'single-person-observance');
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: 'roman-catholic-pt-2026-v2',
    datasetVersion: navigation.datasetVersion ?? null,
    calendarOccurrences: items.length,
    calendarDays: calendar.calendarCoverage?.coveredDays ?? new Set(items.map((item) => item.dateISO)).size,
    classifications: classificationCounts,
    identityMatches: matchCounts,
    actions: actionCounts,
    singlePerson: {
      occurrences: singlePersonItems.length,
      uniqueExactCandidates: singlePersonItems.filter((item) => item.identityMatch.status === 'unique-exact-candidate').length,
      ambiguousExactCandidates: singlePersonItems.filter((item) => item.identityMatch.status === 'ambiguous-exact-candidates').length,
      unmatched: singlePersonItems.filter((item) => item.identityMatch.status === 'unmatched').length,
      alreadyPublic: singlePersonItems.filter((item) => item.alreadyPublic).length,
    },
    operationalBacklog: {
      p0: items.filter((item) => item.priority === 'P0').length,
      p1: items.filter((item) => item.priority === 'P1').length,
      p2: items.filter((item) => item.priority === 'P2').length,
    },
    safety: {
      publicationAllowed: false,
      productionMutation: false,
      automaticIdentityLinkingAllowed: false,
      automaticBiographyPublicationAllowed: false,
      adsenseReviewState: 'PREPARING',
      adServingMutation: false,
      autoAdsMutation: false,
      seoIndexationMutation: false,
      rationale: 'This queue is staging evidence only while AdSense review is PREPARING; it cannot create public pages, enable ads or alter indexation.',
    },
  };

  if (strict && items.length !== 389) throw new Error(`Expected 389 Portugal v2 occurrences, found ${items.length}.`);
  if (items.some((item) => item.publicationAllowed !== false || item.productionMutation !== false || item.advertisingEligibleByQueue !== false)) {
    throw new Error('Publication queue crossed its fail-closed product or AdSense boundary.');
  }
  if (Object.values(classificationCounts).reduce((sum, value) => sum + value, 0) !== items.length) throw new Error('Classification accounting mismatch.');

  return {
    schemaVersion: 1,
    generatedAt: summary.generatedAt,
    release: summary.release,
    source: {
      calendarBuild: calendar.build,
      calendarSourceCommit: calendar.sourceCommit ?? null,
      navigationDatasetVersion: navigation.datasetVersion ?? null,
      navigationSourceSha256: navigation.sourceSha256 ?? null,
    },
    publicationAllowed: false,
    productionMutation: false,
    summary,
    items,
  };
}

function main() {
  const calendarPath = argument('--calendar');
  const navigationPath = argument('--navigation');
  const publicNavigationPath = argument('--public-navigation');
  const outputPath = argument('--output');
  const summaryPath = argument('--summary');
  if (!calendarPath || !navigationPath || !outputPath || !summaryPath) {
    throw new Error('Usage: --calendar <Portugal v2 build.json> --navigation <navigation-source-reviewed.json> [--public-navigation <navigation-source-public.json>] --output <queue.json> --summary <summary.json>');
  }
  const calendar = JSON.parse(fs.readFileSync(path.resolve(calendarPath), 'utf8'));
  const navigation = JSON.parse(fs.readFileSync(path.resolve(navigationPath), 'utf8'));
  const publicNavigation = publicNavigationPath ? JSON.parse(fs.readFileSync(path.resolve(publicNavigationPath), 'utf8')) : null;
  const result = buildPortugalSaintPublicationQueue({ calendar, navigation, publicNavigation, strict: true });
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.mkdirSync(path.dirname(path.resolve(summaryPath)), { recursive: true });
  fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve(summaryPath), `${JSON.stringify(result.summary, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(result.summary, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}

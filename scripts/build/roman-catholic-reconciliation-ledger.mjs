import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const OFFICIAL_SOURCE = 'portugal-national-liturgy-secretariat';
const OFFICIAL_DOMAIN = 'liturgia.pt';
const HOLY_SEE_DOMAIN = 'vatican.va';
const PORTUGAL_RELEASE_ID = 'roman-catholic-pt-2026-v2';

function daysInYear(year) {
  return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
}
function normalizedHost(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}
function isOfficialUrl(url) {
  const host = normalizedHost(url);
  return host === OFFICIAL_DOMAIN || host.endsWith(`.${OFFICIAL_DOMAIN}`);
}
function isHolySeeUrl(url) {
  const host = normalizedHost(url);
  return host === HOLY_SEE_DOMAIN || host.endsWith(`.${HOLY_SEE_DOMAIN}`);
}
function fixedDateForYear(year, rule) {
  const month = String(rule.dateRule.month).padStart(2, '0');
  const day = String(rule.dateRule.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function gregorianEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function adventStart(year) {
  const date = new Date(Date.UTC(year, 10, 27));
  date.setUTCDate(date.getUTCDate() + ((7 - date.getUTCDay()) % 7));
  return date;
}

function temporalDateForYear(year, rule) {
  const dateRule = rule.dateRule;
  assert(dateRule?.type === 'relative' && dateRule.calendar === 'gregorian', `Ledger only accepts deterministic Gregorian relative TemporalRules: ${rule.id}.`);
  assert(Number.isInteger(dateRule.offsetDays), `TemporalRule ${rule.id} has an invalid day offset.`);
  assert(!dateRule.weekdayAdjustment, `TemporalRule ${rule.id} requires unsupported weekday adjustment.`);
  const date = dateRule.anchor === 'gregorian-easter'
    ? gregorianEaster(year)
    : dateRule.anchor === 'advent-start'
      ? adventStart(year)
      : null;
  assert(date, `TemporalRule ${rule.id} has an unsupported anchor.`);
  date.setUTCDate(date.getUTCDate() + dateRule.offsetDays);
  return date.toISOString().slice(0, 10);
}

export function buildReconciliationLedger(report, occurrenceDataset, ruleDataset, temporalRuleDataset, temporalShadow) {
  const year = Number(report?.year);
  const expectedDays = daysInYear(year);
  assert(Number.isInteger(year) && year >= 1970 && year <= 2200, 'Baseline year is invalid.');
  assert(report?.build === 'roman-catholic-product-baseline-v1', 'Input is not the Roman Catholic product baseline.');
  assert(report?.churchId === 'roman-catholic' && report?.targetJurisdiction === 'pt', 'Baseline context must be Roman Catholic Portugal.');
  assert(Array.isArray(report.daily) && report.daily.length === expectedDays, `Baseline must contain exactly ${expectedDays} daily rows.`);
  assert(occurrenceDataset?.schemaVersion === 1 && Array.isArray(occurrenceDataset.occurrences), 'Canonical occurrence anchors are invalid.');
  assert(ruleDataset?.schemaVersion === 1 && Array.isArray(ruleDataset.rules), 'Perennial Sanctorale rules are invalid.');
  assert(temporalRuleDataset?.schemaVersion === 1 && Array.isArray(temporalRuleDataset.rules), 'Canonical TemporalRules are invalid.');
  assert(temporalShadow?.schemaVersion === 1 && temporalShadow.status === 'approved-release-temporal-shadow-mappings', 'Approved TemporalRule shadow mappings are invalid.');
  assert(temporalShadow.sourceReleaseId === PORTUGAL_RELEASE_ID && temporalShadow.mutationAllowed === false, 'TemporalRule shadow must remain read-only and bound to the approved Portugal release.');
  assert(temporalShadow.target?.churchId === 'church:roman-catholic' && temporalShadow.target?.jurisdictionId === 'jurisdiction:roman-catholic:pt', 'TemporalRule shadow Church/Jurisdiction differs from the ledger.');
  assert(temporalShadow.target?.calendarSystem === 'gregorian' && temporalShadow.target?.year === year, 'TemporalRule shadow calendar/year differs from the ledger.');
  assert(Number.isInteger(temporalShadow.sourceArtifact?.workflowRunId) && temporalShadow.sourceArtifact.workflowRunId > 0, 'TemporalRule shadow lacks an approved workflow identity.');
  assert(Number.isInteger(temporalShadow.sourceArtifact?.artifactId) && temporalShadow.sourceArtifact.artifactId > 0, 'TemporalRule shadow lacks an approved artifact identity.');
  assert(/^[a-f0-9]{64}$/u.test(temporalShadow.sourceArtifact?.buildJsonSha256 ?? ''), 'TemporalRule shadow lacks the exact approved build hash.');
  assert(Array.isArray(temporalShadow.mappings), 'TemporalRule shadow mappings are missing.');

  const rulesByObservance = new Map();
  for (const rule of ruleDataset.rules) {
    assert(!Object.hasOwn(rule, 'year'), `Perennial rule ${rule.id} must not contain an annual year.`);
    assert(rule.dateRule?.type === 'fixed', `Ledger v1 only accepts fixed reviewed Sanctorale rules: ${rule.id}.`);
    assert(!rulesByObservance.has(rule.observanceId), `Multiple selected rules for ${rule.observanceId} require jurisdiction resolution before reconciliation.`);
    rulesByObservance.set(rule.observanceId, rule);
  }

  const anchorsByDate = new Map();
  for (const anchor of occurrenceDataset.occurrences.filter(item => item.year === year && item.jurisdictionId === 'jurisdiction:roman-catholic:pt')) {
    assert(!anchorsByDate.has(anchor.dateISO), `Multiple reviewed occurrence anchors exist on ${anchor.dateISO}; precedence must be resolved first.`);
    assert(Array.isArray(anchor.evidence) && anchor.evidence.length > 0 && anchor.evidence.every(item => isOfficialUrl(item.url)), `Occurrence ${anchor.id} lacks competent Portugal authority evidence.`);
    const rule = rulesByObservance.get(anchor.observanceId);
    assert(rule, `Occurrence ${anchor.id} has no reviewed perennial rule.`);
    assert(fixedDateForYear(year, rule) === anchor.dateISO, `Perennial date mismatch for ${anchor.observanceId}.`);
    assert(rule.liturgicalRank === anchor.rank, `Perennial rank mismatch for ${anchor.observanceId}.`);
    anchorsByDate.set(anchor.dateISO, { anchor, rule });
  }

  const temporalRulesById = new Map();
  for (const rule of temporalRuleDataset.rules) {
    assert(!Object.hasOwn(rule, 'year'), `Perennial TemporalRule ${rule.id} must not contain an annual year.`);
    assert(rule.churchId === 'church:roman-catholic' && rule.calendarSystem === 'gregorian', `TemporalRule ${rule.id} is outside the Roman Catholic Gregorian ledger.`);
    assert(typeof rule.id === 'string' && !temporalRulesById.has(rule.id), `Duplicate or invalid TemporalRule ${String(rule.id)}.`);
    assert(Array.isArray(rule.evidence) && rule.evidence.length > 0 && rule.evidence.every(item => isHolySeeUrl(item.url)), `TemporalRule ${rule.id} lacks competent Holy See evidence.`);
    temporalRulesById.set(rule.id, rule);
  }

  const temporalByDate = new Map();
  const temporalRuleIds = new Set();
  const temporalLegacyIds = new Set();
  const temporalSourceIds = new Set();
  for (const mapping of temporalShadow.mappings) {
    const rule = temporalRulesById.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown TemporalRule ${mapping.temporalRuleId}.`);
    assert(!temporalRuleIds.has(rule.id), `TemporalRule ${rule.id} has multiple annual mappings.`);
    assert(!temporalLegacyIds.has(mapping.legacyObservanceId), `Duplicate temporal legacy identity ${mapping.legacyObservanceId}.`);
    assert(!temporalSourceIds.has(mapping.sourceOccurrenceId), `Duplicate temporal source occurrence ${mapping.sourceOccurrenceId}.`);
    assert(/^2026-\d{2}-\d{2}$/u.test(mapping.expectedDateISO ?? '') && mapping.expectedDateISO.startsWith(`${year}-`), `Temporal mapping ${mapping.occurrenceId} has an invalid annual date.`);
    assert(temporalDateForYear(year, rule) === mapping.expectedDateISO, `TemporalRule ${rule.id} does not resolve to approved date ${mapping.expectedDateISO}.`);
    assert(typeof mapping.occurrenceId === 'string' && mapping.occurrenceId.startsWith(`occurrence:${mapping.expectedDateISO}:`), `Temporal mapping ${rule.id} has an invalid canonical Occurrence identity.`);
    assert(typeof mapping.legacyObservanceId === 'string' && mapping.legacyObservanceId.startsWith('rc:'), `Temporal mapping ${rule.id} lacks its exact legacy identity.`);
    assert(typeof mapping.sourceOccurrenceId === 'string' && mapping.sourceOccurrenceId.startsWith(`snl-pt-${mapping.expectedDateISO}-`), `Temporal mapping ${rule.id} lacks its exact Portugal source occurrence.`);
    assert(/^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash ?? ''), `Temporal mapping ${rule.id} lacks its exact source record hash.`);
    assert(typeof mapping.legacyRank === 'string' && mapping.legacyRank.trim(), `Temporal mapping ${rule.id} lacks its approved legacy rank.`);
    assert(!anchorsByDate.has(mapping.expectedDateISO) && !temporalByDate.has(mapping.expectedDateISO), `Multiple reviewed bindings exist on ${mapping.expectedDateISO}; precedence must be resolved first.`);
    temporalRuleIds.add(rule.id);
    temporalLegacyIds.add(mapping.legacyObservanceId);
    temporalSourceIds.add(mapping.sourceOccurrenceId);
    temporalByDate.set(mapping.expectedDateISO, { mapping, rule });
  }

  const seenDates = new Set();
  const entries = report.daily.map(day => {
    const dateISO = String(day?.dateISO ?? '');
    assert(/^\d{4}-\d{2}-\d{2}$/u.test(dateISO) && dateISO.startsWith(`${year}-`), `Invalid baseline date ${dateISO || '<empty>'}.`);
    assert(!seenDates.has(dateISO), `Duplicate baseline date ${dateISO}.`);
    seenDates.add(dateISO);
    const official = day?.labels?.pt;
    assert(official?.source === OFFICIAL_SOURCE && String(official.label ?? '').trim(), `${dateISO} lacks its official Portugal label.`);
    const fixed = anchorsByDate.get(dateISO);
    const temporal = temporalByDate.get(dateISO);
    if (!fixed && !temporal) {
      return {
        dateISO,
        officialLabel: String(official.label).normalize('NFC').trim(),
        officialSource: OFFICIAL_SOURCE,
        baselineReferenceEventId: day?.primary?.canonicalEventId ?? null,
        classification: 'unresolved',
        sourceBound: false,
        releaseEquivalent: false,
        reason: 'no-reviewed-official-occurrence-to-perennial-rule-binding'
      };
    }
    if (temporal) return {
      dateISO,
      officialLabel: String(official.label).normalize('NFC').trim(),
      officialSource: OFFICIAL_SOURCE,
      baselineReferenceEventId: day?.primary?.canonicalEventId ?? null,
      classification: 'temporale',
      sourceBound: true,
      releaseEquivalent: true,
      canonicalOccurrenceId: temporal.mapping.occurrenceId,
      canonicalObservanceId: temporal.rule.observanceId,
      perennialRuleId: temporal.rule.id,
      liturgicalRank: temporal.mapping.legacyRank,
      authorityEvidence: temporal.rule.evidence.map(item => item.url),
      sourceBinding: {
        releaseId: temporalShadow.sourceReleaseId,
        legacyObservanceId: temporal.mapping.legacyObservanceId,
        sourceOccurrenceId: temporal.mapping.sourceOccurrenceId,
        sourceRecordHash: temporal.mapping.sourceRecordHash
      }
    };
    return {
      dateISO,
      officialLabel: String(official.label).normalize('NFC').trim(),
      officialSource: OFFICIAL_SOURCE,
      baselineReferenceEventId: day?.primary?.canonicalEventId ?? null,
      classification: 'fixed-sanctorale',
      sourceBound: true,
      releaseEquivalent: true,
      canonicalOccurrenceId: fixed.anchor.id,
      canonicalObservanceId: fixed.anchor.observanceId,
      perennialRuleId: fixed.rule.id,
      liturgicalRank: fixed.anchor.rank,
      authorityEvidence: fixed.anchor.evidence.map(item => item.url)
    };
  });

  const counts = {
    officialOccurrences: entries.length,
    temporale: entries.filter(item => item.classification === 'temporale').length,
    fixedSanctorale: entries.filter(item => item.classification === 'fixed-sanctorale').length,
    movableOrTransfer: entries.filter(item => item.classification === 'movable-or-transfer').length,
    unresolved: entries.filter(item => item.classification === 'unresolved').length,
    sourceBound: entries.filter(item => item.sourceBound).length
  };
  assert(counts.officialOccurrences === expectedDays, 'Ledger does not cover every official daily occurrence.');
  return {
    schemaVersion: 1,
    ledgerModelVersion: '1.0',
    churchId: 'church:roman-catholic',
    jurisdictionId: 'jurisdiction:roman-catholic:pt',
    calendarSystem: 'gregorian',
    year,
    sourceBuild: report.build,
    sourceBuildGeneratedAt: report.generatedAt ?? null,
    authority: { sourceId: OFFICIAL_SOURCE, domain: OFFICIAL_DOMAIN },
    classificationPolicy: {
      labelSimilarityCreatesIdentity: false,
      annualDateCreatesPerennialRule: false,
      sourceBoundCanonicalOccurrenceRequired: true,
      unresolvedRemainsFailClosed: true
    },
    counts,
    completeCoverage: true,
    fullSemanticEquivalence: counts.unresolved === 0,
    publicationAllowed: false,
    entries
  };
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const input = argument('--input');
  const occurrences = argument('--occurrences') ?? 'data/canonical-occurrence-anchors.json';
  const rules = argument('--rules') ?? 'data/canonical-roman-sanctorale-rule-anchors.json';
  const temporalRules = argument('--temporal-rules') ?? 'data/canonical-temporal-rule-anchors.json';
  const temporalShadow = argument('--temporal-shadow') ?? 'data/migrations/roman-catholic-pt-2026-v2.temporal-shadow.json';
  const output = argument('--output');
  if (!input || !output) throw new Error('Usage: node scripts/build/roman-catholic-reconciliation-ledger.mjs --input <build.json> --output <ledger.json> [--occurrences <json>] [--rules <json>] [--temporal-rules <json>] [--temporal-shadow <json>]');
  const read = file => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const ledger = buildReconciliationLedger(read(input), read(occurrences), read(rules), read(temporalRules), read(temporalShadow));
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ year: ledger.year, counts: ledger.counts, fullSemanticEquivalence: ledger.fullSemanticEquivalence, publicationAllowed: ledger.publicationAllowed }, null, 2));
}

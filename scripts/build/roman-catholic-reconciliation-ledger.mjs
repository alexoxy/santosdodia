import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const OFFICIAL_SOURCE = 'portugal-national-liturgy-secretariat';
const OFFICIAL_DOMAIN = 'liturgia.pt';

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
function fixedDateForYear(year, rule) {
  const month = String(rule.dateRule.month).padStart(2, '0');
  const day = String(rule.dateRule.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function buildReconciliationLedger(report, occurrenceDataset, ruleDataset) {
  const year = Number(report?.year);
  const expectedDays = daysInYear(year);
  assert(Number.isInteger(year) && year >= 1970 && year <= 2200, 'Baseline year is invalid.');
  assert(report?.build === 'roman-catholic-product-baseline-v1', 'Input is not the Roman Catholic product baseline.');
  assert(report?.churchId === 'roman-catholic' && report?.targetJurisdiction === 'pt', 'Baseline context must be Roman Catholic Portugal.');
  assert(Array.isArray(report.daily) && report.daily.length === expectedDays, `Baseline must contain exactly ${expectedDays} daily rows.`);
  assert(occurrenceDataset?.schemaVersion === 1 && Array.isArray(occurrenceDataset.occurrences), 'Canonical occurrence anchors are invalid.');
  assert(ruleDataset?.schemaVersion === 1 && Array.isArray(ruleDataset.rules), 'Perennial Sanctorale rules are invalid.');

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

  const seenDates = new Set();
  const entries = report.daily.map(day => {
    const dateISO = String(day?.dateISO ?? '');
    assert(/^\d{4}-\d{2}-\d{2}$/u.test(dateISO) && dateISO.startsWith(`${year}-`), `Invalid baseline date ${dateISO || '<empty>'}.`);
    assert(!seenDates.has(dateISO), `Duplicate baseline date ${dateISO}.`);
    seenDates.add(dateISO);
    const official = day?.labels?.pt;
    assert(official?.source === OFFICIAL_SOURCE && String(official.label ?? '').trim(), `${dateISO} lacks its official Portugal label.`);
    const reviewed = anchorsByDate.get(dateISO);
    if (!reviewed) {
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
    return {
      dateISO,
      officialLabel: String(official.label).normalize('NFC').trim(),
      officialSource: OFFICIAL_SOURCE,
      baselineReferenceEventId: day?.primary?.canonicalEventId ?? null,
      classification: 'fixed-sanctorale',
      sourceBound: true,
      releaseEquivalent: true,
      canonicalOccurrenceId: reviewed.anchor.id,
      canonicalObservanceId: reviewed.anchor.observanceId,
      perennialRuleId: reviewed.rule.id,
      liturgicalRank: reviewed.anchor.rank,
      authorityEvidence: reviewed.anchor.evidence.map(item => item.url)
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
  const output = argument('--output');
  if (!input || !output) throw new Error('Usage: node scripts/build/roman-catholic-reconciliation-ledger.mjs --input <build.json> --output <ledger.json> [--occurrences <json>] [--rules <json>]');
  const read = file => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const ledger = buildReconciliationLedger(read(input), read(occurrences), read(rules));
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ year: ledger.year, counts: ledger.counts, fullSemanticEquivalence: ledger.fullSemanticEquivalence, publicationAllowed: ledger.publicationAllowed }, null, 2));
}

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const OFFICIAL_SOURCE = 'portugal-national-liturgy-secretariat';
const OFFICIAL_DOMAIN = 'liturgia.pt';
const HOLY_SEE_DOMAIN = 'vatican.va';
const PORTUGAL_RELEASE_ID = 'roman-catholic-pt-2026-v2';
const TEMPORAL_FAMILY_WEEKDAYS = ['friday', 'monday', 'saturday', 'thursday', 'tuesday', 'wednesday'];

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
  assert(dateRule?.calendar === 'gregorian', `Ledger only accepts deterministic Gregorian TemporalRules: ${rule.id}.`);
  if (dateRule.type === 'fixed') {
    assert(Number.isInteger(dateRule.month) && dateRule.month >= 1 && dateRule.month <= 12, `TemporalRule ${rule.id} has an invalid fixed month.`);
    assert(Number.isInteger(dateRule.day) && dateRule.day >= 1 && dateRule.day <= 31, `TemporalRule ${rule.id} has an invalid fixed day.`);
    const date = new Date(Date.UTC(year, dateRule.month - 1, dateRule.day));
    assert(date.getUTCFullYear() === year && date.getUTCMonth() + 1 === dateRule.month && date.getUTCDate() === dateRule.day, `TemporalRule ${rule.id} has an impossible fixed date.`);
    return date.toISOString().slice(0, 10);
  }
  assert(dateRule?.type === 'relative', `TemporalRule ${rule.id} has an unsupported DateRule type.`);
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

function familyLegacyId(family, week, weekday) {
  const prefix = family.observanceFamilyKey === 'lent-weekday'
    ? 'LentWeekday'
    : family.observanceFamilyKey === 'easter-weekday'
      ? 'EasterWeekday'
      : null;
  assert(prefix, `TemporalRuleFamily ${family.id} has an unsupported family key.`);
  return `rc:${prefix}${week}${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;
}

function familyDateForYear(year, family, week, weekday) {
  const weekdayOffset = family.weekdayOffsets?.[weekday];
  assert(Number.isInteger(weekdayOffset), `TemporalRuleFamily ${family.id} has an invalid ${weekday} offset.`);
  const date = gregorianEaster(year);
  date.setUTCDate(date.getUTCDate() + family.baseOffsetDays + ((week - 1) * family.weekStrideDays) + weekdayOffset);
  return date.toISOString().slice(0, 10);
}

function familyObservanceId(family, week, weekday) {
  assert(family.observanceIdPattern === 'observance:{observanceFamilyKey}-{week}-{weekday}:roman-catholic', `TemporalRuleFamily ${family.id} has an unsupported Observance identity pattern.`);
  return family.observanceIdPattern
    .replace('{observanceFamilyKey}', family.observanceFamilyKey)
    .replace('{week}', String(week))
    .replace('{weekday}', weekday);
}

export function buildReconciliationLedger(report, occurrenceDataset, ruleDataset, temporalRuleDataset, temporalShadow, temporalFamilyDataset, temporalFamilyShadow, movableTransferShadow, overlayReview, overlayApproval) {
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
  assert(temporalFamilyDataset?.schemaVersion === 1 && temporalFamilyDataset.temporalRuleFamilyModelVersion === '1.0' && temporalFamilyDataset.status === 'repository-reviewed-temporal-rule-family-anchors' && Array.isArray(temporalFamilyDataset.families), 'Canonical TemporalRuleFamilies are invalid.');
  assert(temporalFamilyShadow?.schemaVersion === 1 && temporalFamilyShadow.status === 'approved-release-temporal-family-shadow', 'Approved TemporalRuleFamily shadow is invalid.');
  assert(temporalFamilyShadow.sourceReleaseId === PORTUGAL_RELEASE_ID && temporalFamilyShadow.mutationAllowed === false, 'TemporalRuleFamily shadow must remain read-only and bound to the approved Portugal release.');
  assert(temporalFamilyShadow.year === year, 'TemporalRuleFamily shadow year differs from the ledger.');
  assert(temporalFamilyShadow.sourceArtifact?.workflowRunId === temporalShadow.sourceArtifact.workflowRunId && temporalFamilyShadow.sourceArtifact?.artifactId === temporalShadow.sourceArtifact.artifactId && temporalFamilyShadow.sourceArtifact?.buildJsonSha256 === temporalShadow.sourceArtifact.buildJsonSha256, 'TemporalRule and TemporalRuleFamily shadows must bind the same approved artifact.');
  assert(Array.isArray(temporalFamilyShadow.families) && Array.isArray(temporalFamilyShadow.suppressedCandidates), 'TemporalRuleFamily presence and suppression mappings are missing.');
  assert(movableTransferShadow?.schemaVersion === 1 && movableTransferShadow.status === 'approved-release-movable-transfer-shadow', 'Approved movable/transfer shadow is invalid.');
  assert(movableTransferShadow.sourceReleaseId === PORTUGAL_RELEASE_ID && movableTransferShadow.mutationAllowed === false, 'Movable/transfer shadow must remain read-only and bound to the approved Portugal release.');
  assert(movableTransferShadow.target?.churchId === 'church:roman-catholic' && movableTransferShadow.target?.jurisdictionId === 'jurisdiction:roman-catholic:pt', 'Movable/transfer shadow Church/Jurisdiction differs from the ledger.');
  assert(movableTransferShadow.target?.calendarSystem === 'gregorian' && movableTransferShadow.target?.year === year && movableTransferShadow.target?.policyId === 'roman-portugal', 'Movable/transfer shadow policy/calendar/year differs from the ledger.');
  assert(movableTransferShadow.sourceArtifact?.workflowRunId === temporalShadow.sourceArtifact.workflowRunId && movableTransferShadow.sourceArtifact?.artifactId === temporalShadow.sourceArtifact.artifactId && movableTransferShadow.sourceArtifact?.buildJsonSha256 === temporalShadow.sourceArtifact.buildJsonSha256, 'Movable/transfer and TemporalRule shadows must bind the same approved artifact.');
  assert(Array.isArray(movableTransferShadow.mappings) && movableTransferShadow.mappings.length === 11, 'Movable/transfer shadow must contain exactly eleven reviewed mappings.');
  assert(isHolySeeUrl(movableTransferShadow.authorityEvidence?.universalCalendar), 'Movable/transfer shadow lacks competent universal calendar evidence.');
  assert(isOfficialUrl(movableTransferShadow.authorityEvidence?.portugalAnnualCalendar) && isOfficialUrl(movableTransferShadow.authorityEvidence?.portugalTransferRules), 'Movable/transfer shadow lacks competent Portugal authority evidence.');
  assert(movableTransferShadow.overlayEvidence?.reviewFile === 'data/releases/roman-catholic-pt-2026.overlay-review.json' && movableTransferShadow.overlayEvidence?.approvalFile === 'data/releases/roman-catholic-pt-2026.overlay-approval.json', 'Movable/transfer overlay evidence paths changed unexpectedly.');
  assert(overlayReview?.schemaVersion === 2 && overlayReview?.releaseScope === 'roman-catholic-pt-2026-overlay-v2' && overlayReview?.year === year && overlayReview?.churchId === 'roman-catholic' && overlayReview?.jurisdictionId === 'pt', 'Portugal overlay review scope differs from the ledger.');
  assert(overlayApproval?.schemaVersion === 1 && overlayApproval?.releaseScope === overlayReview.releaseScope && overlayApproval?.year === year && overlayApproval?.approved === true && overlayApproval?.productionWriteAllowed === false, 'Movable transfers require the exact non-production Portugal overlay approval.');

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
  const temporalOccurrenceIds = new Set();
  for (const mapping of temporalShadow.mappings) {
    const rule = temporalRulesById.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown TemporalRule ${mapping.temporalRuleId}.`);
    assert(!temporalRuleIds.has(rule.id), `TemporalRule ${rule.id} has multiple annual mappings.`);
    assert(!temporalLegacyIds.has(mapping.legacyObservanceId), `Duplicate temporal legacy identity ${mapping.legacyObservanceId}.`);
    assert(!temporalSourceIds.has(mapping.sourceOccurrenceId), `Duplicate temporal source occurrence ${mapping.sourceOccurrenceId}.`);
    assert(!temporalOccurrenceIds.has(mapping.occurrenceId), `Duplicate canonical temporal Occurrence ${mapping.occurrenceId}.`);
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
    temporalOccurrenceIds.add(mapping.occurrenceId);
    temporalByDate.set(mapping.expectedDateISO, { mapping, rule });
  }

  const familiesById = new Map();
  for (const family of temporalFamilyDataset.families) {
    assert(typeof family.id === 'string' && !familiesById.has(family.id), `Duplicate or invalid TemporalRuleFamily ${String(family.id)}.`);
    assert(family.churchId === 'church:roman-catholic' && family.calendarSystem === 'gregorian' && family.anchor === 'gregorian-easter', `TemporalRuleFamily ${family.id} is outside the Roman Catholic Gregorian ledger.`);
    assert(Number.isInteger(family.baseOffsetDays) && Number.isInteger(family.weekStrideDays) && family.weekStrideDays === 7, `TemporalRuleFamily ${family.id} has invalid date arithmetic.`);
    assert(Number.isInteger(family.weekRange?.min) && Number.isInteger(family.weekRange?.max) && family.weekRange.min <= family.weekRange.max, `TemporalRuleFamily ${family.id} has an invalid week range.`);
    const familyWeekdays = Object.keys(family.weekdayOffsets ?? {}).sort();
    assert(JSON.stringify(familyWeekdays) === JSON.stringify(TEMPORAL_FAMILY_WEEKDAYS), `TemporalRuleFamily ${family.id} must contain exactly Monday through Saturday.`);
    assert(family.candidateRequiresPrecedenceResolution === true, `TemporalRuleFamily ${family.id} must require explicit precedence resolution.`);
    familyObservanceId(family, family.weekRange.min, familyWeekdays[0]);
    assert(Array.isArray(family.evidence) && family.evidence.length > 0 && family.evidence.every(item => isHolySeeUrl(item.url)), `TemporalRuleFamily ${family.id} lacks competent Holy See evidence.`);
    familiesById.set(family.id, family);
  }

  const snapshotsByFamily = new Map();
  for (const snapshot of temporalFamilyShadow.families) {
    assert(typeof snapshot.familyId === 'string' && !snapshotsByFamily.has(snapshot.familyId), `Duplicate or invalid TemporalRuleFamily snapshot ${String(snapshot.familyId)}.`);
    assert(familiesById.has(snapshot.familyId), `TemporalRuleFamily snapshot references unknown family ${snapshot.familyId}.`);
    assert(Array.isArray(snapshot.presentLegacyIds) && Array.isArray(snapshot.presentMappings), `TemporalRuleFamily ${snapshot.familyId} lacks exact annual mappings.`);
    snapshotsByFamily.set(snapshot.familyId, snapshot);
  }
  assert(snapshotsByFamily.size === familiesById.size, 'Every canonical TemporalRuleFamily requires one approved annual snapshot.');

  const suppressionsByCandidate = new Map();
  for (const suppression of temporalFamilyShadow.suppressedCandidates) {
    const family = familiesById.get(suppression.familyId);
    assert(family, `Suppression references unknown TemporalRuleFamily ${suppression.familyId}.`);
    const key = `${suppression.familyId}\u0000${suppression.week}\u0000${suppression.weekday}`;
    assert(!suppressionsByCandidate.has(key), `Duplicate TemporalRuleFamily suppression ${key}.`);
    suppressionsByCandidate.set(key, suppression);
  }

  const familyByDate = new Map();
  const consumedSuppressions = new Set();
  for (const family of temporalFamilyDataset.families) {
    const snapshot = snapshotsByFamily.get(family.id);
    const presentLegacyIds = new Set(snapshot.presentLegacyIds);
    assert(presentLegacyIds.size === snapshot.presentLegacyIds.length, `TemporalRuleFamily ${family.id} has duplicate present legacy identities.`);
    const mappingsByCandidate = new Map();
    for (const mapping of snapshot.presentMappings) {
      const key = `${family.id}\u0000${mapping.week}\u0000${mapping.weekday}`;
      assert(!mappingsByCandidate.has(key), `Duplicate TemporalRuleFamily mapping ${key}.`);
      mappingsByCandidate.set(key, mapping);
    }
    assert(mappingsByCandidate.size === presentLegacyIds.size, `TemporalRuleFamily ${family.id} legacy identities and exact mappings differ.`);

    for (let week = family.weekRange.min; week <= family.weekRange.max; week += 1) {
      for (const weekday of Object.keys(family.weekdayOffsets)) {
        const key = `${family.id}\u0000${week}\u0000${weekday}`;
        const mapping = mappingsByCandidate.get(key);
        const suppression = suppressionsByCandidate.get(key);
        assert(Boolean(mapping) !== Boolean(suppression), `TemporalRuleFamily candidate ${key} must be present or suppressed, never both/neither.`);
        const expectedDateISO = familyDateForYear(year, family, week, weekday);
        const expectedLegacyId = familyLegacyId(family, week, weekday);

        if (suppression) {
          assert(suppression.candidateDateISO === expectedDateISO, `TemporalRuleFamily suppression ${key} differs from its calculated date.`);
          assert(typeof suppression.suppressingLegacyObservanceId === 'string' && suppression.suppressingLegacyObservanceId !== expectedLegacyId, `TemporalRuleFamily suppression ${key} lacks a distinct suppressing identity.`);
          assert(['optional-memorial', 'memorial', 'feast', 'solemnity'].includes(suppression.suppressingRank), `TemporalRuleFamily suppression ${key} has an unsupported rank.`);
          consumedSuppressions.add(key);
          continue;
        }

        assert(presentLegacyIds.has(mapping.legacyObservanceId) && mapping.legacyObservanceId === expectedLegacyId, `TemporalRuleFamily mapping ${key} differs from its approved legacy identity.`);
        assert(mapping.expectedDateISO === expectedDateISO, `TemporalRuleFamily mapping ${key} differs from its calculated date.`);
        const expectedOccurrenceId = `occurrence:${expectedDateISO}:${family.observanceFamilyKey}-${week}-${weekday}:roman-catholic:pt`;
        assert(mapping.occurrenceId === expectedOccurrenceId, `TemporalRuleFamily mapping ${key} has an invalid canonical Occurrence identity.`);
        assert(typeof mapping.sourceOccurrenceId === 'string' && mapping.sourceOccurrenceId.startsWith(`snl-pt-${expectedDateISO}-`), `TemporalRuleFamily mapping ${key} lacks its exact Portugal source occurrence.`);
        assert(/^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash ?? ''), `TemporalRuleFamily mapping ${key} lacks its exact source record hash.`);
        assert(mapping.legacyRank === 'weekday' && mapping.reviewStatus === 'inherited-safe' && mapping.resolution === 'inherit-general-canonical-binding', `TemporalRuleFamily mapping ${key} lacks its approved precedence outcome.`);
        assert(!temporalLegacyIds.has(mapping.legacyObservanceId), `Duplicate temporal legacy identity ${mapping.legacyObservanceId}.`);
        assert(!temporalSourceIds.has(mapping.sourceOccurrenceId), `Duplicate temporal source occurrence ${mapping.sourceOccurrenceId}.`);
        assert(!temporalOccurrenceIds.has(mapping.occurrenceId), `Duplicate canonical temporal Occurrence ${mapping.occurrenceId}.`);
        assert(!anchorsByDate.has(expectedDateISO) && !temporalByDate.has(expectedDateISO) && !familyByDate.has(expectedDateISO), `Multiple reviewed bindings exist on ${expectedDateISO}; precedence must be resolved first.`);
        temporalLegacyIds.add(mapping.legacyObservanceId);
        temporalSourceIds.add(mapping.sourceOccurrenceId);
        temporalOccurrenceIds.add(mapping.occurrenceId);
        familyByDate.set(expectedDateISO, { family, mapping, canonicalObservanceId: familyObservanceId(family, week, weekday) });
      }
    }
  }
  assert(consumedSuppressions.size === suppressionsByCandidate.size, 'TemporalRuleFamily shadow contains unused precedence suppressions.');

  const overlayDecisions = new Map((overlayReview.decisions ?? []).map(decision => [decision.id, decision]));
  const approvedDecisionIds = new Set(overlayApproval.decisionIds ?? []);
  const movableByDate = new Map();
  const movableRuleIds = new Set();
  const originSourceIds = new Set();
  let reviewedTransfers = 0;
  for (const mapping of movableTransferShadow.mappings) {
    const rule = temporalRulesById.get(mapping.temporalRuleId);
    assert(rule, `${mapping.occurrenceId} references unknown movable TemporalRule ${mapping.temporalRuleId}.`);
    assert(!temporalRuleIds.has(rule.id) && !movableRuleIds.has(rule.id), `TemporalRule ${rule.id} has multiple annual bindings.`);
    assert(temporalDateForYear(year, rule) === mapping.baseDateISO, `Movable TemporalRule ${rule.id} does not resolve to base date ${mapping.baseDateISO}.`);
    assert(/^2026-\d{2}-\d{2}$/u.test(mapping.expectedDateISO ?? '') && mapping.expectedDateISO.startsWith(`${year}-`), `Movable mapping ${mapping.occurrenceId} has an invalid destination date.`);
    assert(mapping.occurrenceId === `occurrence:${mapping.expectedDateISO}:${rule.observanceId.slice('observance:'.length)}:pt`, `Movable mapping ${rule.id} has an invalid canonical Occurrence identity.`);
    assert(typeof mapping.legacyObservanceId === 'string' && mapping.legacyObservanceId.startsWith('rc:'), `Movable mapping ${rule.id} lacks its exact legacy identity.`);
    assert(mapping.sourceOccurrenceId?.startsWith(`snl-pt-${mapping.expectedDateISO}-`) && /^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash ?? ''), `Movable mapping ${rule.id} lacks its exact Portugal source row.`);
    assert(typeof mapping.legacyRank === 'string' && mapping.legacyRank.trim(), `Movable mapping ${rule.id} lacks its approved legacy rank.`);
    assert(!temporalLegacyIds.has(mapping.legacyObservanceId), `Duplicate temporal legacy identity ${mapping.legacyObservanceId}.`);
    assert(!temporalSourceIds.has(mapping.sourceOccurrenceId), `Duplicate temporal source occurrence ${mapping.sourceOccurrenceId}.`);
    assert(!temporalOccurrenceIds.has(mapping.occurrenceId), `Duplicate canonical temporal Occurrence ${mapping.occurrenceId}.`);
    assert(!anchorsByDate.has(mapping.expectedDateISO) && !temporalByDate.has(mapping.expectedDateISO) && !familyByDate.has(mapping.expectedDateISO) && !movableByDate.has(mapping.expectedDateISO), `Multiple reviewed bindings exist on ${mapping.expectedDateISO}; precedence must be resolved first.`);

    let transfer = null;
    if (mapping.transfer) {
      reviewedTransfers += 1;
      const decision = overlayDecisions.get(mapping.transfer.decisionId);
      assert(decision?.type === 'date-transfer' && approvedDecisionIds.has(decision.id), `Movable mapping ${rule.id} lacks an explicitly approved transfer decision.`);
      assert(decision.canonicalEventId === mapping.legacyObservanceId && decision.fromDate === mapping.baseDateISO && decision.toDate === mapping.expectedDateISO && decision.rank === mapping.legacyRank, `Transfer decision ${decision.id} differs from its movable mapping.`);
      assert(mapping.transfer.fromDateISO === mapping.baseDateISO && mapping.transfer.toDateISO === mapping.expectedDateISO, `Transfer ${decision.id} differs from its canonical base/destination dates.`);
      assert(mapping.reviewStatus === 'approved' && mapping.resolution === 'pending-transfer-destination', `Transfer ${decision.id} lacks its approved destination outcome.`);
      const origin = mapping.transfer.originReplacement;
      assert(typeof origin?.legacyObservanceId === 'string' && origin.legacyObservanceId !== mapping.legacyObservanceId, `Transfer ${decision.id} lacks a distinct origin replacement.`);
      assert(origin.sourceOccurrenceId?.startsWith(`snl-pt-${mapping.baseDateISO}-`) && /^[a-f0-9]{64}$/u.test(origin.sourceRecordHash ?? ''), `Transfer ${decision.id} lacks its exact origin source row.`);
      assert(!originSourceIds.has(origin.sourceOccurrenceId) && !temporalSourceIds.has(origin.sourceOccurrenceId), `Transfer ${decision.id} reuses source occurrence ${origin.sourceOccurrenceId}.`);
      if (decision.replacementAtOrigin) assert(decision.replacementAtOrigin.canonicalEventId === origin.legacyObservanceId, `Transfer ${decision.id} origin replacement differs from the overlay review.`);
      if (origin.decisionId) assert(approvedDecisionIds.has(origin.decisionId), `Transfer origin ${origin.legacyObservanceId} relies on an unapproved decision.`);
      originSourceIds.add(origin.sourceOccurrenceId);
      transfer = {
        decisionId: decision.id,
        fromDateISO: mapping.baseDateISO,
        toDateISO: mapping.expectedDateISO,
        originReplacement: origin
      };
    } else {
      assert(mapping.baseDateISO === mapping.expectedDateISO, `Movable mapping ${rule.id} changes date without a reviewed transfer.`);
      assert(mapping.reviewStatus === 'inherited-safe' && mapping.resolution === 'inherit-general-canonical-binding', `Movable mapping ${rule.id} lacks its inherited-safe outcome.`);
    }

    temporalLegacyIds.add(mapping.legacyObservanceId);
    temporalSourceIds.add(mapping.sourceOccurrenceId);
    temporalOccurrenceIds.add(mapping.occurrenceId);
    movableRuleIds.add(rule.id);
    movableByDate.set(mapping.expectedDateISO, { mapping, rule, transfer });
  }
  assert(reviewedTransfers === 3, 'Movable/transfer shadow must preserve exactly three approved Portugal transfers.');

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
    const familyMember = familyByDate.get(dateISO);
    const movable = movableByDate.get(dateISO);
    if (!fixed && !temporal && !familyMember && !movable) {
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
      temporalBindingType: 'rule',
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
    if (familyMember) return {
      dateISO,
      officialLabel: String(official.label).normalize('NFC').trim(),
      officialSource: OFFICIAL_SOURCE,
      baselineReferenceEventId: day?.primary?.canonicalEventId ?? null,
      classification: 'temporale',
      temporalBindingType: 'rule-family-member',
      sourceBound: true,
      releaseEquivalent: true,
      canonicalOccurrenceId: familyMember.mapping.occurrenceId,
      canonicalObservanceId: familyMember.canonicalObservanceId,
      perennialRuleId: familyMember.family.id,
      temporalFamilyMember: {
        week: familyMember.mapping.week,
        weekday: familyMember.mapping.weekday
      },
      liturgicalRank: familyMember.mapping.legacyRank,
      authorityEvidence: familyMember.family.evidence.map(item => item.url),
      sourceBinding: {
        releaseId: temporalFamilyShadow.sourceReleaseId,
        legacyObservanceId: familyMember.mapping.legacyObservanceId,
        sourceOccurrenceId: familyMember.mapping.sourceOccurrenceId,
        sourceRecordHash: familyMember.mapping.sourceRecordHash,
        reviewStatus: familyMember.mapping.reviewStatus,
        resolution: familyMember.mapping.resolution
      }
    };
    if (movable) return {
      dateISO,
      officialLabel: String(official.label).normalize('NFC').trim(),
      officialSource: OFFICIAL_SOURCE,
      baselineReferenceEventId: day?.primary?.canonicalEventId ?? null,
      classification: 'movable-or-transfer',
      movableBindingType: movable.transfer ? 'reviewed-jurisdiction-transfer' : 'principal-movable-day',
      sourceBound: true,
      releaseEquivalent: true,
      canonicalOccurrenceId: movable.mapping.occurrenceId,
      canonicalObservanceId: movable.rule.observanceId,
      perennialRuleId: movable.rule.id,
      liturgicalRank: movable.mapping.legacyRank,
      authorityEvidence: movable.rule.evidence.map(item => item.url),
      sourceBinding: {
        releaseId: movableTransferShadow.sourceReleaseId,
        legacyObservanceId: movable.mapping.legacyObservanceId,
        sourceOccurrenceId: movable.mapping.sourceOccurrenceId,
        sourceRecordHash: movable.mapping.sourceRecordHash,
        reviewStatus: movable.mapping.reviewStatus,
        resolution: movable.mapping.resolution
      },
      ...(movable.transfer ? { jurisdictionTransfer: movable.transfer } : {})
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
    temporalRules: entries.filter(item => item.classification === 'temporale' && item.temporalBindingType !== 'rule-family-member').length,
    temporalFamilyMembers: entries.filter(item => item.temporalBindingType === 'rule-family-member').length,
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
      temporalFamilyCandidateRequiresPrecedenceResolution: true,
      approvedTransferDecisionRequired: true,
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
  const temporalFamilies = argument('--temporal-families') ?? 'data/canonical-temporal-rule-families.json';
  const temporalFamilyShadow = argument('--temporal-family-shadow') ?? 'data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json';
  const movableTransferShadow = argument('--movable-transfer-shadow') ?? 'data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json';
  const overlayReview = argument('--overlay-review') ?? 'data/releases/roman-catholic-pt-2026.overlay-review.json';
  const overlayApproval = argument('--overlay-approval') ?? 'data/releases/roman-catholic-pt-2026.overlay-approval.json';
  const output = argument('--output');
  if (!input || !output) throw new Error('Usage: node scripts/build/roman-catholic-reconciliation-ledger.mjs --input <build.json> --output <ledger.json> [--occurrences <json>] [--rules <json>] [--temporal-rules <json>] [--temporal-shadow <json>] [--temporal-families <json>] [--temporal-family-shadow <json>] [--movable-transfer-shadow <json>] [--overlay-review <json>] [--overlay-approval <json>]');
  const read = file => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const ledger = buildReconciliationLedger(read(input), read(occurrences), read(rules), read(temporalRules), read(temporalShadow), read(temporalFamilies), read(temporalFamilyShadow), read(movableTransferShadow), read(overlayReview), read(overlayApproval));
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ year: ledger.year, counts: ledger.counts, fullSemanticEquivalence: ledger.fullSemanticEquivalence, publicationAllowed: ledger.publicationAllowed }, null, 2));
}

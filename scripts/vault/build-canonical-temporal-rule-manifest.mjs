#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ruleSourcePath = path.join(root, 'data', 'canonical-temporal-rule-anchors.json');
const observanceSourcePath = path.join(root, 'data', 'canonical-temporal-observance-anchors.json');
const ecclesialSourcePath = path.join(root, 'data', 'canonical-ecclesial-context-anchors.json');

const ID_PATTERN = /^temporal-rule:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/u;
const OBSERVANCE_ID_PATTERN = /^observance:[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)+$/u;
const ALLOWED_ANCHORS = new Set(['gregorian-easter', 'pentecost', 'advent-start', 'christmas']);
const FORBIDDEN_OCCURRENCE_KEYS = new Set(['year', 'date', 'dateISO', 'rank', 'grade', 'jurisdictionId', 'precedence', 'observedDesignation']);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function hostname(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./u, ''); }
  catch { return ''; }
}
function sortedUnique(values) { return [...new Set(values)].sort((a, b) => a.localeCompare(b)); }

export function buildCanonicalTemporalRuleVaultRelease(ruleDataset, observanceDataset, ecclesialDataset, { sourceBytes = null, sourceCommit = null, generatedAt = null } = {}) {
  assert(ruleDataset?.schemaVersion === 1, 'TemporalRule dataset schemaVersion must be 1.');
  assert(ruleDataset?.temporalRuleModelVersion === '1.0', 'TemporalRule modelVersion must be 1.0.');
  assert(ruleDataset?.status === 'repository-reviewed-temporal-rule-anchors', 'TemporalRule dataset is not repository-reviewed.');
  assert(Array.isArray(ruleDataset?.rules) && ruleDataset.rules.length > 0, 'TemporalRule dataset is empty.');
  assert(observanceDataset?.schemaVersion === 1 && observanceDataset?.status === 'repository-reviewed-temporal-observance-anchors' && observanceDataset?.mergeTarget === 'canonical-observance-vault' && Array.isArray(observanceDataset?.observances), 'Temporal Observance anchors are required.');
  assert(ecclesialDataset?.schemaVersion === 1 && ecclesialDataset?.status === 'repository-reviewed-ecclesial-context-anchors' && Array.isArray(ecclesialDataset?.contexts), 'Canonical ecclesial context is required.');

  const observances = new Map(observanceDataset.observances.map((item) => [item.id, item]));
  const churches = new Map(ecclesialDataset.contexts.filter((item) => item.kind === 'church').map((item) => [item.id, item]));
  const ids = new Set();
  const canonicalKeys = new Set();
  const churchCoverage = new Set();
  const rules = [];

  for (const raw of ruleDataset.rules) {
    assert(ID_PATTERN.test(raw?.id ?? ''), `Invalid TemporalRule id: ${String(raw?.id)}.`);
    assert(!ids.has(raw.id), `Duplicate TemporalRule id: ${raw.id}.`);
    ids.add(raw.id);
    for (const key of FORBIDDEN_OCCURRENCE_KEYS) assert(!(key in raw), `${raw.id} leaks Occurrence field ${key} into TemporalRule.`);

    const church = churches.get(raw?.churchId);
    assert(church, `${raw.id} references unknown Church ${String(raw?.churchId)}.`);
    assert(OBSERVANCE_ID_PATTERN.test(raw?.observanceId ?? ''), `${raw.id} has invalid Observance reference.`);
    const observance = observances.get(raw.observanceId);
    assert(observance, `${raw.id} references unknown temporal Observance ${String(raw?.observanceId)}.`);
    assert(observance.churchId === raw.churchId, `${raw.id} Church does not match its Observance.`);
    assert(observance.observanceType === 'temporal-celebration' && Array.isArray(observance.subjects) && observance.subjects.length === 0, `${raw.id} must reference a subjectless temporal Observance.`);
    assert(raw?.calendarSystem === 'gregorian' && (church.calendarSystems ?? []).includes('gregorian'), `${raw.id} bootstrap requires Gregorian Church calendar support.`);

    const dateRule = raw?.dateRule;
    assert(dateRule?.calendar === raw.calendarSystem, `${raw.id} DateRule calendar differs from TemporalRule calendarSystem.`);
    if (dateRule?.type === 'fixed') {
      assert(Number.isInteger(dateRule.month) && dateRule.month >= 1 && dateRule.month <= 12, `${raw.id} has invalid fixed month.`);
      assert(Number.isInteger(dateRule.day) && dateRule.day >= 1 && dateRule.day <= 31, `${raw.id} has invalid fixed day.`);
      assert(!('anchor' in dateRule) && !('offsetDays' in dateRule) && !('weekdayAdjustment' in dateRule), `${raw.id} fixed DateRule contains relative-date fields.`);
      const probe = new Date(Date.UTC(2000, dateRule.month - 1, dateRule.day));
      assert(probe.getUTCMonth() + 1 === dateRule.month && probe.getUTCDate() === dateRule.day, `${raw.id} has an impossible fixed date.`);
    } else {
      assert(dateRule?.type === 'relative', `${raw.id} requires a fixed or relative DateRule.`);
      assert(ALLOWED_ANCHORS.has(dateRule?.anchor), `${raw.id} uses unsupported anchor ${String(dateRule?.anchor)}.`);
      assert(Number.isInteger(dateRule?.offsetDays) && Math.abs(dateRule.offsetDays) <= 400, `${raw.id} has invalid offsetDays.`);
      assert(!('weekdayAdjustment' in dateRule), `${raw.id} bootstrap does not allow hidden weekday adjustments.`);
    }

    const canonicalKey = `${raw.churchId}\u0000${raw.observanceId}\u0000${JSON.stringify(dateRule)}`;
    assert(!canonicalKeys.has(canonicalKey), `${raw.id} duplicates canonical TemporalRule state.`);
    canonicalKeys.add(canonicalKey);

    const authorityDomains = new Set((church.authorityDomains ?? []).map((value) => String(value).toLowerCase().replace(/^www\./u, '')));
    assert(Array.isArray(raw.evidence) && raw.evidence.length > 0, `${raw.id} requires official rule evidence.`);
    const evidence = raw.evidence.map((item, index) => {
      assert(typeof item?.publisher === 'string' && item.publisher.trim(), `${raw.id} evidence ${index} requires publisher.`);
      assert(typeof item?.url === 'string' && item.url.startsWith('https://'), `${raw.id} evidence ${index} requires HTTPS URL.`);
      assert(authorityDomains.has(hostname(item.url)), `${raw.id} evidence ${index} is outside Church authority domains.`);
      assert(Array.isArray(item?.claimTypes) && item.claimTypes.includes('temporal-cycle-authority'), `${raw.id} evidence ${index} must support temporal-cycle-authority.`);
      return { publisher: item.publisher.trim(), url: item.url, claimTypes: sortedUnique(item.claimTypes.map(String)) };
    }).sort((a, b) => a.url.localeCompare(b.url));
    assert(/^\d{4}-\d{2}-\d{2}$/u.test(raw?.verifiedAt ?? ''), `${raw.id} has invalid verifiedAt.`);

    rules.push({
      schemaVersion: 1,
      temporalRuleId: raw.id,
      entityType: 'TemporalRule',
      churchId: raw.churchId,
      observanceId: raw.observanceId,
      calendarSystem: raw.calendarSystem,
      dateRule: structuredClone(dateRule),
      resolutionStatus: 'canonical-anchor',
      evidence,
      verifiedAt: raw.verifiedAt,
      deletionPolicy: 'tombstone-only'
    });
    churchCoverage.add(raw.churchId);
  }

  rules.sort((a, b) => a.temporalRuleId.localeCompare(b.temporalRuleId));
  const stablePayload = { schemaVersion: 1, artifactType: 'canonical-liturgical-temporal-rules', temporalRuleModelVersion: ruleDataset.temporalRuleModelVersion, rules };
  const rootSha256 = sha256(JSON.stringify(stablePayload));
  const releaseRoot = `/vault/canonical/temporal-rules/v1/releases/${rootSha256}`;
  const manifest = {
    schemaVersion: 1,
    artifactType: 'canonical-liturgical-temporal-rules',
    vaultLayer: 'canonical',
    temporalRuleModelVersion: ruleDataset.temporalRuleModelVersion,
    releaseId: `canonical-temporal-rules-v1-${rootSha256.slice(0, 16)}`,
    rootSha256,
    sourceDataset: 'data/canonical-temporal-rule-anchors.json',
    temporalObservanceDataset: 'data/canonical-temporal-observance-anchors.json',
    ecclesialContextDataset: 'data/canonical-ecclesial-context-anchors.json',
    temporalRuleCount: rules.length,
    churches: [...churchCoverage].sort(),
    runtimePublicationAllowed: false,
    productionMutationAllowed: false,
    immutableReleaseRoot: releaseRoot,
    currentPointerPath: '/vault/canonical/temporal-rules/v1/current.json',
    deletionPolicy: 'tombstone-only',
    semantics: {
      temporalRuleSeparateFromObservance: true,
      temporalRuleSeparateFromOccurrence: true,
      ruleContainsNoAnnualOccurrenceState: true,
      temporalRuleResolvesThroughSharedCalendarEngine: true,
      subjectlessTemporalObservanceSupported: true
    },
    files: { rules: 'temporal-rules.json' }
  };
  const buildReceipt = {
    schemaVersion: 1,
    artifactType: 'canonical-temporal-rule-build-receipt',
    rootSha256,
    releaseId: manifest.releaseId,
    sourceDataset: manifest.sourceDataset,
    sourceDatasetSha256: sha256(sourceBytes ?? JSON.stringify(ruleDataset)),
    sourceCommit: sourceCommit ?? null,
    generatedAt: generatedAt ?? null,
    immutableReleaseRoot: releaseRoot,
    canonicalPayloadProduced: true,
    publicationChanged: false,
    productionMutation: false,
    d1Changed: false
  };
  return { manifest, buildReceipt, rules, stablePayload };
}

async function main() {
  const output = argument('--output');
  if (!output) throw new Error('--output is required.');
  const [ruleBytes, observanceBytes, ecclesialBytes] = await Promise.all([
    readFile(ruleSourcePath, 'utf8'), readFile(observanceSourcePath, 'utf8'), readFile(ecclesialSourcePath, 'utf8')
  ]);
  const built = buildCanonicalTemporalRuleVaultRelease(JSON.parse(ruleBytes), JSON.parse(observanceBytes), JSON.parse(ecclesialBytes), {
    sourceBytes: ruleBytes, sourceCommit: process.env.GITHUB_SHA ?? null, generatedAt: new Date().toISOString()
  });
  const outputRoot = path.resolve(output);
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(built.manifest, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'temporal-rules.json'), `${JSON.stringify(built.rules, null, 2)}\n`, 'utf8'),
    writeFile(path.join(outputRoot, 'build-receipt.json'), `${JSON.stringify(built.buildReceipt, null, 2)}\n`, 'utf8')
  ]);
  process.stdout.write(`${JSON.stringify({ manifest: built.manifest, buildReceipt: built.buildReceipt }, null, 2)}\n`);
}

if (process.argv[1]?.endsWith('build-canonical-temporal-rule-manifest.mjs')) {
  main().catch((error) => { console.error(error); process.exit(1); });
}

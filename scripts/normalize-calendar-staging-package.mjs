import fs from 'node:fs';
import path from 'node:path';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const inputPath = argument('--input');
const outputPath = argument('--output');
const manifestSha256 = argument('--manifest-sha256');
const validationReportPath = argument('--validation-report-path');
if (!inputPath || !outputPath || !manifestSha256) {
  console.error('Usage: node scripts/normalize-calendar-staging-package.mjs --input <normalized.json> --output <canonical.json> --manifest-sha256 <sha256> [--validation-report-path <Dropbox path>]');
  process.exit(2);
}

const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
const errors = [];
const DROPBOX_ROOT = '/Santos do Dia/02_Dados_Eclesiasticos/';
const LOCALES = new Set(['en', 'es', 'pt', 'fr', 'fil', 'ru', 'sw', 'de', 'it', 'pl']);
const SOURCE_AUTHORITIES = new Set([
  'official-church', 'official-church-department', 'official-jurisdiction',
  'official-local-church', 'reference-engine', 'reference-directory', 'osint-corroboration'
]);
const POLICY_STATUSES = new Set(['provisional', 'cross-checked', 'verified', 'retired']);
const EVENT_STATUSES = new Set(['provisional', 'cross-checked', 'verified', 'rejected']);
const RULE_TYPES = new Set([
  'fixed-date', 'easter-offset', 'weekday-relative-to-fixed-date',
  'weekday-relative-to-easter', 'native-calendar-date',
  'annual-source-table', 'transfer-or-omission'
]);
const TRANSLATION_STATUSES = new Set(['source', 'reviewed', 'assisted', 'missing', 'rejected']);

function text(value, label, optional = false) {
  if (value === null || value === undefined) {
    if (optional) return null;
    errors.push(`${label} is required`);
    return '';
  }
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label} must be a non-empty string`);
    return '';
  }
  return value.trim();
}

function date(value, label) {
  const normalized = text(value, label);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  const parsed = match ? new Date(`${normalized}T00:00:00Z`) : null;
  if (!match || Number.isNaN(parsed?.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    errors.push(`${label} must be a real ISO date`);
  }
  return normalized;
}

function dateTime(value, label) {
  const normalized = text(value, label);
  if (Number.isNaN(new Date(normalized).getTime())) errors.push(`${label} must be an ISO date-time`);
  return normalized;
}

function hash(value, label) {
  const normalized = text(value, label);
  if (!/^[a-f0-9]{64}$/.test(normalized)) errors.push(`${label} must be a lowercase SHA-256`);
  return normalized;
}

function list(value, label) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  return value;
}

function slug(value) {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120) || 'item';
}

function canonicalAuthority(value, label) {
  if (!SOURCE_AUTHORITIES.has(value)) errors.push(`${label} has unsupported authority ${String(value)}`);
  return value === 'official-church-department' ? 'official-church' : value;
}

if (input?.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
const packageId = text(input?.packageId, 'packageId');
const run = input?.run ?? {};
const createdAt = dateTime(run.createdAt, 'run.createdAt');
const retrievedAt = dateTime(run.retrievedAt, 'run.retrievedAt');
const manifestPath = text(run.manifestPath, 'run.manifestPath');
if (!manifestPath.startsWith(DROPBOX_ROOT)) errors.push('run.manifestPath must be inside the approved Dropbox root');
if (validationReportPath && !validationReportPath.startsWith(DROPBOX_ROOT)) {
  errors.push('--validation-report-path must be inside the approved Dropbox root');
}
if (!['provisional', 'validated', 'rejected'].includes(run.status)) errors.push('run.status is invalid');
if (typeof run.publicationAllowed !== 'boolean') errors.push('run.publicationAllowed must be boolean');
if (typeof run.promotionAllowed !== 'boolean') errors.push('run.promotionAllowed must be boolean');
if (run.status !== 'validated' && (run.publicationAllowed || run.promotionAllowed)) {
  errors.push('Only a validated package may allow publication or promotion');
}
hash(manifestSha256, '--manifest-sha256');

const sourceIds = new Set();
const sources = list(input.sources, 'sources').map((item, index) => {
  const prefix = `sources[${index}]`;
  const id = text(item?.id, `${prefix}.id`);
  if (sourceIds.has(id)) errors.push(`Duplicate source id ${id}`);
  sourceIds.add(id);
  const url = text(item?.url, `${prefix}.url`);
  try { new URL(url); } catch { errors.push(`${prefix}.url must be absolute`); }
  hash(item?.factsSha256, `${prefix}.factsSha256`);
  return {
    id,
    churchId: text(item?.churchId, `${prefix}.churchId`),
    jurisdictionId: text(item?.jurisdictionId, `${prefix}.jurisdictionId`, true),
    name: text(item?.name, `${prefix}.name`, true) ?? id,
    url,
    authority: canonicalAuthority(item?.authority, `${prefix}.authority`),
    usagePolicy: text(item?.usagePolicy, `${prefix}.usagePolicy`, true) ?? 'Structured calendar facts only; raw source evidence is archived in Dropbox staging.',
    copyrightPolicy: text(item?.copyrightPolicy, `${prefix}.copyrightPolicy`, true),
    active: true
  };
});

const policyScopes = new Set();
const policies = list(input.policies, 'policies').map((item, index) => {
  const prefix = `policies[${index}]`;
  const churchId = text(item?.churchId, `${prefix}.churchId`);
  const jurisdictionId = text(item?.jurisdictionId, `${prefix}.jurisdictionId`, true);
  const engineId = text(item?.engineId, `${prefix}.engineId`);
  const sourceId = text(item?.sourceId, `${prefix}.sourceId`);
  if (!sourceIds.has(sourceId)) errors.push(`${prefix}.sourceId does not exist`);
  if (!POLICY_STATUSES.has(item?.validationStatus)) errors.push(`${prefix}.validationStatus is invalid`);
  const scope = `${churchId}|${jurisdictionId ?? ''}`;
  if (policyScopes.has(scope)) errors.push(`Duplicate policy scope ${scope}`);
  policyScopes.add(scope);
  return {
    id: text(item?.id, `${prefix}.id`, true) ?? `policy-${slug(churchId)}-${slug(jurisdictionId ?? 'global')}-${slug(engineId)}`,
    churchId,
    jurisdictionId,
    engineId,
    fixedDatePolicy: text(item?.fixedDatePolicy, `${prefix}.fixedDatePolicy`),
    calendarSystem: text(item?.calendarSystem, `${prefix}.calendarSystem`),
    effectiveFrom: null,
    effectiveTo: null,
    sourceId,
    validationStatus: item?.validationStatus
  };
});

function matchingPolicy(churchId, jurisdictionId, index) {
  const exact = policies.find(policy => policy.churchId === churchId && policy.jurisdictionId === jurisdictionId);
  const global = policies.find(policy => policy.churchId === churchId && policy.jurisdictionId === null);
  const policy = exact ?? global;
  if (!policy) errors.push(`events[${index}] has no matching calendar policy`);
  return policy;
}

const eventIds = new Set();
const rules = [];
const occurrences = [];
const labels = [];
for (const [index, item] of list(input.events, 'events').entries()) {
  const prefix = `events[${index}]`;
  const id = text(item?.id, `${prefix}.id`);
  if (eventIds.has(id)) errors.push(`Duplicate event id ${id}`);
  eventIds.add(id);
  const churchId = text(item?.churchId, `${prefix}.churchId`);
  const jurisdictionId = text(item?.jurisdictionId, `${prefix}.jurisdictionId`, true);
  const canonicalEventId = text(item?.canonicalEventId, `${prefix}.canonicalEventId`);
  const sourceId = text(item?.sourceId, `${prefix}.sourceId`);
  if (!sourceIds.has(sourceId)) errors.push(`${prefix}.sourceId does not exist`);
  const policy = matchingPolicy(churchId, jurisdictionId, index);
  const rule = item?.rule ?? {};
  if (!RULE_TYPES.has(rule.type)) errors.push(`${prefix}.rule.type is invalid`);
  if (!EVENT_STATUSES.has(item?.validationStatus)) errors.push(`${prefix}.validationStatus is invalid`);
  if (!['withheld', 'publishable'].includes(item?.publicationStatus)) errors.push(`${prefix}.publicationStatus is invalid`);
  if (item?.publicationStatus === 'publishable' && (
    run.status !== 'validated' || run.publicationAllowed !== true || run.promotionAllowed !== true
  )) {
    errors.push(`${prefix} requires a validated package with explicit publication and promotion approval`);
  }
  const ruleId = `rule-${slug(id)}`;
  const nativeDate = item?.nativeDate ?? null;
  rules.push({
    id: ruleId,
    churchId,
    jurisdictionId,
    canonicalEventId,
    ruleType: rule.type,
    calendarSystem: policy?.calendarSystem ?? 'unknown',
    anchorEventId: text(rule.anchorEventId, `${prefix}.rule.anchorEventId`, true),
    offsetDays: rule.offsetDays ?? null,
    month: rule.month ?? null,
    day: rule.day ?? null,
    nativeMonth: text(rule.nativeMonth, `${prefix}.rule.nativeMonth`, true),
    nativeDay: rule.nativeDay ?? null,
    weekdayRule: text(rule.weekdayRule, `${prefix}.rule.weekdayRule`, true),
    dateRangeStart: null,
    dateRangeEnd: null,
    effectiveFrom: null,
    effectiveTo: null,
    sourceId,
    validationStatus: item?.validationStatus
  });
  occurrences.push({
    id,
    churchId,
    jurisdictionId,
    canonicalEventId,
    dateIso: date(item?.dateISO, `${prefix}.dateISO`),
    endDateIso: item?.endDateISO ? date(item.endDateISO, `${prefix}.endDateISO`) : null,
    nativeCalendarSystem: text(nativeDate?.system, `${prefix}.nativeDate.system`, true),
    nativeYear: nativeDate?.year ?? null,
    nativeMonth: nativeDate?.month === null || nativeDate?.month === undefined ? null : String(nativeDate.month),
    nativeDay: nativeDate?.day ?? null,
    rankCode: text(item?.rankCode, `${prefix}.rankCode`, true),
    colourCode: text(item?.colourCode, `${prefix}.colourCode`, true),
    ruleId,
    sourceId,
    sourceRecordUrl: sources.find(source => source.id === sourceId)?.url ?? null,
    sourceRecordHash: hash(item?.sourceRecordHash, `${prefix}.sourceRecordHash`),
    validationStatus: item?.validationStatus,
    publicationStatus: item?.publicationStatus
  });

  const names = item?.names;
  if (!names || typeof names !== 'object' || Array.isArray(names)) {
    errors.push(`${prefix}.names must be an object`);
    continue;
  }
  for (const [locale, name] of Object.entries(names)) {
    if (!LOCALES.has(locale)) errors.push(`${prefix}.names.${locale} uses an unsupported locale`);
    if (!TRANSLATION_STATUSES.has(name?.status)) errors.push(`${prefix}.names.${locale}.status is invalid`);
    labels.push({
      occurrenceId: id,
      locale,
      name: text(name?.value, `${prefix}.names.${locale}.value`),
      description: null,
      translationStatus: name?.status,
      sourceLocale: text(name?.sourceLocale, `${prefix}.names.${locale}.sourceLocale`, true) ?? 'en'
    });
  }
}

if (errors.length) {
  console.error(`Normalized calendar package rejected with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const output = {
  schemaVersion: '1.0',
  run: {
    id: packageId,
    createdAt,
    retrievedAt,
    dropboxManifestPath: manifestPath,
    manifestSha256,
    status: run.status,
    validationReportPath: validationReportPath ?? null
  },
  sources,
  policies,
  rules,
  occurrences,
  labels
};
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Converted ${occurrences.length} occurrences and ${labels.length} labels to the canonical calendar staging contract.`);

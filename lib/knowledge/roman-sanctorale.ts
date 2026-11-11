import type { RomanAnnualCalendarCandidate } from './roman-annual-calendar';
import { romanPrecedenceLevelForClass, type RomanPrecedenceClassCode } from './roman-precedence';

export type RomanSanctoraleLiturgicalRank = 'solemnity' | 'feast' | 'obligatory-memorial' | 'optional-memorial';

export type RomanSanctoraleRule = {
  id: string;
  observanceId: string;
  scopeKey: string;
  dateRule: { type: 'fixed'; month: number; day: number };
  liturgicalRank: RomanSanctoraleLiturgicalRank;
  precedenceClass: RomanPrecedenceClassCode;
  isSolemnity: boolean;
  evidence: Array<{ publisher: string; url: string; claimTypes: string[] }>;
  verifiedAt: string;
};

export type RomanSanctoraleRuleDataset = {
  schemaVersion: 1;
  sanctoraleRuleModelVersion: '1.0';
  status: string;
  churchId: 'church:roman-catholic';
  calendarSystem: 'gregorian';
  rules: RomanSanctoraleRule[];
};

export type RomanSanctoraleJurisdictionPolicy = {
  id: string;
  jurisdictionId: string;
  inheritedScopeKeys: string[];
  scopeOrderSemantics: 'least-to-most-specific';
  overrideKey: 'observanceId';
  authorityDomains: string[];
};

export type RomanSanctoralePolicyDataset = {
  schemaVersion: 1;
  policyModelVersion: '1.0';
  status: string;
  churchId: 'church:roman-catholic';
  calendarSystem: 'gregorian';
  policies: RomanSanctoraleJurisdictionPolicy[];
};

export type RomanSanctoraleCandidate = RomanAnnualCalendarCandidate & {
  origin: 'sanctorale';
  ruleId: string;
  scopeKey: string;
  liturgicalRank: RomanSanctoraleLiturgicalRank;
};

export type RomanSanctoraleMaterialization = {
  modelVersion: '1.0';
  civilYear: number;
  policyId: string;
  jurisdictionId: string;
  selectedRuleIds: string[];
  candidates: RomanSanctoraleCandidate[];
  publicationAllowed: false;
};

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RangeError(`${label} must be an object.`);
}

function validHttpsUrl(value: string): boolean {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function validateFixedDate(month: number, day: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`Invalid Sanctorale month ${month}.`);
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new RangeError(`Invalid Sanctorale day ${day}.`);
  const probeYear = month === 2 && day === 29 ? 2024 : 2026;
  const probe = new Date(Date.UTC(probeYear, month - 1, day));
  if (probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) throw new RangeError(`Invalid fixed Sanctorale date ${month}-${day}.`);
}

function expectedSolemnity(rank: RomanSanctoraleLiturgicalRank): boolean {
  return rank === 'solemnity';
}

function hostnameMatchesAuthority(url: string, authorityDomains: Set<string>): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return [...authorityDomains].some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch { return false; }
}

function validateRule(rule: RomanSanctoraleRule, knownScopes: Set<string>, authorityDomains: Set<string>): void {
  if (!rule.id || rule.id.trim() !== rule.id) throw new RangeError('Sanctorale rule IDs must be non-empty and normalized.');
  if (!rule.observanceId || rule.observanceId.trim() !== rule.observanceId) throw new RangeError(`Rule ${rule.id} has an invalid observanceId.`);
  if (!knownScopes.has(rule.scopeKey)) throw new RangeError(`Rule ${rule.id} references unknown scope ${rule.scopeKey}.`);
  if (rule.dateRule?.type !== 'fixed') throw new RangeError(`Rule ${rule.id} must use a perennial fixed date rule in v1.`);
  validateFixedDate(rule.dateRule.month, rule.dateRule.day);
  const level = romanPrecedenceLevelForClass(rule.precedenceClass);
  if (rule.isSolemnity !== expectedSolemnity(rule.liturgicalRank)) throw new RangeError(`Rule ${rule.id} rank/solemnity flag mismatch.`);
  if (rule.isSolemnity && (level < 2 || level > 4)) throw new RangeError(`Rule ${rule.id} solemnity precedence is incompatible with level ${level}.`);
  if (!Array.isArray(rule.evidence) || rule.evidence.length === 0) throw new RangeError(`Rule ${rule.id} requires evidence.`);
  for (const evidence of rule.evidence) {
    if (!evidence.publisher || !validHttpsUrl(evidence.url) || !hostnameMatchesAuthority(evidence.url, authorityDomains) || !Array.isArray(evidence.claimTypes) || evidence.claimTypes.length === 0) {
      throw new RangeError(`Rule ${rule.id} has invalid evidence.`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(rule.verifiedAt)) throw new RangeError(`Rule ${rule.id} has invalid verifiedAt.`);
}

export function validateRomanSanctoraleInputs(
  dataset: RomanSanctoraleRuleDataset,
  policyDataset: RomanSanctoralePolicyDataset
): void {
  assertRecord(dataset, 'Roman Sanctorale dataset');
  assertRecord(policyDataset, 'Roman Sanctorale policy dataset');
  if (dataset.schemaVersion !== 1 || dataset.sanctoraleRuleModelVersion !== '1.0') throw new RangeError('Unsupported Roman Sanctorale rule model.');
  if (policyDataset.schemaVersion !== 1 || policyDataset.policyModelVersion !== '1.0') throw new RangeError('Unsupported Roman Sanctorale policy model.');
  if (dataset.churchId !== 'church:roman-catholic' || policyDataset.churchId !== dataset.churchId) throw new RangeError('Roman Sanctorale Church context mismatch.');
  if (dataset.calendarSystem !== 'gregorian' || policyDataset.calendarSystem !== dataset.calendarSystem) throw new RangeError('Roman Sanctorale calendar-system mismatch.');
  if (!Array.isArray(dataset.rules) || !Array.isArray(policyDataset.policies)) throw new RangeError('Roman Sanctorale rules and policies must be arrays.');

  const policyIds = new Set<string>();
  const jurisdictionIds = new Set<string>();
  const knownScopes = new Set<string>();
  const authorityDomainsByScope = new Map<string, Set<string>>();
  for (const policy of policyDataset.policies) {
    if (!policy.id || policyIds.has(policy.id)) throw new RangeError(`Duplicate or invalid Sanctorale policy ID ${policy.id}.`);
    policyIds.add(policy.id);
    if (!policy.jurisdictionId || jurisdictionIds.has(policy.jurisdictionId) || policy.scopeOrderSemantics !== 'least-to-most-specific' || policy.overrideKey !== 'observanceId') {
      throw new RangeError(`Policy ${policy.id} has invalid inheritance semantics or duplicate jurisdiction.`);
    }
    jurisdictionIds.add(policy.jurisdictionId);
    if (!Array.isArray(policy.inheritedScopeKeys) || policy.inheritedScopeKeys.length === 0 || new Set(policy.inheritedScopeKeys).size !== policy.inheritedScopeKeys.length) {
      throw new RangeError(`Policy ${policy.id} must define unique inherited scopes.`);
    }
    if (!Array.isArray(policy.authorityDomains) || policy.authorityDomains.length === 0 || policy.authorityDomains.some(domain => !/^[a-z0-9.-]+$/u.test(domain) || domain !== domain.toLowerCase())) {
      throw new RangeError(`Policy ${policy.id} requires normalized authority domains.`);
    }
    for (const scope of policy.inheritedScopeKeys) {
      knownScopes.add(scope);
      const domains = authorityDomainsByScope.get(scope) ?? new Set<string>();
      for (const domain of policy.authorityDomains) domains.add(domain);
      authorityDomainsByScope.set(scope, domains);
    }
  }

  const ruleIds = new Set<string>();
  const observanceScope = new Set<string>();
  for (const rule of dataset.rules) {
    validateRule(rule, knownScopes, authorityDomainsByScope.get(rule.scopeKey) ?? new Set());
    if (ruleIds.has(rule.id)) throw new RangeError(`Duplicate Sanctorale rule ID ${rule.id}.`);
    ruleIds.add(rule.id);
    const key = `${rule.observanceId}::${rule.scopeKey}`;
    if (observanceScope.has(key)) throw new RangeError(`Duplicate Sanctorale override slot ${key}.`);
    observanceScope.add(key);
  }
}

function isoForFixedRule(year: number, rule: RomanSanctoraleRule): string {
  if (!Number.isInteger(year) || year < 1583 || year > 4099) throw new RangeError('Sanctorale civil year must be between 1583 and 4099.');
  const { month, day } = rule.dateRule;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new RangeError(`Sanctorale rule ${rule.id} does not exist in civil year ${year}.`);
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function selectedRulesForPolicy(dataset: RomanSanctoraleRuleDataset, policy: RomanSanctoraleJurisdictionPolicy): RomanSanctoraleRule[] {
  const specificity = new Map(policy.inheritedScopeKeys.map((scope, index) => [scope, index]));
  const selected = new Map<string, RomanSanctoraleRule>();
  for (const rule of dataset.rules) {
    const index = specificity.get(rule.scopeKey);
    if (index === undefined) continue;
    const existing = selected.get(rule.observanceId);
    if (!existing || index > (specificity.get(existing.scopeKey) ?? -1)) selected.set(rule.observanceId, rule);
  }
  return [...selected.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function materializeRomanSanctoraleCandidates(
  civilYear: number,
  dataset: RomanSanctoraleRuleDataset,
  policyDataset: RomanSanctoralePolicyDataset,
  policyId: string
): RomanSanctoraleMaterialization {
  validateRomanSanctoraleInputs(dataset, policyDataset);
  const policy = policyDataset.policies.find(item => item.id === policyId);
  if (!policy) throw new RangeError(`Unknown Roman Sanctorale policy ${policyId}.`);
  const selectedRules = selectedRulesForPolicy(dataset, policy);
  const candidates = selectedRules.map(rule => ({
    id: `sanctorale:${rule.observanceId}:${policy.jurisdictionId}:${civilYear}`,
    dateISO: isoForFixedRule(civilYear, rule),
    origin: 'sanctorale' as const,
    observanceId: rule.observanceId,
    precedenceClass: rule.precedenceClass,
    isSolemnity: rule.isSolemnity,
    sourceIds: [rule.id],
    ruleId: rule.id,
    scopeKey: rule.scopeKey,
    liturgicalRank: rule.liturgicalRank
  }));
  return {
    modelVersion: '1.0',
    civilYear,
    policyId: policy.id,
    jurisdictionId: policy.jurisdictionId,
    selectedRuleIds: selectedRules.map(rule => rule.id),
    candidates,
    publicationAllowed: false
  };
}

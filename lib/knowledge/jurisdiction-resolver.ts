import { JURISDICTIONS } from '../../data/knowledge/jurisdictions';
import type { GeographicLevel, GeographicScope, Jurisdiction } from './model';

export type JurisdictionContext = {
  churchId: string;
  countryCode?: string;
  subdivisionCode?: string;
  cityCode?: string;
  siteCode?: string;
};

const SPECIFICITY: Record<GeographicLevel, number> = {
  global: 0,
  continent: 1,
  country: 2,
  subdivision: 3,
  city: 4,
  site: 5
};

function normalized(value?: string): string | undefined {
  return value?.trim().toUpperCase() || undefined;
}

function scopeMatches(scope: GeographicScope, context: JurisdictionContext): boolean {
  const code = normalized(scope.code);
  if (scope.level === 'global') return true;
  if (scope.level === 'country') return code === normalized(context.countryCode);
  if (scope.level === 'subdivision') return code === normalized(context.subdivisionCode);
  if (scope.level === 'city') return code === normalized(context.cityCode);
  if (scope.level === 'site') return code === normalized(context.siteCode);
  return false;
}

function jurisdictionMatches(jurisdiction: Jurisdiction, context: JurisdictionContext): boolean {
  if (jurisdiction.churchId !== context.churchId) return false;
  if (!jurisdiction.geography.length) return false;
  return jurisdiction.geography.some(scope => scopeMatches(scope, context));
}

function jurisdictionSpecificity(jurisdiction: Jurisdiction): number {
  return Math.max(...jurisdiction.geography.map(scope => SPECIFICITY[scope.level]));
}

export function applicableJurisdictions(context: JurisdictionContext): Jurisdiction[] {
  return JURISDICTIONS
    .filter(jurisdiction => jurisdictionMatches(jurisdiction, context))
    .sort((left, right) => jurisdictionSpecificity(left) - jurisdictionSpecificity(right));
}

export function mostSpecificJurisdiction(context: JurisdictionContext): Jurisdiction | undefined {
  return applicableJurisdictions(context).at(-1);
}

export function jurisdictionAncestors(jurisdiction: Jurisdiction): Jurisdiction[] {
  const ancestors: Jurisdiction[] = [];
  const seen = new Set<string>([jurisdiction.id]);
  let parentId = jurisdiction.parentJurisdictionId;

  while (parentId) {
    if (seen.has(parentId)) break;
    const parent = JURISDICTIONS.find(candidate => candidate.id === parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    seen.add(parent.id);
    parentId = parent.parentJurisdictionId;
  }

  return ancestors;
}

export function jurisdictionBreadcrumbs(jurisdiction: Jurisdiction): Jurisdiction[] {
  return [...jurisdictionAncestors(jurisdiction), jurisdiction];
}

import { CHURCHES } from '../../data/knowledge/churches';
import { JURISDICTIONS } from '../../data/knowledge/jurisdictions';

export type JurisdictionCheck = {
  id: string;
  passed: boolean;
  detail: string;
};

function cycleFrom(startId: string, parentById: Map<string, string | undefined>): string[] {
  const path: string[] = [];
  const seen = new Map<string, number>();
  let current: string | undefined = startId;

  while (current) {
    const previousIndex = seen.get(current);
    if (previousIndex !== undefined) return [...path.slice(previousIndex), current];
    seen.set(current, path.length);
    path.push(current);
    current = parentById.get(current);
  }

  return [];
}

export function jurisdictionHierarchyChecks(): JurisdictionCheck[] {
  const churchIds = new Set(CHURCHES.map(church => church.id));
  const jurisdictionIds = new Set(JURISDICTIONS.map(jurisdiction => jurisdiction.id));
  const duplicateIds = JURISDICTIONS
    .map(jurisdiction => jurisdiction.id)
    .filter((id, index, values) => values.indexOf(id) !== index);
  const missingChurches = JURISDICTIONS
    .filter(jurisdiction => !churchIds.has(jurisdiction.churchId))
    .map(jurisdiction => jurisdiction.id);
  const missingParents = JURISDICTIONS
    .filter(jurisdiction => jurisdiction.parentJurisdictionId && !jurisdictionIds.has(jurisdiction.parentJurisdictionId))
    .map(jurisdiction => jurisdiction.id);
  const churchByJurisdictionId = new Map(JURISDICTIONS.map(jurisdiction => [jurisdiction.id, jurisdiction.churchId]));
  const crossChurchParents = JURISDICTIONS
    .filter(jurisdiction => jurisdiction.parentJurisdictionId && churchByJurisdictionId.get(jurisdiction.parentJurisdictionId) !== jurisdiction.churchId)
    .map(jurisdiction => jurisdiction.id);
  const parentById = new Map(JURISDICTIONS.map(jurisdiction => [jurisdiction.id, jurisdiction.parentJurisdictionId]));
  const cycles = JURISDICTIONS
    .map(jurisdiction => cycleFrom(jurisdiction.id, parentById))
    .filter(cycle => cycle.length)
    .map(cycle => cycle.join(' -> '));
  const missingGeography = JURISDICTIONS.filter(jurisdiction => !jurisdiction.geography.length).map(jurisdiction => jurisdiction.id);

  return [
    {
      id: 'unique-jurisdiction-ids',
      passed: duplicateIds.length === 0,
      detail: duplicateIds.length ? `Duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}` : `${jurisdictionIds.size} unique jurisdiction IDs`
    },
    {
      id: 'known-church-references',
      passed: missingChurches.length === 0,
      detail: missingChurches.length ? `Unknown Church references: ${missingChurches.join(', ')}` : 'Every jurisdiction belongs to a known Church'
    },
    {
      id: 'known-parent-references',
      passed: missingParents.length === 0,
      detail: missingParents.length ? `Unknown parent references: ${missingParents.join(', ')}` : 'Every parent jurisdiction exists'
    },
    {
      id: 'same-church-parentage',
      passed: crossChurchParents.length === 0,
      detail: crossChurchParents.length ? `Cross-Church parentage: ${crossChurchParents.join(', ')}` : 'Parent and child jurisdictions belong to the same Church'
    },
    {
      id: 'acyclic-jurisdiction-tree',
      passed: cycles.length === 0,
      detail: cycles.length ? `Cycles: ${[...new Set(cycles)].join('; ')}` : 'No hierarchy cycles detected'
    },
    {
      id: 'geographic-scope-present',
      passed: missingGeography.length === 0,
      detail: missingGeography.length ? `Missing geography: ${missingGeography.join(', ')}` : 'Every jurisdiction has a geographic scope'
    }
  ];
}

export function jurisdictionHierarchyHealthy(): boolean {
  return jurisdictionHierarchyChecks().every(check => check.passed);
}

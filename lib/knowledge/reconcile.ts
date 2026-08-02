import type { IngestionCandidate, EntityMatch, ReconciliationResult } from './change-model';
import type { Jurisdiction, LocalizedField, Person } from './model';

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(?:saint|st|bishop|archbishop|cardinal|monsignor|mons|msgr|diocese|archdiocese|eparchy|patriarchate|the|of|de|da|do|dos|das)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(' ').filter(Boolean));
}

function jaccard(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

function fieldValues(field: LocalizedField): string[] {
  return [...new Set(Object.values(field.values).filter((value): value is string => Boolean(value?.trim())))];
}

function scoreName(query: string, candidates: string[]): { score: number; signals: string[] } {
  const normalizedQuery = normalize(query);
  let best = 0;
  const signals: string[] = [];

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) continue;
    if (normalizedCandidate === normalizedQuery) {
      best = Math.max(best, 1);
      signals.push('exact-normalized-name');
      continue;
    }
    if (normalizedCandidate.includes(normalizedQuery) || normalizedQuery.includes(normalizedCandidate)) {
      best = Math.max(best, 0.9);
      signals.push('contained-normalized-name');
    }
    const similarity = jaccard(normalizedQuery, normalizedCandidate);
    if (similarity >= 0.6) {
      best = Math.max(best, Math.min(0.88, 0.55 + similarity * 0.33));
      signals.push(`token-similarity:${similarity.toFixed(2)}`);
    }
  }

  return { score: Number(best.toFixed(3)), signals: [...new Set(signals)] };
}

function topMatches<T extends { id: string }>(queries: string[], entities: T[], names: (entity: T) => string[]): EntityMatch[] {
  const matches = entities.map(entity => {
    let best = { score: 0, signals: [] as string[] };
    for (const query of queries) {
      const result = scoreName(query, names(entity));
      if (result.score > best.score) best = result;
    }
    return { entityId: entity.id, score: best.score, signals: best.signals };
  });
  return matches.filter(match => match.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}

function uniqueStrongMatch(matches: EntityMatch[], threshold: number): boolean {
  if (!matches.length || matches[0].score < threshold) return false;
  return !matches[1] || matches[1].score < threshold - 0.12;
}

export function reconcileCandidate(
  candidate: IngestionCandidate,
  people: Person[],
  jurisdictions: Jurisdiction[]
): ReconciliationResult {
  const personMatches = topMatches(candidate.extractedPersonNames, people, person => [
    ...fieldValues(person.name),
    ...(person.aliases ? fieldValues(person.aliases) : [])
  ]);
  const jurisdictionMatches = topMatches(candidate.extractedJurisdictionNames, jurisdictions, jurisdiction => fieldValues(jurisdiction.name));
  const reasons = [...candidate.reasons];

  const supportedChange = candidate.changeTypes.length === 1 && candidate.changeTypes[0] !== 'other-official-change';
  const strongJurisdiction = uniqueStrongMatch(jurisdictionMatches, 0.94);
  const strongPerson = uniqueStrongMatch(personMatches, 0.96);
  const newPersonCandidate = candidate.extractedPersonNames.length === 1 && personMatches.every(match => match.score < 0.72);
  const officialSource = candidate.sourceId === 'holy-see-bulletin';

  if (!supportedChange) reasons.push('Automatic application requires one supported change type.');
  if (!strongJurisdiction) reasons.push('Jurisdiction match is not unique and authoritative enough.');
  if (!strongPerson && !newPersonCandidate) reasons.push('Person match is ambiguous.');
  if (!officialSource) reasons.push('Automatic application is restricted to configured official authority sources.');

  const canAutoApply =
    officialSource &&
    candidate.confidence === 'high' &&
    supportedChange &&
    strongJurisdiction &&
    (strongPerson || newPersonCandidate);

  return {
    candidateId: candidate.id,
    personMatches,
    jurisdictionMatches,
    decision: canAutoApply ? 'auto-apply' : candidate.changeTypes.length ? 'quarantine' : 'reject',
    reasons: [...new Set(reasons)]
  };
}

import type { IngestionCandidate, KnowledgeMutation, ReconciliationResult } from './change-model';
import type { EcclesiasticalOffice, Jurisdiction, LocalizedField, Person, SourceAssertion } from './model';

function slug(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96);
}

function sourceOnlyName(value: string, sourceId: string): LocalizedField {
  return {
    values: { en: value },
    quality: { en: 'source-only' },
    sourceIds: [sourceId]
  };
}

function officeType(candidate: IngestionCandidate): string {
  const text = `${candidate.heading} ${candidate.sourceText}`.toLowerCase();
  if (/apostolic administrator/.test(text)) return 'apostolic-administrator';
  if (/coadjutor bishop/.test(text)) return 'coadjutor-bishop';
  if (/auxiliary bishop/.test(text)) return 'auxiliary-bishop';
  if (/metropolitan archbishop/.test(text)) return 'metropolitan-archbishop';
  if (/apostolic nuncio/.test(text)) return 'apostolic-nuncio';
  if (/archbishop/.test(text)) return 'archbishop';
  if (/patriarch/.test(text)) return 'patriarch';
  if (/exarch/.test(text)) return 'exarch';
  if (/ordinary/.test(text)) return 'ordinary';
  if (/bishop/.test(text)) return 'bishop';
  return 'ecclesiastical-office';
}

function assertion(candidate: IngestionCandidate, subjectId: string, field: string, value: unknown): SourceAssertion {
  return {
    id: `assertion:${slug(candidate.id)}:${slug(subjectId)}:${slug(field)}`,
    subjectId,
    field,
    value,
    sourceId: candidate.sourceId,
    sourceUrl: candidate.sourceUrl,
    observedAt: candidate.discoveredAt,
    effectiveFrom: candidate.publishedAt,
    confidence: 'authoritative'
  };
}

export function buildAutomaticMutation(
  candidate: IngestionCandidate,
  reconciliation: ReconciliationResult,
  jurisdictions: Jurisdiction[],
  people: Person[]
): KnowledgeMutation | undefined {
  if (reconciliation.decision !== 'auto-apply') return undefined;
  if (candidate.changeTypes.length !== 1) return undefined;
  const changeType = candidate.changeTypes[0];
  if (changeType !== 'office-appointed' && changeType !== 'administrator-appointed') return undefined;
  if (candidate.extractedPersonNames.length !== 1) return undefined;

  const jurisdictionMatch = reconciliation.jurisdictionMatches[0];
  const jurisdiction = jurisdictions.find(item => item.id === jurisdictionMatch?.entityId);
  if (!jurisdiction || jurisdictionMatch.score < 0.94) return undefined;

  const matchedPerson = reconciliation.personMatches[0]?.score >= 0.96
    ? people.find(person => person.id === reconciliation.personMatches[0].entityId)
    : undefined;
  const personName = candidate.extractedPersonNames[0];
  const personId = matchedPerson?.id ?? `person:cleric:${slug(personName)}`;
  const newPerson: Person | undefined = matchedPerson ? undefined : {
    id: personId,
    entityType: 'cleric',
    name: sourceOnlyName(personName, candidate.sourceId),
    churchIds: [jurisdiction.churchId],
    sourceIds: [candidate.sourceId]
  };

  const announcedAt = candidate.publishedAt;
  const type = officeType(candidate);
  const office: EcclesiasticalOffice = {
    id: `office:${slug(jurisdiction.id)}:${slug(type)}:${slug(personId)}:${announcedAt ?? 'undated'}`,
    personId,
    jurisdictionId: jurisdiction.id,
    officeType: type,
    appointedAt: announcedAt,
    status: 'appointed',
    sourceIds: [candidate.sourceId]
  };
  const eventId = `event:${slug(candidate.id)}:${slug(changeType)}`;
  const sourceAssertions = [
    assertion(candidate, personId, 'name', personName),
    assertion(candidate, office.id, 'appointment', {
      officeType: type,
      jurisdictionId: jurisdiction.id,
      appointedAt: announcedAt
    })
  ];

  return {
    people: newPerson ? [newPerson] : undefined,
    offices: [office],
    events: [{
      id: eventId,
      type: changeType,
      effectiveAt: announcedAt,
      announcedAt,
      personId,
      jurisdictionId: jurisdiction.id,
      resultingOffice: office,
      sourceAssertions,
      status: 'active',
      createdAt: candidate.discoveredAt
    }]
  };
}

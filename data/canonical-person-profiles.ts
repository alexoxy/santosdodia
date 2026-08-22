import { localize, type Locale, type LocalizedText } from '../lib/i18n';
import { getPublicAllObservances } from '../lib/public-observances';
import personAnchorDataset from './canonical-person-anchors.json';
import type { Category, Observance } from './observances';

export type CanonicalPersonAnchor = {
  id: string;
  primaryObservanceId: string;
  category: Category;
  names: LocalizedText;
};

// The JSON dataset is the deterministic migration source for stable Person
// identity anchors. `primaryObservanceId` and `category` are legacy bridges
// only; the v2 canonical model keeps Person, Recognition and Observance apart.
export const CANONICAL_PERSON_ANCHORS = personAnchorDataset.people as CanonicalPersonAnchor[];

export function getCanonicalPersonAnchor(id: string) {
  return CANONICAL_PERSON_ANCHORS.find(person => person.id === id);
}

export function getCanonicalPeopleForObservance(observanceId: string) {
  return CANONICAL_PERSON_ANCHORS.filter(person => person.primaryObservanceId === observanceId);
}

export function canonicalPersonName(person: CanonicalPersonAnchor, locale: Locale) {
  return localize(person.names, locale);
}

export function getCanonicalPersonProfileObservance(id: string, year: number, locale: Locale): Observance | undefined {
  const person = getCanonicalPersonAnchor(id);
  if (!person) return undefined;
  const anchor = getPublicAllObservances(year, locale).find(item => item.id === person.primaryObservanceId);
  if (!anchor) return undefined;
  return {
    ...anchor,
    id: person.id,
    category: person.category,
    names: person.names,
    name: canonicalPersonName(person, locale),
    summaries: undefined,
    summarySourceIds: undefined,
    summaryTranslationStatus: undefined,
  };
}

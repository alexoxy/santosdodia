import { localize, type Locale, type LocalizedText } from '../lib/i18n';
import { getPublicAllObservances } from '../lib/public-observances';
import observanceAnchorDataset from './canonical-observance-anchors.json' with { type: 'json' };
import personAnchorDataset from './canonical-person-anchors.json' with { type: 'json' };
import sanctoraleRuleDataset from './canonical-roman-sanctorale-rule-anchors.json' with { type: 'json' };
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
  if (anchor) {
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

  // A biography may already have a reviewed canonical Person → Observance →
  // fixed Sanctorale rule chain even when its legacy public observance has not
  // been migrated into the hand-curated repository list. Materialising that
  // reviewed chain keeps an editorial profile reachable without inventing a
  // date, jurisdiction or identity from its prose.
  const canonicalObservance = observanceAnchorDataset.observances.find((item) =>
    item.churchId === 'church:roman-catholic' &&
    item.subjects.some((subject) => subject.kind === 'person' && subject.personId === person.id),
  );
  if (!canonicalObservance) return undefined;

  const fixedRule = sanctoraleRuleDataset.rules.find((rule) =>
    rule.observanceId === canonicalObservance.id && rule.dateRule.type === 'fixed',
  );
  if (!fixedRule || fixedRule.dateRule.type !== 'fixed') return undefined;

  return {
    id: person.id,
    month: fixedRule.dateRule.month,
    day: fixedRule.dateRule.day,
    traditions: ['roman-catholic'],
    category: person.category,
    calendarSystem: 'gregorian',
    names: person.names,
    countries: fixedRule.scopeKey === 'portugal' ? ['PT'] : undefined,
    sourceIds: fixedRule.evidence.map((entry) => entry.url),
    translationStatus: 'editorial',
    validationStatus: 'verified',
    lastVerified: fixedRule.verifiedAt,
    dateISO: `${year}-${String(fixedRule.dateRule.month).padStart(2, '0')}-${String(fixedRule.dateRule.day).padStart(2, '0')}`,
    name: canonicalPersonName(person, locale),
  };
}

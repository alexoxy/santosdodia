import { CHURCHES } from '../../data/knowledge/churches';
import { JURISDICTIONS } from '../../data/knowledge/jurisdictions';
import { ECCLESIASTICAL_PEOPLE } from '../../data/knowledge/ecclesiastical-state';
import type { Church, Jurisdiction, LocalizedField, Person } from './model';
import type { Locale } from '../i18n';

export function entitySlug(id: string): string {
  return id.split(':').slice(1).join('-');
}

export function churchPath(church: Church): string {
  return `/church/${entitySlug(church.id)}`;
}

export function jurisdictionPath(jurisdiction: Jurisdiction): string {
  return `/jurisdiction/${entitySlug(jurisdiction.id)}`;
}

export function personPath(person: Person): string {
  return `/leader/${entitySlug(person.id)}`;
}

export function churchBySlug(slug: string): Church | undefined {
  return CHURCHES.find(church => entitySlug(church.id) === slug);
}

export function jurisdictionBySlug(slug: string): Jurisdiction | undefined {
  return JURISDICTIONS.find(jurisdiction => entitySlug(jurisdiction.id) === slug);
}

export function personBySlug(slug: string): Person | undefined {
  return ECCLESIASTICAL_PEOPLE.find(person => entitySlug(person.id) === slug);
}

export function localizedFieldValue(field: LocalizedField, locale: Locale = 'en'): string {
  return field.values[locale] ?? field.values.en ?? Object.values(field.values).find(Boolean) ?? '';
}

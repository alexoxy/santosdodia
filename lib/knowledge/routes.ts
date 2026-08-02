import { CHURCHES } from '../../data/knowledge/churches';
import { JURISDICTIONS } from '../../data/knowledge/jurisdictions';
import type { Church, Jurisdiction, LocalizedField } from './model';
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

export function churchBySlug(slug: string): Church | undefined {
  return CHURCHES.find(church => entitySlug(church.id) === slug);
}

export function jurisdictionBySlug(slug: string): Jurisdiction | undefined {
  return JURISDICTIONS.find(jurisdiction => entitySlug(jurisdiction.id) === slug);
}

export function localizedFieldValue(field: LocalizedField, locale: Locale = 'en'): string {
  return field.values[locale] ?? field.values.en ?? Object.values(field.values).find(Boolean) ?? '';
}

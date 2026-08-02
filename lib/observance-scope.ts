import type { Locale } from './i18n';
import type { Observance } from '../data/observances';

const labels: Record<'universal'|'national'|'territorial'|'unspecified',Partial<Record<Locale,string>>> = {
 universal:{en:'Universal in this Church',pt:'Universal nesta Igreja',es:'Universal en esta Iglesia',fr:'Universelle dans cette Église'},
 national:{en:'Celebrated in this country',pt:'Celebrada neste país',es:'Celebrada en este país',fr:'Célébrée dans ce pays'},
 territorial:{en:'Territorial celebration',pt:'Celebração territorial',es:'Celebración territorial',fr:'Célébration territoriale'},
 unspecified:{en:'Scope not yet classified',pt:'Âmbito ainda não classificado',es:'Ámbito aún no clasificado',fr:'Portée pas encore classée'}
};

export type ObservanceScopeDisplay = {
  kind: 'universal'|'national'|'territorial'|'unspecified';
  label: string;
  countryCodes: string[];
};

function translated(kind: ObservanceScopeDisplay['kind'], locale: Locale): string {
  return labels[kind][locale] ?? labels[kind].en!;
}

function countryList(codes: string[], locale: Locale): string {
  try {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    return codes.map(code => names.of(code) ?? code).join(', ');
  } catch {
    return codes.join(', ');
  }
}

export function displayObservanceScope(item: Observance, locale: Locale, selectedCountry?: string): ObservanceScopeDisplay {
  const countries = [...new Set((item.countries ?? []).map(value => value.toUpperCase()))];
  if (countries.includes('GLOBAL')) {
    return { kind: 'universal', label: translated('universal', locale), countryCodes: countries };
  }

  const specific = countries.filter(value => value !== 'GLOBAL');
  if (!specific.length) {
    return { kind: 'unspecified', label: translated('unspecified', locale), countryCodes: [] };
  }

  if (selectedCountry && specific.includes(selectedCountry.toUpperCase())) {
    return { kind: 'national', label: translated('national', locale), countryCodes: specific };
  }

  return {
    kind: 'territorial',
    label: `${translated('territorial', locale)} · ${countryList(specific, locale)}`,
    countryCodes: specific
  };
}

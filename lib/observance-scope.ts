import type { Locale } from './i18n';
import type { Observance } from '../data/observances';

const labels: Record<'universal'|'national'|'territorial',Record<Locale,string>> = {
 universal:{
  en:'Universal in this Church',pt:'Universal nesta Igreja',es:'Universal en esta Iglesia',fr:'Universelle dans cette Église',
  it:'Universale in questa Chiesa',de:'In dieser Kirche universal',pl:'Powszechne w tym Kościele',ru:'Общецерковное празднование',
  fil:'Pangkalahatan sa Simbahang ito',sw:'Maadhimisho ya Kanisa hili kwa wote'
 },
 national:{
  en:'Celebrated in this country',pt:'Celebrada neste país',es:'Celebrada en este país',fr:'Célébrée dans ce pays',
  it:'Celebrata in questo Paese',de:'In diesem Land gefeiert',pl:'Obchodzone w tym kraju',ru:'Отмечается в этой стране',
  fil:'Ipinagdiriwang sa bansang ito',sw:'Huadhimishwa katika nchi hii'
 },
 territorial:{
  en:'Territorial celebration',pt:'Celebração territorial',es:'Celebración territorial',fr:'Célébration territoriale',
  it:'Celebrazione territoriale',de:'Territoriale Feier',pl:'Obchód terytorialny',ru:'Территориальное празднование',
  fil:'Pagdiriwang ayon sa teritoryo',sw:'Maadhimisho ya eneo'
 }
};

export type ObservanceScopeDisplay = {
  kind: 'universal'|'national'|'territorial'|'unspecified';
  label: string;
  countryCodes: string[];
};

function translated(kind: Exclude<ObservanceScopeDisplay['kind'],'unspecified'>, locale: Locale): string {
  return labels[kind][locale];
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
    return { kind: 'unspecified', label: '', countryCodes: [] };
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

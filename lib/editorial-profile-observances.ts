import { getCanonicalPersonAnchor, getCanonicalPersonProfileObservance } from '../data/canonical-person-profiles';
import type { Observance, ObservanceFilters } from '../data/observances';
import { SAINT_BIOGRAPHIES } from '../data/saint-biography-registry';
import { isSaintBiographyReadyForLaunchedLocales } from './editorial-profile-quality';
import type { Locale } from './i18n';

function matchesFilters(item: Observance, filters: ObservanceFilters) {
  if (filters.tradition && !item.traditions.includes(filters.tradition)) return false;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.country) {
    const country = filters.country.toUpperCase();
    if (item.countries?.length && !item.countries.includes(country) && !item.countries.includes('GLOBAL')) return false;
  }
  if (filters.patronage) {
    const needle = filters.patronage.toLowerCase();
    if (!item.patronages?.some(value => value.toLowerCase().includes(needle))) return false;
  }
  return true;
}

export function getIndexedEditorialProfileObservances(year: number, locale: Locale): Observance[] {
  return SAINT_BIOGRAPHIES
    .filter(isSaintBiographyReadyForLaunchedLocales)
    .map(profile => getCanonicalPersonProfileObservance(profile.id, year, locale))
    .filter((item): item is Observance => Boolean(item));
}

export function getEditorialProfileFallbackObservancesForDate(
  dateISO: string,
  locale: Locale,
  filters: ObservanceFilters,
  existing: Observance[],
): Observance[] {
  const year = Number(dateISO.slice(0, 4));
  if (!Number.isInteger(year)) return [];
  const existingIds = new Set(existing.map(item => item.id));

  return getIndexedEditorialProfileObservances(year, locale).filter(item => {
    if (item.dateISO !== dateISO || !matchesFilters(item, filters)) return false;
    const person = getCanonicalPersonAnchor(item.id);
    if (existingIds.has(item.id) || (person && existingIds.has(person.primaryObservanceId))) return false;
    return true;
  });
}

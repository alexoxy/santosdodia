import type { Locale } from './i18n';
import {
  getAllObservances,
  getMonthlyObservances,
  getObservancesForDate,
  searchObservances,
  type Observance,
  type ObservanceFilters
} from '../data/observances';
import { publicObservances } from './publication-policy';

export function getPublicAllObservances(
  year: number,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  return publicObservances(getAllObservances(year, locale, filters));
}

export function getPublicMonthlyObservances(
  year: number,
  monthIndex: number,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  return publicObservances(getMonthlyObservances(year, monthIndex, locale, filters));
}

export function getPublicObservancesForDate(
  dateISO: string,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  return publicObservances(getObservancesForDate(dateISO, locale, filters));
}

export function searchPublicObservances(
  query: string,
  year: number,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  return publicObservances(searchObservances(query, year, locale, filters));
}

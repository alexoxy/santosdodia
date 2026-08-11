import type { Locale } from './i18n';
import {
  getAllObservances,
  getMonthlyObservances,
  getObservancesForDate,
  searchObservances,
  type Observance,
  type ObservanceFilters
} from '../data/observances';
import { getPriorityObservances, getPriorityObservancesForDate } from '../data/priority-observances';
import { publicObservances } from './publication-policy';

function unique(items:Observance[]):Observance[]{
 const seen=new Map<string,Observance>();
 for(const item of items)seen.set(`${item.id}|${item.dateISO}`,item);
 return[...seen.values()];
}

function matchesQuery(item:Observance,query:string,locale:Locale){
 const needle=query.trim().toLocaleLowerCase(locale);if(!needle)return true;
 return[...Object.values(item.names),...Object.values(item.summaries??{}),...(item.patronages??[]),...(item.countries??[]),item.category,...item.traditions]
  .join(' ').toLocaleLowerCase(locale).includes(needle);
}

export function getPublicAllObservances(
  year: number,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  return publicObservances(unique([
    ...getAllObservances(year, locale, filters),
    ...getPriorityObservances(year, locale, filters)
  ])).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name,locale));
}

export function getPublicMonthlyObservances(
  year: number,
  monthIndex: number,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  const month=monthIndex+1;
  return publicObservances(unique([
    ...getMonthlyObservances(year, monthIndex, locale, filters),
    ...getPriorityObservances(year, locale, filters).filter(item=>item.month===month)
  ])).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name,locale));
}

export function getPublicObservancesForDate(
  dateISO: string,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  return publicObservances(unique([
    ...getObservancesForDate(dateISO, locale, filters),
    ...getPriorityObservancesForDate(dateISO, locale, filters)
  ]));
}

export function searchPublicObservances(
  query: string,
  year: number,
  locale: Locale = 'en',
  filters: ObservanceFilters = {}
): Observance[] {
  const priority=getPriorityObservances(year,locale,filters).filter(item=>matchesQuery(item,query,locale));
  return publicObservances(unique([
    ...searchObservances(query, year, locale, filters),
    ...priority
  ])).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name,locale));
}

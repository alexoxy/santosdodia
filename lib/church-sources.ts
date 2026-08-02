import type { Locale } from './i18n';
import { mergeObservances, type ObservanceFilters } from '../data/observances';
import { getLiveObservances } from './live-sources';
import { getExpandedChurchObservances } from './expanded-church-sources';
import { publicObservances } from './publication-policy';

export async function getChurchObservances(
  year:number,
  locale:Locale,
  filters:ObservanceFilters={},
  range:{month?:number;date?:string}={}
){
  const[core,expanded]=await Promise.all([
    getLiveObservances(year,locale,filters,range),
    getExpandedChurchObservances(year,locale,filters,range)
  ]);
  const merged=mergeObservances(core.data,expanded.data);
  return{
    data:publicObservances(merged),
    sourceHealth:[...core.sourceHealth,...expanded.sourceHealth]
  };
}

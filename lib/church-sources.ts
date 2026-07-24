import type { Locale } from './i18n';
import { mergeObservances, type ObservanceFilters } from '../data/observances';
import { getLiveObservances } from './live-sources';
import { getExpandedChurchObservances } from './expanded-church-sources';

export async function getChurchObservances(year:number,locale:Locale,filters:ObservanceFilters={},range:{month?:number;date?:string}={}){
 const[core,expanded]=await Promise.all([getLiveObservances(year,locale,filters,range),getExpandedChurchObservances(year,locale,filters,range)]);
 return{data:mergeObservances(core.data,expanded.data),sourceHealth:[...core.sourceHealth,...expanded.sourceHealth]}
}

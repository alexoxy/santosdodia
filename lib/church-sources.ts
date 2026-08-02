import type { Locale } from './i18n';
import { mergeObservances, type ObservanceFilters } from '../data/observances';
import { getLiveObservances } from './live-sources';
import { getExpandedChurchObservances } from './expanded-church-sources';
import { assessPublication } from './publication-policy';

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
  const assessments=merged.map(item=>({item,assessment:assessPublication(item)}));
  const data=assessments.filter(result=>result.assessment.publishable).map(result=>result.item);
  const reasons=assessments
    .filter(result=>!result.assessment.publishable)
    .reduce<Record<string,number>>((counts,result)=>{
      counts[result.assessment.reason]=(counts[result.assessment.reason]??0)+1;
      return counts;
    },{});
  return{
    data,
    sourceHealth:[...core.sourceHealth,...expanded.sourceHealth],
    publication:{
      received:merged.length,
      published:data.length,
      withheld:merged.length-data.length,
      reasons
    }
  };
}

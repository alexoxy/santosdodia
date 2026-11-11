import { localize, type Locale } from '../lib/i18n';
import type { Observance, ObservanceDefinition, ObservanceFilters } from './observances';

const DEFINITIONS:ObservanceDefinition[]=[
  {
    id:'clare-assisi',
    month:8,
    day:11,
    traditions:['roman-catholic'],
    category:'saint',
    calendarSystem:'gregorian',
    names:{
      en:'Saint Clare of Assisi',
      pt:'Santa Clara de Assis',
      es:'Santa Clara de Asís',
      fr:'Sainte Claire d’Assise',
      it:'Santa Chiara d’Assisi',
      de:'Heilige Klara von Assisi',
      pl:'Święta Klara z Asyżu',
      ru:'Святая Клара Ассизская',
      fil:'Santa Clara ng Assisi',
      sw:'Mtakatifu Clara wa Assisi'
    },
    summaries:{
      en:'Roman Catholic memorial of Saint Clare of Assisi, virgin and founder of the Poor Clares, observed on 11 August.',
      pt:'Memória católica romana de Santa Clara de Assis, virgem e fundadora das Clarissas, celebrada a 11 de agosto.',
      es:'Memoria católica romana de Santa Clara de Asís, virgen y fundadora de las Clarisas, celebrada el 11 de agosto.',
      fr:'Mémoire catholique romaine de sainte Claire d’Assise, vierge et fondatrice des Clarisses, célébrée le 11 août.',
      it:'Memoria cattolica romana di Santa Chiara d’Assisi, vergine e fondatrice delle Clarisse, celebrata l’11 agosto.'
    },
    countries:['GLOBAL'],
    sourceIds:['litcal-api'],
    summarySourceIds:['litcal-api'],
    translationStatus:'official-name',
    summaryTranslationStatus:'editorial',
    validationStatus:'verified',
    lastVerified:'2026-08-11'
  }
];

const pad=(value:number)=>String(value).padStart(2,'0');
const dateISO=(year:number,month:number,day:number)=>`${year}-${pad(month)}-${pad(day)}`;

function applies(item:ObservanceDefinition,filters:ObservanceFilters){
 if(filters.tradition&&!item.traditions.includes(filters.tradition))return false;
 if(filters.category&&item.category!==filters.category)return false;
 if(filters.country){const country=filters.country.toUpperCase();if(!item.countries?.includes(country)&&!item.countries?.includes('GLOBAL'))return false}
 if(filters.patronage){const needle=filters.patronage.toLowerCase();if(!item.patronages?.some(value=>value.toLowerCase().includes(needle)))return false}
 return true;
}

function materialize(item:ObservanceDefinition,year:number,locale:Locale):Observance{
 return{
  ...item,
  dateISO:dateISO(year,item.month,item.day),
  name:localize(item.names,locale),
  summary:item.summaries?.[locale]
 };
}

export function getPriorityObservances(year:number,locale:Locale='en',filters:ObservanceFilters={}):Observance[]{
 return DEFINITIONS.filter(item=>applies(item,filters)).map(item=>materialize(item,year,locale));
}

export function getPriorityObservancesForDate(date:string,locale:Locale='en',filters:ObservanceFilters={}):Observance[]{
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);if(!match)return[];
 const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
 return DEFINITIONS.filter(item=>item.month===month&&item.day===day&&applies(item,filters)).map(item=>materialize(item,year,locale));
}

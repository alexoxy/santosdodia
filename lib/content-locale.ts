import type { Locale, LocalizedText } from './i18n';

type SummarySource={
  summary?:string;
  summaries?:Partial<Record<Locale,string>>;
  names?:LocalizedText;
  name?:string;
  dateISO?:string;
};
export type LocalizedContent={text:string;language:Locale;isFallback:boolean};

function clean(value:string|undefined){return String(value??'').replace(/\s+/g,' ').trim()}

const generatedSummary:Record<Locale,(name:string,date:string)=>string>={
 en:(name,date)=>`Christian observance of ${name}, observed on ${date}.`,
 pt:(name,date)=>`Celebração cristã de ${name}, celebrada a ${date}.`,
 es:(name,date)=>`Celebración cristiana de ${name}, conmemorada el ${date}.`,
 fr:(name,date)=>`Célébration chrétienne de ${name}, commémorée le ${date}.`,
 it:(name,date)=>`Celebrazione cristiana di ${name}, commemorata il ${date}.`,
 de:(name,date)=>`Christlicher Gedenktag ${name}, begangen am ${date}.`,
 pl:(name,date)=>`Chrześcijańskie wspomnienie ${name}, obchodzone ${date}.`,
 ru:(name,date)=>`Христианское празднование: ${name}; отмечается ${date}.`,
 fil:(name,date)=>`Kristiyanong paggunita kay ${name}, ipinagdiriwang tuwing ${date}.`,
 sw:(name,date)=>`Maadhimisho ya Kikristo ya ${name}, huadhimishwa tarehe ${date}.`
};

function localizedDate(dateISO:string|undefined,locale:Locale){
 if(!dateISO||!/^\d{4}-\d{2}-\d{2}$/.test(dateISO))return'';
 try{return new Intl.DateTimeFormat(locale,{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(`${dateISO}T00:00:00Z`))}catch{return''}
}

export function localizedSummary(item:SummarySource,locale:Locale):LocalizedContent|undefined{
 const exact=clean(item.summaries?.[locale]);
 if(exact)return{text:exact,language:locale,isFallback:false};
 if(locale==='en'){
  const english=clean(item.summaries?.en??item.summary);
  return english?{text:english,language:'en',isFallback:false}:undefined;
 }
 const name=clean(item.names?.[locale]);
 const date=localizedDate(item.dateISO,locale);
 if(!name||!date)return undefined;
 return{text:generatedSummary[locale](name,date),language:locale,isFallback:true};
}

const fallbackLabels:Record<Locale,string>={
 en:'Generated from verified structured data',
 pt:'Resumo gerado a partir de dados estruturados verificados',
 es:'Resumen generado a partir de datos estructurados verificados',
 fr:'Résumé généré à partir de données structurées vérifiées',
 it:'Sintesi generata da dati strutturati verificati',
 de:'Zusammenfassung aus verifizierten strukturierten Daten',
 pl:'Opis wygenerowany ze zweryfikowanych danych strukturalnych',
 ru:'Краткое описание на основе проверенных структурированных данных',
 fil:'Buod na ginawa mula sa beripikadong nakabalangkas na datos',
 sw:'Muhtasari uliotokana na data zilizothibitishwa na kupangwa'
};
export function fallbackLanguageLabel(locale:Locale){return fallbackLabels[locale]}

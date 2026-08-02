import type { Locale } from './i18n';
import { localeCoverage } from './locale-coverage';

type SummarySource={summary?:string;summaries?:Partial<Record<Locale,string>>};
export type LocalizedContent={text:string;language:Locale;isFallback:boolean};

function clean(value:string|undefined){return String(value??'').replace(/\s+/g,' ').trim()}

export function localizedSummary(item:SummarySource,locale:Locale):LocalizedContent|undefined{
 const exact=clean(item.summaries?.[locale]);
 if(exact)return{text:exact,language:locale,isFallback:false};
 if(locale==='en'){
  const english=clean(item.summaries?.en??item.summary);
  return english?{text:english,language:'en',isFallback:false}:undefined;
 }
 if(localeCoverage(locale)==='beta'){
  const english=clean(item.summaries?.en??item.summary);
  return english?{text:english,language:'en',isFallback:true}:undefined;
 }
 return undefined;
}

const fallbackLabels:Record<Locale,string>={
 en:'English source text',pt:'Texto da fonte em inglês',es:'Texto de la fuente en inglés',fr:'Texte source en anglais',
 fil:'Teksto ng sanggunian sa Ingles',ru:'Исходный текст на английском',sw:'Maandishi ya chanzo kwa Kiingereza',
 de:'Englischer Quelltext',it:'Testo della fonte in inglese',pl:'Tekst źródłowy po angielsku'
};
export function fallbackLanguageLabel(locale:Locale){return fallbackLabels[locale]}

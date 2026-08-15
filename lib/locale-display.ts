import catalog from '../data/generated/translation-catalog.json';
import type { Locale, LocalizedText } from './i18n';
import { canonicalNameKey, isPublishableLocalizedName } from './language-quality';
import { normalizeDisplayLabel } from './linguistic/normalize-display-label.mjs';
import { localizeCalendarSystem, localizeObservanceName, localizePatronage } from './observance-localization';

type CatalogEntry={labels?:Partial<Record<Locale,string>>;qid?:string;confidence?:number;source?:string};
const entries=(catalog as {entries?:Record<string,CatalogEntry>}).entries??{};

const PT_WEEKDAYS:Record<string,string>={
 monday:'Segunda-feira',tuesday:'Terça-feira',wednesday:'Quarta-feira',thursday:'Quinta-feira',
 friday:'Sexta-feira',saturday:'Sábado',sunday:'Domingo'
};
const PT_SEASONS:Record<string,string>={
 'ordinary time':'Tempo Comum',advent:'Advento',christmas:'Tempo do Natal',lent:'Quaresma',easter:'Tempo Pascal'
};

function clean(value:string,locale:Locale){return normalizeDisplayLabel(value.normalize('NFC').replace(/\s+/g,' ').trim(),locale) as string}
function catalogLabel(source:string,locale:Locale){return entries[canonicalNameKey(source)]?.labels?.[locale]}
function structuredLiturgicalTitle(source:string,locale:Locale):string|undefined{
 if(locale!=='pt')return;
 const weekday=source.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) of the (\d+)(?:st|nd|rd|th) Week of (Ordinary Time|Advent|Christmas|Lent|Easter)$/i);
 if(weekday){
  const day=PT_WEEKDAYS[weekday[1].toLowerCase()],season=PT_SEASONS[weekday[3].toLowerCase()];
  if(day&&season)return`${day} da ${weekday[2]}.ª Semana do ${season}`;
 }
 const sunday=source.match(/^(\d+)(?:st|nd|rd|th) Sunday of (Ordinary Time|Advent|Christmas|Lent|Easter)$/i);
 if(sunday){
  const season=PT_SEASONS[sunday[2].toLowerCase()];
  if(season)return`${sunday[1]}.º Domingo do ${season}`;
 }
}

export function displayObservanceName(names:LocalizedText,locale:Locale,originalName?:string){
 const source=clean(names.en??originalName??names[locale]??'',locale);
 const structured=structuredLiturgicalTitle(source,locale);
 if(structured)return structured;
 const exact=clean(names[locale]??'',locale);
 if(exact&&isPublishableLocalizedName(exact,locale))return exact;
 const stored=clean(catalogLabel(source,locale)??'',locale);
 if(stored&&isPublishableLocalizedName(stored,locale))return stored;
 const generated=clean(localizeObservanceName(names,locale,originalName),locale);
 if(generated&&isPublishableLocalizedName(generated,locale))return generated;
 if(locale==='en'&&source&&isPublishableLocalizedName(source,'en'))return source;
 return'';
}

export function displayPatronages(values:string[]|undefined,locale:Locale){return(values??[]).map(value=>normalizeDisplayLabel(localizePatronage(value,locale),locale) as string).filter(Boolean)}
export function displayCalendarSystem(value:string,locale:Locale){return localizeCalendarSystem(value,locale)}

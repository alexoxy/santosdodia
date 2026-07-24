import catalog from '../data/generated/translation-catalog.json';
import type { Locale, LocalizedText } from './i18n';
import { canonicalNameKey, isPublishableLocalizedName } from './language-quality';
import { localizeCalendarSystem, localizeObservanceName, localizePatronage } from './observance-localization';

type CatalogEntry={labels?:Partial<Record<Locale,string>>;qid?:string;confidence?:number;source?:string};
const entries=(catalog as {entries?:Record<string,CatalogEntry>}).entries??{};

function clean(value:string){return value.normalize('NFC').replace(/\s+/g,' ').trim()}
function catalogLabel(source:string,locale:Locale){return entries[canonicalNameKey(source)]?.labels?.[locale]}

export function displayObservanceName(names:LocalizedText,locale:Locale,originalName?:string){
 const source=clean(names.en??originalName??names[locale]??'');
 const exact=clean(names[locale]??'');
 if(exact&&isPublishableLocalizedName(exact,locale))return exact;
 const stored=clean(catalogLabel(source,locale)??'');
 if(stored&&isPublishableLocalizedName(stored,locale))return stored;
 const generated=clean(localizeObservanceName(names,locale,originalName));
 if(generated&&isPublishableLocalizedName(generated,locale))return generated;
 if(locale==='en'&&source&&isPublishableLocalizedName(source,'en'))return source;
 return'';
}

export function displayPatronages(values:string[]|undefined,locale:Locale){return(values??[]).map(value=>localizePatronage(value,locale)).filter(Boolean)}
export function displayCalendarSystem(value:string,locale:Locale){return localizeCalendarSystem(value,locale)}

import type { Locale, LocalizedText } from './i18n';
import { localizeCalendarSystem, localizeObservanceName, localizePatronage } from './observance-localization';

export function displayObservanceName(names:LocalizedText,locale:Locale,originalName?:string){
 return localizeObservanceName(names,locale,originalName);
}
export function displayPatronages(values:string[]|undefined,locale:Locale){
 return (values??[]).map(value=>localizePatronage(value,locale));
}
export function displayCalendarSystem(value:string,locale:Locale){
 return localizeCalendarSystem(value,locale);
}

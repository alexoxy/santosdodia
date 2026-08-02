import type { Locale } from './i18n';

export type LocaleCoverage='complete';

export function localeCoverage(_locale:Locale):LocaleCoverage{
 return 'complete';
}

export function localeOptionLabel(_locale:Locale,label:string){
 return label;
}

export function localeCoverageNotice(_locale:Locale){
 return '';
}

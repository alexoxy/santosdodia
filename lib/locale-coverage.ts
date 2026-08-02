import type { Locale } from './i18n';

export type LocaleCoverage='complete'|'beta';

const COMPLETE_LOCALES=new Set<Locale>(['en','pt','es','fr']);

export function localeCoverage(locale:Locale):LocaleCoverage{
 return COMPLETE_LOCALES.has(locale)?'complete':'beta';
}

export function localeOptionLabel(locale:Locale,label:string){
 return localeCoverage(locale)==='complete'?label:`${label} · beta`;
}

const betaNotice:Partial<Record<Locale,string>>={
 fil:'Beta na wika: maaaring lumitaw sa Ingles ang ilang teksto at nilalaman.',
 ru:'Языковая бета-версия: некоторые элементы и материалы могут отображаться на английском языке.',
 sw:'Toleo la majaribio la lugha: baadhi ya maandishi na maudhui yanaweza kuonekana kwa Kiingereza.',
 de:'Sprach-Beta: Einige Texte und Inhalte können auf Englisch erscheinen.',
 it:'Lingua in beta: alcuni testi e contenuti possono apparire in inglese.',
 pl:'Wersja językowa beta: część tekstów i treści może być wyświetlana po angielsku.'
};

export function localeCoverageNotice(locale:Locale){
 return localeCoverage(locale)==='beta'
  ? betaNotice[locale]??'Language beta: some interface text and content may appear in English.'
  :'';
}

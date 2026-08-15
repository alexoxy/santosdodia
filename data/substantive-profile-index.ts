import { localize, type Locale, type LocalizedText } from '../lib/i18n';

export const DIRECT_SUBSTANTIVE_PROFILE_IDS = new Set([
  'anthony-lisbon','francis-assisi','clare-assisi','teresa-avila','nicholas',
  'anthony-great','joseph','george','mark-evangelist','james-greater','luke-evangelist','andrew-apostle','stephen-first-martyr',
  'basil-the-great','julian-norwich','prophet-elijah'
]);

type RelatedProfile = { id:string; names:LocalizedText };

const RELATED_PROFILES:Record<string,RelatedProfile[]>={
 'nativity-john-baptist':[{id:'john-baptist',names:{en:'Saint John the Baptist',pt:'São João Batista',es:'San Juan Bautista',it:'San Giovanni Battista'}}],
 'peter-paul':[
  {id:'peter-apostle',names:{en:'Saint Peter the Apostle',pt:'São Pedro Apóstolo',es:'San Pedro Apóstol',it:'San Pietro Apostolo'}},
  {id:'paul-apostle',names:{en:'Saint Paul the Apostle',pt:'São Paulo Apóstolo',es:'San Pablo Apóstol',it:'San Paolo Apostolo'}}
 ],
 'anne-joachim':[
  {id:'anne',names:{en:'Saint Anne',pt:'Santa Ana',es:'Santa Ana',it:'Sant’Anna'}},
  {id:'joachim',names:{en:'Saint Joachim',pt:'São Joaquim',es:'San Joaquín',it:'San Gioacchino'}}
 ],
 'constantine-helena':[
  {id:'constantine-great',names:{en:'Saint Constantine the Great',pt:'São Constantino Magno',es:'San Constantino el Grande',it:'San Costantino il Grande'}},
  {id:'helena',names:{en:'Saint Helena',pt:'Santa Helena',es:'Santa Elena',it:'Sant’Elena'}}
 ],
 'mina-coptic':[{id:'mina',names:{en:'Saint Mina the Martyr',pt:'São Mina, mártir',es:'San Mina, mártir',it:'San Mina, martire'}}]
};

export function relatedSubstantiveProfiles(observanceId:string,locale:Locale){
 return (RELATED_PROFILES[observanceId]??[]).map(profile=>({id:profile.id,name:localize(profile.names,locale)}));
}

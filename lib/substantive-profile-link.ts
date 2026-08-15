import type { Observance } from '../data/observances';
import { DIRECT_SUBSTANTIVE_PROFILE_IDS, relatedSubstantiveProfiles } from '../data/substantive-profile-index';
import type { Locale } from './i18n';
import { getExistingProfileId } from './runtime-profile-link';

export function getDirectSubstantiveProfileId(item:Observance,year:number,locale:Locale='en'){
 const existing=getExistingProfileId(item,year,locale);
 return existing&&DIRECT_SUBSTANTIVE_PROFILE_IDS.has(existing)?existing:null;
}

export function getRelatedSubstantiveProfiles(item:Pick<Observance,'id'>,locale:Locale='en'){
 return relatedSubstantiveProfiles(item.id,locale);
}

export function getSubstantiveProfileLinks(item:Observance,year:number,locale:Locale='en'){
 const existing=getExistingProfileId(item,year,locale);
 if(existing&&DIRECT_SUBSTANTIVE_PROFILE_IDS.has(existing))return[{id:existing,name:item.name,direct:true as const}];
 return relatedSubstantiveProfiles(existing??item.id,locale).map(profile=>({...profile,direct:false as const}));
}

export function substantiveDetailHref(item:Observance,year:number,locale:Locale,dateISO=item.dateISO){
 const direct=getDirectSubstantiveProfileId(item,year,locale);
 return direct
  ? `/saint/${encodeURIComponent(direct)}?date=${encodeURIComponent(dateISO)}`
  : `/day/${dateISO}#observance-${encodeURIComponent(item.id)}`;
}

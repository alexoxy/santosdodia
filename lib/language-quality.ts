import type { Locale } from './i18n';

const CYRILLIC=/[\u0400-\u052f]/u;
const GREEK=/[\u0370-\u03ff\u1f00-\u1fff]/u;
const ARMENIAN=/[\u0530-\u058f]/u;
const ARABIC_SYRIAC=/[\u0600-\u074f]/u;
const ETHIOPIC=/[\u1200-\u137f\u2c80-\u2cff]/u;
const LATIN=/[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]/u;
const LETTER=/\p{L}/u;

const FOREIGN_MARKERS:Partial<Record<Locale,RegExp[]>>={
 pt:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu,/\b(?:san|beato|beata|obispo|vescovo|martire|apostolo|vergine|notre-dame)\b/iu],
 es:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu,/\b(?:são|santo antónio|vescovo|martire|notre-dame)\b/iu],
 fr:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu,/\b(?:são|san|vescovo|martire|apóstol|obispo)\b/iu],
 fil:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu],
 sw:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu],
 de:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu,/\b(?:são|san|santa|vescovo|martire|obispo|notre-dame)\b/iu],
 it:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu,/\b(?:são|obispo|apóstol|notre-dame)\b/iu],
 pl:[/\b(?:saints?|st\.?|blessed|venerable|martyrs?|bishop|archbishop|pope|priest|apostles?|prophet|virgin|abbot|monk|hermit|evangelist|wonderworker|mother of god|our lady|of the|and)\b/iu,/\b(?:são|san|santa|vescovo|martire|obispo|notre-dame)\b/iu]
};

export type LanguageQuality={ok:boolean;reasons:string[]};

function normalized(value:string){return value.normalize('NFC').replace(/\s+/g,' ').trim()}

export function validateNameLanguage(value:string,locale:Locale):LanguageQuality{
 const text=normalized(value);const reasons:string[]=[];
 if(!text||!LETTER.test(text))reasons.push('empty-or-nonlexical');
 if(/[�]/u.test(text))reasons.push('replacement-character');
 if(locale==='ru'){
  if(GREEK.test(text)||ARMENIAN.test(text)||ARABIC_SYRIAC.test(text)||ETHIOPIC.test(text))reasons.push('foreign-script');
  if(LATIN.test(text)&&!CYRILLIC.test(text))reasons.push('latin-only-in-russian');
 }else if(CYRILLIC.test(text)||GREEK.test(text)||ARMENIAN.test(text)||ARABIC_SYRIAC.test(text)||ETHIOPIC.test(text))reasons.push('foreign-script');
 for(const pattern of FOREIGN_MARKERS[locale]??[])if(pattern.test(text)){reasons.push('foreign-liturgical-vocabulary');break}
 return{ok:reasons.length===0,reasons};
}

export function isPublishableLocalizedName(value:string,locale:Locale){return validateNameLanguage(value,locale).ok}

export function canonicalNameKey(value:string){return normalized(value).toLocaleLowerCase('en').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

export function materiallyLocalized(candidate:string,source:string,locale:Locale){
 if(locale==='en')return true;
 const a=normalized(candidate).toLocaleLowerCase(locale),b=normalized(source).toLocaleLowerCase('en');
 return a!==b;
}

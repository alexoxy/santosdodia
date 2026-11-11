const DEFAULT_LOCALE='en';

const PARTICLES={
  en:new Set(['a','an','and','at','by','for','from','in','of','on','or','the','to','with']),
  pt:new Set(['a','as','da','das','de','do','dos','e','em','na','nas','no','nos','o','os']),
  es:new Set(['a','al','de','del','el','la','las','los','y']),
  fr:new Set(['à','au','aux','de','des','du','et','la','le','les']),
  it:new Set(['a','al','alla','alle','con','da','dal','dalla','dalle','de','dei','del','della','delle','di','e','il','la','le','lo','nel','nella']),
  de:new Set(['am','an','auf','der','des','die','im','in','und','von','zu','zum','zur']),
  pl:new Set(['i','na','od','św','w','z','ze']),
  fil:new Set(['ang','at','kay','ng','ni','sa']),
  sw:new Set(['cha','la','na','wa','ya','za']),
  ru:new Set(['в','и','из','на','от','с'])
};

const FIXED_UPPER=new Set(['IHS','INRI','ICXC','OSB','OFM','SJ','OP']);
const ROMAN=/^[ivxlcdm]+$/i;

function localeCode(locale){
  const code=String(locale||DEFAULT_LOCALE).toLowerCase().split(/[-_]/)[0];
  return code==='fil'?'en':code;
}

function clean(value){
  return value.normalize('NFC').replace(/\s+/gu,' ').trim();
}

function casedLetters(value,locale){
  const code=localeCode(locale),letters=[];
  for(const character of value){
    const lower=character.toLocaleLowerCase(code),upper=character.toLocaleUpperCase(code);
    if(lower!==upper)letters.push({character,lower,upper});
  }
  return letters;
}

function isShouty(value,locale){
  const letters=casedLetters(value,locale);
  if(letters.length<2)return false;
  let upper=0,lower=0;
  for(const letter of letters){
    if(letter.character===letter.upper)upper+=1;
    if(letter.character===letter.lower)lower+=1;
  }
  return upper>=2&&upper/letters.length>=0.9&&lower/letters.length<=0.1;
}

function capitalizeWord(word,locale){
  const code=localeCode(locale),lower=word.toLocaleLowerCase(code);
  return lower.replace(/^([^\p{L}]*)(\p{L})/u,(_,prefix,letter)=>`${prefix}${letter.toLocaleUpperCase(code)}`);
}

function normalizeWord(raw,index,locale){
  const code=localeCode(locale),plain=raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
  if(!plain)return raw;
  const upper=plain.toLocaleUpperCase(code);
  if(FIXED_UPPER.has(upper)||ROMAN.test(plain))return raw.replace(plain,upper);
  const lower=plain.toLocaleLowerCase(code),particles=PARTICLES[code]??PARTICLES.en;
  const normalized=index>0&&particles.has(lower)?lower:capitalizeWord(lower,code);
  return raw.replace(plain,normalized);
}

function titleCase(value,locale){
  let index=0;
  return value.split(/(\s+)/u).map(part=>{
    if(/^\s+$/u.test(part))return part;
    const result=normalizeWord(part,index,locale);
    if(/[\p{L}\p{N}]/u.test(part))index+=1;
    return result;
  }).join('');
}

function sentenceCaseSegment(value,locale){
  const code=localeCode(locale),lower=value.toLocaleLowerCase(code);
  let capitalized=false;
  return lower.replace(/\p{L}+/gu,word=>{
    const upper=word.toLocaleUpperCase(code);
    if(FIXED_UPPER.has(upper)||ROMAN.test(word))return upper;
    if(!capitalized){capitalized=true;return capitalizeWord(word,code)}
    return word;
  });
}

function sentenceCase(value,locale){
  return value.split(/([:;–—]\s*)/u).map((part,index)=>index%2?part:sentenceCaseSegment(part,locale)).join('');
}

export function normalizeDisplayLabel(value,locale=DEFAULT_LOCALE){
  if(typeof value!=='string')return value;
  const normalized=clean(value);
  if(!normalized||!isShouty(normalized,locale))return normalized;
  return /[:;–—]/u.test(normalized)?sentenceCase(normalized,locale):titleCase(normalized,locale);
}

export function normalizeDisplaySentence(value,locale=DEFAULT_LOCALE){
  if(typeof value!=='string')return value;
  const normalized=clean(value);
  if(!normalized||!isShouty(normalized,locale))return normalized;
  const code=localeCode(locale),lower=normalized.toLocaleLowerCase(code);
  let atStart=true;
  return lower.replace(/\p{L}+/gu,(word,offset,source)=>{
    const upper=word.toLocaleUpperCase(code);
    if(FIXED_UPPER.has(upper)||ROMAN.test(word))return upper;
    const before=source.slice(0,offset);
    atStart=offset===0||/[.!?]\s*$/u.test(before);
    return atStart?capitalizeWord(word,code):word;
  });
}

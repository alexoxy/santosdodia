import type { Locale, LocalizedText } from './i18n';
import { displayObservanceName } from './locale-display';
import type { LitcalDayResult, LitcalEvent } from './litcal-mirror';

const COLORS:Record<string,Partial<Record<Locale,string>>>={
 white:{es:'blanco',pt:'branco',fr:'blanc',fil:'puti',ru:'белый',sw:'nyeupe',de:'weiß',it:'bianco',pl:'biały'},red:{es:'rojo',pt:'vermelho',fr:'rouge',fil:'pula',ru:'красный',sw:'nyekundu',de:'rot',it:'rosso',pl:'czerwony'},green:{es:'verde',pt:'verde',fr:'vert',fil:'berde',ru:'зелёный',sw:'kijani',de:'grün',it:'verde',pl:'zielony'},purple:{es:'morado',pt:'roxo',fr:'violet',fil:'lila',ru:'фиолетовый',sw:'zambarau',de:'violett',it:'viola',pl:'fioletowy'},violet:{es:'morado',pt:'roxo',fr:'violet',fil:'lila',ru:'фиолетовый',sw:'zambarau',de:'violett',it:'viola',pl:'fioletowy'},rose:{es:'rosa',pt:'rosa',fr:'rose',fil:'rosas',ru:'розовый',sw:'waridi',de:'rosa',it:'rosa',pl:'różowy'},black:{es:'negro',pt:'preto',fr:'noir',fil:'itim',ru:'чёрный',sw:'nyeusi',de:'schwarz',it:'nero',pl:'czarny'},gold:{es:'dorado',pt:'dourado',fr:'doré',fil:'ginto',ru:'золотой',sw:'dhahabu',de:'gold',it:'oro',pl:'złoty'}
};
const GRADES:Record<string,Partial<Record<Locale,string>>>={
 weekday:{es:'feria',pt:'dia ferial',fr:'férie',fil:'karaniwang araw',ru:'будний день',sw:'siku ya kawaida',de:'Wochentag',it:'feria',pl:'dzień powszedni'},commemoration:{es:'conmemoración',pt:'comemoração',fr:'commémoration',fil:'paggunita',ru:'воспоминание',sw:'ukumbusho',de:'Kommemoration',it:'commemorazione',pl:'wspomnienie'},'optional memorial':{es:'memoria libre',pt:'memória facultativa',fr:'mémoire facultative',fil:'malayang paggunita',ru:'необязательная память',sw:'kumbukumbu ya hiari',de:'nichtgebotener Gedenktag',it:'memoria facoltativa',pl:'wspomnienie dowolne'},memorial:{es:'memoria',pt:'memória',fr:'mémoire',fil:'paggunita',ru:'память',sw:'kumbukumbu',de:'Gedenktag',it:'memoria',pl:'wspomnienie'},feast:{es:'fiesta',pt:'festa',fr:'fête',fil:'kapistahan',ru:'праздник',sw:'sikukuu',de:'Fest',it:'festa',pl:'święto'},solemnity:{es:'solemnidad',pt:'solenidade',fr:'solennité',fil:'dakilang kapistahan',ru:'торжество',sw:'sherehe kuu',de:'Hochfest',it:'solennità',pl:'uroczystość'}
};
const SEASONS:Record<string,Partial<Record<Locale,string>>>={
 advent:{es:'Adviento',pt:'Advento',fr:'Avent',fil:'Adbiyento',ru:'Адвент',sw:'Majilio',de:'Advent',it:'Avvento',pl:'Adwent'},christmas:{es:'Navidad',pt:'Natal',fr:'Noël',fil:'Pasko',ru:'Рождественское время',sw:'Noeli',de:'Weihnachtszeit',it:'Natale',pl:'Okres Narodzenia Pańskiego'},lent:{es:'Cuaresma',pt:'Quaresma',fr:'Carême',fil:'Kuwaresma',ru:'Великий пост',sw:'Kwaresima',de:'Fastenzeit',it:'Quaresima',pl:'Wielki Post'},triduum:{es:'Triduo Pascual',pt:'Tríduo Pascal',fr:'Triduum pascal',fil:'Triduum ng Pasko ng Pagkabuhay',ru:'Пасхальное триденствие',sw:'Siku Tatu za Pasaka',de:'Österliches Triduum',it:'Triduo pasquale',pl:'Triduum Paschalne'},easter:{es:'Pascua',pt:'Páscoa',fr:'Temps pascal',fil:'Pasko ng Pagkabuhay',ru:'Пасхальное время',sw:'Pasaka',de:'Osterzeit',it:'Tempo di Pasqua',pl:'Okres Wielkanocny'},'ordinary time':{es:'Tiempo ordinario',pt:'Tempo Comum',fr:'Temps ordinaire',fil:'Karaniwang Panahon',ru:'Рядовое время',sw:'Kipindi cha Mwaka',de:'Zeit im Jahreskreis',it:'Tempo ordinario',pl:'Okres zwykły'}
};

function canonical(value:string){return value.toLowerCase().trim().replace(/[_-]+/g,' ').replace(/\s+/g,' ')}
function mapped(value:string|undefined,locale:Locale,table:Record<string,Partial<Record<Locale,string>>>){if(!value)return value;const key=canonical(value);return table[key]?.[locale]??value}
function localizeArray(value:string|string[]|undefined,locale:Locale,table:Record<string,Partial<Record<Locale,string>>>):string|string[]|undefined{return Array.isArray(value)?value.map(item=>mapped(item,locale,table)??item):mapped(value,locale,table)}
function names(name:string):LocalizedText{return{en:name}}
function localizeEvent(event:LitcalEvent,locale:Locale):LitcalEvent{return{...event,name:displayObservanceName(names(event.name),locale,event.name),grade:mapped(event.grade,locale,GRADES),colour:localizeArray(event.colour,locale,COLORS),season:mapped(event.season,locale,SEASONS),common:Array.isArray(event.common)?event.common.map(value=>displayObservanceName(names(value),locale,value)):event.common?displayObservanceName(names(event.common),locale,event.common):undefined}}

export function localizeLitcalDay(result:LitcalDayResult,locale:Locale):LitcalDayResult{
 const sourceSupportsLocale=!['fil','sw'].includes(locale);
 return{...result,events:result.events.map(event=>localizeEvent(event,locale)),messages:sourceSupportsLocale?result.messages:[]};
}

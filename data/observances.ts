import type { Locale, LocalizedText, UiCopy } from '../lib/i18n';
import { localize } from '../lib/i18n';

export const TRADITIONS = [
  'roman-catholic','greek-orthodox','eastern-orthodox','anglican',
  'coptic-orthodox','armenian-apostolic','ethiopian-orthodox','syriac-orthodox'
] as const;
export type Tradition = (typeof TRADITIONS)[number];
export const TRADITION_LABEL_KEYS:Record<Tradition,keyof UiCopy>={
  'roman-catholic':'romanCatholic','greek-orthodox':'greekOrthodox','eastern-orthodox':'easternOrthodox',
  anglican:'anglican','coptic-orthodox':'copticOrthodox','armenian-apostolic':'armenianApostolic',
  'ethiopian-orthodox':'ethiopianOrthodox','syriac-orthodox':'syriacOrthodox'
};
export function traditionLabel(copy:UiCopy,tradition:Tradition){return copy[TRADITION_LABEL_KEYS[tradition]]}
export function traditionClass(tradition:Tradition){return `tradition-${tradition.replaceAll('-','_')}`}

export const CATEGORIES=['saint','feast','marian','apostle','martyr','fast'] as const;
export type Category=(typeof CATEGORIES)[number];
export type CalendarSystem='gregorian'|'julian'|'revised-julian'|'coptic'|'ethiopian'|'armenian'|'mixed';
export type SourceKind='official'|'scholarly'|'reference'|'aggregator';
export type ValidationStatus='verified'|'cross-checked'|'review-required'|'imported';
export type SourceRecord={
 id:string;name:string;url:string;kind:SourceKind;traditions:Tradition[];note:string;
 updateMode:'api'|'ics'|'html-monitor'|'manual';authority:string;licenseNote?:string
};
export type ObservanceDefinition={
 id:string;month:number;day:number;traditions:Tradition[];category:Category;calendarSystem:CalendarSystem;
 names:LocalizedText;summaries?:Partial<Record<Locale,string>>;patronages?:string[];countries?:string[];
 sourceIds:string[];translationStatus:'editorial'|'assisted'|'official-name'|'source';
 validationStatus:ValidationStatus;lastVerified?:string;externalId?:string
};
export type Observance=ObservanceDefinition&{dateISO:string;name:string;summary?:string};
export type ObservanceFilters={tradition?:Tradition;category?:Category;country?:string;patronage?:string};

export const SOURCE_CATALOG:SourceRecord[]=[
 {id:'vatican-ddw',name:'Holy See — Dicastery for Divine Worship',url:'https://www.vatican.va/content/romancuria/en/dicasteri/dicastero-culto-divino-e-disciplina-sacramenti/documenti.html',kind:'official',traditions:['roman-catholic'],note:'Decrees and changes to the General Roman Calendar.',updateMode:'html-monitor',authority:'Holy See'},
 {id:'litcal-api',name:'Liturgical Calendar API',url:'https://litcal.johnromanodorazio.com/',kind:'scholarly',traditions:['roman-catholic'],note:'Machine-readable Roman Calendar derived from Roman Missals and Dicastery decrees, with a public validator.',updateMode:'api',authority:'Open-source project led by a priest of the Diocese of Rome',licenseNote:'Open-source; source metadata retained.'},
 {id:'oca-lives',name:'Orthodox Church in America — Lives of the Saints',url:'https://www.oca.org/saints/lives',kind:'official',traditions:['eastern-orthodox'],note:'Daily Orthodox commemorations and lives of saints.',updateMode:'html-monitor',authority:'Orthodox Church in America'},
 {id:'goarch-planner',name:'Greek Orthodox Archdiocese — Digital Planner',url:'https://www.goarch.org/chapel/planner',kind:'official',traditions:['greek-orthodox'],note:'Saints, feasts, readings and fasting calendars in English and Greek ICS.',updateMode:'ics',authority:'Greek Orthodox Archdiocese of America'},
 {id:'orthodox-range-api',name:'Orthodox Calendar API',url:'https://api.ispovednik.org/docs/en/endpoints/saints-range',kind:'aggregator',traditions:['eastern-orthodox'],note:'Range API used for discovery; records require cross-checking against OCA or GOARCH.',updateMode:'api',authority:'Independent open calendar service'},
 {id:'cofe-calendar',name:'Church of England — Common Worship Calendar',url:'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/calendar',kind:'official',traditions:['anglican'],note:'Principal feasts, festivals, lesser festivals and commemorations.',updateMode:'html-monitor',authority:'Church of England'},
 {id:'cofe-lesser',name:'Church of England — Lesser Festivals',url:'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/lesser-festivals',kind:'official',traditions:['anglican'],note:'Official lesser festivals and commemorations.',updateMode:'html-monitor',authority:'Church of England'},
 {id:'suscopts-synaxarium',name:'Coptic Orthodox Diocese of the Southern United States — Synaxarium',url:'https://suscopts.org/readings/',kind:'official',traditions:['coptic-orthodox'],note:'Daily Coptic readings and Synaxarium.',updateMode:'html-monitor',authority:'Coptic Orthodox Diocese of the Southern United States'},
 {id:'sttakla-synaxarium',name:'St-Takla — Coptic Synaxarium',url:'https://st-takla.org/books/en/church/synaxarium/index.html',kind:'reference',traditions:['coptic-orthodox'],note:'Structured daily Coptic Synaxarium used only as a secondary cross-check.',updateMode:'html-monitor',authority:'St-Takla Haymanout Coptic Orthodox resource'},
 {id:'armenian-mother-see',name:'Mother See of Holy Etchmiadzin — Liturgical Calendar',url:'https://www.armenianchurch.org/en',kind:'official',traditions:['armenian-apostolic'],note:'Official Armenian Apostolic liturgical calendar and feast announcements.',updateMode:'html-monitor',authority:'Mother See of Holy Etchmiadzin'},
 {id:'ethiopian-church',name:'Ethiopian Orthodox Tewahedo Church calendar references',url:'https://www.ethiopianorthodox.org/',kind:'official',traditions:['ethiopian-orthodox'],note:'Church reference pages; entries remain review-gated until confirmed.',updateMode:'manual',authority:'Ethiopian Orthodox Tewahedo Church'},
 {id:'syriac-patriarchate',name:'Syriac Orthodox Patriarchate',url:'https://syriacpatriarchate.org/',kind:'official',traditions:['syriac-orthodox'],note:'Patriarchal feast and saint references; entries remain review-gated until confirmed.',updateMode:'html-monitor',authority:'Syriac Orthodox Patriarchate of Antioch'}
];

const RC=['roman-catholic'] as Tradition[],GO=['greek-orthodox'] as Tradition[],EO=['eastern-orthodox'] as Tradition[];
const AN=['anglican'] as Tradition[],CO=['coptic-orthodox'] as Tradition[],AR=['armenian-apostolic'] as Tradition[];
const ET=['ethiopian-orthodox'] as Tradition[],SY=['syriac-orthodox'] as Tradition[];
const WEST=['roman-catholic','anglican'] as Tradition[],BYZ=['greek-orthodox','eastern-orthodox'] as Tradition[];

function entry(
 id:string,month:number,day:number,traditions:Tradition[],category:Category,calendarSystem:CalendarSystem,
 names:LocalizedText,sourceIds:string[],extra:Partial<ObservanceDefinition>={}
):ObservanceDefinition{
 return {id,month,day,traditions,category,calendarSystem,names,sourceIds,translationStatus:'official-name',validationStatus:'cross-checked',...extra};
}

const D:ObservanceDefinition[]=[
 entry('mary-mother-of-god',1,1,RC,'marian','gregorian',{en:'Mary, Mother of God',pt:'Santa Maria, Mãe de Deus',es:'Santa María, Madre de Dios',fr:'Sainte Marie, Mère de Dieu',it:'Maria Santissima Madre di Dio',de:'Hochfest der Gottesmutter Maria',pl:'Świętej Bożej Rodzicielki Maryi'},['vatican-ddw','litcal-api'],{countries:['GLOBAL']}),
 entry('naming-circumcision-jesus',1,1,AN,'feast','gregorian',{en:'The Naming and Circumcision of Jesus',pt:'Nome e Circuncisão de Jesus',es:'Nombre y Circuncisión de Jesús'},['cofe-calendar'],{countries:['GB','GLOBAL'],validationStatus:'verified'}),
 entry('basil-the-great',1,1,BYZ,'saint','mixed',{en:'Saint Basil the Great',pt:'São Basílio Magno',es:'San Basilio Magno',ru:'Святитель Василий Великий'},['oca-lives','goarch-planner'],{patronages:['monasticism','education'],countries:['GLOBAL']}),
 entry('nativity-armenia',1,6,AR,'feast','armenian',{en:'Nativity and Theophany of Jesus Christ',pt:'Natividade e Teofania de Jesus Cristo'},['armenian-mother-see'],{countries:['AM','GLOBAL'],validationStatus:'verified'}),
 entry('epiphany',1,6,WEST,'feast','gregorian',{en:'Epiphany of the Lord',pt:'Epifania do Senhor',es:'Epifanía del Señor',fr:'Épiphanie du Seigneur',it:'Epifania del Signore',de:'Erscheinung des Herrn',pl:'Objawienie Pańskie'},['vatican-ddw','litcal-api','cofe-calendar'],{countries:['GLOBAL']}),
 entry('nativity-julian',1,7,[...EO,...CO,...ET],'feast','julian',{en:'Nativity of Christ — Julian calendar observance',pt:'Natal do Senhor — calendário juliano',ru:'Рождество Христово'},['oca-lives','suscopts-synaxarium','ethiopian-church'],{countries:['GLOBAL']}),
 entry('theophany-coptic-ethiopian',1,19,[...CO,...ET],'feast','coptic',{en:'Theophany / Timkat',pt:'Teofania / Timkat'},['suscopts-synaxarium','ethiopian-church'],{countries:['EG','ET','GLOBAL'],validationStatus:'cross-checked'}),
 entry('anthony-great',1,17,[...RC,...BYZ,...CO],'saint','mixed',{en:'Saint Anthony the Great',pt:'Santo Antão',es:'San Antonio Abad',ru:'Преподобный Антоний Великий'},['litcal-api','oca-lives','suscopts-synaxarium'],{patronages:['monasticism','animals'],countries:['GLOBAL']}),
 entry('conversion-paul',1,25,[...RC,...AN],'apostle','gregorian',{en:'The Conversion of Saint Paul the Apostle',pt:'Conversão de São Paulo Apóstolo',es:'Conversión de San Pablo Apóstol'},['litcal-api','cofe-calendar'],{countries:['GLOBAL']}),
 entry('presentation-lord',2,2,[...WEST,...BYZ],'feast','mixed',{en:'Presentation of the Lord',pt:'Apresentação do Senhor',es:'Presentación del Señor',fr:'Présentation du Seigneur',it:'Presentazione del Signore',ru:'Сретение Господне'},['litcal-api','goarch-planner','cofe-calendar'],{countries:['GLOBAL']}),
 entry('presentation-armenia',2,14,AR,'feast','armenian',{en:'Presentation of the Lord — Tearnndarach',pt:'Apresentação do Senhor — Tearnndarach'},['armenian-mother-see'],{countries:['AM','GLOBAL'],validationStatus:'verified'}),
 entry('our-lady-lourdes',2,11,RC,'marian','gregorian',{en:'Our Lady of Lourdes',pt:'Nossa Senhora de Lourdes',es:'Nuestra Señora de Lourdes',fr:'Notre-Dame de Lourdes',it:'Nostra Signora di Lourdes'},['litcal-api'],{patronages:['sick people','pilgrims'],countries:['FR','GLOBAL']}),
 entry('joseph',3,19,[...RC,...AN],'saint','gregorian',{en:'Saint Joseph, Spouse of the Blessed Virgin Mary',pt:'São José, Esposo da Virgem Maria',es:'San José, esposo de la Virgen María',it:'San Giuseppe',pl:'Święty Józef, Oblubieniec Najświętszej Maryi Panny'},['litcal-api','cofe-calendar'],{patronages:['workers','families','carpenters'],countries:['GLOBAL']}),
 entry('annunciation',3,25,[...WEST,...BYZ],'marian','mixed',{en:'Annunciation of the Lord',pt:'Anunciação do Senhor',es:'Anunciación del Señor',fr:'Annonciation du Seigneur',it:'Annunciazione del Signore',ru:'Благовещение Пресвятой Богородицы'},['litcal-api','goarch-planner','cofe-calendar'],{countries:['GLOBAL']}),
 entry('annunciation-armenia',4,7,AR,'marian','armenian',{en:'Annunciation to the Holy Mother of God',pt:'Anunciação à Santa Mãe de Deus'},['armenian-mother-see'],{countries:['AM','GLOBAL'],validationStatus:'verified'}),
 entry('george',4,23,[...RC,...BYZ,...AN,...CO],'martyr','mixed',{en:'Saint George the Great Martyr',pt:'São Jorge, mártir',es:'San Jorge, mártir',ru:'Великомученик Георгий Победоносец'},['litcal-api','oca-lives','cofe-calendar','suscopts-synaxarium'],{patronages:['soldiers','scouts'],countries:['GB','GE','GR','PT','GLOBAL']}),
 entry('mark-evangelist',4,25,[...RC,...BYZ,...AN,...CO],'apostle','mixed',{en:'Saint Mark the Evangelist',pt:'São Marcos Evangelista',es:'San Marcos Evangelista',fr:'Saint Marc évangéliste',it:'San Marco Evangelista'},['litcal-api','oca-lives','cofe-calendar','suscopts-synaxarium'],{patronages:['writers','Alexandria'],countries:['EG','IT','GLOBAL']}),
 entry('julian-norwich',5,8,AN,'saint','gregorian',{en:'Julian of Norwich, Spiritual Writer',pt:'Juliana de Norwich, escritora espiritual'},['cofe-lesser'],{countries:['GB','GLOBAL'],validationStatus:'verified'}),
 entry('fatima',5,13,RC,'marian','gregorian',{en:'Our Lady of Fátima',pt:'Nossa Senhora de Fátima',es:'Nuestra Señora de Fátima',fr:'Notre-Dame de Fátima',it:'Nostra Signora di Fátima',pl:'Matka Boża Fatimska'},['litcal-api'],{patronages:['Portugal','peace'],countries:['PT','GLOBAL']}),
 entry('constantine-helena',5,21,BYZ,'saint','mixed',{en:'Saints Constantine and Helen, Equal-to-the-Apostles',pt:'Santos Constantino e Helena',ru:'Равноапостольные Константин и Елена'},['oca-lives','goarch-planner'],{countries:['GR','CY','RU','GLOBAL']}),
 entry('entry-egypt',6,1,CO,'feast','coptic',{en:'Entry of the Lord Christ into Egypt',pt:'Entrada do Senhor Jesus Cristo no Egito'},['suscopts-synaxarium','sttakla-synaxarium'],{countries:['EG','GLOBAL'],validationStatus:'cross-checked'}),
 entry('anthony-lisbon',6,13,RC,'saint','gregorian',{en:'Saint Anthony of Lisbon and Padua',pt:'Santo António de Lisboa',es:'San Antonio de Padua',fr:'Saint Antoine de Padoue',it:'Sant’Antonio di Padova',de:'Heiliger Antonius von Padua',pl:'Święty Antoni z Padwy'},['litcal-api'],{patronages:['lost items','travellers','marriage'],countries:['PT','IT','GLOBAL']}),
 entry('nativity-john-baptist',6,24,[...WEST,...BYZ],'feast','mixed',{en:'Nativity of Saint John the Baptist',pt:'Natividade de São João Batista',es:'Natividad de San Juan Bautista',ru:'Рождество Иоанна Предтечи'},['litcal-api','oca-lives','cofe-calendar'],{countries:['GLOBAL']}),
 entry('peter-paul',6,29,[...WEST,...BYZ,...CO],'apostle','mixed',{en:'Saints Peter and Paul, Apostles',pt:'São Pedro e São Paulo, apóstolos',es:'Santos Pedro y Pablo, apóstoles',ru:'Апостолы Пётр и Павел'},['litcal-api','goarch-planner','cofe-calendar','suscopts-synaxarium'],{patronages:['Rome','fishermen','missionaries'],countries:['GLOBAL']}),
 entry('apostles-feast-coptic',7,12,CO,'apostle','coptic',{en:'Feast of the Apostles',pt:'Festa dos Apóstolos'},['suscopts-synaxarium','sttakla-synaxarium'],{countries:['EG','GLOBAL'],validationStatus:'cross-checked'}),
 entry('our-lady-carmel',7,16,RC,'marian','gregorian',{en:'Our Lady of Mount Carmel',pt:'Nossa Senhora do Carmo',es:'Nuestra Señora del Carmen',it:'Beata Vergine Maria del Monte Carmelo'},['litcal-api'],{patronages:['sailors','Carmelite Order'],countries:['GLOBAL']}),
 entry('prophet-elijah',7,20,BYZ,'saint','mixed',{en:'Holy Prophet Elijah',pt:'Santo Profeta Elias',ru:'Пророк Илия'},['oca-lives','goarch-planner'],{patronages:['aviators'],countries:['GLOBAL']}),
 entry('james-greater',7,25,[...RC,...AN],'apostle','gregorian',{en:'Saint James the Greater, Apostle',pt:'São Tiago Maior, apóstolo',es:'Santiago el Mayor, apóstol',fr:'Saint Jacques le Majeur'},['litcal-api','cofe-calendar'],{patronages:['pilgrims','Spain'],countries:['ES','PT','GLOBAL']}),
 entry('anne-joachim',7,26,[...RC,...AN],'saint','gregorian',{en:'Saints Anne and Joachim, Parents of the Blessed Virgin Mary',pt:'Santos Ana e Joaquim, pais da Virgem Maria'},['litcal-api','cofe-lesser'],{patronages:['grandparents','families'],countries:['GLOBAL']}),
 entry('transfiguration',8,6,[...WEST,...BYZ,...AR],'feast','mixed',{en:'Transfiguration of the Lord',pt:'Transfiguração do Senhor',es:'Transfiguración del Señor',ru:'Преображение Господне'},['litcal-api','goarch-planner','cofe-calendar','armenian-mother-see'],{countries:['GLOBAL']}),
 entry('assumption-dormition',8,15,[...RC,...BYZ],'marian','mixed',{en:'Assumption / Dormition of the Mother of God',pt:'Assunção / Dormição da Mãe de Deus',es:'Asunción / Dormición de la Madre de Dios',ru:'Успение Пресвятой Богородицы'},['litcal-api','goarch-planner'],{countries:['GLOBAL']}),
 entry('nayrouz',9,11,CO,'feast','coptic',{en:'Nayrouz — Coptic New Year and Feast of the Martyrs',pt:'Nayrouz — Ano Novo Copta e Festa dos Mártires'},['suscopts-synaxarium','sttakla-synaxarium'],{countries:['EG','GLOBAL'],validationStatus:'cross-checked'}),
 entry('nativity-mary',9,8,[...WEST,...BYZ],'marian','mixed',{en:'Nativity of the Mother of God',pt:'Natividade de Nossa Senhora',es:'Natividad de la Virgen María',ru:'Рождество Пресвятой Богородицы'},['litcal-api','goarch-planner','cofe-calendar'],{countries:['GLOBAL']}),
 entry('exaltation-cross',9,14,[...WEST,...BYZ,...AR,...ET],'feast','mixed',{en:'Exaltation of the Holy Cross',pt:'Exaltação da Santa Cruz',es:'Exaltación de la Santa Cruz',ru:'Воздвижение Креста Господня'},['litcal-api','goarch-planner','cofe-calendar','armenian-mother-see','ethiopian-church'],{countries:['GLOBAL']}),
 entry('meskel',9,27,ET,'feast','ethiopian',{en:'Meskel — Finding of the True Cross',pt:'Meskel — Descoberta da Verdadeira Cruz'},['ethiopian-church'],{countries:['ET','ER','GLOBAL'],validationStatus:'review-required'}),
 entry('francis-assisi',10,4,[...RC,...AN],'saint','gregorian',{en:'Saint Francis of Assisi',pt:'São Francisco de Assis',es:'San Francisco de Asís',fr:'Saint François d’Assise',it:'San Francesco d’Assisi'},['litcal-api','cofe-calendar'],{patronages:['ecology','animals','peace'],countries:['GLOBAL']}),
 entry('teresa-avila',10,15,RC,'saint','gregorian',{en:'Saint Teresa of Jesus',pt:'Santa Teresa de Jesus',es:'Santa Teresa de Jesús',fr:'Sainte Thérèse d’Avila',it:'Santa Teresa di Gesù'},['litcal-api'],{patronages:['writers','contemplative prayer'],countries:['ES','GLOBAL']}),
 entry('luke-evangelist',10,18,[...RC,...AN,...BYZ],'apostle','mixed',{en:'Saint Luke the Evangelist',pt:'São Lucas Evangelista',es:'San Lucas Evangelista'},['litcal-api','cofe-calendar','oca-lives'],{patronages:['physicians','artists'],countries:['GLOBAL']}),
 entry('all-saints',11,1,WEST,'feast','gregorian',{en:'All Saints',pt:'Todos os Santos',es:'Todos los Santos',fr:'Toussaint',it:'Tutti i Santi',de:'Allerheiligen',pl:'Wszystkich Świętych'},['litcal-api','cofe-calendar'],{countries:['GLOBAL']}),
 entry('archangels-synaxis',11,8,BYZ,'feast','mixed',{en:'Synaxis of the Archangels Michael, Gabriel and the Bodiless Powers',pt:'Sinaxe dos Arcanjos Miguel, Gabriel e dos Poderes Incorpóreos',ru:'Собор Архистратига Михаила и прочих Небесных Сил'},['oca-lives','goarch-planner'],{countries:['GLOBAL']}),
 entry('mina-coptic',11,24,CO,'martyr','coptic',{en:'Saint Mina the Wonderworker and Martyr',pt:'São Mina, taumaturgo e mártir'},['suscopts-synaxarium','sttakla-synaxarium'],{patronages:['pilgrims'],countries:['EG','GLOBAL'],validationStatus:'cross-checked'}),
 entry('andrew-apostle',11,30,[...WEST,...BYZ],'apostle','mixed',{en:'Saint Andrew the Apostle',pt:'Santo André Apóstolo',es:'San Andrés Apóstol',ru:'Апостол Андрей Первозванный'},['litcal-api','oca-lives','cofe-calendar'],{countries:['GLOBAL']}),
 entry('nicholas',12,6,[...RC,...BYZ,...AN],'saint','mixed',{en:'Saint Nicholas the Wonderworker',pt:'São Nicolau, o Taumaturgo',es:'San Nicolás',fr:'Saint Nicolas',it:'San Nicola',ru:'Святитель Николай Чудотворец'},['litcal-api','oca-lives','goarch-planner','cofe-calendar'],{patronages:['sailors','children','travellers'],countries:['GLOBAL']}),
 entry('immaculate-conception',12,8,RC,'marian','gregorian',{en:'Immaculate Conception of the Blessed Virgin Mary',pt:'Imaculada Conceição de Maria',es:'Inmaculada Concepción de María',fr:'Immaculée Conception',it:'Immacolata Concezione',pl:'Niepokalane Poczęcie Najświętszej Maryi Panny'},['vatican-ddw','litcal-api'],{countries:['GLOBAL']}),
 entry('nativity-christ',12,25,[...WEST,...GO,...AR,...SY],'feast','gregorian',{en:'Nativity of the Lord — Christmas',pt:'Natal do Senhor',es:'Natividad del Señor',fr:'Nativité du Seigneur',it:'Natale del Signore',de:'Weihnachten',pl:'Narodzenie Pańskie'},['litcal-api','goarch-planner','cofe-calendar','armenian-mother-see','syriac-patriarchate'],{countries:['GLOBAL']}),
 entry('stephen-first-martyr',12,26,[...RC,...AN,...AR],'martyr','mixed',{en:'Saint Stephen, the First Martyr',pt:'Santo Estêvão, primeiro mártir',es:'San Esteban, primer mártir'},['litcal-api','cofe-calendar','armenian-mother-see'],{countries:['GLOBAL']})
];

const pad=(v:number)=>String(v).padStart(2,'0');
const dateISO=(y:number,m:number,d:number)=>`${y}-${pad(m)}-${pad(d)}`;
function applies(x:ObservanceDefinition,f:ObservanceFilters){
 if(f.tradition&&!x.traditions.includes(f.tradition))return false;
 if(f.category&&x.category!==f.category)return false;
 if(f.country){const c=f.country.toUpperCase();if(!x.countries?.includes(c)&&!x.countries?.includes('GLOBAL'))return false}
 if(f.patronage){const n=f.patronage.toLowerCase();if(!x.patronages?.some(p=>p.toLowerCase().includes(n)))return false}
 return true;
}
function materialize(x:ObservanceDefinition,y:number,l:Locale):Observance{
 return {...x,dateISO:dateISO(y,x.month,x.day),name:localize(x.names,l),summary:x.summaries?.[l]??x.summaries?.en};
}
export function parseTradition(v:string|null|undefined):Tradition|undefined{
 const c=String(v??'').trim().toLowerCase();
 const aliases:Record<string,Tradition>={
  catholic:'roman-catholic',catolica:'roman-catholic',católico:'roman-catholic',catolico:'roman-catholic','roman-catholic':'roman-catholic',
  orthodox:'eastern-orthodox',ortodoxa:'eastern-orthodox',ortodoxo:'eastern-orthodox','eastern-orthodox':'eastern-orthodox',
  'greek-orthodox':'greek-orthodox',anglican:'anglican','coptic-orthodox':'coptic-orthodox',
  'armenian-apostolic':'armenian-apostolic','ethiopian-orthodox':'ethiopian-orthodox','syriac-orthodox':'syriac-orthodox'
 };
 return aliases[c];
}
export function parseCategory(v:string|null|undefined):Category|undefined{
 const c=String(v??'').toLowerCase();return(CATEGORIES as readonly string[]).includes(c)?c as Category:undefined;
}
export function getMonthlyObservances(y:number,m:number,l:Locale='en',f:ObservanceFilters={}):Observance[]{
 return D.filter(x=>x.month===m+1&&applies(x,f)).map(x=>materialize(x,y,l)).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name));
}
export function getObservancesForDate(v:string,l:Locale='en',f:ObservanceFilters={}):Observance[]{
 const q=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v);if(!q)return[];
 const y=+q[1],m=+q[2],d=+q[3];return D.filter(x=>x.month===m&&x.day===d&&applies(x,f)).map(x=>materialize(x,y,l));
}
export function getAllObservances(y:number,l:Locale='en',f:ObservanceFilters={}):Observance[]{
 return D.filter(x=>applies(x,f)).map(x=>materialize(x,y,l)).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name));
}
export function searchObservances(q:string,y:number,l:Locale='en',f:ObservanceFilters={}):Observance[]{
 const n=q.trim().toLocaleLowerCase(l);
 return getAllObservances(y,l,f).filter(x=>!n||[...Object.values(x.names),...Object.values(x.summaries??{}),...(x.patronages??[]),...(x.countries??[]),x.category,...x.traditions].join(' ').toLocaleLowerCase(l).includes(n));
}
export function isValidDateISO(v:string){
 const q=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v);if(!q)return false;
 const y=+q[1],m=+q[2],d=+q[3],x=new Date(Date.UTC(y,m-1,d));
 return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d;
}
export function mergeObservances(...groups:Observance[][]):Observance[]{
 const seen=new Map<string,Observance>();
 for(const item of groups.flat()){
  const key=`${item.dateISO}|${item.name.toLocaleLowerCase('en')}|${item.traditions.join(',')}`;
  const existing=seen.get(key);
  if(!existing||existing.validationStatus==='review-required')seen.set(key,item);
 }
 return [...seen.values()].sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.name.localeCompare(b.name));
}
export const availableFeeds={
 all:undefined,catholic:'roman-catholic',orthodox:'eastern-orthodox',catolica:'roman-catholic',ortodoxa:'eastern-orthodox',
 'roman-catholic':'roman-catholic','greek-orthodox':'greek-orthodox','eastern-orthodox':'eastern-orthodox',
 anglican:'anglican','coptic-orthodox':'coptic-orthodox','armenian-apostolic':'armenian-apostolic',
 'ethiopian-orthodox':'ethiopian-orthodox','syriac-orthodox':'syriac-orthodox'
} as const;
export type FeastDetail=Observance;
export const getMonthlyFeasts=getMonthlyObservances,getFeastsForDate=getObservancesForDate,getAllFeasts=getAllObservances;

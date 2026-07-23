import { SUPPORTED_LOCALES, type Locale, type LocalizedText } from './i18n';

const CYRILLIC = /[\u0400-\u052f]/u;
const GREEK = /[\u0370-\u03ff\u1f00-\u1fff]/u;
const OTHER_NON_LATIN = /[\u0530-\u058f\u0600-\u06ff\u0700-\u074f\u1200-\u137f\u2c80-\u2cff]/u;
const LATIN = /[A-Za-zÀ-ÖØ-öø-ÿ]/u;

const CYRILLIC_TO_LATIN: Record<string,string> = {
 'А':'A','а':'a','Б':'B','б':'b','В':'V','в':'v','Г':'G','г':'g','Д':'D','д':'d','Е':'E','е':'e','Ё':'Yo','ё':'yo','Ж':'Zh','ж':'zh','З':'Z','з':'z','И':'I','и':'i','Й':'Y','й':'y','К':'K','к':'k','Л':'L','л':'l','М':'M','м':'m','Н':'N','н':'n','О':'O','о':'o','П':'P','п':'p','Р':'R','р':'r','С':'S','с':'s','Т':'T','т':'t','У':'U','у':'u','Ф':'F','ф':'f','Х':'Kh','х':'kh','Ц':'Ts','ц':'ts','Ч':'Ch','ч':'ch','Ш':'Sh','ш':'sh','Щ':'Shch','щ':'shch','Ъ':'','ъ':'','Ы':'Y','ы':'y','Ь':'','ь':'','Э':'E','э':'e','Ю':'Yu','ю':'yu','Я':'Ya','я':'ya','І':'I','і':'i','Ї':'Yi','ї':'yi','Є':'Ye','є':'ye'
};
const GREEK_TO_LATIN: Record<string,string> = {
 'Α':'A','α':'a','Β':'V','β':'v','Γ':'G','γ':'g','Δ':'D','δ':'d','Ε':'E','ε':'e','Ζ':'Z','ζ':'z','Η':'I','η':'i','Θ':'Th','θ':'th','Ι':'I','ι':'i','Κ':'K','κ':'k','Λ':'L','λ':'l','Μ':'M','μ':'m','Ν':'N','ν':'n','Ξ':'X','ξ':'x','Ο':'O','ο':'o','Π':'P','π':'p','Ρ':'R','ρ':'r','Σ':'S','σ':'s','ς':'s','Τ':'T','τ':'t','Υ':'Y','υ':'y','Φ':'F','φ':'f','Χ':'Ch','χ':'ch','Ψ':'Ps','ψ':'ps','Ω':'O','ω':'o'
};

const SOURCE_NORMALIZATION: Array<[RegExp,string]> = [
 [/Святитель/gi,'Saint'],[/Святой|Святая|Святые/gi,'Saint'],[/Преподобный|Преподобная/gi,'Venerable'],[/Великомученик|Великомученица/gi,'Great Martyr'],[/Мученик|Мученица/gi,'Martyr'],[/Апостол/gi,'Apostle'],[/Пророк/gi,'Prophet'],[/Богородиц[аы]/gi,'Mother of God'],[/Рождество/gi,'Nativity'],[/Успение/gi,'Dormition'],[/Воздвижение/gi,'Exaltation'],
 [/Άγιος|Αγία|Άγιοι/gi,'Saint'],[/Όσιος|Οσία/gi,'Venerable'],[/Μεγαλομάρτυρας/gi,'Great Martyr'],[/Μάρτυρας/gi,'Martyr'],[/Απόστολος/gi,'Apostle'],[/Προφήτης/gi,'Prophet'],[/Θεοτόκος/gi,'Mother of God']
];

const TERMS: Record<string,Partial<Record<Locale,string>>> = {
 'mother of god':{es:'Madre de Dios',pt:'Mãe de Deus',fr:'Mère de Dieu',fil:'Ina ng Diyos',ru:'Богородица',sw:'Mama wa Mungu',de:'Gottesmutter',it:'Madre di Dio',pl:'Matka Boża'},
 'blessed virgin mary':{es:'Santísima Virgen María',pt:'Bem-aventurada Virgem Maria',fr:'Bienheureuse Vierge Marie',fil:'Mahal na Birheng Maria',ru:'Пресвятая Дева Мария',sw:'Bikira Maria Mbarikiwa',de:'Selige Jungfrau Maria',it:'Beata Vergine Maria',pl:'Najświętsza Maryja Panna'},
 'our lady':{es:'Nuestra Señora',pt:'Nossa Senhora',fr:'Notre-Dame',fil:'Mahal na Birhen',ru:'Богоматерь',sw:'Mama Yetu',de:'Unsere Liebe Frau',it:'Nostra Signora',pl:'Matka Boża'},
 'john the baptist':{es:'Juan Bautista',pt:'João Batista',fr:'Jean-Baptiste',fil:'Juan Bautista',ru:'Иоанн Креститель',sw:'Yohana Mbatizaji',de:'Johannes der Täufer',it:'Giovanni Battista',pl:'Jan Chrzciciel'},
 'equal-to-the-apostles':{es:'igual a los Apóstoles',pt:'igual aos Apóstolos',fr:'égal aux Apôtres',fil:'kapantay ng mga Apostol',ru:'равноапостольный',sw:'sawa na Mitume',de:'apostelgleich',it:'uguale agli Apostoli',pl:'równy Apostołom'},
 'great martyr':{es:'gran mártir',pt:'grande mártir',fr:'grand martyr',fil:'dakilang martir',ru:'великомученик',sw:'shahidi mkuu',de:'Großmärtyrer',it:'grande martire',pl:'wielki męczennik'},
 'holy cross':{es:'Santa Cruz',pt:'Santa Cruz',fr:'Sainte Croix',fil:'Banal na Krus',ru:'Крест Господень',sw:'Msalaba Mtakatifu',de:'Heiliges Kreuz',it:'Santa Croce',pl:'Krzyż Święty'},
 'all saints':{es:'Todos los Santos',pt:'Todos os Santos',fr:'Tous les Saints',fil:'Lahat ng mga Banal',ru:'Все святые',sw:'Watakatifu Wote',de:'Allerheiligen',it:'Tutti i Santi',pl:'Wszyscy Święci'},
 'nativity':{es:'Natividad',pt:'Natividade',fr:'Nativité',fil:'Kapanganakan',ru:'Рождество',sw:'Kuzaliwa',de:'Geburt',it:'Natività',pl:'Narodzenie'},
 'presentation':{es:'Presentación',pt:'Apresentação',fr:'Présentation',fil:'Paghahandog',ru:'Сретение',sw:'Kutolewa',de:'Darstellung',it:'Presentazione',pl:'Ofiarowanie'},
 'annunciation':{es:'Anunciación',pt:'Anunciação',fr:'Annonciation',fil:'Pagpapahayag',ru:'Благовещение',sw:'Bikira Kupashwa Habari',de:'Verkündigung',it:'Annunciazione',pl:'Zwiastowanie'},
 'transfiguration':{es:'Transfiguración',pt:'Transfiguração',fr:'Transfiguration',fil:'Pagbabagong-anyo',ru:'Преображение',sw:'Kugeuka Sura',de:'Verklärung',it:'Trasfigurazione',pl:'Przemienienie'},
 'assumption':{es:'Asunción',pt:'Assunção',fr:'Assomption',fil:'Pag-akyat sa Langit',ru:'Успение',sw:'Kupalizwa',de:'Mariä Aufnahme',it:'Assunzione',pl:'Wniebowzięcie'},
 'dormition':{es:'Dormición',pt:'Dormição',fr:'Dormition',fil:'Pagkahimlay',ru:'Успение',sw:'Kulala',de:'Entschlafung',it:'Dormizione',pl:'Zaśnięcie'},
 'exaltation':{es:'Exaltación',pt:'Exaltação',fr:'Exaltation',fil:'Pagdakila',ru:'Воздвижение',sw:'Kuinuliwa',de:'Kreuzerhöhung',it:'Esaltazione',pl:'Podwyższenie'},
 'epiphany':{es:'Epifanía',pt:'Epifania',fr:'Épiphanie',fil:'Epipanya',ru:'Богоявление',sw:'Epifania',de:'Erscheinung',it:'Epifania',pl:'Objawienie'},
 'theophany':{es:'Teofanía',pt:'Teofania',fr:'Théophanie',fil:'Teopaniya',ru:'Богоявление',sw:'Theofania',de:'Theophanie',it:'Teofania',pl:'Teofania'},
 'resurrection':{es:'Resurrección',pt:'Ressurreição',fr:'Résurrection',fil:'Muling Pagkabuhay',ru:'Воскресение',sw:'Ufufuo',de:'Auferstehung',it:'Risurrezione',pl:'Zmartwychwstanie'},
 'ascension':{es:'Ascensión',pt:'Ascensão',fr:'Ascension',fil:'Pag-akyat',ru:'Вознесение',sw:'Kupaa',de:'Himmelfahrt',it:'Ascensione',pl:'Wniebowstąpienie'},
 'pentecost':{es:'Pentecostés',pt:'Pentecostes',fr:'Pentecôte',fil:'Pentekostes',ru:'Пятидесятница',sw:'Pentekoste',de:'Pfingsten',it:'Pentecoste',pl:'Pięćdziesiątnica'}
};

const WORDS: Record<string,Partial<Record<Locale,string>>> = {
 'of':{es:'de',pt:'de',fr:'de',fil:'ng',ru:'',sw:'wa',de:'von',it:'di',pl:''},'and':{es:'y',pt:'e',fr:'et',fil:'at',ru:'и',sw:'na',de:'und',it:'e',pl:'i'},'the':{es:'el',pt:'o',fr:'le',fil:'ang',ru:'',sw:'',de:'der',it:'il',pl:''},
 'lord':{es:'Señor',pt:'Senhor',fr:'Seigneur',fil:'Panginoon',ru:'Господь',sw:'Bwana',de:'Herr',it:'Signore',pl:'Pan'},'christ':{es:'Cristo',pt:'Cristo',fr:'Christ',fil:'Kristo',ru:'Христос',sw:'Kristo',de:'Christus',it:'Cristo',pl:'Chrystus'},'jesus':{es:'Jesús',pt:'Jesus',fr:'Jésus',fil:'Hesus',ru:'Иисус',sw:'Yesu',de:'Jesus',it:'Gesù',pl:'Jezus'},
 'apostle':{es:'apóstol',pt:'apóstolo',fr:'apôtre',fil:'apostol',ru:'апостол',sw:'mtume',de:'Apostel',it:'apostolo',pl:'apostoł'},'apostles':{es:'apóstoles',pt:'apóstolos',fr:'apôtres',fil:'mga apostol',ru:'апостолы',sw:'mitume',de:'Apostel',it:'apostoli',pl:'apostołowie'},
 'martyr':{es:'mártir',pt:'mártir',fr:'martyr',fil:'martir',ru:'мученик',sw:'shahidi',de:'Märtyrer',it:'martire',pl:'męczennik'},'martyrs':{es:'mártires',pt:'mártires',fr:'martyrs',fil:'mga martir',ru:'мученики',sw:'mashahidi',de:'Märtyrer',it:'martiri',pl:'męczennicy'},
 'bishop':{es:'obispo',pt:'bispo',fr:'évêque',fil:'obispo',ru:'епископ',sw:'askofu',de:'Bischof',it:'vescovo',pl:'biskup'},'pope':{es:'papa',pt:'papa',fr:'pape',fil:'papa',ru:'папа',sw:'papa',de:'Papst',it:'papa',pl:'papież'},'priest':{es:'sacerdote',pt:'sacerdote',fr:'prêtre',fil:'pari',ru:'священник',sw:'padri',de:'Priester',it:'sacerdote',pl:'kapłan'},
 'virgin':{es:'virgen',pt:'virgem',fr:'vierge',fil:'birhen',ru:'дева',sw:'bikira',de:'Jungfrau',it:'vergine',pl:'dziewica'},'abbot':{es:'abad',pt:'abade',fr:'abbé',fil:'abate',ru:'игумен',sw:'abati',de:'Abt',it:'abate',pl:'opat'},'monk':{es:'monje',pt:'monge',fr:'moine',fil:'monghe',ru:'монах',sw:'mtawa',de:'Mönch',it:'monaco',pl:'mnich'},'hermit':{es:'ermitaño',pt:'eremita',fr:'ermite',fil:'ermitanyo',ru:'отшельник',sw:'mkaapweke',de:'Einsiedler',it:'eremita',pl:'pustelnik'},
 'evangelist':{es:'evangelista',pt:'evangelista',fr:'évangéliste',fil:'ebanghelista',ru:'евангелист',sw:'mwinjilisti',de:'Evangelist',it:'evangelista',pl:'ewangelista'},'prophet':{es:'profeta',pt:'profeta',fr:'prophète',fil:'propeta',ru:'пророк',sw:'nabii',de:'Prophet',it:'profeta',pl:'prorok'},'wonderworker':{es:'taumaturgo',pt:'taumaturgo',fr:'thaumaturge',fil:'manggagawa ng himala',ru:'чудотворец',sw:'mtenda miujiza',de:'Wundertäter',it:'taumaturgo',pl:'cudotwórca'},'venerable':{es:'venerable',pt:'venerável',fr:'vénérable',fil:'kagalang-galang',ru:'преподобный',sw:'mwenye kuheshimiwa',de:'ehrwürdig',it:'venerabile',pl:'czcigodny'},
 'great':{es:'Magno',pt:'Magno',fr:'le Grand',fil:'Dakila',ru:'Великий',sw:'Mkuu',de:'der Große',it:'Magno',pl:'Wielki'},'holy':{es:'Santo',pt:'Santo',fr:'Saint',fil:'Banal',ru:'Святой',sw:'Mtakatifu',de:'Heilig',it:'Santo',pl:'Święty'},'feast':{es:'Fiesta',pt:'Festa',fr:'Fête',fil:'Kapistahan',ru:'Праздник',sw:'Sikukuu',de:'Fest',it:'Festa',pl:'Święto'}
};

const PERSON_NAMES: Record<string,Partial<Record<Locale,string>>> = {
 'Anthony':{es:'Antonio',pt:'António',fr:'Antoine',fil:'Antonio',ru:'Антоний',sw:'Antoni',de:'Antonius',it:'Antonio',pl:'Antoni'},'John':{es:'Juan',pt:'João',fr:'Jean',fil:'Juan',ru:'Иоанн',sw:'Yohana',de:'Johannes',it:'Giovanni',pl:'Jan'},'Peter':{es:'Pedro',pt:'Pedro',fr:'Pierre',fil:'Pedro',ru:'Пётр',sw:'Petro',de:'Petrus',it:'Pietro',pl:'Piotr'},'Paul':{es:'Pablo',pt:'Paulo',fr:'Paul',fil:'Pablo',ru:'Павел',sw:'Paulo',de:'Paulus',it:'Paolo',pl:'Paweł'},'Mary':{es:'María',pt:'Maria',fr:'Marie',fil:'Maria',ru:'Мария',sw:'Maria',de:'Maria',it:'Maria',pl:'Maryja'},'Joseph':{es:'José',pt:'José',fr:'Joseph',fil:'Jose',ru:'Иосиф',sw:'Yosefu',de:'Josef',it:'Giuseppe',pl:'Józef'},'Nicholas':{es:'Nicolás',pt:'Nicolau',fr:'Nicolas',fil:'Nicolas',ru:'Николай',sw:'Nikola',de:'Nikolaus',it:'Nicola',pl:'Mikołaj'},'George':{es:'Jorge',pt:'Jorge',fr:'Georges',fil:'Jorge',ru:'Георгий',sw:'George',de:'Georg',it:'Giorgio',pl:'Jerzy'},'Mark':{es:'Marcos',pt:'Marcos',fr:'Marc',fil:'Marcos',ru:'Марк',sw:'Marko',de:'Markus',it:'Marco',pl:'Marek'},'Luke':{es:'Lucas',pt:'Lucas',fr:'Luc',fil:'Lucas',ru:'Лука',sw:'Luka',de:'Lukas',it:'Luca',pl:'Łukasz'},'James':{es:'Santiago',pt:'Tiago',fr:'Jacques',fil:'Santiago',ru:'Иаков',sw:'Yakobo',de:'Jakobus',it:'Giacomo',pl:'Jakub'},'Francis':{es:'Francisco',pt:'Francisco',fr:'François',fil:'Francisco',ru:'Франциск',sw:'Fransisko',de:'Franziskus',it:'Francesco',pl:'Franciszek'},'Teresa':{es:'Teresa',pt:'Teresa',fr:'Thérèse',fil:'Teresa',ru:'Тереза',sw:'Teresa',de:'Teresa',it:'Teresa',pl:'Teresa'},'Basil':{es:'Basilio',pt:'Basílio',fr:'Basile',fil:'Basilio',ru:'Василий',sw:'Basil',de:'Basilius',it:'Basilio',pl:'Bazyli'},'Elijah':{es:'Elías',pt:'Elias',fr:'Élie',fil:'Elias',ru:'Илия',sw:'Eliya',de:'Elija',it:'Elia',pl:'Eliasz'},'Constantine':{es:'Constantino',pt:'Constantino',fr:'Constantin',fil:'Constantino',ru:'Константин',sw:'Konstantino',de:'Konstantin',it:'Costantino',pl:'Konstantyn'},'Helen':{es:'Elena',pt:'Helena',fr:'Hélène',fil:'Elena',ru:'Елена',sw:'Helena',de:'Helena',it:'Elena',pl:'Helena'},'Cecilia':{es:'Cecilia',pt:'Cecília',fr:'Cécile',fil:'Cecilia',ru:'Кикилия',sw:'Cecilia',de:'Cäcilia',it:'Cecilia',pl:'Cecylia'},'Anne':{es:'Ana',pt:'Ana',fr:'Anne',fil:'Ana',ru:'Анна',sw:'Ana',de:'Anna',it:'Anna',pl:'Anna'},'Joachim':{es:'Joaquín',pt:'Joaquim',fr:'Joachim',fil:'Joaquin',ru:'Иоаким',sw:'Yoakimu',de:'Joachim',it:'Gioacchino',pl:'Joachim'},'Michael':{es:'Miguel',pt:'Miguel',fr:'Michel',fil:'Miguel',ru:'Михаил',sw:'Mikaeli',de:'Michael',it:'Michele',pl:'Michał'},'Gabriel':{es:'Gabriel',pt:'Gabriel',fr:'Gabriel',fil:'Gabriel',ru:'Гавриил',sw:'Gabrieli',de:'Gabriel',it:'Gabriele',pl:'Gabriel'}
};

const FEMALE_NAMES = new Set(['Mary','Teresa','Cecilia','Anne','Helen','Catherine','Elizabeth','Margaret','Clare','Agnes','Lucy','Barbara','Olga']);

const SAINT_PREFIX: Record<Locale,{male:string;female:string;plural:string}> = {
 en:{male:'Saint',female:'Saint',plural:'Saints'},es:{male:'San',female:'Santa',plural:'Santos'},pt:{male:'São',female:'Santa',plural:'Santos'},fr:{male:'Saint',female:'Sainte',plural:'Saints'},fil:{male:'San',female:'Santa',plural:'Mga Santo'},ru:{male:'Святой',female:'Святая',plural:'Святые'},sw:{male:'Mtakatifu',female:'Mtakatifu',plural:'Watakatifu'},de:{male:'Heiliger',female:'Heilige',plural:'Heilige'},it:{male:'San',female:'Santa',plural:'Santi'},pl:{male:'Święty',female:'Święta',plural:'Święci'}
};

const PATRONAGES: Record<string,Partial<Record<Locale,string>>> = {
 'monasticism':{es:'monacato',pt:'monaquismo',fr:'monachisme',fil:'buhay-monastiko',ru:'монашество',sw:'umonaki',de:'Mönchtum',it:'monachesimo',pl:'monastycyzm'},'education':{es:'educación',pt:'educação',fr:'éducation',fil:'edukasyon',ru:'образование',sw:'elimu',de:'Bildung',it:'istruzione',pl:'edukacja'},'animals':{es:'animales',pt:'animais',fr:'animaux',fil:'mga hayop',ru:'животные',sw:'wanyama',de:'Tiere',it:'animali',pl:'zwierzęta'},'sick people':{es:'enfermos',pt:'doentes',fr:'malades',fil:'mga maysakit',ru:'больные',sw:'wagonjwa',de:'Kranke',it:'malati',pl:'chorzy'},'pilgrims':{es:'peregrinos',pt:'peregrinos',fr:'pèlerins',fil:'mga peregrino',ru:'паломники',sw:'mahujaji',de:'Pilger',it:'pellegrini',pl:'pielgrzymi'},'workers':{es:'trabajadores',pt:'trabalhadores',fr:'travailleurs',fil:'mga manggagawa',ru:'труженики',sw:'wafanyakazi',de:'Arbeiter',it:'lavoratori',pl:'pracownicy'},'families':{es:'familias',pt:'famílias',fr:'familles',fil:'mga pamilya',ru:'семьи',sw:'familia',de:'Familien',it:'famiglie',pl:'rodziny'},'carpenters':{es:'carpinteros',pt:'carpinteiros',fr:'charpentiers',fil:'mga karpintero',ru:'плотники',sw:'maseremala',de:'Zimmerleute',it:'falegnami',pl:'cieśle'},'soldiers':{es:'soldados',pt:'soldados',fr:'soldats',fil:'mga sundalo',ru:'воины',sw:'wanajeshi',de:'Soldaten',it:'soldati',pl:'żołnierze'},'writers':{es:'escritores',pt:'escritores',fr:'écrivains',fil:'mga manunulat',ru:'писатели',sw:'waandishi',de:'Schriftsteller',it:'scrittori',pl:'pisarze'},'peace':{es:'paz',pt:'paz',fr:'paix',fil:'kapayapaan',ru:'мир',sw:'amani',de:'Frieden',it:'pace',pl:'pokój'},'lost items':{es:'objetos perdidos',pt:'objetos perdidos',fr:'objets perdus',fil:'mga nawawalang bagay',ru:'потерянные вещи',sw:'vitu vilivyopotea',de:'verlorene Gegenstände',it:'oggetti smarriti',pl:'zagubione przedmioty'},'travellers':{es:'viajeros',pt:'viajantes',fr:'voyageurs',fil:'mga manlalakbay',ru:'путешественники',sw:'wasafiri',de:'Reisende',it:'viaggiatori',pl:'podróżni'},'marriage':{es:'matrimonio',pt:'matrimónio',fr:'mariage',fil:'pag-aasawa',ru:'брак',sw:'ndoa',de:'Ehe',it:'matrimonio',pl:'małżeństwo'},'fishermen':{es:'pescadores',pt:'pescadores',fr:'pêcheurs',fil:'mga mangingisda',ru:'рыбаки',sw:'wavuvi',de:'Fischer',it:'pescatori',pl:'rybacy'},'missionaries':{es:'misioneros',pt:'missionários',fr:'missionnaires',fil:'mga misyonero',ru:'миссионеры',sw:'wamisionari',de:'Missionare',it:'missionari',pl:'misjonarze'},'sailors':{es:'marineros',pt:'marinheiros',fr:'marins',fil:'mga mandaragat',ru:'моряки',sw:'mabaharia',de:'Seeleute',it:'marinai',pl:'marynarze'},'aviators':{es:'aviadores',pt:'aviadores',fr:'aviateurs',fil:'mga piloto',ru:'авиаторы',sw:'marubani',de:'Flieger',it:'aviatori',pl:'lotnicy'},'ecology':{es:'ecología',pt:'ecologia',fr:'écologie',fil:'ekolohiya',ru:'экология',sw:'ikolojia',de:'Ökologie',it:'ecologia',pl:'ekologia'},'physicians':{es:'médicos',pt:'médicos',fr:'médecins',fil:'mga manggagamot',ru:'врачи',sw:'madaktari',de:'Ärzte',it:'medici',pl:'lekarze'},'artists':{es:'artistas',pt:'artistas',fr:'artistes',fil:'mga artista',ru:'художники',sw:'wasanii',de:'Künstler',it:'artisti',pl:'artyści'},'grandparents':{es:'abuelos',pt:'avós',fr:'grands-parents',fil:'mga lolo at lola',ru:'бабушки и дедушки',sw:'mababu',de:'Großeltern',it:'nonni',pl:'dziadkowie'},'contemplative prayer':{es:'oración contemplativa',pt:'oração contemplativa',fr:'prière contemplative',fil:'mapagnilay na panalangin',ru:'созерцательная молитва',sw:'sala ya kutafakari',de:'kontemplatives Gebet',it:'preghiera contemplativa',pl:'modlitwa kontemplacyjna'}
};

const CALENDARS: Record<string,Record<Locale,string>> = {
 gregorian:{en:'Gregorian',es:'Gregoriano',pt:'Gregoriano',fr:'Grégorien',fil:'Gregorian',ru:'Григорианский',sw:'Gregori',de:'Gregorianisch',it:'Gregoriano',pl:'Gregoriański'},
 julian:{en:'Julian',es:'Juliano',pt:'Juliano',fr:'Julien',fil:'Julian',ru:'Юлианский',sw:'Juliani',de:'Julianisch',it:'Giuliano',pl:'Juliański'},
 'revised-julian':{en:'Revised Julian',es:'Juliano revisado',pt:'Juliano revisto',fr:'Julien révisé',fil:'Binagong Julian',ru:'Новоюлианский',sw:'Juliani iliyorekebishwa',de:'Neujulianisch',it:'Giuliano riformato',pl:'Nowojuliański'},
 coptic:{en:'Coptic',es:'Copto',pt:'Copta',fr:'Copte',fil:'Coptic',ru:'Коптский',sw:'Kikoptiki',de:'Koptisch',it:'Copto',pl:'Koptyjski'},ethiopian:{en:'Ethiopian',es:'Etíope',pt:'Etíope',fr:'Éthiopien',fil:'Ethiopian',ru:'Эфиопский',sw:'Kiethiopia',de:'Äthiopisch',it:'Etiope',pl:'Etiopski'},armenian:{en:'Armenian',es:'Armenio',pt:'Arménio',fr:'Arménien',fil:'Armenian',ru:'Армянский',sw:'Kiarmenia',de:'Armenisch',it:'Armeno',pl:'Ormiański'},mixed:{en:'Varies by tradition',es:'Varía según la tradición',pt:'Varia consoante a tradição',fr:'Variable selon la tradition',fil:'Nag-iiba ayon sa tradisyon',ru:'Зависит от традиции',sw:'Hutofautiana kwa mapokeo',de:'Je nach Tradition',it:'Varia secondo la tradizione',pl:'Zależy od tradycji'}
};

function escapeRegExp(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function mapCharacters(value:string,map:Record<string,string>){return [...value].map(char=>map[char]??char).join('')}
function normalizeSource(value:string){let next=value.normalize('NFC');for(const[pattern,replacement]of SOURCE_NORMALIZATION)next=next.replace(pattern,replacement);return mapCharacters(mapCharacters(next,CYRILLIC_TO_LATIN),GREEK_TO_LATIN)}
function compatible(value:string,locale:Locale){if(locale==='ru')return !GREEK.test(value)&&!OTHER_NON_LATIN.test(value)&&(!LATIN.test(value)||CYRILLIC.test(value));return !CYRILLIC.test(value)&&!GREEK.test(value)&&!OTHER_NON_LATIN.test(value)}
function replaceKnown(value:string,locale:Locale,table:Record<string,Partial<Record<Locale,string>>>){let next=value;for(const key of Object.keys(table).sort((a,b)=>b.length-a.length)){const translated=table[key][locale];if(!translated)continue;next=next.replace(new RegExp(`\\b${escapeRegExp(key)}\\b`,'gi'),translated)}return next}
function titlePrefix(value:string,locale:Locale){const match=/^(Saints?|St\.?)[\s]+(.+)$/i.exec(value);if(!match)return value;const plural=/^Saints$/i.test(match[1]);const first=match[2].split(/[\s,/-]/)[0];const female=FEMALE_NAMES.has(first);const prefix=plural?SAINT_PREFIX[locale].plural:female?SAINT_PREFIX[locale].female:SAINT_PREFIX[locale].male;return`${prefix} ${match[2]}`}
function latinToCyrillic(value:string){const digraphs:Array<[RegExp,string]>=[[/shch/gi,'щ'],[/zh/gi,'ж'],[/kh/gi,'х'],[/ts/gi,'ц'],[/ch/gi,'ч'],[/sh/gi,'ш'],[/yu/gi,'ю'],[/ya/gi,'я'],[/yo/gi,'ё']];let next=value;for(const[p,r]of digraphs)next=next.replace(p,r);const map:Record<string,string>={a:'а',b:'б',c:'к',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'й',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'к',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',x:'кс',y:'ы',z:'з'};return next.replace(/[A-Za-z]/g,char=>{const lower=map[char.toLowerCase()]??char;return char===char.toUpperCase()?lower.toUpperCase():lower})}
function clean(value:string,locale:Locale){let next=value.replace(/\s+([,;:/])/g,'$1').replace(/([,;:/])(?=\S)/g,'$1 ').replace(/\s{2,}/g,' ').trim();if(locale==='ru')next=latinToCyrillic(next);else next=normalizeSource(next).replace(OTHER_NON_LATIN,'');return next}

export function translateChristianName(source:string,locale:Locale):string{
 const canonical=normalizeSource(source);
 if(locale==='en')return clean(canonical,'en');
 let next=titlePrefix(canonical,locale);
 next=replaceKnown(next,locale,TERMS);
 for(const[name,translations]of Object.entries(PERSON_NAMES)){const translated=translations[locale];if(translated)next=next.replace(new RegExp(`\\b${escapeRegExp(name)}\\b`,'g'),translated)}
 next=replaceKnown(next,locale,WORDS);
 return clean(next,locale);
}

export function buildLocalizedNames(source:string,official:Partial<Record<Locale,string>>={}):LocalizedText{
 const names={en:clean(official.en??source,'en')} as LocalizedText;
 for(const locale of SUPPORTED_LOCALES){const candidate=official[locale];names[locale]=candidate&&compatible(candidate,locale)?clean(candidate,locale):translateChristianName(names.en,locale)}
 return names;
}

export function localizeObservanceName(names:LocalizedText,locale:Locale,originalName?:string):string{
 const exact=names[locale];if(exact&&compatible(exact,locale))return clean(exact,locale);
 const canonical=names.en||originalName||exact||'';return translateChristianName(canonical,locale);
}

export function localizePatronage(value:string,locale:Locale):string{return PATRONAGES[value.toLowerCase()]?.[locale]??(locale==='en'?value:clean(replaceKnown(normalizeSource(value),locale,WORDS),locale))}
export function localizeCalendarSystem(value:string,locale:Locale):string{return CALENDARS[value]?.[locale]??value}
export function scriptMatchesLocale(value:string,locale:Locale):boolean{return compatible(value,locale)}

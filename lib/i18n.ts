export const SUPPORTED_LOCALES = ['en','es','pt','fr','fil','ru','sw','de','it','pl'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocalizedText = Partial<Record<Locale,string>> & { en:string };

export function normalizeLocale(value:string|null|undefined):Locale {
  const raw=String(value??'').trim().toLowerCase().replace('_','-');
  const code=raw.split('-')[0];
  const aliases:Record<string,Locale>={tl:'fil',ph:'fil'};
  const normalized=aliases[code]??code;
  return (SUPPORTED_LOCALES as readonly string[]).includes(normalized)?normalized as Locale:'en';
}
export function localeFromAcceptLanguage(value:string|null|undefined):Locale {
  if(!value)return'en';
  for(const token of value.split(',')){
    const locale=normalizeLocale(token.split(';')[0]);
    if(locale!=='en'||/^en(?:-|$)/i.test(token.trim()))return locale;
  }
  return'en';
}
export function localize(text:LocalizedText|undefined,locale:Locale):string{return text?.[locale]??text?.en??''}

export const localeLabels:Record<Locale,string>={
  en:'English',es:'Español',pt:'Português',fr:'Français',fil:'Filipino',
  ru:'Русский',sw:'Kiswahili',de:'Deutsch',it:'Italiano',pl:'Polski'
};

const en={
 navCalendar:'Calendar',navExplore:'Search',navSources:'Sources',heroEyebrow:'A global Christian calendar',
 heroTitle:'Discover the saints and feasts remembered today.',
 heroBody:'Verified observances from major Christian traditions, multilingual search and calendar subscriptions — free for everyone.',
 today:'Today',viewCalendar:'Open calendar',explore:'Search observances',all:'All traditions',
 saintsToday:'Observances for today',noObservances:'No verified observances are available for this date yet.',
 openDay:'Open day',addCalendar:'Add to calendar',downloadIcs:'Download ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Christian saints calendar',
 calendarIntro:'Browse verified observances and build a calendar by tradition, date, region or theme.',
 previous:'Previous',next:'Next',tradition:'Tradition',category:'Category',country:'Region',
 allCategories:'All categories',allRegions:'All regions',saint:'Saint',feast:'Feast',marian:'Marian',
 apostle:'Apostle',martyr:'Martyr',fast:'Fast',searchTitle:'Search saints and feasts',
 searchIntro:'Search by name, patronage, country, category or Christian tradition.',
 searchPlaceholder:'Search Saint Anthony, doctors, Portugal…',results:'results',noResults:'No matching observances.',
 sourcesTitle:'Sources and validation',sourcesIntro:'Every record keeps its source, tradition, calendar system and validation status.',
 candle:'Light a candle',candleLit:'Candle lit',candleEmpty:'No candle has been lit on this device today.',
 candleCount:'on this device',suggestedRegion:'Suggested region',beta:'Continuously updated dataset',
 methodology:'How the calendar works',global:'Global',footer:'A free, independent Christian calendar project.',
 disclaimer:'Dates and observances may vary by Church, jurisdiction, rite and calendar system.',
 dateInvalid:'Invalid date',backCalendar:'Back to calendar',observancesOn:'Observances on',
 feedAll:'Combined feed',feedCatholic:'Roman Catholic feed',feedOrthodox:'Orthodox feed',
 sourceOfficial:'Official source',sourceReference:'Reference source',translationStatus:'Translation status',
 localSuggestion:'Use my region',clear:'Clear',loading:'Loading verified observances…',
 liveData:'Live source data',lastChecked:'Last checked',validation:'Validation',verified:'Verified',
 reviewRequired:'Review required',patronage:'Patronage',calendarSystem:'Calendar system',
 machineAccess:'Machine-readable access',machineAccessIntro:'Structured JSON, ICS and OpenAPI are available for search engines and AI agents.',
 romanCatholic:'Roman Catholic',greekOrthodox:'Greek Orthodox',easternOrthodox:'Eastern Orthodox',
 anglican:'Anglican',copticOrthodox:'Coptic Orthodox',armenianApostolic:'Armenian Apostolic',
 ethiopianOrthodox:'Ethiopian Orthodox Tewahedo',syriacOrthodox:'Syriac Orthodox'
} as const;
export type UiCopy=typeof en;

const es:UiCopy={
 navCalendar:'Calendario',navExplore:'Buscar',navSources:'Fuentes',heroEyebrow:'Un calendario cristiano global',
 heroTitle:'Descubre los santos y fiestas recordados hoy.',
 heroBody:'Celebraciones verificadas de las principales tradiciones cristianas, búsqueda multilingüe y suscripciones de calendario, gratis para todos.',
 today:'Hoy',viewCalendar:'Abrir calendario',explore:'Buscar celebraciones',all:'Todas las tradiciones',
 saintsToday:'Celebraciones de hoy',noObservances:'Aún no hay celebraciones verificadas para esta fecha.',
 openDay:'Abrir día',addCalendar:'Añadir al calendario',downloadIcs:'Descargar ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Calendario cristiano de santos',
 calendarIntro:'Consulta celebraciones verificadas y crea un calendario por tradición, fecha, región o tema.',
 previous:'Anterior',next:'Siguiente',tradition:'Tradición',category:'Categoría',country:'Región',
 allCategories:'Todas las categorías',allRegions:'Todas las regiones',saint:'Santo',feast:'Fiesta',marian:'Mariana',
 apostle:'Apóstol',martyr:'Mártir',fast:'Ayuno',searchTitle:'Buscar santos y fiestas',
 searchIntro:'Busca por nombre, patronazgo, país, categoría o tradición cristiana.',
 searchPlaceholder:'Buscar San Antonio, médicos, Portugal…',results:'resultados',noResults:'No hay celebraciones coincidentes.',
 sourcesTitle:'Fuentes y validación',sourcesIntro:'Cada registro conserva su fuente, tradición, sistema de calendario y estado de validación.',
 candle:'Encender una vela',candleLit:'Vela encendida',candleEmpty:'Todavía no se ha encendido una vela en este dispositivo.',
 candleCount:'en este dispositivo',suggestedRegion:'Región sugerida',beta:'Base de datos en actualización continua',
 methodology:'Cómo funciona el calendario',global:'Global',footer:'Un proyecto de calendario cristiano gratuito e independiente.',
 disclaimer:'Las fechas y celebraciones pueden variar según la Iglesia, jurisdicción, rito y sistema de calendario.',
 dateInvalid:'Fecha no válida',backCalendar:'Volver al calendario',observancesOn:'Celebraciones del',
 feedAll:'Calendario combinado',feedCatholic:'Calendario católico romano',feedOrthodox:'Calendario ortodoxo',
 sourceOfficial:'Fuente oficial',sourceReference:'Fuente de referencia',translationStatus:'Estado de traducción',
 localSuggestion:'Usar mi región',clear:'Limpiar',loading:'Cargando celebraciones verificadas…',
 liveData:'Datos de fuentes en vivo',lastChecked:'Última comprobación',validation:'Validación',verified:'Verificado',
 reviewRequired:'Revisión necesaria',patronage:'Patronazgo',calendarSystem:'Sistema de calendario',
 machineAccess:'Acceso legible por máquinas',machineAccessIntro:'JSON estructurado, ICS y OpenAPI están disponibles para buscadores y agentes de IA.',
 romanCatholic:'Católica romana',greekOrthodox:'Ortodoxa griega',easternOrthodox:'Ortodoxa oriental',
 anglican:'Anglicana',copticOrthodox:'Ortodoxa copta',armenianApostolic:'Apostólica armenia',
 ethiopianOrthodox:'Ortodoxa etíope Tewahedo',syriacOrthodox:'Ortodoxa siríaca'
};

const pt:UiCopy={
 navCalendar:'Calendário',navExplore:'Pesquisar',navSources:'Fontes',heroEyebrow:'Um calendário cristão global',
 heroTitle:'Descubra os santos e festas recordados hoje.',
 heroBody:'Celebrações verificadas das principais tradições cristãs, pesquisa multilingue e subscrições de calendário — gratuitamente para todos.',
 today:'Hoje',viewCalendar:'Abrir calendário',explore:'Pesquisar celebrações',all:'Todas as tradições',
 saintsToday:'Celebrações de hoje',noObservances:'Ainda não existem celebrações verificadas para esta data.',
 openDay:'Abrir dia',addCalendar:'Adicionar ao calendário',downloadIcs:'Descarregar ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Calendário cristão de santos',
 calendarIntro:'Consulte celebrações verificadas e construa um calendário por tradição, data, região ou tema.',
 previous:'Anterior',next:'Seguinte',tradition:'Tradição',category:'Categoria',country:'Região',
 allCategories:'Todas as categorias',allRegions:'Todas as regiões',saint:'Santo',feast:'Festa',marian:'Mariana',
 apostle:'Apóstolo',martyr:'Mártir',fast:'Jejum',searchTitle:'Pesquisar santos e festas',
 searchIntro:'Pesquise por nome, padroeiro, país, categoria ou tradição cristã.',
 searchPlaceholder:'Pesquisar Santo António, médicos, Portugal…',results:'resultados',noResults:'Nenhuma celebração encontrada.',
 sourcesTitle:'Fontes e validação',sourcesIntro:'Cada registo conserva a fonte, tradição, sistema de calendário e estado de validação.',
 candle:'Acender uma vela',candleLit:'Vela acesa',candleEmpty:'Ainda não foi acesa uma vela neste dispositivo.',
 candleCount:'neste dispositivo',suggestedRegion:'Região sugerida',beta:'Base em atualização contínua',
 methodology:'Como funciona o calendário',global:'Global',footer:'Um projeto de calendário cristão gratuito e independente.',
 disclaimer:'As datas e celebrações podem variar consoante a Igreja, jurisdição, rito e sistema de calendário.',
 dateInvalid:'Data inválida',backCalendar:'Voltar ao calendário',observancesOn:'Celebrações em',
 feedAll:'Feed combinado',feedCatholic:'Feed católico romano',feedOrthodox:'Feed ortodoxo',
 sourceOfficial:'Fonte oficial',sourceReference:'Fonte de referência',translationStatus:'Estado da tradução',
 localSuggestion:'Usar a minha região',clear:'Limpar',loading:'A carregar celebrações verificadas…',
 liveData:'Dados de fontes em tempo real',lastChecked:'Última verificação',validation:'Validação',verified:'Verificado',
 reviewRequired:'Revisão necessária',patronage:'Padroeiro',calendarSystem:'Sistema de calendário',
 machineAccess:'Acesso legível por máquinas',machineAccessIntro:'JSON estruturado, ICS e OpenAPI estão disponíveis para motores de pesquisa e agentes de IA.',
 romanCatholic:'Católica Romana',greekOrthodox:'Ortodoxa Grega',easternOrthodox:'Ortodoxa Oriental',
 anglican:'Anglicana',copticOrthodox:'Ortodoxa Copta',armenianApostolic:'Apostólica Arménia',
 ethiopianOrthodox:'Ortodoxa Etíope Tewahedo',syriacOrthodox:'Ortodoxa Siríaca'
};

const fr:UiCopy={
 navCalendar:'Calendrier',navExplore:'Rechercher',navSources:'Sources',heroEyebrow:'Un calendrier chrétien mondial',
 heroTitle:'Découvrez les saints et fêtes commémorés aujourd’hui.',
 heroBody:'Célébrations vérifiées des principales traditions chrétiennes, recherche multilingue et abonnements au calendrier — gratuitement.',
 today:'Aujourd’hui',viewCalendar:'Ouvrir le calendrier',explore:'Rechercher des célébrations',all:'Toutes les traditions',
 saintsToday:'Célébrations du jour',noObservances:'Aucune célébration vérifiée n’est encore disponible pour cette date.',
 openDay:'Ouvrir le jour',addCalendar:'Ajouter au calendrier',downloadIcs:'Télécharger ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Calendrier chrétien des saints',
 calendarIntro:'Parcourez les célébrations vérifiées et créez un calendrier par tradition, date, région ou thème.',
 previous:'Précédent',next:'Suivant',tradition:'Tradition',category:'Catégorie',country:'Région',
 allCategories:'Toutes les catégories',allRegions:'Toutes les régions',saint:'Saint',feast:'Fête',marian:'Mariale',
 apostle:'Apôtre',martyr:'Martyr',fast:'Jeûne',searchTitle:'Rechercher saints et fêtes',
 searchIntro:'Recherchez par nom, patronage, pays, catégorie ou tradition chrétienne.',
 searchPlaceholder:'Rechercher saint Antoine, médecins, Portugal…',results:'résultats',noResults:'Aucune célébration correspondante.',
 sourcesTitle:'Sources et validation',sourcesIntro:'Chaque entrée conserve sa source, sa tradition, son calendrier et son statut de validation.',
 candle:'Allumer une bougie',candleLit:'Bougie allumée',candleEmpty:'Aucune bougie n’a encore été allumée sur cet appareil.',
 candleCount:'sur cet appareil',suggestedRegion:'Région suggérée',beta:'Base continuellement mise à jour',
 methodology:'Fonctionnement du calendrier',global:'Mondial',footer:'Un projet gratuit et indépendant de calendrier chrétien.',
 disclaimer:'Les dates et célébrations peuvent varier selon l’Église, la juridiction, le rite et le calendrier.',
 dateInvalid:'Date invalide',backCalendar:'Retour au calendrier',observancesOn:'Célébrations du',
 feedAll:'Flux combiné',feedCatholic:'Flux catholique romain',feedOrthodox:'Flux orthodoxe',
 sourceOfficial:'Source officielle',sourceReference:'Source de référence',translationStatus:'État de la traduction',
 localSuggestion:'Utiliser ma région',clear:'Effacer',loading:'Chargement des célébrations vérifiées…',
 liveData:'Données de sources en direct',lastChecked:'Dernière vérification',validation:'Validation',verified:'Vérifié',
 reviewRequired:'Révision nécessaire',patronage:'Patronage',calendarSystem:'Système de calendrier',
 machineAccess:'Accès lisible par machine',machineAccessIntro:'JSON structuré, ICS et OpenAPI sont disponibles pour les moteurs de recherche et les agents d’IA.',
 romanCatholic:'Catholique romaine',greekOrthodox:'Orthodoxe grecque',easternOrthodox:'Orthodoxe orientale',
 anglican:'Anglicane',copticOrthodox:'Orthodoxe copte',armenianApostolic:'Apostolique arménienne',
 ethiopianOrthodox:'Orthodoxe éthiopienne Tewahedo',syriacOrthodox:'Orthodoxe syriaque'
};

const fil:UiCopy={
 navCalendar:'Kalendaryo',navExplore:'Maghanap',navSources:'Mga sanggunian',heroEyebrow:'Isang pandaigdigang kalendaryong Kristiyano',
 heroTitle:'Tuklasin ang mga santo at kapistahang ginugunita ngayon.',
 heroBody:'Beripikadong paggunita mula sa pangunahing tradisyong Kristiyano, maraming wika at mga subscription sa kalendaryo — libre para sa lahat.',
 today:'Ngayon',viewCalendar:'Buksan ang kalendaryo',explore:'Maghanap ng paggunita',all:'Lahat ng tradisyon',
 saintsToday:'Mga paggunita ngayon',noObservances:'Wala pang beripikadong paggunita para sa petsang ito.',
 openDay:'Buksan ang araw',addCalendar:'Idagdag sa kalendaryo',downloadIcs:'I-download ang ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Kalendaryong Kristiyano ng mga santo',
 calendarIntro:'Tingnan ang beripikadong paggunita at bumuo ng kalendaryo ayon sa tradisyon, petsa, rehiyon o paksa.',
 previous:'Nakaraan',next:'Susunod',tradition:'Tradisyon',category:'Kategorya',country:'Rehiyon',
 allCategories:'Lahat ng kategorya',allRegions:'Lahat ng rehiyon',saint:'Santo',feast:'Kapistahan',marian:'Marian',
 apostle:'Apostol',martyr:'Martir',fast:'Pag-aayuno',searchTitle:'Maghanap ng mga santo at kapistahan',
 searchIntro:'Maghanap ayon sa pangalan, patronahe, bansa, kategorya o tradisyong Kristiyano.',
 searchPlaceholder:'Hanapin si San Antonio, mga doktor, Portugal…',results:'mga resulta',noResults:'Walang katugmang paggunita.',
 sourcesTitle:'Mga sanggunian at pagpapatunay',sourcesIntro:'Bawat tala ay may sanggunian, tradisyon, sistema ng kalendaryo at katayuan ng pagpapatunay.',
 candle:'Magsindi ng kandila',candleLit:'Nakasindi ang kandila',candleEmpty:'Wala pang kandilang sinindihan sa device na ito.',
 candleCount:'sa device na ito',suggestedRegion:'Iminungkahing rehiyon',beta:'Patuloy na ina-update na datos',
 methodology:'Paano gumagana ang kalendaryo',global:'Pandaigdigan',footer:'Isang libre at independiyenteng proyektong kalendaryong Kristiyano.',
 disclaimer:'Maaaring mag-iba ang mga petsa ayon sa Simbahan, hurisdiksiyon, rito at sistema ng kalendaryo.',
 dateInvalid:'Hindi wastong petsa',backCalendar:'Bumalik sa kalendaryo',observancesOn:'Mga paggunita sa',
 feedAll:'Pinagsamang feed',feedCatholic:'Roman Catholic feed',feedOrthodox:'Orthodox feed',
 sourceOfficial:'Opisyal na sanggunian',sourceReference:'Sanggunian',translationStatus:'Katayuan ng salin',
 localSuggestion:'Gamitin ang aking rehiyon',clear:'I-clear',loading:'Kinukuha ang beripikadong paggunita…',
 liveData:'Live na datos ng sanggunian',lastChecked:'Huling sinuri',validation:'Pagpapatunay',verified:'Beripikado',
 reviewRequired:'Kailangang suriin',patronage:'Patronahe',calendarSystem:'Sistema ng kalendaryo',
 machineAccess:'Access na nababasa ng makina',machineAccessIntro:'Ang structured JSON, ICS at OpenAPI ay magagamit ng search engine at AI agents.',
 romanCatholic:'Roman Catholic',greekOrthodox:'Greek Orthodox',easternOrthodox:'Eastern Orthodox',
 anglican:'Anglican',copticOrthodox:'Coptic Orthodox',armenianApostolic:'Armenian Apostolic',
 ethiopianOrthodox:'Ethiopian Orthodox Tewahedo',syriacOrthodox:'Syriac Orthodox'
};

const ru:UiCopy={
 navCalendar:'Календарь',navExplore:'Поиск',navSources:'Источники',heroEyebrow:'Всемирный христианский календарь',
 heroTitle:'Узнайте, каких святых и праздники вспоминают сегодня.',
 heroBody:'Проверенные памятные даты основных христианских традиций, многоязычный поиск и подписки на календарь — бесплатно.',
 today:'Сегодня',viewCalendar:'Открыть календарь',explore:'Найти памятные даты',all:'Все традиции',
 saintsToday:'Памятные даты сегодня',noObservances:'Для этой даты пока нет проверенных записей.',
 openDay:'Открыть день',addCalendar:'Добавить в календарь',downloadIcs:'Скачать ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Христианский календарь святых',
 calendarIntro:'Просматривайте проверенные даты и создавайте календарь по традиции, дате, региону или теме.',
 previous:'Назад',next:'Вперёд',tradition:'Традиция',category:'Категория',country:'Регион',
 allCategories:'Все категории',allRegions:'Все регионы',saint:'Святой',feast:'Праздник',marian:'Богородичный',
 apostle:'Апостол',martyr:'Мученик',fast:'Пост',searchTitle:'Поиск святых и праздников',
 searchIntro:'Ищите по имени, покровительству, стране, категории или христианской традиции.',
 searchPlaceholder:'Святой Антоний, врачи, Португалия…',results:'результатов',noResults:'Совпадений нет.',
 sourcesTitle:'Источники и проверка',sourcesIntro:'Каждая запись хранит источник, традицию, календарную систему и статус проверки.',
 candle:'Зажечь свечу',candleLit:'Свеча зажжена',candleEmpty:'На этом устройстве сегодня ещё не зажигали свечу.',
 candleCount:'на этом устройстве',suggestedRegion:'Предлагаемый регион',beta:'Постоянно обновляемая база',
 methodology:'Как работает календарь',global:'Весь мир',footer:'Бесплатный независимый проект христианского календаря.',
 disclaimer:'Даты могут различаться в зависимости от Церкви, юрисдикции, обряда и календаря.',
 dateInvalid:'Неверная дата',backCalendar:'Назад к календарю',observancesOn:'Памятные даты на',
 feedAll:'Общий канал',feedCatholic:'Римско-католический канал',feedOrthodox:'Православный канал',
 sourceOfficial:'Официальный источник',sourceReference:'Справочный источник',translationStatus:'Статус перевода',
 localSuggestion:'Использовать мой регион',clear:'Очистить',loading:'Загрузка проверенных дат…',
 liveData:'Данные из источников',lastChecked:'Последняя проверка',validation:'Проверка',verified:'Проверено',
 reviewRequired:'Требуется проверка',patronage:'Покровительство',calendarSystem:'Календарная система',
 machineAccess:'Машиночитаемый доступ',machineAccessIntro:'Структурированные JSON, ICS и OpenAPI доступны поисковым системам и агентам ИИ.',
 romanCatholic:'Римско-католическая',greekOrthodox:'Греческая православная',easternOrthodox:'Восточная православная',
 anglican:'Англиканская',copticOrthodox:'Коптская православная',armenianApostolic:'Армянская апостольская',
 ethiopianOrthodox:'Эфиопская православная Тевахедо',syriacOrthodox:'Сирийская православная'
};

const sw:UiCopy={
 navCalendar:'Kalenda',navExplore:'Tafuta',navSources:'Vyanzo',heroEyebrow:'Kalenda ya Kikristo ya dunia',
 heroTitle:'Gundua watakatifu na sikukuu zinazokumbukwa leo.',
 heroBody:'Maadhimisho yaliyothibitishwa ya mapokeo makuu ya Kikristo, utafutaji wa lugha nyingi na usajili wa kalenda — bure kwa wote.',
 today:'Leo',viewCalendar:'Fungua kalenda',explore:'Tafuta maadhimisho',all:'Mapokeo yote',
 saintsToday:'Maadhimisho ya leo',noObservances:'Bado hakuna maadhimisho yaliyothibitishwa kwa tarehe hii.',
 openDay:'Fungua siku',addCalendar:'Ongeza kwenye kalenda',downloadIcs:'Pakua ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Kalenda ya watakatifu wa Kikristo',
 calendarIntro:'Tazama maadhimisho yaliyothibitishwa na unda kalenda kwa mapokeo, tarehe, eneo au mada.',
 previous:'Iliyotangulia',next:'Inayofuata',tradition:'Mapokeo',category:'Aina',country:'Eneo',
 allCategories:'Aina zote',allRegions:'Maeneo yote',saint:'Mtakatifu',feast:'Sikukuu',marian:'Ya Maria',
 apostle:'Mtume',martyr:'Shahidi',fast:'Mfungo',searchTitle:'Tafuta watakatifu na sikukuu',
 searchIntro:'Tafuta kwa jina, ulezi, nchi, aina au mapokeo ya Kikristo.',
 searchPlaceholder:'Tafuta Mtakatifu Antoni, madaktari, Ureno…',results:'matokeo',noResults:'Hakuna maadhimisho yanayolingana.',
 sourcesTitle:'Vyanzo na uthibitishaji',sourcesIntro:'Kila rekodi huhifadhi chanzo, mapokeo, mfumo wa kalenda na hali ya uthibitishaji.',
 candle:'Washa mshumaa',candleLit:'Mshumaa umewashwa',candleEmpty:'Hakuna mshumaa uliowashwa kwenye kifaa hiki leo.',
 candleCount:'kwenye kifaa hiki',suggestedRegion:'Eneo lililopendekezwa',beta:'Hifadhidata inayosasishwa daima',
 methodology:'Jinsi kalenda inavyofanya kazi',global:'Dunia',footer:'Mradi huru na wa bure wa kalenda ya Kikristo.',
 disclaimer:'Tarehe zinaweza kutofautiana kulingana na Kanisa, mamlaka, ibada na mfumo wa kalenda.',
 dateInvalid:'Tarehe si sahihi',backCalendar:'Rudi kwenye kalenda',observancesOn:'Maadhimisho ya',
 feedAll:'Mlisho wa pamoja',feedCatholic:'Mlisho wa Kikatoliki wa Roma',feedOrthodox:'Mlisho wa Kiorthodoksi',
 sourceOfficial:'Chanzo rasmi',sourceReference:'Chanzo cha marejeo',translationStatus:'Hali ya tafsiri',
 localSuggestion:'Tumia eneo langu',clear:'Futa',loading:'Inapakia maadhimisho yaliyothibitishwa…',
 liveData:'Data ya moja kwa moja',lastChecked:'Ilikaguliwa mwisho',validation:'Uthibitishaji',verified:'Imethibitishwa',
 reviewRequired:'Inahitaji ukaguzi',patronage:'Ulezi',calendarSystem:'Mfumo wa kalenda',
 machineAccess:'Ufikiaji unaosomeka na mashine',machineAccessIntro:'JSON, ICS na OpenAPI zilizopangwa zinapatikana kwa injini za utafutaji na mawakala wa AI.',
 romanCatholic:'Katoliki ya Roma',greekOrthodox:'Orthodoksi ya Kigiriki',easternOrthodox:'Orthodoksi ya Mashariki',
 anglican:'Anglikana',copticOrthodox:'Orthodoksi ya Kikopti',armenianApostolic:'Kitume cha Armenia',
 ethiopianOrthodox:'Orthodoksi ya Ethiopia Tewahedo',syriacOrthodox:'Orthodoksi ya Kisiria'
};

const de:UiCopy={
 navCalendar:'Kalender',navExplore:'Suche',navSources:'Quellen',heroEyebrow:'Ein globaler christlicher Kalender',
 heroTitle:'Entdecken Sie die Heiligen und Feste des heutigen Tages.',
 heroBody:'Geprüfte Gedenktage wichtiger christlicher Traditionen, mehrsprachige Suche und Kalenderabonnements — kostenlos.',
 today:'Heute',viewCalendar:'Kalender öffnen',explore:'Gedenktage suchen',all:'Alle Traditionen',
 saintsToday:'Gedenktage heute',noObservances:'Für dieses Datum sind noch keine geprüften Gedenktage verfügbar.',
 openDay:'Tag öffnen',addCalendar:'Zum Kalender hinzufügen',downloadIcs:'ICS herunterladen',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Christlicher Heiligenkalender',
 calendarIntro:'Durchsuchen Sie geprüfte Gedenktage und erstellen Sie Kalender nach Tradition, Datum, Region oder Thema.',
 previous:'Zurück',next:'Weiter',tradition:'Tradition',category:'Kategorie',country:'Region',
 allCategories:'Alle Kategorien',allRegions:'Alle Regionen',saint:'Heilige',feast:'Fest',marian:'Marianisch',
 apostle:'Apostel',martyr:'Märtyrer',fast:'Fasten',searchTitle:'Heilige und Feste suchen',
 searchIntro:'Suche nach Name, Patronat, Land, Kategorie oder christlicher Tradition.',
 searchPlaceholder:'Heiliger Antonius, Ärzte, Portugal…',results:'Ergebnisse',noResults:'Keine passenden Gedenktage.',
 sourcesTitle:'Quellen und Prüfung',sourcesIntro:'Jeder Eintrag enthält Quelle, Tradition, Kalendersystem und Prüfstatus.',
 candle:'Kerze anzünden',candleLit:'Kerze angezündet',candleEmpty:'Auf diesem Gerät wurde heute noch keine Kerze angezündet.',
 candleCount:'auf diesem Gerät',suggestedRegion:'Vorgeschlagene Region',beta:'Laufend aktualisierter Datensatz',
 methodology:'So funktioniert der Kalender',global:'Global',footer:'Ein kostenloses, unabhängiges christliches Kalenderprojekt.',
 disclaimer:'Daten können je nach Kirche, Jurisdiktion, Ritus und Kalendersystem abweichen.',
 dateInvalid:'Ungültiges Datum',backCalendar:'Zurück zum Kalender',observancesOn:'Gedenktage am',
 feedAll:'Kombinierter Feed',feedCatholic:'Römisch-katholischer Feed',feedOrthodox:'Orthodoxer Feed',
 sourceOfficial:'Offizielle Quelle',sourceReference:'Referenzquelle',translationStatus:'Übersetzungsstatus',
 localSuggestion:'Meine Region verwenden',clear:'Löschen',loading:'Geprüfte Gedenktage werden geladen…',
 liveData:'Live-Quelldaten',lastChecked:'Zuletzt geprüft',validation:'Prüfung',verified:'Geprüft',
 reviewRequired:'Prüfung erforderlich',patronage:'Patronat',calendarSystem:'Kalendersystem',
 machineAccess:'Maschinenlesbarer Zugriff',machineAccessIntro:'Strukturiertes JSON, ICS und OpenAPI stehen Suchmaschinen und KI-Agenten zur Verfügung.',
 romanCatholic:'Römisch-katholisch',greekOrthodox:'Griechisch-orthodox',easternOrthodox:'Ostorthodox',
 anglican:'Anglikanisch',copticOrthodox:'Koptisch-orthodox',armenianApostolic:'Armenisch-apostolisch',
 ethiopianOrthodox:'Äthiopisch-orthodox Tewahedo',syriacOrthodox:'Syrisch-orthodox'
};

const it:UiCopy={
 navCalendar:'Calendario',navExplore:'Cerca',navSources:'Fonti',heroEyebrow:'Un calendario cristiano globale',
 heroTitle:'Scopri i santi e le feste ricordati oggi.',
 heroBody:'Ricorrenze verificate delle principali tradizioni cristiane, ricerca multilingue e abbonamenti al calendario — gratis per tutti.',
 today:'Oggi',viewCalendar:'Apri il calendario',explore:'Cerca ricorrenze',all:'Tutte le tradizioni',
 saintsToday:'Ricorrenze di oggi',noObservances:'Non sono ancora disponibili ricorrenze verificate per questa data.',
 openDay:'Apri il giorno',addCalendar:'Aggiungi al calendario',downloadIcs:'Scarica ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Calendario cristiano dei santi',
 calendarIntro:'Consulta ricorrenze verificate e crea un calendario per tradizione, data, regione o tema.',
 previous:'Precedente',next:'Successivo',tradition:'Tradizione',category:'Categoria',country:'Regione',
 allCategories:'Tutte le categorie',allRegions:'Tutte le regioni',saint:'Santo',feast:'Festa',marian:'Mariana',
 apostle:'Apostolo',martyr:'Martire',fast:'Digiuno',searchTitle:'Cerca santi e feste',
 searchIntro:'Cerca per nome, patronato, paese, categoria o tradizione cristiana.',
 searchPlaceholder:'Cerca Sant’Antonio, medici, Portogallo…',results:'risultati',noResults:'Nessuna ricorrenza corrispondente.',
 sourcesTitle:'Fonti e validazione',sourcesIntro:'Ogni voce conserva fonte, tradizione, sistema di calendario e stato di validazione.',
 candle:'Accendi una candela',candleLit:'Candela accesa',candleEmpty:'Nessuna candela è stata accesa su questo dispositivo oggi.',
 candleCount:'su questo dispositivo',suggestedRegion:'Regione suggerita',beta:'Dati aggiornati continuamente',
 methodology:'Come funziona il calendario',global:'Globale',footer:'Un progetto gratuito e indipendente di calendario cristiano.',
 disclaimer:'Date e ricorrenze possono variare secondo Chiesa, giurisdizione, rito e sistema di calendario.',
 dateInvalid:'Data non valida',backCalendar:'Torna al calendario',observancesOn:'Ricorrenze del',
 feedAll:'Feed combinato',feedCatholic:'Feed cattolico romano',feedOrthodox:'Feed ortodosso',
 sourceOfficial:'Fonte ufficiale',sourceReference:'Fonte di riferimento',translationStatus:'Stato della traduzione',
 localSuggestion:'Usa la mia regione',clear:'Cancella',loading:'Caricamento delle ricorrenze verificate…',
 liveData:'Dati da fonti in tempo reale',lastChecked:'Ultimo controllo',validation:'Validazione',verified:'Verificato',
 reviewRequired:'Revisione necessaria',patronage:'Patronato',calendarSystem:'Sistema di calendario',
 machineAccess:'Accesso leggibile dalle macchine',machineAccessIntro:'JSON strutturato, ICS e OpenAPI sono disponibili per motori di ricerca e agenti IA.',
 romanCatholic:'Cattolica romana',greekOrthodox:'Ortodossa greca',easternOrthodox:'Ortodossa orientale',
 anglican:'Anglicana',copticOrthodox:'Ortodossa copta',armenianApostolic:'Apostolica armena',
 ethiopianOrthodox:'Ortodossa etiope Tewahedo',syriacOrthodox:'Ortodossa siriaca'
};

const pl:UiCopy={
 navCalendar:'Kalendarz',navExplore:'Szukaj',navSources:'Źródła',heroEyebrow:'Globalny kalendarz chrześcijański',
 heroTitle:'Poznaj świętych i święta wspominane dzisiaj.',
 heroBody:'Zweryfikowane obchody głównych tradycji chrześcijańskich, wyszukiwanie wielojęzyczne i subskrypcje kalendarza — bezpłatnie.',
 today:'Dzisiaj',viewCalendar:'Otwórz kalendarz',explore:'Szukaj obchodów',all:'Wszystkie tradycje',
 saintsToday:'Dzisiejsze obchody',noObservances:'Brak jeszcze zweryfikowanych obchodów dla tej daty.',
 openDay:'Otwórz dzień',addCalendar:'Dodaj do kalendarza',downloadIcs:'Pobierz ICS',apple:'Apple Calendar',
 google:'Google Calendar',outlook:'Outlook',calendarTitle:'Chrześcijański kalendarz świętych',
 calendarIntro:'Przeglądaj zweryfikowane obchody i twórz kalendarz według tradycji, daty, regionu lub tematu.',
 previous:'Poprzedni',next:'Następny',tradition:'Tradycja',category:'Kategoria',country:'Region',
 allCategories:'Wszystkie kategorie',allRegions:'Wszystkie regiony',saint:'Święty',feast:'Święto',marian:'Maryjne',
 apostle:'Apostoł',martyr:'Męczennik',fast:'Post',searchTitle:'Szukaj świętych i świąt',
 searchIntro:'Szukaj według imienia, patronatu, kraju, kategorii lub tradycji chrześcijańskiej.',
 searchPlaceholder:'Święty Antoni, lekarze, Portugalia…',results:'wyników',noResults:'Brak pasujących obchodów.',
 sourcesTitle:'Źródła i walidacja',sourcesIntro:'Każdy wpis zachowuje źródło, tradycję, system kalendarza i status weryfikacji.',
 candle:'Zapal świecę',candleLit:'Świeca zapalona',candleEmpty:'Na tym urządzeniu nie zapalono dziś jeszcze świecy.',
 candleCount:'na tym urządzeniu',suggestedRegion:'Sugerowany region',beta:'Stale aktualizowany zbiór',
 methodology:'Jak działa kalendarz',global:'Globalny',footer:'Bezpłatny i niezależny projekt kalendarza chrześcijańskiego.',
 disclaimer:'Daty mogą się różnić zależnie od Kościoła, jurysdykcji, obrządku i systemu kalendarza.',
 dateInvalid:'Nieprawidłowa data',backCalendar:'Wróć do kalendarza',observancesOn:'Obchody dnia',
 feedAll:'Kanał łączony',feedCatholic:'Kanał rzymskokatolicki',feedOrthodox:'Kanał prawosławny',
 sourceOfficial:'Źródło oficjalne',sourceReference:'Źródło referencyjne',translationStatus:'Status tłumaczenia',
 localSuggestion:'Użyj mojego regionu',clear:'Wyczyść',loading:'Ładowanie zweryfikowanych obchodów…',
 liveData:'Dane źródłowe na żywo',lastChecked:'Ostatnio sprawdzono',validation:'Walidacja',verified:'Zweryfikowano',
 reviewRequired:'Wymaga przeglądu',patronage:'Patronat',calendarSystem:'System kalendarza',
 machineAccess:'Dostęp maszynowy',machineAccessIntro:'Ustrukturyzowane JSON, ICS i OpenAPI są dostępne dla wyszukiwarek i agentów AI.',
 romanCatholic:'Rzymskokatolicka',greekOrthodox:'Greckoprawosławna',easternOrthodox:'Wschodnioprawosławna',
 anglican:'Anglikańska',copticOrthodox:'Koptyjskoprawosławna',armenianApostolic:'Ormiańska apostolska',
 ethiopianOrthodox:'Etiopska prawosławna Tewahedo',syriacOrthodox:'Syryjskoprawosławna'
};

export const ui:Record<Locale,UiCopy>={en,es,pt,fr,fil,ru,sw,de,it,pl};

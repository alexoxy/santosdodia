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
export type UiCopy={ [Key in keyof typeof en]: string };

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

const fil:UiCopy={...en,navCalendar:'Kalendaryo',navExplore:'Maghanap',navSources:'Mga sanggunian',heroEyebrow:'Pandaigdigang kalendaryong Kristiyano',today:'Ngayon',viewCalendar:'Buksan ang kalendaryo',explore:'Maghanap',all:'Lahat ng tradisyon',saintsToday:'Mga paggunita ngayon',openDay:'Buksan ang araw',downloadIcs:'I-download ang ICS',previous:'Nakaraan',next:'Susunod',tradition:'Tradisyon',category:'Kategorya',country:'Rehiyon',allCategories:'Lahat ng kategorya',allRegions:'Lahat ng rehiyon',searchTitle:'Maghanap ng mga santo at kapistahan',results:'mga resulta',noResults:'Walang katugmang paggunita.',sourcesTitle:'Mga sanggunian at pagpapatunay',candle:'Magsindi ng kandila',candleLit:'Nakasindi ang kandila',suggestedRegion:'Iminungkahing rehiyon',clear:'Burahin',loading:'Naglo-load…',validation:'Pagpapatunay',verified:'Napatunayan',reviewRequired:'Kailangang suriin',patronage:'Patronato'};
const ru:UiCopy={...en,navCalendar:'Календарь',navExplore:'Поиск',navSources:'Источники',heroEyebrow:'Всемирный христианский календарь',today:'Сегодня',viewCalendar:'Открыть календарь',explore:'Поиск памятей',all:'Все традиции',saintsToday:'Памяти сегодня',openDay:'Открыть день',downloadIcs:'Скачать ICS',previous:'Назад',next:'Далее',tradition:'Традиция',category:'Категория',country:'Регион',allCategories:'Все категории',allRegions:'Все регионы',searchTitle:'Поиск святых и праздников',results:'результатов',noResults:'Совпадений нет.',sourcesTitle:'Источники и проверка',candle:'Зажечь свечу',candleLit:'Свеча зажжена',suggestedRegion:'Предлагаемый регион',clear:'Очистить',loading:'Загрузка…',validation:'Проверка',verified:'Проверено',reviewRequired:'Требуется проверка',patronage:'Покровительство'};
const sw:UiCopy={...en,navCalendar:'Kalenda',navExplore:'Tafuta',navSources:'Vyanzo',heroEyebrow:'Kalenda ya Kikristo ya kimataifa',today:'Leo',viewCalendar:'Fungua kalenda',explore:'Tafuta kumbukumbu',all:'Mapokeo yote',saintsToday:'Kumbukumbu za leo',openDay:'Fungua siku',downloadIcs:'Pakua ICS',previous:'Iliyotangulia',next:'Ifuatayo',tradition:'Mapokeo',category:'Aina',country:'Eneo',allCategories:'Aina zote',allRegions:'Maeneo yote',searchTitle:'Tafuta watakatifu na sikukuu',results:'matokeo',noResults:'Hakuna kumbukumbu zinazolingana.',sourcesTitle:'Vyanzo na uthibitishaji',candle:'Washa mshumaa',candleLit:'Mshumaa umewashwa',suggestedRegion:'Eneo lililopendekezwa',clear:'Futa',loading:'Inapakia…',validation:'Uthibitishaji',verified:'Imethibitishwa',reviewRequired:'Inahitaji ukaguzi',patronage:'Ulezi'};
const de:UiCopy={...en,navCalendar:'Kalender',navExplore:'Suche',navSources:'Quellen',heroEyebrow:'Ein weltweiter christlicher Kalender',today:'Heute',viewCalendar:'Kalender öffnen',explore:'Gedenktage suchen',all:'Alle Traditionen',saintsToday:'Gedenktage heute',openDay:'Tag öffnen',downloadIcs:'ICS herunterladen',previous:'Zurück',next:'Weiter',tradition:'Tradition',category:'Kategorie',country:'Region',allCategories:'Alle Kategorien',allRegions:'Alle Regionen',searchTitle:'Heilige und Feste suchen',results:'Ergebnisse',noResults:'Keine passenden Gedenktage.',sourcesTitle:'Quellen und Validierung',candle:'Kerze anzünden',candleLit:'Kerze angezündet',suggestedRegion:'Vorgeschlagene Region',clear:'Löschen',loading:'Wird geladen…',validation:'Validierung',verified:'Verifiziert',reviewRequired:'Überprüfung erforderlich',patronage:'Patronat'};
const it:UiCopy={...en,navCalendar:'Calendario',navExplore:'Cerca',navSources:'Fonti',heroEyebrow:'Un calendario cristiano globale',today:'Oggi',viewCalendar:'Apri il calendario',explore:'Cerca ricorrenze',all:'Tutte le tradizioni',saintsToday:'Ricorrenze di oggi',openDay:'Apri il giorno',downloadIcs:'Scarica ICS',previous:'Precedente',next:'Successivo',tradition:'Tradizione',category:'Categoria',country:'Regione',allCategories:'Tutte le categorie',allRegions:'Tutte le regioni',searchTitle:'Cerca santi e feste',results:'risultati',noResults:'Nessuna ricorrenza corrispondente.',sourcesTitle:'Fonti e validazione',candle:'Accendi una candela',candleLit:'Candela accesa',suggestedRegion:'Regione suggerita',clear:'Cancella',loading:'Caricamento…',validation:'Validazione',verified:'Verificato',reviewRequired:'Revisione necessaria',patronage:'Patronato'};
const pl:UiCopy={...en,navCalendar:'Kalendarz',navExplore:'Szukaj',navSources:'Źródła',heroEyebrow:'Globalny kalendarz chrześcijański',today:'Dzisiaj',viewCalendar:'Otwórz kalendarz',explore:'Szukaj obchodów',all:'Wszystkie tradycje',saintsToday:'Dzisiejsze obchody',openDay:'Otwórz dzień',downloadIcs:'Pobierz ICS',previous:'Poprzedni',next:'Następny',tradition:'Tradycja',category:'Kategoria',country:'Region',allCategories:'Wszystkie kategorie',allRegions:'Wszystkie regiony',searchTitle:'Szukaj świętych i świąt',results:'wyników',noResults:'Brak pasujących obchodów.',sourcesTitle:'Źródła i weryfikacja',candle:'Zapal świecę',candleLit:'Świeca zapalona',suggestedRegion:'Sugerowany region',clear:'Wyczyść',loading:'Ładowanie…',validation:'Weryfikacja',verified:'Zweryfikowano',reviewRequired:'Wymaga przeglądu',patronage:'Patronat'};
export const ui:Record<Locale,UiCopy>={en,es,pt,fr,fil,ru,sw,de,it,pl};

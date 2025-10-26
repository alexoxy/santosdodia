const FALLBACK_LOCALE = 'pt-pt';

export const SUPPORTED_LOCALES = [
  { code: 'pt-pt', label: 'Português (Portugal)' },
  { code: 'pt-br', label: 'Português (Brasil)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pl', label: 'Polski' },
  { code: 'ro', label: 'Română' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'la', label: 'Latina' },
  { code: 'ar', label: 'العربية' },
  { code: 'he', label: 'עברית' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'sl', label: 'Slovenščina' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'fi', label: 'Suomi' },
  { code: 'da', label: 'Dansk' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ga', label: 'Gaeilge' },
  { code: 'gl', label: 'Galego' },
  { code: 'ca', label: 'Català' },
  { code: 'es-mx', label: 'Español (México)' },
  { code: 'zh-cn', label: '简体中文' },
  { code: 'zh-tw', label: '繁體中文' },
  { code: 'ja', label: '日本語' }
];

const sharedTraditionKeys = ['all', 'catholicism', 'anglicanism', 'orthodox'];

const messages = {
  'pt-pt': {
    siteTitle: 'Santos do Dia',
    siteSubtitle:
      'Calendário ecuménico diário com santos reconhecidos pelas tradições Católica, Anglicana e Ortodoxa.',
    todayHeading: 'Hoje celebramos',
    calendarExportsHeading: 'Exportar calendários',
    legendHeading: 'Tradições',
    highlightHeading: 'Santo em destaque',
    highlightSource: 'Biografia curada com fontes oficiais e apoio de IA revisto diariamente.',
    sourcesLabel: 'Fontes',
    upcomingHeading: 'Próximos dias',
    noSaintsToday: 'Ainda não temos dados oficiais para hoje. Actualize mais tarde ou sincronize as fontes.',
    searchCta: 'Pesquisar santos por data, nome ou tradição.',
    searchLinkLabel: 'Pesquisar santos',
    searchForm: {
      heading: 'Pesquisar no arquivo',
      date: 'Data',
      name: 'Nome do santo',
      tradition: 'Tradição',
      language: 'Idioma',
      button: 'Pesquisar'
    },
    searchResults: {
      heading: 'Resultados',
      empty: 'Não encontrámos registos com estes critérios.',
      dateLabel: 'Data',
      traditionLabel: 'Tradição'
    },
    calendar: {
      all: 'Calendário completo',
      byTradition: 'Por tradição',
      byLanguage: 'Por idioma',
      download: 'Transferir'
    },
    languagesLabel: 'Idiomas disponíveis',
    traditions: {
      all: 'Todas as tradições',
      catholicism: 'Catolicismo',
      anglicanism: 'Anglicanismo',
      orthodox: 'Igreja Ortodoxa'
    }
  },
  'pt-br': {
    siteTitle: 'Santos do Dia',
    siteSubtitle:
      'Calendário ecumênico diário com santos reconhecidos pelas tradições Católica, Anglicana e Ortodoxa.',
    todayHeading: 'Hoje celebramos',
    calendarExportsHeading: 'Exportar calendários',
    legendHeading: 'Tradições',
    highlightHeading: 'Santo em destaque',
    highlightSource: 'Biografia curada com fontes oficiais e apoio de IA revisto diariamente.',
    sourcesLabel: 'Fontes',
    upcomingHeading: 'Próximos dias',
    noSaintsToday: 'Ainda não temos dados oficiais para hoje. Atualize mais tarde ou sincronize as fontes.',
    searchCta: 'Pesquise santos por data, nome ou tradição.',
    searchLinkLabel: 'Pesquisar santos',
    searchForm: {
      heading: 'Pesquisar no arquivo',
      date: 'Data',
      name: 'Nome do santo',
      tradition: 'Tradição',
      language: 'Idioma',
      button: 'Pesquisar'
    },
    searchResults: {
      heading: 'Resultados',
      empty: 'Não encontramos registros com estes critérios.',
      dateLabel: 'Data',
      traditionLabel: 'Tradição'
    },
    calendar: {
      all: 'Calendário completo',
      byTradition: 'Por tradição',
      byLanguage: 'Por idioma',
      download: 'Baixar'
    },
    languagesLabel: 'Idiomas disponíveis',
    traditions: {
      all: 'Todas as tradições',
      catholicism: 'Catolicismo',
      anglicanism: 'Anglicanismo',
      orthodox: 'Igreja Ortodoxa'
    }
  },
  en: {
    siteTitle: 'Saints of the Day',
    siteSubtitle:
      'Daily ecumenical calendar with saints recognised by the Catholic, Anglican, and Orthodox churches.',
    todayHeading: 'Today we honour',
    calendarExportsHeading: 'Calendar exports',
    legendHeading: 'Traditions',
    highlightHeading: 'Featured saint',
    highlightSource: 'Biography curated from official sources with AI assistance reviewed daily.',
    sourcesLabel: 'Sources',
    upcomingHeading: 'Coming days',
    noSaintsToday: 'No official record was found for today yet. Please refresh later or sync the sources.',
    searchCta: 'Search by date, name, or church tradition.',
    searchLinkLabel: 'Search saints',
    searchForm: {
      heading: 'Search the archive',
      date: 'Date',
      name: 'Saint name',
      tradition: 'Tradition',
      language: 'Language',
      button: 'Search'
    },
    searchResults: {
      heading: 'Results',
      empty: 'No records match your filters.',
      dateLabel: 'Date',
      traditionLabel: 'Tradition'
    },
    calendar: {
      all: 'Complete calendar',
      byTradition: 'By tradition',
      byLanguage: 'By language',
      download: 'Download'
    },
    languagesLabel: 'Languages available',
    traditions: {
      all: 'All traditions',
      catholicism: 'Catholicism',
      anglicanism: 'Anglican Communion',
      orthodox: 'Orthodox Church'
    }
  },
  es: {
    siteTitle: 'Santos del Día',
    siteSubtitle:
      'Calendario ecuménico diario con santos reconocidos por las iglesias Católica, Anglicana y Ortodoxa.',
    todayHeading: 'Hoy celebramos',
    calendarExportsHeading: 'Exportar calendarios',
    legendHeading: 'Tradiciones',
    highlightHeading: 'Santo destacado',
    highlightSource: 'Biografía elaborada con fuentes oficiales y apoyo de IA revisado a diario.',
    sourcesLabel: 'Fuentes',
    upcomingHeading: 'Próximos días',
    noSaintsToday: 'Aún no tenemos datos oficiales para hoy. Vuelve más tarde o sincroniza las fuentes.',
    searchCta: 'Busca santos por fecha, nombre o tradición.',
    searchLinkLabel: 'Buscar santos',
    searchForm: {
      heading: 'Buscar en el archivo',
      date: 'Fecha',
      name: 'Nombre del santo',
      tradition: 'Tradición',
      language: 'Idioma',
      button: 'Buscar'
    },
    searchResults: {
      heading: 'Resultados',
      empty: 'No encontramos registros con estos criterios.',
      dateLabel: 'Fecha',
      traditionLabel: 'Tradición'
    },
    calendar: {
      all: 'Calendario completo',
      byTradition: 'Por tradición',
      byLanguage: 'Por idioma',
      download: 'Descargar'
    },
    languagesLabel: 'Idiomas disponibles',
    traditions: {
      all: 'Todas las tradiciones',
      catholicism: 'Catolicismo',
      anglicanism: 'Comunión Anglicana',
      orthodox: 'Iglesia Ortodoxa'
    }
  },
  fr: {
    siteTitle: 'Saints du Jour',
    siteSubtitle:
      'Calendrier œcuménique quotidien avec les saints reconnus par les Églises catholique, anglicane et orthodoxe.',
    todayHeading: 'Nous célébrons aujourd’hui',
    calendarExportsHeading: 'Exporter les calendriers',
    legendHeading: 'Traditions',
    highlightHeading: 'Saint à la une',
    highlightSource: 'Biographie issue de sources officielles et d’une aide IA vérifiée chaque jour.',
    sourcesLabel: 'Sources',
    upcomingHeading: 'Prochains jours',
    noSaintsToday: 'Aucune donnée officielle pour aujourd’hui pour le moment. Réessayez plus tard ou synchronisez les sources.',
    searchCta: 'Recherchez par date, nom ou tradition.',
    searchLinkLabel: 'Chercher des saints',
    searchForm: {
      heading: 'Rechercher dans les archives',
      date: 'Date',
      name: 'Nom du saint',
      tradition: 'Tradition',
      language: 'Langue',
      button: 'Rechercher'
    },
    searchResults: {
      heading: 'Résultats',
      empty: 'Aucun enregistrement ne correspond à votre recherche.',
      dateLabel: 'Date',
      traditionLabel: 'Tradition'
    },
    calendar: {
      all: 'Calendrier complet',
      byTradition: 'Par tradition',
      byLanguage: 'Par langue',
      download: 'Télécharger'
    },
    languagesLabel: 'Langues disponibles',
    traditions: {
      all: 'Toutes les traditions',
      catholicism: 'Catholicisme',
      anglicanism: 'Communion anglicane',
      orthodox: 'Église orthodoxe'
    }
  },
  it: {
    siteTitle: 'Santi del Giorno',
    siteSubtitle:
      'Calendario ecumenico quotidiano con i santi riconosciuti dalle Chiese cattolica, anglicana e ortodossa.',
    todayHeading: 'Oggi celebriamo',
    calendarExportsHeading: 'Esporta calendari',
    legendHeading: 'Tradizioni',
    highlightHeading: 'Santo in evidenza',
    highlightSource: 'Biografia curata da fonti ufficiali con supporto IA revisionato quotidianamente.',
    sourcesLabel: 'Fonti',
    upcomingHeading: 'Prossimi giorni',
    noSaintsToday: 'Non sono ancora disponibili dati ufficiali per oggi. Aggiorna più tardi o sincronizza le fonti.',
    searchCta: 'Cerca per data, nome o tradizione.',
    searchLinkLabel: 'Cerca santi',
    searchForm: {
      heading: 'Cerca negli archivi',
      date: 'Data',
      name: 'Nome del santo',
      tradition: 'Tradizione',
      language: 'Lingua',
      button: 'Cerca'
    },
    searchResults: {
      heading: 'Risultati',
      empty: 'Nessun record corrisponde ai criteri.',
      dateLabel: 'Data',
      traditionLabel: 'Tradizione'
    },
    calendar: {
      all: 'Calendario completo',
      byTradition: 'Per tradizione',
      byLanguage: 'Per lingua',
      download: 'Scarica'
    },
    languagesLabel: 'Lingue disponibili',
    traditions: {
      all: 'Tutte le tradizioni',
      catholicism: 'Cattolicesimo',
      anglicanism: 'Comunione anglicana',
      orthodox: 'Chiesa ortodossa'
    }
  },
  de: {
    siteTitle: 'Heilige des Tages',
    siteSubtitle:
      'Täglicher ökumenischer Kalender mit Heiligen der katholischen, anglikanischen und orthodoxen Kirchen.',
    todayHeading: 'Heute gedenken wir',
    calendarExportsHeading: 'Kalender exportieren',
    legendHeading: 'Traditionen',
    highlightHeading: 'Heiliger des Tages',
    highlightSource: 'Biografie aus offiziellen Quellen mit täglich geprüfter KI-Unterstützung.',
    sourcesLabel: 'Quellen',
    upcomingHeading: 'Kommende Tage',
    noSaintsToday: 'Für heute liegen noch keine offiziellen Daten vor. Bitte später erneut prüfen oder Quellen synchronisieren.',
    searchCta: 'Nach Datum, Name oder Tradition suchen.',
    searchLinkLabel: 'Heilige suchen',
    searchForm: {
      heading: 'Archiv durchsuchen',
      date: 'Datum',
      name: 'Name des Heiligen',
      tradition: 'Tradition',
      language: 'Sprache',
      button: 'Suchen'
    },
    searchResults: {
      heading: 'Ergebnisse',
      empty: 'Keine Einträge entsprechen den Kriterien.',
      dateLabel: 'Datum',
      traditionLabel: 'Tradition'
    },
    calendar: {
      all: 'Vollständiger Kalender',
      byTradition: 'Nach Tradition',
      byLanguage: 'Nach Sprache',
      download: 'Herunterladen'
    },
    languagesLabel: 'Verfügbare Sprachen',
    traditions: {
      all: 'Alle Traditionen',
      catholicism: 'Katholische Kirche',
      anglicanism: 'Anglikanische Gemeinschaft',
      orthodox: 'Orthodoxe Kirche'
    }
  }
};

const fallbackMessages = messages[FALLBACK_LOCALE];

export function getLocaleDefinition(candidate) {
  const normalised = (candidate || '').toLowerCase();
  const found = SUPPORTED_LOCALES.find((locale) => locale.code === normalised);
  return found || SUPPORTED_LOCALES[0];
}

export function getMessages(locale) {
  const normalised = (locale || '').toLowerCase();
  const current = messages[normalised];
  if (current) {
    return current;
  }

  return fallbackMessages;
}

export function translate(locale, keyPath) {
  const segments = keyPath.split('.');
  let value = getMessages(locale);

  for (const segment of segments) {
    if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
      value = value[segment];
    } else {
      return segments.length === 1 ? keyPath : translate(FALLBACK_LOCALE, keyPath);
    }
  }

  return value;
}

export function getTraditionLabel(locale, tradition) {
  const dictionary = getMessages(locale);
  if (dictionary.traditions && dictionary.traditions[tradition]) {
    return dictionary.traditions[tradition];
  }

  if (fallbackMessages.traditions && fallbackMessages.traditions[tradition]) {
    return fallbackMessages.traditions[tradition];
  }

  const clean = sharedTraditionKeys.includes(tradition) ? tradition : 'tradition';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

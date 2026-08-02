export type SourceRole = 'authority' | 'verification' | 'discovery';
export type AccessMethod = 'api' | 'ics' | 'html' | 'pdf' | 'git' | 'sparql' | 'manual';
export type StoragePolicy = 'full-snapshot' | 'structured-facts' | 'reference-only';
export type LicenceStatus = 'open' | 'official-publication' | 'permission-required' | 'unknown';

export type KnowledgeSource = {
  id: string;
  name: string;
  url: string;
  churchFamily?: string;
  role: SourceRole;
  methods: AccessMethod[];
  storagePolicy: StoragePolicy;
  licenceStatus: LicenceStatus;
  cadence: 'daily' | 'weekly' | 'monthly' | 'on-release';
  notes: string;
};

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: 'holy-see-bulletin',
    name: 'Holy See Press Office Bulletin',
    url: 'https://press.vatican.va/content/salastampa/en/bollettino.html',
    churchFamily: 'catholic',
    role: 'authority', methods: ['html', 'pdf'], storagePolicy: 'full-snapshot',
    licenceStatus: 'official-publication', cadence: 'daily',
    notes: 'Appointments, resignations, jurisdiction changes and other official announcements.'
  },
  {
    id: 'holy-see-divine-worship',
    name: 'Dicastery for Divine Worship and the Discipline of the Sacraments',
    url: 'https://www.vatican.va/content/romancuria/en/dicasteri/dicastero-culto-divino-e-disciplina-sacramenti/documenti.html',
    churchFamily: 'catholic',
    role: 'authority', methods: ['html', 'pdf'], storagePolicy: 'full-snapshot',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Decrees and amendments affecting the General Roman Calendar.'
  },
  {
    id: 'liturgical-calendar-api',
    name: 'Liturgical Calendar API',
    url: 'https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI',
    churchFamily: 'catholic',
    role: 'verification', methods: ['api', 'git'], storagePolicy: 'full-snapshot',
    licenceStatus: 'open', cadence: 'weekly',
    notes: 'Reference implementation for Roman calendar calculations and territorial calendars.'
  },
  {
    id: 'portuguese-episcopal-conference-directory',
    name: 'Portuguese Episcopal Conference diocesan directory',
    url: 'https://www.conferenciaepiscopal.pt/v1/dioceses/',
    churchFamily: 'catholic',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Official Portuguese ecclesiastical provinces, dioceses, office holders and institutional contacts.'
  },
  {
    id: 'leiria-fatima-diocese',
    name: 'Diocese of Leiria-Fátima',
    url: 'https://www.leiria-fatima.pt/diocese/',
    churchFamily: 'catholic',
    role: 'authority', methods: ['html', 'pdf'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Official diocesan history, jurisdiction, appointments, parishes, local patrons and celebrations.'
  },
  {
    id: 'oca-calendar',
    name: 'Orthodox Church in America calendar and directory',
    url: 'https://www.oca.org/calendar',
    churchFamily: 'eastern-orthodox',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Daily commemorations, readings, movable cycles and ecclesiastical directories.'
  },
  {
    id: 'oca-world-churches',
    name: 'Orthodox Church in America world churches directory',
    url: 'https://www.oca.org/directories/world-churches',
    churchFamily: 'eastern-orthodox',
    role: 'verification', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Index of autocephalous and autonomous Orthodox Churches, primates and official websites.'
  },
  {
    id: 'goarch-calendar',
    name: 'Greek Orthodox Archdiocese calendar',
    url: 'https://www.goarch.org/chapel/calendar',
    churchFamily: 'eastern-orthodox',
    role: 'authority', methods: ['html', 'ics'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Saints, feasts, readings, fasting information and calendar subscriptions.'
  },
  {
    id: 'church-of-england-calendar',
    name: 'Church of England Common Worship calendar',
    url: 'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/calendar',
    churchFamily: 'anglican',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Official feasts, festivals, commemorations and calendar rules.'
  },
  {
    id: 'anglican-communion-directory',
    name: 'Anglican Communion directory',
    url: 'https://www.anglicancommunion.org/structures/member-churches.aspx',
    churchFamily: 'anglican',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Official member Churches, provinces, dioceses, people and institutions across the Communion.'
  },
  {
    id: 'coptic-orthodox-dioceses',
    name: 'Coptic Orthodox Church dioceses',
    url: 'https://copticorthodox.church/en/dioceses/',
    churchFamily: 'oriental-orthodox',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Official diocesan directory and current bishops and metropolitans.'
  },
  {
    id: 'mother-see-etchmiadzin',
    name: 'Mother See of Holy Etchmiadzin',
    url: 'https://www.armenianchurch.org/en/Liturgical-Calendar/',
    churchFamily: 'oriental-orthodox',
    role: 'authority', methods: ['html', 'pdf'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Armenian Apostolic liturgical calendar and official announcements.'
  },
  {
    id: 'mother-see-dioceses',
    name: 'Mother See of Holy Etchmiadzin diocesan directory',
    url: 'https://www.armenianchurch.org/en/Dioceses/',
    churchFamily: 'oriental-orthodox',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'weekly',
    notes: 'Official Armenian Apostolic dioceses in Armenia and the diaspora.'
  },
  {
    id: 'ethiopian-orthodox-calendar',
    name: 'Ethiopian Orthodox Tewahedo Church calendar',
    url: 'https://www.ethiopianorthodox.org/english/calendar.html',
    churchFamily: 'oriental-orthodox',
    role: 'authority', methods: ['html'], storagePolicy: 'structured-facts',
    licenceStatus: 'official-publication', cadence: 'monthly',
    notes: 'Calendar structure, fixed commemorations and movable feast calculation references.'
  },
  {
    id: 'wikidata',
    name: 'Wikidata',
    url: 'https://www.wikidata.org/',
    role: 'discovery', methods: ['sparql'], storagePolicy: 'full-snapshot',
    licenceStatus: 'open', cadence: 'weekly',
    notes: 'Multilingual names, aliases, identifiers, coordinates and entity reconciliation. Never the sole liturgical authority.'
  },
  {
    id: 'gcatholic',
    name: 'GCatholic',
    url: 'https://gcatholic.org/',
    churchFamily: 'catholic',
    role: 'verification', methods: ['html'], storagePolicy: 'reference-only',
    licenceStatus: 'permission-required', cadence: 'weekly',
    notes: 'Discovery and cross-checking of jurisdictions, office holders and particular calendars. Do not bulk reproduce.'
  },
  {
    id: 'catholic-hierarchy',
    name: 'Catholic-Hierarchy',
    url: 'https://www.catholic-hierarchy.org/',
    churchFamily: 'catholic',
    role: 'verification', methods: ['html'], storagePolicy: 'reference-only',
    licenceStatus: 'permission-required', cadence: 'weekly',
    notes: 'Discovery and cross-checking of episcopal biographies, offices and succession. Do not bulk reproduce.'
  }
];

export function sourceById(id: string): KnowledgeSource | undefined {
  return KNOWLEDGE_SOURCES.find(source => source.id === id);
}

export function ingestibleSources(): KnowledgeSource[] {
  return KNOWLEDGE_SOURCES.filter(source => source.storagePolicy !== 'reference-only');
}

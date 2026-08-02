import type { Locale, LocalizedText } from '../../lib/i18n';
import type { Jurisdiction, TranslationQuality } from '../../lib/knowledge/model';

function name(values: LocalizedText, defaultQuality: TranslationQuality = 'editorial') {
  const quality = Object.fromEntries(Object.keys(values).map(locale => [locale, defaultQuality])) as Partial<Record<Locale, TranslationQuality>>;
  return { values, quality };
}

const GLOBAL = [{ level: 'global' as const, code: 'GLOBAL' }];

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'jurisdiction:roman-catholic:universal',
    churchId: 'church:roman-catholic',
    level: 'global-church',
    name: name({ en: 'Universal Roman Catholic Church', pt: 'Igreja Católica Romana universal', es: 'Iglesia católica romana universal', fr: 'Église catholique romaine universelle' }),
    geography: GLOBAL,
    officialUrl: 'https://www.vatican.va/',
    sourceIds: ['holy-see-bulletin', 'holy-see-divine-worship']
  },
  {
    id: 'jurisdiction:greek-orthodox:global',
    churchId: 'church:greek-orthodox',
    level: 'global-church',
    name: name({ en: 'Greek Orthodox jurisdictions', pt: 'Jurisdições ortodoxas gregas', es: 'Jurisdicciones ortodoxas griegas', fr: 'Juridictions orthodoxes grecques' }),
    geography: GLOBAL,
    officialUrl: 'https://www.goarch.org/',
    sourceIds: ['goarch-calendar']
  },
  {
    id: 'jurisdiction:eastern-orthodox:global',
    churchId: 'church:eastern-orthodox',
    level: 'global-church',
    name: name({ en: 'Eastern Orthodox Churches', pt: 'Igrejas Ortodoxas de tradição bizantina', es: 'Iglesias ortodoxas de tradición bizantina', fr: 'Églises orthodoxes de tradition byzantine' }),
    geography: GLOBAL,
    officialUrl: 'https://www.oca.org/directories/world-churches',
    sourceIds: ['oca-world-churches']
  },
  {
    id: 'jurisdiction:oca:metropolitan-see',
    churchId: 'church:orthodox-church-america',
    level: 'autocephalous-church',
    name: name({ en: 'Orthodox Church in America', pt: 'Igreja Ortodoxa na América', es: 'Iglesia Ortodoxa en América', fr: 'Église orthodoxe en Amérique' }, 'official'),
    geography: [
      { level: 'country', code: 'US' },
      { level: 'country', code: 'CA' },
      { level: 'country', code: 'MX' }
    ],
    officialUrl: 'https://www.oca.org/',
    sourceIds: ['oca-world-churches', 'oca-calendar']
  },
  {
    id: 'jurisdiction:anglican:communion',
    churchId: 'church:anglican',
    level: 'global-church',
    name: name({ en: 'Anglican Communion', pt: 'Comunhão Anglicana', es: 'Comunión Anglicana', fr: 'Communion anglicane' }),
    geography: GLOBAL,
    officialUrl: 'https://www.anglicancommunion.org/',
    sourceIds: ['anglican-communion-directory']
  },
  {
    id: 'jurisdiction:coptic-orthodox:patriarchate-alexandria',
    churchId: 'church:coptic-orthodox',
    level: 'patriarchate',
    name: name({ en: 'Coptic Orthodox Patriarchate of Alexandria', pt: 'Patriarcado Copta Ortodoxo de Alexandria', es: 'Patriarcado copto ortodoxo de Alejandría', fr: 'Patriarcat copte orthodoxe d’Alexandrie' }),
    geography: GLOBAL,
    officialUrl: 'https://copticorthodox.church/',
    sourceIds: ['coptic-orthodox-dioceses']
  },
  {
    id: 'jurisdiction:armenian-apostolic:mother-see',
    churchId: 'church:armenian-apostolic',
    level: 'global-church',
    name: name({ en: 'Mother See of Holy Etchmiadzin', pt: 'Santa Sé de Etchmiadzin', es: 'Santa Sede de Echmiadzin', fr: 'Saint-Siège d’Etchmiadzin' }),
    geography: GLOBAL,
    officialUrl: 'https://www.armenianchurch.org/',
    sourceIds: ['mother-see-etchmiadzin', 'mother-see-dioceses']
  },
  {
    id: 'jurisdiction:ethiopian-orthodox:patriarchate',
    churchId: 'church:ethiopian-orthodox',
    level: 'patriarchate',
    name: name({ en: 'Ethiopian Orthodox Tewahedo Church', pt: 'Igreja Ortodoxa Etíope Tewahedo', es: 'Iglesia ortodoxa etíope Tewahedo', fr: 'Église orthodoxe éthiopienne Tewahedo' }),
    geography: GLOBAL,
    officialUrl: 'https://www.ethiopianorthodox.org/',
    sourceIds: ['ethiopian-orthodox-calendar']
  },
  {
    id: 'jurisdiction:syriac-orthodox:patriarchate-antioch',
    churchId: 'church:syriac-orthodox',
    level: 'patriarchate',
    name: name({ en: 'Syriac Orthodox Patriarchate of Antioch', pt: 'Patriarcado Siríaco Ortodoxo de Antioquia', es: 'Patriarcado siríaco ortodoxo de Antioquía', fr: 'Patriarcat syriaque orthodoxe d’Antioche' }),
    geography: GLOBAL,
    officialUrl: 'https://syriacpatriarchate.org/',
    sourceIds: []
  },
  {
    id: 'jurisdiction:roman-catholic:pt-cep',
    churchId: 'church:roman-catholic',
    level: 'episcopal-conference',
    name: name({ en: 'Portuguese Episcopal Conference', pt: 'Conferência Episcopal Portuguesa', es: 'Conferencia Episcopal Portuguesa', fr: 'Conférence épiscopale portugaise' }, 'official'),
    geography: [{ level: 'country', code: 'PT' }],
    parentJurisdictionId: 'jurisdiction:roman-catholic:universal',
    officialUrl: 'https://www.conferenciaepiscopal.pt/',
    sourceIds: ['portuguese-episcopal-conference-directory']
  },
  {
    id: 'jurisdiction:roman-catholic:pt-leiria-fatima',
    churchId: 'church:roman-catholic',
    level: 'diocese',
    name: name({ en: 'Diocese of Leiria-Fátima', pt: 'Diocese de Leiria-Fátima', es: 'Diócesis de Leiria-Fátima', fr: 'Diocèse de Leiria-Fátima' }, 'official'),
    geography: [
      { level: 'country', code: 'PT' },
      { level: 'subdivision', code: 'PT-DIOCESE-LEIRIA-FATIMA', parentCode: 'PT' }
    ],
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-cep',
    officialUrl: 'https://www.leiria-fatima.pt/diocese/',
    activeFrom: '1918-01-17',
    sourceIds: ['leiria-fatima-diocese', 'portuguese-episcopal-conference-directory']
  }
];

export function jurisdictionById(id: string): Jurisdiction | undefined {
  return JURISDICTIONS.find(jurisdiction => jurisdiction.id === id);
}

export function jurisdictionsForChurch(churchId: string): Jurisdiction[] {
  return JURISDICTIONS.filter(jurisdiction => jurisdiction.churchId === churchId);
}

export function childJurisdictions(parentJurisdictionId: string): Jurisdiction[] {
  return JURISDICTIONS.filter(jurisdiction => jurisdiction.parentJurisdictionId === parentJurisdictionId);
}

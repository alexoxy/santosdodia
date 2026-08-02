import type { Locale, LocalizedText } from '../../lib/i18n';
import type { Jurisdiction, TranslationQuality } from '../../lib/knowledge/model';

function name(values: LocalizedText, defaultQuality: TranslationQuality = 'editorial') {
  const quality = Object.fromEntries(Object.keys(values).map(locale => [locale, defaultQuality])) as Partial<Record<Locale, TranslationQuality>>;
  return { values, quality };
}

const GLOBAL = [{ level: 'global' as const, code: 'GLOBAL' }];
const PT_DIRECTORY = 'portuguese-episcopal-conference-directory';

function portugueseJurisdiction({
  id,
  level,
  names,
  parentJurisdictionId,
  officialUrl,
  geographyCode,
  activeFrom,
  sourceIds = [PT_DIRECTORY]
}: {
  id: string;
  level: Jurisdiction['level'];
  names: LocalizedText;
  parentJurisdictionId: string;
  officialUrl: string;
  geographyCode: string;
  activeFrom?: Jurisdiction['activeFrom'];
  sourceIds?: string[];
}): Jurisdiction {
  return {
    id: `jurisdiction:roman-catholic:${id}`,
    churchId: 'church:roman-catholic',
    level,
    name: name(names, 'official'),
    geography: [
      { level: 'country', code: 'PT' },
      { level: 'subdivision', code: geographyCode, parentCode: 'PT' }
    ],
    parentJurisdictionId,
    officialUrl,
    activeFrom,
    sourceIds
  };
}

const PORTUGUESE_CATHOLIC_JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'jurisdiction:roman-catholic:pt-cep',
    churchId: 'church:roman-catholic',
    level: 'episcopal-conference',
    name: name({ en: 'Portuguese Episcopal Conference', pt: 'Conferência Episcopal Portuguesa', es: 'Conferencia Episcopal Portuguesa', fr: 'Conférence épiscopale portugaise' }, 'official'),
    geography: [{ level: 'country', code: 'PT' }],
    parentJurisdictionId: 'jurisdiction:roman-catholic:universal',
    officialUrl: 'https://www.conferenciaepiscopal.pt/',
    sourceIds: [PT_DIRECTORY]
  },
  portugueseJurisdiction({
    id: 'pt-province-braga', level: 'province', geographyCode: 'PT-PROVINCE-BRAGA',
    names: { en: 'Ecclesiastical Province of Braga', pt: 'Província Eclesiástica de Braga', es: 'Provincia Eclesiástica de Braga', fr: 'Province ecclésiastique de Braga' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-cep', officialUrl: 'https://www.conferenciaepiscopal.pt/v1/dioceses/'
  }),
  portugueseJurisdiction({
    id: 'pt-braga', level: 'archdiocese', geographyCode: 'PT-DIOCESE-BRAGA',
    names: { en: 'Archdiocese of Braga', pt: 'Arquidiocese de Braga', es: 'Archidiócesis de Braga', fr: 'Archidiocèse de Braga' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocese-braga.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-aveiro', level: 'diocese', geographyCode: 'PT-DIOCESE-AVEIRO',
    names: { en: 'Diocese of Aveiro', pt: 'Diocese de Aveiro', es: 'Diócesis de Aveiro', fr: 'Diocèse d’Aveiro' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocese-aveiro.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-braganca-miranda', level: 'diocese', geographyCode: 'PT-DIOCESE-BRAGANCA-MIRANDA',
    names: { en: 'Diocese of Bragança-Miranda', pt: 'Diocese de Bragança-Miranda', es: 'Diócesis de Bragança-Miranda', fr: 'Diocèse de Bragança-Miranda' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocesebm.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-coimbra', level: 'diocese', geographyCode: 'PT-DIOCESE-COIMBRA',
    names: { en: 'Diocese of Coimbra', pt: 'Diocese de Coimbra', es: 'Diócesis de Coimbra', fr: 'Diocèse de Coimbra' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocesedecoimbra.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-lamego', level: 'diocese', geographyCode: 'PT-DIOCESE-LAMEGO',
    names: { en: 'Diocese of Lamego', pt: 'Diocese de Lamego', es: 'Diócesis de Lamego', fr: 'Diocèse de Lamego' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocese-lamego.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-porto', level: 'diocese', geographyCode: 'PT-DIOCESE-PORTO',
    names: { en: 'Diocese of Porto', pt: 'Diocese do Porto', es: 'Diócesis de Oporto', fr: 'Diocèse de Porto' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocese-porto.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-viana-castelo', level: 'diocese', geographyCode: 'PT-DIOCESE-VIANA-CASTELO',
    names: { en: 'Diocese of Viana do Castelo', pt: 'Diocese de Viana do Castelo', es: 'Diócesis de Viana do Castelo', fr: 'Diocèse de Viana do Castelo' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocesedeviana.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-vila-real', level: 'diocese', geographyCode: 'PT-DIOCESE-VILA-REAL',
    names: { en: 'Diocese of Vila Real', pt: 'Diocese de Vila Real', es: 'Diócesis de Vila Real', fr: 'Diocèse de Vila Real' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocese-vilareal.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-viseu', level: 'diocese', geographyCode: 'PT-DIOCESE-VISEU',
    names: { en: 'Diocese of Viseu', pt: 'Diocese de Viseu', es: 'Diócesis de Viseu', fr: 'Diocèse de Viseu' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-braga', officialUrl: 'https://www.diocesedeviseu.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-province-evora', level: 'province', geographyCode: 'PT-PROVINCE-EVORA',
    names: { en: 'Ecclesiastical Province of Évora', pt: 'Província Eclesiástica de Évora', es: 'Provincia Eclesiástica de Évora', fr: 'Province ecclésiastique d’Évora' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-cep', officialUrl: 'https://www.conferenciaepiscopal.pt/v1/dioceses/'
  }),
  portugueseJurisdiction({
    id: 'pt-evora', level: 'archdiocese', geographyCode: 'PT-DIOCESE-EVORA',
    names: { en: 'Archdiocese of Évora', pt: 'Arquidiocese de Évora', es: 'Archidiócesis de Évora', fr: 'Archidiocèse d’Évora' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-evora', officialUrl: 'https://www.dioceseevora.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-algarve', level: 'diocese', geographyCode: 'PT-DIOCESE-ALGARVE',
    names: { en: 'Diocese of Algarve', pt: 'Diocese do Algarve', es: 'Diócesis del Algarve', fr: 'Diocèse de l’Algarve' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-evora', officialUrl: 'https://diocese-algarve.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-beja', level: 'diocese', geographyCode: 'PT-DIOCESE-BEJA',
    names: { en: 'Diocese of Beja', pt: 'Diocese de Beja', es: 'Diócesis de Beja', fr: 'Diocèse de Beja' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-evora', officialUrl: 'https://www.diocesedebeja.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-province-lisbon', level: 'province', geographyCode: 'PT-PROVINCE-LISBON',
    names: { en: 'Ecclesiastical Province of Lisbon', pt: 'Província Eclesiástica de Lisboa', es: 'Provincia Eclesiástica de Lisboa', fr: 'Province ecclésiastique de Lisbonne' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-cep', officialUrl: 'https://www.conferenciaepiscopal.pt/v1/dioceses/'
  }),
  portugueseJurisdiction({
    id: 'pt-lisbon', level: 'patriarchate', geographyCode: 'PT-DIOCESE-LISBON',
    names: { en: 'Patriarchate of Lisbon', pt: 'Patriarcado de Lisboa', es: 'Patriarcado de Lisboa', fr: 'Patriarcat de Lisbonne' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.patriarcado-lisboa.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-angra', level: 'diocese', geographyCode: 'PT-DIOCESE-ANGRA',
    names: { en: 'Diocese of Angra', pt: 'Diocese de Angra', es: 'Diócesis de Angra', fr: 'Diocèse d’Angra' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.diocesedeangra.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-funchal', level: 'diocese', geographyCode: 'PT-DIOCESE-FUNCHAL',
    names: { en: 'Diocese of Funchal', pt: 'Diocese do Funchal', es: 'Diócesis de Funchal', fr: 'Diocèse de Funchal' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.diocesedofunchal.com/'
  }),
  portugueseJurisdiction({
    id: 'pt-guarda', level: 'diocese', geographyCode: 'PT-DIOCESE-GUARDA',
    names: { en: 'Diocese of Guarda', pt: 'Diocese da Guarda', es: 'Diócesis de Guarda', fr: 'Diocèse de Guarda' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.diocesedaguarda.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-leiria-fatima', level: 'diocese', geographyCode: 'PT-DIOCESE-LEIRIA-FATIMA',
    names: { en: 'Diocese of Leiria-Fátima', pt: 'Diocese de Leiria-Fátima', es: 'Diócesis de Leiria-Fátima', fr: 'Diocèse de Leiria-Fátima' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.leiria-fatima.pt/diocese/',
    activeFrom: '1918-01-17', sourceIds: ['leiria-fatima-diocese', PT_DIRECTORY]
  }),
  portugueseJurisdiction({
    id: 'pt-portalegre-castelo-branco', level: 'diocese', geographyCode: 'PT-DIOCESE-PORTALEGRE-CASTELO-BRANCO',
    names: { en: 'Diocese of Portalegre-Castelo Branco', pt: 'Diocese de Portalegre-Castelo Branco', es: 'Diócesis de Portalegre-Castelo Branco', fr: 'Diocèse de Portalegre-Castelo Branco' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.portalegre-castelobranco.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-santarem', level: 'diocese', geographyCode: 'PT-DIOCESE-SANTAREM',
    names: { en: 'Diocese of Santarém', pt: 'Diocese de Santarém', es: 'Diócesis de Santarém', fr: 'Diocèse de Santarém' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.diocese-santarem.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-setubal', level: 'diocese', geographyCode: 'PT-DIOCESE-SETUBAL',
    names: { en: 'Diocese of Setúbal', pt: 'Diocese de Setúbal', es: 'Diócesis de Setúbal', fr: 'Diocèse de Setúbal' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-province-lisbon', officialUrl: 'https://www.diocese-setubal.pt/'
  }),
  portugueseJurisdiction({
    id: 'pt-military-ordinariate', level: 'ordinariate', geographyCode: 'PT-ORDINARIATE-MILITARY',
    names: { en: 'Military Ordinariate of Portugal', pt: 'Ordinariato Castrense de Portugal', es: 'Ordinariato castrense de Portugal', fr: 'Ordinariat militaire du Portugal' },
    parentJurisdictionId: 'jurisdiction:roman-catholic:pt-cep', officialUrl: 'https://www.conferenciaepiscopal.pt/v1/dioceses/'
  })
];

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
  ...PORTUGUESE_CATHOLIC_JURISDICTIONS
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

import type { Church, TranslationQuality } from '../../lib/knowledge/model';
import type { Locale, LocalizedText } from '../../lib/i18n';

function name(values: LocalizedText, defaultQuality: TranslationQuality = 'editorial') {
  const quality = Object.fromEntries(Object.keys(values).map(locale => [locale, defaultQuality])) as Partial<Record<Locale, TranslationQuality>>;
  return { values, quality };
}

export const CHURCHES: Church[] = [
  {
    id: 'church:roman-catholic', family: 'catholic', tradition: 'roman-catholic',
    name: name({ en: 'Roman Catholic Church', pt: 'Igreja Católica Romana', es: 'Iglesia Católica Romana', fr: 'Église catholique romaine' }),
    canonicalUrl: 'https://www.vatican.va/', calendarSystems: ['gregorian'], sourceIds: ['holy-see-divine-worship']
  },
  {
    id: 'church:greek-orthodox', family: 'eastern-orthodox', tradition: 'greek-orthodox',
    name: name({ en: 'Greek Orthodox tradition', pt: 'Tradição ortodoxa grega', es: 'Tradición ortodoxa griega', fr: 'Tradition orthodoxe grecque' }),
    canonicalUrl: 'https://www.goarch.org/', calendarSystems: ['revised-julian', 'julian'], sourceIds: ['goarch-calendar']
  },
  {
    id: 'church:eastern-orthodox', family: 'eastern-orthodox', tradition: 'eastern-orthodox',
    name: name({ en: 'Eastern Orthodox Churches', pt: 'Igrejas Ortodoxas Orientais Bizantinas', es: 'Iglesias ortodoxas orientales bizantinas', fr: 'Églises orthodoxes orientales byzantines' }),
    canonicalUrl: 'https://www.oca.org/', calendarSystems: ['julian', 'revised-julian'], sourceIds: ['oca-calendar']
  },
  {
    id: 'church:anglican', family: 'anglican', tradition: 'anglican',
    name: name({ en: 'Anglican Communion', pt: 'Comunhão Anglicana', es: 'Comunión Anglicana', fr: 'Communion anglicane' }),
    canonicalUrl: 'https://www.anglicancommunion.org/', calendarSystems: ['gregorian'], sourceIds: ['church-of-england-calendar']
  },
  {
    id: 'church:coptic-orthodox', family: 'oriental-orthodox', tradition: 'coptic-orthodox',
    name: name({ en: 'Coptic Orthodox Church', pt: 'Igreja Copta Ortodoxa', es: 'Iglesia copta ortodoxa', fr: 'Église copte orthodoxe' }),
    canonicalUrl: 'https://copticorthodox.church/', calendarSystems: ['coptic'], sourceIds: []
  },
  {
    id: 'church:armenian-apostolic', family: 'oriental-orthodox', tradition: 'armenian-apostolic',
    name: name({ en: 'Armenian Apostolic Church', pt: 'Igreja Apostólica Arménia', es: 'Iglesia apostólica armenia', fr: 'Église apostolique arménienne' }),
    canonicalUrl: 'https://www.armenianchurch.org/', calendarSystems: ['armenian', 'gregorian', 'julian'], sourceIds: ['mother-see-etchmiadzin']
  },
  {
    id: 'church:ethiopian-orthodox', family: 'oriental-orthodox', tradition: 'ethiopian-orthodox',
    name: name({ en: 'Ethiopian Orthodox Tewahedo Church', pt: 'Igreja Ortodoxa Etíope Tewahedo', es: 'Iglesia ortodoxa etíope Tewahedo', fr: 'Église orthodoxe éthiopienne Tewahedo' }),
    canonicalUrl: 'https://www.ethiopianorthodox.org/', calendarSystems: ['ethiopian'], sourceIds: ['ethiopian-orthodox-calendar']
  },
  {
    id: 'church:syriac-orthodox', family: 'oriental-orthodox', tradition: 'syriac-orthodox',
    name: name({ en: 'Syriac Orthodox Church', pt: 'Igreja Siríaca Ortodoxa', es: 'Iglesia siríaca ortodoxa', fr: 'Église syriaque orthodoxe' }),
    canonicalUrl: 'https://syriacpatriarchate.org/', calendarSystems: ['gregorian', 'julian'], sourceIds: []
  }
];

export function churchById(id: string): Church | undefined {
  return CHURCHES.find(church => church.id === id);
}

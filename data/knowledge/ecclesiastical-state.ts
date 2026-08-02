import type { Locale, LocalizedText } from '../../lib/i18n';
import type { EcclesiasticalOffice, LocalizedField, Person, SourceAssertion, TranslationQuality } from '../../lib/knowledge/model';

function localized(values: LocalizedText, qualityValue: TranslationQuality, sourceIds: string[]): LocalizedField {
  const quality = Object.fromEntries(Object.keys(values).map(locale => [locale, qualityValue])) as Partial<Record<Locale, TranslationQuality>>;
  return { values, quality, sourceIds };
}

export const ECCLESIASTICAL_PEOPLE: Person[] = [
  {
    id: 'person:leo-xiv',
    entityType: 'cleric',
    name: localized({ en: 'Leo XIV', pt: 'Leão XIV', es: 'León XIV', fr: 'Léon XIV' }, 'official', ['holy-see-bulletin']),
    churchIds: ['church:roman-catholic'],
    sourceIds: ['holy-see-bulletin']
  },
  {
    id: 'person:jose-ornelas-carvalho',
    entityType: 'cleric',
    name: localized({ en: 'José Ornelas Carvalho', pt: 'José Ornelas Carvalho', es: 'José Ornelas Carvalho', fr: 'José Ornelas Carvalho' }, 'official', ['leiria-fatima-diocese']),
    birthDate: '1954-01-05',
    churchIds: ['church:roman-catholic'],
    sourceIds: ['leiria-fatima-diocese']
  },
  {
    id: 'person:tikhon-mollard',
    entityType: 'cleric',
    name: localized({ en: 'Tikhon (Mollard)', pt: 'Tikhon (Mollard)', es: 'Tikhon (Mollard)', fr: 'Tikhon (Mollard)' }, 'official', ['oca-world-churches']),
    birthDate: '1966-07-15',
    churchIds: ['church:orthodox-church-america'],
    sourceIds: ['oca-world-churches']
  },
  {
    id: 'person:karekin-ii',
    entityType: 'cleric',
    name: localized({ en: 'Karekin II', pt: 'Karekin II', es: 'Karekin II', fr: 'Karékine II' }, 'official', ['mother-see-dioceses']),
    birthDate: '1951-08-21',
    churchIds: ['church:armenian-apostolic'],
    sourceIds: ['mother-see-dioceses']
  },
  {
    id: 'person:tawadros-ii',
    entityType: 'cleric',
    name: localized({ en: 'Tawadros II', pt: 'Tawadros II', es: 'Tawadros II', fr: 'Tawadros II' }, 'official', ['coptic-orthodox-dioceses']),
    birthDate: '1952-11-04',
    churchIds: ['church:coptic-orthodox'],
    sourceIds: ['coptic-orthodox-dioceses']
  }
];

export const ECCLESIASTICAL_OFFICES: EcclesiasticalOffice[] = [
  {
    id: 'office:roman-catholic:pope:leo-xiv',
    personId: 'person:leo-xiv',
    jurisdictionId: 'jurisdiction:roman-catholic:universal',
    officeType: 'pope-bishop-of-rome',
    appointedAt: '2025-05-08',
    installedAt: '2025-05-18',
    status: 'active',
    sourceIds: ['holy-see-bulletin']
  },
  {
    id: 'office:leiria-fatima:diocesan-bishop:jose-ornelas',
    personId: 'person:jose-ornelas-carvalho',
    jurisdictionId: 'jurisdiction:roman-catholic:pt-leiria-fatima',
    officeType: 'diocesan-bishop',
    appointedAt: '2022-01-28',
    installedAt: '2022-03-13',
    status: 'active',
    sourceIds: ['leiria-fatima-diocese']
  },
  {
    id: 'office:oca:metropolitan:tikhon',
    personId: 'person:tikhon-mollard',
    jurisdictionId: 'jurisdiction:oca:metropolitan-see',
    officeType: 'primate-metropolitan',
    appointedAt: '2012-11-13',
    installedAt: '2013-01-27',
    status: 'active',
    sourceIds: ['oca-world-churches']
  },
  {
    id: 'office:armenian-apostolic:catholicos:karekin-ii',
    personId: 'person:karekin-ii',
    jurisdictionId: 'jurisdiction:armenian-apostolic:mother-see',
    officeType: 'supreme-patriarch-catholicos',
    appointedAt: '1999-10-27',
    installedAt: '1999-11-04',
    status: 'active',
    sourceIds: ['mother-see-dioceses']
  },
  {
    id: 'office:coptic-orthodox:pope:tawadros-ii',
    personId: 'person:tawadros-ii',
    jurisdictionId: 'jurisdiction:coptic-orthodox:patriarchate-alexandria',
    officeType: 'pope-of-alexandria-patriarch',
    appointedAt: '2012-11-04',
    installedAt: '2012-11-18',
    status: 'active',
    sourceIds: ['coptic-orthodox-dioceses']
  }
];

export const ECCLESIASTICAL_ASSERTIONS: SourceAssertion[] = [
  {
    id: 'assertion:leo-xiv-current-pontificate', subjectId: 'office:roman-catholic:pope:leo-xiv', field: 'active-office',
    value: { title: '267th Pope of the Catholic Church', beginningPontificate: '2025-05-08' }, sourceId: 'holy-see-bulletin',
    sourceUrl: 'https://www.vatican.va/content/leo-xiv/en/biography.html', observedAt: '2026-08-02T00:00:00.000Z', confidence: 'authoritative'
  },
  {
    id: 'assertion:jose-ornelas-current-bishop', subjectId: 'office:leiria-fatima:diocesan-bishop:jose-ornelas', field: 'active-office',
    value: { title: 'Bishop of the Diocese of Leiria-Fátima' }, sourceId: 'leiria-fatima-diocese',
    sourceUrl: 'https://www.leiria-fatima.pt/organica/bispo/', observedAt: '2026-08-02T00:00:00.000Z', confidence: 'authoritative'
  },
  {
    id: 'assertion:tikhon-current-primate', subjectId: 'office:oca:metropolitan:tikhon', field: 'active-office',
    value: { title: 'Archbishop of Washington, Metropolitan of All America and Canada' }, sourceId: 'oca-world-churches',
    sourceUrl: 'https://www.oca.org/holy-synod/bishops/the-most-blessed-tikhon', observedAt: '2026-08-02T00:00:00.000Z', confidence: 'authoritative'
  },
  {
    id: 'assertion:karekin-current-catholicos', subjectId: 'office:armenian-apostolic:catholicos:karekin-ii', field: 'active-office',
    value: { title: 'Supreme Patriarch and Catholicos of All Armenians' }, sourceId: 'mother-see-dioceses',
    sourceUrl: 'https://www.armenianchurch.org/en/biography', observedAt: '2026-08-02T00:00:00.000Z', confidence: 'authoritative'
  },
  {
    id: 'assertion:tawadros-current-pope', subjectId: 'office:coptic-orthodox:pope:tawadros-ii', field: 'active-office',
    value: { title: 'Pope of Alexandria and Patriarch of the See of Saint Mark' }, sourceId: 'coptic-orthodox-dioceses',
    sourceUrl: 'https://copticorthodox.church/en/popes/pope-tawadros-ii/', observedAt: '2026-08-02T00:00:00.000Z', confidence: 'authoritative'
  }
];

export function personById(id: string): Person | undefined {
  return ECCLESIASTICAL_PEOPLE.find(person => person.id === id);
}

export function activeOfficesForJurisdiction(jurisdictionId: string): EcclesiasticalOffice[] {
  return ECCLESIASTICAL_OFFICES.filter(office => office.jurisdictionId === jurisdictionId && office.status === 'active');
}

export function officeHolder(office: EcclesiasticalOffice): Person | undefined {
  return personById(office.personId);
}

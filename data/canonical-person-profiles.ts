import { localize, type Locale, type LocalizedText } from '../lib/i18n';
import { getPublicAllObservances } from '../lib/public-observances';
import type { Category, Observance } from './observances';

export type CanonicalPersonAnchor = {
  id: string;
  primaryObservanceId: string;
  category: Category;
  names: LocalizedText;
};

export const CANONICAL_PERSON_ANCHORS: CanonicalPersonAnchor[] = [
  {
    id: 'john-baptist',
    primaryObservanceId: 'nativity-john-baptist',
    category: 'saint',
    names: { en: 'Saint John the Baptist', pt: 'São João Batista', es: 'San Juan Bautista', it: 'San Giovanni Battista' },
  },
  {
    id: 'matthew-apostle',
    primaryObservanceId: 'rc:StMatthewEvangelist',
    category: 'apostle',
    names: { en: 'Saint Matthew the Apostle', pt: 'São Mateus Apóstolo', es: 'San Mateo Apóstol', it: 'San Matteo Apostolo' },
  },
  {
    id: 'thomas-aquinas',
    primaryObservanceId: 'rc:StThomasAquinas',
    category: 'saint',
    names: { en: 'Saint Thomas Aquinas', pt: 'São Tomás de Aquino', es: 'Santo Tomás de Aquino', it: 'San Tommaso d’Aquino' },
  },
  {
    id: 'catherine-siena',
    primaryObservanceId: 'rc:StCatherineSiena',
    category: 'saint',
    names: { en: 'Saint Catherine of Siena', pt: 'Santa Catarina de Sena', es: 'Santa Catalina de Siena', it: 'Santa Caterina da Siena' },
  },
  {
    id: 'elizabeth-portugal',
    primaryObservanceId: 'rc:StElizabethPortugal',
    category: 'saint',
    names: { en: 'Saint Elizabeth of Portugal', pt: 'Santa Isabel de Portugal', es: 'Santa Isabel de Portugal', it: 'Santa Elisabetta del Portogallo' },
  },
  {
    id: 'peter-apostle',
    primaryObservanceId: 'peter-paul',
    category: 'apostle',
    names: { en: 'Saint Peter the Apostle', pt: 'São Pedro Apóstolo', es: 'San Pedro Apóstol', it: 'San Pietro Apostolo' },
  },
  {
    id: 'paul-apostle',
    primaryObservanceId: 'peter-paul',
    category: 'apostle',
    names: { en: 'Saint Paul the Apostle', pt: 'São Paulo Apóstolo', es: 'San Pablo Apóstol', it: 'San Paolo Apostolo' },
  },
  {
    id: 'anne',
    primaryObservanceId: 'anne-joachim',
    category: 'saint',
    names: { en: 'Saint Anne', pt: 'Santa Ana', es: 'Santa Ana', it: 'Sant’Anna' },
  },
  {
    id: 'joachim',
    primaryObservanceId: 'anne-joachim',
    category: 'saint',
    names: { en: 'Saint Joachim', pt: 'São Joaquim', es: 'San Joaquín', it: 'San Gioacchino' },
  },
  {
    id: 'constantine-great',
    primaryObservanceId: 'constantine-helena',
    category: 'saint',
    names: { en: 'Saint Constantine the Great', pt: 'São Constantino Magno', es: 'San Constantino el Grande', it: 'San Costantino il Grande' },
  },
  {
    id: 'helena',
    primaryObservanceId: 'constantine-helena',
    category: 'saint',
    names: { en: 'Saint Helena', pt: 'Santa Helena', es: 'Santa Elena', it: 'Sant’Elena' },
  },
  {
    id: 'mina',
    primaryObservanceId: 'mina-coptic',
    category: 'martyr',
    names: { en: 'Saint Mina the Martyr', pt: 'São Mina, mártir', es: 'San Mina, mártir', it: 'San Mina, martire' },
  },
  {
    id: 'mary-of-nazareth',
    primaryObservanceId: 'mary-mother-of-god',
    category: 'saint',
    names: { en: 'Mary of Nazareth', pt: 'Maria de Nazaré', es: 'María de Nazaret', it: 'Maria di Nazaret' },
  },
];

export function getCanonicalPersonAnchor(id: string) {
  return CANONICAL_PERSON_ANCHORS.find(person => person.id === id);
}

export function getCanonicalPeopleForObservance(observanceId: string) {
  return CANONICAL_PERSON_ANCHORS.filter(person => person.primaryObservanceId === observanceId);
}

export function canonicalPersonName(person: CanonicalPersonAnchor, locale: Locale) {
  return localize(person.names, locale);
}

export function getCanonicalPersonProfileObservance(id: string, year: number, locale: Locale): Observance | undefined {
  const person = getCanonicalPersonAnchor(id);
  if (!person) return undefined;
  const anchor = getPublicAllObservances(year, locale).find(item => item.id === person.primaryObservanceId);
  if (!anchor) return undefined;
  return {
    ...anchor,
    id: person.id,
    category: person.category,
    names: person.names,
    name: canonicalPersonName(person, locale),
    summaries: undefined,
    summarySourceIds: undefined,
    summaryTranslationStatus: undefined,
  };
}

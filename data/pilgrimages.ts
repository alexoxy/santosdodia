import type { LocalizedText } from '../lib/i18n';

export type PilgrimagePlace = {
  id: string;
  names: LocalizedText;
  church: string;
  countryCode: string;
  locality: string;
  latitude: number;
  longitude: number;
  kind: 'shrine' | 'cathedral' | 'mother-see';
  sourceUrl: string;
  liveUrl?: string;
  calendarRelation?: string;
  verification: 'official-source';
};

// Initial product anchors only. Expansion belongs to the approved-source OSINT pipeline.
// Every record below points to the owning institution's official website.
export const PILGRIMAGE_PLACES: PilgrimagePlace[] = [
  {
    id: 'fatima',
    names: { en: 'Shrine of Fátima', pt: 'Santuário de Fátima', es: 'Santuario de Fátima', fr: 'Sanctuaire de Fatima' },
    church: 'roman-catholic',
    countryCode: 'PT',
    locality: 'Fátima',
    latitude: 39.6318,
    longitude: -8.6742,
    kind: 'shrine',
    sourceUrl: 'https://www.fatima.pt/',
    liveUrl: 'https://www.fatima.pt/en/pages/online-transmissions',
    calendarRelation: 'Our Lady of Fátima and the anniversary pilgrimages',
    verification: 'official-source'
  },
  {
    id: 'lourdes',
    names: { en: 'Sanctuary of Our Lady of Lourdes', pt: 'Santuário de Nossa Senhora de Lourdes', es: 'Santuario de Nuestra Señora de Lourdes', fr: 'Sanctuaire Notre-Dame de Lourdes' },
    church: 'roman-catholic',
    countryCode: 'FR',
    locality: 'Lourdes',
    latitude: 43.0976,
    longitude: -0.0584,
    kind: 'shrine',
    sourceUrl: 'https://www.lourdes-france.org/en/',
    calendarRelation: 'Our Lady of Lourdes and organized pilgrimages',
    verification: 'official-source'
  },
  {
    id: 'santiago',
    names: { en: 'Cathedral of Santiago de Compostela', pt: 'Catedral de Santiago de Compostela', es: 'Catedral de Santiago de Compostela', fr: 'Cathédrale de Saint-Jacques-de-Compostelle' },
    church: 'roman-catholic',
    countryCode: 'ES',
    locality: 'Santiago de Compostela',
    latitude: 42.8806,
    longitude: -8.5446,
    kind: 'cathedral',
    sourceUrl: 'https://catedraldesantiago.es/en/pilgrimage/',
    calendarRelation: 'Saint James the Greater and the Camino de Santiago',
    verification: 'official-source'
  },
  {
    id: 'holy-etchmiadzin',
    names: { en: 'Mother See of Holy Etchmiadzin', pt: 'Santa Sé de Etchmiadzin', es: 'Santa Sede de Echmiadzin', fr: 'Saint-Siège d’Etchmiadzin' },
    church: 'armenian-apostolic',
    countryCode: 'AM',
    locality: 'Vagharshapat',
    latitude: 40.1619,
    longitude: 44.2911,
    kind: 'mother-see',
    sourceUrl: 'https://www.armenianchurch.org/en/mother-see/',
    calendarRelation: 'Mother Cathedral, relics and Armenian Apostolic pilgrimage days',
    verification: 'official-source'
  },
  {
    id: 'guadalupe-mexico',
    names: { en: 'Basilica of Our Lady of Guadalupe', pt: 'Basílica de Nossa Senhora de Guadalupe', es: 'Basílica de Santa María de Guadalupe', fr: 'Basilique Notre-Dame-de-Guadalupe' },
    church: 'roman-catholic',
    countryCode: 'MX',
    locality: 'Mexico City',
    latitude: 19.4849,
    longitude: -99.1174,
    kind: 'shrine',
    sourceUrl: 'https://virgendeguadalupe.org.mx/peregrinaciones/',
    calendarRelation: 'Our Lady of Guadalupe and official pilgrimages',
    verification: 'official-source'
  }
];

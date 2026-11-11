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
  calendarRelation?: LocalizedText;
  verification: 'official-source';
};

// Initial product anchors only. Expansion belongs to the approved-source OSINT pipeline.
// Every record below points to the owning institution's official website.
export const PILGRIMAGE_PLACES: PilgrimagePlace[] = [
  {
    id: 'fatima',
    names: {
      en: 'Shrine of Fátima', pt: 'Santuário de Fátima', es: 'Santuario de Fátima', fr: 'Sanctuaire de Fatima',
      fil: 'Dambana ng Fátima', ru: 'Святилище Фатимы', sw: 'Patakatifu pa Fátima', de: 'Heiligtum von Fátima',
      it: 'Santuario di Fátima', pl: 'Sanktuarium w Fatimie'
    },
    church: 'roman-catholic', countryCode: 'PT', locality: 'Fátima', latitude: 39.6318, longitude: -8.6742, kind: 'shrine',
    sourceUrl: 'https://www.fatima.pt/', liveUrl: 'https://www.fatima.pt/en/pages/online-transmissions',
    calendarRelation: {
      en: 'Our Lady of Fátima and the anniversary pilgrimages', pt: 'Nossa Senhora de Fátima e as peregrinações aniversárias',
      es: 'Nuestra Señora de Fátima y las peregrinaciones de aniversario', fr: 'Notre-Dame de Fatima et les pèlerinages anniversaires',
      fil: 'Mahal na Birhen ng Fátima at mga taunang peregrinasyon', ru: 'Богоматерь Фатимская и годовщинные паломничества',
      sw: 'Mama Yetu wa Fátima na hija za maadhimisho', de: 'Unsere Liebe Frau von Fátima und die Jahrestagspilgerfahrten',
      it: 'Nostra Signora di Fátima e i pellegrinaggi anniversari', pl: 'Matka Boża Fatimska i pielgrzymki rocznicowe'
    },
    verification: 'official-source'
  },
  {
    id: 'lourdes',
    names: {
      en: 'Sanctuary of Our Lady of Lourdes', pt: 'Santuário de Nossa Senhora de Lourdes', es: 'Santuario de Nuestra Señora de Lourdes', fr: 'Sanctuaire Notre-Dame de Lourdes',
      fil: 'Dambana ng Mahal na Birhen ng Lourdes', ru: 'Санктуарий Богоматери Лурдской', sw: 'Patakatifu pa Mama Yetu wa Lourdes', de: 'Heiligtum Unserer Lieben Frau von Lourdes',
      it: 'Santuario di Nostra Signora di Lourdes', pl: 'Sanktuarium Matki Bożej w Lourdes'
    },
    church: 'roman-catholic', countryCode: 'FR', locality: 'Lourdes', latitude: 43.0976, longitude: -0.0584, kind: 'shrine',
    sourceUrl: 'https://www.lourdes-france.org/en/',
    calendarRelation: {
      en: 'Our Lady of Lourdes and organized pilgrimages', pt: 'Nossa Senhora de Lourdes e peregrinações organizadas',
      es: 'Nuestra Señora de Lourdes y peregrinaciones organizadas', fr: 'Notre-Dame de Lourdes et pèlerinages organisés',
      fil: 'Mahal na Birhen ng Lourdes at mga organisadong peregrinasyon', ru: 'Богоматерь Лурдская и организованные паломничества',
      sw: 'Mama Yetu wa Lourdes na hija zilizopangwa', de: 'Unsere Liebe Frau von Lourdes und organisierte Pilgerfahrten',
      it: 'Nostra Signora di Lourdes e pellegrinaggi organizzati', pl: 'Matka Boża z Lourdes i zorganizowane pielgrzymki'
    },
    verification: 'official-source'
  },
  {
    id: 'santiago',
    names: {
      en: 'Cathedral of Santiago de Compostela', pt: 'Catedral de Santiago de Compostela', es: 'Catedral de Santiago de Compostela', fr: 'Cathédrale de Saint-Jacques-de-Compostelle',
      fil: 'Katedral ng Santiago de Compostela', ru: 'Собор Святого Иакова в Сантьяго-де-Компостела', sw: 'Kanisa Kuu la Santiago de Compostela', de: 'Kathedrale von Santiago de Compostela',
      it: 'Cattedrale di Santiago de Compostela', pl: 'Katedra w Santiago de Compostela'
    },
    church: 'roman-catholic', countryCode: 'ES', locality: 'Santiago de Compostela', latitude: 42.8806, longitude: -8.5446, kind: 'cathedral',
    sourceUrl: 'https://catedraldesantiago.es/en/pilgrimage/',
    calendarRelation: {
      en: 'Saint James the Greater and the Camino de Santiago', pt: 'São Tiago Maior e o Caminho de Santiago', es: 'Santiago el Mayor y el Camino de Santiago',
      fr: 'Saint Jacques le Majeur et le chemin de Saint-Jacques', fil: 'Santiago Apostol at ang Camino de Santiago', ru: 'Апостол Иаков Зеведеев и Путь Святого Иакова',
      sw: 'Mtakatifu Yakobo Mkuu na Njia ya Santiago', de: 'Jakobus der Ältere und der Jakobsweg', it: 'San Giacomo Maggiore e il Cammino di Santiago',
      pl: 'Święty Jakub Większy i Droga św. Jakuba'
    },
    verification: 'official-source'
  },
  {
    id: 'holy-etchmiadzin',
    names: {
      en: 'Mother See of Holy Etchmiadzin', pt: 'Santa Sé de Etchmiadzin', es: 'Santa Sede de Echmiadzin', fr: 'Saint-Siège d’Etchmiadzin',
      fil: 'Inang Luklukan ng Banal na Etchmiadzin', ru: 'Первопрестольный Святой Эчмиадзин', sw: 'Makao Makuu ya Etchmiadzin Takatifu', de: 'Muttersee des Heiligen Etschmiadsin',
      it: 'Santa Sede Madre di Etchmiadzin', pl: 'Święta Stolica Macierzysta w Eczmiadzynie'
    },
    church: 'armenian-apostolic', countryCode: 'AM', locality: 'Vagharshapat', latitude: 40.1619, longitude: 44.2911, kind: 'mother-see',
    sourceUrl: 'https://www.armenianchurch.org/en/mother-see/',
    calendarRelation: {
      en: 'Mother Cathedral, relics and Armenian Apostolic pilgrimage days', pt: 'Catedral-Mãe, relíquias e dias de peregrinação da Igreja Apostólica Arménia',
      es: 'Catedral Madre, reliquias y días de peregrinación de la Iglesia Apostólica Armenia', fr: 'Cathédrale-mère, reliques et jours de pèlerinage de l’Église apostolique arménienne',
      fil: 'Inang Katedral, mga relikya at mga araw ng peregrinasyon ng Simbahang Apostolikong Armenyo', ru: 'Кафедральный собор, реликвии и дни паломничества Армянской Апостольской Церкви',
      sw: 'Kanisa Kuu Mama, masalia na siku za hija za Kanisa la Kitume la Armenia', de: 'Mutterkathedrale, Reliquien und Pilgertage der Armenischen Apostolischen Kirche',
      it: 'Cattedrale Madre, reliquie e giorni di pellegrinaggio della Chiesa Apostolica Armena', pl: 'Katedra macierzysta, relikwie i dni pielgrzymkowe Ormiańskiego Kościoła Apostolskiego'
    },
    verification: 'official-source'
  },
  {
    id: 'guadalupe-mexico',
    names: {
      en: 'Basilica of Our Lady of Guadalupe', pt: 'Basílica de Nossa Senhora de Guadalupe', es: 'Basílica de Santa María de Guadalupe', fr: 'Basilique Notre-Dame-de-Guadalupe',
      fil: 'Basilika ng Mahal na Birhen ng Guadalupe', ru: 'Базилика Богоматери Гваделупской', sw: 'Basilika ya Mama Yetu wa Guadalupe', de: 'Basilika Unserer Lieben Frau von Guadalupe',
      it: 'Basilica di Nostra Signora di Guadalupe', pl: 'Bazylika Matki Bożej z Guadalupe'
    },
    church: 'roman-catholic', countryCode: 'MX', locality: 'Mexico City', latitude: 19.4849, longitude: -99.1174, kind: 'shrine',
    sourceUrl: 'https://virgendeguadalupe.org.mx/peregrinaciones/',
    calendarRelation: {
      en: 'Our Lady of Guadalupe and official pilgrimages', pt: 'Nossa Senhora de Guadalupe e peregrinações oficiais', es: 'Nuestra Señora de Guadalupe y peregrinaciones oficiales',
      fr: 'Notre-Dame de Guadalupe et pèlerinages officiels', fil: 'Mahal na Birhen ng Guadalupe at mga opisyal na peregrinasyon', ru: 'Богоматерь Гваделупская и официальные паломничества',
      sw: 'Mama Yetu wa Guadalupe na hija rasmi', de: 'Unsere Liebe Frau von Guadalupe und offizielle Pilgerfahrten', it: 'Nostra Signora di Guadalupe e pellegrinaggi ufficiali',
      pl: 'Matka Boża z Guadalupe i oficjalne pielgrzymki'
    },
    verification: 'official-source'
  }
];

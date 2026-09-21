import type { Locale } from '../lib/i18n';
import type { AnnualDateEditorial } from './date-editorial';

export const DATE_EDITORIAL_BATCH_4: AnnualDateEditorial[] = [
  {
    monthDay: '09-21',
    observanceIds: ['matthew-apostle'],
    copy: {
      en: {
        eyebrow: 'Apostle · Gospel · discipleship',
        title: 'Saint Matthew, Apostle and Evangelist, on 21 September',
        lead: '21 September is the Roman Catholic feast of Saint Matthew, Apostle and Evangelist. The New Testament names Matthew among the Twelve and the Gospel according to Matthew presents his call from the tax office as a decisive movement from an old occupation into discipleship.',
        context: 'Christian tradition also associates the apostle Matthew with the first canonical Gospel, while historical reconstruction and ecclesial attribution are not identical claims. Santos do Dia therefore keeps those statements distinct, links the feast to the substantive Matthew profile and treats 21 September as the verified Roman Catholic calendar date without turning later preaching and martyrdom traditions into an exact chronology.',
      },
      pt: {
        eyebrow: 'Apóstolo · Evangelho · discipulado',
        title: 'S. Mateus, apóstolo e evangelista, a 21 de setembro',
        lead: '21 de setembro é a festa católica romana de S. Mateus, apóstolo e evangelista. O Novo Testamento inclui Mateus entre os Doze e o Evangelho segundo São Mateus apresenta o seu chamamento a partir da banca dos impostos como uma passagem decisiva de uma ocupação anterior para o discipulado.',
        context: 'A tradição cristã associa também o apóstolo Mateus ao primeiro Evangelho canónico, embora a reconstrução histórica e a atribuição eclesial não sejam afirmações idênticas. O Santos do Dia mantém essas afirmações distintas, liga a festa ao perfil substantivo de Mateus e trata 21 de setembro como a data verificada do calendário católico romano, sem transformar tradições posteriores sobre pregação e martírio numa cronologia exata.',
      },
      es: {
        eyebrow: 'Apóstol · Evangelio · discipulado',
        title: 'San Mateo, apóstol y evangelista, el 21 de septiembre',
        lead: 'El 21 de septiembre es la fiesta católica romana de san Mateo, apóstol y evangelista. El Nuevo Testamento incluye a Mateo entre los Doce y el Evangelio según Mateo presenta su llamada desde el puesto de recaudación como un paso decisivo de una ocupación anterior al discipulado.',
        context: 'La tradición cristiana también asocia al apóstol Mateo con el primer Evangelio canónico, aunque la reconstrucción histórica y la atribución eclesial no son afirmaciones idénticas. Santos do Dia mantiene separadas esas afirmaciones, vincula la fiesta con el perfil sustantivo de Mateo y trata el 21 de septiembre como fecha verificada del calendario católico romano, sin convertir tradiciones posteriores sobre predicación y martirio en una cronología exacta.',
      },
      it: {
        eyebrow: 'Apostolo · Vangelo · discepolato',
        title: 'San Matteo, apostolo ed evangelista, il 21 settembre',
        lead: 'Il 21 settembre è la festa cattolica romana di san Matteo, apostolo ed evangelista. Il Nuovo Testamento include Matteo tra i Dodici e il Vangelo secondo Matteo presenta la sua chiamata dal banco delle imposte come un passaggio decisivo da una precedente occupazione al discepolato.',
        context: 'La tradizione cristiana associa inoltre l’apostolo Matteo al primo Vangelo canonico, anche se ricostruzione storica e attribuzione ecclesiale non sono affermazioni identiche. Santos do Dia mantiene distinti questi livelli, collega la festa al profilo sostanziale di Matteo e considera il 21 settembre come data verificata del calendario cattolico romano, senza trasformare le tradizioni successive sulla predicazione e sul martirio in una cronologia esatta.',
      },
    },
  },
];

export function getAnnualDateEditorialBatch4(monthDay: string, locale: Locale) {
  const entry = DATE_EDITORIAL_BATCH_4.find(item => item.monthDay === monthDay);
  const copy = entry?.copy[locale];
  return entry && copy ? { ...entry, ...copy } : undefined;
}

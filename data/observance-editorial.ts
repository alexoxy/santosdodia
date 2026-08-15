import type { Locale } from '../lib/i18n';

export type ObservanceEditorialSource = {
  id: string;
  label: string;
  url: string;
  authority: 'official';
};

export type ObservanceEditorialEntry = {
  canonicalIds: string[];
  summaries: Partial<Record<Locale, string>>;
  sources: ObservanceEditorialSource[];
  status: 'reviewed';
  lastVerified: string;
};

// Editorial explainers are intentionally separate from the calendar engine. Calendar facts
// decide that an observance occurs; this registry explains what that observance means to a
// reader. Text is original Santos do Dia editorial copy grounded in the listed sources.
export const OBSERVANCE_EDITORIAL: ObservanceEditorialEntry[] = [
  {
    canonicalIds: ['rc:DedicationStMaryMajor', 'DedicationStMaryMajor'],
    summaries: {
      pt: 'A Dedicação da Basílica de Santa Maria Maior, celebrada a 5 de agosto, recorda uma das quatro basílicas papais de Roma e um dos mais antigos grandes santuários marianos do Ocidente. A atual basílica, no monte Esquilino, remonta ao século V e a sua construção está ligada ao Concílio de Éfeso de 431, que afirmou solenemente Maria como Theotokos, Mãe de Deus. Paulo VI assinalou esta celebração entre as memórias marianas de origem local que adquiriram uma relevância mais ampla na Igreja.\n\nA festa está também associada à antiga tradição de Nossa Senhora das Neves. Segundo essa tradição, uma queda de neve extraordinária no monte Esquilino, em pleno verão romano, teria indicado ao Papa Libério o local de uma igreja dedicada à Virgem. A Basílica conserva esta memória todos os anos: durante as celebrações de 5 de agosto, pétalas brancas descem do teto evocando simbolicamente a neve. A tradição da neve pertence à história devocional da festa; a basílica atual é a construção do século V ligada ao pontificado de Sisto III.',
      en: 'The Dedication of the Basilica of Saint Mary Major, observed on 5 August, commemorates one of Rome’s four papal basilicas and one of the great ancient Marian shrines of the West. The present basilica on the Esquiline Hill dates from the fifth century, and its construction is connected with the Council of Ephesus in 431, which solemnly affirmed Mary as Theotokos, Mother of God. Paul VI listed this celebration among Marian observances that began with a local cult and later acquired wider importance in the Church.\n\nThe feast is also associated with the ancient tradition of Our Lady of the Snows. According to that tradition, an extraordinary summer snowfall on the Esquiline indicated to Pope Liberius the site of a church dedicated to the Virgin. The Basilica still recalls this tradition each 5 August, when white petals fall from the ceiling during the liturgy as a symbolic snowfall. The snow story belongs to the devotional tradition of the feast; the present basilica is the fifth-century building associated with the pontificate of Sixtus III.',
      es: 'La Dedicación de la Basílica de Santa María la Mayor, celebrada el 5 de agosto, recuerda una de las cuatro basílicas papales de Roma y uno de los grandes y antiguos santuarios marianos de Occidente. La basílica actual, en el monte Esquilino, data del siglo V y su construcción está vinculada al Concilio de Éfeso de 431, que afirmó solemnemente a María como Theotokos, Madre de Dios. Pablo VI incluyó esta celebración entre las memorias marianas nacidas de un culto local que alcanzaron después una relevancia más amplia en la Iglesia.\n\nLa fiesta está también vinculada a la antigua tradición de Nuestra Señora de las Nieves. Según esta tradición, una extraordinaria nevada de verano sobre el Esquilino habría indicado al papa Liberio el lugar de una iglesia dedicada a la Virgen. La Basílica conserva cada 5 de agosto esta memoria: durante la liturgia caen pétalos blancos desde el techo para evocar simbólicamente la nieve. El relato de la nevada pertenece a la tradición devocional de la fiesta; la basílica actual es la construcción del siglo V asociada al pontificado de Sixto III.',
      fr: 'La Dédicace de la basilique Sainte-Marie-Majeure, célébrée le 5 août, commémore l’une des quatre basiliques papales de Rome et l’un des grands sanctuaires marials anciens de l’Occident. La basilique actuelle, sur l’Esquilin, remonte au Ve siècle et sa construction est liée au concile d’Éphèse de 431, qui affirma solennellement Marie comme Theotokos, Mère de Dieu. Paul VI a cité cette célébration parmi les mémoires mariales issues d’un culte local qui ont ensuite acquis une portée plus large dans l’Église.\n\nLa fête est également associée à l’ancienne tradition de Notre-Dame des Neiges. Selon cette tradition, une chute de neige extraordinaire en plein été sur l’Esquilin aurait indiqué au pape Libère l’emplacement d’une église dédiée à la Vierge. La basilique en garde chaque année la mémoire le 5 août: des pétales blancs tombent du plafond pendant la liturgie pour évoquer symboliquement la neige. Le récit de la neige relève de la tradition dévotionnelle de la fête; la basilique actuelle est l’édifice du Ve siècle associé au pontificat de Sixte III.',
      it: 'La Dedicazione della Basilica di Santa Maria Maggiore, celebrata il 5 agosto, ricorda una delle quattro basiliche papali di Roma e uno dei grandi e antichi santuari mariani dell’Occidente. L’attuale basilica sull’Esquilino risale al V secolo e la sua costruzione è legata al Concilio di Efeso del 431, che affermò solennemente Maria come Theotokos, Madre di Dio. Paolo VI annoverò questa celebrazione tra le memorie mariane nate da un culto locale e divenute poi di più ampio rilievo nella Chiesa.\n\nLa festa è inoltre associata all’antica tradizione della Madonna della Neve. Secondo questa tradizione, una straordinaria nevicata estiva sull’Esquilino avrebbe indicato a papa Liberio il luogo di una chiesa dedicata alla Vergine. La Basilica conserva ogni anno questa memoria il 5 agosto: durante la liturgia petali bianchi cadono dal soffitto per evocare simbolicamente la neve. Il racconto della nevicata appartiene alla tradizione devozionale della festa; la basilica attuale è l’edificio del V secolo associato al pontificato di Sisto III.',
    },
    sources: [
      {
        id: 'smm-history',
        label: 'Basílica Papal de Santa Maria Maior — História',
        url: 'https://www.basilicasantamariamaggiore.va/pt/basilica/storia-e-arte.html',
        authority: 'official',
      },
      {
        id: 'vatican-smm-history',
        label: 'Santa Sé — Basílica Papal de Santa Maria Maior',
        url: 'https://press.vatican.va/various/basiliche/sm_maggiore/en/storia/interno.htm',
        authority: 'official',
      },
      {
        id: 'vatican-marialis-cultus',
        label: 'Santa Sé — Marialis Cultus',
        url: 'https://www.vatican.va/content/paul-vi/pt/apost_exhortations/documents/hf_p-vi_exh_19740202_marialis-cultus.html',
        authority: 'official',
      },
    ],
    status: 'reviewed',
    lastVerified: '2026-08-16',
  },
];

const EDITORIAL_BY_ID = new Map<string, ObservanceEditorialEntry>();
for (const entry of OBSERVANCE_EDITORIAL) {
  for (const id of entry.canonicalIds) EDITORIAL_BY_ID.set(id, entry);
}

export function getObservanceEditorial(id: string): ObservanceEditorialEntry | undefined {
  return EDITORIAL_BY_ID.get(String(id ?? '').trim());
}

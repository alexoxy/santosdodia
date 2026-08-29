import type { Locale } from '../lib/i18n';
import type { SaintBiography } from './saint-biographies';

type EditorialDepthExtension = {
  id: string;
  paragraphs: Partial<Record<Locale, string[]>>;
};

// Bounded first editorial-depth wave for AdSense remediation.
// These are SantosDia-authored explanatory paragraphs grounded in the existing
// reviewed biography sources and canonical relationships. They add synthesis;
// they do not replace provenance or create new canonical facts.
export const SAINT_BIOGRAPHY_EDITORIAL_DEPTH_WAVE_1: EditorialDepthExtension[] = [
  {
    id: 'anthony-lisbon',
    paragraphs: {
      en: [
        'Anthony’s profile also shows why SantosDia separates a historical person from the names and places by which that person is remembered. Lisbon belongs to his origin and early formation; Padua belongs to the final phase of his ministry and to the long history of his cult. These are not two saints. The calendar therefore links one person to the 13 June celebration while preserving the Portuguese and Italian contexts that shaped his public memory.',
      ],
      pt: [
        'O perfil de António mostra também por que razão o SantosDia separa uma pessoa histórica dos nomes e lugares pelos quais é recordada. Lisboa pertence à sua origem e primeira formação; Pádua corresponde à fase final do seu ministério e à longa história do seu culto. Não se trata de dois santos. O calendário liga, por isso, uma única pessoa à celebração de 13 de junho, preservando simultaneamente os contextos português e italiano que moldaram a sua memória pública.',
      ],
      es: [
        'El perfil de Antonio muestra también por qué SantosDia separa a una persona histórica de los nombres y lugares por los que es recordada. Lisboa pertenece a su origen y primera formación; Padua corresponde a la etapa final de su ministerio y a la larga historia de su culto. No se trata de dos santos. El calendario vincula por ello una sola persona con la celebración del 13 de junio y conserva a la vez los contextos portugués e italiano que moldearon su memoria pública.',
      ],
      it: [
        'Il profilo di Antonio mostra anche perché SantosDia separa una persona storica dai nomi e dai luoghi con cui viene ricordata. Lisbona appartiene alle sue origini e alla prima formazione; Padova alla fase finale del suo ministero e alla lunga storia del suo culto. Non si tratta di due santi. Il calendario collega quindi una sola persona alla celebrazione del 13 giugno, conservando insieme i contesti portoghese e italiano che ne hanno plasmato la memoria pubblica.',
      ],
    },
  },
  {
    id: 'mary-of-nazareth',
    paragraphs: {
      en: [
        'For calendar purposes, Mary is especially important because one person is connected with many observances whose meaning and rank depend on Church and jurisdiction. A feast can commemorate an event in her life, a theological title or a tradition-specific doctrine without creating a new personal identity. SantosDia therefore keeps Mary of Nazareth as one canonical person and attaches each Marian observance separately, allowing Catholic, Orthodox and other supported calendars to remain explicit rather than being collapsed into a single universal list.',
      ],
      pt: [
        'No calendário, Maria é um caso particularmente importante porque uma só pessoa se relaciona com numerosas celebrações cujo significado e grau dependem da Igreja e da jurisdição. Uma festa pode recordar um acontecimento da sua vida, um título teológico ou uma doutrina própria de determinada tradição sem criar uma nova identidade pessoal. O SantosDia mantém, por isso, Maria de Nazaré como uma única pessoa canónica e liga separadamente cada celebração mariana, permitindo que os calendários católico, ortodoxos e outros permaneçam explícitos em vez de serem fundidos numa lista universal.',
      ],
      es: [
        'En el calendario, María es un caso especialmente importante porque una sola persona está relacionada con numerosas celebraciones cuyo significado y rango dependen de la Iglesia y la jurisdicción. Una fiesta puede recordar un acontecimiento de su vida, un título teológico o una doctrina propia de una tradición sin crear una nueva identidad personal. SantosDia mantiene por ello a María de Nazaret como una única persona canónica y vincula por separado cada celebración mariana, permitiendo que los calendarios católico, ortodoxos y otros permanezcan explícitos en vez de fusionarse en una lista universal.',
      ],
      it: [
        'Nel calendario Maria è un caso particolarmente importante, perché una sola persona è collegata a numerose celebrazioni il cui significato e grado dipendono dalla Chiesa e dalla giurisdizione. Una festa può ricordare un evento della sua vita, un titolo teologico o una dottrina propria di una tradizione senza creare una nuova identità personale. SantosDia mantiene quindi Maria di Nazaret come un’unica persona canonica e collega separatamente ogni celebrazione mariana, lasciando espliciti i calendari cattolico, ortodossi e degli altri contesti supportati invece di fonderli in un elenco universale.',
      ],
    },
  },
  {
    id: 'joseph',
    paragraphs: {
      en: [
        'Joseph also illustrates the difference between a person and the observances attached to that person. The Roman calendar celebrates Joseph, Spouse of the Blessed Virgin Mary, on 19 March and Joseph the Worker on 1 May, but both refer to the same Gospel figure. SantosDia keeps the identity stable and represents the observances separately so that titles, dates, ranks and any jurisdictional calendar decisions can change without fragmenting the underlying person record.',
      ],
      pt: [
        'José ilustra também a diferença entre uma pessoa e as celebrações que lhe estão associadas. O calendário romano celebra São José, Esposo da Virgem Maria, a 19 de março e São José Operário a 1 de maio, mas ambas as celebrações se referem à mesma figura evangélica. O SantosDia mantém estável a identidade e representa separadamente as celebrações, para que títulos, datas, graus e eventuais decisões próprias de cada jurisdição possam variar sem fragmentar o registo da pessoa.',
      ],
      es: [
        'José ilustra también la diferencia entre una persona y las celebraciones vinculadas a ella. El calendario romano celebra a San José, esposo de la Virgen María, el 19 de marzo y a San José Obrero el 1 de mayo, pero ambas celebraciones se refieren a la misma figura evangélica. SantosDia mantiene estable la identidad y representa por separado las celebraciones, de modo que títulos, fechas, rangos y decisiones propias de cada jurisdicción puedan variar sin fragmentar el registro de la persona.',
      ],
      it: [
        'Giuseppe illustra anche la differenza tra una persona e le celebrazioni che le sono collegate. Il calendario romano celebra San Giuseppe, sposo della Vergine Maria, il 19 marzo e San Giuseppe Lavoratore il 1º maggio, ma entrambe le celebrazioni si riferiscono alla stessa figura evangelica. SantosDia mantiene stabile l’identità e rappresenta separatamente le celebrazioni, così che titoli, date, gradi e decisioni proprie delle diverse giurisdizioni possano variare senza frammentare il record della persona.',
      ],
    },
  },
  {
    id: 'peter-apostle',
    paragraphs: {
      en: [
        'Peter’s calendar identity is likewise broader than a single joint feast. The 29 June celebration links Peter and Paul because Christian liturgy remembers them together, but the sources, New Testament narratives and later ecclesial memory concerning each apostle remain distinct. Modelling the relationship in this way lets SantosDia explain both dimensions at once: why the liturgy joins the apostles on a common date and why a reader can still follow Peter’s own biography, names, biblical episodes and tradition-specific commemorations independently.',
      ],
      pt: [
        'A identidade de Pedro no calendário é igualmente mais ampla do que uma única festa conjunta. A celebração de 29 de junho liga Pedro e Paulo porque a liturgia cristã os recorda em conjunto, mas as fontes, as narrativas do Novo Testamento e a memória eclesial posterior relativas a cada apóstolo permanecem distintas. Este modelo permite ao SantosDia explicar as duas dimensões: por que razão a liturgia reúne os apóstolos numa data comum e por que motivo o leitor pode acompanhar separadamente a biografia, os nomes, os episódios bíblicos e as comemorações próprias de Pedro.',
      ],
      es: [
        'La identidad de Pedro en el calendario es igualmente más amplia que una única fiesta conjunta. La celebración del 29 de junio vincula a Pedro y Pablo porque la liturgia cristiana los recuerda juntos, pero las fuentes, los relatos del Nuevo Testamento y la memoria eclesial posterior sobre cada apóstol siguen siendo distintos. Este modelo permite a SantosDia explicar ambas dimensiones: por qué la liturgia reúne a los apóstoles en una fecha común y por qué el lector puede seguir por separado la biografía, los nombres, los episodios bíblicos y las conmemoraciones propias de Pedro.',
      ],
      it: [
        'L’identità di Pietro nel calendario è ugualmente più ampia di una sola festa comune. La celebrazione del 29 giugno collega Pietro e Paolo perché la liturgia cristiana li ricorda insieme, ma le fonti, i racconti del Nuovo Testamento e la successiva memoria ecclesiale relativa a ciascun apostolo restano distinti. Questo modello permette a SantosDia di spiegare entrambe le dimensioni: perché la liturgia riunisce gli apostoli in una data comune e perché il lettore può seguire separatamente la biografia, i nomi, gli episodi biblici e le commemorazioni proprie di Pietro.',
      ],
    },
  },
  {
    id: 'paul-apostle',
    paragraphs: {
      en: [
        'Paul’s letters also make his profile different from a simple calendar notice. They preserve his own voice across questions of mission, community life, conflict and Christian belief, while Acts provides a separate narrative framework for his journeys and preaching. SantosDia treats those source types as related but not interchangeable. The 29 June feast can therefore be explained as a liturgical observance shared with Peter without allowing the common date to obscure Paul’s independent textual record and historical identity.',
      ],
      pt: [
        'As cartas de Paulo tornam também o seu perfil muito diferente de uma simples nota de calendário. Conservam a sua própria voz em questões de missão, vida comunitária, conflito e fé cristã, enquanto os Atos oferecem um enquadramento narrativo distinto para as viagens e a pregação. O SantosDia trata estes tipos de fonte como relacionados, mas não intercambiáveis. A festa de 29 de junho pode, assim, ser explicada como celebração litúrgica partilhada com Pedro sem deixar que a data comum apague o registo textual e a identidade histórica próprios de Paulo.',
      ],
      es: [
        'Las cartas de Pablo hacen también que su perfil sea muy distinto de una simple nota de calendario. Conservan su propia voz en cuestiones de misión, vida comunitaria, conflicto y fe cristiana, mientras los Hechos ofrecen un marco narrativo diferente para sus viajes y predicación. SantosDia trata estos tipos de fuente como relacionados, pero no intercambiables. La fiesta del 29 de junio puede así explicarse como una celebración litúrgica compartida con Pedro sin permitir que la fecha común oculte el registro textual y la identidad histórica propios de Pablo.',
      ],
      it: [
        'Le lettere di Paolo rendono inoltre il suo profilo molto diverso da una semplice nota di calendario. Conservano la sua voce su missione, vita delle comunità, conflitti e fede cristiana, mentre gli Atti offrono un quadro narrativo distinto per i viaggi e la predicazione. SantosDia tratta questi tipi di fonte come collegati ma non intercambiabili. La festa del 29 giugno può così essere spiegata come celebrazione liturgica condivisa con Pietro senza lasciare che la data comune oscuri il record testuale e l’identità storica propri di Paolo.',
      ],
    },
  },
  {
    id: 'john-baptist',
    paragraphs: {
      en: [
        'John is another example of why the calendar model cannot equate a saint with one date. The person belongs to the Gospel narrative as prophet, preacher and forerunner, while 24 June commemorates specifically his Nativity. Keeping Person and Observance separate allows SantosDia to connect other legitimate commemorations of John in supported traditions without duplicating the person or implying that every Church uses the same dates. The biography remains stable while each calendar relationship carries its own authority and context.',
      ],
      pt: [
        'João é outro exemplo de por que razão o modelo do calendário não pode identificar um santo com uma única data. A pessoa pertence à narrativa evangélica como profeta, pregador e precursor, enquanto 24 de junho comemora especificamente a sua Natividade. Separar Pessoa e Celebração permite ao SantosDia ligar outras comemorações legítimas de João nas tradições suportadas sem duplicar a pessoa nem sugerir que todas as Igrejas usam as mesmas datas. A biografia mantém-se estável e cada relação com o calendário conserva a sua própria autoridade e contexto.',
      ],
      es: [
        'Juan es otro ejemplo de por qué el modelo del calendario no puede identificar a un santo con una sola fecha. La persona pertenece al relato evangélico como profeta, predicador y precursor, mientras el 24 de junio conmemora específicamente su Natividad. Separar Persona y Celebración permite a SantosDia vincular otras conmemoraciones legítimas de Juan en las tradiciones admitidas sin duplicar a la persona ni sugerir que todas las Iglesias usan las mismas fechas. La biografía permanece estable y cada relación con el calendario conserva su propia autoridad y contexto.',
      ],
      it: [
        'Giovanni è un altro esempio del motivo per cui il modello del calendario non può identificare un santo con una sola data. La persona appartiene al racconto evangelico come profeta, predicatore e precursore, mentre il 24 giugno commemora specificamente la sua Natività. Separare Persona e Celebrazione permette a SantosDia di collegare altre legittime commemorazioni di Giovanni nelle tradizioni supportate senza duplicare la persona né suggerire che tutte le Chiese usino le stesse date. La biografia resta stabile e ogni relazione con il calendario conserva la propria autorità e il proprio contesto.',
      ],
    },
  },
];

export function applySaintBiographyEditorialDepth(biography: SaintBiography): SaintBiography {
  const extension = SAINT_BIOGRAPHY_EDITORIAL_DEPTH_WAVE_1.find(item => item.id === biography.id);
  if (!extension) return biography;

  return {
    ...biography,
    paragraphs: Object.fromEntries(
      Object.entries(biography.paragraphs).map(([locale, paragraphs]) => [
        locale,
        [...(paragraphs ?? []), ...(extension.paragraphs[locale as Locale] ?? [])],
      ]),
    ) as SaintBiography['paragraphs'],
  };
}

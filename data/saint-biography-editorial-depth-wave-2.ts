import type { Locale } from '../lib/i18n';
import type { SaintBiography } from './saint-biographies';

type EditorialDepthExtension = {
  id: string;
  paragraphs: Partial<Record<Locale, string[]>>;
};

// Bounded second editorial-depth wave for AdSense remediation.
// These paragraphs are SantosDia-authored synthesis grounded in the existing
// reviewed biography sources and canonical relationships. They clarify how
// historical identity, textual tradition, cult and calendar observance relate
// without converting later devotional tradition into unsupported biography.
export const SAINT_BIOGRAPHY_EDITORIAL_DEPTH_WAVE_2: EditorialDepthExtension[] = [
  {
    id: 'andrew-apostle',
    paragraphs: {
      en: [
        'Andrew also demonstrates why an apostle cannot be reduced to a calendar label. The Gospel tradition identifies him as one of the Twelve and as Peter’s brother, while later Churches developed their own liturgical and devotional relationships with him. SantosDia keeps that personal identity separate from each observance: the biography can remain one record while a Roman feast, an Orthodox commemoration or a jurisdiction-specific celebration carries its own date, calendar system and authority. This makes differences between traditions visible instead of treating one calendar as universal.',
      ],
      pt: [
        'André mostra também por que razão um apóstolo não pode ser reduzido a uma etiqueta de calendário. A tradição evangélica identifica-o como um dos Doze e irmão de Pedro, enquanto diferentes Igrejas desenvolveram relações litúrgicas e devocionais próprias com a sua memória. O SantosDia separa essa identidade pessoal de cada celebração: a biografia permanece um único registo, enquanto uma festa romana, uma comemoração ortodoxa ou uma celebração própria de determinada jurisdição conserva a sua data, sistema de calendário e autoridade. Assim, as diferenças entre tradições tornam-se explícitas em vez de uma delas ser apresentada como universal.',
      ],
      es: [
        'Andrés muestra también por qué un apóstol no puede reducirse a una etiqueta de calendario. La tradición evangélica lo identifica como uno de los Doce y hermano de Pedro, mientras distintas Iglesias desarrollaron relaciones litúrgicas y devocionales propias con su memoria. SantosDia separa esa identidad personal de cada celebración: la biografía permanece como un único registro, mientras una fiesta romana, una conmemoración ortodoxa o una celebración propia de una jurisdicción conserva su fecha, sistema de calendario y autoridad. Así, las diferencias entre tradiciones quedan explícitas en vez de presentar una de ellas como universal.',
      ],
      it: [
        'Andrea mostra anche perché un apostolo non può essere ridotto a un’etichetta di calendario. La tradizione evangelica lo identifica come uno dei Dodici e fratello di Pietro, mentre Chiese diverse hanno sviluppato proprie relazioni liturgiche e devozionali con la sua memoria. SantosDia separa questa identità personale da ciascuna celebrazione: la biografia resta un solo record, mentre una festa romana, una commemorazione ortodossa o una celebrazione propria di una giurisdizione conserva data, sistema di calendario e autorità. In questo modo le differenze tra tradizioni restano esplicite invece di presentare un solo calendario come universale.',
      ],
    },
  },
  {
    id: 'james-greater',
    paragraphs: {
      en: [
        'James is especially useful for separating the New Testament person from the much larger history of devotion that grew around his name. The apostolic identity belongs to the Gospel and Acts tradition; pilgrimage, shrines and regional patronage belong to later layers of Christian memory and must be described with their own evidence. SantosDia can therefore connect the same person with his liturgical observance and with Santiago-related cultural history without making a pilgrimage tradition prove a biblical claim. Each layer remains useful, but its source and historical status stay visible.',
      ],
      pt: [
        'Tiago é particularmente útil para separar a pessoa do Novo Testamento da muito mais ampla história de devoção que cresceu em torno do seu nome. A identidade apostólica pertence à tradição dos Evangelhos e dos Atos; peregrinações, santuários e patronatos regionais pertencem a camadas posteriores da memória cristã e devem ser descritos com evidência própria. O SantosDia pode, assim, ligar a mesma pessoa à sua celebração litúrgica e à história cultural associada a Santiago sem fazer de uma tradição de peregrinação prova de uma afirmação bíblica. Cada camada mantém valor, mas também a sua fonte e estatuto histórico.',
      ],
      es: [
        'Santiago resulta especialmente útil para separar a la persona del Nuevo Testamento de la historia mucho más amplia de devoción que creció en torno a su nombre. La identidad apostólica pertenece a la tradición de los Evangelios y los Hechos; peregrinaciones, santuarios y patronazgos regionales pertenecen a capas posteriores de la memoria cristiana y deben describirse con evidencia propia. SantosDia puede así vincular a la misma persona con su celebración litúrgica y con la historia cultural asociada a Santiago sin convertir una tradición de peregrinación en prueba de una afirmación bíblica. Cada capa conserva su valor, su fuente y su estatuto histórico.',
      ],
      it: [
        'Giacomo è particolarmente utile per separare la persona del Nuovo Testamento dalla storia molto più ampia della devozione sviluppata intorno al suo nome. L’identità apostolica appartiene alla tradizione dei Vangeli e degli Atti; pellegrinaggi, santuari e patronati regionali appartengono a strati successivi della memoria cristiana e richiedono prove proprie. SantosDia può quindi collegare la stessa persona alla celebrazione liturgica e alla storia culturale legata a Santiago senza trasformare una tradizione di pellegrinaggio nella prova di un’affermazione biblica. Ogni livello resta utile, ma conserva la propria fonte e il proprio statuto storico.',
      ],
    },
  },
  {
    id: 'mark-evangelist',
    paragraphs: {
      en: [
        'Mark’s profile also requires a distinction between person, textual attribution and observance. Christian tradition associates Mark with the Gospel that bears his name, but the calendar commemorates a person rather than a book. SantosDia therefore records the biographical tradition and the textual association as related claims while keeping the liturgical observance as a separate calendar object. That structure allows a reader to understand why Mark is called an Evangelist, why he has a feast in a particular Church, and which part of the account comes from early Christian tradition rather than from the calendar itself.',
      ],
      pt: [
        'O perfil de Marcos exige também distinguir pessoa, atribuição textual e celebração. A tradição cristã associa Marcos ao Evangelho que leva o seu nome, mas o calendário comemora uma pessoa e não um livro. O SantosDia regista, por isso, a tradição biográfica e a associação textual como afirmações relacionadas, mantendo a celebração litúrgica como objeto de calendário separado. Esta estrutura permite compreender por que razão Marcos é chamado Evangelista, por que tem uma festa numa determinada Igreja e que parte do relato provém da tradição cristã antiga, em vez de ser inferida simplesmente a partir do calendário.',
      ],
      es: [
        'El perfil de Marcos exige también distinguir persona, atribución textual y celebración. La tradición cristiana asocia a Marcos con el Evangelio que lleva su nombre, pero el calendario conmemora a una persona y no a un libro. SantosDia registra por ello la tradición biográfica y la asociación textual como afirmaciones relacionadas, manteniendo la celebración litúrgica como un objeto de calendario separado. Esta estructura permite comprender por qué Marcos es llamado Evangelista, por qué tiene una fiesta en una Iglesia determinada y qué parte del relato procede de la tradición cristiana antigua en vez de inferirse simplemente del calendario.',
      ],
      it: [
        'Il profilo di Marco richiede anche di distinguere persona, attribuzione testuale e celebrazione. La tradizione cristiana associa Marco al Vangelo che porta il suo nome, ma il calendario commemora una persona e non un libro. SantosDia registra quindi la tradizione biografica e l’associazione testuale come affermazioni collegate, mantenendo la celebrazione liturgica come oggetto di calendario separato. Questa struttura permette di capire perché Marco sia chiamato Evangelista, perché abbia una festa in una determinata Chiesa e quale parte del racconto provenga dalla tradizione cristiana antica invece di essere dedotta semplicemente dal calendario.',
      ],
    },
  },
  {
    id: 'luke-evangelist',
    paragraphs: {
      en: [
        'Luke likewise sits at the intersection of biography, authorship tradition and liturgical memory. Christian tradition links his name with the Gospel of Luke and Acts, while the feast concerns the remembered evangelist himself. SantosDia does not turn that traditional attribution into a claim produced by the calendar. Instead it presents the textual relationship with its proper historical framing and keeps the observance independently sourced. The result is a profile that can explain both Luke’s place in Christian literary memory and the different ways Churches place his commemoration in their calendars.',
      ],
      pt: [
        'Lucas situa-se igualmente no cruzamento entre biografia, tradição de autoria e memória litúrgica. A tradição cristã liga o seu nome ao Evangelho de Lucas e aos Atos dos Apóstolos, enquanto a festa diz respeito ao evangelista recordado pela Igreja. O SantosDia não transforma essa atribuição tradicional numa afirmação produzida pelo calendário. Apresenta antes a relação textual com o enquadramento histórico adequado e mantém a celebração sustentada pelas suas próprias fontes. O perfil consegue, assim, explicar simultaneamente o lugar de Lucas na memória literária cristã e as diferentes formas como as Igrejas situam a sua comemoração nos respetivos calendários.',
      ],
      es: [
        'Lucas se sitúa igualmente en la intersección entre biografía, tradición de autoría y memoria litúrgica. La tradición cristiana vincula su nombre con el Evangelio de Lucas y los Hechos de los Apóstoles, mientras la fiesta se refiere al evangelista recordado por la Iglesia. SantosDia no convierte esa atribución tradicional en una afirmación producida por el calendario. Presenta la relación textual con su marco histórico adecuado y mantiene la celebración sustentada por sus propias fuentes. El perfil puede así explicar tanto el lugar de Lucas en la memoria literaria cristiana como las distintas maneras en que las Iglesias sitúan su conmemoración en sus calendarios.',
      ],
      it: [
        'Luca si trova ugualmente all’incrocio tra biografia, tradizione di attribuzione e memoria liturgica. La tradizione cristiana collega il suo nome al Vangelo di Luca e agli Atti degli Apostoli, mentre la festa riguarda l’evangelista ricordato dalla Chiesa. SantosDia non trasforma tale attribuzione tradizionale in un’affermazione prodotta dal calendario. Presenta invece il rapporto testuale con il corretto inquadramento storico e mantiene la celebrazione sostenuta dalle proprie fonti. Il profilo può così spiegare sia il posto di Luca nella memoria letteraria cristiana sia i diversi modi in cui le Chiese collocano la sua commemorazione nei rispettivi calendari.',
      ],
    },
  },
  {
    id: 'stephen-first-martyr',
    paragraphs: {
      en: [
        'Stephen’s profile is anchored unusually clearly in a narrative source: Acts presents his ministry, speech and death and gives Christian tradition the basis for remembering him as the first martyr. The liturgical calendar is a later act of commemoration, not the source of that biography. SantosDia keeps those layers distinct so that a reader can move from the New Testament account to the history of the feast without confusing evidence with observance. It also allows different Churches and calendar systems to attach their own commemorations to the same canonical person rather than creating duplicate Stephens.',
      ],
      pt: [
        'O perfil de Estêvão possui uma âncora narrativa particularmente clara: os Atos dos Apóstolos apresentam o seu ministério, discurso e morte e dão à tradição cristã a base para o recordar como primeiro mártir. O calendário litúrgico é um ato posterior de comemoração, não a fonte dessa biografia. O SantosDia mantém estas camadas distintas, permitindo passar do relato do Novo Testamento para a história da festa sem confundir evidência com celebração. Permite também que diferentes Igrejas e sistemas de calendário associem as suas comemorações à mesma pessoa canónica, em vez de criarem vários registos de Estêvão.',
      ],
      es: [
        'El perfil de Esteban posee un anclaje narrativo especialmente claro: los Hechos de los Apóstoles presentan su ministerio, discurso y muerte y proporcionan a la tradición cristiana la base para recordarlo como primer mártir. El calendario litúrgico es un acto posterior de conmemoración, no la fuente de esa biografía. SantosDia mantiene estas capas separadas, permitiendo pasar del relato del Nuevo Testamento a la historia de la fiesta sin confundir evidencia con celebración. También permite que distintas Iglesias y sistemas de calendario vinculen sus conmemoraciones con la misma persona canónica en vez de crear varios registros de Esteban.',
      ],
      it: [
        'Il profilo di Stefano possiede un ancoraggio narrativo particolarmente chiaro: gli Atti degli Apostoli presentano il suo ministero, il discorso e la morte e offrono alla tradizione cristiana la base per ricordarlo come primo martire. Il calendario liturgico è un successivo atto di commemorazione, non la fonte di quella biografia. SantosDia mantiene distinti questi livelli, permettendo di passare dal racconto del Nuovo Testamento alla storia della festa senza confondere prova e celebrazione. Consente inoltre a Chiese e sistemi di calendario diversi di collegare le proprie commemorazioni alla stessa persona canonica invece di creare più record di Stefano.',
      ],
    },
  },
  {
    id: 'george',
    paragraphs: {
      en: [
        'George also requires careful editorial separation between early cult and later legend. His veneration became exceptionally widespread, while many familiar narrative details belong to devotional traditions that developed long after the period in which the martyr is placed. SantosDia does not use the popularity of those stories as evidence that every episode is historical. The profile can therefore acknowledge the strength and geographical reach of George’s Christian memory, identify legendary material as such, and still connect one canonical person with the observances, patronal associations and jurisdictional calendars that can be independently evidenced.',
      ],
      pt: [
        'Jorge exige também uma separação editorial cuidadosa entre culto antigo e lenda posterior. A sua veneração tornou-se extraordinariamente difundida, enquanto muitos dos episódios narrativos mais conhecidos pertencem a tradições devocionais desenvolvidas muito depois da época em que o mártir é situado. O SantosDia não usa a popularidade dessas histórias como prova de que todos os episódios sejam históricos. O perfil pode, assim, reconhecer a força e a extensão geográfica da memória cristã de Jorge, identificar como lendário o material que o é e continuar a ligar uma única pessoa canónica às celebrações, patronatos e calendários jurisdicionais que possam ser documentados de forma independente.',
      ],
      es: [
        'Jorge exige también una separación editorial cuidadosa entre culto antiguo y leyenda posterior. Su veneración llegó a estar extraordinariamente extendida, mientras muchos de los episodios narrativos más conocidos pertenecen a tradiciones devocionales desarrolladas mucho después de la época en que se sitúa al mártir. SantosDia no utiliza la popularidad de esas historias como prueba de que todos los episodios sean históricos. El perfil puede así reconocer la fuerza y la extensión geográfica de la memoria cristiana de Jorge, identificar como legendario el material que lo sea y seguir vinculando una única persona canónica con celebraciones, patronazgos y calendarios jurisdiccionales documentados de forma independiente.',
      ],
      it: [
        'Giorgio richiede inoltre un’attenta separazione editoriale tra culto antico e leggenda successiva. La sua venerazione divenne eccezionalmente diffusa, mentre molti degli episodi narrativi più noti appartengono a tradizioni devozionali sviluppate molto dopo l’epoca in cui viene collocato il martire. SantosDia non usa la popolarità di questi racconti come prova che ogni episodio sia storico. Il profilo può quindi riconoscere la forza e l’ampiezza geografica della memoria cristiana di Giorgio, identificare come leggendario il materiale che lo è e continuare a collegare un’unica persona canonica alle celebrazioni, ai patronati e ai calendari giurisdizionali documentabili in modo indipendente.',
      ],
    },
  },
];

export function applySaintBiographyEditorialDepthWave2(biography: SaintBiography): SaintBiography {
  const extension = SAINT_BIOGRAPHY_EDITORIAL_DEPTH_WAVE_2.find(item => item.id === biography.id);
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

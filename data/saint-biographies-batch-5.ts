import type { SaintBiography } from './saint-biographies';

const VATICAN_MATTHEW = 'https://www.vaticannews.va/en/saints/09/21/st---mattew--apostle-and-evangelist.html';
const HOLY_SEE_MATTHEW = 'https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20060830.html';
const OCA_MATTHEW = 'https://www.oca.org/saints/lives/2007/11/16/103313-apostle-and-evangelist-matthew';
const VATICAN_THOMAS_AQUINAS = 'https://www.vaticannews.va/en/saints/01/28/st--thomas-aquinas.html';
const HOLY_SEE_THOMAS_AQUINAS = 'https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100602.html';
const VATICAN_CATHERINE_SIENA = 'https://www.vaticannews.va/en/saints/04/29/st--cahterine-of-siena--virgin--doctor-of-the-church--patron-of-.html';
const HOLY_SEE_CATHERINE_SIENA = 'https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20101124.html';
const VATICAN_ELIZABETH_PORTUGAL = 'https://www.vaticannews.va/en/saints/07/04/st--elisabeth--isabel--of-portugal.html';
const LISBON_ELIZABETH_PORTUGAL = 'https://www.patriarcado-lisboa.pt/site/index.php?cont_=40&id=13273&tem=860';
const VATICAN_GREGORY = 'https://www.vaticannews.va/en/saints/09/03/st--gregory-the-great--pope-and-doctor-of-the-church.html';
const VATICAN_GREGORY_PT = 'https://www.vaticannews.va/pt/santo-do-dia/09/03/s--gregorio-magno--papa-e-doutor-da-igreja.html';
const HOLY_SEE_GREGORY = 'https://www.vatican.va/content/benedict-xvi/en/audiences/2008/documents/hf_ben-xvi_aud_20080528.html';

const matthew: SaintBiography = {
  id: 'matthew-apostle',
  title: {
    en: 'Saint Matthew, Apostle and Evangelist',
    pt: 'S. Mateus, apóstolo e evangelista',
    es: 'San Mateo, apóstol y evangelista',
    it: 'San Matteo, apostolo ed evangelista',
  },
  summary: {
    en: 'Matthew is remembered as one of the Twelve Apostles and, in Christian tradition, as the evangelist associated with the first Gospel. His call from the tax office became an enduring image of conversion, discipleship and mercy.',
    pt: 'Mateus é recordado como um dos Doze Apóstolos e, na tradição cristã, como o evangelista associado ao primeiro Evangelho. O seu chamamento a partir da banca dos impostos tornou-se uma imagem duradoura de conversão, discipulado e misericórdia.',
    es: 'Mateo es recordado como uno de los Doce Apóstoles y, en la tradición cristiana, como el evangelista asociado al primer Evangelio. Su llamada desde el puesto de recaudación se convirtió en una imagen duradera de conversión, discipulado y misericordia.',
    it: 'Matteo è ricordato come uno dei Dodici Apostoli e, nella tradizione cristiana, come l’evangelista associato al primo Vangelo. La sua chiamata dal banco delle imposte è divenuta un’immagine duratura di conversione, discepolato e misericordia.',
  },
  paragraphs: {
    en: [
      'The New Testament lists Matthew among the Twelve. In the Gospel according to Matthew, Jesus sees a man named Matthew at the tax office and calls him to follow; Mark and Luke describe a similar calling of Levi. Christian tradition came to identify these figures and to receive the apostle Matthew as the evangelist associated with the first canonical Gospel. The textual tradition and the historical reconstruction are not identical claims, so Santos do Dia presents the apostolic identity and the attribution of the Gospel as related but separately sourced assertions.',
      'The calling story places a tax collector inside the circle of disciples and is followed by a meal with tax collectors and sinners. The episode therefore became an important Christian image of mercy that changes a person’s direction and opens a new vocation. Later traditions describe Matthew preaching beyond Judea and dying as a witness to Christ, but the surviving accounts differ on places and circumstances. Those details should be labelled as tradition rather than converted into an exact modern chronology.',
      'The same Christian person is remembered on different liturgical dates. In the Roman Catholic calendar used in Portugal, Saint Matthew is celebrated as apostle and evangelist on 21 September. The Orthodox Church in America commemorates the Apostle and Evangelist Matthew on 16 November. Santos do Dia keeps one stable person identity while representing each observance with its own tradition, jurisdiction, calendar system and date.',
    ],
    pt: [
      'O Novo Testamento inclui Mateus entre os Doze. No Evangelho segundo São Mateus, Jesus vê um homem chamado Mateus na banca dos impostos e convida-o a segui-lo; Marcos e Lucas narram um chamamento semelhante de Levi. A tradição cristã veio a identificar estas figuras e a receber o apóstolo Mateus como o evangelista associado ao primeiro Evangelho canónico. A tradição textual e a reconstrução histórica não são afirmações idênticas; por isso, o Santos do Dia apresenta a identidade apostólica e a atribuição do Evangelho como afirmações relacionadas, mas sustentadas separadamente.',
      'O relato do chamamento coloca um cobrador de impostos no círculo dos discípulos e é seguido por uma refeição com publicanos e pecadores. O episódio tornou-se, assim, uma imagem cristã importante da misericórdia que muda a direção de uma vida e abre uma nova vocação. Tradições posteriores descrevem Mateus a pregar fora da Judeia e a morrer como testemunha de Cristo, mas os relatos conservados divergem quanto aos lugares e às circunstâncias. Esses elementos devem ser identificados como tradição, e não transformados numa cronologia moderna exata.',
      'A mesma pessoa cristã é recordada em datas litúrgicas diferentes. No calendário católico romano usado em Portugal, S. Mateus é celebrado como apóstolo e evangelista a 21 de setembro. A Orthodox Church in America comemora o Apóstolo e Evangelista Mateus a 16 de novembro. O Santos do Dia mantém uma identidade pessoal estável e representa cada celebração com a sua tradição, jurisdição, sistema de calendário e data próprios.',
    ],
    es: [
      'El Nuevo Testamento incluye a Mateo entre los Doce. En el Evangelio según san Mateo, Jesús ve a un hombre llamado Mateo en el puesto de recaudación y lo llama a seguirlo; Marcos y Lucas narran una llamada semejante de Leví. La tradición cristiana llegó a identificar estas figuras y a recibir al apóstol Mateo como el evangelista asociado al primer Evangelio canónico. La tradición textual y la reconstrucción histórica no son afirmaciones idénticas; por eso, Santos do Dia presenta la identidad apostólica y la atribución del Evangelio como afirmaciones relacionadas, pero respaldadas por separado.',
      'El relato de la llamada sitúa a un recaudador de impuestos dentro del círculo de los discípulos y continúa con una comida junto a publicanos y pecadores. El episodio se convirtió así en una importante imagen cristiana de la misericordia que cambia el rumbo de una vida y abre una nueva vocación. Tradiciones posteriores describen a Mateo predicando fuera de Judea y muriendo como testigo de Cristo, pero los relatos conservados difieren sobre lugares y circunstancias. Esos elementos deben identificarse como tradición y no convertirse en una cronología moderna exacta.',
      'La misma persona cristiana es recordada en fechas litúrgicas diferentes. En el calendario católico romano usado en Portugal, san Mateo se celebra como apóstol y evangelista el 21 de septiembre. La Orthodox Church in America conmemora al Apóstol y Evangelista Mateo el 16 de noviembre. Santos do Dia mantiene una identidad personal estable y representa cada celebración con su propia tradición, jurisdicción, sistema de calendario y fecha.',
    ],
    it: [
      'Il Nuovo Testamento include Matteo tra i Dodici. Nel Vangelo secondo Matteo, Gesù vede un uomo chiamato Matteo al banco delle imposte e lo invita a seguirlo; Marco e Luca narrano una chiamata simile di Levi. La tradizione cristiana giunse a identificare queste figure e ad accogliere l’apostolo Matteo come l’evangelista associato al primo Vangelo canonico. La tradizione testuale e la ricostruzione storica non sono affermazioni identiche; Santos do Dia presenta quindi l’identità apostolica e l’attribuzione del Vangelo come affermazioni collegate, ma sostenute separatamente.',
      'Il racconto della chiamata colloca un esattore delle imposte nel gruppo dei discepoli e prosegue con un pasto insieme a pubblicani e peccatori. L’episodio divenne così un’importante immagine cristiana della misericordia che cambia la direzione di una vita e apre una nuova vocazione. Tradizioni successive descrivono Matteo mentre predica fuori dalla Giudea e muore come testimone di Cristo, ma i racconti conservati divergono sui luoghi e sulle circostanze. Questi elementi devono essere indicati come tradizione e non trasformati in una cronologia moderna esatta.',
      'La stessa persona cristiana è ricordata in date liturgiche diverse. Nel calendario cattolico romano usato in Portogallo, san Matteo è celebrato come apostolo ed evangelista il 21 settembre. La Orthodox Church in America commemora l’Apostolo ed Evangelista Matteo il 16 novembre. Santos do Dia mantiene una sola identità personale stabile e rappresenta ogni celebrazione con la propria tradizione, giurisdizione, sistema di calendario e data.',
    ],
  },
  facts: [
    {
      label: { en: 'Biblical names', pt: 'Nomes bíblicos', es: 'Nombres bíblicos', it: 'Nomi biblici' },
      value: { en: 'Matthew; traditionally identified with Levi', pt: 'Mateus; tradicionalmente identificado com Levi', es: 'Mateo; tradicionalmente identificado con Leví', it: 'Matteo; tradizionalmente identificato con Levi' },
    },
    {
      label: { en: 'Remembered as', pt: 'Recordado como', es: 'Recordado como', it: 'Ricordato come' },
      value: { en: 'Apostle and Evangelist', pt: 'Apóstolo e evangelista', es: 'Apóstol y evangelista', it: 'Apostolo ed evangelista' },
    },
    {
      label: { en: 'Gospel occupation', pt: 'Atividade no Evangelho', es: 'Actividad en el Evangelio', it: 'Attività nel Vangelo' },
      value: { en: 'Tax collector', pt: 'Cobrador de impostos', es: 'Recaudador de impuestos', it: 'Esattore delle imposte' },
    },
    {
      label: { en: 'Selected observances', pt: 'Celebrações selecionadas', es: 'Celebraciones seleccionadas', it: 'Celebrazioni selezionate' },
      value: { en: '21 September · Roman Catholic; 16 November · OCA', pt: '21 de setembro · católica romana; 16 de novembro · OCA', es: '21 de septiembre · católica romana; 16 de noviembre · OCA', it: '21 settembre · cattolica romana; 16 novembre · OCA' },
    },
  ],
  sources: [
    { name: 'Saint Matthew, Apostle and Evangelist', url: VATICAN_MATTHEW, language: 'en', publisher: 'Vatican News' },
    { name: 'The Apostles — Matthew', url: HOLY_SEE_MATTHEW, language: 'en', publisher: 'Holy See' },
    { name: 'Apostle and Evangelist Matthew', url: OCA_MATTHEW, language: 'en', publisher: 'Orthodox Church in America' },
  ],
  verifiedAt: '2026-08-22',
};

const thomasAquinas: SaintBiography = {
  id: 'thomas-aquinas',
  title: {
    en: 'Saint Thomas Aquinas, Priest and Doctor of the Church',
    pt: 'S. Tomás de Aquino, presbítero e doutor da Igreja',
    es: 'Santo Tomás de Aquino, presbítero y doctor de la Iglesia',
    it: 'San Tommaso d’Aquino, presbitero e dottore della Chiesa',
  },
  summary: {
    en: 'Thomas Aquinas was a Dominican priest and theologian whose careful dialogue between Christian faith, Scripture and philosophy shaped centuries of Catholic thought. The Church remembers him as a Doctor of the Church on 28 January.',
    pt: 'Tomás de Aquino foi um presbítero dominicano e teólogo cujo diálogo rigoroso entre a fé cristã, a Escritura e a filosofia marcou séculos de pensamento católico. A Igreja recorda-o como doutor da Igreja a 28 de janeiro.',
    es: 'Tomás de Aquino fue un presbítero dominico y teólogo cuyo diálogo riguroso entre la fe cristiana, la Escritura y la filosofía marcó siglos de pensamiento católico. La Iglesia lo recuerda como doctor de la Iglesia el 28 de enero.',
    it: 'Tommaso d’Aquino fu un presbitero domenicano e teologo il cui rigoroso dialogo tra fede cristiana, Scrittura e filosofia segnò secoli di pensiero cattolico. La Chiesa lo ricorda come dottore della Chiesa il 28 gennaio.',
  },
  paragraphs: {
    en: [
      'Thomas was born in 1224 or 1225 at Roccasecca, near Aquino. After an early education at Monte Cassino, he studied at Naples and entered the Order of Preachers despite opposition from his family. His formation continued in Paris and Cologne under Albert the Great. He later taught in Paris and several Italian cities, combining academic work with the life and ministry of a Dominican priest.',
      'His theology drew deeply on Scripture and the Fathers of the Church while engaging seriously with the philosophy of Aristotle. Thomas argued that sound reasoning and revealed faith cannot ultimately contradict one another because both truth and the human capacity to know have their source in God. He wrote biblical commentaries and began the Summa Theologiae, preached to ordinary congregations and contributed to the liturgical tradition associated with the feast of Corpus Christi.',
      'In December 1273, after an intense spiritual experience, Thomas stopped writing. He died in 1274 at the Cistercian abbey of Fossanova while travelling toward the Council of Lyons. The Catholic Church honours him as a priest and Doctor of the Church, and Catholic education has long looked to him as a patron. His Roman Catholic memorial is kept on 28 January.',
    ],
    pt: [
      'Tomás nasceu em 1224 ou 1225 em Roccasecca, perto de Aquino. Depois de uma primeira educação em Monte Cassino, estudou em Nápoles e entrou na Ordem dos Pregadores, apesar da oposição da família. Prosseguiu a formação em Paris e Colónia com Alberto Magno. Mais tarde ensinou em Paris e em várias cidades italianas, unindo o trabalho académico à vida e ao ministério de presbítero dominicano.',
      'A sua teologia mergulhou na Escritura e nos Padres da Igreja, ao mesmo tempo que dialogou seriamente com a filosofia de Aristóteles. Tomás defendeu que a razão bem conduzida e a fé revelada não podem, em última análise, contradizer-se, porque tanto a verdade como a capacidade humana de conhecer têm a sua origem em Deus. Escreveu comentários bíblicos, iniciou a Suma Teológica, pregou ao povo e contribuiu para a tradição litúrgica ligada à solenidade do Corpo de Deus.',
      'Em dezembro de 1273, depois de uma intensa experiência espiritual, Tomás deixou de escrever. Morreu em 1274 na abadia cisterciense de Fossanova, quando seguia para o Concílio de Lião. A Igreja Católica honra-o como presbítero e doutor da Igreja, e a educação católica reconhece-o há muito como padroeiro. A sua memória no calendário católico romano celebra-se a 28 de janeiro.',
    ],
    es: [
      'Tomás nació en 1224 o 1225 en Roccasecca, cerca de Aquino. Tras una primera educación en Montecasino, estudió en Nápoles e ingresó en la Orden de Predicadores pese a la oposición de su familia. Continuó su formación en París y Colonia con Alberto Magno. Más tarde enseñó en París y en varias ciudades italianas, uniendo el trabajo académico con la vida y el ministerio de un presbítero dominico.',
      'Su teología se nutrió profundamente de la Escritura y de los Padres de la Iglesia, al tiempo que dialogó seriamente con la filosofía de Aristóteles. Tomás sostuvo que la razón bien orientada y la fe revelada no pueden contradecirse en último término, porque tanto la verdad como la capacidad humana de conocer tienen su origen en Dios. Escribió comentarios bíblicos, inició la Suma Teológica, predicó al pueblo y contribuyó a la tradición litúrgica vinculada a la solemnidad del Corpus Christi.',
      'En diciembre de 1273, después de una intensa experiencia espiritual, Tomás dejó de escribir. Murió en 1274 en la abadía cisterciense de Fossanova, mientras viajaba hacia el Concilio de Lyon. La Iglesia católica lo honra como presbítero y doctor de la Iglesia, y la educación católica lo reconoce desde hace mucho como patrono. Su memoria en el calendario católico romano se celebra el 28 de enero.',
    ],
    it: [
      'Tommaso nacque nel 1224 o 1225 a Roccasecca, vicino ad Aquino. Dopo una prima educazione a Montecassino, studiò a Napoli ed entrò nell’Ordine dei Predicatori nonostante l’opposizione della famiglia. Proseguì la formazione a Parigi e Colonia con Alberto Magno. In seguito insegnò a Parigi e in diverse città italiane, unendo il lavoro accademico alla vita e al ministero di presbitero domenicano.',
      'La sua teologia attinse profondamente alla Scrittura e ai Padri della Chiesa, confrontandosi con serietà anche con la filosofia di Aristotele. Tommaso sostenne che la retta ragione e la fede rivelata non possono contraddirsi in ultima analisi, perché sia la verità sia la capacità umana di conoscere hanno origine in Dio. Scrisse commenti biblici, iniziò la Summa Theologiae, predicò al popolo e contribuì alla tradizione liturgica legata alla solennità del Corpus Domini.',
      'Nel dicembre 1273, dopo un’intensa esperienza spirituale, Tommaso smise di scrivere. Morì nel 1274 nell’abbazia cistercense di Fossanova, mentre viaggiava verso il Concilio di Lione. La Chiesa cattolica lo onora come presbitero e dottore della Chiesa, e l’educazione cattolica lo riconosce da lungo tempo come patrono. La sua memoria nel calendario cattolico romano ricorre il 28 gennaio.',
    ],
  },
  facts: [
    {
      label: { en: 'Birth', pt: 'Nascimento', es: 'Nacimiento', it: 'Nascita' },
      value: { en: 'c. 1224–1225 · Roccasecca near Aquino', pt: 'c. 1224–1225 · Roccasecca, perto de Aquino', es: 'c. 1224–1225 · Roccasecca, cerca de Aquino', it: 'c. 1224–1225 · Roccasecca, vicino ad Aquino' },
    },
    {
      label: { en: 'Religious order', pt: 'Ordem religiosa', es: 'Orden religiosa', it: 'Ordine religioso' },
      value: { en: 'Order of Preachers (Dominicans)', pt: 'Ordem dos Pregadores (Dominicanos)', es: 'Orden de Predicadores (Dominicos)', it: 'Ordine dei Predicatori (Domenicani)' },
    },
    {
      label: { en: 'Remembered as', pt: 'Recordado como', es: 'Recordado como', it: 'Ricordato come' },
      value: { en: 'Priest, theologian and Doctor of the Church', pt: 'Presbítero, teólogo e doutor da Igreja', es: 'Presbítero, teólogo y doctor de la Iglesia', it: 'Presbitero, teologo e dottore della Chiesa' },
    },
    {
      label: { en: 'Roman Catholic memorial', pt: 'Memória católica romana', es: 'Memoria católica romana', it: 'Memoria cattolica romana' },
      value: { en: '28 January', pt: '28 de janeiro', es: '28 de enero', it: '28 gennaio' },
    },
  ],
  sources: [
    { name: 'Saint Thomas Aquinas', url: VATICAN_THOMAS_AQUINAS, language: 'en', publisher: 'Vatican News' },
    { name: 'Saint Thomas Aquinas', url: HOLY_SEE_THOMAS_AQUINAS, language: 'en', publisher: 'Holy See' },
  ],
  verifiedAt: '2026-08-22',
};

const catherineSiena: SaintBiography = {
  id: 'catherine-siena',
  title: {
    en: 'Saint Catherine of Siena, Virgin and Doctor of the Church',
    pt: 'S. Catarina de Sena, virgem e doutora da Igreja, Padroeira da Europa',
    es: 'Santa Catalina de Siena, virgen y doctora de la Iglesia',
    it: 'Santa Caterina da Siena, vergine e dottore della Chiesa',
  },
  summary: {
    en: 'Catherine of Siena was a Dominican tertiary, spiritual writer and tireless advocate for peace and Church renewal. Her letters and Dialogue reveal a life centred on Christ, prayer and practical charity; she is honoured as a Doctor of the Church and patroness of Europe.',
    pt: 'Catarina de Sena foi uma terciária dominicana, escritora espiritual e incansável defensora da paz e da renovação da Igreja. As suas cartas e o Diálogo revelam uma vida centrada em Cristo, na oração e na caridade concreta; é doutora da Igreja e padroeira da Europa.',
    es: 'Catalina de Siena fue terciaria dominica, escritora espiritual e incansable defensora de la paz y de la renovación de la Iglesia. Sus cartas y el Diálogo revelan una vida centrada en Cristo, la oración y la caridad concreta; es doctora de la Iglesia y patrona de Europa.',
    it: 'Caterina da Siena fu terziaria domenicana, scrittrice spirituale e instancabile sostenitrice della pace e del rinnovamento della Chiesa. Le sue lettere e il Dialogo rivelano una vita centrata su Cristo, sulla preghiera e sulla carità concreta; è dottore della Chiesa e patrona d’Europa.',
  },
  paragraphs: {
    en: [
      'Catherine was born in Siena in 1347 into a large family. As a young woman she joined the Dominican Third Order known as the Mantellate while continuing to live at home. Prayer and penance were joined to practical service, especially care for people who were sick. Her reputation for holiness grew, and people from very different social backgrounds began to seek her spiritual guidance.',
      'Her public activity unfolded during a troubled period for both the Church and the Italian states. Catherine travelled, wrote to rulers and church leaders, promoted peace and pressed for reform. She urged Pope Gregory XI, then living at Avignon, to return to Rome. Although she learned to read with difficulty and only later learned to write, her teaching survives in an extensive collection of letters, prayers and the Dialogue of Divine Providence.',
      'Catherine died in Rome in 1380 and was canonized in 1461. Paul VI declared her a Doctor of the Church in 1970, recognizing the lasting value of her spiritual teaching; she is also honoured as a patroness of Italy and a co-patroness of Europe. Her Roman Catholic memorial is celebrated on 29 April, linking her contemplative love of Christ with courageous service to the Church and society.',
    ],
    pt: [
      'Catarina nasceu em Sena, em 1347, no seio de uma família numerosa. Ainda jovem entrou na Ordem Terceira de São Domingos, no ramo conhecido como Mantellate, continuando a viver em casa. À oração e à penitência juntou o serviço concreto, sobretudo o cuidado de pessoas doentes. A sua fama de santidade cresceu e pessoas de condições sociais muito diferentes começaram a procurar nela orientação espiritual.',
      'A sua atividade pública decorreu num período conturbado para a Igreja e para os estados italianos. Catarina viajou, escreveu a governantes e responsáveis eclesiais, promoveu a paz e pediu reformas. Exortou o Papa Gregório XI, então residente em Avinhão, a regressar a Roma. Embora tenha aprendido a ler com dificuldade e a escrever apenas em adulta, o seu ensino conserva-se numa extensa coleção de cartas, orações e no Diálogo da Divina Providência.',
      'Catarina morreu em Roma, em 1380, e foi canonizada em 1461. Paulo VI declarou-a doutora da Igreja em 1970, reconhecendo o valor duradouro do seu ensinamento espiritual; é também honrada como padroeira de Itália e copadroeira da Europa. A sua memória no calendário católico romano celebra-se a 29 de abril, unindo o amor contemplativo por Cristo ao serviço corajoso da Igreja e da sociedade.',
    ],
    es: [
      'Catalina nació en Siena en 1347, dentro de una familia numerosa. Siendo joven ingresó en la Tercera Orden de Santo Domingo, en la rama conocida como las Mantellate, mientras seguía viviendo en casa. Unió la oración y la penitencia al servicio concreto, especialmente al cuidado de personas enfermas. Su fama de santidad creció y personas de condiciones sociales muy diferentes comenzaron a buscar en ella orientación espiritual.',
      'Su actividad pública se desarrolló en un periodo difícil para la Iglesia y para los estados italianos. Catalina viajó, escribió a gobernantes y responsables eclesiales, promovió la paz y pidió reformas. Exhortó al papa Gregorio XI, que entonces residía en Aviñón, a regresar a Roma. Aunque aprendió a leer con dificultad y a escribir solo en la edad adulta, su enseñanza se conserva en una amplia colección de cartas, oraciones y en el Diálogo de la Divina Providencia.',
      'Catalina murió en Roma en 1380 y fue canonizada en 1461. Pablo VI la declaró doctora de la Iglesia en 1970, reconociendo el valor duradero de su enseñanza espiritual; también es honrada como patrona de Italia y copatrona de Europa. Su memoria en el calendario católico romano se celebra el 29 de abril, uniendo el amor contemplativo a Cristo con el servicio valiente a la Iglesia y a la sociedad.',
    ],
    it: [
      'Caterina nacque a Siena nel 1347, in una famiglia numerosa. Ancora giovane entrò nel Terz’Ordine domenicano, nel ramo conosciuto come le Mantellate, continuando a vivere in casa. Alla preghiera e alla penitenza unì il servizio concreto, soprattutto la cura delle persone malate. La sua fama di santità crebbe e persone di condizioni sociali molto diverse iniziarono a cercare in lei una guida spirituale.',
      'La sua attività pubblica si svolse in un periodo travagliato per la Chiesa e per gli stati italiani. Caterina viaggiò, scrisse a governanti e responsabili ecclesiali, promosse la pace e sollecitò riforme. Esortò papa Gregorio XI, che allora risiedeva ad Avignone, a tornare a Roma. Sebbene avesse imparato a leggere con difficoltà e a scrivere solo da adulta, il suo insegnamento è conservato in un’ampia raccolta di lettere, preghiere e nel Dialogo della Divina Provvidenza.',
      'Caterina morì a Roma nel 1380 e fu canonizzata nel 1461. Paolo VI la dichiarò dottore della Chiesa nel 1970, riconoscendo il valore duraturo del suo insegnamento spirituale; è onorata anche come patrona d’Italia e compatrona d’Europa. La sua memoria nel calendario cattolico romano ricorre il 29 aprile, unendo l’amore contemplativo per Cristo al servizio coraggioso della Chiesa e della società.',
    ],
  },
  facts: [
    {
      label: { en: 'Life', pt: 'Vida', es: 'Vida', it: 'Vita' },
      value: { en: '1347 · Siena — 1380 · Rome', pt: '1347 · Sena — 1380 · Roma', es: '1347 · Siena — 1380 · Roma', it: '1347 · Siena — 1380 · Roma' },
    },
    {
      label: { en: 'Dominican vocation', pt: 'Vocação dominicana', es: 'Vocación dominica', it: 'Vocazione domenicana' },
      value: { en: 'Third Order of Saint Dominic (Mantellate)', pt: 'Ordem Terceira de São Domingos (Mantellate)', es: 'Tercera Orden de Santo Domingo (Mantellate)', it: 'Terz’Ordine di San Domenico (Mantellate)' },
    },
    {
      label: { en: 'Remembered as', pt: 'Recordada como', es: 'Recordada como', it: 'Ricordata come' },
      value: { en: 'Virgin, Doctor of the Church and co-patroness of Europe', pt: 'Virgem, doutora da Igreja e copadroeira da Europa', es: 'Virgen, doctora de la Iglesia y copatrona de Europa', it: 'Vergine, dottore della Chiesa e compatrona d’Europa' },
    },
    {
      label: { en: 'Roman Catholic memorial', pt: 'Memória católica romana', es: 'Memoria católica romana', it: 'Memoria cattolica romana' },
      value: { en: '29 April', pt: '29 de abril', es: '29 de abril', it: '29 aprile' },
    },
  ],
  sources: [
    { name: 'Saint Catherine of Siena', url: VATICAN_CATHERINE_SIENA, language: 'en', publisher: 'Vatican News' },
    { name: 'Saint Catherine of Siena', url: HOLY_SEE_CATHERINE_SIENA, language: 'en', publisher: 'Holy See' },
  ],
  verifiedAt: '2026-08-22',
};

const elizabethPortugal: SaintBiography = {
  id: 'elizabeth-portugal',
  title: {
    en: 'Saint Elizabeth of Portugal',
    pt: 'S. Isabel de Portugal',
    es: 'Santa Isabel de Portugal',
    it: 'Santa Elisabetta del Portogallo',
  },
  summary: {
    en: 'Elizabeth of Portugal was a queen whose political prudence, peacemaking and sustained care for people in need shaped her public life. Remembered in Portugal as the Rainha Santa, she joined royal responsibility to a disciplined Christian commitment to reconciliation and charity.',
    pt: 'Isabel de Portugal foi uma rainha cuja prudência política, ação pacificadora e atenção constante às pessoas necessitadas marcaram a sua vida pública. Recordada como Rainha Santa, uniu as responsabilidades da coroa a um compromisso cristão exigente com a reconciliação e a caridade.',
    es: 'Isabel de Portugal fue una reina cuya prudencia política, labor pacificadora y atención constante a las personas necesitadas marcaron su vida pública. Recordada en Portugal como la Rainha Santa, unió las responsabilidades de la corona a un exigente compromiso cristiano con la reconciliación y la caridad.',
    it: 'Elisabetta del Portogallo fu una regina la cui prudenza politica, opera di pace e costante attenzione alle persone bisognose segnarono la sua vita pubblica. Ricordata in Portogallo come Rainha Santa, unì le responsabilità della corona a un esigente impegno cristiano per la riconciliazione e la carità.',
  },
  paragraphs: {
    en: [
      'Elizabeth was born around 1270, a daughter of Peter III of Aragon and Constance of Sicily. She married King Dinis of Portugal in 1281 and became an active figure in the life of the kingdom, not simply a ceremonial presence. Her responsibilities included advising and mediating within the royal family, and she earned trust through prudence in a court marked by complicated political and family relationships.',
      'Her reputation as a peacemaker grew through interventions in disputes involving King Dinis, his brother Afonso and their son, the future Afonso IV. In 1323, at Alvalade, she helped prevent armed conflict between father and son. Elizabeth also used family ties across the Iberian Peninsula to support negotiation. Alongside this political work, she directed resources toward people who were poor or sick and supported works of social assistance; the later tradition of the roses became a popular symbol of that charity.',
      'After the death of King Dinis, Elizabeth withdrew to Coimbra and lived close to the convent of Santa Clara-a-Velha without making religious profession or abandoning her responsibilities as queen dowager. She died on 4 July 1336 and was canonized in 1625. Her Roman Catholic memorial is celebrated on 4 July, and her Portuguese legacy brings together responsible public service, the patient work of peace and practical care for vulnerable people.',
    ],
    pt: [
      'Isabel nasceu por volta de 1270, filha de Pedro III de Aragão e de Constança da Sicília. Casou com o rei D. Dinis de Portugal em 1281 e tornou-se uma figura ativa na vida do reino, não apenas uma presença cerimonial. As suas responsabilidades incluíram o conselho e a mediação no interior da família real, conquistando confiança pela prudência num ambiente de relações políticas e familiares complexas.',
      'A sua reputação de pacificadora cresceu através das intervenções em conflitos que envolveram D. Dinis, o irmão Afonso e o filho de ambos, o futuro D. Afonso IV. Em 1323, em Alvalade, ajudou a evitar o confronto armado entre pai e filho. Isabel também usou os laços familiares na Península Ibérica para favorecer negociações. A par desta ação política, destinou recursos a pessoas pobres ou doentes e apoiou obras de assistência; a tradição posterior das rosas tornou-se um símbolo popular dessa caridade.',
      'Depois da morte de D. Dinis, Isabel retirou-se para Coimbra e viveu junto do convento de Santa Clara-a-Velha, sem professar nem abandonar as responsabilidades de rainha viúva. Morreu a 4 de julho de 1336 e foi canonizada em 1625. A sua memória no calendário católico romano celebra-se a 4 de julho, e o seu legado português reúne serviço público responsável, trabalho paciente pela paz e cuidado concreto das pessoas vulneráveis.',
    ],
    es: [
      'Isabel nació hacia 1270, hija de Pedro III de Aragón y de Constanza de Sicilia. Se casó con el rey Dionisio de Portugal en 1281 y se convirtió en una figura activa en la vida del reino, no solo en una presencia ceremonial. Sus responsabilidades incluyeron el consejo y la mediación dentro de la familia real, y se ganó la confianza por su prudencia en una corte marcada por complejas relaciones políticas y familiares.',
      'Su fama de pacificadora creció mediante sus intervenciones en conflictos que involucraron al rey Dionisio, a su hermano Alfonso y al hijo de ambos, el futuro Alfonso IV. En 1323, en Alvalade, ayudó a evitar el enfrentamiento armado entre padre e hijo. Isabel también utilizó los vínculos familiares de la península ibérica para favorecer negociaciones. Junto a esta labor política, destinó recursos a personas pobres o enfermas y apoyó obras de asistencia; la tradición posterior de las rosas se convirtió en un símbolo popular de esa caridad.',
      'Después de la muerte del rey Dionisio, Isabel se retiró a Coimbra y vivió junto al convento de Santa Clara-a-Velha, sin profesar ni abandonar sus responsabilidades como reina viuda. Murió el 4 de julio de 1336 y fue canonizada en 1625. Su memoria en el calendario católico romano se celebra el 4 de julio, y su legado portugués reúne servicio público responsable, trabajo paciente por la paz y cuidado concreto de las personas vulnerables.',
    ],
    it: [
      'Elisabetta nacque intorno al 1270, figlia di Pietro III d’Aragona e Costanza di Sicilia. Sposò il re Dionigi del Portogallo nel 1281 e divenne una figura attiva nella vita del regno, non soltanto una presenza cerimoniale. Le sue responsabilità comprendevano il consiglio e la mediazione all’interno della famiglia reale, e guadagnò fiducia grazie alla prudenza in una corte segnata da complessi rapporti politici e familiari.',
      'La sua fama di pacificatrice crebbe attraverso gli interventi nei conflitti che coinvolsero re Dionigi, suo fratello Alfonso e il loro figlio, il futuro Alfonso IV. Nel 1323, ad Alvalade, contribuì a evitare lo scontro armato tra padre e figlio. Elisabetta utilizzò anche i legami familiari nella penisola iberica per favorire negoziati. Accanto a questa azione politica, destinò risorse ai poveri e ai malati e sostenne opere assistenziali; la successiva tradizione delle rose divenne un simbolo popolare di tale carità.',
      'Dopo la morte di re Dionigi, Elisabetta si ritirò a Coimbra e visse presso il convento di Santa Clara-a-Velha, senza emettere la professione religiosa né abbandonare le responsabilità di regina vedova. Morì il 4 luglio 1336 e fu canonizzata nel 1625. La sua memoria nel calendario cattolico romano ricorre il 4 luglio, e la sua eredità portoghese unisce servizio pubblico responsabile, paziente opera di pace e cura concreta delle persone vulnerabili.',
    ],
  },
  facts: [
    {
      label: { en: 'Life', pt: 'Vida', es: 'Vida', it: 'Vita' },
      value: { en: 'c. 1270 — 4 July 1336', pt: 'c. 1270 — 4 de julho de 1336', es: 'c. 1270 — 4 de julio de 1336', it: 'c. 1270 — 4 luglio 1336' },
    },
    {
      label: { en: 'Royal role', pt: 'Função régia', es: 'Función regia', it: 'Ruolo regio' },
      value: { en: 'Queen of Portugal and queen dowager', pt: 'Rainha de Portugal e rainha viúva', es: 'Reina de Portugal y reina viuda', it: 'Regina del Portogallo e regina vedova' },
    },
    {
      label: { en: 'Remembered for', pt: 'Recordada por', es: 'Recordada por', it: 'Ricordata per' },
      value: { en: 'Peacemaking, political prudence and charity', pt: 'Pacificação, prudência política e caridade', es: 'Pacificación, prudencia política y caridad', it: 'Pacificazione, prudenza politica e carità' },
    },
    {
      label: { en: 'Roman Catholic memorial', pt: 'Memória católica romana', es: 'Memoria católica romana', it: 'Memoria cattolica romana' },
      value: { en: '4 July', pt: '4 de julho', es: '4 de julio', it: '4 luglio' },
    },
  ],
  sources: [
    { name: 'Saint Elizabeth of Portugal', url: VATICAN_ELIZABETH_PORTUGAL, language: 'en', publisher: 'Vatican News' },
    { name: 'Santa Isabel de Portugal', url: LISBON_ELIZABETH_PORTUGAL, language: 'pt', publisher: 'Patriarchate of Lisbon' },
  ],
  verifiedAt: '2026-08-22',
};

const gregoryGreat: SaintBiography = {
  id: 'gregory-great',
  title: {
    en: 'Saint Gregory the Great, Pope and Doctor of the Church',
    pt: 'S. Gregório Magno, papa e doutor da Igreja',
    es: 'San Gregorio Magno, papa y doctor de la Iglesia',
    it: 'San Gregorio Magno, papa e dottore della Chiesa',
  },
  summary: {
    en: 'Gregory the Great moved from the highest civil office in Rome to monastic life and then to the papacy. His care for people facing plague, hunger and war joined practical government, missionary vision and a lasting theology of pastoral service.',
    pt: 'Gregório Magno passou do mais alto cargo civil de Roma para a vida monástica e, depois, para o papado. O cuidado das pessoas atingidas pela peste, fome e guerra uniu governo concreto, visão missionária e uma duradoura teologia do serviço pastoral.',
    es: 'Gregorio Magno pasó del cargo civil más alto de Roma a la vida monástica y después al papado. Su atención a las personas afectadas por la peste, el hambre y la guerra unió gobierno práctico, visión misionera y una duradera teología del servicio pastoral.',
    it: 'Gregorio Magno passò dalla più alta carica civile di Roma alla vita monastica e poi al papato. La cura delle persone colpite da peste, fame e guerra unì governo concreto, visione missionaria e una duratura teologia del servizio pastorale.',
  },
  paragraphs: {
    en: [
      'Gregory was born in Rome around 540 into a Christian patrician family and received the education needed for public administration. He became prefect of Rome while the city was living through political instability, invasions and recurring disease. He later left civil office, gave substantial resources to the poor and transformed his family home on the Caelian Hill into a monastery dedicated to Saint Andrew. This passage from government to monastic life did not erase his administrative experience; it reshaped it around prayer, Scripture and service.',
      'After serving as a deacon and papal representative in Constantinople, Gregory returned to Rome. He was elected Bishop of Rome in 590 after the death of Pelagius II during a plague. His pontificate faced famine, displaced populations and Lombard pressure. Gregory reorganised the administration of Church property, insisted that its revenues serve people in need, supported prisoners and refugees and negotiated for peace. He also sent Augustine and a group of monks to evangelise the Anglo-Saxons, linking Roman pastoral responsibility with a missionary horizon.',
      'Gregory joined action to sustained teaching. The Pastoral Rule described episcopal ministry as demanding self-knowledge, discernment and humble care for different people; his Moralia on Job, homilies, letters and Dialogues shaped medieval Christian spirituality. He used the title “servant of the servants of God”, expressing authority as service. The liturgical tradition later associated with his name should not be reduced to the claim that he personally composed the entire Gregorian chant repertory. Gregory died in 604; the Roman Catholic Church celebrates his memorial on 3 September, the date of his episcopal consecration.',
    ],
    pt: [
      'Gregório nasceu em Roma por volta de 540, numa família patrícia cristã, e recebeu a formação necessária à administração pública. Tornou-se prefeito de Roma quando a cidade atravessava instabilidade política, invasões e doenças recorrentes. Mais tarde deixou o cargo civil, destinou parte substancial dos seus bens aos pobres e transformou a casa familiar no monte Célio num mosteiro dedicado a Santo André. A passagem do governo para a vida monástica não apagou a experiência administrativa; reorganizou-a em torno da oração, da Escritura e do serviço.',
      'Depois de servir como diácono e representante pontifício em Constantinopla, Gregório regressou a Roma. Foi eleito bispo de Roma em 590, após a morte de Pelágio II durante uma epidemia de peste. O seu pontificado enfrentou fome, populações deslocadas e a pressão dos Lombardos. Gregório reorganizou a administração dos bens da Igreja, insistiu que os seus rendimentos servissem as pessoas necessitadas, apoiou prisioneiros e refugiados e negociou a paz. Enviou também Agostinho e um grupo de monges para evangelizar os anglo-saxões, ligando a responsabilidade pastoral de Roma a um horizonte missionário.',
      'Gregório uniu a ação a um ensino continuado. A Regra Pastoral apresentou o ministério episcopal como exigência de autoconhecimento, discernimento e cuidado humilde de pessoas diferentes; os Moralia sobre Job, as homilias, cartas e Diálogos marcaram a espiritualidade cristã medieval. Usou o título “servo dos servos de Deus”, exprimindo a autoridade como serviço. A tradição litúrgica posteriormente associada ao seu nome não deve ser reduzida à ideia de que compôs pessoalmente todo o repertório gregoriano. Gregório morreu em 604; a Igreja Católica Romana celebra a sua memória a 3 de setembro, data da sua consagração episcopal.',
    ],
    es: [
      'Gregorio nació en Roma hacia el año 540, en una familia patricia cristiana, y recibió la formación necesaria para la administración pública. Llegó a ser prefecto de Roma cuando la ciudad sufría inestabilidad política, invasiones y enfermedades recurrentes. Más tarde dejó el cargo civil, destinó una parte considerable de sus bienes a los pobres y convirtió la casa familiar del monte Celio en un monasterio dedicado a san Andrés. El paso del gobierno a la vida monástica no borró su experiencia administrativa; la reorganizó en torno a la oración, la Escritura y el servicio.',
      'Después de servir como diácono y representante pontificio en Constantinopla, Gregorio regresó a Roma. Fue elegido obispo de Roma en 590, tras la muerte de Pelagio II durante una epidemia de peste. Su pontificado afrontó hambre, poblaciones desplazadas y la presión de los lombardos. Gregorio reorganizó la administración de los bienes de la Iglesia, insistió en que sus ingresos sirvieran a las personas necesitadas, ayudó a prisioneros y refugiados y negoció la paz. También envió a Agustín y a un grupo de monjes para evangelizar a los anglosajones, uniendo la responsabilidad pastoral romana con un horizonte misionero.',
      'Gregorio unió la acción a una enseñanza constante. La Regla pastoral presentó el ministerio episcopal como una exigencia de autoconocimiento, discernimiento y cuidado humilde de personas diferentes; los Moralia sobre Job, las homilías, cartas y Diálogos marcaron la espiritualidad cristiana medieval. Utilizó el título “siervo de los siervos de Dios”, expresando la autoridad como servicio. La tradición litúrgica asociada posteriormente a su nombre no debe reducirse a afirmar que compuso personalmente todo el repertorio gregoriano. Gregorio murió en 604; la Iglesia católica romana celebra su memoria el 3 de septiembre, fecha de su consagración episcopal.',
    ],
    it: [
      'Gregorio nacque a Roma intorno al 540, in una famiglia patrizia cristiana, e ricevette la formazione necessaria per l’amministrazione pubblica. Divenne prefetto di Roma mentre la città attraversava instabilità politica, invasioni e malattie ricorrenti. In seguito lasciò l’incarico civile, destinò una parte sostanziale dei suoi beni ai poveri e trasformò la casa di famiglia sul Celio in un monastero dedicato a sant’Andrea. Il passaggio dal governo alla vita monastica non cancellò la sua esperienza amministrativa; la riorientò intorno alla preghiera, alla Scrittura e al servizio.',
      'Dopo aver servito come diacono e rappresentante pontificio a Costantinopoli, Gregorio tornò a Roma. Fu eletto vescovo di Roma nel 590, dopo la morte di Pelagio II durante un’epidemia di peste. Il suo pontificato affrontò fame, popolazioni sfollate e la pressione dei Longobardi. Gregorio riorganizzò l’amministrazione dei beni della Chiesa, insistette perché le entrate servissero le persone bisognose, sostenne prigionieri e rifugiati e negoziò la pace. Inviò inoltre Agostino e un gruppo di monaci a evangelizzare gli anglosassoni, collegando la responsabilità pastorale romana a un orizzonte missionario.',
      'Gregorio unì l’azione a un insegnamento costante. La Regola pastorale descrisse il ministero episcopale come esigenza di conoscenza di sé, discernimento e cura umile di persone diverse; i Moralia in Iob, le omelie, le lettere e i Dialoghi segnarono la spiritualità cristiana medievale. Usò il titolo “servo dei servi di Dio”, esprimendo l’autorità come servizio. La tradizione liturgica poi associata al suo nome non va ridotta all’affermazione che abbia composto personalmente l’intero repertorio gregoriano. Gregorio morì nel 604; la Chiesa cattolica romana ne celebra la memoria il 3 settembre, data della sua consacrazione episcopale.',
    ],
  },
  facts: [
    {
      label: { en: 'Life', pt: 'Vida', es: 'Vida', it: 'Vita' },
      value: { en: 'c. 540 — 12 March 604', pt: 'c. 540 — 12 de março de 604', es: 'c. 540 — 12 de marzo de 604', it: 'c. 540 — 12 marzo 604' },
    },
    {
      label: { en: 'Public and ecclesial service', pt: 'Serviço civil e eclesial', es: 'Servicio civil y eclesial', it: 'Servizio civile ed ecclesiale' },
      value: { en: 'Prefect of Rome, monk, deacon and pope', pt: 'Prefeito de Roma, monge, diácono e papa', es: 'Prefecto de Roma, monje, diácono y papa', it: 'Prefetto di Roma, monaco, diacono e papa' },
    },
    {
      label: { en: 'Pontificate', pt: 'Pontificado', es: 'Pontificado', it: 'Pontificato' },
      value: { en: '590–604', pt: '590–604', es: '590–604', it: '590–604' },
    },
    {
      label: { en: 'Roman Catholic memorial', pt: 'Memória católica romana', es: 'Memoria católica romana', it: 'Memoria cattolica romana' },
      value: { en: '3 September', pt: '3 de setembro', es: '3 de septiembre', it: '3 settembre' },
    },
  ],
  sources: [
    { name: 'St. Gregory the Great, pope and Doctor of the Church', url: VATICAN_GREGORY, language: 'en', publisher: 'Vatican News' },
    { name: 'S. Gregório Magno, papa e doutor da Igreja', url: VATICAN_GREGORY_PT, language: 'pt', publisher: 'Vatican News' },
    { name: 'Saint Gregory the Great', url: HOLY_SEE_GREGORY, language: 'en', publisher: 'Holy See' },
  ],
  verifiedAt: '2026-09-03',
};

export const EDITORIAL_SCALE_BATCH_5: SaintBiography[] = [matthew, thomasAquinas, catherineSiena, elizabethPortugal, gregoryGreat];

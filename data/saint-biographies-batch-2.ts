import type { SaintBiography } from './saint-biographies';

const anthonyGreat: SaintBiography = {
  id: 'anthony-great',
  title: { en: 'Saint Anthony the Great', pt: 'Santo Antão', es: 'San Antonio Abad', it: 'Sant’Antonio Abate' },
  summary: {
    en: 'Anthony the Great (c. 251–356) was an Egyptian ascetic whose long life in the desert and influence on communities of disciples made him one of the foundational figures of Christian monasticism in both Eastern and Western tradition.',
    pt: 'Antão (c. 251–356) foi um asceta egípcio cuja longa vida no deserto e influência sobre comunidades de discípulos fizeram dele uma das figuras fundadoras do monaquismo cristão, tanto no Oriente como no Ocidente.',
    es: 'Antonio Abad (c. 251–356) fue un asceta egipcio cuya larga vida en el desierto y su influencia sobre comunidades de discípulos lo convirtieron en una de las figuras fundacionales del monacato cristiano, tanto oriental como occidental.',
    it: 'Antonio Abate (c. 251–356) fu un asceta egiziano la cui lunga vita nel deserto e l’influenza esercitata su comunità di discepoli ne fecero una delle figure fondative del monachesimo cristiano d’Oriente e d’Occidente.'
  },
  paragraphs: {
    en: [
      'Anthony was born in Egypt around the middle of the third century. Christian sources describe him as orphaned while still young and responsible for a younger sister. After hearing the Gospel call to give possessions to the poor, he disposed of his property, provided for his sister and adopted an increasingly demanding ascetic life. He moved progressively farther from settled communities into the Egyptian desert, combining prayer, fasting and manual work.',
      'Although Anthony sought solitude, other ascetics gathered around him and looked to him for spiritual guidance. His reputation spread far beyond Egypt, especially through the Life of Anthony written by Athanasius of Alexandria. That work helped transmit the ideal of desert asceticism throughout the Christian world and made Anthony a major reference for later monastic life. He died in the fourth century after an exceptionally long life; his feast is kept on 17 January in the calendars represented by Santos do Dia.'
    ],
    pt: [
      'Antão nasceu no Egito por volta de meados do século III. As fontes cristãs descrevem-no como tendo ficado órfão ainda jovem e responsável por uma irmã mais nova. Depois de ouvir no Evangelho o apelo a dar os bens aos pobres, desfez-se do património, assegurou o futuro da irmã e adotou uma vida ascética cada vez mais exigente. Afastou-se progressivamente das povoações para o deserto egípcio, conjugando oração, jejum e trabalho manual.',
      'Embora procurasse a solidão, outros ascetas aproximaram-se de Antão e procuraram nele orientação espiritual. A sua fama ultrapassou largamente o Egito, sobretudo através da Vida de Antão escrita por Atanásio de Alexandria. A obra difundiu o ideal dos Padres do Deserto pelo mundo cristão e fez de Antão uma referência decisiva para o desenvolvimento posterior da vida monástica. Morreu no século IV depois de uma vida excecionalmente longa; a sua memória é celebrada a 17 de janeiro nos calendários representados no Santos do Dia.'
    ],
    es: [
      'Antonio nació en Egipto hacia mediados del siglo III. Las fuentes cristianas lo presentan como huérfano siendo aún joven y responsable de una hermana menor. Tras escuchar en el Evangelio la llamada a entregar los bienes a los pobres, se desprendió de su patrimonio, aseguró el cuidado de su hermana y adoptó una vida ascética cada vez más exigente. Se alejó progresivamente de los núcleos habitados hacia el desierto egipcio, combinando oración, ayuno y trabajo manual.',
      'Aunque buscaba la soledad, otros ascetas se reunieron en torno a Antonio y acudieron a él en busca de orientación espiritual. Su fama se extendió mucho más allá de Egipto, sobre todo gracias a la Vida de Antonio escrita por Atanasio de Alejandría. La obra difundió el ideal de los Padres del Desierto por el mundo cristiano y convirtió a Antonio en una referencia decisiva para el desarrollo posterior de la vida monástica. Murió en el siglo IV después de una vida excepcionalmente larga; su memoria se celebra el 17 de enero en los calendarios representados por Santos do Dia.'
    ],
    it: [
      'Antonio nacque in Egitto verso la metà del III secolo. Le fonti cristiane lo descrivono rimasto orfano ancora giovane e responsabile di una sorella minore. Dopo aver ascoltato nel Vangelo l’invito a dare i beni ai poveri, distribuì il proprio patrimonio, provvide alla sorella e adottò una vita ascetica sempre più esigente. Si allontanò progressivamente dai centri abitati verso il deserto egiziano, unendo preghiera, digiuno e lavoro manuale.',
      'Benché cercasse la solitudine, altri asceti si raccolsero attorno ad Antonio e si rivolsero a lui per una guida spirituale. La sua fama si diffuse ben oltre l’Egitto, soprattutto grazie alla Vita di Antonio scritta da Atanasio di Alessandria. L’opera trasmise l’ideale dei Padri del Deserto al mondo cristiano e fece di Antonio un riferimento decisivo per il successivo sviluppo della vita monastica. Morì nel IV secolo dopo una vita eccezionalmente lunga; la sua memoria ricorre il 17 gennaio nei calendari rappresentati da Santos do Dia.'
    ]
  },
  facts: [
    { label: { en: 'Born', pt: 'Nascimento', es: 'Nacimiento', it: 'Nascita' }, value: { en: 'c. 251 · Egypt', pt: 'c. 251 · Egito', es: 'c. 251 · Egipto', it: 'c. 251 · Egitto' } },
    { label: { en: 'Died', pt: 'Morte', es: 'Fallecimiento', it: 'Morte' }, value: { en: 'c. 356 · Egyptian desert', pt: 'c. 356 · deserto egípcio', es: 'c. 356 · desierto egipcio', it: 'c. 356 · deserto egiziano' } },
    { label: { en: 'Known for', pt: 'Conhecido por', es: 'Conocido por', it: 'Conosciuto per' }, value: { en: 'Desert asceticism and early monasticism', pt: 'Ascese no deserto e monaquismo antigo', es: 'Ascetismo del desierto y monacato antiguo', it: 'Ascesi nel deserto e monachesimo antico' } },
    { label: { en: 'Feast', pt: 'Memória', es: 'Memoria', it: 'Memoria' }, value: { en: '17 January', pt: '17 de janeiro', es: '17 de enero', it: '17 gennaio' } }
  ],
  sources: [
    { name: 'St. Antony, Abbot', url: 'https://www.vaticannews.va/en/saints/01/17/st--antony--abbot.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Venerable and God-bearing Father Anthony the Great', url: 'https://www.oca.org/saints/all-lives/2454/01/17', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

const joseph: SaintBiography = {
  id: 'joseph',
  title: { en: 'Saint Joseph, Spouse of the Blessed Virgin Mary', pt: 'São José, Esposo da Virgem Maria', es: 'San José, esposo de la Virgen María', it: 'San Giuseppe, sposo della Vergine Maria' },
  summary: {
    en: 'Saint Joseph is the Gospel figure entrusted with Mary and Jesus: a just man, worker and father in the Holy Family whose discreet obedience became a major Christian model of responsibility, protection and faithful service.',
    pt: 'São José é a figura evangélica a quem foram confiados Maria e Jesus: homem justo, trabalhador e pai na Sagrada Família, cuja obediência discreta se tornou um grande modelo cristão de responsabilidade, proteção e serviço fiel.',
    es: 'San José es la figura evangélica a quien fueron confiados María y Jesús: hombre justo, trabajador y padre en la Sagrada Familia, cuya obediencia discreta se convirtió en un gran modelo cristiano de responsabilidad, protección y servicio fiel.',
    it: 'San Giuseppe è la figura evangelica a cui furono affidati Maria e Gesù: uomo giusto, lavoratore e padre nella Santa Famiglia, la cui obbedienza discreta è divenuta un grande modello cristiano di responsabilità, protezione e servizio fedele.'
  },
  paragraphs: {
    en: [
      'Matthew and Luke give the principal Gospel information about Joseph. He is presented as a descendant of David, betrothed to Mary and a “just man”. Matthew describes a series of dreams in which Joseph receives guidance: he takes Mary into his home, gives the child the name Jesus, protects the family by fleeing to Egypt and later settles with them at Nazareth. The Gospels also associate Joseph with manual work, traditionally translated as carpenter or craftsman.',
      'The New Testament records no words spoken by Joseph and does not describe his death. Christian devotion therefore developed around the pattern of action attributed to him: listening, protecting and providing without placing himself at the centre. His veneration grew over centuries, and in 1870 Pius IX declared him Patron of the Universal Church. The Roman Catholic solemnity of Saint Joseph, Spouse of the Blessed Virgin Mary, is celebrated on 19 March; he is also remembered under the title Joseph the Worker on 1 May.'
    ],
    pt: [
      'Mateus e Lucas fornecem a principal informação evangélica sobre José. É apresentado como descendente de David, desposado com Maria e “homem justo”. Mateus descreve vários sonhos nos quais José recebe orientação: acolhe Maria em sua casa, dá ao menino o nome de Jesus, protege a família fugindo para o Egito e, mais tarde, instala-se com ela em Nazaré. Os Evangelhos associam também José ao trabalho manual, tradicionalmente traduzido como carpinteiro ou artesão.',
      'O Novo Testamento não regista palavras pronunciadas por José nem descreve a sua morte. A devoção cristã desenvolveu-se, por isso, em torno do padrão de ação que lhe é atribuído: escutar, proteger e sustentar sem se colocar no centro. A sua veneração cresceu ao longo dos séculos e, em 1870, Pio IX declarou-o Padroeiro da Igreja Universal. A solenidade católica romana de São José, Esposo da Virgem Maria, celebra-se a 19 de março; é também recordado como São José Operário a 1 de maio.'
    ],
    es: [
      'Mateo y Lucas ofrecen la principal información evangélica sobre José. Se le presenta como descendiente de David, prometido con María y “hombre justo”. Mateo describe varios sueños en los que José recibe orientación: acoge a María en su casa, da al niño el nombre de Jesús, protege a la familia huyendo a Egipto y más tarde se establece con ella en Nazaret. Los Evangelios asocian también a José con el trabajo manual, tradicionalmente traducido como carpintero o artesano.',
      'El Nuevo Testamento no conserva palabras pronunciadas por José ni describe su muerte. La devoción cristiana se desarrolló así en torno al modelo de acción que se le atribuye: escuchar, proteger y sostener sin situarse en el centro. Su veneración creció durante siglos y en 1870 Pío IX lo declaró Patrono de la Iglesia Universal. La solemnidad católica romana de San José, esposo de la Virgen María, se celebra el 19 de marzo; también es recordado como San José Obrero el 1 de mayo.'
    ],
    it: [
      'Matteo e Luca forniscono le principali informazioni evangeliche su Giuseppe. È presentato come discendente di Davide, promesso sposo di Maria e “uomo giusto”. Matteo descrive diversi sogni nei quali Giuseppe riceve indicazioni: accoglie Maria nella sua casa, dà al bambino il nome Gesù, protegge la famiglia fuggendo in Egitto e in seguito si stabilisce con essa a Nazaret. I Vangeli associano inoltre Giuseppe al lavoro manuale, tradizionalmente reso come falegname o artigiano.',
      'Il Nuovo Testamento non registra parole pronunciate da Giuseppe e non descrive la sua morte. La devozione cristiana si è quindi sviluppata attorno al modello di azione che gli viene attribuito: ascoltare, proteggere e provvedere senza porsi al centro. La sua venerazione crebbe nei secoli e nel 1870 Pio IX lo dichiarò Patrono della Chiesa universale. La solennità cattolica romana di San Giuseppe, sposo della Vergine Maria, ricorre il 19 marzo; è ricordato anche come San Giuseppe Lavoratore il 1º maggio.'
    ]
  },
  facts: [
    { label: { en: 'Gospel role', pt: 'Papel evangélico', es: 'Papel evangélico', it: 'Ruolo evangelico' }, value: { en: 'Spouse of Mary and father of Jesus in the Holy Family', pt: 'Esposo de Maria e pai de Jesus na Sagrada Família', es: 'Esposo de María y padre de Jesús en la Sagrada Familia', it: 'Sposo di Maria e padre di Gesù nella Santa Famiglia' } },
    { label: { en: 'Occupation', pt: 'Ofício', es: 'Oficio', it: 'Mestiere' }, value: { en: 'Craftsman / carpenter in Christian tradition', pt: 'Artesão / carpinteiro na tradição cristã', es: 'Artesano / carpintero en la tradición cristiana', it: 'Artigiano / falegname nella tradizione cristiana' } },
    { label: { en: 'Universal patronage', pt: 'Padroado universal', es: 'Patronazgo universal', it: 'Patronato universale' }, value: { en: 'Patron of the Universal Church since 1870', pt: 'Padroeiro da Igreja Universal desde 1870', es: 'Patrono de la Iglesia Universal desde 1870', it: 'Patrono della Chiesa universale dal 1870' } },
    { label: { en: 'Feast', pt: 'Solenidade', es: 'Solemnidad', it: 'Solennità' }, value: { en: '19 March', pt: '19 de março', es: '19 de marzo', it: '19 marzo' } }
  ],
  sources: [
    { name: 'St. Joseph, Spouse of the Blessed Virgin Mary', url: 'https://www.vaticannews.va/en/saints/03/19/st--joseph--groom-of-b--mary--patron-of-the-univeral-church.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Apostolic Letter Patris Corde', url: 'https://www.vatican.va/content/francesco/en/apost_letters/documents/papa-francesco-lettera-ap_20201208_patris-corde.html', language: 'en', publisher: 'Holy See' }
  ],
  verifiedAt: '2026-08-15'
};

const george: SaintBiography = {
  id: 'george',
  title: { en: 'Saint George, Martyr', pt: 'São Jorge, mártir', es: 'San Jorge, mártir', it: 'San Giorgio, martire' },
  summary: {
    en: 'Saint George is an early Christian martyr whose cult became exceptionally widespread in both Eastern and Western Christianity. A historical core is associated with the Diocletianic persecution, while the famous dragon narrative belongs to later hagiographic tradition.',
    pt: 'São Jorge é um mártir cristão antigo cuja veneração se tornou excecionalmente difundida no cristianismo oriental e ocidental. Um núcleo histórico é associado à perseguição de Diocleciano, enquanto a célebre narrativa do dragão pertence à tradição hagiográfica posterior.',
    es: 'San Jorge es un antiguo mártir cristiano cuya veneración llegó a estar extraordinariamente extendida en el cristianismo oriental y occidental. Un núcleo histórico se asocia con la persecución de Diocleciano, mientras que el famoso relato del dragón pertenece a la tradición hagiográfica posterior.',
    it: 'San Giorgio è un antico martire cristiano il cui culto divenne eccezionalmente diffuso nel cristianesimo orientale e occidentale. Un nucleo storico è associato alla persecuzione di Diocleziano, mentre il celebre racconto del drago appartiene alla successiva tradizione agiografica.'
  },
  paragraphs: {
    en: [
      'George is venerated as a martyr of the late third or early fourth century. Church traditions place his origins in Cappadocia and describe him as a soldier who openly professed Christianity during the persecution associated with the emperor Diocletian. The precise biographical details are difficult to recover from the later hagiographic material, so a careful account distinguishes the ancient martyr cult from stories that developed around it.',
      'The best-known later legend portrays George rescuing a young woman by defeating a dragon. That narrative became a powerful image of faith overcoming evil but should not be treated as a contemporary record of his life. George’s cult spread across languages, countries and Churches; he is especially prominent in Orthodox iconography as the Great Martyr and Victory-Bearer and is also widely honoured in Western Christianity. His feast is kept on 23 April across several traditions represented by Santos do Dia.'
    ],
    pt: [
      'Jorge é venerado como mártir do final do século III ou início do século IV. As tradições eclesiais situam a sua origem na Capadócia e descrevem-no como militar que professou abertamente o cristianismo durante a perseguição associada ao imperador Diocleciano. Os pormenores biográficos exatos são difíceis de recuperar a partir do material hagiográfico posterior, pelo que uma apresentação rigorosa deve distinguir o antigo culto do mártir das histórias que se desenvolveram à sua volta.',
      'A lenda posterior mais conhecida representa Jorge a salvar uma jovem, vencendo um dragão. A narrativa tornou-se uma imagem poderosa da fé que vence o mal, mas não deve ser apresentada como relato contemporâneo da sua vida. A veneração de Jorge difundiu-se por muitas línguas, países e Igrejas; é particularmente importante na iconografia ortodoxa como Grande Mártir e Vitorioso e é também muito popular no cristianismo ocidental. A sua festa celebra-se a 23 de abril em várias tradições representadas no Santos do Dia.'
    ],
    es: [
      'Jorge es venerado como mártir de finales del siglo III o comienzos del IV. Las tradiciones eclesiales sitúan su origen en Capadocia y lo describen como militar que profesó abiertamente el cristianismo durante la persecución asociada al emperador Diocleciano. Los detalles biográficos exactos son difíciles de recuperar a partir del material hagiográfico posterior, por lo que una presentación rigurosa distingue el antiguo culto del mártir de las historias que fueron creciendo a su alrededor.',
      'La leyenda posterior más conocida presenta a Jorge salvando a una joven al vencer a un dragón. El relato se convirtió en una poderosa imagen de la fe que vence al mal, pero no debe tratarse como un testimonio contemporáneo de su vida. La veneración de Jorge se extendió por numerosas lenguas, países e Iglesias; ocupa un lugar destacado en la iconografía ortodoxa como Gran Mártir y Victorioso y es también muy popular en el cristianismo occidental. Su fiesta se celebra el 23 de abril en varias tradiciones representadas por Santos do Dia.'
    ],
    it: [
      'Giorgio è venerato come martire della fine del III o dell’inizio del IV secolo. Le tradizioni ecclesiali collocano le sue origini in Cappadocia e lo descrivono come un militare che professò apertamente il cristianesimo durante la persecuzione associata all’imperatore Diocleziano. I particolari biografici esatti sono difficili da ricostruire dal materiale agiografico successivo, perciò una presentazione rigorosa distingue l’antico culto del martire dalle storie sviluppatesi attorno alla sua figura.',
      'La leggenda più nota, formatasi in epoca successiva, raffigura Giorgio mentre salva una giovane sconfiggendo un drago. Il racconto divenne una potente immagine della fede che vince il male, ma non va considerato una testimonianza contemporanea della sua vita. Il culto di Giorgio si diffuse in numerose lingue, paesi e Chiese; è particolarmente importante nell’iconografia ortodossa come Grande Martire e Vittorioso ed è molto popolare anche nel cristianesimo occidentale. La sua festa ricorre il 23 aprile in diverse tradizioni rappresentate da Santos do Dia.'
    ]
  },
  facts: [
    { label: { en: 'Era', pt: 'Época', es: 'Época', it: 'Epoca' }, value: { en: 'Late 3rd / early 4th century', pt: 'Final do século III / início do IV', es: 'Finales del siglo III / comienzos del IV', it: 'Fine III / inizio IV secolo' } },
    { label: { en: 'Tradition', pt: 'Tradição', es: 'Tradición', it: 'Tradizione' }, value: { en: 'Martyr associated with the Diocletianic persecution', pt: 'Mártir associado à perseguição de Diocleciano', es: 'Mártir asociado a la persecución de Diocleciano', it: 'Martire associato alla persecuzione di Diocleziano' } },
    { label: { en: 'Iconography', pt: 'Iconografia', es: 'Iconografía', it: 'Iconografia' }, value: { en: 'Soldier; later dragon motif', pt: 'Soldado; motivo posterior do dragão', es: 'Soldado; posterior motivo del dragón', it: 'Soldato; successivo motivo del drago' } },
    { label: { en: 'Feast', pt: 'Memória', es: 'Memoria', it: 'Memoria' }, value: { en: '23 April', pt: '23 de abril', es: '23 de abril', it: '23 aprile' } }
  ],
  sources: [
    { name: 'St. George, Martyr', url: 'https://www.vaticannews.va/en/saints/04/23/st--george--martyr.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Greatmartyr, Victory-bearer, and Wonderworker George', url: 'https://www.oca.org/saints/lives/0579/04/23/101184-greatmartyr-victory-bearer-and-wonderworker-george', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

const mark: SaintBiography = {
  id: 'mark-evangelist',
  title: { en: 'Saint Mark the Evangelist', pt: 'São Marcos Evangelista', es: 'San Marcos Evangelista', it: 'San Marco Evangelista' },
  summary: {
    en: 'Mark the Evangelist is identified by Christian tradition with John Mark of the New Testament, a companion of Barnabas, Paul and Peter and the figure to whom the second canonical Gospel is traditionally attributed.',
    pt: 'Marcos Evangelista é identificado pela tradição cristã com João Marcos do Novo Testamento, companheiro de Barnabé, Paulo e Pedro e figura a quem é tradicionalmente atribuído o segundo Evangelho canónico.',
    es: 'Marcos Evangelista es identificado por la tradición cristiana con Juan Marcos del Nuevo Testamento, compañero de Bernabé, Pablo y Pedro y figura a quien se atribuye tradicionalmente el segundo Evangelio canónico.',
    it: 'Marco Evangelista è identificato dalla tradizione cristiana con Giovanni Marco del Nuovo Testamento, compagno di Barnaba, Paolo e Pietro e figura alla quale viene tradizionalmente attribuito il secondo Vangelo canonico.'
  },
  paragraphs: {
    en: [
      'The Acts of the Apostles refers to John called Mark and connects him with a house in Jerusalem where believers gathered. He travelled with Barnabas and Paul and later appears again in New Testament letters associated with apostolic ministry. Christian tradition also links Mark closely with Peter. Early Church memory came to identify him as the evangelist whose Gospel preserves apostolic preaching in a compact and vivid narrative.',
      'Later ecclesial tradition associates Mark with the Church of Alexandria and honours him as a martyr and evangelist. These traditions developed beyond the information supplied directly by the New Testament, so they are best presented as received Church memory rather than as equally documented biography. Mark is represented by the winged lion in Christian iconography and is particularly associated with Alexandria and, in the West, Venice. His feast is celebrated on 25 April across Catholic, Orthodox, Anglican and Coptic calendars represented by Santos do Dia.'
    ],
    pt: [
      'Os Atos dos Apóstolos referem João, chamado Marcos, e relacionam-no com uma casa em Jerusalém onde os fiéis se reuniam. Viajou com Barnabé e Paulo e reaparece depois em cartas do Novo Testamento ligado ao ministério apostólico. A tradição cristã aproxima também Marcos de Pedro. A memória da Igreja antiga veio a identificá-lo como o evangelista cujo texto conserva a pregação apostólica numa narrativa particularmente concisa e viva.',
      'A tradição eclesial posterior associa Marcos à Igreja de Alexandria e honra-o como mártir e evangelista. Estas tradições vão além da informação fornecida diretamente pelo Novo Testamento, pelo que devem ser apresentadas como memória recebida da Igreja e não como biografia igualmente documentada. Na iconografia cristã, Marcos é representado pelo leão alado e está especialmente ligado a Alexandria e, no Ocidente, a Veneza. A sua festa celebra-se a 25 de abril nos calendários católico, ortodoxo, anglicano e copta representados no Santos do Dia.'
    ],
    es: [
      'Los Hechos de los Apóstoles mencionan a Juan, llamado Marcos, y lo relacionan con una casa de Jerusalén donde se reunían los creyentes. Viajó con Bernabé y Pablo y aparece después en cartas del Nuevo Testamento vinculado al ministerio apostólico. La tradición cristiana relaciona también estrechamente a Marcos con Pedro. La memoria de la Iglesia antigua llegó a identificarlo como el evangelista cuyo texto conserva la predicación apostólica en una narración especialmente concisa y viva.',
      'La tradición eclesial posterior asocia a Marcos con la Iglesia de Alejandría y lo honra como mártir y evangelista. Estas tradiciones van más allá de la información ofrecida directamente por el Nuevo Testamento, por lo que conviene presentarlas como memoria recibida de la Iglesia y no como biografía igualmente documentada. En la iconografía cristiana Marcos es representado por el león alado y está especialmente vinculado con Alejandría y, en Occidente, con Venecia. Su fiesta se celebra el 25 de abril en los calendarios católico, ortodoxo, anglicano y copto representados por Santos do Dia.'
    ],
    it: [
      'Gli Atti degli Apostoli ricordano Giovanni, detto Marco, e lo collegano a una casa di Gerusalemme nella quale si riunivano i credenti. Viaggiò con Barnaba e Paolo e compare poi in lettere del Nuovo Testamento legato al ministero apostolico. La tradizione cristiana associa inoltre strettamente Marco a Pietro. La memoria della Chiesa antica giunse a identificarlo come l’evangelista il cui testo conserva la predicazione apostolica in una narrazione particolarmente concisa e vivace.',
      'La successiva tradizione ecclesiale collega Marco alla Chiesa di Alessandria e lo onora come martire ed evangelista. Queste tradizioni vanno oltre le informazioni fornite direttamente dal Nuovo Testamento e vanno quindi presentate come memoria ricevuta dalla Chiesa, non come biografia ugualmente documentata. Nell’iconografia cristiana Marco è rappresentato dal leone alato ed è particolarmente legato ad Alessandria e, in Occidente, a Venezia. La sua festa ricorre il 25 aprile nei calendari cattolico, ortodosso, anglicano e copto rappresentati da Santos do Dia.'
    ]
  },
  facts: [
    { label: { en: 'New Testament name', pt: 'Nome no Novo Testamento', es: 'Nombre en el Nuevo Testamento', it: 'Nome nel Nuovo Testamento' }, value: { en: 'John Mark', pt: 'João Marcos', es: 'Juan Marcos', it: 'Giovanni Marco' } },
    { label: { en: 'Role', pt: 'Papel', es: 'Papel', it: 'Ruolo' }, value: { en: 'Evangelist and apostolic companion', pt: 'Evangelista e companheiro dos apóstolos', es: 'Evangelista y compañero apostólico', it: 'Evangelista e compagno degli apostoli' } },
    { label: { en: 'Symbol', pt: 'Símbolo', es: 'Símbolo', it: 'Simbolo' }, value: { en: 'Winged lion', pt: 'Leão alado', es: 'León alado', it: 'Leone alato' } },
    { label: { en: 'Feast', pt: 'Festa', es: 'Fiesta', it: 'Festa' }, value: { en: '25 April', pt: '25 de abril', es: '25 de abril', it: '25 aprile' } }
  ],
  sources: [
    { name: 'St Mark, Evangelist', url: 'https://www.vaticannews.va/en/saints/04/25/st-mark--evangelist.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Apostle and Evangelist Mark', url: 'https://www.oca.org/saints/lives/2015/04/25/101204-apostle-and-evangelist-mark', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

const jamesGreater: SaintBiography = {
  id: 'james-greater',
  title: { en: 'Saint James the Greater, Apostle', pt: 'São Tiago Maior, apóstolo', es: 'Santiago el Mayor, apóstol', it: 'San Giacomo Maggiore, apostolo' },
  summary: {
    en: 'James the Greater, son of Zebedee and brother of John, was one of the Twelve Apostles and one of the disciples closest to Jesus in the Gospel narratives. Acts records his execution under Herod Agrippa I, while later tradition links his cult to Compostela.',
    pt: 'Tiago Maior, filho de Zebedeu e irmão de João, foi um dos Doze Apóstolos e um dos discípulos mais próximos de Jesus nas narrativas evangélicas. Os Atos registam a sua execução sob Herodes Agripa I, enquanto a tradição posterior liga o seu culto a Compostela.',
    es: 'Santiago el Mayor, hijo de Zebedeo y hermano de Juan, fue uno de los Doce Apóstoles y uno de los discípulos más cercanos a Jesús en los relatos evangélicos. Hechos registra su ejecución bajo Herodes Agripa I, mientras la tradición posterior vincula su culto con Compostela.',
    it: 'Giacomo il Maggiore, figlio di Zebedeo e fratello di Giovanni, fu uno dei Dodici Apostoli e uno dei discepoli più vicini a Gesù nei racconti evangelici. Gli Atti registrano la sua esecuzione sotto Erode Agrippa I, mentre la tradizione successiva lega il suo culto a Compostela.'
  },
  paragraphs: {
    en: [
      'The Gospels present James as a fisherman, son of Zebedee and brother of John. Jesus calls the two brothers while they are working by the Sea of Galilee. Together with Peter and John, James belongs to the smaller group of disciples present at moments such as the Transfiguration and the prayer in Gethsemane. The Acts of the Apostles later states that Herod Agrippa had James killed by the sword, making him the first of the Twelve whose martyrdom is explicitly recorded in the New Testament.',
      'A later Western tradition holds that James preached in the Iberian Peninsula and that his remains came to be venerated in Galicia. The Cathedral of Santiago de Compostela stands over the place venerated as his tomb, and the pilgrimage routes leading there became one of medieval Christianity’s major devotional networks. These claims belong to a later tradition distinct from the New Testament evidence and should be identified as such. In the Roman Catholic and Anglican calendars represented by Santos do Dia, Saint James the Greater is celebrated on 25 July.'
    ],
    pt: [
      'Os Evangelhos apresentam Tiago como pescador, filho de Zebedeu e irmão de João. Jesus chama os dois irmãos quando trabalhavam junto do mar da Galileia. Com Pedro e João, Tiago integra o grupo mais restrito de discípulos presente em momentos como a Transfiguração e a oração no Getsémani. Mais tarde, os Atos dos Apóstolos afirmam que Herodes Agripa mandou matar Tiago à espada, fazendo dele o primeiro dos Doze cujo martírio é explicitamente registado no Novo Testamento.',
      'Uma tradição ocidental posterior sustenta que Tiago pregou na Península Ibérica e que os seus restos mortais vieram a ser venerados na Galiza. A Catedral de Santiago de Compostela ergue-se sobre o local venerado como seu túmulo, e os caminhos de peregrinação até ali tornaram-se uma das grandes redes devocionais do cristianismo medieval. Estas afirmações pertencem a uma tradição posterior distinta da evidência neotestamentária e devem ser identificadas como tal. Nos calendários católico romano e anglicano representados no Santos do Dia, São Tiago Maior celebra-se a 25 de julho.'
    ],
    es: [
      'Los Evangelios presentan a Santiago como pescador, hijo de Zebedeo y hermano de Juan. Jesús llama a los dos hermanos mientras trabajan junto al mar de Galilea. Con Pedro y Juan, Santiago forma parte del grupo más reducido de discípulos presente en momentos como la Transfiguración y la oración en Getsemaní. Más tarde, los Hechos de los Apóstoles afirman que Herodes Agripa mandó matar a Santiago a espada, convirtiéndolo en el primero de los Doce cuyo martirio se registra explícitamente en el Nuevo Testamento.',
      'Una tradición occidental posterior sostiene que Santiago predicó en la Península Ibérica y que sus restos llegaron a ser venerados en Galicia. La Catedral de Santiago de Compostela se levanta sobre el lugar venerado como su sepulcro, y los caminos de peregrinación hacia él se convirtieron en una de las grandes redes devocionales del cristianismo medieval. Estas afirmaciones pertenecen a una tradición posterior distinta de la evidencia neotestamentaria y deben identificarse como tal. En los calendarios católico romano y anglicano representados por Santos do Dia, Santiago el Mayor se celebra el 25 de julio.'
    ],
    it: [
      'I Vangeli presentano Giacomo come pescatore, figlio di Zebedeo e fratello di Giovanni. Gesù chiama i due fratelli mentre lavorano presso il mare di Galilea. Con Pietro e Giovanni, Giacomo appartiene al gruppo più ristretto di discepoli presente in momenti come la Trasfigurazione e la preghiera nel Getsemani. Gli Atti degli Apostoli affermano poi che Erode Agrippa fece uccidere Giacomo con la spada, rendendolo il primo dei Dodici il cui martirio è esplicitamente registrato nel Nuovo Testamento.',
      'Una successiva tradizione occidentale sostiene che Giacomo abbia predicato nella Penisola Iberica e che i suoi resti siano giunti a essere venerati in Galizia. La Cattedrale di Santiago de Compostela sorge sul luogo venerato come sua tomba e i cammini di pellegrinaggio diretti lì divennero una delle grandi reti devozionali del cristianesimo medievale. Queste affermazioni appartengono a una tradizione posteriore distinta dalle prove neotestamentarie e vanno identificate come tali. Nei calendari cattolico romano e anglicano rappresentati da Santos do Dia, San Giacomo Maggiore si celebra il 25 luglio.'
    ]
  },
  facts: [
    { label: { en: 'Family', pt: 'Família', es: 'Familia', it: 'Famiglia' }, value: { en: 'Son of Zebedee; brother of John', pt: 'Filho de Zebedeu; irmão de João', es: 'Hijo de Zebedeo; hermano de Juan', it: 'Figlio di Zebedeo; fratello di Giovanni' } },
    { label: { en: 'Role', pt: 'Papel', es: 'Papel', it: 'Ruolo' }, value: { en: 'One of the Twelve Apostles', pt: 'Um dos Doze Apóstolos', es: 'Uno de los Doce Apóstoles', it: 'Uno dei Dodici Apostoli' } },
    { label: { en: 'Martyrdom', pt: 'Martírio', es: 'Martirio', it: 'Martirio' }, value: { en: 'Executed by Herod Agrippa I according to Acts 12', pt: 'Executado por Herodes Agripa I segundo Atos 12', es: 'Ejecutado por Herodes Agripa I según Hechos 12', it: 'Ucciso da Erode Agrippa I secondo Atti 12' } },
    { label: { en: 'Western feast', pt: 'Festa ocidental', es: 'Fiesta occidental', it: 'Festa occidentale' }, value: { en: '25 July', pt: '25 de julho', es: '25 de julio', it: '25 luglio' } }
  ],
  sources: [
    { name: 'St. James the Greater, Apostle', url: 'https://www.vaticannews.va/en/saints/07/25/st--james-the--greater--apostle.html', language: 'en', publisher: 'Vatican News' },
    { name: 'The Apostle Saint James', url: 'https://catedraldesantiago.es/en/cathedral/', language: 'en', publisher: 'Cathedral of Santiago de Compostela' }
  ],
  verifiedAt: '2026-08-15'
};

const luke: SaintBiography = {
  id: 'luke-evangelist',
  title: { en: 'Saint Luke the Evangelist', pt: 'São Lucas Evangelista', es: 'San Lucas Evangelista', it: 'San Luca Evangelista' },
  summary: {
    en: 'Luke is remembered as an evangelist, companion of Paul and the “beloved physician” named in the Letter to the Colossians. Christian tradition attributes to him the Gospel according to Luke and the Acts of the Apostles.',
    pt: 'Lucas é recordado como evangelista, companheiro de Paulo e o “médico amado” mencionado na Carta aos Colossenses. A tradição cristã atribui-lhe o Evangelho segundo São Lucas e os Atos dos Apóstolos.',
    es: 'Lucas es recordado como evangelista, compañero de Pablo y el “médico querido” mencionado en la Carta a los Colosenses. La tradición cristiana le atribuye el Evangelio según Lucas y los Hechos de los Apóstoles.',
    it: 'Luca è ricordato come evangelista, compagno di Paolo e il “caro medico” menzionato nella Lettera ai Colossesi. La tradizione cristiana gli attribuisce il Vangelo secondo Luca e gli Atti degli Apostoli.'
  },
  paragraphs: {
    en: [
      'Paul’s letters name Luke among his coworkers and call him the “beloved physician”. Christian tradition identifies this companion with the author of the Gospel according to Luke and its second volume, the Acts of the Apostles. Together the two books form a continuous narrative from the birth and ministry of Jesus to the expansion of the early Church. Luke’s Gospel is especially noted for material concerning mercy, prayer, the poor, women and the opening of the Christian message to the nations.',
      'Later Church traditions add details about Luke’s origin, missionary activity, death and artistic associations that are not documented with the same certainty as the New Testament references. Eastern tradition, for example, strongly associates him with sacred images of the Mother of God. Across traditions, however, his identity as evangelist and apostolic coworker is central. Catholic, Orthodox and Anglican calendars represented by Santos do Dia commemorate Saint Luke the Evangelist on 18 October.'
    ],
    pt: [
      'As cartas de Paulo mencionam Lucas entre os seus colaboradores e chamam-lhe “médico amado”. A tradição cristã identifica este companheiro com o autor do Evangelho segundo São Lucas e do seu segundo volume, os Atos dos Apóstolos. Em conjunto, os dois livros formam uma narrativa contínua desde o nascimento e ministério de Jesus até à expansão da Igreja primitiva. O Evangelho de Lucas destaca-se particularmente pelo material sobre misericórdia, oração, pobres, mulheres e abertura da mensagem cristã aos povos.',
      'Tradições eclesiais posteriores acrescentam pormenores sobre a origem de Lucas, atividade missionária, morte e associações artísticas que não estão documentados com a mesma certeza das referências neotestamentárias. A tradição oriental, por exemplo, associa-o fortemente a imagens sagradas da Mãe de Deus. Entre as várias tradições, porém, permanece central a sua identidade como evangelista e colaborador apostólico. Os calendários católico, ortodoxo e anglicano representados no Santos do Dia comemoram São Lucas Evangelista a 18 de outubro.'
    ],
    es: [
      'Las cartas de Pablo mencionan a Lucas entre sus colaboradores y lo llaman “médico querido”. La tradición cristiana identifica a este compañero con el autor del Evangelio según Lucas y de su segundo volumen, los Hechos de los Apóstoles. Juntos, ambos libros forman una narración continua desde el nacimiento y el ministerio de Jesús hasta la expansión de la Iglesia primitiva. El Evangelio de Lucas destaca especialmente por su material sobre misericordia, oración, pobres, mujeres y apertura del mensaje cristiano a los pueblos.',
      'Tradiciones eclesiales posteriores añaden detalles sobre el origen de Lucas, su actividad misionera, muerte y asociaciones artísticas que no están documentados con la misma certeza que las referencias neotestamentarias. La tradición oriental, por ejemplo, lo vincula fuertemente con imágenes sagradas de la Madre de Dios. Entre las distintas tradiciones, sin embargo, sigue siendo central su identidad como evangelista y colaborador apostólico. Los calendarios católico, ortodoxo y anglicano representados por Santos do Dia conmemoran a San Lucas Evangelista el 18 de octubre.'
    ],
    it: [
      'Le lettere di Paolo nominano Luca tra i suoi collaboratori e lo chiamano “caro medico”. La tradizione cristiana identifica questo compagno con l’autore del Vangelo secondo Luca e del suo secondo volume, gli Atti degli Apostoli. Insieme i due libri formano una narrazione continua dalla nascita e dal ministero di Gesù fino all’espansione della Chiesa primitiva. Il Vangelo di Luca si distingue in particolare per il materiale dedicato alla misericordia, alla preghiera, ai poveri, alle donne e all’apertura del messaggio cristiano ai popoli.',
      'Tradizioni ecclesiali successive aggiungono particolari sull’origine di Luca, sulla sua attività missionaria, sulla morte e sulle associazioni artistiche che non sono documentati con la stessa certezza dei riferimenti neotestamentari. La tradizione orientale, per esempio, lo lega fortemente alle immagini sacre della Madre di Dio. Tra le diverse tradizioni resta comunque centrale la sua identità di evangelista e collaboratore apostolico. I calendari cattolico, ortodosso e anglicano rappresentati da Santos do Dia commemorano San Luca Evangelista il 18 ottobre.'
    ]
  },
  facts: [
    { label: { en: 'New Testament', pt: 'Novo Testamento', es: 'Nuevo Testamento', it: 'Nuovo Testamento' }, value: { en: 'Companion of Paul; called the beloved physician', pt: 'Companheiro de Paulo; chamado médico amado', es: 'Compañero de Pablo; llamado médico querido', it: 'Compagno di Paolo; chiamato caro medico' } },
    { label: { en: 'Traditional authorship', pt: 'Autoria tradicional', es: 'Autoría tradicional', it: 'Attribuzione tradizionale' }, value: { en: 'Gospel of Luke and Acts of the Apostles', pt: 'Evangelho de Lucas e Atos dos Apóstolos', es: 'Evangelio de Lucas y Hechos de los Apóstoles', it: 'Vangelo di Luca e Atti degli Apostoli' } },
    { label: { en: 'Symbol', pt: 'Símbolo', es: 'Símbolo', it: 'Simbolo' }, value: { en: 'Winged ox', pt: 'Boi alado', es: 'Buey alado', it: 'Bue alato' } },
    { label: { en: 'Feast', pt: 'Festa', es: 'Fiesta', it: 'Festa' }, value: { en: '18 October', pt: '18 de outubro', es: '18 de octubre', it: '18 ottobre' } }
  ],
  sources: [
    { name: 'St. Luke, Evangelist, Physician', url: 'https://www.vaticannews.va/en/saints/10/18/st--luke--evangelist--physician---patron-of--artists.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Apostle and Evangelist Luke', url: 'https://www.oca.org/saints/all-lives/1999/10/18', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

const andrew: SaintBiography = {
  id: 'andrew-apostle',
  title: { en: 'Saint Andrew the Apostle', pt: 'Santo André Apóstolo', es: 'San Andrés Apóstol', it: 'Sant’Andrea Apostolo' },
  summary: {
    en: 'Andrew, brother of Simon Peter and a fisherman from Bethsaida, is one of the Twelve Apostles. John’s Gospel remembers him among the first disciples to follow Jesus, giving rise to the Eastern title “the First-Called”.',
    pt: 'André, irmão de Simão Pedro e pescador de Betsaida, é um dos Doze Apóstolos. O Evangelho de João recorda-o entre os primeiros discípulos a seguir Jesus, origem do título oriental “Primeiro Chamado”.',
    es: 'Andrés, hermano de Simón Pedro y pescador de Betsaida, es uno de los Doce Apóstoles. El Evangelio de Juan lo recuerda entre los primeros discípulos que siguieron a Jesús, origen del título oriental “Primer Llamado”.',
    it: 'Andrea, fratello di Simon Pietro e pescatore di Betsaida, è uno dei Dodici Apostoli. Il Vangelo di Giovanni lo ricorda tra i primi discepoli a seguire Gesù, origine del titolo orientale “Primo Chiamato”.'
  },
  paragraphs: {
    en: [
      'The Gospels identify Andrew as the brother of Simon Peter and a fisherman from Bethsaida. In John’s account he first appears as a disciple of John the Baptist who follows Jesus and then brings his brother Simon to him. The Synoptic Gospels describe the brothers leaving their nets after Jesus calls them by the Sea of Galilee. These passages underlie the ancient Eastern title “First-Called”, emphasizing Andrew’s place at the beginning of the apostolic company.',
      'Church traditions describe Andrew preaching in regions around the eastern Mediterranean and Black Sea and eventually suffering martyrdom at Patras. Details of those journeys belong to later ecclesial memory rather than the Gospel record, but Andrew’s association with Constantinople became especially important in the Christian East. The diagonal or X-shaped cross is a later and enduring symbol of his martyrdom. Catholic, Orthodox and Anglican calendars represented by Santos do Dia keep his feast on 30 November.'
    ],
    pt: [
      'Os Evangelhos identificam André como irmão de Simão Pedro e pescador de Betsaida. No relato de João aparece primeiro como discípulo de João Batista que segue Jesus e depois leva até ele o irmão Simão. Os Evangelhos sinóticos descrevem os irmãos a deixar as redes depois de serem chamados por Jesus junto do mar da Galileia. Estas passagens estão na origem do antigo título oriental “Primeiro Chamado”, que sublinha o lugar de André no início do grupo apostólico.',
      'As tradições eclesiais descrevem André a pregar em regiões do Mediterrâneo oriental e do mar Negro e, por fim, a sofrer o martírio em Patras. Os detalhes dessas viagens pertencem à memória eclesial posterior e não ao registo evangélico, mas a associação de André a Constantinopla tornou-se particularmente importante no Oriente cristão. A cruz diagonal, em forma de X, é um símbolo posterior e duradouro do seu martírio. Os calendários católico, ortodoxo e anglicano representados no Santos do Dia celebram-no a 30 de novembro.'
    ],
    es: [
      'Los Evangelios identifican a Andrés como hermano de Simón Pedro y pescador de Betsaida. En el relato de Juan aparece primero como discípulo de Juan Bautista que sigue a Jesús y después lleva hasta él a su hermano Simón. Los Evangelios sinópticos describen a los hermanos dejando las redes después de ser llamados por Jesús junto al mar de Galilea. Estos pasajes están en el origen del antiguo título oriental “Primer Llamado”, que destaca el lugar de Andrés al comienzo del grupo apostólico.',
      'Las tradiciones eclesiales describen a Andrés predicando en regiones del Mediterráneo oriental y del mar Negro y, finalmente, sufriendo el martirio en Patras. Los detalles de esos viajes pertenecen a una memoria eclesial posterior y no al registro evangélico, pero la asociación de Andrés con Constantinopla adquirió especial importancia en el Oriente cristiano. La cruz diagonal, en forma de X, es un símbolo posterior y duradero de su martirio. Los calendarios católico, ortodoxo y anglicano representados por Santos do Dia celebran su fiesta el 30 de noviembre.'
    ],
    it: [
      'I Vangeli identificano Andrea come fratello di Simon Pietro e pescatore di Betsaida. Nel racconto di Giovanni compare dapprima come discepolo di Giovanni Battista che segue Gesù e poi conduce da lui il fratello Simone. I Vangeli sinottici descrivono i fratelli che lasciano le reti dopo la chiamata di Gesù presso il mare di Galilea. Questi passi sono alla base dell’antico titolo orientale “Primo Chiamato”, che sottolinea il posto di Andrea all’inizio del gruppo apostolico.',
      'Le tradizioni ecclesiali descrivono Andrea mentre predica in regioni del Mediterraneo orientale e del Mar Nero e infine subisce il martirio a Patrasso. I dettagli di questi viaggi appartengono alla successiva memoria ecclesiale e non al racconto evangelico, ma l’associazione di Andrea con Costantinopoli divenne particolarmente importante nell’Oriente cristiano. La croce diagonale a forma di X è un simbolo più tardo e duraturo del suo martirio. I calendari cattolico, ortodosso e anglicano rappresentati da Santos do Dia ne celebrano la festa il 30 novembre.'
    ]
  },
  facts: [
    { label: { en: 'Origin', pt: 'Origem', es: 'Origen', it: 'Origine' }, value: { en: 'Bethsaida, Galilee', pt: 'Betsaida, Galileia', es: 'Betsaida, Galilea', it: 'Betsaida, Galilea' } },
    { label: { en: 'Family', pt: 'Família', es: 'Familia', it: 'Famiglia' }, value: { en: 'Brother of Simon Peter', pt: 'Irmão de Simão Pedro', es: 'Hermano de Simón Pedro', it: 'Fratello di Simon Pietro' } },
    { label: { en: 'Eastern title', pt: 'Título oriental', es: 'Título oriental', it: 'Titolo orientale' }, value: { en: 'The First-Called', pt: 'O Primeiro Chamado', es: 'El Primer Llamado', it: 'Il Primo Chiamato' } },
    { label: { en: 'Feast', pt: 'Festa', es: 'Fiesta', it: 'Festa' }, value: { en: '30 November', pt: '30 de novembro', es: '30 de noviembre', it: '30 novembre' } }
  ],
  sources: [
    { name: 'St. Andrew, Apostle', url: 'https://www.vaticannews.va/en/saints/11/30/st--andrew--apostle.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Apostle Andrew, the Holy and All-Praised First-Called', url: 'https://www.oca.org/saints/lives/2026/11/30/103450-apostle-andrew-the-holy-and-all-praised-first-called', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

const stephen: SaintBiography = {
  id: 'stephen-first-martyr',
  title: { en: 'Saint Stephen, the First Martyr', pt: 'Santo Estêvão, primeiro mártir', es: 'San Esteban, primer mártir', it: 'Santo Stefano, primo martire' },
  summary: {
    en: 'Stephen is the first Christian martyr described in the Acts of the Apostles and one of the seven chosen to serve the Jerusalem community. His final prayer for his persecutors made him an enduring model of Christian witness and forgiveness.',
    pt: 'Estêvão é o primeiro mártir cristão descrito nos Atos dos Apóstolos e um dos sete escolhidos para servir a comunidade de Jerusalém. A oração final pelos seus perseguidores fez dele um modelo duradouro de testemunho cristão e perdão.',
    es: 'Esteban es el primer mártir cristiano descrito en los Hechos de los Apóstoles y uno de los siete elegidos para servir a la comunidad de Jerusalén. Su oración final por sus perseguidores lo convirtió en un modelo duradero de testimonio cristiano y perdón.',
    it: 'Stefano è il primo martire cristiano descritto negli Atti degli Apostoli e uno dei sette scelti per servire la comunità di Gerusalemme. La preghiera finale per i suoi persecutori ne fece un modello duraturo di testimonianza cristiana e perdono.'
  },
  paragraphs: {
    en: [
      'Acts 6–7 provides the principal account of Stephen. He is named first among seven men chosen as the Jerusalem community organizes service to members in need. Acts describes him as full of grace, power and the Holy Spirit. Opposition to his preaching leads to his appearance before the council, where he gives a long speech interpreting Israel’s history and accusing his hearers of resisting God’s messengers.',
      'Stephen is then taken outside the city and stoned. The narrative notes the presence of Saul, later Paul, and records Stephen entrusting his spirit to Jesus and praying that the sin not be held against those killing him. Because this is the first Christian martyrdom narrated after the death and resurrection of Jesus, Stephen is traditionally called the Protomartyr. Calendar dates are not identical across Churches: Western calendars represented by Santos do Dia celebrate him on 26 December, while the Orthodox Church in America commemorates him on 27 December.'
    ],
    pt: [
      'Os capítulos 6–7 dos Atos dos Apóstolos fornecem o principal relato sobre Estêvão. O seu nome surge em primeiro lugar entre sete homens escolhidos quando a comunidade de Jerusalém organiza o serviço aos membros necessitados. Os Atos descrevem-no como cheio de graça, poder e Espírito Santo. A oposição à sua pregação leva-o perante o conselho, onde profere um longo discurso que interpreta a história de Israel e acusa os ouvintes de resistirem aos mensageiros de Deus.',
      'Estêvão é depois levado para fora da cidade e apedrejado. A narrativa assinala a presença de Saulo, futuro Paulo, e regista Estêvão a confiar o seu espírito a Jesus e a pedir que o pecado não seja imputado aos que o matavam. Por ser o primeiro martírio cristão narrado depois da morte e ressurreição de Jesus, Estêvão é tradicionalmente chamado Protomártir. As datas não são idênticas em todas as Igrejas: os calendários ocidentais representados no Santos do Dia celebram-no a 26 de dezembro, enquanto a Orthodox Church in America o comemora a 27 de dezembro.'
    ],
    es: [
      'Los capítulos 6–7 de los Hechos de los Apóstoles ofrecen el relato principal sobre Esteban. Su nombre aparece primero entre siete hombres elegidos cuando la comunidad de Jerusalén organiza el servicio a los miembros necesitados. Hechos lo describe lleno de gracia, poder y Espíritu Santo. La oposición a su predicación lo lleva ante el consejo, donde pronuncia un largo discurso que interpreta la historia de Israel y acusa a sus oyentes de resistir a los mensajeros de Dios.',
      'Esteban es llevado después fuera de la ciudad y apedreado. El relato señala la presencia de Saulo, futuro Pablo, y registra a Esteban confiando su espíritu a Jesús y pidiendo que el pecado no sea imputado a quienes lo matan. Por ser el primer martirio cristiano narrado después de la muerte y resurrección de Jesús, Esteban es llamado tradicionalmente Protomártir. Las fechas no son idénticas en todas las Iglesias: los calendarios occidentales representados por Santos do Dia lo celebran el 26 de diciembre, mientras la Orthodox Church in America lo conmemora el 27 de diciembre.'
    ],
    it: [
      'I capitoli 6–7 degli Atti degli Apostoli forniscono il racconto principale su Stefano. Il suo nome compare per primo tra sette uomini scelti quando la comunità di Gerusalemme organizza il servizio ai membri bisognosi. Gli Atti lo descrivono pieno di grazia, potenza e Spirito Santo. L’opposizione alla sua predicazione lo conduce davanti al consiglio, dove pronuncia un lungo discorso che interpreta la storia d’Israele e accusa gli ascoltatori di resistere ai messaggeri di Dio.',
      'Stefano viene poi condotto fuori dalla città e lapidato. Il racconto segnala la presenza di Saulo, il futuro Paolo, e registra Stefano mentre affida il proprio spirito a Gesù e prega che il peccato non sia imputato a coloro che lo uccidono. Poiché è il primo martirio cristiano narrato dopo la morte e risurrezione di Gesù, Stefano è tradizionalmente chiamato Protomartire. Le date non coincidono in tutte le Chiese: i calendari occidentali rappresentati da Santos do Dia lo celebrano il 26 dicembre, mentre la Orthodox Church in America lo commemora il 27 dicembre.'
    ]
  },
  facts: [
    { label: { en: 'Biblical source', pt: 'Fonte bíblica', es: 'Fuente bíblica', it: 'Fonte biblica' }, value: { en: 'Acts of the Apostles 6–7', pt: 'Atos dos Apóstolos 6–7', es: 'Hechos de los Apóstoles 6–7', it: 'Atti degli Apostoli 6–7' } },
    { label: { en: 'Role', pt: 'Papel', es: 'Papel', it: 'Ruolo' }, value: { en: 'One of the Seven; first Christian martyr', pt: 'Um dos Sete; primeiro mártir cristão', es: 'Uno de los Siete; primer mártir cristiano', it: 'Uno dei Sette; primo martire cristiano' } },
    { label: { en: 'Western feast', pt: 'Festa ocidental', es: 'Fiesta occidental', it: 'Festa occidentale' }, value: { en: '26 December', pt: '26 de dezembro', es: '26 de diciembre', it: '26 dicembre' } },
    { label: { en: 'OCA commemoration', pt: 'Comemoração OCA', es: 'Conmemoración OCA', it: 'Commemorazione OCA' }, value: { en: '27 December', pt: '27 de dezembro', es: '27 de diciembre', it: '27 dicembre' } }
  ],
  sources: [
    { name: 'St. Stephen, First Martyr', url: 'https://www.vaticannews.va/en/saints/12/26/st--stephen--first-martyr.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Protomartyr and Archdeacon Stephen', url: 'https://www.oca.org/saints/lives/2026/12/27/103659-protomartyr-and-archdeacon-stephen', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

export const EDITORIAL_SCALE_BATCH_2: SaintBiography[] = [anthonyGreat, joseph, george, mark, jamesGreater, luke, andrew, stephen];

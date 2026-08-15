import type { SaintBiography } from './saint-biographies';

const francisAssisi: SaintBiography = {
  id: 'francis-assisi',
  title: { en: 'Saint Francis of Assisi', pt: 'São Francisco de Assis', es: 'San Francisco de Asís', it: 'San Francesco d’Assisi' },
  summary: {
    en: 'Francis of Assisi (1181/1182–1226) renounced a prosperous merchant life to follow the Gospel in poverty, founded the Friars Minor and became one of Christianity’s most influential witnesses to peace, fraternity and care for creation.',
    pt: 'Francisco de Assis (1181/1182–1226) deixou uma vida mercantil abastada para seguir o Evangelho na pobreza, deu origem aos Frades Menores e tornou-se uma das figuras cristãs mais influentes na paz, fraternidade e cuidado da criação.',
    es: 'Francisco de Asís (1181/1182–1226) dejó una vida mercantil acomodada para seguir el Evangelio en pobreza, dio origen a los Frailes Menores y se convirtió en una de las figuras cristianas más influyentes en la paz, la fraternidad y el cuidado de la creación.',
    it: 'Francesco d’Assisi (1181/1182–1226) lasciò una vita mercantile agiata per seguire il Vangelo nella povertà, diede origine ai Frati Minori e divenne una delle figure cristiane più influenti per la pace, la fraternità e la cura del creato.'
  },
  paragraphs: {
    en: [
      'Born in Assisi in 1181 or 1182 into the family of the cloth merchant Pietro di Bernardone, Francis spent his youth in the ambitions and comforts of the city’s merchant class. Experiences of war, imprisonment and illness contributed to a gradual conversion. He increasingly turned toward prayer, service to people living in poverty and a literal commitment to the Gospel.',
      'Around 1209 Francis and his first companions travelled to Rome, where their form of evangelical life received approval from Pope Innocent III. The fraternity grew into the Order of Friars Minor. Francis also inspired Clare of Assisi and the community that became the Poor Clares, as well as a lay movement later associated with the Franciscan Third Order.',
      'Francis travelled to Egypt during the crusading period and met Sultan al-Malik al-Kamil. In 1224, at La Verna, Francis received the stigmata according to the Franciscan tradition. He died near the Porziuncola at Assisi in October 1226 and was canonised by Pope Gregory IX in 1228. His feast is celebrated on 4 October.'
    ],
    pt: [
      'Nascido em Assis em 1181 ou 1182, numa família ligada ao comércio de tecidos, Francisco passou a juventude entre as ambições e o conforto da burguesia urbana. A experiência da guerra, do cativeiro e da doença contribuiu para uma conversão gradual. Aproximou-se cada vez mais da oração, do serviço aos pobres e de uma leitura exigente do Evangelho.',
      'Por volta de 1209, Francisco e os primeiros companheiros foram a Roma, onde a sua forma de vida evangélica recebeu aprovação do Papa Inocêncio III. A fraternidade cresceu e deu origem à Ordem dos Frades Menores. Francisco inspirou também Clara de Assis e a comunidade que se tornou a Ordem das Clarissas, bem como um movimento laical associado posteriormente à Ordem Terceira Franciscana.',
      'Durante o período das cruzadas, Francisco viajou para o Egito e encontrou-se com o sultão al-Malik al-Kamil. Em 1224, no monte Alverne, recebeu os estigmas segundo a tradição franciscana. Morreu junto da Porciúncula, em Assis, em outubro de 1226 e foi canonizado por Gregório IX em 1228. A sua memória litúrgica celebra-se a 4 de outubro.'
    ],
    es: [
      'Nacido en Asís en 1181 o 1182, en una familia dedicada al comercio de telas, Francisco pasó su juventud entre las aspiraciones y comodidades de la clase mercantil urbana. La guerra, el cautiverio y la enfermedad contribuyeron a una conversión gradual. Se orientó cada vez más hacia la oración, el servicio a los pobres y una adhesión exigente al Evangelio.',
      'Hacia 1209, Francisco y sus primeros compañeros viajaron a Roma, donde su forma de vida evangélica recibió la aprobación del papa Inocencio III. La fraternidad creció y dio origen a la Orden de los Frailes Menores. Francisco inspiró también a Clara de Asís y a la comunidad que se convertiría en las Clarisas, además de un movimiento laical vinculado después a la Tercera Orden Franciscana.',
      'Durante el período de las cruzadas, Francisco viajó a Egipto y se encontró con el sultán al-Malik al-Kamil. En 1224, en el monte Alverna, recibió los estigmas según la tradición franciscana. Murió cerca de la Porciúncula, en Asís, en octubre de 1226 y fue canonizado por Gregorio IX en 1228. Su memoria se celebra el 4 de octubre.'
    ],
    it: [
      'Nato ad Assisi nel 1181 o 1182, nella famiglia del mercante di stoffe Pietro di Bernardone, Francesco trascorse la giovinezza tra le aspirazioni e le comodità del ceto mercantile cittadino. La guerra, la prigionia e la malattia contribuirono a una conversione graduale. Si orientò sempre più verso la preghiera, il servizio ai poveri e un’adesione radicale al Vangelo.',
      'Intorno al 1209 Francesco e i primi compagni si recarono a Roma, dove la loro forma di vita evangelica ricevette l’approvazione di papa Innocenzo III. La fraternità crebbe dando origine all’Ordine dei Frati Minori. Francesco ispirò anche Chiara d’Assisi e la comunità che divenne l’Ordine delle Clarisse, oltre al movimento laicale poi associato al Terz’Ordine francescano.',
      'Nel periodo delle crociate Francesco viaggiò in Egitto e incontrò il sultano al-Malik al-Kamil. Nel 1224, alla Verna, ricevette le stimmate secondo la tradizione francescana. Morì presso la Porziuncola ad Assisi nell’ottobre 1226 e fu canonizzato da Gregorio IX nel 1228. La sua memoria liturgica ricorre il 4 ottobre.'
    ]
  },
  facts: [
    { label: { en: 'Born', pt: 'Nascimento', es: 'Nacimiento', it: 'Nascita' }, value: { en: '1181/1182 · Assisi, Italy', pt: '1181/1182 · Assis, Itália', es: '1181/1182 · Asís, Italia', it: '1181/1182 · Assisi, Italia' } },
    { label: { en: 'Died', pt: 'Morte', es: 'Fallecimiento', it: 'Morte' }, value: { en: 'October 1226 · Assisi', pt: 'outubro de 1226 · Assis', es: 'octubre de 1226 · Asís', it: 'ottobre 1226 · Assisi' } },
    { label: { en: 'Canonised', pt: 'Canonização', es: 'Canonización', it: 'Canonizzazione' }, value: { en: '1228 · Pope Gregory IX', pt: '1228 · Papa Gregório IX', es: '1228 · Papa Gregorio IX', it: '1228 · papa Gregorio IX' } },
    { label: { en: 'Feast', pt: 'Memória', es: 'Memoria', it: 'Memoria' }, value: { en: '4 October', pt: '4 de outubro', es: '4 de octubre', it: '4 ottobre' } }
  ],
  sources: [
    { name: 'St. Francis of Assisi — Saint of the Day', url: 'https://www.vaticannews.va/en/saints/10/04/st--francis-of-assisi--founder-of-the-franciscan--order--patron-.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Saint Francis — The Life of Francis', url: 'https://ofm.org/en/saint-francis.html', language: 'en', publisher: 'Order of Friars Minor' }
  ],
  verifiedAt: '2026-08-15'
};

const clareAssisi: SaintBiography = {
  id: 'clare-assisi',
  title: { en: 'Saint Clare of Assisi', pt: 'Santa Clara de Assis', es: 'Santa Clara de Asís', it: 'Santa Chiara d’Assisi' },
  summary: {
    en: 'Clare of Assisi (c. 1193/1194–1253) left a wealthy family to embrace the evangelical poverty associated with Francis of Assisi, led the community at San Damiano and shaped the rule of life that became the foundation of the Poor Clares.',
    pt: 'Clara de Assis (c. 1193/1194–1253) deixou uma família abastada para abraçar a pobreza evangélica associada a Francisco de Assis, dirigiu a comunidade de São Damião e marcou a regra de vida que esteve na origem das Clarissas.',
    es: 'Clara de Asís (c. 1193/1194–1253) dejó una familia acomodada para abrazar la pobreza evangélica vinculada a Francisco de Asís, dirigió la comunidad de San Damián y dio forma a la regla de vida que fundamentó a las Clarisas.',
    it: 'Chiara d’Assisi (c. 1193/1194–1253) lasciò una famiglia agiata per abbracciare la povertà evangelica legata a Francesco d’Assisi, guidò la comunità di San Damiano e contribuì a definire la forma di vita delle Clarisse.'
  },
  paragraphs: {
    en: [
      'Clare was born in Assisi into a noble family near the end of the twelfth century. As a young woman she was deeply influenced by the preaching and example of Francis of Assisi. In 1211 or 1212 she left her family home and joined Francis at the Porziuncola, beginning a form of consecrated life centred on prayer, fraternity and poverty.',
      'After short stays with Benedictine communities, Clare and her companions settled at San Damiano outside Assisi. The community became known as the Poor Ladies and later as the Poor Clares. Clare served as its leader for decades and defended the community’s commitment to living without secure property, a principle often described as the privilege of poverty.',
      'Clare’s Rule received papal confirmation in 1253 shortly before her death. She died at San Damiano on 11 August 1253 and was canonised by Pope Alexander IV two years later. Her feast is celebrated on 11 August. In the twentieth century Pope Pius XII named her patroness of television, recalling a tradition associated with an illness that prevented her from attending worship in person.'
    ],
    pt: [
      'Clara nasceu em Assis, numa família nobre, no final do século XII. Ainda jovem foi profundamente influenciada pela pregação e pelo exemplo de Francisco de Assis. Em 1211 ou 1212 deixou a casa familiar e juntou-se a Francisco na Porciúncula, iniciando uma forma de vida consagrada centrada na oração, fraternidade e pobreza.',
      'Depois de breves estadias em comunidades beneditinas, Clara e as companheiras instalaram-se em São Damião, nos arredores de Assis. A comunidade ficou conhecida como Pobres Damas e, mais tarde, como Clarissas. Clara dirigiu-a durante décadas e defendeu o compromisso de viver sem propriedade assegurada, princípio frequentemente designado como privilégio da pobreza.',
      'A Regra de Clara recebeu confirmação pontifícia em 1253, pouco antes da sua morte. Clara morreu em São Damião a 11 de agosto de 1253 e foi canonizada pelo Papa Alexandre IV dois anos depois. A sua memória celebra-se a 11 de agosto. No século XX, Pio XII proclamou-a padroeira da televisão, a partir de uma tradição ligada a um período de doença que a impedia de participar presencialmente na liturgia.'
    ],
    es: [
      'Clara nació en Asís, en una familia noble, a finales del siglo XII. Desde joven quedó profundamente marcada por la predicación y el ejemplo de Francisco de Asís. En 1211 o 1212 dejó la casa familiar y se unió a Francisco en la Porciúncula, iniciando una forma de vida consagrada centrada en la oración, la fraternidad y la pobreza.',
      'Tras breves estancias en comunidades benedictinas, Clara y sus compañeras se establecieron en San Damián, a las afueras de Asís. La comunidad fue conocida como las Damas Pobres y más tarde como las Clarisas. Clara la dirigió durante décadas y defendió el compromiso de vivir sin propiedad asegurada, principio conocido como el privilegio de la pobreza.',
      'La Regla de Clara recibió confirmación pontificia en 1253, poco antes de su muerte. Murió en San Damián el 11 de agosto de 1253 y fue canonizada por el papa Alejandro IV dos años después. Su memoria se celebra el 11 de agosto. En el siglo XX, Pío XII la proclamó patrona de la televisión a partir de una tradición relacionada con una enfermedad que le impedía asistir personalmente al culto.'
    ],
    it: [
      'Chiara nacque ad Assisi in una famiglia nobile alla fine del XII secolo. Ancora giovane fu profondamente segnata dalla predicazione e dall’esempio di Francesco d’Assisi. Nel 1211 o 1212 lasciò la casa paterna e raggiunse Francesco alla Porziuncola, iniziando una forma di vita consacrata fondata sulla preghiera, la fraternità e la povertà.',
      'Dopo brevi permanenze in comunità benedettine, Chiara e le sue compagne si stabilirono a San Damiano, fuori Assisi. La comunità fu conosciuta come le Povere Dame e in seguito come le Clarisse. Chiara la guidò per decenni e difese l’impegno a vivere senza proprietà garantite, principio ricordato come privilegio della povertà.',
      'La Regola di Chiara ricevette la conferma pontificia nel 1253, poco prima della sua morte. Morì a San Damiano l’11 agosto 1253 e fu canonizzata da papa Alessandro IV due anni dopo. La memoria liturgica ricorre l’11 agosto. Nel Novecento Pio XII la proclamò patrona della televisione, richiamando una tradizione legata a una malattia che le impediva di partecipare personalmente alle celebrazioni.'
    ]
  },
  facts: [
    { label: { en: 'Born', pt: 'Nascimento', es: 'Nacimiento', it: 'Nascita' }, value: { en: 'c. 1193/1194 · Assisi, Italy', pt: 'c. 1193/1194 · Assis, Itália', es: 'c. 1193/1194 · Asís, Italia', it: 'c. 1193/1194 · Assisi, Italia' } },
    { label: { en: 'Died', pt: 'Morte', es: 'Fallecimiento', it: 'Morte' }, value: { en: '11 August 1253 · San Damiano, Assisi', pt: '11 de agosto de 1253 · São Damião, Assis', es: '11 de agosto de 1253 · San Damián, Asís', it: '11 agosto 1253 · San Damiano, Assisi' } },
    { label: { en: 'Canonised', pt: 'Canonização', es: 'Canonización', it: 'Canonizzazione' }, value: { en: '1255 · Pope Alexander IV', pt: '1255 · Papa Alexandre IV', es: '1255 · Papa Alejandro IV', it: '1255 · papa Alessandro IV' } },
    { label: { en: 'Feast', pt: 'Memória', es: 'Memoria', it: 'Memoria' }, value: { en: '11 August', pt: '11 de agosto', es: '11 de agosto', it: '11 agosto' } }
  ],
  sources: [
    { name: 'St. Clare of Assisi — Saint of the Day', url: 'https://www.vaticannews.va/en/saints/08/11/st--clare-of-assisis--virgin--foundress-of-the-poor-ladies.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Clare of Assisi: Early Documents — source collection notice', url: 'https://ofm.org/en/complete-english-translations-of-early-franciscan-sources-now-online.html', language: 'en', publisher: 'Order of Friars Minor' }
  ],
  verifiedAt: '2026-08-15'
};

const teresaAvila: SaintBiography = {
  id: 'teresa-avila',
  title: { en: 'Saint Teresa of Ávila', pt: 'Santa Teresa de Ávila', es: 'Santa Teresa de Ávila', it: 'Santa Teresa d’Avila' },
  summary: {
    en: 'Teresa of Ávila (1515–1582) was a Carmelite nun, reformer and major writer on Christian prayer. Her foundations helped shape the Discalced Carmelite reform, and in 1970 she became the first woman proclaimed a Doctor of the Church.',
    pt: 'Teresa de Ávila (1515–1582) foi monja carmelita, reformadora e uma das grandes autoras cristãs sobre a oração. As suas fundações marcaram a reforma carmelita descalça e, em 1970, tornou-se a primeira mulher proclamada Doutora da Igreja.',
    es: 'Teresa de Ávila (1515–1582) fue monja carmelita, reformadora y una de las grandes autoras cristianas sobre la oración. Sus fundaciones marcaron la reforma del Carmelo descalzo y, en 1970, se convirtió en la primera mujer proclamada Doctora de la Iglesia.',
    it: 'Teresa d’Avila (1515–1582) fu monaca carmelitana, riformatrice e una delle grandi autrici cristiane sulla preghiera. Le sue fondazioni segnarono la riforma del Carmelo scalzo e nel 1970 divenne la prima donna proclamata Dottore della Chiesa.'
  },
  paragraphs: {
    en: [
      'Teresa de Cepeda y Ahumada was born in Ávila, Castile, on 28 March 1515. After education and periods of serious illness, she entered the Carmelite monastery of the Incarnation in Ávila in the 1530s. Her spiritual development was gradual and was accompanied by an intense life of prayer, discernment and writing.',
      'From the 1560s Teresa began founding communities intended to observe a simpler and more demanding Carmelite life. Her reform developed alongside the work of John of the Cross and others and became associated with the Discalced Carmelites. Teresa combined administrative energy with a sustained account of prayer and interior life in works including The Life, The Way of Perfection and The Interior Castle.',
      'Teresa died at Alba de Tormes in October 1582 during the transition to the Gregorian calendar. She was canonised in 1622. Pope Paul VI proclaimed her a Doctor of the Church in 1970, the first woman to receive that title. Her liturgical memorial is celebrated on 15 October.'
    ],
    pt: [
      'Teresa de Cepeda y Ahumada nasceu em Ávila, Castela, a 28 de março de 1515. Depois da formação e de períodos de doença grave, entrou na década de 1530 no mosteiro carmelita da Encarnação, em Ávila. O seu percurso espiritual foi gradual e acompanhou uma intensa vida de oração, discernimento e escrita.',
      'A partir da década de 1560, Teresa começou a fundar comunidades destinadas a viver uma forma mais simples e exigente da tradição carmelita. A reforma desenvolveu-se em paralelo com a ação de João da Cruz e de outros colaboradores e ficou associada aos Carmelitas Descalços. Teresa uniu capacidade de organização a uma reflexão profunda sobre a oração e a vida interior em obras como Livro da Vida, Caminho de Perfeição e Castelo Interior.',
      'Teresa morreu em Alba de Tormes em outubro de 1582, no período de transição para o calendário gregoriano. Foi canonizada em 1622. Em 1970, Paulo VI proclamou-a Doutora da Igreja, tornando-se a primeira mulher a receber esse título. A sua memória litúrgica celebra-se a 15 de outubro.'
    ],
    es: [
      'Teresa de Cepeda y Ahumada nació en Ávila, Castilla, el 28 de marzo de 1515. Tras su formación y varios períodos de enfermedad grave, ingresó en la década de 1530 en el monasterio carmelita de la Encarnación de Ávila. Su desarrollo espiritual fue gradual y estuvo acompañado por una intensa vida de oración, discernimiento y escritura.',
      'Desde la década de 1560 Teresa comenzó a fundar comunidades orientadas a una forma más sencilla y exigente de vida carmelita. La reforma se desarrolló junto a la obra de Juan de la Cruz y otros colaboradores y quedó asociada a los Carmelitas Descalzos. Teresa combinó una gran capacidad organizativa con una profunda reflexión sobre la oración y la vida interior en obras como Libro de la Vida, Camino de perfección y Castillo interior.',
      'Teresa murió en Alba de Tormes en octubre de 1582, durante la transición al calendario gregoriano. Fue canonizada en 1622. En 1970 Pablo VI la proclamó Doctora de la Iglesia, convirtiéndose en la primera mujer en recibir ese título. Su memoria litúrgica se celebra el 15 de octubre.'
    ],
    it: [
      'Teresa de Cepeda y Ahumada nacque ad Ávila, in Castiglia, il 28 marzo 1515. Dopo la formazione e periodi di grave malattia, negli anni Trenta del Cinquecento entrò nel monastero carmelitano dell’Incarnazione ad Ávila. Il suo sviluppo spirituale fu graduale e accompagnato da un’intensa vita di preghiera, discernimento e scrittura.',
      'Dagli anni Sessanta del Cinquecento Teresa iniziò a fondare comunità orientate a una forma più semplice ed esigente di vita carmelitana. La riforma si sviluppò insieme all’opera di Giovanni della Croce e di altri collaboratori e divenne legata ai Carmelitani Scalzi. Teresa unì una notevole capacità organizzativa a una profonda riflessione sulla preghiera e sulla vita interiore in opere come Vita, Cammino di perfezione e Castello interiore.',
      'Teresa morì ad Alba de Tormes nell’ottobre 1582, durante il passaggio al calendario gregoriano. Fu canonizzata nel 1622. Nel 1970 Paolo VI la proclamò Dottore della Chiesa, prima donna a ricevere questo titolo. La sua memoria liturgica si celebra il 15 ottobre.'
    ]
  },
  facts: [
    { label: { en: 'Born', pt: 'Nascimento', es: 'Nacimiento', it: 'Nascita' }, value: { en: '28 March 1515 · Ávila, Spain', pt: '28 de março de 1515 · Ávila, Espanha', es: '28 de marzo de 1515 · Ávila, España', it: '28 marzo 1515 · Ávila, Spagna' } },
    { label: { en: 'Died', pt: 'Morte', es: 'Fallecimiento', it: 'Morte' }, value: { en: 'October 1582 · Alba de Tormes, Spain', pt: 'outubro de 1582 · Alba de Tormes, Espanha', es: 'octubre de 1582 · Alba de Tormes, España', it: 'ottobre 1582 · Alba de Tormes, Spagna' } },
    { label: { en: 'Canonised', pt: 'Canonização', es: 'Canonización', it: 'Canonizzazione' }, value: { en: '1622 · Pope Gregory XV', pt: '1622 · Papa Gregório XV', es: '1622 · Papa Gregorio XV', it: '1622 · papa Gregorio XV' } },
    { label: { en: 'Doctor of the Church', pt: 'Doutora da Igreja', es: 'Doctora de la Iglesia', it: 'Dottore della Chiesa' }, value: { en: 'Proclaimed in 1970 by Pope Paul VI', pt: 'Proclamada em 1970 pelo Papa Paulo VI', es: 'Proclamada en 1970 por el papa Pablo VI', it: 'Proclamata nel 1970 da papa Paolo VI' } }
  ],
  sources: [
    { name: 'St. Theresa of Jesus — Saint of the Day', url: 'https://www.vaticannews.va/en/saints/10/15/st--theresa-of-jesus--virgin--doctor-of-the-church--discalced-ca.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Who is Teresa of Avila?', url: 'https://carmelites.net/carmelite-review/who-is-teresa-of-avila/', language: 'en', publisher: 'Order of Carmelites' }
  ],
  verifiedAt: '2026-08-15'
};

const nicholas: SaintBiography = {
  id: 'nicholas',
  title: { en: 'Saint Nicholas of Myra', pt: 'São Nicolau de Mira', es: 'San Nicolás de Mira', it: 'San Nicola di Mira' },
  summary: {
    en: 'Nicholas of Myra was a fourth-century bishop of Lycia remembered across Eastern and Western Christianity for pastoral leadership, generosity to people in need and traditions of protecting children, travellers and seafarers.',
    pt: 'Nicolau de Mira foi um bispo da Lícia do século IV, venerado no cristianismo oriental e ocidental pela liderança pastoral, generosidade para com os necessitados e tradições de proteção das crianças, viajantes e marinheiros.',
    es: 'Nicolás de Mira fue un obispo de Licia del siglo IV, venerado en el cristianismo oriental y occidental por su liderazgo pastoral, generosidad con los necesitados y tradiciones de protección de niños, viajeros y marineros.',
    it: 'Nicola di Mira fu un vescovo della Licia del IV secolo, venerato nel cristianesimo orientale e occidentale per la guida pastorale, la generosità verso i bisognosi e le tradizioni di protezione di bambini, viaggiatori e marinai.'
  },
  paragraphs: {
    en: [
      'Nicholas is traditionally associated with Patara and Myra in Lycia, on the southern coast of Asia Minor. Christian traditions describe him as coming from a devout family and using his resources to assist people in poverty. He became bishop of Myra and was remembered for defending vulnerable people and for discreet acts of charity.',
      'Accounts of Nicholas developed over many centuries, so historians distinguish between the fourth-century bishop and later hagiographic traditions. Among the most enduring stories is his secret provision of money for a poor father’s daughters. Eastern and Western Churches alike maintained a strong cult of Nicholas, especially in connection with children, travellers and people at sea.',
      'Nicholas died at Myra, traditionally on 6 December in the fourth century. His relics were transferred to Bari in southern Italy in 1087, helping make the city one of the principal centres of his veneration in the West. The feast of Saint Nicholas is kept on 6 December in both Roman Catholic and many Orthodox calendars, although civil-date display can differ where older calendar systems are used.'
    ],
    pt: [
      'Nicolau está tradicionalmente associado a Patara e Mira, na Lícia, na costa sul da Ásia Menor. As tradições cristãs descrevem-no como oriundo de uma família piedosa e como alguém que usou os seus bens para ajudar pessoas em situação de pobreza. Tornou-se bispo de Mira e ficou recordado pela defesa dos mais vulneráveis e por atos discretos de caridade.',
      'Os relatos sobre Nicolau desenvolveram-se ao longo de muitos séculos, pelo que a investigação histórica distingue o bispo do século IV das tradições hagiográficas posteriores. Entre as narrativas mais duradouras está a entrega secreta de dinheiro para ajudar as filhas de um homem pobre. Igrejas orientais e ocidentais mantiveram uma veneração muito forte de Nicolau, sobretudo em associação às crianças, aos viajantes e às pessoas do mar.',
      'Nicolau morreu em Mira, tradicionalmente num dia 6 de dezembro do século IV. As suas relíquias foram transferidas para Bari, no sul de Itália, em 1087, tornando a cidade um dos principais centros da sua veneração no Ocidente. A festa de São Nicolau celebra-se a 6 de dezembro no calendário católico romano e em muitos calendários ortodoxos, embora a apresentação em data civil possa variar quando são usados sistemas de calendário antigos.'
    ],
    es: [
      'Nicolás está tradicionalmente asociado con Patara y Mira, en Licia, en la costa meridional de Asia Menor. Las tradiciones cristianas lo describen como miembro de una familia piadosa y como alguien que empleó sus bienes para ayudar a personas pobres. Llegó a ser obispo de Mira y fue recordado por defender a los más vulnerables y por realizar actos discretos de caridad.',
      'Los relatos sobre Nicolás se desarrollaron a lo largo de muchos siglos, por lo que la investigación histórica distingue al obispo del siglo IV de las tradiciones hagiográficas posteriores. Entre las historias más duraderas está la entrega secreta de dinero para ayudar a las hijas de un hombre pobre. Las Iglesias orientales y occidentales mantuvieron una fuerte veneración de Nicolás, especialmente en relación con niños, viajeros y gente del mar.',
      'Nicolás murió en Mira, tradicionalmente un 6 de diciembre del siglo IV. Sus reliquias fueron trasladadas a Bari, en el sur de Italia, en 1087, convirtiendo la ciudad en uno de los principales centros de su veneración occidental. La fiesta de San Nicolás se celebra el 6 de diciembre en el calendario católico romano y en muchos calendarios ortodoxos, aunque la fecha civil puede variar cuando se utilizan sistemas calendáricos antiguos.'
    ],
    it: [
      'Nicola è tradizionalmente associato a Patara e Mira, in Licia, sulla costa meridionale dell’Asia Minore. Le tradizioni cristiane lo descrivono come proveniente da una famiglia devota e come uomo che usò i propri beni per aiutare i poveri. Divenne vescovo di Mira e fu ricordato per la difesa delle persone vulnerabili e per atti discreti di carità.',
      'I racconti su Nicola si sono sviluppati lungo molti secoli, perciò la ricerca storica distingue il vescovo del IV secolo dalle successive tradizioni agiografiche. Tra le narrazioni più persistenti vi è la consegna segreta di denaro per aiutare le figlie di un uomo povero. Le Chiese orientali e occidentali hanno mantenuto una forte venerazione di Nicola, soprattutto in relazione a bambini, viaggiatori e gente di mare.',
      'Nicola morì a Mira, tradizionalmente il 6 dicembre nel IV secolo. Le sue reliquie furono trasferite a Bari, nell’Italia meridionale, nel 1087, facendo della città uno dei principali centri della sua venerazione in Occidente. La festa di San Nicola ricorre il 6 dicembre nel calendario cattolico romano e in molti calendari ortodossi, anche se la data civile può variare quando vengono utilizzati calendari di tipo antico.'
    ]
  },
  facts: [
    { label: { en: 'Era', pt: 'Época', es: 'Época', it: 'Epoca' }, value: { en: '4th century · Lycia, Asia Minor', pt: 'século IV · Lícia, Ásia Menor', es: 'siglo IV · Licia, Asia Menor', it: 'IV secolo · Licia, Asia Minore' } },
    { label: { en: 'Office', pt: 'Ministério', es: 'Ministerio', it: 'Ministero' }, value: { en: 'Bishop of Myra', pt: 'Bispo de Mira', es: 'Obispo de Mira', it: 'Vescovo di Mira' } },
    { label: { en: 'Relics', pt: 'Relíquias', es: 'Reliquias', it: 'Reliquie' }, value: { en: 'Transferred to Bari in 1087', pt: 'Transferidas para Bari em 1087', es: 'Trasladadas a Bari en 1087', it: 'Trasferite a Bari nel 1087' } },
    { label: { en: 'Feast', pt: 'Festa', es: 'Fiesta', it: 'Festa' }, value: { en: '6 December', pt: '6 de dezembro', es: '6 de diciembre', it: '6 dicembre' } }
  ],
  sources: [
    { name: 'St. Nicholas of Bari, Bishop of Myra — Saint of the Day', url: 'https://www.vaticannews.va/en/saints/12/06/saint-nicholas-of-bari--bishop-of-myra.html', language: 'en', publisher: 'Vatican News' },
    { name: 'Saint Nicholas the Wonderworker, Archbishop of Myra in Lycia', url: 'https://www.oca.org/saints/lives/2026/12/06/103484-saint-nicholas-the-wonderworker-archbishop-of-myra-in-lycia', language: 'en', publisher: 'Orthodox Church in America' }
  ],
  verifiedAt: '2026-08-15'
};

export const EDITORIAL_SCALE_BATCH_1: SaintBiography[] = [francisAssisi, clareAssisi, teresaAvila, nicholas];

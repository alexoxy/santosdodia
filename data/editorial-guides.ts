import type { Locale } from '../lib/i18n';

export type EditorialGuideCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  paragraphs: string[];
  profilesTitle: string;
  datesTitle: string;
  sourcesTitle: string;
};

export type EditorialGuide = {
  slug: string;
  profileIds: string[];
  monthDays: string[];
  observanceIds: string[];
  relatedSlugs: string[];
  copy: Partial<Record<Locale, EditorialGuideCopy>> & { en: EditorialGuideCopy };
};

export const EDITORIAL_GUIDES: EditorialGuide[] = [
  {
    slug: 'apostles-and-evangelists',
    profileIds: ['peter-apostle','paul-apostle','andrew-apostle','james-greater','mark-evangelist','luke-evangelist','john-baptist'],
    monthDays: ['01-25','04-25','06-24','06-29','07-25','10-18','11-30'],
    observanceIds: ['conversion-paul','mark-evangelist','nativity-john-baptist','peter-paul','james-greater','luke-evangelist','andrew-apostle'],
    relatedSlugs: ['martyrs-and-witnesses','christian-pilgrimage'],
    copy: {
      en: {
        eyebrow: 'New Testament · apostolic memory · calendar',
        title: 'Apostles, evangelists and the first Christian witnesses',
        lead: 'Explore the people and feast days that connect the New Testament, the first Christian communities and later Church calendars — without treating “apostle”, “evangelist” and “saint” as interchangeable labels.',
        paragraphs: [
          'The earliest Christian calendar memory is closely tied to people named in the New Testament, but the categories used for them are not identical. Peter, Andrew and James belong to the Twelve; Paul is called an apostle through a different vocation narrative; Mark and Luke are traditionally associated with two canonical Gospels; John the Baptist is a prophetic forerunner rather than one of the Twelve. A useful discovery page must preserve those distinctions instead of flattening every early Christian figure into the generic category “saint”.',
          'Calendar history adds a second layer. Peter and Paul share a major feast on 29 June while remaining two independent people; the Conversion of Paul on 25 January is an event in Paul’s life rather than a second Paul; the Nativity of John the Baptist is a feast about John’s birth, not the identity of John himself. Santos do Dia therefore links person profiles and liturgical events in both directions, so a user can move from biography to date while the underlying historical and ecclesial claims remain separately sourced.'
        ],
        profilesTitle: 'People in this guide', datesTitle: 'Key dates in the calendar', sourcesTitle: 'Sources behind this guide'
      },
      pt: {
        eyebrow: 'Novo Testamento · memória apostólica · calendário',
        title: 'Apóstolos, evangelistas e as primeiras testemunhas cristãs',
        lead: 'Explore as pessoas e festas que ligam o Novo Testamento, as primeiras comunidades cristãs e os calendários posteriores — sem tratar “apóstolo”, “evangelista” e “santo” como categorias equivalentes.',
        paragraphs: [
          'A memória cristã mais antiga está fortemente ligada a pessoas nomeadas no Novo Testamento, mas as categorias aplicadas a essas figuras não são idênticas. Pedro, André e Tiago pertencem aos Doze; Paulo é chamado apóstolo a partir de uma narrativa vocacional diferente; Marcos e Lucas são tradicionalmente associados a dois Evangelhos canónicos; João Batista é precursor profético e não membro dos Doze. Uma página de descoberta rigorosa deve preservar estas diferenças, em vez de reduzir todas as figuras cristãs antigas à categoria genérica de “santo”.',
          'O calendário acrescenta uma segunda camada. Pedro e Paulo partilham uma grande festa a 29 de junho, mas continuam a ser duas pessoas independentes; a Conversão de Paulo, a 25 de janeiro, é um acontecimento da vida de Paulo e não um segundo Paulo; a Natividade de João Batista é uma festa sobre o seu nascimento e não a identidade da pessoa. O Santos do Dia liga, por isso, perfis e acontecimentos litúrgicos nos dois sentidos, permitindo passar da biografia à data sem confundir afirmações históricas e eclesiais.'
        ],
        profilesTitle: 'Pessoas neste guia', datesTitle: 'Datas principais no calendário', sourcesTitle: 'Fontes deste guia'
      },
      es: {
        eyebrow: 'Nuevo Testamento · memoria apostólica · calendario',
        title: 'Apóstoles, evangelistas y los primeros testigos cristianos',
        lead: 'Explora las personas y fiestas que conectan el Nuevo Testamento, las primeras comunidades cristianas y los calendarios posteriores, sin tratar “apóstol”, “evangelista” y “santo” como etiquetas equivalentes.',
        paragraphs: [
          'La memoria cristiana más antigua está estrechamente vinculada con personas nombradas en el Nuevo Testamento, pero las categorías aplicadas a ellas no son idénticas. Pedro, Andrés y Santiago pertenecen a los Doce; Pablo es llamado apóstol a través de una vocación diferente; Marcos y Lucas están tradicionalmente asociados con dos Evangelios canónicos; Juan Bautista es precursor profético y no miembro de los Doce. Una página de descubrimiento rigurosa debe conservar estas diferencias en lugar de reducir todas las figuras cristianas antiguas a la categoría genérica de “santo”.',
          'El calendario añade una segunda capa. Pedro y Pablo comparten una gran fiesta el 29 de junio, aunque siguen siendo dos personas independientes; la Conversión de Pablo del 25 de enero es un acontecimiento de su vida y no otro Pablo; la Natividad de Juan Bautista es una fiesta sobre su nacimiento y no la identidad de la persona. Santos do Dia conecta por ello perfiles y acontecimientos litúrgicos en ambas direcciones, permitiendo pasar de la biografía a la fecha sin confundir afirmaciones históricas y eclesiales.'
        ],
        profilesTitle: 'Personas de esta guía', datesTitle: 'Fechas principales del calendario', sourcesTitle: 'Fuentes de esta guía'
      },
      it: {
        eyebrow: 'Nuovo Testamento · memoria apostolica · calendario',
        title: 'Apostoli, evangelisti e i primi testimoni cristiani',
        lead: 'Esplora le persone e le feste che collegano il Nuovo Testamento, le prime comunità cristiane e i calendari successivi, senza trattare “apostolo”, “evangelista” e “santo” come categorie equivalenti.',
        paragraphs: [
          'La memoria cristiana più antica è strettamente legata a persone nominate nel Nuovo Testamento, ma le categorie applicate a queste figure non sono identiche. Pietro, Andrea e Giacomo appartengono ai Dodici; Paolo è chiamato apostolo attraverso una diversa vocazione; Marco e Luca sono tradizionalmente associati a due Vangeli canonici; Giovanni Battista è un precursore profetico e non uno dei Dodici. Una pagina di scoperta rigorosa deve conservare queste differenze invece di ridurre tutte le figure cristiane antiche alla categoria generica di “santo”.',
          'Il calendario aggiunge un secondo livello. Pietro e Paolo condividono una grande festa il 29 giugno pur restando due persone indipendenti; la Conversione di Paolo del 25 gennaio è un evento della sua vita e non un secondo Paolo; la Natività di Giovanni Battista è una festa sulla sua nascita e non l’identità della persona. Santos do Dia collega quindi profili ed eventi liturgici in entrambe le direzioni, permettendo di passare dalla biografia alla data senza confondere affermazioni storiche ed ecclesiali.'
        ],
        profilesTitle: 'Persone in questa guida', datesTitle: 'Date principali nel calendario', sourcesTitle: 'Fonti di questa guida'
      }
    }
  },
  {
    slug: 'franciscan-saints',
    profileIds: ['francis-assisi','clare-assisi','anthony-lisbon'],
    monthDays: ['06-13','08-11','10-04'],
    observanceIds: ['anthony-lisbon','clare-assisi','francis-assisi'],
    relatedSlugs: ['christian-monasticism-and-reform','christian-pilgrimage'],
    copy: {
      en: {
        eyebrow: 'Franciscan history · Assisi · Lisbon and Padua',
        title: 'Francis, Clare and Anthony: three routes into Franciscan history',
        lead: 'Three of the strongest biographies on Santos do Dia open different windows onto the early Franciscan movement: Francis of Assisi, Clare of Assisi and Anthony of Lisbon and Padua.',
        paragraphs: [
          'Francis, Clare and Anthony belong to the same broad thirteenth-century religious world, but their stories should not be collapsed into one generic “Franciscan saint” narrative. Francis is central to the emergence of the Friars Minor; Clare developed a women’s form of Franciscan life and fought for a distinctive rule of poverty; Anthony entered the movement after an earlier Augustinian formation and became renowned for preaching and biblical teaching. Reading the three together shows how a religious movement can generate different forms of vocation, community and public ministry.',
          'The calendar creates further connections across place and memory. Francis is commemorated on 4 October, Anthony on 13 June and Clare on 11 August in the published corpus. Their profiles connect Assisi, Lisbon, Coimbra and Padua, while the date pages keep feast claims separate from broader biography. This guide is therefore not a patronage list or devotional ranking: it is an evidence-backed path through three historically related people whose sources can be inspected individually.'
        ],
        profilesTitle: 'Franciscan people', datesTitle: 'Their principal feast dates', sourcesTitle: 'Biography and calendar sources'
      },
      pt: {
        eyebrow: 'História franciscana · Assis · Lisboa e Pádua',
        title: 'Francisco, Clara e António: três caminhos para a história franciscana',
        lead: 'Três das biografias mais fortes do Santos do Dia abrem perspetivas diferentes sobre o primeiro movimento franciscano: Francisco de Assis, Clara de Assis e António de Lisboa e de Pádua.',
        paragraphs: [
          'Francisco, Clara e António pertencem ao mesmo grande universo religioso do século XIII, mas as suas histórias não devem ser reduzidas a uma narrativa genérica de “santos franciscanos”. Francisco está no centro da formação dos Frades Menores; Clara desenvolveu uma forma feminina de vida franciscana e defendeu uma regra própria de pobreza; António entrou no movimento depois de uma formação agostiniana e tornou-se conhecido pela pregação e pelo ensino bíblico. Ler os três em conjunto permite perceber como um mesmo movimento religioso produziu formas diferentes de vocação, comunidade e intervenção pública.',
          'O calendário cria outras ligações de lugar e memória. Francisco é comemorado a 4 de outubro, António a 13 de junho e Clara a 11 de agosto no corpus publicado. Os perfis ligam Assis, Lisboa, Coimbra e Pádua, enquanto as páginas de data mantêm as afirmações litúrgicas separadas da biografia mais ampla. Este guia não é, portanto, uma lista de patronatos nem uma hierarquia devocional: é um percurso sustentado por fontes através de três pessoas historicamente relacionadas.'
        ],
        profilesTitle: 'Figuras franciscanas', datesTitle: 'Principais datas litúrgicas', sourcesTitle: 'Fontes biográficas e de calendário'
      },
      es: {
        eyebrow: 'Historia franciscana · Asís · Lisboa y Padua',
        title: 'Francisco, Clara y Antonio: tres caminos hacia la historia franciscana',
        lead: 'Tres de las biografías más sólidas de Santos do Dia abren perspectivas distintas sobre el primer movimiento franciscano: Francisco de Asís, Clara de Asís y Antonio de Lisboa y Padua.',
        paragraphs: [
          'Francisco, Clara y Antonio pertenecen al mismo gran mundo religioso del siglo XIII, pero sus historias no deben reducirse a una narración genérica de “santos franciscanos”. Francisco está en el centro de la formación de los Frailes Menores; Clara desarrolló una forma femenina de vida franciscana y defendió una regla propia de pobreza; Antonio entró en el movimiento después de una formación agustiniana y se hizo conocido por la predicación y la enseñanza bíblica. Leerlos juntos permite comprender cómo un mismo movimiento religioso produjo formas distintas de vocación, comunidad y ministerio público.',
          'El calendario crea otras conexiones de lugar y memoria. Francisco se conmemora el 4 de octubre, Antonio el 13 de junio y Clara el 11 de agosto en el corpus publicado. Los perfiles conectan Asís, Lisboa, Coimbra y Padua, mientras las páginas de fecha mantienen las afirmaciones litúrgicas separadas de la biografía más amplia. Esta guía no es una lista de patronazgos ni una jerarquía devocional, sino un recorrido documentado por tres personas históricamente relacionadas.'
        ],
        profilesTitle: 'Figuras franciscanas', datesTitle: 'Principales fechas litúrgicas', sourcesTitle: 'Fuentes biográficas y de calendario'
      },
      it: {
        eyebrow: 'Storia francescana · Assisi · Lisbona e Padova',
        title: 'Francesco, Chiara e Antonio: tre vie nella storia francescana',
        lead: 'Tre delle biografie più solide di Santos do Dia aprono prospettive diverse sul primo movimento francescano: Francesco d’Assisi, Chiara d’Assisi e Antonio di Lisbona e Padova.',
        paragraphs: [
          'Francesco, Chiara e Antonio appartengono allo stesso grande mondo religioso del XIII secolo, ma le loro storie non devono essere ridotte a una narrazione generica di “santi francescani”. Francesco è al centro della nascita dei Frati Minori; Chiara sviluppò una forma femminile di vita francescana e difese una propria regola di povertà; Antonio entrò nel movimento dopo una formazione agostiniana e divenne noto per la predicazione e l’insegnamento biblico. Leggerli insieme mostra come lo stesso movimento religioso abbia prodotto forme diverse di vocazione, comunità e ministero pubblico.',
          'Il calendario crea ulteriori legami di luogo e memoria. Francesco è commemorato il 4 ottobre, Antonio il 13 giugno e Chiara l’11 agosto nel corpus pubblicato. I profili collegano Assisi, Lisbona, Coimbra e Padova, mentre le pagine delle date mantengono le affermazioni liturgiche separate dalla biografia più ampia. Questa guida non è un elenco di patronati né una classifica devozionale, ma un percorso documentato attraverso tre persone storicamente collegate.'
        ],
        profilesTitle: 'Figure francescane', datesTitle: 'Principali date liturgiche', sourcesTitle: 'Fonti biografiche e di calendario'
      }
    }
  },
  {
    slug: 'marian-calendar',
    profileIds: ['mary-of-nazareth'],
    monthDays: ['01-01','02-11','03-25','05-13','07-16','08-15','09-08','12-08'],
    observanceIds: ['mary-mother-of-god','our-lady-lourdes','annunciation','fatima','our-lady-carmel','assumption-dormition','nativity-mary','immaculate-conception'],
    relatedSlugs: ['christian-pilgrimage','apostles-and-evangelists'],
    copy: {
      en: {
        eyebrow: 'Mary · feasts · titles · doctrines',
        title: 'How to read a Marian calendar without merging different traditions',
        lead: 'Mary of Nazareth is one person; “Our Lady of Fátima”, “Our Lady of Lourdes”, the Annunciation, the Assumption or Dormition and the Immaculate Conception are not interchangeable labels for the same type of thing.',
        paragraphs: [
          'Marian content is one of the clearest tests of whether a global Christian calendar has a rigorous data model. Some entries are events in the Gospel narrative, such as the Annunciation. Some are feasts about Mary herself, such as her Nativity. Some are doctrinal or liturgical formulations used by particular Churches. Others are devotional titles tied to places and histories, such as Fátima and Lourdes. All can be connected to Mary, but none should simply overwrite her canonical identity or be silently treated as a universal feast.',
          'The calendar also exposes real differences between Churches. On 15 August the Roman Catholic tradition celebrates the Assumption while Byzantine traditions celebrate the Dormition; the names point to related Marian memory but are not editorially interchangeable. The Immaculate Conception is specifically Roman Catholic. Fátima and Lourdes belong to Catholic devotional and pilgrimage history. Santos do Dia therefore uses a Mary person profile as the stable identity and keeps every feast, title and tradition as a separately sourced relationship around that person.'
        ],
        profilesTitle: 'The canonical person', datesTitle: 'Major Marian dates already enriched', sourcesTitle: 'Calendar and biography sources'
      },
      pt: {
        eyebrow: 'Maria · festas · títulos · doutrinas',
        title: 'Como ler um calendário mariano sem fundir tradições diferentes',
        lead: 'Maria de Nazaré é uma pessoa; “Nossa Senhora de Fátima”, “Nossa Senhora de Lourdes”, a Anunciação, a Assunção ou Dormição e a Imaculada Conceição não são designações intercambiáveis do mesmo tipo de realidade.',
        paragraphs: [
          'O conteúdo mariano é um dos melhores testes à qualidade de um calendário cristão global. Algumas entradas são acontecimentos da narrativa evangélica, como a Anunciação. Outras são festas sobre a própria Maria, como a sua Natividade. Algumas correspondem a formulações doutrinais ou litúrgicas próprias de determinadas Igrejas. Outras ainda são títulos devocionais ligados a lugares e histórias concretas, como Fátima e Lourdes. Todas podem ser relacionadas com Maria, mas nenhuma deve substituir silenciosamente a identidade canónica da pessoa nem ser apresentada como festa universal.',
          'O calendário mostra também diferenças reais entre Igrejas. A 15 de agosto, a tradição católica romana celebra a Assunção e as tradições bizantinas celebram a Dormição; as designações apontam para uma memória mariana relacionada, mas não são editorialmente intercambiáveis. A Imaculada Conceição é especificamente católica romana. Fátima e Lourdes pertencem à história devocional e de peregrinação católica. O Santos do Dia usa, por isso, o perfil de Maria como identidade estável e mantém cada festa, título e tradição como relação própria e sustentada por fontes.'
        ],
        profilesTitle: 'A pessoa canónica', datesTitle: 'Grandes datas marianas já enriquecidas', sourcesTitle: 'Fontes de calendário e biografia'
      },
      es: {
        eyebrow: 'María · fiestas · títulos · doctrinas',
        title: 'Cómo leer un calendario mariano sin fusionar tradiciones distintas',
        lead: 'María de Nazaret es una persona; “Nuestra Señora de Fátima”, “Nuestra Señora de Lourdes”, la Anunciación, la Asunción o Dormición y la Inmaculada Concepción no son etiquetas intercambiables del mismo tipo de realidad.',
        paragraphs: [
          'El contenido mariano es una de las mejores pruebas de la calidad de un calendario cristiano global. Algunas entradas son acontecimientos de la narración evangélica, como la Anunciación. Otras son fiestas sobre la propia María, como su Natividad. Algunas corresponden a formulaciones doctrinales o litúrgicas propias de determinadas Iglesias. Otras son títulos devocionales vinculados a lugares e historias concretas, como Fátima y Lourdes. Todas pueden relacionarse con María, pero ninguna debe sustituir silenciosamente la identidad canónica de la persona ni presentarse como fiesta universal.',
          'El calendario muestra también diferencias reales entre Iglesias. El 15 de agosto la tradición católica romana celebra la Asunción y las tradiciones bizantinas la Dormición; los nombres remiten a una memoria mariana relacionada, pero no son editorialmente intercambiables. La Inmaculada Concepción es específicamente católica romana. Fátima y Lourdes pertenecen a la historia devocional y de peregrinación católica. Santos do Dia utiliza por ello el perfil de María como identidad estable y mantiene cada fiesta, título y tradición como relación propia y documentada.'
        ],
        profilesTitle: 'La persona canónica', datesTitle: 'Grandes fechas marianas ya enriquecidas', sourcesTitle: 'Fuentes de calendario y biografía'
      },
      it: {
        eyebrow: 'Maria · feste · titoli · dottrine',
        title: 'Come leggere un calendario mariano senza fondere tradizioni diverse',
        lead: 'Maria di Nazaret è una persona; “Nostra Signora di Fátima”, “Nostra Signora di Lourdes”, l’Annunciazione, l’Assunzione o Dormizione e l’Immacolata Concezione non sono etichette intercambiabili dello stesso tipo di realtà.',
        paragraphs: [
          'Il contenuto mariano è una delle prove più chiare della qualità di un calendario cristiano globale. Alcune voci sono eventi della narrazione evangelica, come l’Annunciazione. Altre sono feste riferite a Maria stessa, come la sua Natività. Alcune corrispondono a formulazioni dottrinali o liturgiche proprie di determinate Chiese. Altre ancora sono titoli devozionali legati a luoghi e storie precise, come Fátima e Lourdes. Tutte possono essere collegate a Maria, ma nessuna deve sostituire silenziosamente l’identità canonica della persona o essere presentata come festa universale.',
          'Il calendario mostra inoltre differenze reali tra le Chiese. Il 15 agosto la tradizione cattolica romana celebra l’Assunzione e le tradizioni bizantine la Dormizione; i termini rimandano a una memoria mariana correlata, ma non sono editorialmente intercambiabili. L’Immacolata Concezione è specificamente cattolica romana. Fátima e Lourdes appartengono alla storia devozionale e del pellegrinaggio cattolico. Santos do Dia usa quindi il profilo di Maria come identità stabile e mantiene ogni festa, titolo e tradizione come relazione distinta e documentata.'
        ],
        profilesTitle: 'La persona canonica', datesTitle: 'Principali date mariane già approfondite', sourcesTitle: 'Fonti di calendario e biografia'
      }
    }
  },
  {
    slug: 'christian-monasticism-and-reform',
    profileIds: ['anthony-great','basil-the-great','francis-assisi','clare-assisi','anthony-lisbon','teresa-avila'],
    monthDays: ['01-17','06-13','10-04','10-15'],
    observanceIds: ['anthony-great','anthony-lisbon','francis-assisi','teresa-avila'],
    relatedSlugs: ['franciscan-saints','marian-calendar'],
    copy: {
      en: {
        eyebrow: 'Desert asceticism · communities · mendicants · reform',
        title: 'From Anthony the Great to Teresa of Ávila: different forms of Christian religious life',
        lead: 'Christian monastic and religious life did not develop as one fixed institution. The biographies already published on Santos do Dia allow a long view from Egyptian asceticism to Cappadocian community, medieval mendicant movements and Carmelite reform.',
        paragraphs: [
          'Anthony the Great became a foundational figure for the memory of desert asceticism, while Basil of Caesarea helped shape a more explicitly communal model of disciplined Christian life tied to prayer, Scripture, work and care for others. Centuries later Francis and Clare of Assisi belonged to a different social and ecclesial context: mendicant poverty, urban preaching and new forms of community in the medieval West. Anthony of Lisbon entered that Franciscan world from an earlier Augustinian background, showing that religious identity could itself develop through successive forms of life.',
          'Teresa of Ávila belongs to another moment again: sixteenth-century Carmelite reform, spiritual writing and the reorganisation of religious communities. Placing these people together does not imply that a desert hermit, a fourth-century bishop, a Franciscan friar and a Carmelite reformer followed the same rule or theology of religious life. The value of the hub is precisely comparison: it gives users a sourced route through continuity and change while every biography keeps its own historical context and Church tradition.'
        ],
        profilesTitle: 'People across the history of religious life', datesTitle: 'Calendar entry points', sourcesTitle: 'Sources for the people and dates'
      },
      pt: {
        eyebrow: 'Ascetismo do deserto · comunidades · mendicantes · reforma',
        title: 'De Santo Antão a Teresa de Ávila: diferentes formas de vida religiosa cristã',
        lead: 'A vida monástica e religiosa cristã não se desenvolveu como uma instituição única e imutável. As biografias já publicadas pelo Santos do Dia permitem seguir um percurso longo entre o ascetismo egípcio, a vida comunitária capadócia, os movimentos mendicantes medievais e a reforma carmelita.',
        paragraphs: [
          'Santo Antão tornou-se uma figura fundadora da memória do ascetismo do deserto, enquanto Basílio de Cesareia ajudou a estruturar um modelo mais explicitamente comunitário, ligado à oração, à Escritura, ao trabalho e ao cuidado dos outros. Séculos depois, Francisco e Clara de Assis pertencem a outro contexto social e eclesial: pobreza mendicante, pregação urbana e novas formas de comunidade no Ocidente medieval. António de Lisboa entrou nesse universo franciscano depois de uma formação agostiniana, mostrando que a própria identidade religiosa podia desenvolver-se através de formas sucessivas de vida.',
          'Teresa de Ávila pertence a outro momento: a reforma carmelita do século XVI, a escrita espiritual e a reorganização de comunidades religiosas. Colocar estas pessoas numa mesma página não significa que um eremita do deserto, um bispo do século IV, um frade franciscano e uma reformadora carmelita tenham seguido a mesma regra ou visão da vida religiosa. O valor do guia está precisamente na comparação: oferece um percurso sustentado por fontes através de continuidades e mudanças, mantendo cada biografia no seu contexto histórico e eclesial.'
        ],
        profilesTitle: 'Pessoas na história da vida religiosa', datesTitle: 'Entradas no calendário', sourcesTitle: 'Fontes das pessoas e datas'
      },
      es: {
        eyebrow: 'Ascetismo del desierto · comunidades · mendicantes · reforma',
        title: 'De san Antonio Abad a Teresa de Ávila: distintas formas de vida religiosa cristiana',
        lead: 'La vida monástica y religiosa cristiana no se desarrolló como una institución única e inmutable. Las biografías ya publicadas por Santos do Dia permiten seguir un largo recorrido desde el ascetismo egipcio hasta la comunidad capadocia, los movimientos mendicantes medievales y la reforma carmelita.',
        paragraphs: [
          'San Antonio Abad se convirtió en una figura fundacional de la memoria del ascetismo del desierto, mientras Basilio de Cesarea ayudó a estructurar un modelo más explícitamente comunitario, vinculado con la oración, la Escritura, el trabajo y el cuidado de los demás. Siglos después Francisco y Clara de Asís pertenecen a otro contexto social y eclesial: pobreza mendicante, predicación urbana y nuevas formas de comunidad en el Occidente medieval. Antonio de Lisboa entró en ese mundo franciscano después de una formación agustiniana, mostrando que la propia identidad religiosa podía desarrollarse mediante formas sucesivas de vida.',
          'Teresa de Ávila pertenece a otro momento: la reforma carmelita del siglo XVI, la escritura espiritual y la reorganización de comunidades religiosas. Reunir estas personas no implica que un eremita del desierto, un obispo del siglo IV, un fraile franciscano y una reformadora carmelita siguieran la misma regla o visión de la vida religiosa. El valor de la guía está precisamente en la comparación: ofrece un recorrido documentado por continuidades y cambios, manteniendo cada biografía en su contexto histórico y eclesial.'
        ],
        profilesTitle: 'Personas en la historia de la vida religiosa', datesTitle: 'Entradas en el calendario', sourcesTitle: 'Fuentes de las personas y fechas'
      },
      it: {
        eyebrow: 'Ascetismo del deserto · comunità · mendicanti · riforma',
        title: 'Da sant’Antonio Abate a Teresa d’Avila: forme diverse di vita religiosa cristiana',
        lead: 'La vita monastica e religiosa cristiana non si è sviluppata come un’unica istituzione immutabile. Le biografie già pubblicate da Santos do Dia permettono un lungo percorso dall’ascetismo egiziano alla comunità cappadoce, ai movimenti mendicanti medievali e alla riforma carmelitana.',
        paragraphs: [
          'Sant’Antonio Abate divenne una figura fondativa della memoria dell’ascetismo del deserto, mentre Basilio di Cesarea contribuì a strutturare un modello più esplicitamente comunitario, legato a preghiera, Scrittura, lavoro e cura degli altri. Secoli dopo Francesco e Chiara d’Assisi appartengono a un diverso contesto sociale ed ecclesiale: povertà mendicante, predicazione urbana e nuove forme di comunità nell’Occidente medievale. Antonio di Lisbona entrò in quel mondo francescano dopo una formazione agostiniana, mostrando che la stessa identità religiosa poteva svilupparsi attraverso forme successive di vita.',
          'Teresa d’Avila appartiene a un altro momento ancora: la riforma carmelitana del XVI secolo, la scrittura spirituale e la riorganizzazione delle comunità religiose. Riunire queste persone non significa che un eremita del deserto, un vescovo del IV secolo, un frate francescano e una riformatrice carmelitana abbiano seguito la stessa regola o visione della vita religiosa. Il valore della guida sta proprio nel confronto: offre un percorso documentato tra continuità e cambiamenti, mantenendo ogni biografia nel proprio contesto storico ed ecclesiale.'
        ],
        profilesTitle: 'Persone nella storia della vita religiosa', datesTitle: 'Punti d’ingresso nel calendario', sourcesTitle: 'Fonti delle persone e delle date'
      }
    }
  },
  {
    slug: 'martyrs-and-witnesses',
    profileIds: ['stephen-first-martyr','george','mina'],
    monthDays: ['04-23','11-24','12-26'],
    observanceIds: ['george','mina-coptic','stephen-first-martyr'],
    relatedSlugs: ['apostles-and-evangelists','christian-monasticism-and-reform'],
    copy: {
      en: {
        eyebrow: 'Martyrdom · history · hagiography',
        title: 'Christian martyrs: what the sources can and cannot tell us',
        lead: 'Stephen, George and Mina show why martyr profiles need different levels of historical confidence. All are major figures of Christian memory, but the evidence preserved for each is not the same kind of evidence.',
        paragraphs: [
          'Stephen belongs directly to the New Testament narrative in Acts, which presents his speech, conflict and death and later Christian tradition calls him the first martyr. George has an exceptionally widespread cult across several Churches, countries and iconographic traditions, but much of the detailed story known from later hagiography cannot be treated with the same historical confidence as a New Testament text. Mina is deeply rooted in Coptic Christian memory and the Synaxarium, where a rich martyr narrative is preserved; here too, devotional tradition and independently verifiable chronology need to be labelled differently.',
          'This distinction does not diminish religious importance. It makes the editorial product more trustworthy. Santos do Dia can show that a person is securely embedded in a Church calendar, identify the source that transmits a martyr story and explain when a narrative belongs to hagiographic tradition rather than modern critical biography. A thematic hub makes those differences visible side by side and helps users understand why “verified feast date” does not automatically mean “every detail of the life story is historically verified”.'
        ],
        profilesTitle: 'Martyr profiles', datesTitle: 'Commemoration dates', sourcesTitle: 'Sources and levels of evidence'
      },
      pt: {
        eyebrow: 'Martírio · história · hagiografia',
        title: 'Mártires cristãos: o que as fontes permitem — e não permitem — afirmar',
        lead: 'Estêvão, Jorge e Mina mostram por que razão os perfis de mártires exigem diferentes níveis de confiança histórica. Todos são figuras maiores da memória cristã, mas a evidência preservada para cada um não é do mesmo tipo.',
        paragraphs: [
          'Estêvão pertence diretamente à narrativa do Novo Testamento nos Atos dos Apóstolos, que apresenta o seu discurso, conflito e morte; a tradição cristã posterior chama-lhe primeiro mártir. Jorge possui um culto de enorme difusão em várias Igrejas, países e tradições iconográficas, mas grande parte da narrativa detalhada transmitida pela hagiografia posterior não pode receber o mesmo grau de confiança histórica de um texto neotestamentário. Mina está profundamente enraizado na memória cristã copta e no Sinaxário, que conserva uma rica narrativa martirial; também aqui é necessário distinguir tradição devocional de cronologia historicamente independente.',
          'Esta distinção não diminui a importância religiosa. Torna o produto editorial mais credível. O Santos do Dia pode demonstrar que uma pessoa está solidamente integrada num calendário eclesial, identificar a fonte que transmite a narrativa martirial e dizer quando o relato pertence à tradição hagiográfica e não à biografia crítica moderna. Um hub temático permite ver estas diferenças lado a lado e perceber por que razão “data de festa verificada” não significa automaticamente “todos os pormenores da vida historicamente verificados”.'
        ],
        profilesTitle: 'Perfis de mártires', datesTitle: 'Datas de comemoração', sourcesTitle: 'Fontes e níveis de evidência'
      },
      es: {
        eyebrow: 'Martirio · historia · hagiografía',
        title: 'Mártires cristianos: lo que las fuentes permiten — y no permiten — afirmar',
        lead: 'Esteban, Jorge y Mina muestran por qué los perfiles de mártires exigen distintos niveles de confianza histórica. Todos son figuras importantes de la memoria cristiana, pero la evidencia conservada para cada uno no es del mismo tipo.',
        paragraphs: [
          'Esteban pertenece directamente a la narración del Nuevo Testamento en los Hechos de los Apóstoles, que presenta su discurso, conflicto y muerte; la tradición cristiana posterior lo llama primer mártir. Jorge posee un culto de enorme difusión en varias Iglesias, países y tradiciones iconográficas, pero gran parte del relato detallado transmitido por la hagiografía posterior no puede recibir el mismo grado de confianza histórica que un texto neotestamentario. Mina está profundamente arraigado en la memoria cristiana copta y en el Sinaxario, que conserva una rica narración martirial; también aquí debe distinguirse tradición devocional de cronología históricamente independiente.',
          'Esta distinción no disminuye la importancia religiosa. Hace que el producto editorial sea más fiable. Santos do Dia puede demostrar que una persona está sólidamente integrada en un calendario eclesial, identificar la fuente que transmite el relato martirial y explicar cuándo una narración pertenece a la tradición hagiográfica y no a la biografía crítica moderna. Un hub temático permite comparar estas diferencias y comprender por qué “fecha de fiesta verificada” no significa automáticamente “todos los detalles de la vida históricamente verificados”.'
        ],
        profilesTitle: 'Perfiles de mártires', datesTitle: 'Fechas de conmemoración', sourcesTitle: 'Fuentes y niveles de evidencia'
      },
      it: {
        eyebrow: 'Martirio · storia · agiografia',
        title: 'Martiri cristiani: ciò che le fonti permettono — e non permettono — di affermare',
        lead: 'Stefano, Giorgio e Mina mostrano perché i profili dei martiri richiedano diversi livelli di fiducia storica. Tutti sono figure importanti della memoria cristiana, ma le prove conservate per ciascuno non sono dello stesso tipo.',
        paragraphs: [
          'Stefano appartiene direttamente alla narrazione del Nuovo Testamento negli Atti degli Apostoli, che presenta il suo discorso, il conflitto e la morte; la tradizione cristiana successiva lo chiama primo martire. Giorgio possiede un culto di enorme diffusione in diverse Chiese, paesi e tradizioni iconografiche, ma gran parte del racconto dettagliato trasmesso dall’agiografia successiva non può ricevere lo stesso grado di fiducia storica di un testo neotestamentario. Mina è profondamente radicato nella memoria cristiana copta e nel Sinassario, che conserva una ricca narrazione martiriale; anche qui la tradizione devozionale deve essere distinta dalla cronologia storicamente indipendente.',
          'Questa distinzione non diminuisce l’importanza religiosa. Rende il prodotto editoriale più affidabile. Santos do Dia può mostrare che una persona è saldamente inserita in un calendario ecclesiale, identificare la fonte che trasmette il racconto del martirio e spiegare quando una narrazione appartiene alla tradizione agiografica e non alla moderna biografia critica. Un hub tematico rende visibili queste differenze e aiuta a capire perché “data della festa verificata” non significhi automaticamente “ogni dettaglio della vita storicamente verificato”.'
        ],
        profilesTitle: 'Profili dei martiri', datesTitle: 'Date di commemorazione', sourcesTitle: 'Fonti e livelli di evidenza'
      }
    }
  },
  {
    slug: 'christian-pilgrimage',
    profileIds: ['james-greater','anthony-lisbon','helena','mary-of-nazareth'],
    monthDays: ['02-11','05-13','06-13','07-25'],
    observanceIds: ['our-lady-lourdes','fatima','anthony-lisbon','james-greater'],
    relatedSlugs: ['marian-calendar','franciscan-saints'],
    copy: {
      en: {
        eyebrow: 'Place · saint · feast · journey',
        title: 'Christian pilgrimage: how people, places and feast days connect',
        lead: 'Pilgrimage is not one type of data. A destination may be linked to a saint, a Marian devotion, a historical memory or a recurring feast — and each relationship needs its own source.',
        paragraphs: [
          'The current Santos do Dia corpus already contains several strong pilgrimage pathways. Fátima and Lourdes connect Marian observances to official sanctuaries and annual calendar dates. Saint James the Greater links an apostolic profile and 25 July feast to the much later pilgrimage tradition of Santiago de Compostela. Saint Anthony connects Lisbon, Coimbra and Padua through biography and devotion. Helena connects fourth-century imperial Christian patronage with the growing importance of holy places in Palestine, while later tradition adds the True Cross narrative with a different level of historical confidence.',
          'A rigorous pilgrimage product therefore starts from relationships rather than marketing destinations as interchangeable “holy places”. The calendar can answer when a feast occurs; the profile can explain the person; the pilgrimage directory can identify a verified place and official source. Linking those layers produces a richer journey for the user and a stronger internal knowledge graph for search, while keeping place claims, feast claims and biography claims independently auditable.'
        ],
        profilesTitle: 'People connected to pilgrimage traditions', datesTitle: 'Calendar dates that lead into pilgrimage', sourcesTitle: 'Official and biographical sources'
      },
      pt: {
        eyebrow: 'Lugar · santo · festa · caminho',
        title: 'Peregrinação cristã: como pessoas, lugares e datas se relacionam',
        lead: 'Peregrinação não é um único tipo de informação. Um destino pode estar ligado a um santo, a uma devoção mariana, a uma memória histórica ou a uma festa recorrente — e cada relação precisa da sua própria fonte.',
        paragraphs: [
          'O corpus atual do Santos do Dia já contém vários percursos fortes de peregrinação. Fátima e Lourdes ligam celebrações marianas a santuários oficiais e datas anuais do calendário. São Tiago Maior liga um perfil apostólico e a festa de 25 de julho à tradição muito posterior de peregrinação a Santiago de Compostela. Santo António liga Lisboa, Coimbra e Pádua através da biografia e da devoção. Helena relaciona o patronato cristão imperial do século IV com a crescente importância dos lugares santos na Palestina, enquanto a tradição posterior acrescenta a narrativa da Vera Cruz com um nível diferente de confiança histórica.',
          'Um produto de peregrinação rigoroso começa, por isso, nas relações e não numa lista indiferenciada de “lugares sagrados”. O calendário responde quando ocorre uma festa; o perfil explica a pessoa; o diretório de peregrinação identifica um lugar verificado e a respetiva fonte oficial. Ligar estas camadas cria uma experiência mais rica para o utilizador e um grafo interno mais forte para pesquisa, mantendo afirmações de lugar, calendário e biografia auditáveis de forma independente.'
        ],
        profilesTitle: 'Pessoas ligadas a tradições de peregrinação', datesTitle: 'Datas do calendário ligadas a peregrinação', sourcesTitle: 'Fontes oficiais e biográficas'
      },
      es: {
        eyebrow: 'Lugar · santo · fiesta · camino',
        title: 'Peregrinación cristiana: cómo se conectan personas, lugares y fechas',
        lead: 'La peregrinación no es un único tipo de información. Un destino puede estar vinculado con un santo, una devoción mariana, una memoria histórica o una fiesta recurrente, y cada relación necesita su propia fuente.',
        paragraphs: [
          'El corpus actual de Santos do Dia ya contiene varios recorridos fuertes de peregrinación. Fátima y Lourdes conectan celebraciones marianas con santuarios oficiales y fechas anuales del calendario. Santiago el Mayor vincula un perfil apostólico y la fiesta del 25 de julio con la tradición mucho posterior de peregrinación a Santiago de Compostela. San Antonio conecta Lisboa, Coimbra y Padua mediante biografía y devoción. Elena relaciona el patronazgo cristiano imperial del siglo IV con la creciente importancia de los lugares santos en Palestina, mientras la tradición posterior añade el relato de la Vera Cruz con un nivel diferente de confianza histórica.',
          'Un producto de peregrinación riguroso comienza por tanto en las relaciones y no en una lista indiferenciada de “lugares sagrados”. El calendario responde cuándo se celebra una fiesta; el perfil explica a la persona; el directorio de peregrinación identifica un lugar verificado y su fuente oficial. Conectar estas capas crea una experiencia más rica y un grafo interno más fuerte para la búsqueda, manteniendo auditables por separado las afirmaciones de lugar, calendario y biografía.'
        ],
        profilesTitle: 'Personas vinculadas con tradiciones de peregrinación', datesTitle: 'Fechas del calendario vinculadas con peregrinación', sourcesTitle: 'Fuentes oficiales y biográficas'
      },
      it: {
        eyebrow: 'Luogo · santo · festa · cammino',
        title: 'Pellegrinaggio cristiano: come si collegano persone, luoghi e date',
        lead: 'Il pellegrinaggio non è un unico tipo di dato. Una destinazione può essere collegata a un santo, a una devozione mariana, a una memoria storica o a una festa ricorrente, e ogni relazione richiede una propria fonte.',
        paragraphs: [
          'Il corpus attuale di Santos do Dia contiene già diversi percorsi forti di pellegrinaggio. Fátima e Lourdes collegano celebrazioni mariane a santuari ufficiali e date annuali del calendario. San Giacomo Maggiore collega un profilo apostolico e la festa del 25 luglio alla tradizione molto successiva del pellegrinaggio a Santiago de Compostela. Sant’Antonio collega Lisbona, Coimbra e Padova attraverso biografia e devozione. Elena mette in relazione il patrocinio cristiano imperiale del IV secolo con la crescente importanza dei luoghi santi in Palestina, mentre la tradizione successiva aggiunge il racconto della Vera Croce con un diverso livello di fiducia storica.',
          'Un prodotto di pellegrinaggio rigoroso parte quindi dalle relazioni e non da un elenco indistinto di “luoghi sacri”. Il calendario risponde a quando cade una festa; il profilo spiega la persona; il repertorio dei pellegrinaggi identifica un luogo verificato e la sua fonte ufficiale. Collegare questi livelli crea un’esperienza più ricca e un grafo interno più forte per la ricerca, mantenendo verificabili separatamente le affermazioni di luogo, calendario e biografia.'
        ],
        profilesTitle: 'Persone legate a tradizioni di pellegrinaggio', datesTitle: 'Date del calendario legate al pellegrinaggio', sourcesTitle: 'Fonti ufficiali e biografiche'
      }
    }
  }
];

export function getEditorialGuide(slug: string) {
  return EDITORIAL_GUIDES.find(guide => guide.slug === slug);
}

export function getEditorialGuideCopy(guide: EditorialGuide, locale: Locale) {
  return guide.copy[locale] ?? guide.copy.en;
}

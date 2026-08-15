import type { Locale } from '../lib/i18n';

export type AnnualDateEditorialCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  context: string;
};

export type AnnualDateEditorial = {
  monthDay: string;
  observanceIds: string[];
  copy: Partial<Record<Locale, AnnualDateEditorialCopy>>;
};

export const annualDateEditorialUi: Record<Locale, { sources: string; sourceNote: string }> = {
  en: { sources: 'Calendar sources', sourceNote: 'Sources used to verify the observances and calendar placement shown on this date.' },
  es: { sources: 'Fuentes del calendario', sourceNote: 'Fuentes utilizadas para verificar las celebraciones y su ubicación en el calendario en esta fecha.' },
  pt: { sources: 'Fontes do calendário', sourceNote: 'Fontes usadas para verificar as celebrações e o respetivo enquadramento no calendário nesta data.' },
  fr: { sources: 'Sources du calendrier', sourceNote: 'Sources utilisées pour vérifier les célébrations et leur place dans le calendrier à cette date.' },
  fil: { sources: 'Mga sanggunian ng kalendaryo', sourceNote: 'Mga sangguniang ginamit upang beripikahin ang mga pagdiriwang at ang kanilang petsa sa kalendaryo.' },
  ru: { sources: 'Источники календаря', sourceNote: 'Источники, использованные для проверки празднований и их места в календаре на эту дату.' },
  sw: { sources: 'Vyanzo vya kalenda', sourceNote: 'Vyanzo vilivyotumika kuthibitisha maadhimisho na nafasi yake katika kalenda katika tarehe hii.' },
  de: { sources: 'Kalenderquellen', sourceNote: 'Quellen zur Prüfung der Feiern und ihrer Einordnung im Kalender an diesem Datum.' },
  it: { sources: 'Fonti del calendario', sourceNote: 'Fonti utilizzate per verificare le celebrazioni e la loro collocazione nel calendario in questa data.' },
  pl: { sources: 'Źródła kalendarza', sourceNote: 'Źródła użyte do weryfikacji obchodów i ich miejsca w kalendarzu w tym dniu.' },
};

const FLAGSHIP_ANNUAL_DATES: AnnualDateEditorial[] = [
  {
    monthDay: '01-06',
    observanceIds: ['epiphany', 'nativity-armenia'],
    copy: {
      en: {
        eyebrow: 'Why this date matters',
        title: 'Epiphany and the different ways Christians mark 6 January',
        lead: '6 January is one of the most important dates for comparing Christian calendars. Western churches celebrate the Epiphany of the Lord, while the Armenian Apostolic tradition keeps the Nativity and Theophany together on this date.',
        context: 'The same civil day therefore carries different liturgical meanings depending on the Church and calendar tradition. Santos do Dia keeps those observances separate rather than collapsing them into a single universal feast, so the date can be explored without erasing the differences between traditions.',
      },
      pt: {
        eyebrow: 'Porque esta data é importante',
        title: 'Epifania e as diferentes formas cristãs de celebrar 6 de janeiro',
        lead: '6 de janeiro é uma das datas mais interessantes para comparar calendários cristãos. As Igrejas ocidentais celebram a Epifania do Senhor, enquanto a tradição apostólica arménia reúne nesta data a Natividade e a Teofania.',
        context: 'O mesmo dia civil tem, por isso, significados litúrgicos diferentes consoante a Igreja e o calendário. O Santos do Dia mantém estas celebrações separadas, em vez de as fundir numa festa supostamente universal, permitindo comparar tradições sem apagar as suas diferenças.',
      },
      es: {
        eyebrow: 'Por qué importa esta fecha',
        title: 'Epifanía y las distintas formas cristianas de celebrar el 6 de enero',
        lead: 'El 6 de enero es una de las fechas más interesantes para comparar calendarios cristianos. Las Iglesias occidentales celebran la Epifanía del Señor, mientras que la tradición apostólica armenia reúne en esta fecha la Natividad y la Teofanía.',
        context: 'Un mismo día civil puede tener significados litúrgicos diferentes según la Iglesia y el calendario. Santos do Dia mantiene estas celebraciones separadas, en lugar de fusionarlas en una única fiesta supuestamente universal, para que puedan compararse sin borrar sus diferencias.',
      },
      it: {
        eyebrow: 'Perché questa data conta',
        title: 'Epifania e i diversi modi cristiani di celebrare il 6 gennaio',
        lead: 'Il 6 gennaio è una delle date più significative per confrontare i calendari cristiani. Le Chiese occidentali celebrano l’Epifania del Signore, mentre la tradizione apostolica armena riunisce in questa data Natività e Teofania.',
        context: 'Lo stesso giorno civile assume quindi significati liturgici diversi a seconda della Chiesa e del calendario. Santos do Dia mantiene distinte queste celebrazioni, invece di fonderle in un’unica festa apparentemente universale, così da permettere un confronto senza cancellare le differenze.',
      },
    },
  },
  {
    monthDay: '02-11',
    observanceIds: ['our-lady-lourdes'],
    copy: {
      en: {
        eyebrow: 'Marian devotion and pilgrimage',
        title: 'Our Lady of Lourdes on 11 February',
        lead: '11 February is the Roman Catholic observance of Our Lady of Lourdes and one of the dates most closely linked to modern Marian pilgrimage. The calendar entry connects the feast with the sanctuary at Lourdes rather than treating the devotion as an isolated name.',
        context: 'This date is especially useful for joining liturgical information with place, pilgrimage and devotional history. The observance is Catholic, and the site presents it in that ecclesial context instead of projecting it onto Christian traditions that do not share the same feast.',
      },
      pt: {
        eyebrow: 'Devoção mariana e peregrinação',
        title: 'Nossa Senhora de Lourdes a 11 de fevereiro',
        lead: '11 de fevereiro é a celebração católica romana de Nossa Senhora de Lourdes e uma das datas mais ligadas à peregrinação mariana contemporânea. A entrada do calendário relaciona a festa com o santuário de Lourdes, em vez de tratar a devoção apenas como um nome isolado.',
        context: 'É uma data particularmente rica para ligar informação litúrgica, lugar, peregrinação e história devocional. A celebração é católica e é apresentada nesse enquadramento eclesial, sem a projetar sobre tradições cristãs que não partilham a mesma festa.',
      },
      es: {
        eyebrow: 'Devoción mariana y peregrinación',
        title: 'Nuestra Señora de Lourdes el 11 de febrero',
        lead: 'El 11 de febrero es la celebración católica romana de Nuestra Señora de Lourdes y una de las fechas más vinculadas con la peregrinación mariana contemporánea. La entrada del calendario relaciona la fiesta con el santuario de Lourdes, en lugar de tratar la devoción como un nombre aislado.',
        context: 'Es una fecha especialmente rica para unir información litúrgica, lugar, peregrinación e historia devocional. La celebración es católica y se presenta en ese marco eclesial, sin proyectarla sobre tradiciones cristianas que no comparten la misma fiesta.',
      },
      it: {
        eyebrow: 'Devozione mariana e pellegrinaggio',
        title: 'Nostra Signora di Lourdes l’11 febbraio',
        lead: 'L’11 febbraio è la memoria cattolica romana di Nostra Signora di Lourdes ed è una delle date maggiormente legate al pellegrinaggio mariano contemporaneo. La voce di calendario collega la festa al santuario di Lourdes invece di trattare la devozione come un semplice nome isolato.',
        context: 'È una data particolarmente adatta a mettere in relazione informazione liturgica, luogo, pellegrinaggio e storia della devozione. La celebrazione è cattolica e viene presentata in questo contesto ecclesiale, senza estenderla a tradizioni cristiane che non condividono la stessa festa.',
      },
    },
  },
  {
    monthDay: '03-19',
    observanceIds: ['joseph'],
    copy: {
      en: {
        eyebrow: 'Saint and calendar',
        title: 'Saint Joseph on 19 March',
        lead: '19 March is the principal Catholic and Anglican commemoration of Saint Joseph, identified in the calendar as the spouse of the Blessed Virgin Mary. It is one of the strongest examples of a saint whose calendar date, family associations and wider devotional importance all converge on a single annual page.',
        context: 'The day page links the observance to Joseph’s substantive profile while preserving the calendar evidence for each tradition. That separation matters: biography, devotion and liturgical rank are related, but they are not the same type of claim and should not be presented as though they came from one source.',
      },
      pt: {
        eyebrow: 'Santo e calendário',
        title: 'São José a 19 de março',
        lead: '19 de março é a principal comemoração católica e anglicana de São José, identificado no calendário como esposo da Virgem Maria. É um dos melhores exemplos de um santo em que data litúrgica, relações familiares e importância devocional convergem numa página anual com grande potencial editorial.',
        context: 'A página do dia liga a celebração ao perfil substantivo de São José, preservando ao mesmo tempo a evidência de calendário de cada tradição. Esta separação é importante: biografia, devoção e categoria litúrgica estão relacionadas, mas são tipos de afirmação diferentes e não devem parecer provenientes de uma única fonte.',
      },
      es: {
        eyebrow: 'Santo y calendario',
        title: 'San José el 19 de marzo',
        lead: 'El 19 de marzo es la principal conmemoración católica y anglicana de San José, identificado en el calendario como esposo de la Virgen María. Es uno de los mejores ejemplos de un santo en el que la fecha litúrgica, las relaciones familiares y la importancia devocional convergen en una misma página anual.',
        context: 'La página del día enlaza la celebración con el perfil sustantivo de José y conserva a la vez la evidencia de calendario de cada tradición. Esta separación importa: biografía, devoción y categoría litúrgica están relacionadas, pero son afirmaciones de distinto tipo y no deben parecer procedentes de una sola fuente.',
      },
      it: {
        eyebrow: 'Santo e calendario',
        title: 'San Giuseppe il 19 marzo',
        lead: 'Il 19 marzo è la principale commemorazione cattolica e anglicana di san Giuseppe, identificato nel calendario come sposo della Vergine Maria. È uno degli esempi più forti di un santo per il quale data liturgica, relazioni familiari e importanza devozionale convergono in una stessa pagina annuale.',
        context: 'La pagina del giorno collega la celebrazione al profilo sostanziale di Giuseppe e conserva nello stesso tempo le prove di calendario proprie di ciascuna tradizione. La distinzione è importante: biografia, devozione e rango liturgico sono collegati, ma non sono lo stesso tipo di affermazione.',
      },
    },
  },
  {
    monthDay: '03-25',
    observanceIds: ['annunciation'],
    copy: {
      en: {
        eyebrow: 'A shared fixed feast',
        title: 'The Annunciation on 25 March',
        lead: '25 March is the fixed feast of the Annunciation of the Lord in Western and Byzantine calendars. It places the announcement to Mary and the beginning of the Incarnation exactly nine months before the 25 December celebration of the Nativity in the Western calendar.',
        context: 'The date is especially valuable for understanding how a single biblical event is received across several liturgical traditions. Santos do Dia records the common civil date while keeping the traditions and calendar systems explicit, so similarity does not become false uniformity.',
      },
      pt: {
        eyebrow: 'Uma festa fixa partilhada',
        title: 'A Anunciação a 25 de março',
        lead: '25 de março é a data fixa da festa da Anunciação do Senhor nos calendários ocidentais e bizantinos. A celebração coloca o anúncio a Maria e o início da Encarnação exatamente nove meses antes do Natal de 25 de dezembro no calendário ocidental.',
        context: 'A data é particularmente útil para perceber como um mesmo episódio bíblico é recebido por várias tradições litúrgicas. O Santos do Dia regista a coincidência da data civil, mas mantém explícitas as tradições e os sistemas de calendário, evitando transformar proximidade em uniformidade artificial.',
      },
      es: {
        eyebrow: 'Una fiesta fija compartida',
        title: 'La Anunciación el 25 de marzo',
        lead: 'El 25 de marzo es la fecha fija de la fiesta de la Anunciación del Señor en los calendarios occidentales y bizantinos. La celebración sitúa el anuncio a María y el comienzo de la Encarnación exactamente nueve meses antes de la Navidad del 25 de diciembre en el calendario occidental.',
        context: 'La fecha es especialmente útil para comprender cómo un mismo episodio bíblico es recibido por varias tradiciones litúrgicas. Santos do Dia registra la coincidencia de la fecha civil, pero mantiene explícitas las tradiciones y los sistemas de calendario para no convertir la semejanza en una falsa uniformidad.',
      },
      it: {
        eyebrow: 'Una festa fissa condivisa',
        title: 'L’Annunciazione il 25 marzo',
        lead: 'Il 25 marzo è la data fissa della festa dell’Annunciazione del Signore nei calendari occidentali e bizantini. La celebrazione colloca l’annuncio a Maria e l’inizio dell’Incarnazione esattamente nove mesi prima del Natale del 25 dicembre nel calendario occidentale.',
        context: 'La data è particolarmente utile per comprendere come lo stesso episodio biblico venga recepito da diverse tradizioni liturgiche. Santos do Dia registra la coincidenza della data civile mantenendo però espliciti tradizioni e sistemi di calendario, evitando una falsa uniformità.',
      },
    },
  },
  {
    monthDay: '05-13',
    observanceIds: ['fatima'],
    copy: {
      en: {
        eyebrow: 'Portugal and Marian pilgrimage',
        title: 'Our Lady of Fátima on 13 May',
        lead: '13 May is the Roman Catholic observance of Our Lady of Fátima and a central date in Portuguese Marian pilgrimage. The date is linked to the Sanctuary of Fátima and to the anniversary cycle that begins with the events remembered there in May 1917.',
        context: 'For Santos do Dia, Fátima is more than a calendar label: it connects a Marian observance with Portugal, a major pilgrimage destination and recurring religious events. Those layers can be explored together while the underlying calendar claim remains explicitly Catholic.',
      },
      pt: {
        eyebrow: 'Portugal e peregrinação mariana',
        title: 'Nossa Senhora de Fátima a 13 de maio',
        lead: '13 de maio é a celebração católica romana de Nossa Senhora de Fátima e uma data central da peregrinação mariana em Portugal. Está ligada ao Santuário de Fátima e ao ciclo de aniversários que começa com os acontecimentos recordados naquele local em maio de 1917.',
        context: 'No Santos do Dia, Fátima não é apenas um nome de calendário: liga uma celebração mariana a Portugal, a um grande destino de peregrinação e a eventos religiosos recorrentes. Estas camadas podem ser exploradas em conjunto, mantendo explícito que a afirmação de calendário é católica.',
      },
      es: {
        eyebrow: 'Portugal y peregrinación mariana',
        title: 'Nuestra Señora de Fátima el 13 de mayo',
        lead: 'El 13 de mayo es la celebración católica romana de Nuestra Señora de Fátima y una fecha central de la peregrinación mariana en Portugal. Está vinculada al Santuario de Fátima y al ciclo de aniversarios que comienza con los acontecimientos recordados allí en mayo de 1917.',
        context: 'En Santos do Dia, Fátima no es solo un nombre de calendario: conecta una celebración mariana con Portugal, un gran destino de peregrinación y acontecimientos religiosos recurrentes. Estas capas pueden explorarse juntas manteniendo explícito que la afirmación de calendario es católica.',
      },
      it: {
        eyebrow: 'Portogallo e pellegrinaggio mariano',
        title: 'Nostra Signora di Fátima il 13 maggio',
        lead: 'Il 13 maggio è la celebrazione cattolica romana di Nostra Signora di Fátima e una data centrale del pellegrinaggio mariano in Portogallo. È legata al Santuario di Fátima e al ciclo anniversario che prende avvio dagli eventi ricordati in quel luogo nel maggio 1917.',
        context: 'Su Santos do Dia Fátima non è soltanto un nome di calendario: collega una celebrazione mariana al Portogallo, a una grande meta di pellegrinaggio e a eventi religiosi ricorrenti. Questi livelli possono essere esplorati insieme mantenendo esplicita la natura cattolica dell’osservanza.',
      },
    },
  },
  {
    monthDay: '06-13',
    observanceIds: ['anthony-lisbon'],
    copy: {
      en: {
        eyebrow: 'Lisbon, Padua and a global devotion',
        title: 'Saint Anthony on 13 June',
        lead: '13 June commemorates Saint Anthony of Lisbon and Padua and is a solemnity in Lisbon. The date brings together his Portuguese origin, Franciscan life, association with Padua and an exceptionally widespread popular devotion.',
        context: 'This makes 13 June one of the clearest examples of how a saint page and a date page should reinforce each other. The date provides the calendar and local context; the substantive profile carries the biography, sources and distinctions between historical facts and later devotional associations.',
      },
      pt: {
        eyebrow: 'Lisboa, Pádua e uma devoção global',
        title: 'Santo António a 13 de junho',
        lead: '13 de junho é a comemoração de Santo António de Lisboa e de Pádua e constitui solenidade em Lisboa. A data reúne a origem portuguesa, a vida franciscana, a ligação a Pádua e uma devoção popular de enorme difusão internacional.',
        context: 'É um dos exemplos mais claros de como a página de um santo e a página de uma data se devem reforçar mutuamente. A data dá o enquadramento litúrgico e local; o perfil substantivo concentra a biografia, as fontes e a separação entre factos históricos e associações devocionais posteriores.',
      },
      es: {
        eyebrow: 'Lisboa, Padua y una devoción global',
        title: 'San Antonio el 13 de junio',
        lead: 'El 13 de junio se conmemora a San Antonio de Lisboa y Padua y es solemnidad en Lisboa. La fecha reúne su origen portugués, la vida franciscana, la relación con Padua y una devoción popular de enorme difusión internacional.',
        context: 'Es uno de los ejemplos más claros de cómo una página de santo y una página de fecha deben reforzarse mutuamente. La fecha aporta el contexto litúrgico y local; el perfil sustantivo concentra la biografía, las fuentes y la separación entre hechos históricos y asociaciones devocionales posteriores.',
      },
      it: {
        eyebrow: 'Lisbona, Padova e una devozione globale',
        title: 'Sant’Antonio il 13 giugno',
        lead: 'Il 13 giugno si commemora sant’Antonio di Lisbona e Padova ed è solennità a Lisbona. La data riunisce l’origine portoghese, la vita francescana, il legame con Padova e una devozione popolare di eccezionale diffusione internazionale.',
        context: 'È uno degli esempi più chiari di come una pagina del santo e una pagina della data debbano rafforzarsi a vicenda. La data offre il contesto liturgico e locale; il profilo sostanziale raccoglie biografia, fonti e distinzione tra fatti storici e associazioni devozionali successive.',
      },
    },
  },
  {
    monthDay: '06-24',
    observanceIds: ['nativity-john-baptist'],
    copy: {
      en: {
        eyebrow: 'A feast centred on a birth',
        title: 'The Nativity of Saint John the Baptist on 24 June',
        lead: '24 June is the feast of the Nativity of Saint John the Baptist in Western and Byzantine calendars. Unlike the more common commemorations associated with a saint’s death, this celebration is explicitly centred on John’s birth.',
        context: 'The shared date makes it useful for comparing traditions without assuming that every Church expresses the feast in exactly the same way. The page therefore treats the civil date, the biblical figure and the liturgical observance as connected but distinct layers of information.',
      },
      pt: {
        eyebrow: 'Uma festa centrada num nascimento',
        title: 'A Natividade de São João Batista a 24 de junho',
        lead: '24 de junho é a festa da Natividade de São João Batista nos calendários ocidentais e bizantinos. Ao contrário das comemorações mais frequentemente associadas à morte de um santo, esta celebração está explicitamente centrada no nascimento de João.',
        context: 'A coincidência da data torna-a útil para comparar tradições sem assumir que todas as Igrejas exprimem a festa da mesma forma. A página distingue, por isso, a data civil, a figura bíblica e a celebração litúrgica como camadas relacionadas, mas não idênticas.',
      },
      es: {
        eyebrow: 'Una fiesta centrada en un nacimiento',
        title: 'La Natividad de San Juan Bautista el 24 de junio',
        lead: 'El 24 de junio es la fiesta de la Natividad de San Juan Bautista en los calendarios occidentales y bizantinos. A diferencia de las conmemoraciones que suelen asociarse con la muerte de un santo, esta celebración está expresamente centrada en el nacimiento de Juan.',
        context: 'La coincidencia de la fecha la hace útil para comparar tradiciones sin suponer que todas las Iglesias expresan la fiesta del mismo modo. La página distingue así la fecha civil, la figura bíblica y la celebración litúrgica como capas relacionadas, pero no idénticas.',
      },
      it: {
        eyebrow: 'Una festa centrata su una nascita',
        title: 'La Natività di san Giovanni Battista il 24 giugno',
        lead: 'Il 24 giugno è la festa della Natività di san Giovanni Battista nei calendari occidentali e bizantini. Diversamente dalle commemorazioni più spesso associate alla morte di un santo, questa celebrazione è esplicitamente centrata sulla nascita di Giovanni.',
        context: 'La coincidenza della data è utile per confrontare le tradizioni senza supporre che tutte le Chiese esprimano la festa allo stesso modo. La pagina distingue quindi data civile, figura biblica e celebrazione liturgica come livelli collegati ma non identici.',
      },
    },
  },
  {
    monthDay: '06-29',
    observanceIds: ['peter-paul'],
    copy: {
      en: {
        eyebrow: 'Apostles across traditions',
        title: 'Saints Peter and Paul on 29 June',
        lead: '29 June brings together Saints Peter and Paul, two foundational apostolic figures, in a feast represented across Western, Byzantine and Coptic calendars in the Santos do Dia corpus. The shared observance creates a natural bridge between several Christian traditions.',
        context: 'A combined feast should not be mistaken for a single-person biography. For that reason, the date page is the primary editorial home for the shared celebration, while future canonical person profiles for Peter and Paul can remain distinct and link back to this common liturgical date.',
      },
      pt: {
        eyebrow: 'Apóstolos em várias tradições',
        title: 'São Pedro e São Paulo a 29 de junho',
        lead: '29 de junho reúne São Pedro e São Paulo, duas figuras apostólicas fundamentais, numa festa representada nos calendários ocidentais, bizantinos e copta do corpus do Santos do Dia. A celebração partilhada cria uma ponte natural entre várias tradições cristãs.',
        context: 'Uma festa conjunta não deve ser confundida com a biografia de uma única pessoa. Por isso, a página da data é o lugar editorial principal para a celebração comum, enquanto futuros perfis canónicos de Pedro e Paulo poderão manter identidades distintas e ligar novamente a esta data litúrgica.',
      },
      es: {
        eyebrow: 'Apóstoles en varias tradiciones',
        title: 'San Pedro y San Pablo el 29 de junio',
        lead: 'El 29 de junio reúne a san Pedro y san Pablo, dos figuras apostólicas fundamentales, en una fiesta representada en los calendarios occidentales, bizantinos y copto del corpus de Santos do Dia. La celebración compartida crea un puente natural entre varias tradiciones cristianas.',
        context: 'Una fiesta conjunta no debe confundirse con la biografía de una sola persona. Por eso, la página de la fecha es el hogar editorial principal de la celebración común, mientras futuros perfiles canónicos de Pedro y Pablo podrán mantener identidades distintas y enlazar de nuevo con esta fecha litúrgica.',
      },
      it: {
        eyebrow: 'Apostoli in diverse tradizioni',
        title: 'Santi Pietro e Paolo il 29 giugno',
        lead: 'Il 29 giugno riunisce i santi Pietro e Paolo, due figure apostoliche fondamentali, in una festa presente nei calendari occidentali, bizantini e copto del corpus di Santos do Dia. La celebrazione condivisa crea un ponte naturale tra diverse tradizioni cristiane.',
        context: 'Una festa congiunta non deve essere confusa con la biografia di una singola persona. Per questo la pagina della data è la sede editoriale principale della celebrazione comune, mentre futuri profili canonici di Pietro e Paolo potranno mantenere identità distinte e rinviare a questa data liturgica.',
      },
    },
  },
  {
    monthDay: '08-15',
    observanceIds: ['assumption-dormition'],
    copy: {
      en: {
        eyebrow: 'A major Marian date',
        title: 'Assumption and Dormition on 15 August',
        lead: '15 August is a major Marian date shared across different Christian traditions, but the names are not interchangeable. The Roman Catholic calendar celebrates the Assumption of the Blessed Virgin Mary, while Byzantine traditions celebrate the Dormition of the Mother of God.',
        context: 'This is precisely the kind of date where a global calendar must preserve theological and liturgical distinctions. Santos do Dia places the observances side by side for discovery, while retaining each tradition’s own title and calendar identity instead of silently merging them.',
      },
      pt: {
        eyebrow: 'Uma grande data mariana',
        title: 'Assunção e Dormição a 15 de agosto',
        lead: '15 de agosto é uma grande data mariana partilhada por diferentes tradições cristãs, mas as designações não são intercambiáveis. O calendário católico romano celebra a Assunção da Virgem Maria, enquanto as tradições bizantinas celebram a Dormição da Mãe de Deus.',
        context: 'É precisamente o tipo de data em que um calendário global tem de preservar diferenças teológicas e litúrgicas. O Santos do Dia coloca as celebrações lado a lado para facilitar a descoberta, mas conserva o título e a identidade de calendário próprios de cada tradição, sem as fundir silenciosamente.',
      },
      es: {
        eyebrow: 'Una gran fecha mariana',
        title: 'Asunción y Dormición el 15 de agosto',
        lead: 'El 15 de agosto es una gran fecha mariana compartida por distintas tradiciones cristianas, pero las denominaciones no son intercambiables. El calendario católico romano celebra la Asunción de la Virgen María, mientras las tradiciones bizantinas celebran la Dormición de la Madre de Dios.',
        context: 'Es precisamente el tipo de fecha en la que un calendario global debe preservar las diferencias teológicas y litúrgicas. Santos do Dia coloca las celebraciones lado a lado para facilitar el descubrimiento, conservando el título y la identidad de calendario propios de cada tradición.',
      },
      it: {
        eyebrow: 'Una grande data mariana',
        title: 'Assunzione e Dormizione il 15 agosto',
        lead: 'Il 15 agosto è una grande data mariana condivisa da diverse tradizioni cristiane, ma le denominazioni non sono intercambiabili. Il calendario cattolico romano celebra l’Assunzione della Vergine Maria, mentre le tradizioni bizantine celebrano la Dormizione della Madre di Dio.',
        context: 'È proprio il tipo di data in cui un calendario globale deve preservare le differenze teologiche e liturgiche. Santos do Dia affianca le celebrazioni per facilitarne la scoperta, conservando però il titolo e l’identità di calendario propri di ciascuna tradizione.',
      },
    },
  },
  {
    monthDay: '11-01',
    observanceIds: ['all-saints'],
    copy: {
      en: {
        eyebrow: 'A collective commemoration',
        title: 'All Saints on 1 November',
        lead: '1 November is the Western Christian feast of All Saints, a collective commemoration rather than the feast of one named person. Its editorial value lies in connecting the calendar with the broader idea of sainthood and with the many individual profiles distributed across the year.',
        context: 'Because the observance is collective, the annual date page is more appropriate than forcing it into a person-profile template. It can become a gateway to saints by century, place, tradition, patronage and feast date as those evidence-backed discovery layers continue to grow.',
      },
      pt: {
        eyebrow: 'Uma comemoração coletiva',
        title: 'Todos os Santos a 1 de novembro',
        lead: '1 de novembro é a festa cristã ocidental de Todos os Santos, uma comemoração coletiva e não a festa de uma única pessoa identificada. O seu valor editorial está em ligar o calendário à própria ideia de santidade e aos muitos perfis individuais distribuídos ao longo do ano.',
        context: 'Por ser uma celebração coletiva, a página anual da data é mais adequada do que forçar o conteúdo para um modelo de perfil pessoal. Pode tornar-se uma porta de entrada para santos por século, lugar, tradição, patronato e data à medida que essas camadas de descoberta forem sendo validadas.',
      },
      es: {
        eyebrow: 'Una conmemoración colectiva',
        title: 'Todos los Santos el 1 de noviembre',
        lead: 'El 1 de noviembre es la fiesta cristiana occidental de Todos los Santos, una conmemoración colectiva y no la fiesta de una sola persona identificada. Su valor editorial consiste en conectar el calendario con la idea de santidad y con los muchos perfiles individuales distribuidos a lo largo del año.',
        context: 'Al ser una celebración colectiva, la página anual de la fecha es más adecuada que forzar el contenido dentro de un modelo de perfil personal. Puede convertirse en una puerta de entrada a santos por siglo, lugar, tradición, patronazgo y fecha conforme se validen esas capas de descubrimiento.',
      },
      it: {
        eyebrow: 'Una commemorazione collettiva',
        title: 'Tutti i Santi il 1° novembre',
        lead: 'Il 1° novembre è la festa cristiana occidentale di Tutti i Santi, una commemorazione collettiva e non la festa di una singola persona identificata. Il suo valore editoriale sta nel collegare il calendario all’idea stessa di santità e ai molti profili individuali distribuiti durante l’anno.',
        context: 'Proprio perché è una celebrazione collettiva, la pagina annuale della data è più adatta di un modello di profilo personale. Può diventare un punto di accesso ai santi per secolo, luogo, tradizione, patronato e data man mano che queste relazioni vengono validate.',
      },
    },
  },
  {
    monthDay: '12-08',
    observanceIds: ['immaculate-conception'],
    copy: {
      en: {
        eyebrow: 'A specifically Catholic solemnity',
        title: 'The Immaculate Conception on 8 December',
        lead: '8 December is the Roman Catholic solemnity of the Immaculate Conception of the Blessed Virgin Mary. The title refers to Mary’s conception and should not be confused with the virginal conception of Jesus celebrated in relation to the Annunciation and Nativity.',
        context: 'The distinction is important both theologically and editorially. Santos do Dia labels the observance explicitly as Roman Catholic and keeps it separate from other Marian feasts, allowing users to understand how different doctrines, events and calendar dates relate without being conflated.',
      },
      pt: {
        eyebrow: 'Uma solenidade especificamente católica',
        title: 'A Imaculada Conceição a 8 de dezembro',
        lead: '8 de dezembro é a solenidade católica romana da Imaculada Conceição da Virgem Maria. A designação refere-se à conceção de Maria e não deve ser confundida com a conceção virginal de Jesus, relacionada liturgicamente com a Anunciação e a Natividade.',
        context: 'A distinção é importante tanto teológica como editorialmente. O Santos do Dia identifica a celebração explicitamente como católica romana e mantém-na separada de outras festas marianas, permitindo perceber a relação entre doutrinas, acontecimentos e datas sem os confundir.',
      },
      es: {
        eyebrow: 'Una solemnidad específicamente católica',
        title: 'La Inmaculada Concepción el 8 de diciembre',
        lead: 'El 8 de diciembre es la solemnidad católica romana de la Inmaculada Concepción de la Virgen María. El título se refiere a la concepción de María y no debe confundirse con la concepción virginal de Jesús, relacionada litúrgicamente con la Anunciación y la Natividad.',
        context: 'La distinción es importante tanto teológica como editorialmente. Santos do Dia identifica la celebración expresamente como católica romana y la mantiene separada de otras fiestas marianas, permitiendo comprender la relación entre doctrinas, acontecimientos y fechas sin confundirlos.',
      },
      it: {
        eyebrow: 'Una solennità specificamente cattolica',
        title: 'L’Immacolata Concezione l’8 dicembre',
        lead: 'L’8 dicembre è la solennità cattolica romana dell’Immacolata Concezione della Vergine Maria. Il titolo riguarda il concepimento di Maria e non va confuso con il concepimento verginale di Gesù, collegato liturgicamente all’Annunciazione e alla Natività.',
        context: 'La distinzione è importante sia teologicamente sia editorialmente. Santos do Dia identifica esplicitamente la celebrazione come cattolica romana e la mantiene distinta dalle altre feste mariane, così da mostrare le relazioni tra dottrine, eventi e date senza confonderli.',
      },
    },
  },
  {
    monthDay: '12-25',
    observanceIds: ['nativity-christ'],
    copy: {
      en: {
        eyebrow: 'Nativity and calendar systems',
        title: 'Christmas and the Nativity of the Lord on 25 December',
        lead: '25 December is the Nativity of the Lord in several of the Christian calendars represented by Santos do Dia. It is also a date that demonstrates why civil dates and liturgical calendars must be handled carefully: other Christian traditions keep the Nativity on a different civil date or organise the feast differently.',
        context: 'The annual page therefore presents 25 December as a major Christian date without claiming that every Church celebrates Christmas on the same civil day. Calendar system, jurisdiction and tradition remain visible so users can explore both the shared feast and the real differences in its observance.',
      },
      pt: {
        eyebrow: 'Natividade e sistemas de calendário',
        title: 'Natal e Natividade do Senhor a 25 de dezembro',
        lead: '25 de dezembro é a Natividade do Senhor em vários dos calendários cristãos representados pelo Santos do Dia. É também uma data que mostra por que razão é essencial distinguir data civil e calendário litúrgico: outras tradições cristãs celebram a Natividade noutro dia civil ou organizam a festa de forma diferente.',
        context: 'A página anual apresenta, por isso, 25 de dezembro como uma grande data cristã sem afirmar que todas as Igrejas celebram o Natal no mesmo dia civil. Sistema de calendário, jurisdição e tradição permanecem visíveis para permitir explorar simultaneamente a festa partilhada e as diferenças reais da sua celebração.',
      },
      es: {
        eyebrow: 'Natividad y sistemas de calendario',
        title: 'Navidad y Natividad del Señor el 25 de diciembre',
        lead: 'El 25 de diciembre es la Natividad del Señor en varios de los calendarios cristianos representados por Santos do Dia. También es una fecha que muestra por qué es esencial distinguir entre fecha civil y calendario litúrgico: otras tradiciones cristianas celebran la Natividad en otro día civil o estructuran la fiesta de manera diferente.',
        context: 'La página anual presenta por ello el 25 de diciembre como una gran fecha cristiana sin afirmar que todas las Iglesias celebran la Navidad el mismo día civil. El sistema de calendario, la jurisdicción y la tradición siguen visibles para explorar a la vez la fiesta compartida y las diferencias reales de su celebración.',
      },
      it: {
        eyebrow: 'Natività e sistemi di calendario',
        title: 'Natale e Natività del Signore il 25 dicembre',
        lead: 'Il 25 dicembre è la Natività del Signore in diversi calendari cristiani rappresentati da Santos do Dia. È anche una data che mostra perché sia essenziale distinguere tra data civile e calendario liturgico: altre tradizioni cristiane celebrano la Natività in un diverso giorno civile o organizzano la festa in modo differente.',
        context: 'La pagina annuale presenta quindi il 25 dicembre come una grande data cristiana senza affermare che tutte le Chiese celebrino il Natale nello stesso giorno civile. Sistema di calendario, giurisdizione e tradizione restano visibili per esplorare insieme la festa condivisa e le differenze reali della sua osservanza.',
      },
    },
  },
];

export function getAnnualDateEditorial(monthDay: string, locale: Locale) {
  const entry = FLAGSHIP_ANNUAL_DATES.find(item => item.monthDay === monthDay);
  const copy = entry?.copy[locale];
  return entry && copy ? { ...entry, ...copy } : undefined;
}

export function hasAnnualDateEditorial(monthDay: string, locale: Locale) {
  return Boolean(getAnnualDateEditorial(monthDay, locale));
}

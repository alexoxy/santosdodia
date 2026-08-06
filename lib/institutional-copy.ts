import type { Locale } from './i18n';

export type InstitutionalPageKind='privacy'|'terms'|'faq'|'corrections';
type Section={title:string;body:string[];items?:string[]};
type Faq={question:string;answer:string};
type Page={eyebrow:string;title:string;intro:string;sections?:Section[];faqs?:Faq[]};
type InstitutionalCopy={
 nav:{privacy:string;terms:string;faq:string;corrections:string};
 updated:string;
 report:string;
 pages:Record<InstitutionalPageKind,Page>;
};

const en:InstitutionalCopy={
 nav:{privacy:'Privacy',terms:'Terms',faq:'FAQ',corrections:'Corrections'},updated:'Last updated: 6 August 2026',report:'Report a correction on GitHub',
 pages:{
  privacy:{eyebrow:'Privacy by design',title:'Privacy',intro:'Santos do Dia is designed to work without an account and without building a devotional or advertising profile about you.',sections:[
   {title:'What stays on your device',body:['Your language and Christian-tradition preferences, and any virtual candle you light, are stored in your browser. Santos do Dia does not receive a public candle count or create a server-side devotional profile.'],items:['Language preference: sdd-locale','Tradition preference: sdd-tradition','Virtual candles: browser-local state only']},
   {title:'Technical requests',body:['When you visit the site, Cloudflare processes the technical data needed to deliver and protect the service, such as IP address, request time, browser information and security events. Santos do Dia uses this operational data for delivery, reliability and abuse prevention, not for personalised advertising.']},
   {title:'External media and links',body:['Official video is not loaded until you choose to open it. The Vatican player uses YouTube’s privacy-enhanced domain. External Church, calendar and media services apply their own privacy terms after you leave Santos do Dia.']}
  ]},
  terms:{eyebrow:'Clear public-service terms',title:'Terms of use',intro:'Santos do Dia is a free, independent reference service. It is not an official organ of any Church and does not replace guidance from the relevant Church or jurisdiction.',sections:[
   {title:'Use of the information',body:['Dates, titles, patronages and observances can vary by Church, rite, jurisdiction and calendar. Use the cited official source when a date or rule has practical, pastoral or legal importance.']},
   {title:'Calendars and API',body:['Public pages, JSON endpoints and ICS feeds may be used for personal, research and reasonable technical use. Do not overload the service, misrepresent provisional data as official, or remove source and validation context.']},
   {title:'Rights and attribution',body:['Original interface and editorial text belong to Santos do Dia unless stated otherwise. Institutional names, source material and linked media remain the property of their respective owners. Linking does not imply endorsement.']},
   {title:'Availability and changes',body:['The service is provided on a best-effort basis. Sources, links and calendar rules can change, so corrections and transparent revision history are part of the product.']}
  ]},
  faq:{eyebrow:'Practical answers',title:'Frequently asked questions',intro:'How the daily calendar, traditions, language, sources, live media and subscriptions work.',faqs:[
   {question:'What is Santos do Dia?',answer:'A free multilingual service for discovering who is celebrated on a date, in a place and in a Christian tradition, with traceable sources.'},
   {question:'Why can the same saint have different dates?',answer:'Churches, rites, jurisdictions and calendar systems can observe the same person or feast on different dates. The site preserves those differences instead of flattening them.'},
   {question:'How are my place and tradition used?',answer:'Your approximate country helps suggest relevant observances. Your chosen tradition filters the experience. You can change both without creating an account.'},
   {question:'Is page content shown in my selected language?',answer:'The interface and reviewed editorial fields are localised. Original-language names and source titles may be retained for accuracy, and any fallback must be identified.'},
   {question:'Are the live streams hosted here?',answer:'No. Santos do Dia links to or embeds verified official Church and institutional channels. The original institution hosts and controls the broadcast.'},
   {question:'How do calendar subscriptions work?',answer:'ICS feeds can be opened in Apple Calendar, Google Calendar, Outlook and other compatible clients. Updates are delivered through the same subscription URL.'},
   {question:'Does lighting a candle publish anything?',answer:'No. A virtual candle is free and remains only in your browser on that device.'},
   {question:'How can I report an error or rights concern?',answer:'Use the Corrections page and include the exact page URL, the issue and a reliable source. Do not post private personal information.'}
  ]},
  corrections:{eyebrow:'Transparent editorial review',title:'Corrections and rights requests',intro:'Help us correct a date, name, translation, source, broken link or rights issue while keeping a reproducible editorial record.',sections:[
   {title:'What to include',body:['Identify the exact Santos do Dia page, describe what is wrong and provide the strongest available official or high-authority source. For rights requests, explain your relationship to the material.'],items:['Exact page or API URL','Specific fact, translation, link or media item','Supporting source and preferred correction']},
   {title:'What happens next',body:['The report is checked against the source and tradition context. Accepted changes are recorded in GitHub, pass the same quality checks as other edits and remain auditable.']},
   {title:'Protect personal information',body:['GitHub issues are public. Do not include private contact details, credentials, health information or other sensitive personal data.']}
  ]}
 }
};

const pt:InstitutionalCopy={
 nav:{privacy:'Privacidade',terms:'Termos',faq:'Perguntas frequentes',corrections:'Correções'},updated:'Última atualização: 6 de agosto de 2026',report:'Comunicar uma correção no GitHub',
 pages:{
  privacy:{eyebrow:'Privacidade desde a conceção',title:'Privacidade',intro:'O Santos do Dia foi concebido para funcionar sem conta e sem criar um perfil devocional ou publicitário sobre si.',sections:[
   {title:'O que fica no seu dispositivo',body:['As preferências de idioma e tradição cristã, bem como qualquer vela virtual que acenda, ficam guardadas no navegador. O Santos do Dia não recebe uma contagem pública de velas nem cria um perfil devocional no servidor.'],items:['Idioma: sdd-locale','Tradição: sdd-tradition','Velas virtuais: apenas no navegador']},
   {title:'Pedidos técnicos',body:['Ao visitar o site, a Cloudflare processa os dados técnicos necessários para entregar e proteger o serviço, como endereço IP, hora do pedido, informação do navegador e eventos de segurança. Estes dados operacionais servem a entrega, fiabilidade e prevenção de abusos, não publicidade personalizada.']},
   {title:'Meios e ligações externas',body:['O vídeo oficial só é carregado quando decide abri-lo. O leitor do Vaticano usa o domínio de privacidade reforçada do YouTube. Os serviços externos aplicam as suas próprias condições depois de sair do Santos do Dia.']}
  ]},
  terms:{eyebrow:'Condições claras de serviço público',title:'Termos de utilização',intro:'O Santos do Dia é um serviço de referência gratuito e independente. Não é um órgão oficial de qualquer Igreja nem substitui a orientação da Igreja ou jurisdição competente.',sections:[
   {title:'Utilização da informação',body:['Datas, títulos, padroeiros e celebrações podem variar por Igreja, rito, jurisdição e calendário. Consulte a fonte oficial indicada quando uma data ou regra tiver importância prática, pastoral ou jurídica.']},
   {title:'Calendários e API',body:['As páginas públicas, endpoints JSON e feeds ICS podem ser usados para fins pessoais, de investigação e técnicos razoáveis. Não sobrecarregue o serviço, não apresente dados provisórios como oficiais e não remova o contexto de fonte e validação.']},
   {title:'Direitos e atribuição',body:['A interface e os textos editoriais originais pertencem ao Santos do Dia, salvo indicação em contrário. Nomes institucionais, materiais das fontes e meios ligados pertencem aos respetivos titulares. Uma ligação não significa aprovação.']},
   {title:'Disponibilidade e alterações',body:['O serviço é prestado segundo o melhor esforço. Fontes, ligações e regras de calendário podem mudar; as correções e o histórico transparente fazem parte do produto.']}
  ]},
  faq:{eyebrow:'Respostas práticas',title:'Perguntas frequentes',intro:'Como funcionam o calendário diário, as tradições, os idiomas, as fontes, as transmissões e as subscrições.',faqs:[
   {question:'O que é o Santos do Dia?',answer:'Um serviço multilingue gratuito para descobrir quem é celebrado numa data, num lugar e numa tradição cristã, com fontes rastreáveis.'},
   {question:'Porque pode o mesmo santo ter datas diferentes?',answer:'Igrejas, ritos, jurisdições e calendários podem celebrar a mesma pessoa ou festa em datas diferentes. O site preserva essas diferenças.'},
   {question:'Como são usados o meu local e a tradição?',answer:'O país aproximado ajuda a sugerir celebrações relevantes. A tradição escolhida filtra a experiência. Pode alterar ambos sem criar conta.'},
   {question:'O conteúdo aparece no idioma selecionado?',answer:'A interface e os campos editoriais revistos são localizados. Nomes e títulos de fontes podem manter o idioma original por rigor; qualquer fallback deve ser identificado.'},
   {question:'As transmissões são alojadas aqui?',answer:'Não. O Santos do Dia liga ou incorpora canais oficiais verificados. A instituição de origem aloja e controla a transmissão.'},
   {question:'Como funcionam as subscrições de calendário?',answer:'Os feeds ICS abrem no Apple Calendar, Google Calendar, Outlook e clientes compatíveis. As atualizações chegam pelo mesmo endereço de subscrição.'},
   {question:'Acender uma vela publica alguma coisa?',answer:'Não. A vela virtual é gratuita e permanece apenas no navegador desse dispositivo.'},
   {question:'Como comunico um erro ou problema de direitos?',answer:'Use a página Correções e indique o endereço exato, o problema e uma fonte fiável. Não publique informação pessoal privada.'}
  ]},
  corrections:{eyebrow:'Revisão editorial transparente',title:'Correções e pedidos de direitos',intro:'Ajude-nos a corrigir uma data, nome, tradução, fonte, ligação ou questão de direitos, mantendo um registo editorial reproduzível.',sections:[
   {title:'O que deve incluir',body:['Identifique a página exata, descreva o erro e forneça a melhor fonte oficial ou de elevada autoridade disponível. Num pedido de direitos, explique a sua relação com o material.'],items:['Página ou endereço da API','Facto, tradução, ligação ou elemento multimédia','Fonte de apoio e correção pretendida']},
   {title:'O que acontece depois',body:['O pedido é verificado no contexto da fonte e da tradição. As alterações aceites ficam registadas no GitHub, passam pelos mesmos controlos de qualidade e permanecem auditáveis.']},
   {title:'Proteja os dados pessoais',body:['As issues do GitHub são públicas. Não inclua contactos privados, credenciais, informação de saúde ou outros dados pessoais sensíveis.']}
  ]}
 }
};

const es:InstitutionalCopy={
 nav:{privacy:'Privacidad',terms:'Términos',faq:'Preguntas frecuentes',corrections:'Correcciones'},updated:'Última actualización: 6 de agosto de 2026',report:'Comunicar una corrección en GitHub',
 pages:{
  privacy:{eyebrow:'Privacidad desde el diseño',title:'Privacidad',intro:'Santos do Dia funciona sin cuenta y sin crear un perfil devocional o publicitario sobre usted.',sections:[
   {title:'Lo que permanece en su dispositivo',body:['Las preferencias de idioma y tradición cristiana, y cualquier vela virtual, se guardan en el navegador. Santos do Dia no recibe un recuento público de velas ni crea un perfil devocional en el servidor.'],items:['Idioma: sdd-locale','Tradición: sdd-tradition','Velas virtuales: solo en el navegador']},
   {title:'Solicitudes técnicas',body:['Cloudflare procesa los datos técnicos necesarios para entregar y proteger el servicio, como dirección IP, hora, navegador y eventos de seguridad. Se usan para fiabilidad y prevención de abusos, no para publicidad personalizada.']},
   {title:'Medios y enlaces externos',body:['El vídeo oficial solo se carga cuando decide abrirlo. El reproductor del Vaticano usa el dominio de privacidad mejorada de YouTube. Los servicios externos aplican sus propias condiciones.']}
  ]},
  terms:{eyebrow:'Condiciones claras de servicio público',title:'Términos de uso',intro:'Santos do Dia es un servicio de referencia gratuito e independiente. No es un órgano oficial de ninguna Iglesia ni sustituye su orientación.',sections:[
   {title:'Uso de la información',body:['Las fechas, títulos, patronazgos y celebraciones pueden variar por Iglesia, rito, jurisdicción y calendario. Consulte la fuente oficial cuando una fecha o norma tenga importancia práctica, pastoral o jurídica.']},
   {title:'Calendarios y API',body:['Las páginas públicas, endpoints JSON y feeds ICS permiten un uso personal, de investigación y técnico razonable. No sobrecargue el servicio ni presente datos provisionales como oficiales.']},
   {title:'Derechos y atribución',body:['La interfaz y los textos originales pertenecen a Santos do Dia salvo indicación contraria. Los nombres institucionales, fuentes y medios enlazados pertenecen a sus titulares.']},
   {title:'Disponibilidad y cambios',body:['El servicio se presta con el mejor esfuerzo. Las fuentes, enlaces y reglas pueden cambiar; las correcciones y el historial transparente forman parte del producto.']}
  ]},
  faq:{eyebrow:'Respuestas prácticas',title:'Preguntas frecuentes',intro:'Cómo funcionan el calendario diario, las tradiciones, los idiomas, las fuentes, los directos y las suscripciones.',faqs:[
   {question:'¿Qué es Santos do Dia?',answer:'Un servicio multilingüe gratuito para descubrir quién se celebra en una fecha, lugar y tradición cristiana, con fuentes rastreables.'},
   {question:'¿Por qué un santo puede tener fechas diferentes?',answer:'Las Iglesias, ritos, jurisdicciones y calendarios pueden observar la misma fiesta en fechas distintas. El sitio conserva esas diferencias.'},
   {question:'¿Cómo se usan mi lugar y tradición?',answer:'El país aproximado ayuda a sugerir celebraciones. La tradición elegida filtra la experiencia. Ambos pueden cambiarse sin cuenta.'},
   {question:'¿El contenido aparece en el idioma elegido?',answer:'La interfaz y los campos editoriales revisados se localizan. Los nombres y títulos originales pueden conservarse por precisión; todo fallback debe identificarse.'},
   {question:'¿Los directos se alojan aquí?',answer:'No. Santos do Dia enlaza o integra canales oficiales verificados. La institución original aloja y controla la emisión.'},
   {question:'¿Cómo funcionan las suscripciones?',answer:'Los feeds ICS funcionan con Apple Calendar, Google Calendar, Outlook y clientes compatibles, usando siempre la misma URL.'},
   {question:'¿Encender una vela publica algo?',answer:'No. La vela virtual es gratuita y permanece solo en el navegador de ese dispositivo.'},
   {question:'¿Cómo comunico un error o problema de derechos?',answer:'Use Correcciones e indique la URL exacta, el problema y una fuente fiable. No publique información privada.'}
  ]},
  corrections:{eyebrow:'Revisión editorial transparente',title:'Correcciones y solicitudes de derechos',intro:'Ayúdenos a corregir una fecha, nombre, traducción, fuente, enlace o cuestión de derechos con un registro reproducible.',sections:[
   {title:'Qué debe incluir',body:['Identifique la página exacta, describa el error y aporte la mejor fuente oficial disponible. En solicitudes de derechos, explique su relación con el material.'],items:['URL exacta','Hecho, traducción, enlace o medio','Fuente y corrección propuesta']},
   {title:'Qué ocurre después',body:['El informe se verifica en su contexto. Los cambios aceptados se registran en GitHub, pasan los mismos controles y siguen siendo auditables.']},
   {title:'Proteja los datos personales',body:['Las incidencias de GitHub son públicas. No incluya contactos privados, credenciales, datos de salud ni otra información sensible.']}
  ]}
 }
};

const fr:InstitutionalCopy={
 nav:{privacy:'Confidentialité',terms:'Conditions',faq:'FAQ',corrections:'Corrections'},updated:'Dernière mise à jour : 6 août 2026',report:'Signaler une correction sur GitHub',
 pages:{
  privacy:{eyebrow:'Confidentialité dès la conception',title:'Confidentialité',intro:'Santos do Dia fonctionne sans compte et sans créer de profil dévotionnel ou publicitaire vous concernant.',sections:[
   {title:'Ce qui reste sur votre appareil',body:['La langue, la tradition chrétienne et les bougies virtuelles restent dans votre navigateur. Santos do Dia ne reçoit aucun compteur public et ne crée aucun profil dévotionnel sur serveur.'],items:['Langue : sdd-locale','Tradition : sdd-tradition','Bougies : uniquement dans le navigateur']},
   {title:'Requêtes techniques',body:['Cloudflare traite les données nécessaires à la livraison et à la protection du service, comme l’adresse IP, l’heure, le navigateur et les événements de sécurité. Elles servent à la fiabilité et à la prévention des abus, pas à la publicité personnalisée.']},
   {title:'Médias et liens externes',body:['La vidéo officielle n’est chargée qu’à votre demande. Le lecteur du Vatican utilise le domaine YouTube à confidentialité renforcée. Les services externes appliquent leurs propres conditions.']}
  ]},
  terms:{eyebrow:'Conditions claires de service public',title:'Conditions d’utilisation',intro:'Santos do Dia est un service de référence gratuit et indépendant. Il n’est l’organe officiel d’aucune Église et ne remplace pas ses orientations.',sections:[
   {title:'Utilisation des informations',body:['Dates, titres, patronages et célébrations varient selon l’Église, le rite, la juridiction et le calendrier. Consultez la source officielle lorsqu’une règle a une importance pratique, pastorale ou juridique.']},
   {title:'Calendriers et API',body:['Les pages publiques, endpoints JSON et flux ICS permettent un usage personnel, scientifique et technique raisonnable. Ne surchargez pas le service et ne présentez pas les données provisoires comme officielles.']},
   {title:'Droits et attribution',body:['L’interface et les textes originaux appartiennent à Santos do Dia sauf mention contraire. Les noms institutionnels, sources et médias liés restent la propriété de leurs titulaires.']},
   {title:'Disponibilité et modifications',body:['Le service est fourni au mieux de nos possibilités. Sources, liens et règles peuvent changer ; les corrections et l’historique transparent font partie du produit.']}
  ]},
  faq:{eyebrow:'Réponses pratiques',title:'Questions fréquentes',intro:'Le fonctionnement du calendrier quotidien, des traditions, des langues, des sources, des directs et des abonnements.',faqs:[
   {question:'Qu’est-ce que Santos do Dia ?',answer:'Un service multilingue gratuit pour savoir qui est célébré à une date, dans un lieu et une tradition chrétienne, avec des sources traçables.'},
   {question:'Pourquoi un même saint peut-il avoir plusieurs dates ?',answer:'Églises, rites, juridictions et calendriers peuvent célébrer la même fête à des dates différentes. Le site préserve ces différences.'},
   {question:'Comment mon lieu et ma tradition sont-ils utilisés ?',answer:'Le pays approximatif suggère des célébrations pertinentes. La tradition choisie filtre l’expérience. Aucun compte n’est nécessaire.'},
   {question:'Le contenu apparaît-il dans la langue choisie ?',answer:'L’interface et les champs éditoriaux relus sont localisés. Les noms et titres originaux peuvent être conservés pour l’exactitude ; tout fallback doit être signalé.'},
   {question:'Les directs sont-ils hébergés ici ?',answer:'Non. Santos do Dia relie ou intègre des chaînes officielles vérifiées. L’institution d’origine contrôle la diffusion.'},
   {question:'Comment fonctionnent les abonnements ?',answer:'Les flux ICS fonctionnent avec Apple Calendar, Google Calendar, Outlook et les clients compatibles, via la même URL.'},
   {question:'Allumer une bougie publie-t-il quelque chose ?',answer:'Non. La bougie virtuelle est gratuite et reste uniquement dans le navigateur de cet appareil.'},
   {question:'Comment signaler une erreur ou un problème de droits ?',answer:'Utilisez Corrections avec l’URL exacte, le problème et une source fiable. Ne publiez aucune donnée privée.'}
  ]},
  corrections:{eyebrow:'Révision éditoriale transparente',title:'Corrections et demandes relatives aux droits',intro:'Aidez-nous à corriger une date, un nom, une traduction, une source, un lien ou un problème de droits avec une trace reproductible.',sections:[
   {title:'Éléments à fournir',body:['Indiquez la page exacte, décrivez l’erreur et joignez la meilleure source officielle disponible. Pour les droits, précisez votre lien avec le contenu.'],items:['URL exacte','Fait, traduction, lien ou média','Source et correction proposée']},
   {title:'Traitement',body:['Le signalement est vérifié dans son contexte. Les changements acceptés sont enregistrés dans GitHub, soumis aux mêmes contrôles et restent auditables.']},
   {title:'Protégez les données personnelles',body:['Les tickets GitHub sont publics. N’y publiez pas de coordonnées privées, d’identifiants, de données de santé ou d’autres informations sensibles.']}
  ]}
 }
};

const partial:Record<Exclude<Locale,'en'|'pt'|'es'|'fr'>,Pick<InstitutionalCopy,'nav'|'updated'|'report'>>={
 de:{nav:{privacy:'Datenschutz',terms:'Nutzungsbedingungen',faq:'FAQ',corrections:'Korrekturen'},updated:'Letzte Aktualisierung: 6. August 2026',report:'Korrektur auf GitHub melden'},
 it:{nav:{privacy:'Privacy',terms:'Termini',faq:'Domande frequenti',corrections:'Correzioni'},updated:'Ultimo aggiornamento: 6 agosto 2026',report:'Segnala una correzione su GitHub'},
 pl:{nav:{privacy:'Prywatność',terms:'Warunki',faq:'FAQ',corrections:'Korekty'},updated:'Ostatnia aktualizacja: 6 sierpnia 2026',report:'Zgłoś korektę w GitHub'},
 ru:{nav:{privacy:'Конфиденциальность',terms:'Условия',faq:'Частые вопросы',corrections:'Исправления'},updated:'Обновлено 6 августа 2026 г.',report:'Сообщить об исправлении на GitHub'},
 fil:{nav:{privacy:'Privacy',terms:'Mga tuntunin',faq:'Mga tanong',corrections:'Mga pagwawasto'},updated:'Huling na-update: Agosto 6, 2026',report:'Mag-ulat ng pagwawasto sa GitHub'},
 sw:{nav:{privacy:'Faragha',terms:'Masharti',faq:'Maswali',corrections:'Marekebisho'},updated:'Ilisasishwa mwisho: 6 Agosti 2026',report:'Ripoti marekebisho kwenye GitHub'}
};

const fallbackNotices:Record<keyof typeof partial,string>={
 de:'Dieser institutionelle Text wird derzeit auf Englisch angezeigt, bis die redaktionelle deutsche Prüfung abgeschlossen ist.',
 it:'Questo testo istituzionale è temporaneamente mostrato in inglese, in attesa della revisione editoriale italiana.',
 pl:'Ten tekst instytucjonalny jest obecnie wyświetlany po angielsku do czasu zakończenia polskiej weryfikacji redakcyjnej.',
 ru:'Этот институциональный текст временно показывается на английском языке до завершения русской редакционной проверки.',
 fil:'Pansamantalang ipinapakita sa English ang tekstong institusyonal na ito habang hinihintay ang editoryal na pagsusuri sa Filipino.',
 sw:'Maandishi haya ya taasisi yanaonyeshwa kwa Kiingereza kwa muda hadi ukaguzi wa uhariri wa Kiswahili ukamilike.'
};

export function getInstitutionalCopy(locale:Locale):InstitutionalCopy&{fallbackNotice?:string}{
 if(locale==='pt')return pt;
 if(locale==='es')return es;
 if(locale==='fr')return fr;
 if(locale==='en')return en;
 return {...en,...partial[locale],fallbackNotice:fallbackNotices[locale]};
}

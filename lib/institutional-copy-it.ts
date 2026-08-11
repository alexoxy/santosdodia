import type { InstitutionalPageKind } from './institutional-copy';

type Section={title:string;body:string[];items?:string[]};
type Faq={question:string;answer:string};
type Page={eyebrow:string;title:string;intro:string;sections?:Section[];faqs?:Faq[]};
export type ItalianInstitutionalCopy={
 nav:{privacy:string;terms:string;faq:string;corrections:string};
 updated:string;
 report:string;
 pages:Record<InstitutionalPageKind,Page>;
};

export const italianInstitutionalCopy:ItalianInstitutionalCopy={
 nav:{privacy:'Privacy',terms:'Termini',faq:'Domande frequenti',corrections:'Correzioni'},
 updated:'Ultimo aggiornamento: 11 agosto 2026',
 report:'Segnala una correzione su GitHub',
 pages:{
  privacy:{
   eyebrow:'Privacy fin dalla progettazione',title:'Privacy',
   intro:'Santos do Dia è progettato per funzionare senza account e senza creare un profilo devozionale o pubblicitario dell’utente.',
   sections:[
    {title:'Cosa rimane sul dispositivo',body:['Le preferenze di lingua e tradizione cristiana, così come le candele virtuali accese, vengono memorizzate nel browser. Santos do Dia non riceve un conteggio pubblico delle candele e non crea un profilo devozionale lato server.'],items:['Preferenza della lingua: sdd-locale','Preferenza della tradizione: sdd-tradition','Candele virtuali: solo nello stato locale del browser']},
    {title:'Richieste tecniche',body:['Quando visiti il sito, Cloudflare tratta i dati tecnici necessari per distribuire e proteggere il servizio, come indirizzo IP, ora della richiesta, informazioni sul browser ed eventi di sicurezza. Questi dati operativi servono per affidabilità e prevenzione degli abusi, non per pubblicità personalizzata.']},
    {title:'Media e collegamenti esterni',body:['I video ufficiali non vengono caricati finché non scegli di aprirli. I servizi esterni di Chiese, calendari e media applicano le proprie condizioni di privacy dopo che lasci Santos do Dia.']}
   ]
  },
  terms:{
   eyebrow:'Condizioni chiare per un servizio pubblico',title:'Termini di utilizzo',
   intro:'Santos do Dia è un servizio di consultazione gratuito e indipendente. Non è un organo ufficiale di alcuna Chiesa e non sostituisce le indicazioni della Chiesa o della giurisdizione competente.',
   sections:[
    {title:'Uso delle informazioni',body:['Date, titoli, patronati e ricorrenze possono variare secondo Chiesa, rito, giurisdizione e sistema di calendario. Quando una data o una regola ha rilevanza pratica, pastorale o giuridica, consulta la fonte ufficiale citata.']},
    {title:'Calendari e API',body:['Le pagine pubbliche, gli endpoint JSON e i feed ICS possono essere usati per finalità personali, di ricerca e per un uso tecnico ragionevole. Non sovraccaricare il servizio, non presentare dati provvisori come ufficiali e non rimuovere il contesto relativo a fonti e validazione.']},
    {title:'Diritti e attribuzione',body:['L’interfaccia e i testi editoriali originali appartengono a Santos do Dia, salvo diversa indicazione. Nomi istituzionali, materiali delle fonti e media collegati restano di proprietà dei rispettivi titolari. Un collegamento non implica approvazione.']},
    {title:'Disponibilità e modifiche',body:['Il servizio è fornito secondo il principio del miglior impegno. Fonti, collegamenti e regole di calendario possono cambiare; le correzioni e una cronologia trasparente delle revisioni fanno parte del prodotto.']}
   ]
  },
  faq:{
   eyebrow:'Risposte pratiche',title:'Domande frequenti',
   intro:'Come funzionano il calendario quotidiano, le tradizioni, le lingue, le fonti, i media in diretta e gli abbonamenti.',
   faqs:[
    {question:'Che cos’è Santos do Dia?',answer:'Un servizio multilingue gratuito per scoprire chi viene celebrato in una determinata data, luogo e tradizione cristiana, con fonti tracciabili.'},
    {question:'Perché lo stesso santo può avere date diverse?',answer:'Chiese, riti, giurisdizioni e sistemi di calendario possono celebrare la stessa persona o festa in date differenti. Il sito conserva queste differenze invece di appiattirle.'},
    {question:'Come vengono usati il mio luogo e la mia tradizione?',answer:'Il Paese approssimativo aiuta a suggerire ricorrenze pertinenti. La tradizione scelta filtra l’esperienza. Puoi modificarli senza creare un account.'},
    {question:'Tutto il contenuto appare nella lingua selezionata?',answer:'Sì, per le lingue offerte nel selettore pubblico le superfici principali del prodotto, i testi editoriali e i fallback generati restano nella lingua selezionata. I titoli originali delle fonti e i nomi propri possono essere mantenuti nella forma ufficiale quando necessario per precisione.'},
    {question:'Le dirette sono ospitate qui?',answer:'No. Santos do Dia collega o incorpora canali ufficiali verificati di Chiese e istituzioni. L’istituzione di origine ospita e controlla la trasmissione.'},
    {question:'Come funzionano gli abbonamenti al calendario?',answer:'I feed ICS possono essere aperti con Apple Calendar, Google Calendar, Outlook e altri programmi compatibili. Gli aggiornamenti arrivano tramite lo stesso indirizzo di abbonamento.'},
    {question:'Accendere una candela pubblica qualcosa?',answer:'No. La candela virtuale è gratuita e rimane soltanto nel browser di quel dispositivo.'},
    {question:'Come posso segnalare un errore o un problema relativo ai diritti?',answer:'Usa la pagina Correzioni e indica l’indirizzo esatto della pagina, il problema e una fonte affidabile. Non pubblicare informazioni personali riservate.'}
   ]
  },
  corrections:{
   eyebrow:'Revisione editoriale trasparente',title:'Correzioni e richieste relative ai diritti',
   intro:'Aiutaci a correggere una data, un nome, una traduzione, una fonte, un collegamento o una questione relativa ai diritti, mantenendo una traccia editoriale riproducibile.',
   sections:[
    {title:'Cosa includere',body:['Indica la pagina esatta di Santos do Dia, descrivi ciò che non è corretto e fornisci la fonte ufficiale o ad alta autorevolezza più solida disponibile. Per le richieste relative ai diritti, spiega il tuo rapporto con il materiale.'],items:['Pagina o URL API esatto','Fatto, traduzione, collegamento o elemento multimediale specifico','Fonte di supporto e correzione proposta']},
    {title:'Cosa succede dopo',body:['La segnalazione viene verificata nel contesto della fonte e della tradizione. Le modifiche accettate vengono registrate in GitHub, passano gli stessi controlli di qualità delle altre modifiche e restano verificabili.']},
    {title:'Proteggi i dati personali',body:['Le issue di GitHub sono pubbliche. Non includere recapiti privati, credenziali, informazioni sanitarie o altri dati personali sensibili.']}
   ]
  }
 }
};

import type { Metadata } from 'next';
import Link from 'next/link';
import { requestPublicLocale } from '../../lib/request-public-locale';

const content = {
  en: {
    title: 'About Santos do Dia',
    description: 'How Santos do Dia builds a multilingual Christian calendar with traceable sources, Church-specific dates and human editorial safeguards.',
    eyebrow: 'Independent Christian reference project',
    intro: 'Santos do Dia helps people understand who and what is commemorated on a given day without flattening the differences between Christian Churches, rites, jurisdictions and calendar systems.',
    sections: [
      ['What makes the service useful', 'The same person or feast can be observed on different dates by different Churches. Santos do Dia keeps those differences explicit, connects them to a stable identity, presents names in the user’s language when reviewed data exists, and makes the same information available through pages, search, JSON APIs and ICS calendar feeds.'],
      ['Sources and editorial method', 'Official Church and jurisdictional sources have priority for liturgical claims. Automated agents may discover, normalize and stage candidate information, but publication is constrained by source authority, identity checks, linguistic review and reproducible quality gates. Source material is referenced rather than silently copied.'],
      ['Corrections and transparency', 'Dates, names and Church practice can change. Corrections are checked against the strongest available source and recorded through the same auditable workflow used for other changes. The project is independent and is not an official organ of any Church.'],
      ['Free access and sustainability', 'The calendar, search, public API and ICS feeds are designed to remain broadly accessible. Advertising may help support hosting and maintenance, but advertising does not determine editorial inclusion, ranking, Church coverage or the content of a saint profile.'],
    ],
    corrections: 'Report a correction', sources: 'See sources and methodology', advertising: 'Advertising policy',
  },
  pt: {
    title: 'Sobre o Santos do Dia',
    description: 'Como o Santos do Dia constrói um calendário cristão multilingue com fontes rastreáveis, datas próprias de cada Igreja e revisão editorial.',
    eyebrow: 'Projeto cristão de referência independente',
    intro: 'O Santos do Dia ajuda a perceber quem e o que é celebrado em cada dia sem apagar as diferenças entre Igrejas cristãs, ritos, jurisdições e sistemas de calendário.',
    sections: [
      ['O que torna o serviço útil', 'A mesma pessoa ou festa pode ser celebrada em datas diferentes por Igrejas diferentes. O Santos do Dia preserva essas diferenças, liga cada celebração a uma identidade estável, apresenta os nomes no idioma do utilizador quando existe informação revista e disponibiliza a mesma informação em páginas, pesquisa, APIs JSON e calendários ICS.'],
      ['Fontes e método editorial', 'As fontes oficiais das Igrejas e jurisdições têm prioridade para afirmações litúrgicas. Agentes automáticos podem descobrir, normalizar e colocar informação candidata em staging, mas a publicação depende da autoridade da fonte, validação de identidade, revisão linguística e controlos de qualidade reproduzíveis. O material das fontes é referenciado, não copiado silenciosamente.'],
      ['Correções e transparência', 'Datas, nomes e práticas eclesiais podem mudar. As correções são verificadas perante a fonte mais forte disponível e registadas no mesmo processo auditável das restantes alterações. O projeto é independente e não é um órgão oficial de qualquer Igreja.'],
      ['Acesso gratuito e sustentabilidade', 'O calendário, a pesquisa, a API pública e os feeds ICS foram concebidos para permanecer amplamente acessíveis. A publicidade pode contribuir para alojamento e manutenção, mas não determina inclusão editorial, ordenação, cobertura de Igrejas ou conteúdo de perfis de santos.'],
    ],
    corrections: 'Comunicar uma correção', sources: 'Ver fontes e metodologia', advertising: 'Política de publicidade',
  },
  es: {
    title: 'Sobre Santos do Dia',
    description: 'Cómo Santos do Dia construye un calendario cristiano multilingüe con fuentes trazables, fechas propias de cada Iglesia y controles editoriales.',
    eyebrow: 'Proyecto cristiano de referencia independiente',
    intro: 'Santos do Dia ayuda a entender quién y qué se conmemora cada día sin borrar las diferencias entre Iglesias cristianas, ritos, jurisdicciones y sistemas de calendario.',
    sections: [
      ['Qué hace útil el servicio', 'La misma persona o fiesta puede celebrarse en fechas distintas según la Iglesia. Santos do Dia conserva esas diferencias, las conecta con identidades estables, muestra nombres revisados en el idioma del usuario y ofrece la misma información mediante páginas, búsqueda, API JSON y calendarios ICS.'],
      ['Fuentes y método editorial', 'Las fuentes oficiales de Iglesias y jurisdicciones tienen prioridad para las afirmaciones litúrgicas. Los agentes automáticos pueden descubrir, normalizar y preparar información candidata, pero la publicación depende de autoridad de fuente, controles de identidad, revisión lingüística y pruebas reproducibles.'],
      ['Correcciones y transparencia', 'Las fechas, nombres y prácticas eclesiales pueden cambiar. Las correcciones se contrastan con la mejor fuente disponible y quedan registradas en un proceso auditable. El proyecto es independiente y no es un órgano oficial de ninguna Iglesia.'],
      ['Acceso gratuito y sostenibilidad', 'El calendario, la búsqueda, la API pública y los feeds ICS están pensados para seguir siendo ampliamente accesibles. La publicidad puede financiar alojamiento y mantenimiento, pero no determina la inclusión editorial ni el contenido.'],
    ],
    corrections: 'Comunicar una corrección', sources: 'Ver fuentes y metodología', advertising: 'Política de publicidad',
  },
  it: {
    title: 'Informazioni su Santos do Dia',
    description: 'Come Santos do Dia costruisce un calendario cristiano multilingue con fonti tracciabili, date specifiche per Chiesa e controlli editoriali.',
    eyebrow: 'Progetto cristiano di riferimento indipendente',
    intro: 'Santos do Dia aiuta a capire chi e che cosa viene commemorato ogni giorno senza cancellare le differenze tra Chiese cristiane, riti, giurisdizioni e sistemi di calendario.',
    sections: [
      ['Perché il servizio è utile', 'La stessa persona o festa può essere osservata in date diverse da Chiese diverse. Santos do Dia conserva queste differenze, le collega a identità stabili, mostra i nomi revisionati nella lingua dell’utente e distribuisce le stesse informazioni tramite pagine, ricerca, API JSON e calendari ICS.'],
      ['Fonti e metodo editoriale', 'Le fonti ufficiali delle Chiese e delle giurisdizioni hanno priorità per le affermazioni liturgiche. Gli agenti automatici possono scoprire, normalizzare e preparare informazioni candidate, ma la pubblicazione dipende dall’autorità della fonte, dai controlli di identità, dalla revisione linguistica e da verifiche riproducibili.'],
      ['Correzioni e trasparenza', 'Date, nomi e prassi ecclesiali possono cambiare. Le correzioni vengono confrontate con la fonte più autorevole disponibile e registrate nello stesso processo verificabile delle altre modifiche. Il progetto è indipendente e non è un organo ufficiale di alcuna Chiesa.'],
      ['Accesso gratuito e sostenibilità', 'Calendario, ricerca, API pubblica e feed ICS sono progettati per restare ampiamente accessibili. La pubblicità può sostenere hosting e manutenzione, ma non determina inclusione editoriale, ordine o contenuto dei profili.'],
    ],
    corrections: 'Segnala una correzione', sources: 'Vedi fonti e metodologia', advertising: 'Politica pubblicitaria',
  },
} as const;

type PublicKey = keyof typeof content;
function key(locale: string): PublicKey { return locale === 'pt' || locale === 'es' || locale === 'it' ? locale : 'en'; }

export async function generateMetadata(): Promise<Metadata> {
  const copy = content[key(await requestPublicLocale())];
  return { title: copy.title, description: copy.description, alternates: { canonical: '/about' } };
}

export default async function AboutPage() {
  const copy = content[key(await requestPublicLocale())];
  return <div className="page-stack institutional-page">
    <section className="page-hero compact-hero institutional-hero"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div><div className="hero-symbol" aria-hidden="true">✦</div></section>
    <section className="institutional-grid">{copy.sections.map(([title, body]) => <article className="institutional-card" key={title}><h2>{title}</h2><p>{body}</p></article>)}</section>
    <section className="correction-action"><Link className="btn btn-primary" href="/sources">{copy.sources}</Link><Link className="btn btn-secondary" href="/corrections">{copy.corrections}</Link><Link className="text-link" href="/advertising">{copy.advertising} →</Link></section>
  </div>;
}

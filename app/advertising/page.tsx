import type { Metadata } from 'next';
import Link from 'next/link';
import { requestPublicLocale } from '../../lib/request-public-locale';

const content = {
  en: {
    title: 'Advertising and editorial independence',
    description: 'How Santos do Dia may use Google AdSense while protecting editorial independence, sensitive religious preferences and user experience.',
    eyebrow: 'Sustainability without changing the mission',
    intro: 'Advertising may support hosting, maintenance and editorial work. The advertising layer is separated from Christian-tradition preferences, editorial decisions and the core daily experience.',
    sections: [
      ['How advertising is placed', 'The site provides a responsive banner after the main daily content and a desktop-only lateral rail. Google AdSense may also manage Auto ads after approval, with page exclusions for utilities, Live/video, legal/privacy and low-value surfaces.'],
      ['Where ads do not belong', 'We do not place manual ad units inside the Vatican live player, next to video controls, search/calendar controls, privacy or legal pages, or minimal saint profiles without substantive editorial content. This reduces accidental-click risk and keeps the product usable.'],
      ['Privacy and religious information', 'When Google AdSense is active, Google and approved ad technology providers may process cookies, local storage, web beacons, IP addresses and similar data for ad delivery and measurement. Santos do Dia does not use the selected Christian tradition, virtual-candle activity or devotional choices to build advertising profiles or intentionally transmit them to Google for ad targeting.'],
      ['Consent and choice', 'For visitors in the EEA, United Kingdom and Switzerland, advertising is activated with a Google-certified consent management platform where required. Users can refuse or manage consent and later reopen their privacy choices.'],
      ['Editorial independence', 'Advertisers do not buy inclusion, ranking, feast dates, Church coverage, profile wording or source selection. Advertising is visually labelled and separated from editorial content.'],
    ],
    privacy: 'Privacy policy', about: 'About the project',
  },
  pt: {
    title: 'Publicidade e independência editorial',
    description: 'Como o Santos do Dia pode usar Google AdSense protegendo a independência editorial, preferências religiosas sensíveis e a experiência do utilizador.',
    eyebrow: 'Sustentabilidade sem alterar a missão',
    intro: 'A publicidade pode contribuir para alojamento, manutenção e trabalho editorial. A camada publicitária é separada das preferências de tradição cristã, das decisões editoriais e da experiência diária principal.',
    sections: [
      ['Como a publicidade é colocada', 'O site dispõe de um banner responsivo depois do conteúdo diário principal e de uma coluna publicitária lateral apenas em ecrãs largos. Depois da aprovação, o Google AdSense pode também gerir Auto Ads, mantendo exclusões para ferramentas, Live/vídeo, páginas legais e de privacidade e superfícies de baixo valor editorial.'],
      ['Onde não colocamos anúncios', 'Não colocamos unidades manuais dentro do direto do Vaticano, junto de controlos de vídeo, de pesquisa ou calendário, em páginas de privacidade e legais, nem em perfis mínimos de santos sem conteúdo editorial substancial. Isto reduz o risco de cliques acidentais e preserva a utilização do site.'],
      ['Privacidade e informação religiosa', 'Quando o Google AdSense estiver ativo, a Google e fornecedores de tecnologia publicitária aprovados podem tratar cookies, armazenamento local, web beacons, endereços IP e dados semelhantes para apresentação e medição de anúncios. O Santos do Dia não usa a tradição cristã selecionada, a atividade de velas virtuais ou escolhas devocionais para criar perfis publicitários nem as transmite intencionalmente à Google para segmentação.'],
      ['Consentimento e escolha', 'Para visitantes no EEE, Reino Unido e Suíça, a publicidade é ativada com uma plataforma de gestão de consentimento certificada pela Google, quando aplicável. O utilizador pode recusar ou gerir o consentimento e reabrir posteriormente as suas escolhas de privacidade.'],
      ['Independência editorial', 'Os anunciantes não compram inclusão, ordenação, datas de celebração, cobertura de Igrejas, redação de perfis ou escolha de fontes. A publicidade é identificada visualmente e separada do conteúdo editorial.'],
    ],
    privacy: 'Política de privacidade', about: 'Sobre o projeto',
  },
  es: {
    title: 'Publicidad e independencia editorial',
    description: 'Cómo Santos do Dia puede utilizar Google AdSense protegiendo la independencia editorial, las preferencias religiosas sensibles y la experiencia del usuario.',
    eyebrow: 'Sostenibilidad sin cambiar la misión',
    intro: 'La publicidad puede ayudar a financiar alojamiento, mantenimiento y trabajo editorial. La capa publicitaria está separada de las preferencias de tradición cristiana y de las decisiones editoriales.',
    sections: [
      ['Cómo se coloca la publicidad', 'El sitio dispone de un banner adaptable después del contenido diario principal y de una columna lateral solo en pantallas anchas. Tras la aprobación, Google AdSense también puede gestionar Auto ads, manteniendo exclusiones para herramientas, Live/vídeo, páginas legales y superficies de bajo valor editorial.'],
      ['Dónde no colocamos anuncios', 'No colocamos unidades manuales dentro del directo del Vaticano, junto a controles de vídeo, búsqueda o calendario, en páginas legales o de privacidad, ni en perfiles mínimos sin contenido editorial sustancial.'],
      ['Privacidad e información religiosa', 'Cuando Google AdSense esté activo, Google y proveedores autorizados pueden tratar cookies, almacenamiento local, balizas web, direcciones IP y datos similares para servir y medir anuncios. Santos do Dia no utiliza la tradición seleccionada, las velas virtuales ni opciones devocionales para crear perfiles publicitarios.'],
      ['Consentimiento y elección', 'Para visitantes del EEE, Reino Unido y Suiza, la publicidad se activa con una plataforma de gestión de consentimiento certificada por Google cuando sea necesario. Los usuarios pueden rechazar, gestionar y revocar sus opciones.'],
      ['Independencia editorial', 'Los anunciantes no compran inclusión, orden, fechas, cobertura de Iglesias, redacción de perfiles ni selección de fuentes.'],
    ],
    privacy: 'Política de privacidad', about: 'Sobre el proyecto',
  },
  it: {
    title: 'Pubblicità e indipendenza editoriale',
    description: 'Come Santos do Dia può usare Google AdSense proteggendo indipendenza editoriale, preferenze religiose sensibili ed esperienza utente.',
    eyebrow: 'Sostenibilità senza cambiare la missione',
    intro: 'La pubblicità può contribuire a hosting, manutenzione e lavoro editoriale. Il livello pubblicitario è separato dalle preferenze di tradizione cristiana e dalle decisioni editoriali.',
    sections: [
      ['Come viene posizionata la pubblicità', 'Il sito prevede un banner responsive dopo il contenuto quotidiano principale e una colonna laterale solo sugli schermi ampi. Dopo l’approvazione, Google AdSense può anche gestire Auto ads, mantenendo esclusioni per strumenti, Live/video, pagine legali e superfici con scarso valore editoriale.'],
      ['Dove non inseriamo annunci', 'Non inseriamo unità manuali nel live del Vaticano, accanto a controlli video, ricerca o calendario, nelle pagine legali o privacy, né nei profili minimi senza contenuto editoriale sostanziale.'],
      ['Privacy e informazioni religiose', 'Quando Google AdSense è attivo, Google e fornitori pubblicitari approvati possono trattare cookie, archiviazione locale, web beacon, indirizzi IP e dati simili per erogare e misurare annunci. Santos do Dia non usa la tradizione selezionata, le candele virtuali o le scelte devozionali per creare profili pubblicitari.'],
      ['Consenso e scelta', 'Per i visitatori nel SEE, nel Regno Unito e in Svizzera, la pubblicità viene attivata con una piattaforma di gestione del consenso certificata da Google quando richiesto. Gli utenti possono rifiutare, gestire e revocare le proprie scelte.'],
      ['Indipendenza editoriale', 'Gli inserzionisti non acquistano inclusione, ordine, date, copertura delle Chiese, testo dei profili o selezione delle fonti.'],
    ],
    privacy: 'Informativa sulla privacy', about: 'Informazioni sul progetto',
  },
} as const;

type PublicKey = keyof typeof content;
function key(locale: string): PublicKey { return locale === 'pt' || locale === 'es' || locale === 'it' ? locale : 'en'; }

export async function generateMetadata(): Promise<Metadata> {
  const copy = content[key(await requestPublicLocale())];
  return { title: copy.title, description: copy.description, alternates: { canonical: '/advertising' }, robots: { index: true, follow: true } };
}

export default async function AdvertisingPage() {
  const copy = content[key(await requestPublicLocale())];
  return <div className="page-stack institutional-page">
    <section className="page-hero compact-hero institutional-hero"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div><div className="hero-symbol" aria-hidden="true">¤</div></section>
    <section className="institutional-grid">{copy.sections.map(([title, body]) => <article className="institutional-card" key={title}><h2>{title}</h2><p>{body}</p></article>)}</section>
    <section className="correction-action"><Link className="btn btn-primary" href="/privacy">{copy.privacy}</Link><Link className="text-link" href="/about">{copy.about} →</Link></section>
  </div>;
}

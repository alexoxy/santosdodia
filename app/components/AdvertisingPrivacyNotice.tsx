'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

const copy = {
  en: {
    title: 'Advertising and consent',
    body: 'Santos do Dia is prepared to use Google AdSense, but advertising may be disabled or limited by page. When advertising is active, Google and approved advertising technology providers may use cookies, local storage, web beacons, IP addresses and similar signals to serve and measure ads. In the EEA, United Kingdom and Switzerland, consent choices are collected through a Google-certified consent management platform where required.',
    sensitive: 'Your selected Christian tradition, virtual-candle activity and devotional choices are not used by Santos do Dia to build advertising profiles and are not intentionally sent to Google for ad targeting.',
    link: 'Advertising policy',
  },
  pt: {
    title: 'Publicidade e consentimento',
    body: 'O Santos do Dia está preparado para usar Google AdSense, mas a publicidade pode estar desativada ou limitada por página. Quando estiver ativa, a Google e fornecedores de tecnologia publicitária aprovados podem utilizar cookies, armazenamento local, web beacons, endereços IP e sinais semelhantes para apresentar e medir anúncios. No EEE, Reino Unido e Suíça, as escolhas de consentimento são recolhidas através de uma plataforma de gestão de consentimento certificada pela Google, quando aplicável.',
    sensitive: 'A tradição cristã escolhida, a atividade das velas virtuais e as opções devocionais não são usadas pelo Santos do Dia para criar perfis publicitários e não são intencionalmente enviadas à Google para segmentação de anúncios.',
    link: 'Política de publicidade',
  },
  es: {
    title: 'Publicidad y consentimiento',
    body: 'Santos do Dia está preparado para utilizar Google AdSense, aunque la publicidad puede estar desactivada o limitada según la página. Cuando esté activa, Google y proveedores de tecnología publicitaria autorizados pueden usar cookies, almacenamiento local, balizas web, direcciones IP y señales similares para mostrar y medir anuncios. En el EEE, Reino Unido y Suiza, las opciones de consentimiento se recogen mediante una plataforma de gestión de consentimiento certificada por Google cuando sea necesario.',
    sensitive: 'La tradición cristiana seleccionada, las velas virtuales y las opciones devocionales no son utilizadas por Santos do Dia para crear perfiles publicitarios ni se envían intencionadamente a Google para segmentar anuncios.',
    link: 'Política de publicidad',
  },
  it: {
    title: 'Pubblicità e consenso',
    body: 'Santos do Dia è predisposto per utilizzare Google AdSense, ma la pubblicità può essere disattivata o limitata in base alla pagina. Quando è attiva, Google e i fornitori di tecnologia pubblicitaria approvati possono usare cookie, archiviazione locale, web beacon, indirizzi IP e segnali simili per pubblicare e misurare gli annunci. Nel SEE, nel Regno Unito e in Svizzera, le scelte di consenso vengono raccolte tramite una piattaforma di gestione del consenso certificata da Google quando richiesto.',
    sensitive: 'La tradizione cristiana selezionata, le candele virtuali e le scelte devozionali non sono utilizzate da Santos do Dia per creare profili pubblicitari e non vengono intenzionalmente inviate a Google per il targeting degli annunci.',
    link: 'Politica pubblicitaria',
  },
} as const;

export default function AdvertisingPrivacyNotice() {
  const { locale } = useLanguage();
  const text = copy[locale === 'pt' || locale === 'es' || locale === 'it' ? locale : 'en'];
  return (
    <section className="institutional-grid advertising-privacy-notice" aria-labelledby="advertising-privacy-title">
      <article className="institutional-card">
        <h2 id="advertising-privacy-title">{text.title}</h2>
        <p>{text.body}</p>
        <p>{text.sensitive}</p>
        <Link className="text-link" href="/advertising">{text.link} →</Link>
      </article>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

const copy = {
  en: {
    localTitle: 'Browser-local preferences and saved saints',
    localBody: 'In addition to the language, Christian-tradition and virtual-candle settings listed above, Santos do Dia stores your browser timezone and any saints you choose to save on this device. These values stay in your browser and are used to keep “Today” aligned with your local civil date and to restore your saved list.',
    localItems: ['Timezone preference: sdd-timezone', 'Saved saints: sdd-saved-saints-v1'],
    title: 'Advertising and consent',
    body: 'Santos do Dia is prepared to use Google AdSense, but advertising may be disabled or limited by page. When advertising is active, Google and approved advertising technology providers may use cookies, local storage, web beacons, IP addresses and similar signals to serve and measure ads. In the EEA, United Kingdom and Switzerland, consent choices are collected through a Google-certified consent management platform where required.',
    sensitive: 'Your selected Christian tradition, virtual-candle activity and devotional choices are not used by Santos do Dia to build advertising profiles and are not intentionally sent to Google for ad targeting.',
    link: 'Advertising policy',
  },
  pt: {
    localTitle: 'Preferências locais e santos guardados',
    localBody: 'Além das preferências de idioma e tradição cristã e das velas virtuais indicadas acima, o Santos do Dia guarda no navegador o seu fuso horário e os santos que escolher guardar neste dispositivo. Estes valores permanecem no navegador e servem para manter o “Hoje” alinhado com a sua data civil local e para recuperar a sua lista de guardados.',
    localItems: ['Fuso horário: sdd-timezone', 'Santos guardados: sdd-saved-saints-v1'],
    title: 'Publicidade e consentimento',
    body: 'O Santos do Dia está preparado para usar Google AdSense, mas a publicidade pode estar desativada ou limitada por página. Quando estiver ativa, a Google e fornecedores de tecnologia publicitária aprovados podem utilizar cookies, armazenamento local, web beacons, endereços IP e sinais semelhantes para apresentar e medir anúncios. No EEE, Reino Unido e Suíça, as escolhas de consentimento são recolhidas através de uma plataforma de gestão de consentimento certificada pela Google, quando aplicável.',
    sensitive: 'A tradição cristã escolhida, a atividade das velas virtuais e as opções devocionais não são usadas pelo Santos do Dia para criar perfis publicitários e não são intencionalmente enviadas à Google para segmentação de anúncios.',
    link: 'Política de publicidade',
  },
  es: {
    localTitle: 'Preferencias locales y santos guardados',
    localBody: 'Además del idioma, la tradición cristiana y las velas virtuales indicados arriba, Santos do Dia guarda en el navegador su zona horaria y los santos que decida guardar en este dispositivo. Estos valores permanecen en el navegador y se usan para mantener “Hoy” alineado con su fecha civil local y recuperar su lista de guardados.',
    localItems: ['Zona horaria: sdd-timezone', 'Santos guardados: sdd-saved-saints-v1'],
    title: 'Publicidad y consentimiento',
    body: 'Santos do Dia está preparado para utilizar Google AdSense, aunque la publicidad puede estar desactivada o limitada según la página. Cuando esté activa, Google y proveedores de tecnología publicitaria autorizados pueden usar cookies, almacenamiento local, balizas web, direcciones IP y señales similares para mostrar y medir anuncios. En el EEE, Reino Unido y Suiza, las opciones de consentimiento se recogen mediante una plataforma de gestión de consentimiento certificada por Google cuando sea necesario.',
    sensitive: 'La tradición cristiana seleccionada, las velas virtuales y las opciones devocionales no son utilizadas por Santos do Dia para crear perfiles publicitarios ni se envían intencionadamente a Google para segmentar anuncios.',
    link: 'Política de publicidad',
  },
  it: {
    localTitle: 'Preferenze locali e santi salvati',
    localBody: 'Oltre alla lingua, alla tradizione cristiana e alle candele virtuali indicate sopra, Santos do Dia memorizza nel browser il fuso orario e i santi che scegli di salvare su questo dispositivo. Questi valori restano nel browser e servono a mantenere “Oggi” allineato con la data civile locale e a ripristinare l’elenco dei salvati.',
    localItems: ['Fuso orario: sdd-timezone', 'Santi salvati: sdd-saved-saints-v1'],
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
    <section className="institutional-grid advertising-privacy-notice" aria-label={text.title}>
      <article className="institutional-card">
        <h2>{text.localTitle}</h2>
        <p>{text.localBody}</p>
        <ul>{text.localItems.map(item => <li key={item}>{item}</li>)}</ul>
      </article>
      <article className="institutional-card">
        <h2>{text.title}</h2>
        <p>{text.body}</p>
        <p>{text.sensitive}</p>
        <Link className="text-link" href="/advertising">{text.link} →</Link>
      </article>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { localize, type Locale } from '../../lib/i18n';
import { PILGRIMAGE_PLACES } from '../../data/pilgrimages';
import { useLanguage } from '../components/LanguageProvider';

const labels: Record<Locale, { title: string; intro: string; verified: string; official: string; live: string; calendar: string; local: string }> = {
  en: { title: 'Pilgrimages', intro: 'Verified Christian pilgrimage places, connected to saints, feasts and official sources.', verified: 'Official source', official: 'Open official site', live: 'Watch live', calendar: 'Calendar connection', local: 'Near your region' },
  pt: { title: 'Peregrinar', intro: 'Lugares cristãos de peregrinação verificados, ligados a santos, festas e fontes oficiais.', verified: 'Fonte oficial', official: 'Abrir site oficial', live: 'Ver em direto', calendar: 'Ligação ao calendário', local: 'Na sua região' },
  es: { title: 'Peregrinar', intro: 'Lugares cristianos de peregrinación verificados, vinculados a santos, fiestas y fuentes oficiales.', verified: 'Fuente oficial', official: 'Abrir sitio oficial', live: 'Ver en directo', calendar: 'Relación con el calendario', local: 'En tu región' },
  fr: { title: 'Pèlerinages', intro: 'Lieux de pèlerinage chrétiens vérifiés, reliés aux saints, fêtes et sources officielles.', verified: 'Source officielle', official: 'Ouvrir le site officiel', live: 'Voir en direct', calendar: 'Lien avec le calendrier', local: 'Dans votre région' },
  fil: { title: 'Paglalakbay-dalangin', intro: 'Mga beripikadong lugar ng Kristiyanong peregrinasyon na kaugnay ng mga santo, kapistahan at opisyal na sanggunian.', verified: 'Opisyal na sanggunian', official: 'Buksan ang opisyal na site', live: 'Manood nang live', calendar: 'Kaugnayan sa kalendaryo', local: 'Sa iyong rehiyon' },
  ru: { title: 'Паломничества', intro: 'Проверенные христианские места паломничества, связанные со святыми, праздниками и официальными источниками.', verified: 'Официальный источник', official: 'Открыть официальный сайт', live: 'Смотреть трансляцию', calendar: 'Связь с календарём', local: 'В вашем регионе' },
  sw: { title: 'Hija', intro: 'Maeneo ya hija ya Kikristo yaliyothibitishwa, yakiunganishwa na watakatifu, sikukuu na vyanzo rasmi.', verified: 'Chanzo rasmi', official: 'Fungua tovuti rasmi', live: 'Tazama moja kwa moja', calendar: 'Uhusiano na kalenda', local: 'Katika eneo lako' },
  de: { title: 'Pilgerziele', intro: 'Verifizierte christliche Pilgerorte, verknüpft mit Heiligen, Festen und offiziellen Quellen.', verified: 'Offizielle Quelle', official: 'Offizielle Website öffnen', live: 'Live ansehen', calendar: 'Kalenderbezug', local: 'In deiner Region' },
  it: { title: 'Pellegrinaggi', intro: 'Luoghi di pellegrinaggio cristiani verificati, collegati a santi, feste e fonti ufficiali.', verified: 'Fonte ufficiale', official: 'Apri il sito ufficiale', live: 'Guarda in diretta', calendar: 'Collegamento al calendario', local: 'Nella tua regione' },
  pl: { title: 'Pielgrzymki', intro: 'Zweryfikowane chrześcijańskie miejsca pielgrzymkowe powiązane ze świętymi, świętami i oficjalnymi źródłami.', verified: 'Oficjalne źródło', official: 'Otwórz stronę oficjalną', live: 'Oglądaj na żywo', calendar: 'Powiązanie z kalendarzem', local: 'W twoim regionie' }
};

export default function PilgrimagesPage() {
  const { locale, country } = useLanguage();
  const copy = labels[locale];
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const places = [...PILGRIMAGE_PLACES].sort((a, b) => Number(b.countryCode === country) - Number(a.countryCode === country));

  return <div className="page-stack pilgrimage-page">
    <section className="product-page-heading">
      <span className="eyebrow">Worldwide · {copy.verified}</span>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
    </section>

    <section className="pilgrimage-grid" aria-label={copy.title}>
      {places.map(place => <article className="pilgrimage-card" key={place.id}>
        <div className="pilgrimage-card-topline">
          <span>{place.countryCode === country ? copy.local : copy.verified}</span>
          <span>{regionNames.of(place.countryCode) ?? place.countryCode}</span>
        </div>
        <h2>{localize(place.names, locale)}</h2>
        <p className="pilgrimage-locality">{place.locality}</p>
        {place.calendarRelation ? <p className="pilgrimage-calendar"><strong>{copy.calendar}:</strong> {place.calendarRelation}</p> : null}
        <div className="button-row pilgrimage-actions">
          <a className="btn btn-primary" href={place.sourceUrl} rel="noreferrer" target="_blank">{copy.official}</a>
          {place.liveUrl ? <a className="btn btn-secondary" href={place.liveUrl} rel="noreferrer" target="_blank">{copy.live}</a> : null}
        </div>
      </article>)}
    </section>

    <section className="subscription-strip compact-product-strip">
      <div>
        <span className="eyebrow">Calendar → place → celebration</span>
        <h2>{copy.calendar}</h2>
      </div>
      <Link className="btn btn-secondary" href="/calendar">Calendar</Link>
    </section>
  </div>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { CHURCHES } from '../../data/knowledge/churches';
import { jurisdictionsForChurch } from '../../data/knowledge/jurisdictions';
import { churchPath, jurisdictionPath, localizedFieldValue } from '../../lib/knowledge/routes';
import { serverLocale } from '../../lib/server-locale';
import { SITE_ORIGIN } from '../../lib/site';
import { serializeStructuredData } from '../../lib/structured-data';

const copy = {
  en: { title: 'Christian Churches and liturgical traditions', intro: 'Explore how different Christian Churches organise their calendars, jurisdictions and celebrations.', eyebrow: 'Churches · traditions · calendars', directory: 'Knowledge directory', represented: 'Churches and traditions represented', jurisdictions: 'jurisdictions', open: 'Open Church profile', browse: 'Browse the hierarchy', modelled: 'Jurisdictions already modelled' },
  pt: { title: 'Igrejas cristãs e tradições litúrgicas', intro: 'Explore como diferentes Igrejas cristãs organizam os seus calendários, jurisdições e celebrações.', eyebrow: 'Igrejas · tradições · calendários', directory: 'Diretório de conhecimento', represented: 'Igrejas e tradições representadas', jurisdictions: 'jurisdições', open: 'Abrir perfil da Igreja', browse: 'Explorar a hierarquia', modelled: 'Jurisdições já modeladas' },
  es: { title: 'Iglesias cristianas y tradiciones litúrgicas', intro: 'Explore cómo distintas Iglesias cristianas organizan sus calendarios, jurisdicciones y celebraciones.', eyebrow: 'Iglesias · tradiciones · calendarios', directory: 'Directorio de conocimiento', represented: 'Iglesias y tradiciones representadas', jurisdictions: 'jurisdicciones', open: 'Abrir perfil de la Iglesia', browse: 'Explorar la jerarquía', modelled: 'Jurisdicciones ya modeladas' },
  fr: { title: 'Églises chrétiennes et traditions liturgiques', intro: 'Découvrez comment différentes Églises chrétiennes organisent leurs calendriers, juridictions et célébrations.', eyebrow: 'Églises · traditions · calendriers', directory: 'Répertoire de connaissances', represented: 'Églises et traditions représentées', jurisdictions: 'juridictions', open: 'Ouvrir le profil de l’Église', browse: 'Explorer la hiérarchie', modelled: 'Juridictions déjà modélisées' }
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  return {
    title: text.title,
    description: text.intro,
    alternates: { canonical: '/churches' }
  };
}

export default async function ChurchesPage() {
  const locale = await serverLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: text.title,
    url: `${SITE_ORIGIN}/churches`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: CHURCHES.map((church, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_ORIGIN}${churchPath(church)}`,
        name: localizedFieldValue(church.name, locale)
      }))
    }
  };

  return <div className="page-stack">
    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.intro}</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    <section className="feature-section">
      <div className="section-heading">
        <div><span className="eyebrow">{text.directory}</span><h2>{CHURCHES.length} {text.represented}</h2></div>
      </div>
      <div className="feature-grid">
        {CHURCHES.map(church => {
          const jurisdictions = jurisdictionsForChurch(church.id);
          return <article className="feature-card" key={church.id}>
            <span className="feature-number">{church.family.replaceAll('-', ' ')}</span>
            <h3>{localizedFieldValue(church.name, locale)}</h3>
            <p>{church.calendarSystems.map(value => value.replaceAll('-', ' ')).join(' · ')}</p>
            <div className="tag-row">
              <span>{jurisdictions.length} {text.jurisdictions}</span>
              {church.calendarSystems.slice(0, 2).map(calendar => <span key={calendar}>{calendar}</span>)}
            </div>
            <Link className="text-link" href={churchPath(church)}>{text.open} →</Link>
          </article>;
        })}
      </div>
    </section>

    <section className="message-card">
      <span className="eyebrow">{text.browse}</span>
      <h2>{text.modelled}</h2>
      <div className="tag-row">
        {CHURCHES.flatMap(church => jurisdictionsForChurch(church.id)).map(jurisdiction =>
          <Link key={jurisdiction.id} href={jurisdictionPath(jurisdiction)}>{localizedFieldValue(jurisdiction.name, locale)}</Link>
        )}
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structured) }} />
  </div>;
}

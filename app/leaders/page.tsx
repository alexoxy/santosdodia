import type { Metadata } from 'next';
import Link from 'next/link';
import { ECCLESIASTICAL_OFFICES, ECCLESIASTICAL_PEOPLE } from '../../data/knowledge/ecclesiastical-state';
import { jurisdictionById } from '../../data/knowledge/jurisdictions';
import { churchById } from '../../data/knowledge/churches';
import { officeLabel } from '../../lib/knowledge/ecclesiastical-display';
import { localizedFieldValue, personPath } from '../../lib/knowledge/routes';
import { serverLocale } from '../../lib/server-locale';
import { SITE_ORIGIN } from '../../lib/site';

export const dynamic = 'force-dynamic';

const copy = {
  en: { title: 'Christian leaders and current office holders', intro: 'Verified current ecclesiastical roles published from official Church and jurisdiction sources.', eyebrow: 'Churches · jurisdictions · offices', open: 'Open leader profile', directory: 'Verified directory' },
  pt: { title: 'Líderes cristãos e titulares atuais', intro: 'Cargos eclesiais atuais verificados a partir de fontes oficiais das Igrejas e jurisdições.', eyebrow: 'Igrejas · jurisdições · cargos', open: 'Abrir perfil do líder', directory: 'Diretório verificado' },
  es: { title: 'Líderes cristianos y titulares actuales', intro: 'Cargos eclesiásticos actuales verificados a partir de fuentes oficiales de Iglesias y jurisdicciones.', eyebrow: 'Iglesias · jurisdicciones · cargos', open: 'Abrir perfil del líder', directory: 'Directorio verificado' },
  fr: { title: 'Responsables chrétiens et titulaires actuels', intro: 'Fonctions ecclésiales actuelles vérifiées à partir de sources officielles des Églises et juridictions.', eyebrow: 'Églises · juridictions · fonctions', open: 'Ouvrir le profil du responsable', directory: 'Répertoire vérifié' }
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  return { title: text.title, description: text.intro, alternates: { canonical: '/leaders' } };
}

export default async function LeadersPage() {
  const locale = await serverLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const rows = ECCLESIASTICAL_PEOPLE.map(person => {
    const offices = ECCLESIASTICAL_OFFICES.filter(office => office.personId === person.id && office.status === 'active');
    return { person, offices };
  }).filter(row => row.offices.length);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: text.title,
    url: `${SITE_ORIGIN}/leaders`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: rows.map((row, index) => ({
        '@type': 'ListItem', position: index + 1, url: `${SITE_ORIGIN}${personPath(row.person)}`,
        item: { '@type': 'Person', name: localizedFieldValue(row.person.name, locale) }
      }))
    }
  };

  return <div className="page-stack">
    <section className="page-hero compact-hero"><div><span className="eyebrow">{text.eyebrow}</span><h1>{text.title}</h1><p>{text.intro}</p></div><div className="hero-symbol" aria-hidden="true">✦</div></section>
    <section className="search-card">
      <div className="section-heading compact"><div><span className="eyebrow">{text.directory}</span><h2>{rows.length}</h2></div></div>
      <div className="result-grid">{rows.map(({ person, offices }) => <article className="result-card" key={person.id}>
        <div className="result-meta"><span>{offices.length}</span><span>verified</span></div>
        <h2>{localizedFieldValue(person.name, locale)}</h2>
        {offices.map(office => {
          const jurisdiction = jurisdictionById(office.jurisdictionId);
          const church = jurisdiction ? churchById(jurisdiction.churchId) : undefined;
          return <p key={office.id}>{officeLabel(office.officeType, locale)}{jurisdiction ? ` · ${localizedFieldValue(jurisdiction.name, locale)}` : ''}{church ? ` · ${localizedFieldValue(church.name, locale)}` : ''}</p>;
        })}
        <Link className="text-link" href={personPath(person)}>{text.open} →</Link>
      </article>)}</div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

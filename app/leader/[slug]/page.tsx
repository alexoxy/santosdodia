import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ECCLESIASTICAL_OFFICES, ECCLESIASTICAL_PEOPLE } from '../../../data/knowledge/ecclesiastical-state';
import { jurisdictionById } from '../../../data/knowledge/jurisdictions';
import { churchById } from '../../../data/knowledge/churches';
import { officeLabel } from '../../../lib/knowledge/ecclesiastical-display';
import { churchPath, entitySlug, jurisdictionPath, localizedFieldValue, personBySlug, personPath } from '../../../lib/knowledge/routes';
import { serverLocale } from '../../../lib/server-locale';
import { SITE_ORIGIN } from '../../../lib/site';

const copy = {
  en: { currentRoles: 'Current ecclesiastical roles', born: 'Born', appointed: 'Appointed', installed: 'Installed or enthroned', church: 'Church', jurisdiction: 'Jurisdiction', verified: 'Officially verified record', intro: 'Current ecclesiastical offices represented in the Santos do Dia knowledge base.' },
  pt: { currentRoles: 'Cargos eclesiais atuais', born: 'Nascimento', appointed: 'Nomeado ou eleito', installed: 'Instalado ou entronizado', church: 'Igreja', jurisdiction: 'Jurisdição', verified: 'Registo verificado oficialmente', intro: 'Cargos eclesiais atuais representados na base de conhecimento do Santos do Dia.' },
  es: { currentRoles: 'Cargos eclesiásticos actuales', born: 'Nacimiento', appointed: 'Nombrado o elegido', installed: 'Instalado o entronizado', church: 'Iglesia', jurisdiction: 'Jurisdicción', verified: 'Registro verificado oficialmente', intro: 'Cargos eclesiásticos actuales representados en la base de conocimiento de Santos do Dia.' },
  fr: { currentRoles: 'Fonctions ecclésiales actuelles', born: 'Naissance', appointed: 'Nommé ou élu', installed: 'Installé ou intronisé', church: 'Église', jurisdiction: 'Juridiction', verified: 'Entrée vérifiée officiellement', intro: 'Fonctions ecclésiales actuelles représentées dans la base de connaissances de Santos do Dia.' }
} as const;

export function generateStaticParams() {
  return ECCLESIASTICAL_PEOPLE.map(person => ({ slug: entitySlug(person.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, serverLocale()]);
  const person = personBySlug(slug);
  if (!person) return {};
  const name = localizedFieldValue(person.name, locale);
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const description = `${name}: ${text.intro}`;
  return {
    title: name,
    description,
    alternates: { canonical: personPath(person) },
    openGraph: { type: 'profile', title: name, description, url: `${SITE_ORIGIN}${personPath(person)}` }
  };
}

export default async function LeaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale] = await Promise.all([params, serverLocale()]);
  const person = personBySlug(slug);
  if (!person) notFound();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const name = localizedFieldValue(person.name, locale);
  const offices = ECCLESIASTICAL_OFFICES.filter(office => office.personId === person.id && office.status === 'active');
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const roles = offices.map(office => {
    const jurisdiction = jurisdictionById(office.jurisdictionId);
    const church = jurisdiction ? churchById(jurisdiction.churchId) : undefined;
    return { office, jurisdiction, church };
  }).filter(role => role.jurisdiction && role.church);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_ORIGIN}${personPath(person)}#person`,
    name,
    url: `${SITE_ORIGIN}${personPath(person)}`,
    birthDate: person.birthDate,
    jobTitle: roles.map(role => officeLabel(role.office.officeType, locale)),
    memberOf: roles.map(role => ({
      '@type': 'Organization',
      name: localizedFieldValue(role.jurisdiction!.name, locale),
      url: `${SITE_ORIGIN}${jurisdictionPath(role.jurisdiction!)}`
    }))
  };

  return <div className="page-stack">
    <nav className="tag-row" aria-label="Breadcrumb"><Link href="/churches">{text.church}</Link></nav>
    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{text.verified}</span>
        <h1>{name}</h1>
        <p>{text.intro}</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    {person.birthDate ? <section className="message-card"><span className="eyebrow">{text.born}</span><h2>{dateFormatter.format(new Date(`${person.birthDate}T00:00:00Z`))}</h2></section> : null}

    <section className="search-card">
      <div className="section-heading compact"><div><span className="eyebrow">{text.currentRoles}</span><h2>{text.currentRoles}</h2></div></div>
      <div className="result-grid">{roles.map(({ office, jurisdiction, church }) => <article className="result-card" key={office.id}>
        <div className="result-meta"><span>{officeLabel(office.officeType, locale)}</span><span>{office.status}</span></div>
        <h2>{localizedFieldValue(jurisdiction!.name, locale)}</h2>
        <p>{localizedFieldValue(church!.name, locale)}</p>
        <div className="tag-row">
          {office.appointedAt ? <span>{text.appointed}: {dateFormatter.format(new Date(`${office.appointedAt}T00:00:00Z`))}</span> : null}
          {office.installedAt ? <span>{text.installed}: {dateFormatter.format(new Date(`${office.installedAt}T00:00:00Z`))}</span> : null}
        </div>
        <div className="saint-preview-links">
          <Link className="text-link" href={jurisdictionPath(jurisdiction!)}>{text.jurisdiction} →</Link>
          <Link className="text-link" href={churchPath(church!)}>{text.church} →</Link>
        </div>
      </article>)}</div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

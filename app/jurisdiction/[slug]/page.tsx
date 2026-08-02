import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JURISDICTIONS, jurisdictionById } from '../../../data/knowledge/jurisdictions';
import { churchById } from '../../../data/knowledge/churches';
import { activeOfficesForJurisdiction, officeHolder } from '../../../data/knowledge/ecclesiastical-state';
import { ecclesiasticalPageCopy, officeLabel } from '../../../lib/knowledge/ecclesiastical-display';
import { jurisdictionBreadcrumbs } from '../../../lib/knowledge/jurisdiction-resolver';
import { churchPath, entitySlug, jurisdictionBySlug, jurisdictionPath, localizedFieldValue } from '../../../lib/knowledge/routes';
import { serverLocale } from '../../../lib/server-locale';
import { SITE_ORIGIN } from '../../../lib/site';

export function generateStaticParams() {
  return JURISDICTIONS.map(jurisdiction => ({ slug: entitySlug(jurisdiction.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, serverLocale()]);
  const jurisdiction = jurisdictionBySlug(slug);
  if (!jurisdiction) return {};
  const name = localizedFieldValue(jurisdiction.name, locale);
  const description = locale === 'pt'
    ? `${name}: jurisdição eclesial, Igreja, território, liderança e contexto de calendário no Santos do Dia.`
    : locale === 'es'
      ? `${name}: jurisdicción eclesiástica, Iglesia, territorio, liderazgo y contexto de calendario en Santos do Dia.`
      : locale === 'fr'
        ? `${name} : juridiction ecclésiale, Église, territoire, direction et contexte calendaire dans Santos do Dia.`
        : `${name}: ecclesiastical jurisdiction, Church, territory, leadership and calendar context in Santos do Dia.`;
  return {
    title: name,
    description,
    alternates: { canonical: jurisdictionPath(jurisdiction) },
    openGraph: { type: 'website', title: name, description, url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}` }
  };
}

export default async function JurisdictionPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale] = await Promise.all([params, serverLocale()]);
  const jurisdiction = jurisdictionBySlug(slug);
  if (!jurisdiction) notFound();
  const church = churchById(jurisdiction.churchId);
  if (!church) notFound();
  const ui = ecclesiasticalPageCopy(locale);
  const name = localizedFieldValue(jurisdiction.name, locale);
  const churchName = localizedFieldValue(church.name, locale);
  const breadcrumbs = jurisdictionBreadcrumbs(jurisdiction);
  const children = JURISDICTIONS.filter(candidate => candidate.parentJurisdictionId === jurisdiction.id);
  const parent = jurisdiction.parentJurisdictionId ? jurisdictionById(jurisdiction.parentJurisdictionId) : undefined;
  const offices = activeOfficesForJurisdiction(jurisdiction.id);
  const leaders = offices.map(office => ({ office, person: officeHolder(office) })).filter(item => item.person);
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}#organization`,
    name,
    url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}`,
    parentOrganization: parent ? {
      '@type': 'Organization',
      name: localizedFieldValue(parent.name, locale),
      url: `${SITE_ORIGIN}${jurisdictionPath(parent)}`
    } : {
      '@type': 'Organization',
      name: churchName,
      url: `${SITE_ORIGIN}${churchPath(church)}`
    },
    areaServed: jurisdiction.geography.map(scope => ({ '@type': 'AdministrativeArea', identifier: scope.code, name: scope.code })),
    member: leaders.map(({ office, person }) => ({
      '@type': 'Person',
      name: localizedFieldValue(person!.name, locale),
      jobTitle: officeLabel(office.officeType, locale)
    })),
    subOrganization: children.map(child => ({
      '@type': 'Organization',
      name: localizedFieldValue(child.name, locale),
      url: `${SITE_ORIGIN}${jurisdictionPath(child)}`
    }))
  };

  return <div className="page-stack">
    <nav className="tag-row" aria-label="Breadcrumb">
      <Link href="/churches">{ui.allChurches}</Link>
      <Link href={churchPath(church)}>{churchName}</Link>
      {breadcrumbs.slice(0, -1).map(item => <Link key={item.id} href={jurisdictionPath(item)}>{localizedFieldValue(item.name, locale)}</Link>)}
    </nav>

    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{jurisdiction.level.replaceAll('-', ' ')}</span>
        <h1>{name}</h1>
        <p>{churchName} · {jurisdiction.geography.map(scope => scope.code).join(' · ')}</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    <section className="search-card">
      <div className="section-heading compact"><div><span className="eyebrow">{ui.currentLeadership}</span><h2>{ui.currentLeadership}</h2></div></div>
      {leaders.length ? <div className="result-grid">{leaders.map(({ office, person }) => <article className="result-card" key={office.id}>
        <div className="result-meta"><span>{officeLabel(office.officeType, locale)}</span><span>{office.status}</span></div>
        <h2>{localizedFieldValue(person!.name, locale)}</h2>
        <div className="tag-row">
          {office.appointedAt ? <span>{ui.officeSince}: {dateFormatter.format(new Date(`${office.appointedAt}T00:00:00Z`))}</span> : null}
          {office.installedAt ? <span>{ui.installed}: {dateFormatter.format(new Date(`${office.installedAt}T00:00:00Z`))}</span> : null}
        </div>
      </article>)}</div> : <div className="empty-state inline"><span>✦</span><p>{ui.noLeadership}</p></div>}
    </section>

    <section className="feature-section">
      <div className="section-heading"><div><span className="eyebrow">{ui.jurisdictionContext}</span><h2>{ui.churchAndTerritory}</h2></div></div>
      <div className="feature-grid">
        <article className="feature-card">
          <span className="feature-number">01</span><h3>{churchName}</h3>
          <p>Christian tradition and calendar family.</p>
          <Link className="text-link" href={churchPath(church)}>{ui.openChurch} →</Link>
        </article>
        <article className="feature-card">
          <span className="feature-number">02</span><h3>{jurisdiction.level.replaceAll('-', ' ')}</h3>
          <p>Canonical level represented by this record.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">03</span><h3>{jurisdiction.geography.map(scope => scope.code).join(' · ')}</h3>
          <p>Geographic scope used to determine which local celebrations apply.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">04</span><h3>{children.length}</h3>
          <p>Direct child jurisdiction{children.length === 1 ? '' : 's'} currently modelled.</p>
        </article>
      </div>
    </section>

    {children.length ? <section className="search-card">
      <div className="section-heading compact"><div><span className="eyebrow">{ui.structure}</span><h2>{ui.childJurisdictions}</h2></div></div>
      <div className="result-grid">{children.map(child => <article className="result-card" key={child.id}>
        <div className="result-meta"><span>{child.level.replaceAll('-', ' ')}</span><span>{child.geography.map(scope => scope.code).join(' · ')}</span></div>
        <h2>{localizedFieldValue(child.name, locale)}</h2>
        <Link className="text-link" href={jurisdictionPath(child)}>{ui.openJurisdiction} →</Link>
      </article>)}</div>
    </section> : null}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

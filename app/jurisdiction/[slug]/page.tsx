import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JURISDICTIONS, jurisdictionById } from '../../../data/knowledge/jurisdictions';
import { churchById } from '../../../data/knowledge/churches';
import { jurisdictionBreadcrumbs } from '../../../lib/knowledge/jurisdiction-resolver';
import { churchPath, entitySlug, jurisdictionBySlug, jurisdictionPath, localizedFieldValue } from '../../../lib/knowledge/routes';
import { SITE_ORIGIN } from '../../../lib/site';

export function generateStaticParams() {
  return JURISDICTIONS.map(jurisdiction => ({ slug: entitySlug(jurisdiction.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const jurisdiction = jurisdictionBySlug(slug);
  if (!jurisdiction) return {};
  const name = localizedFieldValue(jurisdiction.name);
  const description = `${name}: ecclesiastical jurisdiction, Church, territory and calendar context in Santos do Dia.`;
  return {
    title: name,
    description,
    alternates: { canonical: jurisdictionPath(jurisdiction) },
    openGraph: { type: 'website', title: name, description, url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}` }
  };
}

export default async function JurisdictionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jurisdiction = jurisdictionBySlug(slug);
  if (!jurisdiction) notFound();
  const church = churchById(jurisdiction.churchId);
  if (!church) notFound();
  const name = localizedFieldValue(jurisdiction.name);
  const churchName = localizedFieldValue(church.name);
  const breadcrumbs = jurisdictionBreadcrumbs(jurisdiction);
  const children = JURISDICTIONS.filter(candidate => candidate.parentJurisdictionId === jurisdiction.id);
  const parent = jurisdiction.parentJurisdictionId ? jurisdictionById(jurisdiction.parentJurisdictionId) : undefined;
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}#organization`,
    name,
    url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}`,
    parentOrganization: parent ? {
      '@type': 'Organization',
      name: localizedFieldValue(parent.name),
      url: `${SITE_ORIGIN}${jurisdictionPath(parent)}`
    } : {
      '@type': 'Organization',
      name: churchName,
      url: `${SITE_ORIGIN}${churchPath(church)}`
    },
    areaServed: jurisdiction.geography.map(scope => ({ '@type': 'AdministrativeArea', identifier: scope.code, name: scope.code })),
    subOrganization: children.map(child => ({
      '@type': 'Organization',
      name: localizedFieldValue(child.name),
      url: `${SITE_ORIGIN}${jurisdictionPath(child)}`
    }))
  };

  return <div className="page-stack">
    <nav className="tag-row" aria-label="Breadcrumb">
      <Link href="/churches">Churches</Link>
      <Link href={churchPath(church)}>{churchName}</Link>
      {breadcrumbs.slice(0, -1).map(item => <Link key={item.id} href={jurisdictionPath(item)}>{localizedFieldValue(item.name)}</Link>)}
    </nav>

    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{jurisdiction.level.replaceAll('-', ' ')}</span>
        <h1>{name}</h1>
        <p>{churchName} · {jurisdiction.geography.map(scope => scope.code).join(' · ')}</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    <section className="feature-section">
      <div className="section-heading"><div><span className="eyebrow">Jurisdiction context</span><h2>Church and territory</h2></div></div>
      <div className="feature-grid">
        <article className="feature-card">
          <span className="feature-number">01</span><h3>{churchName}</h3>
          <p>Christian tradition and calendar family.</p>
          <Link className="text-link" href={churchPath(church)}>Open Church profile →</Link>
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
      <div className="section-heading compact"><div><span className="eyebrow">Structure</span><h2>Child jurisdictions</h2></div></div>
      <div className="result-grid">{children.map(child => <article className="result-card" key={child.id}>
        <div className="result-meta"><span>{child.level.replaceAll('-', ' ')}</span><span>{child.geography.map(scope => scope.code).join(' · ')}</span></div>
        <h2>{localizedFieldValue(child.name)}</h2>
        <Link className="text-link" href={jurisdictionPath(child)}>Open jurisdiction →</Link>
      </article>)}</div>
    </section> : null}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

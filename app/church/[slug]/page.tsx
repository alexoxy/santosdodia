import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CHURCHES } from '../../../data/knowledge/churches';
import { jurisdictionsForChurch } from '../../../data/knowledge/jurisdictions';
import { churchBySlug, churchPath, entitySlug, jurisdictionPath, localizedFieldValue } from '../../../lib/knowledge/routes';
import { SITE_ORIGIN } from '../../../lib/site';

export function generateStaticParams() {
  return CHURCHES.map(church => ({ slug: entitySlug(church.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const church = churchBySlug(slug);
  if (!church) return {};
  const name = localizedFieldValue(church.name);
  const description = `${name}: calendar systems, Christian tradition, jurisdictions and daily celebrations represented in Santos do Dia.`;
  return {
    title: name,
    description,
    alternates: { canonical: churchPath(church) },
    openGraph: { type: 'website', title: name, description, url: `${SITE_ORIGIN}${churchPath(church)}` }
  };
}

export default async function ChurchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = churchBySlug(slug);
  if (!church) notFound();
  const name = localizedFieldValue(church.name);
  const jurisdictions = jurisdictionsForChurch(church.id);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}${churchPath(church)}#organization`,
    name,
    url: `${SITE_ORIGIN}${churchPath(church)}`,
    sameAs: church.canonicalUrl ? [church.canonicalUrl] : undefined,
    areaServed: 'Global',
    knowsAbout: church.calendarSystems.map(calendar => `${calendar} Christian calendar`),
    subOrganization: jurisdictions.map(jurisdiction => ({
      '@type': 'Organization',
      name: localizedFieldValue(jurisdiction.name),
      url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}`
    }))
  };

  return <div className="page-stack">
    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{church.family.replaceAll('-', ' ')}</span>
        <h1>{name}</h1>
        <p>Calendar systems, jurisdictions and celebrations connected with this Christian tradition.</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    <section className="feature-section">
      <div className="section-heading"><div><span className="eyebrow">Calendar systems</span><h2>How dates are represented</h2></div></div>
      <div className="feature-grid">
        {church.calendarSystems.map((calendar, index) => <article className="feature-card" key={calendar}>
          <span className="feature-number">0{index + 1}</span>
          <h3>{calendar.replaceAll('-', ' ')}</h3>
          <p>Fixed and movable celebrations are resolved by the calendar engine associated with this tradition.</p>
        </article>)}
      </div>
    </section>

    <section className="search-card">
      <div className="section-heading compact">
        <div><span className="eyebrow">Ecclesiastical structure</span><h2>Jurisdictions</h2></div>
        <Link className="text-link" href="/churches">All Churches →</Link>
      </div>
      {jurisdictions.length ? <div className="result-grid">
        {jurisdictions.map(jurisdiction => <article className="result-card" key={jurisdiction.id}>
          <div className="result-meta"><span>{jurisdiction.level.replaceAll('-', ' ')}</span><span>{jurisdiction.geography.map(scope => scope.code).join(' · ')}</span></div>
          <h2>{localizedFieldValue(jurisdiction.name)}</h2>
          <div className="tag-row">{jurisdiction.geography.map(scope => <span key={`${scope.level}-${scope.code}`}>{scope.level}: {scope.code}</span>)}</div>
          <Link className="text-link" href={jurisdictionPath(jurisdiction)}>Open jurisdiction →</Link>
        </article>)}
      </div> : <div className="empty-state"><span>✦</span><p>Jurisdiction records are being added from official directories.</p></div>}
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

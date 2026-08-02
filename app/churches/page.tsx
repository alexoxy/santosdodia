import type { Metadata } from 'next';
import Link from 'next/link';
import { CHURCHES } from '../../data/knowledge/churches';
import { jurisdictionsForChurch } from '../../data/knowledge/jurisdictions';
import { churchPath, jurisdictionPath, localizedFieldValue } from '../../lib/knowledge/routes';
import { SITE_ORIGIN } from '../../lib/site';

export const metadata: Metadata = {
  title: 'Christian Churches and liturgical traditions',
  description: 'Explore the Christian Churches and traditions represented in Santos do Dia, their calendars, jurisdictions and daily celebrations.',
  alternates: { canonical: '/churches' }
};

export default function ChurchesPage() {
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Christian Churches and liturgical traditions',
    url: `${SITE_ORIGIN}/churches`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: CHURCHES.map((church, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_ORIGIN}${churchPath(church)}`,
        name: localizedFieldValue(church.name)
      }))
    }
  };

  return <div className="page-stack">
    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">Churches · traditions · calendars</span>
        <h1>Christian Churches and liturgical traditions</h1>
        <p>Explore how different Christian Churches organise their calendars, jurisdictions and celebrations.</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    <section className="feature-section">
      <div className="section-heading">
        <div><span className="eyebrow">Knowledge directory</span><h2>{CHURCHES.length} traditions represented</h2></div>
      </div>
      <div className="feature-grid">
        {CHURCHES.map(church => {
          const jurisdictions = jurisdictionsForChurch(church.id);
          return <article className="feature-card" key={church.id}>
            <span className="feature-number">{church.family.replaceAll('-', ' ')}</span>
            <h3>{localizedFieldValue(church.name)}</h3>
            <p>{church.calendarSystems.map(value => value.replaceAll('-', ' ')).join(' · ')}</p>
            <div className="tag-row">
              <span>{jurisdictions.length} jurisdiction{jurisdictions.length === 1 ? '' : 's'}</span>
              {church.calendarSystems.slice(0, 2).map(calendar => <span key={calendar}>{calendar}</span>)}
            </div>
            <Link className="text-link" href={churchPath(church)}>Open Church profile →</Link>
          </article>;
        })}
      </div>
    </section>

    <section className="message-card">
      <span className="eyebrow">Browse the hierarchy</span>
      <h2>Jurisdictions already modelled</h2>
      <div className="tag-row">
        {CHURCHES.flatMap(church => jurisdictionsForChurch(church.id)).map(jurisdiction =>
          <Link key={jurisdiction.id} href={jurisdictionPath(jurisdiction)}>{localizedFieldValue(jurisdiction.name)}</Link>
        )}
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CHURCHES } from '../../../data/knowledge/churches';
import { jurisdictionsForChurch } from '../../../data/knowledge/jurisdictions';
import { activeOfficesForJurisdiction, officeHolder } from '../../../data/knowledge/ecclesiastical-state';
import { ecclesiasticalPageCopy, officeLabel } from '../../../lib/knowledge/ecclesiastical-display';
import { churchBySlug, churchPath, entitySlug, jurisdictionPath, localizedFieldValue } from '../../../lib/knowledge/routes';
import { serverLocale } from '../../../lib/server-locale';
import { SITE_ORIGIN } from '../../../lib/site';

export function generateStaticParams() {
  return CHURCHES.map(church => ({ slug: entitySlug(church.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, serverLocale()]);
  const church = churchBySlug(slug);
  if (!church) return {};
  const name = localizedFieldValue(church.name, locale);
  const description = locale === 'pt'
    ? `${name}: calendários, jurisdições, liderança e celebrações cristãs representadas no Santos do Dia.`
    : locale === 'es'
      ? `${name}: calendarios, jurisdicciones, liderazgo y celebraciones cristianas representadas en Santos do Dia.`
      : locale === 'fr'
        ? `${name} : calendriers, juridictions, direction et célébrations chrétiennes dans Santos do Dia.`
        : `${name}: calendar systems, jurisdictions, leadership and Christian celebrations represented in Santos do Dia.`;
  return {
    title: name,
    description,
    alternates: { canonical: churchPath(church) },
    openGraph: { type: 'website', title: name, description, url: `${SITE_ORIGIN}${churchPath(church)}` }
  };
}

export default async function ChurchPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale] = await Promise.all([params, serverLocale()]);
  const church = churchBySlug(slug);
  if (!church) notFound();
  const ui = ecclesiasticalPageCopy(locale);
  const name = localizedFieldValue(church.name, locale);
  const jurisdictions = jurisdictionsForChurch(church.id);
  const leaders = jurisdictions.flatMap(jurisdiction => activeOfficesForJurisdiction(jurisdiction.id).map(office => ({
    jurisdiction,
    office,
    person: officeHolder(office)
  }))).filter(item => item.person);
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}${churchPath(church)}#organization`,
    name,
    url: `${SITE_ORIGIN}${churchPath(church)}`,
    sameAs: church.canonicalUrl ? [church.canonicalUrl] : undefined,
    areaServed: 'Global',
    knowsAbout: church.calendarSystems.map(calendar => `${calendar} Christian calendar`),
    member: leaders.map(({ office, person }) => ({
      '@type': 'Person',
      name: localizedFieldValue(person!.name, locale),
      jobTitle: officeLabel(office.officeType, locale)
    })),
    subOrganization: jurisdictions.map(jurisdiction => ({
      '@type': 'Organization',
      name: localizedFieldValue(jurisdiction.name, locale),
      url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}`
    }))
  };

  return <div className="page-stack">
    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{church.family.replaceAll('-', ' ')}</span>
        <h1>{name}</h1>
        <p>{locale === 'pt' ? 'Calendários, jurisdições e celebrações ligadas a esta Igreja ou tradição cristã.' : locale === 'es' ? 'Calendarios, jurisdicciones y celebraciones vinculadas a esta Iglesia o tradición cristiana.' : locale === 'fr' ? 'Calendriers, juridictions et célébrations liés à cette Église ou tradition chrétienne.' : 'Calendars, jurisdictions and celebrations connected with this Christian Church or tradition.'}</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">✦</div>
    </section>

    {leaders.length ? <section className="search-card">
      <div className="section-heading compact"><div><span className="eyebrow">{ui.currentLeadership}</span><h2>{ui.currentLeadership}</h2></div></div>
      <div className="result-grid">{leaders.map(({ jurisdiction, office, person }) => <article className="result-card" key={office.id}>
        <div className="result-meta"><span>{officeLabel(office.officeType, locale)}</span><span>{localizedFieldValue(jurisdiction.name, locale)}</span></div>
        <h2>{localizedFieldValue(person!.name, locale)}</h2>
        <div className="tag-row">
          {office.appointedAt ? <span>{ui.officeSince}: {dateFormatter.format(new Date(`${office.appointedAt}T00:00:00Z`))}</span> : null}
          {office.installedAt ? <span>{ui.installed}: {dateFormatter.format(new Date(`${office.installedAt}T00:00:00Z`))}</span> : null}
        </div>
        <Link className="text-link" href={jurisdictionPath(jurisdiction)}>{ui.openJurisdiction} →</Link>
      </article>)}</div>
    </section> : null}

    <section className="feature-section">
      <div className="section-heading"><div><span className="eyebrow">{ui.calendars}</span><h2>{ui.datesRepresented}</h2></div></div>
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
        <div><span className="eyebrow">{ui.structure}</span><h2>{ui.jurisdictions}</h2></div>
        <Link className="text-link" href="/churches">{ui.allChurches} →</Link>
      </div>
      {jurisdictions.length ? <div className="result-grid">
        {jurisdictions.map(jurisdiction => <article className="result-card" key={jurisdiction.id}>
          <div className="result-meta"><span>{jurisdiction.level.replaceAll('-', ' ')}</span><span>{jurisdiction.geography.map(scope => scope.code).join(' · ')}</span></div>
          <h2>{localizedFieldValue(jurisdiction.name, locale)}</h2>
          <div className="tag-row">{jurisdiction.geography.map(scope => <span key={`${scope.level}-${scope.code}`}>{scope.level}: {scope.code}</span>)}</div>
          <Link className="text-link" href={jurisdictionPath(jurisdiction)}>{ui.openJurisdiction} →</Link>
        </article>)}
      </div> : <div className="empty-state"><span>✦</span><p>Jurisdiction records are being added from official directories.</p></div>}
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}

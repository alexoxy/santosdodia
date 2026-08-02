import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DayView from '../../components/DayView';
import { getObservancesForDate, isValidDateISO } from '../../../data/observances';
import { SITE_ORIGIN } from '../../../lib/site';

function dateLabel(dateISO: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${dateISO}T00:00:00Z`));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  if (!isValidDateISO(date)) return { title: 'Invalid date', robots: { index: false, follow: false } };
  const label = dateLabel(date);
  const items = getObservancesForDate(date, 'en');
  const names = items.slice(0, 5).map(item => item.name);
  const description = names.length
    ? `Christian saints and feasts observed on ${label}: ${names.join(', ')}${items.length > names.length ? ', and more' : ''}.`
    : `Christian saints and feasts for ${label}, organized by Church tradition and calendar system.`;
  const title = `Saints and Christian feasts on ${label}`;
  const canonical = `/day/${date}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description }
  };
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isValidDateISO(date)) notFound();
  const label = dateLabel(date);
  const items = getObservancesForDate(date, 'en');
  const url = `${SITE_ORIGIN}/day/${date}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        url,
        name: `Saints and Christian feasts on ${label}`,
        dateCreated: date,
        mainEntity: { '@id': `${url}#observances` },
        isPartOf: { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, name: 'Santos do Dia', url: SITE_ORIGIN }
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#observances`,
        name: `Christian observances on ${label}`,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: `${SITE_ORIGIN}/saint/${item.id}`
        }))
      }
    ]
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <DayView dateISO={date} />
  </>;
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PatronageTopicView from '../../components/PatronageTopicView';
import { DISCOVERY_TOPICS, getDiscoveryTopic, getObservancesForTopic, topicDescription, topicLabel } from '../../../data/discovery';
import { serverLocale } from '../../../lib/server-locale';
import { SITE_ORIGIN } from '../../../lib/site';

export function generateStaticParams() {
  return DISCOVERY_TOPICS.filter(topic => topic.kind !== 'place').map(topic => ({ slug: topic.slug }));
}

function patronageTopic(slug: string) {
  return getDiscoveryTopic('profession', slug) ?? getDiscoveryTopic('cause', slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = patronageTopic(slug);
  if (!topic) return { title: 'Patron saint search' };
  const locale = await serverLocale();
  const title = topicLabel(topic, locale);
  const description = topicDescription(topic, locale);
  const canonical = `/patronage/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description }
  };
}

export default async function PatronagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = patronageTopic(slug);
  if (!topic) notFound();
  const locale = await serverLocale();
  const kind = topic.kind === 'profession' ? 'profession' : 'cause';
  const name = topicLabel(topic, locale);
  const description = topicDescription(topic, locale);
  const items = getObservancesForTopic(topic, new Date().getFullYear(), locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${SITE_ORIGIN}/patronage/${slug}`,
    about: { '@type': 'DefinedTerm', name, termCode: slug },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${SITE_ORIGIN}/saint/${item.id}`
      }))
    }
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <PatronageTopicView kind={kind} slug={slug} locale={locale} />
  </>;
}

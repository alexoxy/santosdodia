import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlaceTopicView from '../../components/PlaceTopicView';
import { DISCOVERY_TOPICS, getDiscoveryTopic, topicDescription, topicLabel } from '../../../data/discovery';
import { serverLocale } from '../../../lib/server-locale';
import { SITE_ORIGIN } from '../../../lib/site';
import { serializeStructuredData } from '../../../lib/structured-data';

export function generateStaticParams() {
  return DISCOVERY_TOPICS.filter(topic => topic.kind === 'place').map(topic => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = getDiscoveryTopic('place', slug);
  if (!topic) return { title: 'Saints by place' };
  const locale = await serverLocale();
  const title = topicLabel(topic, locale);
  const description = topicDescription(topic, locale);
  const canonical = `/place/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary', title, description }
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getDiscoveryTopic('place', slug);
  if (!topic) notFound();
  const locale = await serverLocale();
  const name = topicLabel(topic, locale);
  const description = topicDescription(topic, locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description,
    url: `${SITE_ORIGIN}/place/${slug}`
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(jsonLd) }} />
    <PlaceTopicView slug={slug} locale={locale} />
  </>;
}

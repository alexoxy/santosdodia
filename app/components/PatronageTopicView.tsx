import Link from 'next/link';
import { getDiscoveryTopic, getObservancesForTopic, topicDescription, topicLabel, topicsForObservance, type DiscoveryKind } from '../../data/discovery';
import { traditionLabel } from '../../data/observances';
import { getFeatureCopy } from '../../lib/feature-copy';
import { ui, type Locale } from '../../lib/i18n';
import { displayObservanceName, displayPatronages } from '../../lib/locale-display';

const TOPIC_COPY = {
  en: { calendar: 'Explore the Christian calendar', search: 'Search more saints and patronages' },
  pt: { calendar: 'Explorar o calendário cristão', search: 'Pesquisar mais santos e padroados' },
  es: { calendar: 'Explorar el calendario cristiano', search: 'Buscar más santos y patronazgos' },
  fr: { calendar: 'Explorer le calendrier chrétien', search: 'Rechercher davantage de saints et de patronages' }
} as const;

export default function PatronageTopicView({ kind, slug, locale }: { kind: Exclude<DiscoveryKind, 'place'>; slug: string; locale: Locale }) {
  const topic = getDiscoveryTopic(kind, slug);
  if (!topic) return null;

  const feature = getFeatureCopy(locale);
  const copy = ui[locale];
  const topicCopy = TOPIC_COPY[locale as keyof typeof TOPIC_COPY] ?? TOPIC_COPY.en;
  const year = new Date().getFullYear();
  const items = getObservancesForTopic(topic, year, locale);
  const eyebrow = kind === 'profession' ? feature.byProfession : feature.associatedWith;

  return <div className="page-stack">
    <section className="page-hero compact-hero discovery-hero">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{topicLabel(topic, locale)}</h1>
        <p>{topicDescription(topic, locale)}</p>
      </div>
      <div className="hero-symbol">✦</div>
    </section>

    <section className="topic-summary">
      <div><strong>{items.length}</strong><span>{feature.saintResults}</span></div>
      <p>{copy.disclaimer}</p>
    </section>

    <section className="profile-grid">
      {items.map(item => {
        const name = displayObservanceName(item.names, locale, item.name);
        const patronages = displayPatronages(item.patronages, locale);
        const related = topicsForObservance(item.id).filter(value => value.slug !== topic.slug).slice(0, 3);
        return <article className="saint-preview" key={item.id}>
          <div className="saint-preview-date">
            <strong>{item.day}</strong>
            <span>{new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(new Date(`${item.dateISO}T00:00:00Z`))}</span>
          </div>
          <div>
            <div className="tag-row">
              {item.traditions.map(value => <span key={value}>{traditionLabel(copy, value)}</span>)}
              {patronages.slice(0, 3).map(value => <span key={value}>{value}</span>)}
            </div>
            <h2>{name}</h2>
            {item.summary ? <p>{item.summary}</p> : null}
            <div className="saint-preview-links">
              <Link className="btn btn-primary" href={`/saint/${item.id}`}>{feature.openProfile}</Link>
              <Link className="text-link" href={`/day/${item.dateISO}`}>{feature.openDay} →</Link>
            </div>
            {related.length ? <div className="related-mini">
              {related.map(value => <Link href={value.kind === 'place' ? `/place/${value.slug}` : `/patronage/${value.slug}`} key={value.slug}>{topicLabel(value, locale)}</Link>)}
            </div> : null}
          </div>
        </article>;
      })}
    </section>

    <section className="subscription-strip">
      <div>
        <span className="eyebrow">Patronage · calendar</span>
        <h2>{topicLabel(topic, locale)}</h2>
      </div>
      <div className="button-row">
        <Link className="btn btn-primary" href="/calendar">{topicCopy.calendar}</Link>
        <Link className="btn btn-secondary" href="/explore">{topicCopy.search}</Link>
      </div>
    </section>
  </div>;
}

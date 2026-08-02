import Link from 'next/link';
import { getDiscoveryTopic, getObservancesForTopic, topicDescription, topicLabel, topicsForObservance } from '../../data/discovery';
import { churchById } from '../../data/knowledge/churches';
import { ECCLESIASTICAL_OFFICES, officeHolder } from '../../data/knowledge/ecclesiastical-state';
import { JURISDICTIONS } from '../../data/knowledge/jurisdictions';
import { traditionLabel } from '../../data/observances';
import { getFeatureCopy } from '../../lib/feature-copy';
import { ui, type Locale } from '../../lib/i18n';
import { displayObservanceName, displayPatronages } from '../../lib/locale-display';
import { ecclesiasticalPageCopy, officeLabel } from '../../lib/knowledge/ecclesiastical-display';
import { churchPath, jurisdictionPath, localizedFieldValue, personPath } from '../../lib/knowledge/routes';

const COUNTRY_CODES: Record<string, string> = {
  portugal: 'PT',
  espanha: 'ES'
};

const PLACE_COPY = {
  en: {
    churchContext: 'Churches and jurisdictions in this place',
    churchContextIntro: 'Canonical Church structures already represented in the Santos do Dia knowledge graph.',
    currentHolder: 'Current office holder',
    exploreCalendar: 'Explore the Christian calendar',
    exploreHolidays: 'Religious holidays by country'
  },
  pt: {
    churchContext: 'Igrejas e jurisdições neste lugar',
    churchContextIntro: 'Estruturas eclesiais canónicas já representadas no grafo de conhecimento do Santos do Dia.',
    currentHolder: 'Titular atual',
    exploreCalendar: 'Explorar o calendário cristão',
    exploreHolidays: 'Feriados religiosos por país'
  },
  es: {
    churchContext: 'Iglesias y jurisdicciones en este lugar',
    churchContextIntro: 'Estructuras eclesiales canónicas ya representadas en el grafo de conocimiento de Santos do Dia.',
    currentHolder: 'Titular actual',
    exploreCalendar: 'Explorar el calendario cristiano',
    exploreHolidays: 'Festivos religiosos por país'
  },
  fr: {
    churchContext: 'Églises et juridictions dans ce lieu',
    churchContextIntro: 'Structures ecclésiales canoniques déjà représentées dans le graphe de connaissances de Santos do Dia.',
    currentHolder: 'Titulaire actuel',
    exploreCalendar: 'Explorer le calendrier chrétien',
    exploreHolidays: 'Jours fériés religieux par pays'
  }
} as const;

export default function PlaceTopicView({ slug, locale }: { slug: string; locale: Locale }) {
  const feature = getFeatureCopy(locale);
  const copy = ui[locale];
  const ecclesiasticalCopy = ecclesiasticalPageCopy(locale);
  const placeCopy = PLACE_COPY[locale as keyof typeof PLACE_COPY] ?? PLACE_COPY.en;
  const topic = getDiscoveryTopic('place', slug);
  if (!topic) return null;

  const year = new Date().getFullYear();
  const items = getObservancesForTopic(topic, year, locale);
  const countryCode = COUNTRY_CODES[slug];
  const countryJurisdictions = countryCode
    ? JURISDICTIONS.filter(jurisdiction => jurisdiction.geography.some(scope => scope.level === 'country' && scope.code === countryCode))
    : [];
  const conference = countryJurisdictions.find(jurisdiction => jurisdiction.level === 'episcopal-conference');
  const jurisdictions = conference
    ? countryJurisdictions
      .filter(jurisdiction => jurisdiction.id === conference.id || jurisdiction.parentJurisdictionId === conference.id)
      .sort((a, b) => {
        const order = { 'episcopal-conference': 0, province: 1, ordinariate: 2 } as Record<string, number>;
        return (order[a.level] ?? 9) - (order[b.level] ?? 9) || localizedFieldValue(a.name, locale).localeCompare(localizedFieldValue(b.name, locale), locale);
      })
    : countryJurisdictions;

  return <div className="page-stack">
    <section className="page-hero compact-hero discovery-hero">
      <div>
        <span className="eyebrow">{feature.byPlace}</span>
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
              {patronages.slice(0, 2).map(value => <span key={value}>{value}</span>)}
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

    {jurisdictions.length ? <section className="content-section">
      <span className="eyebrow">{ecclesiasticalCopy.churchAndTerritory}</span>
      <h2>{placeCopy.churchContext}</h2>
      <p>{placeCopy.churchContextIntro}</p>
      <div className="profile-grid">
        {jurisdictions.map(jurisdiction => {
          const church = churchById(jurisdiction.churchId);
          const offices = ECCLESIASTICAL_OFFICES.filter(office => office.jurisdictionId === jurisdiction.id && office.status === 'active');
          const children = jurisdiction.level === 'province'
            ? countryJurisdictions
              .filter(child => child.parentJurisdictionId === jurisdiction.id)
              .sort((a, b) => localizedFieldValue(a.name, locale).localeCompare(localizedFieldValue(b.name, locale), locale))
            : [];
          return <article className="saint-preview" key={jurisdiction.id}>
            <div>
              <div className="tag-row">
                <span>{jurisdiction.level.replaceAll('-', ' ')}</span>
                {church ? <span>{localizedFieldValue(church.name, locale)}</span> : null}
              </div>
              <h3><Link href={jurisdictionPath(jurisdiction)}>{localizedFieldValue(jurisdiction.name, locale)}</Link></h3>
              {offices.map(office => {
                const holder = officeHolder(office);
                return holder ? <p key={office.id}>
                  <strong>{placeCopy.currentHolder}:</strong>{' '}
                  <Link href={personPath(holder)}>{localizedFieldValue(holder.name, locale)}</Link>{' · '}
                  {officeLabel(office.officeType, locale)}
                </p> : null;
              })}
              {children.length ? <>
                <h4>{ecclesiasticalCopy.childJurisdictions}</h4>
                <div className="related-mini">
                  {children.map(child => <Link href={jurisdictionPath(child)} key={child.id}>{localizedFieldValue(child.name, locale)}</Link>)}
                </div>
              </> : null}
              <div className="saint-preview-links">
                <Link className="btn btn-secondary" href={jurisdictionPath(jurisdiction)}>{ecclesiasticalCopy.openJurisdiction}</Link>
                {church ? <Link className="text-link" href={churchPath(church)}>{ecclesiasticalCopy.openChurch} →</Link> : null}
              </div>
            </div>
          </article>;
        })}
      </div>
    </section> : null}

    <section className="subscription-strip">
      <div>
        <span className="eyebrow">Calendar · place</span>
        <h2>{topicLabel(topic, locale)}</h2>
      </div>
      <div className="button-row">
        <Link className="btn btn-primary" href="/calendar">{placeCopy.exploreCalendar}</Link>
        {countryCode ? <Link className="btn btn-secondary" href="/holidays">{placeCopy.exploreHolidays}</Link> : null}
      </div>
    </section>
  </div>;
}

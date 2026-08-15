import Link from 'next/link';
import { SOURCE_CATALOG, type Observance } from '../../data/observances';
import { annualDateEditorialUi, getAnnualDateEditorial } from '../../data/date-editorial';
import { getSaintBiographyRecord } from '../../data/saint-biographies';
import { getFeatureCopy } from '../../lib/feature-copy';
import type { Locale } from '../../lib/i18n';
import { isSaintBiographyIndexable } from '../../lib/editorial-profile-quality';
import { displayObservanceName } from '../../lib/locale-display';

export default function AnnualDateEditorialSection({
  monthDay,
  locale,
  items,
}: {
  monthDay: string;
  locale: Locale;
  items: Observance[];
}) {
  const editorial = getAnnualDateEditorial(monthDay, locale);
  if (!editorial) return null;

  const wanted = new Set(editorial.observanceIds);
  const relevantItems = items.filter(item => wanted.has(item.id));
  const sourceIds = Array.from(new Set(relevantItems.flatMap(item => item.sourceIds)));
  const sources = sourceIds
    .map(id => SOURCE_CATALOG.find(source => source.id === id))
    .filter((source): source is NonNullable<typeof source> => Boolean(source));
  const feature = getFeatureCopy(locale);
  const ui = annualDateEditorialUi[locale];
  const profiles = relevantItems.filter(item => {
    const biography = getSaintBiographyRecord(item.id);
    return Boolean(biography && isSaintBiographyIndexable(biography, locale));
  });

  return (
    <section className="annual-date-editorial" aria-labelledby={`annual-editorial-${monthDay}`}>
      <div className="annual-date-editorial-main">
        <span className="eyebrow">{editorial.eyebrow}</span>
        <h2 id={`annual-editorial-${monthDay}`}>{editorial.title}</h2>
        <p className="annual-date-editorial-lead">{editorial.lead}</p>
        <p>{editorial.context}</p>
        {profiles.length ? (
          <div className="annual-date-profile-links">
            {profiles.map(item => (
              <Link className="text-link" key={item.id} href={`/saint/${encodeURIComponent(item.id)}`}>
                {feature.openProfile}: {displayObservanceName(item.names, locale, item.name)} →
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {sources.length ? (
        <aside className="annual-date-sources">
          <h3>{ui.sources}</h3>
          <p>{ui.sourceNote}</p>
          <ul>
            {sources.map(source => (
              <li key={source.id}>
                <a className="text-link" href={source.url} target="_blank" rel="noreferrer">
                  {source.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </section>
  );
}

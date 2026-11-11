import Link from 'next/link';
import { canonicalPersonName, getCanonicalPeopleForObservance } from '../../data/canonical-person-profiles';
import { annualDateEditorialUi } from '../../data/date-editorial';
import { getAnnualDateEditorial } from '../../data/date-editorial-registry';
import { SOURCE_CATALOG, type Observance } from '../../data/observances';
import { getSaintBiographyRecord } from '../../data/saint-biography-registry';
import { getFeatureCopy } from '../../lib/feature-copy';
import type { Locale } from '../../lib/i18n';
import { isSaintBiographyIndexable } from '../../lib/editorial-profile-quality';
import { displayObservanceName } from '../../lib/locale-display';
import styles from './AnnualDateEditorialSection.module.css';

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
  const profileMap = new Map<string, string>();
  for (const item of relevantItems) {
    const directBiography = getSaintBiographyRecord(item.id);
    if (directBiography && isSaintBiographyIndexable(directBiography, locale)) {
      profileMap.set(item.id, displayObservanceName(item.names, locale, item.name));
    }
    for (const person of getCanonicalPeopleForObservance(item.id)) {
      const biography = getSaintBiographyRecord(person.id);
      if (biography && isSaintBiographyIndexable(biography, locale)) {
        profileMap.set(person.id, canonicalPersonName(person, locale));
      }
    }
  }
  const profiles = [...profileMap.entries()].map(([id, name]) => ({ id, name }));

  return (
    <section className={styles.section} aria-labelledby={`annual-editorial-${monthDay}`}>
      <div className={styles.main}>
        <span className="eyebrow">{editorial.eyebrow}</span>
        <h2 id={`annual-editorial-${monthDay}`}>{editorial.title}</h2>
        <p className={styles.lead}>{editorial.lead}</p>
        <p>{editorial.context}</p>
        {profiles.length ? (
          <div className={styles.profileLinks}>
            {profiles.map(profile => (
              <Link className="text-link" key={profile.id} href={`/saint/${encodeURIComponent(profile.id)}`}>
                {feature.openProfile}: {profile.name} →
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {sources.length ? (
        <aside className={styles.sources}>
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

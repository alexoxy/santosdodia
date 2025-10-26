import { notFound } from 'next/navigation';
import { getLocaleDefinition, getMessages } from '../../../../lib/i18n';
import { getAllSaints } from '../../../../lib/saints';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale: localeParam, slug } = await params;
  const locale = getLocaleDefinition(localeParam).code;
  const saints = await getAllSaints(locale);
  const saint = saints.find((entry) => entry.slug === slug);

  if (!saint) {
    return { title: 'Santo não encontrado' };
  }

  return {
    title: `${saint.name} — ${saint.traditionLabel}`,
    description: saint.bio
  };
}

export default async function SaintPage({ params }) {
  const { locale: localeParam, slug } = await params;
  const locale = getLocaleDefinition(localeParam).code;
  const messages = getMessages(locale);
  const saints = await getAllSaints(locale);
  const saint = saints.find((entry) => entry.slug === slug);

  if (!saint) {
    notFound();
  }

  return (
    <article className="panel saint-detail">
      <div className="panel-header">
        <h1>{saint.name}</h1>
        <p className="saint-tradition" style={{ color: saint.color }}>
          {saint.traditionLabel}
        </p>
      </div>
      <p className="saint-date">
        <strong>{messages.searchResults.dateLabel}:</strong> {saint.date}
      </p>
      <p>{saint.bio}</p>
      {saint.sources.length > 0 && (
        <footer className="saint-sources">
          <span>{messages.sourcesLabel}</span>
          <ul>
            {saint.sources.map((source) => (
              <li key={source}>
                <a href={source} target="_blank" rel="noreferrer">
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}

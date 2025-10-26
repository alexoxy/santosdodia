export default function DailyHighlight({ heading, saint, sourceNote, sourcesLabel }) {
  if (!saint) {
    return null;
  }

  return (
    <section className="panel highlight" aria-labelledby="highlight-heading">
      <div className="panel-header">
        <h2 id="highlight-heading">{heading}</h2>
        <p className="panel-subtitle">{sourceNote}</p>
      </div>
      <article className="highlight-card">
        <header>
          <p className="saint-tradition" style={{ color: saint.color }}>
            {saint.traditionLabel}
          </p>
          <h3>{saint.name}</h3>
        </header>
        <p>{saint.bio}</p>
        {saint.sources.length > 0 && (
          <footer className="saint-sources">
            <span>{sourcesLabel}</span>
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
    </section>
  );
}

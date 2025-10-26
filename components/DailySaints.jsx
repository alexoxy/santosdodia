export default function DailySaints({ heading, saints, sourcesLabel, emptyMessage }) {
  return (
    <section className="panel" aria-labelledby="today-heading">
      <div className="panel-header">
        <h2 id="today-heading">{heading}</h2>
      </div>
      {(!saints || saints.length === 0) && <p>{emptyMessage}</p>}
      {saints && saints.length > 0 && (
      <div className="saints-grid">
        {saints.map((saint) => (
          <article key={`${saint.tradition}-${saint.slug}`} className="saint-card" style={{ background: saint.background }}>
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
        ))}
      </div>
      )}
    </section>
  );
}

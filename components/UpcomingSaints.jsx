export default function UpcomingSaints({ entries, heading, sourcesLabel }) {
  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <section className="panel" aria-labelledby="upcoming-heading">
      <div className="panel-header">
        <h2 id="upcoming-heading">{heading}</h2>
      </div>
      <div className="upcoming-list">
        {entries.map((item) => (
          <article key={item.date} className="upcoming-day">
            <header>
              <p className="upcoming-date">{item.date}</p>
            </header>
            <ul>
              {item.saints.map((saint) => (
                <li key={`${item.date}-${saint.tradition}`}> 
                  <span className="saint-tradition" style={{ color: saint.color }}>
                    {saint.traditionLabel}
                  </span>
                  <span className="saint-name">{saint.name}</span>
                  {saint.sources.length > 0 && (
                    <details>
                      <summary>{sourcesLabel}</summary>
                      <ul>
                        {saint.sources.map((source) => (
                          <li key={source}>
                            <a href={source} target="_blank" rel="noreferrer">
                              {source}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

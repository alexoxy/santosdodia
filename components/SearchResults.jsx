import Link from 'next/link';

export default function SearchResults({ locale, labels, results }) {
  return (
    <section className="panel" aria-labelledby="results-heading">
      <div className="panel-header">
        <h2 id="results-heading">{labels.heading}</h2>
      </div>
      {results.length === 0 ? (
        <p>{labels.empty}</p>
      ) : (
        <ul className="results-list">
          {results.map((result) => (
            <li key={`${result.date}-${result.tradition}-${result.slug}`} className="result-item">
              <div>
                <p className="result-date">
                  <strong>{labels.dateLabel}:</strong> {result.date}
                </p>
                <p className="result-tradition">
                  <strong>{labels.traditionLabel}:</strong> {result.traditionLabel}
                </p>
                <p className="result-name">{result.name}</p>
              </div>
              <div className="result-actions">
                <a className="calendar-link" href={`/api/ical/${result.tradition}/${locale}?date=${result.date}`}>
                  ICS
                </a>
                <Link href={`/${locale}/santo/${result.slug}`}>{result.name}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

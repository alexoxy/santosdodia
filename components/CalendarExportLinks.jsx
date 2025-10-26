import { SUPPORTED_LOCALES } from '../lib/i18n';
import { TRADITIONS, describeTradition } from '../lib/saints';

export default function CalendarExportLinks({
  locale,
  heading,
  allLabel,
  byTraditionLabel,
  byLanguageLabel,
  downloadLabel
}) {
  return (
    <section className="panel" aria-labelledby="calendar-heading">
      <div className="panel-header">
        <h2 id="calendar-heading">{heading}</h2>
      </div>
      <div className="calendar-section">
        <h3>{allLabel}</h3>
        <div className="calendar-actions">
          <a className="calendar-link" href={`/api/ical/all/${locale}`}>
            {downloadLabel} ICS
          </a>
          <a className="calendar-link" href={`/api/ical/all/${locale}?format=json`}>
            JSON
          </a>
        </div>
      </div>
      <div className="calendar-section">
        <h3>{byTraditionLabel}</h3>
        <ul className="calendar-list">
          {Object.keys(TRADITIONS).map((id) => {
            const info = describeTradition(locale, id);
            return (
              <li key={id}>
                <span className="calendar-tradition" style={{ color: info.color }}>
                  {info.label}
                </span>
                <div className="calendar-actions">
                  <a className="calendar-link" href={`/api/ical/${id}/${locale}`}>
                    {downloadLabel} ICS
                  </a>
                  <a className="calendar-link" href={`/api/ical/${id}/${locale}?format=json`}>
                    JSON
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="calendar-section">
        <h3>{byLanguageLabel}</h3>
        <ul className="calendar-list languages">
          {SUPPORTED_LOCALES.map((definition) => (
            <li key={definition.code}>
              <span>{definition.label}</span>
              <div className="calendar-actions">
                <a className="calendar-link" href={`/api/ical/all/${definition.code}`}>
                  {downloadLabel} ICS
                </a>
                <a className="calendar-link" href={`/api/ical/all/${definition.code}?format=json`}>
                  JSON
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

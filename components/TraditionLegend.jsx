import { TRADITIONS, describeTradition } from '../lib/saints';

export default function TraditionLegend({ locale, title }) {
  return (
    <section className="panel" aria-labelledby="legend-heading">
      <div className="panel-header">
        <h2 id="legend-heading">{title}</h2>
      </div>
      <ul className="legend-list">
        {Object.keys(TRADITIONS).map((key) => {
          const info = describeTradition(locale, key);
          return (
            <li key={key} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: info.color }} aria-hidden="true" />
              <span>{info.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { SUPPORTED_LOCALES } from '../lib/i18n';
import { getTraditionOptions } from '../lib/saints';

export default function SearchForm({ locale, labels, searchParams }) {
  const traditionOptions = getTraditionOptions(locale);
  const currentTradition = searchParams.get('tradition') || 'all';
  const currentLocale = searchParams.get('language') || locale;

  return (
    <form className="search-form" method="get">
      <fieldset>
        <legend>{labels.heading}</legend>
        <div className="form-field">
          <label htmlFor="date">{labels.date}</label>
          <input id="date" name="date" type="date" defaultValue={searchParams.get('date') ?? ''} />
        </div>
        <div className="form-field">
          <label htmlFor="name">{labels.name}</label>
          <input
            id="name"
            name="q"
            type="text"
            placeholder={labels.name}
            defaultValue={searchParams.get('q') ?? ''}
          />
        </div>
        <div className="form-field">
          <label htmlFor="tradition">{labels.tradition}</label>
          <select id="tradition" name="tradition" defaultValue={currentTradition}>
            {traditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="language">{labels.language}</label>
          <select id="language" name="language" defaultValue={currentLocale}>
            {SUPPORTED_LOCALES.map((definition) => (
              <option key={definition.code} value={definition.code}>
                {definition.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      <button type="submit">{labels.button}</button>
    </form>
  );
}

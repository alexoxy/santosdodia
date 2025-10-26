import SearchForm from '../../../components/SearchForm';
import SearchResults from '../../../components/SearchResults';
import { getLocaleDefinition, getMessages } from '../../../lib/i18n';
import { searchSaints } from '../../../lib/saints';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ params, searchParams }) {
  const localeInfo = getLocaleDefinition(params.locale);
  const locale = localeInfo.code;
  const messages = getMessages(locale);
  const paramBag = new URLSearchParams(searchParams);
  const requestedLocale = paramBag.get('language') || locale;

  const results = await searchSaints({
    locale: requestedLocale,
    query: paramBag.get('q'),
    tradition: paramBag.get('tradition'),
    date: paramBag.get('date')
  });

  return (
    <div className="search-page">
      <SearchForm locale={locale} labels={messages.searchForm} searchParams={paramBag} />
      <SearchResults locale={requestedLocale} labels={messages.searchResults} results={results} />
    </div>
  );
}

import Link from 'next/link';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { getLocaleDefinition, getMessages, translate } from '../../lib/i18n';
import { getLastSyncInfo } from '../../lib/saints';

export async function generateMetadata({ params }) {
  const locale = getLocaleDefinition(params.locale).code;
  const messages = getMessages(locale);
  return {
    title: messages.siteTitle,
    description: messages.siteSubtitle
  };
}

export default async function LocaleLayout({ children, params }) {
  const localeInfo = getLocaleDefinition(params.locale);
  const locale = localeInfo.code;
  const messages = getMessages(locale);
  const syncInfo = getLastSyncInfo();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <h1>{messages.siteTitle}</h1>
          <p>{messages.siteSubtitle}</p>
        </div>
        <LanguageSwitcher currentLocale={locale} label={messages.languagesLabel} />
      </header>
      <nav className="site-nav">
        <Link href={`/${locale}`}>{messages.todayHeading}</Link>
        <Link href={`/${locale}/search`}>{messages.searchLinkLabel}</Link>
      </nav>
      <main>{children}</main>
      <footer className="site-footer">
        <p>{messages.searchCta}</p>
        {syncInfo.lastChecked && (
          <p className="sync-info">
            {translate(locale, 'highlightSource')} —{' '}
            <time dateTime={syncInfo.lastChecked}>{syncInfo.lastChecked}</time>
          </p>
        )}
      </footer>
    </div>
  );
}

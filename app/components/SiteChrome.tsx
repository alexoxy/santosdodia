'use client';
import { localeLabels, SUPPORTED_LOCALES, type Locale } from '../../lib/i18n';
import { liturgyLabel } from '../../lib/liturgy-i18n';
import { useLanguage } from './LanguageProvider';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, copy } = useLanguage();
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Santos do Dia">
            <span className="brand-mark" aria-hidden="true"><span>✦</span></span>
            <span className="brand-word">santosdodia<span>.com</span></span>
          </a>
          <nav className="main-nav" aria-label="Primary navigation">
            <a href="/calendar">{copy.navCalendar}</a>
            <a href="/liturgy">{liturgyLabel(locale)}</a>
            <a href="/explore">{copy.navExplore}</a>
            <a href="/sources">{copy.navSources}</a>
          </nav>
          <label className="language-picker">
            <span className="sr-only">Language</span>
            <select value={locale} onChange={event => setLocale(event.target.value as Locale)}>
              {SUPPORTED_LOCALES.map(value => <option key={value} value={value}>{localeLabels[value]}</option>)}
            </select>
          </label>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="brand footer-brand">
              <span className="brand-mark small" aria-hidden="true"><span>✦</span></span>
              <span className="brand-word">santosdodia<span>.com</span></span>
            </div>
            <p>{copy.footer}</p>
          </div>
          <div className="footer-links">
            <a href="/calendar">{copy.navCalendar}</a>
            <a href="/liturgy">{liturgyLabel(locale)}</a>
            <a href="/explore">{copy.navExplore}</a>
            <a href="/sources">{copy.navSources}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} santosdodia.com</span>
          <span>{copy.disclaimer}</span>
        </div>
      </footer>
    </div>
  );
}

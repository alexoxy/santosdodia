'use client';
import Link from 'next/link';
import { localeLabels, SUPPORTED_LOCALES, type Locale } from '../../lib/i18n';
import { liturgyLabel } from '../../lib/liturgy-i18n';
import { useLanguage } from './LanguageProvider';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, copy } = useLanguage();
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Santos do Dia">
            <span className="brand-mark" aria-hidden="true"><span>✦</span></span>
            <span className="brand-word">santosdodia<span>.com</span></span>
          </Link>
          <nav className="main-nav" aria-label="Primary navigation">
            <Link href="/calendar">{copy.navCalendar}</Link>
            <Link href="/liturgy">{liturgyLabel(locale)}</Link>
            <Link href="/explore">{copy.navExplore}</Link>
            <Link href="/sources">{copy.navSources}</Link>
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
            <Link href="/calendar">{copy.navCalendar}</Link>
            <Link href="/liturgy">{liturgyLabel(locale)}</Link>
            <Link href="/explore">{copy.navExplore}</Link>
            <Link href="/sources">{copy.navSources}</Link>
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

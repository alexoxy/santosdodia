'use client';
import Link from 'next/link';
import { localeLabels, SUPPORTED_LOCALES, type Locale } from '../../lib/i18n';
import { traditionLabel, TRADITIONS, type Tradition } from '../../data/observances';
import { liturgyLabel } from '../../lib/liturgy-i18n';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage, type ChurchPreference } from './LanguageProvider';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
 const { locale, setLocale, copy, church, setChurch } = useLanguage();const feature=getFeatureCopy(locale);
 return <div className="site-shell">
  <header className="site-header"><div className="header-inner">
   <Link className="brand" href="/" aria-label="Santos do Dia"><span className="brand-mark" aria-hidden="true"><span>✦</span></span><span className="brand-word">santosdodia<span>.com</span></span></Link>
   <nav className="main-nav" aria-label="Primary navigation"><Link href="/">{feature.navToday}</Link><Link href="/explore">{feature.navFind}</Link><Link href="/calendar">{feature.navCalendars}</Link><Link href="/holidays">{feature.navHolidays}</Link><Link href="/live">{feature.navLive}</Link></nav>
   <div className="preference-pickers">
    <label className="church-picker"><span className="sr-only">{copy.tradition}</span><select value={church} onChange={event=>setChurch(event.target.value as ChurchPreference)}><option value="all">{copy.all}</option>{TRADITIONS.map(value=><option key={value} value={value}>{traditionLabel(copy,value)}</option>)}</select></label>
    <label className="language-picker"><span className="sr-only">Language</span><select value={locale} onChange={event => setLocale(event.target.value as Locale)}>{SUPPORTED_LOCALES.map(value => <option key={value} value={value}>{localeLabels[value]}</option>)}</select></label>
   </div>
  </div></header>
  <main className="site-main">{children}</main>
  <footer className="site-footer"><div className="footer-grid">
   <div><div className="brand footer-brand"><span className="brand-mark small" aria-hidden="true"><span>✦</span></span><span className="brand-word">santosdodia<span>.com</span></span></div><p>{copy.footer}</p></div>
   <div className="footer-links"><Link href="/explore">{feature.navFind}</Link><Link href="/calendar">{feature.navCalendars}</Link><Link href="/holidays">{feature.navHolidays}</Link><Link href="/live">{feature.navLive}</Link><Link href="/liturgy">{liturgyLabel(locale)}</Link><Link href="/developers">API</Link></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} santosdodia.com</span><div className="footer-legal-links"><Link href="/copyright">{feature.navCopyright}</Link><span>{copy.disclaimer}</span></div></div></footer>
 </div>
}

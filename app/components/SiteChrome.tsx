'use client';
import Link from 'next/link';
import { localeLabels, SUPPORTED_LOCALES, type Locale } from '../../lib/i18n';
import { localeOptionLabel } from '../../lib/locale-coverage';
import { traditionClass, traditionLabel, TRADITIONS } from '../../data/observances';
import { liturgyLabel } from '../../lib/liturgy-i18n';
import { getFeatureCopy } from '../../lib/feature-copy';
import { getInstitutionalCopy } from '../../lib/institutional-copy';
import { useLanguage, type ChurchPreference } from './LanguageProvider';

const skipLabels: Partial<Record<Locale,string>> = {
 en:'Skip to content',pt:'Saltar para o conteúdo',es:'Saltar al contenido',fr:'Aller au contenu',
 de:'Zum Inhalt springen',it:'Vai al contenuto',pl:'Przejdź do treści',ru:'Перейти к содержимому',
 fil:'Lumaktaw sa nilalaman',sw:'Ruka hadi kwenye maudhui'
};
const churchLabels: Partial<Record<Locale,string>> = {
 en:'Churches',pt:'Igrejas',es:'Iglesias',fr:'Églises',de:'Kirchen',it:'Chiese',pl:'Kościoły',
 ru:'Церкви',fil:'Mga Simbahan',sw:'Makanisa'
};
const leaderLabels: Partial<Record<Locale,string>> = {
 en:'Christian leaders',pt:'Líderes cristãos',es:'Líderes cristianos',fr:'Responsables chrétiens',
 de:'Christliche Leitung',it:'Leader cristiani',pl:'Liderzy chrześcijańscy',ru:'Христианские лидеры',
 fil:'Mga lider Kristiyano',sw:'Viongozi wa Kikristo'
};

export default function SiteChrome({ children }: { children: React.ReactNode }) {
 const { locale, setLocale, copy, church, setChurch } = useLanguage();
 const feature=getFeatureCopy(locale);
 const institutional=getInstitutionalCopy(locale);
 const churchColourClass=church==='all'?'church-all':traditionClass(church);
 return <div className="site-shell">
  <a className="skip-link" href="#main-content">{skipLabels[locale]??skipLabels.en}</a>
  <header className="site-header"><div className="header-inner">
   <Link className="brand" href="/" aria-label="Santos do Dia"><span className="brand-mark" aria-hidden="true"><span>✦</span></span><span className="brand-word">santosdodia<span>.com</span></span></Link>
   <nav className="main-nav" aria-label="Primary navigation"><Link href="/">{feature.navToday}</Link><Link href="/explore">{feature.navFind}</Link><Link href="/calendar">{feature.navCalendars}</Link><Link href="/liturgy">{liturgyLabel(locale)}</Link><Link href="/live">{feature.navLive}</Link></nav>
   <div className="preference-pickers">
    <label className={`church-picker ${churchColourClass}`}><span className="sr-only">{copy.tradition}</span><span className="picker-colour" aria-hidden="true"/><select value={church} onChange={event=>setChurch(event.target.value as ChurchPreference)}><option value="all">{copy.all}</option>{TRADITIONS.map(value=><option key={value} value={value}>{traditionLabel(copy,value)}</option>)}</select></label>
    <label className="language-picker"><span className="sr-only">Language</span><select value={locale} onChange={event => setLocale(event.target.value as Locale)}>{SUPPORTED_LOCALES.map(value => <option key={value} value={value}>{localeOptionLabel(value,localeLabels[value])}</option>)}</select></label>
   </div>
  </div></header>
  <main className="site-main" id="main-content" tabIndex={-1}>{children}</main>
  <footer className="site-footer"><div className="footer-grid">
   <div><div className="brand footer-brand"><span className="brand-mark small" aria-hidden="true"><span>✦</span></span><span className="brand-word">santosdodia<span>.com</span></span></div><p>{copy.footer}</p></div>
   <div className="footer-links"><Link href="/explore">{feature.navFind}</Link><Link href="/calendar">{feature.navCalendars}</Link><Link href="/liturgy">{liturgyLabel(locale)}</Link><Link href="/churches">{churchLabels[locale]??churchLabels.en}</Link><Link href="/leaders">{leaderLabels[locale]??leaderLabels.en}</Link><Link href="/holidays">{feature.navHolidays}</Link><Link href="/live">{feature.navLive}</Link><Link href="/developers">API</Link></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} santosdodia.com</span><div className="footer-legal-links"><Link href="/copyright">{feature.navCopyright}</Link><Link href="/privacy">{institutional.nav.privacy}</Link><Link href="/terms">{institutional.nav.terms}</Link><Link href="/faq">{institutional.nav.faq}</Link><Link href="/corrections">{institutional.nav.corrections}</Link><span>{copy.disclaimer}</span></div></div></footer>
 </div>
}

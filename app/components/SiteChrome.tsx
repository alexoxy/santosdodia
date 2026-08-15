'use client';
import Link from 'next/link';
import { localeLabels, type Locale } from '../../lib/i18n';
import { READY_PUBLIC_LOCALES } from '../../lib/public-locale-policy';
import { localeOptionLabel } from '../../lib/locale-coverage';
import { traditionClass, traditionLabel, TRADITIONS } from '../../data/observances';
import { liturgyLabel } from '../../lib/liturgy-i18n';
import { getFeatureCopy } from '../../lib/feature-copy';
import { getInstitutionalCopy } from '../../lib/institutional-copy';
import AdSenseBootstrap from './AdSenseBootstrap';
import PrivacyChoicesLink from './PrivacyChoicesLink';
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
const pilgrimageLabels: Record<Locale,string> = {
 en:'Pilgrimages',pt:'Peregrinar',es:'Peregrinar',fr:'Pèlerinages',de:'Pilgerziele',it:'Pellegrinaggi',pl:'Pielgrzymki',
 ru:'Паломничества',fil:'Paglalakbay-dalangin',sw:'Hija'
};
const languageLabels:Record<Locale,string>={
 en:'Language',pt:'Idioma',es:'Idioma',fr:'Langue',it:'Lingua',de:'Sprache',pl:'Język',ru:'Язык',fil:'Wika',sw:'Lugha'
};
const primaryNavLabels:Record<Locale,string>={
 en:'Primary navigation',pt:'Navegação principal',es:'Navegación principal',fr:'Navigation principale',it:'Navigazione principale',
 de:'Hauptnavigation',pl:'Nawigacja główna',ru:'Основная навигация',fil:'Pangunahing nabigasyon',sw:'Urambazaji mkuu wa simu'
};
const mobileNavLabels:Record<Locale,string>={
 en:'Primary mobile navigation',pt:'Navegação principal em telemóvel',es:'Navegación principal móvil',fr:'Navigation mobile principale',it:'Navigazione mobile principale',
 de:'Mobile Hauptnavigation',pl:'Główna nawigacja mobilna',ru:'Основная мобильная навигация',fil:'Pangunahing nabigasyon sa mobile',sw:'Urambazaji mkuu wa simu'
};
const aboutLabels:Record<Locale,string>={
 en:'About',pt:'Sobre',es:'Sobre el proyecto',fr:'À propos',it:'Chi siamo',de:'Über uns',pl:'O projekcie',ru:'О проекте',fil:'Tungkol',sw:'Kuhusu'
};
const advertisingLabels:Record<Locale,string>={
 en:'Advertising',pt:'Publicidade',es:'Publicidad',fr:'Publicité',it:'Pubblicità',de:'Werbung',pl:'Reklamy',ru:'Реклама',fil:'Anunsyo',sw:'Matangazo'
};

export default function SiteChrome({ children }: { children: React.ReactNode }) {
 const { locale, setLocale, copy, church, setChurch } = useLanguage();
 const feature=getFeatureCopy(locale);
 const institutional=getInstitutionalCopy(locale);
 const churchColourClass=church==='all'?'church-all':traditionClass(church);
 const pilgrimage=pilgrimageLabels[locale];
 return <div className="site-shell">
  <AdSenseBootstrap/>
  <a className="skip-link" href="#main-content">{skipLabels[locale]??skipLabels.en}</a>
  <header className="site-header"><div className="header-inner">
   <Link className="brand" href="/" aria-label="Santos do Dia"><span className="brand-mark" aria-hidden="true"><span>✦</span></span><span className="brand-word">santosdodia<span>.com</span></span></Link>
   <nav className="main-nav" aria-label={primaryNavLabels[locale]}><Link href="/">{feature.navToday}</Link><Link href="/calendar">{feature.navCalendars}</Link><Link href="/explore">{feature.navFind}</Link><Link href="/pilgrimages">{pilgrimage}</Link><Link href="/live">{feature.navLive}</Link></nav>
   <div className="preference-pickers">
    <label className={`church-picker ${churchColourClass}`}><span className="sr-only">{copy.tradition}</span><span className="picker-colour" aria-hidden="true"/><select value={church} onChange={event=>setChurch(event.target.value as ChurchPreference)}><option value="all">{copy.all}</option>{TRADITIONS.map(value=><option key={value} value={value}>{traditionLabel(copy,value)}</option>)}</select></label>
    <label className="language-picker"><span className="sr-only">{languageLabels[locale]}</span><select value={locale} onChange={event => setLocale(event.target.value as Locale)}>{READY_PUBLIC_LOCALES.map(value => <option key={value} value={value}>{localeOptionLabel(value,localeLabels[value])}</option>)}</select></label>
   </div>
  </div></header>
  <main className="site-main" id="main-content" tabIndex={-1}>{children}</main>
  <nav className="mobile-product-nav" aria-label={mobileNavLabels[locale]}>
   <Link href="/"><span aria-hidden="true">✦</span><small>{feature.navToday}</small></Link>
   <Link href="/calendar"><span aria-hidden="true">▦</span><small>{feature.navCalendars}</small></Link>
   <Link href="/explore"><span aria-hidden="true">⌕</span><small>{feature.navFind}</small></Link>
   <Link href="/pilgrimages"><span aria-hidden="true">⌖</span><small>{pilgrimage}</small></Link>
   <Link href="/live"><span aria-hidden="true">●</span><small>{feature.navLive}</small></Link>
  </nav>
  <footer className="site-footer"><div className="footer-grid">
   <div><div className="brand footer-brand"><span className="brand-mark small" aria-hidden="true"><span>✦</span></span><span className="brand-word">santosdodia<span>.com</span></span></div><p>{copy.footer}</p></div>
   <div className="footer-links"><Link href="/explore">{feature.navFind}</Link><Link href="/calendar">{feature.navCalendars}</Link><Link href="/pilgrimages">{pilgrimage}</Link><Link href="/liturgy">{liturgyLabel(locale)}</Link><Link href="/churches">{churchLabels[locale]??churchLabels.en}</Link><Link href="/leaders">{leaderLabels[locale]??leaderLabels.en}</Link><Link href="/holidays">{feature.navHolidays}</Link><Link href="/live">{feature.navLive}</Link><Link href="/about">{aboutLabels[locale]}</Link><Link href="/developers">API</Link></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} santosdodia.com</span><div className="footer-legal-links"><Link href="/copyright">{feature.navCopyright}</Link><Link href="/privacy">{institutional.nav.privacy}</Link><PrivacyChoicesLink/><Link href="/advertising">{advertisingLabels[locale]}</Link><Link href="/terms">{institutional.nav.terms}</Link><Link href="/faq">{institutional.nav.faq}</Link><Link href="/corrections">{institutional.nav.corrections}</Link><span>{copy.disclaimer}</span></div></div></footer>
 </div>
}

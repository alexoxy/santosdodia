import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import './traditions.css';
import './features.css';
import './biographies.css';
import LanguageProvider from './components/LanguageProvider';
import SiteChrome from './components/SiteChrome';
import { localeFromAcceptLanguage, normalizeLocale, SUPPORTED_LOCALES } from '../lib/i18n';
import { TRADITIONS } from '../data/observances';
import { SITE_ORIGIN } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: 'Santos do Dia — Saints, Patronages and Christian Calendars', template: '%s · Santos do Dia' },
  description: 'Find patron saints by profession, place or date, explore Christian traditions, light a free virtual candle and subscribe to saint calendars.',
  applicationName: 'Santos do Dia',
  keywords: ['patron saint','patron saint by profession','saints calendar','Christian calendar','Roman Catholic calendar','Orthodox calendar','Anglican calendar','Coptic saints','saint of the day','Christian live stream','liturgical calendar'],
  authors: [{ name: 'Santos do Dia' }], creator: 'Santos do Dia', publisher: 'Santos do Dia',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', url: SITE_ORIGIN, siteName: 'Santos do Dia',
    title: 'Santos do Dia — Find Saints and Patronages',
    description: 'Search saints by profession, place, date and Christian tradition, with traceable sources and calendar subscriptions.'
  },
  twitter: { card: 'summary', title: 'Santos do Dia', description: 'Find patron saints and subscribe to Christian calendars.' },
  robots: { index: true, follow: true }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#102a43', colorScheme: 'light' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers(), cookieStore = await cookies();
  const saved = cookieStore.get('sdd-locale')?.value;
  const initialLocale = saved ? normalizeLocale(saved) : localeFromAcceptLanguage(requestHeaders.get('accept-language'));
  const initialCountry = requestHeaders.get('x-vercel-ip-country') ?? undefined;
  const structured = {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'Santos do Dia', url: SITE_ORIGIN,
    inLanguage: SUPPORTED_LOCALES, description: 'A global directory of saints, patronages, Christian calendars and official live media.',
    about: TRADITIONS,
    potentialAction: { '@type': 'SearchAction', target: `${SITE_ORIGIN}/explore?q={search_term_string}`, 'query-input': 'required name=search_term_string' }
  };
  return <html lang={initialLocale} suppressHydrationWarning><body><LanguageProvider initialLocale={initialLocale} initialCountry={initialCountry}><SiteChrome>{children}</SiteChrome></LanguageProvider><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}/><Analytics/></body></html>;
}

import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import './traditions.css';
import LanguageProvider from './components/LanguageProvider';
import SiteChrome from './components/SiteChrome';
import { localeFromAcceptLanguage, normalizeLocale, SUPPORTED_LOCALES } from '../lib/i18n';
import { TRADITIONS } from '../data/observances';
import { SITE_ORIGIN } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: 'Santos do Dia — Global Christian Saints Calendar', template: '%s · Santos do Dia' },
  description: 'A free multilingual calendar of saints, feasts and commemorations from major Christian traditions, with traceable sources and calendar subscriptions.',
  applicationName: 'Santos do Dia',
  keywords: ['saints calendar','Christian calendar','Roman Catholic calendar','Orthodox calendar','Anglican calendar','Coptic saints','saint of the day','Christian feasts','liturgical calendar'],
  authors: [{ name: 'Santos do Dia' }], creator: 'Santos do Dia', publisher: 'Santos do Dia',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', url: SITE_ORIGIN, siteName: 'Santos do Dia',
    title: 'Santos do Dia — Global Christian Saints Calendar',
    description: 'Discover verified saints and Christian feasts across traditions and subscribe to personalised calendars.'
  },
  twitter: { card: 'summary', title: 'Santos do Dia', description: 'A free global and multilingual Christian saints calendar.' },
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
    inLanguage: SUPPORTED_LOCALES, description: 'A free global calendar of saints and Christian feasts with traceable sources.',
    about: TRADITIONS,
    potentialAction: { '@type': 'SearchAction', target: `${SITE_ORIGIN}/explore?q={search_term_string}`, 'query-input': 'required name=search_term_string' }
  };
  return <html lang={initialLocale} suppressHydrationWarning><body><LanguageProvider initialLocale={initialLocale} initialCountry={initialCountry}><SiteChrome>{children}</SiteChrome></LanguageProvider><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}/><Analytics/></body></html>;
}

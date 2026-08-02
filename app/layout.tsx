import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import './traditions.css';
import './features.css';
import './biographies.css';
import './holidays.css';
import './performance.css';
import LanguageProvider from './components/LanguageProvider';
import SiteChrome from './components/SiteChrome';
import { localeFromAcceptLanguage, normalizeLocale, SUPPORTED_LOCALES } from '../lib/i18n';
import { parseTradition, TRADITIONS } from '../data/observances';
import { SITE_ORIGIN } from '../lib/site';
import { countryFromHeaders } from '../lib/request-geo';

const siteDescription = 'Discover who is celebrated today in your country, region and Christian tradition. Search saints, patronages, calendars, movable feasts, religious holidays and liturgical information.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'Santos do Dia — Who is celebrated today, where you are',
    template: '%s · Santos do Dia'
  },
  description: siteDescription,
  applicationName: 'Santos do Dia',
  category: 'reference',
  keywords: [
    'saint of the day', 'saints celebrated today', 'saints by country', 'local saints calendar',
    'patron saint', 'patron saint by profession', 'Christian calendar', 'liturgical calendar',
    'Roman Catholic calendar', 'Orthodox calendar', 'Coptic calendar', 'Anglican calendar',
    'movable Christian feasts', 'religious holidays by country', 'daily readings'
  ],
  authors: [{ name: 'Santos do Dia', url: SITE_ORIGIN }],
  creator: 'Santos do Dia',
  publisher: 'Santos do Dia',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    url: SITE_ORIGIN,
    siteName: 'Santos do Dia',
    title: 'Santos do Dia — Who is celebrated today, where you are',
    description: siteDescription,
    locale: 'en_US'
  },
  twitter: {
    card: 'summary',
    title: 'Santos do Dia',
    description: 'Saints, celebrations and Christian calendars contextualised by place and tradition.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  other: {
    'llms-txt': `${SITE_ORIGIN}/llms.txt`
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#102a43',
  colorScheme: 'light'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const saved = cookieStore.get('sdd-locale')?.value;
  const savedChurch = cookieStore.get('sdd-tradition')?.value;
  const initialLocale = saved ? normalizeLocale(saved) : localeFromAcceptLanguage(requestHeaders.get('accept-language'));
  const initialCountry = countryFromHeaders(requestHeaders);
  const initialChurch = savedChurch === 'all' ? 'all' : parseTradition(savedChurch) ?? 'roman-catholic';

  const structured = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'Santos do Dia',
        url: SITE_ORIGIN,
        description: 'A free multilingual Christian calendar and knowledge service.'
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: 'Santos do Dia',
        url: SITE_ORIGIN,
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
        inLanguage: SUPPORTED_LOCALES,
        description: siteDescription,
        about: TRADITIONS.map(identifier => ({ '@type': 'Thing', identifier })),
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_ORIGIN}/explore?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Dataset',
        '@id': `${SITE_ORIGIN}/#dataset`,
        name: 'Santos do Dia Christian observance knowledge base',
        description: 'Structured records connecting Christian observances with dates, traditions, calendars, countries and source provenance.',
        url: SITE_ORIGIN,
        creator: { '@id': `${SITE_ORIGIN}/#organization` },
        isAccessibleForFree: true,
        inLanguage: SUPPORTED_LOCALES,
        temporalCoverage: '..',
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: `${SITE_ORIGIN}/api/v1/observances`
          },
          {
            '@type': 'DataDownload',
            encodingFormat: 'text/calendar',
            contentUrl: `${SITE_ORIGIN}/calendar`
          }
        ]
      }
    ]
  };

  return <html lang={initialLocale} suppressHydrationWarning>
    <body>
      <LanguageProvider initialLocale={initialLocale} initialCountry={initialCountry} initialChurch={initialChurch}>
        <SiteChrome>{children}</SiteChrome>
      </LanguageProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
    </body>
  </html>;
}

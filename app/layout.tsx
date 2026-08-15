import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import './traditions.css';
import './features.css';
import './biographies.css';
import './holidays.css';
import './performance.css';
import './product-v1.css';
import './ads.css';
import AdSenseBootstrap from './components/AdSenseBootstrap';
import LanguageProvider from './components/LanguageProvider';
import SiteChrome from './components/SiteChrome';
import { ADSENSE_CLIENT, ADSENSE_CODE_ENABLED, GOOGLE_SITE_VERIFICATION } from '../lib/adsense';
import { localeFromAcceptLanguage, normalizePublicLocale, PUBLIC_LOCALES, type Locale } from '../lib/i18n';
import { parseTradition, TRADITIONS } from '../data/observances';
import { requestPublicLocale } from '../lib/request-public-locale';
import { SITE_ORIGIN } from '../lib/site';
import { countryFromHeaders } from '../lib/request-geo';
import { serializeStructuredData } from '../lib/structured-data';

const siteDescription = 'Discover who is celebrated today in your country, region and Christian tradition. Search saints, calendars, movable feasts, religious holidays and liturgical information.';

type SiteMetadataCopy = {
  title: string;
  description: string;
  twitterDescription: string;
  openGraphLocale: string;
  keywords: string[];
};

const siteMetadataCopy: Record<'en' | 'es' | 'pt' | 'fr' | 'it', SiteMetadataCopy> = {
  en: {
    title: 'Santos do Dia — Who is celebrated today, where you are',
    description: siteDescription,
    twitterDescription: 'Saints, celebrations and Christian calendars contextualised by place and tradition.',
    openGraphLocale: 'en_US',
    keywords: ['saint of the day', 'saints celebrated today', 'Christian calendar', 'liturgical calendar'],
  },
  pt: {
    title: 'Santos do Dia — Quem é celebrado hoje, onde estiver',
    description: 'Descubra quem é celebrado hoje no seu país, região e tradição cristã. Pesquise santos, calendários, festas móveis, feriados religiosos e informação litúrgica.',
    twitterDescription: 'Santos, celebrações e calendários cristãos contextualizados por local e tradição.',
    openGraphLocale: 'pt_PT',
    keywords: ['santo do dia', 'santos celebrados hoje', 'calendário cristão', 'calendário litúrgico'],
  },
  es: {
    title: 'Santos do Dia — Quién se celebra hoy, donde estés',
    description: 'Descubre quién se celebra hoy en tu país, región y tradición cristiana. Busca santos, calendarios, fiestas móviles, festivos religiosos e información litúrgica.',
    twitterDescription: 'Santos, celebraciones y calendarios cristianos contextualizados por lugar y tradición.',
    openGraphLocale: 'es_ES',
    keywords: ['santo del día', 'santos celebrados hoy', 'calendario cristiano', 'calendario litúrgico'],
  },
  fr: {
    title: 'Santos do Dia — Qui est célébré aujourd’hui, là où vous êtes',
    description: 'Découvrez qui est célébré aujourd’hui dans votre pays, votre région et votre tradition chrétienne. Recherchez des saints, calendriers, fêtes mobiles, jours fériés religieux et informations liturgiques.',
    twitterDescription: 'Saints, célébrations et calendriers chrétiens contextualisés par lieu et tradition.',
    openGraphLocale: 'fr_FR',
    keywords: ['saint du jour', 'saints célébrés aujourd’hui', 'calendrier chrétien', 'calendrier liturgique'],
  },
  it: {
    title: 'Santos do Dia — Chi si celebra oggi, dove ti trovi',
    description: 'Scopri chi si celebra oggi nel tuo Paese, nella tua regione e nella tua tradizione cristiana. Cerca santi, calendari, feste mobili, festività religiose e informazioni liturgiche.',
    twitterDescription: 'Santi, celebrazioni e calendari cristiani contestualizzati per luogo e tradizione.',
    openGraphLocale: 'it_IT',
    keywords: ['santo del giorno', 'santi celebrati oggi', 'calendario cristiano', 'calendario liturgico'],
  },
};

function publicMetadataLocale(locale: Locale): keyof typeof siteMetadataCopy {
  return locale === 'pt' || locale === 'es' || locale === 'fr' || locale === 'it' ? locale : 'en';
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = publicMetadataLocale(await requestPublicLocale());
  const copy = siteMetadataCopy[locale];
  const other: Record<string, string> = { 'llms-txt': `${SITE_ORIGIN}/llms.txt` };
  if (ADSENSE_CODE_ENABLED) other['google-adsense-account'] = ADSENSE_CLIENT;

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: copy.title,
      template: '%s · Santos do Dia',
    },
    description: copy.description,
    applicationName: 'Santos do Dia',
    category: 'reference',
    keywords: copy.keywords,
    authors: [{ name: 'Santos do Dia', url: SITE_ORIGIN }],
    creator: 'Santos do Dia',
    publisher: 'Santos do Dia',
    alternates: { canonical: '/' },
    manifest: '/manifest.webmanifest',
    verification: GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : undefined,
    openGraph: {
      type: 'website',
      url: SITE_ORIGIN,
      siteName: 'Santos do Dia',
      title: copy.title,
      description: copy.description,
      locale: copy.openGraphLocale,
    },
    twitter: {
      card: 'summary',
      title: 'Santos do Dia',
      description: copy.twitterDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other,
  };
}

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
  const savedTimeZone = cookieStore.get('sdd-timezone')?.value;
  const initialLocale = saved ? normalizePublicLocale(saved) : localeFromAcceptLanguage(requestHeaders.get('accept-language'));
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
        inLanguage: PUBLIC_LOCALES,
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
        inLanguage: PUBLIC_LOCALES,
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
    <head><AdSenseBootstrap /></head>
    <body>
      <LanguageProvider initialLocale={initialLocale} initialCountry={initialCountry} initialChurch={initialChurch} initialTimeZone={savedTimeZone}>
        <SiteChrome>{children}</SiteChrome>
      </LanguageProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structured) }} />
    </body>
  </html>;
}

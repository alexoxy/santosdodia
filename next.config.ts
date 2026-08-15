import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // Public AdSense site-association configuration. The publisher ID is
    // intentionally visible in page source and ads.txt. Actual ad serving
    // remains disabled until approval and consent configuration are complete.
    NEXT_PUBLIC_ADSENSE_CLIENT:
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-2568362274337344',
    NEXT_PUBLIC_ADSENSE_CODE_ENABLED:
      process.env.NEXT_PUBLIC_ADSENSE_CODE_ENABLED ?? 'true',
    NEXT_PUBLIC_ADSENSE_ENABLED:
      process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? 'false'
  },
  outputFileTracingIncludes: {
    '/api/v1/liturgy': ['./data/litcal-mirror/**/*'],
    '/api/v1/litcal/calendars': ['./data/litcal-mirror/**/*'],
    '/api/ical/*': ['./data/litcal-mirror/**/*']
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;

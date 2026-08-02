import type { NextConfig } from 'next';
import { APEX_HOSTNAME, SITE_ORIGIN } from './lib/site';

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
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: APEX_HOSTNAME }],
        destination: `${SITE_ORIGIN}/:path*`,
        permanent: true
      }
    ];
  }
};

export default nextConfig;

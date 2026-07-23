import type { NextConfig } from 'next';
import { APEX_HOSTNAME, SITE_ORIGIN } from './lib/site';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingIncludes: {
    '/api/v1/liturgy': ['./data/litcal-mirror/**/*'],
    '/api/v1/litcal/calendars': ['./data/litcal-mirror/**/*'],
    '/api/ical/*': ['./data/litcal-mirror/**/*']
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

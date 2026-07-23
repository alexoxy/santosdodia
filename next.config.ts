import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingIncludes: {
    '/api/v1/liturgy': ['./data/litcal-mirror/**/*'],
    '/api/v1/litcal/calendars': ['./data/litcal-mirror/**/*'],
    '/api/ical/*': ['./data/litcal-mirror/**/*']
  }
};

export default nextConfig;

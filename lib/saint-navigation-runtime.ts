import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { NavigationD1Database } from './saint-navigation-d1';

export type NavigationRuntime = {
  database: NavigationD1Database;
  source: 'cloudflare-d1';
};

type NavigationEnv = {
  CALENDAR_DB?: NavigationD1Database;
};

export function getNavigationRuntime(): NavigationRuntime | null {
  try {
    const env = getCloudflareContext().env as unknown as NavigationEnv;
    if (!env?.CALENDAR_DB || typeof env.CALENDAR_DB.prepare !== 'function') return null;
    return { database: env.CALENDAR_DB, source: 'cloudflare-d1' };
  } catch {
    // `next build`/plain Node execution has no Cloudflare request context. Public
    // discovery must fail closed rather than fall back to staging or external IO.
    return null;
  }
}

export function navigationUnavailableResponse(reason: 'binding-unavailable' | 'no-published-dataset' = 'binding-unavailable') {
  return Response.json(
    {
      ready: false,
      data: [],
      meta: {
        sourceMode: 'published-navigation-projection',
        reason,
        stagingFallback: false,
        externalAcquisition: false
      }
    },
    {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

export function navigationJson(data: unknown, meta: Record<string, unknown> = {}) {
  return Response.json(
    {
      ready: true,
      data,
      meta: {
        sourceMode: 'published-navigation-projection',
        ...meta
      }
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

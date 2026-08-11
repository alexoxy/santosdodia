import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1DatabaseLike } from './calendar-d1-read-model';

export async function getOptionalCalendarDatabase(): Promise<D1DatabaseLike | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as Record<string, unknown>;
    const candidate = env.CALENDAR_DB as D1DatabaseLike | undefined;
    return candidate && typeof candidate.prepare === 'function' ? candidate : null;
  } catch {
    // Local Next.js, CI and pre-binding production deployments must continue to
    // serve the approved repository fallback rather than failing the request.
    return null;
  }
}

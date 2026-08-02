import { calendarEngineChecks, calendarEngineHealthy } from '../../../../../lib/knowledge/calendar-self-check';
import { CHURCHES } from '../../../../../data/knowledge/churches';
import { JURISDICTIONS } from '../../../../../data/knowledge/jurisdictions';
import { KNOWLEDGE_SOURCES, ingestibleSources } from '../../../../../data/knowledge/source-registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const calendarChecks = calendarEngineChecks();
  const healthy = calendarEngineHealthy();
  return Response.json({
    status: healthy ? 'ok' : 'degraded',
    checkedAt: new Date().toISOString(),
    services: {
      calendarEngine: { healthy, checks: calendarChecks },
      knowledgeBase: {
        churches: CHURCHES.length,
        jurisdictions: JURISDICTIONS.length,
        sources: KNOWLEDGE_SOURCES.length,
        ingestibleSources: ingestibleSources().length
      }
    }
  }, {
    status: healthy ? 200 : 503,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

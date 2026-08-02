import { calendarEngineChecks, calendarEngineHealthy } from '../../../../../lib/knowledge/calendar-self-check';
import { holySeeParserChecks, holySeeParserHealthy } from '../../../../../lib/ingestion/holy-see-self-check';
import { CHURCHES } from '../../../../../data/knowledge/churches';
import { JURISDICTIONS } from '../../../../../data/knowledge/jurisdictions';
import { KNOWLEDGE_SOURCES, ingestibleSources } from '../../../../../data/knowledge/source-registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const calendarChecks = calendarEngineChecks();
  const parserChecks = holySeeParserChecks();
  const calendarHealthy = calendarEngineHealthy();
  const parserHealthy = holySeeParserHealthy();
  const healthy = calendarHealthy && parserHealthy;

  return Response.json({
    status: healthy ? 'ok' : 'degraded',
    checkedAt: new Date().toISOString(),
    services: {
      calendarEngine: { healthy: calendarHealthy, checks: calendarChecks },
      officialSourceParsers: {
        healthy: parserHealthy,
        parsers: {
          holySeeBulletin: { healthy: parserHealthy, checks: parserChecks }
        }
      },
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

import { calendarEngineChecks, calendarEngineHealthy } from '../../../../../lib/knowledge/calendar-self-check';
import { holySeeParserChecks, holySeeParserHealthy } from '../../../../../lib/ingestion/holy-see-self-check';
import { CHURCHES } from '../../../../../data/knowledge/churches';
import { JURISDICTIONS } from '../../../../../data/knowledge/jurisdictions';
import { ECCLESIASTICAL_ASSERTIONS, ECCLESIASTICAL_OFFICES, ECCLESIASTICAL_PEOPLE } from '../../../../../data/knowledge/ecclesiastical-state';
import { KNOWLEDGE_SOURCES, ingestibleSources } from '../../../../../data/knowledge/source-registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const calendarChecks = calendarEngineChecks();
  const parserChecks = holySeeParserChecks();
  const calendarHealthy = calendarEngineHealthy();
  const parserHealthy = holySeeParserHealthy();
  const stateHealthy = ECCLESIASTICAL_OFFICES.every(office => ECCLESIASTICAL_PEOPLE.some(person => person.id === office.personId) && JURISDICTIONS.some(jurisdiction => jurisdiction.id === office.jurisdictionId));
  const healthy = calendarHealthy && parserHealthy && stateHealthy;

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
      ecclesiasticalState: {
        healthy: stateHealthy,
        people: ECCLESIASTICAL_PEOPLE.length,
        activeOffices: ECCLESIASTICAL_OFFICES.filter(office => office.status === 'active').length,
        assertions: ECCLESIASTICAL_ASSERTIONS.length
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

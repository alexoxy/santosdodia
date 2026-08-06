import { ECCLESIASTICAL_OFFICES, ECCLESIASTICAL_PEOPLE } from '../../../../../data/knowledge/ecclesiastical-state';
import { JURISDICTIONS } from '../../../../../data/knowledge/jurisdictions';
import { holySeeParserHealthy } from '../../../../../lib/ingestion/holy-see-self-check';
import { calendarEngineHealthy } from '../../../../../lib/knowledge/calendar-self-check';
import { jurisdictionHierarchyHealthy } from '../../../../../lib/knowledge/jurisdiction-self-check';

export const dynamic = 'force-dynamic';

export async function GET() {
  const calendarHealthy = calendarEngineHealthy();
  const parserHealthy = holySeeParserHealthy();
  const hierarchyHealthy = jurisdictionHierarchyHealthy();
  const stateHealthy = ECCLESIASTICAL_OFFICES.every(office => ECCLESIASTICAL_PEOPLE.some(person => person.id === office.personId) && JURISDICTIONS.some(jurisdiction => jurisdiction.id === office.jurisdictionId));
  const healthy = calendarHealthy && parserHealthy && hierarchyHealthy && stateHealthy;

  return Response.json({
    status: healthy ? 'ok' : 'degraded',
    checkedAt: new Date().toISOString(),
    services: {
      calendarEngine: { healthy: calendarHealthy },
      officialSourceParsers: { healthy: parserHealthy },
      ecclesiasticalState: { healthy: stateHealthy },
      jurisdictionHierarchy: { healthy: hierarchyHealthy }
    }
  }, {
    status: healthy ? 200 : 503,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff'
    }
  });
}

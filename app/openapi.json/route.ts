import { SUPPORTED_LOCALES } from '../../lib/i18n';
import { CATEGORIES, TRADITIONS } from '../../data/observances';
import { SITE_ORIGIN } from '../../lib/site';

export async function GET() {
  const filterParameters = [
    { name: 'locale', in: 'query', schema: { type: 'string', enum: SUPPORTED_LOCALES } },
    { name: 'tradition', in: 'query', schema: { type: 'string', enum: TRADITIONS } },
    { name: 'category', in: 'query', schema: { type: 'string', enum: CATEGORIES } },
    { name: 'country', in: 'query', schema: { type: 'string', minLength: 2, maxLength: 2 } },
    { name: 'live', in: 'query', description: 'Set to 0 to use only the curated repository dataset.', schema: { type: 'string', enum: ['0', '1'], default: '1' } }
  ];
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Santos do Dia machine interface', version: '3.1.0',
      description: 'Machine-readable Christian calendar data. Roman Catholic daily liturgy uses the live LitCal API first and an exact local response mirror when the upstream service is unavailable.'
    },
    servers: [{ url: SITE_ORIGIN }],
    paths: {
      '/api/v1/today': { get: { summary: 'Observances for today or a selected date', parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }, ...filterParameters], responses: { '200': { description: 'Observances and source-health metadata' } } } },
      '/api/v1/observances': { get: { summary: 'List and filter observances', parameters: [{ name: 'year', in: 'query', schema: { type: 'integer' } }, { name: 'month', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 12 } }, { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }, { name: 'patronage', in: 'query', schema: { type: 'string' } }, ...filterParameters], responses: { '200': { description: 'Filtered observance list' } } } },
      '/api/v1/search': { get: { summary: 'Search names, patronages, regions and traditions', parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }, { name: 'year', in: 'query', schema: { type: 'integer' } }, ...filterParameters], responses: { '200': { description: 'Search results' } } } },
      '/api/v1/liturgy': { get: { summary: 'Complete Roman Catholic liturgy for any date', description: 'Returns all available LitCal fields for celebrations on the selected date, including rank, colour, season, cycles, commons, readings, calculation messages, settings and provenance. Falls back to the exact local LitCal mirror.', parameters: [{ name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' } }, { name: 'locale', in: 'query', schema: { type: 'string', enum: SUPPORTED_LOCALES } }, { name: 'kind', in: 'query', schema: { type: 'string', enum: ['general', 'nation', 'diocese'], default: 'general' } }, { name: 'calendar', in: 'query', description: 'National or diocesan calendar identifier returned by /api/v1/litcal/calendars.', schema: { type: 'string' } }], responses: { '200': { description: 'Complete daily liturgy and source metadata' } } } },
      '/api/v1/litcal/calendars': { get: { summary: 'Discover LitCal general, national and diocesan calendars', responses: { '200': { description: 'Calendar catalogue from LitCal or the local mirror' } } } },
      '/api/ical/{feed}': { get: { summary: 'ICS calendar feed', parameters: [{ name: 'feed', in: 'path', required: true, schema: { type: 'string', enum: ['all', ...TRADITIONS] } }, ...filterParameters], responses: { '200': { description: 'ICS calendar containing the current and following year' } } } }
    }
  };
  return Response.json(document, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', 'Access-Control-Allow-Origin': '*' } });
}

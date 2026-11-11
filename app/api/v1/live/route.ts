import { LIVE_STREAM_REGISTRY_GENERATED_AT, LIVE_STREAM_SOURCES } from '../../../../data/live-streams';
import { TRADITIONS, type Tradition } from '../../../../data/observances';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get('tradition');
  const tradition = requested && TRADITIONS.includes(requested as Tradition)
    ? requested as Tradition
    : null;
  const data = (tradition
    ? LIVE_STREAM_SOURCES.filter(source => source.tradition === tradition)
    : LIVE_STREAM_SOURCES
  ).map(source => ({
    id: source.id,
    tradition: source.tradition,
    organization: source.organization,
    liveUrl: source.liveUrl ?? null,
    archiveUrl: source.archiveUrl ?? null,
    officialSourceUrl: source.sourceUrl,
    languages: source.languages,
    verifiedAt: source.verifiedAt,
  }));

  return Response.json({
    data,
    meta: {
      sourceMode: 'generated-official-live-registry-v1',
      generatedAt: LIVE_STREAM_REGISTRY_GENERATED_AT,
      count: data.length,
      tradition,
    },
  }, {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
    },
  });
}

import { readSaintMapPoints } from '../../../../../lib/saint-navigation-d1';
import { navigationJson } from '../../../../../lib/saint-navigation-runtime';
import { isResponse, navigationErrorResponse, publishedNavigationContext } from '../_shared';

export const dynamic = 'force-dynamic';

function optionalNumber(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new RangeError('Numeric filter is invalid.');
  return parsed;
}

export async function GET(request: Request) {
  try {
    const context = await publishedNavigationContext();
    if (isResponse(context)) return context;
    const params = new URL(request.url).searchParams;
    const data = await readSaintMapPoints(context.runtime.database, {
      locale: params.get('locale') ?? 'pt',
      century: optionalNumber(params.get('century')),
      countryCode: params.get('country') ?? undefined,
      relationType: params.get('relation') ?? undefined,
      limit: optionalNumber(params.get('limit'))
    });
    return navigationJson(data, {
      datasetId: context.dataset.id,
      count: data.length,
      publishedAt: context.dataset.publishedAt
    });
  } catch (error) {
    return navigationErrorResponse(error);
  }
}

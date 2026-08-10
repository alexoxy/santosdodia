import { readDailySaints } from '../../../../../lib/saint-navigation-d1';
import { navigationJson } from '../../../../../lib/saint-navigation-runtime';
import { isResponse, navigationErrorResponse, publishedNavigationContext } from '../_shared';

export const dynamic = 'force-dynamic';

function requiredInteger(value: string | null, label: string): number {
  if (value === null || value === '') throw new RangeError(`${label} is required.`);
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new RangeError(`${label} must be an integer.`);
  return parsed;
}

export async function GET(request: Request) {
  try {
    const context = await publishedNavigationContext();
    if (isResponse(context)) return context;
    const params = new URL(request.url).searchParams;
    const month = requiredInteger(params.get('month'), 'month');
    const day = requiredInteger(params.get('day'), 'day');
    const data = await readDailySaints(context.runtime.database, {
      locale: params.get('locale') ?? 'pt',
      month,
      day,
      churchId: params.get('church') ?? undefined
    });
    return navigationJson(data, {
      datasetId: context.dataset.id,
      month,
      day,
      count: data.length,
      publishedAt: context.dataset.publishedAt
    });
  } catch (error) {
    return navigationErrorResponse(error);
  }
}

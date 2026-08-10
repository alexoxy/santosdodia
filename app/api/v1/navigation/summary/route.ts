import { readSaintCenturySummary, readSaintCountrySummary } from '../../../../../lib/saint-navigation-summary';
import { navigationJson } from '../../../../../lib/saint-navigation-runtime';
import { isResponse, navigationErrorResponse, publishedNavigationContext } from '../_shared';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const context = await publishedNavigationContext();
    if (isResponse(context)) return context;
    const locale = new URL(request.url).searchParams.get('locale') ?? 'pt';
    const [centuries, countries] = await Promise.all([
      readSaintCenturySummary(context.runtime.database, locale),
      readSaintCountrySummary(context.runtime.database, locale)
    ]);
    return navigationJson({ centuries, countries }, {
      datasetId: context.dataset.id,
      publishedAt: context.dataset.publishedAt
    });
  } catch (error) {
    return navigationErrorResponse(error);
  }
}

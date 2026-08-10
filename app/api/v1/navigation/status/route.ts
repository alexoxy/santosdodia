import { navigationJson } from '../../../../../lib/saint-navigation-runtime';
import { isResponse, navigationErrorResponse, publishedNavigationContext } from '../_shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const context = await publishedNavigationContext();
    if (isResponse(context)) return context;
    return navigationJson(context.dataset, {
      datasetId: context.dataset.id,
      publishedAt: context.dataset.publishedAt
    });
  } catch (error) {
    return navigationErrorResponse(error);
  }
}

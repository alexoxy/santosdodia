import { readActiveNavigationDataset, type NavigationDatasetStatus } from '../../../../lib/saint-navigation-d1';
import {
  getNavigationRuntime,
  navigationUnavailableResponse,
  type NavigationRuntime
} from '../../../../lib/saint-navigation-runtime';

export type PublishedNavigationContext = {
  runtime: NavigationRuntime;
  dataset: NavigationDatasetStatus;
};

export async function publishedNavigationContext(): Promise<PublishedNavigationContext | Response> {
  const runtime = getNavigationRuntime();
  if (!runtime) return navigationUnavailableResponse('binding-unavailable');
  const dataset = await readActiveNavigationDataset(runtime.database);
  if (!dataset) return navigationUnavailableResponse('no-published-dataset');
  return { runtime, dataset };
}

export function isResponse(value: PublishedNavigationContext | Response): value is Response {
  return value instanceof Response;
}

export function navigationErrorResponse(error: unknown) {
  const message = error instanceof RangeError ? error.message : 'Navigation query failed.';
  return Response.json(
    {
      ready: false,
      error: message,
      meta: {
        sourceMode: 'published-navigation-projection',
        stagingFallback: false,
        externalAcquisition: false
      }
    },
    {
      status: error instanceof RangeError ? 400 : 503,
      headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' }
    }
  );
}

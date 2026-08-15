import type { Observance } from '../data/observances';
import { getObservanceEditorial } from '../data/observance-editorial';

export function enrichObservanceEditorial(item: Observance): Observance {
  const editorial = getObservanceEditorial(item.id);
  if (!editorial) return item;

  const summaries = { ...(item.summaries ?? {}), ...editorial.summaries };
  const sourceIds = [
    ...(item.summarySourceIds ?? []),
    ...editorial.sources.map((source) => source.id),
  ].filter((value, index, values) => values.indexOf(value) === index);

  return {
    ...item,
    summaries,
    summary: summaries.en ?? item.summary,
    summarySourceIds: sourceIds,
    summaryTranslationStatus: 'editorial',
    lastVerified: editorial.lastVerified,
  };
}

export function enrichObservancesEditorial(items: Observance[]): Observance[] {
  return items.map(enrichObservanceEditorial);
}

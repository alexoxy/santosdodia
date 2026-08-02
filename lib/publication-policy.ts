import {
  SOURCE_CATALOG,
  type Observance,
  type SourceRecord
} from '../data/observances';

const AUTHORITATIVE_SOURCE_IDS = new Set(
  SOURCE_CATALOG
    .filter((source: SourceRecord) => source.kind === 'official' || source.kind === 'scholarly')
    .map((source: SourceRecord) => source.id)
);

export type PublicationAssessment = {
  publishable: boolean;
  reason:
    | 'verified-authoritative-source'
    | 'cross-checked-independent-sources'
    | 'review-required'
    | 'imported'
    | 'missing-authoritative-source'
    | 'insufficient-independent-sources';
};

export function assessPublication(item: Observance): PublicationAssessment {
  const hasAuthoritativeSource = item.sourceIds.some(sourceId => AUTHORITATIVE_SOURCE_IDS.has(sourceId));

  if (item.validationStatus === 'review-required') {
    return { publishable: false, reason: 'review-required' };
  }

  if (item.validationStatus === 'imported') {
    return { publishable: false, reason: 'imported' };
  }

  if (item.validationStatus === 'verified') {
    return hasAuthoritativeSource
      ? { publishable: true, reason: 'verified-authoritative-source' }
      : { publishable: false, reason: 'missing-authoritative-source' };
  }

  if (item.sourceIds.length < 2) {
    return { publishable: false, reason: 'insufficient-independent-sources' };
  }

  return hasAuthoritativeSource
    ? { publishable: true, reason: 'cross-checked-independent-sources' }
    : { publishable: false, reason: 'missing-authoritative-source' };
}

export function publicObservances(items: Observance[]): Observance[] {
  return items.filter(item => assessPublication(item).publishable);
}

import type { Tradition } from '../data/observances';

export type PublicCalendarContext = {
  tradition: Tradition;
  country: string;
};

export const PUBLIC_CALENDAR_CONTEXTS = [
  { tradition: 'roman-catholic', country: 'PT' },
] as const satisfies readonly PublicCalendarContext[];

export const PLANNED_CALENDAR_TRADITIONS = [
  'greek-orthodox',
  'eastern-orthodox',
  'anglican',
  'coptic-orthodox',
  'armenian-apostolic',
  'ethiopian-orthodox',
  'syriac-orthodox',
] as const satisfies readonly Tradition[];

// Increment when the public calendar projection changes. Client requests include
// this value so a deployment cannot remain pinned to an older edge-cached payload.
export const PUBLIC_CALENDAR_RUNTIME_VERSION = 'roman-portugal-v1';

export function isPublicCalendarSubscriptionReady(tradition: string, country: string): boolean {
  return PUBLIC_CALENDAR_CONTEXTS.some(
    (context) => context.tradition === tradition && context.country === country.toUpperCase(),
  );
}

export function defaultReadyCalendarCountry(
  tradition: Tradition | 'all' | undefined
): string | undefined {
  return !tradition || tradition === 'all' || tradition === 'roman-catholic'
    ? 'PT'
    : undefined;
}

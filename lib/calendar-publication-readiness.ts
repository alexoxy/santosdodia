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
  'coptic',
  'armenian',
  'ethiopian',
  'syriac',
] as const satisfies readonly Tradition[];

export function isPublicCalendarSubscriptionReady(tradition: string, country: string): boolean {
  return PUBLIC_CALENDAR_CONTEXTS.some(
    (context) => context.tradition === tradition && context.country === country.toUpperCase(),
  );
}

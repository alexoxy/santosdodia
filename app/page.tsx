import { cookies } from 'next/headers';
import { parseTradition } from '../data/observances';
import { defaultReadyCalendarCountry } from '../lib/calendar-publication-readiness';
import { civilDateAtInstant, isValidIanaTimeZone, normalizeTimeZone } from '../lib/knowledge/temporal-core';
import { buildPublicToday } from '../lib/public-today';
import { requestPublicLocale } from '../lib/request-public-locale';
import HomeExperience from './components/HomeExperience';

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = await requestPublicLocale();
  const savedTimeZone = cookieStore.get('sdd-timezone')?.value;
  const timeZone = normalizeTimeZone(savedTimeZone, 'UTC');
  const savedChurch = cookieStore.get('sdd-tradition')?.value;
  const church = savedChurch === 'all' ? undefined : parseTradition(savedChurch) ?? 'roman-catholic';
  const calendarCountry = defaultReadyCalendarCountry(church);
  const date = civilDateAtInstant(new Date(), timeZone);
  const initialToday = await buildPublicToday({
    date,
    locale,
    timeZone,
    timeZoneSource: isValidIanaTimeZone(savedTimeZone) ? 'request' : 'utc-fallback',
    filters: { tradition: church, country: calendarCountry },
  });

  return <HomeExperience initialToday={initialToday} />;
}

import { CALENDAR_REGION_COOKIE, parseCalendarRegion, preferredTimeZone } from '../lib/calendar-preferences';
import { suggestedCountryFromHeaders } from '../lib/request-geo';
import { cookies, headers } from 'next/headers';
import { parseTradition } from '../data/observances';
import { defaultReadyCalendarCountry } from '../lib/calendar-publication-readiness';
import { civilDateAtInstant, isValidIanaTimeZone } from '../lib/knowledge/temporal-core';
import { buildPublicToday } from '../lib/public-today';
import { requestPublicLocale } from '../lib/request-public-locale';
import HomeExperience from './components/HomeExperience';

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = await requestPublicLocale();
  const savedTimeZone = cookieStore.get('sdd-timezone')?.value;
  const timeZone = preferredTimeZone(savedTimeZone, 'UTC');
  const savedChurch = cookieStore.get('sdd-tradition')?.value;
  const church = savedChurch === 'all' ? undefined : parseTradition(savedChurch) ?? 'roman-catholic';
  const region = parseCalendarRegion(cookieStore.get(CALENDAR_REGION_COOKIE)?.value)
    ?? suggestedCountryFromHeaders(await headers()) ?? defaultReadyCalendarCountry(church) ?? 'GLOBAL';
  const calendarCountry = region === 'GLOBAL' ? undefined : region;
  const date = civilDateAtInstant(new Date(), timeZone);
  const initialToday = await buildPublicToday({
    date,
    locale,
    timeZone,
    timeZoneSource: Boolean(savedTimeZone) && isValidIanaTimeZone(timeZone) ? 'request' : 'utc-fallback',
    filters: { tradition: church, country: calendarCountry },
  });

  return <HomeExperience initialToday={initialToday} />;
}

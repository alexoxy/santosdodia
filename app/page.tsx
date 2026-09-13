import { cookies, headers } from 'next/headers';
import { parseTradition } from '../data/observances';
import { civilDateAtInstant, isValidIanaTimeZone, normalizeTimeZone } from '../lib/knowledge/temporal-core';
import { buildPublicToday } from '../lib/public-today';
import { requestPublicLocale } from '../lib/request-public-locale';
import { countryFromHeaders } from '../lib/request-geo';
import HomeExperience from './components/HomeExperience';

export default async function HomePage() {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const locale = await requestPublicLocale();
  const savedTimeZone = cookieStore.get('sdd-timezone')?.value;
  const timeZone = normalizeTimeZone(savedTimeZone, 'UTC');
  const country = countryFromHeaders(requestHeaders);
  const savedChurch = cookieStore.get('sdd-tradition')?.value;
  const church = savedChurch === 'all' ? undefined : parseTradition(savedChurch) ?? 'roman-catholic';
  const date = civilDateAtInstant(new Date(), timeZone);
  const initialToday = await buildPublicToday({
    date,
    locale,
    timeZone,
    timeZoneSource: isValidIanaTimeZone(savedTimeZone) ? 'request' : 'utc-fallback',
    filters: { tradition: church, country },
  });

  return <HomeExperience initialToday={initialToday} />;
}

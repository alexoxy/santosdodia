import { cookies, headers } from 'next/headers';
import { localeFromAcceptLanguage, normalizeLocale, type Locale } from './i18n';

export async function serverLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get('sdd-locale')?.value;
  if (saved) return normalizeLocale(saved);
  const requestHeaders = await headers();
  return localeFromAcceptLanguage(requestHeaders.get('accept-language'));
}

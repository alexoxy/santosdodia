import { cookies, headers } from "next/headers";
import {
  localeFromAcceptLanguage,
  type Locale,
} from "./i18n";
import {
  isReadyPublicLocale,
  normalizeReadyPublicLocale,
} from "./public-locale-policy";

export async function requestPublicLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get("sdd-locale")?.value;
  if (saved) return normalizeReadyPublicLocale(saved);
  const requestHeaders = await headers();
  const requested = localeFromAcceptLanguage(requestHeaders.get("accept-language"));
  return isReadyPublicLocale(requested) ? requested : "en";
}

import { cookies, headers } from "next/headers";
import {
  localeFromAcceptLanguage,
  normalizePublicLocale,
  type Locale,
} from "./i18n";

export async function requestPublicLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get("sdd-locale")?.value;
  if (saved) return normalizePublicLocale(saved);
  const requestHeaders = await headers();
  return localeFromAcceptLanguage(requestHeaders.get("accept-language"));
}

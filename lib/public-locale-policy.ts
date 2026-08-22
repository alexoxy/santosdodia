import { normalizePublicLocale, PUBLIC_LOCALES, type Locale } from './i18n';

// Public locale exposure is a product-quality decision, not the same thing as
// internal translation support. Keep a locale here only while the production
// readiness probe confirms complete published calendar coverage.
export const READY_PUBLIC_LOCALES = PUBLIC_LOCALES;

export function isReadyPublicLocale(value: Locale): boolean {
  return (READY_PUBLIC_LOCALES as readonly string[]).includes(value);
}

export function normalizeReadyPublicLocale(value: string | null | undefined): Locale {
  const locale = normalizePublicLocale(value);
  return isReadyPublicLocale(locale) ? locale : 'en';
}

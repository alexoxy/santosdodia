'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SUPPORTED_LOCALES } from '../lib/i18n';

export default function LanguageSwitcher({ currentLocale, label = 'Idioma' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildTargetPath(locale) {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split('/');
    if (segments.length > 1 && segments[1]) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }

    const base = segments.join('/') || '/';
    const query = searchParams?.toString();
    return query ? `${base}?${query}` : base;
  }

  function handleChange(event) {
    const locale = event.target.value;
    router.push(buildTargetPath(locale));
  }

  return (
    <label className="language-switcher">
      <span className="sr-only">{label}</span>
      <select value={currentLocale} onChange={handleChange}>
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.label}
          </option>
        ))}
      </select>
    </label>
  );
}

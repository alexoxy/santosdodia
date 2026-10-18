// Calendar scope is independent of detected location, language and Church.
export const CALENDAR_REGION_COOKIE = 'sdd-calendar-region';

export function parseCalendarRegion(value: string | null | undefined): string | undefined {
  const candidate = value?.trim().toUpperCase();
  if (candidate === 'GLOBAL' || /^[A-Z]{2}$/.test(candidate ?? '')) return candidate;
  return undefined;
}

export function preferredTimeZone(saved: string | undefined, browser: string): string {
  for (const value of [saved, browser, 'UTC']) {
    if (!value) continue;
    try {
      const candidate = decodeURIComponent(value);
      new Intl.DateTimeFormat('en', { timeZone: candidate }).format();
      return candidate;
    } catch { /* Try the next valid source. */ }
  }
  return 'UTC';
}

// A language-derived country is a suggestion, never evidence of residence.
export function countryFromLanguages(languages: readonly string[]): string | undefined {
  for (const language of languages) {
    try {
      const locale = new Intl.Locale(language);
      const region = locale.region ?? locale.maximize().region;
      if (region && /^[A-Z]{2}$/.test(region)) return region;
    } catch { /* Ignore malformed browser language tags. */ }
  }
  return undefined;
}

export function languagesFromHeader(value: string | null): string[] {
  return (value ?? '').split(',').map((part, index) => {
    const [tag, ...params] = part.trim().split(';');
    const q = params.find((param) => param.trim().startsWith('q='));
    return { tag, quality: q ? Number(q.trim().slice(2)) : 1, index };
  }).filter(({ tag, quality }) => tag && quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.index - b.index).map(({ tag }) => tag);
}

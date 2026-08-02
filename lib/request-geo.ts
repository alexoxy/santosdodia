export function countryFromHeaders(headers: Headers): string | undefined {
  const country = headers.get('cf-ipcountry') ?? headers.get('x-country-code');
  if (!country || country === 'XX') return undefined;
  return country.toUpperCase();
}

export function regionFromHeaders(headers: Headers): string | undefined {
  return headers.get('cf-region-code') ?? headers.get('x-region-code') ?? undefined;
}

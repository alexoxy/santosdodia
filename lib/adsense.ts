const CLIENT_RE = /^ca-pub-\d{16}$/;
const SLOT_RE = /^\d{10,20}$/;

export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '').trim();
export const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' && CLIENT_RE.test(ADSENSE_CLIENT);
export const ADSENSE_HOME_SLOT = (process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT ?? '').trim();
export const ADSENSE_PROFILE_SLOT = (process.env.NEXT_PUBLIC_ADSENSE_PROFILE_SLOT ?? '').trim();

export function isValidAdSenseSlot(value: string) {
  return SLOT_RE.test(value);
}

export function adsenseSellerId() {
  if (!CLIENT_RE.test(ADSENSE_CLIENT)) return null;
  return ADSENSE_CLIENT.replace(/^ca-/, '');
}

export const ADSENSE_EXCLUDED_PREFIXES = [
  '/calendar',
  '/explore',
  '/day',
  '/privacy',
  '/terms',
  '/faq',
  '/corrections',
  '/about',
  '/advertising',
  '/developers',
  '/live',
] as const;

// Initial monetization is intentionally narrow: the homepage is the only
// generic route allowed to load AdSense. Editorial saint profiles opt in
// explicitly from their biography component.
export function adsenseScriptAllowed(pathname: string) {
  return pathname === '/';
}

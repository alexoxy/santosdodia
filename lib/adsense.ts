const CLIENT_RE = /^ca-pub-\d{16}$/;
const SLOT_RE = /^\d{10,20}$/;

export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '').trim();
export const ADSENSE_CODE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_CODE_ENABLED === 'true' && CLIENT_RE.test(ADSENSE_CLIENT);
export const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' && ADSENSE_CODE_ENABLED;

// Manual placements remain available even when Auto ads are enabled in AdSense.
// These two units give the product a predictable top banner and desktop rail.
export const ADSENSE_TOP_SLOT = (process.env.NEXT_PUBLIC_ADSENSE_TOP_SLOT ?? '').trim();
export const ADSENSE_SIDEBAR_SLOT = (process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT ?? '').trim();

// Search Console ownership is independent from AdSense ownership.
export const GOOGLE_SITE_VERIFICATION =
  (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '').trim();

export function isValidAdSenseSlot(value: string) {
  return SLOT_RE.test(value);
}

export function adsenseSellerId() {
  if (!CLIENT_RE.test(ADSENSE_CLIENT)) return null;
  return ADSENSE_CLIENT.replace(/^ca-/, '');
}

// Auto ads are controlled from the AdSense console. Keep these URLs in the
// AdSense page-exclusion list so Google does not inject ads into utility,
// privacy, video/live, developer or low-value surfaces.
export const ADSENSE_AUTO_ADS_EXCLUDED_PREFIXES = [
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

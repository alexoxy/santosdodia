const CLIENT_RE = /^ca-pub-\d{16}$/;
const SLOT_RE = /^\d{10,20}$/;

// The AdSense publisher ID is public by design: Google requires it in the page
// source and ads.txt. Keep a project default so site association continues to
// work even when the Cloudflare build does not define the public environment
// variable. An explicit env value can still override it for another runtime.
const DEFAULT_ADSENSE_CLIENT = 'ca-pub-2568362274337344';

export const ADSENSE_CLIENT =
  (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? DEFAULT_ADSENSE_CLIENT).trim();

// Site-association code is enabled by default for the configured publisher.
// Set NEXT_PUBLIC_ADSENSE_CODE_ENABLED=false to explicitly suppress it.
export const ADSENSE_CODE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_CODE_ENABLED !== 'false' && CLIENT_RE.test(ADSENSE_CLIENT);

// Actual ad serving remains fail-closed until it is explicitly enabled after
// AdSense approval and the required consent configuration is in place.
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

export function isAdUnitActive(value: string) {
  return ADSENSE_ENABLED && isValidAdSenseSlot(value);
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

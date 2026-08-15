const CLIENT_RE = /^ca-pub-\d{16}$/;
const SLOT_RE = /^\d{10,20}$/;

// Public publisher/site-association values are supplied by Next configuration;
// these runtime guards deliberately keep ownership code and ad serving separate.
export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '').trim();
export const ADSENSE_CODE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_CODE_ENABLED === 'true' && CLIENT_RE.test(ADSENSE_CLIENT);
export const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' && ADSENSE_CODE_ENABLED;

// Manual placements are the product default. The intended experience is a
// responsive top banner plus a desktop content rail, never an overlay over the
// reading surface.
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

// These content/product routes can inherit the shared top + desktop-rail frame.
// The homepage keeps its banner after Today, and saint profiles retain their
// richer-content gate locally so thin/noindex profiles never gain ad inventory.
export const ADSENSE_SHARED_FRAME_PREFIXES = [
  '/calendar',
  '/church',
  '/churches',
  '/date',
  '/day',
  '/explore',
  '/holidays',
  '/jurisdiction',
  '/leader',
  '/leaders',
  '/liturgy',
  '/patronage',
  '/pilgrimages',
  '/place',
] as const;

export function usesSharedAdFrame(pathname: string) {
  const path = pathname.split('?')[0]?.split('#')[0] || '/';
  return ADSENSE_SHARED_FRAME_PREFIXES.some(prefix =>
    path === prefix || path.startsWith(`${prefix}/`),
  );
}

// Legal, transparency, developer and live-video pages stay explicitly ad-free.
export const ADSENSE_MANUAL_ADS_EXCLUDED_PREFIXES = [
  '/about',
  '/advertising',
  '/copyright',
  '/corrections',
  '/developers',
  '/faq',
  '/live',
  '/privacy',
  '/sources',
  '/terms',
] as const;

// Auto ads are controlled from the AdSense console. If they are ever used,
// keep utility, privacy, video/live, developer and low-value surfaces excluded.
// Product policy additionally requires every overlay format (anchor, vignette
// and Google's sticky side rail) to remain disabled; the application supplies
// its own non-overlay top and desktop-rail units instead.
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

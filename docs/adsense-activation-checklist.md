# AdSense + organic search activation checklist

Santos do Dia is prepared for Google AdSense and Search Console while monetization remains **fail-closed**. Site association is separated from ad serving: the AdSense code can be published for ownership/review without enabling manual ad units.

## Current operational state — 2026-08-15 17:04 WEST

- `santosdodia.com`: AdSense **PREPARING** (`Preparando`).
- `ads.txt`: **AUTHORIZED** (`Autorizado`).
- Site ownership: verified.
- Review: requested.
- Publisher client: `ca-pub-2568362274337344`.
- Google certified CMP selected for current and future sites with three first-layer choices: **Consent**, **Do not consent**, and **Manage options**.
- Actual ad serving remains disabled until AdSense reports the site as approved/ready and that transition is explicitly recorded in `docs/monetization-status.md`.

This state is a development constraint, not merely an account note. All future changes must preserve the ownership code, real `ads.txt` record, CMP/privacy integration and fail-closed ad serving while the status remains **PREPARING**.

## 1. AdSense site association and review

1. AdSense account active and `santosdodia.com` added under **Sites**.
2. Publisher client ID: `ca-pub-2568362274337344`.
3. Configure Cloudflare/runtime:
   - `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-2568362274337344`
   - `NEXT_PUBLIC_ADSENSE_CODE_ENABLED=true`
   - keep `NEXT_PUBLIC_ADSENSE_ENABLED=false` during ownership verification/review.
4. Deploy through the normal protected GitHub → Cloudflare path.
5. Confirm the published HTML `<head>` contains both:
   - the official AdSense script using the configured client ID;
   - `<meta name="google-adsense-account" content="ca-pub-2568362274337344">`.
6. Confirm `https://www.santosdodia.com/ads.txt` returns:
   `google.com, pub-2568362274337344, DIRECT, f08c47fec0942fa0`
7. Ownership has been validated and site review requested. Current review state is **PREPARING**.
8. In **Privacy & messaging**, Google's certified CMP is selected for European regulations using the three-choice first layer. Preserve `/privacy` as the privacy-policy URL and keep user privacy choices reopenable.

## 2. Advertising after approval

1. Do not enter this section while `docs/monetization-status.md` records **PREPARING**.
2. Keep content as the primary purpose of every monetized page.
3. Create two responsive display ad units:
   - top banner;
   - desktop lateral/sidebar unit.
4. Configure:
   - `NEXT_PUBLIC_ADSENSE_TOP_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_ENABLED=true`
5. The application renders the top banner only after the core Today/profile hero and renders the lateral unit only on wide screens.
6. Auto ads may be enabled from the AdSense console after approval. Before applying them, configure page exclusions for:
   - `/calendar`
   - `/explore`
   - `/day/*`
   - `/live`
   - `/privacy`
   - `/terms`
   - `/faq`
   - `/corrections`
   - `/about`
   - `/advertising`
   - `/developers`
7. Use the AdSense preview before applying Auto ads. Prefer an experiment first if available.
8. Do not allow ads to crowd navigation, video controls, download/calendar controls or other interactive elements.
9. Do not use `sdd-tradition`, virtual-candle state, devotional interactions, saint interests or similar religious signals for ad personalization or audience construction.
10. Minimal saint profiles remain useful product pages but are `noindex` and do not receive manual ad units until a substantive reviewed biography exists.

## 3. Search Console and organic discovery

1. Add `santosdodia.com` to Google Search Console, preferably as a Domain property when DNS access is available.
2. If using HTML-tag verification, configure:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<verification-token>`
3. Submit `https://www.santosdodia.com/sitemap.xml` in Search Console.
4. Inspect the homepage and representative editorial saint profiles with URL Inspection after deployment.
5. Monitor indexing, Core Web Vitals, crawl errors and search queries. Do not create pages solely to target keywords.
6. Expand `SAINT_BIOGRAPHIES` with substantive, sourced profiles. Those profiles automatically become indexable, enter the saint-profile sitemap and gain internal links from the homepage editorial section.
7. Keep canonical URLs, source provenance, Church/tradition context and structured data aligned with visible content.

## 4. Release checks

- `AdSense readiness` CI is green.
- General `Quality` CI is green.
- The general `Quality` workflow runs the AdSense readiness audit on every development change.
- Cloudflare build for `main` succeeds.
- `ads.txt` contains only the real publisher ID.
- While review status is **PREPARING**, the default for `NEXT_PUBLIC_ADSENSE_ENABLED` remains `false`.
- A minimal saint profile remains `noindex` and ad-free.
- An editorial saint profile exposes `Person` + `ProfilePage` structured data and can show top/sidebar units only when ad serving is explicitly enabled after approval.
- Mobile remains content-first; the desktop rail disappears below the wide-screen breakpoint.
- Privacy/CMP choices can be reopened from the footer once AdSense is connected.

Organic traffic is earned through useful indexed content, clear internal linking and technical crawlability; no configuration can guarantee rankings. The operating goal is to grow the reviewed editorial corpus while preserving the daily calendar as the product core.

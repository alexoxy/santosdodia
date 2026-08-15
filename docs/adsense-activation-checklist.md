# AdSense + organic search activation checklist

Santos do Dia is prepared for Google AdSense and Search Console while monetization remains **fail-closed**. Site association is separated from ad serving: the AdSense code can be published for ownership/review without enabling manual ad units.

## 1. AdSense site association and review

1. Create/activate the Google AdSense account and add `santosdodia.com` under **Sites**.
2. Copy the publisher client ID in the form `ca-pub-XXXXXXXXXXXXXXXX`.
3. Configure Cloudflare/runtime:
   - `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_ADSENSE_CODE_ENABLED=true`
   - keep `NEXT_PUBLIC_ADSENSE_ENABLED=false` during ownership verification/review.
4. Deploy through the normal protected GitHub → Cloudflare path.
5. Confirm the published HTML `<head>` contains both:
   - the official AdSense script using the configured client ID;
   - `<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">`.
6. Confirm `https://www.santosdodia.com/ads.txt` returns:
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
7. In AdSense, validate ownership and request site review.
8. In **Privacy & messaging**, configure Google's certified CMP for European regulations and associate `/privacy` as the privacy-policy URL.

## 2. Advertising after approval

1. Keep content as the primary purpose of every monetized page.
2. Create two responsive display ad units:
   - top banner;
   - desktop lateral/sidebar unit.
3. Configure:
   - `NEXT_PUBLIC_ADSENSE_TOP_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_ENABLED=true`
4. The application renders the top banner only after the core Today/profile hero and renders the lateral unit only on wide screens.
5. Auto ads may be enabled from the AdSense console after approval. Before applying them, configure page exclusions for:
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
6. Use the AdSense preview before applying Auto ads. Prefer an experiment first if available.
7. Do not allow ads to crowd navigation, video controls, download/calendar controls or other interactive elements.
8. Do not use `sdd-tradition`, virtual-candle state, devotional interactions or similar religious signals for ad personalization or audience construction.
9. Minimal saint profiles remain useful product pages but are `noindex` and do not receive manual ad units until a substantive reviewed biography exists.

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
- Cloudflare build for `main` succeeds.
- `ads.txt` contains only the real publisher ID.
- A minimal saint profile remains `noindex` and ad-free.
- An editorial saint profile exposes `Person` + `ProfilePage` structured data and can show top/sidebar units only when ad serving is explicitly enabled.
- Mobile remains content-first; the desktop rail disappears below the wide-screen breakpoint.
- Privacy/CMP choices can be reopened from the footer once AdSense is connected.

Organic traffic is earned through useful indexed content, clear internal linking and technical crawlability; no configuration can guarantee rankings. The operating goal is to grow the reviewed editorial corpus while preserving the daily calendar as the product core.

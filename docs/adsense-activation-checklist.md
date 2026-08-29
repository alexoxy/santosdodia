# AdSense + organic search activation checklist

Santos do Dia is prepared for Google AdSense and Search Console while monetization remains **fail-closed**. Site association is separated from ad serving: the AdSense code can be published for ownership/review without enabling manual ad units.

The current AdSense rejection for **low-value content** makes editorial depth the active acceptance gate. The governing rule is `docs/editorial-content-policy.md`: sources provide evidence and facts; the substantive public prose is independently composed, stored and published by SantosDia.

## Current operational state — 2026-08-29

- `santosdodia.com`: AdSense review requires remediation for **low-value content** before a new review request.
- `ads.txt`: **AUTHORIZED** (`Autorizado`).
- Site ownership: verified.
- Publisher client: `ca-pub-2568362274337344`.
- Google certified CMP selected for current and future sites with three first-layer choices: **Consent**, **Do not consent**, and **Manage options**.
- Actual ad serving remains disabled until AdSense reports the site as approved/ready and that transition is explicitly recorded in `docs/monetization-status.md`.

This state is a development constraint, not merely an account note. All future changes must preserve the ownership code, real `ads.txt` record, CMP/privacy integration and fail-closed ad serving while the content-quality remediation is in progress.

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
7. Before requesting a new review, complete the content-quality remediation in section 2.
8. In **Privacy & messaging**, Google's certified CMP remains selected for European regulations using the three-choice first layer. Preserve `/privacy` as the privacy-policy URL and keep user privacy choices reopenable.

## 2. Low-value-content remediation gate

Do not request another AdSense review merely because technical checks are green. The domain must first look and behave like a substantive editorial/reference product.

1. External sources are evidence inputs only. Public prose must be a first-party SantosDia composition committed/materialized into a SantosDia-controlled repository or approved first-party store before serving.
2. Do not publish copied, translated, shortened, reordered or lightly paraphrased third-party prose as SantosDia editorial content.
3. Preserve claim/source provenance separately from editorial authorship. The user-facing article may read as SantosDia editorial work while factual evidence remains traceable.
4. Expand the corpus of substantive saint/person profiles. A profile intended for indexing should include an original SantosDia summary, several editorial paragraphs, key facts, Church/observance context, competent sources and useful internal links.
5. Day/date pages must not become a large indexable footprint of names and short templated summaries. Where a day page lacks meaningful context, keep it out of the sitemap or `noindex,follow` until the substantive-value threshold is met.
6. Remove or noindex empty, placeholder, mechanically generated or functionally duplicative landing pages.
7. Keep source, About, Corrections, Privacy, Copyright and editorial-method pages easily reachable so the project demonstrates responsibility and transparency.
8. Prefer fewer strong indexed pages to many weak ones. Mass generation for search/ad inventory is prohibited.
9. Validate that the public site still works if external sources disappear temporarily; runtime scraping/proxying is prohibited.
10. Only after representative homepage, saint profile, day/date, guide and calendar surfaces are content-rich should a new AdSense review be requested.

## 3. Advertising after approval

1. Do not enter this section until AdSense explicitly approves the site.
2. Keep content as the primary purpose of every monetized page.
3. Create two responsive display ad units only:
   - top banner;
   - desktop right-hand content-rail unit.
4. Configure:
   - `NEXT_PUBLIC_ADSENSE_TOP_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_ENABLED=true`
5. Initial serving model is manual-only. Keep **Auto ads OFF** in the AdSense console at activation so Google cannot introduce additional placements outside the product layout.
6. Keep all overlay formats disabled if Auto ads are ever evaluated later: no anchor ads, no vignette/interstitial ads and no Google sticky side-rail overlays. Any later Auto Ads experiment is a separate product decision and must not change this rule.
7. The application-owned desktop rail must occupy its own grid column. It may be sticky within that column, but it must never cover content. Hide it below the wide-screen breakpoint rather than shrinking or overlaying the reading surface.
8. The homepage keeps the top banner after the core Today experience. Rich saint profiles keep their banner after the profile hero and only expose ad slots when a substantive reviewed biography exists. Other eligible editorial/product surfaces can inherit the shared top + right-rail frame.
9. Keep `/privacy`, `/terms`, `/faq`, `/corrections`, `/about`, `/advertising`, `/developers`, `/copyright`, `/sources` and `/live` ad-free.
10. Do not place initial-release ads inside biography paragraphs, between primary day observances, over navigation, over video controls or over calendar/devotional controls.
11. Do not use `sdd-tradition`, virtual-candle state, devotional interactions, saint interests or similar religious signals for ad personalization or audience construction.
12. Minimal saint profiles remain useful product pages but are `noindex` and do not receive manual ad units until a substantive reviewed biography exists.

## 4. Search Console and organic discovery

1. Keep `santosdodia.com` verified in Google Search Console.
2. If using HTML-tag verification, configure:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<verification-token>`
3. Submit `https://www.santosdodia.com/sitemap.xml` after the remediation changes are deployed.
4. Inspect the homepage, representative editorial saint profiles and representative day/date pages with URL Inspection after deployment.
5. Monitor indexing, Core Web Vitals, crawl errors and search queries. Do not create pages solely to target keywords.
6. Expand `SAINT_BIOGRAPHIES` with substantive, evidence-backed **SantosDia-authored** profiles. Those profiles automatically become indexable only after the editorial quality gate.
7. Evergreen `/date/MM-DD` pages must remain `noindex` when the public corpus has no observances for that date. More generally, sitemap inclusion should track substantive value rather than mere existence of structured data.
8. Keep canonical URLs, source provenance, Church/tradition context and structured data aligned with visible content.
9. Avoid search-index dilution: if a route family is useful as an application function but weak as a search landing page, prefer `noindex,follow` rather than deleting useful product functionality.

## 5. Release checks

- `AdSense readiness` CI is green.
- General `Quality` CI is green.
- `docs/editorial-content-policy.md` exists and is checked by CI.
- Cloudflare build for `main` succeeds.
- `ads.txt` contains only the real publisher ID.
- While AdSense is not approved, the default for `NEXT_PUBLIC_ADSENSE_ENABLED` remains `false`.
- A minimal saint profile remains `noindex` and ad-free.
- An editorial saint profile exposes `Person` + `ProfilePage` structured data and visibly identifies the article as SantosDia editorial composition grounded in sources.
- No indexable profile is based only on a source excerpt, translation or thin template.
- Empty/weak day or evergreen-date pages do not inflate the sitemap.
- Shared content pages render only the manual top/banner and desktop content rail when the corresponding slots are active after approval.
- Mobile remains content-first; the desktop rail disappears below the wide-screen breakpoint.
- No advertising CSS uses fixed positioning or overlaps the content surface.
- Auto ads remain off at initial activation and overlay formats remain prohibited by product policy.
- Privacy/CMP choices can be reopened from the footer once AdSense is connected.

Organic traffic is earned through useful indexed content, original editorial synthesis, clear internal linking and technical crawlability. The immediate operating goal is to increase the density of substantive first-party SantosDia content while shrinking or noindexing the weak footprint before the next AdSense review.
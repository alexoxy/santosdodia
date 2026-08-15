# AdSense activation checklist

Santos do Dia is prepared for Google AdSense but advertising is **fail-closed**. No Google advertising script, ad unit or authorized-seller declaration is active until the required environment values are configured.

## Policy before activation

- Keep content as the primary purpose of every monetized page.
- Keep Google Auto Ads disabled at launch. Use the two manual responsive placements provided by the application.
- Do not place ads on `/live`, search/calendar utilities, privacy/legal/trust pages, developer pages, or minimal saint profiles.
- Do not use `sdd-tradition`, virtual-candle state, devotional interactions or similar religious signals for ad personalization or audience construction.
- Minimal saint profiles remain useful product pages but are `noindex` until a substantive reviewed biography is available.
- Only saint profiles represented in `SAINT_BIOGRAPHIES` are eligible for the initial profile ad placement and saint-profile sitemap inventory.

## Google AdSense setup

1. Create/activate the AdSense account and add `santosdodia.com` as the site.
2. Record the site client ID in the form `ca-pub-XXXXXXXXXXXXXXXX`.
3. In **Privacy & messaging**, configure Google's certified CMP for European regulations and associate `/privacy` as the privacy-policy URL.
4. Use an explicit consent flow suitable for the EEA, UK and Switzerland. Users must be able to refuse/manage choices and later reopen privacy choices.
5. Keep **Auto Ads disabled** for the initial launch.
6. Create two responsive display ad units:
   - home content slot;
   - editorial saint-profile slot.
7. Configure Cloudflare/runtime values:
   - `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_ADSENSE_HOME_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_PROFILE_SLOT=<numeric-slot-id>`
   - `NEXT_PUBLIC_ADSENSE_ENABLED=true`
8. Deploy through the normal protected GitHub → Cloudflare path.
9. Verify `https://www.santosdodia.com/ads.txt` returns:
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
10. Verify `/privacy`, `/advertising`, `/about`, `/terms`, `/faq`, `/corrections`, `/developers` and `/live` do not load the AdSense script.
11. Verify a minimal saint profile does not render an ad and contains `noindex` metadata.
12. Verify an editorial biography page can render the configured profile unit after the biography, not before it.

## Review posture

The site should be submitted only when the public production build is stable, navigation works on mobile, core pages contain meaningful publisher-created content, privacy/CMP configuration is live, and no construction/test pages are exposed as monetizable inventory.

After approval, expand monetized inventory only as the editorial biography corpus grows. Do not solve low revenue by monetizing thin pages.

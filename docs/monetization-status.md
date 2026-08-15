# Monetization operational status

_Last updated: 2026-08-15 17:04 WEST_

## Current AdSense state

- Site: `santosdodia.com`
- AdSense publisher client: `ca-pub-2568362274337344`
- AdSense site review status: **PREPARING** (`Preparando`)
- `ads.txt` authorization status: **AUTHORIZED** (`Autorizado`)
- Site ownership: verified
- Review: requested
- European consent: Google certified CMP selected with three first-layer choices: **Consent**, **Do not consent**, and **Manage options**
- Ad serving in the application: **DISABLED** until AdSense approval and consent implementation are operationally validated

Expected public `ads.txt` record:

```text
google.com, pub-2568362274337344, DIRECT, f08c47fec0942fa0
```

## Mandatory release rule while status is PREPARING

Until the AdSense site status is explicitly updated from **PREPARING** to an approved/ready state:

1. Keep the site-association code enabled so Google can continue the review.
2. Keep `NEXT_PUBLIC_ADSENSE_ENABLED` fail-closed and defaulted to `false`.
3. Do not add active ad slots, Auto Ads assumptions, ad experiments, or revenue-dependent UX.
4. Do not remove or alter the publisher ID, AdSense bootstrap, ownership meta tag, or `ads.txt` seller record without an explicit monetization review.
5. Preserve the Google CMP/privacy paths and the ability for users to reopen privacy choices.
6. Never use Christian tradition, devotional interactions, virtual-candle state, saint interests, or similar religious signals for ad personalization or audience construction.
7. Preserve mobile-first and content-first layout: monetization must not displace the core daily saint experience, navigation, calendar controls, or accessibility.
8. Every pull request must continue to pass the AdSense readiness audit, even when the change is unrelated to monetization.

## Approved target layout after review

The product is being prepared for a manual, non-overlay advertising model without activating it during review:

- one responsive top banner on eligible content pages;
- one application-owned right-hand content rail on wide desktop screens;
- the rail occupies a real layout column and disappears on narrower screens;
- the homepage preserves the Today experience before its banner;
- thin/noindex saint profiles remain ad-free;
- legal, privacy, transparency, developer and live-video surfaces remain ad-free;
- Auto ads remain off at initial activation;
- anchor, vignette/interstitial and Google sticky side-rail overlay formats are not part of the product experience.

No ad slot IDs are to be populated and `NEXT_PUBLIC_ADSENSE_ENABLED` must remain `false` while the state above is **PREPARING**.

## Transition to approved advertising

Advertising may only be enabled after all of the following are true:

- AdSense reports the site as approved/ready rather than **PREPARING**;
- the approval state is recorded in this file with the observed date/time;
- the Google CMP is published and verified on production for the relevant regions;
- the production privacy notice remains accurate;
- the two manual ad units and responsive layout have been reviewed for mobile and desktop;
- Auto ads are confirmed off for the initial activation and overlay formats remain disabled by product policy;
- the AdSense readiness and general Quality workflows are green.

The approval transition must be an explicit repository change. It must not be inferred from elapsed time, an email notification, or an environment-variable change alone.

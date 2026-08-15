# Santos do Dia development instructions

These rules apply to all repository changes, including automated and agent-authored changes.

## Product priorities

- Preserve the product as mobile-first, content-first, multilingual and tradition-aware.
- Keep GitHub as the code source of truth and Cloudflare Workers as the production runtime.
- Do not publish unreviewed saint/calendar data as verified editorial content.
- Prefer editorial scale, source quality, internal linking and calendar/date coverage over adding unrelated product features.
- Grow reviewed content progressively: substantive saint profiles first, evergreen day/date coverage second, then evidence-backed thematic/place hubs. Thin generated pages must remain out of the index.

## Advertising experience

- The default monetization model is manual, predictable and non-overlay: a responsive top banner plus one desktop right-hand content rail on eligible public content pages.
- The application-owned desktop rail must occupy its own layout column. It must never cover text, navigation, controls, video or devotional interactions.
- Keep Google Auto Ads overlay formats disabled: no anchor ads, vignette/interstitial ads or Google sticky side-rail overlays.
- Do not insert advertising inside biography paragraphs or between the primary saint/date content blocks unless an explicit later product decision changes this policy.
- Keep legal, privacy, advertising-transparency, developer and live-video surfaces ad-free.
- Keep thin/noindex saint profiles free of manual ad inventory; rich saint profiles may only expose slots after substantive reviewed biography content exists.
- On mobile, preserve the content column and top unit only; hide the desktop rail rather than squeezing or overlaying the reading surface.

## AdSense review guardrail

The current monetization state is recorded in `docs/monetization-status.md` and is part of the product's operational state.

While that file records AdSense as **PREPARING**:

- keep the AdSense ownership/site-association code active;
- keep actual ad serving disabled by default (`NEXT_PUBLIC_ADSENSE_ENABLED=false`);
- preserve the real publisher ID and `/ads.txt` seller relationship;
- preserve Google CMP/privacy integration and user privacy-choice access;
- do not introduce active ad placements, Auto Ads assumptions, revenue-dependent UX or ad-targeting logic;
- never use religious preference, Christian tradition, devotional activity, saint interests or virtual-candle state for ad targeting or audience construction;
- preserve mobile Core Web Vitals, accessibility and the core daily-saint experience ahead of monetization;
- run and pass `node scripts/check-adsense-readiness.mjs` for every development change.

Do not change the monetization state to approved/ready until the AdSense console has actually reported that state and the transition is explicitly recorded in `docs/monetization-status.md`.

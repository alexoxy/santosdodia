# Santos do Dia development instructions

These rules apply to all repository changes, including automated and agent-authored changes.

## Product priorities

- Preserve the product as mobile-first, content-first, multilingual and tradition-aware.
- Keep GitHub as the code source of truth and Cloudflare Workers as the production runtime.
- Do not publish unreviewed saint/calendar data as verified editorial content.

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

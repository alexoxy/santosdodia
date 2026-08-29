# Santos do Dia development instructions

These rules apply to all repository changes, including automated and agent-authored changes.

## Product priorities

- Preserve the product as mobile-first, content-first, multilingual and tradition-aware.
- Keep GitHub as the code source of truth and Cloudflare Workers as the production runtime.
- Do not publish unreviewed saint/calendar data as verified editorial content.
- External sources are evidence/research inputs. Substantive public prose must be independently composed as first-party SantosDia editorial content and stored in a SantosDia-controlled repository or approved first-party data store before publication.
- Do not relabel copied, translated, shortened, reordered or lightly paraphrased third-party prose as SantosDia editorial content. Follow `docs/editorial-content-policy.md`.
- Prefer editorial scale, source quality, internal linking and calendar/date coverage over adding unrelated product features.
- Grow reviewed content progressively: substantive saint profiles first, evergreen day/date coverage second, then evidence-backed thematic/place hubs. Thin generated pages must remain out of the index.
- A reviewed liturgical-person link does not by itself make every enriched profile fact public. Public saint-navigation promotion requires a separate explicit publication decision in `data/saint-navigation-publication.reviewed.json`.
- The first public navigation scope is deliberately narrow: source-backed identity/name plus a reviewed liturgical observance. Birth/death dates, places and other profile facts that only have the Wikidata enrichment source remain withheld until independently cross-checked.
- Never convert a name match into an automatic saint identity merge or publication decision. Ambiguous and unmatched records remain in review/staging.

## Text-first surface contract

- Treat SantosDia as an intelligence and reading product, not an image product. First-party editorial and product surfaces are text-only.
- Build public pages from semantic HTML, typographic hierarchy, simple CSS, accessible controls and text/Unicode symbols. CSS colour, borders and gradients are acceptable when they do not fetch media assets.
- Do not add saint portraits, photographs, hero images, thumbnails, galleries, illustrations, animated imagery, decorative audio, or non-live video.
- Verified livestream is the only first-party audiovisual content type. Keep its source and tradition explicit, provide useful text and an official external link before activation, and load the privacy-enhanced embed only after an explicit user action.
- Favicon and manifest icons are browser metadata, not an exception for visible page imagery. Advertising is governed separately and never relaxes the first-party text-only rule; ad serving remains disabled while AdSense is not approved.
- Prefer server-rendered text and deterministic HTML. Add client JavaScript only for interaction that materially requires it, such as context preferences, search, saved items, calendar actions and user-activated livestream.
- Do not add remote fonts or media libraries. Preserve the automated `surface:text-first-test` gate whenever presentation code changes.

## Advertising experience

- The default monetization model is manual, predictable and non-overlay: a responsive top banner plus one desktop right-hand content rail on eligible public content pages.
- The application-owned desktop rail must occupy its own layout column. It must never cover text, navigation, controls, video or devotional interactions.
- Keep Google Auto Ads overlay formats disabled: no anchor ads, vignette/interstitial ads or Google sticky side-rail overlays.
- Do not insert advertising inside biography paragraphs or between the primary saint/date content blocks unless an explicit later product decision changes this policy.
- Keep legal, privacy, advertising-transparency, developer and live-video surfaces ad-free.
- Keep thin/noindex saint profiles free of manual ad inventory; rich saint profiles may only expose slots after substantive reviewed biography content exists.
- On mobile, preserve the content column and top unit only; hide the desktop rail rather than squeezing or overlaying the reading surface.

## AdSense review guardrail

The current monetization state is recorded in `docs/monetization-status.md` and is part of the product's operational state. The 2026-08-29 AdSense decision requires remediation for **low-value content** before another review request.

While that file records AdSense as **not approved** (including `PREPARING` or `REMEDIATION_REQUIRED`):

- keep the AdSense ownership/site-association code active;
- keep actual ad serving disabled by default (`NEXT_PUBLIC_ADSENSE_ENABLED=false`);
- preserve the real publisher ID and `/ads.txt` seller relationship;
- preserve Google CMP/privacy integration and user privacy-choice access;
- do not introduce active ad placements, Auto Ads assumptions, revenue-dependent UX or ad-targeting logic;
- never use religious preference, Christian tradition, devotional activity, saint interests or virtual-candle state for ad targeting or audience construction;
- prioritize substantive first-party editorial depth and remove/noindex weak search footprints before asking Google to review again;
- preserve mobile Core Web Vitals, accessibility and the core daily-saint experience ahead of monetization;
- run and pass `node scripts/check-adsense-readiness.mjs` for every development change.

Do not change the monetization state to approved/ready until the AdSense console has actually reported that state and the transition is explicitly recorded in `docs/monetization-status.md`.
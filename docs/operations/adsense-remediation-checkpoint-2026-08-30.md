# SantosDia — AdSense remediation checkpoint

Updated: 2026-08-30
Status: **REMEDIATION_REQUIRED**
Finding: **low-value content**

This checkpoint is the current source of truth for the AdSense/editorial/search-remediation state. Where `docs/operations/current-cycle-checkpoint.md` still says AdSense is `PREPARING`, this document supersedes that statement only. It does not replace the older checkpoint's canonical-migration, D1-release, evidence or historical workflow records.

## Operating decision

AdSense remediation is a search/editorial/monetization correction, not a product reduction.

The three decisions remain independent:

1. **Product availability** — chronology and useful tools stay public and usable.
2. **Search indexability** — only deliberately substantive surfaces are promoted.
3. **Monetization eligibility** — remains disabled until AdSense approval and the SantosDia activation gate.

`noindex,follow` is therefore a search-quality control. It is not deletion, product retirement or evidence that a route lacks product value.

## AdSense state

- Google rejection observed: **2026-08-29**.
- Policy finding: **low-value content**.
- Publisher association and authorised `ads.txt` remain in place.
- Ad serving remains fail-closed with `NEXT_PUBLIC_ADSENSE_ENABLED=false`.
- Auto Ads, anchors, vignettes, interstitials and overlays remain outside the initial monetisation design.
- **Do not request another AdSense review yet.** Re-review requires a separate readiness decision after production verification, recrawl and continued first-party editorial maturation.

## Product continuity preserved

The following remain strategic product surfaces even when excluded from organic-search acquisition:

- Today;
- complete day-by-day chronology and previous/next navigation;
- Calendar;
- Search / Discover;
- Liturgical Calculator;
- rolling ICS/webcal and annual snapshots;
- Prayer;
- verified Live;
- Church, jurisdiction, leader, place, patronage and pilgrimage directories;
- API, JSON-LD, ICS and OpenAPI outputs;
- context selection by locale, jurisdiction, Church/tradition, calendar system and timezone.

No AdSense action may infer Church from country, infer country from language, merge calendar systems silently or let SEO override Church/jurisdiction semantics.

## Remediation delivered

### First-party editorial boundary

PR #251 established first-party SantosDia composition, thin-page controls, AdSense fail-closed behaviour and the separation between evidence capture and public prose.

Public editorial follows:

`approved source → evidence capture → normalized facts → canonical knowledge → SantosDia editorial composition → public page`

Third-party prose is not made first-party merely by translating, shortening, reordering or lightly editing it.

### Editorial corpus

Three bounded depth waves completed the current saint-profile corpus:

- **29 biographies**;
- **29/29 baseline-ready**;
- **29/29 deep-ready**;
- **0 current depth gaps**;
- 21 bounded editorial-depth extensions across three waves.

This is an internal quality measure, not a Google word-count rule.

### Today

PR #256 added reviewed editorial context to Today without changing chronology.

PR #258 moved the editorial selection server-side while preserving the same fail-closed cascade:

1. reviewed annual-date editorial relevant to a visible observance;
2. otherwise a reviewed saint profile in the active locale;
3. otherwise no fabricated filler.

The homepage no longer ships the full saint biography/editorial corpus merely to select one contextual block.

Measured build improvement from PR #258:

- homepage route code: **26.8 kB → 15.7 kB**;
- First Load JS: **337 kB → 239 kB**;
- reduction: **98 kB, approximately 29%**.

The merged `main` commit for this unit was `2ecba73f955028cb66a32cbc5e60d97df1b83fe2`; its post-merge Quality and AdSense readiness workflows passed.

### Curated search footprint

PR #259 formalised the rule that the sitemap is a curated publication surface, not an inventory of application routes.

Useful but not yet independently promoted surfaces remain available and `noindex,follow`, including:

- Calendar explorer;
- calendar subscription utility;
- calendar API documentation;
- Explore/Search;
- Prayer;
- religious-holidays explorer;
- liturgy explorer;
- Live directory;
- pilgrimages;
- Church and jurisdiction directories/profiles;
- leader directory/profiles;
- patronage and place topics.

The **Liturgical Calculator** is the deliberate positive exception and is promoted in the sitemap because it is an original, substantive acquisition surface backed by deterministic perennial calculation, cycles, seasons, movable dates, vestment-colour context, API and ICS infrastructure.

PR #259 exact head `18ba71172717829033a4867bd6abbcd893f3b97b` passed AdSense readiness, Wikidata retry quality and all 64 Quality steps, including Next.js build, Cloudflare/OpenNext build and production smoke. It was squash-merged into `main` as `6074f96e77054b99b446c8c9aa8bbb0603102021`.

## Search publication model after remediation

Deliberately promoted search surfaces are now centred on:

- homepage;
- editorial guides and guide pages;
- quality-gated saint profiles;
- annual date pages only when first-party date editorial exists;
- Liturgical Calculator;
- About, Sources, Copyright, Privacy, Advertising, Terms, FAQ, Corrections and Developers transparency/reference pages.

Daily dated utility pages remain `noindex,follow` and absent from the sitemap. Product utility is not used as a proxy for indexability.

## Free-tier and runtime safety

- No remediation unit required D1 production writes.
- Cloudflare Free guardrails remain active.
- Production and R2 writes remain disabled in the verified remediation workflows.
- External acquisition is not introduced at request time.
- Chronology, Calendar, Search, ICS and API continue to share the canonical published calendar/read-model contracts.

## Remaining gate before AdSense re-review

Do not re-submit merely because internal checks are green. Before a new AdSense review:

1. verify the final merged production metadata, robots and sitemap behaviour;
2. confirm the latest `main` Quality/AdSense workflows are green after all remediation merges;
3. allow search engines time to recrawl and retire previously discoverable weak utility/directory URLs;
4. continue selectively expanding genuinely useful first-party editorial dates, guides and profiles from canonical evidence;
5. review real production navigation and page-value density, especially entry pages reachable from organic search;
6. rerun the complete technical, editorial, privacy and monetisation readiness audits;
7. make an explicit re-review decision only when the production site, not merely the repository, demonstrates the intended publication quality.

## Next product work

AdSense remediation does not displace the global product roadmap. The next substantive product work remains:

- continue Portugal canonical/Sanctorale semantic-equivalence work without weakening the cutover gate;
- expand first-party editorial/search surfaces selectively, never as a thin-page factory;
- preserve and improve Today, chronology, Calculator, ICS and other initial tools;
- proceed from Portugal as the quality anchor toward evidence-ready jurisdictions and distinct Church/tradition kernels.

# SantosDia v2.1 — Strategic addendum: product continuity through AdSense remediation

Status: normative clarification of `global-liturgical-intelligence-v2.1.md`
Effective: 2026-08-29
Applies until incorporated into a later explicitly approved normative strategy.

## Purpose

The AdSense low-value-content remediation is a search, editorial-quality and monetization correction. It must not narrow the SantosDia product vision or remove useful liturgical functionality.

SantosDia remains simultaneously:

1. a daily Christian product for understanding the current day;
2. a chronological/calendar exploration product;
3. a liturgical intelligence and calculation platform;
4. an evidence-backed editorial publication;
5. a distribution layer through HTML, API, JSON-LD and ICS.

The remediation therefore separates three decisions that must never be conflated:

- **product availability** — whether a feature or route is useful to a human or machine user;
- **search indexability** — whether a page currently contains enough unique substantive editorial value to be a search landing page;
- **monetization eligibility** — whether an approved AdSense state and page-level quality permit ads to be served.

A page may be valuable product functionality while remaining `noindex,follow` and unmonetized. `noindex` is not a product-deletion signal.

## Non-negotiable chronological product

The chronology of saints and Christian observances remains a core SantosDia capability from the initial product onward.

The product must continue to support, according to the selected Church/tradition, jurisdiction, calendar system, timezone and locale:

- Today/current-day observances;
- day-by-day chronological navigation;
- previous/next day navigation;
- month and annual calendar exploration;
- saint/observance relationships to their dates;
- movable celebrations, precedence and transfers;
- civil-year and liturgical-year distinction;
- comparison where multiple supported traditions/calendars legitimately differ;
- perennial generation rather than manually typed annual calendars.

Chronological pages may be selectively excluded from search indexes until they contain substantive first-party editorial context, but the chronology itself must remain complete and usable.

## Initial tools remain part of the vision

The following initial utility surfaces remain strategic product components and must not be removed merely to reduce the indexed footprint:

- Today;
- Calendar / chronology;
- Liturgical Calculator;
- rolling ICS/webcal subscription;
- annual calendar snapshot/export;
- search and discovery;
- context selection by Church/tradition, jurisdiction, calendar system, timezone and locale;
- saint and observance profiles;
- API / machine-readable calendar outputs;
- Saved and other lightweight retention tools when implemented safely;
- Pray and verified Live surfaces as their evidence/rights/readiness gates are met.

Their search treatment is independent. Functional or personalized surfaces can remain `noindex`; strong editorial landing pages can be indexed.

## Editorial layer added to, not substituted for, the utility layer

The response to the AdSense low-value-content finding is to add a high-value first-party editorial layer on top of the liturgical engine and chronology, not to turn SantosDia into a conventional article-only website.

The preferred public knowledge chain remains:

`approved source → evidence capture → normalized facts → canonical knowledge → SantosDia editorial composition → public page`

High-value editorial pages should progressively include:

- independently composed saint biographies and summaries;
- chronology and historical context;
- explanation of why an observance occurs on a given date;
- Church, rite, jurisdiction and calendar-system context;
- Portugal-specific relevance where applicable without making Portugal a global default;
- distinctions between Person, Recognition, Observance and Occurrence;
- structured facts and provenance;
- related saints, dates, places, observances, traditions and guides;
- original guides explaining liturgical calendars, ranks, transfers, calendar systems and Christian traditions.

The editorial corpus and the chronological/tooling corpus are complementary. Neither replaces the other.

## Search-quality rule

The sitemap is a curated search-publication surface, not an inventory of all routes.

Default policy:

- substantive saint profile: `index`;
- minimal saint profile: `noindex,follow` until editorial gate passes;
- annual date page with substantive first-party editorial context: `index`;
- annual date page without such context: `noindex,follow`;
- daily dated utility page (`/day/YYYY-MM-DD`): available to users, normally `noindex,follow` unless a future editorial gate explicitly promotes it;
- calculator/calendar/search/personalized utility pages: available as product, search treatment determined by their independent value;
- empty, duplicate, placeholder or mechanically generated landing pages: excluded from sitemap and index.

The system must prefer fewer strong search landing pages over mass publication of thin pages without reducing useful product coverage.

## Monetization rule

Ad serving remains disabled while SantosDia is not approved by AdSense.

After approval, monetization remains page-quality-aware and subordinate to usability. A route being present in the product does not imply that it should carry advertising.

No AdSense remediation may:

- remove chronological coverage needed by the product;
- weaken canonical liturgical semantics;
- delete the calculator, calendar, ICS or API merely because they are not editorial pages;
- substitute copied or lightly transformed third-party prose for first-party value;
- make SEO requirements dictate Church, jurisdiction, calendar or evidence semantics.

## Product interpretation

The intended outcome is not “a smaller SantosDia with only pages Google indexes”.

It is:

> **a complete Christian chronological and liturgical utility platform, with a deliberately selective high-quality editorial/search layer.**

The daily North Star remains: **Today, understand, pray, discover and return**. Calendar chronology and useful tools are part of how users understand and return; first-party editorial depth is how SantosDia explains, differentiates and earns search/monetization eligibility.

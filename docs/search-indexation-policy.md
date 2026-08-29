# SantosDia — search indexation policy

_Last updated: 2026-08-29_

## Principle

Search indexation is a publication decision, not a product-availability decision.

SantosDia keeps its chronological calendar, Today experience, utilities, directories and machine surfaces available when they are useful. A route is exposed to search only when it independently provides enough first-party substantive value to function as a strong landing page.

During AdSense low-value-content remediation the default is deliberately conservative: **fewer strong indexed pages, complete product functionality**.

## Current indexable corpus

The sitemap is limited to:

- the homepage;
- editorial guides and their reviewed guide pages;
- saint profiles that pass the launched-locale substantive biography gate;
- evergreen month-day pages that have SantosDia first-party date editorial;
- About, Sources, Copyright, Privacy, Advertising, Terms, FAQ, Corrections and Developers transparency/reference pages.

An entry being present in canonical data does not imply a search landing page.

## Public but currently search-excluded product surfaces

These routes remain usable but emit `X-Robots-Tag: noindex, follow` and stay outside the sitemap during remediation:

- `/explore` — search/discovery utility;
- `/calendar` — chronological calendar utility;
- `/liturgy` — liturgical calculator/explorer utility;
- `/churches` and `/church/*` — Church/tradition knowledge directory;
- `/jurisdiction/*` — ecclesiastical-jurisdiction knowledge directory;
- `/holidays` — religious-holiday comparison utility;
- `/live` — verified live/frequency utility;
- `/leaders` and `/leader/*` — current ecclesiastical leadership directory.

The already-established dated utility rule remains unchanged: `/day/YYYY-MM-DD` is `noindex,follow`; `/date/MM-DD` is indexable only when its first-party editorial gate passes.

## Promotion gate

A currently excluded route or route family may enter the sitemap only after an explicit review proves that it provides unique first-party value beyond structured records, filters, names or mechanically assembled facts.

Typical evidence for promotion includes:

- independently composed SantosDia explanatory/editorial content;
- clear user intent that is answered directly on the page;
- meaningful synthesis across canonical entities and competent sources;
- useful contextual relationships that are not simply an entity dump;
- visible provenance where substantive factual claims require it;
- no empty, placeholder, duplicate or near-duplicate state;
- stable canonical semantics and reviewed locale quality;
- a positive search-footprint audit.

No route family is promoted merely because it contains many records or because the underlying tool is strategically important.

## Implementation contract

Search-excluded public product routes are controlled centrally in `next.config.ts` through `X-Robots-Tag: noindex, follow`.

`app/sitemap.ts` is curated independently and must not enumerate those utility/directory routes.

`scripts/check-search-footprint.mjs` fails closed if the central noindex policy or the curated sitemap boundary regresses. `.github/workflows/adsense-readiness.yml` runs that audit for relevant changes.

## Product continuity

This policy must never be interpreted as permission to remove or degrade chronology, calendar navigation, calculator functionality, ICS/webcal, API output, Church/tradition selection, search, leadership data or other useful product surfaces.

The target remains a complete Christian chronological and liturgical utility platform with a deliberately selective high-quality editorial/search layer.

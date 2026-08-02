# Minimum verified-profile standard

_Last updated: 2026-08-02_

## Purpose

This standard defines when a saint or observance record may be presented as verified, cross-checked, review-required or imported. It applies to public pages, search results, API responses and calendar feeds.

A technically valid record is not automatically an editorially verified record.

## Required structural fields

Every curated record must contain:

- a stable, human-readable `id` that is not derived from the current display language;
- a valid observance date or an explicitly modelled movable-date rule;
- at least one Christian tradition;
- a category and calendar system;
- an English canonical name;
- at least one traceable `sourceId` present in the source catalogue;
- a translation status;
- a validation status;
- geographic scope, using `GLOBAL` only when the observance is genuinely cross-jurisdictional;
- a `lastVerified` date once the record has undergone editorial verification.

## Validation statuses

### `verified`

Use only when all structural requirements are met and the record is supported by at least one authoritative source classified as `official` or `scholarly`.

The source must directly support the published name, date, tradition and nature of the observance. A source that merely mentions the saint is insufficient to verify a feast date or patronage.

A verified record requires:

- an authoritative source;
- an editorial review date in `lastVerified`;
- no unresolved conflict affecting the published date, tradition or identity;
- explicit geographic or jurisdictional scope;
- no machine-generated factual summary presented as reviewed text.

### `cross-checked`

Use only when the record has at least two independent sources and at least one is classified as `official` or `scholarly`.

The sources must corroborate the same core claim. Two mirrors of the same upstream dataset do not count as independent confirmation.

A cross-checked record requires:

- two or more independent sources;
- at least one authoritative source;
- an editorial review date in `lastVerified`;
- documented handling of material differences between sources.

### `review-required`

Use when a record is plausible or useful for discovery but has not met the verified or cross-checked standard.

Examples include:

- records obtained only from an aggregator;
- unresolved differences in date, calendar conversion or jurisdiction;
- a source that supports the name but not the claimed patronage;
- a translation or transliteration requiring review;
- a single secondary or reference source.

Review-required records must not be described as verified. They may be excluded from indexable pages and general calendar feeds until reviewed.

### `imported`

Use for machine-ingested records that have passed schema validation but have not received an editorial classification.

Imported records are staging data. They must not be treated as public editorial records solely because the import succeeded.

## Claim-specific verification

Verification applies to individual claims, not to the record as an indivisible block.

- **Identity:** canonical name, aliases and distinction from similarly named saints.
- **Observance:** date, rank, tradition, calendar system and jurisdiction.
- **Patronage:** profession, cause, place or group association.
- **Biography:** dates, places, offices, martyrdom and historical narrative.
- **Media:** official ownership, institutional affiliation and current availability.

A verified date does not automatically verify a biography or patronage. Each published claim must be supported by a relevant source.

## Translation standard

- `official-name`: name taken from an official or authoritative source in that language.
- `source`: text reproduced or normalised from the source language without claiming editorial translation.
- `editorial`: translation reviewed by a human editor.
- `assisted`: machine-assisted translation awaiting editorial review.

Assisted text must not be presented as equivalent to editorially reviewed copy. English fallback must remain visible where a translation is incomplete.

## Publication gates

A record may appear in ordinary discovery, indexable pages and general ICS feeds only when:

1. it has no structural validation errors;
2. its status is `verified` or adequately `cross-checked`;
3. its sources support the claims shown on that surface;
4. its date and calendar system can be represented without ambiguity;
5. any material variation is disclosed.

`review-required` and `imported` records may be exposed through explicitly labelled research or staging interfaces, but not as verified public content.

## Patronage rule

A patronage must have claim-level provenance. It cannot be inferred solely from a popular association, search result, generated text or unsourced list.

Each patronage should ultimately be represented as a structured assertion containing:

- the patronage term;
- the relevant saint identity;
- jurisdiction or geographic scope where applicable;
- source references;
- validation status;
- last review date.

## Date and calendar rule

The model must distinguish:

- civil display date;
- source calendar system;
- jurisdiction or Church tradition;
- fixed versus movable observance;
- calendar conversion from the source date;
- local transfer or suppression of an observance.

A converted Gregorian date must not replace the original calendar context.

## Review cadence

- Dynamic official calendars: review after source or schema changes and at least annually.
- Patronages and stable historical identity claims: review when challenged, corrected or materially resourced.
- Official media links: review at least every 90 days.
- Aggregator-derived records: remain review-gated until independently confirmed.

## Enforcement

`npm run data:audit` performs the structural audit and reports editorial-quality warnings. Hard structural errors fail the quality pipeline. Editorial warnings remain visible until remediated and must not be silently reclassified.

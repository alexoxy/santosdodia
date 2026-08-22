# SantosDia v2 — Christian Daily Platform

Status: normative product roadmap
Effective: 2026-08-22

The machine-readable contract is `config/product-platform-contract.json`. If product, editorial or engineering work conflicts with that contract, the work is not ready to merge until the conflict is explicitly resolved.

## North star

SantosDia is not merely a directory of saints. It is a global Christian daily-life product whose purpose is:

> Open SantosDia and know how to live today as a Christian in your own tradition, place and language.

Portugal is the first quality anchor. It is not the architecture, the only jurisdiction, or the only language model.

User context has five independent dimensions:

1. locale/language;
2. location or ecclesial jurisdiction;
3. Christian tradition/Church;
4. calendar system;
5. timezone.

Never infer Church from country, country from language, or silently merge calendar systems.

## Product surfaces

### Today

The primary mobile surface. It resolves the user's context and answers what matters now: principal observance, other commemorations, liturgical context, prayer, Scripture references, a person or feast to understand, relevant live worship, and what comes next.

Today must never be empty when the selected published Church/calendar actually contains an observance.

### Calendar / Sync

Calendar is both exploration and distribution. Persistent ICS/webcal subscriptions are a core retention channel, not a utility hidden in settings. A user should be able to subscribe once and remain connected to SantosDia. Annual snapshots remain available for fixed archival use.

Every subscribed event should carry the correct tradition, jurisdiction, date semantics and a canonical SantosDia backlink. Calendar sync never depends on an advertising interaction.

### Pray

A contextual faith surface, not an undifferentiated prayer catalogue. It may expose daily prayer, Scripture references, devotions, novenas or offices only when the source, tradition and rights status support the use. Unknown reuse rights mean metadata/reference/link, not verbatim republication.

### Live

Live is a first-class frequency channel. Official Vatican streams are prominent in the initial Portugal/Catholic experience, alongside future verified official sources from other Churches. Live is visible on Today and Pray and also has a dedicated surface.

Every live item must state the source, Church/tradition, localised start time and status (`upcoming`, `live`, `ended`). A Vatican source must never be presented as normative for another Christian tradition.

### Discover

Discovery is the human-facing projection of the Christian Knowledge Graph: people, observances, dates, Churches, places, themes and evidence-backed guides. Pages exist because verified entities and relationships exist, not because a keyword generator can create them.

### Saved

Saved state stores stable canonical identities and re-resolves current localised display data. It must not persist an English label as if that were the identity.

## Architecture

The target architecture is:

**Christian Evidence Vault → Christian Knowledge Graph → Liturgical Context Engine → Multilingual Content → Live & Sync Distribution → Personal Faith Experience**

### Christian Evidence Vault — Dropbox

Dropbox is the durable evidence and recovery layer. External sources are acquisition inputs, never runtime dependencies.

Use the following conceptual layers:

- `raw`: legally retainable source responses and receipts;
- `normalized`: extracted source-specific facts without pretending they are canonical;
- `canonical`: reviewed stable identities, claims and relationships;
- `releases`: reproducible product snapshots;
- `changes`: source deltas and change detection evidence;
- `conflicts`: unresolved assertions requiring review;
- `rights`: reuse status and restrictions;
- `rollback`: receipts and last-known-good recovery evidence.

Where redistribution rights are unclear, preserve factual metadata, references, hashes and acquisition receipts rather than copying protected prose.

The product must remain usable if an external source disappears tomorrow.

### Christian Knowledge Graph

The conceptual model is no longer `saint = page`.

Core entities are:

- `Person` — stable historical identity;
- `Recognition` — saint, blessed, venerable, martyr or another status according to a competent Church;
- `Observance` — a liturgical commemoration or feast;
- `Occurrence` — an observance on a specific date/year/calendar/jurisdiction;
- `ChurchOrTradition`;
- `Jurisdiction`;
- `CalendarSystem`;
- `Place`;
- `ScriptureReference`;
- `PrayerOrDevotion`;
- `InstitutionOrOffice`;
- `Source`;
- `ClaimOrEvidence`;
- `LocalizedName`;
- `LocalizedEditorialContent`.

A person is not an observance. An observance is not an occurrence. Recognition by one Church is not automatically recognition by another.

This can remain relational in D1; “graph” describes the canonical model and relationships, not a requirement to buy another database.

## Stable corpus versus live deltas

The expensive global BUILD should happen once wherever possible.

A stable, reviewed historical identity does not need to be rediscovered every day. Keep it versioned and monitor only for exceptional corrections or newly authoritative evidence.

LIVE focuses on mutable classes:

- new saints, blesseds or other recognitions;
- recognition/canonisation/beatification changes;
- calendar membership;
- annual dates, transfers, ranks and precedence;
- jurisdiction changes;
- official display-name changes;
- corrections by competent sources;
- new official live events;
- rights-status changes.

Normal maintenance is delta detection, not repeated full crawling.

## Date and calendar contract

Dates are a product-critical domain and must be treated as typed data.

Never collapse:

- the person's birth/death chronology;
- the traditional or historical event date;
- the liturgical observance identity;
- the annual occurrence date;
- the user's civil date;
- a vigil beginning on the preceding civil day.

`Today` requires an explicit timezone. Liturgical output requires an explicit tradition and calendar system, plus jurisdiction where applicable.

Exact official annual dates override generic calendar calculations for the represented Church/jurisdiction. Transfers and precedence are authority-driven. A vigil is never automatically a same-day observance. Cross-calendar conversion requires an explicit tested policy.

The same canonical person may legitimately have different observance dates in different Churches or jurisdictions.

## Language and editorial contract

### General

Canonical identity is language-neutral. Names are localised evidence attached to that identity.

The user-facing locale must govern the whole surface: names, titles, categories, summaries, dates, navigation and metadata. There is no silent English fallback in a launched locale.

Machine translation may create research candidates but never a canonical saint name, official liturgical designation, prayer or interpretive text by itself.

All stored/display text is Unicode NFC-normalised.

### Portuguese (Portugal)

PT-PT is the first linguistic quality anchor.

Use natural Portuguese date forms, preferably through CLDR/`Intl`, for example:

`22 de agosto de 2026`

Month names are lowercase in running dates (`agosto`, never `Agosto` merely because it is a date), and particles remain lowercase (`de`, never `De`).

For compact Portuguese saint designations, `S.` is the generic abbreviation covering **São / Santo / Santa**. It may be used when consistent with the official Portuguese designation and product surface. Do not mechanically expand `S.` by a home-made grammar rule when a competent Portuguese source provides the form.

The full form **São / Santo / Santa** is source-driven and locale-specific. The system must not infer a universal expansion from the source language.

Liturgical/vocational qualifiers follow the name and are normally lowercase in running Portuguese, for example:

- `S. Gregório I, papa e doutor da Igreja`;
- `S. Mateus, apóstolo e evangelista`.

Do not invent a Roman numeral for the first holder of a name. Use a numeral only when the official designation or established tradition attests it. Traditional names may prevail where that is the established Portuguese form; identity and liturgical presentation remain separate.

For Portugal Roman Catholic liturgical display, Portuguese competent liturgical authority has priority for the local display form. Holy See sources remain primary for universal Catholic claims within their competence, and the Dicastery for the Causes of Saints is primary for Catholic recognition/cause status and related identity evidence.

### Other languages

Each public locale needs its own language-quality gate, script rules, official/local ecclesial sources where available, date grammar, punctuation and terminology. A Russian interface should present names in the appropriate Cyrillic form rather than exposing the source-language name. Equivalent discipline applies to Greek, Armenian, Arabic/Syriac, Ethiopic and other scripts.

Launch a locale only when it is complete enough to avoid mixed-language experiences.

## Source authority

Authority is claim-specific.

- competent Church/jurisdiction sources govern their own calendar and liturgical claims;
- the Holy See governs universal Catholic claims within its competence;
- the Dicastery for the Causes of Saints is A0 for Catholic cause/recognition status and official evidence in its remit;
- national/local liturgical authorities govern local presentation and jurisdictional calendars;
- OCA/GOARCH are sources for the Orthodox contexts they represent, not for Roman Catholic norms;
- Church of England/Common Worship governs its own represented Anglican context;
- Wikidata is useful for exact identity, external IDs, aliases and structured discovery, not as a liturgical authority;
- Wikipedia is discovery/context, never sole authority for recognition or feast-date claims.

Secondary sources may enrich discovery or propose facts but never silently override a competent primary source.

## SEO and AI distribution

SEO must emerge from verified knowledge relationships, not mass-generated thin pages.

An entity may exist canonically without receiving an indexable public page. Indexation requires substantive human value and publication readiness.

Public representations should converge semantically across:

- HTML;
- JSON-LD;
- JSON API;
- ICS;
- optional lightweight agent-oriented Markdown when useful.

A fact should retain source/provenance and last verification information. Public canonical URLs, structured data, sitemaps and internal links must be derived from the same knowledge model.

## Cost and runtime contract

Cloudflare remains deliberately designed for the free tier.

GitHub Actions is the build/OSINT factory. Dropbox is durable memory. D1 is serving knowledge. Cloudflare Workers are a thin edge/runtime layer. Prefer static/cached/materialised data for stable content over recomputation on every request.

No crawler, translation model or expensive agent belongs in the user request path.

Data-only changes must not trigger unnecessary Cloudflare Worker builds.

## AdSense contract

AdSense remains `PREPARING` during validation.

While it remains in validation:

- association/review/CMP code stays intact;
- ad serving remains disabled;
- no Auto Ads expansion;
- no mass thin-page generation for inventory;
- no product decision is made to manufacture ad impressions.

SantosDia must be a complete useful product without advertising. Later advertising is allowed only on substantive eligible surfaces through explicit product gates.

## Autonomous operating model

Prefer deterministic automation whenever deterministic code is sufficient. Use AI only where it adds material value to interpretation, language review or exception handling.

Operational responsibilities converge to eight roles:

1. `SourceMonitor` — checks only sources due for change detection;
2. `EvidenceArchivist` — preserves evidence, provenance, hashes and rights metadata;
3. `NormalizerResolver` — converts source assertions into canonical candidates and resolves known identities;
4. `CalendarEngine` — applies Church/jurisdiction/calendar rules;
5. `LanguageEditor` — validates locale-specific presentation and catches leakage;
6. `ContentSeoPublisher` — materialises only approved substantive public content and machine-readable projections;
7. `LiveCurator` — maintains verified live/upcoming official worship feeds;
8. `QualityHygieneSentinel` — tests semantics, source drift, performance budgets, dead code and regressions.

Routine operation is autonomous. Human approval remains permanently required for high-risk editorial decisions such as new canonical identities, merge/split, recognition-status changes, Church membership, calendar date/rank/precedence changes, Marian-title resolution, source conflicts and interpretive/hagiographic prose.

## Permanent hygiene rule

Every refactor should reduce or explicitly justify complexity.

Removal sequence:

1. inventory the old path;
2. prove current consumers and acceptance behaviour;
3. implement the replacement;
4. run semantic/equivalence tests;
5. build and smoke-test;
6. remove the obsolete route/script/workflow/component/data path;
7. rerun Quality and production health.

Never delete first and discover dependencies afterwards. Conversely, do not retain dead architecture indefinitely “just in case”.

The hygiene sentinel should progressively detect unused routes, obsolete workflows, dead code, unused CSS, unused dependencies and temporary compatibility paths.

## Execution roadmap

### R0 — Contract and audit

Freeze this product/engineering contract and audit current code against it. No new architecture is P0 unless it closes a product acceptance metric or is required to remove obsolete architecture.

### R1 — Perennial core and consolidation

Formalise Evidence Vault releases, map current schemas to Person/Recognition/Observance/Occurrence, consolidate overlapping automations, establish rollback/last-known-good contracts and retire superseded paths only after equivalence tests.

### R2 — Portugal / Roman Catholic reference experience

Make the mobile Today experience complete and coherent in PT-PT: liturgical context, celebration(s), prayer/references, knowledge, next event/live, tomorrow, Saved and prominent Calendar subscription. Desktop becomes a complementary exploration/study/configuration experience rather than a stretched mobile screen.

Acceptance: zero false-empty Today states, no mixed-language UI, no unreviewed thin content, stable ICS and clean mobile performance.

### R3 — ICS + Live retention

Promote persistent smart ICS/webcal and official Live to core acquisition/retention loops. Vatican live is prominent in the Portugal/Catholic experience; the schema remains multi-Church from day one.

Acceptance: persistent subscriptions survive annual change, backlinks resolve, live status/timezones are correct, no ad dependency.

### R4 — Prove multi-tradition architecture

Implement a real Orthodox experience using OCA/GOARCH authority boundaries, then a Church of England/Common Worship experience. Do not fake universality by translating the Roman calendar.

Acceptance: each tradition produces its own valid Today semantics, readings/references, fasting/office concepts where applicable, calendar context and ICS without cross-Church leakage.

### R5 — Multilingual scale

Scale source-backed names and localised content beyond PT/EN/ES/IT only through locale readiness gates. Every locale has script, grammar, date, punctuation and terminology validation.

Acceptance: zero silent English fallback and stable identity across all language projections.

### R6 — Organic/AI distribution

Materialise high-value person/date/observance/Church/place/guide pages from verified graph relationships; strengthen JSON-LD, API, sitemaps, internal linking and agent-friendly representations while keeping thin entities non-indexable.

### R7 — Autonomous maintenance

Move from repeated bootstrap crawling to delta monitoring. Accumulate clean shadow evidence, preserve last-known-good and automate safe known claim classes without globally enabling production mutation.

### R8 — Global scale

Add additional Churches/calendar families, places, shrines, pilgrimage, comparative calendar discovery and other faith-useful domains only when they reuse the same canonical pipeline rather than creating parallel architectures.

## Product acceptance metrics

The roadmap is judged by product behaviour, not workflow count:

- zero false-empty Today for launched contexts;
- zero silent language leakage in launched locales;
- persistent valid ICS for every published context;
- verified fresh official Live where coverage is claimed;
- semantically identical canonical results across Today, Calendar, JSON and ICS acceptance vectors;
- no external request-time data dependency;
- every sensitive claim has provenance;
- every Church remains authority-isolated;
- source failure preserves last-known-good;
- routine maintenance requires no human operator;
- Cloudflare remains within the deliberate free-tier architecture;
- AdSense validation boundaries remain intact;
- complexity per canonical entity falls as corpus size grows.

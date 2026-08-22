# SantosDia v2.1 — Global Christian Liturgical Intelligence Platform

Status: normative product direction
Effective: 2026-08-22
Supersedes the execution priority order in `christian-daily-platform-v2.md` while preserving its authority, language, evidence, hygiene, Cloudflare Free and AdSense constraints.

## What SantosDia is now

SantosDia has two inseparable product layers.

### Human product

> Open SantosDia and know what Christian day you are living, why it matters, how to pray it, what comes next, and how to stay connected — in your Church/tradition, place, calendar, timezone and language.

The daily experience remains the consumer North Star: Today, Calendar, Pray, Live, Discover and Saved.

### Liturgical infrastructure product

> Given a Christian tradition/Church, jurisdiction, calendar system, civil date/year, timezone and locale, SantosDia deterministically returns the applicable liturgical context, observances, annual occurrences, cycles, precedence result and machine-readable distribution outputs.

The liturgical engine is a first-class product surface for websites, calendar clients, developers, AI agents and search systems. It is not merely an internal helper for the Today page.

## Strategic moat

The market contains strong tradition-specific tools, feeds and calendars. SantosDia should not attempt to replace competent authorities. Its differentiated value is to provide one authority-aware interoperability layer across Christian traditions while preserving each tradition's own logic.

The moat is:

**evidence + perennial calculation + authority isolation + jurisdiction policy + multilingual identity + distribution + provenance**.

SantosDia must never create fake universality by translating or adapting the Roman Catholic calendar to another Church.

## Canonical context

Every calculation and publication is parameterised by independent dimensions:

1. `churchOrTradition`;
2. `jurisdiction`;
3. `calendarSystem`;
4. `civilDateOrYear`;
5. `timezone` when Today/current-day semantics are requested;
6. `locale` for presentation only.

Language never determines Church. Country never determines Church. Church never silently determines calendar system where multiple systems are legitimate.

## Perennial liturgical architecture

The architecture is:

**Christian Evidence Vault → Canonical Knowledge Graph → Tradition Kernel → Jurisdiction Policy → Candidate Observances → Precedence/Transfer Resolver → Occurrences → Localisation → HTML/API/ICS/JSON-LD**

### Tradition kernels

A kernel represents repeatable liturgical logic for one ecclesial family or competent tradition. Kernels share infrastructure but not theology-specific rules.

Initial and planned kernels:

- Roman Catholic: Gregorian computus, Roman liturgical year, Temporale/Sanctorale interaction, A/B/C Sunday cycle, I/II weekday lectionary cycle where applicable, rank, precedence, transfer and liturgical-colour rules;
- Orthodox/OCA: own Paschal cycle, calendar-system choice, fasting, tones/cycles and OCA authority boundaries;
- Greek Orthodox/GOARCH: Greek-tradition calendar/readings/fasting semantics, not assumed identical to OCA;
- Anglican/Church of England: Common Worship/BCP Christian year, lectionary cycles, transfer rules and Daily Prayer concepts.

Additional Christian kernels are added only when authoritative rules and acceptance vectors exist.

### Jurisdiction policy

The kernel calculates general structure. Jurisdiction policy controls competent local choices such as transferred celebrations, national/local calendars, particular ranks, local patrons and permitted adaptations.

A change of year must not require a code change. A change of official ecclesial rule is a source-delta event and requires review-by-exception.

## Civil year versus liturgical year

The system must explicitly expose both. A civil date belongs to exactly one civil year but may belong to a liturgical year that began in the preceding civil year.

For every date/context, machine output should distinguish where applicable:

- `civilDate`;
- `civilYear`;
- `liturgicalYear`;
- `sundayLectionaryCycle`;
- `weekdayLectionaryCycle` and whether it applies to that date;
- `season`;
- `seasonWeek`;
- `calendarSystem`;
- `jurisdictionPolicy`;
- `principalObservance` and other valid observances;
- `precedenceDecision`;
- `transferDecision`;
- `liturgicalColourDefault`;
- `liturgicalColourResolved` after the actual celebration is known.

Do not infer final vestment/liturgical colour from season alone. Celebration type, martyr/apostle status, local policy and precedence can override the seasonal default. Optional colours must remain optional, not be presented as mandatory.

## Perennial annual generation

Annual calendars are generated from versioned rules and canonical observances, not typed in year by year.

Official annual calendars are:

- authority evidence;
- regression vectors;
- transfer/precedence verification;
- source-change detection inputs.

They are not request-time runtime dependencies.

### Rolling materialisation window

Serving/materialised annual data follows a rolling civil-year window:

**current civil year − 1 through current civil year + 3**.

Example: during 2026, materialise 2025–2029. When the system enters 2027, materialise 2026–2030 and retire 2025 from the serving window.

The hygiene operation is automatic and idempotent:

1. determine current civil year in the configured operational timezone;
2. ensure all required contexts have materialised releases for `Y-1 ... Y+3`;
3. verify semantic/hash/authority gates;
4. update serving pointers atomically;
5. remove years older than `Y-1` from disposable serving caches/materialised runtime datasets;
6. never delete immutable Evidence Vault releases, provenance, receipts or historical canonical occurrences merely because they left the serving window;
7. alert only on failed generation, semantic drift or authority conflict.

No annual human maintenance job is required.

## Calendar subscription as retention infrastructure

ICS/webcal is a core product, not an export button.

### Rolling subscription

A subscription URL without an explicit year is persistent. It serves the rolling window and updates automatically as the year advances.

Each event must contain:

- stable UID;
- date semantics appropriate to the calendar;
- localised summary;
- Church/tradition and jurisdiction metadata where supported by ICS conventions;
- `URL` pointing back to the canonical SantosDia day/observance page;
- source/provenance reference where useful and safe;
- refresh guidance.

The feed should refresh without the user re-subscribing. This creates the retention loop:

**discover SantosDia → subscribe once → event appears in personal calendar → canonical event link returns user to SantosDia**.

### Annual snapshot

A URL with an explicit year remains a fixed snapshot for archival/import use. It must not be confused with the persistent subscription.

## Public Liturgical Calculator

The calculator is a first-class acquisition and utility surface.

Human surface:

- choose Church/tradition;
- jurisdiction;
- calendar system;
- year or date;
- language;
- display liturgical year, season, week, cycles, key movable feasts, precedence explanation and colours where the represented tradition supports them;
- subscribe to the matching rolling calendar;
- download a fixed annual snapshot.

Machine surface:

- deterministic JSON API;
- OpenAPI;
- CORS where safe;
- agent-readable discovery metadata;
- stable canonical codes independent of translation;
- no request-time acquisition from external ecclesial sites.

## Product surfaces and their jobs

### Today — daily value

The primary mobile surface. It should answer:

**What Christian day is this for me? What is celebrated? Why? How can I pray/live it? What is live now or next? What happens tomorrow?**

### Calendar + Calculator — utility and acquisition

Calendar explores dates; Calculator explains the rules and predicts future dates. Both lead naturally to persistent subscription.

### ICS — retention

Persistent presence in the user's own calendar with canonical backlinks.

### Live — frequency

Verified official worship/live events provide a reason to return now. Live authority is Church-specific.

### Pray — practice

Contextual prayer, office and Scripture references, respecting rights and Church semantics.

### Discover — organic depth

Evidence-backed people, observances, Churches, places, dates and guides. No thin-page factory.

### API / AI — distribution

Other systems should be able to query SantosDia as liturgical infrastructure without scraping human pages.

## Distribution flywheel

**authoritative sources → Evidence Vault → perennial kernels → rolling releases → Today/Calendar/API/ICS → SEO/AI discovery → subscription → recurring calendar backlinks → return to SantosDia**

Live adds a second return loop:

**Today/notification/calendar → verified live event → return now**.

## Source governance

Sources have explicit roles:

- A0/A1 competent ecclesial sources: normative rules, calendars, rank, precedence, recognition and jurisdictional claims within their competence;
- independent computational/academic references: algorithm cross-checks and historical understanding;
- high-quality denominational/devotional educational sources: explanation and discovery only unless competent for the specific claim;
- third-party calculators: regression/oracle comparison, never silent authority.

Source monitoring detects normative change. Normal annual generation does not need source re-fetching to function.

## Revised priority order

### P0 — Reliability and operational hygiene

- production errors are diagnosed immediately;
- preserve useful raw evidence even when a bounded acquisition is partial;
- publication remains fail-closed;
- resolved error emails are removed only after positive proof;
- maintain Cloudflare Free, AdSense PREPARING and last-known-good.

### P1 — Perennial liturgical intelligence core

- finish Roman Catholic rank/precedence/transfer/colour semantics;
- formalise civil-year ↔ liturgical-year mapping;
- implement rolling materialisation `Y-1 ... Y+3` and automatic hygiene;
- generate complete annual calendars from rules + canonical observances;
- reach 389/389 semantic equivalence for Portugal 2026 before replacing the old read model;
- verify additional years without hand-entering annual dates.

### P2 — Rolling ICS + calculator product

- generate persistent context-specific ICS from the same engine;
- canonical backlinks on every event;
- annual snapshots remain available;
- calculator exposes subscription CTA and machine API;
- human and machine outputs share identical semantics.

### P3 — Portugal reference daily product

- rebuild Today mobile around the new engine;
- complete PT-PT context, observances, prayer/references, next/tomorrow and Live;
- desktop focuses on research, comparison and configuration;
- zero false-empty and zero language leakage.

### P4 — Prove multi-tradition kernels

- OCA then GOARCH as separate Orthodox authority contexts;
- Church of England/Common Worship;
- each kernel gets official acceptance vectors, ICS and API before public launch;
- no cross-Church semantic leakage.

### P5 — Global jurisdictions and multilingual scale

- add jurisdictions as policy overlays, not forks of kernels;
- add locales only through readiness gates;
- preserve stable identity across scripts and languages;
- generate the same years and subscriptions for every supported context.

### P6 — Live, SEO and AI scale

- verified official Live per Church/context;
- high-value entity/date/observance/place pages;
- JSON-LD/API/OpenAPI/agent discovery from the canonical graph;
- strong organic acquisition without thin content.

### P7 — Autonomous maintenance at scale

- delta-only source monitoring after bootstrap;
- automated rolling-year generation and cache hygiene;
- automated dead-code/workflow detection;
- human review remains exception-only for high-risk theological/editorial/authority changes.

## What is explicitly not the priority

Until P1/P2 are stable, do not prioritise:

- mass saint biography generation;
- additional decorative frontend sections;
- broad locale launches without complete data;
- arbitrary new agents/workflows when deterministic code suffices;
- paid infrastructure;
- ad-placement optimisation;
- replacing the current production calendar before semantic equivalence is proven.

## Product acceptance metrics

- annual calendar generation requires zero routine human intervention;
- rolling serving window always covers `Y-1 ... Y+3` for launched contexts;
- no serving-cache deletion can delete canonical/Vault history;
- 100% semantic agreement across canonical engine, Today, Calendar, API and ICS for launched contexts;
- persistent ICS survives year boundaries without re-subscription;
- every ICS event has a valid SantosDia backlink;
- zero false-empty Today states;
- zero silent language leakage;
- Church, jurisdiction and calendar-system boundaries never leak;
- normative changes are detected and reviewed; normal year rollover is autonomous;
- no request-time external acquisition;
- Cloudflare remains deliberately free-tier compatible;
- source failure preserves last-known-good;
- complexity per new year approaches zero and complexity per new jurisdiction decreases as shared kernels mature.

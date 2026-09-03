# SantosDia v2.1 — Global Christian Liturgical Intelligence Platform

Status: normative product direction
Effective: 2026-08-22
Last strategic alignment: 2026-09-03
Supersedes the execution priority order in `christian-daily-platform-v2.md` while preserving its authority, language, evidence, hygiene, Cloudflare Free and AdSense constraints.

## Normative continuity

This document is the binding, cumulative vision for SantosDia until its acceptance metrics and strategic scope are implemented in full. A delivered component, execution snapshot, cycle report or tactical priority is evidence of progress against this vision; it cannot narrow, replace or reinterpret the remaining scope.

No section becomes obsolete merely because a later section has started. Work advances by additive completion and verified retirement of superseded implementation paths. This document may be superseded only by a later normative strategy explicitly approved as such by the product owner.

## Repository simplicity, hygiene and security

The repository should contain the smallest complete system that implements this vision safely. Prefer one active implementation, one authoritative workflow and one canonical contract for each responsibility. New code must reuse or deliberately replace existing paths; it must not create permanent parallel architecture without a documented compatibility need and retirement gate.

Repository hygiene is continuous:

- close duplicate, superseded or abandoned pull requests and issues with a recorded reason;
- keep an open pull request or issue only when it has a current purpose and next action;
- remove merged, zero-difference or obsolete branches when no unique work remains;
- remove unused code, CSS, dependencies, routes, scripts, workflows and compatibility layers only after consumer inventory, replacement, semantic-equivalence tests, complete CI and smoke verification;
- preserve recoverability through Git history and immutable evidence, not through indefinitely active dead paths;
- never delete Evidence Vault objects, canonical history, receipts, provenance or rollback material as routine repository cleanup;
- use least-privilege permissions, pinned/trusted automation dependencies, secret-safe logs and fail-closed publication;
- run dependency, workflow and security hygiene as part of each development cycle rather than allowing a periodic backlog to form.

Simplicity is measured by fewer active paths and lower operational burden, not by deleting required authority, audit or safety boundaries.

## What SantosDia is now

SantosDia has two inseparable product layers.

### Human product

> Open SantosDia and know what Christian day you are living, why it matters, how to pray it, what comes next, and how to stay connected — in your Church/tradition, place, calendar, timezone and language.

The daily experience remains the consumer North Star: Today, Calendar, Pray, Live, Discover and Saved.

### Text-first delivery contract

SantosDia is an intelligence and reading product, not an image product. The public first-party experience is deliberately textual: semantic HTML, clear typography, simple CSS, accessible controls and text/Unicode symbols. Its sophistication belongs in the evidence, algorithms, source governance, calendar engine, localisation and automation behind the interface.

Do not add editorial photography, saint portraits, hero images, thumbnails, galleries, illustrations, animated imagery, decorative audio or non-live video. CSS colour, borders and gradients may create hierarchy when they add no media request. Favicon and manifest icons are browser metadata, not visible content exceptions.

Verified livestream is the sole first-party audiovisual content type. A live surface must expose useful text, its Church/tradition, verification status and an official external link before any embed loads. The privacy-enhanced player loads only after explicit user activation; no livestream thumbnail or player dependency may burden the initial textual page.

Advertising is a separate third-party delivery boundary and does not relax the first-party text-only contract. While AdSense remains PREPARING, ad serving stays disabled. After approval, any allowed unit remains consent-aware, lazy, manual, non-overlay and subordinate to reading performance.

The delivery architecture follows the same principle: compute and verify heavily outside the request path, then serve compact structured text. Prefer server-rendered output; client JavaScript exists only for interactions that materially require it, including context preferences, search, saved items, calendar actions and user-activated livestream.

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

## Expansion sequence: Portugal → Lusophone jurisdictions → global

Portugal is the reference-grade proving ground, not a hidden global default. The first complete context remains Roman Catholic / Portugal / Gregorian / Europe-Lisbon / pt-PT because it provides a bounded authority set, an official annual comparison corpus and a demanding language-quality anchor.

The next expansion ring is Portuguese-speaking jurisdictions, including CPLP/PALOP contexts, selected by evidence readiness rather than by market label alone. CPLP and PALOP are useful discovery and localisation groupings; they are not ecclesiastical authorities. Every country or competent local Church therefore receives its own jurisdiction policy, source pack, annual acceptance vectors and localised-name review. A Portugal overlay must never be copied and translated as if it were a Brazilian, Angolan, Mozambican or other local calendar.

The global sequence is:

1. prove Portugal at full semantic equivalence;
2. reuse the Roman kernel across evidence-ready Lusophone jurisdictions while keeping jurisdiction and locale independent;
3. prove separate OCA, GOARCH and Church of England kernels with their own authorities;
4. expand jurisdictions, languages and calendar systems through the same readiness gate;
5. expose every launched context consistently through Today, Calendar, Calculator, API and ICS.

A jurisdiction/locale pair is public only when it has:

- a competent authority map and versioned source bindings;
- perennial rule coverage plus official annual regression vectors;
- precedence/transfer and calendar-system tests;
- reviewed public names with no silent language fallback;
- identical HTML, API and ICS semantics;
- a false-empty-safe Today experience;
- source-delta monitoring, rollback and last-known-good evidence.

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

## Strategic clarification — 2026-09-03: durable corpus, honest readiness and AdSense recovery

The current phase is a **bootstrap/backfill phase**, not a permanent synchronization race. SantosDia should capture the maximum useful authoritative evidence permitted by source rights in bounded, resumable releases; archive raw evidence or metadata/reference/hash substitutes in Dropbox; normalize and reconcile it into SantosDia canonical knowledge; and generate durable first-party calendar, biography and contextual products from that owned data plane. Public requests never fetch ecclesial sources.

After a source/context reaches a completeness receipt, recurring full sweeps stop. Normal maintenance becomes source-delta work **once per month, distributed across separate weeks/days**, with only two lightweight weekly exceptions: production health and source freshness/verified Live. A specific official normative change may trigger one bounded event-driven review. Source failure preserves last-known-good.

The public product must distinguish three states:

- **ready** — a context has verified authority coverage, calendar semantics, locale quality and HTML/API/ICS parity;
- **reviewed preview** — useful evidence-backed records can be explored, but a complete calendar subscription is not promised;
- **planned** — the Church, jurisdiction or locale is in the architecture but not yet public.

Portugal Roman Catholic is the current ready reference context. Other Christian traditions must not be advertised as ready-made subscriptions until their own authority-isolated kernel and acceptance vectors pass. Coptic Orthodox is an explicit planned kernel alongside OCA, GOARCH and Church of England; Armenian, Ethiopian and Syriac contexts remain valid future families, never Roman adaptations.

Calendar computation preserves three separate coordinates: the source Church's native ecclesial calendar, SantosDia's versioned canonical rule representation, and the explicit civil-date projection used by devices and ICS. Gregorian display must never silently overwrite Julian, Revised Julian, Alexandrian/Coptic or other native semantics.

“Maximum languages” is a data-model and pipeline goal, not permission to publish thin machine-translated pages. Each locale and each Church/jurisdiction/calendar context passes an independent readiness gate. Deterministic bots perform acquisition, normalization, identity, computus, precedence, transfer, export and drift detection; original interpretive or biographical prose remains reviewed first-party SantosDia work.

The market gap is not another generic list of saints or a proxy for existing calendar providers. SantosDia's defensible product is authority-isolated cross-tradition interoperability: one provenance-aware canonical graph, transparent calendar calculations, local jurisdiction overlays, original contextual pages, verified Live, and semantically identical human, API, JSON-LD and ICS outputs.

AdSense recovery is therefore a product-quality gate. A new review is blocked until representative production entry pages demonstrate substantial first-party value, navigation and method/source transparency; public capability claims are honest; placeholders, false-empty states and thin mass-indexed pages are absent; production has been reverified and recrawled; and a human explicitly decides to resubmit. Internal CI or record count alone is insufficient.

## Execution snapshot — 2026-08-23

The last development cycle converted several strategy items from intention into enforced infrastructure:

- the first-party text-only surface is now a CI contract; verified livestream remains the sole audiovisual exception and loads only after activation;
- rolling materialisation and rolling ICS cover civil year `Y-1 ... Y+3`;
- the public liturgical calculator, civil/liturgical-year mapping, Roman Temporale generation, precedence, colour and transfer scheduling share one deterministic core;
- the first source-bound Sanctorale shadow rules now compose General Roman, European and Portugal jurisdiction policy and generate multiple years without annual hand-entry;
- publication remains fail-closed while the new engine runs in shadow against the Portugal acceptance corpus.

The release gate has not changed: expand the Sanctorale and reconcile the complete Portugal 2026 corpus before replacing the current public read model. P2 foundations exist; the immediate product path is P1 semantic parity, then a compact text-first Today rebuild, while ICS/API hardening continues from the same engine.

Operational alerts follow one atomic closure routine:

1. read the complete alert;
2. diagnose the actual failing step and preserve useful evidence;
3. fix through reviewed GitHub changes;
4. validate a positive workflow execution;
5. confirm the promised external effect, such as a verified Dropbox archive receipt;
6. move the resolved alert to Trash only after that proof.

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

- rebuild Today mobile around the new engine as a compact text-first reading surface;
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
- photographs, portraits, thumbnails, galleries, decorative animation/audio or non-live video;
- remote fonts, media libraries or visual assets that add network weight without liturgical value;
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
- zero first-party image, audio or non-live video assets on public content surfaces;
- verified livestream remains text-first until explicit user activation and uses a privacy-enhanced embed;
- zero silent language leakage;
- Church, jurisdiction and calendar-system boundaries never leak;
- normative changes are detected and reviewed; normal year rollover is autonomous;
- no request-time external acquisition;
- Cloudflare remains deliberately free-tier compatible;
- source failure preserves last-known-good;
- complexity per new year approaches zero and complexity per new jurisdiction decreases as shared kernels mature.

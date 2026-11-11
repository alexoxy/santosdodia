# SantosDia — Product Reference v1

## Global calendar context decision — 2026-10-18

The [global calendar context contract](global-calendar-context-contract.md) governs country/calendar selection independently of language and Church/rite. A country can map to several approved calendars; an authority can cover several countries. One person can have multiple observances with different local ranks. The Joana case and cross-surface acceptance examples are mandatory reference scenarios for global rollout. This decision extends the data contract below with explicit rite, institutional calendar and validity context; it does not assert that every dimension is already implemented.

_Status: implementation reference · 2026-08-11_

## Product

SantosDia is a free, global, multilingual, mobile-first Christian calendar service for Churches that formally maintain saints, blesseds, martyrs, commemorated persons or equivalent liturgical commemorations.

The public product answers five questions:

1. Who is commemorated today in my Church and jurisdiction?
2. What is the liturgical calendar for today and another date?
3. When and where is a person or feast commemorated?
4. Which pilgrimages, romarias, shrines and recurring celebrations are associated with the calendar?
5. Which official celebrations can be watched live?

Complex theology, calendar conversion, provenance and multilingual identity resolution belong in the data platform. The user interface must remain simple.

## Original v1 navigation reference

The following five destinations describe the original v1 proposal, not a current fixed navigation count. The cumulative product surface scope in [the normative v2.1 vision](product/global-liturgical-intelligence-v2.1.md#product-surfaces-and-their-jobs) also includes Pray, Saved, Calculator and API. Preserve all required capabilities; validate their mobile grouping under E22 rather than deleting scope to match this historical list:

- **Today** — current date, selected Church, jurisdiction and verified observances.
- **Calendar** — day-first browsing, then month view, with smart ICS/webcal subscription.
- **Search** — person, date, Church, place and patronage lookup.
- **Pilgrimages** — shrines, pilgrimages, romarias and recurring celebrations by date/place.
- **Live** — verified official live streams and upcoming broadcasts.

Desktop may expose secondary institutional/developer navigation, but mobile must not require it.

## Product scope

SantosDia does not manufacture a universal sanctoral. A person appears in a Church calendar only when an authoritative source for that Church or jurisdiction establishes the observance.

Person identity is global. Ecclesial recognition and liturgical observance are Church-scoped assertions. Founder, reformer, pioneer, prophet, theologian or leader are not aliases for saint.

## Data contract

Minimum canonical entities:

- `church_body`
- `jurisdiction`
- `calendar_system`
- `person`
- `localized_name`
- `ecclesial_recognition`
- `observance`
- `place`
- `pilgrimage_event`
- `official_stream`
- `source`
- `assertion`
- `evidence`

Every material calendar fact must retain source, Church/jurisdiction, original term/date rule, retrieval time and publication state.

## Localization

Identity is never translated at request time. Each entity has validated labels by locale/script. Preference order:

1. official Church label in the requested language;
2. another authoritative religious/institutional label;
3. validated authority-data label;
4. controlled transliteration;
5. clearly marked fallback.

Interface/date formatting follows locale standards. Religious terminology is Church-scoped where required. Translation memory prevents repeated re-translation of stable terms.

## Global Baseline v1

The first baseline is deliberately heavier than future maintenance:

1. build Church registry;
2. build and approve source registry;
3. acquire immutable raw baseline to Dropbox;
4. normalize calendars Church by Church;
5. resolve global person/place identities;
6. validate localized names and date conversions;
7. import to D1 staging;
8. publish a measured baseline to D1 production.

Coverage is global by architecture and by major Church families; it does not require every local parish or event before launch.

## Incremental operation after baseline

The source orchestrator runs on the monthly distributed acquisition schedule and determines which sources are due. The separate hourly development task advances the delivery backlog; it does not increase source-acquisition frequency.

`DUE SOURCE → CHEAP CHANGE CHECK → NO_CHANGE | FETCH → RAW → NORMALIZE → RESOLVE → LANGUAGE/TEMPORAL GATES → D1 STAGING → AUTO-PROMOTION WHEN SAFE`

After bootstrap, calendar, biography and patronage acquisition uses monthly distributed delta checks. Lightweight operational/live health checks may run more frequently. Hourly development orchestration does not imply hourly source acquisition.

On failure the platform retains last-known-good production data. New data never causes a Cloudflare Worker build unless application code/schema actually requires deployment.

## Launch acceptance criteria

Product v1 is usable when a mobile visitor can:

- open the correct local `Today` without timezone ambiguity;
- choose Church/rite, country/calendar and language independently, with verified local or institutional refinements where supported;
- see verified observances with Church terminology;
- browse another date in a mobile-native calendar/agenda;
- search by person/date/place;
- subscribe to a filtered smart calendar;
- discover initial verified pilgrimage destinations/events;
- open verified official live streams;
- see source/provenance context where relevant.

## Non-goals before v1

No social network, comments, gamification, long devotional corpus, AI chat surface, broad encyclopedia expansion or additional agent lanes unless they directly improve Today, Calendar, Search, Pilgrimages, Live or the Global Baseline.

## Final-product acceptance clarification — 2026-10-18

Follow [the final-product acceptance criteria](product/final-product-acceptance-2026-10-18.md) for global coverage, calendar equivalence, demographic language selection, archived algorithms, evidence-first biographies, patronage search, official live streams and monthly maintenance. Documentation is not proof of runtime delivery.

## Reconciled policy references

Use [the policy reconciliation matrix](product/policy-reconciliation-2026-10-18.md) to resolve historical references to media, serving windows, navigation, cadence and monetization.

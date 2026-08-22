# SantosDia — Product and Retention Architecture

Status: implementation plan / product architecture
Date: 2026-08-22

## Product thesis

SantosDia is a **global, mobile-first Christian calendar and discovery product**. Portugal is the initial quality anchor, not the product boundary. Language, Christian tradition, jurisdiction and calendar system are independent dimensions and must never be silently collapsed.

The product is organised around five recurring user jobs:

1. **Today** — Who is celebrated today, in my tradition, jurisdiction, language and timezone?
2. **Understand** — Who is this person or observance, why is it remembered, and what is historically certain?
3. **Pray / prepare** — What prayer, reading, devotion or novena is associated with this celebration, where rights allow?
4. **Discover** — Which saints relate to my name, profession, intention, geography, century, order, virtue or life situation?
5. **Return** — What is coming next, what am I following, and what should I continue tomorrow?

## Global context model

Every user-facing result is resolved from four independent dimensions:

- **Locale** — language and local editorial presentation.
- **Tradition** — Roman Catholic, Orthodox, Anglican or another supported Christian tradition.
- **Jurisdiction** — country, episcopal conference, patriarchate, local church or competent authority.
- **Calendar system** — Gregorian, Julian, Revised Julian or source-declared equivalent.

Rules:

- Portuguese language does not imply Portugal.
- English language does not imply the United States.
- Country does not imply a Christian tradition.
- A saint identity is global; names and observances are localised/source-specific presentations of that identity.
- A locale is exposed publicly only after its UI, calendar, names, source provenance and product-critical copy pass quality gates.

## Navigation architecture

Primary mobile navigation converges on five destinations, translated in each ready locale:

- **Today** — personalised daily home
- **Calendar** — month/day and tradition-aware calendar
- **Discover** — search + thematic discovery
- **Pray** — prayers, novenas and scripture links where validated
- **Saved** — followed saints, novenas, dates and reminders

Secondary navigation:

- Chronology
- Christian traditions
- Places
- Names
- Marian titles / Our Lady
- Sources and methodology
- Pilgrimages
- Live / institutional feeds

## Today screen

Above the fold:

- local date using the user's timezone
- selected tradition and jurisdiction context
- primary saint/observance card
- portrait/icon only when rights and source are valid
- 2–3 sentence original SantosDia summary
- celebration rank / tradition / jurisdiction
- primary CTA: **Know / Learn more**
- secondary CTA: **Save**

Below the fold, progressively disclosed:

1. Other observances today
2. Why this day matters
3. Readings — jurisdiction-specific references first; full text only with valid rights basis
4. Prayer/devotion, when validated
5. Novena starting today / currently in progress
6. On this day across other Christian traditions
7. Tomorrow preview

## Saint page

Canonical modules:

1. Identity and preferred local display name
2. Why remembered
3. Life — concise, sourced, original synthesis
4. Timeline
5. Patronage / intentions (typed as tradition or devotion)
6. Symbols and iconography
7. Places and map
8. Liturgical observances by tradition and jurisdiction
9. Readings associated with each celebration
10. Prayer/devotion
11. Novenas
12. Related saints
13. Other traditions
14. Sources and evidence

The saved object is the language-neutral identity. When the user changes locale, the display name is resolved again from validated evidence for that locale.

Marian-title pages must use a Marian-title entity, never a duplicate person entity for Mary.

## Discovery architecture

Discovery should expose facets rather than a generic article list:

- By name
- By date
- By century / historical era
- By geography
- By vocation / profession
- By patronage / intention
- By virtue / life theme
- By religious order
- By tradition
- Shared across traditions
- Marian titles

## Chronology

Chronology is a first-class product view. Timeline events must distinguish:

- birth
- death
- martyrdom
- major life event
- beatification
- canonisation
- feast establishment
- observance date
- traditional date

Precision is explicit: exact, month/year, year, range, century, circa, traditional, symbolic or unknown.

Historical chronology belongs to the person identity; liturgical events retain tradition and jurisdiction metadata.

## Scripture and lectionary layer

Model separately:

- reading reference
- lectionary/jurisdiction
- Proper vs Common
- reading text
- rights status

Use the competent liturgical authority for the selected jurisdiction. Do not substitute the US lectionary for England, Brazil for Portugal, or one Orthodox jurisdiction for another.

Portugal uses the Secretariado Nacional de Liturgia as the primary A1 source for its Roman Catholic calendar and liturgical reading metadata. Equivalent official authorities are selected per geography/tradition.

## Devotional layer

Prayers and novenas are not canonical identity evidence. Store:

- tradition
- jurisdiction when relevant
- locale
- source
- type
- rights status
- associated saint/observance
- schedule basis for novenas

Unknown rights => metadata/link only.

## Retention loops

### Daily loop

Today → saint → save/follow → tomorrow preview → notification/reminder → return.

### Novena loop

Upcoming feast → novena starts → day 1…9 progress → feast day → related saint content.

### Personal-calendar loop

Follow saint/date → add ICS / reminder → annual recurrence → return.

### Discovery loop

Intent/name/profession/geography → saint → related saints → save → daily content.

### Learning loop

Saint → century → contemporaries → historical context → chronology → next saint.

### Cross-tradition loop

Saint → how another tradition remembers the same identity → different date/title/readings → follow the tradition or return to Today.

## Engagement rules

- No dark patterns.
- No forced account before value is demonstrated.
- Guest saves work locally first; account sync is optional later.
- Notifications are opt-in and granular.
- Never use spiritual anxiety as a retention mechanism.
- Patronage and devotional claims are phrased as tradition/devotion, not guarantees.
- Locale and jurisdiction changes are always reversible and visible.

## Mobile UX principles

- Today’s primary answer visible without scrolling.
- Bottom navigation reachable with one thumb.
- Progressive disclosure instead of long encyclopaedia pages.
- Sticky date/tradition/jurisdiction context on day pages.
- Search accepts localised names and aliases but identity resolution remains QID/source based.
- Typography optimised for reading; no dense dashboard UI.
- Images support identity and devotion but never block content loading.
- Fast first render; core Today content must not depend on request-time external acquisition.
- The interface is translated separately from canonical saint naming: UI localisation may be translated; saint names remain source-backed.

## Traction priorities

1. Excellent indexable day pages with canonical locale/tradition/jurisdiction semantics.
2. High-quality golden-set saint pages rather than mass thin pages.
3. Internal linking: day ↔ saint ↔ timeline ↔ geography ↔ patronage ↔ tradition.
4. Shareable saint/day cards with canonical locale-aware URLs.
5. ICS add-to-calendar for observances and novena starts.
6. Opt-in reminders for followed saints and novenas.
7. Search landing pages for high-intent queries: saint names, name days, professions, patronages and feast dates.
8. Long-tail discovery pages only after source coverage is sufficient.

## Global rollout gates

### Gate 1 — Portugal quality anchor

- current production pipeline green
- pt-PT official calendar and nomenclature stable
- Today shell implemented
- mobile retention navigation implemented
- no new public thin pages
- first 30–50 reviewed golden-set pages

### Gate 2 — English / Spanish / Italian parity

- official jurisdiction-specific source coverage
- full retention UI copy
- source-backed localised names
- equivalent Today / Calendar / Discover / Pray / Saved experience

### Gate 3 — French / German

- official liturgical authority coverage
- locale-specific language/naming rules
- complete product-copy and search quality tests

### Gate 4 — Polish / Russian / Filipino / Swahili

- competent local ecclesial sources
- morphology and naming policies
- complete UI localisation
- jurisdiction-aware calendars

A locale remains internal/noindex until its gate is met.

## Retention rollout

### Product foundation

- Today shell
- mobile navigation
- local-first Saved state
- no account required

### Golden set

- 30–50 reviewed saint pages
- timeline + sources + related content
- prayers/readings only where rights status permits
- Marian-title model validated

### Habit features

- ICS export
- novena progress
- optional reminders
- tomorrow preview
- followed-saint anniversary reminders

### Discovery scale

- chronology
- intention/patronage discovery
- name discovery
- geography and tradition cross-navigation
- broader multilingual expansion

## Source-to-product rule

Sources are classified by **what they can authoritatively establish**, not by a single global score. A source can be authoritative for liturgy but not for canonisation, useful for editorial discovery but not factual publication, or useful for prayer inventory while lacking republication rights.

Canonical/evidential source classes and editorial/devotional source classes must remain separate in storage and publication logic.

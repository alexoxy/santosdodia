# SantosDia — Product and Retention Architecture

Status: implementation plan / product architecture
Date: 2026-08-22

## Product thesis

SantosDia is not only a daily saint lookup. It is a mobile-first Christian calendar and discovery product organised around five recurring user jobs:

1. **Today** — Who is celebrated today, in my tradition, jurisdiction, language and timezone?
2. **Understand** — Who is this person or observance, why is it remembered, and what is historically certain?
3. **Pray / prepare** — What prayer, reading, devotion or novena is associated with this celebration, where rights allow?
4. **Discover** — Which saints relate to my name, profession, intention, geography, century, order, virtue or life situation?
5. **Return** — What is coming next, what am I following, and what should I continue tomorrow?

## Navigation architecture

Primary mobile navigation should converge on five destinations:

- **Hoje** — personalised daily home
- **Calendário** — month/day and tradition-aware calendar
- **Descobrir** — search + thematic discovery
- **Rezar** — prayers, novenas and scripture links where validated
- **Guardados** — followed saints, novenas, dates and reminders

Secondary navigation:

- Cronologia
- Tradições cristãs
- Lugares
- Nomes
- Nossa Senhora
- Fontes e metodologia

## Today screen

Above the fold:

- local date and liturgical context
- primary saint/observance card
- portrait/icon only when rights and source are valid
- 2–3 sentence original SantosDia summary
- celebration rank / tradition / jurisdiction
- primary CTA: **Conhecer**
- secondary CTA: **Guardar**

Below the fold, progressively disclosed:

1. Other observances today
2. Why this day matters
3. Readings — references first; full text only with valid rights basis
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
9. Readings associated with the celebration
10. Prayer/devotion
11. Novenas
12. Related saints
13. Other traditions
14. Sources and evidence

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

## Scripture and lectionary layer

Model separately:

- reading reference
- lectionary/jurisdiction
- Proper vs Common
- reading text
- rights status

For Portugal, the Secretariado Nacional de Liturgia is the primary A1 source for calendar and liturgical reading metadata. Other national jurisdictions retain their own lectionaries and wording.

## Devotional layer

Prayers and novenas are not canonical identity evidence. Store:

- tradition
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

## Engagement rules

- No dark patterns.
- No forced account before value is demonstrated.
- Guest saves should work locally first; account sync is optional later.
- Notifications are opt-in and granular.
- Never use spiritual anxiety as a retention mechanism.
- Patronage and devotional claims must be phrased as tradition/devotion, not guarantees.

## Mobile UX principles

- Today’s primary answer visible without scrolling.
- Bottom navigation reachable with one thumb.
- Progressive disclosure instead of long encyclopaedia pages.
- Sticky date/tradition context on day pages.
- Search accepts localised names and aliases but identity resolution remains QID/source based.
- Typography optimised for reading; no dense dashboard UI.
- Images support identity and devotion but never block content loading.
- Fast first render; core Today content should not depend on request-time external acquisition.

## Traction priorities

1. Excellent indexable day pages with canonical locale/tradition semantics.
2. High-quality golden-set saint pages rather than mass thin pages.
3. Internal linking: day ↔ saint ↔ timeline ↔ geography ↔ patronage.
4. Shareable saint/day cards with canonical URLs.
5. ICS add-to-calendar for observances and novena starts.
6. Opt-in reminders for followed saints and novenas.
7. Long-tail discovery pages only after source coverage is sufficient.

## Rollout gates

### Gate 1 — product foundation

- current production pipeline green
- source and identity model stable
- Today shell implemented
- mobile navigation implemented
- no new public thin pages

### Gate 2 — golden set

- 30–50 reviewed saint pages
- timeline + sources + related content
- prayers/readings only where rights status permits
- Marian-title model validated

### Gate 3 — retention

- guest saves
- ICS export
- novena progress
- optional reminders
- tomorrow preview

### Gate 4 — discovery scale

- chronology
- intention/patronage discovery
- name discovery
- geography and tradition cross-navigation
- broader multilingual expansion

## Source-to-product rule

Sources are classified by **what they can authoritatively establish**, not by a single global score. A source can be authoritative for liturgy but not for canonisation, useful for editorial discovery but not factual publication, or useful for prayer inventory while lacking republication rights.

Canonical/evidential source classes and editorial/devotional source classes must remain separate in storage and publication logic.

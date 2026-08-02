# Santos do Dia — Product and Knowledge Architecture

## Product promise

Santos do Dia answers a contextual question that conventional saint calendars do not answer reliably:

> Who is celebrated today, in this place, in this Christian tradition?

Saints remain the primary entry point, but the product is a global Christian knowledge and calendar infrastructure connecting people, observances, locations, jurisdictions, churches, clergy, readings and official media.

## Public entry points

1. **Today here** — celebrations applicable to the visitor's selected country, region, jurisdiction and Christian tradition.
2. **A saint or blessed** — biography, dates, patronages, geographic scope, traditions, related readings and calendar actions.
3. **A date** — fixed and movable observances across places and traditions.
4. **A place** — country, region, diocese, eparchy, patriarchate, sanctuary or other jurisdiction.
5. **A profession or need** — patron saints supported by traceable evidence.
6. **A church or tradition** — current calendar, short institutional history, structure, leaders and official sources.
7. **A bishop or church leader** — current and historical offices connected to jurisdictions.
8. **Readings and liturgy** — scripture references, liturgical season, colour, rank, fasting and calendar rules where applicable.
9. **Official live media** — current worship events and official channels, clearly distinguished from archives.

## Canonical knowledge model

The long-term database must separate:

- Person or venerated entity
- Observance
- Date rule
- Liturgical calendar
- Church and church family
- Ecclesiastical jurisdiction
- Geographic scope
- Cleric and office appointment
- Scripture reference and lectionary assignment
- Source assertion and immutable source snapshot
- Translation and language-quality status
- Change event

An observance, not a person, owns a date, rank, church, jurisdiction and geographic scope. One person may therefore have several observances.

## Scope labels

Every public observance must expose one of the following contextual labels:

- Universal in this church
- Patriarchal or synodal
- Supranational
- National
- Provincial
- Diocesan or eparchial
- Regional
- Sanctuary or parish
- Religious institute

"Global" must never mean universal across Christianity. It may only mean universal within the identified church or calendar.

## Language rule

Search is multilingual; presentation is monolingual.

The search index may use original scripts, transliterations, aliases and names in other languages. The public title and descriptive content must use the selected site language. Source-only names are not valid display names.

## Source strategy

External APIs and websites are ingestion and verification channels, never runtime dependencies.

Pipeline:

1. Discover official or openly licensed source.
2. Capture an immutable snapshot with URL, timestamp, headers, hash and licence record.
3. Extract structured candidate assertions.
4. Reconcile entities and jurisdictions.
5. Validate authority, conflicts and effective dates.
6. Publish to the Santos do Dia canonical database.
7. Serve all public products from the internal API and database.

If a source fails, the last valid snapshot remains available and generated calendars continue to work.

## Source classes

- **Canonical authority:** official church decree, calendar, synod, patriarchate, episcopal conference, diocese or eparchy.
- **Open structured source:** openly licensed dataset, repository or knowledge base suitable for import.
- **Reference directory:** useful for discovery and reconciliation but not bulk reproduction without permission.
- **Discovery source:** search engine, news report, encyclopaedia or aggregator used only to locate stronger evidence.

## Search and organic acquisition

Every useful entity and relationship should eventually have a stable server-rendered entry page, including:

- saint by name and alias
- saints on a civil date
- saints today in a country or jurisdiction
- saints by profession or need
- church calendars and movable feasts
- jurisdictions and current leaders
- bishops, patriarchs, primates and cardinals
- daily readings and liturgical information

Pages must answer the query directly before presenting navigation, monetisation or project explanation.

## Machine discovery

The public web layer should expose:

- canonical metadata
- language and geographic context
- Schema.org WebSite, Organization, Dataset, Person, Event and BreadcrumbList where applicable
- XML sitemaps by content family when scale requires it
- OpenAPI for the public API
- `/llms.txt` describing the product, preferred crawl paths, API and attribution
- stable identifiers and internal links between entities

Machine-readable output must never claim that incomplete translations or unverified records are complete.

## Free access and monetisation

All information, search, calendars, readings and profiles remain free.

Revenue may come from:

- donations
- paid support candles
- future contextual advertising
- transparent institutional sponsorship
- grants

Paid candles must not carry greater ranking weight or imply superior spiritual value. Search and liturgical ordering cannot be purchased.

## Navigation principle

Primary navigation is limited to the product:

- Today
- Search
- Calendar
- Readings
- Live

Sources, methodology, corrections, rights, privacy, terms, API documentation and institutional information remain discreetly available in the footer.

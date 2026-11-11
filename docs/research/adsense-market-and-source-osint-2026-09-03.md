# SantosDia — AdSense, market and source OSINT

Observed: 2026-09-03  
Status: decision record; sources remain external evidence, never request-time dependencies

## Question

How should SantosDia turn a perennial saints/liturgical corpus into a credible next AdSense review, a useful global product and a Cloudflare Free-compatible operation without becoming a thin translated directory or a permanent synchronization machine?

## Primary evidence consulted

| Area | Source | Observed capability or rule | SantosDia implication |
|---|---|---|---|
| AdSense | [Make sure your site's pages are ready for AdSense](https://support.google.com/adsense/answer/7299563?hl=en) | Google asks for unique/relevant content, clear navigation, original contribution and a good user experience; scraped/copyrighted content is not an acceptable ad surface. | The next review is a production-value and trust gate. Record count, ownership code and green CI are necessary but insufficient. |
| Search quality | [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Google asks for original information/analysis, substantial coverage, source transparency, clear authorship and an explanation of how/why automated content was produced. | Publish first-party SantosDia synthesis and method/provenance. Do not mass-produce thin saint/date/translation pages. |
| Search abuse | [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) | Scaled low-value generated, scraped, translated or stitched pages can constitute scaled content abuse. | Automation builds evidence and deterministic products; it does not manufacture indexable volume. |
| AI discovery | [Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) | AI search uses the same people-first foundations and benefits from distinctive, accessible, well-structured content. | HTML, JSON-LD, API, ICS and OpenAPI should project the same canonical meaning; uniqueness comes from the graph, explanations and provenance. |
| Roman calendar engine market | [LiturgicalCalendarAPI](https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI) | An established open project already calculates Roman movable feasts, ranks/precedence and national/diocesan calendars and exposes JSON/YAML/XML/ICS. | “Another Catholic calendar API” is not a moat. Reuse only as a rights-compatible reference/oracle; keep SantosDia's own source-governed engine. |
| Catholic subscription market | [Universalis Portugal calendar](https://universalis.com/europe.portugal/calendar.htm) | Users already have a mature Portugal Catholic calendar and subscription/import route. | SantosDia must add transparent rules, provenance, original daily context, cross-tradition comparison and consistent API/ICS rather than imitate a commodity feed. |
| Orthodox/OCA | [OCA daily readings](https://www.oca.org/readings/daily/) | The competent Church source exposes dated readings, feasts and commemorated saints. | Build a separate OCA authority pack and kernel; never infer it from Roman or GOARCH data. |
| Greek Orthodox/GOARCH | [GOARCH Digital Chant Stand](https://dcs.goarch.org/) and [Online Chapel](https://www.goarch.org/chapel) | Official Greek Orthodox services expose daily liturgical material and Church-specific calendar content. | GOARCH is a separate source/semantic context from OCA and needs independent rights, calendar and acceptance review. |
| Anglican | [Church of England Common Worship lectionary](https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/lectionary) | The official source exposes Christian-year rules, transfers, Sunday A/B/C and weekday 1/2 cycles. | Implement a Common Worship kernel from its own authority and regression vectors. |
| Coptic Orthodox | [Coptic Orthodox Church Synaxarium](https://copticorthodox.church/en/synaxarion/) | The Church publishes daily Synaxarium material with its own ecclesial/date context. | Treat Coptic Orthodox as an explicit planned kernel with Alexandrian/Coptic calendar semantics, not as a translated Roman calendar. |
| Portugal Catholic authority | [Secretariado Nacional de Liturgia](https://liturgia.pt/liturgiadiaria/) | Competent national liturgical presentation supplies annual Portugal dates, ranks, readings and naming evidence. | Portugal remains the semantic quality anchor and regression corpus, not the global default. |
| Catholic identity/status | [Vatican News saints](https://www.vaticannews.va/en/saints.html) and [Dicastery for the Causes of Saints](https://www.causesanti.va/) | Holy See sources provide competent identity, recognition and ecclesial evidence within their scope. | Bind exact source records to canonical identities; store evidence/metadata, not copied public prose. |

## Market diagnosis

Existing providers already solve individual pieces: Catholic annual calendars and ICS, Roman computation APIs, Orthodox daily readings, Anglican lectionaries and Church-specific Synaxaria. SantosDia should not compete through a larger undifferentiated list.

The defensible gap is one authority-isolated interoperability layer:

- stable person/recognition/observance/occurrence identities across languages and scripts;
- independent tradition kernels and jurisdiction policies;
- explicit native ecclesial calendar, canonical rule and civil projection;
- transparent precedence, transfer, A/B/C and weekday-cycle explanations;
- one meaning across Today, Calendar, Calculator, HTML, JSON-LD, API and ICS;
- first-party contextual/editorial value with visible provenance;
- verified official Live as a bounded current-content exception;
- persistent subscriptions with canonical backlinks.

## Operating decision

### Bootstrap/backfill

Acquire the maximum useful and permitted authoritative evidence in bounded resumable chunks. Dropbox holds immutable raw releases where rights permit; otherwise it holds metadata, URL, observed time, hash, receipt and normalized factual extraction. Each authority/context/locale ends with a completeness receipt.

### Durable derivation

Normalize once, resolve identity/authority/calendar semantics, and generate SantosDia-controlled canonical knowledge, calendar materializations, API/ICS projections and first-party editorial candidates. The public runtime never fetches ecclesial sources.

### Maintenance

After completeness, stop recurring full-corpus sweeps. Run monthly delta monitoring distributed across the month. Keep only lightweight production health and source freshness/verified Live weekly. A specific official change may trigger one bounded reviewed event.

### Public readiness

Use three visible states:

1. **ready** — complete competent-source coverage, native-calendar semantics, localization and HTML/API/ICS parity;
2. **reviewed preview** — useful evidence-backed records, without a complete-subscription promise;
3. **planned** — architecture commitment only.

Roman Catholic Portugal is the current ready reference subscription. OCA, GOARCH, Church of England and Coptic Orthodox are next independent kernel families. Other modeled traditions remain planned until their own evidence and acceptance vectors exist.

## AdSense re-review decision gate

Do not request another review until all are true:

- representative production entry pages offer substantial original SantosDia value;
- navigation, About, method, authorship/editorial origin, corrections and sources are clear;
- no public claim overstates calendar, locale or Church readiness;
- no placeholder, false-empty, mechanically translated or thin mass-indexed footprint remains;
- substantive pages have useful internal relationships and matching structured data;
- mobile UX is simple, readable and content-first;
- ads remain off during remediation;
- production is verified, Search Console recrawl has had time to occur, and a human makes the explicit resubmission decision.

## Cloudflare and rights boundary

Cloudflare serves compact approved materializations and cached deterministic outputs. Heavy acquisition, reconciliation and generation stay in build/staging automation. D1 is not a raw archive; Dropbox is not a request-time database. Source outages preserve last-known-good. Third-party prose is not republished merely because it was fetched, translated or summarized.

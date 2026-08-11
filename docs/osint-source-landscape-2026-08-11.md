# SantosDia — OSINT source landscape

_Research snapshot: 2026-08-11 · Status: research-only; no source is activated by this document._

## Executive conclusion

The next product step is not to scrape more pages blindly. SantosDia needs a **source graph**: authoritative roots for each Christian church/family, structured cross-tradition datasets for identity/place/language resolution, and a controlled route from discovery to publication.

This research catalog contains **72 source records or source families**. It deliberately includes global communion directories that can recursively discover official national churches, provinces, dioceses/eparchies and local calendars. This is how the platform can approach global coverage without maintaining an impossible hand-written list of every Christian website.

The strongest modelling rule is: **do not force every Christian tradition into a universal “saint of the day” schema.** Some churches have normative sanctorals; some use commemorative calendars; some primarily use the Revised Common Lectionary/church year; some publish emphasis days; Friends historically reject privileging fixed holy days. SantosDia must represent those differences rather than manufacture equivalence.

## Safety boundary

This research does **not** modify `data/osint/policies/p0-policy-registry.json` and does not enable acquisition. Every candidate must separately pass:

1. official ownership / authority verification;
2. robots and machine-access review;
3. terms-of-use and licence review;
4. field-level reuse decision (facts, metadata, links, text, images);
5. rate-limit and stability test;
6. parser fixture / schema validation;
7. redundancy and conflict policy;
8. explicit promotion into the active policy registry.

Official does not mean freely redistributable. In particular, copyrighted biographies and liturgical texts should normally be represented as structured facts, references and links unless reuse permission is explicit.

## Source authority model

- **A1** — governing/promulgating body for the claim: Holy See dicastery, patriarchate, synod, official church calendar.
- **A2** — official jurisdiction or delegated institution: national church, episcopal conference, province, diocese/eparchy.
- **B1** — institutional/academic/structured source: Bollandists, Getty, Crossref, GeoNames.
- **B2** — established specialist secondary source: Catholic-Hierarchy, GCatholic.
- **C1** — open/community structured source: Wikidata, Wikimedia Commons, OpenStreetMap.
- **C2** — third-party specialist/editorial source.
- **D** — discovery-only/unverified.

Authority is **claim-specific**. A WCC directory is excellent evidence that a church body exists, but it is not authoritative for that church's feast calendar.

## Catalog by family

### Discovery roots

| Source | Class | Main use | Access / reuse posture |
|---|---:|---|---|
| [World Council of Churches — Member Churches](https://www.oikoumene.org/member-churches) | B1 | churches, jurisdictions, discovery | html; pending-policy-review |
| [Anglican Communion — Member Churches](https://www.anglicancommunion.org/member-churches/) | A2 | churches, jurisdictions, dioceses, discovery | html; pending-policy-review |
| [Lutheran World Federation — Member Churches](https://lutheranworld.org/member-churches) | A2 | churches, jurisdictions, leaders, discovery | html; pending-policy-review |
| [World Communion of Reformed Churches — Members](https://wcrc.eu/about/members/) | A2 | churches, jurisdictions, discovery | html; pending-policy-review |
| [Baptist World Alliance — Membership](https://baptistworld.org/membership-information/) | A2 | churches, unions, conventions, discovery | html; pending-policy-review |
| [Mennonite World Conference — Member List](https://mwc-cmm.org/en/membership-map-and-statistics/member-list/) | A2 | churches, conferences, discovery | html; pending-policy-review |
| [World Assemblies of God Fellowship](https://worldagfellowship.org/) | A2 | churches, fellowships, discovery | html; pending-policy-review |
| [Friends World Committee for Consultation](https://fwcc.world/) | A2 | yearly-meetings, monthly-meetings, discovery | html; pending-policy-review |
| [The Salvation Army International Headquarters](https://www.salvationarmy.org/) | A2 | territories, regions, leaders, discovery | html; pending-policy-review |
| [Union of Utrecht of the Old Catholic Churches](https://www.utrechter-union.org/) | A1 | member-churches, documents, discovery | html; pending-policy-review |

### Cross-tradition infrastructure

| Source | Class | Main use | Access / reuse posture |
|---|---:|---|---|
| [Wikidata](https://www.wikidata.org/) | C1 | identity, names, aliases, dates | sparql-api; approved-cc0 |
| [Wikimedia Commons](https://commons.wikimedia.org/) | C1 | images, media, depictions | api; per-file-open-license |
| [GeoNames](https://www.geonames.org/) | B1 | places, alternate-place-names, coordinates, countries | download-api; cc-by-4.0 |
| [OpenStreetMap](https://www.openstreetmap.org/) | C1 | places, churches, shrines, coordinates | overpass-download; odbl-1.0 |
| [Unicode CLDR](https://cldr.unicode.org/) | B1 | locales, language-names, territory-names, date-formatting | download-json; unicode-license-v3 |
| [IANA Time Zone Database](https://www.iana.org/time-zones) | A1 | timezones, utc-offset-history, dst-rules | download; licence review before mirroring |
| [Getty Vocabularies (TGN/ULAN/AAT)](https://www.getty.edu/research/tools/vocabularies/) | B1 | historical-places, names, iconography, roles | lod-sparql-download; odc-by-1.0 |
| [Europeana](https://www.europeana.eu/) | B1 | cultural-heritage-metadata, images, manuscripts, objects | api; metadata-cc0/item-rights-vary |
| [Crossref](https://www.crossref.org/) | B1 | bibliography, doi, scholarship, licence-metadata | rest-api; metadata-mostly-open |
| [OpenAlex](https://openalex.org/) | C1 | scholarship, authors, institutions, citations | rest-api-snapshot; cc0 |
| [Société des Bollandistes](https://bollandistes.org/) | B1 | hagiography, saint-identity, texts, bibliography | html-databases; pending-policy-review |
| [Légendiers latins / BHL manuscript census](https://legendiers-latins.irht.cnrs.fr/) | B1 | bhl-identifiers, manuscripts, hagiographic-texts | html-database; pending-policy-review |

### Catholic — Latin and Eastern

| Source | Class | Main use | Access / reuse posture |
|---|---:|---|---|
| [Holy See / Vatican.va](https://www.vatican.va/) | A1 | documents, canon-law, liturgical-law, saints | html-pdf; pending-policy-review |
| [Holy See Press Office](https://press.vatican.va/) | A1 | appointments, resignations, decrees, canonizations | html; pending-policy-review |
| [Dicastery for Divine Worship](https://www.vatican.va/content/romancuria/en/dicasteri/dicastero-culto-divino.html) | A1 | General Roman Calendar, ranks, decrees, feasts | html-pdf; pending-policy-review |
| [Dicastery for the Causes of Saints](https://www.vatican.va/content/romancuria/en/dicasteri/dicastero-cause-santi/profilo.html) | A1 | canonization/beatification status, decrees | html; pending-policy-review |
| [Dicastery for the Eastern Churches](https://www.vatican.va/content/romancuria/en/dicasteri/dicastero-chiese-orientali/profilo.html) | A1 | Churches sui iuris, governance, jurisdiction | html; pending-policy-review |
| [Vatican News — Saint of the Day](https://www.vaticannews.va/) | A2 | daily saints and biographical metadata | html; pending-policy-review |
| [Secretariado Nacional de Liturgia — Portugal](https://www.liturgia.pt/) | A2 | national calendar, readings, local observances | html-pdf; pending-policy-review |
| [USCCB](https://www.usccb.org/) | A2 | national liturgical calendar and readings | html-pdf; pending-policy-review |
| [LiturgicalCalendarAPI](https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI) | B1 | structured national/diocesan calendars, JSON/ICS | api-json-ics; Apache-2.0 |
| [Catholic-Hierarchy](https://www.catholic-hierarchy.org/) | B2 | bishops, dioceses, appointments, succession | html; pending-policy-review |
| [GCatholic](https://gcatholic.org/) | B2 | jurisdictions, bishops, churches | html; pending-policy-review |
| [Ukrainian Greek Catholic Church](https://ugcc.ua/library/worship/) | A1 | official calendar, Menologion, readings, reforms | html; pending-policy-review |
| Official calendars of each Eastern Catholic Church sui iuris | A1 | calendar, menologion, saints, fasts, readings | one partition per Church; pending-policy-review |

**Critical rule:** Catholic Eastern Churches must never inherit the Latin General Roman Calendar by default. Their own Church and Synod are authoritative for their menologion and calendar practice.

### Eastern Orthodox

| Source | Class | Main use | Access / reuse posture |
|---|---:|---|---|
| [GOARCH Chapel/Calendar](https://www.goarch.org/chapel) | A2 | saints, feasts, readings, fasts, calendar | html/ICS; pending-policy-review |
| [Orthodox Church in America — Feasts & Saints](https://www.oca.org/saints) | A1 | saints, feasts, Paschal cycle, readings | html; metadata-only until copyright permission |
| [Moscow Patriarchate / Patriarchia.ru](https://patriarchia.ru/) | A1 | saints, readings, Synodal decisions, official calendar | html; pending-policy-review |
| [Romanian Patriarchate / Basilica](https://basilica.ro/en/) | A1 | calendar, saints, Synodal additions, liturgical texts | html/RSS; pending-policy-review |
| [Ecumenical Patriarchate](https://ec-patr.org/en/) | A1 | documents, feasts, jurisdiction | html; pending-policy-review |
| Official autocephalous/autonomous Church calendars | A1 | church-specific calendar and saints | recursively discovered; pending-policy-review |
| [Orthodox Calendar API — ispovednik.org](https://api.ispovednik.org/) | C2 | structured calendar/saints/fasts | JSON API; secondary cross-check only |

**Critical rule:** retain `church_body`, jurisdiction, fixed-date calendar system and Paschalion. “Orthodox calendar” is not a single universal dataset.

### Oriental Orthodox and Church of the East

| Source | Class | Main use | Access / reuse posture |
|---|---:|---|---|
| [Mother See of Holy Etchmiadzin](https://www.armenianchurch.org/en/Liturgical-Calendar/) | A1 | Armenian Apostolic calendar, saints, fasts | html; pending-policy-review |
| [Ethiopian Orthodox Tewahedo calendar](https://www.ethiopianorthodox.org/english/calendar.html) | A1 | Ethiopian calendar rules, saints, feasts, fasts | html; pending-policy-review |
| [Ethiopian annual readings](https://www.ethiopianorthodox.org/calendar.html) | A1 | lectionary/calendar | html; pending-policy-review |
| [Coptic Orthodox Patriarchate](https://copticorthodox.church/) | A1 | official church/root discovery | html; pending-policy-review |
| [CopticChurch.net Synaxarium](https://www.copticchurch.net/synaxarium/) | B1 | Coptic Synaxarium reference | html; pending-policy-review |
| [Coptic.io](https://coptic.io/) | C1 | structured Synaxarium, fasts, seasons | OpenAPI/JSON; pending-policy-review |
| [Malankara Orthodox Syrian Church](https://mosc.in/) | A1 | Panjangom/calendar, saints, readings | html/PDF; pending-policy-review |
| [Syriac Orthodox Patriarchate](https://syriacpatriarchate.org/) | A1 | patriarchal documents, calendar discovery, hierarchy | html; pending-policy-review |
| Official Oriental Orthodox jurisdictional calendars | A1 | calendar, synaxaria, saints, fasts | recursively discovered; pending-policy-review |
| [Assyrian Church of the East](https://www.assyrianchurch.org/) | A1 | calendar, feasts, lectionary, liturgical resources | html/PDF; pending-policy-review |

### Anglican and Protestant families

| Source | Class | Calendar semantics |
|---|---:|---|
| [Church of England — Common Worship](https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship) | A1 | authorized saints/commemorations + lectionary; copyright review |
| [The Episcopal Church / SCLM](https://www.episcopalcommonprayer.org/) | A1 | authorized commemorative calendar / Lesser Feasts and Fasts |
| Anglican provincial/diocesan official calendars | A2 | province-specific; discover through Anglican Communion directory |
| [ELCA](https://www.elca.org/) | A1 | Church Year, lesser festivals, commemorations, RCL |
| [LCMS Church Year](https://www.lcms.org/worship/church-year) | A1 | commemorations, feasts, readings |
| Lutheran member-church calendars | A2 | church-specific; discover via LWF |
| [Presbyterian Church (USA)](https://www.pcusa.org/) | A1 | church year / RCL, not universal sanctoral |
| [United Church of Christ — Worship Ways](https://www.ucc.org/worship-way/) | A1 | RCL/church year |
| Reformed member-church resources | A2 | church-specific; discover via WCRC |
| [United Methodist Discipleship Ministries](https://www.umcdiscipleship.org/) | A1 | church year / RCL / special Sundays |
| Methodist local official resources | A2 | church-specific; discover from WCC and denominational roots |
| [Seventh-day Adventist General Conference](https://gc.adventist.org/events/special-days/) | A1 | special/emphasis days and Sabbaths, **not saints** |
| [Baptist World Alliance](https://baptistworld.org/) and member bodies | A2 | identity, prayer/worship, special events; **no universal sanctoral** |
| [Assemblies of God USA](https://ag.org/) | A2 | event/emphasis calendar; **not sanctoral** |
| Pentecostal official fellowships/member churches | A2 | church/event discovery; **no universal sanctoral assumed** |
| [Mennonite Church USA](https://www.mennoniteusa.org/) | A2 | Lent/Easter/Pentecost/Advent worship resources |
| [Moravian Church](https://www.moravian.org/) | A1 | lectionary and Daily Texts |
| [Quakers in Britain](https://www.quaker.org.uk/) | A1 | explicit calendar-policy evidence: all times holy; do not manufacture feast days |
| [The Salvation Army](https://www.salvationarmy.org/) | A1 | territories, leaders, official observances; no saint calendar |
| Old Catholic member churches | A1 | resolve each member church's own calendar via Union of Utrecht |

## Tradition/calendar semantics to store

The companion file `data/osint/research/tradition-calendar-policies-v1.json` defines 23 church-family policies. Every observance should carry, at minimum:

- `person_id` or `event_id`;
- `church_family`;
- `church_body`;
- `jurisdiction_id`;
- `calendar_system`;
- `paschalion` when relevant;
- `source_calendar_id` and edition/year;
- original source date/rule;
- normalized civil date for the requested year and timezone;
- `observance_type` (saint, martyr, feast, commemoration, special Sunday, emphasis day, etc.);
- liturgical rank **using the source church's own vocabulary**;
- source assertion/evidence and retrieval timestamp;
- confidence/publication state.

Cross-language names belong to the **person/entity layer**, not to a calendar record. Thus the same Saint Peter can have one stable entity ID, many localized labels, and multiple church-specific observance records.

## What each source class should feed

### 1. Church topology/discovery

WCC, Anglican Communion, LWF, WCRC, BWA, MWC, WAGF, FWCC and similar global bodies feed a `church_source_frontier`. They discover official church-body websites and jurisdictions. Their results are candidates, not automatically trusted calendars.

### 2. Normative calendar facts

A1/A2 liturgical authorities feed dates, ranks, movable rules, fasts, readings and official additions/removals. These sources have precedence for their own jurisdiction. Examples: Dicastery for Divine Worship, UGCC Synod/calendar, OCA, Moscow Patriarchate, Romanian Patriarchate, Mother See of Holy Etchmiadzin, Church of England.

### 3. Identity resolution

Wikidata is the first open identity spine; Getty/ULAN, Bollandist identifiers and other scholarly references are cross-checks. A person is merged only on evidence, never name similarity alone.

### 4. Geography

GeoNames is the preferred open gazetteer for multilingual place names; OSM adds churches, shrines and geospatial features; Getty TGN is particularly valuable for historical places. Preserve external IDs rather than copying labels into a single flat field.

### 5. Language and dates

Unicode CLDR governs locale display conventions; IANA TZDB governs civil timezone rules. Church-calendar conversion belongs in a separate temporal engine. These layers must never be replaced by ad-hoc translated strings.

### 6. Images and cultural heritage

Wikimedia Commons is usable only with per-file licence/attribution checks. Europeana metadata is open but digital-object rights vary by item. Store an attribution/rights record with every published image.

### 7. Scholarship

Bollandists/Légendiers latins provide high-value hagiographic identifiers and manuscript scholarship. Crossref/OpenAlex discover modern research. These sources support validation and bibliography; they do not override a church's normative liturgical decision.

## Proposed autonomous architecture

```text
SOURCE ROOTS
   ↓
DISCOVERY SCOUT
   → official-site candidates
   → robots/terms/licence candidates
   → source fingerprint + authority hypothesis
   ↓
SOURCE POLICY GATE
   approved / metadata-only / discovery-only / blocked
   ↓
PARTITIONED SCOUTS
   Catholic Latin | Eastern Catholic | Eastern Orthodox | Oriental Orthodox
   Anglican | Lutheran | Reformed | Methodist | Baptist | Pentecostal | etc.
   ↓
DROPBOX RAW (immutable, checksum, source receipt)
   ↓
NORMALIZERS (church/calendar specific)
   ↓
ENTITY RESOLUTION
   person ↔ localized names ↔ places ↔ church body ↔ jurisdiction
   ↓
LANGUAGE + TEMPORAL GATES
   CLDR / language rules / calendar conversion / timezone
   ↓
ASSERTION & CONFLICT ENGINE
   source authority + independence + freshness + jurisdiction
   ↓
D1 STAGING
   ↓
PUBLICATION GATE
   ↓
D1 PRODUCTION + post-publish verification + rollback receipt
```

There must be no universal normalizer that assumes a Roman calendar model. Each calendar family needs an adapter that emits a shared **assertion model**, not a shared theology.

## Publication rules

1. **Normative claims:** one A1 source can establish a claim within its jurisdiction; independent A2/B1 sources increase confidence but do not overrule it.
2. **Identity merges:** require a stable identifier or multiple independent matching attributes. Name-only merging is forbidden.
3. **Conflicting calendars:** retain both assertions with jurisdiction/calendar context. Do not choose a global “winner”.
4. **Biography:** build from sourced assertions; do not copy copyrighted biographies.
5. **Images:** publish only when item-level rights and attribution are known.
6. **Bible/lectionary:** store passage references by default; Bible text requires a separately compatible text licence.
7. **Fallback:** a source failure keeps last-known-good production data and raises a review candidate.
8. **New saints/commemorations:** official promulgation creates a change event; downstream calendars are used as confirmation and localization.

## Execution order

### P0 — Source registry closure

- Import this research catalog into a formal source-registry schema without activating candidates.
- Automatically test ownership, robots, access method, redirects, content type and freshness.
- Manually/legal-review only the ambiguous terms/licence cases.
- Establish canonical church-body IDs and aliases.

### P1 — Finish high-value calendars

- Latin Catholic: normative General Roman + Portugal first, then conference/diocese partitions.
- Eastern Catholic: UGCC as the first complete adapter, then one adapter per sui iuris Church.
- Eastern Orthodox: OCA + GOARCH + Moscow + Romanian as independent church-body partitions.
- Oriental Orthodox: Armenian + Ethiopian + Coptic + Malankara; add Syriac/Eritrean after source validation.
- Anglican/Lutheran: implement explicit commemorative models.
- Protestant families without sanctorals: expose church year, lectionary or official emphasis days without inventing saints.

### P2 — Identity/language/geography

- Wikidata IDs + aliases as open backbone.
- CLDR and SantosDia linguistic rules for display.
- GeoNames/OSM/Getty IDs for places.
- Bollandist identifiers and bibliography for scholarly validation.

### P3 — Publication

- Promote only reviewed assertions into D1 production.
- Measure coverage per church body, jurisdiction, date and locale.
- On mobile, `Hoje` reads production data only and clearly shows church/tradition and source context.

## Cloudflare operational constraint

Current user-reported Cloudflare Workers usage (2026-08-11): **190 / 3,000 build minutes this month**, 257 / 100,000 requests today, 29 / 200,000 observability events today.

The OSINT architecture should therefore **decouple data refresh from Worker builds**. Scheduled Scouts/normalizers must not trigger a Worker build/deployment. D1 data promotion is a data operation; application builds should occur only for code/schema releases that actually require a deployment. This keeps the 3,000-minute monthly build budget available for product work and emergency releases.

## Research gaps that remain intentionally open

- Legal/robots review for most official church websites.
- Exact machine endpoints for several patriarchates/member churches.
- Current official calendar sources for every Eastern Catholic sui iuris Church.
- Complete official calendar inventory for every Eastern Orthodox autocephalous/autonomous Church.
- Eritrean Tewahedo and Syriac Orthodox machine-readable sources.
- Local calendars below national/provincial level.
- Rights status for many icon/image collections and full liturgical texts.

These gaps should be discovered recursively from the authoritative roots above; they are not a reason to use aggregators as normative substitutes.

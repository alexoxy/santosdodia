# SantosDia OSINT Data Platform

_Last updated: 2026-08-06_

## Mission

Build a global, multilingual and machine-readable Christian knowledge platform covering calendars, saints and commemorations, ecclesiastical hierarchy, jurisdictions, official media, live streams, documents and related entities across Christian traditions.

The public website is one presentation layer. The durable product is a provenance-aware data platform designed for humans, search engines, APIs and AI systems.

## Delivery sequence

### Phase 1 — Global source discovery

Create a multilingual registry of official, institutional, academic, structured and editorial sources across Catholic, Eastern Orthodox, Oriental Orthodox, Anglican, Lutheran, Reformed, Methodist, Baptist, Pentecostal, Adventist and other Christian traditions.

For every source retain:

- stable source identifier;
- publisher and owning institution;
- tradition, jurisdiction and territory;
- languages;
- content domains: calendar, saints, hierarchy, scripture, media, live streams, documents, places and organisations;
- access method: API, OpenAPI, SPARQL, RSS, ICS, XML, JSON, CSV, PDF or HTML;
- authority, reliability, stability and completeness scores;
- update frequency and last successful observation;
- robots, terms, licence and redistribution constraints;
- extraction method and expected identifiers;
- dependencies and redundant sources.

### Phase 2 — Initial OSINT dump

Acquire all legally accessible source material, preferring official downloads, APIs, feeds and dumps over HTML extraction.

The first acquisition is immutable and must preserve:

- original bytes;
- request URL and response metadata;
- retrieval timestamp;
- SHA-256 checksum;
- MIME type and character encoding;
- source identifier and licence snapshot;
- HTTP status, redirects and cache headers;
- extraction receipt and software version.

Dropbox is the archival OSINT lake, not the production database. GitHub remains the code, schema and pipeline source of truth. Cloudflare D1 or a successor database serves normalized production data.

Proposed Dropbox root:

```text
/SantosDia-OSINT/
├── 00-governance/
│   ├── source-registry/
│   ├── licences/
│   ├── schemas/
│   └── data-dictionary/
├── 01-raw/{source_id}/{retrieval_date}/
├── 02-extracted/{entity_type}/{source_id}/
├── 03-normalized/{dataset_version}/
├── 04-validation/{run_id}/
├── 05-conflicts/{run_id}/
├── 06-publication-packages/{version}/
├── 07-receipts/{run_id}/
└── 99-archive/
```

### Phase 3 — Canonical database

Normalize the dump into a versioned relational core with graph-compatible identifiers.

Minimum entities:

- persons, names and identity links;
- saints, blesseds, martyrs and commemorated persons;
- observances and jurisdiction-specific calendar entries;
- traditions, Churches, rites and calendar systems;
- jurisdictions, dioceses, eparchies, provinces and parishes;
- offices, office holders, appointments and successions;
- religious institutes, congregations and communities;
- places, shrines, churches, relics and pilgrimage sites;
- patronages, professions, causes and associated places;
- scripture passages, lectionary assignments and textual references;
- documents, decrees and source publications;
- media assets, official channels, live streams and archive links;
- sources, source documents, assertions and evidence;
- ingestion, validation, publication and rollback events.

Every material claim is stored as an assertion with source evidence, observation time, authority score, confidence, jurisdiction and validity interval.

### Phase 4 — Stabilization baseline

Before automatic publication, produce a stable first content version and measure:

- identity coverage and duplicate rate;
- observance coverage by tradition, jurisdiction, language and date;
- source redundancy per material claim;
- unresolved conflicts;
- hierarchy freshness;
- licence status;
- image attribution completeness;
- broken or redirected external links;
- live-stream availability and institutional ownership.

### Phase 5 — Automatic future updates

After the baseline is stable, activate autonomous acquisition and publication.

```text
DISCOVER → FETCH → ARCHIVE RAW → EXTRACT → NORMALIZE → RESOLVE ENTITIES
→ COMPARE → VALIDATE BY REDUNDANCY → SCORE → PUBLISH → AUDIT → ROLLBACK
```

Routine updates do not require human approval. The system retains the current production value when confidence falls below the publication threshold or when authoritative sources conflict. Human intervention is reserved for unresolved exceptional conflicts and policy changes.

## OSINT validation model

No material claim should depend on one source when independent evidence is available.

Recommended source classes:

- A1 — authoritative promulgation: Holy See, patriarchate, synod, Church governing body or official liturgical office;
- A2 — official jurisdiction: episcopal conference, archdiocese, diocese, eparchy or national Church;
- B1 — institutional structured source: official directory, official API, seminary, university, archive or library;
- B2 — established specialist source: Catholic-Hierarchy, GCatholic and equivalent curated directories;
- C1 — referenced open knowledge: Wikidata, Wikimedia Commons and well-sourced encyclopaedias;
- C2 — editorial or devotional publisher;
- D — discovery-only aggregator, blog or unverified social source.

A publication decision combines authority, independence, freshness, identifier agreement, licence and field-specific rules. Official promulgations override downstream summaries for normative calendar and appointment facts. Lower-ranked sources may enrich biographies or discover links but cannot silently override higher-ranked claims.

## SEO and AI contract

Every public entity should expose:

- permanent opaque ID and stable canonical URL;
- localized slug aliases with redirects;
- semantic HTML and accessible headings;
- JSON-LD using appropriate Schema.org types;
- OpenGraph and social metadata;
- breadcrumbs and related-entity links;
- multilingual `hreflang` relationships;
- provenance and last-verified information;
- public JSON representation;
- API and OpenAPI documentation;
- RSS or ICS where applicable;
- citation-ready machine-readable evidence links;
- chunkable Markdown or JSON for retrieval systems;
- version and content hash.

The platform must avoid doorway pages, thin generated pages and indexable records below the publication threshold.

## Advertising readiness

Advertising is a future revenue layer and must not determine factual ranking. Design requirements:

- reserve responsive ad slots without layout shift;
- separate advertising from liturgical and source content;
- avoid ads in API, ICS and machine-readable outputs;
- implement consent and regional privacy controls before activation;
- cap density on devotional and mobile pages;
- retain fast Core Web Vitals;
- label sponsored links and prevent them from influencing authority scores;
- maintain ad-free error, correction, privacy and source-provenance pages.

## Official media, live streams and external links

Treat every external media or live link as a time-sensitive entity with:

- owning institution and jurisdiction;
- official, affiliated, independent or unknown classification;
- platform, channel ID and canonical URL;
- language, location and schedule;
- embedded-player and geographic restrictions;
- last successful check and HTTP status;
- live, scheduled, archived, dormant or removed state;
- replacement and redirect history;
- verification evidence and confidence.

The link monitor should check metadata frequently without downloading full video streams. Broken links remain in history but are removed from active presentation after a defined failure threshold.

## Initial implementation outputs

1. Versioned source registry schema and seed registry.
2. Dropbox archival structure and manifest convention.
3. Fetch receipt and immutable raw-object naming specification.
4. Canonical assertion/evidence database schema.
5. Initial multilingual discovery crawler.
6. Initial dump for priority sources.
7. Baseline quality and conflict report.
8. Autonomous incremental update engine.
9. SEO/AI publishing contracts.
10. Official-media and link-health subsystem.

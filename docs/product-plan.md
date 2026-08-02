# Santos do Dia product plan

_Last updated: 2026-08-02_

## Product promise

Santos do Dia is a free, global and multilingual Christian discovery service for saints, patronages, feast dates, Church traditions, official media and calendar subscriptions.

The product must help a visitor answer five questions reliably:

1. Who is celebrated today or on a chosen date?
2. Which saint is associated with a profession, cause, place or name?
3. In which Christian tradition, jurisdiction or calendar is the observance recognised?
4. What are the traceable sources and known variations?
5. How can the observance be followed through a calendar feed or official media source?

## Product principles

- **Source-traceable:** factual claims, dates, patronages and media links must retain provenance.
- **Tradition-aware:** differences between Churches, jurisdictions, rites and calendar systems must be represented rather than flattened.
- **Free and portable:** public discovery, JSON APIs and ICS feeds remain accessible without an account.
- **Privacy-preserving:** virtual candles are stored only on the visitor's device; no server-side devotional profile is created.
- **Editorially cautious:** uncertainty, disputed dates and local variations must be visible.
- **International by design:** English is the fallback, not the final limit of the product.
- **Operationally simple:** GitHub is the code source of truth and Cloudflare Workers is the production runtime.

## Current baseline

The repository already contains the principal product foundations:

- discovery by name, date, patronage and place;
- individual saint profiles;
- day, place and patronage pages designed for server rendering and search indexing;
- Catholic, Orthodox, Anglican and Oriental Orthodox calendar concepts;
- Church jurisdiction hierarchy, including Portuguese ecclesiastical provinces and dioceses;
- public REST endpoints, paginated responses, JSON output, ICS feeds and an OpenAPI specification;
- multilingual name and interface infrastructure with English fallback;
- local-only virtual candles;
- source, licensing and provenance concepts;
- production deployment through Cloudflare Workers using OpenNext.

The current dataset remains a curated beta. Product expansion must follow data verification rather than precede it.

## Roadmap

### P0 — Production integrity and product baseline

**Objective:** establish one reliable production path and a verifiable baseline before expanding scope.

Work:

- make `main` the definitive production branch in Cloudflare;
- verify the canonical host, redirects, static assets and Cloudflare Worker runtime;
- run the full quality gate: data audit, typecheck, lint, Next.js build and OpenNext build;
- verify all documented public endpoints against production behaviour;
- remove stale Vercel references and keep the retired Dropbox workflow removed;
- record the current dataset size, language coverage, source coverage and known gaps;
- enforce publication gates so unreviewed imports do not appear as verified content;
- avoid blind release retries: every failed release must produce an identified cause before another attempt.

Exit criteria:

- one successful production deployment from the intended branch;
- canonical domain and API/ICS endpoints validated;
- documentation matches the deployed architecture;
- baseline data-quality report committed to the repository;
- minimum verified-profile standard documented;
- dynamic publication policy enforced by the quality pipeline.

### P1 — Trusted data foundation

**Objective:** make every published saint and observance structurally consistent and auditable.

Work:

- define stable identifiers for saints, observances, traditions, jurisdictions and sources;
- separate saint identity from observance dates and jurisdiction-specific calendar entries;
- normalise patronages, places, professions, causes and alternative names;
- retain source URLs, publisher, retrieval date, licence and confidence status;
- support calendar variants, movable observances and local or disputed dates;
- implement duplicate detection and controlled merge rules;
- validate ingestion before replacing production data;
- publish a minimum verified-profile standard.

Exit criteria:

- no production record without identity, observance context and provenance status;
- data validation prevents malformed or duplicate records from entering production;
- source coverage and unresolved conflicts are measurable.

### P2 — Core discovery experience

**Objective:** make the service genuinely useful for a visitor who does not already know the saint's name.

Work:

- strengthen search across names, aliases, professions, causes, places, dates and traditions;
- expose clear filters for Church tradition and jurisdiction;
- improve today, date, place and patronage landing pages;
- make profile pages explain date variations and tradition context clearly;
- connect dioceses and ecclesiastical jurisdictions to relevant observances;
- optimise mobile navigation, accessibility, empty states and error states;
- preserve canonical URLs and structured metadata for indexable pages.

Exit criteria:

- the five product questions can be answered from the interface without requiring API knowledge;
- key discovery paths work on mobile and with keyboard navigation;
- no indexable page is generated from empty or unverified data.

### P3 — Calendars, API and distribution

**Objective:** turn verified data into reliable subscriptions and reusable public infrastructure.

Work:

- validate calendar feeds by tradition and individual saint;
- define timezone, all-day event and annual recurrence behaviour explicitly;
- maintain stable API response contracts and pagination;
- align live endpoints with the OpenAPI specification;
- add caching, rate-limit policy and machine-readable error responses;
- document feed and API examples for users and developers;
- monitor broken subscriptions and invalid ICS output.

Exit criteria:

- ICS feeds import correctly into major calendar clients;
- API and OpenAPI responses remain contract-compatible;
- public distribution does not expose records below the verification threshold.

### P4 — Multilingual and global expansion

**Objective:** expand language and Church coverage without lowering editorial quality.

Work:

- prioritise languages using actual audience and coverage evidence;
- distinguish translated names from translated editorial descriptions;
- validate grammar and terminology through the existing language-quality tooling;
- localise jurisdiction and tradition explanations;
- expand Church and territorial hierarchies country by country;
- preserve original-language names and transliterations;
- show fallback language visibly where translation is incomplete.

Exit criteria:

- language coverage is measured per field, not only per page;
- no machine translation is presented as reviewed editorial text;
- new country or Church coverage includes sources and jurisdiction context.

### P5 — Official media and editorial trust

**Objective:** add useful official media while protecting legitimacy and source integrity.

Work:

- create directories of official live streams and institutional archives;
- verify ownership, institutional status, availability and geographic restrictions;
- distinguish official, affiliated and independent sources;
- maintain copyright, licensing and source-provenance documentation;
- publish privacy, terms, FAQ, correction, abuse/contact and legitimacy information;
- establish a correction and takedown workflow;
- record editorial review dates for time-sensitive links.

Exit criteria:

- every media item has a verification status and review date;
- users can report errors, rights concerns and broken links;
- institutional pages make clear what the service is and is not.

### P6 — Privacy-preserving engagement

**Objective:** support devotional interaction without creating unnecessary identity or behavioural data.

Work:

- retain virtual candles as local-device state;
- explain clearly that lighting a candle does not create a public or server-side record;
- support graceful local reset and browser-storage failure;
- measure product usage only through aggregated, privacy-conscious operational analytics;
- do not introduce accounts, public devotional profiles or social features without a separate product and privacy review.

Exit criteria:

- devotional interaction works without authentication;
- privacy behaviour is documented and technically verifiable;
- engagement features do not become a prerequisite for discovery or calendar access.

## Explicit exclusions from the current plan

The following are not part of the present delivery scope:

- restoring the GitHub-to-Dropbox backup workflow;
- giving GitHub credentials for the user's Dropbox;
- returning production deployment to Vercel;
- paid access to core saint, observance, API or calendar information;
- automatic publication of unreviewed AI-generated biographies;
- mass ingestion of unsourced or unverified scraped content;
- user accounts, public candle counts or social-network features.

## Immediate execution order

1. Complete P0 production and documentation alignment.
2. Produce the baseline data-quality and coverage report.
3. Define and enforce the minimum verified-profile standard.
4. Improve the highest-value discovery paths using verified data.
5. Validate ICS and API contracts before expanding language or media coverage.
6. Add editorial trust and institutional pages before broad public promotion.

## Decision rule

New features enter the roadmap only when they improve one of the five core user questions, can be supported by traceable data and do not weaken privacy, editorial reliability or operational simplicity.

# SantosDia — first-party editorial content policy

_Last updated: 2026-08-29_

## Purpose

SantosDia must publish a genuinely first-party editorial product. External Church, institutional, scholarly and structured-data sources are inputs to research and verification; they are not the public prose layer of the site.

The operating chain is:

`approved source → evidence capture → normalized facts → canonical knowledge → SantosDia editorial composition → public page`

This rule exists simultaneously for product quality, copyright discipline, source resilience, semantic consistency and AdSense/Search quality.

## 1. Repository-first publication

All substantive public text published by SantosDia must exist in a SantosDia-controlled repository or approved first-party data store before it is served publicly.

Public pages must not depend on copying, proxying, scraping or rendering third-party prose at request time. External-source acquisition is a build/research function only.

The published layer may include:

- SantosDia-authored biographies, explanations, summaries and contextual notes;
- normalized factual fields such as dates, names, ranks, jurisdictions, patronages and calendar relationships;
- short source labels and bibliographic metadata required for provenance;
- quotations only when legally permitted, editorially necessary and deliberately bounded.

## 2. What becomes SantosDia editorial content

A source record may inform the SantosDia article, but the public article is created from verified facts and the SantosDia information architecture rather than by lightly rewriting a source paragraph.

SantosDia editorial composition should add material value through one or more of:

- synthesis across several competent sources;
- chronology and historical context;
- distinction between person, recognition, observance and occurrence;
- Church, rite, jurisdiction and calendar-system context;
- Portugal-specific or other jurisdiction-specific relevance;
- explanation of why a celebration is observed on a particular date;
- comparison of differing Christian calendars without collapsing them;
- structured key facts, related celebrations and internal knowledge links;
- original Portuguese editorial formulation and reviewed translations.

Editing, translating or rearranging a third-party text alone is not sufficient to make it first-party editorial content.

## 3. Provenance remains mandatory

Editorial ownership and source provenance are separate concepts.

SantosDia owns the structure and original wording of its editorial layer, but factual claims remain traceable to their evidence. The underlying record must retain, where applicable:

- source URL;
- publisher/authority;
- source type and competence;
- observed or verified date;
- source language;
- claim/evidence binding;
- content hash or immutable evidence reference;
- rights/reuse status when source text has been captured.

Public pages should expose useful source attribution for substantive claims without turning the reading experience into a source dump.

## 4. Copyright and rights boundary

Third-party copyrighted prose without explicit reuse rights must not be copied into the public SantosDia corpus as article text.

For such material, the Evidence Vault stores only what the rights policy permits: bibliographic metadata, factual extraction, bounded quotations where justified, hashes and references. The public article is then independently composed from the verified facts.

Public-domain, openly licensed or explicitly reusable source text may be retained according to its licence, but SantosDia should still prefer its own editorial synthesis when the page is intended to demonstrate substantive first-party value.

## 5. No runtime source dependency

A public page must remain useful if an external source is temporarily unavailable. Source failure must not cause the site to replace reviewed SantosDia copy with scraped fallback text.

The runtime may read only approved first-party projections of the canonical corpus. External crawling, scraping, translation and research remain outside the request path.

## 6. AdSense and search-quality gate

Indexable pages must provide substantive value beyond a date/name listing or a reformatted source record.

For saint/person profiles, indexability should normally require:

- an original SantosDia summary;
- multiple paragraphs of reviewed editorial narrative;
- structured key facts;
- explicit Church/observance context;
- provenance to competent sources;
- useful internal links to dates, observances, calendars or related entities.

For day/date pages, indexability should require more than a bare list when the page is intended as an editorial search landing page. Pages without sufficient contextual content must remain `noindex,follow` or outside the sitemap until the substantive-value gate is met.

Mass generation of indexable pages from thin templates is prohibited.

## 7. Acquisition pipeline

The preferred acquisition flow is:

1. acquire approved-source evidence in GitHub Actions or another reviewed build process;
2. archive permitted raw evidence in the Evidence Vault;
3. normalize facts and identifiers;
4. resolve conflicts and authority boundaries;
5. commit or materialize canonical facts into SantosDia-controlled data;
6. generate an editorial candidate from those facts without copying source prose;
7. run language, factual, duplication and rights checks;
8. require human approval for interpretive or biographical prose;
9. publish the approved first-party artifact;
10. monitor sources only for deltas thereafter.

## 8. Editorial duplication guard

A new editorial page must not be published when it is substantially duplicative of another SantosDia page or appears to be a source paraphrase with little added structure or synthesis.

Quality tooling should progressively add checks for:

- minimum substantive content;
- duplicate or near-duplicate SantosDia prose;
- source-prose leakage;
- missing provenance;
- unsupported factual claims;
- translation leakage;
- empty or template-only indexable pages.

## 9. Presentation rule

The visible product should identify the prose as SantosDia editorial work where appropriate, for example with wording such as “Conteúdo editorial SantosDia, preparado a partir das fontes indicadas”.

This does not mean SantosDia claims authorship of third-party source material. It means the article, synthesis, organization and wording presented on SantosDia are first-party editorial work grounded in cited evidence.

## 10. Non-negotiable publication rule

No external prose becomes public SantosDia prose merely because it was ingested, translated, shortened, reordered or lightly edited.

The public corpus must be first-party by composition, first-party by storage and first-party by publication, while remaining evidence-backed and source-transparent.

## 11. Product continuity during AdSense/Search remediation

Editorial quality gates must not be confused with product availability.

SantosDia must preserve its complete chronological and utility product even when particular routes are intentionally excluded from search indexes or monetization. The core chronology of saints and observances, Today, Calendar, Liturgical Calculator, rolling ICS/webcal, annual snapshots, search/discovery, context selection and machine-readable outputs remain strategic product capabilities.

The governing distinction is:

- **product availability**: the route or tool is useful and may remain public;
- **search indexability**: the page is indexed only when it independently passes the substantive-value gate;
- **monetization eligibility**: ads are served only after AdSense approval and only where page quality and user experience permit it.

Accordingly, `noindex,follow` is a search-quality control, not a deletion instruction. Daily chronological pages may remain fully navigable and useful while excluded from the sitemap. Calendar and calculator tools may remain available even if their main purpose is utility rather than editorial acquisition.

The AdSense low-value-content remediation must therefore add first-party editorial depth and curate the indexed footprint without reducing liturgical coverage, chronological navigation or the initial SantosDia toolset.

The normative strategic clarification is recorded in `docs/product/global-liturgical-intelligence-v2.1-addendum-2026-08-29.md`.

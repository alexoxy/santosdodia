# SantosDia v2 — R0 architecture audit

Date: 2026-08-22  
Normative contract: `config/product-platform-contract.json`  
Execution issue: #181  
Machine-readable inventory: `config/v2-r0-inventory.json`

## Purpose

This is the proof-before-deletion baseline for the SantosDia v2 migration. It intentionally changes no runtime behaviour. Its purpose is to distinguish four very different cases:

- **KEEP** — proven product/safety contracts that the migration must preserve;
- **REFACTOR** — useful behaviour whose internal ownership/model should change;
- **KEEP COMPATIBILITY** — cheap legacy URLs that should remain as redirects where they protect inbound links/SEO;
- **CONSOLIDATION CANDIDATE** — overlapping automation that may be merged only after output, recovery and rollback equivalence is proven.

No current runtime path is authorised for deletion by this audit.

## Findings that change the migration order

### 1. `/calendar` is canonical but does not own its implementation

`app/calendario/page.tsx` contains the real visual calendar implementation and declares `/calendar` as its canonical URL. `app/calendar/page.tsx` merely re-exports that module.

This works today and must not be broken. The v2 cleanup should invert ownership: move implementation to `/calendar`, keep `/calendario` as a minimal permanent compatibility redirect, and only do so after route/metadata/ICS acceptance tests are green.

This is **refactor debt**, not evidence that `/calendario` should be deleted immediately.

### 2. `/dia/[date]` is already the right kind of legacy path

The Portuguese legacy day route is a minimal `permanentRedirect` to `/day/[date]`. This is cheap, explicit and SEO-safe. There is no current reason to remove it merely to reduce file count.

Permanent compatibility redirects are not the kind of technical debt the hygiene programme should optimise away unless crawl/index evidence shows otherwise.

### 3. `/day/[date]` and `/date/[monthDay]` disagree on Person URL eligibility

The evergreen `/date/[monthDay]` structured data already checks whether an observance has a substantive indexable biography before assigning a `/saint/...` URL. When it does not, it keeps the item anchored to the date/observance surface.

The civil-date `/day/[date]` ItemList still emits `/saint/{id}` for every public observance.

Before Person/Recognition/Observance migration, this divergence must become a semantic acceptance test and then be corrected. Otherwise an internal entity refactor could accidentally multiply false Person URLs and undermine SEO/AI semantics.

### 4. Person separation has already begun and should be evolved, not replaced

`data/canonical-person-profiles.ts` already recognises that a canonical person and a liturgical occurrence are different. It gives a person a stable identity and uses `primaryObservanceId` as a bridge to the calendar.

The v2 target should evolve this successful separation rather than replace it wholesale:

`Person ↔ Recognition ↔ Observance ↔ Occurrence`

The current `primaryObservanceId` becomes a presentation/primary-calendar relation, not part of Person identity.

Existing `/saint/{id}` URLs must remain stable while the internal model changes.

### 5. `data/observances.ts` is carrying too many responsibilities

The module currently mixes:

- tradition/category/calendar-system types;
- source catalogue and authority notes;
- observance definitions;
- editorial summaries;
- multilingual labels;
- seeded multi-tradition content.

The data is valuable. The coupling is the problem.

R1 should separate **canonical data types**, **source policy/evidence**, **editorial/localised prose** and **release data** without changing public results.

### 6. The automation registry confirms genuine overlap

The repository currently contains at least three overlapping Wikidata-related operational layers:

1. baseline acquisition → normalization → language → identity ledger → D1 staging;
2. autonomous scout → normalization → language → classifier → corroborator → D1 staging;
3. profile/labels/navigation enrichment/export.

This is not a reason to delete one chain today. The chains have different receipts, completeness boundaries and downstream consumers.

It is, however, the clearest R1 consolidation target. The desired end state is the eight role model already fixed in the product contract:

`SourceMonitor → EvidenceArchivist → NormalizerResolver → CalendarEngine → LanguageEditor → ContentSeoPublisher → LiveCurator → QualityHygieneSentinel`

A future consolidation PR must prove, for the affected stream:

- identical or intentionally improved entity coverage;
- identity/QID continuity;
- locale coverage and leakage behaviour;
- immutable Dropbox evidence/receipts;
- conflict and review queues;
- D1 staging semantics;
- rollback/last-known-good behaviour;
- no new production auto-write path.

Only then can obsolete workflow files and registry entries be removed.

## KEEP — contracts that must survive the migration

The following are protected foundations, not rewrite targets:

- one publication-safe canonical read model for Today / Calendar / JSON / ICS;
- explicit Global versus Portugal jurisdiction scoping;
- reviewed Portugal v2 production semantics;
- SNL Portugal authority/reconciliation path;
- publication/indexation fail-closed gates;
- substantive biography quality gate;
- source and claim provenance;
- PT-PT linguistic/date rules and no silent English fallback;
- AdSense `PREPARING` behaviour and CMP/association code;
- Cloudflare Free guardrails;
- no request-time external acquisition;
- production health and last-known-good behaviour;
- persistent ICS rolling-versus-snapshot semantics;
- official-source Live curation;
- Dropbox as evidence/recovery memory;
- D1 as serving knowledge, not raw evidence archive.

## REFACTOR — bounded sequence

### R0.1 — semantic acceptance vectors

Before changing models, add or strengthen maintained vectors for:

1. Global vs `country=PT` routing across Today, Calendar, JSON and ICS;
2. reviewed Portugal 2026 dates and canonical identities;
3. Person vs Observance URL eligibility across day/date/profile structured data;
4. PT-PT date/name rendering (`22 de agosto de 2026`, lowercase `de`, source-aware `S.`);
5. rolling ICS vs annual snapshot;
6. zero silent English fallback in launched locales;
7. Live authority, source, timezone and state.

### R0.2 — canonical route ownership

After R0.1 is green:

- move visual calendar implementation from `/calendario` to `/calendar`;
- preserve `/calendario` as a permanent redirect;
- verify canonical metadata, navigation, API/ICS links and production smoke;
- remove only duplicated implementation, never the compatibility promise without evidence.

### R1.1 — entity boundary

Introduce explicit internal contracts for Person / Recognition / Observance / Occurrence behind adapters that preserve current public DTOs. Do not mass-migrate URLs or content in the same PR.

### R1.2 — Evidence Vault manifest contract

Standardise raw / normalized / canonical / releases / changes / conflicts / rights / rollback manifests in Dropbox. Existing archives remain valid inputs; migration should add compatibility readers rather than rename/delete historical evidence first.

### R1.3 — automation consolidation

Choose one bounded Wikidata partition and prove equivalence between the overlapping chains. Consolidate only that partition first. Repeat only after production/staging evidence shows lower operational complexity with no semantic loss.

## RETAIN as compatibility rather than “hygiene delete”

The hygiene rule is about eliminating **unused implementation**, not useful inbound compatibility.

Examples:

- `/dia/[date]` should remain a tiny permanent redirect;
- `/calendario` should become the same kind of compatibility route after canonical ownership is inverted;
- published `/saint/{id}` URLs should remain stable while the entity model changes.

## First R0 acceptance set

The minimum protected semantic vectors before destructive work are recorded machine-readably in `config/v2-r0-inventory.json`.

Of particular importance are the already reviewed Portugal dates:

- Epiphany — 4 January 2026 in the approved Portugal context;
- Tuesday after Epiphany — 6 January 2026;
- Five Wounds — 7 February 2026;
- St Matthias — 14 May 2026;
- Ascension — 17 May 2026;
- Immaculate Heart — 15 June 2026.

These are not an exhaustive calendar test suite. They are high-value sentinels for detecting accidental loss of territorial/transfer/precedence semantics during refactor.

## Decision

The first destructive v2 PR is **not yet authorised**.

The next code PR should strengthen semantic acceptance vectors, beginning with Person/Observance URL eligibility and the existing cross-surface calendar vectors. Once those are green, canonical route ownership can be cleaned up safely. Automation deletion waits until R1 output/rollback equivalence exists.

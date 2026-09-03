# SantosDia — Current Cycle Checkpoint

Updated: 2026-09-03 20:47 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Machine contract: `config/product-platform-contract.json`
Status: active development; Portugal 2026 baseline remains published; perennial cutover remains fail-closed

## Continuity rule

The strategic document is the binding and cumulative product vision until full implementation. This checkpoint measures progress against that vision; it does not replace, narrow or reinterpret it. Resume from the first pending roadmap item only after independently confirming GitHub, Gmail and Dropbox state.

## Normative operating boundary

- First-party public experience is text only; verified, privacy-preserving, user-activated livestream is the sole audiovisual exception.
- Portugal is the first quality and semantic-equivalence anchor, never the global architecture.
- Church/tradition, jurisdiction, calendar system, locale and timezone remain independent dimensions.
- The approved annual source corpus is predominantly static. Heavy acquisition/enrichment runs monthly on distributed dates; only lightweight production health and source freshness/verified Live remain weekly; exceptional runs remain explicit and fail-closed.
- Cloudflare remains within the Free architecture; remote D1 writes are restricted to the Monday UTC window and are skipped outside it.
- AdSense is `REMEDIATION_REQUIRED` for `low-value-content`; serving and review resubmission remain disabled.
- Evidence promotion, perennial publication, alert closure and destructive hygiene remain fail-closed.
- Evidence Vault, canonical history, receipts and rollback evidence are never deleted as repository hygiene.

## Completed since the previous checkpoint

- PRs #265–#275 promoted six small, source-coherent Sanctorale batches. Exact fixed Sanctorale coverage rose from 24 to 48 and total canonical coverage from 87/389 to 111/389.
- PRs #266, #268, #270, #272, #274 and #276 preserved the corresponding review packs before promotion. PR #276 is the reviewed batch 7 pack and remains immutable evidence.
- PR #277 corrected the automation cadence:
  - all 14 scheduled roots now run no more frequently than weekly, except the already-monthly CauseSanti source;
  - Monday tasks are staggered to avoid synchronized load;
  - the automation registry records `scheduledTasksAtMostWeekly: true`;
  - `scripts/audit-automation-registry.mjs` now rejects hourly, sub-hourly, daily and multiple-cron schedules;
  - documentation and regression tests encode the same static-corpus and D1 Free-tier boundary.
- PR #278 promoted Sanctorale batch 7 as five complete canonical chains:
  - Saint Justin Martyr — 1 June;
  - Saint Boniface — 5 June;
  - Saint Philip Neri — 26 May;
  - Saint John Mary Vianney — 4 August;
  - Saint Josaphat Kuntsevych — 12 November.
- Each batch 7 chain includes Person, Roman Catholic Recognition, Observance, perennial fixed SanctoraleRule, Portugal 2026 Occurrence, exact legacy bridge and approved-source shadow binding.
- SNL evidence binds the annual Portugal date and `MO` rank; Vatican News evidence binds identity and ecclesial designation. No identity was inferred from label similarity.
- Batch 7 fixed mapping digest: `e9d0bc6446ab7822260563f663941b3bb527376a245f5b1d54c61832fee6d984`.
- PR #280 aligned the implementation with the corpus-first vision:
  - bounded bootstrap/backfill captures the maximum useful permitted authority evidence into Dropbox releases;
  - after completeness, full sweeps stop and normal maintenance becomes monthly delta-only;
  - 12 heavy/static roots now run once monthly on days 1–22; only production health and source freshness remain weekly;
  - Roman Catholic Portugal is the sole advertised ready subscription; the seven other modeled traditions are reviewed previews/in preparation;
  - Coptic Orthodox is now an explicit planned authority-isolated kernel;
  - the AdSense re-review gate now requires honest production value and recrawl, not merely counts or green CI.
- Durable OSINT and market evidence is recorded in `docs/research/adsense-market-and-source-osint-2026-09-03.md`.
- PR #282 preserved Sanctorale review batch 8 as immutable, non-mutating evidence for Saint Agatha, Saint Maximilian Maria Kolbe, Saint Monica, Saint Pius of Pietrelcina and Saint Elizabeth of Hungary.
- PR #283 promoted those five exact source-bound chains into the canonical shadow. Fixed Sanctorale coverage advanced from 53 to 58 and total canonical coverage from 116/389 to 121/389.
- Batch 8 review digest: `529efbf1d0c84bf6d43ea5b7e4a2aee354e1614e396a70becdfdb8a024f6b9d7`; fixed mapping digest: `314a725e54c4ce18a406500aab40acd9c3cd0efa961ac6d7fd9e72a57ab73d38`.
- The promotion remains shadow-only: no public read-model change, D1 production write, Dropbox production promotion, AdSense serving or review resubmission.

## Current Portugal 2026 reconciliation

- Approved source population: 389 occurrences, 365 civil days and 1,945 labels.
- Direct TemporalRule bindings: 5.
- Precedence-surviving TemporalRuleFamily bindings: 47; 19 suppressed candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: 11, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: 58.
- Total canonical migration coverage: **121/389 (31.105%)**.
- Legacy occurrences still outside the canonical shadow: **268**.
- Source-bound civil days: **121/365**.
- Civil days without a source-bound canonical occurrence: **244**.
- Full semantic equivalence: `false`.
- Migration promotion and perennial publication: `false`.
- Production/D1 mutation from the Sanctorale work: none.

Identity is never created by label similarity, and an annual date never becomes a perennial rule without canonical Observance, competent authority and exact source binding.

## CI and external proof

### Weekly-policy correction — PR #277

- Squash merge on `main`: `ad1cd9250e5ab87e27a310b7acdecf82eb9cf3c2`.
- Quality `33795220821`: success, including all 64 steps and Cloudflare production smoke.
- Calendar/Discovery `33795220808`: success.
- Wikidata retry quality `33795220830`: success.
- Production health `33795220819`: success.
- AdSense readiness `33795220869`: success; this is a repository gate only and does not clear the external remediation state.
- Dropbox staging validation:
  `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/ad1cd9250e5ab87e27a310b7acdecf82eb9cf3c2/validation.json`.
- Receipt: 389 occurrences, 365 days, 1,945 labels, 15 decisions, `validated-for-d1-staging`, `productionApproved: false`, server-modified `2026-09-03T19:18:55Z`.

### Sanctorale batch 7 — PR #278

- Head: `8b270e77e3d25dbe84fba8094915d15dde5d26f0`.
- Squash merge on `main`: `09738154aa464d082a51b8666346018db01ebc06`.
- Sanctorale review quality `33796167481`: success.
- Quality `33796167359`: success, including Worker build and production smoke.
- Wikidata retry quality `33796167328`: success.
- Canonical promotion receipt:
  `data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-7.json`.
- The immutable approved source release did not change, so no new production receipt, D1 write or public release was created.

### Sanctorale batch 8 — PRs #282 and #283

- Review head `5dd07d6189b6055e2d7d53fa4495e8f527e79e9f`; review squash merge `96e1e5445f21b09e2ea4304e1ee32664d9543a8a`.
- Review workflows: Sanctorale review quality `33803236849`, Quality `33803236791` and Wikidata retry quality `33803236803`: success.
- The first review run correctly rejected the official short label `S. Mónica` under an obsolete length check; the contract was corrected to require an exact designation/rank expression and all replacement checks passed.
- Promotion head `bda5b08b756981bcc44ca0a13fd85bc5f645b062`; promotion squash merge `1a5dcf04444a467f0d357530468ce2afcf020901`.
- Promotion workflows: Sanctorale review quality `33803947972`, Quality `33803948045` and Wikidata retry quality `33803947969`: success.
- Canonical promotion receipt:
  `data/migrations/roman-catholic-pt-2026-v2.sanctorale-promotion-batch-8.json`.
- The approved Portugal source artifact remains immutable; no D1 production write or public release was created.

### Durable corpus and calendar-readiness alignment — PR #280

- Head: `84cea7433c54b96e755c85d984f83bd919635228`.
- Squash merge on `main`: `ae8548e76f42b179e8e34366f790194a18880bad`.
- AdSense readiness `33799269108`: success.
- Calendar/Discovery `33799269062`: success after canonical tradition-ID correction.
- Wikidata retry quality `33799269273`: success.
- Quality `33799269143`: success, including automation policy, typecheck, lint, Next.js build, Cloudflare Worker build and production smoke.
- No production or D1 mutation was authorized or performed by this PR.
- Dropbox still exposes the last validated Portugal v2 staging receipt at the `ad1cd925...` path below: 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`.

### Preserved production baseline

- Production release commit: `a27e50710d4d0a8cf71ee7644baa7d4b03094792`.
- Production result: 365 published occurrences, 365 days and 1,825 labels.
- Dropbox production receipt:
  `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/production/a27e50710d4d0a8cf71ee7644baa7d4b03094792/production-receipt.json`.
- Pre- and post-release D1 Time Travel bookmarks remain preserved.
- The published baseline does not authorize cutover to the incomplete perennial shadow.

## Operational alerts

- Autonomous OSINT acquisition run `33602989268` initially failed because Wikidata SPARQL returned HTTP 500 after six attempts. Dropbox/archive steps were skipped, so the failed attempt had no incomplete external effect.
- Attempt 2 succeeded. Acquisition/archive job `100778728685` wrote the Wikidata raw package and receipt to Dropbox slot `osint-raw/saints/wikidata/slots/05`.
- Downstream normalization `33794596283`, linguistic review `33794683140`, classification `33794744522` and autonomous D1 importer `33794744531` succeeded.
- The remote D1 steps correctly skipped because the Thursday run was outside the Monday UTC write window.
- After this positive workflow and external-effect proof, Gmail message `1a06103e98e32d21` was moved to Trash.
- Batch 8 review initially produced Gmail failure notification `1a068fc7fda6423b`; after the exact-label fix and green replacement workflows, that notification was moved to Trash.
- A fresh project-error search returned zero inbox matches. No other message was deleted.
- The unread AdSense remediation message remains preserved and actionable.
- Fresh post-work searches must continue to exclude Trash and distinguish unresolved failures from corrected historical notifications.

## Strategic coverage matrix

| Strategic area | Status | Evidence / remaining gate |
|---|---|---|
| Binding global strategy | Realised governance | v2.1 remains normative; supersession requires explicit owner approval. |
| Text-first first-party experience | Realised | No first-party media exists outside verified Live. |
| Editorial and search quality | Partial | Current profiles are deep-ready and sitemap is curated; AdSense remains in remediation until production recrawl and explicit readiness. |
| Canonical context dimensions | Partial | Separation is contractual and tested; global public breadth remains incomplete. |
| Evidence Vault and provenance | Partial | Immutable hashes, review packs, promotion receipts and rollback exist; authoritative coverage remains incomplete. |
| Roman perennial Temporale | Realised core | 16 canonical TemporalRules, 5 direct bindings, 47 precedence-surviving family rows and movable/transfer vectors are proved. |
| Roman Sanctorale | Partial | 58 exact fixed bindings across General Roman, Europe and Portugal; 268/389 legacy occurrences remain outside the migration shadow. |
| Precedence, transfer and colours | Partial | Deterministic core and three approved Portugal transfers exist; complete annual equivalence remains open. |
| Portugal 2026 baseline publication | Verified | Exact production receipt and rollback evidence exist; future writes are disabled. |
| Rolling materialisation Y-1…Y+3 | Realised core | Automatic window and atomic materialisation tests exist. |
| Portugal reference Today | Partial | Reviewed context is live; perennial read-model cutover awaits 389/389 equivalence. |
| Lusophone jurisdictions | Pending | Requires jurisdiction-specific authority packs after Portugal proof. |
| Other Churches | Pending | OCA, GOARCH, Church of England and Coptic Orthodox require separate authority-isolated kernels and acceptance vectors; other modeled traditions remain previews/planned. |
| Autonomous maintenance | Partial | Monthly distributed heavy acquisition, two lightweight weekly exceptions, static-corpus audits, fail-closed alerts and D1 budgets are encoded; source-level completeness receipts remain incomplete. |

## Repository hygiene inventory

- PR #277: merged after five green workflows.
- PR #278: merged after three green workflows.
- PR #280: merged after four green workflows; one canonical-ID typecheck failure was corrected and revalidated before merge.
- PR #282: review pack merged after three green replacement workflows; the obsolete short-label assertion was corrected without weakening exact designation validation.
- PR #283: canonical promotion merged after three green workflows.
- Current `main`: `1a5dcf04444a467f0d357530468ce2afcf020901`.
- No pull request remains open at this checkpoint.
- Open issues: #181 only, the strategic umbrella.
- No branch was force-moved or deleted to simulate cleanup.
- Historical Evidence Vault, canonical releases, review packs, receipts, rollback and unique branch work remain preserved.

## Risks and decisions

- AdSense remains `REMEDIATION_REQUIRED`; do not resubmit merely because repository checks are green.
- Monthly scheduled frequency is a resource policy, not a substitute for evidence freshness. Authority-specific urgent changes use bounded, documented, fail-closed event runs.
- Canonical coverage is occurrence-based; suppressed candidates and transfer-origin replacements remain evidence, not additional coverage.
- The runtime/public read model remains the proven production baseline until 389/389 semantic equivalence.
- A green canonical PR does not authorize D1 mutation or Dropbox production promotion.

## Ordered roadmap

1. Continue Portugal 2026 equivalence with the next bounded source-coherent Sanctorale batch, using exact competent-authority identities and approved-source rows; write completeness receipts as each source/context bootstrap finishes.
2. In parallel, extend only source-proved Temporale/transfer vectors where they reduce unresolved coverage without double-counting suppressed or replacement evidence.
3. Reduce the remaining 268 legacy occurrences while keeping all identity merge/split and cross-Church decisions under explicit review.
4. Reach 389/389, explain every precedence/transfer difference and only then consider perennial read-model cutover.
5. Harden rolling ICS/calculator parity across independent context dimensions.
6. Expand first-party editorial/search surfaces selectively during AdSense remediation; verify authorship, method, source visibility and honest capability claims; never create a thin-page factory.
7. Begin lusophone jurisdiction packs only after the Portugal gate; add other Churches as separate authority-isolated kernels.

## Resume and stop rules

- Read this checkpoint first, then confirm GitHub, Gmail and Dropbox before new work.
- Do not delete an error email without positive workflow and promised external-effect proof.
- Do not merge a PR whose required checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Do not schedule heavy/static corpus work more frequently than monthly; weekly exceptions are limited to lightweight production health and source freshness/verified Live.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.

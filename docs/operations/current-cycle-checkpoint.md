# SantosDia — Current Cycle Checkpoint

Updated: 2026-08-31 09:43 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Machine contract: `config/product-platform-contract.json`
Status: active development; Portugal 2026 baseline remains published; perennial cutover remains fail-closed

## Continuity rule

The strategic document is the binding and cumulative product vision until full implementation. This checkpoint measures progress against that vision; it does not replace, narrow or reinterpret it. Resume from the first pending roadmap item only after independently confirming GitHub, Gmail and Dropbox state.

## Normative operating boundary

- First-party public experience is text only; verified, privacy-preserving, user-activated livestream is the sole audiovisual exception.
- Portugal is the first quality and semantic-equivalence anchor, never the global architecture.
- Church/tradition, jurisdiction, calendar system, locale and timezone remain independent dimensions.
- Cloudflare remains within the Free architecture; remote D1 writes stay budgeted and fail-closed.
- AdSense is `REMEDIATION_REQUIRED` for `low-value-content`; serving and review resubmission remain disabled.
- Evidence promotion, perennial publication, alert closure and destructive hygiene remain fail-closed.
- Evidence Vault, canonical history, receipts and rollback evidence are never deleted as repository hygiene.

## Completed since the previous checkpoint

- PR #249 added Matthias, Bartholomew, Simon/Jude and Andrew as a source-coherent apostolic Sanctorale batch. Simon and Jude remain two Persons and two Recognitions joined by one multi-person Observance.
- PR #250 added Lawrence of Rome and Stephen the Protomartyr as complete General Roman chains.
- PR #251 established the first-party editorial boundary and kept AdSense serving disabled.
- The three editorial-depth waves brought all 29 current saint biographies to the internal deep-ready threshold without copying third-party prose.
- PRs #256 and #258 added reviewed Today context and moved its selection server-side; homepage First Load JS fell from 337 kB to 239 kB.
- PR #259 curated the search footprint, leaving useful thin utilities available but `noindex,follow`; the original liturgical calculator remains deliberately indexable.
- PR #262 added Saints Cyril and Methodius and Saint Anthony as two reviewed jurisdictional feast bindings:
  - Cyril and Methodius are separate Persons and Recognitions joined by one Europe-scoped multi-person Observance;
  - Anthony retains canonical identity `anthony-lisbon` and the Portuguese designation Santo António de Lisboa, with a Portugal-scoped rule;
  - both annual rows are bound to exact source occurrence IDs and SHA-256 record hashes from the approved Portugal v2 artifact;
  - fixed Sanctorale coverage increased from 22 to 24 and total migration coverage from 85/389 to 87/389.
- PR #263 incorporated the valid contents of the stale PR #260 on the current base: the machine contract now records the AdSense remediation state, the dedicated remediation checkpoint preserves the editorial/search chronology and this cycle checkpoint records the completed canonical unit.
- PR #261 updated Next.js to 15.5.24, OpenNext to 1.20.4, Wrangler to 4.127.0 and the related types/config only after a Dependabot rebase and green current-base Quality/Wikidata checks.

## Current Portugal 2026 reconciliation

- Approved source population: 389 occurrences, 365 civil days and 1,945 labels.
- Direct TemporalRule bindings: 5.
- Precedence-surviving TemporalRuleFamily bindings: 47; 19 suppressed candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: 11, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: 24.
- Total canonical migration coverage: **87/389 (22.365%)**.
- Legacy occurrences still outside the canonical shadow: **302**.
- Source-bound civil days in the reconciliation ledger: **87/365**.
- Explicit unresolved civil days: **278**.
- Full semantic equivalence: `false`.
- Migration promotion and perennial publication: `false`.
- Production/D1 mutation from this work: none.

Identity is never created by label similarity, and an annual date never becomes a perennial rule without canonical Observance, competent authority and exact source binding.

## CI and external proof

### PR #262

- Head: `18d3d3ce406a5e1c0a2c131a8b771bddd63c196f`.
- Squash merge on `main`: `432b270f073fa86099a2ba400a4a1498a6567914`.
- Product BUILD `33377285666`: success.
- Product publish staging `33377285681`: success.
- Wikidata retry quality `33377285557`: success.
- Quality `33377285626`: success, including all 64 steps, Next.js, Cloudflare/OpenNext and production smoke.
- Local AdSense readiness audit: passed; serving remains fail-closed.
- Dropbox staging validation:
  `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/18d3d3ce406a5e1c0a2c131a8b771bddd63c196f/validation.json`.
- Dropbox receipt metadata: 410 bytes, server-modified `2026-08-31T09:23:26Z`.
- Receipt content: 389 occurrences, 365 days, 1,945 labels, 15 decisions, `validated-for-d1-staging`, `productionApproved: false`.

### Checkpoint and dependency closeout

- PR #263 head `e7e4902c7550369752a86a66c7d1a6943d88b3dd`: Quality `33378317758` and Wikidata retry quality `33378317806` passed; squash-merged as `69788d05e890472963f44c31a7231cc75512de13`.
- PR #260 was then closed as superseded, with its history preserved and an explicit link to #263.
- PR #261 was rebased onto `69788d05e890472963f44c31a7231cc75512de13`; rebased head `fd186b72a2dd2d001bc8f4d8558457723580c6e7` passed Quality `33378736715` and Wikidata retry quality `33378736730`, then squash-merged as `0616ad9ee1e64ba11bd09650d41001cf57390c69`.
- These closeout units made no remote D1 writes and did not change the fail-closed perennial promotion state.

### Preserved production baseline

- Production release commit: `a27e50710d4d0a8cf71ee7644baa7d4b03094792`.
- Production result: 365 published occurrences, 365 days and 1,825 labels.
- Dropbox production receipt:
  `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/production/a27e50710d4d0a8cf71ee7644baa7d4b03094792/production-receipt.json`.
- Pre- and post-release D1 Time Travel bookmarks remain preserved.
- The published baseline does not authorize cutover to the incomplete perennial shadow.

## Operational alerts

- Fresh Gmail search at 2026-08-31 09:36 UTC for `[alexoxy/santosdodia] Run failed` after 2026-08-29, excluding Trash: **zero messages**.
- No email was moved or deleted in this cycle.
- Historical resolved-alert receipts and Trash decisions remain preserved in Git/Gmail history.

## Strategic coverage matrix

| Strategic area | Status | Evidence / remaining gate |
|---|---|---|
| Binding global strategy | Realised governance | v2.1 remains normative and cumulatively reflected in the machine contract; supersession requires explicit owner approval. |
| Text-first first-party experience | Realised | CI checks 113 interface code/style files; no first-party media exists outside verified Live. |
| First-party editorial and search quality | Partial | 29/29 current profiles are deep-ready, Today is server-selected, sitemap is curated; AdSense remains in remediation until production recrawl and explicit readiness decision. |
| Canonical context dimensions | Partial | Separation is contractual and tested; global public breadth remains incomplete. |
| Evidence Vault and provenance | Partial | Immutable hashes, source isolation, receipts and rollback exist; broader authoritative source coverage remains incomplete. |
| Roman perennial Temporale | Realised core | 16 canonical TemporalRules, 5 direct bindings, 47 precedence-surviving family members and 55 rolling movable calculations are proved. |
| Roman Sanctorale | Partial | 24 exact fixed bindings across General Roman, Europe and Portugal; 302/389 legacy occurrences remain outside the migration shadow. |
| Precedence, transfer and colours | Partial | Deterministic core and three approved Portugal transfers exist; complete annual equivalence remains open. |
| Portugal 2026 baseline publication | Verified | Exact production receipt and rollback evidence exist; future writes are disabled. |
| Rolling materialisation Y-1…Y+3 | Realised core | Automatic window and atomic materialisation tests exist. |
| Rolling ICS and calculator | Partial | Public foundations and deterministic calculator exist; complete context parity remains open. |
| Portugal reference Today | Partial | Useful reviewed context is live; perennial read-model cutover awaits 389/389 equivalence. |
| Lusophone jurisdictions | Pending | Requires jurisdiction-specific authority packs after Portugal proof. |
| OCA, GOARCH and Church of England kernels | Pending | Requires separate authority-isolated kernels and acceptance vectors. |
| Verified Live | Partial | Sole audiovisual exception is user-activated and privacy-enhanced; global coverage remains incomplete. |
| Autonomous maintenance | Partial | Weekly continuation, fail-closed alerts and data budgets exist; exception-only operation across all sources remains incomplete. |

## Repository hygiene inventory

### Pull requests and issues

- PR #262: merged with four green workflows.
- PR #263: merged with the two applicable green documentation/contract workflows.
- PR #260: closed as superseded by #263 after content-equivalence and current-base CI proof.
- PR #261: rebased, passed current-base Quality and Wikidata checks and merged; its dependency branch was deleted automatically after merge.
- Open issues: #181 only, the strategic umbrella.
- No PR remains open at this checkpoint.

### Code and branches

- Repository audit passed: 735 tracked files, 17.68 MiB and five intentional generated data files.
- No active Vercel or GitHub Pages configuration exists.
- No deletion was attempted without consumer, equivalence and recovery proof.
- Historical Evidence Vault, canonical releases, receipts, rollback and unique branch work remain preserved.
- Merged feature branches are deletion candidates only after exact merge/tree and unique-commit comparison; the current connector does not expose safe ref deletion, so refs are not force-moved to simulate deletion.

## Risks and decisions

- AdSense: `REMEDIATION_REQUIRED`; do not resubmit merely because repository checks are green. Verify production metadata/navigation, allow recrawl and make an explicit readiness decision.
- Canonical coverage is occurrence-based; suppressed candidates and transfer-origin replacements remain evidence, not additional coverage.
- Saint Anthony appears both as the source-backed 13 June fixed feast and as origin-replacement evidence for the approved Immaculate Heart transfer. This is intentional and must not be double-counted.
- The runtime/public read model remains the proven production baseline until 389/389 semantic equivalence.
- Dependency security updates were integrated only after current-base CI; future grouped updates retain the same rebase-and-revalidate rule.

## Ordered roadmap

1. Continue Portugal 2026 equivalence in the next small source-coherent Sanctorale batch, prioritising approved proper feasts/memorials with exact source identities rather than one PR per saint.
2. Reduce the remaining 302 legacy occurrences while keeping all identity merge/split and cross-Church decisions under explicit review.
3. Reach 389/389, explain every precedence/transfer difference and only then consider perennial read-model cutover.
4. Harden rolling ICS/calculator parity across independent context dimensions.
5. Expand first-party editorial/search surfaces selectively during AdSense remediation; never create a thin-page factory.
6. Begin lusophone jurisdiction packs only after the Portugal gate; add other Churches as separate authority-isolated kernels.

## Resume and stop rules

- Read this checkpoint first, then confirm GitHub, Gmail and Dropbox before new work.
- Do not delete an error email without positive workflow and promised external-effect proof.
- Do not merge a PR whose required checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Do not reduce the strategic document to the delivered subset.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.

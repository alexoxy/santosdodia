# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-25 10:52 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-25-v38.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 301/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#423](https://github.com/alexoxy/santosdodia/pull/423) delivered E07.05 batch 32:

- represented Saint Maria Goretti as an independent canonical Person, Roman Catholic Recognition and Observance;
- added a perennial General Roman rule for the optional memorial on 6 July;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StMariaGoretti` as a legacy bridge rather than a second identity;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `496ff5ead7a4d8d5506f04301645c8a4f4da9827`.

Squash merge: `6b25f3645d3f25925debafe0cc5c25d84c9dd7df`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **103** across **97 civil dates**.
- Total source-bound coverage: **301/389 (77.378%)**.
- Remaining: **88 occurrences** and **73 civil days**.
- Source-bound days: **292/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 41 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **88** |

## CI, staging and external proof

PR #423 passed Product BUILD 144, Product publish staging 140, Quality 1527, Wikidata retry quality 662 and Sanctorale review quality 83 on the exact head. The full local `npm run check`, focused canonical reconciliation tests, Cloudflare Free guardrails and the AdSense fail-closed checker passed; the pre-existing Turbopack dynamic-filesystem warning remained non-fatal.

The Dropbox head archive stores `manifest.json`, `validation.json`, `localization-review.json` and `release.json` under `496ff5ead7a4d8d5506f04301645c8a4f4da9827`. Validation reports 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`. Its internal `sourceSha` remains the base `2343679643742f6658ace722752c509d6c69e83f`; this is recorded and is not presented as head provenance.

Official proof:

- SNL 6 July 2026 lists Saint Maria Goretti, virgin and martyr, as `MF`, an optional memorial;
- Vatican News and the Holy See identify Saint Maria Goretti as virgin, martyr and saint.

Dropbox proof:

- v38 JSON: `id:oANWCGUyYBwAAAAAAAAZoQ`, 337,294 bytes;
- v38 MD: `id:oANWCGUyYBwAAAAAAAAZoA`, 181,393 bytes;
- batch-32 receipt: `id:oANWCGUyYBwAAAAAAAAZog`, 3,833 bytes;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAZkg`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAZkw`;
- staging release: `id:oANWCGUyYBwAAAAAAAAZlA`;
- staging localization review: `id:oANWCGUyYBwAAAAAAAAZlQ`.

Issue #355 is to point to v38 and the batch-32 receipt after this checkpoint merges.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #423 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to the Saint Maria Goretti chain, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 301/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 301-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A General Roman fixed date and rank may become a perennial rule only from competent universal evidence; Portugal 2026 remains a separate jurisdictional materialization.
- Optional memorials remain explicit alternatives subject to precedence; no source row or translation may silently force celebration.
- Names, translated labels and shared civil dates never create identity automatically.
- The staging receipt's internal base `sourceSha` must not be mistaken for the validated PR head even when the Dropbox path is head-scoped.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StAugustineZhaoRong` on 9 July and prove the official composition, identities, recognition, exact SNL occurrence, rank and scope from competent sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v38; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 32.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

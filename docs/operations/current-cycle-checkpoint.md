# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 22:56 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v33.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 296/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#413](https://github.com/alexoxy/santosdodia/pull/413) delivered E07.05 batch 27:

- represented Saint Norbert as an independent canonical Person, Roman Catholic Recognition and Observance;
- added a perennial General Roman rule for the optional memorial on 6 June;
- bound the Portugal 2026 occurrence and MF rank to the exact SNL source row;
- preserved `rc:StNorbert` as a legacy bridge rather than a second identity;
- preserved the separate optional Saturday Marian occurrence `rc:SatMemBVM3` on the same day;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `7e320a164c45701b9a8671f03dc893e66b90b904`.

Squash merge: `23d86abb04b2f6c87b8ce7486127ee66951a155d`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **98** across **93 civil dates**.
- Total source-bound coverage: **296/389 (76.093%)**.
- Remaining: **93 occurrences** and **76 civil days**.
- Source-bound days: **289/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 46 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **93** |

## CI, staging and external proof

PR #413 passed Product BUILD, Product publish staging, Quality, Wikidata retry quality and Sanctorale review quality on the exact head. The full local `npm run check`, focused canonical reconciliation tests and the AdSense fail-closed checker passed. Post-merge Product BUILD, Product publish staging, Quality and Sanctorale review runs passed on `main`.

The Dropbox head archive stores `manifest.json`, `validation.json`, `localization-review.json` and `release.json` under `7e320a164c45701b9a8671f03dc893e66b90b904`. Validation reports 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`. Its internal `sourceSha` remains the base `9293562b...`; this discrepancy is recorded and is not presented as head provenance.

Official proof:

- SNL 6 June 2026 lists both Saint Norbert and Saint Mary on Saturday as optional memorials;
- Vatican News identifies Saint Norbert as bishop of Magdeburg and founder of the Premonstratensians;
- the Holy See letter dated 6 June 2021 supports the same identity and history.

Dropbox proof:

- v33 JSON: `id:oANWCGUyYBwAAAAAAAAZQQ`, 328,144 bytes;
- v33 MD: `id:oANWCGUyYBwAAAAAAAAZQg`, 172,006 bytes;
- batch-27 receipt: `id:oANWCGUyYBwAAAAAAAAZQw`, 2,573 bytes;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAZMw`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAZNA`;
- staging release: `id:oANWCGUyYBwAAAAAAAAZNQ`;
- staging localization review: `id:oANWCGUyYBwAAAAAAAAZNg`.

Issue #355 points to v33 and the batch-27 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #413 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to the Saint Norbert chain, exact official evidence, coexistence regression and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 296/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 296-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A General Roman fixed date and rank may become a perennial rule only from competent universal evidence; Portugal 2026 remains a separate jurisdictional materialization.
- Optional memorials remain distinct alternatives subject to precedence; the Saturday Marian optional memorial must not be silently discarded or merged.
- Names, translated labels and shared civil dates never create identity automatically.
- The staging receipt's internal base `sourceSha` must not be mistaken for the validated PR head even when the Dropbox path is head-scoped.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StBarnabasAp` on 11 June and prove identity, recognition, feast rank, exact SNL occurrence and scope from official sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v33; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 27.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

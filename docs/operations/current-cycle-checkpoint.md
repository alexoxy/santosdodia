# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 13:17 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v45.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 308/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#438](https://github.com/alexoxy/santosdodia/pull/438) delivered E07.05 batch 39:

- represented Martha, Mary and Lazarus of Bethany as three distinct canonical Persons and Roman Catholic Recognitions;
- created one Church-scoped multi-person Observance without merging Mary of Bethany with Mary Magdalene;
- added a perennial General Roman rule for the obligatory memorial on 29 July;
- bound the Portugal 2026 occurrence and `MO` rank to the exact SNL source row;
- preserved `rc:StMartha` as a legacy bridge rather than an isolated or second identity;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `e7518bc5acefca7eda6a58aebdb60bdd672ce5f1`.

Squash merge: `29ad98312c5c0d515c6ad26fd7f2713ee3e6f946`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **110** across **104 civil dates**.
- Total source-bound coverage: **308/389 (79.177%)**.
- Remaining: **81 occurrences** and **66 civil days**.
- Source-bound days: **299/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 34 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **81** |

## CI, archive and external proof

PR #438 passed Product BUILD158, Product publish staging154, Quality1556, Wikidata retry quality677 and Sanctorale review quality99 on the exact head. Focused tests, full local `npm run check`, build, dependency audit, `git diff --check` and the AdSense fail-closed checker passed.

The post-merge workflow archived commit `29ad98312c5c0d515c6ad26fd7f2713ee3e6f946` in Dropbox under:

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/29ad98312c5c0d515c6ad26fd7f2713ee3e6f946`

| Artifact | Dropbox file | Bytes |
|---|---|---:|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAaKQ` | 348687 |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAaKg` | 1148 |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAaKw` | 521146 |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAaLA` | 2406 |

The exact staging ZIP is `id:oANWCGUyYBwAAAAAAAAaMg`, SHA-256 `6df9775e68e0c965fe223a8315b7c6335157ed02332daff396967a4aa66cc1ec`. Its validation reports 365 days, five complete locales, zero false-empty Today results and `productionApproved: false`.

Official proof:

- SNL 29 July 2026 lists Saints Martha, Mary and Lazarus as `MO`, an obligatory memorial;
- the Holy See decree of 26 January 2021 adds the three siblings jointly to the General Roman Calendar and distinguishes Mary of Bethany from Mary Magdalene.

Dropbox proof:

- v45 JSON: `id:oANWCGUyYBwAAAAAAAAaNQ`, SHA-256 `b42f38eb51470b04e701dbc63f0d4e5c6e38830eda214e462db3e8b3050d1bc9`;
- v45 MD: `id:oANWCGUyYBwAAAAAAAAaNA`, SHA-256 `b6a08291840000f4299d1d2e3c4caa1f0cff933cfde8f86e6b57d36a7b202903`;
- batch-39 JSON receipt: `id:oANWCGUyYBwAAAAAAAAaMw`, SHA-256 `4338af2d9fa41af763ca70a8ac347f4d401e7bf06363edeed0d8b2f8e3caff90`;
- batch-39 MD receipt: `id:oANWCGUyYBwAAAAAAAAANg`, SHA-256 `2de0382a66f4c96ca16335ca3e80d951f48f31f0f8ea4ed83cde789e6353bbb3`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAaIQ`, SHA-256 `9826878f76fdfde54827de92b6a4337df848b20a2a48ed415e7561446fd56ffd`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAaIg`, SHA-256 `d0a2a8b4acba1308c42411ae7a3bdc5c99a33ddd332d014fdd19425e8fe3e787`.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #438 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to the three Bethany siblings, their collective memorial, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorize production mutation.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 308/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 308-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A collective title may bind multiple proved Persons without collapsing their identities.
- A General Roman fixed date and rank may become a perennial rule only from competent universal evidence; Portugal 2026 remains a separate jurisdictional materialization.
- Names, translated labels and shared civil dates never create identity automatically.
- Archive provenance must be checked directly; this batch's validation `sourceSha` exactly matches the integrated main commit.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StCajetan` on 7 August and prove identity, recognition, exact SNL occurrence, rank and scope from competent sources.
2. Preserve `rc:StSixtusIIPope` as an independent optional alternative on the same day; do not infer precedence from ordering.
3. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v45; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 39.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

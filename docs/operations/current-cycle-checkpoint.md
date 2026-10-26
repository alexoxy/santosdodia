# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 14:22 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v46.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 309/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#440](https://github.com/alexoxy/santosdodia/pull/440) delivered E07.05 batch 40:

- represented Cajetan of Thiene as an independent canonical Person and Roman Catholic Recognition;
- created a Church-scoped Observance, perennial General Roman optional-memorial rule for 7 August and Portugal 2026 occurrence;
- bound the occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StCajetan` as a legacy bridge rather than a second identity;
- preserved `rc:StSixtusIIPope` and companions as a distinct unresolved candidate because the available evidence does not safely delimit the companion group;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `fa9df746f33665a0f0d64fb29e40f9f1eb7e1153`.

Squash merge: `49d92b62be38ac6dd1cb0f8cbafb03be52a60065`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **111** across **105 civil dates**.
- Total source-bound coverage: **309/389 (79.434%)**.
- Remaining: **80 occurrences** and **65 civil days**.
- Source-bound days: **300/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 33 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **80** |

## CI, archive and external proof

PR #440 passed Product BUILD run 40337396471, Product publish staging 40337396596, Quality 40337396421, Wikidata retry quality 40337396316 and Sanctorale review quality 40337396427 on the exact head. Focused tests, full local `npm run check`, build, dependency audit, `git diff --check` and the AdSense fail-closed checker passed.

The post-merge workflow archived commit `49d92b62be38ac6dd1cb0f8cbafb03be52a60065` in Dropbox under:

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/49d92b62be38ac6dd1cb0f8cbafb03be52a60065`

| Artifact | Dropbox file | Bytes |
|---|---|---:|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAaRA` | 348687 |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAaRQ` | 1148 |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAaRg` | 522761 |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAaRw` | 2406 |

Validation SHA-256 is `0804f94ce3cf4a546af17b500be0ca406295f95eda44c4b5ea4d95aa09d612f9`; release SHA-256 is `c51517648c3d2b4720d73da8f72f0c789e00bfe7c546a678de8f63a57c6a3f8b`. The validation reports `sourceSha=49d92b62be38ac6dd1cb0f8cbafb03be52a60065`, 365 days, zero false-empty Today results and `productionApproved: false`.

Official proof:

- SNL 7 August 2026 lists Saint Cajetan as `MF`, an optional memorial;
- Vatican News identifies Cajetan of Thiene as priest and founder of the Theatines;
- Sixtus II and companions remain a distinct same-day candidate; no companion identity or precedence was inferred.

Dropbox proof:

- v46 JSON: `id:oANWCGUyYBwAAAAAAAAaTQ`, SHA-256 `6202a9812108d322a17e13051ac3a92c73e677a3c0a13cd09755402c3b103dc5`;
- v46 MD: `id:oANWCGUyYBwAAAAAAAAaTg`, SHA-256 `870c25d490da776aa8de3a94cf561288dec66154df3cd3f5d86f03779bf48c54`;
- batch-40 corrected JSON receipt v2: `id:oANWCGUyYBwAAAAAAAAaUQ`, SHA-256 `5450eef5597f0d021f5fe0f1f7902d49ebc24054997d0bb5e407ea5400891e35`;
- batch-40 corrected MD receipt v2: `id:oANWCGUyYBwAAAAAAAAaUg`, SHA-256 `413437e2e2759de78a8c533de9e7755270f08700db67f781f433b0df2d1c1f49`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAaNw`, SHA-256 `7848b70b3f16e25ceee18c0005385d47185275f29195c418f776931f2acb0d07`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAaOA`, SHA-256 `ec8694cc81122622be0ace64b6977cbd98af72d707691da6b283d663c14e249e`.

The initial batch-40 receipt pair (`id:oANWCGUyYBwAAAAAAAAaUA`, `id:oANWCGUyYBwAAAAAAAAaTw`) is preserved for traceability and superseded by v2 solely because it abbreviated the two source-evidence SHA-256 values.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #440 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Cajetan, exact official evidence and coverage vectors; Sixtus II and companions remain unresolved.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorize production mutation.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 309/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 309-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A General Roman fixed date and rank may become a perennial rule only from competent universal evidence; Portugal 2026 remains a separate jurisdictional materialization.
- A group boundary is not inferred from a translated label, shared date or partial narrative. Sixtus II and companions require explicit competent evidence before promotion.
- Names, translated labels and shared civil dates never create identity automatically.
- Archive provenance must be checked directly; this batch's validation `sourceSha` exactly matches the integrated main commit.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StSixtusIIPope` and the exact boundary of the companion group on 7 August.
2. If competent evidence remains insufficient, record the exact block and proceed independently to `rc:StJaneFrancesDeChantal` on 12 August.
3. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v46; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 40.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.


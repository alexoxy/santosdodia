# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 10:15 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v42.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 305/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#432](https://github.com/alexoxy/santosdodia/pull/432) delivered E07.05 batch 36:

- represented Saint Apollinaris of Ravenna as an independent canonical Person, Roman Catholic Recognition and Church-scoped Observance;
- retained `bishop` and `martyr` as canonical titles without creating further identities;
- added a perennial General Roman rule for the optional memorial on 20 July;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StApollinaris` as a legacy bridge rather than a second identity;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `59d8805bfb71512efae60f5b1b72f08c5bf694da`.

Squash merge: `3d67ba664573b9d501bb70460b04a989456579c0`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **107** across **101 civil dates**.
- Total source-bound coverage: **305/389 (78.406%)**.
- Remaining: **84 occurrences** and **69 civil days**.
- Source-bound days: **296/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 37 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **84** |

## CI, archive and external proof

PR #432 passed Product BUILD, Product publish staging, Quality, Wikidata retry quality and Sanctorale review quality on the exact head. The focused tests, full local `npm run check`, build, dependency audit, Cloudflare Free guardrails, `git diff --check` and the AdSense fail-closed checker passed; the known Turbopack dynamic-filesystem warning remained non-fatal.

The integrated-main workflow checked out exact source `3d67ba664573b9d501bb70460b04a989456579c0`, validated the release and archived four files in Dropbox under:

`/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/3d67ba664573b9d501bb70460b04a989456579c0`

| Artifact | SHA-256 | Bytes |
|---|---|---:|
| `manifest.json` | `98aeb5eeb1530ac108180c3a4b7797cf917740803111abca5b098c3718962b96` | 348687 |
| `validation.json` | `b533fa3939f73c59b2698f6bb6a23103cf2ddd53a1a6f044158ea64d0de3a920` | 1148 |
| `reconciliation-ledger.json` | `71f7afd5d059b19f037955c5eaa350f2d187509f50a05e9eadc9dd0a0bac8bcc` | 516211 |
| `release.json` | `6fc252630efd5b3273f717407685d7a724742ff08135ff1099a31dea64c9d3f8` | 2406 |

The archived validation remains `productionApproved: false`.

Official proof:

- SNL 20 July 2026 lists Saint Apollinaris as `MF`, an optional memorial;
- Vatican News identifies Saint Apollinaris as bishop of Ravenna and martyr, commemorated on 20 July.

Dropbox proof:

- v42 JSON: `id:oANWCGUyYBwAAAAAAAAZ8Q`, 343676 bytes;
- v42 MD: `id:oANWCGUyYBwAAAAAAAAZ8g`, 190059 bytes;
- batch-36 JSON receipt: `id:oANWCGUyYBwAAAAAAAAZ8w`, 2532 bytes;
- batch-36 MD receipt: `id:oANWCGUyYBwAAAAAAAAZ9A`, 1099 bytes;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAZ4A`, SHA-256 `bb813b1de669916cc960cefef6170b49220aa7eb56a6c5d82bb30887fcfd6498`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAZ4Q`, SHA-256 `5e0ff416de2224ea4f99e52d8b2ef0d06c10796d705c22aeb7749824549238ee`.

Issue #355 is to point to v42 and the batch-36 receipt after this checkpoint merges.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #432 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Saint Apollinaris, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorize production mutation.
- Unrelated Dependabot PR #430 remains untouched.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 305/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 305-source shadow | Full equivalence and production gate |
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
- Archive provenance must be checked directly; this batch's validation `sourceSha` exactly matches the integrated main commit.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StLawrenceBrindisi` on 21 July and prove identity, recognition, exact SNL occurrence, rank and scope from competent sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v42; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 36.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

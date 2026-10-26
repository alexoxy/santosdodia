# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 11:10 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v43.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 306/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#434](https://github.com/alexoxy/santosdodia/pull/434) delivered E07.05 batch 37:

- represented Saint Lawrence of Brindisi as an independent canonical Person, Roman Catholic Recognition and Church-scoped Observance;
- retained `priest` and `doctor-of-the-church` as canonical titles without creating further identities;
- added a perennial General Roman rule for the optional memorial on 21 July;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StLawrenceBrindisi` as a legacy bridge rather than a second identity;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `fa3927d320f6231ecf5f819e7c27b42ba1caf1bf`.

Squash merge: `f8aaa54b7702b08d05341a4d31ca9e56bd3152b8`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **108** across **102 civil dates**.
- Total source-bound coverage: **306/389 (78.663%)**.
- Remaining: **83 occurrences** and **68 civil days**.
- Source-bound days: **297/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 36 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **83** |

## CI, archive and external proof

PR #434 passed Product BUILD154, Product publish staging150, Quality1548, Wikidata retry quality673 and Sanctorale review quality95 on the exact head. The focused tests, full local `npm run check`, build, dependency audit, Cloudflare Free guardrails, `git diff --check` and the AdSense fail-closed checker passed; the known Turbopack dynamic-filesystem warning remained non-fatal.

The integrated-main workflow checked out exact source `f8aaa54b7702b08d05341a4d31ca9e56bd3152b8`, validated the release and archived four files in Dropbox under:

`/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/f8aaa54b7702b08d05341a4d31ca9e56bd3152b8`

| Artifact | SHA-256 | Bytes |
|---|---|---:|
| `manifest.json` | `26b78a394830f641fec1ccdb1433d5a129c7fbb488487be44282ebb6cd081449` | 348687 |
| `validation.json` | `ce2889533379d1eda2f6c0cd493674d6dc234a56109be78d6a92d9e1d9555dbc` | 1148 |
| `reconciliation-ledger.json` | `448a2d2bdf161f42a5d24341e76716751d0787547445fba7b4427d7d03453a07` | 517866 |
| `release.json` | `5fae7fc42c19efc747b1c3601f633d709c843d194ec2b62cad7894a4ea795393` | 2406 |

The archived validation remains `productionApproved: false`.

Official proof:

- SNL 21 July 2026 lists Saint Lawrence of Brindisi as `MF`, an optional memorial;
- the Holy See identifies Saint Lawrence as priest, Capuchin, saint and Doctor of the Church.

Dropbox proof:

- v43 JSON: `id:oANWCGUyYBwAAAAAAAAaBg`, 345412 bytes;
- v43 MD: `id:oANWCGUyYBwAAAAAAAAaBw`, 191967 bytes;
- batch-37 JSON receipt: `id:oANWCGUyYBwAAAAAAAAaCA`, 4343 bytes;
- batch-37 MD receipt: `id:oANWCGUyYBwAAAAAAAAaCQ`, 1358 bytes;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAZ9g`, SHA-256 `7ba34dbcc2580faedfec3742fccd567b6f3ae7ad6470993d0e473188ca82bbbd`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAZ9Q`, SHA-256 `9ff477426876ede0845e27b2d6a26837bd045ac80cde256e4155fde1a4c09294`.

Issue #355 points to v43 and the batch-37 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #434 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Saint Lawrence of Brindisi, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorize production mutation.
- Unrelated Dependabot PR #430 remains untouched.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 306/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 306-source shadow | Full equivalence and production gate |
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

1. Review `rc:StSharbelMakhluf` on 24 July and prove identity, recognition, exact SNL occurrence, rank and scope from competent sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v43; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 37.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

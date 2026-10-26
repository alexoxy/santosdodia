# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 12:04 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v44.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 307/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#436](https://github.com/alexoxy/santosdodia/pull/436) delivered E07.05 batch 38:

- represented Saint Charbel/Sarbélio Makhluf as an independent canonical Person, Roman Catholic Recognition and Church-scoped Observance;
- retained `priest`, `monk` and `hermit` as canonical titles without deriving country, rite or calendar selection;
- added a perennial General Roman rule for the optional memorial on 24 July;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StSharbelMakhluf` as a legacy bridge rather than a second identity;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `4d160abbf1913257f186c25b2e24dfa58a5da150`.

Squash merge: `f8a5649f823f5e9cdcd336a905b531c28d9dda9d`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **109** across **103 civil dates**.
- Total source-bound coverage: **307/389 (78.920%)**.
- Remaining: **82 occurrences** and **67 civil days**.
- Source-bound days: **298/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 35 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **82** |

## CI, archive and external proof

PR #436 passed Product BUILD156, Product publish staging152, Quality1552, Wikidata retry quality675 and Sanctorale review quality97 on the exact head. The focused tests, full local `npm run check`, build, dependency audit, `git diff --check` and the AdSense fail-closed checker passed.

The staging workflow archived the exact reviewed head `4d160abbf1913257f186c25b2e24dfa58a5da150` in Dropbox under:

`/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/4d160abbf1913257f186c25b2e24dfa58a5da150`

| Artifact | SHA-256 | Bytes |
|---|---|---:|
| `manifest.json` | Dropbox `id:oANWCGUyYBwAAAAAAAAaDQ` | 826850 |
| `validation.json` | Dropbox `id:oANWCGUyYBwAAAAAAAAaDg` | 410 |
| `localization-review.json` | Dropbox `id:oANWCGUyYBwAAAAAAAAaEA` | 2028 |
| `release.json` | Dropbox `id:oANWCGUyYBwAAAAAAAAaDw` | 3406 |

The archived validation remains `productionApproved: false`.

Official proof:

- SNL 24 July 2026 lists Saint Sarbélio Makhluf as `MF`, an optional memorial;
- Vatican News and the Holy See identify Saint Charbel as priest, monk and hermit and preserve the canonization evidence.

Dropbox proof:

- v44 JSON: `id:oANWCGUyYBwAAAAAAAAaGw`, SHA-256 `d5261e80deb19b4c4012958893bdd89c965d30df989f85114a06cb771e9b52fa`;
- v44 MD: `id:oANWCGUyYBwAAAAAAAAaHQ`, SHA-256 `e842400ac36a352747eb9b473f2e5c597702396f0345f3923e00464adc9af986`;
- batch-38 JSON receipt: `id:oANWCGUyYBwAAAAAAAAaIA`, SHA-256 `b35c79399fad06a3f510c480617c8afe9d34ccb07d76c8a53344db8fc2e19578`;
- batch-38 MD receipt: `id:oANWCGUyYBwAAAAAAAAaHg`, SHA-256 `5112e442066b5ea03b80398bb8ac8d2ac94a1c1c215f15809013939fdab72c46`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAaCg`, SHA-256 `ace8012ab2bdb6555db7c13c8d04d161eb0f52a180ca6e5f012928c911944d6a`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAaCw`, SHA-256 `f4bf294469a31b602980bd66165f48fa43c601444041112e275f9c48c9d4e7ad`;
- staging ZIP: `id:oANWCGUyYBwAAAAAAAAaHw`, SHA-256 `72fcdefbde4b4e8cf47ce5dc7df4d1b1f3c61e4ea4315241d4b99d3bb8239039`.

Issue #355 points to v44 and the batch-38 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #436 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Saint Charbel/Sarbélio Makhluf, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorize production mutation.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 307/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 307-source shadow | Full equivalence and production gate |
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

1. Review `rc:StMartha` on 29 July and prove identity, recognition, exact SNL occurrence, current commemoration form, rank and scope from competent sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v44; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 38.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-20 10:12 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-20-v14.{md,json}`

Status: active implementation; E07.03 is partial; Portugal 2026 semantic reconciliation is 229/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#374](https://github.com/alexoxy/santosdodia/pull/374) delivered the first post-Pentecost slice of E07.03:

- added the perennial `ordinary-time-weekday-late` family, numbered backwards from Advent rather than copied from 2026 dates;
- bounded candidates strictly after Pentecost and before Advent;
- reviewed weeks 8–12 as 30 annual candidates;
- bound nine exact approved SNL ferial rows;
- recorded 21 memorial, feast or solemnity precedence outcomes without counting them as coverage;
- exercised the movable Pentecost boundary across 2020–2030;
- updated the coverage gate, semantic inventory, reconciliation ledger, documentation and immutable promotion receipt;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `ce7dd192dba695409d9a056d47a10000522afaf7`.

Squash merge on `main`: `cbeabe4e64fb92d234c61c1df3e67da79c1c8547`.

E07.03 remains `EM_CURSO`; partial progress does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **124**.
- Explicit family suppressions/replacements: **69**; one additional row remains withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **229/389 (58.869%)**.
- Approved-source occurrences outside the canonical shadow: **160**.
- Source-bound civil days: **225/365**.
- Civil days without a source-bound canonical occurrence: **140**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory remains exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 38 |
| Saturday Marian family | 14 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **160** |

## CI, email and external proof

PR #374 workflows on the exact validated head:

- Quality #1424, run `39405261821`: success, 64 steps;
- Product BUILD #94, run `39405261721`: success;
- Product publish staging #90, run `39405261840`: success;
- Wikidata retry quality #609, run `39405261789`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build`.

Before implementation and again after integration, the non-Trash Gmail search for new SantosDia/GitHub/Cloudflare failure or quota alerts returned zero messages. No email was moved or deleted.

Dropbox proof:

- `santosdia-e07-03-ordinary-time-weekdays-8-12-receipt-2026-10-20.json`, file ID `id:oANWCGUyYBwAAAAAAAAX6w`;
- `santosdia-entregaveis-2026-10-20-v14.json`, file ID `id:oANWCGUyYBwAAAAAAAAX6g`;
- `santosdia-entregaveis-2026-10-20-v14.md`, file ID `id:oANWCGUyYBwAAAAAAAAX7A`;
- staging manifest `id:oANWCGUyYBwAAAAAAAAX3A`, generated 2026-10-20 10:05 UTC.

The staging manifest confirms 389 occurrences, 365 civil days, 1,945 labels, complete five-locale coverage, `stagingReady: true`, `productionApproved: false` and `productionWriteAllowed: false`.

## Task and deliverable countdown

- Tasks: **16 completed / 210; 194 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- No task or deliverable was added, completed or reopened in this execution.
- E07.03 is partial; technical coverage advanced by nine source rows, but partial work does not reduce the task count.
- E07 remains incomplete until all Portugal 2026 equivalence and acceptance criteria pass.

## Repository hygiene

- PR #374 was integrated only after all four workflows passed on the exact head and `main` still matched the expected base.
- The implementation branch was removed automatically after merge; commit, squash commit and recovery history remain available.
- No implementation PR remains open. Issue #355 remains the single live execution record and points to plan v14.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- The generated linguistic snapshot produced locally by validation was excluded from the commit.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 124 family members | Bind remaining 160 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 229-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Late Ordinary Time weekday numbering is calculated backwards from Advent; it is not inferred from the annual label or copied date.
- The family begins strictly after Pentecost and ends before Advent, so movable season boundaries cannot leak ferial candidates.
- Saints, memorials, feasts and solemnities are explicit annual precedence outcomes; suppressed candidates are evidence, not coverage.
- The Portugal 4 February row remains within the 20-row human-review boundary and cannot be promoted by textual similarity.
- Weeks 13–34 remain unreviewed in this family and must stay outside coverage.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Continue E07.03 with Ordinary Time weekday weeks 13–18 as the next coherent, source-reviewed slice.
2. Progress through weeks 19–34 in bounded batches, retaining explicit precedence outcomes.
3. Resolve the 4 February jurisdiction row only with competent Portugal authority evidence.
4. Complete E07.03 only when every applicable Ordinary Time weekday row is source-bound or explicitly withheld by a reviewed reason.
5. Model the 14 Saturday Marian candidates as a precedence-sensitive family, not fixed duplicates.
6. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
7. Resolve the remaining Portugal-specific structural/proper/rank rows by explicit competent-authority review.
8. Reach 389/389, explain every annual difference and run multi-year regeneration.
9. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
10. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v14 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.03 without repeating weeks 1–12.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.

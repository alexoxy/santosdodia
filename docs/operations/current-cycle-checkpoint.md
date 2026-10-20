# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-20 09:40 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-20-v13.{md,json}`

Status: active implementation; E07.03 is partial; Portugal 2026 semantic reconciliation is 220/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#372](https://github.com/alexoxy/santosdodia/pull/372) delivered the second E07.03 batch:

- expanded `ordinary-time-weekday-early` from weeks 1–3 to weeks 1–6;
- made the exclusive end boundary perennial at Gregorian Easter minus 46 days, so Ordinary Time cannot leak into Lent;
- bound four exact approved SNL source rows for 9, 12, 13 and 16 February 2026;
- recorded nine feast, memorial and Portugal-proper precedence outcomes without counting them as migration coverage;
- kept the 4 February candidate explicitly withheld, fail-closed and under jurisdiction review;
- excluded week 6 Wednesday–Saturday because they fall on or after Ash Wednesday;
- updated the coverage gate, semantic inventory, reconciliation ledger, documentation and immutable promotion receipt;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `b47aca0c22071ed04845dc469be3553bc70d5b86`.

Squash merge on `main`: `2a9dd94f563b662fa0a1be9a0431eae444c6ef70`.

E07.03 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **115**; **48** suppressed/replaced candidates remain evidence and do not count as coverage; **1** candidate is withheld and does not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **220/389 (56.555%)**.
- Approved-source occurrences outside the canonical shadow: **169**.
- Source-bound civil days: **216/365**.
- Civil days without a source-bound canonical occurrence: **149**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory remains exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 46 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Saturday Marian family | 14 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **169** |

## CI, email and external proof

PR #372 workflows on the exact validated head:

- Quality #1420, run `39401436719`: success, 64 steps;
- Product BUILD #92, run `39401436803`: success;
- Product publish staging #88, run `39401436746`: success;
- Wikidata retry quality #607, run `39401436777`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build`.

Before implementation, the non-Trash Gmail search for new SantosDia/GitHub/Cloudflare failure or quota alerts returned zero messages. No email was moved or deleted.

Dropbox proof:

- `santosdia-e07-03-ordinary-time-weekdays-pre-lent-receipt-2026-10-20.json`, file ID `id:oANWCGUyYBwAAAAAAAAX0A`;
- `santosdia-entregaveis-2026-10-20-v13.json`, file ID `id:oANWCGUyYBwAAAAAAAAXzg`;
- `santosdia-entregaveis-2026-10-20-v13.md`, file ID `id:oANWCGUyYBwAAAAAAAAXzw`.

The receipt was fetched after upload and confirms the exact PR head, merge commit, workflow runs, 216→220 coverage change, one explicit withheld candidate, fail-closed publication and zero remote-D1 writes.

## Task and deliverable countdown

- Tasks: **16 completed / 210; 194 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- No task was added, completed or reopened in this execution.
- E07.03 is partial; technical coverage advanced by four source rows, but partial work does not reduce the task count.
- E07 remains incomplete until all Portugal 2026 equivalence and acceptance criteria pass.

## Repository hygiene

- PR #372 was integrated only after all four head workflows passed.
- The PR branch was removed automatically after merge; its commit, squash commit and recovery history remain available.
- No implementation PR remains open. Issue #355 remains the single live execution record and points to plan v13.
- Existing umbrella issue #181 remains strategic, not a duplicate batch queue.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- Local build-created translation snapshot drift was excluded from the commit; only the eleven E07.03 files were integrated.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 115 family members | Bind remaining 169 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 220-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Flexible ferial families use perennial anchors and explicit annual precedence outcomes; annual dates and labels never become authority by themselves.
- Optional memorial alternatives remain alternatives. Their presence can suppress a source ferial row without proving which option was pastorally celebrated.
- The 4 February row remains under the 21-row human-review boundary and cannot be promoted by general-pattern similarity.
- Weeks 4–6 now terminate at a calculated Ash Wednesday boundary; the unresolved 4 February row stays outside coverage until competent jurisdictional review.
- The post-Pentecost segment must be bounded against Pentecost and Advent while preserving the backward Ordinary Time week numbering.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Add the post-Pentecost Ordinary Time weekday segment with flexible Pentecost/Advent boundaries, backward week numbering and exact SNL outcomes.
2. Resolve 4 February only through a competent jurisdictional source; retain it as withheld until then.
3. Complete E07.03 only when all applicable Ordinary Time weekday rows are source-bound or explicitly withheld by reviewed reason.
4. Model the 14 Saturday Marian candidates as a precedence-sensitive family, not fixed duplicates.
5. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
6. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit competent-authority review.
7. Reach 389/389, explain every annual difference and run multi-year regeneration.
8. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
9. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v13 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.03 without repeating weeks 1–6 before Lent.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.

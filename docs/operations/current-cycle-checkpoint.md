# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-20 07:14 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-20-v11.{md,json}`

Status: active implementation; Portugal 2026 semantic reconciliation is 208/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this cycle

PR [#368](https://github.com/alexoxy/santosdodia/pull/368) completed task E07.02:

- added the jurisdiction-scoped perennial family `weekday-after-epiphany` between effective Portugal Epiphany and the exclusive effective Baptism boundary;
- bound only the exact approved 2026 source rows for 5, 8 and 9 January;
- preserved 6 January as the approved transfer-origin replacement and 7/10 January as explicit saint-precedence outcomes;
- proved the Epiphany/Baptism interval for 1900–2200, including empty intervals when Epiphany is 7 or 8 January and Baptism moves to Monday;
- updated the reconciliation ledger, semantic inventory, coverage gate, documentation and immutable promotion receipt;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `7577781f4f2e3b939d3b6847cb472ff4ad86b1fd`.

Squash merge on `main`: `a6d7ca9553e1779c5df6603413bad3051c460720`.

E01.04 was also reconciled as completed: PR #365 is integrated in `5a397290d2c9be91950dd5d0842c66848978adc3` with the 159-section/16-source/63-task-ID traceability audit and unchanged branch protections.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **103**; **29** suppressed/replaced candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **208/389 (53.470%)**.
- Approved-source occurrences outside the canonical shadow: **181**.
- Source-bound civil days: **204/365**.
- Civil days without a source-bound canonical occurrence: **161**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory remains exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 58 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Saturday Marian family | 14 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **181** |

## CI, email and external proof

PR #368 workflows on the exact validated head:

- Quality #1412, run `39384562683`: success, 64 steps;
- Product BUILD #88, run `39384562702`: success;
- Product publish staging #84, run `39384562762`: success;
- Wikidata retry quality #603, run `39384562654`: success.

Local proof also passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, and the mandatory AdSense fail-closed checker.

Before implementation, the non-Trash Gmail search for new SantosDia/GitHub/Cloudflare failure or quota alerts returned zero messages. No email was moved or deleted.

Dropbox proof:

- `santosdia-e07-02-epiphany-interval-receipt-2026-10-20.json`, file ID `id:oANWCGUyYBwAAAAAAAAXqg`;
- `santosdia-entregaveis-2026-10-20-v11.json`, file ID `id:oANWCGUyYBwAAAAAAAAXsA`;
- `santosdia-entregaveis-2026-10-20-v11.md`, file ID `id:oANWCGUyYBwAAAAAAAAXsQ`.

## Task and deliverable countdown

- Tasks: **16 completed / 210; 194 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- No task was added or reopened in this cycle.
- E07 remains incomplete until all Portugal 2026 equivalence and acceptance criteria pass; partial coverage does not complete the deliverable.

## Repository hygiene

- PR #368 was integrated only after all four head workflows passed.
- Dependabot PR #367 was closed without merge because its proposed dependency set failed the high-severity audit with four transitive vulnerabilities; the audit threshold was not weakened.
- No other PR remains open after the merge.
- Issue #355 remains the single live execution record with a named next action. Existing umbrella issue #181 remains strategic, not a duplicate batch queue.
- The merged branch can be removed by normal post-merge hygiene; commit history and rollback remain available.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 103 family members | Bind remaining 181 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 208-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Flexible ferial families must use effective feast boundaries and jurisdiction policy; annual dates and labels never become perennial authority by themselves.
- Suppressions, transfer origins and optional choices are evidence, not extra coverage.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- The closed dependency update must not be reopened unchanged; use only an upstream combination that passes `npm audit --audit-level=high` and full CI.
- The remaining 181-row inventory is a work ledger, not publication authority.
- Other Churches must retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. E07.03: inventory the existing Ordinary Time weekday evidence and exact SNL identities before creating new rules.
2. Implement the smallest coherent Ordinary Time weekday family batch with perennial anchors and explicit present/suppressed outcomes.
3. Model the 14 Saturday Marian candidates as a precedence-sensitive family, not fixed duplicates.
4. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
5. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit competent-authority review.
6. Reach 389/389, explain every annual difference and run multi-year regeneration.
7. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
8. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v11 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.03 without repeating E07.02.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.

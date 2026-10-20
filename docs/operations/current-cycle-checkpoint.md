# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-20 08:45 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-20-v12.{md,json}`

Status: active implementation; E07.03 is partial; Portugal 2026 semantic reconciliation is 216/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#370](https://github.com/alexoxy/santosdodia/pull/370) delivered the first E07.03 batch:

- added the perennial `ordinary-time-weekday-early` family, anchored to the Second Sunday in Ordinary Time rather than typed 2026 dates;
- limited the first slice to weeks 1–3, leaving the Ash Wednesday boundary and late segment for independent proof;
- bound eight exact approved SNL source rows for 12, 14, 15, 16, 19, 23, 29 and 30 January 2026;
- recorded ten memorial-precedence outcomes without counting them as migration coverage;
- preserved both optional alternatives on 20 January instead of choosing an arbitrary winner;
- kept the Portugal-specific 4 February row outside this general family and under explicit jurisdiction review;
- updated the coverage gate, semantic inventory, reconciliation ledger, documentation and immutable promotion receipt;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `8a7cb1eddf6a3087c9ead8cd376ca9eee9ada9d4`.

Squash merge on `main`: `af0eac924b07d5fd5d0c0e9a1cb5942ff6778818`.

E07.03 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **111**; **39** suppressed/replaced candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **216/389 (55.527%)**.
- Approved-source occurrences outside the canonical shadow: **173**.
- Source-bound civil days: **212/365**.
- Civil days without a source-bound canonical occurrence: **153**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory remains exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 50 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Saturday Marian family | 14 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **173** |

## CI, email and external proof

PR #370 workflows on the exact validated head:

- Quality #1416, run `39394338943`: success, 64 steps;
- Product BUILD #90, run `39394338812`: success;
- Product publish staging #86, run `39394338792`: success;
- Wikidata retry quality #605, run `39394338785`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build`.

Before implementation, the non-Trash Gmail search for new SantosDia/GitHub/Cloudflare failure or quota alerts returned zero messages. No email was moved or deleted.

Dropbox proof:

- `santosdia-e07-03-ordinary-time-weekdays-early-receipt-2026-10-20.json`, file ID `id:oANWCGUyYBwAAAAAAAAXww`;
- `santosdia-entregaveis-2026-10-20-v12.json`, file ID `id:oANWCGUyYBwAAAAAAAAXwg`;
- `santosdia-entregaveis-2026-10-20-v12.md`, file ID `id:oANWCGUyYBwAAAAAAAAXwQ`.

The receipt was fetched after upload and confirms the exact PR head, merge commit, workflow runs, 208→216 coverage change, fail-closed publication and zero remote-D1 writes.

## Task and deliverable countdown

- Tasks: **16 completed / 210; 194 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- No task was added, completed or reopened in this execution.
- E07.03 is partial; technical coverage advanced by eight source rows, but partial work does not reduce the task count.
- E07 remains incomplete until all Portugal 2026 equivalence and acceptance criteria pass.

## Repository hygiene

- PR #370 was integrated only after all four head workflows passed.
- The PR branch was removed automatically after merge; its commit, squash commit and recovery history remain available.
- No implementation PR remains open. Issue #355 remains the single live execution record and points to plan v12.
- Existing umbrella issue #181 remains strategic, not a duplicate batch queue.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- The local build-created translation snapshot drift and archive fixture were excluded from the commit; only the ten E07.03 files were integrated.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 111 family members | Bind remaining 173 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 216-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Flexible ferial families use perennial anchors and explicit annual precedence outcomes; annual dates and labels never become authority by themselves.
- Optional memorial alternatives remain alternatives. Their presence can suppress a source ferial row without proving which option was pastorally celebrated.
- The 4 February row remains under the 21-row human-review boundary and cannot be promoted by general-pattern similarity.
- Weeks 4–6 cross the Ash Wednesday season boundary and require explicit present/suppressed outcomes before promotion.
- The post-Pentecost segment must be bounded against Pentecost and Advent while preserving the backward Ordinary Time week numbering.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Continue E07.03 with Ordinary Time weeks 4–6, explicitly separating the 4 February jurisdiction row and the Ash Wednesday boundary.
2. Add the post-Pentecost Ordinary Time weekday segment with flexible Pentecost/Advent boundaries and exact SNL outcomes.
3. Complete E07.03 only when all applicable Ordinary Time weekday rows are source-bound or explicitly withheld by reviewed reason.
4. Model the 14 Saturday Marian candidates as a precedence-sensitive family, not fixed duplicates.
5. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
6. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit competent-authority review.
7. Reach 389/389, explain every annual difference and run multi-year regeneration.
8. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
9. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v12 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.03 without repeating weeks 1–3.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.

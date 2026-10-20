# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-20 12:50 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-20-v17.{md,json}`

Status: active implementation; E07.03 is partial; Portugal 2026 semantic reconciliation is 258/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#380](https://github.com/alexoxy/santosdodia/pull/380) delivered the next post-Pentecost slice of E07.03:

- extended perennial `ordinary-time-weekday-late` candidates from week 24 through week 30;
- reviewed 36 annual candidates against the immutable approved SNL source release;
- bound 11 exact ferial rows and recorded 24 explicit memorial, feast or solemnity precedence outcomes;
- withheld the 27 October jurisdiction-structural overlay instead of treating Blessed Gonçalo de Lagos as a universal ferial row;
- retained exclusive Pentecost/Advent bounds and backward-from-Advent week numbering;
- exercised the movable boundary across 2020–2030;
- updated the coverage gate, semantic inventory, reconciliation ledger, documentation and immutable promotion receipt;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `59d9770151db379ef9caffb77d2da87eaf549e6a`.

Squash merge on `main`: `368a7e0c0c00298caa0901ad7e1ac0c50d829012`.

E07.03 remains `EM_CURSO`; partial progress does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **153**.
- Explicit family suppressions/replacements: **145**; four rows remain withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **258/389 (66.324%)**.
- Approved-source occurrences outside the canonical shadow: **131**.
- Source-bound civil days: **254/365**; unresolved civil days: **111**.
- Full semantic equivalence: `false`; perennial cutover and production promotion: `false`.

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 9 |
| Saturday Marian family | 14 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **131** |

## CI, email and external proof

PR #380 workflows on the exact validated head:

- Quality #1436, run `39424164866`: success, 64 steps;
- Product BUILD #100, run `39424164550`: success;
- Product publish staging #96, run `39424164620`: success;
- Wikidata retry quality #615, run `39424164976`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build`.

The non-Trash Gmail search for new SantosDia/GitHub/Cloudflare failure or quota alerts returned zero messages before and after the implementation. No email was moved or deleted.

Dropbox proof:

- receipt `santosdia-e07-03-ordinary-time-weekdays-25-30-receipt-2026-10-20.json`, ID `id:oANWCGUyYBwAAAAAAAAYIQ`;
- plan v17 JSON `id:oANWCGUyYBwAAAAAAAAYIA` and Markdown `id:oANWCGUyYBwAAAAAAAAYIg`;
- immutable approved source manifest `id:oANWCGUyYBwAAAAAAAAWmQ`.

The Dropbox metadata confirms the three new files, their exact paths and sizes. The receipt records 389 source occurrences, 36 reviewed candidates, 11 bindings, 24 suppressions, one withheld row, `productionWriteAllowed: false` and zero remote-D1 writes.

## Task and deliverable countdown

- Tasks: **16 completed / 210; 194 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- No task or deliverable was added, completed or reopened in this execution.
- E07.03 is partial; technical coverage advanced by 11 source rows, but partial work does not reduce the task count.

## Repository hygiene

- PR #380 was integrated only after all four workflows passed on the exact head and `main` still matched the expected base.
- The implementation branch was automatically removed after merge; commit, squash commit and recovery history remain available.
- No implementation PR remains open. Issue #355 remains the single live execution record and points to plan v17.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- The generated linguistic snapshot produced locally by validation was excluded from the commit.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 153 family members | Bind remaining 131 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 258-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Late Ordinary Time weekday numbering is calculated backwards from Advent; it is not inferred from annual labels or copied dates.
- Saints, memorials, feasts and solemnities are explicit annual precedence outcomes; suppressed candidates are evidence, not coverage.
- Portugal rows for 4 February, 17 July, 17 August and 27 October remain within the human-review boundary and cannot be promoted by textual similarity.
- Weeks 31–34 remain unreviewed in this family and must stay outside coverage.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Complete E07.03 with Ordinary Time weekday weeks 31–34 as the final coherent source-reviewed slice.
2. Resolve the four jurisdiction rows only with competent Portugal authority evidence.
3. Complete E07.03 only when every applicable Ordinary Time weekday row is source-bound or explicitly withheld by a reviewed reason.
4. Model the 14 Saturday Marian candidates as a precedence-sensitive family, not fixed duplicates.
5. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
6. Resolve remaining Portugal-specific structural/proper/rank rows by competent-authority review.
7. Reach 389/389, explain every annual difference and run multi-year regeneration.
8. Prepare an atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
9. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v17 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.03 without repeating weeks 1–30.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
